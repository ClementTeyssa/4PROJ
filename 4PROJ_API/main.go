/*
main.go 						: programme Go permettant d'effectuer des intéractions avec MongoDB à travers Bongo (ODM Go pour MongoDB) pour la matière 4PROJ
créé par 						: Axel Kimmel
date de création 				: 25/05/2020
date de dernière modification 	: 14/06/2020
*/

package main

import (
	"crypto/sha512"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	gonet "net"
	"net/http"
	"sort"
	"time"

	"github.com/globalsign/mgo/bson"
	"github.com/go-bongo/bongo"
	"github.com/gorilla/mux"
)

//PostObject : objet de base
type PostObject struct {
	Token      string
	ObjectType string
}

//Client : client du magasin
type Client struct {
	bongo.DocumentBase `bson:",inline"`
	ID                 int    `json:"ID"`
	Username           string `json:"Username"`
	PwHash             string `json:"PwHash"`
	IsAdmin            bool   `json:"IsAdmin"`
	Firstname          string `json:"Firstname"`
	Lastname           string `json:"Lastname"`
	Token              string `json:"Token"`
}

//Transaction : achats d'un client
type Transaction struct {
	bongo.DocumentBase `bson:",inline"`
	ID                 int       `json:"ID"`
	Token              string    `json:"Token"`
	Amount             float32   `json:"Amount"`
	RealDate           time.Time `json:"RealDate"`
	ItemsID            []int     `json:"ItemsID"`
}

//Promotion : promotion ponctuelle d'un ou plusieurs produits
type Promotion struct {
	bongo.DocumentBase `bson:",inline"`
	ID                 int       `json:"ID"`
	StartDate          time.Time `json:"StartDate"`
	EndDate            time.Time `json:"EndDate"`
	Description        string    `json:"Description"`
	Price              float32   `json:"Price"`
	ItemsID            []int     `json:"ItemsID"`
}

//Item : objets vendus, composés de produits
type Item struct {
	bongo.DocumentBase `bson:",inline"`
	ID                 int     `json:"ID"`
	ProductID          int     `json:"ProductID"`
	Quantity           int     `json:"Quantity"`
	BarCode            string  `json:"BarCode"`
	Price              float32 `json:"Price"`
}

//Product : produits présents en stock, compose les items
type Product struct {
	bongo.DocumentBase `bson:",inline"`
	ID                 int     `json:"ID"`
	Name               string  `json:"Name"`
	Brand              string  `json:"Brand"`
	Price              float32 `json:"Price"`
	CategoryID         int     `json:"CategoryID"`
	QuantityStock      int     `json:"QuantityStock"`
	Description        string  `json:"Description"`
}

//Category : catégorie de produit
type Category struct {
	bongo.DocumentBase `bson:",inline"`
	ID                 int    `json:"ID"`
	Name               string `json:"Name"`
	ShelfID            int    `json:"ShelfID"`
}

//Beacon : balise rattachée à un rayon
type Beacon struct {
	bongo.DocumentBase `bson:",inline"`
	ID                 int       `json:"ID"`
	MAC                string    `json:"MAC"`
	EntryBeacon        bool      `json:"EntryBeacon"`
	Name               string    `json:"Name"`
	ShelfID            int       `json:"ShelfID"`
	PosX               float32   `json:"PosX"`
	PosY               float32   `json:"PosY"`
	LastSignalDate     time.Time `json:"LastSignalDate"`
}

//Shelf : rayon du magasin
type Shelf struct {
	bongo.DocumentBase `bson:",inline"`
	ID                 int     `json:"ID"`
	Name               string  `json:"Name"`
	SupermarketID      int     `json:"SupermarketID"`
	PosX               float32 `json:"PosX"`
	PosY               float32 `json:"PosY"`
}

//Supermarket : magasin
type Supermarket struct {
	bongo.DocumentBase `bson:",inline"`
	ID                 int    `json:"ID"`
	Address            string `json:"Address"`
	Sign               string `json:"Sign"`
}

const (
	//listenPort : port d'écoute de l'API
	listenPort = "8080"
)

//ip : adresse ip d'écoute de l'API
var ip *string

//err : variable utilisée pour la gestion d'erreur
var err error

//connection : instance de la connexion à la bdd MongoDB
var connection *bongo.Connection

//init : fonction executée à l'initialisation
func init() {

}

//main : fonction principale, point d'entrée de l'API
func main() {

	config := &bongo.Config{
		ConnectionString: "mongodb://.:27017/?authSource=admin",
		Database:         "4proj",
	}

	connection, err = bongo.Connect(config)

	log.Println("Connecting to  " + config.ConnectionString)

	if err != nil {
		log.Println("Connection error")
		log.Fatal(err)
	} else {
		log.Println("Connection success")
	}

	ip = flag.String("ip", "global", "ip range")
	flag.Parse()
	log.Fatal(launchMUXServer())
}

//launchMUXServer : serveur MUX pour traiter des requêtes entrantes et y répondre
func launchMUXServer() error { // launch MUX server
	mux := makeMUXRouter()
	log.Println("HTTP MUX server listening on " + getMyIP(*ip) + ":" + listenPort) // listenPort is a global const

	s := &http.Server{
		Addr:           ":" + listenPort,
		Handler:        mux,
		ReadTimeout:    10 * time.Second,
		WriteTimeout:   10 * time.Second,
		MaxHeaderBytes: 1 << 20,
	}

	if err = s.ListenAndServe(); err != nil {
		return err
	}

	return nil
}

