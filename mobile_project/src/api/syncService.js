import { getUnsyncedPhotos, markPhotoAsSynced } from '../database/database';
import { createPost } from './api';
import { uploadImage } from './cloudinary';

export const syncData = async (token) => {
  try {
    const unsyncedItems = await getUnsyncedPhotos();

    if (!unsyncedItems || unsyncedItems.length === 0) return;

    console.log(`[Sync] Знайдено ${unsyncedItems.length} об'єктів для синхронізації...`);

    for (const item of unsyncedItems) {
      try {
        let remoteUrl = item.image;

        if (item.image && item.image.startsWith('file')) {
          console.log(`[Sync] Завантаження фото для запису ${item.id} у Cloudinary...`);
          remoteUrl = await uploadImage(item.image);
        }

        if (remoteUrl) {
          await createPost({
            description: item.description,
            image: remoteUrl,
            latitude: item.latitude,
            longitude: item.longitude,
            date: item.created_at,
            category: item.category || "General"
          }, token);

          await markPhotoAsSynced(item.id);
          console.log(`[Sync] Запис ${item.id} синхронізовано!`);
        }
      } catch (err) {
        console.error(`[Sync] Помилка синхронізації запису ${item.id}:`, err.message);
      }
    }
  } catch (error) {
    console.error("[Sync Service Error]:", error);
  }
};