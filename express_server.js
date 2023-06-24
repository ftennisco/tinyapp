const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.locals.username = req.cookies.username;
  next();
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let result = "";
  const characters = 
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const length = 6;

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }

  return result;
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase,
    username: req.cookies.username,
    // ... any other variables you want to pass
   };
  res.render("urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  res.redirect(longURL);
})

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];
  const templateVars = { id: id, longURL: longURL };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  // Store the longURL and shortURL in the urlDatabase
  urlDatabase[shortURL] = longURL;

  res.redirect(302, `/u/${shortURL}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;

  // Check if the URL with the specified ID exists in the urlDatabase
  if (urlDatabase[id]) {
    delete urlDatabase[id]; // Delete the URL resource from the urlDatabase
    res.redirect('/urls'); // Redirect the user back to the URL index page after deletion
  } else {
    res.status(404).send('URL not found'); // Handle the case where the URL is not found
  }
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const updatedURL = req.body.updatedURL;

  // Update the value of the stored long URL based on the new value in req.body
  // Replace the following code with your actual implementation
  urls[id] = updatedURL;

  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  const username = req.body.username;

  // Set the 'Set-Cookie' header to set the 'username' cookie
  res.setHeader("Set-Cookie", `username=${username}`);

  res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  // Clear the 'username' cookie
  res.clearCookie("username");

  // Redirect the user back to the /urls page
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

