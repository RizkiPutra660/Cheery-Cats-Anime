import express from "express";
import {
    createArticle,
    getAllArticles,
    getArticle,
    deleteArticle,
    getArticleByUserId,
    updateArticle,
    searchArticles,
    getArticleLikes,
    sortArticles,
    getNextArticle,
    getPreviousArticle
} from "../../data/articles-dao.js";
import { userHasLiked, unlikeArticle } from "../../data/likes-dao.js";
import { getAllComments } from "../../data/comments-dao.js";
import { likeArticle } from "../../data/likes-dao.js";
import { verifyAuthenticated } from "../../middleware/auth.js";
import multer from "multer";
import { v4 as uuid } from "uuid";
import fs from "fs";

const router = express.Router();

const upload = multer({ dest: 'public/images' });

// Route to create a new article
router.post("/", verifyAuthenticated, upload.single("imageFile"), async (req, res) => {
    const { title, content, summary } = req.body;

    // Basic validation to check if all required fields are present
    if (!title || !content || !summary) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Handle the uploaded image file if provided
        let imageUrl = req.body.image;
        if (req.file) {
            const originalname = req.file.originalname;
            const fileExtension = originalname.substring(originalname.lastIndexOf("."));
            const newFileName = uuid() + fileExtension;
            fs.renameSync(req.file.path, `public/images/${newFileName}`);
            imageUrl = `/images/${newFileName}`; // Save the URL for the uploaded image
        }

        // Create a new article with the authenticated user's ID as the author
        const newArticle = {
            title: title,
            content: content,
            summary: summary,
            image: imageUrl,
            author_id: req.user.userId // Use the ID from the authenticated user
        };

        const createdArticle = await createArticle(newArticle);
        res.status(201).json({ message: "Article created successfully", article: createdArticle });
    } catch (error) {
        console.error("Error creating article:", error);
        res.status(500).json({ message: "Error creating article", error: error.message });
    }
});

// Route to get articles written by a specific user 
router.get('/user/:id', async (req, res) => {
    try {
        const articles = await getArticleByUserId(req.params.id);
        res.status(200).json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving articles by user', error });
    }
});

// Route to get a specific article by ID 
router.get('/:id', async (req, res) => {
    try {
        const article = await getArticle(req.params.id);
        if (article) {
            res.status(200).json(article);
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving article', error });
    }
});

// Return articles based on query search. If query not provided, return all articles.
router.get('/', async (req, res) => {
    const search = req.query.search;
    const sortField = req.query.sortField;
    const sortOrder = req.query.sortOrder;

    if (!search && !sortField && !sortOrder) return res.json(await getAllArticles());

    if (!sortField && !sortOrder) return res.json(await searchArticles(search));

    if (!search) return res.json(await sortArticles(sortField, sortOrder));
});

// Route to delete an article by ID
router.delete('/:id', verifyAuthenticated, async (req, res) => {
    const articleId = parseInt(req.params.id);

    try {
        // Fetch the article to check if the authenticated user is the author or an admin
        const article = await getArticle(articleId);

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        // Only the article author or an admin can delete the article
        if (article.author_id !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied. You can only delete your own article." });
        }

        await deleteArticle(articleId);
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ message: 'Error deleting article', error });
    }
});

// Route to update an article by ID
router.patch('/:id', verifyAuthenticated, upload.single('imageFile'), async (req, res) => {
    const articleId = parseInt(req.params.id);

    // Log the parsed request body and the uploaded file
    console.log("Received request body:", req.body);
    console.log("Uploaded file:", req.file);

    const updateData = req.body;

    try {
        // Fetch the article to check if the authenticated user is the author or an admin
        const article = await getArticle(articleId);

        console.log("Received request body:", req.body);

        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        // Only the article author or an admin can update the article
        if (article.author_id !== req.user.userId && !req.user.isAdmin) {
            return res.status(403).json({ message: "Access denied. You can only update your own article." });
        }

        //let imageUrl = updateData.image;
        // If a file was uploaded, add it to the updateData object
        if (req.file) {
            console.log
            const originalname = req.file.originalname;
            const fileExtension = originalname.substring(originalname.lastIndexOf("."));
            const newFileName = uuid() + fileExtension;
            fs.renameSync(req.file.path, `public/images/${newFileName}`);
            updateData.image = `/images/${newFileName}`; // Save the URL for the uploaded avatar
        }
        // updateData.image = `/uploads/${req.file.filename}`; // Store the file path


        // Update the article
        const updatedArticle = await updateArticle(articleId, updateData);
        res.status(200).json({ message: 'Article updated successfully', article: updatedArticle });

    } catch (error) {
        res.status(500).json({ message: 'Error updating article', error });
    }
});

