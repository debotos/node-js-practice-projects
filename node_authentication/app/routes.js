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

  // Facebook auth Routes
  app.get(
    '/auth/facebook',
    passport.authenticate('facebook', {
      scope: ['public_profile', 'email']
    })
  );

  // Facebook auth callback route
  app.get(
    '/auth/facebook/callback',
    passport.authenticate('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    })
  );

  // Twitter auth route
  app.get('/auth/twitter', passport.authenticate('twitter'));

  // Twitter auth callback route
  app.get(
    '/auth/twitter/callback',
    passport.authenticate('twitter', {
      successRedirect: '/profile',
      failureRedirect: '/'
    })
  );

  // Google auth callback route
  // Place this callback route before /auth/google route
  // Else you will get 'TokenError: Code was already redeemed' or endless loading...
  app.get(
    '/auth/google/callback',
    passport.authenticate('google', {
      successRedirect: '/profile',
      failureRedirect: '/'
    })
  );

  // Google auth route
  app.get(
    '/auth/google',
    passport.authenticate('google', {
      scope: ['profile', 'email']
    })
  );

  // Logout
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });

  //=========================================
  // Authorize (Routes for Already Logged In)
  //=========================================
  // Local
  app.get('/connect/local', (req, res) => {
    res.render('connect-local.ejs', { message: req.flash('signupMessage') });
  });

  app.post(
    '/connect/local',
    passport.authenticate('local-signup', {
      successRedirect: '/profile',
      failureRedirect: '/connect/local',
      failureFlash: true
    })
  );
  // Facebook
  app.get(
    '/connect/facebook',
    passport.authorize('facebook', {
      scope: ['public_profile', 'email']
    })
  );
  app.get(
    '/connect/facebook/callback',
    passport.authorize('facebook', {
      successRedirect: '/profile',
      failureRedirect: '/'
    })
  );
  // Twitter
  app.get('/connect/twitter', passport.authorize('twitter', { scope: 'email' }));
  app.get(
    '/connect/twitter/calback',
    passport.authorize('twitter', {
      successRedirect: '/porfile',
      failureRedirect: '/'
    })
  );
  // Google
  app.get('/connect/google', passport.authorize('google', { scope: ['profile', 'email'] }));
  app.get(
    '/connect/google/callback',
    passport.authorize('google', {
      successRedirect: '/profile',
      failureRedirect: '/'
    })
  );
  //=========================================================
  // Unlink accounts
  // Local
  app.get('/unlink/local', (req, res) => {
    const user = req.user;
    user.local.email = undefined;
    user.local.password = undefined;
    user.save(err => {
      if (err) {
        console.log(err);
      }
      res.redirect('/profile');
    });
  });

  // Facebook
  app.get('/unlink/facebook', (req, res) => {
    const user = req.user;
    user.facebook.token = undefined;
    user.save(error => {
      if (error) {
        console.log(error);
      }
      res.redirect('/profile');
    });
  });

  // Twitter
  app.get('/unlink/twitter', (req, res) => {
    const user = req.user;
    user.twitter.token = undefined;
    user.save(err => {
      if (err) {
        console.log(err);
      }
      res.redirect('/profile');
    });
  });

  // Google
  app.get('/unlink/google', (req, res) => {
    const user = req.user;
    user.google.token = undefined;
    user.save(err => {
      if (err) {
        console.log(err);
      }
      res.redirect('/profile');
    });
  });
};
