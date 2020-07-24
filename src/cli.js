/* eslint-disable prefer-let/prefer-let */
const optionator = require('optionator')
const fs = require('fs')
const postcss = require('postcss')
const path = require('path')
const ColorVarPlugin = require('./index')

const constant = require('../src/constant')
const utils = require('../src/utils')
const { explorerSync, getMatchFiles, splitErrorText } = utils

function transform(filePath, syntax, isCheck) {
  const startTime = new Date().getTime();
  const content = fs.readFileSync(filePath, { encoding: 'utf-8' })

  return postcss([ColorVarPlugin({
    searchFrom: filePath,
    sourcePath: filePath,
    syntax,
  })]).process(content, {
    from: undefined,
    syntax: constant.ParserMap[syntax]
  })
    .then((result) => {
      // 非检测模式，则写入原文件
      if (!isCheck) {
        fs.writeFileSync(filePath, result.content, { encoding: 'utf-8' });
        console.log(`🌟 file => ${path.relative(process.cwd(), filePath)}, cost time => ${new Date().getTime() - startTime}ms.`);
      }
      return {
        file: filePath,
        errors: result.warnings(),
      };
    })
}

function autoCompleVariables(loseVariables = [], variableFiles = []) {
  if (!variableFiles.length) {
    return;
  }
  const variables = loseVariables.map((variable, i) => {
      return /^\/\//.test(variable) ? variable : `@theme-color${i}: ${variable}`;
  });
  const filePath = path.join(process.cwd(), variableFiles[0]);
  if (fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, `\n${variables.join(';\n')}`, { encoding: 'utf-8', flag: 'a' });
    console.log(`\n 🚀 批量写入color变量到 “${variableFiles[0]}” 文件成功。"`);
  }
}

const options = optionator({
  prepend: 'Usage: colorvar [options]',
  options: [
    {
      option: 'syntax',
      alias: 's',
      type: 'String',
      required: false,
      description: '语法: 支持 less 和 scss , 默认less',
      example: 'pcvar ./index.less --syntax less'
    },
    {
      option: 'base',
      alias: 'b',
      type: 'String',
      required: false,
      description: '语法: 定义基础路径，用来批量转换多个文件',
      example: 'pcvar --base src'
    },
    {
      option: 'modules',
      alias: 'm',
      type: 'String',
      required: false,
      description: '语法: 定义匹配文件规则',
      example: 'pcvar --modules "**/*.less"'
    },
    {
      option: 'checkMode',
      alias: 'c',
      type: 'String',
      required: false,
      description: '语法: 检测是否缺失color未定义变量(1: 检测；0: 不检测，检测模式时，不自动写入转换less文件)',
      example: 'pcvar --modules "**/*.less" --checkMode=1'
    },
  ]
})

function run (args) {
  const currentOptions = options.parse(args)
  const result = explorerSync.search()
  const fileConfig = result ? result.config : {}
  const syntax = currentOptions.syntax || fileConfig.syntax

  const supportsSyntax = Object.keys(constant.Syntax);
  if (!supportsSyntax.includes(syntax)) {
    console.error(`不支持${ syntax }语法，只支持：${supportsSyntax.join(',')}。`)
    process.exit(1)
  }

  const root = path.join(process.cwd(), fileConfig.base || '.');
  const isCheckMode = (currentOptions.checkMode || fileConfig.checkMode) === '1';
  const autoComple = fileConfig.autoComple;
  let filePath = currentOptions._ && currentOptions._[0];
  let loseColorVars = [];

  if (!filePath) {
    const modules = currentOptions.modules || fileConfig.modules;
    const files = getMatchFiles(modules, root);

    if (files.length === 0) {
      console.error('指定一个文件或者指定匹配规则(modules)。');
      process.exit(1)
    }
    const transPromises = files.map(file => {
        return transform(file, syntax, isCheckMode);
    });
    Promise.all(transPromises).then((results) => {
      const messages = results.filter(res => {
        return res.errors.length !== 0;
      }).map((info, i) => {

        const errorFile = path.relative(root, info.file);
        loseColorVars.push(`// ${errorFile}`);

        const errorInfos = info.errors.map((error, i) => {
          const text = error.text;
          // 组装异常信息
          loseColorVars.push(...splitErrorText(text));
          return `       <${i + 1}>. ${text}, line: ${error.line}, column: ${error.column}`;
        });

        errorInfos.unshift(`\n⚡️ ${i + 1}. "${errorFile}", errors =>`);

        return errorInfos;
      });

      if(messages.length) {
        const msgs = [];
        messages.forEach(infos => {
          msgs.push(...infos);
        });

        msgs.push('\n🐞 Undeclared variable colors: \n', ...loseColorVars);
        console.error(`${msgs.join('\n\r')}`);
        // 自动生成随机变量定义
        if (isCheckMode && autoComple) {
          autoCompleVariables(loseColorVars, fileConfig.variableFiles);
        }
      }
      process.exit(1);
    }).catch(e => {
      console.error(`🐞批量转换过程中发生异常，详情：${e.message}。`);
      process.exit(1);
    });
  } else {
    if (!path.isAbsolute(filePath)) {
      filePath = path.resolve(root, filePath);
    }
  
    if (!fs.existsSync(filePath)) {
      console.error(`${ filePath } 不存在`);
      process.exit(1)
    }
  
    if (!fs.lstatSync(filePath).isFile()) {
      console.error(`${ filePath } 必须是一个文件`);
      process.exit(1)
    }
    transform(filePath, syntax, isCheckMode).then((results) => {
      const errors = results[0].errors;
      if (errors.length) {
        console.error(errors);
      }
      process.exit(1);
    });
  }
}

module.exports = {
  run
}