//makeMUXRouter : création du routeur MUX et création des routes disponibles
func makeMUXRouter() http.Handler { // create handlers
	muxRouter := mux.NewRouter()
	muxRouter.HandleFunc("/insert", insertQuery).Methods("POST")
	muxRouter.HandleFunc("/update", updateQuery).Methods("POST")
	muxRouter.HandleFunc("/delete", deleteQuery).Methods("POST")
	muxRouter.HandleFunc("/find", findQuery).Methods("POST")
	muxRouter.HandleFunc("/register", register).Methods("POST")
	muxRouter.HandleFunc("/login", login).Methods("POST")
	muxRouter.HandleFunc("/transactions", transactions).Methods("POST")
	muxRouter.HandleFunc("/transactionDetails", transactionDetails).Methods("POST")
	muxRouter.HandleFunc("/beacons", beacons).Methods("POST")
	muxRouter.HandleFunc("/products", products).Methods("POST")
	muxRouter.HandleFunc("/changeAdmin", changeAdmin).Methods("POST")
	muxRouter.HandleFunc("/isAdmin", isAdmin).Methods("POST")
	muxRouter.HandleFunc("/getClients", getClients).Methods("POST")
	muxRouter.HandleFunc("/getBeacons", getBeacons).Methods("POST")
	muxRouter.HandleFunc("/clientFromToken", clientFromToken).Methods("POST")
	muxRouter.HandleFunc("/recommandations", recommandations).Methods("POST")
	return muxRouter
}

//insertQuery : fonction d'insertion pour tout type d'objet
func insertQuery(w http.ResponseWriter, r *http.Request) {
	log.Println("insertQuery() API called")
	log.Println("API called by : " + r.Host)
	var insertObject PostObject
	//instanciation d'un décodeur JSON pour "convertir" le JSON reçu dans une struct go
	//le décodeur fait correspondre les balises JSON avec celles décrites dans les struct
	decoder := json.NewDecoder(r.Body)
	//décodage du JSON reçu dans l'objet insertObject
	decoder.Decode(&insertObject)
	defer r.Body.Close()
	//récupération du premier ID disponible
	newID := getMaxID(insertObject.ObjectType)
	//vérification de la validité du token
	if isTokenValid(insertObject.Token) {

		//switch en fonction du type de l'objet
		switch insertObject.ObjectType {
		case "Client":
			log.Println("switch Client")
			//création d'un objet Client destiné à contenir les données JSON
			var myClient = &Client{}
			//décodage du JSON dans l'objet Client
			if err := decoder.Decode(&myClient); err != nil {
				//réponse en JSON de l'erreur
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				//on assigne le nouvel ID à l'objet Client
				myClient.ID = newID
				//sauvegarde du Client en bdd
				err = connection.Collection("Clients").Save(myClient)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Transaction":
			log.Println("switch Transaction")
			var myTransaction = &Transaction{}
			if err := decoder.Decode(&myTransaction); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				myTransaction.ID = newID
				err = connection.Collection("Transactions").Save(myTransaction)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Item":
			log.Println("switch Item")
			var myItem = &Item{}
			if err := decoder.Decode(&myItem); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				myItem.ID = newID
				err = connection.Collection("Items").Save(myItem)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Promotion":
			log.Println("switch Promotion")
			var myPromotion = &Promotion{}
			if err := decoder.Decode(&myPromotion); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				myPromotion.ID = newID
				err = connection.Collection("Items").Save(myPromotion)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Product":
			log.Println("switch Product")
			var myProduct = &Product{}
			if err := decoder.Decode(&myProduct); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				myProduct.ID = newID
				err = connection.Collection("Products").Save(myProduct)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Category":
			log.Println("switch Category")
			var myCategory = &Category{}
			if err := decoder.Decode(&myCategory); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				myCategory.ID = newID
				err = connection.Collection("Categories").Save(myCategory)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Beacon":
			log.Println("switch Beacon")
			var myBeacon = &Beacon{}
			if err := decoder.Decode(&myBeacon); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				myBeacon.ID = newID
				err = connection.Collection("Beacons").Save(myBeacon)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Shelf":
			log.Println("switch Shelf")
			var myShelf = &Shelf{}
			if err := decoder.Decode(&myShelf); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				myShelf.ID = newID
				err = connection.Collection("Shelves").Save(myShelf)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Supermarket":
			log.Println("switch Supermarket")
			var mySupermarket = &Supermarket{}
			if err := decoder.Decode(&mySupermarket); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				mySupermarket.ID = newID
				err = connection.Collection("Supermarkets").Save(mySupermarket)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		default:
			respondWithJSON(w, r, http.StatusBadRequest, "Default")
		}
	} else {
		respondWithJSON(w, r, http.StatusBadRequest, "Wrong Token")
	}

}

//updateQuery : fonction de mise à jour pour tout type d'objet
func updateQuery(w http.ResponseWriter, r *http.Request) {
	log.Println("updateQuery() API called")
	log.Println("API called by : " + r.Host)
	var insertObject PostObject
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&insertObject)
	defer r.Body.Close()
	if isTokenValid(insertObject.Token) {

		//switch en fonction du type de l'objet
		switch insertObject.ObjectType {
		case "Client":
			log.Println("switch Client")
			var myClient = &Client{}
			if err := decoder.Decode(&myClient); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Clients").DeleteOne(bson.M{"id": myClient.ID})
				err = connection.Collection("Clients").Save(myClient)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Transaction":
			log.Println("switch Transaction")
			var myTransaction = &Transaction{}
			if err := decoder.Decode(&myTransaction); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Transactions").DeleteOne(bson.M{"id": myTransaction.ID})
				err = connection.Collection("Transactions").Save(myTransaction)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Item":
			log.Println("switch Item")
			var myItem = &Item{}
			if err := decoder.Decode(&myItem); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Items").DeleteOne(bson.M{"id": myItem.ID})
				err = connection.Collection("Items").Save(myItem)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Promotion":
			log.Println("switch Promotion")
			var myPromotion = &Promotion{}
			if err := decoder.Decode(&myPromotion); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Items").DeleteOne(bson.M{"id": myPromotion.ID})
				err = connection.Collection("Items").Save(myPromotion)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Product":
			log.Println("switch Product")
			var myProduct = &Product{}
			if err := decoder.Decode(&myProduct); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Products").DeleteOne(bson.M{"id": myProduct.ID})
				err = connection.Collection("Products").Save(myProduct)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Category":
			log.Println("switch Category")
			var myCategory = &Category{}
			if err := decoder.Decode(&myCategory); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Categories").DeleteOne(bson.M{"id": myCategory.ID})
				err = connection.Collection("Categories").Save(myCategory)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Beacon":
			log.Println("switch Beacon")
			var myBeacon = &Beacon{}
			if err := decoder.Decode(&myBeacon); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Beacons").DeleteOne(bson.M{"id": myBeacon.ID})
				err = connection.Collection("Beacons").Save(myBeacon)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Shelf":
			log.Println("switch Shelf")
			var myShelf = &Shelf{}
			if err := decoder.Decode(&myShelf); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Shelves").DeleteOne(bson.M{"id": myShelf.ID})
				err = connection.Collection("Shelves").Save(myShelf)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Supermarket":
			log.Println("switch Supermarket")
			var mySupermarket = &Supermarket{}
			if err := decoder.Decode(&mySupermarket); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Supermarkets").DeleteOne(bson.M{"id": mySupermarket.ID})
				err = connection.Collection("Supermarkets").Save(mySupermarket)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		default:
			respondWithJSON(w, r, http.StatusBadRequest, "Default")
		}
	} else {
		respondWithJSON(w, r, http.StatusBadRequest, "Wrong Token")
	}
}

