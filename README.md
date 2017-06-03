# Riley
Gmail API to enable push notifications to front end

Heroku link: https://warm-peak-61497.herokuapp.com

Notes:
Snippets of e-mail are shown in the front end, and these threads are saved in the db. Used React-Bootstrap to do minimal styling for buttons and table. Used PassportJS to authenticate through Google OAuth2.0. Created webhook to ping /notification endpoint to update the db, and then use socket.io to emit changes and update the client. Used bluebird promises to maintain async chains. If I had more time, I would make code even more modular through refactor, and just make system more robust.

## Table of Contents

1. [Usage](#Usage)
1. [Requirements](#requirements)
1. [Development](#development)
    1. [Installing Dependencies](#installing-dependencies)
    1. [Tasks](#tasks)
1. [Roadmap](#roadmap)
1. [Contributing](#contributing)

## Usage

## Technologies

### Frontend
- React (ES6)
- React-Bootstrap
- Gmail API
- Socket.io
- Webhook

### Backend
- Node
- Express
- MongoDB
- Passport

### Other
- Heroku


## Requirements

- Node 6.4.x
- React 15.0.x


## Setup

From within the root directory:
clone down the repo
```
git clone https://github.com/blhwong/riley-vigilant-bassoon.git
```
cd to the root directory of the project
```
cd riley-vigilant-bassoon
```
install dependencies
```
npm install
```
start database
```
mongod
```
Note: if this fails, try ``` sudo mongod ```

stand up server
```
npm run server-dev
```
start webpack
```
npm run react-dev
```
start hacking!

Create .env file to manage Watson, Twilio, AWS, and Elastic Search credentials as shown below
```
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
SESSION_SECRET=
PROJECT_NAME=
DOMAIN= http://localhost:3000/
```

Get credentials from Google Cloud Platform. Make sure you enable Google+ API, and Gmail API.
When creating credentials, select 'Help me choose' option and select Google+ API (Not Gmail API).
Where will you be calling API from: Nodejs.
What data will you be accessing: User data.
Add http://localhost:3000 and http://localhost:3000/auth/google/callback.

Select Add domain for adding a webhook at 'your-domain-here'/notification. Add a domain that you own. For testing purposes you can just use ngrok and expose the 3000 port using http 3000.

Navigate to PubSub platform to add publisher subscriber. Create topic called 'new-mail', and set permissions by adding serviceAccount:gmail-api-push@system.gserviceaccount.com to grant publish privileges.
