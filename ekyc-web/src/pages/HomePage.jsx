import { useState } from 'react';
import { Camera, Upload, CheckCircle, Loader, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ImageUpload from '../components/ImageUpload';
import CameraCapture from '../components/CameraCapture';
import VerificationResult from '../components/VerificationResult';
import { verifyFace, checkHealth } from '../services/api';

export default function HomePage() {
  const [step, setStep] = useState(1);
  const [idCardImage, setIdCardImage] = useState(null);
  const [selfieImage, setSelfieImage] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState('');
  const [apiStatus, setApiStatus] = useState(null);
  const navigate = useNavigate();

  // Check API health on mount
  useState(() => {
    checkHealth()
      .then((data) => setApiStatus(data))
      .catch(() => setApiStatus({ status: 'error' }));
  }, []);

  const handleIdCardSelect = (file) => {
    setIdCardImage(file);
    setError('');
  };

  const handleSelfieSelect = (file) => {
    setSelfieImage(file);
    setError('');
  };

  const handleNextStep = () => {
    if (step === 1 && idCardImage) {
      setStep(2);
    } else if (step === 2 && selfieImage) {
      handleVerify();
    }
  };

  const handleVerify = async () => {
    if (!idCardImage || !selfieImage) {
      setError('Vui lòng cung cấp đầy đủ ảnh CMND/CCCD và selfie');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await verifyFace(idCardImage, selfieImage);
      setVerificationResult(result);
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.detail || 'Có lỗi xảy ra khi xác thực. Vui lòng thử lại.');
      console.error('Verification error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStep(1);
    setIdCardImage(null);
    setSelfieImage(null);
    setVerificationResult(null);
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">eKYC</h1>
              <p className="text-sm text-gray-600 mt-1">Xác Thực Danh Tính Điện Tử</p>
            </div>
            <div className="flex items-center gap-4">
              {apiStatus && (
                <div className={`px-4 py-2 rounded-full text-sm font-medium ${
                  apiStatus.status === 'healthy'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-red-100 text-red-700'
                }`}>
                  {apiStatus.status === 'healthy' ? '● Hệ thống hoạt động' : '● Hệ thống gặp sự cố'}
                </div>
              )}
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      {step < 3 && (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-semibold ${
                  step >= s ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {step > s ? <CheckCircle className="w-6 h-6" /> : s}
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${step >= s ? 'text-primary-600' : 'text-gray-600'}`}>
                    {s === 1 ? 'CMND/CCCD' : 'Selfie'}
                  </p>
                </div>
                {s < 2 && (
                  <div className={`flex-1 h-1 mx-4 ${step > s ? 'bg-primary-600' : 'bg-gray-200'}`} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {step === 1 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <ImageUpload
              title="Bước 1: Tải ảnh CMND/CCCD"
              description="Vui lòng tải lên ảnh CMND hoặc CCCD của bạn. Đảm bảo ảnh rõ ràng và đầy đủ thông tin."
              onImageSelect={handleIdCardSelect}
              selectedImage={idCardImage}
            />
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleNextStep}
                disabled={!idCardImage}
                className="px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
              >
                Tiếp Theo
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="bg-white rounded-xl shadow-lg p-8">
            <ImageUpload
              title="Bước 2: Ảnh Selfie"
              description="Chụp hoặc tải lên ảnh selfie của bạn. Đảm bảo khuôn mặt rõ ràng và nhìn thẳng vào camera."
              onImageSelect={handleSelfieSelect}
              selectedImage={selfieImage}
            />

            <div className="mt-6 text-center">
              <p className="text-gray-600 mb-4">hoặc</p>
              <button
                onClick={() => setShowCamera(true)}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 mx-auto"
              >
                <Camera className="w-5 h-5" />
                Chụp Ảnh Selfie
              </button>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Quay Lại
              </button>
              <button
                onClick={handleNextStep}
                disabled={!selfieImage || loading}
                className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  'Xác Thực'
                )}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <VerificationResult result={verificationResult} onReset={handleReset} />
        )}
      </main>

      {/* Camera Modal */}
      {showCamera && (
        <CameraCapture
          onCapture={handleSelfieSelect}
          onClose={() => setShowCamera(false)}
        />
      )}

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <p className="text-center text-gray-600 text-sm">
            © 2024 eKYC System. Powered by VGGFace2 & FastAPI.
          </p>
        </div>
      </footer>
    </div>
  );
}
