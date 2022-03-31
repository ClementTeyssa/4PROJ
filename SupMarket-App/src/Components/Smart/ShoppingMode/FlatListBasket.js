import React, { Component } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Text, Container } from 'native-base';
import BasketListItem from '../../Dummy/ShoppingMode/BasketListItem';
import { getBasketArticlesNumber, getBasketArticles } from '../../../Helpers/ShoppingModeHelper';
import { ArticleContext } from '../../../Contexts/ArticleController';

export default class FlatListBasket extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { nav } = this.props;
        return (
            <ArticleContext.Consumer>
                {context => (
                    <Container style={{ flex: 1 }}>
                        {getBasketArticlesNumber(context) > 0 ?
                            <FlatList
                                data={getBasketArticles(context)}
                                keyExtractor={(item) => item.ID.toString()}
                                renderItem={({ item }) =>
                                    <BasketListItem
                                        item={item}
                                        context={context}
                                        nav={nav} />

                                } />
                            :
                            <Text style={styles.centerText}>Aucun article dans votre panier.</Text>
                        }
                    </Container>
                )}
            </ArticleContext.Consumer>
        );
    }
}

const styles = StyleSheet.create({
    centerText: {
        alignSelf: 'center',
        marginTop: 10,
        color: 'gray'
    }
})