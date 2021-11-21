const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;
const t = require("@babel/types");
const generator = require("@babel/generator").default;

const path = require('path');
const fs = require('fs');

// 借助jsdom库初步补环境
const {JSDOM} = require('jsdom');
const jsdom = new JSDOM('<!doctype html><html><body></body></html>', {
    url: "https://www.baidu.com"
});
const win = jsdom.window;
Object.keys(win).forEach(key => {
    if (!(key in global) && key != "alert") {
        global[key] = win[key];
    }
})

// 单独补一些还缺失的环境

if (Function.prototype.originalToString == undefined) {
    Function.prototype.originalToString = Function.prototype.toString;
}
Function.prototype.toString = function () {
    if (this.name == "statusbar") {
        return "[object BarProp]";
    } else {
        return this.originalToString();
    }
}


let statusbar = function () {
};

let btoa = function (str) {
    return Buffer.from(str + "").toString('base64');
};

let atob = function (str) {
    return Buffer.from(str, 'base64').toString();
};

global.btoa = btoa;
global.atob = atob;
global.statusbar = statusbar;
global.status = "";

fs.readFile(path.resolve(__dirname, './3source.js'), {"encoding": 'utf-8'}, function (err, data) {
    let ast = parser.parse(data);

    // 一元运算
    step1(ast);
    console.log("step1 end.");

    // 二元运算
    step2(ast);
    console.log("step2 end.");

    // 成员调用
    step3(ast);
    console.log("step3 end.");

    // 函数调用
    step4(ast);
    console.log("step4 end.");

    code = generator(ast).code;

    fs.writeFile('./3result.js', code, {encoding: 'utf8'}, err => {
        console.log(err);
    })
});

function step1(ast) {
    traverse(ast, {
        UnaryExpression: parse
    })
}


function step2(ast) {
    traverse(ast, {
        BinaryExpression: {
            exit: parse
        }

    })
}

function step3(ast) {
    traverse(ast, {
        MemberExpression: parse
    })
}

function step4(ast) {
    traverse(ast, {
        CallExpression: parse
    })
}

function parse(path) {
    try {
        let result = eval(path.toString());
        console.log("       ", result, " <---- ", path.toString());
        switch (typeof result) {
            case "string":
                path.replaceWith(t.stringLiteral(result));
                break;
            case "number":
                path.replaceWith(t.numericLiteral(result));
                break;
            case "boolean":
                path.replaceWith(t.booleanLiteral(result));
                break;
            case "undefined":
                path.replaceWith(t.identifier("undefined"));
                break;
            case "function":
                if (result == Function) {
                    path.replaceWith(t.identifier("Function"));
                }
                break;
            case "object":
                if (result instanceof Array) {
                    path.replaceWith(t.identifier("Function"));
                }
            default:
                console.log("default -> ", typeof result, result);
                break;
        }
    } catch (e) {
        console.log(path.toString());
        console.log("error -> ", e.message);
    }
}
