/**
 * Convert base64 data URL to File object
 */
export const dataURLtoFile = (dataUrl, filename) => {
  const arr = dataUrl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
};

/**
 * Validate image file
 */
export const validateImageFile = (file) => {
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (!file) {
    return { valid: false, error: 'Vui lòng chọn file' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)' };
  }

  if (file.size > maxSize) {
    return { valid: false, error: 'Kích thước file không được vượt quá 10MB' };
  }

  return { valid: true };
};

/**
 * Create preview URL from file
 */
export const createPreviewURL = (file) => {
  return URL.createObjectURL(file);
};

/**
 * Revoke preview URL
 */
export const revokePreviewURL = (url) => {
  URL.revokeObjectURL(url);
};
