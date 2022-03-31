import React, { Component } from 'react';
import {Image,StyleSheet, View} from 'react-native';

export default class SplashScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    return (
      <View style={styles.splashView}>
        <Image 
            style={styles.splashLogo}
            source={require('../../../Assets/ic_SupMarket.png')}/>
      </View>
    );
  }
}

const styles=StyleSheet.create({
    splashView:{
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1
    },
    splashLogo:{
        width: 150,
        height: 150
    }
})
