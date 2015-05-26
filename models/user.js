/**
 * Created by Krzysztof on 2015-05-23.
 */
var assert = require("assert");
var utility = require("../lib/utility");



var User = function(args) {
    //assert.ok(args.email, "Email is required");
    //assert.ok(args.username, "Username is required");
    //assert.ok(args.phone, "Username is required");
    var user = {};
    if(args.id) {
        user.id = args.id;
    }
    user.username = args.username;
    user.email = args.email;
    user.phone = args.phone;
    user.status = args.phone || "pending";
    user.createdAt = args.createdAt || new Date();
    user.signInCount = args.signInCount || 0;
    user.lastLoginAt = args.lastLoginAt || new Date();
    user.currentLoginAt = args.currentLoginAt || new Date();
    user.authenticationToken = args.authenticationToken || utility.randomString(18);
    user.hashedPassword = args.hashedPassword || null;

    return user;
};
module.exports = User;