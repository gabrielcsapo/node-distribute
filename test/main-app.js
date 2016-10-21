var request = require('supertest');
var path = require('path');
var assert = require('chai').assert;
var spawn = require('child_process').spawn;
var chance = require('chance')();

describe('main-app', function() {
    it('should add the necessary remote', function(done) {
        var user = require('../config/user.json');
        var remote = 'http://' + user.username + ':' + user.password + '@localhost:7000/main-app.git';
        var git = spawn('git', ['remote', 'add', 'origin', remote], {
            cwd: path.resolve(__dirname, 'fixtures', 'main-app')
        });

        git.on('close', function() {
            setTimeout(function() {
                done();
            }, 1000);
        });
    });

    it('should be able to get test repo', function(done) {
        var git = spawn('git', ['push', 'origin', 'master'], {
            cwd: path.resolve(__dirname, 'fixtures', 'main-app')
        });

        git.on('close', function() {
            setTimeout(function() {
                done();
            }, 25000);
        });
    });

    for (var i = 0; i < 10; i++) {
        it('should be able to reach new app url', function(done) {
            request('http://localhost:1337')
                .get('/')
                .set('Host', '')
                .set('x-forwarded-for', chance.ip())
                .set('referrer', chance.domain())
                .expect(200, function(err) {
                    assert.isNull(err);
                    done();
                });
        });
    }
})