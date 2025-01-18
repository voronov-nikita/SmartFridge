import { View, Text, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import React, { useState, useCallback, useRef } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Swipeable } from 'react-native-gesture-handler';

import { URL } from '../config';

export const HomeScreen = ({ navigation }) => {
	const USERID = localStorage.getItem('UserId');
	const swipeableRef = useRef(null);
	const [products, setProducts] = useState([]);
	const [searchQuery, setSearchQuery] = useState('');
	// По умолчанию сортировка по сроку годности
	const [sortType, setSortType] = useState('expiry_date');
	const [openDropdown, setOpenDropdown] = useState(false);

	// Функция для получения данных с сервера
	const fetchProducts = async () => {
		try {
			const response = await fetch(`${URL}/products/${USERID}`);
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
			fetchProducts(); // Загружаем продукты
		}, []),
	);

	// Удаление элемента из списка
	const handleDelete = async item => {
		try {
			// Отправляем запрос на сервер для удаления
			await fetch(`${URL}/deleteproduct/${item.id}`, { method: 'DELETE' });

			// Удаляем из локального списка
			setProducts(prevProducts => prevProducts.filter(product => product.id !== item.id));
			Alert.alert('Успех', 'Продукт успешно удалён!');
		} catch (error) {
			console.error('Ошибка при удалении:', error);
			Alert.alert('Ошибка', 'Не удалось удалить продукт.');
		}
	};

	// Добавление элемента в список покупок
	// Добавление элемента в список покупок
	const AddShop = async item => {
		try {
			const response = await fetch(`${URL}/shopping/${USERID}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				// тело POST запроса
				body: JSON.stringify({
					name: item.name,
					fridge_id: item.fridge_id,
					mass: item.mass+item.unit,
					product_type: item.product_type, // добавляем тип продукта
				}),
				credentials: 'include',
			});

			// Проверка ответа от сервера
			if (!response.ok) {
				throw new Error('Ошибка при добавлении в корзину');
			}

			const data = await response.json();
			console.log(data);
		} catch (error) {
			console.error('Ошибка:', error);
		}
		swipeableRef.current.close();
	};

	// Сортировка продуктов
	const sortedProducts = [...products].sort((a, b) => {
		if (sortType === 'manufacture_date' || sortType === 'expiry_date') {
			return new Date(a[sortType]) - new Date(b[sortType]);
		} else if (sortType === 'mass') {
			return parseFloat(a.mass) - parseFloat(b.mass);
		} else {
			return 0;
		}
	});

	// Фильтрация продуктов по поисковому запросу
	const filteredProducts = sortedProducts.filter(product =>
		product.name.toLowerCase().includes(searchQuery.toLowerCase()),
	);

	// Определение цвета в зависимости от срока годности
	const getBorderColor = expiryDate => {
		const daysLeft = (new Date(expiryDate) - new Date()) / (1000 * 60 * 60 * 24);
		if (daysLeft < 2) return 'red';
		if (daysLeft <= 5) return 'yellow';
		return 'green';
	};

	// Отображение кнопки удаления
	const renderRightActions = item => (
		<View style={styles.deleteButton}>
			<Text style={styles.deleteButtonText} onPress={() => handleDelete(item)}>
				Удалить
			</Text>
		</View>
	);

	// Отображение кнопки помещения в список покупок
	const renderLeftActions = item => (
		<View style={styles.addButton}>
			<Text style={styles.addButtonText} onPress={() => AddShop(item)}>
				В корзину
			</Text>
		</View>
	);

	const renderItem = ({ item }) => (
		<Swipeable
			ref={swipeableRef}
			renderRightActions={() => renderRightActions(item)}
			renderLeftActions={() => renderLeftActions(item)}
		>
			<View
				style={{
					...styles.productItem,
					borderColor: getBorderColor(item.expiry_date),
				}}
			>
				<Text style={styles.productName}>{item.name}</Text>
				<Text style={styles.productDetail}>Классификация: {item.product_type}</Text>
				<Text style={styles.productDetail}>
					Дата изготовления: {new Date(item.manufacture_date).toLocaleDateString()}
				</Text>
				<Text
					style={{
						...styles.productDetail,
						color: getBorderColor(item.expiry_date),
					}}
				>
					Срок годности: {new Date(item.expiry_date).toLocaleDateString()}
				</Text>
				<Text style={styles.productDetail}>
					Масса: {item.mass} {item.unit}
				</Text>
				<Text style={styles.productDetail}>Пищевая ценность: {item.nutritional_value}</Text>
			</View>
		</Swipeable>
	);

	return (
		<View style={styles.container} showsVerticalScrollIndicator={false}>
			<Text style={styles.title}>Продукты в холодильнике</Text>

			<TextInput
				style={styles.searchInput}
				placeholder="Поиск продуктов по названию..."
				value={searchQuery}
				onChangeText={text => setSearchQuery(text)}
			/>

			<DropDownPicker
				open={openDropdown}
				value={sortType}
				items={[
					{ label: 'Дата изготовления', value: 'manufacture_date' },
					{ label: 'Срок годности', value: 'expiry_date' },
					{ label: 'Масса', value: 'mass' },
				]}
				setOpen={setOpenDropdown}
				setValue={setSortType}
				placeholder="Сортировать по..."
				style={styles.dropdown}
				dropDownContainerStyle={styles.dropdownContainer}
			/>

			{/* Список продуктов */}
			<View style={{ flex: 1 }}>
				<FlatList
					data={filteredProducts}
					keyboardShouldPersistTaps="handled"
					keyExtractor={item => item.id}
					ListEmptyComponent={
						<Text style={{ textAlign: 'center' }}>В этом холодильнике пусто</Text>
					}
					renderItem={renderItem}
					nestedScrollEnabled={true}
					scrollEnabled={true}
					showsVerticalScrollIndicator={false}
				/>
			</View>
		</View>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#f5f5f5',
	},
	title: {
		fontSize: 24,
		fontWeight: 'bold',
		marginBottom: 16,
		textAlign: 'center',
	},
	searchInput: {
		height: 40,
		borderColor: '#ccc',
		borderWidth: 1,
		borderRadius: 8,
		paddingHorizontal: 8,
		marginBottom: 16,
	},
	dropdown: {
		marginBottom: 16,
		borderColor: '#ccc',
		zIndex: -1,
	},
	dropdownContainer: {
		borderColor: '#ccc',
		zIndex: -1,
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
	addButton: {
		justifyContent: 'center',
		backgroundColor: 'blue',
		alignItems: 'flex-start',
		paddingHorizontal: 20,
		flex: 1,
	},
	addButtonText: {
		color: 'white',
		fontWeight: 'bold',
	},
});
