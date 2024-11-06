import express from "express";
import bcrypt from "bcrypt";
import {
    getAllUsers,
    getUserByUsername,
    createUser,
    deleteUser,
    updateUser,
    getUserById,
    isUsernameAvailable
} from "../../data/users-dao.js";
import {
    verifyAdmin,
    verifyAuthenticated,
    requiresAuthentication
} from "../../middleware/auth.js";
import multer from "multer"; // For handling file uploads
import { v4 as uuid } from "uuid";
import fs from "fs";

const upload = multer({ dest: "public/images/avatars" });

const router = express.Router();

// Retrieve all users (Admin only)
router.get("/", verifyAdmin, async (req, res) => {
    try {
        // Retrieve all users and their associated article count
        const users = await getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error("Error retrieving users:", error);
        res.status(500).json({ message: "Error retrieving users." });
    }
});

// Get current user's information
router.get('/me', requiresAuthentication, async (req, res) => {
    return res.json(req.user);
});

/**
 * Register a new user.
 * - Receives user details in the request body.
 * - Hashes the password and stores the new user in the database.
 */
router.post("/register", upload.single("avatar"), async (req, res) => {
    const { username, password, fname, lname, dateOfBirth, bio } = req.body;

    if (!username || !password || !fname || !dateOfBirth) {
        return res.status(400).json({ message: "Required fields are missing." });
    }

    try {
        const existingUser = await getUserByUsername(username);
        if (existingUser) {
            return res.status(409).json({ message: "Username already exists." });
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(password, 10);

        let avatarUrl = req.body.avatar;
        if (req.file) {
            const originalname = req.file.originalname;
            const fileExtension = originalname.substring(originalname.lastIndexOf("."));
            const newFileName = uuid() + fileExtension;
            fs.renameSync(req.file.path, `public/images/avatars/${newFileName}`);
            avatarUrl = `/images/avatars/${newFileName}`; // Save the URL for the uploaded avatar
        }

        await createUser(username, hashedPassword, fname, lname, dateOfBirth, bio, avatarUrl);
        return res.sendStatus(201);
    } catch (error) {
        console.error("Error registering user:", error);
        res.status(500).json({ message: "Error registering user." });
    }
});

/**
 * Update user information.
 * - Receives user details to be updated in the request body.
 * - If password is included, hashes the new password before updating.
 * - If a new avatar is uploaded, updates the avatar URL.
 */
router.patch('/:id', verifyAuthenticated, upload.single('avatar'), async (req, res) => {
    const userId = parseInt(req.params.id);
    let updateData = req.body;

    // Check if the user ID is valid
    if (!userId) {
        return res.status(400).json({ message: "Invalid user ID" });
    }

    try {
        // Check if the user is trying to update their own profile or is an admin
        if (req.user.userId !== userId && !req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied. You can only update your own profile." });
        }

        // If the update includes a new password, hash it
        if (updateData.password) {
            updateData.password = await bcrypt.hash(updateData.password, 10);
        }

        if (req.file) {
            updateData.avatar = `/images/avatars/${req.file.filename}`;
        }

        // Update the user in the database
        const result = await updateUser(userId, updateData);

        if (result.changes > 0) {
            // Return success if the user was updated
            res.status(200).json({ message: "User updated successfully" });
        } else {
            // Return 404 if the user was not found
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        console.error("Error updating user:", error);
        res.status(500).json({ message: "Error updating user information" });
    }
});

// Delete a user (Admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
    const userId = parseInt(req.params.id);

    if (!userId) {
        return res.status(400).json({ error: 'User ID doesn\'t exist' });
    }

    try {
        await deleteUser(userId);
        // Send a success response
        res.status(204).send(); // No content response
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Delete the current user
router.delete('/me/:id', requiresAuthentication, async (req, res) => {
    const userId = parseInt(req.params.id);

    if (!userId) {
        return res.status(400).json({ error: 'User ID doesn\'t exist' });
    }

    try {
        await deleteUser(userId);
        // Send a success response
        res.status(204).send(); // No content response
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// Get user by ID
router.get("/:id", async (req, res) => {
    const id = parseInt(req.params.id);

    if (!id || id < 0) {
        return res.status(400).json({ error: 'User ID doesn\'t exist' });
    }

    try {
        const user = await getUserById(id);

        // Send a success response
        if (user) {
            res.status(200).json(user);
        } else {
            res.status(500).json({ error: 'User ID doesn\'t exist' }); // No content response
        }
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ error: 'Failed to get user' });
    }
});

// Check if a username is available
router.post("/check-username", async (req, res) => {
    const { username } = req.body;

    if (!username) {
        return res.status(400).json({ message: "Username is required." });
    }

    try {
        const isAvailable = await isUsernameAvailable(username);
        if (!isAvailable) {
            return res.status(409).json({ message: "Username already exists." });
        }
        res.status(200).json({ message: "Username is available." });
    } catch (error) {
        console.error("Error checking username availability:", error);
        res.status(500).json({ message: "Error checking username availability." });
    }
});

export default router;
