import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';

export const QRCodeGenerator = () => {
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [mass, setMass] = useState('');
  const [unit, setUnit] = useState('кг');
  const [nutritionalValue, setNutritionalValue] = useState('');
  const [qrData, setQrData] = useState(null);

  const qrCodeRef = useRef();

  const generateQRCode = () => {
    const data = {
      name: productName,
      product_type: productType,
      manufacture_date: manufactureDate,
      expiry_date: expiryDate,
      mass: parseFloat(mass),
      unit,
      nutritional_value: nutritionalValue,
    };
    setQrData(data);
  };

  const downloadQRCode = async () => {
    if (!qrCodeRef.current) {
      alert('Сначала сгенерируйте QR-код!');
      return;
    }

    qrCodeRef.current.toDataURL((dataURL) => {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${dataURL}`;
      link.download = 'qrcode.png';
      link.click();
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Генерация QR-кода для продукта</Text>

      <Text style={styles.label}>Название продукта</Text>
      <TextInput
        style={styles.input}
        placeholder="Введите название"
        value={productName}
        onChangeText={setProductName}
      />

      <Text style={styles.label}>Тип продукта</Text>
      <TextInput
        style={styles.input}
        placeholder="Введите тип продукта"
        value={productType}
        onChangeText={setProductType}
      />

      <Text style={styles.label}>Дата изготовления</Text>
      <TextInput
        style={styles.input}
        placeholder="Введите дату (YYYY-MM-DD)"
        value={manufactureDate}
        onChangeText={setManufactureDate}
      />

      <Text style={styles.label}>Дата истечения срока годности</Text>
      <TextInput
        style={styles.input}
        placeholder="Введите дату (YYYY-MM-DD)"
        value={expiryDate}
        onChangeText={setExpiryDate}
      />

      <Text style={styles.label}>Масса</Text>
      <TextInput
        style={styles.input}
        placeholder="Введите массу"
        keyboardType="numeric"
        value={mass}
        onChangeText={setMass}
      />

      <Text style={styles.label}>Тип массы</Text>
      <TextInput
        style={styles.input}
        placeholder="Введите тип массы (кг, г, л, мл)"
        value={unit}
        onChangeText={setUnit}
      />

      <Text style={styles.label}>Пищевая ценность</Text>
      <TextInput
        style={styles.input}
        placeholder="Введите пищевую ценность"
        value={nutritionalValue}
        onChangeText={setNutritionalValue}
      />

      <Button title="Сгенерировать" onPress={generateQRCode} />

      {qrData && (
        <View style={styles.qrContainer}>
          <Text style={styles.label}>Ваш QR-код:</Text>
          <QRCode
            value={JSON.stringify(qrData)}
            size={200}
            getRef={qrCodeRef}
          />
          {Platform.OS === 'web' && (
            <TouchableOpacity style={styles.downloadButton} onPress={downloadQRCode}>
              <Text style={styles.downloadButtonText}>Скачать QR-код</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 16,
  },
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  downloadButton: {
    marginTop: 10,
    backgroundColor: '#4CAF50',
    padding: 10,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

// export default QRCodeGenerator;
