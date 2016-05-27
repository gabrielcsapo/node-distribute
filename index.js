var express = require('express');
var app = express();
var GitServer = require('git-server');

var fs = require('fs');
var path = require('path');
var crypto = require('crypto');
var basicAuth = require('basic-auth-connect');
var kue = require('kue');
var bunyan = require('bunyan');
var log = bunyan.createLogger({name: "node-distribute"});

// TODO: abstract into lib/startup.js
// TODO: use lowdb, because eventually we want to be able to write to these files
// TODO: or abstract this out to be able to save the json files whenever you change the underlying object?

if (!fs.existsSync(path.resolve(__dirname, 'config', 'user.json'))) {
    var user = {
        username: 'root',
        password: crypto.randomBytes(20).toString('hex')
    }
    fs.writeFileSync(path.resolve(__dirname, 'config', 'user.json'), JSON.stringify(user, null, 4));
}
if (!fs.existsSync(path.resolve(__dirname, 'config', 'repos.json'))) {
    var repos = [{
        name: 'test',
        anonRead: false,
        users: [{
            user: user,
            permissions: ['R', 'W']
        }]
    }];
    fs.writeFileSync(path.resolve(__dirname, 'config', 'repos.json'), JSON.stringify(repos, null, 4));
}
// TODO: add checks to make sure the data is not malformed
var user = require('./config/user.json');
var repos = require('./config/repos.json');
repos.forEach(function(repo) {
    repo.users[0].user = user;
});

server = new GitServer(repos, true, path.resolve(__dirname, 'repos'), 7000);

server.on('pre-receive', function(update, repo) {
    log.info('git:pre-receive', repo.name);
    update.accept();
});

server.on('update', function(update, repo) {
    log.info('git:update', repo.name);
    update.accept();
});

server.on('pre-rebase', function(update, repo) {
    log.info('git:pre-rebase', repo.name);
    update.accept();
});

server.on('pre-auto-gc', function(update, repo) {
    log.info('git:pre-auto-gc', repo.name);
    update.accept();
});

server.on('commit-msg', function(update, repo) {
    log.info('git:commit-msg', repo.name);
    update.accept();
});

server.on('prepare-commit-msg', function(update, repo) {
    log.info('git:prepare-commit-msg', repo.name);
    update.accept();
});

server.on('pre-commit', function(update, repo) {
    log.info('git:pre-commit', repo.name);
    update.accept();
});

server.on('applypatch-msg', function(update, repo) {
    log.info('git:applypatch-msg', repo.name);
    update.accept();
});

server.on('commit', function(update, repo) {
    log.info('git:commit', repo.name);
    update.accept();
});

server.on('update', function(update, repo) {
    log.info('git:update', repo.name);
    update.accept();
});
server.on('post-update', function(update, repo) {
    log.info('git:post-update', repo.name);
    log.info('redeploy the app, build and start');
    // TODO: implement the deploy and starting the app
    // TODO: use kue to create a priority queue to not block main process
    // TODO: deploy should clone the repo to app and do a npm install
    // TODO: once the deploy is done start node process using npm start (PM2?)
    update.accept();
});
server.on('fetch', function(update, repo) {
    log.info('git:fetch', repo.name);
    update.accept();
});

var port = process.env.PORT || 1337;

// TODO: should show process values using the PM2 logs?
// TODO: admin portal should be able to add repos
// TODO: admin portal should be able to add users
// TODO: admin portal should record statics from all apps being run (geo, users, traffic, etc)
// TODO: admin portal should show all of that data
app.use(basicAuth(user.username, user.password));
app.use(function(req, res, next) {
    next();
});
app.use('/admin/queue', kue.app);

app.listen(port, function() {
    log.info('node-distribute listening on http://localhost:' + port)
});
