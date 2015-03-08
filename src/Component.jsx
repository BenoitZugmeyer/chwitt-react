'use strict';
var React = require('react');
var ReactElement = require('react/lib/ReactElement');
var ReactCurrentOwner = require('react/lib/ReactCurrentOwner');
var ss = require('./ss');

var names = new Set();

var original = ReactElement.createElement.__beforePatchedForSansSel || ReactElement.createElement;
ReactElement.createElement = function (type, config) {
    if (config && config.styles) {
        if (config.className) throw new Error(`An element can\'t have both a className and a styles`);
        var styles = config.styles;
        if (typeof styles === 'string') styles = styles.split(',').map(s => s.trim());
        var component = ReactCurrentOwner.current.getPublicInstance();
        config.className = component.style.apply(component, styles);
        delete config.styles;
    }
    return original.apply(this, arguments);
};
ReactElement.__beforePatchedForSansSel = original;


class Component extends React.Component {

    static listenTo(store, method='onChange') {

        if (!this.hasOwnProperty('_stores')) {
            var stores = new Map();

            // Copy stores from parent component
            for (let [method, set] of this._stores) {
                stores[method] = new Set(set);
            }

            this._stores = stores;
        }

        var storesForMethod = this._stores.get(method);
        if (!storesForMethod) {
            storesForMethod = new Set();
            this._stores.set(method, storesForMethod);
        }

        storesForMethod.add(store);

    }

    static getSansSelNamespace() {
        if (this.hasOwnProperty('_ns')) return this._ns;
        if (names.has(this.name)) {
            throw new Error(`Components using style() should have a unique name (${this.name} is duplicated)`);
        }
        var parent = Object.getPrototypeOf(this).getSansSelNamespace();
        var ns = parent.namespace(this.name);
        if (this.styles) {
            ns.addAll(this.styles);
        }
        this._ns = ns;
        return ns;
    }

    applyMixin(mixin) {
        for (var property in mixin) {
            if (property === 'getInitialState') {
                this.state = Object.assign(this.state || {}, mixin.getInitialState());
            }
            else if (typeof mixin[property] === 'function') {
                if (this[property]) {
                    throw new Error(`Can't override instance property ${property}`);
                }
                this[property] = mixin[property].bind(this);
            }
            else {
                throw new Error(`Can't handle property type ${typeof mixin[property]}`);
            }
        }
        Object.defineProperty(this, 'isMounted', { value: () => true });
    }

    style() {
        var ns = this.constructor.getSansSelNamespace();
        return ns.render.apply(ns, arguments);
    }

    _listenStores(y) {
        if (!this._storeListeners) this._storeListeners = new Map();

        for (var [method, set] of this.constructor._stores) {
            for (var store of set) {
                if (!this._storeListeners.has(method)) {
                    if (typeof this[method] !== 'function') throw new Error(`Method ${this.constructor.name}#${method} doesn't exist`);
                    this._storeListeners.set(method, this[method].bind(this));
                }
                store[y ? 'listen' : 'ignore'](this._storeListeners.get(method));
            }
        }
    }

    componentDidMount() {
        this._listenStores(true);
    }

    componentWillUnmount() {
        this._listenStores(false);
    }

}

Component._ns = ss;
Component._stores = new Map();

module.exports = Component;
