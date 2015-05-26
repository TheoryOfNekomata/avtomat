/*global require*/

(function(require) {
    "use strict";

    var gulp = require("gulp");
    var jasmine = require("gulp-jasmine");
    var uglify = require("gulp-uglify");
    var rename = require("gulp-rename");

    gulp.task("build", function() {
        gulp.src("src/**/*.js")
            .pipe(gulp.dest("dist"));
    });

    gulp.task("build-min", function() {
        gulp.src("src/**/*.js")
            .pipe(uglify())
            .pipe(rename(function (path) {
                path.basename += ".min";
                path.extname = ".js";
            }))
            .pipe(gulp.dest("dist"));
    });

    gulp.task("test", function() {
        // TODO
    });

    gulp.task("default", ["build", "build-min"]);

})(require);
