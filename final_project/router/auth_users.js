const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  //returns boolean
  let userswithsamename = users.filter((user) => {
    return user.username === username;
  });
  if (userswithsamename.length > 0) {
    return true;
  } else {
    return false;
  }
};

const authenticatedUser = (username, password) => {
  //returns boolean
  let validusers = users.filter((user) => {
    return user.username === username && user.password === password;
  });
  if (validusers.length > 0) {
    return true;
  } else {
    return false;
  }
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
    return res.status(404).json({ message: "Error logging in" });
  }
  if (authenticatedUser(username, password)) {
    let accessToken = jwt.sign({ data: password }, "access", {
      expiresIn: 60 * 60,
    });
    req.session.authorization = { accessToken, username };
    return res.status(200).send("User successfully logged in");
  } else {
    return res
      .status(208)
      .json({ message: "Invalid Login. Check username and password" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  if (req.session.authorization) {
    const isbn = req.params.isbn;
    let book = books[isbn];
    if (book) {
      //Check is book exists
      let review = req.body.review;
      //if review the review has been changed, update the review
      if (review) {
        let newReview = { ...book["reviews"], review };
        book["reviews"] = newReview;
      }
      books[isbn] = book;
      res.send(
        `The review for the book with ISBN ${isbn} has been added/updated.`
      );
    } else {
      res.send("Unable to find book!");
    }
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

// delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  console.log("req.session:", req.session.authorization);
  if (req.session.authorization) {
    const isbn = req.params.isbn;
    let book = books[isbn];
    if (book) {
      book["reviews"] = {};
      books[isbn] = book;
      res.send(
        `Reviews for the ISBN ${isbn} posted by the user ${req.session.authorization.username} deleted.`
      );
    } else {
      res.send("Unable to find book!");
    }
  } else {
    return res.status(403).json({ message: "User not logged in" });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
