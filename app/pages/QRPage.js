// 
// Страница сканирования
// 
// 


import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

import QRCodeScanner from '../components/QRScanner';

// основной экспортируемый компонент
export const QRScreen = ({ navigate }) => {
  return (
      <QRCodeScanner />
  );
}

