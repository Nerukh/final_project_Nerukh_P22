import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('mydatabase.db');

export const initDB = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image TEXT,
        latitude REAL,
        longitude REAL,
        description TEXT,
        category TEXT,
        created_at TEXT,
        user_id INTEGER,
        user_email TEXT,
        synced INTEGER DEFAULT 0
      );
    `);

    const migrations = [
       { name: 'description', type: 'TEXT' },
       { name: 'category', type: 'TEXT' },
       { name: 'synced', type: 'INTEGER DEFAULT 0' },
       { name: 'user_email', type: 'TEXT' }
    ];

    migrations.forEach(col => {
      try {
        db.execSync(`ALTER TABLE photos ADD COLUMN ${col.name} ${col.type};`);
      } catch (e) {
      }
    });

    console.log('SQLite initialized successfully');
  } catch (error) {
    console.error('Init DB error:', error);
  }
};


export const insertPhoto = async (data) => {
  try {
    return await db.runAsync(
      `INSERT INTO photos (image, latitude, longitude, description, category, created_at, user_id, user_email, synced)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [data.image, data.latitude, data.longitude, data.description, data.category, data.created_at, data.user_id, data.user_email, data.synced]
    );
  } catch (error) {
    console.error("Insert error:", error);
    throw error;
  }
};

export const getAllPhotos = async () => {
  try {
    return await db.getAllAsync('SELECT * FROM photos ORDER BY id DESC');
  } catch (error) {
    console.error("Error getting all photos:", error);
    return [];
  }
};

export const getUnsyncedPhotos = async () => {
  try {
    return await db.getAllAsync('SELECT * FROM photos WHERE synced = 0');
  } catch (error) {
    console.error("Error getting unsynced:", error);
    return [];
  }
};

export const markPhotoAsSynced = async (id) => {
  try {
    return await db.runAsync('UPDATE photos SET synced = 1 WHERE id = ?', [id]);
  } catch (error) {
    console.error("Sync update error:", error);
  }
};

export const clearAllPhotos = async () => {
  try {
    await db.runAsync('DELETE FROM photos');
    console.log("Локальну базу очищено");
  } catch (error) {
    console.error("Помилка очищення:", error);
  }
};

export const getPhotosByDate = async (dateString) => {
  try {
    return await db.getAllAsync(
      "SELECT * FROM photos WHERE created_at LIKE ? ORDER BY id DESC",
      [`${dateString}%`]
    );
  } catch (error) {
    console.error("Date filter error:", error);
    return [];
  }
};

export const getViolationCounts = async () => {
  try {
    const result = await db.getAllAsync(
      `SELECT substr(created_at, 1, 10) as date, count(*) as count
       FROM photos
       GROUP BY substr(created_at, 1, 10)`
    );

    const countsObject = {};
    result.forEach(item => {
      countsObject[item.date] = item.count;
    });

    return countsObject;
  } catch (error) {
    console.error("Помилка підрахунку порушень:", error);
    return {};
  }
};

export default db;