// Route to get like status and count for an article
// Route for authenticated users to get like status and count for an article
router.get('/:id/likes/auth', verifyAuthenticated, async (req, res) => {
    const articleId = parseInt(req.params.id);
    const userId = req.user.userId;

    if (!articleId) {
        return res.status(400).json({ message: "Invalid article ID" });
    }

    try {
        const likeCount = await getArticleLikes(articleId);
        const userLiked = await userHasLiked(userId, articleId);
        res.status(200).json({ articleId, likeCount, userLiked });
    } catch (error) {
        console.error('Error retrieving article likes:', error);
        res.status(500).json({ message: 'Error retrieving likes for the article' });
    }
});

// Route for unauthenticated users to get like count only
router.get('/:id/likes/public', async (req, res) => {
    const articleId = parseInt(req.params.id);

    if (!articleId) {
        return res.status(400).json({ message: "Invalid article ID" });
    }

    try {
        const likeCount = await getArticleLikes(articleId);
        res.status(200).json({ articleId, likeCount });
    } catch (error) {
        console.error('Error retrieving article likes:', error);
        res.status(500).json({ message: 'Error retrieving likes for the article' });
    }
});

router.post('/:id/like', verifyAuthenticated, async (req, res) => {
    const articleId = parseInt(req.params.id);
    const userId = req.user.userId;

    // Check if the article ID is valid
    if (!articleId) {
        return res.status(400).json({ message: "Invalid article ID" });
    }

    try {
        // Add a like to the article for the authenticated user
        await likeArticle(userId, articleId);

        // Return success message
        res.status(200).json({ message: "Article liked successfully" });
    } catch (error) {
        if (error.message === "You have already liked this article") {
            // Return conflict if the user has already liked the article
            res.status(409).json({ message: "You have already liked this article" });
        } else {
            res.status(500).json({ message: "Error liking the article" });
        }
    }
});

router.get('/:id/comments', async (req, res) => {
    const articleId = parseInt(req.params.id);

    // Check if the article ID is valid
    if (!articleId) {
        return res.status(400).json({ message: "Invalid article ID" });
    }

    try {
        // Verify the article exists
        const article = await getArticle(articleId);
        if (!article) {
            return res.status(404).json({ message: "Article not found" });
        }

        // Retrieve all comments for the article
        const comments = await getAllComments(articleId);

        if (comments && comments.length > 0) {
            res.status(200).json({ articleId, comments });
        } else {
            // If no comments found, return an empty array
            res.status(200).json({ articleId, comments: [] });
        }
    } catch (error) {
        console.error('Error retrieving comments:', error);
        res.status(500).json({ message: 'Error retrieving comments for the article' });
    }
});

router.post('/:id/toggle-like', verifyAuthenticated, async (req, res) => {
    const articleId = parseInt(req.params.id);
    const userId = req.user.userId;

    if (!articleId) {
        console.log("Invalid article ID")
        return res.status(400).json({ message: "Invalid article ID" });
    }

    try {
        console.log(`User ID: ${userId}, Article ID: ${articleId}`);
        const userAlreadyLiked = await userHasLiked(userId, articleId);
        console.log(`User already liked: ${userAlreadyLiked}`);

        if (userAlreadyLiked) {
            await unlikeArticle(userId, articleId);
            console.log("Article unliked");
            console.log(`Unlike successful for user ${userId} on article ${articleId}`);
        } else {
            await likeArticle(userId, articleId);
            console.log(`Like successful for user ${userId} on article ${articleId}`);
        }

        res.status(200).json({ message: userAlreadyLiked ? "Article unliked" : "Article liked" });
    } catch (error) {
        console.error("Error toggling like:", error);
        res.status(500).json({ message: "Error toggling like", error: error.message });
    }
});

router.get('/next/:currentArticleId', async (req, res) => {
    const currentArticleId = parseInt(req.params.currentArticleId);
    try {
        const nextArticle = await getNextArticle(currentArticleId);
        if (!nextArticle) {
            return res.status(404).json({ message: 'No more articles available' });
        }
        res.status(200).json(nextArticle);
    } catch (error) {
        console.error('Error fetching next article:', error);
        res.status(500).json({ error: 'Failed to fetch next article' });
    }
});

router.get('/previous/:currentArticleId', async (req, res) => {
    const currentArticleId = parseInt(req.params.currentArticleId);
    try {
        const previousArticle = await getPreviousArticle(currentArticleId); // Fungsi untuk mengambil artikel sebelumnya
        if (!previousArticle) {
            return res.status(404).json({ message: 'No more articles available' });
        }
        res.status(200).json(previousArticle);
    } catch (error) {
        console.error('Error fetching previous article:', error);
        res.status(500).json({ error: 'Failed to fetch previous article' });
    }
});

export default router;