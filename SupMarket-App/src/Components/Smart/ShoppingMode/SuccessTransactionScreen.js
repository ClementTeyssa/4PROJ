import React, { Component } from 'react';
import { StyleSheet, BackHandler} from 'react-native';
import { Container, Content, Button, Footer, Text, Icon, Toast, Root } from 'native-base';
import { CommonActions } from '@react-navigation/native';

export default class SuccessTransactionScreen extends Component {
    constructor(props) {
        super(props);
        this.state = {
        };
        this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    
    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.handleBackButtonClick);
    }
    
    /**
     * Permet d'afficher une alert lorsque le backButton d'android est utilisé afin
     * de permettre à l'utilisateur de quitter l'application de son plein gré
     *
     * @returns
     * @memberof AuthScreen
     */
    handleBackButtonClick() {
        Toast.show({
            text: "Vous avez terminé vos courses, veuillez mettre fin aux courses.",
            duration: 3000
        })
        return true;
    }

    /**
     * Retoune à l'écran d'accueil avec un reset de route
     *
     * @memberof SuccessTransactionScreen
     */
    goToHome() {
        const resetAction = CommonActions.reset({
            index: 1,
            routes: [{ name: 'Home' }]
        });

        this.props.navigation.dispatch(resetAction)
    }

    render() {
        return (
            <Container>
                <Root>
                    <Content contentContainerStyle={styles.content}>
                        <Text style={{ color: "green", fontSize: 30 }}>
                            Achat terminé
                    </Text>
                        <Icon name="check" type="FontAwesome5" style={{ color: 'green', fontSize: 100 }} />
                        <Text style={{ fontStyle: "italic", fontSize: 20 }}>
                            Merci de votre visite
                    </Text>
                    </Content>
                </Root>
                <Footer style={{ backgroundColor: "white" }}>
                    <Button style={styles.submitButton} onPress={() => this.goToHome()}>
                        <Text>
                            Fin des courses
                        </Text>
                    </Button>
                </Footer>
            </Container>
        );
    }
}


const styles = StyleSheet.create({
    content: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1
    },
    submitButton: {
        marginVertical: 5,
        flex: 1,
        marginHorizontal: 10,
        justifyContent: 'center',
        borderRadius: 5
    }
})