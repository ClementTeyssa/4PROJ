import { JSHash, JSHmac, CONSTANTS } from "react-native-hash";

const findRequestUrl = "https://api.295114-293042-292621-4pjt.tk/find";
const registerRequestUrl = "https://api.295114-293042-292621-4pjt.tk/register";
const loginRequestUrl = "https://api.295114-293042-292621-4pjt.tk/login";
const beaconsRequestUrl = "https://api.295114-293042-292621-4pjt.tk/beacons";
const productsRequestUrl = "https://api.295114-293042-292621-4pjt.tk/products";
const insertRequestUrl = "https://api.295114-293042-292621-4pjt.tk/insert";
const transactionsRequestUrl = "https://api.295114-293042-292621-4pjt.tk/transactions";
const transactionDetailsRequestUrl = "https://api.295114-293042-292621-4pjt.tk/transactionDetails";
const recommandationRequestUrl = "https://api.295114-293042-292621-4pjt.tk/recommandations";

/**
 * Fonction de récupération des objects de la BDD suivant le type et des données de selection
 *
 * @export
 * @param {*} objectType type de l'bject de la bdd à récupérer
 * @param {*} data donnée à envoyer
 * @returns
 */
export function getObjectFromAPI(objectType, data) {
    const objType = { "ObjectType": objectType };

    const options = {
        method: "POST",
        body: JSON.stringify(objType) + JSON.stringify(data)
    }
    return fetch(findRequestUrl, options)
        .then(response => { return response.json() })
        .then((blob) => console.log(blob))
        .catch((error) => console.log(error));
}

/**
 * Fonction pour enregistrer un nouveau client 
 *
 * @export
 * @param {*} registerData donnée de l'inscription
 * @returns
 */
export async function registerFromAPI(registerData) {
    registerData.PwHash = await JSHash(registerData.PwHash, CONSTANTS.HashAlgorithms.sha256)
                                    .then(hash => hash)
                                    .catch(e => console.log(e));

    const options = {
        method: "POST",
        body: JSON.stringify(registerData)
    }

    return fetch(registerRequestUrl, options)
        .then(response => response.json())
        .catch((error) => console.log(error)); 
}

/**
 * Fonction pour connecter le client
 *
 * @export
 * @param {*} loginData donnée pour la connexion
 * @returns
 */
export async function loginFromAPI(loginData) {
    loginData.PwHash = await JSHash(loginData.PwHash, CONSTANTS.HashAlgorithms.sha256)
                            .then(hash => hash)
                            .catch(e => console.log(e));
    console.log(loginData)
    const options = {
        method: "POST",
        body: JSON.stringify(loginData)
    }

    return fetch(loginRequestUrl, options)
        .then(response => response.json())
        .catch((error) => console.log(error));
}

/**
 * Récupère tous les beacons d'un supermarché
 *
 * @export
 * @param {*} dataToken 
 * @param {*} dataMarket
 * @returns
 */
