// 
// Страница сканирования
// Толком не используется, но требует в себе наличие объекта navigate!
// 

import QRCodeScanner from '../components/QRScanner';

// основной экспортируемый компонент
export const QRScreen = ({ navigate }) => {
  return (
      <QRCodeScanner />
  );
}

