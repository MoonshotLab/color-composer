require('dotenv').config();

var gulp = require('gulp');
var postcss = require('gulp-postcss');
var autoprefixer = require('autoprefixer');
var cssnano = require('cssnano');
var sass = require('gulp-sass');
var webpack = require('webpack');
var gulpWebpack = require('gulp-webpack');
var babel = require('gulp-babel');
var browserSync = require('browser-sync').create();

gulp.task('sass', function () {
  var processors = [
    autoprefixer({browsers: ['last 1 version']}),
    cssnano(),
  ];
  return gulp.src('./src/scss/**/*.scss')
    .pipe(sass().on('error', sass.logError))
    .pipe(postcss(processors))
    .pipe(gulp.dest('./public'))
    .pipe(browserSync.stream());
});

gulp.task('js', function() {
  return gulp.src('./src/js/main.js')
    .pipe(babel({
        presets: ['es2015']
    }))
    .pipe(gulpWebpack({
      output: {
        publicPath: 'public',
        filename: 'main.js'
      },
      plugins: [new webpack.optimize.UglifyJsPlugin()],
    }, webpack))
    .pipe(gulp.dest('./public'))
    .pipe(browserSync.stream());
});

gulp.task('watch', ['sass', 'js'], function() {

  var port = process.env.PORT || 3000;
  browserSync.init({
    proxy: "localhost:" + port
  });

  gulp.watch("src/scss/**/*.scss", ['sass']);
  gulp.watch("src/js/**/*.js", ['js']);
  gulp.watch("views/**/*.pug").on('change', browserSync.reload);
});

gulp.task('default', ['watch']);
