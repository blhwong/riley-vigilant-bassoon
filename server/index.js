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
const base64url = require('base64-url');

const app = express();
var server = require('http').Server(app);
const io = require('socket.io')(server);

io.on('connection', (socket) => {
  console.log('user is connected');
});


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
      console.log(response);
      var threads = response && response.threads;
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
      let save = {};
      let email = profile.emails[0].value;
      // authenticate
      let auth = new googleAuth();
      let oauth2Client = new auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'http://localhost:3000/auth/google/callback');
      oauth2Client.credentials = {
        access_token: accessToken
      };
      save.accessToken = accessToken;
      save.email = email;
      // find user in db
      User.findOne({email: email})
      .then((user) => {
        if (!user) {
          // if no user then list threads
          return listThreads(oauth2Client);
        } else {
          // if there is user then return it
          return Promise.reject({err: null, user: user});
        }
      })
      .then((threads) => {
        // save threads
        save.threads = JSON.stringify(threads);
        // create a webhook
        return createWebhook(oauth2Client);
      })
      .then((watch) => {
        save.watch = JSON.stringify(watch);
        let newUser = new User(save);
        // save new user into db
        return newUser.save();
      })
      .then((user) => {
        return done(null, user);
      })
      .catch(({err, user}) => {
        return done(err, user);
      });
    });
  }
));

app.post('/notification', (req, res) => {
  let email = JSON.parse(base64url.decode(req.body.message.data)).emailAddress;
  User.findOne({email: email})
  .then((user) => {
    let auth = new googleAuth();
    let oauth2Client = new auth.OAuth2(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET, 'http://localhost:3000/auth/google/callback');
    oauth2Client.credentials = {
      access_token: user.accessToken
    };
    listThreads(oauth2Client)
    .then((threads) => {
      user.threads = JSON.stringify(threads);
      return user.save();
    })
    .then((user) => {
      io.emit('new-mail', JSON.parse(user.threads));
      res.sendStatus(200);
    })
    .catch((err) => {
      res.sendStatus(200);
    });
  });
});

app.get('/login',
passport.authenticate('google', { scope: ['openid', 'email', 'https://mail.google.com/', 'https://www.googleapis.com/auth/gmail.modify', 'https://www.googleapis.com/auth/gmail.readonly']
}));

app.get( '/auth/google/callback',
passport.authenticate( 'google', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect('/');
});

app.get('/messages', (req, res) => {
  User.findOne({email: req.user.email})
  .then((user) => {
    res.send(user.threads);
  })
  .error((err) => {
    res.sendStatus(500).send(err);
  })
  .catch((err) => {
    res.sendStatus(404).send(err);
  });
});

app.get('/auth', (req, res) => {
  res.send(req.isAuthenticated());
});

app.get('*', (req, res) => {
  res.sendFile( path.resolve(__dirname, '..', 'public', 'dist', 'index.html'));
});

server.listen(3000, function() {
  console.log('listening on port 3000!');
});


