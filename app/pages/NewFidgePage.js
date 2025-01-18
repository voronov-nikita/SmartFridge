import React, { useState } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, Text } from 'react-native';

import { URL } from '../config';

export const NewFridgeScreen = ({ navigation }) => {
	const USERID = localStorage.getItem('UserId');
	const [title, setTitle] = useState('');

	const handleSubmit = async () => {
		if (!title) {
			Alert.alert('Ошибка', 'Пожалуйста, введите название холодильника.');
			return;
		}

		try {
			const response = await fetch(`${URL}/newfridge`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					title: title,
					user_id: USERID,
				}),
			});

			if (!response.ok) {
				throw new Error('Сетевая ошибка');
			}

			const data = await response.json();
			Alert.alert('Успех', 'Холодильник успешно добавлен!');
			setTitle('');
		} catch (error) {
			Alert.alert('Ошибка', 'Не удалось добавить холодильник. Попробуйте еще раз.');
			console.error(error);
		}

		navigation.navigate('Refrigerators');
	};

	return (
		<View style={styles.container}>
			<TextInput
				style={styles.input}
				placeholder="Введите название холодильника"
				value={title}
				onChangeText={setTitle}
			/>

			<TouchableOpacity style={styles.button} onPress={handleSubmit}>
				<Text style={styles.buttonText}>Добавить холодильник</Text>
			</TouchableOpacity>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		backgroundColor: '#fff',
		alignItems: 'center',
		justifyContent: 'flex-start', // Элементы вверху
		padding: 20,
	},
	title: {
		fontSize: 24,
		marginBottom: 20,
	},
	input: {
		height: 40,
		borderColor: 'gray',
		borderWidth: 1,
		marginBottom: 20,
		paddingHorizontal: 10,
		width: '100%', // Занять всю ширину
	},
	button: {
		position: 'absolute',
		bottom: 20, // Расстояние от нижней части экрана
		left: 20, // Расстояние от левой части экрана
		right: 20, // Расстояние от правой части экрана
		backgroundColor: '#007BFF', // Цвет фона кнопки
		padding: 15, // Внутренние отступы
		borderRadius: 5, // Закругленные углы
		alignItems: 'center', // Центрирование текста
	},
	buttonText: {
		color: '#fff', // Цвет текста
		fontSize: 16, // Размер текста
	},
});
