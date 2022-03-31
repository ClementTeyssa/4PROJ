import React, { Component } from 'react';
import { Card, Container, Header, Icon, Left, Text, CardItem, Thumbnail, Body, Content, Button, Right, Grid, Col, Toast } from 'native-base';
import { StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { COLORS } from '../../../Helpers/colors';
import { productRecommended } from '../../../Helpers/ProductData';
import { ArticleContext } from '../../../Contexts/ArticleController';
import { getBasketAmount, addArticleToBasket, defineArticleThumbnail, decreasesArticle, getBasketArticleQuantity } from '../../../Helpers/ShoppingModeHelper';
import { getUserRecommentations } from '../../../API/APIRequest';
import AuthContext from '../../../Contexts/AuthContext';

export default class ArticleDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      item: props.route.params,
      recommanded: []
    };
  }

  static authContext = AuthContext;

  async componentWillMount(){
     this.setState({recommanded: await getUserRecommentations(this.context.authState.userToken)})
  }

  _navigateToSummaryPayement(){
    this.props.navigation.navigate('Recapitulatif Paiement');
  }

  render() {
    const { navigation } = this.props;
    console.log(this.state)
    return (
      <ArticleContext.Consumer>
        {context => (
          <Container style={styles.mainContainer}>
            {/**********/}
            {/* HEADER */}
            {/**********/}
            <Header>
              <Left style={{ flex: 1, marginLeft: 10 }} >
                <Icon style={{ color: "white" }} name="arrow-left" type="FontAwesome5" onPress={navigation.goBack} />
              </Left>
              <Right style={{ flex: 1 }}>
                <Button onPress={() => this._navigateToSummaryPayement()}>
                  <Text>
                    {getBasketAmount(context)} €
                    </Text>
                  <Icon name="cash-register" type="FontAwesome5" />
                </Button>
              </Right>
            </Header>
            {/***********/}
            {/* CONTENT */}
            {/***********/}
            <Content contentContainerStyle={{ flex: 1 }}>
              <Card style={styles.mainCard} >
                <CardItem header>
                  <Left style={{ flex: 4 }}>
                      <Icon name={defineArticleThumbnail(this.state.item.Category)} type="FontAwesome5"/>
                    <Body>
                      <Text>{this.state.item.Name}</Text>
                      <Text note>SupMarket</Text>
                    </Body>
                  </Left>
                  <Right style={{ flex: 1, flexDirection: 'column', alignItems: 'center' }}>
                    <Text style={{ fontSize: 26, color: COLORS.primary, fontWeight: 'bold' }}>R1</Text>
                  </Right>
                </CardItem>
                <CardItem cardBody style={styles.mainCardBody}>
                  <Text style={{flex: 1}}>
                    {this.state.item.Overview}
                  </Text>
                  <Text style={{flex: 0, color: COLORS.primary}}>
                    Prix: {this.state.item.Price}€
                  </Text>
                </CardItem>
                <CardItem footer>
                  <Button primary transparent style={{flex: 0}} onPress={() => decreasesArticle(context, this.state.item)} style={{flex: 1, justifyContent: 'center'}}>
                    <Icon name="minus" type="FontAwesome5" />
                  </Button>
                  <Body style={{alignItems: 'center', justifyContent: 'center'}}>
                    <Text style={{color: COLORS.primary, fontWeight: 'bold', fontSize: 20}} >{getBasketArticleQuantity(context, this.state.item.ID)}</Text>
                  </Body>
                  <Button primary transparent onPress={() => addArticleToBasket(context, this.state.item)} style={{flex: 1, justifyContent: 'center'}}>
                    <Icon name="plus" type="FontAwesome5" />
                  </Button>
                </CardItem>
              </Card>
              <Text style={{ textAlign: 'center', color: 'grey' }}>D'autres envies?</Text>
              <FlatList
                horizontal
                contentContainerStyle={ {justifyContent: 'space-between'}}
                style={styles.cardsScrollView}
                data={this.state.recommanded}
                keyExtractor={(item) => item.ID.toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity onPress={() => this.setState({item: item})}>
                  <Card style={styles.cardRecommended}>
                    <CardItem header style={{justifyContent: 'center', flex: 1}}>
                      <Icon style={{alignSelf: "center"}} name={defineArticleThumbnail(item.Category)} type="FontAwesome5" />
                    </CardItem>
                    <CardItem cardBody style={{ flex: 1, flexDirection: 'column', padding: 10, justifyContent: 'center'}}>
                      <Text style={{ fontSize: 12 }}>{item.Name}</Text>
                      <Text note style={{ fontSize: 10 }}>{item.Overview}</Text>
                    </CardItem>
                  </Card>
                  </TouchableOpacity>
                )}
                
              />
            </Content>
          </Container>
        )}
      </ArticleContext.Consumer>
    );
  }
}

ArticleDetail.contextType = AuthContext;

const styles = StyleSheet.create({
  mainContainer: {
    backgroundColor: COLORS.secondary
  },
  mainCard: {
    flex: 2,
    marginLeft: 15,
    marginBottom: 15,
    marginRight: 15,
    marginTop: 15,
  },
  mainCardHeader: {
    flex: 1,
  },
  mainCardBody: {
    flex: 2,
    padding: 10
  },
  mainCardBody: {
    flex: 1,
    margin: 10,
    flexDirection: 'column'
  },
  cardsScrollView: {
    flex: 1,
    marginLeft: 10,
    marginBottom: 10,
    marginRight: 10,
    marginTop: 10,
  },
  cardRecommended: {
    flex: 1,
    width: 150
  }
})