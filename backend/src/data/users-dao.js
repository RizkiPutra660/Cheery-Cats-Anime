// src/data/users-dao.js
import { getDatabase } from "./database.js";
import { updateDatabase } from "./util.js";

// Retrieve all users, along with their profile information and article count
export async function getAllUsers() {
    const db = await getDatabase();

    return await db.all(`
        SELECT u.id, u.username, u.fname, u.lname, u.dateOfBirth, u.bio, u.avatar, u.isAdmin,
               (SELECT COUNT(*) FROM articles a WHERE a.author_id = u.id) AS articleCount
        FROM users u
    `);
}

// Retrieve a user by username
export async function getUserByUsername(username) {
    const db = await getDatabase();
    return await db.get("SELECT * FROM users WHERE username = ?", [username]);
}

export async function getUserById(userId) {
    const db = await getDatabase();

    // Query to retrieve the user information by ID
    return await db.get("SELECT * FROM users WHERE id = ?", [userId]);
}

// Create a new user with a hashed password (password is already hashed before this function is called)
export async function createUser(username, password, fname, lname, dateOfBirth, bio, avatar, isAdmin = false) {
    const db = await getDatabase();

    // Insert the new user into the database
    await db.run(
        "INSERT INTO users (username, password, fname, lname, dateOfBirth, bio, avatar, isAdmin) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [username, password, fname, lname, dateOfBirth, bio, avatar, isAdmin]
    );
}

//Delete User
export async function deleteUser(id) {
    const db = await getDatabase();

    return await db.run("DELETE FROM users WHERE id = ?", [parseInt(id)]);
}

export async function updateUser(id, updateData) {
    const db = await getDatabase();

    // Filter out undefined or null fields from updateData
    const filteredData = {};
    for (const key in updateData) {
        if (updateData[key] !== undefined && updateData[key] !== null) {
            filteredData[key] = updateData[key];
        }
    }

    // Call the generic update function to update the user info in the database
    return await updateDatabase(db, 'users', filteredData, id, 'id');
}

// Check if a username is available
export async function isUsernameAvailable(username) {
    const db = await getDatabase();
    const user = await db.get("SELECT * FROM users WHERE username = ?", [username]);
    return !user; // Returns true if username is available, false if it exists
}


