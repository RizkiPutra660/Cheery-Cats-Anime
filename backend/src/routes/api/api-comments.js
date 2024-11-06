import express from "express";
import { addComment, deleteComments, getCommentById } from "../../data/comments-dao.js";  // Assume you have a method to get a comment by ID
import { verifyAuthenticated } from "../../middleware/auth.js";  // Middleware to check if user is authenticated

const router = express.Router();

// Route to retrieve all comments from an article
router.get('/:articleId', async (req, res) => {
    const articleId = parseInt(req.params.articleId);

    if (!articleId) {
        return res.status(400).json({ message: "Invalid article ID" });
    }

    try {
        // Retrieve all comments for this article
        const comments = await getAllComments(articleId);

        // If the user is authenticated, add control info
        if (req.cookies.authToken) {
            const response = comments.map(comment => ({
                ...comment,
                canDelete: true, // User can delete
                canReply: true   // User can reply
            }));
            return res.status(200).json(response);
        }

        // If not authenticated, only send comments
        res.status(200).json(comments);
    } catch (error) {
        console.error('Error retrieving comments:', error);
        res.status(500).json({ message: 'Error retrieving comments for the article' });
    }
});

// Add a new comment (only authenticated users can comment)
router.post('/', verifyAuthenticated, async (req, res) => {
    const { content, article_id, parent_comment_id } = req.body;
    const user_id = req.user.userId;  // Get the user ID from the authenticated user

    if (!content || !article_id) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    try {
        const newComment = {
            content: content,
            user_id: user_id,  // Use the authenticated user's ID
            article_id: parseInt(article_id),
            parent_comment_id: parent_comment_id ? parseInt(parent_comment_id) : null
        };

        await addComment(newComment);

        res.status(201).json({ message: 'Comment added successfully', comment_id: newComment.id });
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
});

// Delete a comment by ID (only the comment author or an admin can delete)
router.delete('/:id', verifyAuthenticated, async (req, res) => {
    const commentId = parseInt(req.params.id);

    if (!commentId) {
        return res.status(400).json({ error: 'Invalid comment ID' });
    }

    try {
        // Get the comment to check if the authenticated user is the author or an admin
        const comment = await getCommentById(commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        // Only the comment author or an admin can delete the comment
        if (comment.user_id !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied. You can only delete your own comment." });
        }

        // Call DAO to delete the comment
        await deleteComments(commentId);
        res.status(204).send();  // No content response
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Failed to delete comment' });
    }
});

export default router;
