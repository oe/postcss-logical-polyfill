// Example postcss.config.js for postcss-logical-polyfill
module.exports = {
  plugins: [
    require('../..')({
      // Optional: customize RTL selector
      rtl: {
        selector: '[dir="rtl"]'
      },
      // Optional: customize LTR selector
      ltr: {
        selector: '[dir="ltr"]'
      }
    })
  ]
};
