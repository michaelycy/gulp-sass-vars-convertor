'use strict';
const through = require('through2');
const VinylFile = require('vinyl');
const sassVarsConvertor = require('sass-vars-convertor');
const PluginError = require('plugin-error');
const { name: pluginName } = require('./package.json');

const isObject = val => Object.prototype.toString.call(val) === '[object Object]';
const isFunction = val => Object.prototype.toString.call(val) === '[object Function]';

function genTs(vars, options) {
  const { semi, filterKeys } = options;
  const lines = ['// This file was automatically generated. Do not edit by hand.'];

  Object.keys(vars)
    .filter(key => {
      if (isFunction(filterKeys)) {
        return filterKeys(key);
      }

      return true;
    })
    .forEach(item => {
      const value = vars[item];

      let outValue = value;
      if (typeof value === 'number') {
        outValue = value;
      }

      if (typeof value === 'string') {
        outValue = `'${value}'`;
      }

      // 第一种情况： ['opacity', '200ms', 'linear'] => 'opacity 200ms linear'
      // 第二种情况：[
      //   ['transform', '300ms', 'cubic-bezier(0.23, 1, 0.32, 1)'],
      //   ['opacity', '300ms', 'cubic-bezier(0.23, 1, 0.32, 1)'],
      // ]  => 'transform 300ms cubic-bezier(0.23, 1, 0.32, 1), opacity 300ms cubic-bezier(0.23, 1, 0.32, 1)
      if (Array.isArray(value)) {
        const isChildFromArray = value.some(Array.isArray);

        if (isChildFromArray) {
          outValue = `'${value.map(val => (Array.isArray(val) ? val.join(' ') : val)).join(', ')}'`;
        } else {
          outValue = `'${value.join(' ')}'`;
        }
      }
      if (isObject(value)) {
        outValue = JSON.stringify(value, null, '  ');
      }

      lines.push(`export const ${item} = ${outValue}`);
    });

  return `${lines.join(`${semi}\n`)}\n`;
}

function genScss(vars, options) {
  const { filterKeys } = options;
  const lines = ['// This file was automatically generated. Do not edit by hand.'];

  Object.keys(vars)
    .filter(key => {
      if (isFunction(filterKeys)) {
        return filterKeys(key);
      }

      return true;
    })
    .forEach(item => {
      let value = vars[item];

      if (Array.isArray(value)) {
        const isChildFromArray = value.some(Array.isArray);

        if (isChildFromArray) {
          value = `${value.map(val => (Array.isArray(val) ? val.join(' ') : val)).join(', ')}`;
        } else {
          value = `${value.join(' ')}`;
        }
      }
      if (isObject(value)) {
        value = `(${Object.keys(value)
          .map(k => `'${k}': '${value[k]}'`)
          .join(',\n')})`;
      }

      lines.push(`$${item}: ${value};`);
    });

  return `${lines.join('\n')}\n`;
}
module.exports = ({ dest, semi = ';', extname = '.ts', filterKeys }) => {
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
        const vars = await sassVarsConvertor(text.replace(/\s*@import\s+.*;/g, ''), {
          camelize: true,
        });
        let codeSource;
        switch (extname) {
          case '.ts':
            codeSource = genTs(vars, { semi, filterKeys });
            break;

          case '.scss':
            codeSource = genScss(vars, { semi, filterKeys });
            break;
          default:
            break;
        }
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
