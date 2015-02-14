

module.exports = function glob(s) {
    var regex = s
    .replace(/\\/g, '\\\\')
    .replace(/([\-.*+\?\^$()\[\]{}|])/g, '\\$1')
    .replace(/\\\*/g, '.*')
    .replace(/\\\?/g, '.')
    .replace(/\\\{/g, '(')
    .replace(/\\\}/g, ')')
    .replace(/,/g, '|');

    return new RegExp('^' + regex + '$');
};
