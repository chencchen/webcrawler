const parser = require("@babel/parser");
const template = require("@babel/template").default;
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;

const core = require("@babel/core");

const path = require('path');
const fs = require('fs');

const {decryptStr, decryptStrFnName} = require('./2module_result');

fs.readFile(path.resolve(__dirname, './1source.js'), {"encoding": 'utf-8'}, function (err, data) {
    let ast = parser.parse(data);

    // 调用module，替换参数
    step(ast);
    console.log("step");

    // 将逗号表达式拆分
    step1(ast);
    console.log("step1");

    // 替换封装到对象的方法和数到使用位置
    step2(ast);
    console.log("step2");

    // 16进制转10进制
    step3(ast);
    console.log("step3");

    // 控制流平坦化
    step4(ast);
    console.log("step4");

    // 替换基于数组的字符串混淆
    step5(ast);
    console.log("step5");

    // 将加号连接的字符串合并
    step6(ast);
    console.log("step6");

    // 将ast 转为 js
    let {code} = generator(ast);
    console.log("minify-mangle-names");

    // 格式化名称
    code = core.transform(code, {
        plugins: ["minify-mangle-names"]
    }).code;
    ast = parser.parse(code);

    // 将被拆分出的函数替换到原本位置
    step7(ast);
    console.log("step7");

    code = generator(ast).code;


    fs.writeFile('./20210525.js', code, {encoding: 'utf8'}, err => {
        console.log(err);
    })
});

function step(ast) {
    traverse(ast, {
        CallExpression: funToStr
    })
}

function funToStr(path) {
    var curNode = path.node;

    if (curNode.callee.name === decryptStrFnName && curNode.arguments.length === 1) {
        var strC = decryptStr(curNode.arguments[0].value);

        path.replaceWith(t.stringLiteral(strC));
    }
}

// SplitCommaExpression
function step1(ast) {
    traverse(ast, {
        ExpressionStatement: SplitCommaExpression_expre,
        VariableDeclaration: SplitCommaExpression_var
    })
}

function SplitCommaExpression_expre(path) {
    let curNode = path.node;

    if (!t.isSequenceExpression(curNode.expression))
        return;

    // console.log(path.toString());

    let expressions = curNode.expression.expressions;
    let expressionArr = [];
    expressions.forEach(expression => {
        expressionArr.push(t.expressionStatement(expression));
    });

    path.replaceWithMultiple(expressionArr);
}

function SplitCommaExpression_var(path) {
    let curNode = path.node;

    if (curNode.declarations.length < 2)
        return;

    // console.log(path.toString());

    let declarations = curNode.declarations;
    let variableDeclaratorArr = [];
    declarations.forEach(declaration => {
        variableDeclaratorArr.push(t.variableDeclaration(curNode.kind, [declaration]));
    });

    path.replaceWithMultiple(variableDeclaratorArr);
}

function step2(ast) {
    traverse(ast, {
        VariableDeclaration: replace_obj_params
    })
}

