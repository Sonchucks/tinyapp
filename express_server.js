'use strict';

const express = require('express');
const bodyParser = require('body-parser');
let app = express();
const PORT = 8080; // default port 8080

app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));

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

// renders /urls page
app.get('/urls', (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// using shortURL, redirects to longURL
app.get('/u/:shortURL', (req, res) => {
  let longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// renders /urls/new page
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

// renders /urls/:id page
app.get('/urls/:id', (req, res) => {
  let templateVars = {
    shortURL: req.params.id,
    longURL: urlDatabase[req.params.id]
    };
  res.render('urls_show', templateVars);
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
