const { isFunction, isObject } = require('../utils');

module.exports = function genCjsCode(vars, options) {
  const { semi, filterKeys } = options;
  const lines = [
    `'use strict'`,
    '// This file was automatically generated. Do not edit by hand.',
    `Object.defineProperty(exports, '__esModule', { value: true })`,
  ];

  const varKeys = Object.keys(vars).filter(key => {
    if (isFunction(filterKeys)) {
      return filterKeys(key);
    }

    return true;
  });

  const varLines = [];
  const exportsLines = [];

  varKeys.forEach(item => {
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

    varLines.push(`const ${item} = ${outValue}`);
    exportsLines.push(`exports.${item} = ${item}`);
  });

  return `${lines.concat(varLines).concat(exportsLines).join(`${semi}\n`)}\n`;
};
