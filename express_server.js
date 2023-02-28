//++++++++ Dependencies/setup +++++++++++++
const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const {
  getUserByEmail,
  generateRandomString,
  urlsForUser,
  users,
  urlDatabase
} = require("./helper");

app.set("view engine", "ejs")

app.use(express.urlencoded({ extended: true }));
app.use(cookieSession({
  name: 'cookiemonster',
  keys: ['alsdkjfnlsdkjaf', 'sakdjfnlksd']
}))
app.use(express.urlencoded({ extended: false }));



//
app.get("/", (req, res) => {
  if (req.session.userid) {
    res.redirect("urls");
  } else {
    res.redirect("/login");
  }
});

// index page of urls
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
  if (req.session.userid) {
    res.redirect("urls");
  } else {
    res.redirect("/login");
  }
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

//registration page
app.get("/registration", (req, res) => {
  if (req.session.userid) {
    res.redirect('/urls')
  }

  const user = users[req.session.userid];
  const templateVars = {
    urls: urlsForUser(req.session.userid),
    username: user?.email
  }

  res.render("urls_register", templateVars);
});

app.post("/registration", (req, res) => {
  const id = generateRandomString(4);
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (!email || !password) {
    return res.status(400).send('please provide a username and password');
  }
  const foundUser = getUserByEmail(email, users);
  if (foundUser) {
    return res.status(400).send('username already in use.');
  }
  users[id] = { id, email, hashedPassword };

  req.session.userid = id;
  res.redirect('/urls');
});

// user login page
app.get("/login", (req, res) => {
  if (users[req.session.userid]) {
    return res.redirect('/urls')
  }
  const user = users[req.session.userid];
  const templateVars = {
    urls: urlsForUser(req.session.userid),
    username: user?.email
  }
  res.render('urls_login', templateVars)
});

app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);
  bcrypt.compareSync(password, hashedPassword);
  const foundUser = getUserByEmail(email, users);

  if (!foundUser) {
    return res.status(403).send('account not found')
  }
  if (password !== foundUser.password) {
    return res.status(403).send('password not correct.')
  }
  res.session('userid', foundUser.id);
  res.redirect('/urls')
});

//generate short URLs id
app.get("/urls/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) {
    return res.status(404).send('url not found')
  }
  const shortURL = req.params.id;
  if (req.session.userid === urlDatabase[shortURL].userID) {
    const templateVars = {
      id: req.params.id,
      longURL: urlDatabase[req.params.id].longURL,
      username: req.session["userid"]
    }
    res.render("urls_show", templateVars)
  } else {
    res.send("You don't own the url");
  }

});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6)
  const longURL = req.body.longURL;

  //console.log(urlDatabase[shortURL].userID);
  if (req.session.userid) {

    const temp = {
      longURL: longURL,
      userID: req.session.userid
    };
    urlDatabase[shortURL] = temp;
  }else {
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
  urlDatabase[shortURL].longURL = longURL;
  res.redirect(`/urls/${shortURL}`);
});


app.get("/u/:id", (req, res) => {
  let shortURL = req.params.id;
  let longUrl = urlDatabase[shortURL].longURL;
  res.redirect(longUrl);
});

//removes id 
app.post("/urls/:id/delete", (req, res) => {
  if (req.session.userid) {
    let shortUrl = req.params.id
    delete urlDatabase[shortUrl]
    res.redirect("/urls");
  } else {
    res.send("please log in to edit the url.");
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});