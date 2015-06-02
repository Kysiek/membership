/**
 * Created by Krzysztof on 2015-05-24.
 */
var mysqlDB = require('mysql');
var assert = require("assert");
var Membership = require("../index");

describe("Main API", function () {
    var memb,
        connection;
    before(function (done) {
        connection = mysqlDB.createConnection({host: "localhost", user: "kysiek", password: "pass"});
        connection.connect(function (err) {
           if(err) {
               console.log("Error while connecting to the MySQL DB: " + err.stack);
               return;
           }
        });
        memb = new Membership(connection);
        done();
    });
    after(function () {
        connection.close();
    });
    describe("authentication", function () {
        var newUser = {};
        before(function (done) {
            memb.register("kysiek", "kysiek@com.pl", "xxx", "xxx", "698250944", function (err, result) {
                newUser = result.user;
                assert.ok(result.success, "Can't register");
                done();
            });
        });
        it("authenticates", function (done) {
            memb.authenticate("kysiek","xxx", function (err, result) {
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