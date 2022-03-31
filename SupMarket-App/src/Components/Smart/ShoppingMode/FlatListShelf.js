import React, { Component } from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { Text, Container, Root } from 'native-base';
import ShelfListItem from '../../Dummy/ShoppingMode/ShelfListItem';
import { ArticleContext } from '../../../Contexts/ArticleController';
import { BeaconContext } from '../../../Contexts/BeaconController';
import AuthContext from '../../../Contexts/AuthContext';

export default class FlatListShelf extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    static authContext = AuthContext;

    render() {
        const { nav } = this.props;
        return (
            <Root>
                <BeaconContext.Consumer>
                    {beacon =>
                        <ArticleContext.Consumer>
                            {context => (
                                <Container style={{ flex: 1 }}>
                                    {beacon.articles && beacon.articles.length > 0 ?
                                        <FlatList
                                            data={beacon.articles}
                                            keyExtractor={(item) => item.ID.toString()}
                                            renderItem={({ item }) =>
                                                <ShelfListItem
                                                    item={item}
                                                    context={context}
                                                    nav={nav} />
                                            } />
                                        :
                                        <Text style={styles.centerText}>Aucun article présent dans le rayon</Text>
                                    }
                                </Container>
                            )}
                        </ArticleContext.Consumer>
                    }
                </BeaconContext.Consumer>
            </Root>
        );
    }
}

FlatListShelf.contextType = AuthContext;

const styles = StyleSheet.create({
    centerText: {
        alignSelf: 'center',
        marginTop: 10,
        color: 'gray'
    }
})