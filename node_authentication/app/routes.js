const isLoggedIn = require('../config/middleware/isLoggedIn');

module.exports = (app, passport) => {
  // Home page (with login links)
  app.get('/', (req, res) => {
    res.render('index.ejs');
  });

  // Get Login Form
  app.get('/login', (req, res) => {
    res.render('login.ejs', { message: req.flash('loginMessage') });
  });

  // Process Login Form
  app.post(
    '/login',
    passport.authenticate('local-login', {
      successRedirect: '/profile',
      failureRedirect: '/login',
      failureFlash: true
    })
  );

  // Get Signup Form
  app.get('/signup', (req, res) => {
    res.render('signup.ejs', { message: req.flash('signupMessage') });
  });

  // Process Signup Form
  app.post(
    '/signup',
    passport.authenticate('local-signup', {
      successRedirect: '/profile', // redirect to the secure profile section
      failureRedirect: '/signup', // redirect back to the signup page if there is an error
      failureFlash: true // allow flash messages
    })
  );

  // View all profile
  app.get('/profile', isLoggedIn, (req, res) => {
    res.render('profile.ejs', {
      user: req.user
    });
  });

  // Logout
  app.get('/logout', (req, res) => {
    res.logout();
    res.redirect('/');
  });
};
