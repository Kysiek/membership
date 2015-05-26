/**
 * Created by Krzysztof on 2015-05-23.
 */
var should = require("should");
var User = require("../models/user");

describe("User", function(){
    describe("defaults", function(){
        var user = {};
        before(function () {
           user = new User({username: "kysiek", phone: "698256044", email: "kysiek@wp.com"});
        });
        it("email is kysiek@wp.com", function() {
                user.email.should.equal("kysiek@wp.com")
        });
        it("name is kysiek", function() {
            user.username.should.equal("kysiek")
        });
        it("phone is 698256044", function() {
            user.phone.should.equal("698256044")
        });
        it("has an authentication token", function () {
            user.authenticationToken.should.be.defined;
        });
        it("has a created date", function () {
            user.createdAt.should.be.defined;
        });
        it("has a signInCount of 0", function () {
            user.signInCount.should.equal(0);
        });
        it("has lastLogin", function () {
            user.lastLoginAt.should.be.defined;
        });
        it("has currentLogin", function () {
            user.currentLoginAt.should.be.defined;
        })
    });
});