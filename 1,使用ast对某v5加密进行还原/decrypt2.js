const parser = require("@babel/parser");
const template = require("@babel/template").default;
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;
const path = require('path');
const fs = require('fs');

const { decryptStr, decryptStrFnName } = require('./module');

fs.readFile(path.resolve(__dirname, './result1.js'), { "encoding": 'utf-8' }, function (err, data) {
    const ast = parser.parse(data);
    step2(ast);

    // 将ast 转为 js
    let { code } = generator(ast);
    // code = code.replace(/!!\[\]/g, 'true').replace(/!\[\]/g, 'false');
    console.log(code)
});

function step2(ast) {
    traverse(ast,{
        VariableDeclarator:callToStr,
        ExpressionStatement:convParam
    })
}

function callToStr(path) {
    var node = path.node;

    if (!t.isObjectExpression(node.init))
        return;

    var objPropertiesList = node.init.properties;

    if (objPropertiesList.length==0)
        return;

    var objName = node.id.name;

    objPropertiesList.forEach(prop => {
        var key = prop.key.value;
        if(!t.isStringLiteral(prop.value))
        {
            var retStmt = prop.value.body.body[0];

            // 该path的最近父节点
            var fnPath = path.getFunctionParent();
            fnPath.traverse({
                CallExpression: function (_path) {
                    if (!t.isMemberExpression(_path.node.callee))
                        return;

                    var _node = _path.node.callee;
                    if (!t.isIdentifier(_node.object) || _node.object.name !== objName)
                        return;
                    if (!t.isStringLiteral(_node.property) || _node.property.value != key)
                        return;

                    var args = _path.node.arguments;

                    // 二元运算
                    if (t.isBinaryExpression(retStmt.argument) && args.length===2)
                    {
                        _path.replaceWith(t.binaryExpression(retStmt.argument.operator, args[0], args[1]));
                    }
                    // 逻辑运算
                    else if(t.isLogicalExpression(retStmt.argument) && args.length==2)
                    {
                        _path.replaceWith(t.logicalExpression(retStmt.argument.operator, args[0], args[1]));
                    }
                    // 函数调用
                    else if(t.isCallExpression(retStmt.argument) && t.isIdentifier(retStmt.argument.callee))
                    {
                        _path.replaceWith(t.callExpression(args[0], args.slice(1)))
                    }
                }
            })
        }
        else{
            var retStmt = prop.value.value;

            // 该path的最近父节点
            var fnPath = path.getFunctionParent();
            fnPath.traverse({
                MemberExpression:function (_path) {
                    var _node = _path.node;
                    if (!t.isIdentifier(_node.object) || _node.object.name !== objName)
                        return;
                    if (!t.isStringLiteral(_node.property) || _node.property.value != key)
                        return;

                    _path.replaceWith(t.stringLiteral(retStmt))
                }
            })

        }

    });

    path.remove();
}

function convParam(path) {
    var node = path.node;

    if (!t.isCallExpression(node.expression))
        return;

    if (node.expression.arguments == undefined || node.expression.callee.params == undefined || node.expression.arguments.length > node.expression.callee.params.length)
        return;

    var argumentList = node.expression.arguments;
    var paramList = node.expression.callee.params;
    for (var i = 0; i<argumentList.length; i++)
    {
        var argumentName = argumentList[i].name;
        var paramName = paramList[i].name;

        path.traverse({
            MemberExpression:function (_path) {
                var _node = _path.node;
                if (!t.isIdentifier(_node.object) || _node.object.name !== paramName)
                    return;

                _node.object.name = argumentName;
            }
        });
    }
    node.expression.arguments = [];
    node.expression.callee.params = [];
}