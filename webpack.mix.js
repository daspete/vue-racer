let mix = require('laravel-mix');

mix.options({
    processCssUrls: false,
    postCss: [
        require('autoprefixer')({
            browsers: [
                '>= 1%',
                'ie 9'
            ],
            cascade: false,
            remove: false
        })
    ]
});

mix
    .sass('src/scss/app.scss', 'public/css')
    .js('src/js/app.js', 'public/js')
    .setPublicPath('.')
;
