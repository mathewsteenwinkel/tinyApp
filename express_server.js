
const express = require("express");
const cookieParser = require('cookie-parser')
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs")


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"

};

//for cookies and username



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
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies["username"],
  }
  res.render("urls_index", templateVars);
});

app.get("/url/register", (req, res) => {
  req.render("/url/register")
});

app.post("/url/register", (req, res) => {
  res.redirect("/urls")
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
  }
  res.render("urls_new", templateVars)
});

app.get("/urls/:id", (req, res) => {
  //console.log(req)
  const templateVars = { 
    id: req.params.id, 
    longURL: urlDatabase[req.params.id],
    username: req.cookies["username"]
   }
  res.render("urls_show", templateVars)
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString(6)
  const longURL = req.body.longURL;
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[shortURL]= longURL;
  //console.log(longURL)
  res.redirect(`/urls/${shortURL}`); // Respond with 'Ok' (we will replace this)
});

app.post("/urls/login", (req, res) => {

  res.cookie ('username',req.body.username)
  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  console.log()
  res.clearCookie ('username', req.body.username)
  res.redirect("/urls");
});


app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = req.body.longURL;
  console.log(req.body); // Log the POST request body to the console
  urlDatabase[shortURL]= longURL;
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