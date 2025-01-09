//
// Основной файл разработки и запуска приложения.
//

import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

// импорт отдельных модулей - страниц
import { QRScreen } from './pages/QRPage';
import { HomeScreen } from './pages/HomePage';
import { ProductsScreen } from './pages/ProductsPage';
import { StatisticsScreen } from './pages/StatisticsPage';
import { RefrigeratorsScreen } from './pages/RefrigeratorsPage';

// конфигуратор навигации
const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#ffffff',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
		  
          options={{
            headerShown: false,
          }}
        />

        <Stack.Screen name="Products" component={ProductsScreen} />

        <Stack.Screen name="Statistics" component={StatisticsScreen} />

        <Stack.Screen name="Refrigerators" component={RefrigeratorsScreen} />

        <Stack.Screen name="QR" component={QRScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