//deleteQuery : fonction de deletion pour tout type d'objet
func deleteQuery(w http.ResponseWriter, r *http.Request) {
	log.Println("deleteQuery() API called")
	log.Println("API called by : " + r.Host)
	var insertObject PostObject
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&insertObject)
	defer r.Body.Close()

	if isTokenValid(insertObject.Token) {

		//switch en fonction du type de l'objet
		switch insertObject.ObjectType {
		case "Client":
			log.Println("switch Client")
			var myClient = &Client{}
			if err := decoder.Decode(&myClient); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Clients").DeleteOne(bson.M{"id": myClient.ID})
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Transaction":
			log.Println("switch Transaction")
			var myTransaction = &Transaction{}
			if err := decoder.Decode(&myTransaction); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Transactions").DeleteOne(bson.M{"id": myTransaction.ID})
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Item":
			log.Println("switch Item")
			var myItem = &Item{}
			if err := decoder.Decode(&myItem); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Items").DeleteOne(bson.M{"id": myItem.ID})
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Promotion":
			log.Println("switch Promotion")
			var myPromotion = &Promotion{}
			if err := decoder.Decode(&myPromotion); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Items").DeleteOne(bson.M{"id": myPromotion.ID})
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Product":
			log.Println("switch Product")
			var myProduct = &Product{}
			if err := decoder.Decode(&myProduct); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Products").DeleteOne(bson.M{"id": myProduct.ID})
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Category":
			log.Println("switch Category")
			var myCategory = &Category{}
			if err := decoder.Decode(&myCategory); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Categories").DeleteOne(bson.M{"id": myCategory.ID})
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Beacon":
			log.Println("switch Beacon")
			var myBeacon = &Beacon{}
			if err := decoder.Decode(&myBeacon); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Beacons").DeleteOne(bson.M{"id": myBeacon.ID})
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Shelf":
			log.Println("switch Shelf")
			var myShelf = &Shelf{}
			if err := decoder.Decode(&myShelf); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Shelves").DeleteOne(bson.M{"id": myShelf.ID})
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		case "Supermarket":
			log.Println("switch Supermarket")
			var mySupermarket = &Supermarket{}
			if err := decoder.Decode(&mySupermarket); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				err = connection.Collection("Supermarkets").DeleteOne(bson.M{"id": mySupermarket.ID})
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			}
		default:
			respondWithJSON(w, r, http.StatusBadRequest, "Default")
		}

	} else {
		respondWithJSON(w, r, http.StatusBadRequest, "Wrong Token")
	}
}

