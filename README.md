# 概述

[PostCSS] plugin color variable. 替换颜色值为预定义的变量。目前支持 Less 和 Sass，支持批量替换多个文件及缺失定义变量检测并自动创建。

## 安装依赖

全局安装插件:

```bash
npm install @zebrateam/auto-complate-color-variable -g
``` 

## 支持特性

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

## 配置变量

.colorvarrc.json支持配置项详解：

| 参数 | 描述 | 类型 | 默认值 |
| --- | --- | --- | --- |
| variableFiles | 定义颜色变量的文件路径 | Array | [] |
| syntax | 语法，支持 less 和 scss | String | 'less' |
| autoImport | 是否自动导入依赖的variableFiles | Boolean | false |
| alias | 等同于 webpack 中的alias | Object | {} |
| base | 基础路径，modules匹配时扫描进入目录 | String | '' |
| autoComple | 是否自动补全缺失color变量，checkMode为‘1’时有效 | Boolean | false |
| usingAlias | 自动导入 variableFile 时，使用 alias ，<br>例如 @import '~@/src/color.less' | String | '' |
| singleQuote | 自动导入时是否使用单引号， 默认 false | Boolean | false |
| checkMode | 是否为检测模式，为‘1’时，只检测缺失定义color变量 | Boolean | '0' |
| cssTplPath | 转换color为变量，提取支持多主题模版的路径<br>（可以根目录相对路径文件） | String | './template/less.tpl' |
| supportCssTpl | 是否选择css模版来转换样式 | Boolean | false |
| prettyCss | 是否美化代码 | Boolean | true |

## 命令行参数

| 参数 | 描述 | 类型 | 别名 | 是否必须 | 例子 | 
| --- | --- | --- | --- | --- | --- |
| syntax | 语法: 支持 less 和 scss , 默认less | String | 's' | false | pcvar ./index.less --syntax less |
| base | 定义基础路径，用来批量转换多个文件 | String | 'b' | false | pcvar --base src | 
| modules | 定义匹配文件规则 | String | 'm' | false | pcvar --modules "**/*.less" |
| checkMode | 检测是否缺失color未定义变量<br>(1: 检测；0: 不检测，检测模式时，不自动写入转换less文件) | String | 'c' | false | pcvar --modules "**/*.less" --checkMode=1 |


## 项目应用

项目根目录创建文件`.colorvarrc.json`：

```js
{
  "variableFiles": ["./config/theme.less"],
  "syntax": "less",
  "autoImport": true,
  "alias": {
    "@": "./config" 
  },
  "base": "src/pages",
  "autoComple": true,
  "usingAlias": "@", 
  "singleQuote": false,
  "supportCssTpl": true
}
```

### 命令行

```bash
# 检测模式，如果autoComple为true，则变量定义文件自动创建缺失变量
.pcvar --m "**/*.less" --c=1

# 批量转换多文件
.pcvar --m "**/*.less"
```

