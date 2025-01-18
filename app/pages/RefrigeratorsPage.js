import React, { useState, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import { SquareButton } from "../components/SquareButton";

import { URL } from '../config';

export const RefrigeratorsScreen = ({ navigation }) => {
  const USERID = localStorage.getItem("UserId");
  const [fridges, setFridges] = useState([]);

  // Получение списка холодильников с сервера
  const fetchFridges = async () => {
    try {
      const response = await fetch(`${URL}/fridges/${USERID}`);
      const data = await response.json();
      setFridges(data);
    } catch (error) {
      console.error('Ошибка при загрузке холодильников:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить список холодильников.');
    }
  };

  // Используем useFocusEffect для загрузки данных при активации экрана
  useFocusEffect(
    useCallback(() => {
      fetchFridges(); // Загружаем холодильники
    }, [])
  );

  const handlePress = ({fridge}) => {
    navigation.navigate("OneFridge", {fridgeName: fridge.title, fridgeId: fridge.id});
  }

  const renderFridgeItem = ({ item }) => (
    <TouchableOpacity
      style={styles.fridgeItem}
      onPress={() => handlePress({fridge: item})}
    >
      <Text style={styles.fridgeTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Список холодильников</Text>
      <FlatList
        data={fridges}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderFridgeItem}
        ListEmptyComponent={<Text style={styles.emptyText}>Нет доступных холодильников</Text>}
        showsVerticalScrollIndicator={false}
      />

      <SquareButton navigation={navigation} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  fridgeItem: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  fridgeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  emptyText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 20,
  },
});
