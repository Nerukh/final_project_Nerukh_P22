import * as SQLite from "expo-sqlite";

export const openDatabase = async () => {
    return await SQLite.openDatabaseAsync('mydatabase.db');
}

export const createTable = async () => {
    const database = await openDatabase();
    try {
        await database.execAsync(`
            PRAGMA journal_mode = WAL;
            create table if not exists users(
                id integer primary key autoincrement,
                name text not null
            );
        `);
        console.log('Table created')
    } catch (error) {
        console.error("Error creating table:", error)
    }
}

export const insertUser = async (name) => {
    if (!name) {
        return;
    }
    const database = await openDatabase();
    try {
        const result = await database.runAsync('insert into users (name) values (?)', name);
        console.log('User inserted with id:', result.lastInsertRowId);
    } catch (error) {
        console.error('Error insert user:', error);
    }
}

export const fetchUsers = async () => {
    const database = await openDatabase();
    try {
        const allRows = await database.getAllAsync('select * from users');
        console.log('All Users:', allRows);
        return allRows;
    } catch (error) {
        console.error('Error fetching users:', error)
    }
};

export const updateUser = async (id, name) => {
    if (!id || !name) {
        return;
    }
    const database = await openDatabase();
    try {
        const res = await database.runAsync('update users set name = ? where id = ?', name, id)
        console.log('User updated: ', res);
    } catch (error) {
        console.error('Error updating user: ', error)
    }
}

export const deleteUser = async (id) => {
    const database = await openDatabase();
    // if (!id) {
    //     return;
    // }
    try {
        const result = await database.runAsync('delete from users where id = ?', id);
        console.log('User deleted:', result);
    } catch (error) {
        console.error('Error deleting users: ', error)
    }
}
