/**
 * Created by Krzysztof on 2015-05-24.
 */
var Registration = require("../lib/registration");
var mysqlDB = require("mysql");
var assert = require("assert");
var Authentication = require("../lib/authentication");
var should = require("should");

describe("Authentication", function () {
    var reg = {},
        auth = {},
        connection;
    before(function(done){
        connection = mysqlDB.createConnection({host: "localhost", user: "kysiek", password: "passs", database: "BlaBlaPaczka"});
        connection.connect(function (err) {
            if(err) {
                console.log("Error while connecting to the MySQL DB: " + err.stack);
                return;
                done();
            }
            auth = new Authentication(connection);
            done();
        });
    });
    after(function (done) {
        connection.end();
        done();
    });
    describe("a valid login", function () {
        var authResult = {};
        before(function(done) {
            auth.authenticate({phoneNumber: "698256044", password: "acd"}, function (err, result) {
                assert.ok(err === null, err);
                authResult = result;
                done();
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
    describe("empty phoneNumber", function () {
        var authResult = {};
        before(function(done) {
            auth.authenticate({phoneNumber: "", password: "xxx"}, function (err, result) {
                assert.ok(err === null, err);
                authResult = result;
                done();
            });

        });
        it("is not successful", function () {
            authResult.success.should.be.equal(false);
        });
        it("returns a message saying 'Phone number cannot be empty'", function () {
            authResult.message.should.be.equal("Phone number cannot be empty");
        });
    });
    describe("incorrect phone number", function () {
        var authResult = {};
        before(function(done) {
            auth.authenticate({phoneNumber: "698256043", password: "acd"}, function (err, result) {
                assert.ok(err === null, err);
                authResult = result;
                done();
            });

        });
        it("is not successful", function () {
            authResult.success.should.be.equal(false);
        });
        it("return a message saying 'Invalid phone number'", function () {
            authResult.message.should.be.equal("Invalid phone number");
        });
    });
    describe("empty password", function () {
        var authResult = {};
        before(function(done) {
            auth.authenticate({phoneNumber: "698256044", password: ""}, function (err, result) {
                assert.ok(err === null, err);
                authResult = result;
                done();
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
            auth.authenticate({phoneNumber: "698256044", password: "acde"}, function (err, result) {
                assert.ok(err === null, err);
                authResult = result;
                done();
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