//findQuery : fonction de récupération pour tout type d'objet
//dans certains cas, pour la récupération d'un objet, il est possible de fournir l'ID de l'objet ou -1 si l'on souhaite récupérer tous les objets
func findQuery(w http.ResponseWriter, r *http.Request) {
	log.Println("findQuery() API called")
	log.Println("API called by : " + r.Host)
	var insertObject PostObject
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&insertObject)
	defer r.Body.Close()

	if isTokenValid(insertObject.Token) {
		switch insertObject.ObjectType {
		case "Client":
			log.Println("switch Client")
			var myClient = &Client{}
			if err := decoder.Decode(&myClient); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				if myClient.ID != -1 {
					err = connection.Collection("Clients").FindOne(bson.M{"id": myClient.ID}, myClient)
					if err != nil {
						respondWithJSON(w, r, http.StatusBadRequest, err)
					}
					respondWithJSON(w, r, http.StatusCreated, myClient)
				} else {
					results := connection.Collection("Clients").Find(bson.M{})
					client := &Client{}
					for results.Next(client) {
						respondWithJSON(w, r, http.StatusCreated, client)
					}
				}
			}
		case "Transaction":
			log.Println("switch Transaction")
			var myTransaction = &Transaction{}
			if err := decoder.Decode(&myTransaction); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				if myTransaction.ID != -1 {
					err = connection.Collection("Transactions").FindOne(bson.M{"id": myTransaction.ID}, myTransaction)
					if err != nil {
						respondWithJSON(w, r, http.StatusBadRequest, err)
					}
					respondWithJSON(w, r, http.StatusCreated, myTransaction)
				} else {
					results := connection.Collection("Transactions").Find(bson.M{})
					transaction := &Transaction{}
					for results.Next(transaction) {
						respondWithJSON(w, r, http.StatusCreated, transaction)
					}
				}
			}
		case "Item":
			log.Println("switch Item")
			var myItem = &Item{}
			if err := decoder.Decode(&myItem); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				if myItem.ID != -1 {
					err = connection.Collection("Items").FindOne(bson.M{"id": myItem.ID}, myItem)
					if err != nil {
						respondWithJSON(w, r, http.StatusBadRequest, err)
					}
					respondWithJSON(w, r, http.StatusCreated, myItem)
				} else {
					results := connection.Collection("Items").Find(bson.M{})
					item := &Item{}
					for results.Next(item) {
						respondWithJSON(w, r, http.StatusCreated, item)
					}
				}
			}
		case "Promotion":
			log.Println("switch Promotion")
			var myPromotion = &Promotion{}
			if err := decoder.Decode(&myPromotion); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				if myPromotion.ID != -1 {
					err = connection.Collection("Promotions").FindOne(bson.M{"id": myPromotion.ID}, myPromotion)
					if err != nil {
						respondWithJSON(w, r, http.StatusBadRequest, err)
					}
					respondWithJSON(w, r, http.StatusCreated, myPromotion)
				} else {
					results := connection.Collection("Promotions").Find(bson.M{})
					promotion := &Promotion{}
					for results.Next(promotion) {
						respondWithJSON(w, r, http.StatusCreated, promotion)
					}
				}
			}
		case "Product":
			log.Println("switch Product")
			var myProduct = &Product{}
			if err := decoder.Decode(&myProduct); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				if myProduct.ID != -1 {
					err = connection.Collection("Products").FindOne(bson.M{"id": myProduct.ID}, myProduct)
					if err != nil {
						respondWithJSON(w, r, http.StatusBadRequest, err)
					}
					respondWithJSON(w, r, http.StatusCreated, myProduct)
				} else {
					results := connection.Collection("Products").Find(bson.M{})
					product := &Product{}
					for results.Next(product) {
						respondWithJSON(w, r, http.StatusCreated, product)
					}
				}
			}
		case "Category":
			log.Println("switch Category")
			var myCategory = &Category{}
			if err := decoder.Decode(&myCategory); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				if myCategory.ID != -1 {
					err = connection.Collection("Categories").FindOne(bson.M{"id": myCategory.ID}, myCategory)
					if err != nil {
						respondWithJSON(w, r, http.StatusBadRequest, err)
					}
					respondWithJSON(w, r, http.StatusCreated, myCategory)
				} else {
					results := connection.Collection("Categories").Find(bson.M{})
					category := &Category{}
					for results.Next(category) {
						respondWithJSON(w, r, http.StatusCreated, category)
					}
				}
			}
		case "Beacon":
			log.Println("switch Beacon")
			var myBeacon = &Beacon{}
			if err := decoder.Decode(&myBeacon); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				if myBeacon.ID != -1 {
					err = connection.Collection("Beacons").FindOne(bson.M{"id": myBeacon.ID}, myBeacon)
					if err != nil {
						respondWithJSON(w, r, http.StatusBadRequest, err)
					}
					respondWithJSON(w, r, http.StatusCreated, myBeacon)
				} else {
					results := connection.Collection("Beacons").Find(bson.M{})
					beacon := &Beacon{}
					for results.Next(beacon) {
						respondWithJSON(w, r, http.StatusCreated, beacon)
					}
				}
			}
		case "Shelf":
			log.Println("switch Shelf")
			var myShelf = &Shelf{}
			if err := decoder.Decode(&myShelf); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				if myShelf.ID != -1 {
					err = connection.Collection("Shelves").FindOne(bson.M{"id": myShelf.ID}, myShelf)
					if err != nil {
						respondWithJSON(w, r, http.StatusBadRequest, err)
					}
					respondWithJSON(w, r, http.StatusCreated, myShelf)
				} else {
					results := connection.Collection("Shelves").Find(bson.M{})
					shelf := &Shelf{}
					for results.Next(shelf) {
						respondWithJSON(w, r, http.StatusCreated, shelf)
					}
				}
			}
		case "Supermarket":
			log.Println("switch Supermarket")
			var mySupermarket = &Supermarket{}
			if err := decoder.Decode(&mySupermarket); err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				if mySupermarket.ID != -1 {
					err = connection.Collection("Supermarkets").FindOne(bson.M{"id": mySupermarket.ID}, mySupermarket)
					if err != nil {
						respondWithJSON(w, r, http.StatusBadRequest, err)
					}
					respondWithJSON(w, r, http.StatusCreated, mySupermarket)
				} else {
					results := connection.Collection("Supermarkets").Find(bson.M{})
					supermarket := &Supermarket{}
					for results.Next(supermarket) {
						respondWithJSON(w, r, http.StatusCreated, supermarket)
					}
				}
			}
		default:
			respondWithJSON(w, r, http.StatusBadRequest, "Default")
		}

	} else {
		respondWithJSON(w, r, http.StatusBadRequest, "Wrong Token")
	}
}

