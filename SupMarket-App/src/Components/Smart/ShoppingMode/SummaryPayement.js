import React, { Component } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Header, Footer, Container, Left, Icon, Body, Text, Right, Button, Toast, Root } from 'native-base';
import { getBasketAmount, getBasketArticlesNumber, getBasketArticles } from '../../../Helpers/ShoppingModeHelper';
import { ArticleContext } from '../../../Contexts/ArticleController';
import SummaryListItem from '../../Dummy/ShoppingMode/SummaryListItem';
import { COLORS } from '../../../Helpers/colors';
import AuthContext from '../../../Contexts/AuthContext';
import { CommonActions } from '@react-navigation/native';
import { postTransaction } from '../../../API/APIRequest';

export default class SummaryPayement extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static authContext = AuthContext;

    /**
     * Navigue vers l'écran de transaction valide
     *
     * @memberof SummaryPayement
     */
    goToSuccessTransaction(){
        this.props.navigation.navigate('Transaction valide');
    }

    /**
     * Affiche un Test d'erreur
     *
     * @memberof SummaryPayement
     */
    displayToast(){
        Toast.show({
            text: "Une erreur est survenue, veuillez contacter un vendeur.",
            duration: 3000
        })
    }

    /**
     * Effectue la paiement via une requete ver l'API
     *
     * @param {*} context du panier avec les articles du panier
     * @param {*} token du client
     * @param {*} amount Montant du paiement
     * @memberof SummaryPayement
     */
    async doPayement(context, token, amount){
        const [articles] = context;
        const itemsID = [];
      
        // Met X fois le chaque produit dans un tableau 
        articles.articles.forEach(element => {
          for (let index = 0; index < element.number; index++) {
            itemsID.push(element.ID)      
          }
        });
      
        // Lance la requete de transaction
        const valideT = await postTransaction(token, itemsID, amount);
        
        if(valideT){
            // Navigue vers l'écran si la transaction est valide
            this.goToSuccessTransaction();
        } else {
            // Affiche un erreur en alert Toast : transaction non valide
            this.displayToast();
        } 
    }

    render() {
        return (
            <ArticleContext.Consumer>
                {context => (
                    <Container>
                        <Header>
                            <Left style={{ flex: 0, marginRight: 10 }}>
                                <Icon name="arrow-left" style={styles.iconStyle} onPress={() => this.props.navigation.goBack()} type="FontAwesome5" />
                            </Left>
                            <Body>
                                <Text style={{ color: "white", fontSize: 20 }}>
                                    Récapitulatif des courses
                                </Text>
                            </Body>
                        </Header>
                        <Root>
                        <FlatList
                            data={getBasketArticles(context)}
                            keyExtractor={(item) => item.ID.toString()}
                            renderItem={({ item }) =>(
                                <SummaryListItem item={item}/>
                            )}/>
                        </Root>
                        <Footer style={{backgroundColor: "white"}}>
                            <Left style={{flex: 1, flexDirection: "row"}}>
                                <Text style={{fontSize: 18 , fontWeight: 'bold', justifyContent: 'center', marginLeft: 10, color: COLORS.primary}}>
                                    {getBasketArticlesNumber(context)}
                                </Text>
                                <Text style={{fontSize: 18 , justifyContent: 'center', marginLeft: 10, color: COLORS.primary}}>
                                    {getBasketArticlesNumber(context) > 1 ? "articles" : "article"}
                                </Text>
                            </Left>
                            <Right style={{flex: 2, flexDirection: "row-reverse"}}>
                                <Text style={{fontSize: 18 , justifyContent: 'center', fontWeight: 'bold', marginRight: 10}}>
                                    {getBasketAmount(context)} €
                                </Text>
                                <Text style={{fontSize: 18 , justifyContent: 'center', marginRight: 10}}>
                                    Total du panier : 
                                </Text>
                            </Right>
                        </Footer>
                        <Footer style={{backgroundColor: "white"}}>
                            <Button style={styles.submitButton}
                                onPress={() => this.doPayement(context,this.context.authState.userToken, getBasketAmount(context))}>
                                <Text style={{alignSelf: 'center'}}>
                                    Procéder au paiement
                                </Text>
                            </Button>
                        </Footer>
                    </Container>
                )}
            </ArticleContext.Consumer>
        );
    }
}

SummaryPayement.contextType= AuthContext;

const styles = StyleSheet.create({
    iconStyle: {
        color: "white"
    },
    submitButton:{
        flex: 1, 
        marginHorizontal: 10, 
        justifyContent: 'center', 
        borderRadius: 5
    }
})