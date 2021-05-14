const { isFunction, isObject } = require('../utils');

module.exports = function genScssCode(vars, options) {
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
};