//register : fonction permettant d'enregistrer un nouveau client en bdd
func register(w http.ResponseWriter, r *http.Request) {
	log.Println("register() API called")
	log.Println("API called by : " + r.Host)
	newID := getMaxID("Client")
	decoder := json.NewDecoder(r.Body)
	defer r.Body.Close()
	var myClient = &Client{}

	if err := decoder.Decode(&myClient); err != nil {
		respondWithJSON(w, r, http.StatusBadRequest, err)
	} else {
		myClient.ID = newID
		//génération du token du Client à partir de ses informations
		myClient.Token = asSha512(myClient)
		err = connection.Collection("Clients").Save(myClient)
		if err != nil {
			respondWithJSON(w, r, http.StatusBadRequest, err)
		} else {
			respondWithJSON(w, r, http.StatusCreated, myClient)
		}
	}
}

//login : fonction permettant la connexion d'un client, retourne le token du client si la combinaison username - password hash est valide
func login(w http.ResponseWriter, r *http.Request) {
	log.Println("login() API called")
	log.Println("API called by : " + r.Host)
	decoder := json.NewDecoder(r.Body)
	defer r.Body.Close()
	var myClient = &Client{}
	var dbClient = &Client{}

	if err := decoder.Decode(&myClient); err != nil {
		respondWithJSON(w, r, http.StatusBadRequest, err)
	} else {
		err = connection.Collection("Clients").FindOne(bson.M{"username": myClient.Username}, dbClient)
		if err != nil {
			respondWithJSON(w, r, http.StatusBadRequest, err)
		}
		if myClient.PwHash == dbClient.PwHash {
			respondWithJSON(w, r, http.StatusCreated, dbClient)
		} else {
			respondWithJSON(w, r, http.StatusBadRequest, "Wrong PwHash")
		}
	}
}

//transactions : fonctions permettant de récupérer toutes les transactions d'un client à partir de son token
func transactions(w http.ResponseWriter, r *http.Request) {
	log.Println("transations() API called")
	log.Println("API called by : " + r.Host)
	var insertObject PostObject
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&insertObject)
	defer r.Body.Close()

	if isTokenValid(insertObject.Token) {
		transactions := connection.Collection("Transactions").Find(bson.M{"token": insertObject.Token})
		transaction := &Transaction{}
		for transactions.Next(transaction) {
			respondWithJSON(w, r, http.StatusCreated, transaction)
		}
	} else {
		respondWithJSON(w, r, http.StatusBadRequest, "Wrong Token")
	}
}

//transactionDetails : fonction permettant de récupérer les détails (produits, etc...) d'une transaction en fournissant son ID
//si l'id fournit est -1 la dernière transaction du client est récupérée
func transactionDetails(w http.ResponseWriter, r *http.Request) {
	log.Println("transactionDetails() API called")
	log.Println("API called by : " + r.Host)
	var insertObject PostObject
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&insertObject)
	defer r.Body.Close()

	if isTokenValid(insertObject.Token) {
		var myTransaction = &Transaction{}
		if err := decoder.Decode(&myTransaction); err != nil {
			respondWithJSON(w, r, http.StatusBadRequest, err)
		} else {
			if myTransaction.ID != -1 {
				err = connection.Collection("Transactions").FindOne(bson.M{"id": myTransaction.ID}, myTransaction)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				}
			} else {
				results := connection.Collection("Transactions").Find(bson.M{"token": insertObject.Token})
				transaction := &Transaction{}
				for results.Next(transaction) {
					if transaction.ID > myTransaction.ID {
						myTransaction = transaction
					}
				}
			}
			respondWithJSON(w, r, http.StatusCreated, myTransaction)
			var myItem = &Item{}
			for _, i := range myTransaction.ItemsID {
				err = connection.Collection("Items").FindOne(bson.M{"id": i}, myItem)
				respondWithJSON(w, r, http.StatusCreated, myItem)
			}
		}
	} else {
		respondWithJSON(w, r, http.StatusBadRequest, "Wrong Token")
	}
}

