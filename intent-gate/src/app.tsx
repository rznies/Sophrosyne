import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';
import { initDatabase } from './db/schema';
import { setDatabase } from './db/repository';

import DashboardScreen from './screens/DashboardScreen';
import TriggersScreen from './screens/TriggersScreen';
import JournalScreen from './screens/JournalScreen';
import SettingsScreen from './screens/SettingsScreen';

const Tab = createBottomTabNavigator();

export default function App() {
  useEffect(() => {
    // Initialize database on app start
    initDatabase()
      .then((db) => {
        setDatabase(db);
        console.log('Database initialized');
      })
      .catch((err) => {
        console.error('Failed to initialize database:', err);
      });
  }, []);

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: true,
          tabBarIcon: ({ color, size }) => {
            let iconName: keyof typeof MaterialIcons.glyphMap = 'help';

            if (route.name === 'Dashboard') {
              iconName = 'home';
            } else if (route.name === 'Triggers') {
              iconName = 'settings';
            } else if (route.name === 'Journal') {
              iconName = 'history';
            } else if (route.name === 'Settings') {
              iconName = 'tune';
            }

            return <MaterialIcons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#007AFF',
          tabBarInactiveTintColor: '#999',
        })}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{ title: 'Dashboard' }}
        />
        <Tab.Screen
          name="Triggers"
          component={TriggersScreen}
          options={{ title: 'Triggers' }}
        />
        <Tab.Screen
          name="Journal"
          component={JournalScreen}
          options={{ title: 'Journal' }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{ title: 'Settings' }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
