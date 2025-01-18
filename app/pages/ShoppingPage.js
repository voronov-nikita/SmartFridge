import { StyleSheet, Text, View, FlatList } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Swipeable } from 'react-native-gesture-handler';
import React, { useState, useCallback } from 'react';

import { URL } from '../config';

export const ShoppingScreen = () => {
	const USERID = localStorage.getItem('UserId');
	const [products, setProducts] = useState([]);

	// Функция для получения данных с сервера
	const fetchShop = async () => {
		try {
			const response = await fetch(`${URL}/shopping/${USERID}`);
			const data = await response.json();
			// Если данные — объект, в котором содержатся массивы, можно использовать Object.values
			if (data && typeof data === 'object') {
				// Извлекаем все массивы продуктов, если они находятся в значениях объекта
				const products = Object.values(data).flat();
				setProducts(products); // Обновляем состояние
			}
		} catch (error) {
			console.error('Error fetching products:', error);
		}
	};

	// Используем useFocusEffect для загрузки данных при активации экрана
	useFocusEffect(
		useCallback(() => {
			fetchShop(); // Загружаем продукты
		}, []),
	);

	// Удаление элемента из списка
	const handleDelete = async item => {
		try {
			// Отправляем запрос на сервер для удаления
			await fetch(`${URL}/shopping/${USERID}/${item.id}`, { method: 'DELETE' });
			const response = await fetch(`${URL}/update-product/${USERID}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					user_id: USERID,
					name: item.name,
					type: item.product_type,
					mass: item.mass,
					quantity: 1,
				}),
				credentials: 'include',
			});

			// Удаляем из локального списка
			setProducts(prevProducts => prevProducts.filter(product => product.id !== item.id));
		} catch (error) {}
	};

	// Отображение кнопки удаления
	const renderRightActions = item => (
		<View style={styles.deleteButton}>
			<Text style={styles.deleteButtonText} onPress={() => handleDelete(item)}>
				Удалить
			</Text>
		</View>
	);

	const renderFridgeItem = ({ item }) => (
		<Swipeable renderRightActions={() => renderRightActions(item)}>
			<View style={styles.productItem}>
				<Text style={styles.productName}>{item.name}</Text>
				<Text style={styles.productDetail}>Классификация: {item.product_type}</Text>
				<Text style={styles.productDetail}>Масса: {item.mass}</Text>
			</View>
		</Swipeable>
	);

	return (
		<View style={styles.container}>
			<FlatList
				data={products}
				keyExtractor={item => item.id.toString()}
				renderItem={renderFridgeItem}
				ListEmptyComponent={<Text style={styles.emptyText}>Список покупок пуст</Text>}
				showsVerticalScrollIndicator={false}
			/>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#f5f5f5',
	},

	emptyText: {
		textAlign: 'center',
	},

	productItem: {
		padding: 16,
		backgroundColor: '#fff',
		borderRadius: 8,
		marginBottom: 8,
		borderWidth: 2,
		shadowColor: '#000',
		shadowOffset: { width: 0, height: 1 },
		shadowOpacity: 0.1,
		shadowRadius: 4,
	},

	productName: {
		fontSize: 18,
		fontWeight: 'bold',
	},
	productDetail: {
		fontSize: 14,
		color: '#555',
	},

	deleteButton: {
		justifyContent: 'center',
		backgroundColor: 'red',
		alignItems: 'flex-end',
		paddingHorizontal: 20,
		flex: 1,
	},
	deleteButtonText: {
		color: 'white',
		fontWeight: 'bold',
	},
});
