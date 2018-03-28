const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const TwitterStrategy = require('passport-twitter').Strategy;
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
const GitHubStrategy = require('passport-github').Strategy;
const LinkedInStrategy = require('passport-linkedin').Strategy;

const User = require('../app/models/user');
const keys = require('./keys');

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
//================
//  Local Strategy
//================
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
      console.log('[local-signup]Local Profile => ', email, password);
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
// Local Login Strategy
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

//==================
// Facebook Strategy
//==================
// Facebook doesn't support http ! so you can't test it in localhot
// localhost is http. you have to host it in a https server to test
passport.use(
  new FacebookStrategy(
    {
      clientID: keys.facebookAuth.clientID,
      clientSecret: keys.facebookAuth.clientSecret,
      callbackURL: keys.facebookAuth.callbackURL,
      // In Facebook app at the "Valid OAuth Redirect URIs" section add this url
      passReqToCallback: true
      // (it's let us check if a user is logged in or not)
      // simpliy Allows us to pass req from our route to below perameter
    },
    (req, token, refreshToken, profile, done) => {
      console.log('Facebook Profile => ', profile);
      // Facebook will return token and profile
      // Asynchronous
      process.nextTick(() => {
        // Check the user is already logged in
        if (!req.user) {
          User.findOne({ 'facebook.id': profile.id }, (err, user) => {
            if (err) return done(err);
            if (user) {
              // In this case
              // (there is a user) or (may be have user id but no token)
              // means user was linked at one point and then removed
              // so add our token and profile information
              if (!user.facebook.token) {
                //may be have user id but no token
                const facebookUserReturnBack = user;
                facebookUserReturnBack.facebook.token = token;
                facebookUserReturnBack.facebook.name = profile.displayName;
                if (profile.emails) {
                  facebookUserReturnBack.facebook.email = profile.emails[0].value;
                }
                facebookUserReturnBack.save(e => {
                  if (e) throw e;
                  return done(null, facebookUserReturnBack);
                });
              }
              return done(null, user); // returning existing User already in the database
            }
            // Else User is totally New to us, create from schema
            const newUser = new User();

            newUser.facebook.id = profile.id;
            newUser.facebook.token = token;
            newUser.facebook.name = `${profile.displayName}`;
            if (profile.emails) {
              newUser.facebook.email = profile.emails[0].value;
            }

            newUser.save(error => {
              if (error) {
                throw error;
              }
              return done(null, newUser);
            });
          });
        } else {
          // So user already exists and is logged in, we have to link accounts
          const user = req.user; // pull out the user from session

          user.facebook.id = profile.id;
          user.facebook.token = token;
          user.facebook.name = profile.displayName;
          if (profile.emails) {
            user.facebook.email = profile.emails[0].value;
          }

          user.save(error => {
            if (error) {
              throw error;
            }
            return done(null, user);
          });
        }
      });
    }
  )
);

//==================
// Twitter Strategy
//==================
// use 127.0.0.1 (in browser & app callback url) instead of localhost to work with twitter app
// else you will get 'Error: Failed to find request token in session' error!
passport.use(
  new TwitterStrategy(
    {
      consumerKey: keys.twitterAuth.consumerKey,
      consumerSecret: keys.twitterAuth.consumerSecret,
      callbackURL: keys.twitterAuth.callbackURL,
      passReqToCallback: true
    },
    (req, token, tokenSecret, profile, done) => {
      console.log('Twitter Profile => ', profile);
      process.nextTick(() => {
        // Check the user is already logged in
        if (!req.user) {
          User.findOne({ 'twitter.id': profile.id }, (err, user) => {
            if (err) return done(err);
            if (user) {
              // In this case
              // (there is a user) or (may be have user id but no token)
              // means user was linked at one point and then removed
              // so add our token and profile information
              if (!user.twitter.token) {
                // may be have user id but no token
                const twitterUserReturnBack = user;
                twitterUserReturnBack.twitter.token = token;
                twitterUserReturnBack.twitter.username = profile.username;
                twitterUserReturnBack.twitter.displayName = profile.displayName;

                twitterUserReturnBack.save(e => {
                  if (e) throw e;
                  return done(null, twitterUserReturnBack);
                });
              }
              return done(null, user);
            }
            // Else User is totally New to us, create from schema
            const newUser = new User();
            newUser.twitter.id = profile.id;
            newUser.twitter.token = token;
            newUser.twitter.username = profile.username;
            newUser.twitter.displayName = profile.displayName;

            newUser.save(error => {
              if (error) throw error;
              return done(null, newUser);
            });
          });
        } else {
          // So user already exists and is logged in, we have to link accounts
          const user = req.user; // pull out the user from session
          user.twitter.id = profile.id;
          user.twitter.token = token;
          user.twitter.username = profile.username;
          user.twitter.displayName = profile.displayName;

          user.save(error => {
            if (error) throw error;
            return done(null, user);
          });
        }
      });
    }
  )
);

