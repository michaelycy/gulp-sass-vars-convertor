const cjsPlugin = require('./cjs');
const tsPlugin = require('./ts');
const essPlugin = require('./es');
const amdPlugin = require('./amd');
const umdPlugin = require('./umd');
const scssPlugin = require('./scss');
const tsdPlugin = require('./tsd');

module.exports = {
  cjs: cjsPlugin,
  ts: tsPlugin,
  amd: amdPlugin,
  es: essPlugin,
  scss: scssPlugin,
  umd: umdPlugin,
  tsd: tsdPlugin,
};
