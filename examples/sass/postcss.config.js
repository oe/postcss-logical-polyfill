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
