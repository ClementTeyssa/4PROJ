import React, { Component } from 'react';
import { StyleSheet, FlatList, Image } from 'react-native';
import { Container, Header, Icon, Text, Left, Right, Body, Button, Toast, Root, Footer } from 'native-base';
import { purchase1 } from '../../../Helpers/ProductData';
import { COLORS } from '../../../Helpers/colors';
import SummaryListItem from '../../Dummy/ShoppingMode/SummaryListItem';
import AuthContext from '../../../Contexts/AuthContext';
import { getTransaction } from '../../../API/APIRequest';
import { getListItem, getDate, getTime } from '../../../Helpers/Tool';

export default class CoursesListDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static authContext = AuthContext;


    /**
     * Récupère le détail d'un transaction
     *
     * @memberof CoursesListDetail
     */
    async componentWillMount(){
        const transaction = await getTransaction(this.context.authState.userToken,this.props.route.params.transactionID);
        if(transaction != undefined){
            this.setState({
                transaction: {
                    info: transaction.shift(),
                    items: transaction
            }
        })
        }
    }


    render() {
        return (
                <Container>
                    {/* HEADER */}
                    <Header>
                        <Left style={{ flex: 0 }}>
                            <Icon style={{ color: "white" }} name="arrow-left" type="FontAwesome5" onPress={this.props.navigation.goBack} />
                        </Left>
                        <Body style={{ flex: 1 }}>
                            <Image
                                style={styles.headerLogo}
                                source={require('../../../Assets/ic_SupMarket.png')} />
                        </Body>
                        <Right style={{ flex: 0 }}>
                            <Button transparent onPress={() => (
                                Toast.show({
                                    text: "La facture n'est pas disponible.",
                                    duration: 3000
                                })
                            )}>
                                <Icon name="receipt" type="FontAwesome5" style={{ color: "white" }} />
                            </Button>
                        </Right>
                    </Header>
                    {/* CONTENT */}
                    
                    <Root>
                    {this.state.transaction ?
                    <>
                        <Text style={{ alignSelf: 'center', color: COLORS.primary, marginHorizontal: 15, fontSize: 25 }}>Transaction n°{this.state.transaction.info.ID}</Text>
                        <Text style={{alignSelf: 'center', color: 'grey', marginTop: 5}}>
                            Le {getDate(this.state.transaction.info.RealDate)} à {getTime(this.state.transaction.info.RealDate)} au SupMarket
                        </Text>
                    <FlatList
                        data={getListItem(this.state.transaction.items)}
                        keyExtractor={(item) => item.ID.toString()}
                        renderItem={({ item }) => (
                            <SummaryListItem item={item} />
                        )} />
                        </>
                        :
                        null
                    }
                    </Root>
                    <Footer style={{ backgroundColor: "white" }}>
                        <Left style={{ flex: 1, flexDirection: "row" }}>
                            <Text style={{ fontSize: 18, fontWeight: 'bold', justifyContent: 'center', marginLeft: 10, color: COLORS.primary }}>
                                {this.state.transaction ? this.state.transaction.items.length : "?"}
                            </Text>
                            <Text style={{ fontSize: 18, justifyContent: 'center', marginLeft: 10, color: COLORS.primary }}>
                            {this.state.transaction && this.state.transaction.items.length > 1 ? "articles" : "article"}
                            </Text>
                        </Left>
                        <Right style={{ flex: 2, flexDirection: "row-reverse" }}>
                            <Text style={{ fontSize: 18, justifyContent: 'center', fontWeight: 'bold', marginRight: 10 }}>
                                {this.state.transaction ? this.state.transaction.info.Amount : "?"}€
                                </Text>
                            <Text style={{ fontSize: 18, justifyContent: 'center', marginRight: 10 }}>
                                Montant du panier :
                            </Text>
                        </Right>
                    </Footer>
                </Container>
        );
    }
}

CoursesListDetail.contextType = AuthContext;


const styles = StyleSheet.create({
    menuIcon: {
        color: "white"
    },headerLogo: {
    flex: 1,
    resizeMode: 'contain',
    alignSelf: 'center'
  }
})
