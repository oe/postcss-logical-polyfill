// Example postcss.config.js for postcss-logical-polyfill with SASS
module.exports = {
  plugins: [
    require('postcss-scss')({ parse: true }),
    require('../../')({
      // Configure RTL and LTR transformations
      rtl: {
        selector: '[dir="rtl"]'
      },
      ltr: {
        selector: '[dir="ltr"]'
      }
    }),
  ]
};
