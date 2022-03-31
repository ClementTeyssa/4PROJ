import React, { Component } from 'react';
import { Container, Header, Tab, Tabs, TabHeading, Icon, Item, Input, Button, Text, Badge, Left, Body, Right, Picker } from 'native-base';
import { ArticleContext } from '../Contexts/ArticleController';
import { StyleSheet, Alert } from 'react-native';
import { getBasketAmount, getBasketArticlesNumber } from '../Helpers/ShoppingModeHelper';
import FlatListBasket from '../Components/Smart/ShoppingMode/FlatListBasket';
import FlatListShelf from '../Components/Smart/ShoppingMode/FlatListShelf';
import { BeaconContext } from '../Contexts/BeaconController';
import { CommonActions } from '@react-navigation/native';
import AuthContext from '../Contexts/AuthContext';

export default class ShoppingModeTabNavigator extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: undefined
    };
  }

  static authContext = AuthContext;

  /**
   * Remplace l'écran par l'écran d'accueil avec un reset des routes
   *
   * @memberof ShoppingModeTabNavigator
   */
  goToHome() {
    const resetAction = CommonActions.reset({
      index: 1,
      routes: [{ name: 'Home' }]
    });

    this.props.navigation.dispatch(resetAction);
  }

  /**
   * Créer un alerte pour quitter le mode courses
   *
   * @memberof ShoppingModeTabNavigator
   */
  displayAlertQuitCourses() {
    Alert.alert(
      "Voulez-vous vraiment quitter le Smartpanier?",
      "Veuillez deposer vos courses à l'entrée si vous quittez le Smartpanier.",
      [
        {
          text: "Non",
          style: "cancel"
        },
        {
          text: "Oui",
          onPress: () => this.goToHome(),
          style: "default"
        }
      ]
    );
  }

  /**
   * TabHeading personnalisé pour le panier avec badge du
   *
   * @param {*} iconName nom de l'icon (-vector-icons)
   * @param {*} tabName nom de l'onglet du tabBar
   * @returns
   * @memberof ShoppingModeTabNavigator
   */
  _myBasketTabHeading(iconName, context) {
    return (
      <TabHeading>
        <Icon name={iconName} color="#ffffff" type="FontAwesome" />
        <Badge style={styles.badge}>
          <Text>{getBasketArticlesNumber(context)}</Text>
        </Badge>
      </TabHeading>
    );
  }

  /**
   * TabHeading personnalisé 
   *
   * @param {*} iconName nom de l'icon (-vector-icons)
   * @param {*} tabName nom de l'onglet du tabBar
   * @returns
   * @memberof ShoppingModeTabNavigator
   */
  _myTabHeading(iconName, tabName) {
    return (
      <TabHeading>
        <Icon name={iconName} color="#ffffff" type="FontAwesome" />
        {/*<Text style={styles.tabText}>{tabName}</Text>*/}
      </TabHeading>
    );
  }

  /**
   * Navigue l'écran de détail d'un article
   *
   * @param {*} navigation
   * @memberof ShoppingModeTabNavigator
   */
  _navigateToArticleDetail(navigation) {
    navigation.navigate('Article Detail');
  }

  /**
   * Navigue vers l'écran de résumé des courses
   *
   * @memberof ShoppingModeTabNavigator
   */
  _navigateToSummaryPayement() {
    this.props.navigation.navigate('Recapitulatif Paiement');
  }

  render() {
    return (
      <BeaconContext.Consumer>
        {beacon =>
          <ArticleContext.Consumer>
            {context =>
              <Container>
                <Header>
                  <Left style={{ flex: 0, marginRight: 10 }}>
                    <Icon name="door-open" style={styles.iconStyle} onPress={() => this.displayAlertQuitCourses()} type="FontAwesome5" />
                  </Left>
                  <Body>
                    <Text style={{ color: "white", fontSize: 20 }}>
                      Faites vos courses
                    </Text>
                  </Body>
                  <Right style={{ flex: 1 }}>
                    <Button onPress={() => this._navigateToSummaryPayement()}>
                      <Text>
                        {getBasketAmount(context)} €
                    </Text>
                      <Icon name="cash-register" type="FontAwesome5" />
                    </Button>
                  </Right>
                </Header>
                <Header >
                  {!this.context.authState.isTest ?
                    <Text style={{ color: "white", fontSize: 20, alignSelf: "center"}}  >{beacon.info ? "Rayon : " + beacon.info.name : "Recherche de rayon en cours"}</Text>
                    :
                    /*Uniquement pour les comptes testes (sans BT)*/
                    beacon.info ?
                      <Picker
                        mode="dropdown"
                        style={{ color: "#fff" }}
                        selectedValue={beacon.info.id}
                        onValueChange={(value) => this.props.changeShelf(value)}>
                        {beacon.beaconsList != undefined ? beacon.beaconsList.map(element =>
                          <Picker.Item color="black" label={"Rayon: " + element.Name} value={element.ID} />
                        ) : console.log(beacon)}
                      </Picker>
                      :
                      null
                      
                  }
                </Header>
                <Tabs
                  tabBarPosition="bottom">
                  <Tab heading={this._myBasketTabHeading("shopping-basket", context)}>
                    <FlatListBasket nav={this.props.navigation} />
                  </Tab>
                  <Tab heading={this._myTabHeading("list", "Rayon")}>
                    <FlatListShelf nav={this.props.navigation} />
                  </Tab>
                  <Tab heading={this._myTabHeading("map-marker", "Carte")}>

                  </Tab>
                </Tabs>
              </Container>
            }
          </ArticleContext.Consumer>
        }
      </BeaconContext.Consumer>
    );
  }
}

ShoppingModeTabNavigator.contextType = AuthContext;

const styles = StyleSheet.create({
  badge: {
    position: 'absolute',
    transform: [{
      scale: 0.8
    }, {
      translateX: 28,
    }]
  },
  iconStyle: {
    color: "white",
    fontSize: 25
  },
});