export function getBeacons(dataToken, dataMarket) {
    const options = {
        method: "POST",
        body: JSON.stringify(dataToken) + JSON.stringify(dataMarket)
    }

    return fetch(beaconsRequestUrl, options)
        .then(response => response.text())
        .then(data => {
            //Si on a un retour de l'application, on parse le JSON
            if (data.length > 0) {
                const beaconsList = {
                    "beaconsList": []
                };

                data.split(/(?={)/g).forEach(element => {
                    beaconsList.beaconsList.push(JSON.parse(element));
                });

                return beaconsList;
            } else {
                return null;
            }
        })
        .catch((error) => console.log(error));
}

/**
 * Récupère la liste des Supermarchés
 *
 * @export
 * @param {*} dataToken 
 * @returns
 */
export function getMarket() {
    const objType = { "ObjectType": "Supermarket" };
    const data = { "ID": -1 };

    const options = {
        method: "POST",
        body: JSON.stringify(objType) + JSON.stringify(data)
    };

    return fetch(findRequestUrl, options)
        .then(response => response.text())
        .then(data => {
            const marketList = {
                "marketList": []
            };
            data.split(/(?={)/g).forEach(element => {
                marketList.marketList.push(JSON.parse(element))
            });

            return marketList
        })
        .catch((error) => console.log(error));
}


/**
 * Récupère les produits d'un rayon
 *
 * @export
 * @param {*} dataToken
 * @param {*} dataID
 * @returns
 */
export async function getShelfProducts(token, shelfID) {
    const tokendata = { "Token": token };
    const shelfData = { "ID": shelfID };

    const options = {
        method: "POST",
        body: JSON.stringify(tokendata) + JSON.stringify(shelfData)
    }

    const products = await fetch(productsRequestUrl, options)
                        .then(response => response.text())
                        .then(data => {
                            const productsList = [];

                            data.split(/(?={)/g).forEach(element => {
                                productsList.push(JSON.parse(element))
                            });

                        return productsList
                        })
                        .catch((error) => console.log(error));

    if(products){
        for(let i=0; i < products.length; i++){
            const productInfo = await getProduct(products[i].ID, true);
            products[i].Name = productInfo.Name;
            products[i].Brand = productInfo.Brand;
            products[i].Category = productInfo.Category;
            products[i].Overview = productInfo.Overview
        };
        
        return products;
    } else {
        return
    }
}

/**
 * Post une nouvelle transaction
 *
 * @export
 * @param {*} token d'un client
 * @param {*} itemsID IDs des items de la transaction
 * @returns
 */
export function postTransaction(token, itemsID, amount) {
    const transactionData = {
        "Token": token,
        "ItemsId": itemsID,
        "RealDate": new Date(),
        "Amount": amount
    };

    const objType = { "ObjectType": "Transaction" };

    const options = {
        method: "POST",
        body: JSON.stringify(objType) + JSON.stringify(transactionData)
    }

    return fetch(insertRequestUrl, options)
        .then(response => response.status)
        .then(status => status == 200)
        .catch(error => { console.log(error); return false });
}


/**
 * Récupère toutes les transactions d'un client
 *
 * @export
 * @param {*} token d'un client
 * @returns
 */
export async function getAllTransaction(token) {
    const data = { "Token": token };

    const options = {
        method: "POST",
        body: JSON.stringify(data)
    }

    return fetch(transactionsRequestUrl, options)
        .then(response => response.text())
        .then(data => {
            const transactionsList = [];

            data.split(/(?={)/g).forEach(element => {
                transactionsList.push(JSON.parse(element))
            });

            return transactionsList;
        })
        .catch(error => console.log(error));
}


/**
 * Récupère le détail d'une transaction
 *
 * @export
 * @param {*} token d'un client
 * @param {*} id de la transaction
 * @returns
 */
export async function getTransaction(token, id) {
    const transactionID = { "Id": id };
    const data = { "Token": token };

    const options = {
        method: "POST",
        body: JSON.stringify(data) + JSON.stringify(transactionID)
    }

    var transaction =  await fetch(transactionDetailsRequestUrl, options)
                            .then(response => response.text())
                            .then(data => {
                                const itemList = [];

                                data.split(/(?={)/g).forEach(element => {
                                    itemList.push(JSON.parse(element))
                                });

                                return itemList;
                            })
                            .catch(error => console.log(error));

    for (let i = 1; i < transaction.length; i++) {
        const productInfo = await getProduct(transaction[i].ID, false);
        transaction[i].Name = productInfo.Name;
        transaction[i].Brand = productInfo.Brand;
    };

    return transaction;
}

/**
 * Récupère les infos d'un produit
 *
 * @export
 * @param {*} id du produit
 * @param {*} bCategory pour récupèrer la category
 * @returns
 */
export async function getProduct(id,bCategory) {
    const productType = { "ObjectType": "Product" };
    const dataID = { "ID": id };

    const options = {
        method: "POST",
        body: JSON.stringify(productType) + JSON.stringify(dataID)
    }

    const product = await fetch(findRequestUrl, options)
        .then(response => response.text())
        .then(data => JSON.parse(data))
        .catch(error => console.log(error));

        console.log(productAllInfo)
    var productAllInfo = {
        Name: product.Name,
        Brand: product.Brand,
        Category: bCategory ? await getCategoryName(product.CategoryID) : undefined,
        Overview: product.Description
    };

    return productAllInfo;
}

/**
 * Récupère les infos d'une catégorie
 *
 * @export
 * @param {*} id de la catégorie
 * @returns
 */
export async function getCategoryName(id) {
    const objType = { "ObjectType": "Category" };
    const dataID = { "ID": id };

    const options = {
        method: "POST",
        body: JSON.stringify(objType) + JSON.stringify(dataID)
    }

    return fetch(findRequestUrl, options)
        .then(response => response.text())
        .then(data => JSON.parse(data).Name)
        .catch(error => console.log(error));
}

export async function getUserRecommentations(userToken){
    const data = { "Token": userToken };

    const options = {
        method: "POST",
        body: JSON.stringify(data) 
    }

    var productRecommended = await fetch(recommandationRequestUrl, options)
                                .then(response => response.text())
                                .then(data => JSON.parse(data))
                                .catch(error => console.log(error));

    console.log(productRecommended)
    for (let i = 0; i < productRecommended.length; i++) {
            const productInfo = await getProduct(productRecommended[i].ProductID, true);
            console.log(productInfo)
            productRecommended[i].Name = productInfo.Name;
            productRecommended[i].Brand = productInfo.Brand;
            productRecommended[i].Overview = productInfo.Overview;
            productRecommended[i].Category = productInfo.Category;

        };

    return productRecommended;
}