//beacons : fonction permettant de récupérer la liste des balises
func beacons(w http.ResponseWriter, r *http.Request) {
	log.Println("beacons() API called")
	log.Println("API called by : " + r.Host)
	var insertObject PostObject
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&insertObject)
	defer r.Body.Close()

	if isTokenValid(insertObject.Token) {
		var mySupermarket = &Supermarket{}
		if err := decoder.Decode(&mySupermarket); err != nil {
			respondWithJSON(w, r, http.StatusBadRequest, err)
		} else {
			shelves := connection.Collection("Shelves").Find(bson.M{"supermarketid": mySupermarket.ID})
			shelf := &Shelf{}
			for shelves.Next(shelf) {
				beacons := connection.Collection("Beacons").Find(bson.M{"shelfid": shelf.ID})
				beacon := &Beacon{}
				for beacons.Next(beacon) {
					respondWithJSON(w, r, http.StatusCreated, beacon)
				}
			}
		}
	} else {
		respondWithJSON(w, r, http.StatusBadRequest, "Wrong Token")
	}
}

//products : fonction permettant de récupérer l'ensemble des items présents sur un rayon
func products(w http.ResponseWriter, r *http.Request) {
	log.Println("products() API called")
	log.Println("API called by : " + r.Host)
	var insertObject PostObject
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&insertObject)
	defer r.Body.Close()

	if isTokenValid(insertObject.Token) {
		var myBeacon = &Beacon{}
		if err := decoder.Decode(&myBeacon); err != nil {
			respondWithJSON(w, r, http.StatusBadRequest, err)
		} else {
			err = connection.Collection("Beacons").FindOne(bson.M{"id": myBeacon.ID}, myBeacon)
			if err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			}
			categories := connection.Collection("Categories").Find(bson.M{"shelfid": myBeacon.ShelfID})
			category := &Category{}
			for categories.Next(category) {
				products := connection.Collection("Products").Find(bson.M{"categoryid": category.ID})
				product := &Product{}
				for products.Next(product) {
					items := connection.Collection("Items").Find(bson.M{"productid": product.ID})
					item := &Item{}
					for items.Next(item) {
						respondWithJSON(w, r, http.StatusCreated, item)
					}
				}
			}
		}
	} else {
		respondWithJSON(w, r, http.StatusBadRequest, "Wrong Token")
	}
}

//changeAdmin : fonction permettant de changer de le statut administrateur (IsAdmin) d'un client
func changeAdmin(w http.ResponseWriter, r *http.Request) {
	log.Println("changeAdmin() API called")
	log.Println("API called by : " + r.Host)
	var insertObject PostObject
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&insertObject)
	defer r.Body.Close()

	if isTokenValid(insertObject.Token) {
		var myClient = &Client{}
		err = connection.Collection("Clients").FindOne(bson.M{"token": insertObject.Token}, myClient)
		myClient.IsAdmin = !myClient.IsAdmin
		err = connection.Collection("Clients").DeleteOne(bson.M{"id": myClient.ID})
		err = connection.Collection("Clients").Save(myClient)
		if err != nil {
			respondWithJSON(w, r, http.StatusBadRequest, err)
		} else {
			respondWithJSON(w, r, http.StatusCreated, "IsAdmin changed")
		}
	} else {
		respondWithJSON(w, r, http.StatusBadRequest, "Wrong Token")
	}
}

//isAdmin : fonction permettant de savoir si un client est administrateur ou non
func isAdmin(w http.ResponseWriter, r *http.Request) {
	log.Println("isAdmin() API called")
	log.Println("API called by : " + r.Host)
	var insertObject PostObject
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&insertObject)
	defer r.Body.Close()

	if isTokenValid(insertObject.Token) {
		var myClient = &Client{}
		err = connection.Collection("Clients").FindOne(bson.M{"token": insertObject.Token}, myClient)
		if err != nil {
			respondWithJSON(w, r, http.StatusBadRequest, err)
		} else {
			respondWithJSON(w, r, http.StatusCreated, myClient.IsAdmin)
		}
	} else {
		respondWithJSON(w, r, http.StatusBadRequest, "Wrong Token")
	}
}

//getClients : fonction permettant de récupérer la liste des clients sous forme de tableau
func getClients(w http.ResponseWriter, r *http.Request) {
	log.Println("getClients() API called")
	log.Println("API called by : " + r.Host)
	var insertObject PostObject
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&insertObject)
	defer r.Body.Close()

	if isTokenValid(insertObject.Token) {
		clients := connection.Collection("Clients").Find(bson.M{})
		client := &Client{}
		var clientArray []Client
		for clients.Next(client) {
			client.PwHash = ""
			clientArray = append(clientArray, *client)
		}
		respondWithJSON(w, r, http.StatusCreated, clientArray)
	} else {
		respondWithJSON(w, r, http.StatusBadRequest, "Wrong Token")
	}
}

//getBeacons : fonction permettant de récupérer la liste des balises sous forme de tableau
func getBeacons(w http.ResponseWriter, r *http.Request) {
	log.Println("getBeacons() API called")
	log.Println("API called by : " + r.Host)
	var insertObject PostObject
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&insertObject)
	defer r.Body.Close()

	if isTokenValid(insertObject.Token) {
		beacons := connection.Collection("Beacons").Find(bson.M{})
		beacon := &Beacon{}
		var beaconArray []Beacon
		for beacons.Next(beacon) {
			beaconArray = append(beaconArray, *beacon)
		}
		respondWithJSON(w, r, http.StatusCreated, beaconArray)
	} else {
		respondWithJSON(w, r, http.StatusBadRequest, "Wrong Token")
	}
}

