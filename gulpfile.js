var gulp = require('gulp');
var concat = require('gulp-concat');

gulp.task('default', function() {
  var files = [
    './lib/external.js',
    './lib/util.js',
    './lib/html.js',
    './lib/code.js',
    './lib/server.js'
  ];

  gulp.src(files).pipe(concat('app.js')).pipe(gulp.dest('./bin/'));
});
