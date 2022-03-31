import React, { Component } from 'react';
import { Form, Item, Icon, Text, Input, Label, Button, Container } from 'native-base';
import { StyleSheet } from 'react-native';
import { COLORS } from '../../../Helpers/colors';
import { registerFromAPI } from '../../../API/APIRequest';

export default class LoginNew extends Component {
    constructor(props) {
        super(props);
        this.state = {
            message: undefined,
            username: undefined,
            password: undefined,
            confirm_password: undefined,
            firstName: undefined,
            lastName: undefined
        };
    }

    handleUsername = (text) => {
        this.setState({username: String(text).toLowerCase()})
    }

    handlePassword = (text) => {
        this.setState({password: text })
    }

    handleConfirmPassword = (text) => {
        this.setState({confirm_password: text})
    }
    handleFirstName = (text) => {
        this.setState({firstName: text})
    }

    handleLastName = (text) => {
        this.setState({lastName: text})
    }

    validateEmail(email) {
        const regex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return regex.test(String(email).toLowerCase().trim());
    }

    validatePassword(password){
        return password.length < 8;
    }

    register(username,confirm_password, password, firstName, lastName, signUp){
        if(!username || !confirm_password || !password || !firstName || !lastName){
            this.setState({message: "Veuillez remplir tous les champs."});
        } else if(!this.validateEmail(username)){
            this.setState({message: "Email non valide."});
        } else if(this.validatePassword(password)){
            this.setState({message: "Mot de passe trop court. (Min 8 caractères)"});
        } else if(confirm_password !== password){
            this.setState({message: "Mots de passe différents."});
        } else {
            this.setState({message: undefined});
            const data = {
                "Username": username,
                "PwHash": password,
                "IsAdmin": false,
                "FirstName": firstName,
                "LastName": lastName
            }
            registerFromAPI(data).then(returnData => {
                returnData ? signUp(returnData) : this.setState({message: "Une erreur c'est produite.\nVeuillez réessayer."})
            })
        }
    }

    render() {
        const { signUp } = this.props;
        return (
            <Container style={styles.mainContainer}>
                <Text style={styles.maintitle}>
                    Créez votre compte
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
                        <Label>Nom</Label>
                        <Input onChangeText={this.handleLastName} />
                    </Item>
                    <Item stackedLabel>
                        <Icon name="contact" />
                        <Label>Prénom</Label>
                        <Input onChangeText={this.handleFirstName} />
                    </Item>
                    <Item stackedLabel>
                        <Icon name="mail" />
                        <Label>Identifiant</Label>
                        <Input onChangeText={this.handleUsername}/>
                    </Item>
                    <Item stackedLabel>
                        <Icon name="key" />
                        <Label>Mot de passe</Label>
                        <Input secureTextEntry onChangeText={this.handlePassword}/>
                    </Item>
                    <Item stackedLabel>
                        <Icon name="key" />
                        <Label>Confirmez votre mot de passe</Label>
                        <Input secureTextEntry onChangeText={this.handleConfirmPassword} />
                    </Item>
                </Form>
                <Button rounded style={styles.buttonSubmit} onPress={() => this.register(this.state.username,this.state.confirm_password,this.state.password,this.state.firstName,this.state.lastName, signUp)}>
                    <Text>
                        Inscription
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
        flex: 4
    },
    authErrorMessage: {
        color: COLORS.error,
        textAlign: "center"
    },
    buttonSubmit: {
        alignSelf: "flex-end",
        paddingHorizontal: 10,
    },
    redirectionLink: {
        marginTop: 10,
        textDecorationLine: 'underline',
        color: '#C4C4C4',
        alignSelf: 'center'
    }
})
