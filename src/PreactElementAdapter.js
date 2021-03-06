import { h } from 'preact';
import ObjectAssign from 'object-assign';
import getIteratorFn from './getIteratorFn';

const VNode = Object.getPrototypeOf(h('div'));

function isValidChild(child) {
  const typeofChild = typeof child;
  return (typeofChild === 'string' ||
    typeofChild === 'number' ||
    (typeofChild === 'function' && child._expectIt) ||
    (typeof child === 'object' && child !== null &&
     Object.getPrototypeOf(child) === VNode)
  );
}

const DefaultOptions = {};

class PreactElementAdapter {

  constructor(options) {
    this._options = ObjectAssign({}, DefaultOptions, options);
  }

  getName(element) {
    if (typeof element.nodeName === 'string') {
      return element.nodeName;
    }

    // element.type is for preact-compat
    return (typeof element.type === 'function' && element.type.prototype && element.type.prototype.displayName) ||
      element.nodeName.displayName || element.nodeName.name || 'no-display-name';
  }

  getAttributes(element) {

    const copyProps = ObjectAssign({}, element.attributes);

    if (!this._options.includeKeyProp) {
      delete copyProps.key;
    }

    if (!this._options.includeRefProp) {
      delete copyProps.ref;
    }

    if (copyProps.hasOwnProperty('className')) {
      copyProps.class = copyProps.className;
      delete copyProps.className;
    }

    // preact-compat generates a `children` prop
    if (copyProps.children) {
      delete copyProps.children;
    }

    return copyProps;
  }

  getChildren(element) {

    var children = element.children;
    var childrenArray = [];
    var iteratorFn;

    if (Array.isArray(children)) {
      childrenArray = children.filter(child => isValidChild(child));
    } else if (iteratorFn = getIteratorFn(children)) {
      // Leaving this in, because although it's not supported yet, it looks like it's going to be
      // See https://github.com/developit/preact/pull/476

      const iterator = iteratorFn.call(children);
      let step;

      while (!(step = iterator.next()).done) {
        childrenArray.push(step.value);
      }
    }

    return childrenArray;
  }

  setOptions(newOptions) {

    this._options = ObjectAssign({}, this._options, newOptions);
  }

  getOptions() {
    return this._options;
  }
}


PreactElementAdapter.prototype.classAttributeName = 'class';

module.exports = PreactElementAdapter;
