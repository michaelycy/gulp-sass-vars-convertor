exports.isObject = val => Object.prototype.toString.call(val) === '[object Object]';
exports.isFunction = val => Object.prototype.toString.call(val) === '[object Function]';
