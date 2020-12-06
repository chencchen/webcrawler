const parser = require("@babel/parser");
const template = require("@babel/template").default;
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;
const path = require('path');
const fs = require('fs');

const { decryptStr, decryptStrFnName } = require('./module');

fs.readFile(path.resolve(__dirname, './source.js'), { "encoding": 'utf-8' }, function (err, data) {
    const ast = parser.parse(data);
    step1(ast);

    // 将ast 转为 js
    let { code } = generator(ast);
    // code = code.replace(/!!\[\]/g, 'true').replace(/!\[\]/g, 'false');
    console.log(code);
});

function step1(ast) {
    traverse(ast,{
        CallExpression:funToStr
    })
}

function funToStr(path) {
    var curNode = path.node;

    if(curNode.callee.name === decryptStrFnName && curNode.arguments.length === 2)
    {
        var strC = decryptStr(curNode.arguments[0].value, curNode.arguments[1].value);

        path.replaceWith(t.stringLiteral(strC))

    }
}