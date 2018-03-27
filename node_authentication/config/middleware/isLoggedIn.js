module.exports = function isLoggedIn(req, res, next) {
  // Process if user is authenticated
  if (req.isAuthenticated()) {
    return next();
  }
  // Else redirect to home page
  res.redirect('/');
};
