/**
 * Created by Krzysztof on 2015-05-23.
 */
var assert = require("assert");
var utility = require("../lib/utility");



var User = function(args) {
    var user = {};
    if(args.id) {
        user.id = args.id;
    }
    user.username = args.username;
    user.status = args.status || "pending";
    user.authenticationToken = args.authenticationToken || utility.randomString(18);
    user.hashedPassword = args.hashedPassword || null;

    return user;
};
module.exports = User;