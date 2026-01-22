import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('mydatabase.db');

export const initDB = () => {
  try {
    db.execSync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE,
        password TEXT
      );
    `);

    db.execSync(`
      CREATE TABLE IF NOT EXISTS photos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        image TEXT,
        latitude REAL,
        longitude REAL,
        created_at TEXT,
        user_id INTEGER
      );
    `);
    console.log('Database & Tables initialized');
  } catch (error) {
    console.error('Init DB error:', error);
  }
};

export const registerUser = async (email, password) => {
  const result = await db.runAsync('INSERT INTO users (email, password) VALUES (?, ?)', [email, password]);
  return result.lastInsertRowId;
};

export const loginUser = async (email, password) => {
  try {
    const user = await db.getFirstAsync(
      'SELECT * FROM users WHERE email = ? AND password = ?',
      [email, password]
    );
    return user;
  } catch (error) {
    console.error('Login error:', error);
    return null;
  }
};


export const insertPhoto = async ({ image, latitude, longitude, created_at, user_id }) => {
  return await db.runAsync(
    'INSERT INTO photos (image, latitude, longitude, created_at, user_id) VALUES (?, ?, ?, ?, ?)',
    [image, latitude, longitude, created_at, user_id]
  );
};

export const getPhotos = async (user_id) => {
  return await db.getAllAsync('SELECT * FROM photos WHERE user_id = ? ORDER BY id DESC', [user_id]);
};