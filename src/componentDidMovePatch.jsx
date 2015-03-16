'use strict';
var ReactDOMComponent = require('react/lib/ReactDOMComponent');

var moveChild = ReactDOMComponent.prototype.moveChild;
var updateChildren = ReactDOMComponent.prototype.updateChildren;

var movingChildren;

function triggerComponentDidMove(component) {
    if (Array.isArray(component)) {
        component.map(triggerComponentDidMove);
    }
    else if (component instanceof ReactDOMComponent) {
        for (var key in component._renderedChildren) {
            triggerComponentDidMove(component._renderedChildren[key]);
        }
    }
    else if (component.getPublicInstance) {
        var instance = component.getPublicInstance();
        if (instance.componentDidMove) instance.componentDidMove();
        if (component._renderedComponent) triggerComponentDidMove(component._renderedComponent);
    }
}

ReactDOMComponent.prototype.updateChildren = function (_, transaction) {
    movingChildren = [];
    transaction.getReactMountReady().enqueue(triggerComponentDidMove.bind(null, movingChildren));
    return updateChildren.apply(this, arguments);
};

ReactDOMComponent.prototype.moveChild = function (child, toIndex, lastIndex) {
    if (child._mountIndex < lastIndex) {
        movingChildren.push(child);
    }
    return moveChild.apply(this, arguments);
};
