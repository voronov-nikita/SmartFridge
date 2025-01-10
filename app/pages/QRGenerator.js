import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
} from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Calendar } from 'react-native-calendars';
import { Picker } from '@react-native-picker/picker';

// Функция для форматирования даты
const formatDate = (date, format = 'DD-MM-YYYY') => {
    const [year, month, day] = date.split('-');
    if (format === 'DD-MM-YYYY') return `${day}.${month}.${year}`;
    return date; // По умолчанию возвращаем дату без изменений
  };

export const QRCodeGenerator = () => {
  const [productName, setProductName] = useState('');
  const [productType, setProductType] = useState('');
  const [manufactureDate, setManufactureDate] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [mass, setMass] = useState('');
  const [unit, setUnit] = useState('кг');
  const [nutritionalValue, setNutritionalValue] = useState('');
  const [qrData, setQrData] = useState(null);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [selectedDateType, setSelectedDateType] = useState(null);

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
      const imgWidth = 400;
      const imgHeight = 400;

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.width = imgWidth;
      canvas.height = imgHeight;

      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, imgWidth, imgHeight);

      const qrImage = new Image();
      qrImage.onload = () => {
        const padding = 50;
        const qrSize = imgWidth - padding * 2;

        ctx.drawImage(qrImage, padding, padding, qrSize, qrSize);

        const finalDataURL = canvas.toDataURL('image/png');
        link.href = finalDataURL;
        link.download = 'qrcode_with_padding.png';
        link.click();
      };
      qrImage.src = `data:image/png;base64,${dataURL}`;
    });
  };

  const onDateSelect = (date) => {
    if (selectedDateType === 'manufacture') {
      setManufactureDate(date.dateString);
    } else if (selectedDateType === 'expiry') {
      setExpiryDate(date.dateString);
    }
    setIsDatePickerVisible(false);
  };

  const openDatePicker = (type) => {
    setSelectedDateType(type);
    setIsDatePickerVisible(true);
  };

  const closeDatePicker = () => {
    setIsDatePickerVisible(false);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Генерация QR-кода для продукта</Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Название продукта</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите название"
          value={productName}
          onChangeText={setProductName}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Тип продукта</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите тип продукта"
          value={productType}
          onChangeText={setProductType}
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Дата изготовления</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => openDatePicker('manufacture')}
        >
          <Text style={styles.dateText}>
            {manufactureDate
              ? formatDate(manufactureDate, 'DD-MM-YYYY')
              : 'Выберите дату'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Дата истечения срока годности</Text>
        <TouchableOpacity
          style={styles.dateInput}
          onPress={() => openDatePicker('expiry')}
        >
          <Text style={styles.dateText}>
            {expiryDate ? formatDate(expiryDate, 'DD-MM-YYYY') : 'Выберите дату'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Масса</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите массу"
          keyboardType="numeric"
          value={mass}
          onChangeText={setMass}
        />
      </View>

      <Picker
        selectedValue={unit}
        onValueChange={(itemValue) => setUnit(itemValue)}
        style={styles.picker}>
        <Picker.Item label="Килограммы (кг)" value="кг" />
        <Picker.Item label="Граммы (г)" value="г" />
        <Picker.Item label="Литры (л)" value="л" />
        <Picker.Item label="Миллилитры (мл)" value="мл" />
      </Picker>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Пищевая ценность</Text>
        <TextInput
          style={styles.input}
          placeholder="Введите пищевую ценность"
          value={nutritionalValue}
          onChangeText={setNutritionalValue}
        />
      </View>

      <TouchableOpacity style={styles.generateButton} onPress={generateQRCode}>
        <Text style={styles.generateButtonText}>Сгенерировать</Text>
      </TouchableOpacity>

      {qrData && (
        <View style={styles.qrContainer}>
          <Text style={styles.label}>Ваш QR-код:</Text>
          <QRCode
            value={JSON.stringify(qrData)}
            size={200}
            getRef={qrCodeRef}
            backgroundColor="white"
          />
          {Platform.OS === 'web' && (
            <TouchableOpacity style={styles.downloadButton} onPress={downloadQRCode}>
              <Text style={styles.downloadButtonText}>Скачать QR-код</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <Modal visible={isDatePickerVisible} transparent>
        <View style={styles.modalBackground}>
          <View style={styles.calendarWrapper}>
            <Calendar
              onDayPress={onDateSelect}
              markedDates={{
                [manufactureDate]: { selected: true, selectedColor: 'blue' },
                [expiryDate]: { selected: true, selectedColor: 'blue' },
              }}
            />
            <TouchableOpacity style={styles.closeButton} onPress={closeDatePicker}>
              <Text style={styles.closeButtonText}>Закрыть</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = {
  container: {
    flexGrow: 1,
    padding: 16,
    backgroundColor: '#f9f9f9',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    color: '#555',
  },
  input: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  dateInput: {
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    justifyContent: 'center',
  },
  dateText: {
    color: '#555',
  },
  generateButton: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  generateButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  qrContainer: {
    marginTop: 20,
    alignItems: 'center',
  },
  downloadButton: {
    marginTop: 10,
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 8,
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarWrapper: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    width: '90%',
  },
  closeButton: {
    backgroundColor: '#FF5252',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  closeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
};

export default QRCodeGenerator;
