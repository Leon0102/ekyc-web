import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Check, X } from 'lucide-react';
import { dataURLtoFile } from '../utils/imageUtils';

export default function CameraCapture({ onCapture, onClose }) {
  const [capturing, setCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const webcamRef = useRef(null);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: 'user',
  };

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      setCapturedImage(imageSrc);
      setCapturing(true);
    }
  }, [webcamRef]);

  const retake = () => {
    setCapturedImage(null);
    setCapturing(false);
  };

  const confirmCapture = () => {
    if (capturedImage) {
      const file = dataURLtoFile(capturedImage, `selfie-${Date.now()}.jpg`);
      onCapture(file);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Chụp Ảnh Selfie</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="relative bg-gray-900 rounded-lg overflow-hidden mb-4">
          {!capturedImage ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full"
            />
          ) : (
            <img src={capturedImage} alt="Captured" className="w-full" />
          )}
        </div>

        <div className="flex gap-3 justify-center">
          {!capturing ? (
            <>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={capture}
                className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center gap-2"
              >
                <Camera className="w-5 h-5" />
                Chụp Ảnh
              </button>
            </>
          ) : (
            <>
              <button
                onClick={retake}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Chụp Lại
              </button>
              <button
                onClick={confirmCapture}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2"
              >
                <Check className="w-5 h-5" />
                Xác Nhận
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
