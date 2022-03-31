# 4PROJ_API
API go pour 4PROJ. Cette API permet d'effectuer des intéractions avec la base de données MongoDB.

# go-bongo
Cette API utilise l'ODM _"Bongo"_ qui permet de simplifier l'utilisation de _mgo_ et les intéractions avec _MongoDB_

Description de _Bongo_ : "We couldn't find a good ODM for MongoDB written in Go, so we made one. Bongo is a wrapper for mgo (https://github.com/go-mgo/mgo) that adds ODM, hooks, validation, and cascade support to its raw Mongo functions."

_Bongo_ est disponible sur GitHub (https://github.com/go-bongo/bongo) et est donc libre d'utilisation

# main.go
Pour utiliser l'api, il faut la build puis l'exécuter. Une fois exécutée elle écoutera sur l'IP locale et le port 8080 (modifiable), et sera en attente d'une requête à traiter.

Les routes suivantes existes :

```go
//routes "globales" (applicables à tous les types d'objets)
xxx.xxx.x.xx:8080/insert
xxx.xxx.x.xx:8080/update
xxx.xxx.x.xx:8080/delete
xxx.xxx.x.xx:8080/find

//routes "ciblées" (spécifiques à certains types d'objets)
xxx.xxx.x.xx:8080/register
xxx.xxx.x.xx:8080/login
xxx.xxx.x.xx:8080/transactions
xxx.xxx.x.xx:8080/transactionDetails
xxx.xxx.x.xx:8080/beacons
xxx.xxx.x.xx:8080/products
xxx.xxx.x.xx:8080/changeAdmin
xxx.xxx.x.xx:8080/isAdmin
xxx.xxx.x.xx:8080/getClients
xxx.xxx.x.xx:8080/recommandations
```

Les routes dites _globales_ permettent d'effetuer les opérations de base pour MongoDB.

# Les structs

Les structs suivantes existent, elles sont modifiables et il est possible d'en rajouter si nécessaire.

```go
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
	ProductID          int     `json:"Products"`
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
```

# Usage

## Routes globales

Toutes les routes _globales_ s'utilisent de la même manière.

Les données à enregistrer en bdd ou à utiliser pour récupérer des objets de la bdd sont à fournir en json.

Il est nécessaire de fournir une variable **ObjectType** qui définira le type de l'objet et un **Token** valide (token d'un client).

Ainsi que **les données de l'objet**

**L'ID est défini automatiquement lors de l'insertion d'un objet**

```json
{
	"ObjectType": "Client",
	"Token": "..."
}
{
	"Username": "Axel",
	"PwHash": "...",
	"IsAdmin": true,
	"Firstname": "Axel",
	"Lastname": "Kimmel"
}
```

Pour les opérations de _deletion (/delete)_ et _récuperation (/find)_ **fournir l'ID de l'objet suffit**.

Pour l'opération de récupération et il est possible de récupérer **tous les objets d'une collection en donnant -1 pour ID**.

```json
{
	"ObjectType": "Client",
	"Token": "..."
}
{
	"ID": -1
}
```

## Routes ciblées

### Register

Pour le _register (/register)_, il est nécessaire de fournir uniquement les infos du compte client à l'exception de l'ID et du Token qui seront générés automatiquement.

**Ici, ObjectType n'est pas nécessaire**

```json
{
	"Username": "axel",
	"PwHash": "password",
	"IsAdmin": true,
	"FirstName": "Axel",
	"LastName": "Kimmel"
}
```

### Login

Pour le _login (/login)_, il est nécessaire de fournir uniquement le username et le hash du password (PwHash), si la combinaison est correcte, le token du client sera retourné.

```json
{
	"Username": "axel",
	"PwHash": "password"
}
```

### Transactions

Les _transactions (/transactions)_ sont récupérables en fournissant uniquement le token du client concerné.


```json
{
	"Token": "..."
}
```

### Détails d'une transaction

Les _détails d'une transactions (la transaction et les items qui la composent) (/transactionDetails)_ peuvent être obtenus en fournissant le token du client ainsi que l'ID d'une transaction. Il est possible de passer **-1 en ID pour obtenir la dernière transaction effectuée**

```json
{
	"Token": "..."
}
{
	"ID": 1
}
```

### Balises

Les _beacons (/beacons)_ d'un magasin sont récupérables en fournissant un token valide et l'id du magasin. **A noter que la balise d'entrée est identifié par le champ _EntryBeacon_ à _true_**.

```json
{
	"Token": "..."
}
{
	"ID": 1
}
```

### Rayons

Il est possible d'obtenir les _products (/products)_ présents sur un rayon en fournissant un token valide ainsi que **l'id de la balise rattachées au rayon**.

```json
{
	"Token": "..."
}
{
	"ID": 1
}
```

### Changement Admin

Il est possible de changer le statut _IsAdmin (/changeAdmin)_ d'un compte en fournissant le token du compte. **A noter que le changement peut se faire dans les deux sens _true->false et false->true_**.

```json
{
	"Token": "..."
}
```

### Is Admin

Il est possible d'obtenir le statut _IsAdmin (/changeAdmin)_ d'un compte en fournissant le token du compte.

```json
{
	"Token": "..."
}
```

### Get Clients

Il est possible d'obtenir les informations des différents clients _(/getClients)_ en fournissant un token valide. Ici, c'est un tableau des Clients qui est retourné.

```json
{
	"Token": "..."
}
```

### Get Beacons

Il est possible d'obtenir les informations des différentes balises _(/getBeacons)_ en fournissant un token valide. Ici, c'est un tableau des Balises qui est retourné.

```json
{
	"Token": "..."
}
```

### Recommandations
Il est possible d'obtenir des _recommandations (/recommandations)_ pour un client en fournissant son token. Les recommandations sont basées sur les transactions passées d'un client ainsi que des promotions actuelles.

```json
{
	"Token": "..."
}
```