//==================
// Google Strategy
//==================
passport.use(
  new GoogleStrategy(
    {
      clientID: keys.googleAuth.clientID,
      clientSecret: keys.googleAuth.clientSecret,
      callbackURL: keys.googleAuth.callbackURL,
      passReqToCallback: true
      // (it's let us check if a user is logged in or not)
      // simpliy Allows us to pass req from our route to below perameter
    },
    (req, token, refreshToken, profile, done) => {
      console.log('Google Profile => ', profile);
      process.nextTick(() => {
        // Check the user is already logged in
        if (!req.user) {
          User.findOne({ 'google.id': profile.id }, (err, user) => {
            if (err) return done(err);
            if (user) {
              // In this case
              // (there is a user) or (may be have user id but no token)
              // means user was linked at one point and then removed
              // so add our token and profile information
              if (!user.google.token) {
                const googleUserReturnBack = user;
                googleUserReturnBack.google.token = token;
                googleUserReturnBack.google.name = profile.displayName;
                if (profile.emails) {
                  googleUserReturnBack.google.email = profile.emails[0].value;
                }
                googleUserReturnBack.save(e => {
                  if (e) throw e;
                  return done(null, googleUserReturnBack);
                });
              }
              return done(null, user);
            }
            // Else User is totally New to us, create from schema
            const newUser = new User();
            newUser.google.id = profile.id;
            newUser.google.token = token;
            newUser.google.name = profile.displayName;
            newUser.google.email = profile.emails[0].value;

            newUser.save(error => {
              if (error) throw error;
              return done(null, newUser);
            });
          });
        } else {
          // So user already exists and is logged in, we have to link accounts
          const user = req.user; // pull out the user from session

          user.google.id = profile.id;
          user.google.token = token;
          user.google.name = profile.displayName;
          user.google.email = profile.emails[0].value;

          user.save(error => {
            if (error) {
              throw error;
            }
            return done(null, user);
          });
        }
      });
    }
  )
);

//==================
// Github Strategy
//==================
passport.use(
  new GitHubStrategy(
    {
      clientID: keys.githubAuth.clientID,
      clientSecret: keys.githubAuth.clientSecret,
      callbackURL: keys.githubAuth.callbackURL,
      passReqToCallback: true
      // (it's let us check if a user is logged in or not)
      // simpliy Allows us to pass req from our route to below perameter
    },
    (req, token, refreshToken, profile, done) => {
      console.log('github Profile => ', profile);
      // github will return token and profile
      // Asynchronous
      process.nextTick(() => {
        // Check the user is already logged in
        if (!req.user) {
          User.findOne({ 'github.id': profile.id }, (err, user) => {
            if (err) return done(err);
            if (user) {
              // In this case
              // (there is a user) or (may be have user id but no token)
              // means user was linked at one point and then removed
              // so add our token and profile information
              if (!user.github.token) {
                //may be have user id but no token
                const githubUserReturnBack = user;
                githubUserReturnBack.github.token = token;
                githubUserReturnBack.github.name = profile.displayName;
                if (profile.emails) {
                  githubUserReturnBack.github.email = profile.emails[0].value;
                }
                githubUserReturnBack.save(e => {
                  if (e) throw e;
                  return done(null, githubUserReturnBack);
                });
              }
              return done(null, user); // returning existing User already in the database
            }
            // Else User is totally New to us, create from schema
            const newUser = new User();

            newUser.github.id = profile.id;
            newUser.github.token = token;
            newUser.github.name = `${profile.displayName}`;
            if (profile.emails) {
              newUser.github.email = profile.emails[0].value;
            }

            newUser.save(error => {
              if (error) {
                throw error;
              }
              return done(null, newUser);
            });
          });
        } else {
          // So user already exists and is logged in, we have to link accounts
          const user = req.user; // pull out the user from session

          user.github.id = profile.id;
          user.github.token = token;
          user.github.name = profile.displayName;
          if (profile.emails) {
            user.github.email = profile.emails[0].value;
          }

          user.save(error => {
            if (error) {
              throw error;
            }
            return done(null, user);
          });
        }
      });
    }
  )
);

//==================
// LinkedIn Strategy
//==================
passport.use(
  new LinkedInStrategy(
    {
      consumerKey: keys.linkedinAuth.clientID,
      consumerSecret: keys.linkedinAuth.clientSecret,
      callbackURL: keys.linkedinAuth.callbackURL,
      passReqToCallback: true
      // (it's let us check if a user is logged in or not)
      // simpliy Allows us to pass req from our route to below perameter
    },
    (req, token, refreshToken, profile, done) => {
      console.log('linkedin Profile => ', profile);
      process.nextTick(() => {
        // Check the user is already logged in
        if (!req.user) {
          User.findOne({ 'linkedin.id': profile.id }, (err, user) => {
            if (err) return done(err);
            if (user) {
              // In this case
              // (there is a user) or (may be have user id but no token)
              // means user was linked at one point and then removed
              // so add our token and profile information
              if (!user.linkedin.token) {
                const linkedinUserReturnBack = user;
                linkedinUserReturnBack.linkedin.token = token;
                linkedinUserReturnBack.linkedin.name = profile.displayName;
                if (profile.emails) {
                  linkedinUserReturnBack.linkedin.email = profile.emails[0].value;
                }
                linkedinUserReturnBack.save(e => {
                  if (e) throw e;
                  return done(null, linkedinUserReturnBack);
                });
              }
              return done(null, user);
            }
            // Else User is totally New to us, create from schema
            const newUser = new User();
            newUser.linkedin.id = profile.id;
            newUser.linkedin.token = token;
            newUser.linkedin.name = profile.displayName;
            if (profile.emails) {
              newUser.linkedin.email = profile.emails[0].value;
            }

            newUser.save(error => {
              if (error) throw error;
              return done(null, newUser);
            });
          });
        } else {
          // So user already exists and is logged in, we have to link accounts
          const user = req.user; // pull out the user from session

          user.linkedin.id = profile.id;
          user.linkedin.token = token;
          user.linkedin.name = profile.displayName;
          if (profile.emails) {
            user.linkedin.email = profile.emails[0].value;
          }

          user.save(error => {
            if (error) {
              throw error;
            }
            return done(null, user);
          });
        }
      });
    }
  )
);
module.exports = passport;
