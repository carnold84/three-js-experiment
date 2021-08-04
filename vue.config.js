module.exports = {
  publicPath: process.env.NODE_ENV === 'production'
    ? '/three-js-experiment/'
    : './',
  outputDir: 'docs',
};