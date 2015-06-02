var mysqlDB = require('mysql');
var assert = require("assert");

module.exports = function (grunt) {
    grunt.initConfig({
        jshint: {
            files: ['lib/**/*js', "models/**/*.js"]
        },
        watch : {
            files: ['lib/**/*js', "models/**/*.js"],
            tasks: ['jshint']
        }
    });

    grunt.registerTask("installDb", function () {
        var done = this.async();
        var connection = mysqlDB.createConnection({host: "localhost", user: "kysiek", password: "pass"});

    });

    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-watch");
};