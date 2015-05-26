/**
 * Created by Krzysztof on 2015-05-24.
 */
var events = require("events");
var util = require("util");
var assert = require("assert");
var bcrypt = require("bcrypt-nodejs");
var User = require("../models/user");
var Log = require("../models/log");

var AuthResult = function (creds) {
    return {
        creds: creds,
        success: false,
        message: null,
        user: null,
        log: null
    };
};

var Authentication = function (db) {
    var self = this;
    var continueWith = null;
    events.EventEmitter.call(self);

    //validate credentials
    var validateCredentials = function (authResult) {

        if(!authResult.creds.username) {
            authResult.message = "Username cannot be empty";
            self.emit("invalid", authResult);
        } else if(!authResult.creds.password) {
            authResult.message = "Password cannot be empty";
            self.emit("invalid", authResult);
        } else {
            self.emit("credentials-ok", authResult);
        }
    };
    //find the user
    var findUser = function (authResult) {
        db.users.first({username: authResult.creds.username}, function (err, foundUser) {
            assert.ok(err == null, err);

            if(foundUser) {
                authResult.user = new User(foundUser);
                self.emit("user-found", authResult);
            } else {
                authResult.message = "Invalid username";
                self.emit("invalid", authResult);
            }
        });
    };
    
    //compare the password
    var comparePasswords = function (authResult) {
        var matched = bcrypt.compareSync(authResult.creds.password, authResult.user.hashedPassword);
        if(matched) {
            self.emit("passwords-accepted", authResult);
        } else {
            authResult.message = "Password is incorrect";
            self.emit("invalid", authResult);
        }
    };
    //bump the stats
    var updateUserStats = function (authResult) {
        var user = authResult.user;
        user.signInCount += 1;
        user.lastLoginAt = user.currentLoginAt;
        user.currentLoginAt = new Date();
        var updates = {
            signInCount: user.signInCount,
            lastLoginAt: user.lastLoginAt,
            currentLoginAt: user.currentLoginAt
        };
        db.users.updateOnly(updates, user.id, function (err, updates) {
            assert.ok(err === null, err);
            self.emit("stats-updated", authResult);
        })
    };
    //update user
    //create a log entry
    var createLog = function (authResult) {
        var log = new Log({subject: "Authentication", userId: authResult.user.id, entry: "Successfully logged in"});

        db.logs.save(log, function (err, newLog) {
            assert.ok(err === null, err);
            authResult.log = newLog;
            self.emit("log-created", authResult);
        });
    };


    var authOk = function (authResult) {
        authResult.success = true;
        authResult.message = "Welcome!";
        self.emit("authenticated", authResult);
        self.emit("completed", authResult);

        if(continueWith) {
            continueWith(null, authResult);
        }
    };

    var authNotOk = function (authResult) {
        authResult.success = false;
        self.emit("not-authenticated", authResult);
        self.emit("completed", authResult);
        if(continueWith) {
            continueWith(null, authResult);
        }
    };

    self.on("login-received", validateCredentials);
    self.on("credentials-ok", findUser);
    self.on("user-found", comparePasswords);
    self.on("passwords-accepted", updateUserStats);
    self.on("stats-updated", createLog);
    self.on("log-created", authOk);

    self.on("invalid", authNotOk);

    self.authenticate = function (creds, next) {

        continueWith = next;
        var authResult = new AuthResult(creds);
        self.emit("login-received", authResult);
    }
};
util.inherits(Authentication, events.EventEmitter);

module.exports = Authentication;