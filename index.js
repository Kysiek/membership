/**
 * Created by Krzysztof on 2015-05-24.
 */
var events = require("events");
var util = require("util");
var Registration = require("./lib/registration");
var Authentication = require("./lib/authentication");
var db = require("secondthought");
var assert = require("assert");

var Membership = function (dbName) {
    var self = this;
    events.EventEmitter.call(self);

    self.findUserByToken = function (token, next) {
        db.connect({db: dbName, host: "ubuntu_vm.com", port: 28015}, function (err, db) {
            assert.ok(err === null, err);
            db.users.first({authenticationToken: token}, next);
        });
    };
    
    self.authenticate = function (username, password, next) {
        db.connect({db: dbName, host: "ubuntu_vm.com", port: 28015}, function (err, db) {
            var auth = new Authentication(db);

            auth.on("authenticated", function (authResult) {
                self.emit("authenticated", authResult)
            });
            auth.on("non-authenticated", function (authResult) {
                self.emit("non-authenticated", authResult)
            });
            auth.authenticate({username: username, password: password}, next);
        });
    };

    self.register = function (username, email, password, confirm, phone,  next) {
        db.connect({db: dbName, host: "ubuntu_vm.com", port: 28015}, function (err, db) {
            var reg = new Registration(db);

            reg.on("registered", function (regResult) {
                self.emit("registered", regResult)
            });
            reg.on("non-registered", function (regResult) {
                self.emit("non-registered", regResult)
            });
            reg.applyForMembership({username: username, password: password, confirm: confirm, email: email, phone: phone}, next);
        });
    };
    return self;
};

util.inherits(Membership, events.EventEmitter);
module.exports = Membership;