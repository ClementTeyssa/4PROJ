# 4PJT-MobileApp 
> Application mobile pour le projet de 4eme année en React Native 

![alt text](http://295114-293042-292621-4pjt.tk:3000/Robin/SupMarket-App/blob/master/src/Assets/ic_logo_SupMarket_slogan.png)

## Sommaire

 - [Information](#information)
 - [Prérequis](#prérequis)
 - [Installation](#installation)
 - [Scan Bluetooth](#scan-bluetooth)
 - [Tech](#tech)

## Information

Le développement de cette application a été faite en React-Native enfin de pouvoir toucher un plus large public (IOS/Android) et simplifier le développement cross-platform.

L'application consiste à faire ses courses dans le magasin via son smartphone. L'utilisateur pourra voir les produits de chaque rayon sur son smartphone, grâce à un scan qui détecte les rayons, puis il pourra les ajouter à son Smartpanier. Une fois ses courses finies, il pourra payer en ligne.

Un apk pour android est disponible "supmarket.apk", il faut le transférer sur un smartphone et lancer l'installation.
Une fois l'apk installé, il vous sera possible de tester l'application. Un compte de teste est disponible pour tester l'application sans être bloqué par le scan des rayons. Les scans bluetooth seront désactivés pour le compte teste, les rayons pourront être choisis manuellement. 

Compte teste - Id: apptest@apptest.fr, Mdp: apptest4 

## Prérequis

Il est nécessaire de suivre les étapes d'installation de [React Native Environement Setup 'CLI Quickstart'] suivant votre environnement et votre cible d'OS.

## Installation

Clonez le repertoire du git
```sh
$ git clone https://github.com/Robin-Pierrat/4PJT-MobileApp.git
```

Installez toutes les dependences du projet 
```sh
$ cd \4PJT-MobileApp
$ npm install
```

### Lancer l'application sur un émulateur ou smartphone Android

Spécifiez dans le dossier android le chemin du SDK dans un fichier local.properties  
```sh
$ cd android
$ touch local.properties
```
```
#/android/local.properties

sdk.dir=C\:\\Users\\Robin\\AppData\\Local\\Android\\Sdk
```

Nettoyez le compilateur android *gradle*
```sh
$ ./gradlew clean
```

**Attention, le smartphone doit être en mode développeur avec le débogage USB actif et branché en transfert de fichier**

Utilisez *adb* pour voir et récupérer les id des émulateurs/smartphone connectés
```sh
$ adb device
```

Lancez l'application sur le smartphone
```sh
$ react-native run-android --deviceId=XXXXXXXXXXXX
```

### Créer le bundle Android #

Générez une clé avec l'outil **keytool** (Pour Windows dans *C:\Program Files\Java\jdkx.x.x_x\bin*)
_Vous allez devoir entrer plusieurs informations !!! A retenir !!!_
```sh
$ keytool -genkey -v -keystore VOTRE_CHEMIN\supmarket-key.keystore -alias supmarket-key-alias -keyalg RSA -keysize 2048 -validity 10000
```

Récupérez le fichier crée à l'endroit où vous avez choisi et le déplacer dans l'application à ./android/app

Dans android/gradle.properties, ajoutez les lignes suivante en remplacant par vos informations:
```
MYAPP_RELEASE_STORE_FILE=supmarket-key.keystore
MYAPP_RELEASE_KEY_ALIAS=supmarket-key-alias
MYAPP_RELEASE_STORE_PASSWORD=*****
MYAPP_RELEASE_KEY_PASSWORD=*****
```

Modifiez android/app/build.gradle avec les nouvelles valeurs de la release
```
# android/app/build.gradle
...
android {
    ...
    defaultConfig { ... }
    signingConfigs {
        release {
            if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
                storeFile file(MYAPP_RELEASE_STORE_FILE)
                storePassword MYAPP_RELEASE_STORE_PASSWORD
                keyAlias MYAPP_RELEASE_KEY_ALIAS
                keyPassword MYAPP_RELEASE_KEY_PASSWORD
            }
        }
    }
    buildTypes {
        release {
            ...
            signingConfig signingConfigs.release
        }
    }
}
...
```

Puis lancez le build de l'apk, qui se trouvera dans le dossier /android/app/build/outputs/apk/

```sh
$ cd android && ./gradlew assembleRelease
```

Voir ./gradlew bundleRealase pour un apk sans warning (Nessecite de transformer le .aab en .apk cf. bundletool)

### Lancer l'application sur un simulateur/smartphone Android 

**!SOON!**

### Créer le bundle IOS

**!SOON!**


## Scan Bluetooth

L'aplication utilise la technologie bluetooth pour scanner le magasin à la recherche de balises (des rayons).

Lors du début des courses, un utilisateur doit choisir le magasin où il est présent. Une requête vers l'API va alors récupérer les informations des balises. 
- Un premier scan va alors rechercher la balise d'entrée du magasin. Si il a trouvé la balise dans son scan, l'utilisateur peut alors commencer ses courses.
- Un nouveau scan se lance pour recupérer la balise la plus proche de lui (rayons), ce qui actualisera la liste des produits disponibles par rapport à la balise où il est présent, il pourra ainsi ajouter les produits qu'il a devant lui dans son Smartpanier.

*Smartpanier : Système de courses sur l'application SupMarket permettant d'ajouter les artciles de son panier physique dans un panier vituel de façon à effectuer un paiement en ligne sans passer en caisse.

## Tech
SupMarket utilise plusieurs projets open source 

* [Node] - Node.js JavaScript runtime.
* [React Native] - A framework for building native apps with React.
* [React Native BLE PLX] - React Native Bluetooth Low Energy library.
* [Native Base] - Essential cross-platform UI components for React Native.
* [React Native App Intro Slider] - An easy-to-use yet very configurable app introduction slider/swiper.


[Node]: <https://nodejs.org>
[React Native]: <https://reactnative.dev>
[React Native BLE PLX]: <https://github.com/Polidea/react-native-ble-plx>
[Native Base]: <https://nativebase.io>
[React Native Environement Setup 'CLI Quickstart']: <https://reactnative.dev/docs/environment-setup>
[React Native App Intro Slider]: <https://github.com/Jacse/react-native-app-intro-slider>
