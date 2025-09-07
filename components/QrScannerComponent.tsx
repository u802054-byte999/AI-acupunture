// FIX: Corrected typo in React import statement to properly import hooks.
import React, { useState, useRef, useEffect } from 'react';

// This is a global variable from the script loaded in index.html
declare var Html5Qrcode: any;

interface QrScannerComponentProps {
    onScan: (data: string) => void;
    autoStart?: boolean;
    showCloseButton?: boolean;
}

const QrScannerComponent: React.FC<QrScannerComponentProps> = ({ onScan, autoStart = false, showCloseButton = true }) => {
    const [isScanning, setIsScanning] = useState(autoStart);
    const scannerRef = useRef<any>(null);
    const scannerRegionId = "qr-scanner-region";

    const handleScanResult = (qrString: string) => {
        if (qrString.length < 8) {
            return qrString;
        }
        const last8 = qrString.slice(-8);
        if (last8.charAt(0) === '0') {
            return qrString.slice(-7);
        }
        return last8;
    };
    
    useEffect(() => {
        if (isScanning && !scannerRef.current) {
            const html5QrCode = new Html5Qrcode(scannerRegionId);
            scannerRef.current = html5QrCode;

            const qrCodeSuccessCallback = (decodedText: string, decodedResult: any) => {
                const processedText = handleScanResult(decodedText);
                onScan(processedText);
                setIsScanning(false);
            };

            const config = { fps: 10, qrbox: { width: 250, height: 250 }, aspectRatio: 1.0 };

            html5QrCode.start({ facingMode: "environment" }, config, qrCodeSuccessCallback, undefined)
                .catch((err: any) => {
                    console.error("Unable to start scanning.", err);
                    alert("無法啟動相機。請確認已授權相機權限。");
                    setIsScanning(false);
                });
        }

        return () => {
            if (scannerRef.current && scannerRef.current.isScanning) {
                scannerRef.current.stop()
                    .then(() => {
                        scannerRef.current = null;
                    })
                    .catch((err: any) => console.error("Failed to stop scanner on unmount.", err));
            }
        };
    }, [isScanning, onScan]);

    const stopScanning = () => {
        if (scannerRef.current && scannerRef.current.isScanning) {
            scannerRef.current.stop().finally(() => {
                 setIsScanning(false);
                 scannerRef.current = null;
            });
        } else {
             setIsScanning(false);
        }
    }

    return (
        <div className="my-4 p-4 border rounded-lg bg-white">
            <h3 className="text-lg font-semibold mb-2">QR Code 掃描器</h3>
            {!isScanning ? (
                <button onClick={() => setIsScanning(true)} className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors">
                    啟動相機
                </button>
            ) : (
                <div className="space-y-4">
                    <div id={scannerRegionId} className="w-full"></div>
                    {showCloseButton && (
                         <button onClick={stopScanning} className="w-full bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors">
                            關閉相機
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default QrScannerComponent;