//clientFromToken : fonction permettant de récupérer l'objet Client à partir de son token
func clientFromToken(w http.ResponseWriter, r *http.Request) {
	log.Println("clientFromToken() API called")
	log.Println("API called by : " + r.Host)
	var insertObject PostObject
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&insertObject)
	defer r.Body.Close()

	if isTokenValid(insertObject.Token) {
		client := &Client{}
		err = connection.Collection("Clients").FindOne(bson.M{"token": insertObject.Token}, client)
		if err != nil {
			respondWithJSON(w, r, http.StatusBadRequest, err)
		} else {
			respondWithJSON(w, r, http.StatusCreated, client)
		}
	} else {
		respondWithJSON(w, r, http.StatusBadRequest, "Wrong Token")
	}
}

//recommandations : fonction permettant de récupérer des items recommandés, c'est à dire des items qu'un client serait susceptible d'acheter
func recommandations(w http.ResponseWriter, r *http.Request) {
	log.Println("recommandations() API called")
	log.Println("API called by : " + r.Host)
	var insertObject PostObject
	decoder := json.NewDecoder(r.Body)
	decoder.Decode(&insertObject)
	defer r.Body.Close()

	if isTokenValid(insertObject.Token) {
		//récupération des transactions d'un client
		transactions := connection.Collection("Transactions").Find(bson.M{"token": insertObject.Token})
		transaction := &Transaction{}
		var categoryID []int
		for transactions.Next(transaction) {
			for _, i := range transaction.ItemsID {
				item := &Item{}
				//récupération des items contenus dans les transactions
				err := connection.Collection("Items").FindOne(bson.M{"id": i}, item)
				if err != nil {
					respondWithJSON(w, r, http.StatusBadRequest, err)
				} else {
					product := &Product{}
					//récupération des produits qui composent les items
					err := connection.Collection("Products").FindOne(bson.M{"id": item.ProductID}, product)
					if err != nil {
						respondWithJSON(w, r, http.StatusBadRequest, err)
					} else {
						//stockage des ID des catégories dont les produits font parti
						categoryID = append(categoryID, product.CategoryID)
					}
				}
			}
		}
		sort.Ints(categoryID)
		//map (tableau associatif) qui associe l'ID d'une catégorie au nombre de fois où elle apparaît dans l'ensemble des transactions d'un client
		categoryMap := make(map[int]int)
		var currentID = categoryID[0]
		var count = 0
		var total = 0
		for _, v := range categoryID {
			if v != currentID {
				total = total + count
				categoryMap[currentID] = count
				currentID = v
				count = 0
			} else {
				count++
			}
		}
		total = total + count
		categoryMap[currentID] = count
		//la recommandation retourne un maximum de 10 articles (pour que cela reste pertinent pour le client)
		//on pondère donc le nombre de "places attribuées" à une catégorie dans la liste des recommandations en fonction de la fréquence d'apparition de ces dernières
		for key, value := range categoryMap {
			categoryMap[key] = int(value / total * 10)
		}
		var promotionArray []Promotion
		promotion := &Promotion{}
		//récupération de toutes les promotions existantes
		promotions := connection.Collection("Promotions").Find(bson.M{})
		for promotions.Next(promotion) {
			promotionArray = append(promotionArray, *promotion)
		}
		//lors de l'ajout des items à la liste des recommandations, les promotions portant sur cet item sont privilégiés
		//il faut également s'assurer que le produit n'est pas déjà dans la liste des recommandations (intInSlice)
		//usedID contient la liste des ID des items qui seront recommandés
		var usedID []int
		var itemsIDArray []int
		var itemsArray []Item
		for key, value := range categoryMap {
			var remains = value
			product := &Product{}
			products := connection.Collection("Products").Find(bson.M{"categoryid": key})
			for products.Next(product) {
				item := &Item{}
				items := connection.Collection("Items").Find(bson.M{"productid": product.ID})
				for items.Next(item) {
					itemsArray = append(itemsArray, *item)
					itemsIDArray = append(itemsIDArray, item.ID)
				}
			}
			for _, v := range promotionArray {
				if remains == 0 {
					break
				}
				for _, i := range v.ItemsID {
					if intInSlice(i, itemsIDArray) && !intInSlice(i, usedID) {
						usedID = append(usedID, i)
						remains--
					}
				}
			}
			if remains > 0 {
				for _, v := range itemsArray {
					if remains == 0 {
						break
					}
					if !intInSlice(v.ID, usedID) {
						usedID = append(usedID, v.ID)
						remains--
					}
				}
			}
		}
		//liste des recommandations construite à partir de la liste usedID
		var RecommendedItems []Item
		for _, v := range usedID {
			item := &Item{}
			err := connection.Collection("Items").FindOne(bson.M{"id": v}, item)
			if err != nil {
				respondWithJSON(w, r, http.StatusBadRequest, err)
			} else {
				RecommendedItems = append(RecommendedItems, *item)
			}
		}
		respondWithJSON(w, r, http.StatusCreated, RecommendedItems)
	} else {
		respondWithJSON(w, r, http.StatusBadRequest, "Wrong Token")
	}
}

