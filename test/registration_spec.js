/**
 * Created by Krzysztof on 2015-05-23.
 */
var Registration = require("../lib/registration");
var db = require("secondthought");

describe("Registration", function () {
    var reg = {};
    before(function(done){
        db.connect({db: "membership", host: "ubuntu_vm.com", port: 28015}, function (err, db) {
            reg = new Registration(db);
            done();
        });
    });

    describe("a valid registration", function () {
        var regResult;
        before(function(done) {
            db.users.destroyAll(function (err, result) {
                reg.applyForMembership({
                    username: "kysiek",
                    "password": "xxx",
                    confirm: "xxx",
                    phone: "23232323",
                    email: "kysiek@wp.com"
                }, function(err, result) {
                    regResult = result;
                    done();
                });
            });

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

    describe("an empty or null email", function () {
        var regResult;
        before(function(done) {
            reg.applyForMembership({
                username: "kysiek",
                "password": "xxx",
                confirm: "xxx",
                phone: "23232323",
                email: ""
            }, function(err, result) {
                regResult = result;
                done();
            });
        });
        it("is not successful", function () {
            regResult.success.should.equal(false);
        });
        it("tells user that email is required", function () {
            regResult.message.should.equal("Email is required");
        });
    });

    describe("an empty or null username", function () {
        var regResult;
        before(function(done) {
            reg.applyForMembership({
                "password": "xxx",
                confirm: "xxx",
                phone: "23232323",
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
                phone: "",
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
                phone: "asdasd",
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
                phone: "asdasd",
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

    describe("email already exist", function () {
        var regResult;
        before(function(done) {
            db.users.destroyAll(function (err, result) {
                reg.applyForMembership({
                    username: "kysiek",
                    "password": "xxx",
                    confirm: "xxx",
                    phone: "23232323",
                    email: "kysiek@wp.com"
                }, function() {
                    reg.applyForMembership({
                        username: "kysiek",
                        "password": "xxxx",
                        confirm: "xxxx",
                        phone: "23232323",
                        email: "kysiek2@wp.com"
                    }, function(err, result) {
                        regResult = result;
                        done();
                    });
                });
            });

        });
        it("is not successful", function () {
            regResult.success.should.be.equal(false);
        });
        it("tells user that email already exists", function () {
            regResult.message.should.be.equal("This username already exists");
        });
    });

    describe("username already exist", function () {
        var regResult;
        before(function(done) {
            db.users.destroyAll(function (err, result) {
                reg.applyForMembership({
                    username: "kysiek",
                    "password": "xxx",
                    confirm: "xxx",
                    phone: "23232323",
                    email: "kysiek@wp.com"
                }, function() {
                    reg.applyForMembership({
                        username: "kysiek2",
                        "password": "xxxx",
                        confirm: "xxxx",
                        phone: "23232323",
                        email: "kysiek@wp.com"
                    }, function(err, result) {
                        regResult = result;
                        done();
                    });
                });
            });

        });
        it("is not successful", function () {
            regResult.success.should.be.equal(false);
        });
        it("tells user that username already exists", function () {
            regResult.message.should.be.equal("This email already exists");
        });
    });
});