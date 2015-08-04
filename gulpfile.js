var browserify = require('browserify');
var gulp = require('gulp');
var source = require("vinyl-source-stream");
var reactify = require('reactify');
var watchify = require('watchify');

var bundler = browserify('./public/js/main.js', watchify.args);
bundler.transform(reactify);

function bundle() {
  console.log('Bundling...');
  return bundler.bundle()
    .pipe(source('main.js'))
    .pipe(gulp.dest('./public/js/bundle'));
}

gulp.task('js', bundle);

gulp.task('watch', function() {
  var watcher = watchify(bundler);
  watcher.on('update', bundle);
  return bundle();
});

gulp.task('default', ['js']);

