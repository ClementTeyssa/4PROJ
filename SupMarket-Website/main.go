package main

import (
	"bytes"
	"context"
	"crypto/sha512"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"html/template"
	"io/ioutil"
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/sparrc/go-ping"
	v1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/client-go/kubernetes"
	_ "k8s.io/client-go/plugin/pkg/client/auth/gcp"
	"k8s.io/client-go/tools/clientcmd"
)

const DEVSERVER = ""
const KUBEAPI = "https://" //get by APISERVER=$(kubectl config view --minify -o jsonpath='{.clusters[0].cluster.server}')

// Struct send to the dashboard
type DashboardData struct {
	Beacons  []Beacon
	Nodes    []Node
	Accounts []Account
}

// Struct of a Beacon
type Beacon struct {
	_id            string    `json:"_id"`
	Created        time.Time `json:"_created"`
	Modified       time.Time `json:"_modified"`
	ID             int       `json:"ID"`
	MAC            string    `json:"MAC"`
	EntryBeacon    bool      `json:"EntryBeacon"`
	Name           string    `json:"Name"`
	ShelfID        int       `json:"ShelfID"`
	PosX           int       `json:"PosX"`
	PosY           int       `json:"PosY"`
	LastSignalDate time.Time `json:"LastSignalDate"`
}

// Struc of a Token (get by login)
type Token struct {
	Token string `json:"Token"`
}

// Struc of a Server
type Server struct {
	Name         string
	Description  string
	IsRunning    bool
	ResponseTime int64
}

// Struct of a Node
type Node struct {
	CpuNB       string
	TotMemory   string
	AvailMemory string
	UsedMemory  string
	ServerStats Server
}

// Struct of an Account
type Account struct {
	_id       string    `json:"_id"`
	Created   time.Time `json:"_created"`
	Modified  time.Time `json:"_modified"`
	ID        int       `json:"ID"`
	Username  string    `json:"Username"`
	PwHash    string    `json:"PwHash"`
	IsAdmin   bool      `json:"IsAdmin"`
	Firstname string    `json:"Firstname"`
	Lastname  string    `json:"Lastname"`
	Token     string    `json:"Token"`
}

// Used to know if an user is an admin (using his token)
func isAdmin(token string) bool {
	// put the token in the body request
	requestBody, err := json.Marshal(map[string]string{
		"Token": token,
	})
	if err != nil {
		panic(err.Error())
	}

	timeout := time.Duration(5 * time.Second)
	client := http.Client{
		Timeout: timeout,
	}

	// Create the request to the API
	NewRequest, err := http.NewRequest("POST", "http://api./isAdmin", bytes.NewBuffer(requestBody))
	NewRequest.Header.Set("Content-type", "applicaion/json")
	if err != nil {
		panic(err.Error())
	}

	// Launch the request
	resp, err := client.Do(NewRequest)
	if err != nil {
		panic(err.Error())
	}

	// Check if the API return an error
	if resp.StatusCode != 201 {
		return false
	}

	defer resp.Body.Close()

	// Read the request's body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err.Error())
	}

	// Parse result and check if he is admin or not
	rep := strings.Replace(string(body), "\"", "", -1)
	if rep == "true" {
		return true
	} else {
		return false
	}
}

// Used to login the user
func login(r *http.Request, w http.ResponseWriter) bool {
	// Get parms from the formulaire
	r.ParseForm()

	// Hash the password
	hash := sha512.New()
	hash.Write([]byte(r.FormValue("password")))

	// Put username and password in the api's request
	requestBody, err := json.Marshal(map[string]string{
		"Username": r.FormValue("username"),
		"PwHash":   hex.EncodeToString(hash.Sum(nil)),
	})
	if err != nil {
		panic(err.Error())
	}

	timeout := time.Duration(5 * time.Second)
	client := http.Client{
		Timeout: timeout,
	}

	// Create the request
	NewRequest, err := http.NewRequest("POST", "http://api./login", bytes.NewBuffer(requestBody))
	NewRequest.Header.Set("Content-type", "applicaion/json")
	if err != nil {
		panic(err.Error())
	}

	// Launch the request
	resp, err := client.Do(NewRequest)
	if err != nil {
		panic(err.Error())
	}

	// Check if the API return an error
	if resp.StatusCode != 201 {
		return false
	}

	defer resp.Body.Close()

	// Get the body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err.Error())
	}

	// Parse the response's body
	token := Token{}
	json.Unmarshal([]byte(body), &token)

	// Check if he is admin (if not, he can't connect)
	if !isAdmin(token.Token) {
		return false
	}

	// Create the cookie
	expiration := time.Now().Add(7 * 24 * time.Hour)
	cookie := http.Cookie{Name: "Token", Value: token.Token, Expires: expiration}
	http.SetCookie(w, &cookie)

	return true
}

