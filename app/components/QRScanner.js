// 
// Компонент блока сканирования QR кода
// 
// Вообще не понятная штука, если честно 😅 
// 

import { Html5QrcodeScanner } from 'html5-qrcode';
import { useEffect, useRef } from 'react';

// зачем-то ставить регион для сканера.
// Так в документации 😊
const qrcodeRegionId = "html5qr-code-full-region";

// сам блок
const QRCodeScanner = () => {
  const scannerRef = useRef(null);

  useEffect(() => {
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
    };

    // если код был успешно отсканирован
    const onScanSuccess = (decodedText, decodedResult) => {
      console.log(`Code matched = ${decodedText}`, decodedResult);
    };

    scannerRef.current = new Html5QrcodeScanner(qrcodeRegionId, config, false);
    scannerRef.current.render(onScanSuccess); // Передаем обработчик ошибок

    return () => {
      scannerRef.current.clear().catch(error => {
        console.error("Failed to clear html5QrcodeScanner. ", error);
      });
    };
  }, []);

  return (
      <div id={qrcodeRegionId} style={{ width: '100%', height: '100%' }}></div>
  );
};

export default QRCodeScanner;