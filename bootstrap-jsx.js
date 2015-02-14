var babel = require('babel');

var babelOptions = {
  whitelist: [
    'react',
    'es6.arrowFunctions',
    'es6.blockScoping',
    'es6.classes',
    'es6.destructuring',
    'es6.parameters.default',
    'es6.parameters.rest',
    'es6.properties.shorthand',
    'es6.spread',
    'es6.templateLiterals',
  ],
  sourceMap: 'inline',
};

var hotReload = true;

// Polyfill
babel.polyfill();

function compile(module, filename) {
  console.log('Compiling ' + filename);
  return module._compile(babel.transformFileSync(filename, babelOptions).code, filename);
}

var hotCompile = (function () {
  var fs = require('fs');
  var React = require('react');
  var ReactMount = require('react/lib/ReactMount');
  var reactHotReload = require('react-hot-api')(function () { return ReactMount._instancesByReactRootID; });

  var currentlyCompiling;
  var watchedModules = new WeakSet();
  var requiredBy = new Map();

  function monitorHotReload(module) {
    if (watchedModules.has(module))
      return;

    watchedModules.add(module);

    var timeout;
    fs.watch(module.filename, {persistent: true}, function () {
      clearTimeout(timeout);
      timeout = setTimeout(function () {
        hotCompile(module, module.filename, true);
      }, 100);
    });
  }

  function isReactComponent(module) {
    return module.exports.prototype instanceof React.Component;
  }

  function recompileRequirements(module, collection) {
    if (requiredBy.has(module)) {
      var requirements = requiredBy.get(module);
      var m;
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
    for (var mod of requiredBy.values()) {
      mod.delete(module);
    }
  }

  function hotCompile(module, filename, withRequirements) {

    monitorRequire(module);
    onRequired(module);

    removeModuleFromDependencies(module);

    var previouslyCompiling = currentlyCompiling;
    currentlyCompiling = module;

    var wasReactComponent = isReactComponent(module);

    var result;
    var failed = false;

    try {
      result = compile(module, filename);
    }
    catch (e) {
      console.log('Error while compiling ' + filename);
      console.log(e.stack);
      failed = true;
    }

    currentlyCompiling = previouslyCompiling;

    monitorHotReload(module);

    if (!failed) {

      if (isReactComponent(module)) {
        reactHotReload(module.exports, module.filename);
      }

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
}());

require.extensions['.jsx'] = hotReload ? hotCompile : compile;

if (process.mainModule === module) {
  var path = require('path');
  require(path.resolve(process.argv[2]));
}