function replace_obj_params(path) {
    let node = path.node;
    if (node.declarations.length != 1 || !t.isVariableDeclarator(node.declarations[0])
        || node.declarations[0].init == null || !t.isObjectExpression(node.declarations[0].init)
        || node.declarations[0].init.properties == null || node.declarations[0].init.properties.length < 1
        || !t.isStringLiteral(node.declarations[0].init.properties[0].key) || node.declarations[0].init.properties[0].key.value.length != 5) {
        return;
    }

    // 初始化需要的变量
    let functionPath = path.getFunctionParent();
    let rootName = node.declarations[0].id.name;

    node.declarations[0].init.properties.forEach(property => {
        let secodeName = property.key.value;

        switch (property.value.type) {
            case "StringLiteral": {
                functionPath.traverse({
                    MemberExpression: function (path2) {
                        let node2 = path2.node;
                        if (!t.isIdentifier(node2.object) || node2.object.name != rootName || !t.isStringLiteral(node2.property) || node2.property.value != secodeName) {
                            return;
                        }

                        path2.replaceWith(property.value);
                    },
                });
                break;
            }
            case "FunctionExpression": {
                if (t.isBlockStatement(property.value.body) && property.value.body.body != null && property.value.body.body.length == 1 && t.isReturnStatement(property.value.body.body[0])) {
                    let returnNode = property.value.body.body[0].argument

                    // 根据return语句的类型 分别进行替换
                    switch (returnNode.type) {
                        case "CallExpression": {

                            functionPath.traverse({
                                CallExpression: function (path2) {
                                    let node2 = path2.node;
                                    if (!t.isMemberExpression(node2.callee) ||
                                        !t.isIdentifier(node2.callee.object) || node2.callee.object.name != rootName || !t.isStringLiteral(node2.callee.property) || node2.callee.property.value != secodeName) {
                                        return
                                    }

                                    if (t.isIdentifier(returnNode.callee)) {
                                        path2.replaceWith(t.callExpression(node2.arguments[0], node2.arguments.slice(1)));
                                    } else if (t.isMemberExpression(returnNode.callee)) {
                                        path2.replaceWith(t.callExpression(property.value.body.body[0].argument.callee, node2.arguments))
                                    }
                                },
                            });

                            break;
                        }
                        case "BinaryExpression": {

                            functionPath.traverse({
                                CallExpression: function (path2) {
                                    let node2 = path2.node;
                                    if (!t.isMemberExpression(node2.callee) ||
                                        !t.isIdentifier(node2.callee.object) || node2.callee.object.name != rootName || !t.isStringLiteral(node2.callee.property) || node2.callee.property.value != secodeName) {
                                        return
                                    }

                                    path2.replaceWith(t.binaryExpression(returnNode.operator, node2.arguments[0], node2.arguments[1]));
                                },
                            });

                            break;
                        }
                        case "LogicalExpression": {

                            functionPath.traverse({
                                CallExpression: function (path2) {
                                    let node2 = path2.node;
                                    if (!t.isMemberExpression(node2.callee) ||
                                        !t.isIdentifier(node2.callee.object) || node2.callee.object.name != rootName || !t.isStringLiteral(node2.callee.property) || node2.callee.property.value != secodeName) {
                                        return
                                    }

                                    path2.replaceWith(t.logicalExpression(returnNode.operator, node2.arguments[0], node2.arguments[1]));
                                },
                            });

                            break;
                        }
                        default: {
                            console.log("2", returnNode.type);
                            break;
                        }
                    }
                }

                break;
            }
            // case "MemberExpression": {
            //     break;
            // }
            default: {
                console.log("1", property.value.type);
                break;
            }
        }
    })

    path.remove();
    // console.log(path.toString());
}


function step3(ast) {
    traverse(ast, {
        NumericLiteral: function (path) {
            let new_node = path.node
            new_node.extra = null;
            path.replaceWith(new_node);
        }
    })
}

function step4(ast) {
    traverse(ast, {
        WhileStatement: function (path) {
            let node = path.node
            if (path.getAllPrevSiblings().length < 2) {
                return;
            }
            let allPrevSiblings = path.getAllPrevSiblings();

            if (!t.isVariableDeclaration(allPrevSiblings[0]) || !t.isVariableDeclaration(allPrevSiblings[1])) {
                return;
            }

            if (!t.isUnaryExpression(node.test) || !t.isBlockStatement(node.body) || node.body.body.length < 1) {
                return;
            }

            // 控制流还原顺序
            let index_arr = allPrevSiblings[1].node.declarations[0].init.callee.object.value.split("|")
            // 控制流混淆字句
            let case_arr = node.body.body[0].cases;

            let body_arr = [];
            index_arr.forEach(index => {
                let case_node = case_arr[index];
                case_node.consequent.forEach(case_consequent_node => {
                    if (!t.isContinueStatement(case_consequent_node)) {
                        body_arr.push(case_consequent_node);
                    }
                })
            })

            path.replaceWithMultiple(body_arr);

            allPrevSiblings[0].remove();
            allPrevSiblings[1].remove();
        }
    })
}

