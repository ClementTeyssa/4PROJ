import React, { Component } from 'react';
import { StyleSheet} from 'react-native';
import { ListItem, Left, Body, Button, Right, Icon, Text, Col, Grid} from 'native-base';
import { defineArticleThumbnail, getBasketArticleQuantity, addArticleToBasket, decreasesArticle } from '../../../Helpers/ShoppingModeHelper';

export default class ShelfListItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    _displayDetailForArticle = (nav,item) => {
        nav.navigate("Detail Article", item)
      }

    render() {
        const {nav,context, item} = this.props;
        return (
            <ListItem thumbnail onPress={() => this._displayDetailForArticle(nav,item)}>
                <Left style={styles.listItemLeft}>
                    <Icon name={defineArticleThumbnail(item.Category)} type="FontAwesome5" />
                </Left>
                <Body style={styles.listItemBody}>
                    <Grid>
                    <Col style={styles.titleOverviewView}>
                        <Text >{item.Name}</Text>
                        <Text note numberOfLines={2}>{item.Overview}</Text>
                    </Col>
                    <Col style={styles.priceView}>
                        <Text>{item.Price} €</Text>
                    </Col>
                    </Grid>
                </Body>
                <Right style={styles.listItemRight}>
                    <Button small transparent onPress={() => decreasesArticle(context, item)}>
                        <Icon name="minus" type="FontAwesome" />
                    </Button>
                    <Text>{getBasketArticleQuantity(context, item.ID)}</Text>
                    <Button small transparent onPress={() => addArticleToBasket(context, item)}>
                        <Icon name="plus" type="FontAwesome" />
                    </Button>
                </Right>
            </ListItem>
        );
    }
}

const styles = StyleSheet.create({
    listItemRight:{
        flex: 3,
        flexDirection: "row",
        alignItems: "center",
    },
    listItemLeft:{
        flex: 1,
        justifyContent: "center"
    },
    listItemBody:{
        flex: 11,
        flexDirection:"row"
    },
    priceView:{
        flex: 4,
        justifyContent:"center",
        alignItems: "flex-end",
        padding: 5
    },
    titleOverviewView:{
        flex: 7,
    }
})