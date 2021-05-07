'use strict';
const through = require('through2');
const VinylFile = require('vinyl');
const sassVarsConvertor = require('sass-vars-convertor');
const PluginError = require('plugin-error');
const { name: pluginName } = require('./package.json');

const isObject = val => Object.prototype.toString.call(val) === '[object Object]';

module.exports = ({ dest, semi = ';' }) => {
  return through.obj(function (file, encoding, callback) {
    if (file.isNull()) {
      callback(null, file);
    }

    if (file.isStream()) {
      callback(new PluginError(pluginName, 'Streaming not supported'));
      return;
    }

    (async () => {
      try {
        const text = file.contents.toString();
        const lines = ['// This file was automatically generated. Do not edit by hand.'];
        const vars = await sassVarsConvertor(text.replace(/\s*@import\s+.*;/g, ''), {
          camelize: true,
        });

        Object.keys(vars).forEach(item => {
          const value = vars[item];

          let outValue = value;
          if (typeof value === 'number') {
            outValue = value;
          }

          if (typeof value === 'string') {
            outValue = `'${value}'`;
          }

          if (isObject(value) || Array.isArray(value)) {
            outValue = JSON.stringify(value, null, '  ');
          }

          lines.push(`export const ${item} = ${outValue}`);
        });

        const codeSource = `${lines.join(`${semi}\n`)}\n`;
        const vinylFile = new VinylFile({
          path: dest,
          contents: Buffer.from(codeSource),
        });
        callback(null, vinylFile);
      } catch (error) {
        const fileName = file.path;

        this.emit('error', new PluginError(pluginName, error, { fileName }));
      }
    })();
  });
};
