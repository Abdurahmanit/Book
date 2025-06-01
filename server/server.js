const express = require('express');
const cors = require('cors');
const path = require('path');
const { generateBook, generateBookCover } = require('./utils/dataGenerators');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.get('/api/books', (req, res) => {
  try {
    const {
      seed: userSeed,
      language: languageRegion,
      likes: avgLikes,
      reviews: avgReviews,
      page: pageNumber = 0, // 0-indexed
      count: booksPerPage = 20,
    } = req.query;

    if (!userSeed || !languageRegion || avgLikes === undefined || avgReviews === undefined) {
      return res.status(400).json({ error: 'Missing required query parameters: seed, language, likes, reviews' });
    }

    const books = [];
    const startIndex = parseInt(pageNumber) * parseInt(booksPerPage);

    for (let i = 0; i < parseInt(booksPerPage); i++) {
      const overallBookIndex = startIndex + i;
      const book = generateBook(overallBookIndex, userSeed, languageRegion, avgLikes, avgReviews);
      books.push({ index: overallBookIndex + 1, ...book });
    }
    res.json(books);
  } catch (error) {
    console.error('Error generating books:', error);
    res.status(500).json({ error: 'Failed to generate books', details: error.message });
  }
});

app.get('/api/cover', (req, res) => {
    const { title, author, seed, width = 120, height = 180 } = req.query; // Adjusted default size
    if (!title || !author || !seed) {
        return res.status(400).send('Missing parameters for cover generation.');
    }
    try {
        const coverBuffer = generateBookCover(
            decodeURIComponent(title),
            decodeURIComponent(author),
            parseInt(width),
            parseInt(height),
            decodeURIComponent(seed)
        );
        res.writeHead(200, { 'Content-Type': 'image/png', 'Content-Length': coverBuffer.length });
        res.end(coverBuffer);
    } catch (error) {
        console.error("Cover generation error:", error);
        res.status(500).send('Error generating cover image.');
    }
});


// Serve index.html for any other routes, to support client-side routing if ever needed
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});