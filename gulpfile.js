var path = require('path');
var combiner = require('stream-combiner2');
var gulp = require('gulp');
var gutil = require('gulp-util');
var less = require('gulp-less');
var server = require('gulp-express');
var nunjucksRender = require('gulp-nunjucks-render');
var prettify = require('gulp-html-prettify');
var replace = require('gulp-replace');
var spritesmith = require('gulp.spritesmith');
var merge = require('merge-stream');
var sourcemaps = require('gulp-sourcemaps');
var siteDB = require('./datasource/base.json');
var LessPluginAutoPrefix = require('less-plugin-autoprefix');
var LessPluginCleanCSS = require('less-plugin-clean-css');
var cssnano = require('gulp-cssnano');

gulp.task('less:dev', function() {
    var autoprefix = new LessPluginAutoPrefix({
      browsers: ["last 2 versions"]
    });

  return gulp.src('public/less/style.less')
  	//.pipe(sourcemaps.init())
    .pipe(less({
      plugins: [autoprefix]
    }).on('error', function(err) {
      gutil.log(err);
      this.emit('end');
    }))
    //.pipe(sourcemaps.write('.', {includeContent: false, mapSources: 'public/less/**'}))
    .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('less:prod', function() {
  var cleancss = new LessPluginCleanCSS({
      advanced: true
    }),
    autoprefix = new LessPluginAutoPrefix({
      browsers: ["last 30 versions", "IE 8", "IE 9"]
    });

  return gulp.src('public/less/style.less')
    //.pipe(sourcemaps.init())
    .pipe(less({
      plugins: [autoprefix, cleancss]
    }).on('error', function(err) {
      gutil.log(err);
      this.emit('end');
    }))
    .pipe(cssnano())
    //.pipe(sourcemaps.write('.', {includeContent: false, mapSources: 'public/less/**'}))
    .pipe(gulp.dest('public/stylesheets/'));
});

gulp.task('sprites', function() {

  var spriteData = gulp.src('public/__icons/*.png').pipe(spritesmith({
    imgName: 'global_sprite.png',
    cssName: 'sprite.less',
    padding: 10,
    cssTemplate: 'main-sprite.css.hbs'
  }));

  var imgStream = spriteData.img
    .pipe(gulp.dest('public/images/'));
  var cssStream = spriteData.css
    .pipe(gulp.dest('public/less/components/'));

  return merge(imgStream, cssStream);
});

gulp.task('default', function() {
 
  server.run(['bin/www'], [], [true]);

  gulp.watch(['views/**/*.html', 'views/*.html', './datasource/base.json', './app.js', 'routes/**/*.js'], function(event) {
    server.notify(event);
    console.log(path.basename(event.path), 'was', event.type);
    server.stop();
    server.run(['bin/www'])
  });
  gulp.watch(['public/__icons/*.png'], ['sprites', server.notify]);
  gulp.watch(['public/less/*.less', 'public/less/**/*.less', 'public/less/components/*.less'], ['less:dev', server.notify]);
});


gulp.task('export', function() {
  nunjucksRender.nunjucks.configure(['views/'], {
    watch: false
  });

  gulp.src(['views/*.html', '!views/__*.html'])
    .pipe(nunjucksRender({
      isExport: true,
      base: siteDB
    }))
    .pipe(prettify({
      indent_char: ' ',
      indent_size: 2
    }))
    .pipe(gulp.dest('export'));
});


gulp.task('publish', ['export', 'less:prod']);