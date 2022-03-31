import React, { Component } from 'react';
import { Alert, StyleSheet, BackHandler, Image, AsyncStorage } from 'react-native';
import { CommonActions } from '@react-navigation/native';
import AuthContext from '../../../Contexts/AuthContext';
import { Container, Header, Root, Content, Left, Body, Button, Right, Text, } from 'native-base';
import Login from '../../Dummy/Auth/Login';
import Register from '../../Dummy/Auth/Register';
import IntroSlider from '../IntroSlider/IntroSlider';

export default class AuthScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isLoginType: true,
      // Permet l'affichage de l'intro
      showIntro: undefined
    };
    this.handleBackButtonClick = this.handleBackButtonClick.bind(this);
    this._retrieveData()
  }

  _retrieveData = async () => {
    try {
      const value = await AsyncStorage.getItem('showIntro');
      console.log(value)
      if (value != null) {
        this.setState({showIntro: false});
      } else {
        this.setState({showIntro: true});
      }
    } catch (error) {
      console.log(error)
    }
  };

  _storeData = async showIntro => {
    try {
      await AsyncStorage.setItem(
        'showIntro',
        showIntro.toString()
      );
    } catch (error) {
      console.log(error)
    }
  };

  finishedIntro = () => {
    this._storeData(false)
    this.setState({showIntro: false})
  };

  skippedIntro = () => {
    this._storeData(false)
    this.setState({showIntro: false})
  };

  async componentDidMount() {
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
    Alert.alert(
      "Voulez-vous quitter l'application ?",
      null,
      [
        { text: 'Non', onPress: null },
        { text: 'Oui', onPress: () => BackHandler.exitApp() },
      ]);
    return true;
  }

  /**
   * Permet de naviger vers le HomeScreen avec un reset de routes
   *
   * @memberof AuthScreen
   */
  _navigateTo = () => {
    const resetAction = CommonActions.reset({
      index: 1,
      routes: [
        { name: 'AuthScreen' },
        { name: 'HomeScreen' }]
    });
    this.props.navigation.dispatch(resetAction);
  }

  /**
   * Modifie le state pour changer le type d'authentification inscription/connexion
   *
   * @memberof AuthScreen
   */
  _changeAuthType = () => {
    this.setState({ isLoginType: !this.state.isLoginType })
  }

  render() {
    if (!this.state.showIntro) {
      return (
        <AuthContext.Consumer>
          {context => (
            <Root>
              <Container style={styles.mainContainer}>
                <Header>
                  <Left style={{ flex: 1 }} />
                  <Body >
                    <Image
                      style={styles.headerLogo}
                      source={require('../../../Assets/ic_SupMarket.png')} />
                  </Body>
                  <Right style={{ flex: 0 }}>
                    <Button transparent onPress={this._changeAuthType}>
                      {this.state.isLoginType ?
                        <Text>     S'INSCRIRE   </Text>
                        :
                        <Text>SE CONNECTER</Text>
                      }
                    </Button>
                  </Right>
                </Header>
                <Content style={{ flex: 1 }} contentContainerStyle={{ flex: 1 }}>
                  {this.state.isLoginType ?
                    <Login changeAuthType={this._changeAuthType} signIn={(data) => context.signIn(data)} isSignOut={context.authState.isSignout} />
                    :
                    <Register changeAuthType={this._changeAuthType} signUp={(data) => context.signUp(data)} />
                  }
                </Content>
              </Container>
            </Root>
          )}
        </AuthContext.Consumer>
      );
    } else {
      return (
        <IntroSlider finishedIntro={this.finishedIntro} skippedIntro={this.skippedIntro}/>)
    }
  }
}

const styles = StyleSheet.create({
  mainContainer: {
  },
  headerIcon: {
    color: '#ffffff',
    alignSelf: 'center'
  },
  headerLogo: {
    flex: 1,
    resizeMode: 'contain',
    alignSelf: 'center'
  }
});