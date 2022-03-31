import React, { Component } from 'react';
import { StyleSheet, Image } from 'react-native';
import { Container, Form, Header, Left, Icon, Right, Body, Text, Content, Picker, H1, Button, Footer, Spinner } from 'native-base';
import { getMarket, getBeacons } from '../../../API/APIRequest';
import AuthContext from '../../../Contexts/AuthContext';
import { BleManager } from 'react-native-ble-plx';
import { requestLocationPermission } from '../../../Helpers/Permission';
import IntroSlider from '../IntroSlider/IntroSlider';
import { COLORS } from '../../../Helpers/colors';
import { CommonActions } from '@react-navigation/native';

export default class CoursesEntry extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isInTheMarket: false,
      isScanOn: false,
      beaconsList: [],
      market: [],
      selected: undefined,
      isLoaded: false,
      helpView: false
    };
    this.manager = new BleManager();
  }

  componentDidMount() {
    this.getMarketList();
  }

  componentWillUnmount() {
    //On arrete le scan quand on quitte le mode course
    this.manager.stopDeviceScan()
  }

  static authContext = AuthContext;

  onValueChange(value) {
    this.setState({
      selected: value
    });
  }


  /**
     * Retoune à l'écran d'accueil avec un reset de route
     *
     * @memberof CoursesEntry
     */
  goToHome() {
    const resetAction = CommonActions.reset({
        index: 1,
        routes: [{ name: 'Home' }]
    });

    this.props.navigation.dispatch(resetAction)
  }

  /**
   * Récupère la liste des magasins
   *
   * @memberof CoursesEntry
   */
  async getMarketList() {
      const response = await getMarket();
      this.setState({ market: response.marketList, isLoaded: true });
  }

  /**
   * Récupère la liste des balises du magasin
   *
   * @returns
   * @memberof CoursesEntry
   */
  async getBeaconsList() {
    let dataToken = { "Token": this.context.authState.userToken };
    let dataMarket = { "Id": parseInt(this.state.selected) };

    const response = await getBeacons(dataToken, dataMarket);

    if (response === null) {
      return false;
    } else {
      this.setState({ beaconsList: response.beaconsList });
      return true;
    }
  }


  /**
   * Cherche la balise d'entré du magasin (balise entry) via un scan BT
   *
   * @memberof CoursesEntry
   */
  async findEntry() {
      // Ce n'est pas un compte test => recherche de la balise d'entrée
      const hasBeacons = await this.getBeaconsList(); //Récupère la liste des balises du magasin
      if (hasBeacons) {
        const entryBeacon = this.state.beaconsList.find(value => value.EntryBeacon);
        if(this.context.authState.isTest){
          // C'est un compte test => pas de recherche de la balise d'entrée
          this.setState({ isInTheMarket: true, isScanOn: false })
        } else {
          // Lance un scan BT
          this.manager.stopDeviceScan();
          if (Platform.OS === 'ios') {
            this.manager.onStateChange((state) => {
              if (state === 'PoweredOn') this.scanBeacons(entryBeacon.MAC)
            })
          } else {
            this.scanBeacons(entryBeacon.MAC)
          }
        }
        
    }
  }

  /**
   * Scan bluetooth qui vérifie que la balise d'entrée est présente autour 
   *
   * @param {*} entryBeaconMAC Id de la balise d'entré
   * @memberof CoursesEntry
   */
  async scanBeacons(entryBeaconMAC) {
    const permission = await requestLocationPermission();

    if (permission) {
      console.log("Start")
      this.setState({ isScanOn: true })
      // Début du scan des beacons BLE
      this.manager.startDeviceScan(null, null, async (error, device) => {
        // Vérification que le scan ne retourne pas une erreur
        if (error) {
          this.setState({ isScanOn: false })
          console.log(error)
          return
        }

        // On teste le device scanner est la balise d'entrée
        if (entryBeaconMAC === device.id) {
          this.setState({ isInTheMarket: true, isScanOn: false  });
          this.manager.stopDeviceScan();
        }
      });
    }
  }

  render() {
    console.log(this.state)
    if (!this.state.helpView) {
      return (
        <Container style={{ flex: 1 }}>
          <Header>
            <Left style={{ flex: 0, marginRight: 10 }}>
              <Button transparent style={styles.helpButton} onPress={() => this.goToHome()}>
                <Icon name="door-open" style={styles.iconStyle} type="FontAwesome5" />
              </Button>
            </Left>
            <Body style={{ flex: 1 }}>
              <Text style={{ color: "white", fontSize: 20 }}>
                Faites vos courses
              </Text>
            </Body>
            <Right style={{ flex: 0 }}>
              <Button transparent style={styles.helpButton} onPress={() => this.setState({helpView: true})}>
                <Icon name="question" style={{fontSize: 28}} type="FontAwesome5"/>
              </Button>
            </Right>
          </Header>
          {this.state.isLoaded ? (
            <Content padder contentContainerStyle={styles.mainContainer}>
              <H1>Choisissez votre magasin</H1>
              <Form>
                <Picker
                  mode="dropdown"
                  placeholder="Choisissez votre magasin"
                  selectedValue={this.state.selected}
                  onValueChange={this.onValueChange.bind(this)}>
                  {Platform.OS === 'android' &&
                    <Picker label="Choisissez votre magasin" value={null} />}
                  {this.state.market.map(element =>
                    <Picker.Item label={element.Sign} value={element.ID} />
                  )}
                </Picker>
              </Form>
              <Button style={styles.marketButton} onPress={() => this.findEntry()}>
                <Text>
                  Je suis dans le magasin
              </Text>
              </Button>
              <Container style={{ flex: 1 }}>

                {this.state.isScanOn ?
                  <Container style={{justifyContent:"center", alignItems: "center"}}>
                    <Spinner/>
                    <Text>
                      Vérification
                    </Text>
                  </Container>
                  :
                  (this.state.isInTheMarket ?
                    <Container style={styles.valideScan}>
                      <Icon type="FontAwesome5" name="check" style={{ color: 'green', fontSize: 100 }} />
                      <Text >
                          Vous êtes bien dans le magasin.
                      </Text>
                    </Container>
                    :
                    null
                  )
                }

              </Container>
              {this.state.isInTheMarket ?
                <Button rounded style={styles.goButton}
                  onPress={() => this.props.navigation.navigate('Stack Courses', { beaconsList: this.state.beaconsList })}>
                  <Text>
                    C'est parti !
              </Text>
                </Button>
                :
                null
              }
            </Content>)
            :
            <Spinner />
          }
        </Container>)
    } else {
      return (
        <IntroSlider finishedIntro={() => this.setState({helpView: false})} skippedIntro={() => this.setState({helpView: false})} />)
    }
  }
}

CoursesEntry.contextType = AuthContext;

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  iconStyle: {
    color: "white",
    fontSize: 25
  },
  goButton: {
    alignSelf: "flex-end",
    paddingHorizontal: 5
  },
  valideScan: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  marketButton: {
    paddingHorizontal: 5,
    alignSelf: "center"
  },
  helpButton: {
    marginRight: 5
  }
});