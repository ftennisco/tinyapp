const getUserByEmail = (email, userDb) => {
  for (const userId in userDb) {
    if (userDb[userId].email === email) {
      return userDb[userId]
    }
  }
  return undefined;
};

module.exports = { getUserByEmail };