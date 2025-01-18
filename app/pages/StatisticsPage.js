// Установите необходимые зависимости: npm install react-native-chart-kit
import React, { useEffect, useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	ActivityIndicator,
	FlatList,
	TouchableOpacity,
} from 'react-native';

import { URL } from '../config';

export const StatisticsScreen = () => {
	const USERID = localStorage.getItem('UserId');
	const [data, setData] = useState(null);
	const [loading, setLoading] = useState(true);
	const [timeRange, setTimeRange] = useState('day');

	const fetchData = async () => {
		try {
			const response = await fetch(`${URL}/top-products/${USERID}`, {
				method: 'GET',
				headers: {
					Accept: 'application/json',
				},
				credentials: 'include',
			});
			const data = await response.json();
			setLoading(true);
			const sortedData = data[timeRange].sort((a, b) => b.quantity - a.quantity);
			setData(sortedData);
		} catch (error) {
			console.error('Error fetching data:', error);
		} finally {
			setLoading(false);
		}
	};

	useFocusEffect(
		useCallback(() => {
			fetchData();
		}, []),
	);

	useEffect(() => {
		// Запрос данных в зависимости от выбранного диапазона времени
		fetchData();
	}, [timeRange]);

	if (loading) {
		return (
			<View style={styles.loaderContainer}>
				<ActivityIndicator size="large" color="#0000ff" />
			</View>
		);
	}

	if (!data) {
		return (
			<View style={styles.errorContainer}>
				<Text>Ошибка загрузки данных</Text>
			</View>
		);
	}

	const mostPopularProduct = data[0];
	const chartData = {
		labels: data.map(item => item.name),
		values: data.map(item => item.quantity),
	};

	return (
		<ScrollView style={styles.container}>
			<View style={styles.timeRangeContainer}>
				{['day', 'week', 'month'].map(range => (
					<TouchableOpacity
						key={range}
						style={[styles.timeRangeButton, timeRange === range && styles.activeTimeRangeButton]}
						onPress={() => setTimeRange(range)}
					>
						<Text style={[styles.timeRangeText, timeRange === range && styles.activeTimeRangeText]}>
							{range === 'day' ? 'День' : range === 'week' ? 'Неделя' : 'Месяц'}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			<View style={styles.popularContainer}>
				<Text style={styles.popularTitle}>⭐ Самый популярный товар ⭐</Text>
				<Text style={styles.popularProduct}>{mostPopularProduct.name}</Text>
			</View>

			<Text style={styles.listTitle}>Список товаров</Text>
			<FlatList
				data={data}
				keyExtractor={(item, index) => index.toString()}
				renderItem={({ item, index }) => (
					<View style={styles.listItem}>
						<Text style={styles.listItemText}>{item.name}</Text>
						<Text style={styles.listItemText}>Количество: {item.quantity}</Text>
						<Text style={styles.listItemText}>Тип: {item.type}</Text>
						<Text style={styles.listItemText}>Масса: {item.mass}</Text>
					</View>
				)}
				contentContainerStyle={{ paddingBottom: 16 }}
				ItemSeparatorComponent={() => <View style={styles.itemSeparator} />}
			/>

			<Text style={styles.chartTitle}>Топ 5 продуктов</Text>
			<View style={styles.chartContainer}>
				<View style={styles.yAxisContainer}>
					{[...Array(5)].map((_, i) => (
						<Text key={i} style={styles.yAxisLabel}>
							{Math.round((Math.max(...chartData.values) / 4) * (4 - i))}
						</Text>
					))}
				</View>
				<View style={styles.barChartContainer}>
					{chartData.labels.map((label, index) => (
						<View key={index} style={styles.barContainer}>
							<View
								style={[
									styles.bar,
									{ height: (chartData.values[index] / Math.max(...chartData.values)) * 150 },
								]}
							/>
							<Text style={styles.barLabel}>{label}</Text>
						</View>
					))}
				</View>
			</View>
		</ScrollView>
	);
};

const styles = StyleSheet.create({
	container: {
		flex: 1,
		padding: 16,
		backgroundColor: '#fff',
	},
	loaderContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	errorContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
	},
	timeRangeContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginBottom: 16,
	},
	timeRangeButton: {
		padding: 8,
		marginHorizontal: 4,
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 4,
	},
	activeTimeRangeButton: {
		borderColor: '#000',
		backgroundColor: '#f7e7ce',
	},
	timeRangeText: {
		fontSize: 14,
		color: '#000',
	},
	activeTimeRangeText: {
		fontWeight: 'bold',
	},
	popularContainer: {
		marginBottom: 24,
		padding: 16,
		backgroundColor: '#fffbea',
		borderWidth: 2,
		borderColor: 'gold',
		borderRadius: 8,
		alignItems: 'center',
	},
	popularTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		color: 'gold',
	},
	popularProduct: {
		fontSize: 16,
		fontWeight: '600',
		color: '#000',
	},
	listTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginTop: 16,
		marginBottom: 8,
		textAlign: 'center',
	},
	listItem: {
		padding: 12,
		marginVertical: 4,
		backgroundColor: '#f9f9f9',
		borderRadius: 8,
		borderWidth: 1,
		borderColor: '#ddd',
	},
	listItemText: {
		fontSize: 14,
	},
	itemSeparator: {
		height: 8,
	},
	chartTitle: {
		fontSize: 18,
		fontWeight: 'bold',
		marginTop: 16,
		marginBottom: 8,
		textAlign: 'center',
	},
	chartContainer: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		padding: 16,
		backgroundColor: '#f0f0f0',
		borderWidth: 1,
		borderColor: '#ccc',
		borderRadius: 8,
		marginBottom: 16,
	},
	yAxisContainer: {
		justifyContent: 'space-between',
		alignItems: 'flex-end',
		marginRight: 8,
		height: 150,
	},
	yAxisLabel: {
		fontSize: 12,
		color: '#666',
	},
	barChartContainer: {
		flexDirection: 'row',
		justifyContent: 'space-around',
		alignItems: 'flex-end',
		flex: 1,
	},
	barContainer: {
		alignItems: 'center',
	},
	bar: {
		width: 20,
		backgroundColor: '#ffa500',
	},
	barLabel: {
		marginTop: 4,
		fontSize: 12,
		textAlign: 'center',
	},
});
