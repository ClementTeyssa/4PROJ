export var productData = [
    {
        ID:1,
        name:"Lait demi-écrémé 1L",
        price:"0.86",
        brand:"SupMarket",
        overview:"Une bouteille de lait demi-écrémé 1L.",
        category:"Laitages"
    },
    {
        ID:2,
        name:"Conserve maïs",
        price:"100.50",
        brand:"SupMarket",
        overview:"Boite de conserve 500g de Mäis SupMarket.",
        category:"Légumes"
    },
    {
        ID:3,
        name:"Tablette de chocolat",
        price:"1.5",
        brand:"SupMarket",
        overview:"Une tablette de chocolat SupMarket.",
        category:"Confiseries"
    },
    {
        ID:4,
        name:"Baguette de pain blanc",
        price:"0.95",
        brand:"SupMarket",
        overview:"..",
        category:"Céréales"
    },
    {
        ID:5,
        name:"Sachet de carottes",
        price:"2.70",
        brand:"SupMarket",
        overview:"Un sachet de carottes de 1 kg.",
        category:"Légumes"
    },
    {
        ID:6,
        name:"Crèmes 50cl",
        price:"3",
        brand:"SupMarket",
        overview:"Un bouteille de crème.",
        category:"Laitages"
    }
]

export var productData2 = [
    {
        ID:7,
        name:"Yaourt nature",
        price:"1.5",
        brand:"SupMarket",
        overview:"6 pots de yaourt nature.",
        category:"Laitages"
    },
    {
        ID:8,
        name:"Conserve de haricots",
        price:"0.98",
        brand:"SupMarket",
        overview:"Boite de conserve 500g de haricots SupMarket.",
        category:"Légumes"
    },
    {
        ID:9,
        name:"Tablette de chocolat blanc",
        price:"1.5",
        brand:"SupMarket",
        overview:"Une tablette de chocolat blanc SupMarket.",
        category:"Confiseries"
    },
    {
        ID:10,
        name:"Pain de mie",
        price:"1.30",
        brand:"SupMarket",
        overview:"..",
        category:"Céréales"
    },
    {
        ID:11,
        name:"1kg de pommes de terre",
        price:"2.70",
        brand:"SupMarket",
        overview:"Un sachet de pommes de terre d'un kg.",
        category:"Légumes"
    },
    {
        ID:12,
        name:"Crèmes 50cl",
        price:"3",
        brand:"SupMarket",
        overview:"Un bouteille de crème.",
        category:"Laitages"
    }
]

export var productRecommended = [
    {
        ID:1,
        name:"Lait demi-écrémé 1L",
        price:"0.86",
        brand:"SupMarket",
        overview:"Une bouteille de lait demi-écrémé 1L.",
        category:"Laitages"
    },
    {
        ID:2,
        name:"Conserve maïs",
        price:"100.50",
        brand:"SupMarket",
        overview:"Boite de conserve 500g de Mäis SupMarket.",
        category:"Légumes"
    },
    {
        ID:3,
        name:"Tablette de chocolat",
        price:"1.5",
        brand:"SupMarket",
        overview:"Une tablette de chocolat SupMarket.",
        category:"Confiseries"
    },
    {
        ID:4,
        name:"Baguette de pain blanc",
        price:"0.95",
        brand:"SupMarket",
        overview:"..",
        category:"Céréales"
    },
    {
        ID:5,
        name:"Sachet de carottes",
        price:"2.70",
        brand:"SupMarket",
        overview:"Un sachet de carottes de 1 kg.",
        category:"Légumes"
    },
    {
        ID:6,
        name:"Crèmes 50cl",
        price:"3",
        brand:"SupMarket",
        overview:"Un bouteille de crème.",
        category:"Laitages"
    }
]

export var oldPurchase = [
    {
        ID: 1,
        name: "ZI4J42PO",
        date: "12/05/2020",
        time: "14:30",
        shop: "SupMarket Strasbourg",
        amount: 60
    },
    {
        ID: 2,
        name: "FI02DPK3",
        date: "14/05/2020",
        time: "10:30",
        shop: "SupMarket Strasbourg",
        amount: 23.30
    }
]

export var purchase1 = {
    ID: 2,
    name: "FI02DPK3",
    date: "14/05/2020",
    time: "10:30",
    shop: "SupMarket Strasbourg",
    amount: 23.30,
    articles: [
        {
            ID:5,
            name: "Sachet de carottes",
            price: 2.70,
            number: 3 
        },{
            ID:3,
            name:"Tablette de chocolat",
            price:"1.5",
            number: 2 
        },
        {
            ID:1,
            name: "Lait demi-écrémé 1L",
            price: "0.86",
            number: 6 
        },
        {
            ID:1,
            name: "Lait demi-écrémé 1L",
            price: "0.86",
            number: 6 
        },
        {
            ID:1,
            name: "Lait demi-écrémé 1L",
            price: "0.86",
            number: 6 
        }
        
    ]
}

export var myStore ={
    name: "SupMarket Grand'Rue",
    coordinate:{
        latitude: 48.582478,
        longitude: 7.740328
    }
}

export var beaconsList = ['4a99645a-6d43-497d-80d2-91058cf957a0', '6391cbf6-9f30-11ea-bb37-0242ac130002'];

export var beaconsMacList = ['4C:87:5D:13:BD:E8','41:42:EB:64:CB:24'];