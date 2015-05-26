/**
 * Created by Krzysztof on 2015-05-24.
 */
var Registration = require("../lib/registration");
var db = require("secondthought");
var assert = require("assert");
var Authentication = require("../lib/authentication");
var should = require("should");

describe("Authentication", function () {
    var reg = {},
        auth = {};
    before(function(done){
        db.connect({db: "membership", host: "ubuntu_vm.com", port: 28015}, function (err, db) {
            reg = new Registration(db);
            auth = new Authentication(db);
            done();
        });
    });
    describe("a valid login", function () {
        var authResult = {};
        before(function(done) {
            db.users.destroyAll(function (err, result) {
                reg.applyForMembership({
                    username: "kysiek",
                    password: "xxx",
                    confirm: "xxx",
                    phone: "23232323",
                    email: "kysiek@wp.com"
                }, function(err, regResult) {
                    assert.ok(regResult.success);
                    auth.authenticate({username: "kysiek", password: "xxx"}, function (err, result) {
                        assert.ok(err === null, err);
                        authResult = result;
                        done();
                    });
                });
            });

        });
        it("is successful", function () {
            authResult.success.should.be.equal(true);
        });
        it("return a user", function () {
            authResult.user.should.be.defined;
        });
        it("creates a log entry", function () {
            authResult.log.should.be.defined
        });
        it("updates the user stats", function () {
            authResult.user.signInCount.should.be.equal(2);
        });
        it("updated the signon dates", function () {
            should.exist(authResult.user.lastLoginAt);
            should.exist(authResult.user.currentLoginAt);
        });
    }); 
    describe("empty username", function () {
        var authResult = {};
        before(function(done) {
            db.users.destroyAll(function (err, result) {
                reg.applyForMembership({
                    username: "kysiek",
                    password: "xxx",
                    confirm: "xxx",
                    phone: "23232323",
                    email: "kysiek@wp.com"
                }, function(err, regResult) {
                    assert.ok(regResult.success);
                    auth.authenticate({username: "", password: "xxx"}, function (err, result) {
                        assert.ok(err === null, err);
                        authResult = result;
                        done();
                    });
                });
            });

        });
        it("is not successful", function () {
            authResult.success.should.be.equal(false);
        });
        it("returns a message saying 'Username cannot be empty'", function () {
            authResult.message.should.be.equal("Username cannot be empty");
        });
    });
    describe("incorrect username", function () {
        var authResult = {};
        before(function(done) {
            db.users.destroyAll(function (err, result) {
                reg.applyForMembership({
                    username: "kysiek",
                    password: "xxx",
                    confirm: "xxx",
                    phone: "23232323",
                    email: "kysiek@wp.com"
                }, function(err, regResult) {
                    assert.ok(regResult.success);
                    auth.authenticate({username: "kysie", password: "xxx"}, function (err, result) {
                        assert.ok(err === null, err);
                        authResult = result;
                        done();
                    });
                });
            });

        });
        it("is not successful", function () {
            authResult.success.should.be.equal(false);
        });
        it("return a message saying 'Invalid username'", function () {
            authResult.message.should.be.equal("Invalid username");
        });
    });
    describe("empty password", function () {
        var authResult = {};
        before(function(done) {
            db.users.destroyAll(function (err, result) {
                reg.applyForMembership({
                    username: "kysiek",
                    password: "xxx",
                    confirm: "xxx",
                    phone: "23232323",
                    email: "kysiek@wp.com"
                }, function(err, regResult) {
                    assert.ok(regResult.success);
                    auth.authenticate({username: "kysie", password: ""}, function (err, result) {
                        assert.ok(err === null, err);
                        authResult = result;
                        done();
                    });
                });
            });

        });
        it("is not successful", function () {
            authResult.success.should.be.equal(false);
        });
        it("returns a message saying 'Password cannot be empty'", function () {
            authResult.message.should.be.equal("Password cannot be empty");
        });
    });
    describe("password does not match", function () {
        var authResult = {};
        before(function(done) {
            db.users.destroyAll(function (err, result) {
                reg.applyForMembership({
                    username: "kysiek",
                    password: "xxx",
                    confirm: "xxx",
                    phone: "23232323",
                    email: "kysiek@wp.com"
                }, function(err, regResult) {
                    assert.ok(regResult.success);
                    auth.authenticate({username: "kysiek", password: "yyy"}, function (err, result) {
                        assert.ok(err === null, err);
                        authResult = result;
                        done();
                    });
                });
            });

        });
        it("is not successful", function () {
            authResult.success.should.be.equal(false);
        });
        it("returns a message saying 'Password is incorrect'", function () {
            authResult.message.should.be.equal("Password is incorrect");
        });
    });
});