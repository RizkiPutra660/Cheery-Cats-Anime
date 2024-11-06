import { getDatabase } from "./database.js";

// This inserts a new article
export async function createArticle(article) {
    const db = await getDatabase(); // Wait for the database to load

    const result = await db.run(
        "INSERT INTO articles (title, content, summary, date, image, author_id) VALUES (?, ?, ?, datetime(CURRENT_TIMESTAMP, 'LOCALTIME'), ?, ?)",
        [article.title, article.content, article.summary, article.image, parseInt(article.author_id)]
    );

    article.id = result.lastID; // Assigning the id
    return article; // Return the created article with id
}

// Function to retrieve all articles along with author information from users table
export async function getAllArticles() {
    const db = await getDatabase();

    return await db.all(
        "SELECT a.image, a.title, a.summary, a.article_id, a.date, u.username, u.avatar FROM articles a, users u WHERE a.author_id = u.id;"
    );
}

// Function to retrieve an article by id
export async function getArticle(id) {
    const db = await getDatabase();

    return await db.get(
        "SELECT a.article_id, a.title, a.summary, a.content, a.date, a.image, a.author_id, u.avatar FROM articles a, users u WHERE a.article_id = ? AND a.author_id = u.id",
        [id]
    );
}

// Function to get articles written by a specific user
export async function getArticleByUserId(id) {
    const db = await getDatabase(); // Ensure you await getDatabase()

    return await db.all(
        "SELECT DISTINCT a.article_id, a.author_id, a.title, u.username, a.summary, a.content, a.date, a.image, u.avatar FROM articles a, users u WHERE a.author_id = ? AND a.author_id = u.id",
        [id]
    );
}

// Delete article 
export async function deleteArticle(id) {
    const db = await getDatabase();

    await db.run("DELETE FROM articles WHERE article_id = ?", [id]);
}

// Update article
export async function updateArticle(id, updateData) {
    const db = await getDatabase();

    //retrieve the article by id
    const article = await db.get("SELECT * FROM articles WHERE article_id=?", [id]);

    //if the article is not found then error
    if (!article) throw `Article with the ID ${id} not found!`;

    //merge the existing article with updated data
    const updatedArticle = Object.assign({}, article, updateData);

    const fieldToUpdate = [];
    const params = [];

    if (updatedArticle.title !== article.title) {
        fieldToUpdate.push("title=?");
        params.push(updatedArticle.title);
    }
    if (updatedArticle.content !== article.content) {
        fieldToUpdate.push("content = ?");
        params.push(updatedArticle.content);
    }
    if (updatedArticle.summary !== article.summary) {
        fieldToUpdate.push("summary = ?");
        params.push(updatedArticle.summary);
    }
    if (updatedArticle.image !== article.image) {
        fieldToUpdate.push("image = ?");
        params.push(updatedArticle.image);
    }

    //If no fields have changed, then return
    if (fieldToUpdate.length === 0) {
        return article;
    }

    // Constructing the query and adding the article ID to the parameters
    const query = `UPDATE articles SET ${fieldToUpdate.join(", ")} WHERE article_id = ?`;
    params.push(id);

    // Run the update query
    try {
        await db.run(query, params);
    } catch (error) {
        console.error("Error executing update query:", error);
        throw error;  // Re-throw the error to propagate up
    }

    // Return the updated article object
    return updatedArticle;

}

export async function searchArticles(search) {
    if (!search || search.length === 0) return await getAllArticles();

    const db = await getDatabase();

    // Use wildcard search for both title, username, and date (case-insensitive for text fields)
    const lowercaseSearch = search.toLowerCase();

    const articles = await db.all(
        `SELECT a.article_id, a.title, a.summary, a.date, u.username, a.image
         FROM articles a
         JOIN users u ON a.author_id = u.id
         WHERE (LOWER(a.title) LIKE ? OR LOWER(a.content) LIKE ? OR a.date LIKE ?)`,
        `%${lowercaseSearch}%`,
        `%${lowercaseSearch}%`,
        `%${search}%`  // Search the date exactly, no lowercase conversion needed
    );

    return articles;
}

export async function sortArticles(sortField, sortOrder) {
    if (!sortField || sortField.length === 0) return await getAllArticles();

    const db = await getDatabase();

    // Ensure the sortField is one of the allowed fields: 'title', 'username', 'date'
    const validSortFields = ['title', 'username', 'date'];
    if (!validSortFields.includes(sortField)) {
        sortField = 'title'; // Default to sorting by title if invalid field is provided
    }

    // Ensure sortOrder is either 'asc' or 'desc'
    if (sortOrder !== 'asc' && sortOrder !== 'desc') {
        sortOrder = 'asc'; // Default to ascending order
    }

    // Modify the SQL query to order by the selected sort field and sort order
    const articles = await db.all(
        `SELECT a.article_id, a.title, a.summary, a.date, u.username, a.image 
         FROM articles a
         JOIN users u ON a.author_id = u.id
         ORDER BY ${sortField} ${sortOrder.toUpperCase()}`
    );

    return articles;
}

export async function getArticleLikes(article_id) {
    const db = await getDatabase();

    // Query to count likes for the given article
    const result = await db.get(
        `SELECT COUNT(l.like_id) as likeCount
         FROM likes l
         WHERE l.article_id = ?`,
        [article_id]
    );

    return result.likeCount;
}

export async function getAllComments(articleId) {
    const db = await getDatabase();

    // Retrieve comments with the 'date' column
    const comments = await db.all(
        "SELECT comment_id, content, date, user_id, article_id, parent_comment_id FROM comments WHERE article_id = ?",
        [articleId]
    );

    return comments;
}

export async function getNextArticle(currentArticleId) {
    const db = await getDatabase();

    const query = `
      SELECT a.article_id, a.title, a.summary, a.content, a.date, a.image, a.author_id, u.username, u.avatar 
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.article_id > ?
      ORDER BY a.article_id ASC
      LIMIT 1
    `;

    const [nextArticle] = await db.all(query, [currentArticleId]);
    return nextArticle;
}

export async function getPreviousArticle(currentArticleId) {
    const db = await getDatabase();

    const query = `
      SELECT a.article_id, a.title, a.summary, a.content, a.date, a.image, a.author_id, u.username, u.avatar 
      FROM articles a
      JOIN users u ON a.author_id = u.id
      WHERE a.article_id < ?
      ORDER BY a.article_id DESC
      LIMIT 1
    `;

    const [previousArticle] = await db.all(query, [currentArticleId]);
    return previousArticle;
}




