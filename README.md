# 概述

[PostCSS] plugin color variable. 替换颜色值为预定义的变量。目前支持 Less 和 Sass，支持批量替换多个文件及缺失定义变量检测并自动创建。


定义颜色变量名的文件
```less
@link-color: #0a1;
```

输入
```less
.foo {
    color: #0a1;
    background: rgb(170, 170, 170);
    border: 1px solid rgba(170, 170, 170, 0.1);
}
```

输出
```less
.foo {
  color: @link-color;
  background: @link-color;
  border: 1px solid fade(@link-color, 10%);
}
```

## 配置

项目中创建文件`.colorvarrc.json`
```js
{
  "variableFiles": ["./config/theme.less"], // 定义颜色变量的文件路径
  "syntax": "less", // 语法，支持 less 和 scss 。默认 less
  "autoImport": true, // 是否自动导入依赖的 variableFile
  "alias": {
    "@": "./config" // 等同于 webpack 中的alias
  },
  "base": "src/pages", // 基础路径，modules匹配时扫描进入目录
  "autoComple": true, // 是否自动补全缺失color变量，checkMode为1时有效
  "usingAlias": "@", // 自动导入 variableFile 时，使用 alias ，例如 @import '~@/src/color.less'
  "singleQuote": false, // 自动导入时是否使用单引号， 默认 false
}
```

## 使用

### 命令行
```bash
# 安装插件
npm install @zebrateam/auto-complate-color-variable --save-dev

# 检测模式，如果autoComple为true，则变量定义文件自动创建缺失变量
.pcvar --m "**/*.less" --c=1

# 批量转换多文件
.pcvar --m "**/*.less"
```