// Return if the user is connected and if he is admin, or not
func isConnected(r *http.Request) bool {
	// Get the token from the cookie
	token, _ := r.Cookie("Token")
	if token == nil {
		return false
	}
	// Test if the user is admin
	if isAdmin(token.Value) {
		return true
	} else {
		return false
	}
}

// Log out the user
func logout(w http.ResponseWriter) {
	// Delete the cookie
	cookie := http.Cookie{
		Name:   "Token",
		MaxAge: -1}
	http.SetCookie(w, &cookie)
}

// Return an object with all is needed for the dashboard
func getInfoDashboard(r *http.Request) DashboardData {
	nodes := []Node{}
	nodes = getAllServInfo()

	beacons := []Beacon{}
	beacons = getBeaconsInfo(r)

	accounts := []Account{}
	accounts = getAccounts(r)

	data := DashboardData{
		Beacons:  beacons,
		Nodes:    nodes,
		Accounts: accounts,
	}

	return data
}

// Return beacons informations
func getBeaconsInfo(r *http.Request) []Beacon {
	// Get the token
	token, _ := r.Cookie("Token")

	// Set token for the api's request
	requestBody, err := json.Marshal(map[string]string{
		"Token": token.Value,
	})
	if err != nil {
		panic(err.Error())
	}

	timeout := time.Duration(5 * time.Second)
	client := http.Client{
		Timeout: timeout,
	}

	// Create a request
	NewRequest, err := http.NewRequest("POST", "http://api./getBeacons", bytes.NewBuffer(requestBody))
	NewRequest.Header.Set("Content-type", "applicaion/json")
	if err != nil {
		panic(err.Error())
	}

	// Launch the request
	resp, err := client.Do(NewRequest)
	if err != nil {
		panic(err.Error())
	}

	defer resp.Body.Close()

	// Read the response's body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err.Error())
	}

	// Parse the body to beacons
	beacons := []Beacon{}
	json.Unmarshal([]byte(body), &beacons)

	return beacons
}

// Get informations of a server
func getServersInfo(nom string, desc string, addr string) Server {
	// Ping an IP
	pinger, err := ping.NewPinger(addr)
	pinger.SetPrivileged(true)
	pinger.Count = 3
	if err != nil {
		panic(err.Error())
		return Server{}
	}
	var server = Server{}
	pinger.OnFinish = func(stats *ping.Statistics) {
		server = Server{
			Name:         nom,
			Description:  desc,
			IsRunning:    stats.PacketsSent == stats.PacketsRecv,
			ResponseTime: stats.AvgRtt.Milliseconds(),
		}
	}
	pinger.Run()
	return server
}

// Set developpement server informations
func getDevServerInfo() Node {
	node_ret := Node{
		CpuNB:       "1",
		TotMemory:   "3750000",
		AvailMemory: "1250000",
		UsedMemory:  strconv.Itoa(1250000 * 100 / 3750000),
		ServerStats: getServersInfo("DevServer", "Serveur de développement", DEVSERVER),
	}
	return node_ret
}

// Get kubernetes nodes informations
func getNodesInfo() []Node {
	// Set the kubernetes config file
	config, err := clientcmd.BuildConfigFromFlags("", "/app/config/kubeconfig")
	if err != nil {
		panic(err.Error())
	}

	// creates the clientset
	clientset, err := kubernetes.NewForConfig(config)
	if err != nil {
		panic(err.Error())
	}

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Get the nodes list
	nodes, err := clientset.CoreV1().Nodes().List(ctx, v1.ListOptions{})
	if err != nil {
		panic(err.Error())
	}

	i := 1
	nodes_ret := []Node{}
	for _, node := range nodes.Items {
		// Parse CPU number
		tmpcpu, _ := node.Status.Capacity["cpu"]
		ptrcpu := &tmpcpu
		cpuInt, _ := ptrcpu.AsInt64()
		cpu := strconv.FormatInt(cpuInt, 10)
		// Parse total memory
		tmpmem, _ := node.Status.Capacity["memory"]
		ptrmem := &tmpmem
		memInt64, _ := ptrmem.AsInt64()
		mem := strconv.FormatInt(memInt64, 10)
		// Parse not used memory
		tmpmem2, _ := node.Status.Allocatable["memory"]
		ptrmem2 := &tmpmem2
		memInt642, _ := ptrmem2.AsInt64()
		mem2 := strconv.FormatInt(memInt642, 10)
		// Parse IP
		ip := node.Status.Addresses[1].Address
		server := getServersInfo("Noeud-"+strconv.Itoa(i), "Noeud Kubernetes", ip)
		memInt, _ := strconv.Atoi(mem)
		mem2Int, _ := strconv.Atoi(mem2)
		// Get Server info
		node_ret := Node{
			CpuNB:       cpu,
			TotMemory:   mem,
			AvailMemory: mem2,
			UsedMemory:  strconv.Itoa(mem2Int * 100 / memInt),
			ServerStats: server,
		}
		// Add node to nodelist
		nodes_ret = append(nodes_ret, node_ret)
		i++
	}
	return nodes_ret
}

