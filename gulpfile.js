var gulp = require('gulp');

gulp.task('copyscripts', function() {
    gulp.src('scripts/**.*')
    .pipe(gulp.dest('release-builds/ad-group-wrangler-win32-x64/scripts'));
 });

 gulp.task('default', ['copyscripts']);