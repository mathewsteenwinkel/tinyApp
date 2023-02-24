const helper = (email, users) => {
  for (let key in users) {
    const user = users[key];
    if (user.email === email) {
      return user;
    }
  }
  return undefined;
}

module.exports = helper;