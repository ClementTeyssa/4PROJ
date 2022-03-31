import React, { Component } from 'react';
import { Form, Item, Icon, Text, Input, Label, Button, View, Header, Container, Root, Body, Footer } from 'native-base';
import { StyleSheet } from 'react-native';
import { COLORS } from '../../../Helpers/colors';
import { loginFromAPI } from '../../../API/APIRequest';

export default class LoginNew extends Component {
    constructor(props) {
        super(props);
        console.log(this.props.isSignOut)
        this.state = {
            username: undefined,
            password: undefined,
            message: this.props.isSignOut ? "Vous êtes déconnecté." : null
        };
    }

    handleUsername = (text) => {
        this.setState({username: String(text).toLowerCase().trim()})
    }

    handlePassword = (text) => {
        this.setState({password: text})
    }

    login(username, password, signIn){
        if(!username){
            this.setState({message: "Veuillez renseigner votre email."});
        } else if(!password) {
            this.setState({message: "Veuillez renseigner votre mot de passse."});
        } else {
            this.setState({message: undefined});
            var data = {
                "Username": username,
                "PwHash": password
            }
            console.log(data)
            loginFromAPI(data).then(loggedData => {
                loggedData.Token != undefined ? signIn(loggedData) : this.setState({message: "Mail/Mot de passe incorrect."})
            })
        }
    }

    render() {
        const { signIn } = this.props;
        return (
            <Container style={styles.mainContainer}>
                <Text style={styles.maintitle}>
                    Connectez-vous à SupMarket.
                </Text>
                {
                    this.state.message ?
                    <Text
                        style={styles.authErrorMessage}>
                        {this.state.message}
                    </Text>
                    :
                    null
                }
                <Form style={styles.mainForm}>
                    <Item stackedLabel>
                        <Icon name="contact" />
                        <Label>Identifiant/Mail</Label>
                        <Input onChangeText={this.handleUsername}/>
                    </Item>
                    <Item stackedLabel>
                        <Icon name="key" />
                        <Label>Mot de passe</Label>
                        <Input secureTextEntry onChangeText={this.handlePassword}/>
                    </Item>
                    {/* <Text style={styles.redirectionLink}>
                        J'ai oublié mon mot de passe ?
                    </Text> */}
                </Form>
                <Button rounded style={styles.buttonSubmit} onPress={() => this.login(this.state.username,this.state.password,signIn)}>
                    <Text>
                        Connexion
                    </Text>
                </Button>   
            </Container>
        );
    }
}

const styles = StyleSheet.create({
    mainContainer: {
        margin: 10
    },
    maintitle: {
        fontSize: 28,
        flex: 1
    },
    mainForm: {
        flex: 2
    },
    buttonSubmit: {
        alignSelf: "flex-end",
        paddingHorizontal: 10
    },
    redirectionLink:{
        marginTop: 10,
        textDecorationLine: 'underline',
        color: '#C4C4C4',
        alignSelf: 'center'
    },
      authErrorMessage: {
        color: COLORS.error,
        textAlign: "center"
    }
})