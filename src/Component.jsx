'use strict';
let React = require('react');
let ReactComponentWithPureRenderMixin = require('react/lib/ReactComponentWithPureRenderMixin');
let ss = require('./ss');
let DefaultMap = require('./DefaultMap');

let names = new Set();

class Component extends React.Component {

    static listenTo(store, method='onChange') {

        if (!this.hasOwnProperty('_stores')) {
            let stores = new DefaultMap(() => new Set());

            // Copy stores from parent component
            for (let [method, set] of this._stores) {
                stores.set(method, new Set(set));
            }

            this._stores = stores;
        }

        this._stores.get(method).add(store);

    }

    static getSansSelNamespace() {
        if (this.hasOwnProperty('_ns')) return this._ns;
        if (names.has(this.name)) {
            throw new Error(`Components using style() should have a unique name (${this.name} is duplicated)`);
        }
        let parent = Object.getPrototypeOf(this).getSansSelNamespace();
        let ns = parent.namespace(this.name);
        if (this.styles) {
            ns.addAll(this.styles);
        }
        this._ns = ns;
        return ns;
    }

    constructor(props) {
        super(props);
        if (!this.constructor.displayName) this.constructor.displayName = this.constructor.name;
    }

    applyMixin(mixin) {
        for (let property in mixin) {
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

    style(...names) {
        return this.constructor.getSansSelNamespace().render(...names);
    }

    getStyle(...names) {
        return this.constructor.getSansSelNamespace().get(...names);
    }

    _listenStores(y) {
        if (!this._storeListeners) {
            this._storeListeners = new DefaultMap(method => {
                if (typeof this[method] !== 'function') {
                    throw new Error(`Method ${this.constructor.name}#${method} doesn't exist`);
                }
                return this[method].bind(this);
            });
        }

        for (let [method, set] of this.constructor._stores) {
            for (let store of set) {
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

    shouldComponentUpdate(nextProps, nextState) {
        let result = ReactComponentWithPureRenderMixin.shouldComponentUpdate.call(this, nextProps, nextState);
        if (!result && process.env.NODE_ENV !== 'production') {
            console.log('Update prevented for component', this.constructor.name);
        }
        return result;
    }

}

Component._ns = ss;
Component._stores = new Map();

module.exports = Component;
