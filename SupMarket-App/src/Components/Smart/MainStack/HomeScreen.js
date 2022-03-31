import React, { Component } from 'react';
import { StyleSheet, FlatList, Image } from 'react-native';
import { Header, Left, Icon, Container, Body, Text, Button, Content, Card, CardItem, ListItem, Right, Root, Form } from 'native-base';
import { COLORS } from '../../../Helpers/colors';
import MapView, { PROVIDER_GOOGLE, Marker } from 'react-native-maps';
import { purchase1, myStore } from '../../../Helpers/ProductData';
import { getTransaction } from '../../../API/APIRequest';
import AuthContext from '../../../Contexts/AuthContext';
import { getDate, getTime, getListItem } from '../../../Helpers/Tool';

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {

    };
  }

  static authContext = AuthContext;

  /**
   * Récupère la dernière transaction du client
   *
   * @memberof HomeScreen
   */
  async componentWillMount(){
    const transaction = await getTransaction(this.context.authState.userToken,-1);
    console.log(transaction)
    if(transaction != undefined && transaction[0].ID != -1){
      this.setState({
        lastTransaction: {
          info: transaction.shift(),
          items: transaction
        }
      })
    }
  }


  /**
   * 
   *
   * @memberof HomeScreen
   */
  _displayShoppingDetail = (id) => {
    this.props.navigation.navigate("Detail Liste", id)
  }

  render() {
    return (
      <Container style={{ backgroundColor: COLORS.secondary }}>
        <Header>
          <Left style={{ flex: 1 }}>
            <Button transparent onPress={this.props.navigation.openDrawer}>
              <Icon name="menu" style={styles.menuIcon}/>
            </Button>
          </Left>
          <Body style={{ flex: 1, justifyContent: 'center' }}>
            <Image
              style={styles.headerLogo}
              source={require('../../../Assets/ic_SupMarket.png')} />          
          </Body>
          <Right  style={{ flex: 1}}>
            <Button onPress={() => this.props.navigation.navigate('Entrée courses')}>
              <Icon name="cart-arrow-down" type="FontAwesome5" style={styles.shoppingModeIcon} />
            </Button>
          </Right>
        </Header>
        <Container style={styles.mapContainer} >
        <Text style={{ color: COLORS.primary, marginHorizontal: 10, fontSize: 30, alignSelf: 'center' }}>Bienvenue {this.context.authState.firstName} {this.context.authState.lastName}</Text>

          <Card style={styles.cardStyle} key="mapCard">
            <CardItem header>
              <Left style={{ flex: 0 }}>
                <Icon name="store" type="FontAwesome5" style={{ color: COLORS.primary }} />
              </Left>
              <Body style={{ marginLeft: 10 }}>
                <Text style={styles.cardHeaderTitle}>Votre magasin</Text>
              </Body>
            </CardItem>
            <CardItem body style={{ flex: 1 }}>
              <MapView
                borderRadius={10}
                provider={PROVIDER_GOOGLE} // remove if not using Google Maps
                showsPointsOfInterest={false}
                showsBuildings={false}
                style={styles.map}
                region={{
                  latitude: myStore.coordinate.latitude,
                  longitude: myStore.coordinate.longitude,
                  latitudeDelta: 0.002,
                  longitudeDelta: 0.002,
                }}>
                <Marker
                  title={myStore.name}
                  coordinate={myStore.coordinate} />
              </MapView>
            </CardItem>
          </Card>
        </Container>
        <Container style={styles.lastShoppingContainer}>
        { this.state.lastTransaction != undefined ?
          <Card style={styles.cardStyle} key="listCard" onPress={() => this._displayShoppingDetail(item.id)}>
            
            <CardItem header>
              <Left style={{ flex: 0 }}>
                <Icon name="receipt" type="FontAwesome5" style={{ color: COLORS.primary }} />
              </Left>
              <Body style={{ marginLeft: 10 }}>
                <Text style={styles.cardHeaderTitle}>Votre dernier Smartpanier</Text>
                <Text note>Le {getDate(this.state.lastTransaction.info.RealDate)} à {getTime(this.state.lastTransaction.info.RealDate)} au {purchase1.shop}</Text>
              </Body>
            </CardItem>
            <CardItem body style={{flex: 1}}>
              <FlatList
                data={getListItem(this.state.lastTransaction.items)}
                style={{flex: 1}}
                keyExtractor={(item) => item.ID.toString()}
                renderItem={({ item }) => (
                  <ListItem>
                    <Text style={{color: COLORS.primary,}}>{item.number}x</Text>
                    <Text style={{flex: 1}}> {item.Name}</Text>
                    <Text style={{color: COLORS.primary}}>{item.Price}€</Text>
                  </ListItem>
                )} />
            </CardItem>
            <CardItem footer>
              <Text style={{flex: 1}}>{this.state.lastTransaction.items.length} {this.state.lastTransaction.items.length > 1 ? "articles" : "article"}</Text>
              <Text>{this.state.lastTransaction.info.Amount}€</Text>
            </CardItem>
          </Card>
          :
                 null 
        }
        </Container>
      </Container>
    );
  }
}

HomeScreen.contextType= AuthContext;

const styles = StyleSheet.create({
  menuIcon: {
    color: "white",
    fontSize: 40
  },
  shoppingModeBt: {
    borderColor: COLORS.primary,
    borderWidth: 8,
    borderRadius: 100,
    backgroundColor: COLORS.secondary,
    flex: 0,
    width: 100,
    height: 100,
    justifyContent: 'center',
    alignItems: 'center',
    position: "absolute",
    bottom: 20,
    alignSelf: 'center'
  },
  shoppingModeIcon: {
    color: '#ffffff',
    fontSize: 30,
    right: 2
  },
  mapContainer: {
    backgroundColor: COLORS.secondary,
    margin: 10
  },
  map: {
    ...StyleSheet.absoluteFillObject
  },
  lastShoppingContainer: {
    margin: 10,
    backgroundColor: COLORS.secondary,
    flex: 1
  },
  cardHeaderTitle: {
    color: COLORS.primary
  },
  cardStyle: {
    borderColor: COLORS.primary,
    flex: 1
  },
  headerLogo: {
    flex: 1,
    resizeMode: 'contain',
    alignSelf: 'center'
  }
})
