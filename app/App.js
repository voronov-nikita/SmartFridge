//
// Основной файл разработки
// Сюда все импортируется
//

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createStackNavigator } from '@react-navigation/stack';

// Импорт страниц
import { QRScreen } from './pages/QRPage';
import { HomeScreen } from './pages/HomePage';
import { ProductsScreen } from './pages/ProductsPage';
import { QRCodeGenerator } from './pages/QRGenerator';
import { StatisticsScreen } from './pages/StatisticsPage';
import { RefrigeratorsScreen } from './pages/RefrigeratorsPage';

// Создаем конфигуратор Drawer и Stack
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Обертка для Stack внутри Drawer
function MainStack() {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#ffffff',
        },
        cardStyle: {
          flex: 1,
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
      <Stack.Screen name="Generator" component={QRCodeGenerator} />
      <Stack.Screen name="QR" component={QRScreen} />
    </Stack.Navigator>
  );
}

// Главная функция приложения
export default function App() {
  return (
    <NavigationContainer>
      <Drawer.Navigator
        initialRouteName="Home"
        screenOptions={{
          drawerStyle: {
            backgroundColor: '#f0f0f0',
            width: 250,
          },
        }}
      >
        <Drawer.Screen name="Home" options={{ title: 'Главная' }} component={MainStack} />
        <Drawer.Screen name="Refrigerators" options={{ title: 'Холодильники' }} component={RefrigeratorsScreen} />
        <Drawer.Screen name="Generator" options={{ title: 'Сгенерировать QR' }} component={QRCodeGenerator} />
        <Drawer.Screen name="Statistics" options={{ title: 'Статистика' }} component={StatisticsScreen} />
        <Drawer.Screen name="Products" options={{ title: 'Список покупок' }} component={ProductsScreen} />
      </Drawer.Navigator>
    </NavigationContainer>
  );
}
