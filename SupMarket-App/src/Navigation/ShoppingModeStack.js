import React, { Component } from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import ShoppingModeTabNavigator from './ShoppingModeTabNavigator';
import ArticleDetail from '../Components/Dummy/ShoppingMode/ArticleDetail';
import { ArticleController, ArticleContext } from '../Contexts/ArticleController';
import SummaryPayement from '../Components/Smart/ShoppingMode/SummaryPayement';
import { BleManager } from 'react-native-ble-plx';
import { requestLocationPermission } from '../Helpers/Permission';
import AuthContext from '../Contexts/AuthContext';
import { BeaconContext } from '../Contexts/BeaconController';
import { getShelfProducts } from '../API/APIRequest';
import SuccessTransactionScreen from '../Components/Smart/ShoppingMode/SuccessTransactionScreen';

const ShoppingModeStackNavigator = createStackNavigator();

export default class ShoppingModeStack extends Component {
  constructor(props) {
    super(props);
    this.state = {
      beacon: {
        info: undefined,
        articles: undefined,
        beaconsList: []
      },
      beaconsList: this.props.route.params.beaconsList,
    };
    this.manager = new BleManager();
  }

  static authContext = AuthContext;

  /**
   * Charge la première balise pour le compte de test sinon lance le scan des balises du magasin
   *
   * @memberof ShoppingModeStack
   */
  async componentDidMount() {
    if (this.context.authState.isTest) {
      const entryBeacon = this.state.beaconsList.find(value => value.EntryBeacon);
      this.setState({
        beacon: {
          beaconsList: this.props.route.params.beaconsList,
          articles: await getShelfProducts(this.context.authState.userToken, entryBeacon.ID),
          info: {
            id: entryBeacon.ID,
            mac: entryBeacon.mac,
            name: entryBeacon.name
          }
        }
      });
    } else {
      if (Platform.OS === 'ios') {
        this.manager.onStateChange((state) => {
          if (state === 'PoweredOn') this.scanBeacons(this.state.beaconsList)
        })
      } else {
        this.scanBeacons(this.state.beaconsList)
      }
    }
  }

  componentWillUnmount() {
    console.log("Stop")
    //On arrete le scan quand on quitte le mode course
    this.manager.stopDeviceScan()
  }


  /**
   * Scan les balises de la liste et cherche les produits contenue dans chaque rayon associe à la balise
   *
   * @param {*} beaconsList
   * @memberof ShoppingModeStack
   */
  async scanBeacons(beaconsList) {
    const permission = requestLocationPermission();

    if (permission) {
      console.log("Start")
      // Début du scan des beacons BLE
      this.manager.startDeviceScan(null, null, async (error, device) => {

        // Vérification que le scan ne retourne pas une erreur
        if (error) {
          console.log("ERROR !")
          return
        }

        if (beaconsList.find(element => element.MAC == device.id)) {
          console.log("SCAN: " + device.id + " RSSI : " + device.rssi)
          const beacon = beaconsList.find(element => element.MAC == device.id);
          console.log(beacon)
          // Si pas de balise déjà scanner, on l'ajoute dans le state de la balise
          if (this.state.beacon.info === undefined) {
            this.setState({
              beacon: {
                articles: await getShelfProducts(this.context.authState.userToken, beacon.ID),
                info: {
                  id: beacon.ID,
                  mac: device.id,
                  name: beacon.Name,
                  rssi: device.rssi
                }
              }
            });
          } else if (device.id == this.state.beacon.info.mac) {
            // Si la est déjà la balise du state alors on met à jour son RSSI
            this.setState(prevState => ({
              beacon: {
                ...prevState.beacon,
                info: {
                  id: beacon.ID,
                  mac: device.id,
                  name: beacon.Name,
                  rssi: device.rssi
                }
              }
            }));
            console.log('UPD RSSI:' + this.state.beacon.info.id)
          } else if (device.rssi > this.state.beacon.info.rssi) {
            // Si une autre balise un rssi (int toujours négatif) plus grand alors remplace la balise du state
            this.setState({
              beacon: {
                articles: await getShelfProducts(this.context.authState.userToken, beacon.ID),
                info: {
                  id: beacon.ID,
                  mac: device.id,
                  name: beacon.Name,
                  rssi: device.rssi
                }
              }
            });
            console.log('New :' + this.state.beacon.info.id);
          }
        }
      });
    }
  }


  /**
   * Pour les comptes tests
   * Change la balise du state
   *
   * @memberof ShoppingModeStack
   */
  changeBeacon = async (beaconId) => {
    this.setState({
      beacon: {
        beaconsList: this.props.route.params.beaconsList,
        articles: await getShelfProducts(this.context.authState.userToken, beaconId),
        info: {
          id: beaconId
        }
      }
    });
  }

  render() {
    return (
      <BeaconContext.Provider value={this.state.beacon}>
        <ArticleController>
          <ShoppingModeStackNavigator.Navigator
            headerMode={false}>
            <ShoppingModeStackNavigator.Screen
              name="Mode Course">
              {props => <ShoppingModeTabNavigator {...props} changeShelf={this.changeBeacon} />}
            </ShoppingModeStackNavigator.Screen>
            <ShoppingModeStackNavigator.Screen
              name="Detail Article"
              component={ArticleDetail} />
            <ShoppingModeStackNavigator.Screen
              name="Recapitulatif Paiement"
              component={SummaryPayement} />
            <ShoppingModeStackNavigator.Screen
              name="Transaction valide"
              component={SuccessTransactionScreen} />
          </ShoppingModeStackNavigator.Navigator>
        </ArticleController>
      </BeaconContext.Provider>
    );
  }
}

ShoppingModeStack.contextType = AuthContext;