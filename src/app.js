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

    // 1. Check if 'name' parameter is missing or empty string
    if (name === undefined || name.trim() === '') {
        return res.status(400).json({ error: "Search name parameter is required." });
    }

    // 2. Safely resolve articles dataset
    let dataset = [];
    if (typeof allArticles !== 'undefined' && Array.isArray(allArticles)) {
        dataset = allArticles;
    } else if (global.allArticles && Array.isArray(global.allArticles)) {
        dataset = global.allArticles;
    } else {
        try {
            dataset = require('../db.json');
        } catch (e) {
            dataset = [];
        }
    }

    // 3. Parse query parameters with fallback defaults
    const parsedLimit = (limit !== undefined && !isNaN(parseInt(limit, 10))) ? parseInt(limit, 10) : 5;
    const parsedPage = (page !== undefined && !isNaN(parseInt(page, 10))) ? parseInt(parseInt(page, 10)) : 1;

    // 4. Case-insensitive search by article title
    const searchTerm = name.toLowerCase();
    const matchedArticles = dataset.filter(article =>
        article && article.title && String(article.title).toLowerCase().includes(searchTerm)
    );

    // 5. Calculate total results and total pages
    const totalResults = matchedArticles.length;
    const totalPages = totalResults > 0 ? Math.ceil(totalResults / parsedLimit) : 0;

    // 6. Slice results array for the requested page
    const startIndex = (parsedPage - 1) * parsedLimit;
    const paginatedArticles = matchedArticles.slice(startIndex, startIndex + parsedLimit);

    // 7. Return exact JSON format required by spec
    return res.status(200).json({
        currentPage: parsedPage,
        totalPages: totalPages,
        totalResults: totalResults,
        articles: paginatedArticles
    });
});

module.exports = app;