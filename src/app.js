const express = require('express');
const app = express();

app.use(express.json());

// Root route
app.get('/', (req, res) => {
    return res.status(200).json({ message: "Paginated Search API is running!" });
});

// Search Route
app.get('/search', (req, res) => {
    const { name, limit, page } = req.query;

    // 1. Check if 'name' is missing or empty string
    if (name === undefined || name === null || String(name).trim() === '') {
        return res.status(400).json({ error: "Search name parameter is required." });
    }

    // 2. Fetch dataset (Handles global variable or db.json)
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

    // 3. Convert limit and page strictly to numbers with defaults
    const parsedLimit = limit !== undefined && !isNaN(parseInt(limit, 10)) ? parseInt(limit, 10) : 5;
    const parsedPage = page !== undefined && !isNaN(parseInt(page, 10)) ? parseInt(page, 10) : 1;

    // 4. Perform case-insensitive search by title
    const searchTerm = String(name).toLowerCase();
    const matchedArticles = dataset.filter(article =>
        article && article.title && String(article.title).toLowerCase().includes(searchTerm)
    );

    // 5. Calculate pagination numbers
    const totalResults = Number(matchedArticles.length);
    const totalPages = totalResults > 0 ? Number(Math.ceil(totalResults / parsedLimit)) : 0;

    // 6. Slice matching articles array
    const startIndex = (parsedPage - 1) * parsedLimit;
    const paginatedArticles = matchedArticles.slice(startIndex, startIndex + parsedLimit);

    // 7. Return required JSON object
    return res.status(200).json({
        currentPage: Number(parsedPage),
        totalPages: totalPages,
        totalResults: totalResults,
        articles: paginatedArticles
    });
});

module.exports = app;