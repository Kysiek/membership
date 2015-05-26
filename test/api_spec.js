/**
 * Created by Krzysztof on 2015-05-24.
 */
var db = require("secondthought");
var assert = require("assert");
var Membership = require("../index");

describe("Main API", function () {
    var memb = new Membership("membership");
    before(function (done) {
        db.connect({db: "membership", host: "ubuntu_vm.com", port: 28015}, function (err, db) {
            db.users.destroyAll(function (err, result) {
                memb
                done();
            });
        });
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