import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { validateImageFile, createPreviewURL, revokePreviewURL } from '../utils/imageUtils';

export default function ImageUpload({ title, description, onImageSelect, selectedImage }) {
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validation = validateImageFile(file);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    setError('');
    const previewUrl = createPreviewURL(file);
    setPreview(previewUrl);
    onImageSelect(file);
  };

  const handleClear = () => {
    if (preview) {
      revokePreviewURL(preview);
    }
    setPreview(null);
    setError('');
    onImageSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      {description && <p className="text-sm text-gray-600 mb-4">{description}</p>}

      <div className="relative">
        {!preview ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center cursor-pointer hover:border-primary-500 hover:bg-primary-50 transition-all duration-200"
          >
            <Upload className="w-12 h-12 mx-auto text-gray-400 mb-3" />
            <p className="text-gray-600 mb-1">Nhấp để chọn ảnh</p>
            <p className="text-sm text-gray-400">hoặc kéo thả ảnh vào đây</p>
            <p className="text-xs text-gray-400 mt-2">JPG, PNG, WEBP (tối đa 10MB)</p>
          </div>
        ) : (
          <div className="relative rounded-lg overflow-hidden border-2 border-gray-200">
            <img
              src={preview}
              alt="Preview"
              className="w-full h-64 object-contain bg-gray-50"
            />
            <button
              onClick={handleClear}
              className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors shadow-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/jpg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {error && (
        <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}
