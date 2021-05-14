'use strict';
const through = require('through2');
const VinylFile = require('vinyl');
const sassVarsConvertor = require('sass-vars-convertor');
const PluginError = require('plugin-error');
const { name: pluginName } = require('./package.json');
const plugins = require('./plugins');

module.exports = ({ dest, semi = ';', extname = '.ts', filterKeys, format = 'cjs' }) => {
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
            codeSource = plugins.ts(vars, { semi, filterKeys });
            break;

          case '.scss':
            codeSource = plugins.scss(vars, { semi, filterKeys });
            break;

          case '.js':
            codeSource = plugins[format] ? plugins[format](vars, { semi, filterKeys }) : '';
            break;

          case '.d.ts':
            codeSource = plugins.tsd(vars, { semi, filterKeys });
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
