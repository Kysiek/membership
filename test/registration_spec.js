/**
 * Created by Krzysztof on 2015-05-23.
 */
var Registration = require("../lib/registration");
var mysqlDB = require('mysql');
var should = require('should');

describe("Registration", function () {
    var reg = {}, connection;
    before(function(done){
        connection = mysqlDB.createConnection({host: "localhost", user: "kysiek", password: "passs", database: "BlaBlaPaczka"});
        connection.connect(function (err) {
            if(err) {
                console.log("Error while connecting to the MySQL DB: " + err.stack);
                return;
            }
            reg = new Registration(connection);
            done();
        });
    });
    after(function (done) {
        connection.end();
        done();
    });

    describe("a valid registration", function () {
        var regResult;
        before(function(done) {

            reg.applyForMembership({username: "kysiek", password: "acd", confirm:"acd", phoneNumber: "698256044" }, function (err, result) {
                regResult = result;
                console.log(regResult);
                done();
            })

        });
        it("is successful", function () {
            regResult.success.should.equal(true);
        });
        it("creates a user", function () {
            regResult.user.should.be.defined;
        });
        it("creates a log entry", function () {
            regResult.log.should.be.defined;
        });
        it("sets the user status to the approved", function () {
            regResult.user.status.should.be.equal("approved");
        });
        it("sets the welcome message", function () {
            regResult.message.should.be.equal("Welcome!");
        });
        it("increments the signInCount", function () {
            regResult.user.signInCount.should.be.equal(1);
        })
    });

    describe("an empty or null username", function () {
        var regResult;
        before(function(done) {
            reg.applyForMembership({
                "password": "xxx",
                confirm: "xxx",
                phoneNumber: "23232323",
                email: "kysiek@wp.com"
            }, function(err, result) {
                regResult = result;
                done();
            });
        });
        it("is not successful", function () {
            regResult.success.should.equal(false);
        });
        it("tells user that username is required", function () {
            regResult.message.should.equal("Username is required");
        });
    });

    describe("an empty or null phone number", function () {
        var regResult;
        before(function(done) {
            reg.applyForMembership({
                "password": "xxx",
                confirm: "xxx",
                phoneNumber: "",
                email: "kysiek@wp.com",
                username: "kysiek"
            }, function(err, result) {
                regResult = result;
                done();
            });
        });
        it("is not successful", function () {
            regResult.success.should.equal(false);
        });
        it("tells user that phone number is required", function () {
            regResult.message.should.equal("Phone number is required");
        });
    });

    describe("an empty or null password", function () {
        var regResult;
        before(function(done) {
            reg.applyForMembership({
                "password": "",
                confirm: "xxx",
                phoneNumber: "asdasd",
                email: "kysiek@wp.com",
                username: "kysiek"
            }, function(err, result) {
                regResult = result;
                done();
            });
        });
        it("is not successful", function () {
            regResult.success.should.equal(false);
        });
        it("tells user that password is required", function () {
            regResult.message.should.equal("Password is required");
        });
    });
    
    describe("password and confirm mismatch", function () {
        var regResult;
        before(function(done) {
            reg.applyForMembership({
                "password": "asd",
                confirm: "xxx",
                phoneNumber: "asdasd",
                email: "kysiek@wp.com",
                username: "kysiek"
            }, function(err, result) {
                regResult = result;
                done();
            });
        });
        it("is not successful", function () {
            regResult.success.should.be.equal(false);
        });
        it("tells user that passwords do not match", function () {
            regResult.message.should.equal("Passwords do not match");
        });
    });


    describe("username already exist", function () {
        var regResult;
        before(function(done) {
            reg.applyForMembership({
                "password": "asd",
                confirm: "xxx",
                phoneNumber: "asdasd",
                email: "kysiek@wp.com",
                username: "kysiek"
            }, function(err, result) {
                regResult = result;
                done();
            });

        });
        it("is not successful", function () {
        });
        it("tells user that username already exists", function () {
        });
    });
});