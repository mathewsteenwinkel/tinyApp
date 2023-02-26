//+++++++++Functions+++++++++

// function to look up if email is already in use.
const helper = (email, users) => {
  for (let key in users) {
    const user = users[key];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
}

//------------------------

// function to generate a random string of your desired length.
function generateRandomString(len) {
  let text = ""
  let charset = "abcdefghijklmnopqrstuvwxyz0123456789";
  for (let i = 0; i < len; i++)
    text += charset.charAt(Math.floor(Math.random() * charset.length));

  return text;
}

//------------------------

const urlsForUser = (id) => {
  const filteredUrls = [];

  for (const shortid in urlDatabase) {
    if (id == urlDatabase[shortid].userID) {
      filteredUrls[shortid] = urlDatabase[shortid];
    }
  }
  return filteredUrls;
}


//original database
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

// original users
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


module.exports = {helper, generateRandomString, urlsForUser};
