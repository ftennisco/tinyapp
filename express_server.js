const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));

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
  const templateVars = { urls: urlDatabase };
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

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

