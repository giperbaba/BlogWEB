const gulp = require('gulp');
const less = require('gulp-less');
const cleanCss = require('gulp-clean-css');

gulp.task('less-general', function() {
    return gulp.src('./src/pages/general/style.less')
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('./src/pages/general'));
})

gulp.task('less-registration', function() {
    return gulp.src('./src/pages/registration/register.less')
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('./src/pages/registration'));
})

gulp.task('less-authorization', function() {
    return gulp.src('./src/pages/authorization/auth.less')
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('./src/pages/authorization'));
})

gulp.task('less-profile', function() {
    return gulp.src('./src/pages/profile/profile.less')
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('./src/pages/profile'));
})

gulp.task('less-main', function() {
    return gulp.src('./src/pages/main/main.less')
        .pipe(less())
        .pipe(cleanCss())
        .pipe(gulp.dest('./src/pages/main'));
})

gulp.task('watch', function() {
    gulp.watch('./src/pages/general/style.less', gulp.series('less-general'));
    gulp.watch('./src/pages/authorization/auth.less', gulp.series('less-authorization'));
    gulp.watch('./src/pages/registration/register.less', gulp.series('less-registration'));
    gulp.watch('./src/pages/profile/profile.less', gulp.series('less-profile'));
    gulp.watch('./src/pages/main/main.less', gulp.series('less-main'));
})

gulp.task('less', gulp.series('less-authorization', 'less-registration', 'less-main', 'less-profile', 'less-general', 'less-main'));
gulp.task('default', gulp.series('less', 'watch'));