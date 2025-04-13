const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const axios = require('axios'); // For Tasks 10-13
const app = express();

// Middleware
app.use(bodyParser.json());

// Sample Data (Replace with your skeleton code's data)
let books = [
  { isbn: "123-456789", title: "The Great Gatsby", author: "F. Scott Fitzgerald" },
  { isbn: "987-654321", title: "To Kill a Mockingbird", author: "Harper Lee" }
];
let reviews = {}; // Format: { "isbn": [{ user: "username", review: "text" }] }
let users = []; // Stores registered users

const SECRET_KEY = "your_jwt_secret_key_here"; // Change in production!

// =================================================================
// Task 1-5: General User Endpoints (No Auth Required)
// =================================================================

// Task 1: Get all books
app.get('/books', (req, res) => {
  res.json(books);
});

// Task 2: Get book by ISBN
app.get('/books/isbn/:isbn', (req, res) => {
  const book = books.find(b => b.isbn === req.params.isbn);
  if (!book) return res.status(404).json({ error: "Book not found" });
  res.json(book);
});

// Task 3: Get books by author
app.get('/books/author/:author', (req, res) => {
  const authorBooks = books.filter(b => 
    b.author.toLowerCase().includes(req.params.author.toLowerCase())
  );
  res.json(authorBooks);
});

// Task 4: Get books by title
app.get('/books/title/:title', (req, res) => {
  const titleBooks = books.filter(b => 
    b.title.toLowerCase().includes(req.params.title.toLowerCase())
  );
  res.json(titleBooks);
});

// Task 5: Get reviews for a book
app.get('/reviews/:isbn', (req, res) => {
  res.json(reviews[req.params.isbn] || []);
});

// =================================================================
// Task 6-7: User Authentication
// =================================================================

// Task 6: Register new user
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  
  if (users.find(u => u.username === username)) {
    return res.status(400).json({ error: "Username already exists" });
  }

  users.push({ username, password });
  res.status(201).json({ message: "User registered successfully" });
});

// Task 7: Login user
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(u => u.username === username && u.password === password);

  if (!user) {
    return res.status(401).json({ error: "Invalid credentials" });
  }

  const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });
  res.json({ token });
});

// =================================================================
// Task 8-9: Registered User Actions (JWT Protected)
// =================================================================

// JWT Authentication Middleware
const authenticateJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(403).json({ error: "No token provided" });

  const token = authHeader.split(' ')[1];
  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ error: "Invalid token" });
    req.user = user;
    next();
  });
};

// Task 8: Add/modify review
app.put('/reviews/:isbn', authenticateJWT, (req, res) => {
  const { review } = req.body;
  const isbn = req.params.isbn;

  if (!reviews[isbn]) reviews[isbn] = [];

  const userReviewIndex = reviews[isbn].findIndex(r => r.user === req.user.username);
  
  if (userReviewIndex >= 0) {
    reviews[isbn][userReviewIndex].review = review;
    res.json({ message: "Review updated" });
  } else {
    reviews[isbn].push({ user: req.user.username, review });
    res.json({ message: "Review added" });
  }
});

// Task 9: Delete review
app.delete('/reviews/:isbn', authenticateJWT, (req, res) => {
  const isbn = req.params.isbn;

  if (!reviews[isbn]) {
    return res.status(404).json({ error: "No reviews found for this book" });
  }

  reviews[isbn] = reviews[isbn].filter(r => r.user !== req.user.username);
  res.json({ message: "Review deleted" });
});

// =================================================================
// Task 10-13: Node.js Methods (Async/Promises)
// =================================================================

// Task 10: Get all books (Async/Await)
async function getAllBooks() {
  try {
    const response = await axios.get('http://localhost:3000/books');
    console.log("All Books:", response.data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// Task 11: Search by ISBN (Promises)
function getBookByISBN(isbn) {
  axios.get(`http://localhost:3000/books/isbn/${isbn}`)
    .then(response => console.log("Book by ISBN:", response.data))
    .catch(err => console.error("Error:", err.message));
}

// Task 12: Search by author (Async/Await)
async function getBooksByAuthor(author) {
  try {
    const response = await axios.get(`http://localhost:3000/books/author/${author}`);
    console.log("Books by Author:", response.data);
  } catch (err) {
    console.error("Error:", err.message);
  }
}

// Task 13: Search by title (Promises)
function getBooksByTitle(title) {
  axios.get(`http://localhost:3000/books/title/${title}`)
    .then(response => console.log("Books by Title:", response.data))
    .catch(err => console.error("Error:", err.message));
}

// =================================================================
// Start Server & Test Scripts
// =================================================================

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);

  // Uncomment to test Tasks 10-13 (run after server starts)
  // getAllBooks();
  // getBookByISBN("123-456789");
  // getBooksByAuthor("Harper Lee");
  // getBooksByTitle("Gatsby");
});

// =================================================================
// GitHub Submission (Task 14)
// =================================================================
/*
1. Create a GitHub repo.
2. Add this file + screenshots in `/screenshots`.
3. Submit repo link on Coursera.
*/
