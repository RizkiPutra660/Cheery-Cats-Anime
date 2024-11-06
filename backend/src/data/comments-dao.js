import { getDatabase } from "./database.js";

// Add a new comment
export async function addComment(comment) {
    const db = await getDatabase();

    const result = await db.run(
        "INSERT INTO comments (content, date, user_id, article_id, parent_comment_id) VALUES (?, datetime(CURRENT_TIMESTAMP, 'LOCALTIME'), ?, ?, ?)",
        [comment.content, parseInt(comment.user_id), parseInt(comment.article_id), parseInt(comment.parent_comment_id)]
    );

    comment.id = result.lastID;
}

// Retrieve all comments for an article, ordered by parent_comment_id and comment_id
export async function getAllComments(article_id) {
    const db = await getDatabase();

    return await db.all(
        "SELECT u.username, u.avatar, c.article_id, c.comment_id, c.content, c.date, c.parent_comment_id FROM users u JOIN comments c ON u.id = c.user_id WHERE c.article_id = ? ORDER BY COALESCE(c.parent_comment_id, c.comment_id), c.comment_id",
        [parseInt(article_id)]
    );
}

// Delete a comment by id
export async function deleteComments(id) {
    const db = await getDatabase();

    return await db.run("DELETE FROM comments WHERE comment_id = ?", [parseInt(id)]);
}

export async function getCommentById(comment_id) {
    const db = await getDatabase();
    return await db.get("SELECT * FROM comments WHERE comment_id = ?", [parseInt(comment_id)]);
}