// Get informations of kubernetes and developpement server
func getAllServInfo() []Node {
	nodes := []Node{}
	nodes = getNodesInfo()
	nodes = append(nodes, getDevServerInfo())
	return nodes
}

// Get accounts informations
func getAccounts(r *http.Request) []Account {
	// Get token
	token, _ := r.Cookie("Token")

	// Set token to the request's body
	requestBody, err := json.Marshal(map[string]string{
		"Token": token.Value,
	})
	if err != nil {
		panic(err.Error())
	}

	timeout := time.Duration(5 * time.Second)
	client := http.Client{
		Timeout: timeout,
	}

	// Create the request
	NewRequest, err := http.NewRequest("POST", "http://api./getClients", bytes.NewBuffer(requestBody))
	NewRequest.Header.Set("Content-type", "applicaion/json")
	if err != nil {
		panic(err.Error())
	}

	// Launch the request
	resp, err := client.Do(NewRequest)
	if err != nil {
		panic(err.Error())
	}

	defer resp.Body.Close()

	// Get the response's body
	body, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err.Error())
	}

	// Parse accounts
	accounts := []Account{}
	json.Unmarshal([]byte(body), &accounts)

	return accounts
}

//Go application entrypoint
func main() {
	//We tell Go exactly where we can find our html file. We ask Go to parse the html file (Notice
	// the relative path). We wrap it in a call to template.Must() which handles any errors and halts if there are fatal errors
	templates := template.Must(template.ParseFiles("templates/index.html", "templates/dashboard.html"))

	//Our HTML comes with CSS that go needs to provide when we run the app. Here we tell go to create
	// a handle that looks in the static directory, go then uses the "/static/" as a url that our
	//html can refer to when looking for our css and other files.
	http.Handle("/static/", //final url can be anything
		http.StripPrefix("/static/",
			http.FileServer(http.Dir("static")))) //Go looks in the relative static directory first, then matches it to a
	//url of our choice as shown in http.Handle("/static/"). This url is what we need when referencing our css files
	//once the server begins. Our html code would therefore be <link rel="stylesheet"  href="/static/stylesheet/...">
	//It is important to note the final url can be whatever we like, so long as we are consistent.

	//This method takes in the URL path "/" and a function that takes in a response writer, and a http request.
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		// Check if user is connected
		if isConnected(r) {
			// If he is connected, redirect to the dashboard
			http.Redirect(w, r, "/dashboard", 302)
		} else {
			//If errors show an internal server error message
			//I also pass the welcome struct to the index.html file.
			err := templates.ExecuteTemplate(w, "index.html", nil)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
		}
	})

	//This method takes in the URL path "/dashboard" and a function that takes in a response writer, and a http request.
	http.HandleFunc("/dashboard", func(w http.ResponseWriter, r *http.Request) {
		if !isConnected(r) {
			// If he is not connected, redirect to the index
			http.Redirect(w, r, "/", 302)
		} else {
			// Get all dashboard informations
			dashboardDatas := getInfoDashboard(r)

			//If errors show an internal server error message
			//I also pass the welcome struct to the dashboard.html file.
			err := templates.ExecuteTemplate(w, "dashboard.html", dashboardDatas)
			if err != nil {
				http.Error(w, err.Error(), http.StatusInternalServerError)
			}
		}
	})

	//This method takes in the URL path "/login" and a function that takes in a response writer, and a http request.
	http.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		// Try to log the user
		if login(r, w) {
			// If the user is logged, redirect to dashboard
			http.Redirect(w, r, "/dashboard", 302)
		} else {
			// If he isn't, redirect to the index
			http.Redirect(w, r, "/", 302)
		}
	})

	//This method takes in the URL path "/logout" and a function that takes in a response writer, and a http request.
	http.HandleFunc("/logout", func(w http.ResponseWriter, r *http.Request) {
		logout(w)
		http.Redirect(w, r, "/", 302)
	})

	//Start the web server, set the port to listen to 8080. Without a path it assumes localhost
	//Print any errors from starting the webserver using fmt
	fmt.Println("Listening on Port 8080")
	fmt.Println(http.ListenAndServe(":8080", nil))
}
