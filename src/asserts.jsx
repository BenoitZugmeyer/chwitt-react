'use strict';
var util = require('util');
var tests = require('chwitt-react/tests');

var failWith = (message) => {
    if (isFailed(message)) throw new Error('Assert error: ' + message);
};

var _format = (result, indent) => {
    if (Array.isArray(result)) {
        return result.map(r => _format(r, indent)).join('');
    }
    if (typeof result === 'object') {
        return `${indent && '\n'}${indent}${result.context} -> ${_format(result.result, indent + '  ')}`;
    }
    return String(result);
};

var format = (context, result) => {
    if (result === false) result = 'failed';
    if (isFailed(result)) {
        return {
            result,
            context,
            toString() {
                return _format(this, '');
            }
        };
    }
};

var typeOf = value => {
    var type =
        value === null ? 'null' :
        value instanceof RegExp ? RegExp :
        typeof value;

    if (type === 'number' && isNaN(value)) type = 'nan';
    return type;
};

var stringify = s => {
    if (s.displayName) return s.displayName;
    if (s.name) return s.name;
    if (typeOf(s) === 'object') {
        var result = '{';
        for (let key in s) result += `${key}: ${stringify(s[key])},`;
        result += '}';
        return result;
    }


    return util.inspect(s);
};

var makeAssert = (name, check, register=true) => {
    var assert = value => failWith(assert.run(value));
    assert.run = value => format(assert.displayName, check(value));
    assert.prop = (obj, name, component) => {
        var result = format(`${component} property ${name}`, assert.run(obj[name]));
        if (result) return new Error(result);
    };
    assert.displayName = name;
    if (register) exports[name] = assert;
    return assert;
};

var makeAssertTypeOf = (name, expectedType) => makeAssert(name, value => {
    var type = typeOf(value);
    if (type !== expectedType) return `expected typeof ${expectedType}, got ${type}`;
});

var makeCurryAssert = (name, check) => exports[name] = (...args) =>
    makeAssert(`${name}(${args.map(stringify).join(', ')})`, value => check(value, ...args), false);

var isFailed = value => value !== undefined && value !== true;

makeAssertTypeOf('isString', 'string');
makeAssertTypeOf('isNumber', 'number');
makeAssertTypeOf('isUndefined', 'undefined');
makeAssertTypeOf('isNull', 'null');
makeAssertTypeOf('isNaN', 'nan');
makeAssertTypeOf('isBoolean', 'boolean');
makeAssertTypeOf('isFunction', 'function');
makeAssertTypeOf('isObject', 'object');
makeAssert('isIterable', value => value !== null && value !== undefined && !!value[Symbol.iterator]);
makeCurryAssert('is', Object.is);
makeCurryAssert('oneOf', (value, values) => values.indexOf(value) < 0 && 'not found');
makeCurryAssert('matches', (value, regexp) => regexp.test(value));
makeCurryAssert('option', (value, assert) => value === undefined || assert.run(value));
makeCurryAssert('instanceOf', (value, klass) => value instanceof klass);
makeCurryAssert('not', (value, assert) => isFailed(assert.run(value)));
makeCurryAssert('hasProperty', (value, property, assert) => {
    var has = value !== null && value !== undefined && (
        typeof value === 'object' ? property in value :
        Object.prototype.hasOwnProperty.call(value, property)
    );
    if (!has) return 'does not have property';
    if (typeof assert === 'function') return assert.run(value[property]);
});
makeCurryAssert('hasProperties', (value, properties) => {
    for (var name in properties) {
        var result = exports.hasProperty(name, properties[name]).run(value);
        if (isFailed(result)) return result;
    }
});
makeCurryAssert('property', (value, property, assert) => value === null || value === undefined ? 'Value is undefined' : assert.run(value[property]));
makeCurryAssert('properties', (value, properties) => {
    for (var name in properties) {
        var result = exports.property(name, properties[name]).run(value);
        if (isFailed(result)) return result;
    }
});
makeCurryAssert('arrayOf', (value, assert) => {
    var message = exports.isIterable.run(value);
    if (isFailed(message)) return message;
    var index = 0;
    for (var v of value) {
        var result = assert.run(v);
        if (isFailed(result)) return format('at index ' + index, result);
    }
});
makeCurryAssert('any', (value, ...asserts) => {
    var messages = [];
    for (var assert of asserts) {
        var result = assert.run(value);
        if (!isFailed(result)) return undefined;
        messages.push(result);
    }
    return messages;
});
makeCurryAssert('all', (value, ...asserts) => {
    for (var assert of asserts) {
        var result = assert.run(value);
        if (isFailed(result)) return result;
    }
});

