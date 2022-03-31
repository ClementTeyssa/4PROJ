import React from 'react';
import SplashScreen from './Components/Smart/MainStack/SplashScreen';
import AuthScreen from './Components/Smart/MainStack/AuthScreen';
import { MainDrawer } from './Navigation/MainDrawerNavigator';
import { NavigationContainer } from '@react-navigation/native';
import AuthContext from './Contexts/AuthContext';
import { createStackNavigator } from '@react-navigation/stack';
import ShoppingModeStack from './Navigation/ShoppingModeStack';
import { StyleProvider } from 'native-base';
import getTheme from '../native-base-theme/components';
import platform from '../native-base-theme/variables/platform';
import CoursesEntry from './Components/Smart/ShoppingMode/CoursesEntry';

// Permet transmettre une prop dans l’arbre des
// composants sans le mapper à chaque composent
// ici le token d'auth

const Stack = createStackNavigator();

export default function App({ navigation }) {

  const [state, dispatch] = React.useReducer(
    (prevState, action) => {
      switch (action.type) {
        case 'RESTORE_TOKEN':
          return {
            ...prevState,
            userToken: action.token,
            isLoading: false,
          };
        case 'SIGN_IN':
          return {
            ...prevState,
            isSignout: false,
            userToken: action.token,
            firstName: action.firstName,
            lastName: action.lastName,
            isTest: action.isTest
          };
        case 'SIGN_OUT':
          return {
            ...prevState,
            isSignout: true,
            userToken: null,
            firstName: undefined,
            lastName: undefined,
            isTest: false
          };
      }
    },
    {
      isLoading: true,
      isSignout: false,
      userToken: null,
      firstName: undefined,
      lastName: undefined,
      isTest: false
    }
  );

  React.useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken;

      try {
        userToken = await AsyncStorage.getItem('userToken');
      } catch (e) {
        // Restoring token failed
      }

      // After restoring token, we may need to validate it in production apps
      const wait = time => new Promise((resolve) => setTimeout(resolve,time));
      wait(2000).then(() => dispatch({ type: 'RESTORE_TOKEN', token: userToken }))
      // This will switch to the App screen or Auth screen and this loading
      // screen will be unmounted and thrown away.
      //dispatch({ type: 'RESTORE_TOKEN', token: userToken });
    };

    bootstrapAsync();
  }, []);

  const authContext = React.useMemo(
    () => ({
      authState: state,
      signIn: async data => {
        // In a production app, we need to send some data (usually username, password) to server and get a token
        // We will also need to handle errors if sign in failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token
        dispatch({ type: 'SIGN_IN', token: data.Token, firstName: data.Firstname, lastName: data.Lastname, isTest: data.IsAdmin });
      },
      signOut: () => dispatch({ type: 'SIGN_OUT' }),
      signUp: async data => {
        // In a production app, we need to send user data to server and get a token
        // We will also need to handle errors if sign up failed
        // After getting token, we need to persist the token using `AsyncStorage`
        // In the example, we'll use a dummy token
        dispatch({ type: 'SIGN_IN',  token: data.Token, firstName: data.Firstname, lastName: data.Lastname, isTest: data.IsAdmin });
      },
    }),
    [state]
  );

  console.log("-----------------------------")
  console.log("isLodaing: " + state.isLoading)
  console.log("userToken: " + state.userToken)
  console.log("isSignout: " + state.isSignout)

  return(
    <StyleProvider style={getTheme(platform)}>  
    <AuthContext.Provider value={authContext}>
      <NavigationContainer>
        <Stack.Navigator>
          {state.isLoading ? (
            <Stack.Screen 
              name="Splash" 
              component={SplashScreen} 
              options={{
                headerShown: false
              }}/>
          ) : state.userToken == null ? (
            <Stack.Screen 
              name="Auth" 
              component={AuthScreen}
              options={{
                title: 'Sign in',
                animationTypeForReplace: state.isSignout ? 'pop' : 'push',
                headerShown: false
              }} />
          ) : (
            // l'utilisateur est connecté
            <>
              <Stack.Screen
                  name="Home"
                  component={MainDrawer}
                  options={{
                    headerShown: false
                  }} />

                <Stack.Screen
                  name="Entrée courses"
                  component={CoursesEntry}
                  options={{
                    headerShown: false
                  }} />

                <Stack.Screen
                  name="Stack Courses"
                  component={ShoppingModeStack}
                  options={{
                    headerShown: false
                  }} />
                </>
              )}
              
        </Stack.Navigator>
      </NavigationContainer>
    </AuthContext.Provider>
    </StyleProvider>
  )
};
