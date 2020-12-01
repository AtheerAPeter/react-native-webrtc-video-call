/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 */
import {NavigationContainer} from '@react-navigation/native';
import React from 'react';
import {
  SafeAreaView,
  StyleSheet,
  ScrollView,
  View,
  Text,
  StatusBar,
} from 'react-native';

import {
  Header,
  LearnMoreLinks,
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';
import {createStackNavigator} from '@react-navigation/stack';
import LoginScreen from './screens/LoginScreen';
import {DefaultTheme, Provider as PaperProvider} from 'react-native-paper';
import CallScreen from './screens/CallScreen';
import CallScreen2 from './screens/callingSreen2';
import CallScreen3 from './screens/joinroom';
const Stack = createStackNavigator();

const test = () => <Text>hi</Text>;

const theme = {
  ...DefaultTheme,
  roundness: 5,

  colors: {
    ...DefaultTheme.colors,
    primary: '#000',
    accent: '#ff0',
  },
};

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      <PaperProvider>
        <NavigationContainer>
          <Stack.Navigator>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{headerShown: false}}
            />
            <Stack.Screen name="Call" component={CallScreen2} />
            <Stack.Screen name="Join" component={CallScreen3} />
          </Stack.Navigator>
        </NavigationContainer>
      </PaperProvider>
    </>
  );
};

export default App;
