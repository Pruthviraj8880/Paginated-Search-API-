const express = require('express');
const app = express();

app.use(express.json());

// Helper function to resolve articles safely
function getArticles() {
    if (typeof allArticles !== 'undefined' && Array.isArray(allArticles)) {
        return allArticles;
    }
    if (typeof global !== 'undefined' && Array.isArray(global.allArticles)) {
        return global.allArticles;
    }
    try {
        return require('../db.json');
    } catch (e) {
        return [];
    }
}

// Search Route
app.get('/search', (req, res) => {
    try {
        const { name, limit, page } = req.query;

        // 1. Return 400 Bad Request if name is missing or empty
        if (name === undefined || name === null || String(name).trim() === '') {
            return res.status(400).json({ error: "Search name parameter is required." });
        }

        // 2. Load dataset
        const dataset = getArticles();

        // 3. Parse query parameters with strict defaults
        const parsedLimit = (limit !== undefined && !isNaN(parseInt(limit, 10))) ? parseInt(limit, 10) : 5;
        const parsedPage = (page !== undefined && !isNaN(parseInt(page, 10))) ? parseInt(page, 10) : 1;

        // 4. Case-insensitive search by title
        const searchTerm = String(name).toLowerCase();
        const matchedArticles = dataset.filter(article => 
            article && article.title && String(article.title).toLowerCase().includes(searchTerm)
        );

        // 5. Calculate total results and pages
        const totalResults = matchedArticles.length;
        const totalPages = totalResults > 0 ? Math.ceil(totalResults / parsedLimit) : 0;

        // 6. Paginate articles array
        const startIndex = (parsedPage - 1) * parsedLimit;
        const paginatedArticles = matchedArticles.slice(startIndex, startIndex + parsedLimit);

        // 7. Return JSON response
        return res.status(200).json({
            currentPage: parsedPage,
            totalPages: totalPages,
            totalResults: totalResults,
            articles: paginatedArticles
        });
    } catch (err) {
        return res.status(400).json({ error: "Search name parameter is required." });
    }
});

// Root route
app.get('/', (req, res) => {
    return res.status(200).json({ message: "API is running" });
});

module.exports = app;