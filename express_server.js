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

const userDatabase = {
  'userRandomID': {
    id: 'userRandomID',
    email: 'user@example.com',
    password: 'purple-monkey-dinosaur'
  },
 'user2RandomID': {
    id: 'user2RandomID',
    email: 'user2@example.com',
    password: 'dishwasher-funk'
  },
  'Sonchucks': {
    id: 'Sonchucks',
    email: 'son.hyun.uk@hotmail.com',
    password: 'password'
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

function validateEmail(email) {
  for (var randomUserID in userDatabase) {
    if (userDatabase[randomUserID].email === email) {
      return true;
    }
  }
}

function validatePassword(password) {
  for (var randomUserID in userDatabase) {
    if (userDatabase[randomUserID].password === password) {
      return true;
    }
  }
}

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
    users: userDatabase[req.cookies.id]
  };
  res.render('urls_index', templateVars);
});

// added a delete button to each URL, which when clicked deletes the associated key-value pair
app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
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


app.get('/login', (req, res) => {
  res.render('login');
});

// Allows user to input into field a username and login
// then stores that information as a cookie
app.post('/login', (req, res) => {
  const eMail = req.body.email;
  const password = req.body.password;

  if (validateEmail(eMail) && validatePassword(password)) {
    const id = obtainID(eMail);
    console.log(id)
    res.cookie('id', userDatabase[id].id);
    res.redirect('/');
  } else if (validateEmail(eMail) && !validatePassword(password)) {
    res.status(403).send(`The password you've submitted is incorrect!
      Please try again!`);
  } else if (!validateEmail(eMail)) {
    res.status(403).send(`You don't have an account, please create one!`);
  }
});


app.get('/register', (req, res) => {
  res.render('registration');
});

app.post('/register', (req, res) => {
  const randomUserID = generateRandomString();
  const eMail = req.body.email;
  const password = req.body.password;

  if (!eMail || !password) {
    res.status(400).send('Please enter a valid email and/or password!');
  } else if (validateEmail(eMail) === true) {
    res.status(400).send('Email already exists');
  } else {
    userDatabase[randomUserID] = {id: randomUserID, email: eMail, password: password};
    res.cookie('id', userDatabase[randomUserID].id);
    res.redirect('/urls');
  }
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

