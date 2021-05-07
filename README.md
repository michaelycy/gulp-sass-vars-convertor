# gulp-webp

> Sass 变量转换为 JSON 的转换器。

## Install

```
npm i gulp-sass-vars-convertor -D

# 或

yarn add gulp-sass-vars-convertor -D
```

## Usage

```js
const gulp = require('gulp');
const sassVarsConvertor = require('gulp-sass-vars-convertor');

exports.default = () => gulp.src('src/**.scss').pipe(sassVarsConvertor()).pipe(gulp.dest('dist'));
```

## API

### Options
