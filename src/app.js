const express = require('express');
const app = express();

app.use(express.json());

const allArticles = require('../db.json');

app.get('/search', (req, res) => {
    const { name } = req.query;

    // name is required
    if (!name || name.trim() === '') {
        return res.status(400).json({
            error: 'Search name parameter is required.'
        });
    }

    // Default values
    const limit = Number(req.query.limit) || 5;
    const page = Number(req.query.page) || 1;

    // Case-insensitive search by title
    const filteredArticles = allArticles.filter(article =>
        article.title.toLowerCase().includes(name.toLowerCase())
    );

    const totalResults = filteredArticles.length;
    const totalPages = Math.ceil(totalResults / limit);

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const articles = filteredArticles.slice(startIndex, endIndex);

    return res.status(200).json({
        currentPage: page,
        totalPages: totalPages,
        totalResults: totalResults,
        articles: articles
    });
});

module.exports = app;