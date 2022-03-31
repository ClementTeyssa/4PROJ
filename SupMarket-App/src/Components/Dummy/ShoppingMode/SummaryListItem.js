import React, { Component } from 'react';
import { ListItem, Text, Left, Right, Header, Grid, Col, Row, Root, Body, Accordion, Container, Content, Icon } from 'native-base';
import { StyleSheet, TextInput } from 'react-native';
import { COLORS } from '../../../Helpers/colors';

export default class SummaryListItem extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
    }

    render() {
        const { item } = this.props;
        return (
            <ListItem>
                <Left style={{ flex: 0, marginRight: 10 }}>
                    <Text style={styles.textPrice}>{item.number} x</Text>
                </Left>
                <Body style={{ flex: 2 }}>
                    <Text style={styles.textName}>{item.Name}</Text>
                </Body>
                <Right style={{ flex: 1 }}>
                    <Text style={styles.textPrice}>{item.Price} €</Text>
                </Right>
            </ListItem>
        );
    }
}

const styles = StyleSheet.create({
    textPrice: {
        color: COLORS.primary,
        fontWeight: 'bold'
    },
    textName: {
        fontSize: 20,
    }
})

/*
<Left style={{flex: 0}}>
                        <Text style={styles.textPrice}>{item.number} x</Text>
                    </Left>
                    <Body style={{flex: 2}}>
                        <Text style={styles.textName}>{item.name}</Text>
                    </Body>
                    <Right style={{flex: 1}}>
                        <Text style={styles.textPrice}>{item.price} €</Text>
                    </Right>
*/