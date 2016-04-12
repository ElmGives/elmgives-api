'use strict';

var keywords = [
    'do', 'if', 'in', 'for', 'new', 'try', 'var', 'case', 'else', 'enum', 'null',
    'this', 'true', 'void', 'with', 'break', 'catch', 'class', 'const', 'false',
    'super', 'throw', 'while', 'delete', 'export', 'import', 'return', 'switch',
    'typeof', 'default', 'extends', 'finally', 'continue', 'debugger', 'function',
    'do', 'if', 'in', 'for', 'int', 'new', 'try', 'var', 'byte', 'case', 'char',
    'else', 'enum', 'goto', 'long', 'null', 'this', 'true', 'void', 'with', 'break',
    'catch', 'class', 'const', 'false', 'final', 'float', 'short', 'super', 'throw',
    'while', 'delete', 'double', 'export', 'import', 'native', 'public', 'return',
    'static', 'switch', 'throws', 'typeof', 'boolean', 'default', 'extends',
    'finally', 'package', 'private', 'abstract', 'continue', 'debugger', 'function',
    'volatile', 'interface', 'protected', 'transient', 'implements', 'instanceof',
    'synchronized', 'do', 'if', 'in', 'for', 'let', 'new', 'try', 'var', 'case',
    'else', 'enum', 'eval', 'null', 'this', 'true', 'void', 'with', 'break',
    'catch', 'class', 'const', 'false', 'super', 'throw', 'while', 'yield',
    'delete', 'export', 'import', 'public', 'return', 'static', 'switch',
    'typeof', 'default', 'extends', 'finally', 'package', 'private', 'continue',
    'debugger', 'function', 'arguments', 'interface', 'protected', 'implements',
    'instanceof', 'do', 'if', 'in', 'for', 'let', 'new', 'try', 'var', 'case',
    'else', 'enum', 'eval', 'null', 'this', 'true', 'void', 'with', 'await',
    'break', 'catch', 'class', 'const', 'false', 'super', 'throw', 'while',
    'yield', 'delete', 'export', 'import', 'public', 'return', 'static',
    'switch', 'typeof', 'default', 'extends', 'finally', 'package', 'private',
    'continue', 'debugger', 'function', 'arguments', 'interface', 'protected',
    'implements', 'instanceof'
];

console.time('a');
var a = keywords
    .filter(function(keyword, index) {
        return keywords.indexOf(keyword) === index;
    })
    .sort(function(a, b) {
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        }

        return 0;
    });
console.timeEnd('a');

// console.log(a.length, a[5], a[45]);

console.time('b');
let b = keywords
    .filter((keyword, index) => keywords.indexOf(keyword) === index)
    .sort((a, b) => {
        if (a < b) {
            return -1;
        } else if (a > b) {
            return 1;
        }
        return 0;
    });
console.timeEnd('b');

// console.log(b.length, b[5], b[45]);

console.time('c');
let c = [...new Set(keywords)].sort((a, b) => a.localeCompare(b))
console.timeEnd('c');
// console.log(c.length, c[5], c[45]);
console.log("\n");
