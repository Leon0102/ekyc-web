import { CheckCircle, XCircle, AlertCircle, ArrowLeft } from 'lucide-react';

export default function VerificationResult({ result, onReset }) {
  if (!result) return null;

  const isVerified = result.verified;
  const confidence = (1 - result.confidence).toFixed(4); // Convert distance to similarity
  const percentage = ((1 - result.confidence) * 100).toFixed(2);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className={`rounded-lg p-8 ${isVerified ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
        <div className="flex items-center justify-center mb-6">
          {isVerified ? (
            <CheckCircle className="w-20 h-20 text-green-600" />
          ) : (
            <XCircle className="w-20 h-20 text-red-600" />
          )}
        </div>

        <h2 className={`text-3xl font-bold text-center mb-4 ${isVerified ? 'text-green-700' : 'text-red-700'}`}>
          {isVerified ? 'Xác Thực Thành Công!' : 'Xác Thực Thất Bại'}
        </h2>

        <p className="text-center text-gray-700 mb-6">
          {isVerified
            ? 'Khuôn mặt trong CMND/CCCD khớp với ảnh selfie của bạn.'
            : 'Khuôn mặt không khớp. Vui lòng thử lại với ảnh rõ ràng hơn.'}
        </p>

        <div className="bg-white rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-gray-800 mb-4">Chi Tiết Kết Quả</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Trạng thái:</span>
              <span className={`font-semibold ${isVerified ? 'text-green-600' : 'text-red-600'}`}>
                {isVerified ? 'Đã xác thực' : 'Không xác thực'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Độ tương đồng:</span>
              <span className="font-semibold text-gray-800">{percentage}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Khoảng cách:</span>
              <span className="font-semibold text-gray-800">{result.confidence.toFixed(4)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Ngưỡng:</span>
              <span className="font-semibold text-gray-800">{result.threshold}</span>
            </div>
          </div>
        </div>

        {!isVerified && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-yellow-800 mb-2">Gợi ý:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Đảm bảo ảnh CMND/CCCD rõ ràng và không bị mờ</li>
                  <li>• Chụp ảnh selfie trong điều kiện ánh sáng tốt</li>
                  <li>• Đảm bảo khuôn mặt nhìn thẳng vào camera</li>
                  <li>• Không đeo khẩu trang hoặc kính râm</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onReset}
            className="flex-1 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Xác Thực Lại
          </button>
        </div>
      </div>
    </div>
  );
}
