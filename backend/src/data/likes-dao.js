import { getDatabase } from "./database.js";

// Function to add a like to an article by a specific user
export async function likeArticle(user_id, article_id) {
    const db = await getDatabase();

    try {
        await db.run(
            `INSERT INTO likes (user_id, article_id) VALUES (?, ?)`,
            [parseInt(user_id), parseInt(article_id)]
        );
        console.log(`Like added for user ${user_id} on article ${article_id}`);
    } catch (error) {
        if (error.message.includes("UNIQUE constraint failed")) {
            console.error("User has already liked this article");
            throw new Error("You have already liked this article");
        } else {
            console.error("Error in likeArticle:", error); // Logging error details
            throw error;
        }
    }
}

// Function to remove a like from an article by a specific user
export async function unlikeArticle(user_id, article_id) {
    const db = await getDatabase();

    try {
        await db.run(
            `DELETE FROM likes WHERE user_id = ? AND article_id = ?`,
            [parseInt(user_id), parseInt(article_id)]
        );
        console.log(`Like removed for user ${user_id} on article ${article_id}`);
    } catch (error) {
        console.error("Error in unlikeArticle:", error); // Logging error details
        throw error;
    }
}

// Function to check if the user has liked the article
export async function userHasLiked(user_id, article_id) {
    const db = await getDatabase();

    try {
        const result = await db.get(
            `SELECT 1 FROM likes WHERE user_id = ? AND article_id = ?`,
            [parseInt(user_id), parseInt(article_id)]
        );
        console.log(`User ${user_id} has liked article ${article_id}: ${!!result}`);
        return !!result; // Returns true if found, false if not
    } catch (error) {
        console.error("Error in userHasLiked:", error);
        throw error;
    }
}
