
const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")

app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(express.urlencoded({ extended: false }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

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


//urlDatabase[generateRandomString] = req.body

//asign short url that call the function of the generator
//assign long url - body.
//push both into urldatabase
// redirect the user to the myURLS webpage so that they can see their new short url.



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
  const templateVars = {
    urls: urlDatabase,
    username: req.cookies["userid"],
  }
  console.log(req.cookies.userid)
  res.render("urls_index", templateVars);
});

app.get("/url/register", (req, res) => {
  req.render("/url/register")
});

app.post("/url/register", (req, res) => {

});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    username: req.cookies["userid"],

  }
  res.render("urls_new", templateVars)
});

app.get("/registration", (req, res) => {
  // const ID = req.params.email
  // const templateVars = obj 
  res.render("urls_register");
});

app.post("/registration", (req, res) => {
  const id = generateRandomString(4)
  const email = req.body.email;
  const password = req.body.password;
  //console.log('users1:', users)

  if (!email || !password) {
    return res.status(400).send('please provide a username and password');
  }
  let foundUser = null;
  for (const key in users) {
    const user = users[key];
    if (user.email === email) {
      foundUser = email;
    }
  }
  if (foundUser) {
    return res.status(400).send('username already in use.')
  }


  users[id] = { id, email, password }


  res.cookie('userid', id);
  res.redirect('/urls')

});

app.get("/login", (req, res) => {

  res.render('urls_login')
});

app.post("/login", (req, res) => {
  console.log(req.body)
  const email = req.body.email;
  const password = req.body.password;

  let foundUser = null;
  for (const key in users) {
    const user = users[key];
    if (user.email === email) {
       foundUser = user;
       break;
    }
  }
if (!foundUser) {
  return res.status(403).send ('account not found')
} 
if (password !== foundUser.password){
  return res.status(403).send ('password not correct.')
}

  res.cookie('userid', foundUser.id);
  res.redirect('/urls')
});

app.get("/urls/:id", (req, res) => {
  //console.log(req)
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    username: req.cookies["userid"]

  }
  res.render("urls_show", templateVars)
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6)
  const longURL = req.body.longURL;
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[shortURL] = longURL;
  //console.log(longURL)
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
});


// app.post("/urls/login", (req, res) => {

//   res.cookie ('user id',req.body.userid)
//   res.redirect("/login");
// });

app.post("/logout", (req, res) => {
  res.clearCookie('userid', req.body.userid)
  res.redirect("/login");
});


app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[shortURL] = longURL;
  //console.log(longURL)
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
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