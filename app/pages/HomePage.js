import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TextInput, SafeAreaView } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';

export const HomeScreen = () => {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortType, setSortType] = useState('expiry_date'); // По умолчанию сортировка по сроку годности
  const [openDropdown, setOpenDropdown] = useState(false);

  // Функция для получения данных с сервера
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://192.168.0.9:8000/refrigerator-products');
      const data = await response.json();
      if (data) { 
        setProducts(data); 
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

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

  const renderItem = ({ item }) => (
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
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Продукты в холодильнике</Text>

      <TextInput
        style={styles.searchInput}
        placeholder="Поиск продуктов по названию..."
        value={searchQuery}
        onChangeText={(text) => setSearchQuery(text)}
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
      <View style={{height: "50%"}}>
        <FlatList
          data={filteredProducts}
          keyboardShouldPersistTaps="handled"
          keyExtractor={item => item.name}
          ListEmptyComponent={<Text style={{ textAlign: 'center' }}>В этом холодильнике пусто</Text>}
          renderItem={renderItem}
          nestedScrollEnabled={true}
          scrollEnabled={true}
          // showsVerticalScrollIndicator={false}
          />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // flex: 1,
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
    zIndex : -1,
  },
  dropdownContainer: {
    borderColor: '#ccc',
    zIndex : -1,
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
});
