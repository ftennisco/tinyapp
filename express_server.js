const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");

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
  b6UTxQ: {
    longURL: "https://www.tsn.ca",
    userID: "aJ481W",
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "aJ481W",
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

function getUserURLs(userID) {
  const userURLs = {};
  for (const key in urlDatabase) {
    if (urlDatabase[key].userID === userID) {
      userURLs[key] = urlDatabase[key];
    }
  }
  return userURLs;
};

const getUserByEmail = (email, userDb) => {
  for (const userId in userDb) {
    if (userDb[userId].email === email) {
      return userDb[userId]
    }
  }
  return null
};

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
  // Check if the user is logged in
  if (!res.locals.user) {
    res.redirect("/login"); // Redirect to /login if not logged in
  } else {
    res.render("urls_new");
  }
});

app.get("/urls", (req, res) => {
  if (!res.locals.user) {
    const templateVars = {
      errorMessage: "You need to be logged in to view URLs. Please log in or register.",
    };
    res.render("error", templateVars);
    return;
  }

  const userURLs = getUserURLs(res.locals.user.id);

  const templateVars = {
    urls: userURLs,
    user: res.locals.user,
  };
  res.render("urls_index", templateVars);
});

app.get("/u/:id", (req, res) => {
  const id = req.params.id;
  const longURL = urlDatabase[id];

  if (longURL) {
    res.redirect(longURL); // Redirect to the longURL if it exists
  } else {
    res.status(404).send("URL not found"); // Send a 404 Not Found status with an error message if the URL does not exist
  }
});

app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];

  // Check if the user is logged in
  if (!res.locals.user) {
    const templateVars = {
      errorMessage: "You need to be logged in to view this URL. Please log in or register.",
    };
    res.render("error", templateVars);
    return;
  }

  // Check if the URL exists and belongs to the logged in user
  if (url && url.userID === res.locals.user.id) {
    const templateVars = { id: id, longURL: url.longURL };
    res.render("urls_show", templateVars);
  } else {
    const templateVars = {
      errorMessage: "URL not found or you do not have permission to access it.",
    };
    res.render("error", templateVars);
  }
});

app.get("/register", (req, res) => {
  // Check if the user is already logged in
  if (res.locals.user) {
    res.redirect("/urls"); // Redirect to /urls if logged in
  } else {
    res.render("register");
  }
});

app.get("/login", (req, res) => {
  // Check if the user is already logged in
  if (res.locals.user) {
    res.redirect("/urls");
  } else {
    res.render("login");
  }
});

app.post("/urls", (req, res) => {
  // Check if the user is logged in
  if (!res.locals.user) {
    //Respond with an error message if not logged in
    res.status(401).send("You need to be logged in to shorten URLs.");
    return;
  }

  const longURL = req.body.longURL;
  const shortURL = generateRandomString();

  urlDatabase[shortURL] = {
    longURL: longURL,
    userID: res.locals.user.id, // Associate the URL with the logged-in user's ID
  };

  res.redirect(302, `/u/${shortURL}`);
});

app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const url = urlDatabase[id];

  // Check if the URL exists
  if (!url) {
    res.status(404).send("URL not found");
    return;
  }

  // Check if the user is logged in
  if (!res.locals.user) {
    res.status(401).send("You need to be logged in to delete this URL.");
    return;
  }

  // Check if the user owens the URL
  if (url.userID !== res.locals.user.id) {
    res.status(403).send("You do not have permission to delete this URL.");
    return;
  }

  // Delete the URL
  delete urlDatabase[id];
  res.redirect('/urls');
});

app.post('/urls/:id', (req, res) => {
  const id = req.params.id;
  const updatedURL = req.body.updatedURL;
  const url = urlDatabase[id];

  // Check if the URL exists
  if (!url) {
    res.status(404).send("URL not found");
    return;
  }

  // Check if the user is logged in
  if (!res.locals.user) {
    res.status(401).send("You need to be logged in to edit this URL.");
    return;
  }

  // Check if the user owns the URL
  if (url.userID !== res.locals.user.id) {
    res.status(403).send("You do not have permission to edit this URL.");
    return;
  }

  // Update the URL
  url.longURL = updatedURL;
  res.redirect("/urls");
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;

  const userFound = getUserByEmail(email, users)

  if (!userFound) {
    return res.status(403).send("User not found"); // Return 403 if user is not found
  }

  // Use bcrypt.compareSync to compare the provided password with the hashed password
  const passwordMatch = bcrypt.compareSync(password, userFound.password);

  if (!passwordMatch) {
    return res.status(403).send("Incorrect password");
  }

  res.cookie("user_id", userFound.id); // Set the user_id cookie with the matched user's ID
  return res.redirect("/urls"); // Redirect to /urls after successful login
});

app.post("/logout", (req, res) => {
  // Clear the 'user_id' cookie
  res.clearCookie("user_id");

  // Redirect the user back to the login page
  res.redirect("/login");
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

  // Hash the password using bcrypt
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Generate a random user ID
  const userId = generateRandomString();

  // Create a new user object with the hashed password
  const newUser = {
    id: userId,
    email: email,
    password: hashedPassword
  };

  // Add the new user to the users object
  users[userId] = newUser;

  // Set the 'user_id' cookie with the generated user ID
  res.cookie("user_id", userId);

  // Redirect the user to the /urls page
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

