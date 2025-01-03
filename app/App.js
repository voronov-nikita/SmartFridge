import { Html5Qrcode } from "html5-qrcode";
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [isEnabled, setEnabled] = useState(false);
  const [qrMessage, setQrMessage] = useState("");

  useEffect(() => {
    const config = { fps: 10, qrbox: { width: 200, height: 200 } };

    const html5QrCode = new Html5Qrcode("qrCodeContainer");

    const qrScanerStop = () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode
          .stop()
          .then((ignore) => console.log("Scaner stop"))
          .catch((err) => console.log("Scaner error"));
      }
    };

    const qrCodeSuccess = (decodedText) => {
      setQrMessage(decodedText);
      setEnabled(false);
    };

    if (isEnabled) {
      html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccess);
      setQrMessage("");
    } else {
      qrScanerStop();
    }

    return () => {
      qrScanerStop();
    };
  }, [isEnabled]);

  return (
    <div className="scaner">
      <div id="qrCodeContainer" />
      {qrMessage && <div className="qr-message">{qrMessage}</div>}
      <button className="start-button" onClick={() => setEnabled(!isEnabled)}>
        {isEnabled ? "On" : "Off"}
      </button>
    </div>
  );
}

export default App;