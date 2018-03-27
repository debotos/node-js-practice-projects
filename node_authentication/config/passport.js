const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

const User = require('../app/models/user');

// passport session setup
// required for persistent login sessions
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

// Local Signup (named strategies)
passport.use(
  'local-signup',
  new LocalStrategy(
    {
      //Override default username and password field with email and password
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true // allows us to pass back the entire request to the callback
    },
    (req, email, password, done) => {
      process.nextTick(() => {
        // checking for already exists user
        console.log('local-signup strategy called!');
        User.findOne({ 'local.email': email }, (err, user) => {
          if (err) {
            return done(err);
          }
          if (user) {
            return done(null, false, req.flash('signupMessage', 'That email is already taken !'));
          }
          // create new user using local credentials
          const newUser = new User();
          newUser.local.email = email; // using local object of User model
          newUser.local.password = newUser.generateHash(password);
          // Save the user
          newUser
            .save()
            .then(userData => done(null, userData))
            .catch(error => {
              throw error;
            });

          console.log('New user created Successfully !');
        });
      });
    }
  )
);

passport.use(
  'local-login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true
    },
    (req, email, password, done) => {
      User.findOne({ 'local.email': email }, (err, user) => {
        if (err) {
          return done(err);
        }
        if (!user) {
          return done(null, false, req.flash('loginMessage', 'No user found !'));
        }
        if (!user.validPassword(password)) {
          return done(null, false, req.flash('loginMessage', 'Oops! Wrong Password !'));
        }
        return done(null, user);
      });
    }
  )
);

module.exports = passport;
