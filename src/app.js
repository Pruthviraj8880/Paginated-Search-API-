const express = require('express');
const app = express();

app.use(express.json());

// Root route
app.get('/', (req, res) => {
    res.status(200).json({ message: "Paginated Search API is running!" });
});

// Search Route
app.get('/search', (req, res) => {
    const { name, limit, page } = req.query;

    // 1. Check if name parameter is missing or empty
    if (name === undefined || name.trim() === '') {
        return res.status(400).json({ error: "Search name parameter is required." });
    }

    // 2. Safely resolve allArticles dataset (handles local db.json or global Newton School variable)
    let articlesData = [];
    if (typeof allArticles !== 'undefined') {
        articlesData = allArticles;
    } else {
        try {
            articlesData = require('../db.json');
        } catch (e) {
            articlesData = [];
        }
    }

    // 3. Parse query parameters with default values
    const parsedLimit = limit !== undefined ? parseInt(limit, 10) : 5;
    const parsedPage = page !== undefined ? parseInt(page, 10) : 1;

    // 4. Case-insensitive search by title
    const searchTerm = name.toLowerCase();
    const matchedArticles = articlesData.filter(article =>
        article && article.title && article.title.toLowerCase().includes(searchTerm)
    );

    // 5. Calculate total results and total pages
    const totalResults = matchedArticles.length;
    const totalPages = totalResults > 0 ? Math.ceil(totalResults / parsedLimit) : 0;

    // 6. Calculate pagination slices
    const startIndex = (parsedPage - 1) * parsedLimit;
    const paginatedArticles = matchedArticles.slice(startIndex, startIndex + parsedLimit);

    // 7. Return required JSON structure
    return res.status(200).json({
        currentPage: parsedPage,
        totalPages: totalPages,
        totalResults: totalResults,
        articles: paginatedArticles
    });
});

module.exports = app;