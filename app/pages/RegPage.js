//
// Страница регистрации пользователей
//

import React, { useState } from 'react';
import {
	View,
	Text,
	SafeAreaView,
	StyleSheet,
	TextInput,
	TouchableOpacity,
	Dimensions,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

// импорт констант из файла с конфигурациями
import { URL } from '../config';

// Экспортируемый экран авторизации
export const RegScreen = ({ navigation }) => {
	const { width } = Dimensions.get('window');
	// сделаем так, что если ширина экрана меньше 400, то ширину блока будем делать 85%, иначе 34%
	const mainBlockWidth = width < 400 ? '85%' : '34%';

	// переменные состояний
	const topMessage = 'Регистрация';
	// login - переменная логина пользователя (по умолчанию отсутствует)
	const [login, setLogin] = useState('');
	// login - переменная почты пользователя (по умолчанию отсутствует)
	const [email, setEmail] = useState('');
	// password - переменная пароля пользователя (по умолчанию отсутствует)
	// password2 - переменная для проверки пароля пользователя (по умолчанию отсутствует)
	const [password, setPassword] = useState('');
	const [password2, setPassword2] = useState('');

	// showChangePassword и showChangePassword2 - переменный для отображения кнопки смены пароля
	const [showPassword, setShowPassword] = useState(false);
	const [showPassword2, setShowPassword2] = useState(false);

	// переменные состояния динамического стиля полей
	const [borderTextColor, setColor] = useState('black');

	// функция отправки данных на сервер для РЕГИСТРАЦИИ пользователей
	const sendDataToServerReg = async () => {
		// Проверим на пустоту все поля, а так же проверим совпадения введенных паролей
		if (password == password2 && login != '' && password != '' && password2 != '') {
			// возвращаем стили на место
			setColor('black');

			try {
				const response = await fetch(`${URL}/reg`, {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					// тело POST запроса
					body: JSON.stringify({
						login: login,
						email: email,
						password: password,
					}),
					credentials: 'include',
				});
				// Ждем ответа от сервера
				const data = await response.json();

				// Обработка ответа
				const { access, refresh } = data;

				// Сохранение access token в sessionStorage
				sessionStorage.setItem('accessToken', access);

				navigation.navigate('Auth');
			} catch (error) {
				console.error('Ошибка при авторизации:', error);
			}
		} else {
			console.error('Ошибка заполнения, логин или пароль не заполнены');
			setColor('red');
		}

		// Сбрасываем значение для большей безопасности
		setLogin('');
		setEmail('');
		setPassword('');
		setPassword2('');
	};

	return (
		<SafeAreaView style={styles.container}>
			<View style={[styles.mainBlock, { width: mainBlockWidth }]}>
				<Text style={styles.topText}>{topMessage}</Text>

				<View style={[styles.blockTextInput, { borderColor: borderTextColor }]}>
					{/* Поле ввода значения ЛОГИНА пользователя */}
					<TextInput
						style={[styles.textInput, { borderColor: borderTextColor, color: borderTextColor }]}
						placeholder="Придумайте логин:*"
						autoFocus={true}
						onChangeText={login => setLogin(login)}
						value={login}
					/>
				</View>

				<View style={styles.blockTextInput}>
					{/* Поле ввода значения ЛОГИНА пользователя */}
					<TextInput
						style={styles.textInput}
						placeholder="Введите email:"
						onChangeText={email => setEmail(email)}
						value={email}
					/>
				</View>

				<View style={[styles.blockTextInput, { borderColor: borderTextColor }]}>
					{/* Поле ввода значения ПАРОЛЯ пользователя*/}
					<TextInput
						secureTextEntry={!showPassword}
						style={[styles.textInput, { color: borderTextColor }]}
						placeholder="Придумайте пароль:*"
						onChangeText={passw => setPassword(passw)}
						value={password}
					/>

					{/* Иконка - кнопка глаза, изменяющее состояние видимости пароля */}
					<MaterialCommunityIcons
						name={showPassword ? 'eye-off' : 'eye'}
						size={28}
						color="#aaa"
						style={styles.icon}
						onPress={() => setShowPassword(!showPassword)}
					/>
				</View>

				<View style={[styles.blockTextInput, { borderColor: borderTextColor }]}>
					{/* Поле ввода значения ПРОВЕРКИ ПАРОЛЯ пользователя*/}
					<TextInput
						secureTextEntry={!showPassword2}
						style={[styles.textInput, { color: borderTextColor }]}
						placeholder="Повторите пароль:*"
						onChangeText={passw => setPassword2(passw)}
						value={password2}
					/>

					{/* Иконка - кнопка глаза, изменяющее состояние видимости пароля */}
					<MaterialCommunityIcons
						name={showPassword2 ? 'eye-off' : 'eye'}
						size={28}
						color="#aaa"
						style={styles.icon}
						onPress={() => setShowPassword2(!showPassword2)}
					/>
				</View>

				{/* Кнопка отправки данных на сервер для регистрации*/}
				<TouchableOpacity style={styles.button.active} onPressOut={sendDataToServerReg}>
					<Text style={styles.buttonText}>Регистрация</Text>
				</TouchableOpacity>

				{/* Кнопка отправки данных на сервер для регистрации*/}
				<TouchableOpacity
					style={styles.button.inactive}
					onPressOut={() => {
						navigation.navigate('Auth');
					}}
				>
					<Text style={styles.buttonText}>Войти</Text>
				</TouchableOpacity>
			</View>
		</SafeAreaView>
	);
};

// Конструктор стилей для экрана авторизации
const styles = StyleSheet.create({
	container: {
		alignItems: 'center',
		alignContent: 'center',
		justifyContent: 'center',
		flex: 1,

		backgroundColor: '#21292c',
	},

	mainBlock: {
		flex: 1,
		alignContent: 'center',
		justifyContent: 'center',
	},

	blockTextInput: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#f3f3f3',

		borderWidth: 0.5,
	},

	textInput: {
		justifyContent: 'center',
		margin: 'auto',
		padding: '7%',
		backgroundColor: '#f3f3f3',
		color: 'black',
		width: '100%',

		fontFamily: 'Arial',
	},

	icon: {
		marginRight: '5%',
	},

	button: {
		active: {
			width: '100%',
			height: '10%',
			backgroundColor: '#007bb7',
		},

		inactive: {
			width: '100%',
			height: '10%',
			backgroundColor: '#374e59',
		},
	},

	buttonText: {
		display: 'flex',
		justifyContent: 'center',
		textAlign: 'center',
		fontFamily: 'Arial',
		fontWeight: 'bold',
		margin: 'auto',

		color: '#e2e8e9',
		fontSize: '1.25rem',
	},

	// стиль верхнего текста
	topText: {
		textAlign: 'center',
		justifyContent: 'center',

		fontSize: '1.05rem',
		color: '#e2e8e9',
		margin: '5%',
		padding: 'auto',
		fontFamily: 'Arial',
	},
});
