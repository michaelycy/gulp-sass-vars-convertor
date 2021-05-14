const { isFunction, isObject } = require('../utils');

module.exports = function genEsCode(vars, options) {
  const { semi, filterKeys } = options;
  const lines = ['// This file was automatically generated. Do not edit by hand.'];

  const varKeys = Object.keys(vars).filter(key => {
    if (isFunction(filterKeys)) {
      return filterKeys(key);
    }

    return true;
  });

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

    lines.push(`const ${item} = ${outValue}`);
  });

  lines.push(`export { ${varKeys.join(', ')} }`);
  return `${lines.join(`${semi}\n`)}\n`;
};