function step5(ast) {
    let str_arr = undefined;
    let str_arr_name = undefined;

    let obj_arr = undefined;
    let obj_arr_name = undefined;
    // 初始化变量
    traverse(ast, {
        ExpressionStatement: function (path) {
            let node = path.node;

            if (!t.isAssignmentExpression(node.expression) || !t.isArrayExpression(node.expression.right) || node.expression.right.elements.length == 0) {
                return;
            }

            let root_name = node.expression.left.name;

            if (t.isStringLiteral(node.expression.right.elements[0])) {
                // console.log(node.expression.right.elements[0].value);
                str_arr = eval(generator(node.expression.right).code);
                str_arr_name = node.expression.left.name;

                path.remove();
            } else if (t.isObjectExpression(node.expression.right.elements[0])) {
                // console.log(generator(node.expression.right.elements[0]).code);
                obj_arr = eval(generator(node.expression.right).code);
                obj_arr_name = node.expression.left.name;

                path.remove();
            }

        }
    })

    // 替换变量使用位置的值
    traverse(ast, {
        MemberExpression: function (path) {
            let node = path.node;

            if (!t.isMemberExpression(node.object) || !t.isIdentifier(node.object.object) || node.object.object.name != obj_arr_name) {
                return;
            }
            try {
                path.replaceWith(t.stringLiteral(obj_arr[node.object.property.value][node.property.value]));
            } catch (e) {
                console.log(e);
                debugger;
            }

        },
        CallExpression: function (path) {
            let node = path.node;

            if (node.arguments.length != 2) {
                return;
            }

            if (!t.isMemberExpression(node.arguments[0])) {
                return;
            }

            if (!t.isIdentifier(node.arguments[0].object)) {
                return;
            }

            if (node.arguments[0].object.name != str_arr_name) {
                return;
            }

            if (node.arguments[1].type != 'NumericLiteral') {
                return;
            }

            path.replaceWith(t.stringLiteral(str_arr[node.arguments[0].property.value][node.arguments[1].value]));

        }
    })
}

// 将被分开的字符串合并
function step6(ast) {
    isMerge = 999;
    while (isMerge != 0) {
        isMerge = 0;

        traverse(ast, {
            BinaryExpression: mergeStr
        })

        console.log(isMerge);
    }

}

function mergeStr(path) {
    var node = path.node;
    if (!t.isStringLiteral(node.left) || !t.isStringLiteral(node.right))
        return;

    isMerge++;
    path.replaceWith(t.stringLiteral(node.left.value + node.right.value));
}

function step7(ast) {
    let fun_name_arr = [];

    traverse(ast, {
        FunctionDeclaration: function (path) {
            let node = path.node;
            if (node.id.name.length != 2 || path.parentPath.type != 'Program' || node.params.length != 0)
                return;


            // 有ReturnStatement的函数不进行替换
            let return_f = false;
            path.traverse({
                ReturnStatement: function (path3) {
                    if (path3.getFunctionParent() == path) {
                        return_f = true;
                    }
                }
            });

            if (return_f) {
                return;
            }

            let refer_arr = []
            traverse(ast, {
                ExpressionStatement: function (path2) {
                    let node2 = path2.node;

                    if (!t.isCallExpression(node2.expression) || !t.isIdentifier(node2.expression.callee) || node2.expression.callee.name != node.id.name || node2.expression.arguments.length != node.params.length)
                        return;

                    refer_arr.push(path2);
                }
            });

            // 替换到使用位置 (只被引用一次的函数，才替换到使用位置)
            if (refer_arr.length == 1) {

                fun_name_arr.push(node.id.name);

                refer_arr[0].replaceWithMultiple(node.body.body);

                path.remove();
            }

        }
    })

    console.log(JSON.stringify(fun_name_arr));
}