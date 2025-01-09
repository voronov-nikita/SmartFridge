// 
// Страница сканирования
// 
// 


import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import QRCodeScanner from '../components/QRScanner';

// основной экспортируемый компонент
export const QRScreen = () => {
  return (
    <QRCodeScanner />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
