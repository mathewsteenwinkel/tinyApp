
const express = require("express");
const cookieSession = require('cookie-session')
const bcrypt = require('bcryptjs')
const helper = require("./helper")
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'cookiemonster',
  keys: ['alsdkjfnlsdkjaf', 'sakdjfnlksd']
}))
app.use(express.urlencoded({ extended: false }));

const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "user2RandomID"
  },
};


const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

const urlsForUser = (id) => {
  const filteredUrls = [];

  for (const shortid in urlDatabase) {
    if (id == urlDatabase[shortid].userID) {
      filteredUrls[shortid] = urlDatabase[shortid];
    }
  }
  return filteredUrls;
}

function generateRandomString(len) {
  let text = ""
  let charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < len; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));

  return text;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  if (!req.session.userid) {
    return res.status(401).send('Please log in or register to see content.')
  } else {
    const user = users[req.session.userid];
    const templateVars = {
      urls: urlsForUser(req.session.userid),
      username: user?.email
    }
    res.render("urls_index", templateVars);
  }
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const user = users[req.session.userid];
  const templateVars = {
    urls: urlsForUser(req.session.userid),
    username: user?.email
  }
  if (!req.session.userid) {
    res.redirect('/login')
  }
  res.render("urls_new", templateVars)
});

app.get("/registration", (req, res) => {
  if (req.session.userid) {
    res.redirect('/urls')
  }
  res.render("urls_register");
});

app.post("/registration", (req, res) => {
  const id = generateRandomString(4)
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  console.log(hashedPassword)

  if (!email || !password) {
    return res.status(400).send('please provide a username and password');
  }
  const foundUser = helper(email, users);
  if (foundUser) {
    return res.status(400).send('username already in use.')
  }
  users[id] = { id, email, password }
  req.session.userid = id;
  res.redirect('/urls')
});

app.get("/login", (req, res) => {
  if (users[req.session.userid]) {
    return res.redirect('/urls')
  }
  res.render('urls_login')
});

app.post("/login", (req, res) => {
  console.log(req.body)
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  bcrypt.compareSync(password, hashedPassword);
  const foundUser = helper(email, users);

  if (!foundUser) {
    return res.status(403).send('account not found')
  }
  if (password !== foundUser.password) {
    return res.status(403).send('password not correct.')
  }
  res.session('userid', foundUser.id);
  res.redirect('/urls')
});

app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('url not found')
  }
    const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id].longURL,
    username: req.session["userid"]
  }
  res.render("urls_show", templateVars)
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6)
  const longURL = req.body.longURL;
  console.log(req.body); 

  const temp = {
    longURL: longURL,
    userID: req.session.userid
  };
  urlDatabase[shortURL] = temp;
 
  if (!req.session.userid) {
    return res.status(401).send('Please log in to use the app.')
  }
  res.redirect(`/urls/${shortURL}`); 
});

app.post("/logout", (req, res) => {
  req.session = null
  res.redirect("/login");
});

app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`); 
});

app.get("/u/:id", (req, res) => {
  let shortURL = req.params.id;
  let longUrl = urlDatabase[shortURL]
  res.redirect(longUrl);
});

app.post("/urls/:id/delete", (req, res) => {
  let shortUrl = req.params.id
  delete urlDatabase[shortUrl]
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});