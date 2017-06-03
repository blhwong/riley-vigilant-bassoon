require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const db = require('../db');
const User = db.User;
const passport = require('passport');
const path = require('path');
const google = require('googleapis');
const gmail = google.gmail('v1');
const googleAuth = require('google-auth-library');
const GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

const app = express();

app.use(require('morgan')('dev'));

passport.serializeUser(function(user, cb) {
  cb(null, user);
});

passport.deserializeUser(function(obj, cb) {
  cb(null, obj);
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(require('express-session')({
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.resolve(__dirname, '..', 'public', 'dist')));


const createWebhook = function(auth) {
  return new Promise((resolve, reject) => {
    gmail.users.watch({
      auth: auth,
      userId: 'me',
      resource: {
        labelIds: ['INBOX'],
        topicName: `projects/${process.env.PROJECT_NAME}/topics/mail`
      }
    }, {}, (err, watchResponse) => {
      if (err) {
        reject({err: err});
      } else {
        resolve(watchResponse);
      }
    });
  });
};

const listThreads = function(auth) {
  return new Promise((resolve, reject) => {
    gmail.users.threads.list({
      auth: auth,
      userId: 'me',
    }, function(err, response) {
      if (err) {
        reject({err: err});
      }
      var threads = response.threads;
      resolve(threads);
    });
  });
};


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/callback',
  scope: ['openid', 'email', 'https://mail.google.com/', 'https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.readonly']
},
  function(accessToken, refreshToken, profile, done) {
    process.nextTick(function() {
      return done(null, profile);
    });
  }
));

app.get('/login',
passport.authenticate('google', { scope: ['openid', 'email', 'https://mail.google.com/', 'https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.readonly']
}));

app.get( '/auth/google/callback',
passport.authenticate( 'google', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect('/');
});

app.get('*', (req, res) => {
  res.sendFile( path.resolve(__dirname, '..', 'public', 'dist', 'index.html'));
});

server.listen(3000, function() {
  console.log('listening on port 3000!');
});


