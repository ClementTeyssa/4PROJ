import React, { Component } from 'react';
import { View, Text } from 'react-native';
import IntroSlider from '../IntroSlider/IntroSlider';

export default class HelpScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
        exitScreen: false
    };
  }

  /**
   * Passe le state exitScreen à true
   *
   * @memberof HelpScreen
   */
  finishedIntro = () => {
    this.setState({exitScreen: true})
  };

  /**
   * 
   *
   * @memberof HelpScreen
   */
  componentDidUpdate(){
    // Si le tuto est fini alors on quitte
    this.state.exitScreen ? this.props.navigation.goBack() : null;
  }

  skippedIntro = () => {
    this.setState({exitScreen: true})
  };

  render() {
    return (
        <IntroSlider finishedIntro={this.finishedIntro} skippedIntro={this.skippedIntro}/>
    );
  }
}
