//
// Основной файл разработки
// Сюда все импортируется
//

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createDrawerNavigator } from '@react-navigation/drawer';

// Импорт страниц
import { QRScreen } from './pages/QRPage';
import { RegScreen } from './pages/RegPage';
import { AuthScreen } from './pages/AuthPage';
import { HomeScreen } from './pages/HomePage';
import { ExitButton } from './components/ExitButton';
import { ShoppingScreen } from './pages/ShoppingPage';
import { QRCodeGenerator } from './pages/QRGenerator';
import { TGBotButton } from './components/TGBotButton';
import { NewFridgeScreen } from './pages/NewFidgePage';
import { OneFridgeScreen } from './pages/OneFridgePage';
import { StatisticsScreen } from './pages/StatisticsPage';
import { RefrigeratorsScreen } from './pages/RefrigeratorsPage';

// Создаем конфигуратор Drawer и Stack
const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();

// Обертка для Stack внутри Drawer для страницы Холодильников
function FidgeStack() {
	return (
		<Stack.Navigator
			initialRouteName="Refrigerators"
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
				name="Refrigerators"
				component={RefrigeratorsScreen}
				options={{
					headerShown: false,
				}}
			/>

			<Stack.Screen
				name="NewFridge"
				options={{
					title: 'Создать новый холодильник',
				}}
				component={NewFridgeScreen}
			/>

			<Stack.Screen
				name="OneFridge"
				options={{
					title: 'Просмотр холодильника',
					headerTitleAlign: 'center',
				}}
				component={OneFridgeScreen}
			/>

			<Stack.Screen name="QR" component={QRScreen} />
		</Stack.Navigator>
	);
}

// Обертка для Stack внутри Drawer для страницы авторизации
function AuthStack() {
	return (
		<Stack.Navigator
			initialRouteName="Auth"
			screenOptions={{
				headerStyle: {
					backgroundColor: '#f0f0f0',
				},
				cardStyle: {
					flex: 1,
				},
			}}
		>
			<Stack.Screen
				name="Auth"
				component={AuthScreen}
				options={{
					headerShown: false,
				}}
			/>

			<Stack.Screen
				name="Reg"
				component={RegScreen}
				options={{
					headerShown: false,
				}}
			/>
		</Stack.Navigator>
	);
}

// Главная функция приложения
export default function App() {
	return (
		<NavigationContainer>
			<Drawer.Navigator
				initialRouteName="AuthStack"
				screenOptions={{
					drawerStyle: {
						backgroundColor: '#f0f0f0',
						width: 250,
					},
				}}
			>
				<Drawer.Screen
					name="AuthStack"
					options={{ headerShown: false, drawerItemStyle: { display: 'none' } }}
					component={AuthStack}
				/>
				<Drawer.Screen
					name="Home"
					options={{ title: 'Главная', headerTitleAlign: 'center' }}
					component={HomeScreen}
				/>
				<Drawer.Screen
					name="Refrigerators"
					options={{ title: 'Холодильники', headerTitleAlign: 'center' }}
					component={FidgeStack}
				/>
				<Drawer.Screen
					name="Generator"
					options={{ title: 'Сгенерировать QR', headerTitleAlign: 'center' }}
					component={QRCodeGenerator}
				/>
				<Drawer.Screen
					name="Statistics"
					options={{ title: 'Статистика', headerTitleAlign: 'center' }}
					component={StatisticsScreen}
				/>
				<Drawer.Screen
					name="Products"
					options={{ title: 'Список покупок', headerTitleAlign: 'center' }}
					component={ShoppingScreen}
				/>
				<Drawer.Screen name="Notification" options={{ title: 'Уведомления' }} component={TGBotButton} />
				<Drawer.Screen name="Exit" options={{ title: 'Выход' }} component={ExitButton} />
			</Drawer.Navigator>
		</NavigationContainer>
	);
}
