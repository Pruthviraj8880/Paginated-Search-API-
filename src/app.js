const express = require('express');
const app = express();

// Load the pre-loaded articles dataset from db.json
const allArticles = require('../db.json');

app.use(express.json());

app.get('/search', (req, res) => {
    const { name, limit, page } = req.query;

    // 1. Validate required parameter 'name'
    if (!name || name.trim() === '') {
        return res.status(400).json({ error: "Search name parameter is required." });
    }

    // 2. Parse query parameters with default values
    const parsedLimit = parseInt(limit, 10) || 5;
    const parsedPage = parseInt(page, 10) || 1;

    // 3. Filter articles (Case-insensitive search by title)
    const searchTerm = name.toLowerCase();
    const matchedArticles = allArticles.filter(article =>
        article.title && article.title.toLowerCase().includes(searchTerm)
    );

    // 4. Calculate pagination metrics
    const totalResults = matchedArticles.length;
    const totalPages = totalResults > 0 ? Math.ceil(totalResults / parsedLimit) : 0;

    // 5. Paginate matched articles
    const startIndex = (parsedPage - 1) * parsedLimit;
    const paginatedArticles = matchedArticles.slice(startIndex, startIndex + parsedLimit);

    // 6. Return response
    return res.status(200).json({
        currentPage: parsedPage,
        totalPages: totalPages,
        totalResults: totalResults,
        articles: paginatedArticles
    });
});

module.exports = app;