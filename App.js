import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Provider, useSelector } from 'react-redux';

import { store, persistor } from './src/store';

import SessionsScreen from './src/scenes/SessionsScreen';
import StartSessionScreen from './src/scenes/session/StartSessionScreen';
import MidSessionScreen from './src/scenes/session/MidSessionScreen';
import { PersistGate } from 'redux-persist/integration/react';

import * as Linking from 'expo-linking';

import * as Notifications from 'expo-notifications';
import { useEffect } from 'react';

import { allowsNotificationsAsync } from './src/util/notify';

import { selectSessions, selectCurrentSession, SessionsState } from './src/store/reducers/sessionsSlice';
import EndSessionScreen from './src/scenes/session/EndSessionScreen';
import HistoryScreen from './src/scenes/history/HistoryScreen';
import PastSessionScreen from './src/scenes/history/PastSessionScreen';

const prefix = Linking.createURL('/');

const SessionStack = createNativeStackNavigator();

const Tab = createBottomTabNavigator();

const Stack = createNativeStackNavigator();

Notifications.setNotificationHandler({
  handleNotification: async () => {
    console.log("Notification received")
  return {
    shouldShowAlert: false,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }},
});

function History() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Overview" component={HistoryScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Past Session" component={PastSessionScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  )
}

function SessionScreen() {
  var currentSession = useSelector(selectCurrentSession)
  if (currentSession) {
    if (currentSession.state == SessionsState.Started) {
      return (
        <MidSessionScreen />
      )
    } else if (currentSession.state == SessionsState.Ending) {
      return (
        <EndSessionScreen />
      )
    }
  } else {
    return (
      <StartSessionScreen />
    )
  }
}

export default function App() {
  const linking = {
    prefixes: [prefix],
    config: {
      screens: {
        History: {
          path: 'history',
          screens: {
            "Past Session": 'session/:id',
            Overview: 'overview',
          }
        },
        Session: 'session'
      },
    },
  };
  useEffect(() => {
    const registerNotification = async () => {
      if (!await allowsNotificationsAsync()) {
        await Notifications.requestPermissionsAsync();
      }
      Notifications.addNotificationResponseReceivedListener(async (response) => {
        console.log(await response.notification.request.content.data);
        console.log(await Notifications.getAllScheduledNotificationsAsync());
        console.log(await Notifications.getPresentedNotificationsAsync());
      });
    }
    registerNotification();
    return () => {
      
    }
  }, []);

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <NavigationContainer linking={linking}>
          <Tab.Navigator>
            <Tab.Screen name="History" component={History} />
            <Tab.Screen name="Session" component={SessionScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </PersistGate>
    </Provider>
  );
}