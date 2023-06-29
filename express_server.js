const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  const userId = req.cookies.user_id;
  if (userId && users[userId]) {
    res.locals.user = users[userId];
  } else {
    res.locals.user = null;
  }
  next();
});

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
    user: res.locals.user,
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

app.get("/register", (req, res) => {
  res.render("register");
});

app.get("/login", (req, res) => {
  res.render("login");
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
  const { email, password } = req.body;

  // Find the user object with the matching email in the users object
  const user = Object.values(users).find(user => user.email === email);

  if (user && user.password == password) {
    // Set the 'user_id' cookie with the user's ID
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(401).send("Invalid email or password");
  }
});

app.post("/logout", (req, res) => {
  // Clear the 'user_id' cookie
  res.clearCookie("user_id");

  // Redirect the user back to the /urls page
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const { email, password } = req.body;

  // Check if the email or password are empty strings
  if (!email || !password) {
    res.status(400).send("Email and password cannot be empty.");
    return;
  }

  // Check if the email is already registered
  const existingUser = Object.values(users).find(user => user.email === email);
  if (existingUser) {
    res.status(400).send("Email already registered.");
    return;
  }
  
  // Generate a random user ID
  const userId = generateRandomString(); 

  // Create a new user object
  const newUser = {
    if: userId,
    email: email,
    password: password
  };

  // Add the new user to the users object
  users[userId] = newUser;

  // Set the 'user_id' cooke with the generated user ID
  res.cookie("user_id", userId);

  // Redirect the user to the /urls page
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