var {
    all,
    any,
    arrayOf,
    hasProperty,
    hasProperties,
    instanceOf,
    is,
    isNumber,
    isString,
    isObject,
    matches,
    not,
    oneOf,
    option,
    properties,
    property,
} = exports;

makeAssert('isTweet',
           hasProperties({
               id_str: isString,
           }).run);

makeAssert('isColumn',
           hasProperties({
               name: isString,
               type: isString,
               query: isObject,
           }).run);

var isImage = makeAssert(
    'isImage',
    properties({
        src: isString,
    }).run
);

makeAssert(
    'isVideo',
    properties({
        thumbnail: option(isImage),
        quality: option(any(
            hasProperty('medium', isString),
            hasProperty('low', isString),
            hasProperty('high', isString)
        )),
        type: option(isString),
    }).run
);

makeAssert(
    'isUser',
    hasProperties({
        id_str: isString,
        name: isString,
        screen_name: isString,
        entities: isObject,
        profile_image_url_https: isString,
    })
);



tests('asserts', () => {
    var failures = {
        'isString -> expected typeof string, got number':
            () => isString(5),
        'option(isString) -> \n  isString -> expected typeof string, got number':
            () => option(isString)(5),
        'any(isString, isNumber) -> \n  isString -> expected typeof string, got null\n  isNumber -> expected typeof number, got null':
            () => any(isString, isNumber)(null),
        'is(true) -> failed':
            () => is(true)(false),
        'instanceOf(Array) -> failed':
            () => instanceOf(Array)(),
        'all(isString, is(\'a\')) -> \n  is(\'a\') -> failed':
            () => all(isString, is('a'))('b'),
        'isNumber -> expected typeof number, got nan':
            () => isNumber(NaN),
        'not(isString) -> failed':
            () => not(isString)('foo'),
        'oneOf(\'a\', \'b\') -> not found':
            () => oneOf('a', 'b')('foo'),
        'matches(/a|b/) -> failed':
            () => matches(/a|b/)('foo'),
        'arrayOf(is(1)) -> \n  at index 0 -> \n    is(1) -> failed':
            () => arrayOf(is(1))('foo'),
        'hasProperty(\'a\', isString) -> \n  isString -> expected typeof string, got number':
            () => hasProperty('a', isString)({a: 1}),
        'hasProperties({foo: isString,}) -> \n  hasProperty(\'foo\', isString) -> \n    isString -> expected typeof string, got number':
            () => hasProperties({ foo: isString })({ foo: 1 }),

    };

    var successes = [
        () => property('foo', isString)({foo: 'oo'}),
        () => property('foo', option(isString))({}),
        () => instanceOf(Array)([]),
    ];

    function getFunctionCode(fn) {
        return /^function \(\) \{\s*return (.*);/.exec(fn)[1];
    }

    for (let expectedMessage in failures) {
        var error = null;
        var fn = failures[expectedMessage];
        try {
            fn();
        } catch (e) {
            error = e;
        }
        if (!error) {
            console.log(`${getFunctionCode(fn)} didn't failed (should have failed with "${expectedMessage}")`);
        }
        else if (!error.message.startsWith('Assert error:')) {
            console.log('Wooops');
            console.log(error.stack);
        }
        else {
            var message = error.message.slice(14);
            if (message !== expectedMessage) {
                console.log(`${getFunctionCode(fn)} didn't failed with the right message.\nExpected: ${expectedMessage}\nActual:   ${message}`);
            }
        }

    }

    for (let success of successes) {
        try {
            success();
        } catch (e) {
            console.log(`${getFunctionCode(fn)} shouldn't fail. Got ${e.stack}`);
        }
    }
});
