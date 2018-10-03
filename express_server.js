'use strict';

const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
let app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  'b2xVn2': 'http://www.lighthouselabs.ca',
  '9sm5xK': 'http://www.google.com'
};

// function which generates a random short ID

function generateRandomString() {
  let shortID = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (var i = 0; i < 6; i++) {
    shortID += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return shortID;
}

// When /urls is inputted into the address bar, it renders the urls_index page
app.get('/urls', (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies.userName
  };
  res.render('urls_index', templateVars);
});

// added a delete button to each URL, which when clicked deletes the associated key-value pair
app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// When /urls/new is inputted into the address bar, it renders urls_new page
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// posts to /urls/<shortid> after adding key-value pair
app.post('/urls', (req, res) => {
  const newInput = req.body.longURL;
  const newShortID = generateRandomString();

  urlDatabase[newShortID] = newInput;

  res.redirect(`/urls/${newShortID}`);
});

// when /urls/:id is inputted into the address bar, it renders urls_show page
app.get('/urls/:id', (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
    };
  res.render('urls_show', templateVars);
});


// Takes a shortURL and reassigns a longURL to it
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  const newInput = req.body.longURL;

  urlDatabase[shortURL] = newInput;
  res.redirect(`/urls`);
});


// Allows user to input into field a username and login
// then stores that information as a cookie
app.post('/login', (req, res) => {
  res.cookie('userName', req.body.userName);
  res.redirect('/urls');
});

// Deletes the cookie when user logouts
app.post('/logout', (req, res) => {
  res.clearCookie('userName');
  res.redirect('/urls');
});



// using shortURL, redirects to longURL
app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});



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

