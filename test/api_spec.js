/**
 * Created by Krzysztof on 2015-05-24.
 */
var mysqlDB = require('mysql');
var assert = require("assert");
var Membership = require("../index");
var should = require("should");

describe("Main API", function () {
    var memb,
        connection;
    before(function (done) {
        connection = mysqlDB.createConnection({host: "localhost", user: "kysiek", password: "passs", database: "BlaBlaPaczka"});
        connection.connect(function (err) {
            if(err) {
                console.log("Error while connecting to the MySQL DB: " + err.stack);
                return done();
            }
            memb = new Membership(connection);
            done();
        });
    });
    after(function () {
        connection.end();
    });
    describe("authentication", function () {
        var newUser = {};
        before(function (done) {
            memb.register("kysiekk", "xxx", "xxx", "6982509434", function (err, result) {
                newUser = result.user;
                console.log(result.message);
                assert.ok(result.success, "Can't register");
                done();
            });
        });
        it("authenticates", function (done) {
            memb.authenticate("6982509434","xxx", function (err, result) {
                result.success.should.be.equal(true);
                done();
            });
        });
        it("gets by token", function (done) {
            memb.findUserByToken(newUser.authenticationToken, function (err, result) {
                result.should.be.defined;
                done();
            });

        });
    });
});