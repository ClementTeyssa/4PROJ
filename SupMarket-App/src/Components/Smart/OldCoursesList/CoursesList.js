import React, { Component } from 'react';
import { StyleSheet, FlatList } from 'react-native';
import { Container, Left, Body, Header, Icon, Text, Right, Content, ListItem, Button} from 'native-base';
import { COLORS } from '../../../Helpers/colors';
import { getAllTransaction } from '../../../API/APIRequest';
import AuthContext from '../../../Contexts/AuthContext';
import { getDate } from '../../../Helpers/Tool';

export default class CoursesList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      transactions: []
    };
  }

  static authContext = AuthContext;

  /**
   * Récupère toutes les transactions du client
   *
   * @memberof CoursesList
   */
  async componentWillMount(){
    const transactions = await getAllTransaction(this.context.authState.userToken);
    if(transactions != undefined){
      this.setState({
        transactions: transactions
      })
    }
  }

  /**
   * Navigue vers le détail d'un transaction
   *
   * @memberof CoursesList
   */
  _displayShoppingDetail = (id) => {
    this.props.navigation.navigate("Detail Liste", {transactionID: id})
  }

  render() {
    return (
      <Container>
        <Header style={{justifyContent: 'center'}}>
          <Left style={{flex: 0}}>
            <Button transparent onPress={this.props.navigation.openDrawer}>
              <Icon name="menu" style={styles.menuIcon}/>
            </Button>          
          </Left>
          <Body style={{ flex: 1}}>
            <Text style={{ color: 'white', marginHorizontal: 15, fontSize: 25}}>Vos Smartpaniers</Text>
          </Body>
        </Header>
        <FlatList
          data={this.state.transactions}
          keyExtractor={(item) => item.ID.toString()}
          renderItem={({ item }) => (
            <ListItem onPress={() => this._displayShoppingDetail(item.ID)}>
              <Left style={{flex: 0}}>
                <Icon name="receipt" type="FontAwesome5" style={{color: COLORS.primary}}/>
              </Left>
              <Body>
                <Text>N°{item.ID} du {getDate(item.RealDate)}</Text>
                <Text note>SupMarket</Text>
              </Body>
              <Right>
                <Text style={{color: COLORS.primary}}>{item.Amount}€</Text>
              </Right>
              </ListItem>
            )}
            /> 
      </Container>
    );
  }
}

CoursesList.contextType = AuthContext;

const styles = StyleSheet.create({
  menuIcon:{
    color: "white",
    fontSize: 40
  }
})