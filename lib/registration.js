/**
 * Created by Krzysztof on 2015-05-23.
 */
var Application = require("../models/application");
var User = require("../models/user");
var db = require("secondthought");
var assert = require("assert");
var bcrypt = require("bcrypt-nodejs");
var Log = require("../models/log");
var Emitter = require("events").EventEmitter;
var util = require("util");

var ReqResult = function() {


    var result = {
        success: false,
        message: null,
        user: null
    };

    return result;
};
var Registration = function(db) {

    Emitter.call(this);
    var self = this;
    var continueWith = null;

    var validateInputs = function(app) {
        if(!app.email) {
            app.invalidate("Email is required");
            self.emit("invalid", app);
        } else if (!app.username) {
            app.invalidate("Username is required");
            self.emit("invalid", app);
        } else if (!app.password) {
            app.invalidate("Password is required");
            self.emit("invalid", app);
        } else if (!app.phone) {
            app.invalidate("Phone number is required");
            self.emit("invalid", app);
        } else if (app.password !== app.confirm) {
            app.invalidate("Passwords do not match");
            self.emit("invalid", app);
        } else {
            app.validate();
            self.emit("validated", app);
        }
    };

    var checkIfUsernameExist = function (app) {

        db.users.exists({username: app.username}, function (err, exists) {
            assert.ok(err === null);
            if(exists) {
                app.invalidate("This username already exists");
                self.emit("invalid", app);
            } else {
                self.emit("username-does-not-exist", app)
            }
        });
    };
    var checkIfEmailExist = function (app) {

        db.users.exists({email: app.email}, function (err, exists) {
            assert.ok(err === null, err);
            if(exists) {
                app.invalidate("This email already exists");
                self.emit("invalid", app);
            } else {
                self.emit("email-does-not-exist", app)
            }
        });
    };

    var createUser = function (app) {
        var user = new User(app);
        user.status = "approved";
        user.hashedPassword = bcrypt.hashSync(app.password);
        user.signInCount = 1;
        db.users.save(user, function (err, newUser) {
                assert.ok(err === null, err);
            app.user = newUser;
            self.emit("user-created", app);
        });
    };

    var addLogEntry = function(app) {

        var log = new Log( {
            subject: "Registration",
            userId: app.user.id,
            entry: "Successfully registered"
        });
        db.logs.save(log, function (err, newLog) {
            assert.ok(err === null, err);
            app.log = newLog;
            self.emit("log-created", app);
        });
    };


    
    self.applyForMembership = function (args, next) {
        continueWith = next;
        var app = new Application(args);
        self.emit("application-received", app);
    };

    var registrationOk = function(app) {
        var regResult = new ReqResult();
        regResult.success = true;
        regResult.message = "Welcome!";
        regResult.user = app.user;
        regResult.log = app.log;
        self.emit("registered", regResult);
        if(continueWith) {
            continueWith(null, regResult);
        }
    };
    var registrationNotOk = function(app) {
        var regResult = new ReqResult();
        regResult.success = false;
        regResult.message = app.message;
        self.emit("not-registered", regResult);
        if(continueWith) {
            continueWith(null, regResult);
        }
    };
    //event wiring
    self.on("application-received", validateInputs);
    self.on("validated", checkIfUsernameExist);
    self.on("username-does-not-exist", checkIfEmailExist);
    self.on("email-does-not-exist", createUser);
    self.on("user-created", addLogEntry);
    self.on("log-created", registrationOk);

    self.on("invalid", registrationNotOk);

    return self;
};
util.inherits(Registration, Emitter);
module.exports = Registration;

