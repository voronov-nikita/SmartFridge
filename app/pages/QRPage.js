import React from 'react';
import { StyleSheet, Text, View, Alert } from 'react-native';
import QRCodeScanner from 'react-native-qrcode-scanner';
import { RNCamera } from 'react-native-camera';

const QRCodeReader = () => {
  const onSuccess = (e) => {
    Alert.alert('QR Code Scanned', e.data);
    console.log('QR Code Data:', e.data); // Содержимое QR-кода
  };

  return (
    <QRCodeScanner
      onRead={onSuccess}
      flashMode={RNCamera.Constants.FlashMode.auto}
      topContent={
        <Text style={styles.centerText}>
          Наведите камеру на QR-код для сканирования.
        </Text>
      }
      bottomContent={
        <Text style={styles.centerText}>Сканируйте код и получите данные!</Text>
      }
    />
  );
};

const styles = StyleSheet.create({
  centerText: {
    fontSize: 16,
    textAlign: 'center',
    padding: 10,
  },
});

export default QRCodeReader;
