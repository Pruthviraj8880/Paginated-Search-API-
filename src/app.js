const express = require("express");

const app = express();

app.use(express.json());

const allArticles = require("../db.json");

app.get("/search", (req, res) => {
    const { name } = req.query;

    if (typeof name !== "string" || name.trim() === "") {
        return res.status(400).json({
            error: "Search name parameter is required."
        });
    }

    const requestedLimit = Number(req.query.limit);
    const requestedPage = Number(req.query.page);
    const limit = Number.isInteger(requestedLimit) && requestedLimit > 0 ? requestedLimit : 5;
    const page = Number.isInteger(requestedPage) && requestedPage > 0 ? requestedPage : 1;
    const searchName = name.trim().toLowerCase();

    const filteredArticles = allArticles.filter((article) =>
        typeof article.title === "string" && article.title.toLowerCase().includes(searchName)
    );

    const totalResults = filteredArticles.length;

    const totalPages = Math.ceil(totalResults / limit);

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    const articles = filteredArticles.slice(startIndex, endIndex);

    res.status(200).json({
        currentPage: page,
        totalPages: totalPages,
        totalResults: totalResults,
        articles: articles
    });
});

module.exports = app;