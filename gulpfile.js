var browserify = require('browserify');
var gulp = require('gulp');
var source = require("vinyl-source-stream");
var reactify = require('reactify');
var watchify = require('watchify');
var sass = require('gulp-sass');

var config = {
  scssPath: './resources/scss',
  jsPath: './resources/js',
  bowerPath: './bower_components',
  publicPath: './public'
};

var bundler = browserify(config.jsPath + '/main.js', watchify.args);
bundler.transform(reactify);

function bundle() {
  console.log('Bundling JS...');
  return bundler.bundle()
    .on('error', function (err) {
        console.log(err.toString());
        this.emit('end');
    })
    .pipe(source('main.js'))
    .pipe(gulp.dest(config.publicPath + '/js'));
}

gulp.task('js', bundle);

gulp.task('css', function() {
  console.log('Compiling CSS...');
  return gulp.src(config.scssPath + '/main.scss')
             .pipe(
               sass({
                 style: 'compressed',
                 includePaths: [
                   config.scssPath,
                   config.bowerPath + '/bootstrap-sass-official/assets/stylesheets'
                 ]
               })
               .on('error', function(error) {
                 console.error(error.message);
                 this.emit('end');
               })
             )
             .pipe(gulp.dest(config.publicPath + '/css'));
});

gulp.task('watch', function() {
  gulp.watch(config.scssPath + '/**/*.*', ['css']); 

  var watcher = watchify(bundler);
  watcher.on('update', bundle);
  bundle();
});

gulp.task('default', ['js', 'css', 'watch']);

