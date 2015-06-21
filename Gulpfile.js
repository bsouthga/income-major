'use strict';

var assign = require('lodash.assign');
var buffer = require('vinyl-buffer');
var browserify = require('browserify');
var babelify = require('babelify');
var gulp = require('gulp');
var gutil = require('gulp-util');
var source = require('vinyl-source-stream');
var sourcemaps = require('gulp-sourcemaps');
var watch = require('gulp-watch');
var watchify = require('watchify');
var livereload = require('gulp-livereload');
var server = require('gulp-server-livereload');
var ghPages = require('gulp-gh-pages');
var uglify = require('gulp-uglify');


let customOpts = {
  entries: ['./src/index.js'],
  sourceMaps : 'inline',
  debug: true
};

let opts = assign({}, watchify.args, customOpts);

let b = watchify(browserify(opts)); 

b.transform(babelify.configure({
  sourceMaps : 'inline',
  modules : 'common',
  stage: 0
}));

gulp.task('js', bundle);
b.on('update', bundle); // on any dep update, runs the bundler
b.on('log', gutil.log); // output build logs to terminal

function bundle() {
  return b.bundle()
    // log errors if they happen
    .on('error', gutil.log.bind(gutil, 'Browserify Error'))
    .pipe(source('bundle.js'))
    // optional, remove if you don't need to buffer file contents
    .pipe(buffer())
    // optional, remove if you dont want sourcemaps
    .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
       // ->>>> Add transformation tasks to the pipeline here.
    .pipe(sourcemaps.write('./')) // writes .map file
    .pipe(gulp.dest('./'))
    // live reload results
    .pipe(livereload());
}

gulp.task('server', function() {
  gulp.src('./')
    .pipe(server({
      livereload: true,
      open: true
    }));
});


gulp.task('compress', ['js'], function() {
  return gulp.src('./bundle.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist'));
});

gulp.task('deploy', ['compress'], function() {
  return gulp.src([
      './index.html',
      './dist/*',
      './*.csv'
    ])
    .pipe(ghPages());
});



gulp.task('default', ['js', 'server']);
