import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { getUserByUsername} from "../../data/users-dao.js";

const router = express.Router();

/**
 * Login the user and return a JWT token as an HTTP-only cookie.
 */
router.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await getUserByUsername(username);
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: "Invalid username or password." });
        }

        // Create the JWT token which contain users' ID and isAdmin data 
        const token = jwt.sign({ userId: user.id, isAdmin: user.isAdmin }, process.env.SECRET_KEY, { expiresIn: "1h" });

        // Set the JWT token as an HTTP-only cookie
        res.cookie("authToken", token, { httpOnly: true, maxAge: 3600000 }) // 1 hour
            .json({ message: "Login successful", username: user.username });
    } catch (error) {
        console.error("Error logging in:", error);
        res.status(500).json({ message: "Error logging in." });
    }
});

/**
 * Logout the user by clearing the JWT token cookie.
 */
router.delete("/logout", (req, res) => {
    // Clear the authToken cookie
    res.cookie("authToken", "", { httpOnly: true, expires: new Date(0) })
        .sendStatus(204);
});

export default router;
