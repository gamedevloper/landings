var gulp = require('gulp');
var concat = require('gulp-concat');
var minify = require('gulp-minify');
var stylus = require('gulp-stylus');
var cleanCss = require('gulp-clean-css');
var rev = require('gulp-rev');
var revReplace = require("gulp-rev-replace");
var replace = require('gulp-replace');
var del = require('del');

var landingName;

gulp.task('get-path', function() {
    landingName = process.argv[4];
});

gulp.task('clean-js', function() {
    return del(['dist/' + landingName + '/js/*.js']);
});

gulp.task('clean-css', function() {
    return del(['dist/' + landingName + '/css/*.css']);
});

gulp.task('clean-images', function() {
    return del(['dist/' + landingName + '/img/*']);
});

gulp.task('pack-js', ['get-path', 'clean-js'], function() {
    return gulp.src(['src/' + landingName + '/js/*.js'])
        .pipe(concat('app.js'))
        .pipe(minify({
            ext:{
                min:'.js'
            },
            noSource: true
        }))
        .pipe(rev())
        .pipe(gulp.dest('dist/' + landingName + '/js'))
        .pipe(rev.manifest('dist/' + landingName + '/rev-manifest.json', {merge: true}))
        .pipe(gulp.dest(''));
});

gulp.task('pack-css', ['clean-css'], function() {
    return gulp.src(['src/' + landingName + '/css/*.styl'])
        .pipe(stylus())
        .pipe(concat('style.css'))
        .pipe(cleanCss())
        .pipe(rev())
        .pipe(gulp.dest('dist/' + landingName + '/css'))
        .pipe(rev.manifest('dist/' + landingName + '/rev-manifest.json', {merge: true}))
        .pipe(gulp.dest(''));
});

gulp.task('copy-images', ['clean-images'], function() {
    return gulp.src(['src/' + landingName + '/img/*'])
        .pipe(rev())
        .pipe(gulp.dest('dist/' + landingName + '/img'))
        .pipe(rev.manifest('dist/' + landingName + '/rev-manifest.json', {merge: true}))
        .pipe(gulp.dest(''));
});

gulp.task('copy-html', ['pack-js', 'pack-css', 'copy-images'], function() {
    var re = /<link[\s\S]+\/>/,
        str = '<link rel="stylesheet" type="text/css" href="css/style.css" media="all" />';

    return gulp.src(['src/' + landingName + '/' + landingName + '.html'])
        .pipe(replace(re, str))
        .pipe(gulp.dest('dist/' + landingName));
});

gulp.task('rev-replace-index', ['copy-html'], function() {
    var manifest = gulp.src('dist/' + landingName + '/rev-manifest.json');

    return gulp.src(['dist/' + landingName + '/' + landingName + '.html'])
        .pipe(revReplace({manifest: manifest}))
        .pipe(gulp.dest('dist/' + landingName));
});

gulp.task('rev-replace-css', ['rev-replace-index'], function() {
    var manifest = gulp.src('dist/' + landingName + '/rev-manifest.json');

    return gulp.src(['dist/' + landingName + '/css/*'])
        .pipe(revReplace({manifest: manifest}))
        .pipe(gulp.dest('dist/' + landingName + '/css'));
});

gulp.task('watch', function() {
    gulp.watch('src/js/*.js', ['pack-js']);
    gulp.watch('src/css/*.css', ['pack-css']);
});

gulp.task('default', ['watch']);

gulp.task('prepareBuild', ['get-path']);

gulp.task('build',
    [
        'rev-replace-index',
        'rev-replace-css'
    ]
);
