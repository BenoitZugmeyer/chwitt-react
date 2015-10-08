'use strict';
let babel = require('babel');

let babelOptions = {
    whitelist: [
        'react',
        'es6.arrowFunctions',
        'es6.classes',
        'es6.destructuring',
        'es6.parameters',
        'es6.spread',
    ],
    sourceMap: 'inline',
};

function compile(module, filename) {
    console.log('Compiling ' + filename);
    return module._compile(babel.transformFileSync(filename, babelOptions).code, filename);
}

function makeHotCompile() {
    let fs = require('fs');
    let React = require('react');
    let ReactProxy = require('react-proxy');
    let forceUpdateComponent = ReactProxy.getForceUpdate(React);
    let currentlyCompiling;
    let watchedModules = new WeakSet();
    let requiredBy = new Map();

    function monitorHotReload(module) {
        if (watchedModules.has(module)) return;

        watchedModules.add(module);

        let timeout;
        // https://github.com/atom/electron/issues/1268
        fs.watchFile(module.filename, {persistent: true, interval: 1000}, function () {
            clearTimeout(timeout);
            timeout = setTimeout(function () {
                hotCompile(module, module.filename, true);
            }, 100);
        });
    }

    function isReactComponent(module) {
        const Class = module.exports;
        return Class && Class.prototype instanceof React.Component;
    }

    function recompileRequirements(module, collection) {
        if (requiredBy.has(module)) {
            let requirements = requiredBy.get(module);
            let m;
            for (m of requirements) {
                if (!collection.has(m)) {
                    collection.add(m);
                    hotCompile(m, m.filename);
                }
            }

            for (m of requirements) {
                recompileRequirements(m, collection || new WeakSet());
            }
        }
    }

    function monitorRequire(module) {
        if (Object.getOwnPropertyDescriptor(require.cache, module.filename).value) {
            Object.defineProperty(require.cache, module.filename, {
                get: function () {
                    onRequired(module);
                    return module;
                }
            });
        }
    }

    function onRequired(module) {
        if (currentlyCompiling) {
            if (!requiredBy.has(module)) requiredBy.set(module, new Set());
            requiredBy.get(module).add(currentlyCompiling);
        }
    }

    function removeModuleFromDependencies(module) {
        for (let mod of requiredBy.values()) {
            mod.delete(module);
        }
    }

    const proxies = new Map();

    function makeHotReload(module) {
        if (isReactComponent(module)) {
            let proxy = proxies.get(module);
            if (proxy) {
                proxy.update(module.exports).forEach(forceUpdateComponent);
            }
            else {
                proxy = ReactProxy.createProxy(module.exports);
                proxies.set(module, proxy);
            }
            module.exports = proxy.get();
        }
    }

    function hotCompile(module, filename, withRequirements) {

        monitorRequire(module);
        onRequired(module);

        removeModuleFromDependencies(module);

        let previouslyCompiling = currentlyCompiling;
        currentlyCompiling = module;

        let wasReactComponent = isReactComponent(module);

        let result;
        let failed = false;

        try {
            result = compile(module, filename);
        }
        catch (e) {
            console.error('Error while compiling ' + filename + '\n' + e.stack);
            failed = true;
        }

        currentlyCompiling = previouslyCompiling;

        monitorHotReload(module);

        if (!failed) {

            makeHotReload(module);

            // console.log('wasReactComponent', wasReactComponent);
            // console.log('isReactComponent', isReactComponent(module));
            // console.log('withRequirements', withRequirements);
            if ((!wasReactComponent || !isReactComponent(module)) && withRequirements) {
                recompileRequirements(module, new Set([module]));
            }
        }

        return result;
    }

    return hotCompile;
}


let isMain = process.mainModule === module;
let isProduction = process.env.NODE_ENV === 'production';

// Use hotCompile only on development or if this module is called as a main script
require.extensions['.jsx'] = isMain || !isProduction ? makeHotCompile() : compile;

if (isMain) {
    let path = require('path');
    require(path.resolve(process.argv[2]));
}

exports.options = babelOptions;
