const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const saltRounds = 10; // Salt rounds for bcrypt

const app = express();
const port = 3000;
const secretKey = 'your_jwt_secret_key'; // Replace with a strong secret key
app.use(express.static('public'));
// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MySQL database connection
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '788991',
    database: 'artistry'
});

db.connect(err => {
    if (err) {
        console.error('Error connecting to database:', err);
        throw err; // Throw an error if database connection fails
    }
    console.log('Connected to database');
});

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'home.html'));
});

app.get('/auction', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'auction.html'));
});

app.get('/painting', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'painting.html'));
});

app.get('/user', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'user.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});
app.get('/bids', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'bids.html'));
});

// Handle user login
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ success: false, message: 'Invalid username or password' });
        }

        const user = results[0];

        // Check password
        bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
                console.error('Error comparing passwords:', err);
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }

            if (!result) {
                return res.status(401).json({ success: false, message: 'Invalid username or password' });
            }

            res.json({ success: true, message: 'Login successful' });
        });
    });
});

// Handle user registration
app.post('/signup', (req, res) => {
    const { username, password } = req.body;

    // Check if the username already exists
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, results) => {
        if (err) {
            console.error('Error querying database:', err);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }

        if (results.length > 0) {
            return res.status(409).json({ success: false, message: 'Username already exists' });
        }


        // Hash the password before storing it
        bcrypt.hash(password, 10, (err, hash) => {
            if (err) {
                console.error('Error hashing password:', err);
                return res.status(500).json({ success: false, message: 'Internal server error' });
            }

            const insertSql = 'INSERT INTO users (username, password) VALUES (?, ?)';
            db.query(insertSql, [username, hash], (err, result) => {
                if (err) {
                    console.error('Error inserting user:', err);
                    return res.status(500).json({ success: false, message: 'Internal server error' });
                }

                res.json({ success: true, message: 'User registered successfully' });
            });
        });
    });
});
// Middleware to parse JSON bodies
app.use(bodyParser.json());

// Define routes

// Get all auctions
app.get('/api/auctions', (req, res) => {
    connection.query('SELECT * FROM auction', (error, results, fields) => {
        if (error) {
            res.status(500).json({ message: error.message });
            return;
        }
        res.json(results);
    });
});

// Get auction by ID
app.get('/api/auctions/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM auction WHERE auction_id = ?', [id], (error, results, fields) => {
        if (error) {
            res.status(500).json({ message: error.message });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ message: 'Auction not found' });
        } else {
            res.json(results[0]);
        }
    });
});

// Create a new auction
app.post('/api/auctions', (req, res) => {
    const { painting_id, end_time, current_bid, status } = req.body;
    connection.query('INSERT INTO auction (painting_id, end_time, current_bid, status) VALUES (?, ?, ?, ?)',
        [painting_id, end_time, current_bid, status],
        (error, results, fields) => {
            if (error) {
                res.status(400).json({ message: error.message });
                return;
            }
            res.status(201).json({ message: 'Auction created successfully' });
        });
});

// Update an existing auction
app.put('/api/auctions/:id', (req, res) => {
    const id = req.params.id;
    const { painting_id, end_time, current_bid, status } = req.body;
    connection.query('UPDATE auction SET painting_id = ?, end_time = ?, current_bid = ?, status = ? WHERE auction_id = ?',
        [painting_id, end_time, current_bid, status, id],
        (error, results, fields) => {
            if (error) {
                res.status(400).json({ message: error.message });
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).json({ message: 'Auction not found' });
            } else {
                res.json({ message: 'Auction updated successfully' });
            }
        });
});

// Delete an auction
app.delete('/api/auctions/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM auction WHERE auction_id = ?', [id], (error, results, fields) => {
        if (error) {
            res.status(500).json({ message: error.message });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ message: 'Auction not found' });
        } else {
            res.json({ message: 'Auction deleted successfully' });
        }
    });
});
// Get all bids
app.get('/api/bids', (req, res) => {
    connection.query('SELECT * FROM bids', (error, results, fields) => {
        if (error) {
            res.status(500).json({ message: error.message });
            return;
        }
        res.json(results);
    });
});

// Get bid by ID
app.get('/api/bids/:id', (req, res) => {
    const id = req.params.id;
    connection.query('SELECT * FROM bids WHERE bid_id = ?', [id], (error, results, fields) => {
        if (error) {
            res.status(500).json({ message: error.message });
            return;
        }
        if (results.length === 0) {
            res.status(404).json({ message: 'Bid not found' });
        } else {
            res.json(results[0]);
        }
    });
});

// Create a new bid
app.post('/api/bids', (req, res) => {
    const { painting_id, bid_amount } = req.body;
    connection.query('INSERT INTO bids (painting_id, bid_amount) VALUES (?, ?)',
        [painting_id, bid_amount],
        (error, results, fields) => {
            if (error) {
                res.status(400).json({ message: error.message });
                return;
            }
            res.status(201).json({ message: 'Bid created successfully' });
        });
});

// Update an existing bid
app.put('/api/bids/:id', (req, res) => {
    const id = req.params.id;
    const { painting_id, bid_amount } = req.body;
    connection.query('UPDATE bids SET painting_id = ?, bid_amount = ? WHERE bid_id = ?',
        [painting_id, bid_amount, id],
        (error, results, fields) => {
            if (error) {
                res.status(400).json({ message: error.message });
                return;
            }
            if (results.affectedRows === 0) {
                res.status(404).json({ message: 'Bid not found' });
            } else {
                res.json({ message: 'Bid updated successfully' });
            }
        });
});

// Delete a bid
app.delete('/api/bids/:id', (req, res) => {
    const id = req.params.id;
    connection.query('DELETE FROM bids WHERE bid_id = ?', [id], (error, results, fields) => {
        if (error) {
            res.status(500).json({ message: error.message });
            return;
        }
        if (results.affectedRows === 0) {
            res.status(404).json({ message: 'Bid not found' });
        } else {
            res.json({ message: 'Bid deleted successfully' });
        }
    });
});
// Route to handle bidding
app.post('/api/bids', (req, res) => {
    const { auction_id, bid_amount, bidder_name } = req.body;

    // Insert bid into the database
    const insertBidQuery = 'INSERT INTO bids (auction_id, bid_amount, bidder_name) VALUES (?, ?, ?)';
    db.query(insertBidQuery, [auction_id, bid_amount, bidder_name], (err, result) => {
        if (err) {
            console.error('Error inserting bid:', err);
            res.status(500).json({ error: 'Failed to place bid. Please try again.' });
        } else {
            console.log('Bid placed successfully:', result);
            res.status(200).json({ message: 'Bid placed successfully!' });
        }
    });
});

// Route to handle bid submission
app.post('/submit-bid', (req, res) => {
    const { paintingId, bidAmount } = req.body;
  
    // Validate inputs (ensure paintingId is numeric and bidAmount is numeric)
  
    const bidTime = new Date().toISOString().slice(0, 19).replace('T', ' '); // Current timestamp
  
    // Insert bid into database
    const sql = 'INSERT INTO bids (painting_id, bid_amount, bid_time) VALUES (?, ?, ?)';
    db.query(sql, [paintingId, bidAmount, bidTime], (err, result) => {
      if (err) {
        console.error('Error inserting bid:', err);
        return res.status(500).json({ error: 'Failed to submit bid' });
      }
      console.log('Bid submitted successfully');
      res.status(200).json({ message: 'Bid submitted successfully' });
    });
  });
  


const PORT = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});