//getMaxID : fonction permettant de récupérer le premier ID utilisable (=non utilisé) d'une collection
func getMaxID(ObjectType string) int {
	var IDArray []int
	var IDMax = 0

	//switch en fonction du type de l'objet
	switch ObjectType {
	case "Client":
		log.Println("switch Client")
		results := connection.Collection("Clients").Find(bson.M{})
		client := &Client{}
		for results.Next(client) {
			IDArray = append(IDArray, client.ID)
		}
	case "Transaction":
		log.Println("switch Transaction")
		results := connection.Collection("Transactions").Find(bson.M{})
		transaction := &Transaction{}
		for results.Next(transaction) {
			IDArray = append(IDArray, transaction.ID)
		}
	case "Item":
		log.Println("switch Item")
		results := connection.Collection("Items").Find(bson.M{})
		item := &Item{}
		for results.Next(item) {
			IDArray = append(IDArray, item.ID)
		}
	case "Promotion":
		log.Println("switch Promotion")
		results := connection.Collection("Promotions").Find(bson.M{})
		promotion := &Promotion{}
		for results.Next(promotion) {
			IDArray = append(IDArray, promotion.ID)
		}
	case "Product":
		log.Println("switch Product")
		results := connection.Collection("Products").Find(bson.M{})
		product := &Product{}
		for results.Next(product) {
			IDArray = append(IDArray, product.ID)
		}
	case "Category":
		log.Println("switch Category")
		results := connection.Collection("Categories").Find(bson.M{})
		category := &Category{}
		for results.Next(category) {
			IDArray = append(IDArray, category.ID)
		}
	case "Beacon":
		log.Println("switch Beacon")
		results := connection.Collection("Beacons").Find(bson.M{})
		beacon := &Beacon{}
		for results.Next(beacon) {
			IDArray = append(IDArray, beacon.ID)
		}
	case "Shelf":
		log.Println("switch Shelf")
		results := connection.Collection("Shelves").Find(bson.M{})
		shelf := &Shelf{}
		for results.Next(shelf) {
			IDArray = append(IDArray, shelf.ID)
		}
	case "Supermarket":
		log.Println("switch Supermarket")
		results := connection.Collection("Supermarkets").Find(bson.M{})
		supermarket := &Supermarket{}
		for results.Next(supermarket) {
			IDArray = append(IDArray, supermarket.ID)
		}
	default:
		log.Println("switch Default")
	}
	for _, s := range IDArray {
		if s > IDMax {
			IDMax = s
		}
	}

	//Le premier ID utilisable est l'ID max trouvé plus 1
	return IDMax + 1
}

//respondWithJSON : fonction permettant d'envoyer une réponse JSON à la requête appelante
func respondWithJSON(w http.ResponseWriter, r *http.Request, code int, payload interface{}) {
	w.Header().Set("Content-Type", "application/json")
	response, err := json.MarshalIndent(payload, "", "  ")

	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		w.Write([]byte("HTTP 500: Internal Server Error"))
		return
	}

	w.WriteHeader(code)
	w.Write(response)
}

//getMyIP : fonction permettant d'obtenir l'IP courante en appelant une API (ipify)
func getMyIP(ipRange string) string {

	//ipRange détermine si l'ip récupérée est l'ip locale ou publique
	if ipRange == "local" {
		var MyIP string
		conn, err := gonet.Dial("udp", "8.8.8.8:80")
		if err != nil {
			log.Fatalln(err)
		} else {
			localAddr := conn.LocalAddr().(*gonet.UDPAddr)
			MyIP = localAddr.IP.String()
		}
		return MyIP
	}

	url := "https://api.ipify.org?format=text"
	log.Printf("Getting IP address from ipify\n")
	resp, err := http.Get(url)
	if err != nil {
		panic(err)
	}
	defer resp.Body.Close()
	MyIP, err := ioutil.ReadAll(resp.Body)
	if err != nil {
		panic(err)
	}
	return string(MyIP)
}

//asSha512 : fonction permettant d'hasher un objet (utilisée pour la création du token d'un client)
func asSha512(o interface{}) string {
	h := sha512.New()
	h.Write([]byte(fmt.Sprintf("%v", o)))

	return fmt.Sprintf("%x", h.Sum(nil))
}

//isTokenValid : fonction permettant de vérifier la validité (=l'existance) d'un token (utilisée pour autorisé les requêtes entrantes)
func isTokenValid(token string) bool {
	var tokens []string
	results := connection.Collection("Clients").Find(bson.M{})
	client := &Client{}
	for results.Next(client) {
		tokens = append(tokens, client.Token)
	}
	if stringInSlice(token, tokens) {
		return true
	}
	return false
}

//stringInSlice : fonction permettant de savoir si une variable de type string est présente dans un tableau de variable du même type
func stringInSlice(a string, list []string) bool {
	for _, b := range list {
		if b == a {
			return true
		}
	}
	return false
}

//intInSlice : fonction permettant de savoir si une variable de type int est présente dans un tableau de variable du même type
func intInSlice(a int, list []int) bool {
	for _, b := range list {
		if b == a {
			return true
		}
	}
	return false
}
