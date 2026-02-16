import { Platform } from 'react-native';

const CLOUD_NAME = "dvf7vqr1s";
const UPLOAD_PRESET = "archive";

export const uploadImage = async (imageUri) => {
  if (!imageUri) return null;

  const data = new FormData();

  data.append('upload_preset', UPLOAD_PRESET);

  const filename = imageUri.split('/').pop();
  const match = /\.(\w+)$/.exec(filename || '');
  const type = match ? `image/${match[1]}` : `image/jpeg`;

  const cleanUri = Platform.OS === 'android' ? imageUri : imageUri.replace('file://', '');

  data.append('file', {
    uri: cleanUri,
    name: filename || 'photo.jpg',
    type: type,
  });

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
      method: 'POST',
      body: data,
    });

    const result = await response.json();

    if (!response.ok) {
      console.error("Cloudinary Detailed Error:", result);
      throw new Error(result.error?.message || "Upload failed");
    }

    console.log("Success! Image URL:", result.secure_url);
    return result.secure_url;

  } catch (error) {
    console.error("Cloudinary Error:", error.message);
    return null;
  }
};