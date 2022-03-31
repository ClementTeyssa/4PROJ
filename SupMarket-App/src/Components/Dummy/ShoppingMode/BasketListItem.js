import React, { Component } from 'react';
import { StyleSheet, Alert} from 'react-native';
import { ListItem, Text, Body, Left, Icon, Right, Button } from 'native-base';
import { defineArticleThumbnail, getBasketArticleQuantity, decreasesArticle, removeArticle } from '../../../Helpers/ShoppingModeHelper';

export default class BasketListItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    _alertRemovedArticles(item,context){
        Alert.alert(
            "Voulez-vous supprimer ces articles ?",
            item.Name + '\n\n' + "Quantité : " + item.number,
            [
                {
                  text: "Non",
                  //onPress: () => null,
                  style: "cancel"
                },
                {
                    text: "Juste un",
                    onPress: () => decreasesArticle(context,item)
                },
                { text: "Oui", onPress: () => removeArticle(context,item) }
              ],{ cancelable: false }
        )
    }

    render() {
        const { item, context, nav} = this.props;
        return (
            <ListItem thumbnail>
                <Left style={styles.listItemLeft}>
                    {/*<Thumbnail square source={{ uri: 'Image URL' }} />*/}
                    <Icon name={defineArticleThumbnail(item.Category)} type="FontAwesome5" />
                </Left>
                <Body style={styles.listItemBody}>
                    <Text>{item.Name}</Text>
                    <Text note numberOfLines={1}>Quantité : {getBasketArticleQuantity(context, item.ID)}</Text>
                </Body>
                <Right style={styles.listItemRight}>
                    <Button transparent onPress={() => this._alertRemovedArticles(item,context)}>
                        <Icon name="trash" type="FontAwesome"/>
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
