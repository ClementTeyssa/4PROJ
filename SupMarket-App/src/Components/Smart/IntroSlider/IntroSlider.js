import React, { Component } from 'react';
import { Text, Image, StyleSheet } from 'react-native';
import AppIntroSlider from 'react-native-app-intro-slider';
import { slides } from '../../../Helpers/introSlider';
import { Container, H1 } from 'native-base';
export default class IntroSlider extends Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }
  
  finishedIntro = () => {
    this.props.finishedIntro();
  };

  skippedIntro = () => {
    this.props.skippedIntro();
  }


  /**
   * Permet de définir un text avec du bold
   * {
   *    text : "{0} XXX {1} xxxxx",
   *    boldText: [YY, GGG]
   * }
   * 
   * Met les éléments de boldText dans des balises Text avec du bold en style
   * @memberof IntroSlider
   */
  applyBoldStyle = text => {
    let numberOfItemsAdded = 0;
    const result = text.sentence.split(/\{\d+\}/);
    text.boldText.forEach((boldText, i) => result.splice(++numberOfItemsAdded + i, 0, <Text key={"boldText-" + numberOfItemsAdded} style={{fontWeight: 'bold'}}>{boldText}</Text>));
    return <Text>{result}</Text>;
  };

  _renderItem = ({ item }) => {
    return (
      <Container style={styles.MainContainer}>
             <Image style={styles.logoImage} source={require('../../../Assets/ic_logo_SupMarket_slogan.png')}/>
             <Container style={styles.secondContainer}>
               <Container style={{flex:1, backgroundColor: "#f4d4be", justifyContent: "center"}}>
                 <Text style={styles.text}>{this.applyBoldStyle(item)}</Text>
               </Container>
               <Container style={{flex:4, backgroundColor: "#f4d4be" }}>
                 <Image style={styles.image}  source={item.image} />
              </Container>
             </Container>
      </Container>
    );
  }

  render() {
    return (
        <AppIntroSlider 
            renderItem={this._renderItem} 
            data={slides} 
            onDone={this.finishedIntro}
            onSkip={this.skippedIntro}
            showSkipButton={true}
            showPrevButton={true}/>
    );
  }
}

const styles = StyleSheet.create({
    MainContainer: { 
     flex: 1, 
     paddingTop: 20, 
     alignItems: 'center', 
     justifyContent: 'center', 
     padding: 20,
     backgroundColor: "#f4d4be"
    },
    secondContainer:{
        backgroundColor: "#f4d4be",
        alignItems: 'center', 
        flex: 1
    },
    title: { 
     fontSize: 26, 
     color: '#fff', 
     fontWeight: 'bold', 
     textAlign: 'center', 
     marginTop: 20, 
    }, 
    text: { 
     color: '#fff', 
     fontSize: 22,
     textAlign: "center",
     justifyContent: "flex-end"
    }, 
    logoImage:{
        width: 200, 
        height: 200, 
        resizeMode: 'contain'
    },
    image: { 
     width: 300, 
     height: 300, 
     resizeMode: 'contain'
    } 
}); 