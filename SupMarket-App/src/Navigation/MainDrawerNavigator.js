import React from 'react';
import { createDrawerNavigator, DrawerItemList } from '@react-navigation/drawer';
import HomeScreen from '../Components/Smart/MainStack/HomeScreen';
import { StyleSheet, Image } from 'react-native';
import AuthContext from '../Contexts/AuthContext';
import { Container, Content, Footer, Header, Button, Text, Icon, Body } from 'native-base';
import CoursesListStack from './CoursesListStack';
import HelpScreen from '../Components/Smart/MainStack/HelpScreen';

const MainDrawerNavigator = createDrawerNavigator();

/**
 * Fonction qui gère le principal menu burger de l'application, appelé dans le MainStack
 */
export function MainDrawer() {
    return (
        <MainDrawerNavigator.Navigator
            initialRouteName="HomeScreenComponent"
            //Gestion des élements (drawerItem) avec ajout d'autres components
            drawerContent={props => myDrawerContent(props)}>
            {/*-- HomeScreen --*/}
            {myDrawerItem("Accueil", HomeScreen, "home")}
            {/*-- Ancien Smartpanier --*/}
            {myDrawerItem("Vos Smartpaniers", CoursesListStack, "shopping-basket")}
            {/*-- tuto --*/}
            {myDrawerItem("Aide", HelpScreen, "question")}
        </MainDrawerNavigator.Navigator>
    )
};

/**
 * Fonction qui retourne un component personnalisé pour le drawerContent
 *
 * @param {*} props proprietés du drawer dont drawerItemList
 * @returns un component contenant le drawerContent personnalisé
 */
function myDrawerContent(props) {
    return (
        <AuthContext.Consumer>
            {context => (
                <Container>
                    <Header>
                        <Body style={{flex: 1}}>
                            <Image 
                                style={styles.headerLogo}
                                source={require('../Assets/ic_SupMarket.png')}/>
                        </Body>
                    </Header>
                    <Content>
                        <DrawerItemList {...props} />
                    </Content>
                    <Footer style={{backgroundColor: 'white', marginHorizontal: 10}}>
                        <Button style={{flex: 1, justifyContent: 'center'}} onPress={() => context.signOut()}>
                            <Text>Déconnexion</Text>
                        </Button>
                    </Footer>
                </Container>
            )}
        </AuthContext.Consumer>
    );
}

/**
 * Fonction qui return un élement (drawerItem) pour un menu (Drawer)
 *
 * @param {*} name Nom de l'élement du menu (Drawer)
 * @param {*} conpoment Component affiché si l'élement du menu est selectionné
 * @param {*} iconName Nom de l'icon à afficher <Icon/> (FontAwesome5)
 * @returns 
 */
function myDrawerItem(name, conpoment, iconName) {
    return (
        <MainDrawerNavigator.Screen
            name={name}
            component={conpoment}
            options={{
                drawerIcon: () => <Icon
                    name={iconName}
                    type="FontAwesome5"
                />
                }}
        />
    );
}

const styles = StyleSheet.create({
    logoApp: {
        width: 80,
        height: 80
    },
    drawerIcon: {
        width: 25,
        height: 25
    },
    logoutButton: {
        margin: 10
    },
    drawerHeader:{
        alignItems: 'center',
        justifyContent: 'center',
        padding: 5
    },
    drawerProfileName:{
        fontWeight: 'bold',
        fontSize: 18
    },
    headerLogo:{
        flex: 1,
        resizeMode: 'contain',
        alignSelf: 'center'
    }
});