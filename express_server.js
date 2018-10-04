'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcryptjs');
let app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  'b2xVn2': {
    longURL: 'http://www.lighthouselabs.ca',
    userID: 'userRandomID'
  },
  '9sm5xK': {
    longURL: 'http://www.google.com',
    userID: 'Sonchucks'
  }
};


const userDatabase = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: bcrypt.hashSync('purple-monkey-dinosaur', 10)
  },
 'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: bcrypt.hashSync('dishwasher-funk', 10)
  },
  'Sonchucks': {
    id: 'Sonchucks',
    email: 'son.hyun.uk@hotmail.com',
    password: bcrypt.hashSync('password', 10)
  }
};

// function generating a random short ID
function generateRandomString() {
  let shortID = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 6; i++) {
    shortID += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortID;
}

// function to validate inputted email against userDatabase
function validateEmail(email) {
  for (var randomUserID in userDatabase) {
    if (userDatabase[randomUserID].email === email) {
      return true;
    }
  }
}

// function to obtain ID from the email
function obtainID(email) {
  for (var randomUserID in userDatabase) {
    if (userDatabase[randomUserID].email === email) {
      return randomUserID;
    }
  }
}

// When /urls is inputted into the address bar, it renders the urls_index page
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    users: req.cookies.id
  };
  res.render('urls_index', templateVars);
});

// added a delete button to each URL, which when clicked deletes the associated key-value pair
app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  const userID = req.cookies.id;

  if (urlDatabase[shortURL].userID === userID) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.send('You are not able to delete this URL');
  }
});

// Deletes the cookie when user logouts from /urls
app.post('/logout', (req, res) => {
  res.clearCookie('id');
  res.redirect('/login');
});

// When /urls/new is inputted into the address bar, it renders urls_new page
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// posts to /urls/<shortid> after adding key-value pair
app.post('/urls/new', (req, res) => {
  const newInput = req.body.longURL;
  const newShortID = generateRandomString();
  const userID = req.cookies.id;
  urlDatabase[newShortID] = { longURL: newInput, userID: userID };

  res.redirect(`/urls/${newShortID}`);
});

// when /urls/:id is inputted into the address bar, it renders urls_show page
app.get('/urls/:id', (req, res) => {
  const templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id],
    userID : req.cookies.id
    };

  if (urlDatabase[templateVars.shortURL].userID === templateVars.userID) {
    res.render('urls_show', templateVars);
  } else {
    res.send('You are not able to edit this URL');
  }
});


// Takes a shortURL and reassigns a longURL to it
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const newInput = req.body.longURL;
  const userID = req.cookies.id;

  urlDatabase[shortURL] = { longURL: newInput, userID: userID };
  res.redirect(`/urls`);
});


//renders the login page
app.get('/login', (req, res) => {
  res.render('login');
});

// Allows user to input into field a username and login
// then stores that information as a cookie
app.post('/login', (req, res) => {
  const eMail = req.body.email;
  const password = req.body.password;

  if (validateEmail(eMail) && bcrypt.compareSync(password, userDatabase[obtainID(eMail)].password)) {
    const id = obtainID(eMail);
    res.cookie('id', userDatabase[id].id);
    res.redirect('/urls');
  } else if (validateEmail(eMail) && !bcrypt.compareSync(password, userDatabase[obtainID(eMail)].password)) {
    res.status(403).send(`The password you've submitted is incorrect!
      Please try again!`);
  } else if (!validateEmail(eMail)) {
    res.status(403).send(`You don't have an account, please create one!`);
  }
});

// renders the registration page
app.get('/register', (req, res) => {
  res.render('registration');
});


// allows user to create a new account whose password is hashed then pushed to the userDatabase
app.post('/register', (req, res) => {
  const randomUserID = generateRandomString();
  const eMail = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!eMail || !password) {
    res.status(400).send('Please enter a valid email and/or password!');
  } else if (validateEmail(eMail) === true) {
    res.status(400).send('Email already exists');
  } else {
    userDatabase[randomUserID] = {id: randomUserID, email: eMail, password: hashedPassword};
    res.cookie('id', userDatabase[randomUserID].id);
    res.redirect('/urls');
  }
});


// using shortURL, redirects to longURL
app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// extra code that was in original template
app.get('/', (req, res) => {
  res.send('Hello!');
});

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

