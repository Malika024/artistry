CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    full_name VARCHAR(100),
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE artists (
    artist_id INT PRIMARY KEY AUTO_INCREMENT,
    artist_name VARCHAR(255) NOT NULL,
    date_of_birth DATE
);
CREATE TABLE paintings (
    painting_id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    year INT,
    artist_id INT,
    rating DECIMAL(3,1),
    price DECIMAL(10,2),
    FOREIGN KEY (artist_id) REFERENCES artists(artist_id)
);
CREATE TABLE auction (
    auction_id INT AUTO_INCREMENT PRIMARY KEY,
    painting_id INT NOT NULL,
    start_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMP,
    current_bid DECIMAL(10, 2) NOT NULL DEFAULT 0.00,
    status ENUM('Open for bidding', 'Closed') DEFAULT 'Open for bidding',
    FOREIGN KEY (painting_id) REFERENCES paintings(painting_id)
);
