'use strict';

var names = ['window', 'document', 'navigator', 'requestAnimationFrame', 'cancelAnimationFrame'];

for (var name of names) {
  global[name] = window[name];
}

require("./bootstrap-jsx");
require("./src/launch");
