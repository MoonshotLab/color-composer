(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

exports.palette = {
  colors: ["#20171C", "#1E2A43", "#28377D", "#352747", "#CA2E26", "#9A2A1F", "#DA6C26", "#453121", "#916A47", "#DAAD27", "#7F7D31", "#2B5E2E"],
  colorNames: {
    "#20171C": "black",
    "#1E2A43": "blue",
    "#28377D": "blue",
    "#352747": "blue",
    "#CA2E26": "red",
    "#9A2A1F": "red",
    "#DA6C26": "orange",
    "#453121": "brown",
    "#916A47": "brown",
    "#DAAD27": "orange",
    "#7F7D31": "green",
    "#2B5E2E": "green"
  },
  pops: ["#00ADEF", "#F285A5", "#7DC57F", "#F6EB16", "#F4EAE0"],
  colorSize: 20,
  selectedColorSize: 30
};

exports.shapes = {
  "line": {
    sprite: false
  },
  "circle": {
    sprite: true
  },
  "square": {
    sprite: true
  },
  "triangle": {
    sprite: false
  },
  "other": {
    sprite: false
  }
};

},{}],2:[function(require,module,exports){
/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.7';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined) {
            return;
        }
        if (handler === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (typeof define === 'function' && define.amd) {
    define(function() {
        return Hammer;
    });
} else if (typeof module != 'undefined' && module.exports) {
    module.exports = Hammer;
} else {
    window[exportName] = Hammer;
}

})(window, document, 'Hammer');

},{}],3:[function(require,module,exports){
(function (global){
/*!
 *  howler.js v2.0.2
 *  howlerjs.com
 *
 *  (c) 2013-2016, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {

  'use strict';

  /** Global Methods **/
  /***************************************************************************/

  /**
   * Create the global controller. All contained methods and properties apply
   * to all sounds that are currently playing or will be in the future.
   */
  var HowlerGlobal = function() {
    this.init();
  };
  HowlerGlobal.prototype = {
    /**
     * Initialize the global Howler object.
     * @return {Howler}
     */
    init: function() {
      var self = this || Howler;

      // Internal properties.
      self._codecs = {};
      self._howls = [];
      self._muted = false;
      self._volume = 1;
      self._canPlayEvent = 'canplaythrough';
      self._navigator = (typeof window !== 'undefined' && window.navigator) ? window.navigator : null;

      // Public properties.
      self.masterGain = null;
      self.noAudio = false;
      self.usingWebAudio = true;
      self.autoSuspend = true;
      self.ctx = null;

      // Set to false to disable the auto iOS enabler.
      self.mobileAutoEnable = true;

      // Setup the various state values for global tracking.
      self._setup();

      return self;
    },

    /**
     * Get/set the global volume for all sounds.
     * @param  {Float} vol Volume from 0.0 to 1.0.
     * @return {Howler/Float}     Returns self or current volume.
     */
    volume: function(vol) {
      var self = this || Howler;
      vol = parseFloat(vol);

      // If we don't have an AudioContext created yet, run the setup.
      if (!self.ctx) {
        setupAudioContext();
      }

      if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
        self._volume = vol;

        // Don't update any of the nodes if we are muted.
        if (self._muted) {
          return self;
        }

        // When using Web Audio, we just need to adjust the master gain.
        if (self.usingWebAudio) {
          self.masterGain.gain.value = vol;
        }

        // Loop through and change volume for all HTML5 audio nodes.
        for (var i=0; i<self._howls.length; i++) {
          if (!self._howls[i]._webAudio) {
            // Get all of the sounds in this Howl group.
            var ids = self._howls[i]._getSoundIds();

            // Loop through all sounds and change the volumes.
            for (var j=0; j<ids.length; j++) {
              var sound = self._howls[i]._soundById(ids[j]);

              if (sound && sound._node) {
                sound._node.volume = sound._volume * vol;
              }
            }
          }
        }

        return self;
      }

      return self._volume;
    },

    /**
     * Handle muting and unmuting globally.
     * @param  {Boolean} muted Is muted or not.
     */
    mute: function(muted) {
      var self = this || Howler;

      // If we don't have an AudioContext created yet, run the setup.
      if (!self.ctx) {
        setupAudioContext();
      }

      self._muted = muted;

      // With Web Audio, we just need to mute the master gain.
      if (self.usingWebAudio) {
        self.masterGain.gain.value = muted ? 0 : self._volume;
      }

      // Loop through and mute all HTML5 Audio nodes.
      for (var i=0; i<self._howls.length; i++) {
        if (!self._howls[i]._webAudio) {
          // Get all of the sounds in this Howl group.
          var ids = self._howls[i]._getSoundIds();

          // Loop through all sounds and mark the audio node as muted.
          for (var j=0; j<ids.length; j++) {
            var sound = self._howls[i]._soundById(ids[j]);

            if (sound && sound._node) {
              sound._node.muted = (muted) ? true : sound._muted;
            }
          }
        }
      }

      return self;
    },

    /**
     * Unload and destroy all currently loaded Howl objects.
     * @return {Howler}
     */
    unload: function() {
      var self = this || Howler;

      for (var i=self._howls.length-1; i>=0; i--) {
        self._howls[i].unload();
      }

      // Create a new AudioContext to make sure it is fully reset.
      if (self.usingWebAudio && self.ctx && typeof self.ctx.close !== 'undefined') {
        self.ctx.close();
        self.ctx = null;
        setupAudioContext();
      }

      return self;
    },

    /**
     * Check for codec support of specific extension.
     * @param  {String} ext Audio file extention.
     * @return {Boolean}
     */
    codecs: function(ext) {
      return (this || Howler)._codecs[ext.replace(/^x-/, '')];
    },

    /**
     * Setup various state values for global tracking.
     * @return {Howler}
     */
    _setup: function() {
      var self = this || Howler;

      // Keeps track of the suspend/resume state of the AudioContext.
      self.state = self.ctx ? self.ctx.state || 'running' : 'running';

      // Automatically begin the 30-second suspend process
      self._autoSuspend();

      // Check if audio is available.
      if (!self.usingWebAudio) {
        // No audio is available on this system if noAudio is set to true.
        if (typeof Audio !== 'undefined') {
          try {
            var test = new Audio();

            // Check if the canplaythrough event is available.
            if (typeof test.oncanplaythrough === 'undefined') {
              self._canPlayEvent = 'canplay';
            }
          } catch(e) {
            self.noAudio = true;
          }
        } else {
          self.noAudio = true;
        }
      }

      // Test to make sure audio isn't disabled in Internet Explorer.
      try {
        var test = new Audio();
        if (test.muted) {
          self.noAudio = true;
        }
      } catch (e) {}

      // Check for supported codecs.
      if (!self.noAudio) {
        self._setupCodecs();
      }

      return self;
    },

    /**
     * Check for browser support for various codecs and cache the results.
     * @return {Howler}
     */
    _setupCodecs: function() {
      var self = this || Howler;
      var audioTest = null;

      // Must wrap in a try/catch because IE11 in server mode throws an error.
      try {
        audioTest = (typeof Audio !== 'undefined') ? new Audio() : null;
      } catch (err) {
        return self;
      }

      if (!audioTest || typeof audioTest.canPlayType !== 'function') {
        return self;
      }

      var mpegTest = audioTest.canPlayType('audio/mpeg;').replace(/^no$/, '');

      // Opera version <33 has mixed MP3 support, so we need to check for and block it.
      var checkOpera = self._navigator && self._navigator.userAgent.match(/OPR\/([0-6].)/g);
      var isOldOpera = (checkOpera && parseInt(checkOpera[0].split('/')[1], 10) < 33);

      self._codecs = {
        mp3: !!(!isOldOpera && (mpegTest || audioTest.canPlayType('audio/mp3;').replace(/^no$/, ''))),
        mpeg: !!mpegTest,
        opus: !!audioTest.canPlayType('audio/ogg; codecs="opus"').replace(/^no$/, ''),
        ogg: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
        oga: !!audioTest.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ''),
        wav: !!audioTest.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ''),
        aac: !!audioTest.canPlayType('audio/aac;').replace(/^no$/, ''),
        caf: !!audioTest.canPlayType('audio/x-caf;').replace(/^no$/, ''),
        m4a: !!(audioTest.canPlayType('audio/x-m4a;') || audioTest.canPlayType('audio/m4a;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        mp4: !!(audioTest.canPlayType('audio/x-mp4;') || audioTest.canPlayType('audio/mp4;') || audioTest.canPlayType('audio/aac;')).replace(/^no$/, ''),
        weba: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
        webm: !!audioTest.canPlayType('audio/webm; codecs="vorbis"').replace(/^no$/, ''),
        dolby: !!audioTest.canPlayType('audio/mp4; codecs="ec-3"').replace(/^no$/, ''),
        flac: !!(audioTest.canPlayType('audio/x-flac;') || audioTest.canPlayType('audio/flac;')).replace(/^no$/, '')
      };

      return self;
    },

    /**
     * Mobile browsers will only allow audio to be played after a user interaction.
     * Attempt to automatically unlock audio on the first user interaction.
     * Concept from: http://paulbakaus.com/tutorials/html5/web-audio-on-ios/
     * @return {Howler}
     */
    _enableMobileAudio: function() {
      var self = this || Howler;

      // Only run this on mobile devices if audio isn't already eanbled.
      var isMobile = /iPhone|iPad|iPod|Android|BlackBerry|BB10|Silk|Mobi/i.test(self._navigator && self._navigator.userAgent);
      var isTouch = !!(('ontouchend' in window) || (self._navigator && self._navigator.maxTouchPoints > 0) || (self._navigator && self._navigator.msMaxTouchPoints > 0));
      if (self._mobileEnabled || !self.ctx || (!isMobile && !isTouch)) {
        return;
      }

      self._mobileEnabled = false;

      // Some mobile devices/platforms have distortion issues when opening/closing tabs and/or web views.
      // Bugs in the browser (especially Mobile Safari) can cause the sampleRate to change from 44100 to 48000.
      // By calling Howler.unload(), we create a new AudioContext with the correct sampleRate.
      if (!self._mobileUnloaded && self.ctx.sampleRate !== 44100) {
        self._mobileUnloaded = true;
        self.unload();
      }

      // Scratch buffer for enabling iOS to dispose of web audio buffers correctly, as per:
      // http://stackoverflow.com/questions/24119684
      self._scratchBuffer = self.ctx.createBuffer(1, 1, 22050);

      // Call this method on touch start to create and play a buffer,
      // then check if the audio actually played to determine if
      // audio has now been unlocked on iOS, Android, etc.
      var unlock = function() {
        // Create an empty buffer.
        var source = self.ctx.createBufferSource();
        source.buffer = self._scratchBuffer;
        source.connect(self.ctx.destination);

        // Play the empty buffer.
        if (typeof source.start === 'undefined') {
          source.noteOn(0);
        } else {
          source.start(0);
        }

        // Setup a timeout to check that we are unlocked on the next event loop.
        source.onended = function() {
          source.disconnect(0);

          // Update the unlocked state and prevent this check from happening again.
          self._mobileEnabled = true;
          self.mobileAutoEnable = false;

          // Remove the touch start listener.
          document.removeEventListener('touchend', unlock, true);
        };
      };

      // Setup a touch start listener to attempt an unlock in.
      document.addEventListener('touchend', unlock, true);

      return self;
    },

    /**
     * Automatically suspend the Web Audio AudioContext after no sound has played for 30 seconds.
     * This saves processing/energy and fixes various browser-specific bugs with audio getting stuck.
     * @return {Howler}
     */
    _autoSuspend: function() {
      var self = this;

      if (!self.autoSuspend || !self.ctx || typeof self.ctx.suspend === 'undefined' || !Howler.usingWebAudio) {
        return;
      }

      // Check if any sounds are playing.
      for (var i=0; i<self._howls.length; i++) {
        if (self._howls[i]._webAudio) {
          for (var j=0; j<self._howls[i]._sounds.length; j++) {
            if (!self._howls[i]._sounds[j]._paused) {
              return self;
            }
          }
        }
      }

      if (self._suspendTimer) {
        clearTimeout(self._suspendTimer);
      }

      // If no sound has played after 30 seconds, suspend the context.
      self._suspendTimer = setTimeout(function() {
        if (!self.autoSuspend) {
          return;
        }

        self._suspendTimer = null;
        self.state = 'suspending';
        self.ctx.suspend().then(function() {
          self.state = 'suspended';

          if (self._resumeAfterSuspend) {
            delete self._resumeAfterSuspend;
            self._autoResume();
          }
        });
      }, 30000);

      return self;
    },

    /**
     * Automatically resume the Web Audio AudioContext when a new sound is played.
     * @return {Howler}
     */
    _autoResume: function() {
      var self = this;

      if (!self.ctx || typeof self.ctx.resume === 'undefined' || !Howler.usingWebAudio) {
        return;
      }

      if (self.state === 'running' && self._suspendTimer) {
        clearTimeout(self._suspendTimer);
        self._suspendTimer = null;
      } else if (self.state === 'suspended') {
        self.state = 'resuming';
        self.ctx.resume().then(function() {
          self.state = 'running';

          // Emit to all Howls that the audio has resumed.
          for (var i=0; i<self._howls.length; i++) {
            self._howls[i]._emit('resume');
          }
        });

        if (self._suspendTimer) {
          clearTimeout(self._suspendTimer);
          self._suspendTimer = null;
        }
      } else if (self.state === 'suspending') {
        self._resumeAfterSuspend = true;
      }

      return self;
    }
  };

  // Setup the global audio controller.
  var Howler = new HowlerGlobal();

  /** Group Methods **/
  /***************************************************************************/

  /**
   * Create an audio group controller.
   * @param {Object} o Passed in properties for this group.
   */
  var Howl = function(o) {
    var self = this;

    // Throw an error if no source is provided.
    if (!o.src || o.src.length === 0) {
      console.error('An array of source files must be passed with any new Howl.');
      return;
    }

    self.init(o);
  };
  Howl.prototype = {
    /**
     * Initialize a new Howl group object.
     * @param  {Object} o Passed in properties for this group.
     * @return {Howl}
     */
    init: function(o) {
      var self = this;

      // If we don't have an AudioContext created yet, run the setup.
      if (!Howler.ctx) {
        setupAudioContext();
      }

      // Setup user-defined default properties.
      self._autoplay = o.autoplay || false;
      self._format = (typeof o.format !== 'string') ? o.format : [o.format];
      self._html5 = o.html5 || false;
      self._muted = o.mute || false;
      self._loop = o.loop || false;
      self._pool = o.pool || 5;
      self._preload = (typeof o.preload === 'boolean') ? o.preload : true;
      self._rate = o.rate || 1;
      self._sprite = o.sprite || {};
      self._src = (typeof o.src !== 'string') ? o.src : [o.src];
      self._volume = o.volume !== undefined ? o.volume : 1;

      // Setup all other default properties.
      self._duration = 0;
      self._state = 'unloaded';
      self._sounds = [];
      self._endTimers = {};
      self._queue = [];

      // Setup event listeners.
      self._onend = o.onend ? [{fn: o.onend}] : [];
      self._onfade = o.onfade ? [{fn: o.onfade}] : [];
      self._onload = o.onload ? [{fn: o.onload}] : [];
      self._onloaderror = o.onloaderror ? [{fn: o.onloaderror}] : [];
      self._onpause = o.onpause ? [{fn: o.onpause}] : [];
      self._onplay = o.onplay ? [{fn: o.onplay}] : [];
      self._onstop = o.onstop ? [{fn: o.onstop}] : [];
      self._onmute = o.onmute ? [{fn: o.onmute}] : [];
      self._onvolume = o.onvolume ? [{fn: o.onvolume}] : [];
      self._onrate = o.onrate ? [{fn: o.onrate}] : [];
      self._onseek = o.onseek ? [{fn: o.onseek}] : [];
      self._onresume = [];

      // Web Audio or HTML5 Audio?
      self._webAudio = Howler.usingWebAudio && !self._html5;

      // Automatically try to enable audio on iOS.
      if (typeof Howler.ctx !== 'undefined' && Howler.ctx && Howler.mobileAutoEnable) {
        Howler._enableMobileAudio();
      }

      // Keep track of this Howl group in the global controller.
      Howler._howls.push(self);

      // If they selected autoplay, add a play event to the load queue.
      if (self._autoplay) {
        self._queue.push({
          event: 'play',
          action: function() {
            self.play();
          }
        });
      }

      // Load the source file unless otherwise specified.
      if (self._preload) {
        self.load();
      }

      return self;
    },

    /**
     * Load the audio file.
     * @return {Howler}
     */
    load: function() {
      var self = this;
      var url = null;

      // If no audio is available, quit immediately.
      if (Howler.noAudio) {
        self._emit('loaderror', null, 'No audio support.');
        return;
      }

      // Make sure our source is in an array.
      if (typeof self._src === 'string') {
        self._src = [self._src];
      }

      // Loop through the sources and pick the first one that is compatible.
      for (var i=0; i<self._src.length; i++) {
        var ext, str;

        if (self._format && self._format[i]) {
          // If an extension was specified, use that instead.
          ext = self._format[i];
        } else {
          // Make sure the source is a string.
          str = self._src[i];
          if (typeof str !== 'string') {
            self._emit('loaderror', null, 'Non-string found in selected audio sources - ignoring.');
            continue;
          }

          // Extract the file extension from the URL or base64 data URI.
          ext = /^data:audio\/([^;,]+);/i.exec(str);
          if (!ext) {
            ext = /\.([^.]+)$/.exec(str.split('?', 1)[0]);
          }

          if (ext) {
            ext = ext[1].toLowerCase();
          }
        }

        // Check if this extension is available.
        if (Howler.codecs(ext)) {
          url = self._src[i];
          break;
        }
      }

      if (!url) {
        self._emit('loaderror', null, 'No codec support for selected audio sources.');
        return;
      }

      self._src = url;
      self._state = 'loading';

      // If the hosting page is HTTPS and the source isn't,
      // drop down to HTML5 Audio to avoid Mixed Content errors.
      if (window.location.protocol === 'https:' && url.slice(0, 5) === 'http:') {
        self._html5 = true;
        self._webAudio = false;
      }

      // Create a new sound object and add it to the pool.
      new Sound(self);

      // Load and decode the audio data for playback.
      if (self._webAudio) {
        loadBuffer(self);
      }

      return self;
    },

    /**
     * Play a sound or resume previous playback.
     * @param  {String/Number} sprite   Sprite name for sprite playback or sound id to continue previous.
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Number}          Sound ID.
     */
    play: function(sprite, internal) {
      var self = this;
      var id = null;

      // Determine if a sprite, sound id or nothing was passed
      if (typeof sprite === 'number') {
        id = sprite;
        sprite = null;
      } else if (typeof sprite === 'string' && self._state === 'loaded' && !self._sprite[sprite]) {
        // If the passed sprite doesn't exist, do nothing.
        return null;
      } else if (typeof sprite === 'undefined') {
        // Use the default sound sprite (plays the full audio length).
        sprite = '__default';

        // Check if there is a single paused sound that isn't ended.
        // If there is, play that sound. If not, continue as usual.
        var num = 0;
        for (var i=0; i<self._sounds.length; i++) {
          if (self._sounds[i]._paused && !self._sounds[i]._ended) {
            num++;
            id = self._sounds[i]._id;
          }
        }

        if (num === 1) {
          sprite = null;
        } else {
          id = null;
        }
      }

      // Get the selected node, or get one from the pool.
      var sound = id ? self._soundById(id) : self._inactiveSound();

      // If the sound doesn't exist, do nothing.
      if (!sound) {
        return null;
      }

      // Select the sprite definition.
      if (id && !sprite) {
        sprite = sound._sprite || '__default';
      }

      // If we have no sprite and the sound hasn't loaded, we must wait
      // for the sound to load to get our audio's duration.
      if (self._state !== 'loaded' && !self._sprite[sprite]) {
        self._queue.push({
          event: 'play',
          action: function() {
            self.play(self._soundById(sound._id) ? sound._id : undefined);
          }
        });

        return sound._id;
      }

      // Don't play the sound if an id was passed and it is already playing.
      if (id && !sound._paused) {
        // Trigger the play event, in order to keep iterating through queue.
        if (!internal) {
          setTimeout(function() {
            self._emit('play', sound._id);
          }, 0);
        }

        return sound._id;
      }

      // Make sure the AudioContext isn't suspended, and resume it if it is.
      if (self._webAudio) {
        Howler._autoResume();
      }

      // Determine how long to play for and where to start playing.
      var seek = Math.max(0, sound._seek > 0 ? sound._seek : self._sprite[sprite][0] / 1000);
      var duration = Math.max(0, ((self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000) - seek);
      var timeout = (duration * 1000) / Math.abs(sound._rate);

      // Update the parameters of the sound
      sound._paused = false;
      sound._ended = false;
      sound._sprite = sprite;
      sound._seek = seek;
      sound._start = self._sprite[sprite][0] / 1000;
      sound._stop = (self._sprite[sprite][0] + self._sprite[sprite][1]) / 1000;
      sound._loop = !!(sound._loop || self._sprite[sprite][2]);

      // Begin the actual playback.
      var node = sound._node;
      if (self._webAudio) {
        // Fire this when the sound is ready to play to begin Web Audio playback.
        var playWebAudio = function() {
          self._refreshBuffer(sound);

          // Setup the playback params.
          var vol = (sound._muted || self._muted) ? 0 : sound._volume;
          node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
          sound._playStart = Howler.ctx.currentTime;

          // Play the sound using the supported method.
          if (typeof node.bufferSource.start === 'undefined') {
            sound._loop ? node.bufferSource.noteGrainOn(0, seek, 86400) : node.bufferSource.noteGrainOn(0, seek, duration);
          } else {
            sound._loop ? node.bufferSource.start(0, seek, 86400) : node.bufferSource.start(0, seek, duration);
          }

          // Start a new timer if none is present.
          if (timeout !== Infinity) {
            self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
          }

          if (!internal) {
            setTimeout(function() {
              self._emit('play', sound._id);
            }, 0);
          }
        };

        var isRunning = (Howler.state === 'running');
        if (self._state === 'loaded' && isRunning) {
          playWebAudio();
        } else {
          // Wait for the audio to load and then begin playback.
          self.once(isRunning ? 'load' : 'resume', playWebAudio, isRunning ? sound._id : null);

          // Cancel the end timer.
          self._clearTimer(sound._id);
        }
      } else {
        // Fire this when the sound is ready to play to begin HTML5 Audio playback.
        var playHtml5 = function() {
          node.currentTime = seek;
          node.muted = sound._muted || self._muted || Howler._muted || node.muted;
          node.volume = sound._volume * Howler.volume();
          node.playbackRate = sound._rate;

          setTimeout(function() {
            node.play();

            // Setup the new end timer.
            if (timeout !== Infinity) {
              self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
            }

            if (!internal) {
              self._emit('play', sound._id);
            }
          }, 0);
        };

        // Play immediately if ready, or wait for the 'canplaythrough'e vent.
        var loadedNoReadyState = (self._state === 'loaded' && (window && window.ejecta || !node.readyState && Howler._navigator.isCocoonJS));
        if (node.readyState === 4 || loadedNoReadyState) {
          playHtml5();
        } else {
          var listener = function() {
            // Begin playback.
            playHtml5();

            // Clear this listener.
            node.removeEventListener(Howler._canPlayEvent, listener, false);
          };
          node.addEventListener(Howler._canPlayEvent, listener, false);

          // Cancel the end timer.
          self._clearTimer(sound._id);
        }
      }

      return sound._id;
    },

    /**
     * Pause playback and save current position.
     * @param  {Number} id The sound ID (empty to pause all in group).
     * @return {Howl}
     */
    pause: function(id) {
      var self = this;

      // If the sound hasn't loaded, add it to the load queue to pause when capable.
      if (self._state !== 'loaded') {
        self._queue.push({
          event: 'pause',
          action: function() {
            self.pause(id);
          }
        });

        return self;
      }

      // If no id is passed, get all ID's to be paused.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Clear the end timer.
        self._clearTimer(ids[i]);

        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound && !sound._paused) {
          // Reset the seek position.
          sound._seek = self.seek(ids[i]);
          sound._rateSeek = 0;
          sound._paused = true;

          // Stop currently running fades.
          self._stopFade(ids[i]);

          if (sound._node) {
            if (self._webAudio) {
              // make sure the sound has been created
              if (!sound._node.bufferSource) {
                return self;
              }

              if (typeof sound._node.bufferSource.stop === 'undefined') {
                sound._node.bufferSource.noteOff(0);
              } else {
                sound._node.bufferSource.stop(0);
              }

              // Clean up the buffer source.
              self._cleanBuffer(sound._node);
            } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
              sound._node.pause();
            }
          }
        }

        // Fire the pause event, unless `true` is passed as the 2nd argument.
        if (!arguments[1]) {
          self._emit('pause', sound ? sound._id : null);
        }
      }

      return self;
    },

    /**
     * Stop playback and reset to start.
     * @param  {Number} id The sound ID (empty to stop all in group).
     * @param  {Boolean} internal Internal Use: true prevents event firing.
     * @return {Howl}
     */
    stop: function(id, internal) {
      var self = this;

      // If the sound hasn't loaded, add it to the load queue to stop when capable.
      if (self._state !== 'loaded') {
        self._queue.push({
          event: 'stop',
          action: function() {
            self.stop(id);
          }
        });

        return self;
      }

      // If no id is passed, get all ID's to be stopped.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Clear the end timer.
        self._clearTimer(ids[i]);

        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound) {
          // Reset the seek position.
          sound._seek = sound._start || 0;
          sound._rateSeek = 0;
          sound._paused = true;
          sound._ended = true;

          // Stop currently running fades.
          self._stopFade(ids[i]);

          if (sound._node) {
            if (self._webAudio) {
              // make sure the sound has been created
              if (!sound._node.bufferSource) {
                if (!internal) {
                  self._emit('stop', sound._id);
                }

                return self;
              }

              if (typeof sound._node.bufferSource.stop === 'undefined') {
                sound._node.bufferSource.noteOff(0);
              } else {
                sound._node.bufferSource.stop(0);
              }

              // Clean up the buffer source.
              self._cleanBuffer(sound._node);
            } else if (!isNaN(sound._node.duration) || sound._node.duration === Infinity) {
              sound._node.currentTime = sound._start || 0;
              sound._node.pause();
            }
          }
        }

        if (sound && !internal) {
          self._emit('stop', sound._id);
        }
      }

      return self;
    },

    /**
     * Mute/unmute a single sound or all sounds in this Howl group.
     * @param  {Boolean} muted Set to true to mute and false to unmute.
     * @param  {Number} id    The sound ID to update (omit to mute/unmute all).
     * @return {Howl}
     */
    mute: function(muted, id) {
      var self = this;

      // If the sound hasn't loaded, add it to the load queue to mute when capable.
      if (self._state !== 'loaded') {
        self._queue.push({
          event: 'mute',
          action: function() {
            self.mute(muted, id);
          }
        });

        return self;
      }

      // If applying mute/unmute to all sounds, update the group's value.
      if (typeof id === 'undefined') {
        if (typeof muted === 'boolean') {
          self._muted = muted;
        } else {
          return self._muted;
        }
      }

      // If no id is passed, get all ID's to be muted.
      var ids = self._getSoundIds(id);

      for (var i=0; i<ids.length; i++) {
        // Get the sound.
        var sound = self._soundById(ids[i]);

        if (sound) {
          sound._muted = muted;

          if (self._webAudio && sound._node) {
            sound._node.gain.setValueAtTime(muted ? 0 : sound._volume, Howler.ctx.currentTime);
          } else if (sound._node) {
            sound._node.muted = Howler._muted ? true : muted;
          }

          self._emit('mute', sound._id);
        }
      }

      return self;
    },

    /**
     * Get/set the volume of this sound or of the Howl group. This method can optionally take 0, 1 or 2 arguments.
     *   volume() -> Returns the group's volume value.
     *   volume(id) -> Returns the sound id's current volume.
     *   volume(vol) -> Sets the volume of all sounds in this Howl group.
     *   volume(vol, id) -> Sets the volume of passed sound id.
     * @return {Howl/Number} Returns self or current volume.
     */
    volume: function() {
      var self = this;
      var args = arguments;
      var vol, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // Return the value of the groups' volume.
        return self._volume;
      } else if (args.length === 1 || args.length === 2 && typeof args[1] === 'undefined') {
        // First check if this is an ID, and if not, assume it is a new volume.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else {
          vol = parseFloat(args[0]);
        }
      } else if (args.length >= 2) {
        vol = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // Update the volume or return the current volume.
      var sound;
      if (typeof vol !== 'undefined' && vol >= 0 && vol <= 1) {
        // If the sound hasn't loaded, add it to the load queue to change volume when capable.
        if (self._state !== 'loaded') {
          self._queue.push({
            event: 'volume',
            action: function() {
              self.volume.apply(self, args);
            }
          });

          return self;
        }

        // Set the group volume.
        if (typeof id === 'undefined') {
          self._volume = vol;
        }

        // Update one or all volumes.
        id = self._getSoundIds(id);
        for (var i=0; i<id.length; i++) {
          // Get the sound.
          sound = self._soundById(id[i]);

          if (sound) {
            sound._volume = vol;

            // Stop currently running fades.
            if (!args[2]) {
              self._stopFade(id[i]);
            }

            if (self._webAudio && sound._node && !sound._muted) {
              sound._node.gain.setValueAtTime(vol, Howler.ctx.currentTime);
            } else if (sound._node && !sound._muted) {
              sound._node.volume = vol * Howler.volume();
            }

            self._emit('volume', sound._id);
          }
        }
      } else {
        sound = id ? self._soundById(id) : self._sounds[0];
        return sound ? sound._volume : 0;
      }

      return self;
    },

    /**
     * Fade a currently playing sound between two volumes (if no id is passsed, all sounds will fade).
     * @param  {Number} from The value to fade from (0.0 to 1.0).
     * @param  {Number} to   The volume to fade to (0.0 to 1.0).
     * @param  {Number} len  Time in milliseconds to fade.
     * @param  {Number} id   The sound id (omit to fade all sounds).
     * @return {Howl}
     */
    fade: function(from, to, len, id) {
      var self = this;
      var diff = Math.abs(from - to);
      var dir = from > to ? 'out' : 'in';
      var steps = diff / 0.01;
      var stepLen = (steps > 0) ? len / steps : len;

      // Since browsers clamp timeouts to 4ms, we need to clamp our steps to that too.
      if (stepLen < 4) {
        steps = Math.ceil(steps / (4 / stepLen));
        stepLen = 4;
      }

      // If the sound hasn't loaded, add it to the load queue to fade when capable.
      if (self._state !== 'loaded') {
        self._queue.push({
          event: 'fade',
          action: function() {
            self.fade(from, to, len, id);
          }
        });

        return self;
      }

      // Set the volume to the start position.
      self.volume(from, id);

      // Fade the volume of one or all sounds.
      var ids = self._getSoundIds(id);
      for (var i=0; i<ids.length; i++) {
        // Get the sound.
        var sound = self._soundById(ids[i]);

        // Create a linear fade or fall back to timeouts with HTML5 Audio.
        if (sound) {
          // Stop the previous fade if no sprite is being used (otherwise, volume handles this).
          if (!id) {
            self._stopFade(ids[i]);
          }

          // If we are using Web Audio, let the native methods do the actual fade.
          if (self._webAudio && !sound._muted) {
            var currentTime = Howler.ctx.currentTime;
            var end = currentTime + (len / 1000);
            sound._volume = from;
            sound._node.gain.setValueAtTime(from, currentTime);
            sound._node.gain.linearRampToValueAtTime(to, end);
          }

          var vol = from;
          sound._interval = setInterval(function(soundId, sound) {
            // Update the volume amount, but only if the volume should change.
            if (steps > 0) {
              vol += (dir === 'in' ? 0.01 : -0.01);
            }

            // Make sure the volume is in the right bounds.
            vol = Math.max(0, vol);
            vol = Math.min(1, vol);

            // Round to within 2 decimal points.
            vol = Math.round(vol * 100) / 100;

            // Change the volume.
            if (self._webAudio) {
              if (typeof id === 'undefined') {
                self._volume = vol;
              }

              sound._volume = vol;
            } else {
              self.volume(vol, soundId, true);
            }

            // When the fade is complete, stop it and fire event.
            if (vol === to) {
              clearInterval(sound._interval);
              sound._interval = null;
              self.volume(vol, soundId);
              self._emit('fade', soundId);
            }
          }.bind(self, ids[i], sound), stepLen);
        }
      }

      return self;
    },

    /**
     * Internal method that stops the currently playing fade when
     * a new fade starts, volume is changed or the sound is stopped.
     * @param  {Number} id The sound id.
     * @return {Howl}
     */
    _stopFade: function(id) {
      var self = this;
      var sound = self._soundById(id);

      if (sound && sound._interval) {
        if (self._webAudio) {
          sound._node.gain.cancelScheduledValues(Howler.ctx.currentTime);
        }

        clearInterval(sound._interval);
        sound._interval = null;
        self._emit('fade', id);
      }

      return self;
    },

    /**
     * Get/set the loop parameter on a sound. This method can optionally take 0, 1 or 2 arguments.
     *   loop() -> Returns the group's loop value.
     *   loop(id) -> Returns the sound id's loop value.
     *   loop(loop) -> Sets the loop value for all sounds in this Howl group.
     *   loop(loop, id) -> Sets the loop value of passed sound id.
     * @return {Howl/Boolean} Returns self or current loop value.
     */
    loop: function() {
      var self = this;
      var args = arguments;
      var loop, id, sound;

      // Determine the values for loop and id.
      if (args.length === 0) {
        // Return the grou's loop value.
        return self._loop;
      } else if (args.length === 1) {
        if (typeof args[0] === 'boolean') {
          loop = args[0];
          self._loop = loop;
        } else {
          // Return this sound's loop value.
          sound = self._soundById(parseInt(args[0], 10));
          return sound ? sound._loop : false;
        }
      } else if (args.length === 2) {
        loop = args[0];
        id = parseInt(args[1], 10);
      }

      // If no id is passed, get all ID's to be looped.
      var ids = self._getSoundIds(id);
      for (var i=0; i<ids.length; i++) {
        sound = self._soundById(ids[i]);

        if (sound) {
          sound._loop = loop;
          if (self._webAudio && sound._node && sound._node.bufferSource) {
            sound._node.bufferSource.loop = loop;
            if (loop) {
              sound._node.bufferSource.loopStart = sound._start || 0;
              sound._node.bufferSource.loopEnd = sound._stop;
            }
          }
        }
      }

      return self;
    },

    /**
     * Get/set the playback rate of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   rate() -> Returns the first sound node's current playback rate.
     *   rate(id) -> Returns the sound id's current playback rate.
     *   rate(rate) -> Sets the playback rate of all sounds in this Howl group.
     *   rate(rate, id) -> Sets the playback rate of passed sound id.
     * @return {Howl/Number} Returns self or the current playback rate.
     */
    rate: function() {
      var self = this;
      var args = arguments;
      var rate, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // We will simply return the current rate of the first node.
        id = self._sounds[0]._id;
      } else if (args.length === 1) {
        // First check if this is an ID, and if not, assume it is a new rate value.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else {
          rate = parseFloat(args[0]);
        }
      } else if (args.length === 2) {
        rate = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // Update the playback rate or return the current value.
      var sound;
      if (typeof rate === 'number') {
        // If the sound hasn't loaded, add it to the load queue to change playback rate when capable.
        if (self._state !== 'loaded') {
          self._queue.push({
            event: 'rate',
            action: function() {
              self.rate.apply(self, args);
            }
          });

          return self;
        }

        // Set the group rate.
        if (typeof id === 'undefined') {
          self._rate = rate;
        }

        // Update one or all volumes.
        id = self._getSoundIds(id);
        for (var i=0; i<id.length; i++) {
          // Get the sound.
          sound = self._soundById(id[i]);

          if (sound) {
            // Keep track of our position when the rate changed and update the playback
            // start position so we can properly adjust the seek position for time elapsed.
            sound._rateSeek = self.seek(id[i]);
            sound._playStart = self._webAudio ? Howler.ctx.currentTime : sound._playStart;
            sound._rate = rate;

            // Change the playback rate.
            if (self._webAudio && sound._node && sound._node.bufferSource) {
              sound._node.bufferSource.playbackRate.value = rate;
            } else if (sound._node) {
              sound._node.playbackRate = rate;
            }

            // Reset the timers.
            var seek = self.seek(id[i]);
            var duration = ((self._sprite[sound._sprite][0] + self._sprite[sound._sprite][1]) / 1000) - seek;
            var timeout = (duration * 1000) / Math.abs(sound._rate);

            // Start a new end timer if sound is already playing.
            if (self._endTimers[id[i]] || !sound._paused) {
              self._clearTimer(id[i]);
              self._endTimers[id[i]] = setTimeout(self._ended.bind(self, sound), timeout);
            }

            self._emit('rate', sound._id);
          }
        }
      } else {
        sound = self._soundById(id);
        return sound ? sound._rate : self._rate;
      }

      return self;
    },

    /**
     * Get/set the seek position of a sound. This method can optionally take 0, 1 or 2 arguments.
     *   seek() -> Returns the first sound node's current seek position.
     *   seek(id) -> Returns the sound id's current seek position.
     *   seek(seek) -> Sets the seek position of the first sound node.
     *   seek(seek, id) -> Sets the seek position of passed sound id.
     * @return {Howl/Number} Returns self or the current seek position.
     */
    seek: function() {
      var self = this;
      var args = arguments;
      var seek, id;

      // Determine the values based on arguments.
      if (args.length === 0) {
        // We will simply return the current position of the first node.
        id = self._sounds[0]._id;
      } else if (args.length === 1) {
        // First check if this is an ID, and if not, assume it is a new seek position.
        var ids = self._getSoundIds();
        var index = ids.indexOf(args[0]);
        if (index >= 0) {
          id = parseInt(args[0], 10);
        } else {
          id = self._sounds[0]._id;
          seek = parseFloat(args[0]);
        }
      } else if (args.length === 2) {
        seek = parseFloat(args[0]);
        id = parseInt(args[1], 10);
      }

      // If there is no ID, bail out.
      if (typeof id === 'undefined') {
        return self;
      }

      // If the sound hasn't loaded, add it to the load queue to seek when capable.
      if (self._state !== 'loaded') {
        self._queue.push({
          event: 'seek',
          action: function() {
            self.seek.apply(self, args);
          }
        });

        return self;
      }

      // Get the sound.
      var sound = self._soundById(id);

      if (sound) {
        if (typeof seek === 'number' && seek >= 0) {
          // Pause the sound and update position for restarting playback.
          var playing = self.playing(id);
          if (playing) {
            self.pause(id, true);
          }

          // Move the position of the track and cancel timer.
          sound._seek = seek;
          sound._ended = false;
          self._clearTimer(id);

          // Restart the playback if the sound was playing.
          if (playing) {
            self.play(id, true);
          }

          // Update the seek position for HTML5 Audio.
          if (!self._webAudio && sound._node) {
            sound._node.currentTime = seek;
          }

          self._emit('seek', id);
        } else {
          if (self._webAudio) {
            var realTime = self.playing(id) ? Howler.ctx.currentTime - sound._playStart : 0;
            var rateSeek = sound._rateSeek ? sound._rateSeek - sound._seek : 0;
            return sound._seek + (rateSeek + realTime * Math.abs(sound._rate));
          } else {
            return sound._node.currentTime;
          }
        }
      }

      return self;
    },

    /**
     * Check if a specific sound is currently playing or not (if id is provided), or check if at least one of the sounds in the group is playing or not.
     * @param  {Number}  id The sound id to check. If none is passed, the whole sound group is checked.
     * @return {Boolean} True if playing and false if not.
     */
    playing: function(id) {
      var self = this;

      // Check the passed sound ID (if any).
      if (typeof id === 'number') {
        var sound = self._soundById(id);
        return sound ? !sound._paused : false;
      }

      // Otherwise, loop through all sounds and check if any are playing.
      for (var i=0; i<self._sounds.length; i++) {
        if (!self._sounds[i]._paused) {
          return true;
        }
      }

      return false;
    },

    /**
     * Get the duration of this sound. Passing a sound id will return the sprite duration.
     * @param  {Number} id The sound id to check. If none is passed, return full source duration.
     * @return {Number} Audio duration in seconds.
     */
    duration: function(id) {
      var self = this;
      var duration = self._duration;

      // If we pass an ID, get the sound and return the sprite length.
      var sound = self._soundById(id);
      if (sound) {
        duration = self._sprite[sound._sprite][1] / 1000;
      }

      return duration;
    },

    /**
     * Returns the current loaded state of this Howl.
     * @return {String} 'unloaded', 'loading', 'loaded'
     */
    state: function() {
      return this._state;
    },

    /**
     * Unload and destroy the current Howl object.
     * This will immediately stop all sound instances attached to this group.
     */
    unload: function() {
      var self = this;

      // Stop playing any active sounds.
      var sounds = self._sounds;
      for (var i=0; i<sounds.length; i++) {
        // Stop the sound if it is currently playing.
        if (!sounds[i]._paused) {
          self.stop(sounds[i]._id);
          self._emit('end', sounds[i]._id);
        }

        // Remove the source or disconnect.
        if (!self._webAudio) {
          // Set the source to 0-second silence to stop any downloading.
          sounds[i]._node.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=';

          // Remove any event listeners.
          sounds[i]._node.removeEventListener('error', sounds[i]._errorFn, false);
          sounds[i]._node.removeEventListener(Howler._canPlayEvent, sounds[i]._loadFn, false);
        }

        // Empty out all of the nodes.
        delete sounds[i]._node;

        // Make sure all timers are cleared out.
        self._clearTimer(sounds[i]._id);

        // Remove the references in the global Howler object.
        var index = Howler._howls.indexOf(self);
        if (index >= 0) {
          Howler._howls.splice(index, 1);
        }
      }

      // Delete this sound from the cache (if no other Howl is using it).
      var remCache = true;
      for (i=0; i<Howler._howls.length; i++) {
        if (Howler._howls[i]._src === self._src) {
          remCache = false;
          break;
        }
      }

      if (cache && remCache) {
        delete cache[self._src];
      }

      // Clear global errors.
      Howler.noAudio = false;

      // Clear out `self`.
      self._state = 'unloaded';
      self._sounds = [];
      self = null;

      return null;
    },

    /**
     * Listen to a custom event.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @param  {Number}   once  (INTERNAL) Marks event to fire only once.
     * @return {Howl}
     */
    on: function(event, fn, id, once) {
      var self = this;
      var events = self['_on' + event];

      if (typeof fn === 'function') {
        events.push(once ? {id: id, fn: fn, once: once} : {id: id, fn: fn});
      }

      return self;
    },

    /**
     * Remove a custom event. Call without parameters to remove all events.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to remove. Leave empty to remove all.
     * @param  {Number}   id    (optional) Only remove events for this sound.
     * @return {Howl}
     */
    off: function(event, fn, id) {
      var self = this;
      var events = self['_on' + event];
      var i = 0;

      if (fn) {
        // Loop through event store and remove the passed function.
        for (i=0; i<events.length; i++) {
          if (fn === events[i].fn && id === events[i].id) {
            events.splice(i, 1);
            break;
          }
        }
      } else if (event) {
        // Clear out all events of this type.
        self['_on' + event] = [];
      } else {
        // Clear out all events of every type.
        var keys = Object.keys(self);
        for (i=0; i<keys.length; i++) {
          if ((keys[i].indexOf('_on') === 0) && Array.isArray(self[keys[i]])) {
            self[keys[i]] = [];
          }
        }
      }

      return self;
    },

    /**
     * Listen to a custom event and remove it once fired.
     * @param  {String}   event Event name.
     * @param  {Function} fn    Listener to call.
     * @param  {Number}   id    (optional) Only listen to events for this sound.
     * @return {Howl}
     */
    once: function(event, fn, id) {
      var self = this;

      // Setup the event listener.
      self.on(event, fn, id, 1);

      return self;
    },

    /**
     * Emit all events of a specific type and pass the sound id.
     * @param  {String} event Event name.
     * @param  {Number} id    Sound ID.
     * @param  {Number} msg   Message to go with event.
     * @return {Howl}
     */
    _emit: function(event, id, msg) {
      var self = this;
      var events = self['_on' + event];

      // Loop through event store and fire all functions.
      for (var i=events.length-1; i>=0; i--) {
        if (!events[i].id || events[i].id === id || event === 'load') {
          setTimeout(function(fn) {
            fn.call(this, id, msg);
          }.bind(self, events[i].fn), 0);

          // If this event was setup with `once`, remove it.
          if (events[i].once) {
            self.off(event, events[i].fn, events[i].id);
          }
        }
      }

      return self;
    },

    /**
     * Queue of actions initiated before the sound has loaded.
     * These will be called in sequence, with the next only firing
     * after the previous has finished executing (even if async like play).
     * @return {Howl}
     */
    _loadQueue: function() {
      var self = this;

      if (self._queue.length > 0) {
        var task = self._queue[0];

        // don't move onto the next task until this one is done
        self.once(task.event, function() {
          self._queue.shift();
          self._loadQueue();
        });

        task.action();
      }

      return self;
    },

    /**
     * Fired when playback ends at the end of the duration.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */
    _ended: function(sound) {
      var self = this;
      var sprite = sound._sprite;

      // Should this sound loop?
      var loop = !!(sound._loop || self._sprite[sprite][2]);

      // Fire the ended event.
      self._emit('end', sound._id);

      // Restart the playback for HTML5 Audio loop.
      if (!self._webAudio && loop) {
        self.stop(sound._id, true).play(sound._id);
      }

      // Restart this timer if on a Web Audio loop.
      if (self._webAudio && loop) {
        self._emit('play', sound._id);
        sound._seek = sound._start || 0;
        sound._rateSeek = 0;
        sound._playStart = Howler.ctx.currentTime;

        var timeout = ((sound._stop - sound._start) * 1000) / Math.abs(sound._rate);
        self._endTimers[sound._id] = setTimeout(self._ended.bind(self, sound), timeout);
      }

      // Mark the node as paused.
      if (self._webAudio && !loop) {
        sound._paused = true;
        sound._ended = true;
        sound._seek = sound._start || 0;
        sound._rateSeek = 0;
        self._clearTimer(sound._id);

        // Clean up the buffer source.
        self._cleanBuffer(sound._node);

        // Attempt to auto-suspend AudioContext if no sounds are still playing.
        Howler._autoSuspend();
      }

      // When using a sprite, end the track.
      if (!self._webAudio && !loop) {
        self.stop(sound._id);
      }

      return self;
    },

    /**
     * Clear the end timer for a sound playback.
     * @param  {Number} id The sound ID.
     * @return {Howl}
     */
    _clearTimer: function(id) {
      var self = this;

      if (self._endTimers[id]) {
        clearTimeout(self._endTimers[id]);
        delete self._endTimers[id];
      }

      return self;
    },

    /**
     * Return the sound identified by this ID, or return null.
     * @param  {Number} id Sound ID
     * @return {Object}    Sound object or null.
     */
    _soundById: function(id) {
      var self = this;

      // Loop through all sounds and find the one with this ID.
      for (var i=0; i<self._sounds.length; i++) {
        if (id === self._sounds[i]._id) {
          return self._sounds[i];
        }
      }

      return null;
    },

    /**
     * Return an inactive sound from the pool or create a new one.
     * @return {Sound} Sound playback object.
     */
    _inactiveSound: function() {
      var self = this;

      self._drain();

      // Find the first inactive node to recycle.
      for (var i=0; i<self._sounds.length; i++) {
        if (self._sounds[i]._ended) {
          return self._sounds[i].reset();
        }
      }

      // If no inactive node was found, create a new one.
      return new Sound(self);
    },

    /**
     * Drain excess inactive sounds from the pool.
     */
    _drain: function() {
      var self = this;
      var limit = self._pool;
      var cnt = 0;
      var i = 0;

      // If there are less sounds than the max pool size, we are done.
      if (self._sounds.length < limit) {
        return;
      }

      // Count the number of inactive sounds.
      for (i=0; i<self._sounds.length; i++) {
        if (self._sounds[i]._ended) {
          cnt++;
        }
      }

      // Remove excess inactive sounds, going in reverse order.
      for (i=self._sounds.length - 1; i>=0; i--) {
        if (cnt <= limit) {
          return;
        }

        if (self._sounds[i]._ended) {
          // Disconnect the audio source when using Web Audio.
          if (self._webAudio && self._sounds[i]._node) {
            self._sounds[i]._node.disconnect(0);
          }

          // Remove sounds until we have the pool size.
          self._sounds.splice(i, 1);
          cnt--;
        }
      }
    },

    /**
     * Get all ID's from the sounds pool.
     * @param  {Number} id Only return one ID if one is passed.
     * @return {Array}    Array of IDs.
     */
    _getSoundIds: function(id) {
      var self = this;

      if (typeof id === 'undefined') {
        var ids = [];
        for (var i=0; i<self._sounds.length; i++) {
          ids.push(self._sounds[i]._id);
        }

        return ids;
      } else {
        return [id];
      }
    },

    /**
     * Load the sound back into the buffer source.
     * @param  {Sound} sound The sound object to work with.
     * @return {Howl}
     */
    _refreshBuffer: function(sound) {
      var self = this;

      // Setup the buffer source for playback.
      sound._node.bufferSource = Howler.ctx.createBufferSource();
      sound._node.bufferSource.buffer = cache[self._src];

      // Connect to the correct node.
      if (sound._panner) {
        sound._node.bufferSource.connect(sound._panner);
      } else {
        sound._node.bufferSource.connect(sound._node);
      }

      // Setup looping and playback rate.
      sound._node.bufferSource.loop = sound._loop;
      if (sound._loop) {
        sound._node.bufferSource.loopStart = sound._start || 0;
        sound._node.bufferSource.loopEnd = sound._stop;
      }
      sound._node.bufferSource.playbackRate.value = sound._rate;

      return self;
    },

    /**
     * Prevent memory leaks by cleaning up the buffer source after playback.
     * @param  {Object} node Sound's audio node containing the buffer source.
     * @return {Howl}
     */
    _cleanBuffer: function(node) {
      var self = this;

      if (self._scratchBuffer) {
        node.bufferSource.onended = null;
        node.bufferSource.disconnect(0);
        try { node.bufferSource.buffer = self._scratchBuffer; } catch(e) {}
      }
      node.bufferSource = null;

      return self;
    }
  };

  /** Single Sound Methods **/
  /***************************************************************************/

  /**
   * Setup the sound object, which each node attached to a Howl group is contained in.
   * @param {Object} howl The Howl parent group.
   */
  var Sound = function(howl) {
    this._parent = howl;
    this.init();
  };
  Sound.prototype = {
    /**
     * Initialize a new Sound object.
     * @return {Sound}
     */
    init: function() {
      var self = this;
      var parent = self._parent;

      // Setup the default parameters.
      self._muted = parent._muted;
      self._loop = parent._loop;
      self._volume = parent._volume;
      self._muted = parent._muted;
      self._rate = parent._rate;
      self._seek = 0;
      self._paused = true;
      self._ended = true;
      self._sprite = '__default';

      // Generate a unique ID for this sound.
      self._id = Math.round(Date.now() * Math.random());

      // Add itself to the parent's pool.
      parent._sounds.push(self);

      // Create the new node.
      self.create();

      return self;
    },

    /**
     * Create and setup a new sound object, whether HTML5 Audio or Web Audio.
     * @return {Sound}
     */
    create: function() {
      var self = this;
      var parent = self._parent;
      var volume = (Howler._muted || self._muted || self._parent._muted) ? 0 : self._volume;

      if (parent._webAudio) {
        // Create the gain node for controlling volume (the source will connect to this).
        self._node = (typeof Howler.ctx.createGain === 'undefined') ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
        self._node.gain.setValueAtTime(volume, Howler.ctx.currentTime);
        self._node.paused = true;
        self._node.connect(Howler.masterGain);
      } else {
        self._node = new Audio();

        // Listen for errors (http://dev.w3.org/html5/spec-author-view/spec.html#mediaerror).
        self._errorFn = self._errorListener.bind(self);
        self._node.addEventListener('error', self._errorFn, false);

        // Listen for 'canplaythrough' event to let us know the sound is ready.
        self._loadFn = self._loadListener.bind(self);
        self._node.addEventListener(Howler._canPlayEvent, self._loadFn, false);

        // Setup the new audio node.
        self._node.src = parent._src;
        self._node.preload = 'auto';
        self._node.volume = volume * Howler.volume();

        // Begin loading the source.
        self._node.load();
      }

      return self;
    },

    /**
     * Reset the parameters of this sound to the original state (for recycle).
     * @return {Sound}
     */
    reset: function() {
      var self = this;
      var parent = self._parent;

      // Reset all of the parameters of this sound.
      self._muted = parent._muted;
      self._loop = parent._loop;
      self._volume = parent._volume;
      self._muted = parent._muted;
      self._rate = parent._rate;
      self._seek = 0;
      self._rateSeek = 0;
      self._paused = true;
      self._ended = true;
      self._sprite = '__default';

      // Generate a new ID so that it isn't confused with the previous sound.
      self._id = Math.round(Date.now() * Math.random());

      return self;
    },

    /**
     * HTML5 Audio error listener callback.
     */
    _errorListener: function() {
      var self = this;

      // Fire an error event and pass back the code.
      self._parent._emit('loaderror', self._id, self._node.error ? self._node.error.code : 0);

      // Clear the event listener.
      self._node.removeEventListener('error', self._errorListener, false);
    },

    /**
     * HTML5 Audio canplaythrough listener callback.
     */
    _loadListener: function() {
      var self = this;
      var parent = self._parent;

      // Round up the duration to account for the lower precision in HTML5 Audio.
      parent._duration = Math.ceil(self._node.duration * 10) / 10;

      // Setup a sprite if none is defined.
      if (Object.keys(parent._sprite).length === 0) {
        parent._sprite = {__default: [0, parent._duration * 1000]};
      }

      if (parent._state !== 'loaded') {
        parent._state = 'loaded';
        parent._emit('load');
        parent._loadQueue();
      }

      // Clear the event listener.
      self._node.removeEventListener(Howler._canPlayEvent, self._loadFn, false);
    }
  };

  /** Helper Methods **/
  /***************************************************************************/

  var cache = {};

  /**
   * Buffer a sound from URL, Data URI or cache and decode to audio source (Web Audio API).
   * @param  {Howl} self
   */
  var loadBuffer = function(self) {
    var url = self._src;

    // Check if the buffer has already been cached and use it instead.
    if (cache[url]) {
      // Set the duration from the cache.
      self._duration = cache[url].duration;

      // Load the sound into this Howl.
      loadSound(self);

      return;
    }

    if (/^data:[^;]+;base64,/.test(url)) {
      // Decode the base64 data URI without XHR, since some browsers don't support it.
      var data = atob(url.split(',')[1]);
      var dataView = new Uint8Array(data.length);
      for (var i=0; i<data.length; ++i) {
        dataView[i] = data.charCodeAt(i);
      }

      decodeAudioData(dataView.buffer, self);
    } else {
      // Load the buffer from the URL.
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.responseType = 'arraybuffer';
      xhr.onload = function() {
        // Make sure we get a successful response back.
        var code = (xhr.status + '')[0];
        if (code !== '0' && code !== '2' && code !== '3') {
          self._emit('loaderror', null, 'Failed loading audio file with status: ' + xhr.status + '.');
          return;
        }

        decodeAudioData(xhr.response, self);
      };
      xhr.onerror = function() {
        // If there is an error, switch to HTML5 Audio.
        if (self._webAudio) {
          self._html5 = true;
          self._webAudio = false;
          self._sounds = [];
          delete cache[url];
          self.load();
        }
      };
      safeXhrSend(xhr);
    }
  };

  /**
   * Send the XHR request wrapped in a try/catch.
   * @param  {Object} xhr XHR to send.
   */
  var safeXhrSend = function(xhr) {
    try {
      xhr.send();
    } catch (e) {
      xhr.onerror();
    }
  };

  /**
   * Decode audio data from an array buffer.
   * @param  {ArrayBuffer} arraybuffer The audio data.
   * @param  {Howl}        self
   */
  var decodeAudioData = function(arraybuffer, self) {
    // Decode the buffer into an audio source.
    Howler.ctx.decodeAudioData(arraybuffer, function(buffer) {
      if (buffer && self._sounds.length > 0) {
        cache[self._src] = buffer;
        loadSound(self, buffer);
      }
    }, function() {
      self._emit('loaderror', null, 'Decoding audio data failed.');
    });
  };

  /**
   * Sound is now loaded, so finish setting everything up and fire the loaded event.
   * @param  {Howl} self
   * @param  {Object} buffer The decoded buffer sound source.
   */
  var loadSound = function(self, buffer) {
    // Set the duration.
    if (buffer && !self._duration) {
      self._duration = buffer.duration;
    }

    // Setup a sprite if none is defined.
    if (Object.keys(self._sprite).length === 0) {
      self._sprite = {__default: [0, self._duration * 1000]};
    }

    // Fire the loaded event.
    if (self._state !== 'loaded') {
      self._state = 'loaded';
      self._emit('load');
      self._loadQueue();
    }
  };

  /**
   * Setup the audio context when available, or switch to HTML5 Audio mode.
   */
  var setupAudioContext = function() {
    // Check if we are using Web Audio and setup the AudioContext if we are.
    try {
      if (typeof AudioContext !== 'undefined') {
        Howler.ctx = new AudioContext();
      } else if (typeof webkitAudioContext !== 'undefined') {
        Howler.ctx = new webkitAudioContext();
      } else {
        Howler.usingWebAudio = false;
      }
    } catch(e) {
      Howler.usingWebAudio = false;
    }

    // Check if a webview is being used on iOS8 or earlier (rather than the browser).
    // If it is, disable Web Audio as it causes crashing.
    var iOS = (/iP(hone|od|ad)/.test(Howler._navigator && Howler._navigator.platform));
    var appVersion = Howler._navigator && Howler._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/);
    var version = appVersion ? parseInt(appVersion[1], 10) : null;
    if (iOS && version && version < 9) {
      var safari = /safari/.test(Howler._navigator && Howler._navigator.userAgent.toLowerCase());
      if (Howler._navigator && Howler._navigator.standalone && !safari || Howler._navigator && !Howler._navigator.standalone && !safari) {
        Howler.usingWebAudio = false;
      }
    }

    // Create and expose the master GainNode when using Web Audio (useful for plugins or advanced usage).
    if (Howler.usingWebAudio) {
      Howler.masterGain = (typeof Howler.ctx.createGain === 'undefined') ? Howler.ctx.createGainNode() : Howler.ctx.createGain();
      Howler.masterGain.gain.value = 1;
      Howler.masterGain.connect(Howler.ctx.destination);
    }

    // Re-run the setup on Howler.
    Howler._setup();
  };

  // Add support for AMD (Asynchronous Module Definition) libraries such as require.js.
  if (typeof define === 'function' && define.amd) {
    define([], function() {
      return {
        Howler: Howler,
        Howl: Howl
      };
    });
  }

  // Add support for CommonJS libraries such as browserify.
  if (typeof exports !== 'undefined') {
    exports.Howler = Howler;
    exports.Howl = Howl;
  }

  // Define globally in case AMD is not available or unused.
  if (typeof window !== 'undefined') {
    window.HowlerGlobal = HowlerGlobal;
    window.Howler = Howler;
    window.Howl = Howl;
    window.Sound = Sound;
  } else if (typeof global !== 'undefined') { // Add to global in Node.js (for testing, etc).
    global.HowlerGlobal = HowlerGlobal;
    global.Howler = Howler;
    global.Howl = Howl;
    global.Sound = Sound;
  }
})();


/*!
 *  Spatial Plugin - Adds support for stereo and 3D audio where Web Audio is supported.
 *  
 *  howler.js v2.0.2
 *  howlerjs.com
 *
 *  (c) 2013-2016, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */

(function() {

  'use strict';

  // Setup default properties.
  HowlerGlobal.prototype._pos = [0, 0, 0];
  HowlerGlobal.prototype._orientation = [0, 0, -1, 0, 1, 0];
  
  /** Global Methods **/
  /***************************************************************************/

  /**
   * Helper method to update the stereo panning position of all current Howls.
   * Future Howls will not use this value unless explicitly set.
   * @param  {Number} pan A value of -1.0 is all the way left and 1.0 is all the way right.
   * @return {Howler/Number}     Self or current stereo panning value.
   */
  HowlerGlobal.prototype.stereo = function(pan) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self.ctx || !self.ctx.listener) {
      return self;
    }

    // Loop through all Howls and update their stereo panning.
    for (var i=self._howls.length-1; i>=0; i--) {
      self._howls[i].stereo(pan);
    }

    return self;
  };

  /**
   * Get/set the position of the listener in 3D cartesian space. Sounds using
   * 3D position will be relative to the listener's position.
   * @param  {Number} x The x-position of the listener.
   * @param  {Number} y The y-position of the listener.
   * @param  {Number} z The z-position of the listener.
   * @return {Howler/Array}   Self or current listener position.
   */
  HowlerGlobal.prototype.pos = function(x, y, z) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self.ctx || !self.ctx.listener) {
      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    y = (typeof y !== 'number') ? self._pos[1] : y;
    z = (typeof z !== 'number') ? self._pos[2] : z;

    if (typeof x === 'number') {
      self._pos = [x, y, z];
      self.ctx.listener.setPosition(self._pos[0], self._pos[1], self._pos[2]);
    } else {
      return self._pos;
    }

    return self;
  };

  /**
   * Get/set the direction the listener is pointing in the 3D cartesian space.
   * A front and up vector must be provided. The front is the direction the
   * face of the listener is pointing, and up is the direction the top of the
   * listener is pointing. Thus, these values are expected to be at right angles
   * from each other.
   * @param  {Number} x   The x-orientation of the listener.
   * @param  {Number} y   The y-orientation of the listener.
   * @param  {Number} z   The z-orientation of the listener.
   * @param  {Number} xUp The x-orientation of the top of the listener.
   * @param  {Number} yUp The y-orientation of the top of the listener.
   * @param  {Number} zUp The z-orientation of the top of the listener.
   * @return {Howler/Array}     Returns self or the current orientation vectors.
   */
  HowlerGlobal.prototype.orientation = function(x, y, z, xUp, yUp, zUp) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self.ctx || !self.ctx.listener) {
      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    var or = self._orientation;
    y = (typeof y !== 'number') ? or[1] : y;
    z = (typeof z !== 'number') ? or[2] : z;
    xUp = (typeof xUp !== 'number') ? or[3] : xUp;
    yUp = (typeof yUp !== 'number') ? or[4] : yUp;
    zUp = (typeof zUp !== 'number') ? or[5] : zUp;

    if (typeof x === 'number') {
      self._orientation = [x, y, z, xUp, yUp, zUp];
      self.ctx.listener.setOrientation(x, y, z, xUp, yUp, zUp);
    } else {
      return or;
    }

    return self;
  };

  /** Group Methods **/
  /***************************************************************************/

  /**
   * Add new properties to the core init.
   * @param  {Function} _super Core init method.
   * @return {Howl}
   */
  Howl.prototype.init = (function(_super) {
    return function(o) {
      var self = this;

      // Setup user-defined default properties.
      self._orientation = o.orientation || [1, 0, 0];
      self._stereo = o.stereo || null;
      self._pos = o.pos || null;
      self._pannerAttr = {
        coneInnerAngle: typeof o.coneInnerAngle !== 'undefined' ? o.coneInnerAngle : 360,
        coneOuterAngle: typeof o.coneOuterAngle !== 'undefined' ? o.coneOuterAngle : 360,
        coneOuterGain: typeof o.coneOuterGain !== 'undefined' ? o.coneOuterGain : 0,
        distanceModel: typeof o.distanceModel !== 'undefined' ? o.distanceModel : 'inverse',
        maxDistance: typeof o.maxDistance !== 'undefined' ? o.maxDistance : 10000,
        panningModel: typeof o.panningModel !== 'undefined' ? o.panningModel : 'HRTF',
        refDistance: typeof o.refDistance !== 'undefined' ? o.refDistance : 1,
        rolloffFactor: typeof o.rolloffFactor !== 'undefined' ? o.rolloffFactor : 1
      };

      // Setup event listeners.
      self._onstereo = o.onstereo ? [{fn: o.onstereo}] : [];
      self._onpos = o.onpos ? [{fn: o.onpos}] : [];
      self._onorientation = o.onorientation ? [{fn: o.onorientation}] : [];

      // Complete initilization with howler.js core's init function.
      return _super.call(this, o);
    };
  })(Howl.prototype.init);

  /**
   * Get/set the stereo panning of the audio source for this sound or all in the group.
   * @param  {Number} pan  A value of -1.0 is all the way left and 1.0 is all the way right.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Number}    Returns self or the current stereo panning value.
   */
  Howl.prototype.stereo = function(pan, id) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // If the sound hasn't loaded, add it to the load queue to change stereo pan when capable.
    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'stereo',
        action: function() {
          self.stereo(pan, id);
        }
      });

      return self;
    }

    // Check for PannerStereoNode support and fallback to PannerNode if it doesn't exist.
    var pannerType = (typeof Howler.ctx.createStereoPanner === 'undefined') ? 'spatial' : 'stereo';

    // Setup the group's stereo panning if no ID is passed.
    if (typeof id === 'undefined') {
      // Return the group's stereo panning if no parameters are passed.
      if (typeof pan === 'number') {
        self._stereo = pan;
        self._pos = [pan, 0, 0];
      } else {
        return self._stereo;
      }
    }

    // Change the streo panning of one or all sounds in group.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof pan === 'number') {
          sound._stereo = pan;
          sound._pos = [pan, 0, 0];

          if (sound._node) {
            // If we are falling back, make sure the panningModel is equalpower.
            sound._pannerAttr.panningModel = 'equalpower';

            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner || !sound._panner.pan) {
              setupPanner(sound, pannerType);
            }

            if (pannerType === 'spatial') {
              sound._panner.setPosition(pan, 0, 0);
            } else {
              sound._panner.pan.value = pan;
            }
          }

          self._emit('stereo', sound._id);
        } else {
          return sound._stereo;
        }
      }
    }

    return self;
  };

  /**
   * Get/set the 3D spatial position of the audio source for this sound or
   * all in the group. The most common usage is to set the 'x' position for
   * left/right panning. Setting any value higher than 1.0 will begin to
   * decrease the volume of the sound as it moves further away.
   * @param  {Number} x  The x-position of the audio from -1000.0 to 1000.0.
   * @param  {Number} y  The y-position of the audio from -1000.0 to 1000.0.
   * @param  {Number} z  The z-position of the audio from -1000.0 to 1000.0.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Array}    Returns self or the current 3D spatial position: [x, y, z].
   */
  Howl.prototype.pos = function(x, y, z, id) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // If the sound hasn't loaded, add it to the load queue to change position when capable.
    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'pos',
        action: function() {
          self.pos(x, y, z, id);
        }
      });

      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    y = (typeof y !== 'number') ? 0 : y;
    z = (typeof z !== 'number') ? -0.5 : z;

    // Setup the group's spatial position if no ID is passed.
    if (typeof id === 'undefined') {
      // Return the group's spatial position if no parameters are passed.
      if (typeof x === 'number') {
        self._pos = [x, y, z];
      } else {
        return self._pos;
      }
    }

    // Change the spatial position of one or all sounds in group.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof x === 'number') {
          sound._pos = [x, y, z];

          if (sound._node) {
            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner || sound._panner.pan) {
              setupPanner(sound, 'spatial');
            }

            sound._panner.setPosition(x, y, z);
          }

          self._emit('pos', sound._id);
        } else {
          return sound._pos;
        }
      }
    }

    return self;
  };

  /**
   * Get/set the direction the audio source is pointing in the 3D cartesian coordinate
   * space. Depending on how direction the sound is, based on the `cone` attributes,
   * a sound pointing away from the listener can be quiet or silent.
   * @param  {Number} x  The x-orientation of the source.
   * @param  {Number} y  The y-orientation of the source.
   * @param  {Number} z  The z-orientation of the source.
   * @param  {Number} id (optional) The sound ID. If none is passed, all in group will be updated.
   * @return {Howl/Array}    Returns self or the current 3D spatial orientation: [x, y, z].
   */
  Howl.prototype.orientation = function(x, y, z, id) {
    var self = this;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // If the sound hasn't loaded, add it to the load queue to change orientation when capable.
    if (self._state !== 'loaded') {
      self._queue.push({
        event: 'orientation',
        action: function() {
          self.orientation(x, y, z, id);
        }
      });

      return self;
    }

    // Set the defaults for optional 'y' & 'z'.
    y = (typeof y !== 'number') ? self._orientation[1] : y;
    z = (typeof z !== 'number') ? self._orientation[2] : z;

    // Setup the group's spatial orientation if no ID is passed.
    if (typeof id === 'undefined') {
      // Return the group's spatial orientation if no parameters are passed.
      if (typeof x === 'number') {
        self._orientation = [x, y, z];
      } else {
        return self._orientation;
      }
    }

    // Change the spatial orientation of one or all sounds in group.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      // Get the sound.
      var sound = self._soundById(ids[i]);

      if (sound) {
        if (typeof x === 'number') {
          sound._orientation = [x, y, z];

          if (sound._node) {
            // Check if there is a panner setup and create a new one if not.
            if (!sound._panner) {
              // Make sure we have a position to setup the node with.
              if (!sound._pos) {
                sound._pos = self._pos || [0, 0, -0.5];
              }

              setupPanner(sound, 'spatial');
            }

            sound._panner.setOrientation(x, y, z);
          }

          self._emit('orientation', sound._id);
        } else {
          return sound._orientation;
        }
      }
    }

    return self;
  };

  /**
   * Get/set the panner node's attributes for a sound or group of sounds.
   * This method can optionall take 0, 1 or 2 arguments.
   *   pannerAttr() -> Returns the group's values.
   *   pannerAttr(id) -> Returns the sound id's values.
   *   pannerAttr(o) -> Set's the values of all sounds in this Howl group.
   *   pannerAttr(o, id) -> Set's the values of passed sound id.
   *
   *   Attributes:
   *     coneInnerAngle - (360 by default) There will be no volume reduction inside this angle.
   *     coneOuterAngle - (360 by default) The volume will be reduced to a constant value of
   *                      `coneOuterGain` outside this angle.
   *     coneOuterGain - (0 by default) The amount of volume reduction outside of `coneOuterAngle`.
   *     distanceModel - ('inverse' by default) Determines algorithm to use to reduce volume as audio moves
   *                      away from listener. Can be `linear`, `inverse` or `exponential`.
   *     maxDistance - (10000 by default) Volume won't reduce between source/listener beyond this distance.
   *     panningModel - ('HRTF' by default) Determines which spatialization algorithm is used to position audio.
   *                     Can be `HRTF` or `equalpower`.
   *     refDistance - (1 by default) A reference distance for reducing volume as the source
   *                    moves away from the listener.
   *     rolloffFactor - (1 by default) How quickly the volume reduces as source moves from listener.
   * 
   * @return {Howl/Object} Returns self or current panner attributes.
   */
  Howl.prototype.pannerAttr = function() {
    var self = this;
    var args = arguments;
    var o, id, sound;

    // Stop right here if not using Web Audio.
    if (!self._webAudio) {
      return self;
    }

    // Determine the values based on arguments.
    if (args.length === 0) {
      // Return the group's panner attribute values.
      return self._pannerAttr;
    } else if (args.length === 1) {
      if (typeof args[0] === 'object') {
        o = args[0];

        // Set the grou's panner attribute values.
        if (typeof id === 'undefined') {
          self._pannerAttr = {
            coneInnerAngle: typeof o.coneInnerAngle !== 'undefined' ? o.coneInnerAngle : self._coneInnerAngle,
            coneOuterAngle: typeof o.coneOuterAngle !== 'undefined' ? o.coneOuterAngle : self._coneOuterAngle,
            coneOuterGain: typeof o.coneOuterGain !== 'undefined' ? o.coneOuterGain : self._coneOuterGain,
            distanceModel: typeof o.distanceModel !== 'undefined' ? o.distanceModel : self._distanceModel,
            maxDistance: typeof o.maxDistance !== 'undefined' ? o.maxDistance : self._maxDistance,
            panningModel: typeof o.panningModel !== 'undefined' ? o.panningModel : self._panningModel,
            refDistance: typeof o.refDistance !== 'undefined' ? o.refDistance : self._refDistance,
            rolloffFactor: typeof o.rolloffFactor !== 'undefined' ? o.rolloffFactor : self._rolloffFactor
          };
        }
      } else {
        // Return this sound's panner attribute values.
        sound = self._soundById(parseInt(args[0], 10));
        return sound ? sound._pannerAttr : self._pannerAttr;
      }
    } else if (args.length === 2) {
      o = args[0];
      id = parseInt(args[1], 10);
    }

    // Update the values of the specified sounds.
    var ids = self._getSoundIds(id);
    for (var i=0; i<ids.length; i++) {
      sound = self._soundById(ids[i]);

      if (sound) {
        // Merge the new values into the sound.
        var pa = sound._pannerAttr;
        pa = {
          coneInnerAngle: typeof o.coneInnerAngle !== 'undefined' ? o.coneInnerAngle : pa.coneInnerAngle,
          coneOuterAngle: typeof o.coneOuterAngle !== 'undefined' ? o.coneOuterAngle : pa.coneOuterAngle,
          coneOuterGain: typeof o.coneOuterGain !== 'undefined' ? o.coneOuterGain : pa.coneOuterGain,
          distanceModel: typeof o.distanceModel !== 'undefined' ? o.distanceModel : pa.distanceModel,
          maxDistance: typeof o.maxDistance !== 'undefined' ? o.maxDistance : pa.maxDistance,
          panningModel: typeof o.panningModel !== 'undefined' ? o.panningModel : pa.panningModel,
          refDistance: typeof o.refDistance !== 'undefined' ? o.refDistance : pa.refDistance,
          rolloffFactor: typeof o.rolloffFactor !== 'undefined' ? o.rolloffFactor : pa.rolloffFactor
        };

        // Update the panner values or create a new panner if none exists.
        var panner = sound._panner;
        if (panner) {
          panner.coneInnerAngle = pa.coneInnerAngle;
          panner.coneOuterAngle = pa.coneOuterAngle;
          panner.coneOuterGain = pa.coneOuterGain;
          panner.distanceModel = pa.distanceModel;
          panner.maxDistance = pa.maxDistance;
          panner.panningModel = pa.panningModel;
          panner.refDistance = pa.refDistance;
          panner.rolloffFactor = pa.rolloffFactor;
        } else {
          // Make sure we have a position to setup the node with.
          if (!sound._pos) {
            sound._pos = self._pos || [0, 0, -0.5];
          }

          // Create a new panner node.
          setupPanner(sound, 'spatial');
        }
      }
    }

    return self;
  };

  /** Single Sound Methods **/
  /***************************************************************************/

  /**
   * Add new properties to the core Sound init.
   * @param  {Function} _super Core Sound init method.
   * @return {Sound}
   */
  Sound.prototype.init = (function(_super) {
    return function() {
      var self = this;
      var parent = self._parent;

      // Setup user-defined default properties.
      self._orientation = parent._orientation;
      self._stereo = parent._stereo;
      self._pos = parent._pos;
      self._pannerAttr = parent._pannerAttr;

      // Complete initilization with howler.js core Sound's init function.
      _super.call(this);

      // If a stereo or position was specified, set it up.
      if (self._stereo) {
        parent.stereo(self._stereo);
      } else if (self._pos) {
        parent.pos(self._pos[0], self._pos[1], self._pos[2], self._id);
      }
    };
  })(Sound.prototype.init);

  /**
   * Override the Sound.reset method to clean up properties from the spatial plugin.
   * @param  {Function} _super Sound reset method.
   * @return {Sound}
   */
  Sound.prototype.reset = (function(_super) {
    return function() {
      var self = this;
      var parent = self._parent;

      // Reset all spatial plugin properties on this sound.
      self._orientation = parent._orientation;
      self._pos = parent._pos;
      self._pannerAttr = parent._pannerAttr;

      // Complete resetting of the sound.
      return _super.call(this);
    };
  })(Sound.prototype.reset);

  /** Helper Methods **/
  /***************************************************************************/

  /**
   * Create a new panner node and save it on the sound.
   * @param  {Sound} sound Specific sound to setup panning on.
   * @param {String} type Type of panner to create: 'stereo' or 'spatial'.
   */
  var setupPanner = function(sound, type) {
    type = type || 'spatial';

    // Create the new panner node.
    if (type === 'spatial') {
      sound._panner = Howler.ctx.createPanner();
      sound._panner.coneInnerAngle = sound._pannerAttr.coneInnerAngle;
      sound._panner.coneOuterAngle = sound._pannerAttr.coneOuterAngle;
      sound._panner.coneOuterGain = sound._pannerAttr.coneOuterGain;
      sound._panner.distanceModel = sound._pannerAttr.distanceModel;
      sound._panner.maxDistance = sound._pannerAttr.maxDistance;
      sound._panner.panningModel = sound._pannerAttr.panningModel;
      sound._panner.refDistance = sound._pannerAttr.refDistance;
      sound._panner.rolloffFactor = sound._pannerAttr.rolloffFactor;
      sound._panner.setPosition(sound._pos[0], sound._pos[1], sound._pos[2]);
      sound._panner.setOrientation(sound._orientation[0], sound._orientation[1], sound._orientation[2]);
    } else {
      sound._panner = Howler.ctx.createStereoPanner();
      sound._panner.pan.value = sound._stereo;
    }

    sound._panner.connect(sound._node);

    // Update the connections.
    if (!sound._paused) {
      sound._parent.pause(sound._id, true).play(sound._id);
    }
  };
})();

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})

},{}],4:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getColorName = getColorName;
var config = require('./../../config');

function getColorName(color) {
  if (color in config.palette.colorNames) {
    return config.palette.colorNames[color];
  } else {
    return null;
  }
}

},{"./../../config":1}],5:[function(require,module,exports){
"use strict";

(function (root, factory) {

	if (typeof define === 'function' && define.amd) {
		define([], factory);
	} else if (typeof module !== "undefined" && module.exports) {
		module.exports = factory();
	} else {
		root.ShapeDetector = factory();
	}
})(undefined, function () {

	var _nbSamplePoints;
	var _squareSize = 250;
	var _phi = 0.5 * (-1.0 + Math.sqrt(5.0));
	var _angleRange = deg2Rad(45.0);
	var _anglePrecision = deg2Rad(2.0);
	var _halfDiagonal = Math.sqrt(_squareSize * _squareSize + _squareSize * _squareSize) * 0.5;
	var _origin = { x: 0, y: 0 };

	function deg2Rad(d) {

		return d * Math.PI / 180.0;
	};

	function getDistance(a, b) {

		var dx = b.x - a.x;
		var dy = b.y - a.y;

		return Math.sqrt(dx * dx + dy * dy);
	};

	function Stroke(points, name) {

		this.points = points;
		this.name = name;
		this.processStroke();
	};

	Stroke.prototype.processStroke = function () {

		this.points = this.resample();
		this.setCentroid();
		this.points = this.rotateBy(-this.indicativeAngle());
		this.points = this.scaleToSquare();
		this.setCentroid();
		this.points = this.translateToOrigin();

		return this;
	};

	Stroke.prototype.resample = function () {

		var localDistance, q;
		var interval = this.strokeLength() / (_nbSamplePoints - 1);
		var distance = 0.0;
		var newPoints = [this.points[0]];

		for (var i = 1; i < this.points.length; i++) {
			localDistance = getDistance(this.points[i - 1], this.points[i]);

			if (distance + localDistance >= interval) {
				q = {
					x: this.points[i - 1].x + (interval - distance) / localDistance * (this.points[i].x - this.points[i - 1].x),
					y: this.points[i - 1].y + (interval - distance) / localDistance * (this.points[i].y - this.points[i - 1].y)
				};

				newPoints.push(q);
				this.points.splice(i, 0, q);
				distance = 0.0;
			} else {
				distance += localDistance;
			}
		}

		if (newPoints.length === _nbSamplePoints - 1) {
			newPoints.push(this.points[this.points.length - 1]);
		}

		return newPoints;
	};

	Stroke.prototype.rotateBy = function (angle) {

		var point;
		var cos = Math.cos(angle);
		var sin = Math.sin(angle);
		var newPoints = [];

		for (var i = 0; i < this.points.length; i++) {
			point = this.points[i];

			newPoints.push({
				x: (point.x - this.c.x) * cos - (point.y - this.c.y) * sin + this.c.x,
				y: (point.x - this.c.x) * sin + (point.y - this.c.y) * cos + this.c.y
			});
		}

		return newPoints;
	};

	Stroke.prototype.scaleToSquare = function () {

		var point;
		var newPoints = [];
		var box = {
			minX: +Infinity,
			maxX: -Infinity,
			minY: +Infinity,
			maxY: -Infinity
		};

		for (var i = 0; i < this.points.length; i++) {
			point = this.points[i];

			box.minX = Math.min(box.minX, point.x);
			box.minY = Math.min(box.minY, point.y);
			box.maxX = Math.max(box.maxX, point.x);
			box.maxY = Math.max(box.maxY, point.y);
		}

		box.width = box.maxX - box.minX;
		box.height = box.maxY - box.minY;

		for (i = 0; i < this.points.length; i++) {
			point = this.points[i];

			newPoints.push({
				x: point.x * (_squareSize / box.width),
				y: point.y * (_squareSize / box.height)
			});
		}

		return newPoints;
	};

	Stroke.prototype.translateToOrigin = function (points) {

		var point;
		var newPoints = [];

		for (var i = 0; i < this.points.length; i++) {
			point = this.points[i];

			newPoints.push({
				x: point.x + _origin.x - this.c.x,
				y: point.y + _origin.y - this.c.y
			});
		}

		return newPoints;
	};

	Stroke.prototype.setCentroid = function () {

		var point;
		this.c = {
			x: 0.0,
			y: 0.0
		};

		for (var i = 0; i < this.points.length; i++) {
			point = this.points[i];

			this.c.x += point.x;
			this.c.y += point.y;
		}

		this.c.x /= this.points.length;
		this.c.y /= this.points.length;

		return this;
	};

	Stroke.prototype.indicativeAngle = function () {

		return Math.atan2(this.c.y - this.points[0].y, this.c.x - this.points[0].x);
	};

	Stroke.prototype.strokeLength = function () {

		var d = 0.0;

		for (var i = 1; i < this.points.length; i++) {
			d += getDistance(this.points[i - 1], this.points[i]);
		}

		return d;
	};

	Stroke.prototype.distanceAtBestAngle = function (pattern) {

		var a = -_angleRange;
		var b = _angleRange;
		var x1 = _phi * a + (1.0 - _phi) * b;
		var f1 = this.distanceAtAngle(pattern, x1);
		var x2 = (1.0 - _phi) * a + _phi * b;
		var f2 = this.distanceAtAngle(pattern, x2);

		while (Math.abs(b - a) > _anglePrecision) {

			if (f1 < f2) {
				b = x2;
				x2 = x1;
				f2 = f1;
				x1 = _phi * a + (1.0 - _phi) * b;
				f1 = this.distanceAtAngle(pattern, x1);
			} else {
				a = x1;
				x1 = x2;
				f1 = f2;
				x2 = (1.0 - _phi) * a + _phi * b;
				f2 = this.distanceAtAngle(pattern, x2);
			}
		}

		return Math.min(f1, f2);
	};

	Stroke.prototype.distanceAtAngle = function (pattern, angle) {

		var strokePoints = this.rotateBy(angle);
		var patternPoints = pattern.points;
		var d = 0.0;

		for (var i = 0; i < strokePoints.length; i++) {
			d += getDistance(strokePoints[i], patternPoints[i]);
		}

		return d / strokePoints.length;
	};

	function ShapeDetector(patterns, options) {

		options = options || {};
		this.threshold = options.threshold || 0;
		_nbSamplePoints = options.nbSamplePoints || 64;

		this.patterns = [];

		for (var i = 0; i < patterns.length; i++) {
			this.learn(patterns[i].name, patterns[i].points);
		}
	}

	ShapeDetector.defaultShapes = [{
		points: [{ x: 47, y: 55 }, { x: 156, y: 55 }],
		name: "line"
	}, {
		points: [{ x: 57, y: 158 }, { x: 148, y: 75 }, { x: 207, y: 29 }],
		name: "line"
	}, {
		points: [{ x: 22, y: 38 }, { x: 60, y: 55 }, { x: 119, y: 87 }, { x: 186, y: 125 }, { x: 259, y: 158 }, { x: 271, y: 161 }, { x: 277, y: 166 }, { x: 295, y: 172 }],
		name: "line"
	}, {
		points: [{ x: 154, y: 42 }, { x: 157, y: 150 }, { x: 160, y: 240 }, { x: 168, y: 325 }, { x: 171, y: 339 }],
		name: "line"
	}, {
		points: [{ x: 9, y: 95 }, { x: 23, y: 66 }, { x: 57, y: 41 }, { x: 83, y: 48 }, { x: 116, y: 81 }, { x: 174, y: 102 }, { x: 256, y: 45 }, { x: 312, y: 18 }, { x: 371, y: 74 }, { x: 382, y: 98 }, { x: 388, y: 108 }],
		name: "line"
	}, {
		points: [{ x: 151, y: 7 }, { x: 141, y: 17 }, { x: 121, y: 50 }, { x: 149, y: 69 }, { x: 170, y: 92 }, { x: 198, y: 172 }, { x: 191, y: 237 }, { x: 170, y: 287 }, { x: 173, y: 306 }, { x: 229, y: 363 }, { x: 259, y: 388 }],
		name: "line"
	}, {
		points: [{ x: 71, y: 279 }, { x: 220, y: 279 }, { x: 290, y: 273 }, { x: 424, y: 269 }, { x: 593, y: 269 }, { x: 689, y: 264 }, { x: 763, y: 240 }, { x: 873, y: 228 }, { x: 901, y: 231 }, { x: 912, y: 233 }, { x: 918, y: 227 }],
		name: "line"
	}, {
		points: [{ x: 565, y: 91 }, { x: 565, y: 501 }],
		name: "line"
	}, {
		points: [{ x: 131, y: 79 }, { x: 131, y: 383 }],
		name: "line"
	}, {
		points: [{ x: 140.17500305175776, y: 420.52500915527327 }, { x: 157.69687843322748, y: 385.4812583923338 }, { x: 175.2187538146972, y: 350.4375076293944 }, { x: 192.7406291961669, y: 315.39375686645496 }, { x: 210.26250457763663, y: 280.3500061035155 }, { x: 227.78437995910636, y: 245.30625534057606 }, { x: 245.30625534057606, y: 210.26250457763663 }, { x: 262.8281307220458, y: 175.2187538146972 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 297.87188148498524, y: 175.2187538146972 }, { x: 315.39375686645496, y: 210.26250457763663 }, { x: 332.9156322479247, y: 245.30625534057606 }, { x: 350.4375076293944, y: 280.3500061035155 }, { x: 367.95938301086414, y: 315.39375686645496 }, { x: 385.4812583923338, y: 350.4375076293944 }, { x: 403.00313377380354, y: 385.4812583923338 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 385.4812583923338, y: 420.52500915527327 }, { x: 350.4375076293944, y: 420.52500915527327 }, { x: 315.39375686645496, y: 420.52500915527327 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 245.30625534057606, y: 420.52500915527327 }, { x: 210.26250457763663, y: 420.52500915527327 }, { x: 175.2187538146972, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }],
		name: "triangle"
	}, {
		points: [{ x: 280.3500061035155, y: 140.17500305175776 }, { x: 297.87188148498524, y: 175.2187538146972 }, { x: 315.39375686645496, y: 210.26250457763663 }, { x: 332.9156322479247, y: 245.30625534057606 }, { x: 350.4375076293944, y: 280.3500061035155 }, { x: 367.95938301086414, y: 315.39375686645496 }, { x: 385.4812583923338, y: 350.4375076293944 }, { x: 403.00313377380354, y: 385.4812583923338 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 385.4812583923338, y: 420.52500915527327 }, { x: 350.4375076293944, y: 420.52500915527327 }, { x: 315.39375686645496, y: 420.52500915527327 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 245.30625534057606, y: 420.52500915527327 }, { x: 210.26250457763663, y: 420.52500915527327 }, { x: 175.2187538146972, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 157.69687843322748, y: 385.4812583923338 }, { x: 175.2187538146972, y: 350.4375076293944 }, { x: 192.7406291961669, y: 315.39375686645496 }, { x: 210.26250457763663, y: 280.3500061035155 }, { x: 227.78437995910636, y: 245.30625534057606 }, { x: 245.30625534057606, y: 210.26250457763663 }, { x: 262.8281307220458, y: 175.2187538146972 }, { x: 280.3500061035155, y: 140.17500305175776 }],
		name: "triangle"
	}, {
		points: [{ x: 420.52500915527327, y: 420.52500915527327 }, { x: 385.4812583923338, y: 420.52500915527327 }, { x: 350.4375076293944, y: 420.52500915527327 }, { x: 315.39375686645496, y: 420.52500915527327 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 245.30625534057606, y: 420.52500915527327 }, { x: 210.26250457763663, y: 420.52500915527327 }, { x: 175.2187538146972, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 157.69687843322748, y: 385.4812583923338 }, { x: 175.2187538146972, y: 350.4375076293944 }, { x: 192.7406291961669, y: 315.39375686645496 }, { x: 210.26250457763663, y: 280.3500061035155 }, { x: 227.78437995910636, y: 245.30625534057606 }, { x: 245.30625534057606, y: 210.26250457763663 }, { x: 262.8281307220458, y: 175.2187538146972 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 297.87188148498524, y: 175.2187538146972 }, { x: 315.39375686645496, y: 210.26250457763663 }, { x: 332.9156322479247, y: 245.30625534057606 }, { x: 350.4375076293944, y: 280.3500061035155 }, { x: 367.95938301086414, y: 315.39375686645496 }, { x: 385.4812583923338, y: 350.4375076293944 }, { x: 403.00313377380354, y: 385.4812583923338 }, { x: 420.52500915527327, y: 420.52500915527327 }],
		name: "triangle"
	}, {
		points: [{ x: 140.17500305175776, y: 420.52500915527327 }, { x: 175.2187538146972, y: 420.52500915527327 }, { x: 210.26250457763663, y: 420.52500915527327 }, { x: 245.30625534057606, y: 420.52500915527327 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 315.39375686645496, y: 420.52500915527327 }, { x: 350.4375076293944, y: 420.52500915527327 }, { x: 385.4812583923338, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 403.00313377380354, y: 385.4812583923338 }, { x: 385.4812583923338, y: 350.4375076293944 }, { x: 367.9593830108641, y: 315.39375686645496 }, { x: 350.4375076293944, y: 280.3500061035155 }, { x: 332.9156322479247, y: 245.30625534057606 }, { x: 315.39375686645496, y: 210.26250457763663 }, { x: 297.87188148498524, y: 175.2187538146972 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 262.8281307220458, y: 175.2187538146972 }, { x: 245.30625534057606, y: 210.26250457763663 }, { x: 227.78437995910636, y: 245.30625534057606 }, { x: 210.26250457763663, y: 280.3500061035155 }, { x: 192.7406291961669, y: 315.39375686645496 }, { x: 175.2187538146972, y: 350.4375076293944 }, { x: 157.69687843322748, y: 385.4812583923338 }, { x: 140.17500305175776, y: 420.52500915527327 }],
		name: "triangle"
	}, {
		points: [{ x: 420.52500915527327, y: 420.52500915527327 }, { x: 403.00313377380354, y: 385.4812583923338 }, { x: 385.4812583923338, y: 350.4375076293944 }, { x: 367.9593830108641, y: 315.39375686645496 }, { x: 350.4375076293944, y: 280.3500061035155 }, { x: 332.9156322479247, y: 245.30625534057606 }, { x: 315.39375686645496, y: 210.26250457763663 }, { x: 297.87188148498524, y: 175.2187538146972 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 262.8281307220458, y: 175.2187538146972 }, { x: 245.30625534057606, y: 210.26250457763663 }, { x: 227.78437995910636, y: 245.30625534057606 }, { x: 210.26250457763663, y: 280.3500061035155 }, { x: 192.7406291961669, y: 315.39375686645496 }, { x: 175.2187538146972, y: 350.4375076293944 }, { x: 157.69687843322748, y: 385.4812583923338 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 175.2187538146972, y: 420.52500915527327 }, { x: 210.26250457763663, y: 420.52500915527327 }, { x: 245.30625534057606, y: 420.52500915527327 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 315.39375686645496, y: 420.52500915527327 }, { x: 350.4375076293944, y: 420.52500915527327 }, { x: 385.4812583923338, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }],
		name: "triangle"
	}, {
		points: [{ x: 280.3500061035155, y: 140.17500305175776 }, { x: 262.8281307220458, y: 175.2187538146972 }, { x: 245.30625534057606, y: 210.26250457763663 }, { x: 227.78437995910636, y: 245.30625534057606 }, { x: 210.26250457763663, y: 280.3500061035155 }, { x: 192.7406291961669, y: 315.39375686645496 }, { x: 175.2187538146972, y: 350.4375076293944 }, { x: 157.69687843322748, y: 385.4812583923338 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 175.2187538146972, y: 420.52500915527327 }, { x: 210.26250457763663, y: 420.52500915527327 }, { x: 245.30625534057606, y: 420.52500915527327 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 315.39375686645496, y: 420.52500915527327 }, { x: 350.4375076293944, y: 420.52500915527327 }, { x: 385.4812583923338, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 403.00313377380354, y: 385.4812583923338 }, { x: 385.4812583923338, y: 350.4375076293944 }, { x: 367.9593830108641, y: 315.39375686645496 }, { x: 350.4375076293944, y: 280.3500061035155 }, { x: 332.9156322479247, y: 245.30625534057606 }, { x: 315.39375686645496, y: 210.26250457763663 }, { x: 297.87188148498524, y: 175.2187538146972 }, { x: 280.3500061035155, y: 140.17500305175776 }],
		name: "triangle"
	}, {
		points: [{ x: 140.17500305175776, y: 140.17500305175776 }, { x: 175.2187538146972, y: 140.17500305175776 }, { x: 210.26250457763663, y: 140.17500305175776 }, { x: 245.30625534057606, y: 140.17500305175776 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 315.39375686645496, y: 140.17500305175776 }, { x: 350.4375076293944, y: 140.17500305175776 }, { x: 385.4812583923338, y: 140.17500305175776 }, { x: 420.52500915527327, y: 140.17500305175776 }, { x: 420.52500915527327, y: 140.17500305175776 }, { x: 420.52500915527327, y: 175.2187538146972 }, { x: 420.52500915527327, y: 210.26250457763663 }, { x: 420.52500915527327, y: 245.30625534057606 }, { x: 420.52500915527327, y: 280.3500061035155 }, { x: 420.52500915527327, y: 315.39375686645496 }, { x: 420.52500915527327, y: 350.4375076293944 }, { x: 420.52500915527327, y: 385.4812583923338 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 385.4812583923338, y: 420.52500915527327 }, { x: 350.4375076293944, y: 420.52500915527327 }, { x: 315.39375686645496, y: 420.52500915527327 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 245.30625534057606, y: 420.52500915527327 }, { x: 210.26250457763663, y: 420.52500915527327 }, { x: 175.2187538146972, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 140.17500305175776, y: 385.4812583923338 }, { x: 140.17500305175776, y: 350.4375076293944 }, { x: 140.17500305175776, y: 315.39375686645496 }, { x: 140.17500305175776, y: 280.3500061035155 }, { x: 140.17500305175776, y: 245.30625534057606 }, { x: 140.17500305175776, y: 210.26250457763663 }, { x: 140.17500305175776, y: 175.2187538146972 }, { x: 140.17500305175776, y: 140.17500305175776 }],
		name: "square"
	}, {
		points: [{ x: 420.52500915527327, y: 140.17500305175776 }, { x: 420.52500915527327, y: 175.2187538146972 }, { x: 420.52500915527327, y: 210.26250457763663 }, { x: 420.52500915527327, y: 245.30625534057606 }, { x: 420.52500915527327, y: 280.3500061035155 }, { x: 420.52500915527327, y: 315.39375686645496 }, { x: 420.52500915527327, y: 350.4375076293944 }, { x: 420.52500915527327, y: 385.4812583923338 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 385.4812583923338, y: 420.52500915527327 }, { x: 350.4375076293944, y: 420.52500915527327 }, { x: 315.39375686645496, y: 420.52500915527327 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 245.30625534057606, y: 420.52500915527327 }, { x: 210.26250457763663, y: 420.52500915527327 }, { x: 175.2187538146972, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 140.17500305175776, y: 385.4812583923338 }, { x: 140.17500305175776, y: 350.4375076293944 }, { x: 140.17500305175776, y: 315.39375686645496 }, { x: 140.17500305175776, y: 280.3500061035155 }, { x: 140.17500305175776, y: 245.30625534057606 }, { x: 140.17500305175776, y: 210.26250457763663 }, { x: 140.17500305175776, y: 175.2187538146972 }, { x: 140.17500305175776, y: 140.17500305175776 }, { x: 140.17500305175776, y: 140.17500305175776 }, { x: 175.2187538146972, y: 140.17500305175776 }, { x: 210.26250457763663, y: 140.17500305175776 }, { x: 245.30625534057606, y: 140.17500305175776 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 315.39375686645496, y: 140.17500305175776 }, { x: 350.4375076293944, y: 140.17500305175776 }, { x: 385.4812583923338, y: 140.17500305175776 }, { x: 420.52500915527327, y: 140.17500305175776 }],
		name: "square"
	}, {
		points: [{ x: 420.52500915527327, y: 420.52500915527327 }, { x: 385.4812583923338, y: 420.52500915527327 }, { x: 350.4375076293944, y: 420.52500915527327 }, { x: 315.39375686645496, y: 420.52500915527327 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 245.30625534057606, y: 420.52500915527327 }, { x: 210.26250457763663, y: 420.52500915527327 }, { x: 175.2187538146972, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 140.17500305175776, y: 385.4812583923338 }, { x: 140.17500305175776, y: 350.4375076293944 }, { x: 140.17500305175776, y: 315.39375686645496 }, { x: 140.17500305175776, y: 280.3500061035155 }, { x: 140.17500305175776, y: 245.30625534057606 }, { x: 140.17500305175776, y: 210.26250457763663 }, { x: 140.17500305175776, y: 175.2187538146972 }, { x: 140.17500305175776, y: 140.17500305175776 }, { x: 140.17500305175776, y: 140.17500305175776 }, { x: 175.2187538146972, y: 140.17500305175776 }, { x: 210.26250457763663, y: 140.17500305175776 }, { x: 245.30625534057606, y: 140.17500305175776 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 315.39375686645496, y: 140.17500305175776 }, { x: 350.4375076293944, y: 140.17500305175776 }, { x: 385.4812583923338, y: 140.17500305175776 }, { x: 420.52500915527327, y: 140.17500305175776 }, { x: 420.52500915527327, y: 140.17500305175776 }, { x: 420.52500915527327, y: 175.2187538146972 }, { x: 420.52500915527327, y: 210.26250457763663 }, { x: 420.52500915527327, y: 245.30625534057606 }, { x: 420.52500915527327, y: 280.3500061035155 }, { x: 420.52500915527327, y: 315.39375686645496 }, { x: 420.52500915527327, y: 350.4375076293944 }, { x: 420.52500915527327, y: 385.4812583923338 }, { x: 420.52500915527327, y: 420.52500915527327 }],
		name: "square"
	}, {
		points: [{ x: 140.17500305175776, y: 420.52500915527327 }, { x: 140.17500305175776, y: 385.4812583923338 }, { x: 140.17500305175776, y: 350.4375076293944 }, { x: 140.17500305175776, y: 315.39375686645496 }, { x: 140.17500305175776, y: 280.3500061035155 }, { x: 140.17500305175776, y: 245.30625534057606 }, { x: 140.17500305175776, y: 210.26250457763663 }, { x: 140.17500305175776, y: 175.2187538146972 }, { x: 140.17500305175776, y: 140.17500305175776 }, { x: 140.17500305175776, y: 140.17500305175776 }, { x: 175.2187538146972, y: 140.17500305175776 }, { x: 210.26250457763663, y: 140.17500305175776 }, { x: 245.30625534057606, y: 140.17500305175776 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 315.39375686645496, y: 140.17500305175776 }, { x: 350.4375076293944, y: 140.17500305175776 }, { x: 385.4812583923338, y: 140.17500305175776 }, { x: 420.52500915527327, y: 140.17500305175776 }, { x: 420.52500915527327, y: 140.17500305175776 }, { x: 420.52500915527327, y: 175.2187538146972 }, { x: 420.52500915527327, y: 210.26250457763663 }, { x: 420.52500915527327, y: 245.30625534057606 }, { x: 420.52500915527327, y: 280.3500061035155 }, { x: 420.52500915527327, y: 315.39375686645496 }, { x: 420.52500915527327, y: 350.4375076293944 }, { x: 420.52500915527327, y: 385.4812583923338 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 385.4812583923338, y: 420.52500915527327 }, { x: 350.4375076293944, y: 420.52500915527327 }, { x: 315.39375686645496, y: 420.52500915527327 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 245.30625534057606, y: 420.52500915527327 }, { x: 210.26250457763663, y: 420.52500915527327 }, { x: 175.2187538146972, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }],
		name: "square"
	}, {
		points: [{ x: 140.17500305175776, y: 420.52500915527327 }, { x: 175.2187538146972, y: 420.52500915527327 }, { x: 210.26250457763663, y: 420.52500915527327 }, { x: 245.30625534057606, y: 420.52500915527327 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 315.39375686645496, y: 420.52500915527327 }, { x: 350.4375076293944, y: 420.52500915527327 }, { x: 385.4812583923338, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 420.52500915527327, y: 385.4812583923338 }, { x: 420.52500915527327, y: 350.4375076293944 }, { x: 420.52500915527327, y: 315.39375686645496 }, { x: 420.52500915527327, y: 280.3500061035155 }, { x: 420.52500915527327, y: 245.30625534057606 }, { x: 420.52500915527327, y: 210.26250457763663 }, { x: 420.52500915527327, y: 175.2187538146972 }, { x: 420.52500915527327, y: 140.17500305175776 }, { x: 420.52500915527327, y: 140.17500305175776 }, { x: 385.4812583923338, y: 140.17500305175776 }, { x: 350.4375076293944, y: 140.17500305175776 }, { x: 315.39375686645496, y: 140.17500305175776 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 245.30625534057606, y: 140.17500305175776 }, { x: 210.26250457763663, y: 140.17500305175776 }, { x: 175.2187538146972, y: 140.17500305175776 }, { x: 140.17500305175776, y: 140.17500305175776 }, { x: 140.17500305175776, y: 140.17500305175776 }, { x: 140.17500305175776, y: 175.2187538146972 }, { x: 140.17500305175776, y: 210.26250457763663 }, { x: 140.17500305175776, y: 245.30625534057606 }, { x: 140.17500305175776, y: 280.3500061035155 }, { x: 140.17500305175776, y: 315.39375686645496 }, { x: 140.17500305175776, y: 350.4375076293944 }, { x: 140.17500305175776, y: 385.4812583923338 }, { x: 140.17500305175776, y: 420.52500915527327 }],
		name: "square"
	}, {
		points: [{ x: 420.52500915527327, y: 420.52500915527327 }, { x: 420.52500915527327, y: 385.4812583923338 }, { x: 420.52500915527327, y: 350.4375076293944 }, { x: 420.52500915527327, y: 315.39375686645496 }, { x: 420.52500915527327, y: 280.3500061035155 }, { x: 420.52500915527327, y: 245.30625534057606 }, { x: 420.52500915527327, y: 210.26250457763663 }, { x: 420.52500915527327, y: 175.2187538146972 }, { x: 420.52500915527327, y: 140.17500305175776 }, { x: 420.52500915527327, y: 140.17500305175776 }, { x: 385.4812583923338, y: 140.17500305175776 }, { x: 350.4375076293944, y: 140.17500305175776 }, { x: 315.39375686645496, y: 140.17500305175776 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 245.30625534057606, y: 140.17500305175776 }, { x: 210.26250457763663, y: 140.17500305175776 }, { x: 175.2187538146972, y: 140.17500305175776 }, { x: 140.17500305175776, y: 140.17500305175776 }, { x: 140.17500305175776, y: 140.17500305175776 }, { x: 140.17500305175776, y: 175.2187538146972 }, { x: 140.17500305175776, y: 210.26250457763663 }, { x: 140.17500305175776, y: 245.30625534057606 }, { x: 140.17500305175776, y: 280.3500061035155 }, { x: 140.17500305175776, y: 315.39375686645496 }, { x: 140.17500305175776, y: 350.4375076293944 }, { x: 140.17500305175776, y: 385.4812583923338 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 175.2187538146972, y: 420.52500915527327 }, { x: 210.26250457763663, y: 420.52500915527327 }, { x: 245.30625534057606, y: 420.52500915527327 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 315.39375686645496, y: 420.52500915527327 }, { x: 350.4375076293944, y: 420.52500915527327 }, { x: 385.4812583923338, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }],
		name: "square"
	}, {
		points: [{ x: 420.52500915527327, y: 140.17500305175776 }, { x: 385.4812583923338, y: 140.17500305175776 }, { x: 350.4375076293944, y: 140.17500305175776 }, { x: 315.39375686645496, y: 140.17500305175776 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 245.30625534057606, y: 140.17500305175776 }, { x: 210.26250457763663, y: 140.17500305175776 }, { x: 175.2187538146972, y: 140.17500305175776 }, { x: 140.17500305175776, y: 140.17500305175776 }, { x: 140.17500305175776, y: 140.17500305175776 }, { x: 140.17500305175776, y: 175.2187538146972 }, { x: 140.17500305175776, y: 210.26250457763663 }, { x: 140.17500305175776, y: 245.30625534057606 }, { x: 140.17500305175776, y: 280.3500061035155 }, { x: 140.17500305175776, y: 315.39375686645496 }, { x: 140.17500305175776, y: 350.4375076293944 }, { x: 140.17500305175776, y: 385.4812583923338 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 175.2187538146972, y: 420.52500915527327 }, { x: 210.26250457763663, y: 420.52500915527327 }, { x: 245.30625534057606, y: 420.52500915527327 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 315.39375686645496, y: 420.52500915527327 }, { x: 350.4375076293944, y: 420.52500915527327 }, { x: 385.4812583923338, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 420.52500915527327, y: 385.4812583923338 }, { x: 420.52500915527327, y: 350.4375076293944 }, { x: 420.52500915527327, y: 315.39375686645496 }, { x: 420.52500915527327, y: 280.3500061035155 }, { x: 420.52500915527327, y: 245.30625534057606 }, { x: 420.52500915527327, y: 210.26250457763663 }, { x: 420.52500915527327, y: 175.2187538146972 }, { x: 420.52500915527327, y: 140.17500305175776 }],
		name: "square"
	}, {
		points: [{ x: 140.17500305175776, y: 140.17500305175776 }, { x: 140.17500305175776, y: 175.2187538146972 }, { x: 140.17500305175776, y: 210.26250457763663 }, { x: 140.17500305175776, y: 245.30625534057606 }, { x: 140.17500305175776, y: 280.3500061035155 }, { x: 140.17500305175776, y: 315.39375686645496 }, { x: 140.17500305175776, y: 350.4375076293944 }, { x: 140.17500305175776, y: 385.4812583923338 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 140.17500305175776, y: 420.52500915527327 }, { x: 175.2187538146972, y: 420.52500915527327 }, { x: 210.26250457763663, y: 420.52500915527327 }, { x: 245.30625534057606, y: 420.52500915527327 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 315.39375686645496, y: 420.52500915527327 }, { x: 350.4375076293944, y: 420.52500915527327 }, { x: 385.4812583923338, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 420.52500915527327, y: 420.52500915527327 }, { x: 420.52500915527327, y: 385.4812583923338 }, { x: 420.52500915527327, y: 350.4375076293944 }, { x: 420.52500915527327, y: 315.39375686645496 }, { x: 420.52500915527327, y: 280.3500061035155 }, { x: 420.52500915527327, y: 245.30625534057606 }, { x: 420.52500915527327, y: 210.26250457763663 }, { x: 420.52500915527327, y: 175.2187538146972 }, { x: 420.52500915527327, y: 140.17500305175776 }, { x: 420.52500915527327, y: 140.17500305175776 }, { x: 385.4812583923338, y: 140.17500305175776 }, { x: 350.4375076293944, y: 140.17500305175776 }, { x: 315.39375686645496, y: 140.17500305175776 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 245.30625534057606, y: 140.17500305175776 }, { x: 210.26250457763663, y: 140.17500305175776 }, { x: 175.2187538146972, y: 140.17500305175776 }, { x: 140.17500305175776, y: 140.17500305175776 }],
		name: "square"
	}, {
		points: [{ x: 420.52500915527327, y: 280.3500061035155 }, { x: 418.3954358873965, y: 304.69113993790967 }, { x: 412.07142208989444, y: 328.29268073795373 }, { x: 401.74511972189896, y: 350.43750762939436 }, { x: 387.73028825550034, y: 370.4527612529582 }, { x: 370.4527612529582, y: 387.73028825550034 }, { x: 350.4375076293944, y: 401.74511972189896 }, { x: 328.2926807379538, y: 412.07142208989444 }, { x: 304.69113993790967, y: 418.3954358873965 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 256.0088722691214, y: 418.3954358873965 }, { x: 232.4073314690773, y: 412.07142208989444 }, { x: 210.26250457763666, y: 401.74511972189896 }, { x: 190.2472509540728, y: 387.73028825550034 }, { x: 172.9697239515307, y: 370.4527612529582 }, { x: 158.95489248513206, y: 350.43750762939436 }, { x: 148.62859011713658, y: 328.2926807379538 }, { x: 142.30457631963455, y: 304.6911399379096 }, { x: 140.17500305175776, y: 280.3500061035155 }, { x: 142.30457631963455, y: 256.00887226912135 }, { x: 148.62859011713655, y: 232.4073314690773 }, { x: 158.9548924851321, y: 210.2625045776366 }, { x: 172.96972395153068, y: 190.2472509540728 }, { x: 190.24725095407277, y: 172.9697239515307 }, { x: 210.26250457763658, y: 158.95489248513212 }, { x: 232.40733146907718, y: 148.62859011713658 }, { x: 256.00887226912135, y: 142.30457631963455 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 304.6911399379096, y: 142.30457631963455 }, { x: 328.2926807379537, y: 148.62859011713653 }, { x: 350.4375076293944, y: 158.9548924851321 }, { x: 370.4527612529582, y: 172.96972395153068 }, { x: 387.73028825550034, y: 190.24725095407274 }, { x: 401.7451197218989, y: 210.26250457763658 }, { x: 412.07142208989444, y: 232.4073314690773 }, { x: 418.39543588739645, y: 256.00887226912124 }, { x: 420.52500915527327, y: 280.35000610351545 }],
		name: "circle"
	}, {
		points: [{ x: 420.52500915527327, y: 280.3500061035155 }, { x: 418.3954358873965, y: 256.00887226912135 }, { x: 412.07142208989444, y: 232.4073314690773 }, { x: 401.74511972189896, y: 210.26250457763666 }, { x: 387.73028825550034, y: 190.2472509540728 }, { x: 370.4527612529582, y: 172.96972395153068 }, { x: 350.4375076293944, y: 158.9548924851321 }, { x: 328.2926807379538, y: 148.62859011713658 }, { x: 304.69113993790967, y: 142.30457631963455 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 256.0088722691214, y: 142.30457631963455 }, { x: 232.4073314690773, y: 148.62859011713655 }, { x: 210.26250457763666, y: 158.95489248513206 }, { x: 190.2472509540728, y: 172.96972395153068 }, { x: 172.9697239515307, y: 190.24725095407277 }, { x: 158.95489248513206, y: 210.26250457763666 }, { x: 148.62859011713658, y: 232.40733146907723 }, { x: 142.30457631963455, y: 256.0088722691214 }, { x: 140.17500305175776, y: 280.3500061035155 }, { x: 142.30457631963455, y: 304.69113993790967 }, { x: 148.62859011713655, y: 328.29268073795373 }, { x: 158.9548924851321, y: 350.4375076293944 }, { x: 172.96972395153068, y: 370.4527612529582 }, { x: 190.24725095407277, y: 387.73028825550034 }, { x: 210.26250457763658, y: 401.7451197218989 }, { x: 232.40733146907718, y: 412.07142208989444 }, { x: 256.00887226912135, y: 418.3954358873965 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 304.6911399379096, y: 418.3954358873965 }, { x: 328.2926807379537, y: 412.0714220898945 }, { x: 350.4375076293944, y: 401.74511972189896 }, { x: 370.4527612529582, y: 387.73028825550034 }, { x: 387.73028825550034, y: 370.4527612529583 }, { x: 401.7451197218989, y: 350.4375076293944 }, { x: 412.07142208989444, y: 328.29268073795373 }, { x: 418.39543588739645, y: 304.6911399379098 }, { x: 420.52500915527327, y: 280.35000610351557 }],
		name: "circle"
	}, {
		points: [{ x: 140.17500305175776, y: 280.3500061035155 }, { x: 142.30457631963455, y: 256.00887226912135 }, { x: 148.62859011713655, y: 232.4073314690773 }, { x: 158.95489248513206, y: 210.26250457763666 }, { x: 172.96972395153068, y: 190.2472509540728 }, { x: 190.2472509540728, y: 172.96972395153068 }, { x: 210.2625045776366, y: 158.9548924851321 }, { x: 232.40733146907726, y: 148.62859011713658 }, { x: 256.00887226912135, y: 142.30457631963455 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 304.6911399379096, y: 142.30457631963455 }, { x: 328.29268073795373, y: 148.62859011713655 }, { x: 350.43750762939436, y: 158.95489248513206 }, { x: 370.4527612529582, y: 172.96972395153068 }, { x: 387.73028825550034, y: 190.24725095407277 }, { x: 401.74511972189896, y: 210.26250457763666 }, { x: 412.07142208989444, y: 232.40733146907723 }, { x: 418.3954358873965, y: 256.0088722691214 }, { x: 420.52500915527327, y: 280.3500061035155 }, { x: 418.3954358873965, y: 304.69113993790967 }, { x: 412.07142208989444, y: 328.29268073795373 }, { x: 401.74511972189896, y: 350.4375076293944 }, { x: 387.73028825550034, y: 370.4527612529582 }, { x: 370.4527612529582, y: 387.73028825550034 }, { x: 350.4375076293944, y: 401.7451197218989 }, { x: 328.29268073795384, y: 412.07142208989444 }, { x: 304.69113993790967, y: 418.3954358873965 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 256.0088722691214, y: 418.3954358873965 }, { x: 232.40733146907735, y: 412.0714220898945 }, { x: 210.2625045776366, y: 401.74511972189896 }, { x: 190.2472509540728, y: 387.73028825550034 }, { x: 172.9697239515307, y: 370.4527612529583 }, { x: 158.95489248513212, y: 350.4375076293944 }, { x: 148.62859011713655, y: 328.29268073795373 }, { x: 142.30457631963458, y: 304.6911399379098 }, { x: 140.17500305175776, y: 280.35000610351557 }],
		name: "circle"
	}, {
		points: [{ x: 140.17500305175776, y: 280.3500061035155 }, { x: 142.30457631963455, y: 304.69113993790967 }, { x: 148.62859011713655, y: 328.29268073795373 }, { x: 158.95489248513206, y: 350.43750762939436 }, { x: 172.96972395153068, y: 370.4527612529582 }, { x: 190.2472509540728, y: 387.73028825550034 }, { x: 210.2625045776366, y: 401.74511972189896 }, { x: 232.40733146907726, y: 412.07142208989444 }, { x: 256.00887226912135, y: 418.3954358873965 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 304.6911399379096, y: 418.3954358873965 }, { x: 328.29268073795373, y: 412.07142208989444 }, { x: 350.43750762939436, y: 401.74511972189896 }, { x: 370.4527612529582, y: 387.73028825550034 }, { x: 387.73028825550034, y: 370.4527612529582 }, { x: 401.74511972189896, y: 350.43750762939436 }, { x: 412.07142208989444, y: 328.2926807379538 }, { x: 418.3954358873965, y: 304.6911399379096 }, { x: 420.52500915527327, y: 280.3500061035155 }, { x: 418.3954358873965, y: 256.00887226912135 }, { x: 412.07142208989444, y: 232.4073314690773 }, { x: 401.74511972189896, y: 210.2625045776366 }, { x: 387.73028825550034, y: 190.2472509540728 }, { x: 370.4527612529582, y: 172.9697239515307 }, { x: 350.4375076293944, y: 158.95489248513212 }, { x: 328.29268073795384, y: 148.62859011713658 }, { x: 304.69113993790967, y: 142.30457631963455 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 256.0088722691214, y: 142.30457631963455 }, { x: 232.40733146907735, y: 148.62859011713653 }, { x: 210.2625045776366, y: 158.9548924851321 }, { x: 190.2472509540728, y: 172.96972395153068 }, { x: 172.9697239515307, y: 190.24725095407274 }, { x: 158.95489248513212, y: 210.26250457763658 }, { x: 148.62859011713655, y: 232.4073314690773 }, { x: 142.30457631963458, y: 256.00887226912124 }, { x: 140.17500305175776, y: 280.35000610351545 }],
		name: "circle"
	}, {
		points: [{ x: 280.3500061035155, y: 420.52500915527327 }, { x: 304.6911399379096, y: 418.3954358873965 }, { x: 328.29268073795373, y: 412.07142208989444 }, { x: 350.43750762939436, y: 401.74511972189896 }, { x: 370.4527612529582, y: 387.73028825550034 }, { x: 387.73028825550034, y: 370.4527612529582 }, { x: 401.74511972189896, y: 350.43750762939436 }, { x: 412.07142208989444, y: 328.2926807379538 }, { x: 418.3954358873965, y: 304.6911399379096 }, { x: 420.52500915527327, y: 280.3500061035155 }, { x: 418.3954358873965, y: 256.00887226912135 }, { x: 412.07142208989444, y: 232.4073314690773 }, { x: 401.74511972189896, y: 210.2625045776366 }, { x: 387.73028825550034, y: 190.2472509540728 }, { x: 370.4527612529582, y: 172.9697239515307 }, { x: 350.4375076293944, y: 158.95489248513212 }, { x: 328.29268073795384, y: 148.62859011713658 }, { x: 304.69113993790967, y: 142.30457631963455 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 256.0088722691214, y: 142.30457631963455 }, { x: 232.40733146907735, y: 148.62859011713653 }, { x: 210.2625045776366, y: 158.9548924851321 }, { x: 190.2472509540728, y: 172.96972395153068 }, { x: 172.9697239515307, y: 190.24725095407274 }, { x: 158.95489248513212, y: 210.26250457763658 }, { x: 148.62859011713655, y: 232.4073314690773 }, { x: 142.30457631963458, y: 256.00887226912124 }, { x: 140.17500305175776, y: 280.35000610351545 }, { x: 142.30457631963455, y: 304.6911399379096 }, { x: 148.62859011713658, y: 328.2926807379538 }, { x: 158.954892485132, y: 350.4375076293943 }, { x: 172.96972395153068, y: 370.4527612529582 }, { x: 190.24725095407274, y: 387.7302882555003 }, { x: 210.26250457763666, y: 401.74511972189896 }, { x: 232.40733146907718, y: 412.07142208989444 }, { x: 256.00887226912135, y: 418.3954358873965 }, { x: 280.35000610351545, y: 420.52500915527327 }],
		name: "circle"
	}, {
		points: [{ x: 280.3500061035155, y: 140.17500305175776 }, { x: 304.6911399379096, y: 142.30457631963455 }, { x: 328.29268073795373, y: 148.62859011713655 }, { x: 350.43750762939436, y: 158.95489248513206 }, { x: 370.4527612529582, y: 172.96972395153068 }, { x: 387.73028825550034, y: 190.24725095407277 }, { x: 401.74511972189896, y: 210.26250457763666 }, { x: 412.07142208989444, y: 232.40733146907723 }, { x: 418.3954358873965, y: 256.0088722691214 }, { x: 420.52500915527327, y: 280.3500061035155 }, { x: 418.3954358873965, y: 304.69113993790967 }, { x: 412.07142208989444, y: 328.29268073795373 }, { x: 401.74511972189896, y: 350.4375076293944 }, { x: 387.73028825550034, y: 370.4527612529582 }, { x: 370.4527612529582, y: 387.73028825550034 }, { x: 350.4375076293944, y: 401.7451197218989 }, { x: 328.29268073795384, y: 412.07142208989444 }, { x: 304.69113993790967, y: 418.3954358873965 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 256.0088722691214, y: 418.3954358873965 }, { x: 232.40733146907735, y: 412.0714220898945 }, { x: 210.2625045776366, y: 401.74511972189896 }, { x: 190.2472509540728, y: 387.73028825550034 }, { x: 172.9697239515307, y: 370.4527612529583 }, { x: 158.95489248513212, y: 350.4375076293944 }, { x: 148.62859011713655, y: 328.29268073795373 }, { x: 142.30457631963458, y: 304.6911399379098 }, { x: 140.17500305175776, y: 280.35000610351557 }, { x: 142.30457631963455, y: 256.0088722691214 }, { x: 148.62859011713658, y: 232.40733146907723 }, { x: 158.954892485132, y: 210.26250457763672 }, { x: 172.96972395153068, y: 190.2472509540728 }, { x: 190.24725095407274, y: 172.96972395153074 }, { x: 210.26250457763666, y: 158.95489248513206 }, { x: 232.40733146907718, y: 148.6285901171366 }, { x: 256.00887226912135, y: 142.30457631963455 }, { x: 280.35000610351545, y: 140.17500305175776 }],
		name: "circle"
	}, {
		points: [{ x: 280.3500061035155, y: 140.17500305175776 }, { x: 256.0088722691214, y: 142.30457631963455 }, { x: 232.4073314690773, y: 148.62859011713655 }, { x: 210.26250457763666, y: 158.95489248513206 }, { x: 190.2472509540728, y: 172.96972395153068 }, { x: 172.9697239515307, y: 190.24725095407277 }, { x: 158.95489248513206, y: 210.26250457763666 }, { x: 148.62859011713658, y: 232.40733146907723 }, { x: 142.30457631963455, y: 256.0088722691214 }, { x: 140.17500305175776, y: 280.3500061035155 }, { x: 142.30457631963455, y: 304.69113993790967 }, { x: 148.62859011713655, y: 328.29268073795373 }, { x: 158.9548924851321, y: 350.4375076293944 }, { x: 172.96972395153068, y: 370.4527612529582 }, { x: 190.24725095407277, y: 387.73028825550034 }, { x: 210.26250457763658, y: 401.7451197218989 }, { x: 232.40733146907718, y: 412.07142208989444 }, { x: 256.00887226912135, y: 418.3954358873965 }, { x: 280.3500061035155, y: 420.52500915527327 }, { x: 304.6911399379096, y: 418.3954358873965 }, { x: 328.2926807379537, y: 412.0714220898945 }, { x: 350.4375076293944, y: 401.74511972189896 }, { x: 370.4527612529582, y: 387.73028825550034 }, { x: 387.73028825550034, y: 370.4527612529583 }, { x: 401.7451197218989, y: 350.4375076293944 }, { x: 412.07142208989444, y: 328.29268073795373 }, { x: 418.39543588739645, y: 304.6911399379098 }, { x: 420.52500915527327, y: 280.35000610351557 }, { x: 418.3954358873965, y: 256.0088722691214 }, { x: 412.07142208989444, y: 232.40733146907723 }, { x: 401.745119721899, y: 210.26250457763672 }, { x: 387.73028825550034, y: 190.2472509540728 }, { x: 370.4527612529583, y: 172.96972395153074 }, { x: 350.43750762939436, y: 158.95489248513206 }, { x: 328.29268073795384, y: 148.6285901171366 }, { x: 304.69113993790967, y: 142.30457631963455 }, { x: 280.35000610351557, y: 140.17500305175776 }],
		name: "circle"
	}, {
		points: [{ x: 280.3500061035155, y: 420.52500915527327 }, { x: 256.0088722691214, y: 418.3954358873965 }, { x: 232.4073314690773, y: 412.07142208989444 }, { x: 210.26250457763666, y: 401.74511972189896 }, { x: 190.2472509540728, y: 387.73028825550034 }, { x: 172.9697239515307, y: 370.4527612529582 }, { x: 158.95489248513206, y: 350.43750762939436 }, { x: 148.62859011713658, y: 328.2926807379538 }, { x: 142.30457631963455, y: 304.6911399379096 }, { x: 140.17500305175776, y: 280.3500061035155 }, { x: 142.30457631963455, y: 256.00887226912135 }, { x: 148.62859011713655, y: 232.4073314690773 }, { x: 158.9548924851321, y: 210.2625045776366 }, { x: 172.96972395153068, y: 190.2472509540728 }, { x: 190.24725095407277, y: 172.9697239515307 }, { x: 210.26250457763658, y: 158.95489248513212 }, { x: 232.40733146907718, y: 148.62859011713658 }, { x: 256.00887226912135, y: 142.30457631963455 }, { x: 280.3500061035155, y: 140.17500305175776 }, { x: 304.6911399379096, y: 142.30457631963455 }, { x: 328.2926807379537, y: 148.62859011713653 }, { x: 350.4375076293944, y: 158.9548924851321 }, { x: 370.4527612529582, y: 172.96972395153068 }, { x: 387.73028825550034, y: 190.24725095407274 }, { x: 401.7451197218989, y: 210.26250457763658 }, { x: 412.07142208989444, y: 232.4073314690773 }, { x: 418.39543588739645, y: 256.00887226912124 }, { x: 420.52500915527327, y: 280.35000610351545 }, { x: 418.3954358873965, y: 304.6911399379096 }, { x: 412.07142208989444, y: 328.2926807379538 }, { x: 401.745119721899, y: 350.4375076293943 }, { x: 387.73028825550034, y: 370.4527612529582 }, { x: 370.4527612529583, y: 387.7302882555003 }, { x: 350.43750762939436, y: 401.74511972189896 }, { x: 328.29268073795384, y: 412.07142208989444 }, { x: 304.69113993790967, y: 418.3954358873965 }, { x: 280.35000610351557, y: 420.52500915527327 }],
		name: "circle"
	}];

	ShapeDetector.prototype.spot = function (points, patternName) {

		if (patternName == null) {
			patternName = '';
		}

		var distance, pattern, score;
		var stroke = new Stroke(points);
		var bestDistance = +Infinity;
		var bestPattern = null;
		var bestScore = 0;

		for (var i = 0; i < this.patterns.length; i++) {
			pattern = this.patterns[i];

			if (pattern.name.indexOf(patternName) > -1) {
				distance = stroke.distanceAtBestAngle(pattern);
				score = 1.0 - distance / _halfDiagonal;

				if (distance < bestDistance && score > this.threshold) {
					bestDistance = distance;
					bestPattern = pattern.name;
					bestScore = score;
				}
			}
		}

		return { pattern: bestPattern, score: bestScore };
	};

	ShapeDetector.prototype.learn = function (name, points) {

		return this.patterns.push(new Stroke(points, name));
	};

	return ShapeDetector;
});

},{}],6:[function(require,module,exports){
'use strict';

var config = require('./../../config');

require('hammerjs');
require('howler');

var ShapeDetector = require('./lib/shape-detector');

var util = require('./util');
var shape = require('./shape');
var color = require('./color');
var sound = require('./sound');

window.kan = window.kan || {
  palette: ["#20171C", "#1E2A43", "#28377D", "#352747", "#CA2E26", "#9A2A1F", "#DA6C26", "#453121", "#916A47", "#DAAD27", "#7F7D31", "#2B5E2E"],
  paletteNames: [],
  currentColor: '#20171C',
  numPaths: 10,
  paths: []
};

paper.install(window);

$(document).ready(function () {
  var MOVES = []; // store global moves list
  // moves = [
  //   {
  //     'type': 'colorChange',
  //     'old': '#20171C',
  //     'new': '#F285A5'
  //   },
  //   {
  //     'type': 'newPath',
  //     'ref': '???' // uuid? dom reference?
  //   },
  //   {
  //     'type': 'pathTransform',
  //     'ref': '???', // uuid? dom reference?
  //     'old': 'rotate(90deg)scale(1.5)', // ???
  //     'new': 'rotate(120deg)scale(-0.5)' // ???
  //   },
  //   // others?
  // ]

  var $window = $(window);
  var $body = $('body');
  var $canvas = $('canvas#mainCanvas');
  var runAnimations = true;
  var transparent = new Color(0, 0);
  var detector = new ShapeDetector(ShapeDetector.defaultShapes);

  var viewWidth = void 0,
      viewHeight = void 0;

  function hitTestBounds(point) {
    return util.hitTestBounds(point, paper.project.activeLayer.children);
  }

  function hitTestGroupBounds(point) {
    var groups = paper.project.getItems({
      className: 'Group'
    });
    return util.hitTestBounds(point, groups);
  }

  function initViewVars() {
    viewWidth = paper.view.viewSize.width;
    viewHeight = paper.view.viewSize.height;
  }

  function initControlPanel() {
    initColorPalette();
    initCanvasDraw();
    initNew();
    initUndo();
    initPlay();
    initTips();
    initShare();
  }

  function initColorPalette() {
    var $paletteWrap = $('ul.palette-colors');
    var $paletteColors = $paletteWrap.find('li');
    var paletteColorSize = 20;
    var paletteSelectedColorSize = 30;
    var paletteSelectedClass = 'palette-selected';

    // hook up click
    $paletteColors.on('click tap touch', function () {
      var $svg = $(this).find('svg.palette-color');

      if (!$svg.hasClass(paletteSelectedClass)) {
        $('.' + paletteSelectedClass).removeClass(paletteSelectedClass).attr('width', paletteColorSize).attr('height', paletteColorSize).find('rect').attr('rx', 0).attr('ry', 0);

        $svg.addClass(paletteSelectedClass).attr('width', paletteSelectedColorSize).attr('height', paletteSelectedColorSize).find('rect').attr('rx', paletteSelectedColorSize / 2).attr('ry', paletteSelectedColorSize / 2);

        window.kan.currentColor = $svg.find('rect').attr('fill');
      }
    });
  }

  function initCanvasDraw() {

    paper.setup($canvas[0]);

    var middle = void 0,
        bounds = void 0;
    var past = void 0;
    var sizes = void 0;
    // let paths = getFreshPaths(window.kan.numPaths);
    var touch = false;
    var lastChild = void 0;

    var sounds = void 0;
    sound.initShapeSounds().then(function (resp) {
      sounds = resp;
    }).then(function () {
      var circle = sounds.circle;
      console.log(circle);
      circle.play('red');
      debugger;
    });

    function panStart(event) {
      paper.project.activeLayer.removeChildren(); // REMOVE
      // drawCircle();

      sizes = [];

      if (pinching) return;
      if (!(event.changedPointers && event.changedPointers.length > 0)) return;
      if (event.changedPointers.length > 1) {
        console.log('event.changedPointers > 1');
      }

      var pointer = event.center;
      var point = new Point(pointer.x, pointer.y);

      bounds = new Path({
        strokeColor: window.kan.currentColor,
        fillColor: window.kan.currentColor,
        name: 'bounds'
      });

      middle = new Path({
        strokeColor: window.kan.currentColor,
        name: 'middle',
        strokeWidth: 1,
        visible: false
      });

      bounds.add(point);
      middle.add(point);
    }

    var min = 0;
    var max = 20;
    var alpha = 0.3;
    var memory = 10;
    var cumDistance = 0;
    var cumSize = void 0,
        avgSize = void 0;
    function panMove(event) {
      event.preventDefault();
      if (pinching) return;
      // console.log(event.overallVelocity);
      // let thisDist = parseInt(event.distance);
      // cumDistance += thisDist;
      //
      // if (cumDistance < 100) {
      //   console.log('ignoring');
      //   return;
      // } else {
      //   cumDistance = 0;
      //   console.log('not ignoring');
      // }

      var pointer = event.center;
      var point = new Point(pointer.x, pointer.y);

      while (sizes.length > memory) {
        sizes.shift();
      }

      var bottomX = void 0,
          bottomY = void 0,
          bottom = void 0,
          topX = void 0,
          topY = void 0,
          top = void 0,
          p0 = void 0,
          p1 = void 0,
          step = void 0,
          angle = void 0,
          dist = void 0,
          size = void 0;

      if (sizes.length > 0) {
        // not the first point, so we have others to compare to
        p0 = past;
        dist = util.delta(point, p0);
        size = dist * alpha;
        if (size >= max) size = max;
        // size = Math.max(Math.min(size, max), min); // clamp size to [min, max]
        // size = max - size;

        cumSize = 0;
        for (var j = 0; j < sizes.length; j++) {
          cumSize += sizes[j];
        }
        avgSize = Math.round((cumSize / sizes.length + size) / 2);
        // console.log(avgSize);

        angle = Math.atan2(point.y - p0.y, point.x - p0.x); // rad

        // Point(bottomX, bottomY) is bottom, Point(topX, topY) is top
        bottomX = point.x + Math.cos(angle + Math.PI / 2) * avgSize;
        bottomY = point.y + Math.sin(angle + Math.PI / 2) * avgSize;
        bottom = new Point(bottomX, bottomY);

        topX = point.x + Math.cos(angle - Math.PI / 2) * avgSize;
        topY = point.y + Math.sin(angle - Math.PI / 2) * avgSize;
        top = new Point(topX, topY);

        bounds.add(top);
        bounds.insert(0, bottom);
        // bounds.smooth();

        middle.add(point);
        // middle.smooth();
      } else {
        // don't have anything to compare to
        dist = 1;
        angle = 0;

        size = dist * alpha;
        size = Math.max(Math.min(size, max), min); // clamp size to [min, max]
      }

      paper.view.draw();

      past = point;
      sizes.push(size);
    }

    function panEnd(event) {
      if (pinching) return;

      var pointer = event.center;
      var point = new Point(pointer.x, pointer.y);

      var group = new Group([bounds, middle]);
      group.data.color = bounds.fillColor;
      group.data.update = true;

      bounds.add(point);
      bounds.flatten(4);
      bounds.smooth();
      bounds.simplify();
      bounds.closed = true;

      middle.add(point);
      middle.flatten(4);
      middle.smooth();
      middle.simplify();

      // util.trueGroup(group);

      var intersections = middle.getCrossings();
      if (intersections.length > 0) {
        // we create a copy of the path because resolveCrossings() splits source path
        var pathCopy = new Path();
        pathCopy.copyContent(middle);
        pathCopy.visible = false;

        var dividedPath = pathCopy.resolveCrossings();
        dividedPath.visible = false;

        var enclosedLoops = util.findInteriorCurves(dividedPath);

        if (enclosedLoops) {
          for (var i = 0; i < enclosedLoops.length; i++) {
            enclosedLoops[i].visible = true;
            enclosedLoops[i].closed = true;
            enclosedLoops[i].fillColor = new Color(0, 0); // transparent
            enclosedLoops[i].data.interior = true;
            enclosedLoops[i].data.transparent = true;
            // enclosedLoops[i].blendMode = 'multiply';
            group.addChild(enclosedLoops[i]);
            enclosedLoops[i].sendToBack();
          }
        }
        pathCopy.remove();
      } else {
        // console.log('no intersections');
      }

      group.data.color = bounds.fillColor;
      group.data.scale = 1; // init variable to track scale changes
      group.data.rotation = 0; // init variable to track rotation changes

      var children = group.getItems({
        match: function match(item) {
          return item.name !== 'middle';
        }
      });

      // console.log('-----');
      // console.log(group);
      // console.log(children);
      // group.selected = true;
      var unitedPath = new Path();
      if (children.length > 1) {
        var accumulator = new Path();
        accumulator.copyContent(children[0]);
        accumulator.visible = false;

        for (var _i = 1; _i < children.length; _i++) {
          var otherPath = new Path();
          otherPath.copyContent(children[_i]);
          otherPath.visible = false;

          unitedPath = accumulator.unite(otherPath);
          otherPath.remove();
          accumulator = unitedPath;
        }
      } else {
        // children[0] is united group
        unitedPath.copyContent(children[0]);
      }

      unitedPath.visible = false;
      unitedPath.data.name = 'mask';

      group.addChild(unitedPath);
      unitedPath.sendToBack();

      // check shape
      var shapeJSON = middle.exportJSON();
      var pathData = shape.processShapeData(shapeJSON);
      var shapePrediction = detector.spot(pathData);
      var shapePattern = void 0;
      if (shapePrediction.score > 0.5) {
        shapePattern = shapePrediction.pattern;
      } else {
        shapePattern = "other";
      }
      var colorName = color.getColorName(window.kan.currentColor);
      console.log(config.shapes[shapePattern]);
      console.log(sounds[shapePattern]);
      if (config.shapes[shapePattern].sprite) {
        console.log(colorName);
        sounds[shapePattern].play(colorName);
      } else {
        sounds[shapePattern].play();
      }
      console.log(shapePattern + '-' + colorName);

      lastChild = group;

      MOVES.push({
        type: 'newGroup',
        id: group.id
      });

      if (runAnimations) {
        group.animate([{
          properties: {
            scale: 0.9
          },
          settings: {
            duration: 100,
            easing: "easeOut"
          }
        }, {
          properties: {
            scale: 1.11
          },
          settings: {
            duration: 100,
            easing: "easeIn"
          }
        }]);
      }
    }

    var pinching = void 0;
    var pinchedGroup = void 0,
        lastScale = void 0,
        lastRotation = void 0;
    var originalPosition = void 0,
        originalRotation = void 0,
        originalScale = void 0;

    function pinchStart(event) {
      console.log('pinchStart', event.center);
      hammerManager.get('pan').set({ enable: false });
      var pointer = event.center,
          point = new Point(pointer.x, pointer.y),
          hitResult = hitTestGroupBounds(point);

      if (hitResult) {
        pinching = true;
        // pinchedGroup = hitResult.item.parent;
        pinchedGroup = hitResult;
        lastScale = 1;
        lastRotation = event.rotation;

        originalPosition = pinchedGroup.position;
        // originalRotation = pinchedGroup.rotation;
        originalRotation = pinchedGroup.data.rotation;
        originalScale = pinchedGroup.data.scale;

        if (runAnimations) {
          pinchedGroup.animate({
            properties: {
              scale: 1.25
            },
            settings: {
              duration: 100,
              easing: "easeOut"
            }
          });
        }
      } else {
        pinchedGroup = null;
        console.log('hit no item');
      }
    }

    function pinchMove(event) {
      console.log('pinchMove');
      if (!!pinchedGroup) {
        // console.log('pinchmove', event);
        // console.log(pinchedGroup);
        var currentScale = event.scale;
        var scaleDelta = currentScale / lastScale;
        // console.log(lastScale, currentScale, scaleDelta);
        lastScale = currentScale;

        var currentRotation = event.rotation;
        var rotationDelta = currentRotation - lastRotation;
        console.log(lastRotation, currentRotation, rotationDelta);
        lastRotation = currentRotation;

        // console.log(`scaling by ${scaleDelta}`);
        // console.log(`rotating by ${rotationDelta}`);

        pinchedGroup.position = event.center;
        pinchedGroup.scale(scaleDelta);
        pinchedGroup.rotate(rotationDelta);

        pinchedGroup.data.scale *= scaleDelta;
        pinchedGroup.data.rotation += rotationDelta;
      }
    }

    var lastEvent = void 0;
    function pinchEnd(event) {
      // wait 250 ms to prevent mistaken pan readings
      lastEvent = event;
      if (!!pinchedGroup) {
        pinchedGroup.data.update = true;
        var move = {
          id: pinchedGroup.id,
          type: 'transform'
        };
        if (pinchedGroup.position != originalPosition) {
          move.position = originalPosition;
        }

        if (pinchedGroup.data.rotation != originalRotation) {
          move.rotation = originalRotation - pinchedGroup.data.rotation;
        }

        if (pinchedGroup.data.scale != originalScale) {
          move.scale = originalScale / pinchedGroup.data.scale;
        }

        console.log('final scale', pinchedGroup.data.scale);
        console.log(move);

        MOVES.push(move);

        if (Math.abs(event.velocity) > 1) {
          // dispose of group offscreen
          throwPinchedGroup();
        }

        // if (runAnimations) {
        //   pinchedGroup.animate({
        //     properties: {
        //       scale: 0.8
        //     },
        //     settings: {
        //       duration: 100,
        //       easing: "easeOut",
        //     }
        //   });
        // }
      }
      pinching = false;
      setTimeout(function () {
        hammerManager.get('pan').set({ enable: true });
      }, 250);
    }

    var hitOptions = {
      segments: false,
      stroke: true,
      fill: true,
      tolerance: 5
    };

    function singleTap(event) {
      return;
      // const pointer = event.center,
      //     point = new Point(pointer.x, pointer.y),
      //     hitResult = paper.project.hitTest(point, hitOptions);
      //
      // if (hitResult) {
      //   let item = hitResult.item;
      //   item.selected = !item.selected;
      // }
    }

    function doubleTap(event) {
      var pointer = event.center,
          point = new Point(pointer.x, pointer.y),
          hitResult = paper.project.hitTest(point, hitOptions);

      if (hitResult) {
        var item = hitResult.item;
        var parent = item.parent;

        if (item.data.interior) {
          item.data.transparent = !item.data.transparent;

          if (item.data.transparent) {
            item.fillColor = transparent;
            item.strokeColor = transparent;
          } else {
            item.fillColor = parent.data.color;
            item.strokeColor = parent.data.color;
          }

          MOVES.push({
            type: 'fillChange',
            id: item.id,
            fill: parent.data.color,
            transparent: item.data.transparent
          });
        } else {
          console.log('not interior');
        }
      } else {
        pinchedGroup = null;
        console.log('hit no item');
      }
    }

    var velocityMultiplier = 25;
    function throwPinchedGroup() {
      console.log(pinchedGroup.position);
      if (pinchedGroup.position.x <= 0 - pinchedGroup.bounds.width || pinchedGroup.position.x >= viewWidth + pinchedGroup.bounds.width || pinchedGroup.position.y <= 0 - pinchedGroup.bounds.height || pinchedGroup.position.y >= viewHeight + pinchedGroup.bounds.height) {
        pinchedGroup.data.offScreen = true;
        pinchedGroup.visible = false;
        return;
      }
      requestAnimationFrame(throwPinchedGroup);
      pinchedGroup.position.x += lastEvent.velocityX * velocityMultiplier;
      pinchedGroup.position.y += lastEvent.velocityY * velocityMultiplier;
    }

    var hammerManager = new Hammer.Manager($canvas[0]);

    hammerManager.add(new Hammer.Tap({ event: 'doubletap', taps: 2 }));
    hammerManager.add(new Hammer.Tap({ event: 'singletap' }));
    hammerManager.add(new Hammer.Pan({ direction: Hammer.DIRECTION_ALL }));
    hammerManager.add(new Hammer.Pinch());

    hammerManager.get('doubletap').recognizeWith('singletap');
    hammerManager.get('singletap').requireFailure('doubletap');
    hammerManager.get('pan').requireFailure('pinch');

    hammerManager.on('singletap', singleTap);
    hammerManager.on('doubletap', doubleTap);

    hammerManager.on('panstart', panStart);
    hammerManager.on('panmove', panMove);
    hammerManager.on('panend', panEnd);

    hammerManager.on('pinchstart', pinchStart);
    hammerManager.on('pinchmove', pinchMove);
    hammerManager.on('pinchend', pinchEnd);
    hammerManager.on('pinchcancel', function () {
      hammerManager.get('pan').set({ enable: true });
    }); // make sure it's reenabled
  }

  function newPressed() {
    console.log('new pressed');

    paper.project.activeLayer.removeChildren();
  }

  function undoPressed() {
    console.log('undo pressed');
    if (!(MOVES.length > 0)) {
      console.log('no moves yet');
      return;
    }

    var lastMove = MOVES.pop();
    var item = project.getItem({
      id: lastMove.id
    });

    if (item) {
      item.visible = true; // make sure
      switch (lastMove.type) {
        case 'newGroup':
          console.log('removing group');
          item.remove();
          break;
        case 'fillChange':
          if (lastMove.transparent) {
            item.fillColor = lastMove.fill;
            item.strokeColor = lastMove.fill;
          } else {
            item.fillColor = transparent;
            item.strokeColor = transparent;
          }
        case 'transform':
          if (!!lastMove.position) {
            item.position = lastMove.position;
          }
          if (!!lastMove.rotation) {
            item.rotation = lastMove.rotation;
          }
          if (!!lastMove.scale) {
            item.scale(lastMove.scale);
          }
          break;
        default:
          console.log('unknown case');
      }
    } else {
      console.log('could not find matching item');
    }
  }

  function playPressed() {
    console.log('play pressed');
  }

  function tipsPressed() {
    console.log('tips pressed');
  }

  function sharePressed() {
    console.log('share pressed');
  }

  function initNew() {
    $('.main-controls .new').on('click tap touch', newPressed);
  }

  function initUndo() {
    $('.main-controls .undo').on('click', undoPressed);
  }
  function initPlay() {
    $('.main-controls .play').on('click', playPressed);
  }
  function initTips() {
    $('.aux-controls .tips').on('click', tipsPressed);
  }
  function initShare() {
    $('.aux-controls .share').on('click', sharePressed);
  }

  function drawCircle() {
    var circle = new Path.Circle({
      center: [400, 400],
      radius: 100,
      strokeColor: 'green',
      fillColor: 'green'
    });
    var group = new Group(circle);
  }

  function main() {
    initControlPanel();
    // drawCircle();
    initViewVars();
  }

  main();
});

},{"./../../config":1,"./color":4,"./lib/shape-detector":5,"./shape":7,"./sound":8,"./util":9,"hammerjs":2,"howler":3}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.processShapeData = processShapeData;
function processShapeData(json) {
  var returnShape = [];
  var jsonObj = JSON.parse(json)[1]; // zero index is stringified type (e.g. "Path")

  if ('segments' in jsonObj) {
    var segments = jsonObj.segments;
    Base.each(segments, function (segment, i) {
      var positionInfo = segment[0]; // indexes 1 and 2 are superfluous matrix details
      returnShape.push({
        x: positionInfo[0],
        y: positionInfo[1]
      });
    });
  }
  return returnShape;
}

},{}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initShapeSounds = initShapeSounds;
exports.formatShapeSoundData = formatShapeSoundData;
var config = require('./../../config');

function initShapeSounds() {
  var returnSounds = {};
  var extensions = ['ogg', 'm4a', 'mp3', 'ac3'];

  var shapePromises = [];
  Base.each(config.shapes, function (shape, shapeName) {
    // console.log(shape, shapeName);
    if (shape.sprite) {
      var shapeSoundJSONPath = './audio/shapes/' + shapeName + '/' + shapeName + '.json';
      var shapePromise = $.getJSON(shapeSoundJSONPath, function (resp) {
        var shapeSoundData = formatShapeSoundData(shapeName, resp);
        console.log(JSON.stringify(shapeSoundData));
        var sound = new Howl(shapeSoundData);
        returnSounds[shapeName] = sound;
      });
      shapePromises.push(shapePromise);
    } else {
      // let sound = new Howl({
      //   src: extensions.map((extension) => `./audio/shapes/${shape.name}/${shape.name}.${extension}`),
      // });
      // console.log({
      //   src: extensions.map((extension) => `./audio/shapes/${shape.name}/${shape.name}.${extension}`),
      // })
      var sound = new Howl({
        src: './audio/shapes/' + shapeName + '/' + shapeName + '.mp3'
      });
      returnSounds[shapeName] = sound;
    }
  });

  return $.when(shapePromises).then(function () {
    return returnSounds;
  });
}

function formatShapeSoundData(shapeName, data) {
  var returnData = {};

  returnData.src = data.resources.map(function (resource) {
    return './audio/shapes/' + shapeName + '/' + resource;
  });

  returnData.sprite = {};
  Base.each(data.spritemap, function (sprite, spriteName) {
    returnData.sprite[spriteName] = [sprite.start, sprite.end - sprite.start];
  });
  returnData.onend = function () {
    console.log('done');
  };
  returnData.html5 = true;

  return returnData;
}

},{"./../../config":1}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.rad = rad;
exports.deg = deg;
exports.delta = delta;
exports.findInteriorCurves = findInteriorCurves;
exports.trueGroup = trueGroup;
exports.truePath = truePath;
exports.checkPops = checkPops;
exports.overlaps = overlaps;
exports.mergeOnePath = mergeOnePath;
exports.mergePaths = mergePaths;
exports.hitTestBounds = hitTestBounds;
// Converts from degrees to radians.
function rad(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
function deg(radians) {
  return radians * 180 / Math.PI;
};

// distance between two points
function delta(p1, p2) {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2)); // pythagorean!
}

// returns an array of the interior curves of a given compound path
function findInteriorCurves(path) {
  var interiorCurves = [];
  if (!path || !path.children || !path.children.length) return;

  for (var i = 0; i < path.children.length; i++) {
    var child = path.children[i];

    if (child.closed) {
      interiorCurves.push(new Path(child.segments));
    }
  }

  path.remove();
  return interiorCurves;
}

function trueGroup(group) {
  var bounds = group._namedChildren.bounds[0],
      middle = group._namedChildren.middle[0];

  var middleCopy = new Path();
  middleCopy.copyContent(middle);
  middleCopy.visible = false;
  var dividedPath = middleCopy.resolveCrossings();
  dividedPath.visible = false;
  Base.each(dividedPath.children, function (child, i) {
    if (child.closed) {
      child.selected = false;
    } else {
      child.selected = true;
    }
    // console.log(child, i);
  });
}

function truePath(path) {
  // console.log(group);
  // if (path && path.children && path.children.length > 0 && path._namedChildren['middle']) {
  //   let pathCopy = new Path();
  //   console.log(path._namedChildren['middle']);
  //   pathCopy.copyContent(path._namedChildren['middle']);
  //   console.log(pathCopy);
  // }
}

function checkPops() {
  var groups = paper.project.getItems({
    className: 'Group',
    match: function match(el) {
      return !!el.data && el.data.update;
    }
  });
}

// https://groups.google.com/forum/#!topic/paperjs/UD8L0MTyReQ
function overlaps(path, other) {
  return !(path.getIntersections(other).length === 0);
}

// https://groups.google.com/forum/#!topic/paperjs/UD8L0MTyReQ
function mergeOnePath(path, others) {
  var i = void 0,
      merged = void 0,
      other = void 0,
      union = void 0,
      _i = void 0,
      _len = void 0,
      _ref = void 0;
  for (i = _i = 0, _len = others.length; _i < _len; i = ++_i) {
    other = others[i];
    if (overlaps(path, other)) {
      union = path.unite(other);
      merged = mergeOnePath(union, others.slice(i + 1));
      return (_ref = others.slice(0, i)).concat.apply(_ref, merged);
    }
  }
  return others.concat(path);
};

// https://groups.google.com/forum/#!topic/paperjs/UD8L0MTyReQ
function mergePaths(paths) {
  var path, result, _i, _len;
  result = [];
  for (_i = 0, _len = paths.length; _i < _len; _i++) {
    path = paths[_i];
    result = mergeOnePath(path, result);
  }
  return result;
};

function hitTestBounds(point, children) {
  if (!point) return null;

  for (var i = children.length - 1; i >= 0; i--) {
    var child = children[i];
    var bounds = child.strokeBounds;
    if (point.isInside(child.strokeBounds)) {
      return child;
    }
  }

  return null;
}

},{}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb25maWcuanMiLCJub2RlX21vZHVsZXMvaGFtbWVyanMvaGFtbWVyLmpzIiwibm9kZV9tb2R1bGVzL2hvd2xlci9kaXN0L2hvd2xlci5qcyIsInNyYy9qcy9jb2xvci5qcyIsInNyYy9qcy9saWIvc2hhcGUtZGV0ZWN0b3IuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9zaGFwZS5qcyIsInNyYy9qcy9zb3VuZC5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsVUFBUSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQXhELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFLEVBQXlGLFNBQXpGLEVBQW9HLFNBQXBHLEVBQStHLFNBQS9HLEVBQXlILFNBQXpILENBRFE7QUFFaEIsY0FBWTtBQUNWLGVBQVcsT0FERDtBQUVWLGVBQVcsTUFGRDtBQUdWLGVBQVcsTUFIRDtBQUlWLGVBQVcsTUFKRDtBQUtWLGVBQVcsS0FMRDtBQU1WLGVBQVcsS0FORDtBQU9WLGVBQVcsUUFQRDtBQVFWLGVBQVcsT0FSRDtBQVNWLGVBQVcsT0FURDtBQVVWLGVBQVcsUUFWRDtBQVdWLGVBQVcsT0FYRDtBQVlWLGVBQVc7QUFaRCxHQUZJO0FBZ0JoQixRQUFNLENBQUMsU0FBRCxFQUFZLFNBQVosRUFBdUIsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkMsU0FBN0MsQ0FoQlU7QUFpQmhCLGFBQVcsRUFqQks7QUFrQmhCLHFCQUFtQjtBQWxCSCxDQUFsQjs7QUFxQkEsUUFBUSxNQUFSLEdBQWlCO0FBQ2YsVUFBUTtBQUNOLFlBQVE7QUFERixHQURPO0FBSWYsWUFBVTtBQUNSLFlBQVE7QUFEQSxHQUpLO0FBT2YsWUFBVTtBQUNSLFlBQVE7QUFEQSxHQVBLO0FBVWYsY0FBWTtBQUNWLFlBQVE7QUFERSxHQVZHO0FBYWYsV0FBUztBQUNQLFlBQVE7QUFERDtBQWJNLENBQWpCOzs7QUNyQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25sRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtB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TSxRQUFOLENBQWUsTUFBTSxZQUFyQixDQUFKLEVBQXdDO0FBQ3RDLGFBQU8sS0FBUDtBQUNEO0FBQ0Y7O0FBRUQsU0FBTyxJQUFQO0FBQ0QiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiZXhwb3J0cy5wYWxldHRlID0ge1xuICBjb2xvcnM6IFtcIiMyMDE3MUNcIiwgXCIjMUUyQTQzXCIsIFwiIzI4Mzc3RFwiLCBcIiMzNTI3NDdcIiwgXCIjQ0EyRTI2XCIsIFwiIzlBMkExRlwiLCBcIiNEQTZDMjZcIiwgXCIjNDUzMTIxXCIsIFwiIzkxNkE0N1wiLCBcIiNEQUFEMjdcIiwgXCIjN0Y3RDMxXCIsXCIjMkI1RTJFXCJdLFxuICBjb2xvck5hbWVzOiB7XG4gICAgXCIjMjAxNzFDXCI6IFwiYmxhY2tcIixcbiAgICBcIiMxRTJBNDNcIjogXCJibHVlXCIsXG4gICAgXCIjMjgzNzdEXCI6IFwiYmx1ZVwiLFxuICAgIFwiIzM1Mjc0N1wiOiBcImJsdWVcIixcbiAgICBcIiNDQTJFMjZcIjogXCJyZWRcIixcbiAgICBcIiM5QTJBMUZcIjogXCJyZWRcIixcbiAgICBcIiNEQTZDMjZcIjogXCJvcmFuZ2VcIixcbiAgICBcIiM0NTMxMjFcIjogXCJicm93blwiLFxuICAgIFwiIzkxNkE0N1wiOiBcImJyb3duXCIsXG4gICAgXCIjREFBRDI3XCI6IFwib3JhbmdlXCIsXG4gICAgXCIjN0Y3RDMxXCI6IFwiZ3JlZW5cIixcbiAgICBcIiMyQjVFMkVcIjogXCJncmVlblwiXG4gIH0sXG4gIHBvcHM6IFtcIiMwMEFERUZcIiwgXCIjRjI4NUE1XCIsIFwiIzdEQzU3RlwiLCBcIiNGNkVCMTZcIiwgXCIjRjRFQUUwXCJdLFxuICBjb2xvclNpemU6IDIwLFxuICBzZWxlY3RlZENvbG9yU2l6ZTogMzBcbn1cblxuZXhwb3J0cy5zaGFwZXMgPSB7XG4gIFwibGluZVwiOiB7XG4gICAgc3ByaXRlOiBmYWxzZSxcbiAgfSxcbiAgXCJjaXJjbGVcIjoge1xuICAgIHNwcml0ZTogdHJ1ZSxcbiAgfSxcbiAgXCJzcXVhcmVcIjoge1xuICAgIHNwcml0ZTogdHJ1ZSxcbiAgfSxcbiAgXCJ0cmlhbmdsZVwiOiB7XG4gICAgc3ByaXRlOiBmYWxzZSxcbiAgfSxcbiAgXCJvdGhlclwiOiB7XG4gICAgc3ByaXRlOiBmYWxzZSxcbiAgfVxufTtcbiIsIi8qISBIYW1tZXIuSlMgLSB2Mi4wLjcgLSAyMDE2LTA0LTIyXG4gKiBodHRwOi8vaGFtbWVyanMuZ2l0aHViLmlvL1xuICpcbiAqIENvcHlyaWdodCAoYykgMjAxNiBKb3JpayBUYW5nZWxkZXI7XG4gKiBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UgKi9cbihmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBleHBvcnROYW1lLCB1bmRlZmluZWQpIHtcbiAgJ3VzZSBzdHJpY3QnO1xuXG52YXIgVkVORE9SX1BSRUZJWEVTID0gWycnLCAnd2Via2l0JywgJ01veicsICdNUycsICdtcycsICdvJ107XG52YXIgVEVTVF9FTEVNRU5UID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cbnZhciBUWVBFX0ZVTkNUSU9OID0gJ2Z1bmN0aW9uJztcblxudmFyIHJvdW5kID0gTWF0aC5yb3VuZDtcbnZhciBhYnMgPSBNYXRoLmFicztcbnZhciBub3cgPSBEYXRlLm5vdztcblxuLyoqXG4gKiBzZXQgYSB0aW1lb3V0IHdpdGggYSBnaXZlbiBzY29wZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7TnVtYmVyfSB0aW1lb3V0XG4gKiBAcGFyYW0ge09iamVjdH0gY29udGV4dFxuICogQHJldHVybnMge251bWJlcn1cbiAqL1xuZnVuY3Rpb24gc2V0VGltZW91dENvbnRleHQoZm4sIHRpbWVvdXQsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gc2V0VGltZW91dChiaW5kRm4oZm4sIGNvbnRleHQpLCB0aW1lb3V0KTtcbn1cblxuLyoqXG4gKiBpZiB0aGUgYXJndW1lbnQgaXMgYW4gYXJyYXksIHdlIHdhbnQgdG8gZXhlY3V0ZSB0aGUgZm4gb24gZWFjaCBlbnRyeVxuICogaWYgaXQgYWludCBhbiBhcnJheSB3ZSBkb24ndCB3YW50IHRvIGRvIGEgdGhpbmcuXG4gKiB0aGlzIGlzIHVzZWQgYnkgYWxsIHRoZSBtZXRob2RzIHRoYXQgYWNjZXB0IGEgc2luZ2xlIGFuZCBhcnJheSBhcmd1bWVudC5cbiAqIEBwYXJhbSB7KnxBcnJheX0gYXJnXG4gKiBAcGFyYW0ge1N0cmluZ30gZm5cbiAqIEBwYXJhbSB7T2JqZWN0fSBbY29udGV4dF1cbiAqIEByZXR1cm5zIHtCb29sZWFufVxuICovXG5mdW5jdGlvbiBpbnZva2VBcnJheUFyZyhhcmcsIGZuLCBjb250ZXh0KSB7XG4gICAgaWYgKEFycmF5LmlzQXJyYXkoYXJnKSkge1xuICAgICAgICBlYWNoKGFyZywgY29udGV4dFtmbl0sIGNvbnRleHQpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufVxuXG4vKipcbiAqIHdhbGsgb2JqZWN0cyBhbmQgYXJyYXlzXG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBpdGVyYXRvclxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAqL1xuZnVuY3Rpb24gZWFjaChvYmosIGl0ZXJhdG9yLCBjb250ZXh0KSB7XG4gICAgdmFyIGk7XG5cbiAgICBpZiAoIW9iaikge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKG9iai5mb3JFYWNoKSB7XG4gICAgICAgIG9iai5mb3JFYWNoKGl0ZXJhdG9yLCBjb250ZXh0KTtcbiAgICB9IGVsc2UgaWYgKG9iai5sZW5ndGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBpID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCBvYmoubGVuZ3RoKSB7XG4gICAgICAgICAgICBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAgIGZvciAoaSBpbiBvYmopIHtcbiAgICAgICAgICAgIG9iai5oYXNPd25Qcm9wZXJ0eShpKSAmJiBpdGVyYXRvci5jYWxsKGNvbnRleHQsIG9ialtpXSwgaSwgb2JqKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuLyoqXG4gKiB3cmFwIGEgbWV0aG9kIHdpdGggYSBkZXByZWNhdGlvbiB3YXJuaW5nIGFuZCBzdGFjayB0cmFjZVxuICogQHBhcmFtIHtGdW5jdGlvbn0gbWV0aG9kXG4gKiBAcGFyYW0ge1N0cmluZ30gbmFtZVxuICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2VcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn0gQSBuZXcgZnVuY3Rpb24gd3JhcHBpbmcgdGhlIHN1cHBsaWVkIG1ldGhvZC5cbiAqL1xuZnVuY3Rpb24gZGVwcmVjYXRlKG1ldGhvZCwgbmFtZSwgbWVzc2FnZSkge1xuICAgIHZhciBkZXByZWNhdGlvbk1lc3NhZ2UgPSAnREVQUkVDQVRFRCBNRVRIT0Q6ICcgKyBuYW1lICsgJ1xcbicgKyBtZXNzYWdlICsgJyBBVCBcXG4nO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGUgPSBuZXcgRXJyb3IoJ2dldC1zdGFjay10cmFjZScpO1xuICAgICAgICB2YXIgc3RhY2sgPSBlICYmIGUuc3RhY2sgPyBlLnN0YWNrLnJlcGxhY2UoL15bXlxcKF0rP1tcXG4kXS9nbSwgJycpXG4gICAgICAgICAgICAucmVwbGFjZSgvXlxccythdFxccysvZ20sICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL15PYmplY3QuPGFub255bW91cz5cXHMqXFwoL2dtLCAne2Fub255bW91c30oKUAnKSA6ICdVbmtub3duIFN0YWNrIFRyYWNlJztcblxuICAgICAgICB2YXIgbG9nID0gd2luZG93LmNvbnNvbGUgJiYgKHdpbmRvdy5jb25zb2xlLndhcm4gfHwgd2luZG93LmNvbnNvbGUubG9nKTtcbiAgICAgICAgaWYgKGxvZykge1xuICAgICAgICAgICAgbG9nLmNhbGwod2luZG93LmNvbnNvbGUsIGRlcHJlY2F0aW9uTWVzc2FnZSwgc3RhY2spO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBtZXRob2QuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xufVxuXG4vKipcbiAqIGV4dGVuZCBvYmplY3QuXG4gKiBtZWFucyB0aGF0IHByb3BlcnRpZXMgaW4gZGVzdCB3aWxsIGJlIG92ZXJ3cml0dGVuIGJ5IHRoZSBvbmVzIGluIHNyYy5cbiAqIEBwYXJhbSB7T2JqZWN0fSB0YXJnZXRcbiAqIEBwYXJhbSB7Li4uT2JqZWN0fSBvYmplY3RzX3RvX2Fzc2lnblxuICogQHJldHVybnMge09iamVjdH0gdGFyZ2V0XG4gKi9cbnZhciBhc3NpZ247XG5pZiAodHlwZW9mIE9iamVjdC5hc3NpZ24gIT09ICdmdW5jdGlvbicpIHtcbiAgICBhc3NpZ24gPSBmdW5jdGlvbiBhc3NpZ24odGFyZ2V0KSB7XG4gICAgICAgIGlmICh0YXJnZXQgPT09IHVuZGVmaW5lZCB8fCB0YXJnZXQgPT09IG51bGwpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Nhbm5vdCBjb252ZXJ0IHVuZGVmaW5lZCBvciBudWxsIHRvIG9iamVjdCcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIG91dHB1dCA9IE9iamVjdCh0YXJnZXQpO1xuICAgICAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgYXJndW1lbnRzLmxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF07XG4gICAgICAgICAgICBpZiAoc291cmNlICE9PSB1bmRlZmluZWQgJiYgc291cmNlICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgZm9yICh2YXIgbmV4dEtleSBpbiBzb3VyY2UpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHNvdXJjZS5oYXNPd25Qcm9wZXJ0eShuZXh0S2V5KSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgb3V0cHV0W25leHRLZXldID0gc291cmNlW25leHRLZXldO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgfTtcbn0gZWxzZSB7XG4gICAgYXNzaWduID0gT2JqZWN0LmFzc2lnbjtcbn1cblxuLyoqXG4gKiBleHRlbmQgb2JqZWN0LlxuICogbWVhbnMgdGhhdCBwcm9wZXJ0aWVzIGluIGRlc3Qgd2lsbCBiZSBvdmVyd3JpdHRlbiBieSB0aGUgb25lcyBpbiBzcmMuXG4gKiBAcGFyYW0ge09iamVjdH0gZGVzdFxuICogQHBhcmFtIHtPYmplY3R9IHNyY1xuICogQHBhcmFtIHtCb29sZWFufSBbbWVyZ2U9ZmFsc2VdXG4gKiBAcmV0dXJucyB7T2JqZWN0fSBkZXN0XG4gKi9cbnZhciBleHRlbmQgPSBkZXByZWNhdGUoZnVuY3Rpb24gZXh0ZW5kKGRlc3QsIHNyYywgbWVyZ2UpIHtcbiAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHNyYyk7XG4gICAgdmFyIGkgPSAwO1xuICAgIHdoaWxlIChpIDwga2V5cy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKCFtZXJnZSB8fCAobWVyZ2UgJiYgZGVzdFtrZXlzW2ldXSA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgZGVzdFtrZXlzW2ldXSA9IHNyY1trZXlzW2ldXTtcbiAgICAgICAgfVxuICAgICAgICBpKys7XG4gICAgfVxuICAgIHJldHVybiBkZXN0O1xufSwgJ2V4dGVuZCcsICdVc2UgYGFzc2lnbmAuJyk7XG5cbi8qKlxuICogbWVyZ2UgdGhlIHZhbHVlcyBmcm9tIHNyYyBpbiB0aGUgZGVzdC5cbiAqIG1lYW5zIHRoYXQgcHJvcGVydGllcyB0aGF0IGV4aXN0IGluIGRlc3Qgd2lsbCBub3QgYmUgb3ZlcndyaXR0ZW4gYnkgc3JjXG4gKiBAcGFyYW0ge09iamVjdH0gZGVzdFxuICogQHBhcmFtIHtPYmplY3R9IHNyY1xuICogQHJldHVybnMge09iamVjdH0gZGVzdFxuICovXG52YXIgbWVyZ2UgPSBkZXByZWNhdGUoZnVuY3Rpb24gbWVyZ2UoZGVzdCwgc3JjKSB7XG4gICAgcmV0dXJuIGV4dGVuZChkZXN0LCBzcmMsIHRydWUpO1xufSwgJ21lcmdlJywgJ1VzZSBgYXNzaWduYC4nKTtcblxuLyoqXG4gKiBzaW1wbGUgY2xhc3MgaW5oZXJpdGFuY2VcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNoaWxkXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBiYXNlXG4gKiBAcGFyYW0ge09iamVjdH0gW3Byb3BlcnRpZXNdXG4gKi9cbmZ1bmN0aW9uIGluaGVyaXQoY2hpbGQsIGJhc2UsIHByb3BlcnRpZXMpIHtcbiAgICB2YXIgYmFzZVAgPSBiYXNlLnByb3RvdHlwZSxcbiAgICAgICAgY2hpbGRQO1xuXG4gICAgY2hpbGRQID0gY2hpbGQucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZShiYXNlUCk7XG4gICAgY2hpbGRQLmNvbnN0cnVjdG9yID0gY2hpbGQ7XG4gICAgY2hpbGRQLl9zdXBlciA9IGJhc2VQO1xuXG4gICAgaWYgKHByb3BlcnRpZXMpIHtcbiAgICAgICAgYXNzaWduKGNoaWxkUCwgcHJvcGVydGllcyk7XG4gICAgfVxufVxuXG4vKipcbiAqIHNpbXBsZSBmdW5jdGlvbiBiaW5kXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmblxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAqIEByZXR1cm5zIHtGdW5jdGlvbn1cbiAqL1xuZnVuY3Rpb24gYmluZEZuKGZuLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uIGJvdW5kRm4oKSB7XG4gICAgICAgIHJldHVybiBmbi5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICAgIH07XG59XG5cbi8qKlxuICogbGV0IGEgYm9vbGVhbiB2YWx1ZSBhbHNvIGJlIGEgZnVuY3Rpb24gdGhhdCBtdXN0IHJldHVybiBhIGJvb2xlYW5cbiAqIHRoaXMgZmlyc3QgaXRlbSBpbiBhcmdzIHdpbGwgYmUgdXNlZCBhcyB0aGUgY29udGV4dFxuICogQHBhcmFtIHtCb29sZWFufEZ1bmN0aW9ufSB2YWxcbiAqIEBwYXJhbSB7QXJyYXl9IFthcmdzXVxuICogQHJldHVybnMge0Jvb2xlYW59XG4gKi9cbmZ1bmN0aW9uIGJvb2xPckZuKHZhbCwgYXJncykge1xuICAgIGlmICh0eXBlb2YgdmFsID09IFRZUEVfRlVOQ1RJT04pIHtcbiAgICAgICAgcmV0dXJuIHZhbC5hcHBseShhcmdzID8gYXJnc1swXSB8fCB1bmRlZmluZWQgOiB1bmRlZmluZWQsIGFyZ3MpO1xuICAgIH1cbiAgICByZXR1cm4gdmFsO1xufVxuXG4vKipcbiAqIHVzZSB0aGUgdmFsMiB3aGVuIHZhbDEgaXMgdW5kZWZpbmVkXG4gKiBAcGFyYW0geyp9IHZhbDFcbiAqIEBwYXJhbSB7Kn0gdmFsMlxuICogQHJldHVybnMgeyp9XG4gKi9cbmZ1bmN0aW9uIGlmVW5kZWZpbmVkKHZhbDEsIHZhbDIpIHtcbiAgICByZXR1cm4gKHZhbDEgPT09IHVuZGVmaW5lZCkgPyB2YWwyIDogdmFsMTtcbn1cblxuLyoqXG4gKiBhZGRFdmVudExpc3RlbmVyIHdpdGggbXVsdGlwbGUgZXZlbnRzIGF0IG9uY2VcbiAqIEBwYXJhbSB7RXZlbnRUYXJnZXR9IHRhcmdldFxuICogQHBhcmFtIHtTdHJpbmd9IHR5cGVzXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyXG4gKi9cbmZ1bmN0aW9uIGFkZEV2ZW50TGlzdGVuZXJzKHRhcmdldCwgdHlwZXMsIGhhbmRsZXIpIHtcbiAgICBlYWNoKHNwbGl0U3RyKHR5cGVzKSwgZnVuY3Rpb24odHlwZSkge1xuICAgICAgICB0YXJnZXQuYWRkRXZlbnRMaXN0ZW5lcih0eXBlLCBoYW5kbGVyLCBmYWxzZSk7XG4gICAgfSk7XG59XG5cbi8qKlxuICogcmVtb3ZlRXZlbnRMaXN0ZW5lciB3aXRoIG11bHRpcGxlIGV2ZW50cyBhdCBvbmNlXG4gKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fSB0YXJnZXRcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICovXG5mdW5jdGlvbiByZW1vdmVFdmVudExpc3RlbmVycyh0YXJnZXQsIHR5cGVzLCBoYW5kbGVyKSB7XG4gICAgZWFjaChzcGxpdFN0cih0eXBlcyksIGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIGZpbmQgaWYgYSBub2RlIGlzIGluIHRoZSBnaXZlbiBwYXJlbnRcbiAqIEBtZXRob2QgaGFzUGFyZW50XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBub2RlXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBwYXJlbnRcbiAqIEByZXR1cm4ge0Jvb2xlYW59IGZvdW5kXG4gKi9cbmZ1bmN0aW9uIGhhc1BhcmVudChub2RlLCBwYXJlbnQpIHtcbiAgICB3aGlsZSAobm9kZSkge1xuICAgICAgICBpZiAobm9kZSA9PSBwYXJlbnQpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIG5vZGUgPSBub2RlLnBhcmVudE5vZGU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiBzbWFsbCBpbmRleE9mIHdyYXBwZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEBwYXJhbSB7U3RyaW5nfSBmaW5kXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gZm91bmRcbiAqL1xuZnVuY3Rpb24gaW5TdHIoc3RyLCBmaW5kKSB7XG4gICAgcmV0dXJuIHN0ci5pbmRleE9mKGZpbmQpID4gLTE7XG59XG5cbi8qKlxuICogc3BsaXQgc3RyaW5nIG9uIHdoaXRlc3BhY2VcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHJcbiAqIEByZXR1cm5zIHtBcnJheX0gd29yZHNcbiAqL1xuZnVuY3Rpb24gc3BsaXRTdHIoc3RyKSB7XG4gICAgcmV0dXJuIHN0ci50cmltKCkuc3BsaXQoL1xccysvZyk7XG59XG5cbi8qKlxuICogZmluZCBpZiBhIGFycmF5IGNvbnRhaW5zIHRoZSBvYmplY3QgdXNpbmcgaW5kZXhPZiBvciBhIHNpbXBsZSBwb2x5RmlsbFxuICogQHBhcmFtIHtBcnJheX0gc3JjXG4gKiBAcGFyYW0ge1N0cmluZ30gZmluZFxuICogQHBhcmFtIHtTdHJpbmd9IFtmaW5kQnlLZXldXG4gKiBAcmV0dXJuIHtCb29sZWFufE51bWJlcn0gZmFsc2Ugd2hlbiBub3QgZm91bmQsIG9yIHRoZSBpbmRleFxuICovXG5mdW5jdGlvbiBpbkFycmF5KHNyYywgZmluZCwgZmluZEJ5S2V5KSB7XG4gICAgaWYgKHNyYy5pbmRleE9mICYmICFmaW5kQnlLZXkpIHtcbiAgICAgICAgcmV0dXJuIHNyYy5pbmRleE9mKGZpbmQpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCBzcmMubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoKGZpbmRCeUtleSAmJiBzcmNbaV1bZmluZEJ5S2V5XSA9PSBmaW5kKSB8fCAoIWZpbmRCeUtleSAmJiBzcmNbaV0gPT09IGZpbmQpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIC0xO1xuICAgIH1cbn1cblxuLyoqXG4gKiBjb252ZXJ0IGFycmF5LWxpa2Ugb2JqZWN0cyB0byByZWFsIGFycmF5c1xuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHJldHVybnMge0FycmF5fVxuICovXG5mdW5jdGlvbiB0b0FycmF5KG9iaikge1xuICAgIHJldHVybiBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChvYmosIDApO1xufVxuXG4vKipcbiAqIHVuaXF1ZSBhcnJheSB3aXRoIG9iamVjdHMgYmFzZWQgb24gYSBrZXkgKGxpa2UgJ2lkJykgb3IganVzdCBieSB0aGUgYXJyYXkncyB2YWx1ZVxuICogQHBhcmFtIHtBcnJheX0gc3JjIFt7aWQ6MX0se2lkOjJ9LHtpZDoxfV1cbiAqIEBwYXJhbSB7U3RyaW5nfSBba2V5XVxuICogQHBhcmFtIHtCb29sZWFufSBbc29ydD1GYWxzZV1cbiAqIEByZXR1cm5zIHtBcnJheX0gW3tpZDoxfSx7aWQ6Mn1dXG4gKi9cbmZ1bmN0aW9uIHVuaXF1ZUFycmF5KHNyYywga2V5LCBzb3J0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICB2YXIgdmFsdWVzID0gW107XG4gICAgdmFyIGkgPSAwO1xuXG4gICAgd2hpbGUgKGkgPCBzcmMubGVuZ3RoKSB7XG4gICAgICAgIHZhciB2YWwgPSBrZXkgPyBzcmNbaV1ba2V5XSA6IHNyY1tpXTtcbiAgICAgICAgaWYgKGluQXJyYXkodmFsdWVzLCB2YWwpIDwgMCkge1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKHNyY1tpXSk7XG4gICAgICAgIH1cbiAgICAgICAgdmFsdWVzW2ldID0gdmFsO1xuICAgICAgICBpKys7XG4gICAgfVxuXG4gICAgaWYgKHNvcnQpIHtcbiAgICAgICAgaWYgKCFrZXkpIHtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLnNvcnQoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLnNvcnQoZnVuY3Rpb24gc29ydFVuaXF1ZUFycmF5KGEsIGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYVtrZXldID4gYltrZXldO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gcmVzdWx0cztcbn1cblxuLyoqXG4gKiBnZXQgdGhlIHByZWZpeGVkIHByb3BlcnR5XG4gKiBAcGFyYW0ge09iamVjdH0gb2JqXG4gKiBAcGFyYW0ge1N0cmluZ30gcHJvcGVydHlcbiAqIEByZXR1cm5zIHtTdHJpbmd8VW5kZWZpbmVkfSBwcmVmaXhlZFxuICovXG5mdW5jdGlvbiBwcmVmaXhlZChvYmosIHByb3BlcnR5KSB7XG4gICAgdmFyIHByZWZpeCwgcHJvcDtcbiAgICB2YXIgY2FtZWxQcm9wID0gcHJvcGVydHlbMF0udG9VcHBlckNhc2UoKSArIHByb3BlcnR5LnNsaWNlKDEpO1xuXG4gICAgdmFyIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgVkVORE9SX1BSRUZJWEVTLmxlbmd0aCkge1xuICAgICAgICBwcmVmaXggPSBWRU5ET1JfUFJFRklYRVNbaV07XG4gICAgICAgIHByb3AgPSAocHJlZml4KSA/IHByZWZpeCArIGNhbWVsUHJvcCA6IHByb3BlcnR5O1xuXG4gICAgICAgIGlmIChwcm9wIGluIG9iaikge1xuICAgICAgICAgICAgcmV0dXJuIHByb3A7XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgIH1cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG4vKipcbiAqIGdldCBhIHVuaXF1ZSBpZFxuICogQHJldHVybnMge251bWJlcn0gdW5pcXVlSWRcbiAqL1xudmFyIF91bmlxdWVJZCA9IDE7XG5mdW5jdGlvbiB1bmlxdWVJZCgpIHtcbiAgICByZXR1cm4gX3VuaXF1ZUlkKys7XG59XG5cbi8qKlxuICogZ2V0IHRoZSB3aW5kb3cgb2JqZWN0IG9mIGFuIGVsZW1lbnRcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAqIEByZXR1cm5zIHtEb2N1bWVudFZpZXd8V2luZG93fVxuICovXG5mdW5jdGlvbiBnZXRXaW5kb3dGb3JFbGVtZW50KGVsZW1lbnQpIHtcbiAgICB2YXIgZG9jID0gZWxlbWVudC5vd25lckRvY3VtZW50IHx8IGVsZW1lbnQ7XG4gICAgcmV0dXJuIChkb2MuZGVmYXVsdFZpZXcgfHwgZG9jLnBhcmVudFdpbmRvdyB8fCB3aW5kb3cpO1xufVxuXG52YXIgTU9CSUxFX1JFR0VYID0gL21vYmlsZXx0YWJsZXR8aXAoYWR8aG9uZXxvZCl8YW5kcm9pZC9pO1xuXG52YXIgU1VQUE9SVF9UT1VDSCA9ICgnb250b3VjaHN0YXJ0JyBpbiB3aW5kb3cpO1xudmFyIFNVUFBPUlRfUE9JTlRFUl9FVkVOVFMgPSBwcmVmaXhlZCh3aW5kb3csICdQb2ludGVyRXZlbnQnKSAhPT0gdW5kZWZpbmVkO1xudmFyIFNVUFBPUlRfT05MWV9UT1VDSCA9IFNVUFBPUlRfVE9VQ0ggJiYgTU9CSUxFX1JFR0VYLnRlc3QobmF2aWdhdG9yLnVzZXJBZ2VudCk7XG5cbnZhciBJTlBVVF9UWVBFX1RPVUNIID0gJ3RvdWNoJztcbnZhciBJTlBVVF9UWVBFX1BFTiA9ICdwZW4nO1xudmFyIElOUFVUX1RZUEVfTU9VU0UgPSAnbW91c2UnO1xudmFyIElOUFVUX1RZUEVfS0lORUNUID0gJ2tpbmVjdCc7XG5cbnZhciBDT01QVVRFX0lOVEVSVkFMID0gMjU7XG5cbnZhciBJTlBVVF9TVEFSVCA9IDE7XG52YXIgSU5QVVRfTU9WRSA9IDI7XG52YXIgSU5QVVRfRU5EID0gNDtcbnZhciBJTlBVVF9DQU5DRUwgPSA4O1xuXG52YXIgRElSRUNUSU9OX05PTkUgPSAxO1xudmFyIERJUkVDVElPTl9MRUZUID0gMjtcbnZhciBESVJFQ1RJT05fUklHSFQgPSA0O1xudmFyIERJUkVDVElPTl9VUCA9IDg7XG52YXIgRElSRUNUSU9OX0RPV04gPSAxNjtcblxudmFyIERJUkVDVElPTl9IT1JJWk9OVEFMID0gRElSRUNUSU9OX0xFRlQgfCBESVJFQ1RJT05fUklHSFQ7XG52YXIgRElSRUNUSU9OX1ZFUlRJQ0FMID0gRElSRUNUSU9OX1VQIHwgRElSRUNUSU9OX0RPV047XG52YXIgRElSRUNUSU9OX0FMTCA9IERJUkVDVElPTl9IT1JJWk9OVEFMIHwgRElSRUNUSU9OX1ZFUlRJQ0FMO1xuXG52YXIgUFJPUFNfWFkgPSBbJ3gnLCAneSddO1xudmFyIFBST1BTX0NMSUVOVF9YWSA9IFsnY2xpZW50WCcsICdjbGllbnRZJ107XG5cbi8qKlxuICogY3JlYXRlIG5ldyBpbnB1dCB0eXBlIG1hbmFnZXJcbiAqIEBwYXJhbSB7TWFuYWdlcn0gbWFuYWdlclxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtJbnB1dH1cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBJbnB1dChtYW5hZ2VyLCBjYWxsYmFjaykge1xuICAgIHZhciBzZWxmID0gdGhpcztcbiAgICB0aGlzLm1hbmFnZXIgPSBtYW5hZ2VyO1xuICAgIHRoaXMuY2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB0aGlzLmVsZW1lbnQgPSBtYW5hZ2VyLmVsZW1lbnQ7XG4gICAgdGhpcy50YXJnZXQgPSBtYW5hZ2VyLm9wdGlvbnMuaW5wdXRUYXJnZXQ7XG5cbiAgICAvLyBzbWFsbGVyIHdyYXBwZXIgYXJvdW5kIHRoZSBoYW5kbGVyLCBmb3IgdGhlIHNjb3BlIGFuZCB0aGUgZW5hYmxlZCBzdGF0ZSBvZiB0aGUgbWFuYWdlcixcbiAgICAvLyBzbyB3aGVuIGRpc2FibGVkIHRoZSBpbnB1dCBldmVudHMgYXJlIGNvbXBsZXRlbHkgYnlwYXNzZWQuXG4gICAgdGhpcy5kb21IYW5kbGVyID0gZnVuY3Rpb24oZXYpIHtcbiAgICAgICAgaWYgKGJvb2xPckZuKG1hbmFnZXIub3B0aW9ucy5lbmFibGUsIFttYW5hZ2VyXSkpIHtcbiAgICAgICAgICAgIHNlbGYuaGFuZGxlcihldik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgdGhpcy5pbml0KCk7XG5cbn1cblxuSW5wdXQucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIHNob3VsZCBoYW5kbGUgdGhlIGlucHV0RXZlbnQgZGF0YSBhbmQgdHJpZ2dlciB0aGUgY2FsbGJhY2tcbiAgICAgKiBAdmlydHVhbFxuICAgICAqL1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uKCkgeyB9LFxuXG4gICAgLyoqXG4gICAgICogYmluZCB0aGUgZXZlbnRzXG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZXZFbCAmJiBhZGRFdmVudExpc3RlbmVycyh0aGlzLmVsZW1lbnQsIHRoaXMuZXZFbCwgdGhpcy5kb21IYW5kbGVyKTtcbiAgICAgICAgdGhpcy5ldlRhcmdldCAmJiBhZGRFdmVudExpc3RlbmVycyh0aGlzLnRhcmdldCwgdGhpcy5ldlRhcmdldCwgdGhpcy5kb21IYW5kbGVyKTtcbiAgICAgICAgdGhpcy5ldldpbiAmJiBhZGRFdmVudExpc3RlbmVycyhnZXRXaW5kb3dGb3JFbGVtZW50KHRoaXMuZWxlbWVudCksIHRoaXMuZXZXaW4sIHRoaXMuZG9tSGFuZGxlcik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHVuYmluZCB0aGUgZXZlbnRzXG4gICAgICovXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZXZFbCAmJiByZW1vdmVFdmVudExpc3RlbmVycyh0aGlzLmVsZW1lbnQsIHRoaXMuZXZFbCwgdGhpcy5kb21IYW5kbGVyKTtcbiAgICAgICAgdGhpcy5ldlRhcmdldCAmJiByZW1vdmVFdmVudExpc3RlbmVycyh0aGlzLnRhcmdldCwgdGhpcy5ldlRhcmdldCwgdGhpcy5kb21IYW5kbGVyKTtcbiAgICAgICAgdGhpcy5ldldpbiAmJiByZW1vdmVFdmVudExpc3RlbmVycyhnZXRXaW5kb3dGb3JFbGVtZW50KHRoaXMuZWxlbWVudCksIHRoaXMuZXZXaW4sIHRoaXMuZG9tSGFuZGxlcik7XG4gICAgfVxufTtcblxuLyoqXG4gKiBjcmVhdGUgbmV3IGlucHV0IHR5cGUgbWFuYWdlclxuICogY2FsbGVkIGJ5IHRoZSBNYW5hZ2VyIGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge0hhbW1lcn0gbWFuYWdlclxuICogQHJldHVybnMge0lucHV0fVxuICovXG5mdW5jdGlvbiBjcmVhdGVJbnB1dEluc3RhbmNlKG1hbmFnZXIpIHtcbiAgICB2YXIgVHlwZTtcbiAgICB2YXIgaW5wdXRDbGFzcyA9IG1hbmFnZXIub3B0aW9ucy5pbnB1dENsYXNzO1xuXG4gICAgaWYgKGlucHV0Q2xhc3MpIHtcbiAgICAgICAgVHlwZSA9IGlucHV0Q2xhc3M7XG4gICAgfSBlbHNlIGlmIChTVVBQT1JUX1BPSU5URVJfRVZFTlRTKSB7XG4gICAgICAgIFR5cGUgPSBQb2ludGVyRXZlbnRJbnB1dDtcbiAgICB9IGVsc2UgaWYgKFNVUFBPUlRfT05MWV9UT1VDSCkge1xuICAgICAgICBUeXBlID0gVG91Y2hJbnB1dDtcbiAgICB9IGVsc2UgaWYgKCFTVVBQT1JUX1RPVUNIKSB7XG4gICAgICAgIFR5cGUgPSBNb3VzZUlucHV0O1xuICAgIH0gZWxzZSB7XG4gICAgICAgIFR5cGUgPSBUb3VjaE1vdXNlSW5wdXQ7XG4gICAgfVxuICAgIHJldHVybiBuZXcgKFR5cGUpKG1hbmFnZXIsIGlucHV0SGFuZGxlcik7XG59XG5cbi8qKlxuICogaGFuZGxlIGlucHV0IGV2ZW50c1xuICogQHBhcmFtIHtNYW5hZ2VyfSBtYW5hZ2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRUeXBlXG4gKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAqL1xuZnVuY3Rpb24gaW5wdXRIYW5kbGVyKG1hbmFnZXIsIGV2ZW50VHlwZSwgaW5wdXQpIHtcbiAgICB2YXIgcG9pbnRlcnNMZW4gPSBpbnB1dC5wb2ludGVycy5sZW5ndGg7XG4gICAgdmFyIGNoYW5nZWRQb2ludGVyc0xlbiA9IGlucHV0LmNoYW5nZWRQb2ludGVycy5sZW5ndGg7XG4gICAgdmFyIGlzRmlyc3QgPSAoZXZlbnRUeXBlICYgSU5QVVRfU1RBUlQgJiYgKHBvaW50ZXJzTGVuIC0gY2hhbmdlZFBvaW50ZXJzTGVuID09PSAwKSk7XG4gICAgdmFyIGlzRmluYWwgPSAoZXZlbnRUeXBlICYgKElOUFVUX0VORCB8IElOUFVUX0NBTkNFTCkgJiYgKHBvaW50ZXJzTGVuIC0gY2hhbmdlZFBvaW50ZXJzTGVuID09PSAwKSk7XG5cbiAgICBpbnB1dC5pc0ZpcnN0ID0gISFpc0ZpcnN0O1xuICAgIGlucHV0LmlzRmluYWwgPSAhIWlzRmluYWw7XG5cbiAgICBpZiAoaXNGaXJzdCkge1xuICAgICAgICBtYW5hZ2VyLnNlc3Npb24gPSB7fTtcbiAgICB9XG5cbiAgICAvLyBzb3VyY2UgZXZlbnQgaXMgdGhlIG5vcm1hbGl6ZWQgdmFsdWUgb2YgdGhlIGRvbUV2ZW50c1xuICAgIC8vIGxpa2UgJ3RvdWNoc3RhcnQsIG1vdXNldXAsIHBvaW50ZXJkb3duJ1xuICAgIGlucHV0LmV2ZW50VHlwZSA9IGV2ZW50VHlwZTtcblxuICAgIC8vIGNvbXB1dGUgc2NhbGUsIHJvdGF0aW9uIGV0Y1xuICAgIGNvbXB1dGVJbnB1dERhdGEobWFuYWdlciwgaW5wdXQpO1xuXG4gICAgLy8gZW1pdCBzZWNyZXQgZXZlbnRcbiAgICBtYW5hZ2VyLmVtaXQoJ2hhbW1lci5pbnB1dCcsIGlucHV0KTtcblxuICAgIG1hbmFnZXIucmVjb2duaXplKGlucHV0KTtcbiAgICBtYW5hZ2VyLnNlc3Npb24ucHJldklucHV0ID0gaW5wdXQ7XG59XG5cbi8qKlxuICogZXh0ZW5kIHRoZSBkYXRhIHdpdGggc29tZSB1c2FibGUgcHJvcGVydGllcyBsaWtlIHNjYWxlLCByb3RhdGUsIHZlbG9jaXR5IGV0Y1xuICogQHBhcmFtIHtPYmplY3R9IG1hbmFnZXJcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dFxuICovXG5mdW5jdGlvbiBjb21wdXRlSW5wdXREYXRhKG1hbmFnZXIsIGlucHV0KSB7XG4gICAgdmFyIHNlc3Npb24gPSBtYW5hZ2VyLnNlc3Npb247XG4gICAgdmFyIHBvaW50ZXJzID0gaW5wdXQucG9pbnRlcnM7XG4gICAgdmFyIHBvaW50ZXJzTGVuZ3RoID0gcG9pbnRlcnMubGVuZ3RoO1xuXG4gICAgLy8gc3RvcmUgdGhlIGZpcnN0IGlucHV0IHRvIGNhbGN1bGF0ZSB0aGUgZGlzdGFuY2UgYW5kIGRpcmVjdGlvblxuICAgIGlmICghc2Vzc2lvbi5maXJzdElucHV0KSB7XG4gICAgICAgIHNlc3Npb24uZmlyc3RJbnB1dCA9IHNpbXBsZUNsb25lSW5wdXREYXRhKGlucHV0KTtcbiAgICB9XG5cbiAgICAvLyB0byBjb21wdXRlIHNjYWxlIGFuZCByb3RhdGlvbiB3ZSBuZWVkIHRvIHN0b3JlIHRoZSBtdWx0aXBsZSB0b3VjaGVzXG4gICAgaWYgKHBvaW50ZXJzTGVuZ3RoID4gMSAmJiAhc2Vzc2lvbi5maXJzdE11bHRpcGxlKSB7XG4gICAgICAgIHNlc3Npb24uZmlyc3RNdWx0aXBsZSA9IHNpbXBsZUNsb25lSW5wdXREYXRhKGlucHV0KTtcbiAgICB9IGVsc2UgaWYgKHBvaW50ZXJzTGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHNlc3Npb24uZmlyc3RNdWx0aXBsZSA9IGZhbHNlO1xuICAgIH1cblxuICAgIHZhciBmaXJzdElucHV0ID0gc2Vzc2lvbi5maXJzdElucHV0O1xuICAgIHZhciBmaXJzdE11bHRpcGxlID0gc2Vzc2lvbi5maXJzdE11bHRpcGxlO1xuICAgIHZhciBvZmZzZXRDZW50ZXIgPSBmaXJzdE11bHRpcGxlID8gZmlyc3RNdWx0aXBsZS5jZW50ZXIgOiBmaXJzdElucHV0LmNlbnRlcjtcblxuICAgIHZhciBjZW50ZXIgPSBpbnB1dC5jZW50ZXIgPSBnZXRDZW50ZXIocG9pbnRlcnMpO1xuICAgIGlucHV0LnRpbWVTdGFtcCA9IG5vdygpO1xuICAgIGlucHV0LmRlbHRhVGltZSA9IGlucHV0LnRpbWVTdGFtcCAtIGZpcnN0SW5wdXQudGltZVN0YW1wO1xuXG4gICAgaW5wdXQuYW5nbGUgPSBnZXRBbmdsZShvZmZzZXRDZW50ZXIsIGNlbnRlcik7XG4gICAgaW5wdXQuZGlzdGFuY2UgPSBnZXREaXN0YW5jZShvZmZzZXRDZW50ZXIsIGNlbnRlcik7XG5cbiAgICBjb21wdXRlRGVsdGFYWShzZXNzaW9uLCBpbnB1dCk7XG4gICAgaW5wdXQub2Zmc2V0RGlyZWN0aW9uID0gZ2V0RGlyZWN0aW9uKGlucHV0LmRlbHRhWCwgaW5wdXQuZGVsdGFZKTtcblxuICAgIHZhciBvdmVyYWxsVmVsb2NpdHkgPSBnZXRWZWxvY2l0eShpbnB1dC5kZWx0YVRpbWUsIGlucHV0LmRlbHRhWCwgaW5wdXQuZGVsdGFZKTtcbiAgICBpbnB1dC5vdmVyYWxsVmVsb2NpdHlYID0gb3ZlcmFsbFZlbG9jaXR5Lng7XG4gICAgaW5wdXQub3ZlcmFsbFZlbG9jaXR5WSA9IG92ZXJhbGxWZWxvY2l0eS55O1xuICAgIGlucHV0Lm92ZXJhbGxWZWxvY2l0eSA9IChhYnMob3ZlcmFsbFZlbG9jaXR5LngpID4gYWJzKG92ZXJhbGxWZWxvY2l0eS55KSkgPyBvdmVyYWxsVmVsb2NpdHkueCA6IG92ZXJhbGxWZWxvY2l0eS55O1xuXG4gICAgaW5wdXQuc2NhbGUgPSBmaXJzdE11bHRpcGxlID8gZ2V0U2NhbGUoZmlyc3RNdWx0aXBsZS5wb2ludGVycywgcG9pbnRlcnMpIDogMTtcbiAgICBpbnB1dC5yb3RhdGlvbiA9IGZpcnN0TXVsdGlwbGUgPyBnZXRSb3RhdGlvbihmaXJzdE11bHRpcGxlLnBvaW50ZXJzLCBwb2ludGVycykgOiAwO1xuXG4gICAgaW5wdXQubWF4UG9pbnRlcnMgPSAhc2Vzc2lvbi5wcmV2SW5wdXQgPyBpbnB1dC5wb2ludGVycy5sZW5ndGggOiAoKGlucHV0LnBvaW50ZXJzLmxlbmd0aCA+XG4gICAgICAgIHNlc3Npb24ucHJldklucHV0Lm1heFBvaW50ZXJzKSA/IGlucHV0LnBvaW50ZXJzLmxlbmd0aCA6IHNlc3Npb24ucHJldklucHV0Lm1heFBvaW50ZXJzKTtcblxuICAgIGNvbXB1dGVJbnRlcnZhbElucHV0RGF0YShzZXNzaW9uLCBpbnB1dCk7XG5cbiAgICAvLyBmaW5kIHRoZSBjb3JyZWN0IHRhcmdldFxuICAgIHZhciB0YXJnZXQgPSBtYW5hZ2VyLmVsZW1lbnQ7XG4gICAgaWYgKGhhc1BhcmVudChpbnB1dC5zcmNFdmVudC50YXJnZXQsIHRhcmdldCkpIHtcbiAgICAgICAgdGFyZ2V0ID0gaW5wdXQuc3JjRXZlbnQudGFyZ2V0O1xuICAgIH1cbiAgICBpbnB1dC50YXJnZXQgPSB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGNvbXB1dGVEZWx0YVhZKHNlc3Npb24sIGlucHV0KSB7XG4gICAgdmFyIGNlbnRlciA9IGlucHV0LmNlbnRlcjtcbiAgICB2YXIgb2Zmc2V0ID0gc2Vzc2lvbi5vZmZzZXREZWx0YSB8fCB7fTtcbiAgICB2YXIgcHJldkRlbHRhID0gc2Vzc2lvbi5wcmV2RGVsdGEgfHwge307XG4gICAgdmFyIHByZXZJbnB1dCA9IHNlc3Npb24ucHJldklucHV0IHx8IHt9O1xuXG4gICAgaWYgKGlucHV0LmV2ZW50VHlwZSA9PT0gSU5QVVRfU1RBUlQgfHwgcHJldklucHV0LmV2ZW50VHlwZSA9PT0gSU5QVVRfRU5EKSB7XG4gICAgICAgIHByZXZEZWx0YSA9IHNlc3Npb24ucHJldkRlbHRhID0ge1xuICAgICAgICAgICAgeDogcHJldklucHV0LmRlbHRhWCB8fCAwLFxuICAgICAgICAgICAgeTogcHJldklucHV0LmRlbHRhWSB8fCAwXG4gICAgICAgIH07XG5cbiAgICAgICAgb2Zmc2V0ID0gc2Vzc2lvbi5vZmZzZXREZWx0YSA9IHtcbiAgICAgICAgICAgIHg6IGNlbnRlci54LFxuICAgICAgICAgICAgeTogY2VudGVyLnlcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBpbnB1dC5kZWx0YVggPSBwcmV2RGVsdGEueCArIChjZW50ZXIueCAtIG9mZnNldC54KTtcbiAgICBpbnB1dC5kZWx0YVkgPSBwcmV2RGVsdGEueSArIChjZW50ZXIueSAtIG9mZnNldC55KTtcbn1cblxuLyoqXG4gKiB2ZWxvY2l0eSBpcyBjYWxjdWxhdGVkIGV2ZXJ5IHggbXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBzZXNzaW9uXG4gKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAqL1xuZnVuY3Rpb24gY29tcHV0ZUludGVydmFsSW5wdXREYXRhKHNlc3Npb24sIGlucHV0KSB7XG4gICAgdmFyIGxhc3QgPSBzZXNzaW9uLmxhc3RJbnRlcnZhbCB8fCBpbnB1dCxcbiAgICAgICAgZGVsdGFUaW1lID0gaW5wdXQudGltZVN0YW1wIC0gbGFzdC50aW1lU3RhbXAsXG4gICAgICAgIHZlbG9jaXR5LCB2ZWxvY2l0eVgsIHZlbG9jaXR5WSwgZGlyZWN0aW9uO1xuXG4gICAgaWYgKGlucHV0LmV2ZW50VHlwZSAhPSBJTlBVVF9DQU5DRUwgJiYgKGRlbHRhVGltZSA+IENPTVBVVEVfSU5URVJWQUwgfHwgbGFzdC52ZWxvY2l0eSA9PT0gdW5kZWZpbmVkKSkge1xuICAgICAgICB2YXIgZGVsdGFYID0gaW5wdXQuZGVsdGFYIC0gbGFzdC5kZWx0YVg7XG4gICAgICAgIHZhciBkZWx0YVkgPSBpbnB1dC5kZWx0YVkgLSBsYXN0LmRlbHRhWTtcblxuICAgICAgICB2YXIgdiA9IGdldFZlbG9jaXR5KGRlbHRhVGltZSwgZGVsdGFYLCBkZWx0YVkpO1xuICAgICAgICB2ZWxvY2l0eVggPSB2Lng7XG4gICAgICAgIHZlbG9jaXR5WSA9IHYueTtcbiAgICAgICAgdmVsb2NpdHkgPSAoYWJzKHYueCkgPiBhYnModi55KSkgPyB2LnggOiB2Lnk7XG4gICAgICAgIGRpcmVjdGlvbiA9IGdldERpcmVjdGlvbihkZWx0YVgsIGRlbHRhWSk7XG5cbiAgICAgICAgc2Vzc2lvbi5sYXN0SW50ZXJ2YWwgPSBpbnB1dDtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvLyB1c2UgbGF0ZXN0IHZlbG9jaXR5IGluZm8gaWYgaXQgZG9lc24ndCBvdmVydGFrZSBhIG1pbmltdW0gcGVyaW9kXG4gICAgICAgIHZlbG9jaXR5ID0gbGFzdC52ZWxvY2l0eTtcbiAgICAgICAgdmVsb2NpdHlYID0gbGFzdC52ZWxvY2l0eVg7XG4gICAgICAgIHZlbG9jaXR5WSA9IGxhc3QudmVsb2NpdHlZO1xuICAgICAgICBkaXJlY3Rpb24gPSBsYXN0LmRpcmVjdGlvbjtcbiAgICB9XG5cbiAgICBpbnB1dC52ZWxvY2l0eSA9IHZlbG9jaXR5O1xuICAgIGlucHV0LnZlbG9jaXR5WCA9IHZlbG9jaXR5WDtcbiAgICBpbnB1dC52ZWxvY2l0eVkgPSB2ZWxvY2l0eVk7XG4gICAgaW5wdXQuZGlyZWN0aW9uID0gZGlyZWN0aW9uO1xufVxuXG4vKipcbiAqIGNyZWF0ZSBhIHNpbXBsZSBjbG9uZSBmcm9tIHRoZSBpbnB1dCB1c2VkIGZvciBzdG9yYWdlIG9mIGZpcnN0SW5wdXQgYW5kIGZpcnN0TXVsdGlwbGVcbiAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dFxuICogQHJldHVybnMge09iamVjdH0gY2xvbmVkSW5wdXREYXRhXG4gKi9cbmZ1bmN0aW9uIHNpbXBsZUNsb25lSW5wdXREYXRhKGlucHV0KSB7XG4gICAgLy8gbWFrZSBhIHNpbXBsZSBjb3B5IG9mIHRoZSBwb2ludGVycyBiZWNhdXNlIHdlIHdpbGwgZ2V0IGEgcmVmZXJlbmNlIGlmIHdlIGRvbid0XG4gICAgLy8gd2Ugb25seSBuZWVkIGNsaWVudFhZIGZvciB0aGUgY2FsY3VsYXRpb25zXG4gICAgdmFyIHBvaW50ZXJzID0gW107XG4gICAgdmFyIGkgPSAwO1xuICAgIHdoaWxlIChpIDwgaW5wdXQucG9pbnRlcnMubGVuZ3RoKSB7XG4gICAgICAgIHBvaW50ZXJzW2ldID0ge1xuICAgICAgICAgICAgY2xpZW50WDogcm91bmQoaW5wdXQucG9pbnRlcnNbaV0uY2xpZW50WCksXG4gICAgICAgICAgICBjbGllbnRZOiByb3VuZChpbnB1dC5wb2ludGVyc1tpXS5jbGllbnRZKVxuICAgICAgICB9O1xuICAgICAgICBpKys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgdGltZVN0YW1wOiBub3coKSxcbiAgICAgICAgcG9pbnRlcnM6IHBvaW50ZXJzLFxuICAgICAgICBjZW50ZXI6IGdldENlbnRlcihwb2ludGVycyksXG4gICAgICAgIGRlbHRhWDogaW5wdXQuZGVsdGFYLFxuICAgICAgICBkZWx0YVk6IGlucHV0LmRlbHRhWVxuICAgIH07XG59XG5cbi8qKlxuICogZ2V0IHRoZSBjZW50ZXIgb2YgYWxsIHRoZSBwb2ludGVyc1xuICogQHBhcmFtIHtBcnJheX0gcG9pbnRlcnNcbiAqIEByZXR1cm4ge09iamVjdH0gY2VudGVyIGNvbnRhaW5zIGB4YCBhbmQgYHlgIHByb3BlcnRpZXNcbiAqL1xuZnVuY3Rpb24gZ2V0Q2VudGVyKHBvaW50ZXJzKSB7XG4gICAgdmFyIHBvaW50ZXJzTGVuZ3RoID0gcG9pbnRlcnMubGVuZ3RoO1xuXG4gICAgLy8gbm8gbmVlZCB0byBsb29wIHdoZW4gb25seSBvbmUgdG91Y2hcbiAgICBpZiAocG9pbnRlcnNMZW5ndGggPT09IDEpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHg6IHJvdW5kKHBvaW50ZXJzWzBdLmNsaWVudFgpLFxuICAgICAgICAgICAgeTogcm91bmQocG9pbnRlcnNbMF0uY2xpZW50WSlcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICB2YXIgeCA9IDAsIHkgPSAwLCBpID0gMDtcbiAgICB3aGlsZSAoaSA8IHBvaW50ZXJzTGVuZ3RoKSB7XG4gICAgICAgIHggKz0gcG9pbnRlcnNbaV0uY2xpZW50WDtcbiAgICAgICAgeSArPSBwb2ludGVyc1tpXS5jbGllbnRZO1xuICAgICAgICBpKys7XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgeDogcm91bmQoeCAvIHBvaW50ZXJzTGVuZ3RoKSxcbiAgICAgICAgeTogcm91bmQoeSAvIHBvaW50ZXJzTGVuZ3RoKVxuICAgIH07XG59XG5cbi8qKlxuICogY2FsY3VsYXRlIHRoZSB2ZWxvY2l0eSBiZXR3ZWVuIHR3byBwb2ludHMuIHVuaXQgaXMgaW4gcHggcGVyIG1zLlxuICogQHBhcmFtIHtOdW1iZXJ9IGRlbHRhVGltZVxuICogQHBhcmFtIHtOdW1iZXJ9IHhcbiAqIEBwYXJhbSB7TnVtYmVyfSB5XG4gKiBAcmV0dXJuIHtPYmplY3R9IHZlbG9jaXR5IGB4YCBhbmQgYHlgXG4gKi9cbmZ1bmN0aW9uIGdldFZlbG9jaXR5KGRlbHRhVGltZSwgeCwgeSkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHggLyBkZWx0YVRpbWUgfHwgMCxcbiAgICAgICAgeTogeSAvIGRlbHRhVGltZSB8fCAwXG4gICAgfTtcbn1cblxuLyoqXG4gKiBnZXQgdGhlIGRpcmVjdGlvbiBiZXR3ZWVuIHR3byBwb2ludHNcbiAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gKiBAcGFyYW0ge051bWJlcn0geVxuICogQHJldHVybiB7TnVtYmVyfSBkaXJlY3Rpb25cbiAqL1xuZnVuY3Rpb24gZ2V0RGlyZWN0aW9uKHgsIHkpIHtcbiAgICBpZiAoeCA9PT0geSkge1xuICAgICAgICByZXR1cm4gRElSRUNUSU9OX05PTkU7XG4gICAgfVxuXG4gICAgaWYgKGFicyh4KSA+PSBhYnMoeSkpIHtcbiAgICAgICAgcmV0dXJuIHggPCAwID8gRElSRUNUSU9OX0xFRlQgOiBESVJFQ1RJT05fUklHSFQ7XG4gICAgfVxuICAgIHJldHVybiB5IDwgMCA/IERJUkVDVElPTl9VUCA6IERJUkVDVElPTl9ET1dOO1xufVxuXG4vKipcbiAqIGNhbGN1bGF0ZSB0aGUgYWJzb2x1dGUgZGlzdGFuY2UgYmV0d2VlbiB0d28gcG9pbnRzXG4gKiBAcGFyYW0ge09iamVjdH0gcDEge3gsIHl9XG4gKiBAcGFyYW0ge09iamVjdH0gcDIge3gsIHl9XG4gKiBAcGFyYW0ge0FycmF5fSBbcHJvcHNdIGNvbnRhaW5pbmcgeCBhbmQgeSBrZXlzXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IGRpc3RhbmNlXG4gKi9cbmZ1bmN0aW9uIGdldERpc3RhbmNlKHAxLCBwMiwgcHJvcHMpIHtcbiAgICBpZiAoIXByb3BzKSB7XG4gICAgICAgIHByb3BzID0gUFJPUFNfWFk7XG4gICAgfVxuICAgIHZhciB4ID0gcDJbcHJvcHNbMF1dIC0gcDFbcHJvcHNbMF1dLFxuICAgICAgICB5ID0gcDJbcHJvcHNbMV1dIC0gcDFbcHJvcHNbMV1dO1xuXG4gICAgcmV0dXJuIE1hdGguc3FydCgoeCAqIHgpICsgKHkgKiB5KSk7XG59XG5cbi8qKlxuICogY2FsY3VsYXRlIHRoZSBhbmdsZSBiZXR3ZWVuIHR3byBjb29yZGluYXRlc1xuICogQHBhcmFtIHtPYmplY3R9IHAxXG4gKiBAcGFyYW0ge09iamVjdH0gcDJcbiAqIEBwYXJhbSB7QXJyYXl9IFtwcm9wc10gY29udGFpbmluZyB4IGFuZCB5IGtleXNcbiAqIEByZXR1cm4ge051bWJlcn0gYW5nbGVcbiAqL1xuZnVuY3Rpb24gZ2V0QW5nbGUocDEsIHAyLCBwcm9wcykge1xuICAgIGlmICghcHJvcHMpIHtcbiAgICAgICAgcHJvcHMgPSBQUk9QU19YWTtcbiAgICB9XG4gICAgdmFyIHggPSBwMltwcm9wc1swXV0gLSBwMVtwcm9wc1swXV0sXG4gICAgICAgIHkgPSBwMltwcm9wc1sxXV0gLSBwMVtwcm9wc1sxXV07XG4gICAgcmV0dXJuIE1hdGguYXRhbjIoeSwgeCkgKiAxODAgLyBNYXRoLlBJO1xufVxuXG4vKipcbiAqIGNhbGN1bGF0ZSB0aGUgcm90YXRpb24gZGVncmVlcyBiZXR3ZWVuIHR3byBwb2ludGVyc2V0c1xuICogQHBhcmFtIHtBcnJheX0gc3RhcnQgYXJyYXkgb2YgcG9pbnRlcnNcbiAqIEBwYXJhbSB7QXJyYXl9IGVuZCBhcnJheSBvZiBwb2ludGVyc1xuICogQHJldHVybiB7TnVtYmVyfSByb3RhdGlvblxuICovXG5mdW5jdGlvbiBnZXRSb3RhdGlvbihzdGFydCwgZW5kKSB7XG4gICAgcmV0dXJuIGdldEFuZ2xlKGVuZFsxXSwgZW5kWzBdLCBQUk9QU19DTElFTlRfWFkpICsgZ2V0QW5nbGUoc3RhcnRbMV0sIHN0YXJ0WzBdLCBQUk9QU19DTElFTlRfWFkpO1xufVxuXG4vKipcbiAqIGNhbGN1bGF0ZSB0aGUgc2NhbGUgZmFjdG9yIGJldHdlZW4gdHdvIHBvaW50ZXJzZXRzXG4gKiBubyBzY2FsZSBpcyAxLCBhbmQgZ29lcyBkb3duIHRvIDAgd2hlbiBwaW5jaGVkIHRvZ2V0aGVyLCBhbmQgYmlnZ2VyIHdoZW4gcGluY2hlZCBvdXRcbiAqIEBwYXJhbSB7QXJyYXl9IHN0YXJ0IGFycmF5IG9mIHBvaW50ZXJzXG4gKiBAcGFyYW0ge0FycmF5fSBlbmQgYXJyYXkgb2YgcG9pbnRlcnNcbiAqIEByZXR1cm4ge051bWJlcn0gc2NhbGVcbiAqL1xuZnVuY3Rpb24gZ2V0U2NhbGUoc3RhcnQsIGVuZCkge1xuICAgIHJldHVybiBnZXREaXN0YW5jZShlbmRbMF0sIGVuZFsxXSwgUFJPUFNfQ0xJRU5UX1hZKSAvIGdldERpc3RhbmNlKHN0YXJ0WzBdLCBzdGFydFsxXSwgUFJPUFNfQ0xJRU5UX1hZKTtcbn1cblxudmFyIE1PVVNFX0lOUFVUX01BUCA9IHtcbiAgICBtb3VzZWRvd246IElOUFVUX1NUQVJULFxuICAgIG1vdXNlbW92ZTogSU5QVVRfTU9WRSxcbiAgICBtb3VzZXVwOiBJTlBVVF9FTkRcbn07XG5cbnZhciBNT1VTRV9FTEVNRU5UX0VWRU5UUyA9ICdtb3VzZWRvd24nO1xudmFyIE1PVVNFX1dJTkRPV19FVkVOVFMgPSAnbW91c2Vtb3ZlIG1vdXNldXAnO1xuXG4vKipcbiAqIE1vdXNlIGV2ZW50cyBpbnB1dFxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBJbnB1dFxuICovXG5mdW5jdGlvbiBNb3VzZUlucHV0KCkge1xuICAgIHRoaXMuZXZFbCA9IE1PVVNFX0VMRU1FTlRfRVZFTlRTO1xuICAgIHRoaXMuZXZXaW4gPSBNT1VTRV9XSU5ET1dfRVZFTlRTO1xuXG4gICAgdGhpcy5wcmVzc2VkID0gZmFsc2U7IC8vIG1vdXNlZG93biBzdGF0ZVxuXG4gICAgSW5wdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuaW5oZXJpdChNb3VzZUlucHV0LCBJbnB1dCwge1xuICAgIC8qKlxuICAgICAqIGhhbmRsZSBtb3VzZSBldmVudHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZcbiAgICAgKi9cbiAgICBoYW5kbGVyOiBmdW5jdGlvbiBNRWhhbmRsZXIoZXYpIHtcbiAgICAgICAgdmFyIGV2ZW50VHlwZSA9IE1PVVNFX0lOUFVUX01BUFtldi50eXBlXTtcblxuICAgICAgICAvLyBvbiBzdGFydCB3ZSB3YW50IHRvIGhhdmUgdGhlIGxlZnQgbW91c2UgYnV0dG9uIGRvd25cbiAgICAgICAgaWYgKGV2ZW50VHlwZSAmIElOUFVUX1NUQVJUICYmIGV2LmJ1dHRvbiA9PT0gMCkge1xuICAgICAgICAgICAgdGhpcy5wcmVzc2VkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9NT1ZFICYmIGV2LndoaWNoICE9PSAxKSB7XG4gICAgICAgICAgICBldmVudFR5cGUgPSBJTlBVVF9FTkQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBtb3VzZSBtdXN0IGJlIGRvd25cbiAgICAgICAgaWYgKCF0aGlzLnByZXNzZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9FTkQpIHtcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYWxsYmFjayh0aGlzLm1hbmFnZXIsIGV2ZW50VHlwZSwge1xuICAgICAgICAgICAgcG9pbnRlcnM6IFtldl0sXG4gICAgICAgICAgICBjaGFuZ2VkUG9pbnRlcnM6IFtldl0sXG4gICAgICAgICAgICBwb2ludGVyVHlwZTogSU5QVVRfVFlQRV9NT1VTRSxcbiAgICAgICAgICAgIHNyY0V2ZW50OiBldlxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxudmFyIFBPSU5URVJfSU5QVVRfTUFQID0ge1xuICAgIHBvaW50ZXJkb3duOiBJTlBVVF9TVEFSVCxcbiAgICBwb2ludGVybW92ZTogSU5QVVRfTU9WRSxcbiAgICBwb2ludGVydXA6IElOUFVUX0VORCxcbiAgICBwb2ludGVyY2FuY2VsOiBJTlBVVF9DQU5DRUwsXG4gICAgcG9pbnRlcm91dDogSU5QVVRfQ0FOQ0VMXG59O1xuXG4vLyBpbiBJRTEwIHRoZSBwb2ludGVyIHR5cGVzIGlzIGRlZmluZWQgYXMgYW4gZW51bVxudmFyIElFMTBfUE9JTlRFUl9UWVBFX0VOVU0gPSB7XG4gICAgMjogSU5QVVRfVFlQRV9UT1VDSCxcbiAgICAzOiBJTlBVVF9UWVBFX1BFTixcbiAgICA0OiBJTlBVVF9UWVBFX01PVVNFLFxuICAgIDU6IElOUFVUX1RZUEVfS0lORUNUIC8vIHNlZSBodHRwczovL3R3aXR0ZXIuY29tL2phY29icm9zc2kvc3RhdHVzLzQ4MDU5NjQzODQ4OTg5MDgxNlxufTtcblxudmFyIFBPSU5URVJfRUxFTUVOVF9FVkVOVFMgPSAncG9pbnRlcmRvd24nO1xudmFyIFBPSU5URVJfV0lORE9XX0VWRU5UUyA9ICdwb2ludGVybW92ZSBwb2ludGVydXAgcG9pbnRlcmNhbmNlbCc7XG5cbi8vIElFMTAgaGFzIHByZWZpeGVkIHN1cHBvcnQsIGFuZCBjYXNlLXNlbnNpdGl2ZVxuaWYgKHdpbmRvdy5NU1BvaW50ZXJFdmVudCAmJiAhd2luZG93LlBvaW50ZXJFdmVudCkge1xuICAgIFBPSU5URVJfRUxFTUVOVF9FVkVOVFMgPSAnTVNQb2ludGVyRG93bic7XG4gICAgUE9JTlRFUl9XSU5ET1dfRVZFTlRTID0gJ01TUG9pbnRlck1vdmUgTVNQb2ludGVyVXAgTVNQb2ludGVyQ2FuY2VsJztcbn1cblxuLyoqXG4gKiBQb2ludGVyIGV2ZW50cyBpbnB1dFxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBJbnB1dFxuICovXG5mdW5jdGlvbiBQb2ludGVyRXZlbnRJbnB1dCgpIHtcbiAgICB0aGlzLmV2RWwgPSBQT0lOVEVSX0VMRU1FTlRfRVZFTlRTO1xuICAgIHRoaXMuZXZXaW4gPSBQT0lOVEVSX1dJTkRPV19FVkVOVFM7XG5cbiAgICBJbnB1dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdGhpcy5zdG9yZSA9ICh0aGlzLm1hbmFnZXIuc2Vzc2lvbi5wb2ludGVyRXZlbnRzID0gW10pO1xufVxuXG5pbmhlcml0KFBvaW50ZXJFdmVudElucHV0LCBJbnB1dCwge1xuICAgIC8qKlxuICAgICAqIGhhbmRsZSBtb3VzZSBldmVudHNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZXZcbiAgICAgKi9cbiAgICBoYW5kbGVyOiBmdW5jdGlvbiBQRWhhbmRsZXIoZXYpIHtcbiAgICAgICAgdmFyIHN0b3JlID0gdGhpcy5zdG9yZTtcbiAgICAgICAgdmFyIHJlbW92ZVBvaW50ZXIgPSBmYWxzZTtcblxuICAgICAgICB2YXIgZXZlbnRUeXBlTm9ybWFsaXplZCA9IGV2LnR5cGUudG9Mb3dlckNhc2UoKS5yZXBsYWNlKCdtcycsICcnKTtcbiAgICAgICAgdmFyIGV2ZW50VHlwZSA9IFBPSU5URVJfSU5QVVRfTUFQW2V2ZW50VHlwZU5vcm1hbGl6ZWRdO1xuICAgICAgICB2YXIgcG9pbnRlclR5cGUgPSBJRTEwX1BPSU5URVJfVFlQRV9FTlVNW2V2LnBvaW50ZXJUeXBlXSB8fCBldi5wb2ludGVyVHlwZTtcblxuICAgICAgICB2YXIgaXNUb3VjaCA9IChwb2ludGVyVHlwZSA9PSBJTlBVVF9UWVBFX1RPVUNIKTtcblxuICAgICAgICAvLyBnZXQgaW5kZXggb2YgdGhlIGV2ZW50IGluIHRoZSBzdG9yZVxuICAgICAgICB2YXIgc3RvcmVJbmRleCA9IGluQXJyYXkoc3RvcmUsIGV2LnBvaW50ZXJJZCwgJ3BvaW50ZXJJZCcpO1xuXG4gICAgICAgIC8vIHN0YXJ0IGFuZCBtb3VzZSBtdXN0IGJlIGRvd25cbiAgICAgICAgaWYgKGV2ZW50VHlwZSAmIElOUFVUX1NUQVJUICYmIChldi5idXR0b24gPT09IDAgfHwgaXNUb3VjaCkpIHtcbiAgICAgICAgICAgIGlmIChzdG9yZUluZGV4IDwgMCkge1xuICAgICAgICAgICAgICAgIHN0b3JlLnB1c2goZXYpO1xuICAgICAgICAgICAgICAgIHN0b3JlSW5kZXggPSBzdG9yZS5sZW5ndGggLSAxO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGV2ZW50VHlwZSAmIChJTlBVVF9FTkQgfCBJTlBVVF9DQU5DRUwpKSB7XG4gICAgICAgICAgICByZW1vdmVQb2ludGVyID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGl0IG5vdCBmb3VuZCwgc28gdGhlIHBvaW50ZXIgaGFzbid0IGJlZW4gZG93biAoc28gaXQncyBwcm9iYWJseSBhIGhvdmVyKVxuICAgICAgICBpZiAoc3RvcmVJbmRleCA8IDApIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHVwZGF0ZSB0aGUgZXZlbnQgaW4gdGhlIHN0b3JlXG4gICAgICAgIHN0b3JlW3N0b3JlSW5kZXhdID0gZXY7XG5cbiAgICAgICAgdGhpcy5jYWxsYmFjayh0aGlzLm1hbmFnZXIsIGV2ZW50VHlwZSwge1xuICAgICAgICAgICAgcG9pbnRlcnM6IHN0b3JlLFxuICAgICAgICAgICAgY2hhbmdlZFBvaW50ZXJzOiBbZXZdLFxuICAgICAgICAgICAgcG9pbnRlclR5cGU6IHBvaW50ZXJUeXBlLFxuICAgICAgICAgICAgc3JjRXZlbnQ6IGV2XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChyZW1vdmVQb2ludGVyKSB7XG4gICAgICAgICAgICAvLyByZW1vdmUgZnJvbSB0aGUgc3RvcmVcbiAgICAgICAgICAgIHN0b3JlLnNwbGljZShzdG9yZUluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG52YXIgU0lOR0xFX1RPVUNIX0lOUFVUX01BUCA9IHtcbiAgICB0b3VjaHN0YXJ0OiBJTlBVVF9TVEFSVCxcbiAgICB0b3VjaG1vdmU6IElOUFVUX01PVkUsXG4gICAgdG91Y2hlbmQ6IElOUFVUX0VORCxcbiAgICB0b3VjaGNhbmNlbDogSU5QVVRfQ0FOQ0VMXG59O1xuXG52YXIgU0lOR0xFX1RPVUNIX1RBUkdFVF9FVkVOVFMgPSAndG91Y2hzdGFydCc7XG52YXIgU0lOR0xFX1RPVUNIX1dJTkRPV19FVkVOVFMgPSAndG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgdG91Y2hjYW5jZWwnO1xuXG4vKipcbiAqIFRvdWNoIGV2ZW50cyBpbnB1dFxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBJbnB1dFxuICovXG5mdW5jdGlvbiBTaW5nbGVUb3VjaElucHV0KCkge1xuICAgIHRoaXMuZXZUYXJnZXQgPSBTSU5HTEVfVE9VQ0hfVEFSR0VUX0VWRU5UUztcbiAgICB0aGlzLmV2V2luID0gU0lOR0xFX1RPVUNIX1dJTkRPV19FVkVOVFM7XG4gICAgdGhpcy5zdGFydGVkID0gZmFsc2U7XG5cbiAgICBJbnB1dC5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5pbmhlcml0KFNpbmdsZVRvdWNoSW5wdXQsIElucHV0LCB7XG4gICAgaGFuZGxlcjogZnVuY3Rpb24gVEVoYW5kbGVyKGV2KSB7XG4gICAgICAgIHZhciB0eXBlID0gU0lOR0xFX1RPVUNIX0lOUFVUX01BUFtldi50eXBlXTtcblxuICAgICAgICAvLyBzaG91bGQgd2UgaGFuZGxlIHRoZSB0b3VjaCBldmVudHM/XG4gICAgICAgIGlmICh0eXBlID09PSBJTlBVVF9TVEFSVCkge1xuICAgICAgICAgICAgdGhpcy5zdGFydGVkID0gdHJ1ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghdGhpcy5zdGFydGVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgdG91Y2hlcyA9IG5vcm1hbGl6ZVNpbmdsZVRvdWNoZXMuY2FsbCh0aGlzLCBldiwgdHlwZSk7XG5cbiAgICAgICAgLy8gd2hlbiBkb25lLCByZXNldCB0aGUgc3RhcnRlZCBzdGF0ZVxuICAgICAgICBpZiAodHlwZSAmIChJTlBVVF9FTkQgfCBJTlBVVF9DQU5DRUwpICYmIHRvdWNoZXNbMF0ubGVuZ3RoIC0gdG91Y2hlc1sxXS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYWxsYmFjayh0aGlzLm1hbmFnZXIsIHR5cGUsIHtcbiAgICAgICAgICAgIHBvaW50ZXJzOiB0b3VjaGVzWzBdLFxuICAgICAgICAgICAgY2hhbmdlZFBvaW50ZXJzOiB0b3VjaGVzWzFdLFxuICAgICAgICAgICAgcG9pbnRlclR5cGU6IElOUFVUX1RZUEVfVE9VQ0gsXG4gICAgICAgICAgICBzcmNFdmVudDogZXZcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbi8qKlxuICogQHRoaXMge1RvdWNoSW5wdXR9XG4gKiBAcGFyYW0ge09iamVjdH0gZXZcbiAqIEBwYXJhbSB7TnVtYmVyfSB0eXBlIGZsYWdcbiAqIEByZXR1cm5zIHt1bmRlZmluZWR8QXJyYXl9IFthbGwsIGNoYW5nZWRdXG4gKi9cbmZ1bmN0aW9uIG5vcm1hbGl6ZVNpbmdsZVRvdWNoZXMoZXYsIHR5cGUpIHtcbiAgICB2YXIgYWxsID0gdG9BcnJheShldi50b3VjaGVzKTtcbiAgICB2YXIgY2hhbmdlZCA9IHRvQXJyYXkoZXYuY2hhbmdlZFRvdWNoZXMpO1xuXG4gICAgaWYgKHR5cGUgJiAoSU5QVVRfRU5EIHwgSU5QVVRfQ0FOQ0VMKSkge1xuICAgICAgICBhbGwgPSB1bmlxdWVBcnJheShhbGwuY29uY2F0KGNoYW5nZWQpLCAnaWRlbnRpZmllcicsIHRydWUpO1xuICAgIH1cblxuICAgIHJldHVybiBbYWxsLCBjaGFuZ2VkXTtcbn1cblxudmFyIFRPVUNIX0lOUFVUX01BUCA9IHtcbiAgICB0b3VjaHN0YXJ0OiBJTlBVVF9TVEFSVCxcbiAgICB0b3VjaG1vdmU6IElOUFVUX01PVkUsXG4gICAgdG91Y2hlbmQ6IElOUFVUX0VORCxcbiAgICB0b3VjaGNhbmNlbDogSU5QVVRfQ0FOQ0VMXG59O1xuXG52YXIgVE9VQ0hfVEFSR0VUX0VWRU5UUyA9ICd0b3VjaHN0YXJ0IHRvdWNobW92ZSB0b3VjaGVuZCB0b3VjaGNhbmNlbCc7XG5cbi8qKlxuICogTXVsdGktdXNlciB0b3VjaCBldmVudHMgaW5wdXRcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgSW5wdXRcbiAqL1xuZnVuY3Rpb24gVG91Y2hJbnB1dCgpIHtcbiAgICB0aGlzLmV2VGFyZ2V0ID0gVE9VQ0hfVEFSR0VUX0VWRU5UUztcbiAgICB0aGlzLnRhcmdldElkcyA9IHt9O1xuXG4gICAgSW5wdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuaW5oZXJpdChUb3VjaElucHV0LCBJbnB1dCwge1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uIE1URWhhbmRsZXIoZXYpIHtcbiAgICAgICAgdmFyIHR5cGUgPSBUT1VDSF9JTlBVVF9NQVBbZXYudHlwZV07XG4gICAgICAgIHZhciB0b3VjaGVzID0gZ2V0VG91Y2hlcy5jYWxsKHRoaXMsIGV2LCB0eXBlKTtcbiAgICAgICAgaWYgKCF0b3VjaGVzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNhbGxiYWNrKHRoaXMubWFuYWdlciwgdHlwZSwge1xuICAgICAgICAgICAgcG9pbnRlcnM6IHRvdWNoZXNbMF0sXG4gICAgICAgICAgICBjaGFuZ2VkUG9pbnRlcnM6IHRvdWNoZXNbMV0sXG4gICAgICAgICAgICBwb2ludGVyVHlwZTogSU5QVVRfVFlQRV9UT1VDSCxcbiAgICAgICAgICAgIHNyY0V2ZW50OiBldlxuICAgICAgICB9KTtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBAdGhpcyB7VG91Y2hJbnB1dH1cbiAqIEBwYXJhbSB7T2JqZWN0fSBldlxuICogQHBhcmFtIHtOdW1iZXJ9IHR5cGUgZmxhZ1xuICogQHJldHVybnMge3VuZGVmaW5lZHxBcnJheX0gW2FsbCwgY2hhbmdlZF1cbiAqL1xuZnVuY3Rpb24gZ2V0VG91Y2hlcyhldiwgdHlwZSkge1xuICAgIHZhciBhbGxUb3VjaGVzID0gdG9BcnJheShldi50b3VjaGVzKTtcbiAgICB2YXIgdGFyZ2V0SWRzID0gdGhpcy50YXJnZXRJZHM7XG5cbiAgICAvLyB3aGVuIHRoZXJlIGlzIG9ubHkgb25lIHRvdWNoLCB0aGUgcHJvY2VzcyBjYW4gYmUgc2ltcGxpZmllZFxuICAgIGlmICh0eXBlICYgKElOUFVUX1NUQVJUIHwgSU5QVVRfTU9WRSkgJiYgYWxsVG91Y2hlcy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgdGFyZ2V0SWRzW2FsbFRvdWNoZXNbMF0uaWRlbnRpZmllcl0gPSB0cnVlO1xuICAgICAgICByZXR1cm4gW2FsbFRvdWNoZXMsIGFsbFRvdWNoZXNdO1xuICAgIH1cblxuICAgIHZhciBpLFxuICAgICAgICB0YXJnZXRUb3VjaGVzLFxuICAgICAgICBjaGFuZ2VkVG91Y2hlcyA9IHRvQXJyYXkoZXYuY2hhbmdlZFRvdWNoZXMpLFxuICAgICAgICBjaGFuZ2VkVGFyZ2V0VG91Y2hlcyA9IFtdLFxuICAgICAgICB0YXJnZXQgPSB0aGlzLnRhcmdldDtcblxuICAgIC8vIGdldCB0YXJnZXQgdG91Y2hlcyBmcm9tIHRvdWNoZXNcbiAgICB0YXJnZXRUb3VjaGVzID0gYWxsVG91Y2hlcy5maWx0ZXIoZnVuY3Rpb24odG91Y2gpIHtcbiAgICAgICAgcmV0dXJuIGhhc1BhcmVudCh0b3VjaC50YXJnZXQsIHRhcmdldCk7XG4gICAgfSk7XG5cbiAgICAvLyBjb2xsZWN0IHRvdWNoZXNcbiAgICBpZiAodHlwZSA9PT0gSU5QVVRfU1RBUlQpIHtcbiAgICAgICAgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgdGFyZ2V0VG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHRhcmdldElkc1t0YXJnZXRUb3VjaGVzW2ldLmlkZW50aWZpZXJdID0gdHJ1ZTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIC8vIGZpbHRlciBjaGFuZ2VkIHRvdWNoZXMgdG8gb25seSBjb250YWluIHRvdWNoZXMgdGhhdCBleGlzdCBpbiB0aGUgY29sbGVjdGVkIHRhcmdldCBpZHNcbiAgICBpID0gMDtcbiAgICB3aGlsZSAoaSA8IGNoYW5nZWRUb3VjaGVzLmxlbmd0aCkge1xuICAgICAgICBpZiAodGFyZ2V0SWRzW2NoYW5nZWRUb3VjaGVzW2ldLmlkZW50aWZpZXJdKSB7XG4gICAgICAgICAgICBjaGFuZ2VkVGFyZ2V0VG91Y2hlcy5wdXNoKGNoYW5nZWRUb3VjaGVzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNsZWFudXAgcmVtb3ZlZCB0b3VjaGVzXG4gICAgICAgIGlmICh0eXBlICYgKElOUFVUX0VORCB8IElOUFVUX0NBTkNFTCkpIHtcbiAgICAgICAgICAgIGRlbGV0ZSB0YXJnZXRJZHNbY2hhbmdlZFRvdWNoZXNbaV0uaWRlbnRpZmllcl07XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIGlmICghY2hhbmdlZFRhcmdldFRvdWNoZXMubGVuZ3RoKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICByZXR1cm4gW1xuICAgICAgICAvLyBtZXJnZSB0YXJnZXRUb3VjaGVzIHdpdGggY2hhbmdlZFRhcmdldFRvdWNoZXMgc28gaXQgY29udGFpbnMgQUxMIHRvdWNoZXMsIGluY2x1ZGluZyAnZW5kJyBhbmQgJ2NhbmNlbCdcbiAgICAgICAgdW5pcXVlQXJyYXkodGFyZ2V0VG91Y2hlcy5jb25jYXQoY2hhbmdlZFRhcmdldFRvdWNoZXMpLCAnaWRlbnRpZmllcicsIHRydWUpLFxuICAgICAgICBjaGFuZ2VkVGFyZ2V0VG91Y2hlc1xuICAgIF07XG59XG5cbi8qKlxuICogQ29tYmluZWQgdG91Y2ggYW5kIG1vdXNlIGlucHV0XG4gKlxuICogVG91Y2ggaGFzIGEgaGlnaGVyIHByaW9yaXR5IHRoZW4gbW91c2UsIGFuZCB3aGlsZSB0b3VjaGluZyBubyBtb3VzZSBldmVudHMgYXJlIGFsbG93ZWQuXG4gKiBUaGlzIGJlY2F1c2UgdG91Y2ggZGV2aWNlcyBhbHNvIGVtaXQgbW91c2UgZXZlbnRzIHdoaWxlIGRvaW5nIGEgdG91Y2guXG4gKlxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBJbnB1dFxuICovXG5cbnZhciBERURVUF9USU1FT1VUID0gMjUwMDtcbnZhciBERURVUF9ESVNUQU5DRSA9IDI1O1xuXG5mdW5jdGlvbiBUb3VjaE1vdXNlSW5wdXQoKSB7XG4gICAgSW5wdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHZhciBoYW5kbGVyID0gYmluZEZuKHRoaXMuaGFuZGxlciwgdGhpcyk7XG4gICAgdGhpcy50b3VjaCA9IG5ldyBUb3VjaElucHV0KHRoaXMubWFuYWdlciwgaGFuZGxlcik7XG4gICAgdGhpcy5tb3VzZSA9IG5ldyBNb3VzZUlucHV0KHRoaXMubWFuYWdlciwgaGFuZGxlcik7XG5cbiAgICB0aGlzLnByaW1hcnlUb3VjaCA9IG51bGw7XG4gICAgdGhpcy5sYXN0VG91Y2hlcyA9IFtdO1xufVxuXG5pbmhlcml0KFRvdWNoTW91c2VJbnB1dCwgSW5wdXQsIHtcbiAgICAvKipcbiAgICAgKiBoYW5kbGUgbW91c2UgYW5kIHRvdWNoIGV2ZW50c1xuICAgICAqIEBwYXJhbSB7SGFtbWVyfSBtYW5hZ2VyXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGlucHV0RXZlbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXREYXRhXG4gICAgICovXG4gICAgaGFuZGxlcjogZnVuY3Rpb24gVE1FaGFuZGxlcihtYW5hZ2VyLCBpbnB1dEV2ZW50LCBpbnB1dERhdGEpIHtcbiAgICAgICAgdmFyIGlzVG91Y2ggPSAoaW5wdXREYXRhLnBvaW50ZXJUeXBlID09IElOUFVUX1RZUEVfVE9VQ0gpLFxuICAgICAgICAgICAgaXNNb3VzZSA9IChpbnB1dERhdGEucG9pbnRlclR5cGUgPT0gSU5QVVRfVFlQRV9NT1VTRSk7XG5cbiAgICAgICAgaWYgKGlzTW91c2UgJiYgaW5wdXREYXRhLnNvdXJjZUNhcGFiaWxpdGllcyAmJiBpbnB1dERhdGEuc291cmNlQ2FwYWJpbGl0aWVzLmZpcmVzVG91Y2hFdmVudHMpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHdoZW4gd2UncmUgaW4gYSB0b3VjaCBldmVudCwgcmVjb3JkIHRvdWNoZXMgdG8gIGRlLWR1cGUgc3ludGhldGljIG1vdXNlIGV2ZW50XG4gICAgICAgIGlmIChpc1RvdWNoKSB7XG4gICAgICAgICAgICByZWNvcmRUb3VjaGVzLmNhbGwodGhpcywgaW5wdXRFdmVudCwgaW5wdXREYXRhKTtcbiAgICAgICAgfSBlbHNlIGlmIChpc01vdXNlICYmIGlzU3ludGhldGljRXZlbnQuY2FsbCh0aGlzLCBpbnB1dERhdGEpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLmNhbGxiYWNrKG1hbmFnZXIsIGlucHV0RXZlbnQsIGlucHV0RGF0YSk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlbW92ZSB0aGUgZXZlbnQgbGlzdGVuZXJzXG4gICAgICovXG4gICAgZGVzdHJveTogZnVuY3Rpb24gZGVzdHJveSgpIHtcbiAgICAgICAgdGhpcy50b3VjaC5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMubW91c2UuZGVzdHJveSgpO1xuICAgIH1cbn0pO1xuXG5mdW5jdGlvbiByZWNvcmRUb3VjaGVzKGV2ZW50VHlwZSwgZXZlbnREYXRhKSB7XG4gICAgaWYgKGV2ZW50VHlwZSAmIElOUFVUX1NUQVJUKSB7XG4gICAgICAgIHRoaXMucHJpbWFyeVRvdWNoID0gZXZlbnREYXRhLmNoYW5nZWRQb2ludGVyc1swXS5pZGVudGlmaWVyO1xuICAgICAgICBzZXRMYXN0VG91Y2guY2FsbCh0aGlzLCBldmVudERhdGEpO1xuICAgIH0gZWxzZSBpZiAoZXZlbnRUeXBlICYgKElOUFVUX0VORCB8IElOUFVUX0NBTkNFTCkpIHtcbiAgICAgICAgc2V0TGFzdFRvdWNoLmNhbGwodGhpcywgZXZlbnREYXRhKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIHNldExhc3RUb3VjaChldmVudERhdGEpIHtcbiAgICB2YXIgdG91Y2ggPSBldmVudERhdGEuY2hhbmdlZFBvaW50ZXJzWzBdO1xuXG4gICAgaWYgKHRvdWNoLmlkZW50aWZpZXIgPT09IHRoaXMucHJpbWFyeVRvdWNoKSB7XG4gICAgICAgIHZhciBsYXN0VG91Y2ggPSB7eDogdG91Y2guY2xpZW50WCwgeTogdG91Y2guY2xpZW50WX07XG4gICAgICAgIHRoaXMubGFzdFRvdWNoZXMucHVzaChsYXN0VG91Y2gpO1xuICAgICAgICB2YXIgbHRzID0gdGhpcy5sYXN0VG91Y2hlcztcbiAgICAgICAgdmFyIHJlbW92ZUxhc3RUb3VjaCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdmFyIGkgPSBsdHMuaW5kZXhPZihsYXN0VG91Y2gpO1xuICAgICAgICAgICAgaWYgKGkgPiAtMSkge1xuICAgICAgICAgICAgICAgIGx0cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH07XG4gICAgICAgIHNldFRpbWVvdXQocmVtb3ZlTGFzdFRvdWNoLCBERURVUF9USU1FT1VUKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGlzU3ludGhldGljRXZlbnQoZXZlbnREYXRhKSB7XG4gICAgdmFyIHggPSBldmVudERhdGEuc3JjRXZlbnQuY2xpZW50WCwgeSA9IGV2ZW50RGF0YS5zcmNFdmVudC5jbGllbnRZO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5sYXN0VG91Y2hlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgdCA9IHRoaXMubGFzdFRvdWNoZXNbaV07XG4gICAgICAgIHZhciBkeCA9IE1hdGguYWJzKHggLSB0LngpLCBkeSA9IE1hdGguYWJzKHkgLSB0LnkpO1xuICAgICAgICBpZiAoZHggPD0gREVEVVBfRElTVEFOQ0UgJiYgZHkgPD0gREVEVVBfRElTVEFOQ0UpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxudmFyIFBSRUZJWEVEX1RPVUNIX0FDVElPTiA9IHByZWZpeGVkKFRFU1RfRUxFTUVOVC5zdHlsZSwgJ3RvdWNoQWN0aW9uJyk7XG52YXIgTkFUSVZFX1RPVUNIX0FDVElPTiA9IFBSRUZJWEVEX1RPVUNIX0FDVElPTiAhPT0gdW5kZWZpbmVkO1xuXG4vLyBtYWdpY2FsIHRvdWNoQWN0aW9uIHZhbHVlXG52YXIgVE9VQ0hfQUNUSU9OX0NPTVBVVEUgPSAnY29tcHV0ZSc7XG52YXIgVE9VQ0hfQUNUSU9OX0FVVE8gPSAnYXV0byc7XG52YXIgVE9VQ0hfQUNUSU9OX01BTklQVUxBVElPTiA9ICdtYW5pcHVsYXRpb24nOyAvLyBub3QgaW1wbGVtZW50ZWRcbnZhciBUT1VDSF9BQ1RJT05fTk9ORSA9ICdub25lJztcbnZhciBUT1VDSF9BQ1RJT05fUEFOX1ggPSAncGFuLXgnO1xudmFyIFRPVUNIX0FDVElPTl9QQU5fWSA9ICdwYW4teSc7XG52YXIgVE9VQ0hfQUNUSU9OX01BUCA9IGdldFRvdWNoQWN0aW9uUHJvcHMoKTtcblxuLyoqXG4gKiBUb3VjaCBBY3Rpb25cbiAqIHNldHMgdGhlIHRvdWNoQWN0aW9uIHByb3BlcnR5IG9yIHVzZXMgdGhlIGpzIGFsdGVybmF0aXZlXG4gKiBAcGFyYW0ge01hbmFnZXJ9IG1hbmFnZXJcbiAqIEBwYXJhbSB7U3RyaW5nfSB2YWx1ZVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIFRvdWNoQWN0aW9uKG1hbmFnZXIsIHZhbHVlKSB7XG4gICAgdGhpcy5tYW5hZ2VyID0gbWFuYWdlcjtcbiAgICB0aGlzLnNldCh2YWx1ZSk7XG59XG5cblRvdWNoQWN0aW9uLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZXQgdGhlIHRvdWNoQWN0aW9uIHZhbHVlIG9uIHRoZSBlbGVtZW50IG9yIGVuYWJsZSB0aGUgcG9seWZpbGxcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIC8vIGZpbmQgb3V0IHRoZSB0b3VjaC1hY3Rpb24gYnkgdGhlIGV2ZW50IGhhbmRsZXJzXG4gICAgICAgIGlmICh2YWx1ZSA9PSBUT1VDSF9BQ1RJT05fQ09NUFVURSkge1xuICAgICAgICAgICAgdmFsdWUgPSB0aGlzLmNvbXB1dGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChOQVRJVkVfVE9VQ0hfQUNUSU9OICYmIHRoaXMubWFuYWdlci5lbGVtZW50LnN0eWxlICYmIFRPVUNIX0FDVElPTl9NQVBbdmFsdWVdKSB7XG4gICAgICAgICAgICB0aGlzLm1hbmFnZXIuZWxlbWVudC5zdHlsZVtQUkVGSVhFRF9UT1VDSF9BQ1RJT05dID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5hY3Rpb25zID0gdmFsdWUudG9Mb3dlckNhc2UoKS50cmltKCk7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGp1c3QgcmUtc2V0IHRoZSB0b3VjaEFjdGlvbiB2YWx1ZVxuICAgICAqL1xuICAgIHVwZGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuc2V0KHRoaXMubWFuYWdlci5vcHRpb25zLnRvdWNoQWN0aW9uKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY29tcHV0ZSB0aGUgdmFsdWUgZm9yIHRoZSB0b3VjaEFjdGlvbiBwcm9wZXJ0eSBiYXNlZCBvbiB0aGUgcmVjb2duaXplcidzIHNldHRpbmdzXG4gICAgICogQHJldHVybnMge1N0cmluZ30gdmFsdWVcbiAgICAgKi9cbiAgICBjb21wdXRlOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFjdGlvbnMgPSBbXTtcbiAgICAgICAgZWFjaCh0aGlzLm1hbmFnZXIucmVjb2duaXplcnMsIGZ1bmN0aW9uKHJlY29nbml6ZXIpIHtcbiAgICAgICAgICAgIGlmIChib29sT3JGbihyZWNvZ25pemVyLm9wdGlvbnMuZW5hYmxlLCBbcmVjb2duaXplcl0pKSB7XG4gICAgICAgICAgICAgICAgYWN0aW9ucyA9IGFjdGlvbnMuY29uY2F0KHJlY29nbml6ZXIuZ2V0VG91Y2hBY3Rpb24oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gY2xlYW5Ub3VjaEFjdGlvbnMoYWN0aW9ucy5qb2luKCcgJykpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiB0aGlzIG1ldGhvZCBpcyBjYWxsZWQgb24gZWFjaCBpbnB1dCBjeWNsZSBhbmQgcHJvdmlkZXMgdGhlIHByZXZlbnRpbmcgb2YgdGhlIGJyb3dzZXIgYmVoYXZpb3JcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAgICAgKi9cbiAgICBwcmV2ZW50RGVmYXVsdHM6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHZhciBzcmNFdmVudCA9IGlucHV0LnNyY0V2ZW50O1xuICAgICAgICB2YXIgZGlyZWN0aW9uID0gaW5wdXQub2Zmc2V0RGlyZWN0aW9uO1xuXG4gICAgICAgIC8vIGlmIHRoZSB0b3VjaCBhY3Rpb24gZGlkIHByZXZlbnRlZCBvbmNlIHRoaXMgc2Vzc2lvblxuICAgICAgICBpZiAodGhpcy5tYW5hZ2VyLnNlc3Npb24ucHJldmVudGVkKSB7XG4gICAgICAgICAgICBzcmNFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGFjdGlvbnMgPSB0aGlzLmFjdGlvbnM7XG4gICAgICAgIHZhciBoYXNOb25lID0gaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX05PTkUpICYmICFUT1VDSF9BQ1RJT05fTUFQW1RPVUNIX0FDVElPTl9OT05FXTtcbiAgICAgICAgdmFyIGhhc1BhblkgPSBpblN0cihhY3Rpb25zLCBUT1VDSF9BQ1RJT05fUEFOX1kpICYmICFUT1VDSF9BQ1RJT05fTUFQW1RPVUNIX0FDVElPTl9QQU5fWV07XG4gICAgICAgIHZhciBoYXNQYW5YID0gaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX1BBTl9YKSAmJiAhVE9VQ0hfQUNUSU9OX01BUFtUT1VDSF9BQ1RJT05fUEFOX1hdO1xuXG4gICAgICAgIGlmIChoYXNOb25lKSB7XG4gICAgICAgICAgICAvL2RvIG5vdCBwcmV2ZW50IGRlZmF1bHRzIGlmIHRoaXMgaXMgYSB0YXAgZ2VzdHVyZVxuXG4gICAgICAgICAgICB2YXIgaXNUYXBQb2ludGVyID0gaW5wdXQucG9pbnRlcnMubGVuZ3RoID09PSAxO1xuICAgICAgICAgICAgdmFyIGlzVGFwTW92ZW1lbnQgPSBpbnB1dC5kaXN0YW5jZSA8IDI7XG4gICAgICAgICAgICB2YXIgaXNUYXBUb3VjaFRpbWUgPSBpbnB1dC5kZWx0YVRpbWUgPCAyNTA7XG5cbiAgICAgICAgICAgIGlmIChpc1RhcFBvaW50ZXIgJiYgaXNUYXBNb3ZlbWVudCAmJiBpc1RhcFRvdWNoVGltZSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYXNQYW5YICYmIGhhc1BhblkpIHtcbiAgICAgICAgICAgIC8vIGBwYW4teCBwYW4teWAgbWVhbnMgYnJvd3NlciBoYW5kbGVzIGFsbCBzY3JvbGxpbmcvcGFubmluZywgZG8gbm90IHByZXZlbnRcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChoYXNOb25lIHx8XG4gICAgICAgICAgICAoaGFzUGFuWSAmJiBkaXJlY3Rpb24gJiBESVJFQ1RJT05fSE9SSVpPTlRBTCkgfHxcbiAgICAgICAgICAgIChoYXNQYW5YICYmIGRpcmVjdGlvbiAmIERJUkVDVElPTl9WRVJUSUNBTCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByZXZlbnRTcmMoc3JjRXZlbnQpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNhbGwgcHJldmVudERlZmF1bHQgdG8gcHJldmVudCB0aGUgYnJvd3NlcidzIGRlZmF1bHQgYmVoYXZpb3IgKHNjcm9sbGluZyBpbiBtb3N0IGNhc2VzKVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBzcmNFdmVudFxuICAgICAqL1xuICAgIHByZXZlbnRTcmM6IGZ1bmN0aW9uKHNyY0V2ZW50KSB7XG4gICAgICAgIHRoaXMubWFuYWdlci5zZXNzaW9uLnByZXZlbnRlZCA9IHRydWU7XG4gICAgICAgIHNyY0V2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxufTtcblxuLyoqXG4gKiB3aGVuIHRoZSB0b3VjaEFjdGlvbnMgYXJlIGNvbGxlY3RlZCB0aGV5IGFyZSBub3QgYSB2YWxpZCB2YWx1ZSwgc28gd2UgbmVlZCB0byBjbGVhbiB0aGluZ3MgdXAuICpcbiAqIEBwYXJhbSB7U3RyaW5nfSBhY3Rpb25zXG4gKiBAcmV0dXJucyB7Kn1cbiAqL1xuZnVuY3Rpb24gY2xlYW5Ub3VjaEFjdGlvbnMoYWN0aW9ucykge1xuICAgIC8vIG5vbmVcbiAgICBpZiAoaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX05PTkUpKSB7XG4gICAgICAgIHJldHVybiBUT1VDSF9BQ1RJT05fTk9ORTtcbiAgICB9XG5cbiAgICB2YXIgaGFzUGFuWCA9IGluU3RyKGFjdGlvbnMsIFRPVUNIX0FDVElPTl9QQU5fWCk7XG4gICAgdmFyIGhhc1BhblkgPSBpblN0cihhY3Rpb25zLCBUT1VDSF9BQ1RJT05fUEFOX1kpO1xuXG4gICAgLy8gaWYgYm90aCBwYW4teCBhbmQgcGFuLXkgYXJlIHNldCAoZGlmZmVyZW50IHJlY29nbml6ZXJzXG4gICAgLy8gZm9yIGRpZmZlcmVudCBkaXJlY3Rpb25zLCBlLmcuIGhvcml6b250YWwgcGFuIGJ1dCB2ZXJ0aWNhbCBzd2lwZT8pXG4gICAgLy8gd2UgbmVlZCBub25lIChhcyBvdGhlcndpc2Ugd2l0aCBwYW4teCBwYW4teSBjb21iaW5lZCBub25lIG9mIHRoZXNlXG4gICAgLy8gcmVjb2duaXplcnMgd2lsbCB3b3JrLCBzaW5jZSB0aGUgYnJvd3NlciB3b3VsZCBoYW5kbGUgYWxsIHBhbm5pbmdcbiAgICBpZiAoaGFzUGFuWCAmJiBoYXNQYW5ZKSB7XG4gICAgICAgIHJldHVybiBUT1VDSF9BQ1RJT05fTk9ORTtcbiAgICB9XG5cbiAgICAvLyBwYW4teCBPUiBwYW4teVxuICAgIGlmIChoYXNQYW5YIHx8IGhhc1BhblkpIHtcbiAgICAgICAgcmV0dXJuIGhhc1BhblggPyBUT1VDSF9BQ1RJT05fUEFOX1ggOiBUT1VDSF9BQ1RJT05fUEFOX1k7XG4gICAgfVxuXG4gICAgLy8gbWFuaXB1bGF0aW9uXG4gICAgaWYgKGluU3RyKGFjdGlvbnMsIFRPVUNIX0FDVElPTl9NQU5JUFVMQVRJT04pKSB7XG4gICAgICAgIHJldHVybiBUT1VDSF9BQ1RJT05fTUFOSVBVTEFUSU9OO1xuICAgIH1cblxuICAgIHJldHVybiBUT1VDSF9BQ1RJT05fQVVUTztcbn1cblxuZnVuY3Rpb24gZ2V0VG91Y2hBY3Rpb25Qcm9wcygpIHtcbiAgICBpZiAoIU5BVElWRV9UT1VDSF9BQ1RJT04pIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICB2YXIgdG91Y2hNYXAgPSB7fTtcbiAgICB2YXIgY3NzU3VwcG9ydHMgPSB3aW5kb3cuQ1NTICYmIHdpbmRvdy5DU1Muc3VwcG9ydHM7XG4gICAgWydhdXRvJywgJ21hbmlwdWxhdGlvbicsICdwYW4teScsICdwYW4teCcsICdwYW4teCBwYW4teScsICdub25lJ10uZm9yRWFjaChmdW5jdGlvbih2YWwpIHtcblxuICAgICAgICAvLyBJZiBjc3Muc3VwcG9ydHMgaXMgbm90IHN1cHBvcnRlZCBidXQgdGhlcmUgaXMgbmF0aXZlIHRvdWNoLWFjdGlvbiBhc3N1bWUgaXQgc3VwcG9ydHNcbiAgICAgICAgLy8gYWxsIHZhbHVlcy4gVGhpcyBpcyB0aGUgY2FzZSBmb3IgSUUgMTAgYW5kIDExLlxuICAgICAgICB0b3VjaE1hcFt2YWxdID0gY3NzU3VwcG9ydHMgPyB3aW5kb3cuQ1NTLnN1cHBvcnRzKCd0b3VjaC1hY3Rpb24nLCB2YWwpIDogdHJ1ZTtcbiAgICB9KTtcbiAgICByZXR1cm4gdG91Y2hNYXA7XG59XG5cbi8qKlxuICogUmVjb2duaXplciBmbG93IGV4cGxhaW5lZDsgKlxuICogQWxsIHJlY29nbml6ZXJzIGhhdmUgdGhlIGluaXRpYWwgc3RhdGUgb2YgUE9TU0lCTEUgd2hlbiBhIGlucHV0IHNlc3Npb24gc3RhcnRzLlxuICogVGhlIGRlZmluaXRpb24gb2YgYSBpbnB1dCBzZXNzaW9uIGlzIGZyb20gdGhlIGZpcnN0IGlucHV0IHVudGlsIHRoZSBsYXN0IGlucHV0LCB3aXRoIGFsbCBpdCdzIG1vdmVtZW50IGluIGl0LiAqXG4gKiBFeGFtcGxlIHNlc3Npb24gZm9yIG1vdXNlLWlucHV0OiBtb3VzZWRvd24gLT4gbW91c2Vtb3ZlIC0+IG1vdXNldXBcbiAqXG4gKiBPbiBlYWNoIHJlY29nbml6aW5nIGN5Y2xlIChzZWUgTWFuYWdlci5yZWNvZ25pemUpIHRoZSAucmVjb2duaXplKCkgbWV0aG9kIGlzIGV4ZWN1dGVkXG4gKiB3aGljaCBkZXRlcm1pbmVzIHdpdGggc3RhdGUgaXQgc2hvdWxkIGJlLlxuICpcbiAqIElmIHRoZSByZWNvZ25pemVyIGhhcyB0aGUgc3RhdGUgRkFJTEVELCBDQU5DRUxMRUQgb3IgUkVDT0dOSVpFRCAoZXF1YWxzIEVOREVEKSwgaXQgaXMgcmVzZXQgdG9cbiAqIFBPU1NJQkxFIHRvIGdpdmUgaXQgYW5vdGhlciBjaGFuZ2Ugb24gdGhlIG5leHQgY3ljbGUuXG4gKlxuICogICAgICAgICAgICAgICBQb3NzaWJsZVxuICogICAgICAgICAgICAgICAgICB8XG4gKiAgICAgICAgICAgICstLS0tLSstLS0tLS0tLS0tLS0tLS0rXG4gKiAgICAgICAgICAgIHwgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgICAgICstLS0tLSstLS0tLSsgICAgICAgICAgICAgICB8XG4gKiAgICAgIHwgICAgICAgICAgIHwgICAgICAgICAgICAgICB8XG4gKiAgIEZhaWxlZCAgICAgIENhbmNlbGxlZCAgICAgICAgICB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgKy0tLS0tLS0rLS0tLS0tK1xuICogICAgICAgICAgICAgICAgICAgICAgICAgIHwgICAgICAgICAgICAgIHxcbiAqICAgICAgICAgICAgICAgICAgICAgIFJlY29nbml6ZWQgICAgICAgQmVnYW5cbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQ2hhbmdlZFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHxcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIEVuZGVkL1JlY29nbml6ZWRcbiAqL1xudmFyIFNUQVRFX1BPU1NJQkxFID0gMTtcbnZhciBTVEFURV9CRUdBTiA9IDI7XG52YXIgU1RBVEVfQ0hBTkdFRCA9IDQ7XG52YXIgU1RBVEVfRU5ERUQgPSA4O1xudmFyIFNUQVRFX1JFQ09HTklaRUQgPSBTVEFURV9FTkRFRDtcbnZhciBTVEFURV9DQU5DRUxMRUQgPSAxNjtcbnZhciBTVEFURV9GQUlMRUQgPSAzMjtcblxuLyoqXG4gKiBSZWNvZ25pemVyXG4gKiBFdmVyeSByZWNvZ25pemVyIG5lZWRzIHRvIGV4dGVuZCBmcm9tIHRoaXMgY2xhc3MuXG4gKiBAY29uc3RydWN0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKi9cbmZ1bmN0aW9uIFJlY29nbml6ZXIob3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IGFzc2lnbih7fSwgdGhpcy5kZWZhdWx0cywgb3B0aW9ucyB8fCB7fSk7XG5cbiAgICB0aGlzLmlkID0gdW5pcXVlSWQoKTtcblxuICAgIHRoaXMubWFuYWdlciA9IG51bGw7XG5cbiAgICAvLyBkZWZhdWx0IGlzIGVuYWJsZSB0cnVlXG4gICAgdGhpcy5vcHRpb25zLmVuYWJsZSA9IGlmVW5kZWZpbmVkKHRoaXMub3B0aW9ucy5lbmFibGUsIHRydWUpO1xuXG4gICAgdGhpcy5zdGF0ZSA9IFNUQVRFX1BPU1NJQkxFO1xuXG4gICAgdGhpcy5zaW11bHRhbmVvdXMgPSB7fTtcbiAgICB0aGlzLnJlcXVpcmVGYWlsID0gW107XG59XG5cblJlY29nbml6ZXIucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIEB2aXJ0dWFsXG4gICAgICogQHR5cGUge09iamVjdH1cbiAgICAgKi9cbiAgICBkZWZhdWx0czoge30sXG5cbiAgICAvKipcbiAgICAgKiBzZXQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICogQHJldHVybiB7UmVjb2duaXplcn1cbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gYWxzbyB1cGRhdGUgdGhlIHRvdWNoQWN0aW9uLCBpbiBjYXNlIHNvbWV0aGluZyBjaGFuZ2VkIGFib3V0IHRoZSBkaXJlY3Rpb25zL2VuYWJsZWQgc3RhdGVcbiAgICAgICAgdGhpcy5tYW5hZ2VyICYmIHRoaXMubWFuYWdlci50b3VjaEFjdGlvbi51cGRhdGUoKTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlY29nbml6ZSBzaW11bHRhbmVvdXMgd2l0aCBhbiBvdGhlciByZWNvZ25pemVyLlxuICAgICAqIEBwYXJhbSB7UmVjb2duaXplcn0gb3RoZXJSZWNvZ25pemVyXG4gICAgICogQHJldHVybnMge1JlY29nbml6ZXJ9IHRoaXNcbiAgICAgKi9cbiAgICByZWNvZ25pemVXaXRoOiBmdW5jdGlvbihvdGhlclJlY29nbml6ZXIpIHtcbiAgICAgICAgaWYgKGludm9rZUFycmF5QXJnKG90aGVyUmVjb2duaXplciwgJ3JlY29nbml6ZVdpdGgnLCB0aGlzKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgc2ltdWx0YW5lb3VzID0gdGhpcy5zaW11bHRhbmVvdXM7XG4gICAgICAgIG90aGVyUmVjb2duaXplciA9IGdldFJlY29nbml6ZXJCeU5hbWVJZk1hbmFnZXIob3RoZXJSZWNvZ25pemVyLCB0aGlzKTtcbiAgICAgICAgaWYgKCFzaW11bHRhbmVvdXNbb3RoZXJSZWNvZ25pemVyLmlkXSkge1xuICAgICAgICAgICAgc2ltdWx0YW5lb3VzW290aGVyUmVjb2duaXplci5pZF0gPSBvdGhlclJlY29nbml6ZXI7XG4gICAgICAgICAgICBvdGhlclJlY29nbml6ZXIucmVjb2duaXplV2l0aCh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZHJvcCB0aGUgc2ltdWx0YW5lb3VzIGxpbmsuIGl0IGRvZXNudCByZW1vdmUgdGhlIGxpbmsgb24gdGhlIG90aGVyIHJlY29nbml6ZXIuXG4gICAgICogQHBhcmFtIHtSZWNvZ25pemVyfSBvdGhlclJlY29nbml6ZXJcbiAgICAgKiBAcmV0dXJucyB7UmVjb2duaXplcn0gdGhpc1xuICAgICAqL1xuICAgIGRyb3BSZWNvZ25pemVXaXRoOiBmdW5jdGlvbihvdGhlclJlY29nbml6ZXIpIHtcbiAgICAgICAgaWYgKGludm9rZUFycmF5QXJnKG90aGVyUmVjb2duaXplciwgJ2Ryb3BSZWNvZ25pemVXaXRoJywgdGhpcykpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgb3RoZXJSZWNvZ25pemVyID0gZ2V0UmVjb2duaXplckJ5TmFtZUlmTWFuYWdlcihvdGhlclJlY29nbml6ZXIsIHRoaXMpO1xuICAgICAgICBkZWxldGUgdGhpcy5zaW11bHRhbmVvdXNbb3RoZXJSZWNvZ25pemVyLmlkXTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJlY29nbml6ZXIgY2FuIG9ubHkgcnVuIHdoZW4gYW4gb3RoZXIgaXMgZmFpbGluZ1xuICAgICAqIEBwYXJhbSB7UmVjb2duaXplcn0gb3RoZXJSZWNvZ25pemVyXG4gICAgICogQHJldHVybnMge1JlY29nbml6ZXJ9IHRoaXNcbiAgICAgKi9cbiAgICByZXF1aXJlRmFpbHVyZTogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XG4gICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhvdGhlclJlY29nbml6ZXIsICdyZXF1aXJlRmFpbHVyZScsIHRoaXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZXF1aXJlRmFpbCA9IHRoaXMucmVxdWlyZUZhaWw7XG4gICAgICAgIG90aGVyUmVjb2duaXplciA9IGdldFJlY29nbml6ZXJCeU5hbWVJZk1hbmFnZXIob3RoZXJSZWNvZ25pemVyLCB0aGlzKTtcbiAgICAgICAgaWYgKGluQXJyYXkocmVxdWlyZUZhaWwsIG90aGVyUmVjb2duaXplcikgPT09IC0xKSB7XG4gICAgICAgICAgICByZXF1aXJlRmFpbC5wdXNoKG90aGVyUmVjb2duaXplcik7XG4gICAgICAgICAgICBvdGhlclJlY29nbml6ZXIucmVxdWlyZUZhaWx1cmUodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGRyb3AgdGhlIHJlcXVpcmVGYWlsdXJlIGxpbmsuIGl0IGRvZXMgbm90IHJlbW92ZSB0aGUgbGluayBvbiB0aGUgb3RoZXIgcmVjb2duaXplci5cbiAgICAgKiBAcGFyYW0ge1JlY29nbml6ZXJ9IG90aGVyUmVjb2duaXplclxuICAgICAqIEByZXR1cm5zIHtSZWNvZ25pemVyfSB0aGlzXG4gICAgICovXG4gICAgZHJvcFJlcXVpcmVGYWlsdXJlOiBmdW5jdGlvbihvdGhlclJlY29nbml6ZXIpIHtcbiAgICAgICAgaWYgKGludm9rZUFycmF5QXJnKG90aGVyUmVjb2duaXplciwgJ2Ryb3BSZXF1aXJlRmFpbHVyZScsIHRoaXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIG90aGVyUmVjb2duaXplciA9IGdldFJlY29nbml6ZXJCeU5hbWVJZk1hbmFnZXIob3RoZXJSZWNvZ25pemVyLCB0aGlzKTtcbiAgICAgICAgdmFyIGluZGV4ID0gaW5BcnJheSh0aGlzLnJlcXVpcmVGYWlsLCBvdGhlclJlY29nbml6ZXIpO1xuICAgICAgICBpZiAoaW5kZXggPiAtMSkge1xuICAgICAgICAgICAgdGhpcy5yZXF1aXJlRmFpbC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBoYXMgcmVxdWlyZSBmYWlsdXJlcyBib29sZWFuXG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgaGFzUmVxdWlyZUZhaWx1cmVzOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVxdWlyZUZhaWwubGVuZ3RoID4gMDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaWYgdGhlIHJlY29nbml6ZXIgY2FuIHJlY29nbml6ZSBzaW11bHRhbmVvdXMgd2l0aCBhbiBvdGhlciByZWNvZ25pemVyXG4gICAgICogQHBhcmFtIHtSZWNvZ25pemVyfSBvdGhlclJlY29nbml6ZXJcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAgICAgKi9cbiAgICBjYW5SZWNvZ25pemVXaXRoOiBmdW5jdGlvbihvdGhlclJlY29nbml6ZXIpIHtcbiAgICAgICAgcmV0dXJuICEhdGhpcy5zaW11bHRhbmVvdXNbb3RoZXJSZWNvZ25pemVyLmlkXTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogWW91IHNob3VsZCB1c2UgYHRyeUVtaXRgIGluc3RlYWQgb2YgYGVtaXRgIGRpcmVjdGx5IHRvIGNoZWNrXG4gICAgICogdGhhdCBhbGwgdGhlIG5lZWRlZCByZWNvZ25pemVycyBoYXMgZmFpbGVkIGJlZm9yZSBlbWl0dGluZy5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAgICAgKi9cbiAgICBlbWl0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XG5cbiAgICAgICAgZnVuY3Rpb24gZW1pdChldmVudCkge1xuICAgICAgICAgICAgc2VsZi5tYW5hZ2VyLmVtaXQoZXZlbnQsIGlucHV0KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vICdwYW5zdGFydCcgYW5kICdwYW5tb3ZlJ1xuICAgICAgICBpZiAoc3RhdGUgPCBTVEFURV9FTkRFRCkge1xuICAgICAgICAgICAgZW1pdChzZWxmLm9wdGlvbnMuZXZlbnQgKyBzdGF0ZVN0cihzdGF0ZSkpO1xuICAgICAgICB9XG5cbiAgICAgICAgZW1pdChzZWxmLm9wdGlvbnMuZXZlbnQpOyAvLyBzaW1wbGUgJ2V2ZW50TmFtZScgZXZlbnRzXG5cbiAgICAgICAgaWYgKGlucHV0LmFkZGl0aW9uYWxFdmVudCkgeyAvLyBhZGRpdGlvbmFsIGV2ZW50KHBhbmxlZnQsIHBhbnJpZ2h0LCBwaW5jaGluLCBwaW5jaG91dC4uLilcbiAgICAgICAgICAgIGVtaXQoaW5wdXQuYWRkaXRpb25hbEV2ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHBhbmVuZCBhbmQgcGFuY2FuY2VsXG4gICAgICAgIGlmIChzdGF0ZSA+PSBTVEFURV9FTkRFRCkge1xuICAgICAgICAgICAgZW1pdChzZWxmLm9wdGlvbnMuZXZlbnQgKyBzdGF0ZVN0cihzdGF0ZSkpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIHRoYXQgYWxsIHRoZSByZXF1aXJlIGZhaWx1cmUgcmVjb2duaXplcnMgaGFzIGZhaWxlZCxcbiAgICAgKiBpZiB0cnVlLCBpdCBlbWl0cyBhIGdlc3R1cmUgZXZlbnQsXG4gICAgICogb3RoZXJ3aXNlLCBzZXR1cCB0aGUgc3RhdGUgdG8gRkFJTEVELlxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dFxuICAgICAqL1xuICAgIHRyeUVtaXQ6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLmNhbkVtaXQoKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW1pdChpbnB1dCk7XG4gICAgICAgIH1cbiAgICAgICAgLy8gaXQncyBmYWlsaW5nIGFueXdheVxuICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVfRkFJTEVEO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjYW4gd2UgZW1pdD9cbiAgICAgKiBAcmV0dXJucyB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBjYW5FbWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGkgPSAwO1xuICAgICAgICB3aGlsZSAoaSA8IHRoaXMucmVxdWlyZUZhaWwubGVuZ3RoKSB7XG4gICAgICAgICAgICBpZiAoISh0aGlzLnJlcXVpcmVGYWlsW2ldLnN0YXRlICYgKFNUQVRFX0ZBSUxFRCB8IFNUQVRFX1BPU1NJQkxFKSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHVwZGF0ZSB0aGUgcmVjb2duaXplclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dERhdGFcbiAgICAgKi9cbiAgICByZWNvZ25pemU6IGZ1bmN0aW9uKGlucHV0RGF0YSkge1xuICAgICAgICAvLyBtYWtlIGEgbmV3IGNvcHkgb2YgdGhlIGlucHV0RGF0YVxuICAgICAgICAvLyBzbyB3ZSBjYW4gY2hhbmdlIHRoZSBpbnB1dERhdGEgd2l0aG91dCBtZXNzaW5nIHVwIHRoZSBvdGhlciByZWNvZ25pemVyc1xuICAgICAgICB2YXIgaW5wdXREYXRhQ2xvbmUgPSBhc3NpZ24oe30sIGlucHV0RGF0YSk7XG5cbiAgICAgICAgLy8gaXMgaXMgZW5hYmxlZCBhbmQgYWxsb3cgcmVjb2duaXppbmc/XG4gICAgICAgIGlmICghYm9vbE9yRm4odGhpcy5vcHRpb25zLmVuYWJsZSwgW3RoaXMsIGlucHV0RGF0YUNsb25lXSkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURV9GQUlMRUQ7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyByZXNldCB3aGVuIHdlJ3ZlIHJlYWNoZWQgdGhlIGVuZFxuICAgICAgICBpZiAodGhpcy5zdGF0ZSAmIChTVEFURV9SRUNPR05JWkVEIHwgU1RBVEVfQ0FOQ0VMTEVEIHwgU1RBVEVfRkFJTEVEKSkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFX1BPU1NJQkxFO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5zdGF0ZSA9IHRoaXMucHJvY2VzcyhpbnB1dERhdGFDbG9uZSk7XG5cbiAgICAgICAgLy8gdGhlIHJlY29nbml6ZXIgaGFzIHJlY29nbml6ZWQgYSBnZXN0dXJlXG4gICAgICAgIC8vIHNvIHRyaWdnZXIgYW4gZXZlbnRcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgJiAoU1RBVEVfQkVHQU4gfCBTVEFURV9DSEFOR0VEIHwgU1RBVEVfRU5ERUQgfCBTVEFURV9DQU5DRUxMRUQpKSB7XG4gICAgICAgICAgICB0aGlzLnRyeUVtaXQoaW5wdXREYXRhQ2xvbmUpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJldHVybiB0aGUgc3RhdGUgb2YgdGhlIHJlY29nbml6ZXJcbiAgICAgKiB0aGUgYWN0dWFsIHJlY29nbml6aW5nIGhhcHBlbnMgaW4gdGhpcyBtZXRob2RcbiAgICAgKiBAdmlydHVhbFxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dERhdGFcbiAgICAgKiBAcmV0dXJucyB7Q29uc3R9IFNUQVRFXG4gICAgICovXG4gICAgcHJvY2VzczogZnVuY3Rpb24oaW5wdXREYXRhKSB7IH0sIC8vIGpzaGludCBpZ25vcmU6bGluZVxuXG4gICAgLyoqXG4gICAgICogcmV0dXJuIHRoZSBwcmVmZXJyZWQgdG91Y2gtYWN0aW9uXG4gICAgICogQHZpcnR1YWxcbiAgICAgKiBAcmV0dXJucyB7QXJyYXl9XG4gICAgICovXG4gICAgZ2V0VG91Y2hBY3Rpb246IGZ1bmN0aW9uKCkgeyB9LFxuXG4gICAgLyoqXG4gICAgICogY2FsbGVkIHdoZW4gdGhlIGdlc3R1cmUgaXNuJ3QgYWxsb3dlZCB0byByZWNvZ25pemVcbiAgICAgKiBsaWtlIHdoZW4gYW5vdGhlciBpcyBiZWluZyByZWNvZ25pemVkIG9yIGl0IGlzIGRpc2FibGVkXG4gICAgICogQHZpcnR1YWxcbiAgICAgKi9cbiAgICByZXNldDogZnVuY3Rpb24oKSB7IH1cbn07XG5cbi8qKlxuICogZ2V0IGEgdXNhYmxlIHN0cmluZywgdXNlZCBhcyBldmVudCBwb3N0Zml4XG4gKiBAcGFyYW0ge0NvbnN0fSBzdGF0ZVxuICogQHJldHVybnMge1N0cmluZ30gc3RhdGVcbiAqL1xuZnVuY3Rpb24gc3RhdGVTdHIoc3RhdGUpIHtcbiAgICBpZiAoc3RhdGUgJiBTVEFURV9DQU5DRUxMRUQpIHtcbiAgICAgICAgcmV0dXJuICdjYW5jZWwnO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUgJiBTVEFURV9FTkRFRCkge1xuICAgICAgICByZXR1cm4gJ2VuZCc7XG4gICAgfSBlbHNlIGlmIChzdGF0ZSAmIFNUQVRFX0NIQU5HRUQpIHtcbiAgICAgICAgcmV0dXJuICdtb3ZlJztcbiAgICB9IGVsc2UgaWYgKHN0YXRlICYgU1RBVEVfQkVHQU4pIHtcbiAgICAgICAgcmV0dXJuICdzdGFydCc7XG4gICAgfVxuICAgIHJldHVybiAnJztcbn1cblxuLyoqXG4gKiBkaXJlY3Rpb24gY29ucyB0byBzdHJpbmdcbiAqIEBwYXJhbSB7Q29uc3R9IGRpcmVjdGlvblxuICogQHJldHVybnMge1N0cmluZ31cbiAqL1xuZnVuY3Rpb24gZGlyZWN0aW9uU3RyKGRpcmVjdGlvbikge1xuICAgIGlmIChkaXJlY3Rpb24gPT0gRElSRUNUSU9OX0RPV04pIHtcbiAgICAgICAgcmV0dXJuICdkb3duJztcbiAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PSBESVJFQ1RJT05fVVApIHtcbiAgICAgICAgcmV0dXJuICd1cCc7XG4gICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRElSRUNUSU9OX0xFRlQpIHtcbiAgICAgICAgcmV0dXJuICdsZWZ0JztcbiAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiA9PSBESVJFQ1RJT05fUklHSFQpIHtcbiAgICAgICAgcmV0dXJuICdyaWdodCc7XG4gICAgfVxuICAgIHJldHVybiAnJztcbn1cblxuLyoqXG4gKiBnZXQgYSByZWNvZ25pemVyIGJ5IG5hbWUgaWYgaXQgaXMgYm91bmQgdG8gYSBtYW5hZ2VyXG4gKiBAcGFyYW0ge1JlY29nbml6ZXJ8U3RyaW5nfSBvdGhlclJlY29nbml6ZXJcbiAqIEBwYXJhbSB7UmVjb2duaXplcn0gcmVjb2duaXplclxuICogQHJldHVybnMge1JlY29nbml6ZXJ9XG4gKi9cbmZ1bmN0aW9uIGdldFJlY29nbml6ZXJCeU5hbWVJZk1hbmFnZXIob3RoZXJSZWNvZ25pemVyLCByZWNvZ25pemVyKSB7XG4gICAgdmFyIG1hbmFnZXIgPSByZWNvZ25pemVyLm1hbmFnZXI7XG4gICAgaWYgKG1hbmFnZXIpIHtcbiAgICAgICAgcmV0dXJuIG1hbmFnZXIuZ2V0KG90aGVyUmVjb2duaXplcik7XG4gICAgfVxuICAgIHJldHVybiBvdGhlclJlY29nbml6ZXI7XG59XG5cbi8qKlxuICogVGhpcyByZWNvZ25pemVyIGlzIGp1c3QgdXNlZCBhcyBhIGJhc2UgZm9yIHRoZSBzaW1wbGUgYXR0cmlidXRlIHJlY29nbml6ZXJzLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBSZWNvZ25pemVyXG4gKi9cbmZ1bmN0aW9uIEF0dHJSZWNvZ25pemVyKCkge1xuICAgIFJlY29nbml6ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuaW5oZXJpdChBdHRyUmVjb2duaXplciwgUmVjb2duaXplciwge1xuICAgIC8qKlxuICAgICAqIEBuYW1lc3BhY2VcbiAgICAgKiBAbWVtYmVyb2YgQXR0clJlY29nbml6ZXJcbiAgICAgKi9cbiAgICBkZWZhdWx0czoge1xuICAgICAgICAvKipcbiAgICAgICAgICogQHR5cGUge051bWJlcn1cbiAgICAgICAgICogQGRlZmF1bHQgMVxuICAgICAgICAgKi9cbiAgICAgICAgcG9pbnRlcnM6IDFcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVXNlZCB0byBjaGVjayBpZiBpdCB0aGUgcmVjb2duaXplciByZWNlaXZlcyB2YWxpZCBpbnB1dCwgbGlrZSBpbnB1dC5kaXN0YW5jZSA+IDEwLlxuICAgICAqIEBtZW1iZXJvZiBBdHRyUmVjb2duaXplclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dFxuICAgICAqIEByZXR1cm5zIHtCb29sZWFufSByZWNvZ25pemVkXG4gICAgICovXG4gICAgYXR0clRlc3Q6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHZhciBvcHRpb25Qb2ludGVycyA9IHRoaXMub3B0aW9ucy5wb2ludGVycztcbiAgICAgICAgcmV0dXJuIG9wdGlvblBvaW50ZXJzID09PSAwIHx8IGlucHV0LnBvaW50ZXJzLmxlbmd0aCA9PT0gb3B0aW9uUG9pbnRlcnM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFByb2Nlc3MgdGhlIGlucHV0IGFuZCByZXR1cm4gdGhlIHN0YXRlIGZvciB0aGUgcmVjb2duaXplclxuICAgICAqIEBtZW1iZXJvZiBBdHRyUmVjb2duaXplclxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dFxuICAgICAqIEByZXR1cm5zIHsqfSBTdGF0ZVxuICAgICAqL1xuICAgIHByb2Nlc3M6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHZhciBzdGF0ZSA9IHRoaXMuc3RhdGU7XG4gICAgICAgIHZhciBldmVudFR5cGUgPSBpbnB1dC5ldmVudFR5cGU7XG5cbiAgICAgICAgdmFyIGlzUmVjb2duaXplZCA9IHN0YXRlICYgKFNUQVRFX0JFR0FOIHwgU1RBVEVfQ0hBTkdFRCk7XG4gICAgICAgIHZhciBpc1ZhbGlkID0gdGhpcy5hdHRyVGVzdChpbnB1dCk7XG5cbiAgICAgICAgLy8gb24gY2FuY2VsIGlucHV0IGFuZCB3ZSd2ZSByZWNvZ25pemVkIGJlZm9yZSwgcmV0dXJuIFNUQVRFX0NBTkNFTExFRFxuICAgICAgICBpZiAoaXNSZWNvZ25pemVkICYmIChldmVudFR5cGUgJiBJTlBVVF9DQU5DRUwgfHwgIWlzVmFsaWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUgfCBTVEFURV9DQU5DRUxMRUQ7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNSZWNvZ25pemVkIHx8IGlzVmFsaWQpIHtcbiAgICAgICAgICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9FTkQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc3RhdGUgfCBTVEFURV9FTkRFRDtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIShzdGF0ZSAmIFNUQVRFX0JFR0FOKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBTVEFURV9CRUdBTjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBzdGF0ZSB8IFNUQVRFX0NIQU5HRUQ7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFNUQVRFX0ZBSUxFRDtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBQYW5cbiAqIFJlY29nbml6ZWQgd2hlbiB0aGUgcG9pbnRlciBpcyBkb3duIGFuZCBtb3ZlZCBpbiB0aGUgYWxsb3dlZCBkaXJlY3Rpb24uXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIEF0dHJSZWNvZ25pemVyXG4gKi9cbmZ1bmN0aW9uIFBhblJlY29nbml6ZXIoKSB7XG4gICAgQXR0clJlY29nbml6ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHRoaXMucFggPSBudWxsO1xuICAgIHRoaXMucFkgPSBudWxsO1xufVxuXG5pbmhlcml0KFBhblJlY29nbml6ZXIsIEF0dHJSZWNvZ25pemVyLCB7XG4gICAgLyoqXG4gICAgICogQG5hbWVzcGFjZVxuICAgICAqIEBtZW1iZXJvZiBQYW5SZWNvZ25pemVyXG4gICAgICovXG4gICAgZGVmYXVsdHM6IHtcbiAgICAgICAgZXZlbnQ6ICdwYW4nLFxuICAgICAgICB0aHJlc2hvbGQ6IDEwLFxuICAgICAgICBwb2ludGVyczogMSxcbiAgICAgICAgZGlyZWN0aW9uOiBESVJFQ1RJT05fQUxMXG4gICAgfSxcblxuICAgIGdldFRvdWNoQWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGRpcmVjdGlvbiA9IHRoaXMub3B0aW9ucy5kaXJlY3Rpb247XG4gICAgICAgIHZhciBhY3Rpb25zID0gW107XG4gICAgICAgIGlmIChkaXJlY3Rpb24gJiBESVJFQ1RJT05fSE9SSVpPTlRBTCkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKFRPVUNIX0FDVElPTl9QQU5fWSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRpcmVjdGlvbiAmIERJUkVDVElPTl9WRVJUSUNBTCkge1xuICAgICAgICAgICAgYWN0aW9ucy5wdXNoKFRPVUNIX0FDVElPTl9QQU5fWCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIGFjdGlvbnM7XG4gICAgfSxcblxuICAgIGRpcmVjdGlvblRlc3Q6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHZhciBvcHRpb25zID0gdGhpcy5vcHRpb25zO1xuICAgICAgICB2YXIgaGFzTW92ZWQgPSB0cnVlO1xuICAgICAgICB2YXIgZGlzdGFuY2UgPSBpbnB1dC5kaXN0YW5jZTtcbiAgICAgICAgdmFyIGRpcmVjdGlvbiA9IGlucHV0LmRpcmVjdGlvbjtcbiAgICAgICAgdmFyIHggPSBpbnB1dC5kZWx0YVg7XG4gICAgICAgIHZhciB5ID0gaW5wdXQuZGVsdGFZO1xuXG4gICAgICAgIC8vIGxvY2sgdG8gYXhpcz9cbiAgICAgICAgaWYgKCEoZGlyZWN0aW9uICYgb3B0aW9ucy5kaXJlY3Rpb24pKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5kaXJlY3Rpb24gJiBESVJFQ1RJT05fSE9SSVpPTlRBTCkge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9ICh4ID09PSAwKSA/IERJUkVDVElPTl9OT05FIDogKHggPCAwKSA/IERJUkVDVElPTl9MRUZUIDogRElSRUNUSU9OX1JJR0hUO1xuICAgICAgICAgICAgICAgIGhhc01vdmVkID0geCAhPSB0aGlzLnBYO1xuICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gTWF0aC5hYnMoaW5wdXQuZGVsdGFYKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0gKHkgPT09IDApID8gRElSRUNUSU9OX05PTkUgOiAoeSA8IDApID8gRElSRUNUSU9OX1VQIDogRElSRUNUSU9OX0RPV047XG4gICAgICAgICAgICAgICAgaGFzTW92ZWQgPSB5ICE9IHRoaXMucFk7XG4gICAgICAgICAgICAgICAgZGlzdGFuY2UgPSBNYXRoLmFicyhpbnB1dC5kZWx0YVkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlucHV0LmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbiAgICAgICAgcmV0dXJuIGhhc01vdmVkICYmIGRpc3RhbmNlID4gb3B0aW9ucy50aHJlc2hvbGQgJiYgZGlyZWN0aW9uICYgb3B0aW9ucy5kaXJlY3Rpb247XG4gICAgfSxcblxuICAgIGF0dHJUZXN0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICByZXR1cm4gQXR0clJlY29nbml6ZXIucHJvdG90eXBlLmF0dHJUZXN0LmNhbGwodGhpcywgaW5wdXQpICYmXG4gICAgICAgICAgICAodGhpcy5zdGF0ZSAmIFNUQVRFX0JFR0FOIHx8ICghKHRoaXMuc3RhdGUgJiBTVEFURV9CRUdBTikgJiYgdGhpcy5kaXJlY3Rpb25UZXN0KGlucHV0KSkpO1xuICAgIH0sXG5cbiAgICBlbWl0OiBmdW5jdGlvbihpbnB1dCkge1xuXG4gICAgICAgIHRoaXMucFggPSBpbnB1dC5kZWx0YVg7XG4gICAgICAgIHRoaXMucFkgPSBpbnB1dC5kZWx0YVk7XG5cbiAgICAgICAgdmFyIGRpcmVjdGlvbiA9IGRpcmVjdGlvblN0cihpbnB1dC5kaXJlY3Rpb24pO1xuXG4gICAgICAgIGlmIChkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgIGlucHV0LmFkZGl0aW9uYWxFdmVudCA9IHRoaXMub3B0aW9ucy5ldmVudCArIGRpcmVjdGlvbjtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zdXBlci5lbWl0LmNhbGwodGhpcywgaW5wdXQpO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIFBpbmNoXG4gKiBSZWNvZ25pemVkIHdoZW4gdHdvIG9yIG1vcmUgcG9pbnRlcnMgYXJlIG1vdmluZyB0b3dhcmQgKHpvb20taW4pIG9yIGF3YXkgZnJvbSBlYWNoIG90aGVyICh6b29tLW91dCkuXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIEF0dHJSZWNvZ25pemVyXG4gKi9cbmZ1bmN0aW9uIFBpbmNoUmVjb2duaXplcigpIHtcbiAgICBBdHRyUmVjb2duaXplci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5pbmhlcml0KFBpbmNoUmVjb2duaXplciwgQXR0clJlY29nbml6ZXIsIHtcbiAgICAvKipcbiAgICAgKiBAbmFtZXNwYWNlXG4gICAgICogQG1lbWJlcm9mIFBpbmNoUmVjb2duaXplclxuICAgICAqL1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGV2ZW50OiAncGluY2gnLFxuICAgICAgICB0aHJlc2hvbGQ6IDAsXG4gICAgICAgIHBvaW50ZXJzOiAyXG4gICAgfSxcblxuICAgIGdldFRvdWNoQWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFtUT1VDSF9BQ1RJT05fTk9ORV07XG4gICAgfSxcblxuICAgIGF0dHJUZXN0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3VwZXIuYXR0clRlc3QuY2FsbCh0aGlzLCBpbnB1dCkgJiZcbiAgICAgICAgICAgIChNYXRoLmFicyhpbnB1dC5zY2FsZSAtIDEpID4gdGhpcy5vcHRpb25zLnRocmVzaG9sZCB8fCB0aGlzLnN0YXRlICYgU1RBVEVfQkVHQU4pO1xuICAgIH0sXG5cbiAgICBlbWl0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICBpZiAoaW5wdXQuc2NhbGUgIT09IDEpIHtcbiAgICAgICAgICAgIHZhciBpbk91dCA9IGlucHV0LnNjYWxlIDwgMSA/ICdpbicgOiAnb3V0JztcbiAgICAgICAgICAgIGlucHV0LmFkZGl0aW9uYWxFdmVudCA9IHRoaXMub3B0aW9ucy5ldmVudCArIGluT3V0O1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuX3N1cGVyLmVtaXQuY2FsbCh0aGlzLCBpbnB1dCk7XG4gICAgfVxufSk7XG5cbi8qKlxuICogUHJlc3NcbiAqIFJlY29nbml6ZWQgd2hlbiB0aGUgcG9pbnRlciBpcyBkb3duIGZvciB4IG1zIHdpdGhvdXQgYW55IG1vdmVtZW50LlxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBSZWNvZ25pemVyXG4gKi9cbmZ1bmN0aW9uIFByZXNzUmVjb2duaXplcigpIHtcbiAgICBSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0aGlzLl90aW1lciA9IG51bGw7XG4gICAgdGhpcy5faW5wdXQgPSBudWxsO1xufVxuXG5pbmhlcml0KFByZXNzUmVjb2duaXplciwgUmVjb2duaXplciwge1xuICAgIC8qKlxuICAgICAqIEBuYW1lc3BhY2VcbiAgICAgKiBAbWVtYmVyb2YgUHJlc3NSZWNvZ25pemVyXG4gICAgICovXG4gICAgZGVmYXVsdHM6IHtcbiAgICAgICAgZXZlbnQ6ICdwcmVzcycsXG4gICAgICAgIHBvaW50ZXJzOiAxLFxuICAgICAgICB0aW1lOiAyNTEsIC8vIG1pbmltYWwgdGltZSBvZiB0aGUgcG9pbnRlciB0byBiZSBwcmVzc2VkXG4gICAgICAgIHRocmVzaG9sZDogOSAvLyBhIG1pbmltYWwgbW92ZW1lbnQgaXMgb2ssIGJ1dCBrZWVwIGl0IGxvd1xuICAgIH0sXG5cbiAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBbVE9VQ0hfQUNUSU9OX0FVVE9dO1xuICAgIH0sXG5cbiAgICBwcm9jZXNzOiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgICAgdmFyIHZhbGlkUG9pbnRlcnMgPSBpbnB1dC5wb2ludGVycy5sZW5ndGggPT09IG9wdGlvbnMucG9pbnRlcnM7XG4gICAgICAgIHZhciB2YWxpZE1vdmVtZW50ID0gaW5wdXQuZGlzdGFuY2UgPCBvcHRpb25zLnRocmVzaG9sZDtcbiAgICAgICAgdmFyIHZhbGlkVGltZSA9IGlucHV0LmRlbHRhVGltZSA+IG9wdGlvbnMudGltZTtcblxuICAgICAgICB0aGlzLl9pbnB1dCA9IGlucHV0O1xuXG4gICAgICAgIC8vIHdlIG9ubHkgYWxsb3cgbGl0dGxlIG1vdmVtZW50XG4gICAgICAgIC8vIGFuZCB3ZSd2ZSByZWFjaGVkIGFuIGVuZCBldmVudCwgc28gYSB0YXAgaXMgcG9zc2libGVcbiAgICAgICAgaWYgKCF2YWxpZE1vdmVtZW50IHx8ICF2YWxpZFBvaW50ZXJzIHx8IChpbnB1dC5ldmVudFR5cGUgJiAoSU5QVVRfRU5EIHwgSU5QVVRfQ0FOQ0VMKSAmJiAhdmFsaWRUaW1lKSkge1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICB9IGVsc2UgaWYgKGlucHV0LmV2ZW50VHlwZSAmIElOUFVUX1NUQVJUKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXRDb250ZXh0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURV9SRUNPR05JWkVEO1xuICAgICAgICAgICAgICAgIHRoaXMudHJ5RW1pdCgpO1xuICAgICAgICAgICAgfSwgb3B0aW9ucy50aW1lLCB0aGlzKTtcbiAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5ldmVudFR5cGUgJiBJTlBVVF9FTkQpIHtcbiAgICAgICAgICAgIHJldHVybiBTVEFURV9SRUNPR05JWkVEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBTVEFURV9GQUlMRUQ7XG4gICAgfSxcblxuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3RpbWVyKTtcbiAgICB9LFxuXG4gICAgZW1pdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgIT09IFNUQVRFX1JFQ09HTklaRUQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpbnB1dCAmJiAoaW5wdXQuZXZlbnRUeXBlICYgSU5QVVRfRU5EKSkge1xuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQodGhpcy5vcHRpb25zLmV2ZW50ICsgJ3VwJywgaW5wdXQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5faW5wdXQudGltZVN0YW1wID0gbm93KCk7XG4gICAgICAgICAgICB0aGlzLm1hbmFnZXIuZW1pdCh0aGlzLm9wdGlvbnMuZXZlbnQsIHRoaXMuX2lucHV0KTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG4vKipcbiAqIFJvdGF0ZVxuICogUmVjb2duaXplZCB3aGVuIHR3byBvciBtb3JlIHBvaW50ZXIgYXJlIG1vdmluZyBpbiBhIGNpcmN1bGFyIG1vdGlvbi5cbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgQXR0clJlY29nbml6ZXJcbiAqL1xuZnVuY3Rpb24gUm90YXRlUmVjb2duaXplcigpIHtcbiAgICBBdHRyUmVjb2duaXplci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5pbmhlcml0KFJvdGF0ZVJlY29nbml6ZXIsIEF0dHJSZWNvZ25pemVyLCB7XG4gICAgLyoqXG4gICAgICogQG5hbWVzcGFjZVxuICAgICAqIEBtZW1iZXJvZiBSb3RhdGVSZWNvZ25pemVyXG4gICAgICovXG4gICAgZGVmYXVsdHM6IHtcbiAgICAgICAgZXZlbnQ6ICdyb3RhdGUnLFxuICAgICAgICB0aHJlc2hvbGQ6IDAsXG4gICAgICAgIHBvaW50ZXJzOiAyXG4gICAgfSxcblxuICAgIGdldFRvdWNoQWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFtUT1VDSF9BQ1RJT05fTk9ORV07XG4gICAgfSxcblxuICAgIGF0dHJUZXN0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICByZXR1cm4gdGhpcy5fc3VwZXIuYXR0clRlc3QuY2FsbCh0aGlzLCBpbnB1dCkgJiZcbiAgICAgICAgICAgIChNYXRoLmFicyhpbnB1dC5yb3RhdGlvbikgPiB0aGlzLm9wdGlvbnMudGhyZXNob2xkIHx8IHRoaXMuc3RhdGUgJiBTVEFURV9CRUdBTik7XG4gICAgfVxufSk7XG5cbi8qKlxuICogU3dpcGVcbiAqIFJlY29nbml6ZWQgd2hlbiB0aGUgcG9pbnRlciBpcyBtb3ZpbmcgZmFzdCAodmVsb2NpdHkpLCB3aXRoIGVub3VnaCBkaXN0YW5jZSBpbiB0aGUgYWxsb3dlZCBkaXJlY3Rpb24uXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIEF0dHJSZWNvZ25pemVyXG4gKi9cbmZ1bmN0aW9uIFN3aXBlUmVjb2duaXplcigpIHtcbiAgICBBdHRyUmVjb2duaXplci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xufVxuXG5pbmhlcml0KFN3aXBlUmVjb2duaXplciwgQXR0clJlY29nbml6ZXIsIHtcbiAgICAvKipcbiAgICAgKiBAbmFtZXNwYWNlXG4gICAgICogQG1lbWJlcm9mIFN3aXBlUmVjb2duaXplclxuICAgICAqL1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGV2ZW50OiAnc3dpcGUnLFxuICAgICAgICB0aHJlc2hvbGQ6IDEwLFxuICAgICAgICB2ZWxvY2l0eTogMC4zLFxuICAgICAgICBkaXJlY3Rpb246IERJUkVDVElPTl9IT1JJWk9OVEFMIHwgRElSRUNUSU9OX1ZFUlRJQ0FMLFxuICAgICAgICBwb2ludGVyczogMVxuICAgIH0sXG5cbiAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBQYW5SZWNvZ25pemVyLnByb3RvdHlwZS5nZXRUb3VjaEFjdGlvbi5jYWxsKHRoaXMpO1xuICAgIH0sXG5cbiAgICBhdHRyVGVzdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgdmFyIGRpcmVjdGlvbiA9IHRoaXMub3B0aW9ucy5kaXJlY3Rpb247XG4gICAgICAgIHZhciB2ZWxvY2l0eTtcblxuICAgICAgICBpZiAoZGlyZWN0aW9uICYgKERJUkVDVElPTl9IT1JJWk9OVEFMIHwgRElSRUNUSU9OX1ZFUlRJQ0FMKSkge1xuICAgICAgICAgICAgdmVsb2NpdHkgPSBpbnB1dC5vdmVyYWxsVmVsb2NpdHk7XG4gICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uICYgRElSRUNUSU9OX0hPUklaT05UQUwpIHtcbiAgICAgICAgICAgIHZlbG9jaXR5ID0gaW5wdXQub3ZlcmFsbFZlbG9jaXR5WDtcbiAgICAgICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gJiBESVJFQ1RJT05fVkVSVElDQUwpIHtcbiAgICAgICAgICAgIHZlbG9jaXR5ID0gaW5wdXQub3ZlcmFsbFZlbG9jaXR5WTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9zdXBlci5hdHRyVGVzdC5jYWxsKHRoaXMsIGlucHV0KSAmJlxuICAgICAgICAgICAgZGlyZWN0aW9uICYgaW5wdXQub2Zmc2V0RGlyZWN0aW9uICYmXG4gICAgICAgICAgICBpbnB1dC5kaXN0YW5jZSA+IHRoaXMub3B0aW9ucy50aHJlc2hvbGQgJiZcbiAgICAgICAgICAgIGlucHV0Lm1heFBvaW50ZXJzID09IHRoaXMub3B0aW9ucy5wb2ludGVycyAmJlxuICAgICAgICAgICAgYWJzKHZlbG9jaXR5KSA+IHRoaXMub3B0aW9ucy52ZWxvY2l0eSAmJiBpbnB1dC5ldmVudFR5cGUgJiBJTlBVVF9FTkQ7XG4gICAgfSxcblxuICAgIGVtaXQ6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBkaXJlY3Rpb25TdHIoaW5wdXQub2Zmc2V0RGlyZWN0aW9uKTtcbiAgICAgICAgaWYgKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQodGhpcy5vcHRpb25zLmV2ZW50ICsgZGlyZWN0aW9uLCBpbnB1dCk7XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLm1hbmFnZXIuZW1pdCh0aGlzLm9wdGlvbnMuZXZlbnQsIGlucHV0KTtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBBIHRhcCBpcyBlY29nbml6ZWQgd2hlbiB0aGUgcG9pbnRlciBpcyBkb2luZyBhIHNtYWxsIHRhcC9jbGljay4gTXVsdGlwbGUgdGFwcyBhcmUgcmVjb2duaXplZCBpZiB0aGV5IG9jY3VyXG4gKiBiZXR3ZWVuIHRoZSBnaXZlbiBpbnRlcnZhbCBhbmQgcG9zaXRpb24uIFRoZSBkZWxheSBvcHRpb24gY2FuIGJlIHVzZWQgdG8gcmVjb2duaXplIG11bHRpLXRhcHMgd2l0aG91dCBmaXJpbmdcbiAqIGEgc2luZ2xlIHRhcC5cbiAqXG4gKiBUaGUgZXZlbnREYXRhIGZyb20gdGhlIGVtaXR0ZWQgZXZlbnQgY29udGFpbnMgdGhlIHByb3BlcnR5IGB0YXBDb3VudGAsIHdoaWNoIGNvbnRhaW5zIHRoZSBhbW91bnQgb2ZcbiAqIG11bHRpLXRhcHMgYmVpbmcgcmVjb2duaXplZC5cbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBUYXBSZWNvZ25pemVyKCkge1xuICAgIFJlY29nbml6ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIC8vIHByZXZpb3VzIHRpbWUgYW5kIGNlbnRlcixcbiAgICAvLyB1c2VkIGZvciB0YXAgY291bnRpbmdcbiAgICB0aGlzLnBUaW1lID0gZmFsc2U7XG4gICAgdGhpcy5wQ2VudGVyID0gZmFsc2U7XG5cbiAgICB0aGlzLl90aW1lciA9IG51bGw7XG4gICAgdGhpcy5faW5wdXQgPSBudWxsO1xuICAgIHRoaXMuY291bnQgPSAwO1xufVxuXG5pbmhlcml0KFRhcFJlY29nbml6ZXIsIFJlY29nbml6ZXIsIHtcbiAgICAvKipcbiAgICAgKiBAbmFtZXNwYWNlXG4gICAgICogQG1lbWJlcm9mIFBpbmNoUmVjb2duaXplclxuICAgICAqL1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGV2ZW50OiAndGFwJyxcbiAgICAgICAgcG9pbnRlcnM6IDEsXG4gICAgICAgIHRhcHM6IDEsXG4gICAgICAgIGludGVydmFsOiAzMDAsIC8vIG1heCB0aW1lIGJldHdlZW4gdGhlIG11bHRpLXRhcCB0YXBzXG4gICAgICAgIHRpbWU6IDI1MCwgLy8gbWF4IHRpbWUgb2YgdGhlIHBvaW50ZXIgdG8gYmUgZG93biAobGlrZSBmaW5nZXIgb24gdGhlIHNjcmVlbilcbiAgICAgICAgdGhyZXNob2xkOiA5LCAvLyBhIG1pbmltYWwgbW92ZW1lbnQgaXMgb2ssIGJ1dCBrZWVwIGl0IGxvd1xuICAgICAgICBwb3NUaHJlc2hvbGQ6IDEwIC8vIGEgbXVsdGktdGFwIGNhbiBiZSBhIGJpdCBvZmYgdGhlIGluaXRpYWwgcG9zaXRpb25cbiAgICB9LFxuXG4gICAgZ2V0VG91Y2hBY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gW1RPVUNIX0FDVElPTl9NQU5JUFVMQVRJT05dO1xuICAgIH0sXG5cbiAgICBwcm9jZXNzOiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcblxuICAgICAgICB2YXIgdmFsaWRQb2ludGVycyA9IGlucHV0LnBvaW50ZXJzLmxlbmd0aCA9PT0gb3B0aW9ucy5wb2ludGVycztcbiAgICAgICAgdmFyIHZhbGlkTW92ZW1lbnQgPSBpbnB1dC5kaXN0YW5jZSA8IG9wdGlvbnMudGhyZXNob2xkO1xuICAgICAgICB2YXIgdmFsaWRUb3VjaFRpbWUgPSBpbnB1dC5kZWx0YVRpbWUgPCBvcHRpb25zLnRpbWU7XG5cbiAgICAgICAgdGhpcy5yZXNldCgpO1xuXG4gICAgICAgIGlmICgoaW5wdXQuZXZlbnRUeXBlICYgSU5QVVRfU1RBUlQpICYmICh0aGlzLmNvdW50ID09PSAwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbFRpbWVvdXQoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHdlIG9ubHkgYWxsb3cgbGl0dGxlIG1vdmVtZW50XG4gICAgICAgIC8vIGFuZCB3ZSd2ZSByZWFjaGVkIGFuIGVuZCBldmVudCwgc28gYSB0YXAgaXMgcG9zc2libGVcbiAgICAgICAgaWYgKHZhbGlkTW92ZW1lbnQgJiYgdmFsaWRUb3VjaFRpbWUgJiYgdmFsaWRQb2ludGVycykge1xuICAgICAgICAgICAgaWYgKGlucHV0LmV2ZW50VHlwZSAhPSBJTlBVVF9FTkQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5mYWlsVGltZW91dCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgdmFsaWRJbnRlcnZhbCA9IHRoaXMucFRpbWUgPyAoaW5wdXQudGltZVN0YW1wIC0gdGhpcy5wVGltZSA8IG9wdGlvbnMuaW50ZXJ2YWwpIDogdHJ1ZTtcbiAgICAgICAgICAgIHZhciB2YWxpZE11bHRpVGFwID0gIXRoaXMucENlbnRlciB8fCBnZXREaXN0YW5jZSh0aGlzLnBDZW50ZXIsIGlucHV0LmNlbnRlcikgPCBvcHRpb25zLnBvc1RocmVzaG9sZDtcblxuICAgICAgICAgICAgdGhpcy5wVGltZSA9IGlucHV0LnRpbWVTdGFtcDtcbiAgICAgICAgICAgIHRoaXMucENlbnRlciA9IGlucHV0LmNlbnRlcjtcblxuICAgICAgICAgICAgaWYgKCF2YWxpZE11bHRpVGFwIHx8ICF2YWxpZEludGVydmFsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5jb3VudCA9IDE7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuY291bnQgKz0gMTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcblxuICAgICAgICAgICAgLy8gaWYgdGFwIGNvdW50IG1hdGNoZXMgd2UgaGF2ZSByZWNvZ25pemVkIGl0LFxuICAgICAgICAgICAgLy8gZWxzZSBpdCBoYXMgYmVnYW4gcmVjb2duaXppbmcuLi5cbiAgICAgICAgICAgIHZhciB0YXBDb3VudCA9IHRoaXMuY291bnQgJSBvcHRpb25zLnRhcHM7XG4gICAgICAgICAgICBpZiAodGFwQ291bnQgPT09IDApIHtcbiAgICAgICAgICAgICAgICAvLyBubyBmYWlsaW5nIHJlcXVpcmVtZW50cywgaW1tZWRpYXRlbHkgdHJpZ2dlciB0aGUgdGFwIGV2ZW50XG4gICAgICAgICAgICAgICAgLy8gb3Igd2FpdCBhcyBsb25nIGFzIHRoZSBtdWx0aXRhcCBpbnRlcnZhbCB0byB0cmlnZ2VyXG4gICAgICAgICAgICAgICAgaWYgKCF0aGlzLmhhc1JlcXVpcmVGYWlsdXJlcygpKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTVEFURV9SRUNPR05JWkVEO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dENvbnRleHQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVfUkVDT0dOSVpFRDtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMudHJ5RW1pdCgpO1xuICAgICAgICAgICAgICAgICAgICB9LCBvcHRpb25zLmludGVydmFsLCB0aGlzKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIFNUQVRFX0JFR0FOO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gU1RBVEVfRkFJTEVEO1xuICAgIH0sXG5cbiAgICBmYWlsVGltZW91dDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuX3RpbWVyID0gc2V0VGltZW91dENvbnRleHQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVfRkFJTEVEO1xuICAgICAgICB9LCB0aGlzLm9wdGlvbnMuaW50ZXJ2YWwsIHRoaXMpO1xuICAgICAgICByZXR1cm4gU1RBVEVfRkFJTEVEO1xuICAgIH0sXG5cbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gICAgfSxcblxuICAgIGVtaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBpZiAodGhpcy5zdGF0ZSA9PSBTVEFURV9SRUNPR05JWkVEKSB7XG4gICAgICAgICAgICB0aGlzLl9pbnB1dC50YXBDb3VudCA9IHRoaXMuY291bnQ7XG4gICAgICAgICAgICB0aGlzLm1hbmFnZXIuZW1pdCh0aGlzLm9wdGlvbnMuZXZlbnQsIHRoaXMuX2lucHV0KTtcbiAgICAgICAgfVxuICAgIH1cbn0pO1xuXG4vKipcbiAqIFNpbXBsZSB3YXkgdG8gY3JlYXRlIGEgbWFuYWdlciB3aXRoIGEgZGVmYXVsdCBzZXQgb2YgcmVjb2duaXplcnMuXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gSGFtbWVyKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICBvcHRpb25zLnJlY29nbml6ZXJzID0gaWZVbmRlZmluZWQob3B0aW9ucy5yZWNvZ25pemVycywgSGFtbWVyLmRlZmF1bHRzLnByZXNldCk7XG4gICAgcmV0dXJuIG5ldyBNYW5hZ2VyKGVsZW1lbnQsIG9wdGlvbnMpO1xufVxuXG4vKipcbiAqIEBjb25zdCB7c3RyaW5nfVxuICovXG5IYW1tZXIuVkVSU0lPTiA9ICcyLjAuNyc7XG5cbi8qKlxuICogZGVmYXVsdCBzZXR0aW5nc1xuICogQG5hbWVzcGFjZVxuICovXG5IYW1tZXIuZGVmYXVsdHMgPSB7XG4gICAgLyoqXG4gICAgICogc2V0IGlmIERPTSBldmVudHMgYXJlIGJlaW5nIHRyaWdnZXJlZC5cbiAgICAgKiBCdXQgdGhpcyBpcyBzbG93ZXIgYW5kIHVudXNlZCBieSBzaW1wbGUgaW1wbGVtZW50YXRpb25zLCBzbyBkaXNhYmxlZCBieSBkZWZhdWx0LlxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IGZhbHNlXG4gICAgICovXG4gICAgZG9tRXZlbnRzOiBmYWxzZSxcblxuICAgIC8qKlxuICAgICAqIFRoZSB2YWx1ZSBmb3IgdGhlIHRvdWNoQWN0aW9uIHByb3BlcnR5L2ZhbGxiYWNrLlxuICAgICAqIFdoZW4gc2V0IHRvIGBjb21wdXRlYCBpdCB3aWxsIG1hZ2ljYWxseSBzZXQgdGhlIGNvcnJlY3QgdmFsdWUgYmFzZWQgb24gdGhlIGFkZGVkIHJlY29nbml6ZXJzLlxuICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICogQGRlZmF1bHQgY29tcHV0ZVxuICAgICAqL1xuICAgIHRvdWNoQWN0aW9uOiBUT1VDSF9BQ1RJT05fQ09NUFVURSxcblxuICAgIC8qKlxuICAgICAqIEB0eXBlIHtCb29sZWFufVxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBlbmFibGU6IHRydWUsXG5cbiAgICAvKipcbiAgICAgKiBFWFBFUklNRU5UQUwgRkVBVFVSRSAtLSBjYW4gYmUgcmVtb3ZlZC9jaGFuZ2VkXG4gICAgICogQ2hhbmdlIHRoZSBwYXJlbnQgaW5wdXQgdGFyZ2V0IGVsZW1lbnQuXG4gICAgICogSWYgTnVsbCwgdGhlbiBpdCBpcyBiZWluZyBzZXQgdGhlIHRvIG1haW4gZWxlbWVudC5cbiAgICAgKiBAdHlwZSB7TnVsbHxFdmVudFRhcmdldH1cbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG4gICAgaW5wdXRUYXJnZXQ6IG51bGwsXG5cbiAgICAvKipcbiAgICAgKiBmb3JjZSBhbiBpbnB1dCBjbGFzc1xuICAgICAqIEB0eXBlIHtOdWxsfEZ1bmN0aW9ufVxuICAgICAqIEBkZWZhdWx0IG51bGxcbiAgICAgKi9cbiAgICBpbnB1dENsYXNzOiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogRGVmYXVsdCByZWNvZ25pemVyIHNldHVwIHdoZW4gY2FsbGluZyBgSGFtbWVyKClgXG4gICAgICogV2hlbiBjcmVhdGluZyBhIG5ldyBNYW5hZ2VyIHRoZXNlIHdpbGwgYmUgc2tpcHBlZC5cbiAgICAgKiBAdHlwZSB7QXJyYXl9XG4gICAgICovXG4gICAgcHJlc2V0OiBbXG4gICAgICAgIC8vIFJlY29nbml6ZXJDbGFzcywgb3B0aW9ucywgW3JlY29nbml6ZVdpdGgsIC4uLl0sIFtyZXF1aXJlRmFpbHVyZSwgLi4uXVxuICAgICAgICBbUm90YXRlUmVjb2duaXplciwge2VuYWJsZTogZmFsc2V9XSxcbiAgICAgICAgW1BpbmNoUmVjb2duaXplciwge2VuYWJsZTogZmFsc2V9LCBbJ3JvdGF0ZSddXSxcbiAgICAgICAgW1N3aXBlUmVjb2duaXplciwge2RpcmVjdGlvbjogRElSRUNUSU9OX0hPUklaT05UQUx9XSxcbiAgICAgICAgW1BhblJlY29nbml6ZXIsIHtkaXJlY3Rpb246IERJUkVDVElPTl9IT1JJWk9OVEFMfSwgWydzd2lwZSddXSxcbiAgICAgICAgW1RhcFJlY29nbml6ZXJdLFxuICAgICAgICBbVGFwUmVjb2duaXplciwge2V2ZW50OiAnZG91YmxldGFwJywgdGFwczogMn0sIFsndGFwJ11dLFxuICAgICAgICBbUHJlc3NSZWNvZ25pemVyXVxuICAgIF0sXG5cbiAgICAvKipcbiAgICAgKiBTb21lIENTUyBwcm9wZXJ0aWVzIGNhbiBiZSB1c2VkIHRvIGltcHJvdmUgdGhlIHdvcmtpbmcgb2YgSGFtbWVyLlxuICAgICAqIEFkZCB0aGVtIHRvIHRoaXMgbWV0aG9kIGFuZCB0aGV5IHdpbGwgYmUgc2V0IHdoZW4gY3JlYXRpbmcgYSBuZXcgTWFuYWdlci5cbiAgICAgKiBAbmFtZXNwYWNlXG4gICAgICovXG4gICAgY3NzUHJvcHM6IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc2FibGVzIHRleHQgc2VsZWN0aW9uIHRvIGltcHJvdmUgdGhlIGRyYWdnaW5nIGdlc3R1cmUuIE1haW5seSBmb3IgZGVza3RvcCBicm93c2Vycy5cbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICogQGRlZmF1bHQgJ25vbmUnXG4gICAgICAgICAqL1xuICAgICAgICB1c2VyU2VsZWN0OiAnbm9uZScsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc2FibGUgdGhlIFdpbmRvd3MgUGhvbmUgZ3JpcHBlcnMgd2hlbiBwcmVzc2luZyBhbiBlbGVtZW50LlxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAgICAgKiBAZGVmYXVsdCAnbm9uZSdcbiAgICAgICAgICovXG4gICAgICAgIHRvdWNoU2VsZWN0OiAnbm9uZScsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERpc2FibGVzIHRoZSBkZWZhdWx0IGNhbGxvdXQgc2hvd24gd2hlbiB5b3UgdG91Y2ggYW5kIGhvbGQgYSB0b3VjaCB0YXJnZXQuXG4gICAgICAgICAqIE9uIGlPUywgd2hlbiB5b3UgdG91Y2ggYW5kIGhvbGQgYSB0b3VjaCB0YXJnZXQgc3VjaCBhcyBhIGxpbmssIFNhZmFyaSBkaXNwbGF5c1xuICAgICAgICAgKiBhIGNhbGxvdXQgY29udGFpbmluZyBpbmZvcm1hdGlvbiBhYm91dCB0aGUgbGluay4gVGhpcyBwcm9wZXJ0eSBhbGxvd3MgeW91IHRvIGRpc2FibGUgdGhhdCBjYWxsb3V0LlxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAgICAgKiBAZGVmYXVsdCAnbm9uZSdcbiAgICAgICAgICovXG4gICAgICAgIHRvdWNoQ2FsbG91dDogJ25vbmUnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTcGVjaWZpZXMgd2hldGhlciB6b29taW5nIGlzIGVuYWJsZWQuIFVzZWQgYnkgSUUxMD5cbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICogQGRlZmF1bHQgJ25vbmUnXG4gICAgICAgICAqL1xuICAgICAgICBjb250ZW50Wm9vbWluZzogJ25vbmUnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBTcGVjaWZpZXMgdGhhdCBhbiBlbnRpcmUgZWxlbWVudCBzaG91bGQgYmUgZHJhZ2dhYmxlIGluc3RlYWQgb2YgaXRzIGNvbnRlbnRzLiBNYWlubHkgZm9yIGRlc2t0b3AgYnJvd3NlcnMuXG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICAgICAqIEBkZWZhdWx0ICdub25lJ1xuICAgICAgICAgKi9cbiAgICAgICAgdXNlckRyYWc6ICdub25lJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogT3ZlcnJpZGVzIHRoZSBoaWdobGlnaHQgY29sb3Igc2hvd24gd2hlbiB0aGUgdXNlciB0YXBzIGEgbGluayBvciBhIEphdmFTY3JpcHRcbiAgICAgICAgICogY2xpY2thYmxlIGVsZW1lbnQgaW4gaU9TLiBUaGlzIHByb3BlcnR5IG9iZXlzIHRoZSBhbHBoYSB2YWx1ZSwgaWYgc3BlY2lmaWVkLlxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAgICAgKiBAZGVmYXVsdCAncmdiYSgwLDAsMCwwKSdcbiAgICAgICAgICovXG4gICAgICAgIHRhcEhpZ2hsaWdodENvbG9yOiAncmdiYSgwLDAsMCwwKSdcbiAgICB9XG59O1xuXG52YXIgU1RPUCA9IDE7XG52YXIgRk9SQ0VEX1NUT1AgPSAyO1xuXG4vKipcbiAqIE1hbmFnZXJcbiAqIEBwYXJhbSB7SFRNTEVsZW1lbnR9IGVsZW1lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBbb3B0aW9uc11cbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBNYW5hZ2VyKGVsZW1lbnQsIG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBhc3NpZ24oe30sIEhhbW1lci5kZWZhdWx0cywgb3B0aW9ucyB8fCB7fSk7XG5cbiAgICB0aGlzLm9wdGlvbnMuaW5wdXRUYXJnZXQgPSB0aGlzLm9wdGlvbnMuaW5wdXRUYXJnZXQgfHwgZWxlbWVudDtcblxuICAgIHRoaXMuaGFuZGxlcnMgPSB7fTtcbiAgICB0aGlzLnNlc3Npb24gPSB7fTtcbiAgICB0aGlzLnJlY29nbml6ZXJzID0gW107XG4gICAgdGhpcy5vbGRDc3NQcm9wcyA9IHt9O1xuXG4gICAgdGhpcy5lbGVtZW50ID0gZWxlbWVudDtcbiAgICB0aGlzLmlucHV0ID0gY3JlYXRlSW5wdXRJbnN0YW5jZSh0aGlzKTtcbiAgICB0aGlzLnRvdWNoQWN0aW9uID0gbmV3IFRvdWNoQWN0aW9uKHRoaXMsIHRoaXMub3B0aW9ucy50b3VjaEFjdGlvbik7XG5cbiAgICB0b2dnbGVDc3NQcm9wcyh0aGlzLCB0cnVlKTtcblxuICAgIGVhY2godGhpcy5vcHRpb25zLnJlY29nbml6ZXJzLCBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgIHZhciByZWNvZ25pemVyID0gdGhpcy5hZGQobmV3IChpdGVtWzBdKShpdGVtWzFdKSk7XG4gICAgICAgIGl0ZW1bMl0gJiYgcmVjb2duaXplci5yZWNvZ25pemVXaXRoKGl0ZW1bMl0pO1xuICAgICAgICBpdGVtWzNdICYmIHJlY29nbml6ZXIucmVxdWlyZUZhaWx1cmUoaXRlbVszXSk7XG4gICAgfSwgdGhpcyk7XG59XG5cbk1hbmFnZXIucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIHNldCBvcHRpb25zXG4gICAgICogQHBhcmFtIHtPYmplY3R9IG9wdGlvbnNcbiAgICAgKiBAcmV0dXJucyB7TWFuYWdlcn1cbiAgICAgKi9cbiAgICBzZXQ6IGZ1bmN0aW9uKG9wdGlvbnMpIHtcbiAgICAgICAgYXNzaWduKHRoaXMub3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICAgICAgLy8gT3B0aW9ucyB0aGF0IG5lZWQgYSBsaXR0bGUgbW9yZSBzZXR1cFxuICAgICAgICBpZiAob3B0aW9ucy50b3VjaEFjdGlvbikge1xuICAgICAgICAgICAgdGhpcy50b3VjaEFjdGlvbi51cGRhdGUoKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAob3B0aW9ucy5pbnB1dFRhcmdldCkge1xuICAgICAgICAgICAgLy8gQ2xlYW4gdXAgZXhpc3RpbmcgZXZlbnQgbGlzdGVuZXJzIGFuZCByZWluaXRpYWxpemVcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuZGVzdHJveSgpO1xuICAgICAgICAgICAgdGhpcy5pbnB1dC50YXJnZXQgPSBvcHRpb25zLmlucHV0VGFyZ2V0O1xuICAgICAgICAgICAgdGhpcy5pbnB1dC5pbml0KCk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHN0b3AgcmVjb2duaXppbmcgZm9yIHRoaXMgc2Vzc2lvbi5cbiAgICAgKiBUaGlzIHNlc3Npb24gd2lsbCBiZSBkaXNjYXJkZWQsIHdoZW4gYSBuZXcgW2lucHV0XXN0YXJ0IGV2ZW50IGlzIGZpcmVkLlxuICAgICAqIFdoZW4gZm9yY2VkLCB0aGUgcmVjb2duaXplciBjeWNsZSBpcyBzdG9wcGVkIGltbWVkaWF0ZWx5LlxuICAgICAqIEBwYXJhbSB7Qm9vbGVhbn0gW2ZvcmNlXVxuICAgICAqL1xuICAgIHN0b3A6IGZ1bmN0aW9uKGZvcmNlKSB7XG4gICAgICAgIHRoaXMuc2Vzc2lvbi5zdG9wcGVkID0gZm9yY2UgPyBGT1JDRURfU1RPUCA6IFNUT1A7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHJ1biB0aGUgcmVjb2duaXplcnMhXG4gICAgICogY2FsbGVkIGJ5IHRoZSBpbnB1dEhhbmRsZXIgZnVuY3Rpb24gb24gZXZlcnkgbW92ZW1lbnQgb2YgdGhlIHBvaW50ZXJzICh0b3VjaGVzKVxuICAgICAqIGl0IHdhbGtzIHRocm91Z2ggYWxsIHRoZSByZWNvZ25pemVycyBhbmQgdHJpZXMgdG8gZGV0ZWN0IHRoZSBnZXN0dXJlIHRoYXQgaXMgYmVpbmcgbWFkZVxuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBpbnB1dERhdGFcbiAgICAgKi9cbiAgICByZWNvZ25pemU6IGZ1bmN0aW9uKGlucHV0RGF0YSkge1xuICAgICAgICB2YXIgc2Vzc2lvbiA9IHRoaXMuc2Vzc2lvbjtcbiAgICAgICAgaWYgKHNlc3Npb24uc3RvcHBlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcnVuIHRoZSB0b3VjaC1hY3Rpb24gcG9seWZpbGxcbiAgICAgICAgdGhpcy50b3VjaEFjdGlvbi5wcmV2ZW50RGVmYXVsdHMoaW5wdXREYXRhKTtcblxuICAgICAgICB2YXIgcmVjb2duaXplcjtcbiAgICAgICAgdmFyIHJlY29nbml6ZXJzID0gdGhpcy5yZWNvZ25pemVycztcblxuICAgICAgICAvLyB0aGlzIGhvbGRzIHRoZSByZWNvZ25pemVyIHRoYXQgaXMgYmVpbmcgcmVjb2duaXplZC5cbiAgICAgICAgLy8gc28gdGhlIHJlY29nbml6ZXIncyBzdGF0ZSBuZWVkcyB0byBiZSBCRUdBTiwgQ0hBTkdFRCwgRU5ERUQgb3IgUkVDT0dOSVpFRFxuICAgICAgICAvLyBpZiBubyByZWNvZ25pemVyIGlzIGRldGVjdGluZyBhIHRoaW5nLCBpdCBpcyBzZXQgdG8gYG51bGxgXG4gICAgICAgIHZhciBjdXJSZWNvZ25pemVyID0gc2Vzc2lvbi5jdXJSZWNvZ25pemVyO1xuXG4gICAgICAgIC8vIHJlc2V0IHdoZW4gdGhlIGxhc3QgcmVjb2duaXplciBpcyByZWNvZ25pemVkXG4gICAgICAgIC8vIG9yIHdoZW4gd2UncmUgaW4gYSBuZXcgc2Vzc2lvblxuICAgICAgICBpZiAoIWN1clJlY29nbml6ZXIgfHwgKGN1clJlY29nbml6ZXIgJiYgY3VyUmVjb2duaXplci5zdGF0ZSAmIFNUQVRFX1JFQ09HTklaRUQpKSB7XG4gICAgICAgICAgICBjdXJSZWNvZ25pemVyID0gc2Vzc2lvbi5jdXJSZWNvZ25pemVyID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCByZWNvZ25pemVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJlY29nbml6ZXIgPSByZWNvZ25pemVyc1tpXTtcblxuICAgICAgICAgICAgLy8gZmluZCBvdXQgaWYgd2UgYXJlIGFsbG93ZWQgdHJ5IHRvIHJlY29nbml6ZSB0aGUgaW5wdXQgZm9yIHRoaXMgb25lLlxuICAgICAgICAgICAgLy8gMS4gICBhbGxvdyBpZiB0aGUgc2Vzc2lvbiBpcyBOT1QgZm9yY2VkIHN0b3BwZWQgKHNlZSB0aGUgLnN0b3AoKSBtZXRob2QpXG4gICAgICAgICAgICAvLyAyLiAgIGFsbG93IGlmIHdlIHN0aWxsIGhhdmVuJ3QgcmVjb2duaXplZCBhIGdlc3R1cmUgaW4gdGhpcyBzZXNzaW9uLCBvciB0aGUgdGhpcyByZWNvZ25pemVyIGlzIHRoZSBvbmVcbiAgICAgICAgICAgIC8vICAgICAgdGhhdCBpcyBiZWluZyByZWNvZ25pemVkLlxuICAgICAgICAgICAgLy8gMy4gICBhbGxvdyBpZiB0aGUgcmVjb2duaXplciBpcyBhbGxvd2VkIHRvIHJ1biBzaW11bHRhbmVvdXMgd2l0aCB0aGUgY3VycmVudCByZWNvZ25pemVkIHJlY29nbml6ZXIuXG4gICAgICAgICAgICAvLyAgICAgIHRoaXMgY2FuIGJlIHNldHVwIHdpdGggdGhlIGByZWNvZ25pemVXaXRoKClgIG1ldGhvZCBvbiB0aGUgcmVjb2duaXplci5cbiAgICAgICAgICAgIGlmIChzZXNzaW9uLnN0b3BwZWQgIT09IEZPUkNFRF9TVE9QICYmICggLy8gMVxuICAgICAgICAgICAgICAgICAgICAhY3VyUmVjb2duaXplciB8fCByZWNvZ25pemVyID09IGN1clJlY29nbml6ZXIgfHwgLy8gMlxuICAgICAgICAgICAgICAgICAgICByZWNvZ25pemVyLmNhblJlY29nbml6ZVdpdGgoY3VyUmVjb2duaXplcikpKSB7IC8vIDNcbiAgICAgICAgICAgICAgICByZWNvZ25pemVyLnJlY29nbml6ZShpbnB1dERhdGEpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWNvZ25pemVyLnJlc2V0KCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGlmIHRoZSByZWNvZ25pemVyIGhhcyBiZWVuIHJlY29nbml6aW5nIHRoZSBpbnB1dCBhcyBhIHZhbGlkIGdlc3R1cmUsIHdlIHdhbnQgdG8gc3RvcmUgdGhpcyBvbmUgYXMgdGhlXG4gICAgICAgICAgICAvLyBjdXJyZW50IGFjdGl2ZSByZWNvZ25pemVyLiBidXQgb25seSBpZiB3ZSBkb24ndCBhbHJlYWR5IGhhdmUgYW4gYWN0aXZlIHJlY29nbml6ZXJcbiAgICAgICAgICAgIGlmICghY3VyUmVjb2duaXplciAmJiByZWNvZ25pemVyLnN0YXRlICYgKFNUQVRFX0JFR0FOIHwgU1RBVEVfQ0hBTkdFRCB8IFNUQVRFX0VOREVEKSkge1xuICAgICAgICAgICAgICAgIGN1clJlY29nbml6ZXIgPSBzZXNzaW9uLmN1clJlY29nbml6ZXIgPSByZWNvZ25pemVyO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGdldCBhIHJlY29nbml6ZXIgYnkgaXRzIGV2ZW50IG5hbWUuXG4gICAgICogQHBhcmFtIHtSZWNvZ25pemVyfFN0cmluZ30gcmVjb2duaXplclxuICAgICAqIEByZXR1cm5zIHtSZWNvZ25pemVyfE51bGx9XG4gICAgICovXG4gICAgZ2V0OiBmdW5jdGlvbihyZWNvZ25pemVyKSB7XG4gICAgICAgIGlmIChyZWNvZ25pemVyIGluc3RhbmNlb2YgUmVjb2duaXplcikge1xuICAgICAgICAgICAgcmV0dXJuIHJlY29nbml6ZXI7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVjb2duaXplcnMgPSB0aGlzLnJlY29nbml6ZXJzO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHJlY29nbml6ZXJzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAocmVjb2duaXplcnNbaV0ub3B0aW9ucy5ldmVudCA9PSByZWNvZ25pemVyKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlY29nbml6ZXJzW2ldO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBhZGQgYSByZWNvZ25pemVyIHRvIHRoZSBtYW5hZ2VyXG4gICAgICogZXhpc3RpbmcgcmVjb2duaXplcnMgd2l0aCB0aGUgc2FtZSBldmVudCBuYW1lIHdpbGwgYmUgcmVtb3ZlZFxuICAgICAqIEBwYXJhbSB7UmVjb2duaXplcn0gcmVjb2duaXplclxuICAgICAqIEByZXR1cm5zIHtSZWNvZ25pemVyfE1hbmFnZXJ9XG4gICAgICovXG4gICAgYWRkOiBmdW5jdGlvbihyZWNvZ25pemVyKSB7XG4gICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhyZWNvZ25pemVyLCAnYWRkJywgdGhpcykpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVtb3ZlIGV4aXN0aW5nXG4gICAgICAgIHZhciBleGlzdGluZyA9IHRoaXMuZ2V0KHJlY29nbml6ZXIub3B0aW9ucy5ldmVudCk7XG4gICAgICAgIGlmIChleGlzdGluZykge1xuICAgICAgICAgICAgdGhpcy5yZW1vdmUoZXhpc3RpbmcpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZWNvZ25pemVycy5wdXNoKHJlY29nbml6ZXIpO1xuICAgICAgICByZWNvZ25pemVyLm1hbmFnZXIgPSB0aGlzO1xuXG4gICAgICAgIHRoaXMudG91Y2hBY3Rpb24udXBkYXRlKCk7XG4gICAgICAgIHJldHVybiByZWNvZ25pemVyO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW1vdmUgYSByZWNvZ25pemVyIGJ5IG5hbWUgb3IgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0ge1JlY29nbml6ZXJ8U3RyaW5nfSByZWNvZ25pemVyXG4gICAgICogQHJldHVybnMge01hbmFnZXJ9XG4gICAgICovXG4gICAgcmVtb3ZlOiBmdW5jdGlvbihyZWNvZ25pemVyKSB7XG4gICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhyZWNvZ25pemVyLCAncmVtb3ZlJywgdGhpcykpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgcmVjb2duaXplciA9IHRoaXMuZ2V0KHJlY29nbml6ZXIpO1xuXG4gICAgICAgIC8vIGxldCdzIG1ha2Ugc3VyZSB0aGlzIHJlY29nbml6ZXIgZXhpc3RzXG4gICAgICAgIGlmIChyZWNvZ25pemVyKSB7XG4gICAgICAgICAgICB2YXIgcmVjb2duaXplcnMgPSB0aGlzLnJlY29nbml6ZXJzO1xuICAgICAgICAgICAgdmFyIGluZGV4ID0gaW5BcnJheShyZWNvZ25pemVycywgcmVjb2duaXplcik7XG5cbiAgICAgICAgICAgIGlmIChpbmRleCAhPT0gLTEpIHtcbiAgICAgICAgICAgICAgICByZWNvZ25pemVycy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgIHRoaXMudG91Y2hBY3Rpb24udXBkYXRlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYmluZCBldmVudFxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBldmVudHNcbiAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBoYW5kbGVyXG4gICAgICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gdGhpc1xuICAgICAqL1xuICAgIG9uOiBmdW5jdGlvbihldmVudHMsIGhhbmRsZXIpIHtcbiAgICAgICAgaWYgKGV2ZW50cyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGhhbmRsZXIgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGhhbmRsZXJzID0gdGhpcy5oYW5kbGVycztcbiAgICAgICAgZWFjaChzcGxpdFN0cihldmVudHMpLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgaGFuZGxlcnNbZXZlbnRdID0gaGFuZGxlcnNbZXZlbnRdIHx8IFtdO1xuICAgICAgICAgICAgaGFuZGxlcnNbZXZlbnRdLnB1c2goaGFuZGxlcik7XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogdW5iaW5kIGV2ZW50LCBsZWF2ZSBlbWl0IGJsYW5rIHRvIHJlbW92ZSBhbGwgaGFuZGxlcnNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRzXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gW2hhbmRsZXJdXG4gICAgICogQHJldHVybnMge0V2ZW50RW1pdHRlcn0gdGhpc1xuICAgICAqL1xuICAgIG9mZjogZnVuY3Rpb24oZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgICAgIGlmIChldmVudHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGhhbmRsZXJzID0gdGhpcy5oYW5kbGVycztcbiAgICAgICAgZWFjaChzcGxpdFN0cihldmVudHMpLCBmdW5jdGlvbihldmVudCkge1xuICAgICAgICAgICAgaWYgKCFoYW5kbGVyKSB7XG4gICAgICAgICAgICAgICAgZGVsZXRlIGhhbmRsZXJzW2V2ZW50XTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgaGFuZGxlcnNbZXZlbnRdICYmIGhhbmRsZXJzW2V2ZW50XS5zcGxpY2UoaW5BcnJheShoYW5kbGVyc1tldmVudF0sIGhhbmRsZXIpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBlbWl0IGV2ZW50IHRvIHRoZSBsaXN0ZW5lcnNcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gZGF0YVxuICAgICAqL1xuICAgIGVtaXQ6IGZ1bmN0aW9uKGV2ZW50LCBkYXRhKSB7XG4gICAgICAgIC8vIHdlIGFsc28gd2FudCB0byB0cmlnZ2VyIGRvbSBldmVudHNcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5kb21FdmVudHMpIHtcbiAgICAgICAgICAgIHRyaWdnZXJEb21FdmVudChldmVudCwgZGF0YSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBubyBoYW5kbGVycywgc28gc2tpcCBpdCBhbGxcbiAgICAgICAgdmFyIGhhbmRsZXJzID0gdGhpcy5oYW5kbGVyc1tldmVudF0gJiYgdGhpcy5oYW5kbGVyc1tldmVudF0uc2xpY2UoKTtcbiAgICAgICAgaWYgKCFoYW5kbGVycyB8fCAhaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkYXRhLnR5cGUgPSBldmVudDtcbiAgICAgICAgZGF0YS5wcmV2ZW50RGVmYXVsdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgZGF0YS5zcmNFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICB9O1xuXG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCBoYW5kbGVycy5sZW5ndGgpIHtcbiAgICAgICAgICAgIGhhbmRsZXJzW2ldKGRhdGEpO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGRlc3Ryb3kgdGhlIG1hbmFnZXIgYW5kIHVuYmluZHMgYWxsIGV2ZW50c1xuICAgICAqIGl0IGRvZXNuJ3QgdW5iaW5kIGRvbSBldmVudHMsIHRoYXQgaXMgdGhlIHVzZXIgb3duIHJlc3BvbnNpYmlsaXR5XG4gICAgICovXG4gICAgZGVzdHJveTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHRoaXMuZWxlbWVudCAmJiB0b2dnbGVDc3NQcm9wcyh0aGlzLCBmYWxzZSk7XG5cbiAgICAgICAgdGhpcy5oYW5kbGVycyA9IHt9O1xuICAgICAgICB0aGlzLnNlc3Npb24gPSB7fTtcbiAgICAgICAgdGhpcy5pbnB1dC5kZXN0cm95KCk7XG4gICAgICAgIHRoaXMuZWxlbWVudCA9IG51bGw7XG4gICAgfVxufTtcblxuLyoqXG4gKiBhZGQvcmVtb3ZlIHRoZSBjc3MgcHJvcGVydGllcyBhcyBkZWZpbmVkIGluIG1hbmFnZXIub3B0aW9ucy5jc3NQcm9wc1xuICogQHBhcmFtIHtNYW5hZ2VyfSBtYW5hZ2VyXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGFkZFxuICovXG5mdW5jdGlvbiB0b2dnbGVDc3NQcm9wcyhtYW5hZ2VyLCBhZGQpIHtcbiAgICB2YXIgZWxlbWVudCA9IG1hbmFnZXIuZWxlbWVudDtcbiAgICBpZiAoIWVsZW1lbnQuc3R5bGUpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgcHJvcDtcbiAgICBlYWNoKG1hbmFnZXIub3B0aW9ucy5jc3NQcm9wcywgZnVuY3Rpb24odmFsdWUsIG5hbWUpIHtcbiAgICAgICAgcHJvcCA9IHByZWZpeGVkKGVsZW1lbnQuc3R5bGUsIG5hbWUpO1xuICAgICAgICBpZiAoYWRkKSB7XG4gICAgICAgICAgICBtYW5hZ2VyLm9sZENzc1Byb3BzW3Byb3BdID0gZWxlbWVudC5zdHlsZVtwcm9wXTtcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGVbcHJvcF0gPSB2YWx1ZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGVsZW1lbnQuc3R5bGVbcHJvcF0gPSBtYW5hZ2VyLm9sZENzc1Byb3BzW3Byb3BdIHx8ICcnO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgaWYgKCFhZGQpIHtcbiAgICAgICAgbWFuYWdlci5vbGRDc3NQcm9wcyA9IHt9O1xuICAgIH1cbn1cblxuLyoqXG4gKiB0cmlnZ2VyIGRvbSBldmVudFxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gKiBAcGFyYW0ge09iamVjdH0gZGF0YVxuICovXG5mdW5jdGlvbiB0cmlnZ2VyRG9tRXZlbnQoZXZlbnQsIGRhdGEpIHtcbiAgICB2YXIgZ2VzdHVyZUV2ZW50ID0gZG9jdW1lbnQuY3JlYXRlRXZlbnQoJ0V2ZW50Jyk7XG4gICAgZ2VzdHVyZUV2ZW50LmluaXRFdmVudChldmVudCwgdHJ1ZSwgdHJ1ZSk7XG4gICAgZ2VzdHVyZUV2ZW50Lmdlc3R1cmUgPSBkYXRhO1xuICAgIGRhdGEudGFyZ2V0LmRpc3BhdGNoRXZlbnQoZ2VzdHVyZUV2ZW50KTtcbn1cblxuYXNzaWduKEhhbW1lciwge1xuICAgIElOUFVUX1NUQVJUOiBJTlBVVF9TVEFSVCxcbiAgICBJTlBVVF9NT1ZFOiBJTlBVVF9NT1ZFLFxuICAgIElOUFVUX0VORDogSU5QVVRfRU5ELFxuICAgIElOUFVUX0NBTkNFTDogSU5QVVRfQ0FOQ0VMLFxuXG4gICAgU1RBVEVfUE9TU0lCTEU6IFNUQVRFX1BPU1NJQkxFLFxuICAgIFNUQVRFX0JFR0FOOiBTVEFURV9CRUdBTixcbiAgICBTVEFURV9DSEFOR0VEOiBTVEFURV9DSEFOR0VELFxuICAgIFNUQVRFX0VOREVEOiBTVEFURV9FTkRFRCxcbiAgICBTVEFURV9SRUNPR05JWkVEOiBTVEFURV9SRUNPR05JWkVELFxuICAgIFNUQVRFX0NBTkNFTExFRDogU1RBVEVfQ0FOQ0VMTEVELFxuICAgIFNUQVRFX0ZBSUxFRDogU1RBVEVfRkFJTEVELFxuXG4gICAgRElSRUNUSU9OX05PTkU6IERJUkVDVElPTl9OT05FLFxuICAgIERJUkVDVElPTl9MRUZUOiBESVJFQ1RJT05fTEVGVCxcbiAgICBESVJFQ1RJT05fUklHSFQ6IERJUkVDVElPTl9SSUdIVCxcbiAgICBESVJFQ1RJT05fVVA6IERJUkVDVElPTl9VUCxcbiAgICBESVJFQ1RJT05fRE9XTjogRElSRUNUSU9OX0RPV04sXG4gICAgRElSRUNUSU9OX0hPUklaT05UQUw6IERJUkVDVElPTl9IT1JJWk9OVEFMLFxuICAgIERJUkVDVElPTl9WRVJUSUNBTDogRElSRUNUSU9OX1ZFUlRJQ0FMLFxuICAgIERJUkVDVElPTl9BTEw6IERJUkVDVElPTl9BTEwsXG5cbiAgICBNYW5hZ2VyOiBNYW5hZ2VyLFxuICAgIElucHV0OiBJbnB1dCxcbiAgICBUb3VjaEFjdGlvbjogVG91Y2hBY3Rpb24sXG5cbiAgICBUb3VjaElucHV0OiBUb3VjaElucHV0LFxuICAgIE1vdXNlSW5wdXQ6IE1vdXNlSW5wdXQsXG4gICAgUG9pbnRlckV2ZW50SW5wdXQ6IFBvaW50ZXJFdmVudElucHV0LFxuICAgIFRvdWNoTW91c2VJbnB1dDogVG91Y2hNb3VzZUlucHV0LFxuICAgIFNpbmdsZVRvdWNoSW5wdXQ6IFNpbmdsZVRvdWNoSW5wdXQsXG5cbiAgICBSZWNvZ25pemVyOiBSZWNvZ25pemVyLFxuICAgIEF0dHJSZWNvZ25pemVyOiBBdHRyUmVjb2duaXplcixcbiAgICBUYXA6IFRhcFJlY29nbml6ZXIsXG4gICAgUGFuOiBQYW5SZWNvZ25pemVyLFxuICAgIFN3aXBlOiBTd2lwZVJlY29nbml6ZXIsXG4gICAgUGluY2g6IFBpbmNoUmVjb2duaXplcixcbiAgICBSb3RhdGU6IFJvdGF0ZVJlY29nbml6ZXIsXG4gICAgUHJlc3M6IFByZXNzUmVjb2duaXplcixcblxuICAgIG9uOiBhZGRFdmVudExpc3RlbmVycyxcbiAgICBvZmY6IHJlbW92ZUV2ZW50TGlzdGVuZXJzLFxuICAgIGVhY2g6IGVhY2gsXG4gICAgbWVyZ2U6IG1lcmdlLFxuICAgIGV4dGVuZDogZXh0ZW5kLFxuICAgIGFzc2lnbjogYXNzaWduLFxuICAgIGluaGVyaXQ6IGluaGVyaXQsXG4gICAgYmluZEZuOiBiaW5kRm4sXG4gICAgcHJlZml4ZWQ6IHByZWZpeGVkXG59KTtcblxuLy8gdGhpcyBwcmV2ZW50cyBlcnJvcnMgd2hlbiBIYW1tZXIgaXMgbG9hZGVkIGluIHRoZSBwcmVzZW5jZSBvZiBhbiBBTURcbi8vICBzdHlsZSBsb2FkZXIgYnV0IGJ5IHNjcmlwdCB0YWcsIG5vdCBieSB0aGUgbG9hZGVyLlxudmFyIGZyZWVHbG9iYWwgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgPyB3aW5kb3cgOiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnID8gc2VsZiA6IHt9KSk7IC8vIGpzaGludCBpZ25vcmU6bGluZVxuZnJlZUdsb2JhbC5IYW1tZXIgPSBIYW1tZXI7XG5cbmlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBIYW1tZXI7XG4gICAgfSk7XG59IGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IEhhbW1lcjtcbn0gZWxzZSB7XG4gICAgd2luZG93W2V4cG9ydE5hbWVdID0gSGFtbWVyO1xufVxuXG59KSh3aW5kb3csIGRvY3VtZW50LCAnSGFtbWVyJyk7XG4iLCIvKiFcbiAqICBob3dsZXIuanMgdjIuMC4yXG4gKiAgaG93bGVyanMuY29tXG4gKlxuICogIChjKSAyMDEzLTIwMTYsIEphbWVzIFNpbXBzb24gb2YgR29sZEZpcmUgU3R1ZGlvc1xuICogIGdvbGRmaXJlc3R1ZGlvcy5jb21cbiAqXG4gKiAgTUlUIExpY2Vuc2VcbiAqL1xuXG4oZnVuY3Rpb24oKSB7XG5cbiAgJ3VzZSBzdHJpY3QnO1xuXG4gIC8qKiBHbG9iYWwgTWV0aG9kcyAqKi9cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAvKipcbiAgICogQ3JlYXRlIHRoZSBnbG9iYWwgY29udHJvbGxlci4gQWxsIGNvbnRhaW5lZCBtZXRob2RzIGFuZCBwcm9wZXJ0aWVzIGFwcGx5XG4gICAqIHRvIGFsbCBzb3VuZHMgdGhhdCBhcmUgY3VycmVudGx5IHBsYXlpbmcgb3Igd2lsbCBiZSBpbiB0aGUgZnV0dXJlLlxuICAgKi9cbiAgdmFyIEhvd2xlckdsb2JhbCA9IGZ1bmN0aW9uKCkge1xuICAgIHRoaXMuaW5pdCgpO1xuICB9O1xuICBIb3dsZXJHbG9iYWwucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgdGhlIGdsb2JhbCBIb3dsZXIgb2JqZWN0LlxuICAgICAqIEByZXR1cm4ge0hvd2xlcn1cbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyB8fCBIb3dsZXI7XG5cbiAgICAgIC8vIEludGVybmFsIHByb3BlcnRpZXMuXG4gICAgICBzZWxmLl9jb2RlY3MgPSB7fTtcbiAgICAgIHNlbGYuX2hvd2xzID0gW107XG4gICAgICBzZWxmLl9tdXRlZCA9IGZhbHNlO1xuICAgICAgc2VsZi5fdm9sdW1lID0gMTtcbiAgICAgIHNlbGYuX2NhblBsYXlFdmVudCA9ICdjYW5wbGF5dGhyb3VnaCc7XG4gICAgICBzZWxmLl9uYXZpZ2F0b3IgPSAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93Lm5hdmlnYXRvcikgPyB3aW5kb3cubmF2aWdhdG9yIDogbnVsbDtcblxuICAgICAgLy8gUHVibGljIHByb3BlcnRpZXMuXG4gICAgICBzZWxmLm1hc3RlckdhaW4gPSBudWxsO1xuICAgICAgc2VsZi5ub0F1ZGlvID0gZmFsc2U7XG4gICAgICBzZWxmLnVzaW5nV2ViQXVkaW8gPSB0cnVlO1xuICAgICAgc2VsZi5hdXRvU3VzcGVuZCA9IHRydWU7XG4gICAgICBzZWxmLmN0eCA9IG51bGw7XG5cbiAgICAgIC8vIFNldCB0byBmYWxzZSB0byBkaXNhYmxlIHRoZSBhdXRvIGlPUyBlbmFibGVyLlxuICAgICAgc2VsZi5tb2JpbGVBdXRvRW5hYmxlID0gdHJ1ZTtcblxuICAgICAgLy8gU2V0dXAgdGhlIHZhcmlvdXMgc3RhdGUgdmFsdWVzIGZvciBnbG9iYWwgdHJhY2tpbmcuXG4gICAgICBzZWxmLl9zZXR1cCgpO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0L3NldCB0aGUgZ2xvYmFsIHZvbHVtZSBmb3IgYWxsIHNvdW5kcy5cbiAgICAgKiBAcGFyYW0gIHtGbG9hdH0gdm9sIFZvbHVtZSBmcm9tIDAuMCB0byAxLjAuXG4gICAgICogQHJldHVybiB7SG93bGVyL0Zsb2F0fSAgICAgUmV0dXJucyBzZWxmIG9yIGN1cnJlbnQgdm9sdW1lLlxuICAgICAqL1xuICAgIHZvbHVtZTogZnVuY3Rpb24odm9sKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMgfHwgSG93bGVyO1xuICAgICAgdm9sID0gcGFyc2VGbG9hdCh2b2wpO1xuXG4gICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGFuIEF1ZGlvQ29udGV4dCBjcmVhdGVkIHlldCwgcnVuIHRoZSBzZXR1cC5cbiAgICAgIGlmICghc2VsZi5jdHgpIHtcbiAgICAgICAgc2V0dXBBdWRpb0NvbnRleHQoKTtcbiAgICAgIH1cblxuICAgICAgaWYgKHR5cGVvZiB2b2wgIT09ICd1bmRlZmluZWQnICYmIHZvbCA+PSAwICYmIHZvbCA8PSAxKSB7XG4gICAgICAgIHNlbGYuX3ZvbHVtZSA9IHZvbDtcblxuICAgICAgICAvLyBEb24ndCB1cGRhdGUgYW55IG9mIHRoZSBub2RlcyBpZiB3ZSBhcmUgbXV0ZWQuXG4gICAgICAgIGlmIChzZWxmLl9tdXRlZCkge1xuICAgICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2hlbiB1c2luZyBXZWIgQXVkaW8sIHdlIGp1c3QgbmVlZCB0byBhZGp1c3QgdGhlIG1hc3RlciBnYWluLlxuICAgICAgICBpZiAoc2VsZi51c2luZ1dlYkF1ZGlvKSB7XG4gICAgICAgICAgc2VsZi5tYXN0ZXJHYWluLmdhaW4udmFsdWUgPSB2b2w7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBMb29wIHRocm91Z2ggYW5kIGNoYW5nZSB2b2x1bWUgZm9yIGFsbCBIVE1MNSBhdWRpbyBub2Rlcy5cbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGYuX2hvd2xzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKCFzZWxmLl9ob3dsc1tpXS5fd2ViQXVkaW8pIHtcbiAgICAgICAgICAgIC8vIEdldCBhbGwgb2YgdGhlIHNvdW5kcyBpbiB0aGlzIEhvd2wgZ3JvdXAuXG4gICAgICAgICAgICB2YXIgaWRzID0gc2VsZi5faG93bHNbaV0uX2dldFNvdW5kSWRzKCk7XG5cbiAgICAgICAgICAgIC8vIExvb3AgdGhyb3VnaCBhbGwgc291bmRzIGFuZCBjaGFuZ2UgdGhlIHZvbHVtZXMuXG4gICAgICAgICAgICBmb3IgKHZhciBqPTA7IGo8aWRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgIHZhciBzb3VuZCA9IHNlbGYuX2hvd2xzW2ldLl9zb3VuZEJ5SWQoaWRzW2pdKTtcblxuICAgICAgICAgICAgICBpZiAoc291bmQgJiYgc291bmQuX25vZGUpIHtcbiAgICAgICAgICAgICAgICBzb3VuZC5fbm9kZS52b2x1bWUgPSBzb3VuZC5fdm9sdW1lICogdm9sO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmLl92b2x1bWU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhhbmRsZSBtdXRpbmcgYW5kIHVubXV0aW5nIGdsb2JhbGx5LlxuICAgICAqIEBwYXJhbSAge0Jvb2xlYW59IG11dGVkIElzIG11dGVkIG9yIG5vdC5cbiAgICAgKi9cbiAgICBtdXRlOiBmdW5jdGlvbihtdXRlZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzIHx8IEhvd2xlcjtcblxuICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhbiBBdWRpb0NvbnRleHQgY3JlYXRlZCB5ZXQsIHJ1biB0aGUgc2V0dXAuXG4gICAgICBpZiAoIXNlbGYuY3R4KSB7XG4gICAgICAgIHNldHVwQXVkaW9Db250ZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX211dGVkID0gbXV0ZWQ7XG5cbiAgICAgIC8vIFdpdGggV2ViIEF1ZGlvLCB3ZSBqdXN0IG5lZWQgdG8gbXV0ZSB0aGUgbWFzdGVyIGdhaW4uXG4gICAgICBpZiAoc2VsZi51c2luZ1dlYkF1ZGlvKSB7XG4gICAgICAgIHNlbGYubWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gbXV0ZWQgPyAwIDogc2VsZi5fdm9sdW1lO1xuICAgICAgfVxuXG4gICAgICAvLyBMb29wIHRocm91Z2ggYW5kIG11dGUgYWxsIEhUTUw1IEF1ZGlvIG5vZGVzLlxuICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGYuX2hvd2xzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghc2VsZi5faG93bHNbaV0uX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgLy8gR2V0IGFsbCBvZiB0aGUgc291bmRzIGluIHRoaXMgSG93bCBncm91cC5cbiAgICAgICAgICB2YXIgaWRzID0gc2VsZi5faG93bHNbaV0uX2dldFNvdW5kSWRzKCk7XG5cbiAgICAgICAgICAvLyBMb29wIHRocm91Z2ggYWxsIHNvdW5kcyBhbmQgbWFyayB0aGUgYXVkaW8gbm9kZSBhcyBtdXRlZC5cbiAgICAgICAgICBmb3IgKHZhciBqPTA7IGo8aWRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgc291bmQgPSBzZWxmLl9ob3dsc1tpXS5fc291bmRCeUlkKGlkc1tqXSk7XG5cbiAgICAgICAgICAgIGlmIChzb3VuZCAmJiBzb3VuZC5fbm9kZSkge1xuICAgICAgICAgICAgICBzb3VuZC5fbm9kZS5tdXRlZCA9IChtdXRlZCkgPyB0cnVlIDogc291bmQuX211dGVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogVW5sb2FkIGFuZCBkZXN0cm95IGFsbCBjdXJyZW50bHkgbG9hZGVkIEhvd2wgb2JqZWN0cy5cbiAgICAgKiBAcmV0dXJuIHtIb3dsZXJ9XG4gICAgICovXG4gICAgdW5sb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyB8fCBIb3dsZXI7XG5cbiAgICAgIGZvciAodmFyIGk9c2VsZi5faG93bHMubGVuZ3RoLTE7IGk+PTA7IGktLSkge1xuICAgICAgICBzZWxmLl9ob3dsc1tpXS51bmxvYWQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gQ3JlYXRlIGEgbmV3IEF1ZGlvQ29udGV4dCB0byBtYWtlIHN1cmUgaXQgaXMgZnVsbHkgcmVzZXQuXG4gICAgICBpZiAoc2VsZi51c2luZ1dlYkF1ZGlvICYmIHNlbGYuY3R4ICYmIHR5cGVvZiBzZWxmLmN0eC5jbG9zZSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgc2VsZi5jdHguY2xvc2UoKTtcbiAgICAgICAgc2VsZi5jdHggPSBudWxsO1xuICAgICAgICBzZXR1cEF1ZGlvQ29udGV4dCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgZm9yIGNvZGVjIHN1cHBvcnQgb2Ygc3BlY2lmaWMgZXh0ZW5zaW9uLlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gZXh0IEF1ZGlvIGZpbGUgZXh0ZW50aW9uLlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59XG4gICAgICovXG4gICAgY29kZWNzOiBmdW5jdGlvbihleHQpIHtcbiAgICAgIHJldHVybiAodGhpcyB8fCBIb3dsZXIpLl9jb2RlY3NbZXh0LnJlcGxhY2UoL154LS8sICcnKV07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFNldHVwIHZhcmlvdXMgc3RhdGUgdmFsdWVzIGZvciBnbG9iYWwgdHJhY2tpbmcuXG4gICAgICogQHJldHVybiB7SG93bGVyfVxuICAgICAqL1xuICAgIF9zZXR1cDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMgfHwgSG93bGVyO1xuXG4gICAgICAvLyBLZWVwcyB0cmFjayBvZiB0aGUgc3VzcGVuZC9yZXN1bWUgc3RhdGUgb2YgdGhlIEF1ZGlvQ29udGV4dC5cbiAgICAgIHNlbGYuc3RhdGUgPSBzZWxmLmN0eCA/IHNlbGYuY3R4LnN0YXRlIHx8ICdydW5uaW5nJyA6ICdydW5uaW5nJztcblxuICAgICAgLy8gQXV0b21hdGljYWxseSBiZWdpbiB0aGUgMzAtc2Vjb25kIHN1c3BlbmQgcHJvY2Vzc1xuICAgICAgc2VsZi5fYXV0b1N1c3BlbmQoKTtcblxuICAgICAgLy8gQ2hlY2sgaWYgYXVkaW8gaXMgYXZhaWxhYmxlLlxuICAgICAgaWYgKCFzZWxmLnVzaW5nV2ViQXVkaW8pIHtcbiAgICAgICAgLy8gTm8gYXVkaW8gaXMgYXZhaWxhYmxlIG9uIHRoaXMgc3lzdGVtIGlmIG5vQXVkaW8gaXMgc2V0IHRvIHRydWUuXG4gICAgICAgIGlmICh0eXBlb2YgQXVkaW8gIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIHZhciB0ZXN0ID0gbmV3IEF1ZGlvKCk7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZSBjYW5wbGF5dGhyb3VnaCBldmVudCBpcyBhdmFpbGFibGUuXG4gICAgICAgICAgICBpZiAodHlwZW9mIHRlc3Qub25jYW5wbGF5dGhyb3VnaCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgc2VsZi5fY2FuUGxheUV2ZW50ID0gJ2NhbnBsYXknO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gY2F0Y2goZSkge1xuICAgICAgICAgICAgc2VsZi5ub0F1ZGlvID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc2VsZi5ub0F1ZGlvID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBUZXN0IHRvIG1ha2Ugc3VyZSBhdWRpbyBpc24ndCBkaXNhYmxlZCBpbiBJbnRlcm5ldCBFeHBsb3Jlci5cbiAgICAgIHRyeSB7XG4gICAgICAgIHZhciB0ZXN0ID0gbmV3IEF1ZGlvKCk7XG4gICAgICAgIGlmICh0ZXN0Lm11dGVkKSB7XG4gICAgICAgICAgc2VsZi5ub0F1ZGlvID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfSBjYXRjaCAoZSkge31cblxuICAgICAgLy8gQ2hlY2sgZm9yIHN1cHBvcnRlZCBjb2RlY3MuXG4gICAgICBpZiAoIXNlbGYubm9BdWRpbykge1xuICAgICAgICBzZWxmLl9zZXR1cENvZGVjcygpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgZm9yIGJyb3dzZXIgc3VwcG9ydCBmb3IgdmFyaW91cyBjb2RlY3MgYW5kIGNhY2hlIHRoZSByZXN1bHRzLlxuICAgICAqIEByZXR1cm4ge0hvd2xlcn1cbiAgICAgKi9cbiAgICBfc2V0dXBDb2RlY3M6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzIHx8IEhvd2xlcjtcbiAgICAgIHZhciBhdWRpb1Rlc3QgPSBudWxsO1xuXG4gICAgICAvLyBNdXN0IHdyYXAgaW4gYSB0cnkvY2F0Y2ggYmVjYXVzZSBJRTExIGluIHNlcnZlciBtb2RlIHRocm93cyBhbiBlcnJvci5cbiAgICAgIHRyeSB7XG4gICAgICAgIGF1ZGlvVGVzdCA9ICh0eXBlb2YgQXVkaW8gIT09ICd1bmRlZmluZWQnKSA/IG5ldyBBdWRpbygpIDogbnVsbDtcbiAgICAgIH0gY2F0Y2ggKGVycikge1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFhdWRpb1Rlc3QgfHwgdHlwZW9mIGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSAhPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH1cblxuICAgICAgdmFyIG1wZWdUZXN0ID0gYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9tcGVnOycpLnJlcGxhY2UoL15ubyQvLCAnJyk7XG5cbiAgICAgIC8vIE9wZXJhIHZlcnNpb24gPDMzIGhhcyBtaXhlZCBNUDMgc3VwcG9ydCwgc28gd2UgbmVlZCB0byBjaGVjayBmb3IgYW5kIGJsb2NrIGl0LlxuICAgICAgdmFyIGNoZWNrT3BlcmEgPSBzZWxmLl9uYXZpZ2F0b3IgJiYgc2VsZi5fbmF2aWdhdG9yLnVzZXJBZ2VudC5tYXRjaCgvT1BSXFwvKFswLTZdLikvZyk7XG4gICAgICB2YXIgaXNPbGRPcGVyYSA9IChjaGVja09wZXJhICYmIHBhcnNlSW50KGNoZWNrT3BlcmFbMF0uc3BsaXQoJy8nKVsxXSwgMTApIDwgMzMpO1xuXG4gICAgICBzZWxmLl9jb2RlY3MgPSB7XG4gICAgICAgIG1wMzogISEoIWlzT2xkT3BlcmEgJiYgKG1wZWdUZXN0IHx8IGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vbXAzOycpLnJlcGxhY2UoL15ubyQvLCAnJykpKSxcbiAgICAgICAgbXBlZzogISFtcGVnVGVzdCxcbiAgICAgICAgb3B1czogISFhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL29nZzsgY29kZWNzPVwib3B1c1wiJykucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgICAgb2dnOiAhIWF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vb2dnOyBjb2RlY3M9XCJ2b3JiaXNcIicpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICAgIG9nYTogISFhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL29nZzsgY29kZWNzPVwidm9yYmlzXCInKS5yZXBsYWNlKC9ebm8kLywgJycpLFxuICAgICAgICB3YXY6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby93YXY7IGNvZGVjcz1cIjFcIicpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICAgIGFhYzogISFhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL2FhYzsnKS5yZXBsYWNlKC9ebm8kLywgJycpLFxuICAgICAgICBjYWY6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby94LWNhZjsnKS5yZXBsYWNlKC9ebm8kLywgJycpLFxuICAgICAgICBtNGE6ICEhKGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8veC1tNGE7JykgfHwgYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9tNGE7JykgfHwgYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9hYWM7JykpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICAgIG1wNDogISEoYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby94LW1wNDsnKSB8fCBhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL21wNDsnKSB8fCBhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL2FhYzsnKSkucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgICAgd2ViYTogISFhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL3dlYm07IGNvZGVjcz1cInZvcmJpc1wiJykucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgICAgd2VibTogISFhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL3dlYm07IGNvZGVjcz1cInZvcmJpc1wiJykucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgICAgZG9sYnk6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9tcDQ7IGNvZGVjcz1cImVjLTNcIicpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICAgIGZsYWM6ICEhKGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8veC1mbGFjOycpIHx8IGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vZmxhYzsnKSkucmVwbGFjZSgvXm5vJC8sICcnKVxuICAgICAgfTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE1vYmlsZSBicm93c2VycyB3aWxsIG9ubHkgYWxsb3cgYXVkaW8gdG8gYmUgcGxheWVkIGFmdGVyIGEgdXNlciBpbnRlcmFjdGlvbi5cbiAgICAgKiBBdHRlbXB0IHRvIGF1dG9tYXRpY2FsbHkgdW5sb2NrIGF1ZGlvIG9uIHRoZSBmaXJzdCB1c2VyIGludGVyYWN0aW9uLlxuICAgICAqIENvbmNlcHQgZnJvbTogaHR0cDovL3BhdWxiYWthdXMuY29tL3R1dG9yaWFscy9odG1sNS93ZWItYXVkaW8tb24taW9zL1xuICAgICAqIEByZXR1cm4ge0hvd2xlcn1cbiAgICAgKi9cbiAgICBfZW5hYmxlTW9iaWxlQXVkaW86IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzIHx8IEhvd2xlcjtcblxuICAgICAgLy8gT25seSBydW4gdGhpcyBvbiBtb2JpbGUgZGV2aWNlcyBpZiBhdWRpbyBpc24ndCBhbHJlYWR5IGVhbmJsZWQuXG4gICAgICB2YXIgaXNNb2JpbGUgPSAvaVBob25lfGlQYWR8aVBvZHxBbmRyb2lkfEJsYWNrQmVycnl8QkIxMHxTaWxrfE1vYmkvaS50ZXN0KHNlbGYuX25hdmlnYXRvciAmJiBzZWxmLl9uYXZpZ2F0b3IudXNlckFnZW50KTtcbiAgICAgIHZhciBpc1RvdWNoID0gISEoKCdvbnRvdWNoZW5kJyBpbiB3aW5kb3cpIHx8IChzZWxmLl9uYXZpZ2F0b3IgJiYgc2VsZi5fbmF2aWdhdG9yLm1heFRvdWNoUG9pbnRzID4gMCkgfHwgKHNlbGYuX25hdmlnYXRvciAmJiBzZWxmLl9uYXZpZ2F0b3IubXNNYXhUb3VjaFBvaW50cyA+IDApKTtcbiAgICAgIGlmIChzZWxmLl9tb2JpbGVFbmFibGVkIHx8ICFzZWxmLmN0eCB8fCAoIWlzTW9iaWxlICYmICFpc1RvdWNoKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX21vYmlsZUVuYWJsZWQgPSBmYWxzZTtcblxuICAgICAgLy8gU29tZSBtb2JpbGUgZGV2aWNlcy9wbGF0Zm9ybXMgaGF2ZSBkaXN0b3J0aW9uIGlzc3VlcyB3aGVuIG9wZW5pbmcvY2xvc2luZyB0YWJzIGFuZC9vciB3ZWIgdmlld3MuXG4gICAgICAvLyBCdWdzIGluIHRoZSBicm93c2VyIChlc3BlY2lhbGx5IE1vYmlsZSBTYWZhcmkpIGNhbiBjYXVzZSB0aGUgc2FtcGxlUmF0ZSB0byBjaGFuZ2UgZnJvbSA0NDEwMCB0byA0ODAwMC5cbiAgICAgIC8vIEJ5IGNhbGxpbmcgSG93bGVyLnVubG9hZCgpLCB3ZSBjcmVhdGUgYSBuZXcgQXVkaW9Db250ZXh0IHdpdGggdGhlIGNvcnJlY3Qgc2FtcGxlUmF0ZS5cbiAgICAgIGlmICghc2VsZi5fbW9iaWxlVW5sb2FkZWQgJiYgc2VsZi5jdHguc2FtcGxlUmF0ZSAhPT0gNDQxMDApIHtcbiAgICAgICAgc2VsZi5fbW9iaWxlVW5sb2FkZWQgPSB0cnVlO1xuICAgICAgICBzZWxmLnVubG9hZCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBTY3JhdGNoIGJ1ZmZlciBmb3IgZW5hYmxpbmcgaU9TIHRvIGRpc3Bvc2Ugb2Ygd2ViIGF1ZGlvIGJ1ZmZlcnMgY29ycmVjdGx5LCBhcyBwZXI6XG4gICAgICAvLyBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzI0MTE5Njg0XG4gICAgICBzZWxmLl9zY3JhdGNoQnVmZmVyID0gc2VsZi5jdHguY3JlYXRlQnVmZmVyKDEsIDEsIDIyMDUwKTtcblxuICAgICAgLy8gQ2FsbCB0aGlzIG1ldGhvZCBvbiB0b3VjaCBzdGFydCB0byBjcmVhdGUgYW5kIHBsYXkgYSBidWZmZXIsXG4gICAgICAvLyB0aGVuIGNoZWNrIGlmIHRoZSBhdWRpbyBhY3R1YWxseSBwbGF5ZWQgdG8gZGV0ZXJtaW5lIGlmXG4gICAgICAvLyBhdWRpbyBoYXMgbm93IGJlZW4gdW5sb2NrZWQgb24gaU9TLCBBbmRyb2lkLCBldGMuXG4gICAgICB2YXIgdW5sb2NrID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIENyZWF0ZSBhbiBlbXB0eSBidWZmZXIuXG4gICAgICAgIHZhciBzb3VyY2UgPSBzZWxmLmN0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgICAgc291cmNlLmJ1ZmZlciA9IHNlbGYuX3NjcmF0Y2hCdWZmZXI7XG4gICAgICAgIHNvdXJjZS5jb25uZWN0KHNlbGYuY3R4LmRlc3RpbmF0aW9uKTtcblxuICAgICAgICAvLyBQbGF5IHRoZSBlbXB0eSBidWZmZXIuXG4gICAgICAgIGlmICh0eXBlb2Ygc291cmNlLnN0YXJ0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHNvdXJjZS5ub3RlT24oMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgc291cmNlLnN0YXJ0KDApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0dXAgYSB0aW1lb3V0IHRvIGNoZWNrIHRoYXQgd2UgYXJlIHVubG9ja2VkIG9uIHRoZSBuZXh0IGV2ZW50IGxvb3AuXG4gICAgICAgIHNvdXJjZS5vbmVuZGVkID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc291cmNlLmRpc2Nvbm5lY3QoMCk7XG5cbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIHVubG9ja2VkIHN0YXRlIGFuZCBwcmV2ZW50IHRoaXMgY2hlY2sgZnJvbSBoYXBwZW5pbmcgYWdhaW4uXG4gICAgICAgICAgc2VsZi5fbW9iaWxlRW5hYmxlZCA9IHRydWU7XG4gICAgICAgICAgc2VsZi5tb2JpbGVBdXRvRW5hYmxlID0gZmFsc2U7XG5cbiAgICAgICAgICAvLyBSZW1vdmUgdGhlIHRvdWNoIHN0YXJ0IGxpc3RlbmVyLlxuICAgICAgICAgIGRvY3VtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgdW5sb2NrLCB0cnVlKTtcbiAgICAgICAgfTtcbiAgICAgIH07XG5cbiAgICAgIC8vIFNldHVwIGEgdG91Y2ggc3RhcnQgbGlzdGVuZXIgdG8gYXR0ZW1wdCBhbiB1bmxvY2sgaW4uXG4gICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHVubG9jaywgdHJ1ZSk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBBdXRvbWF0aWNhbGx5IHN1c3BlbmQgdGhlIFdlYiBBdWRpbyBBdWRpb0NvbnRleHQgYWZ0ZXIgbm8gc291bmQgaGFzIHBsYXllZCBmb3IgMzAgc2Vjb25kcy5cbiAgICAgKiBUaGlzIHNhdmVzIHByb2Nlc3NpbmcvZW5lcmd5IGFuZCBmaXhlcyB2YXJpb3VzIGJyb3dzZXItc3BlY2lmaWMgYnVncyB3aXRoIGF1ZGlvIGdldHRpbmcgc3R1Y2suXG4gICAgICogQHJldHVybiB7SG93bGVyfVxuICAgICAqL1xuICAgIF9hdXRvU3VzcGVuZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmICghc2VsZi5hdXRvU3VzcGVuZCB8fCAhc2VsZi5jdHggfHwgdHlwZW9mIHNlbGYuY3R4LnN1c3BlbmQgPT09ICd1bmRlZmluZWQnIHx8ICFIb3dsZXIudXNpbmdXZWJBdWRpbykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIENoZWNrIGlmIGFueSBzb3VuZHMgYXJlIHBsYXlpbmcuXG4gICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5faG93bHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHNlbGYuX2hvd2xzW2ldLl93ZWJBdWRpbykge1xuICAgICAgICAgIGZvciAodmFyIGo9MDsgajxzZWxmLl9ob3dsc1tpXS5fc291bmRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAoIXNlbGYuX2hvd2xzW2ldLl9zb3VuZHNbal0uX3BhdXNlZCkge1xuICAgICAgICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGYuX3N1c3BlbmRUaW1lcikge1xuICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5fc3VzcGVuZFRpbWVyKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgbm8gc291bmQgaGFzIHBsYXllZCBhZnRlciAzMCBzZWNvbmRzLCBzdXNwZW5kIHRoZSBjb250ZXh0LlxuICAgICAgc2VsZi5fc3VzcGVuZFRpbWVyID0gc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKCFzZWxmLmF1dG9TdXNwZW5kKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZi5fc3VzcGVuZFRpbWVyID0gbnVsbDtcbiAgICAgICAgc2VsZi5zdGF0ZSA9ICdzdXNwZW5kaW5nJztcbiAgICAgICAgc2VsZi5jdHguc3VzcGVuZCgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5zdGF0ZSA9ICdzdXNwZW5kZWQnO1xuXG4gICAgICAgICAgaWYgKHNlbGYuX3Jlc3VtZUFmdGVyU3VzcGVuZCkge1xuICAgICAgICAgICAgZGVsZXRlIHNlbGYuX3Jlc3VtZUFmdGVyU3VzcGVuZDtcbiAgICAgICAgICAgIHNlbGYuX2F1dG9SZXN1bWUoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfSwgMzAwMDApO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXV0b21hdGljYWxseSByZXN1bWUgdGhlIFdlYiBBdWRpbyBBdWRpb0NvbnRleHQgd2hlbiBhIG5ldyBzb3VuZCBpcyBwbGF5ZWQuXG4gICAgICogQHJldHVybiB7SG93bGVyfVxuICAgICAqL1xuICAgIF9hdXRvUmVzdW1lOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKCFzZWxmLmN0eCB8fCB0eXBlb2Ygc2VsZi5jdHgucmVzdW1lID09PSAndW5kZWZpbmVkJyB8fCAhSG93bGVyLnVzaW5nV2ViQXVkaW8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoc2VsZi5zdGF0ZSA9PT0gJ3J1bm5pbmcnICYmIHNlbGYuX3N1c3BlbmRUaW1lcikge1xuICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5fc3VzcGVuZFRpbWVyKTtcbiAgICAgICAgc2VsZi5fc3VzcGVuZFRpbWVyID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoc2VsZi5zdGF0ZSA9PT0gJ3N1c3BlbmRlZCcpIHtcbiAgICAgICAgc2VsZi5zdGF0ZSA9ICdyZXN1bWluZyc7XG4gICAgICAgIHNlbGYuY3R4LnJlc3VtZSgpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5zdGF0ZSA9ICdydW5uaW5nJztcblxuICAgICAgICAgIC8vIEVtaXQgdG8gYWxsIEhvd2xzIHRoYXQgdGhlIGF1ZGlvIGhhcyByZXN1bWVkLlxuICAgICAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9ob3dscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgc2VsZi5faG93bHNbaV0uX2VtaXQoJ3Jlc3VtZScpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKHNlbGYuX3N1c3BlbmRUaW1lcikge1xuICAgICAgICAgIGNsZWFyVGltZW91dChzZWxmLl9zdXNwZW5kVGltZXIpO1xuICAgICAgICAgIHNlbGYuX3N1c3BlbmRUaW1lciA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc2VsZi5zdGF0ZSA9PT0gJ3N1c3BlbmRpbmcnKSB7XG4gICAgICAgIHNlbGYuX3Jlc3VtZUFmdGVyU3VzcGVuZCA9IHRydWU7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cbiAgfTtcblxuICAvLyBTZXR1cCB0aGUgZ2xvYmFsIGF1ZGlvIGNvbnRyb2xsZXIuXG4gIHZhciBIb3dsZXIgPSBuZXcgSG93bGVyR2xvYmFsKCk7XG5cbiAgLyoqIEdyb3VwIE1ldGhvZHMgKiovXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhbiBhdWRpbyBncm91cCBjb250cm9sbGVyLlxuICAgKiBAcGFyYW0ge09iamVjdH0gbyBQYXNzZWQgaW4gcHJvcGVydGllcyBmb3IgdGhpcyBncm91cC5cbiAgICovXG4gIHZhciBIb3dsID0gZnVuY3Rpb24obykge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIFRocm93IGFuIGVycm9yIGlmIG5vIHNvdXJjZSBpcyBwcm92aWRlZC5cbiAgICBpZiAoIW8uc3JjIHx8IG8uc3JjLmxlbmd0aCA9PT0gMCkge1xuICAgICAgY29uc29sZS5lcnJvcignQW4gYXJyYXkgb2Ygc291cmNlIGZpbGVzIG11c3QgYmUgcGFzc2VkIHdpdGggYW55IG5ldyBIb3dsLicpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHNlbGYuaW5pdChvKTtcbiAgfTtcbiAgSG93bC5wcm90b3R5cGUgPSB7XG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSBhIG5ldyBIb3dsIGdyb3VwIG9iamVjdC5cbiAgICAgKiBAcGFyYW0gIHtPYmplY3R9IG8gUGFzc2VkIGluIHByb3BlcnRpZXMgZm9yIHRoaXMgZ3JvdXAuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbihvKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYW4gQXVkaW9Db250ZXh0IGNyZWF0ZWQgeWV0LCBydW4gdGhlIHNldHVwLlxuICAgICAgaWYgKCFIb3dsZXIuY3R4KSB7XG4gICAgICAgIHNldHVwQXVkaW9Db250ZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNldHVwIHVzZXItZGVmaW5lZCBkZWZhdWx0IHByb3BlcnRpZXMuXG4gICAgICBzZWxmLl9hdXRvcGxheSA9IG8uYXV0b3BsYXkgfHwgZmFsc2U7XG4gICAgICBzZWxmLl9mb3JtYXQgPSAodHlwZW9mIG8uZm9ybWF0ICE9PSAnc3RyaW5nJykgPyBvLmZvcm1hdCA6IFtvLmZvcm1hdF07XG4gICAgICBzZWxmLl9odG1sNSA9IG8uaHRtbDUgfHwgZmFsc2U7XG4gICAgICBzZWxmLl9tdXRlZCA9IG8ubXV0ZSB8fCBmYWxzZTtcbiAgICAgIHNlbGYuX2xvb3AgPSBvLmxvb3AgfHwgZmFsc2U7XG4gICAgICBzZWxmLl9wb29sID0gby5wb29sIHx8IDU7XG4gICAgICBzZWxmLl9wcmVsb2FkID0gKHR5cGVvZiBvLnByZWxvYWQgPT09ICdib29sZWFuJykgPyBvLnByZWxvYWQgOiB0cnVlO1xuICAgICAgc2VsZi5fcmF0ZSA9IG8ucmF0ZSB8fCAxO1xuICAgICAgc2VsZi5fc3ByaXRlID0gby5zcHJpdGUgfHwge307XG4gICAgICBzZWxmLl9zcmMgPSAodHlwZW9mIG8uc3JjICE9PSAnc3RyaW5nJykgPyBvLnNyYyA6IFtvLnNyY107XG4gICAgICBzZWxmLl92b2x1bWUgPSBvLnZvbHVtZSAhPT0gdW5kZWZpbmVkID8gby52b2x1bWUgOiAxO1xuXG4gICAgICAvLyBTZXR1cCBhbGwgb3RoZXIgZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICAgICAgc2VsZi5fZHVyYXRpb24gPSAwO1xuICAgICAgc2VsZi5fc3RhdGUgPSAndW5sb2FkZWQnO1xuICAgICAgc2VsZi5fc291bmRzID0gW107XG4gICAgICBzZWxmLl9lbmRUaW1lcnMgPSB7fTtcbiAgICAgIHNlbGYuX3F1ZXVlID0gW107XG5cbiAgICAgIC8vIFNldHVwIGV2ZW50IGxpc3RlbmVycy5cbiAgICAgIHNlbGYuX29uZW5kID0gby5vbmVuZCA/IFt7Zm46IG8ub25lbmR9XSA6IFtdO1xuICAgICAgc2VsZi5fb25mYWRlID0gby5vbmZhZGUgPyBbe2ZuOiBvLm9uZmFkZX1dIDogW107XG4gICAgICBzZWxmLl9vbmxvYWQgPSBvLm9ubG9hZCA/IFt7Zm46IG8ub25sb2FkfV0gOiBbXTtcbiAgICAgIHNlbGYuX29ubG9hZGVycm9yID0gby5vbmxvYWRlcnJvciA/IFt7Zm46IG8ub25sb2FkZXJyb3J9XSA6IFtdO1xuICAgICAgc2VsZi5fb25wYXVzZSA9IG8ub25wYXVzZSA/IFt7Zm46IG8ub25wYXVzZX1dIDogW107XG4gICAgICBzZWxmLl9vbnBsYXkgPSBvLm9ucGxheSA/IFt7Zm46IG8ub25wbGF5fV0gOiBbXTtcbiAgICAgIHNlbGYuX29uc3RvcCA9IG8ub25zdG9wID8gW3tmbjogby5vbnN0b3B9XSA6IFtdO1xuICAgICAgc2VsZi5fb25tdXRlID0gby5vbm11dGUgPyBbe2ZuOiBvLm9ubXV0ZX1dIDogW107XG4gICAgICBzZWxmLl9vbnZvbHVtZSA9IG8ub252b2x1bWUgPyBbe2ZuOiBvLm9udm9sdW1lfV0gOiBbXTtcbiAgICAgIHNlbGYuX29ucmF0ZSA9IG8ub25yYXRlID8gW3tmbjogby5vbnJhdGV9XSA6IFtdO1xuICAgICAgc2VsZi5fb25zZWVrID0gby5vbnNlZWsgPyBbe2ZuOiBvLm9uc2Vla31dIDogW107XG4gICAgICBzZWxmLl9vbnJlc3VtZSA9IFtdO1xuXG4gICAgICAvLyBXZWIgQXVkaW8gb3IgSFRNTDUgQXVkaW8/XG4gICAgICBzZWxmLl93ZWJBdWRpbyA9IEhvd2xlci51c2luZ1dlYkF1ZGlvICYmICFzZWxmLl9odG1sNTtcblxuICAgICAgLy8gQXV0b21hdGljYWxseSB0cnkgdG8gZW5hYmxlIGF1ZGlvIG9uIGlPUy5cbiAgICAgIGlmICh0eXBlb2YgSG93bGVyLmN0eCAhPT0gJ3VuZGVmaW5lZCcgJiYgSG93bGVyLmN0eCAmJiBIb3dsZXIubW9iaWxlQXV0b0VuYWJsZSkge1xuICAgICAgICBIb3dsZXIuX2VuYWJsZU1vYmlsZUF1ZGlvKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhpcyBIb3dsIGdyb3VwIGluIHRoZSBnbG9iYWwgY29udHJvbGxlci5cbiAgICAgIEhvd2xlci5faG93bHMucHVzaChzZWxmKTtcblxuICAgICAgLy8gSWYgdGhleSBzZWxlY3RlZCBhdXRvcGxheSwgYWRkIGEgcGxheSBldmVudCB0byB0aGUgbG9hZCBxdWV1ZS5cbiAgICAgIGlmIChzZWxmLl9hdXRvcGxheSkge1xuICAgICAgICBzZWxmLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgICBldmVudDogJ3BsYXknLFxuICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLnBsYXkoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgfVxuXG4gICAgICAvLyBMb2FkIHRoZSBzb3VyY2UgZmlsZSB1bmxlc3Mgb3RoZXJ3aXNlIHNwZWNpZmllZC5cbiAgICAgIGlmIChzZWxmLl9wcmVsb2FkKSB7XG4gICAgICAgIHNlbGYubG9hZCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTG9hZCB0aGUgYXVkaW8gZmlsZS5cbiAgICAgKiBAcmV0dXJuIHtIb3dsZXJ9XG4gICAgICovXG4gICAgbG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgdXJsID0gbnVsbDtcblxuICAgICAgLy8gSWYgbm8gYXVkaW8gaXMgYXZhaWxhYmxlLCBxdWl0IGltbWVkaWF0ZWx5LlxuICAgICAgaWYgKEhvd2xlci5ub0F1ZGlvKSB7XG4gICAgICAgIHNlbGYuX2VtaXQoJ2xvYWRlcnJvcicsIG51bGwsICdObyBhdWRpbyBzdXBwb3J0LicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSBvdXIgc291cmNlIGlzIGluIGFuIGFycmF5LlxuICAgICAgaWYgKHR5cGVvZiBzZWxmLl9zcmMgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHNlbGYuX3NyYyA9IFtzZWxmLl9zcmNdO1xuICAgICAgfVxuXG4gICAgICAvLyBMb29wIHRocm91Z2ggdGhlIHNvdXJjZXMgYW5kIHBpY2sgdGhlIGZpcnN0IG9uZSB0aGF0IGlzIGNvbXBhdGlibGUuXG4gICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5fc3JjLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBleHQsIHN0cjtcblxuICAgICAgICBpZiAoc2VsZi5fZm9ybWF0ICYmIHNlbGYuX2Zvcm1hdFtpXSkge1xuICAgICAgICAgIC8vIElmIGFuIGV4dGVuc2lvbiB3YXMgc3BlY2lmaWVkLCB1c2UgdGhhdCBpbnN0ZWFkLlxuICAgICAgICAgIGV4dCA9IHNlbGYuX2Zvcm1hdFtpXTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHNvdXJjZSBpcyBhIHN0cmluZy5cbiAgICAgICAgICBzdHIgPSBzZWxmLl9zcmNbaV07XG4gICAgICAgICAgaWYgKHR5cGVvZiBzdHIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBzZWxmLl9lbWl0KCdsb2FkZXJyb3InLCBudWxsLCAnTm9uLXN0cmluZyBmb3VuZCBpbiBzZWxlY3RlZCBhdWRpbyBzb3VyY2VzIC0gaWdub3JpbmcuJyk7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBFeHRyYWN0IHRoZSBmaWxlIGV4dGVuc2lvbiBmcm9tIHRoZSBVUkwgb3IgYmFzZTY0IGRhdGEgVVJJLlxuICAgICAgICAgIGV4dCA9IC9eZGF0YTphdWRpb1xcLyhbXjssXSspOy9pLmV4ZWMoc3RyKTtcbiAgICAgICAgICBpZiAoIWV4dCkge1xuICAgICAgICAgICAgZXh0ID0gL1xcLihbXi5dKykkLy5leGVjKHN0ci5zcGxpdCgnPycsIDEpWzBdKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoZXh0KSB7XG4gICAgICAgICAgICBleHQgPSBleHRbMV0udG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyBDaGVjayBpZiB0aGlzIGV4dGVuc2lvbiBpcyBhdmFpbGFibGUuXG4gICAgICAgIGlmIChIb3dsZXIuY29kZWNzKGV4dCkpIHtcbiAgICAgICAgICB1cmwgPSBzZWxmLl9zcmNbaV07XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCF1cmwpIHtcbiAgICAgICAgc2VsZi5fZW1pdCgnbG9hZGVycm9yJywgbnVsbCwgJ05vIGNvZGVjIHN1cHBvcnQgZm9yIHNlbGVjdGVkIGF1ZGlvIHNvdXJjZXMuJyk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgc2VsZi5fc3JjID0gdXJsO1xuICAgICAgc2VsZi5fc3RhdGUgPSAnbG9hZGluZyc7XG5cbiAgICAgIC8vIElmIHRoZSBob3N0aW5nIHBhZ2UgaXMgSFRUUFMgYW5kIHRoZSBzb3VyY2UgaXNuJ3QsXG4gICAgICAvLyBkcm9wIGRvd24gdG8gSFRNTDUgQXVkaW8gdG8gYXZvaWQgTWl4ZWQgQ29udGVudCBlcnJvcnMuXG4gICAgICBpZiAod2luZG93LmxvY2F0aW9uLnByb3RvY29sID09PSAnaHR0cHM6JyAmJiB1cmwuc2xpY2UoMCwgNSkgPT09ICdodHRwOicpIHtcbiAgICAgICAgc2VsZi5faHRtbDUgPSB0cnVlO1xuICAgICAgICBzZWxmLl93ZWJBdWRpbyA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBDcmVhdGUgYSBuZXcgc291bmQgb2JqZWN0IGFuZCBhZGQgaXQgdG8gdGhlIHBvb2wuXG4gICAgICBuZXcgU291bmQoc2VsZik7XG5cbiAgICAgIC8vIExvYWQgYW5kIGRlY29kZSB0aGUgYXVkaW8gZGF0YSBmb3IgcGxheWJhY2suXG4gICAgICBpZiAoc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgbG9hZEJ1ZmZlcihzZWxmKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBsYXkgYSBzb3VuZCBvciByZXN1bWUgcHJldmlvdXMgcGxheWJhY2suXG4gICAgICogQHBhcmFtICB7U3RyaW5nL051bWJlcn0gc3ByaXRlICAgU3ByaXRlIG5hbWUgZm9yIHNwcml0ZSBwbGF5YmFjayBvciBzb3VuZCBpZCB0byBjb250aW51ZSBwcmV2aW91cy5cbiAgICAgKiBAcGFyYW0gIHtCb29sZWFufSBpbnRlcm5hbCBJbnRlcm5hbCBVc2U6IHRydWUgcHJldmVudHMgZXZlbnQgZmlyaW5nLlxuICAgICAqIEByZXR1cm4ge051bWJlcn0gICAgICAgICAgU291bmQgSUQuXG4gICAgICovXG4gICAgcGxheTogZnVuY3Rpb24oc3ByaXRlLCBpbnRlcm5hbCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGlkID0gbnVsbDtcblxuICAgICAgLy8gRGV0ZXJtaW5lIGlmIGEgc3ByaXRlLCBzb3VuZCBpZCBvciBub3RoaW5nIHdhcyBwYXNzZWRcbiAgICAgIGlmICh0eXBlb2Ygc3ByaXRlID09PSAnbnVtYmVyJykge1xuICAgICAgICBpZCA9IHNwcml0ZTtcbiAgICAgICAgc3ByaXRlID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNwcml0ZSA9PT0gJ3N0cmluZycgJiYgc2VsZi5fc3RhdGUgPT09ICdsb2FkZWQnICYmICFzZWxmLl9zcHJpdGVbc3ByaXRlXSkge1xuICAgICAgICAvLyBJZiB0aGUgcGFzc2VkIHNwcml0ZSBkb2Vzbid0IGV4aXN0LCBkbyBub3RoaW5nLlxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHNwcml0ZSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgLy8gVXNlIHRoZSBkZWZhdWx0IHNvdW5kIHNwcml0ZSAocGxheXMgdGhlIGZ1bGwgYXVkaW8gbGVuZ3RoKS5cbiAgICAgICAgc3ByaXRlID0gJ19fZGVmYXVsdCc7XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBzaW5nbGUgcGF1c2VkIHNvdW5kIHRoYXQgaXNuJ3QgZW5kZWQuXG4gICAgICAgIC8vIElmIHRoZXJlIGlzLCBwbGF5IHRoYXQgc291bmQuIElmIG5vdCwgY29udGludWUgYXMgdXN1YWwuXG4gICAgICAgIHZhciBudW0gPSAwO1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5fc291bmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKHNlbGYuX3NvdW5kc1tpXS5fcGF1c2VkICYmICFzZWxmLl9zb3VuZHNbaV0uX2VuZGVkKSB7XG4gICAgICAgICAgICBudW0rKztcbiAgICAgICAgICAgIGlkID0gc2VsZi5fc291bmRzW2ldLl9pZDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAobnVtID09PSAxKSB7XG4gICAgICAgICAgc3ByaXRlID0gbnVsbDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gR2V0IHRoZSBzZWxlY3RlZCBub2RlLCBvciBnZXQgb25lIGZyb20gdGhlIHBvb2wuXG4gICAgICB2YXIgc291bmQgPSBpZCA/IHNlbGYuX3NvdW5kQnlJZChpZCkgOiBzZWxmLl9pbmFjdGl2ZVNvdW5kKCk7XG5cbiAgICAgIC8vIElmIHRoZSBzb3VuZCBkb2Vzbid0IGV4aXN0LCBkbyBub3RoaW5nLlxuICAgICAgaWYgKCFzb3VuZCkge1xuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgIH1cblxuICAgICAgLy8gU2VsZWN0IHRoZSBzcHJpdGUgZGVmaW5pdGlvbi5cbiAgICAgIGlmIChpZCAmJiAhc3ByaXRlKSB7XG4gICAgICAgIHNwcml0ZSA9IHNvdW5kLl9zcHJpdGUgfHwgJ19fZGVmYXVsdCc7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHdlIGhhdmUgbm8gc3ByaXRlIGFuZCB0aGUgc291bmQgaGFzbid0IGxvYWRlZCwgd2UgbXVzdCB3YWl0XG4gICAgICAvLyBmb3IgdGhlIHNvdW5kIHRvIGxvYWQgdG8gZ2V0IG91ciBhdWRpbydzIGR1cmF0aW9uLlxuICAgICAgaWYgKHNlbGYuX3N0YXRlICE9PSAnbG9hZGVkJyAmJiAhc2VsZi5fc3ByaXRlW3Nwcml0ZV0pIHtcbiAgICAgICAgc2VsZi5fcXVldWUucHVzaCh7XG4gICAgICAgICAgZXZlbnQ6ICdwbGF5JyxcbiAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5wbGF5KHNlbGYuX3NvdW5kQnlJZChzb3VuZC5faWQpID8gc291bmQuX2lkIDogdW5kZWZpbmVkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzb3VuZC5faWQ7XG4gICAgICB9XG5cbiAgICAgIC8vIERvbid0IHBsYXkgdGhlIHNvdW5kIGlmIGFuIGlkIHdhcyBwYXNzZWQgYW5kIGl0IGlzIGFscmVhZHkgcGxheWluZy5cbiAgICAgIGlmIChpZCAmJiAhc291bmQuX3BhdXNlZCkge1xuICAgICAgICAvLyBUcmlnZ2VyIHRoZSBwbGF5IGV2ZW50LCBpbiBvcmRlciB0byBrZWVwIGl0ZXJhdGluZyB0aHJvdWdoIHF1ZXVlLlxuICAgICAgICBpZiAoIWludGVybmFsKSB7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuX2VtaXQoJ3BsYXknLCBzb3VuZC5faWQpO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHNvdW5kLl9pZDtcbiAgICAgIH1cblxuICAgICAgLy8gTWFrZSBzdXJlIHRoZSBBdWRpb0NvbnRleHQgaXNuJ3Qgc3VzcGVuZGVkLCBhbmQgcmVzdW1lIGl0IGlmIGl0IGlzLlxuICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgIEhvd2xlci5fYXV0b1Jlc3VtZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBEZXRlcm1pbmUgaG93IGxvbmcgdG8gcGxheSBmb3IgYW5kIHdoZXJlIHRvIHN0YXJ0IHBsYXlpbmcuXG4gICAgICB2YXIgc2VlayA9IE1hdGgubWF4KDAsIHNvdW5kLl9zZWVrID4gMCA/IHNvdW5kLl9zZWVrIDogc2VsZi5fc3ByaXRlW3Nwcml0ZV1bMF0gLyAxMDAwKTtcbiAgICAgIHZhciBkdXJhdGlvbiA9IE1hdGgubWF4KDAsICgoc2VsZi5fc3ByaXRlW3Nwcml0ZV1bMF0gKyBzZWxmLl9zcHJpdGVbc3ByaXRlXVsxXSkgLyAxMDAwKSAtIHNlZWspO1xuICAgICAgdmFyIHRpbWVvdXQgPSAoZHVyYXRpb24gKiAxMDAwKSAvIE1hdGguYWJzKHNvdW5kLl9yYXRlKTtcblxuICAgICAgLy8gVXBkYXRlIHRoZSBwYXJhbWV0ZXJzIG9mIHRoZSBzb3VuZFxuICAgICAgc291bmQuX3BhdXNlZCA9IGZhbHNlO1xuICAgICAgc291bmQuX2VuZGVkID0gZmFsc2U7XG4gICAgICBzb3VuZC5fc3ByaXRlID0gc3ByaXRlO1xuICAgICAgc291bmQuX3NlZWsgPSBzZWVrO1xuICAgICAgc291bmQuX3N0YXJ0ID0gc2VsZi5fc3ByaXRlW3Nwcml0ZV1bMF0gLyAxMDAwO1xuICAgICAgc291bmQuX3N0b3AgPSAoc2VsZi5fc3ByaXRlW3Nwcml0ZV1bMF0gKyBzZWxmLl9zcHJpdGVbc3ByaXRlXVsxXSkgLyAxMDAwO1xuICAgICAgc291bmQuX2xvb3AgPSAhIShzb3VuZC5fbG9vcCB8fCBzZWxmLl9zcHJpdGVbc3ByaXRlXVsyXSk7XG5cbiAgICAgIC8vIEJlZ2luIHRoZSBhY3R1YWwgcGxheWJhY2suXG4gICAgICB2YXIgbm9kZSA9IHNvdW5kLl9ub2RlO1xuICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgIC8vIEZpcmUgdGhpcyB3aGVuIHRoZSBzb3VuZCBpcyByZWFkeSB0byBwbGF5IHRvIGJlZ2luIFdlYiBBdWRpbyBwbGF5YmFjay5cbiAgICAgICAgdmFyIHBsYXlXZWJBdWRpbyA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuX3JlZnJlc2hCdWZmZXIoc291bmQpO1xuXG4gICAgICAgICAgLy8gU2V0dXAgdGhlIHBsYXliYWNrIHBhcmFtcy5cbiAgICAgICAgICB2YXIgdm9sID0gKHNvdW5kLl9tdXRlZCB8fCBzZWxmLl9tdXRlZCkgPyAwIDogc291bmQuX3ZvbHVtZTtcbiAgICAgICAgICBub2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUodm9sLCBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgICBzb3VuZC5fcGxheVN0YXJ0ID0gSG93bGVyLmN0eC5jdXJyZW50VGltZTtcblxuICAgICAgICAgIC8vIFBsYXkgdGhlIHNvdW5kIHVzaW5nIHRoZSBzdXBwb3J0ZWQgbWV0aG9kLlxuICAgICAgICAgIGlmICh0eXBlb2Ygbm9kZS5idWZmZXJTb3VyY2Uuc3RhcnQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBzb3VuZC5fbG9vcCA/IG5vZGUuYnVmZmVyU291cmNlLm5vdGVHcmFpbk9uKDAsIHNlZWssIDg2NDAwKSA6IG5vZGUuYnVmZmVyU291cmNlLm5vdGVHcmFpbk9uKDAsIHNlZWssIGR1cmF0aW9uKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgc291bmQuX2xvb3AgPyBub2RlLmJ1ZmZlclNvdXJjZS5zdGFydCgwLCBzZWVrLCA4NjQwMCkgOiBub2RlLmJ1ZmZlclNvdXJjZS5zdGFydCgwLCBzZWVrLCBkdXJhdGlvbik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gU3RhcnQgYSBuZXcgdGltZXIgaWYgbm9uZSBpcyBwcmVzZW50LlxuICAgICAgICAgIGlmICh0aW1lb3V0ICE9PSBJbmZpbml0eSkge1xuICAgICAgICAgICAgc2VsZi5fZW5kVGltZXJzW3NvdW5kLl9pZF0gPSBzZXRUaW1lb3V0KHNlbGYuX2VuZGVkLmJpbmQoc2VsZiwgc291bmQpLCB0aW1lb3V0KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoIWludGVybmFsKSB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBzZWxmLl9lbWl0KCdwbGF5Jywgc291bmQuX2lkKTtcbiAgICAgICAgICAgIH0sIDApO1xuICAgICAgICAgIH1cbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgaXNSdW5uaW5nID0gKEhvd2xlci5zdGF0ZSA9PT0gJ3J1bm5pbmcnKTtcbiAgICAgICAgaWYgKHNlbGYuX3N0YXRlID09PSAnbG9hZGVkJyAmJiBpc1J1bm5pbmcpIHtcbiAgICAgICAgICBwbGF5V2ViQXVkaW8oKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBXYWl0IGZvciB0aGUgYXVkaW8gdG8gbG9hZCBhbmQgdGhlbiBiZWdpbiBwbGF5YmFjay5cbiAgICAgICAgICBzZWxmLm9uY2UoaXNSdW5uaW5nID8gJ2xvYWQnIDogJ3Jlc3VtZScsIHBsYXlXZWJBdWRpbywgaXNSdW5uaW5nID8gc291bmQuX2lkIDogbnVsbCk7XG5cbiAgICAgICAgICAvLyBDYW5jZWwgdGhlIGVuZCB0aW1lci5cbiAgICAgICAgICBzZWxmLl9jbGVhclRpbWVyKHNvdW5kLl9pZCk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIEZpcmUgdGhpcyB3aGVuIHRoZSBzb3VuZCBpcyByZWFkeSB0byBwbGF5IHRvIGJlZ2luIEhUTUw1IEF1ZGlvIHBsYXliYWNrLlxuICAgICAgICB2YXIgcGxheUh0bWw1ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbm9kZS5jdXJyZW50VGltZSA9IHNlZWs7XG4gICAgICAgICAgbm9kZS5tdXRlZCA9IHNvdW5kLl9tdXRlZCB8fCBzZWxmLl9tdXRlZCB8fCBIb3dsZXIuX211dGVkIHx8IG5vZGUubXV0ZWQ7XG4gICAgICAgICAgbm9kZS52b2x1bWUgPSBzb3VuZC5fdm9sdW1lICogSG93bGVyLnZvbHVtZSgpO1xuICAgICAgICAgIG5vZGUucGxheWJhY2tSYXRlID0gc291bmQuX3JhdGU7XG5cbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgbm9kZS5wbGF5KCk7XG5cbiAgICAgICAgICAgIC8vIFNldHVwIHRoZSBuZXcgZW5kIHRpbWVyLlxuICAgICAgICAgICAgaWYgKHRpbWVvdXQgIT09IEluZmluaXR5KSB7XG4gICAgICAgICAgICAgIHNlbGYuX2VuZFRpbWVyc1tzb3VuZC5faWRdID0gc2V0VGltZW91dChzZWxmLl9lbmRlZC5iaW5kKHNlbGYsIHNvdW5kKSwgdGltZW91dCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICghaW50ZXJuYWwpIHtcbiAgICAgICAgICAgICAgc2VsZi5fZW1pdCgncGxheScsIHNvdW5kLl9pZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgMCk7XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gUGxheSBpbW1lZGlhdGVseSBpZiByZWFkeSwgb3Igd2FpdCBmb3IgdGhlICdjYW5wbGF5dGhyb3VnaCdlIHZlbnQuXG4gICAgICAgIHZhciBsb2FkZWROb1JlYWR5U3RhdGUgPSAoc2VsZi5fc3RhdGUgPT09ICdsb2FkZWQnICYmICh3aW5kb3cgJiYgd2luZG93LmVqZWN0YSB8fCAhbm9kZS5yZWFkeVN0YXRlICYmIEhvd2xlci5fbmF2aWdhdG9yLmlzQ29jb29uSlMpKTtcbiAgICAgICAgaWYgKG5vZGUucmVhZHlTdGF0ZSA9PT0gNCB8fCBsb2FkZWROb1JlYWR5U3RhdGUpIHtcbiAgICAgICAgICBwbGF5SHRtbDUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIgbGlzdGVuZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIC8vIEJlZ2luIHBsYXliYWNrLlxuICAgICAgICAgICAgcGxheUh0bWw1KCk7XG5cbiAgICAgICAgICAgIC8vIENsZWFyIHRoaXMgbGlzdGVuZXIuXG4gICAgICAgICAgICBub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoSG93bGVyLl9jYW5QbGF5RXZlbnQsIGxpc3RlbmVyLCBmYWxzZSk7XG4gICAgICAgICAgfTtcbiAgICAgICAgICBub2RlLmFkZEV2ZW50TGlzdGVuZXIoSG93bGVyLl9jYW5QbGF5RXZlbnQsIGxpc3RlbmVyLCBmYWxzZSk7XG5cbiAgICAgICAgICAvLyBDYW5jZWwgdGhlIGVuZCB0aW1lci5cbiAgICAgICAgICBzZWxmLl9jbGVhclRpbWVyKHNvdW5kLl9pZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNvdW5kLl9pZDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUGF1c2UgcGxheWJhY2sgYW5kIHNhdmUgY3VycmVudCBwb3NpdGlvbi5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGlkIFRoZSBzb3VuZCBJRCAoZW1wdHkgdG8gcGF1c2UgYWxsIGluIGdyb3VwKS5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIHBhdXNlOiBmdW5jdGlvbihpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBJZiB0aGUgc291bmQgaGFzbid0IGxvYWRlZCwgYWRkIGl0IHRvIHRoZSBsb2FkIHF1ZXVlIHRvIHBhdXNlIHdoZW4gY2FwYWJsZS5cbiAgICAgIGlmIChzZWxmLl9zdGF0ZSAhPT0gJ2xvYWRlZCcpIHtcbiAgICAgICAgc2VsZi5fcXVldWUucHVzaCh7XG4gICAgICAgICAgZXZlbnQ6ICdwYXVzZScsXG4gICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYucGF1c2UoaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG5vIGlkIGlzIHBhc3NlZCwgZ2V0IGFsbCBJRCdzIHRvIGJlIHBhdXNlZC5cbiAgICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcyhpZCk7XG5cbiAgICAgIGZvciAodmFyIGk9MDsgaTxpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gQ2xlYXIgdGhlIGVuZCB0aW1lci5cbiAgICAgICAgc2VsZi5fY2xlYXJUaW1lcihpZHNbaV0pO1xuXG4gICAgICAgIC8vIEdldCB0aGUgc291bmQuXG4gICAgICAgIHZhciBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZHNbaV0pO1xuXG4gICAgICAgIGlmIChzb3VuZCAmJiAhc291bmQuX3BhdXNlZCkge1xuICAgICAgICAgIC8vIFJlc2V0IHRoZSBzZWVrIHBvc2l0aW9uLlxuICAgICAgICAgIHNvdW5kLl9zZWVrID0gc2VsZi5zZWVrKGlkc1tpXSk7XG4gICAgICAgICAgc291bmQuX3JhdGVTZWVrID0gMDtcbiAgICAgICAgICBzb3VuZC5fcGF1c2VkID0gdHJ1ZTtcblxuICAgICAgICAgIC8vIFN0b3AgY3VycmVudGx5IHJ1bm5pbmcgZmFkZXMuXG4gICAgICAgICAgc2VsZi5fc3RvcEZhZGUoaWRzW2ldKTtcblxuICAgICAgICAgIGlmIChzb3VuZC5fbm9kZSkge1xuICAgICAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgICAgIC8vIG1ha2Ugc3VyZSB0aGUgc291bmQgaGFzIGJlZW4gY3JlYXRlZFxuICAgICAgICAgICAgICBpZiAoIXNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2Uuc3RvcCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2Uubm90ZU9mZigwKTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2Uuc3RvcCgwKTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIENsZWFuIHVwIHRoZSBidWZmZXIgc291cmNlLlxuICAgICAgICAgICAgICBzZWxmLl9jbGVhbkJ1ZmZlcihzb3VuZC5fbm9kZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCFpc05hTihzb3VuZC5fbm9kZS5kdXJhdGlvbikgfHwgc291bmQuX25vZGUuZHVyYXRpb24gPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgICAgIHNvdW5kLl9ub2RlLnBhdXNlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlyZSB0aGUgcGF1c2UgZXZlbnQsIHVubGVzcyBgdHJ1ZWAgaXMgcGFzc2VkIGFzIHRoZSAybmQgYXJndW1lbnQuXG4gICAgICAgIGlmICghYXJndW1lbnRzWzFdKSB7XG4gICAgICAgICAgc2VsZi5fZW1pdCgncGF1c2UnLCBzb3VuZCA/IHNvdW5kLl9pZCA6IG51bGwpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTdG9wIHBsYXliYWNrIGFuZCByZXNldCB0byBzdGFydC5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGlkIFRoZSBzb3VuZCBJRCAoZW1wdHkgdG8gc3RvcCBhbGwgaW4gZ3JvdXApLlxuICAgICAqIEBwYXJhbSAge0Jvb2xlYW59IGludGVybmFsIEludGVybmFsIFVzZTogdHJ1ZSBwcmV2ZW50cyBldmVudCBmaXJpbmcuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBzdG9wOiBmdW5jdGlvbihpZCwgaW50ZXJuYWwpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gSWYgdGhlIHNvdW5kIGhhc24ndCBsb2FkZWQsIGFkZCBpdCB0byB0aGUgbG9hZCBxdWV1ZSB0byBzdG9wIHdoZW4gY2FwYWJsZS5cbiAgICAgIGlmIChzZWxmLl9zdGF0ZSAhPT0gJ2xvYWRlZCcpIHtcbiAgICAgICAgc2VsZi5fcXVldWUucHVzaCh7XG4gICAgICAgICAgZXZlbnQ6ICdzdG9wJyxcbiAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5zdG9wKGlkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBubyBpZCBpcyBwYXNzZWQsIGdldCBhbGwgSUQncyB0byBiZSBzdG9wcGVkLlxuICAgICAgdmFyIGlkcyA9IHNlbGYuX2dldFNvdW5kSWRzKGlkKTtcblxuICAgICAgZm9yICh2YXIgaT0wOyBpPGlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyBDbGVhciB0aGUgZW5kIHRpbWVyLlxuICAgICAgICBzZWxmLl9jbGVhclRpbWVyKGlkc1tpXSk7XG5cbiAgICAgICAgLy8gR2V0IHRoZSBzb3VuZC5cbiAgICAgICAgdmFyIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKGlkc1tpXSk7XG5cbiAgICAgICAgaWYgKHNvdW5kKSB7XG4gICAgICAgICAgLy8gUmVzZXQgdGhlIHNlZWsgcG9zaXRpb24uXG4gICAgICAgICAgc291bmQuX3NlZWsgPSBzb3VuZC5fc3RhcnQgfHwgMDtcbiAgICAgICAgICBzb3VuZC5fcmF0ZVNlZWsgPSAwO1xuICAgICAgICAgIHNvdW5kLl9wYXVzZWQgPSB0cnVlO1xuICAgICAgICAgIHNvdW5kLl9lbmRlZCA9IHRydWU7XG5cbiAgICAgICAgICAvLyBTdG9wIGN1cnJlbnRseSBydW5uaW5nIGZhZGVzLlxuICAgICAgICAgIHNlbGYuX3N0b3BGYWRlKGlkc1tpXSk7XG5cbiAgICAgICAgICBpZiAoc291bmQuX25vZGUpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIHNvdW5kIGhhcyBiZWVuIGNyZWF0ZWRcbiAgICAgICAgICAgICAgaWYgKCFzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBpZiAoIWludGVybmFsKSB7XG4gICAgICAgICAgICAgICAgICBzZWxmLl9lbWl0KCdzdG9wJywgc291bmQuX2lkKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmICh0eXBlb2Ygc291bmQuX25vZGUuYnVmZmVyU291cmNlLnN0b3AgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlLm5vdGVPZmYoMCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlLnN0b3AoMCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgYnVmZmVyIHNvdXJjZS5cbiAgICAgICAgICAgICAgc2VsZi5fY2xlYW5CdWZmZXIoc291bmQuX25vZGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNOYU4oc291bmQuX25vZGUuZHVyYXRpb24pIHx8IHNvdW5kLl9ub2RlLmR1cmF0aW9uID09PSBJbmZpbml0eSkge1xuICAgICAgICAgICAgICBzb3VuZC5fbm9kZS5jdXJyZW50VGltZSA9IHNvdW5kLl9zdGFydCB8fCAwO1xuICAgICAgICAgICAgICBzb3VuZC5fbm9kZS5wYXVzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzb3VuZCAmJiAhaW50ZXJuYWwpIHtcbiAgICAgICAgICBzZWxmLl9lbWl0KCdzdG9wJywgc291bmQuX2lkKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTXV0ZS91bm11dGUgYSBzaW5nbGUgc291bmQgb3IgYWxsIHNvdW5kcyBpbiB0aGlzIEhvd2wgZ3JvdXAuXG4gICAgICogQHBhcmFtICB7Qm9vbGVhbn0gbXV0ZWQgU2V0IHRvIHRydWUgdG8gbXV0ZSBhbmQgZmFsc2UgdG8gdW5tdXRlLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaWQgICAgVGhlIHNvdW5kIElEIHRvIHVwZGF0ZSAob21pdCB0byBtdXRlL3VubXV0ZSBhbGwpLlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgbXV0ZTogZnVuY3Rpb24obXV0ZWQsIGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIElmIHRoZSBzb3VuZCBoYXNuJ3QgbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGxvYWQgcXVldWUgdG8gbXV0ZSB3aGVuIGNhcGFibGUuXG4gICAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnKSB7XG4gICAgICAgIHNlbGYuX3F1ZXVlLnB1c2goe1xuICAgICAgICAgIGV2ZW50OiAnbXV0ZScsXG4gICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYubXV0ZShtdXRlZCwgaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIGFwcGx5aW5nIG11dGUvdW5tdXRlIHRvIGFsbCBzb3VuZHMsIHVwZGF0ZSB0aGUgZ3JvdXAncyB2YWx1ZS5cbiAgICAgIGlmICh0eXBlb2YgaWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbXV0ZWQgPT09ICdib29sZWFuJykge1xuICAgICAgICAgIHNlbGYuX211dGVkID0gbXV0ZWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHNlbGYuX211dGVkO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG5vIGlkIGlzIHBhc3NlZCwgZ2V0IGFsbCBJRCdzIHRvIGJlIG11dGVkLlxuICAgICAgdmFyIGlkcyA9IHNlbGYuX2dldFNvdW5kSWRzKGlkKTtcblxuICAgICAgZm9yICh2YXIgaT0wOyBpPGlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAvLyBHZXQgdGhlIHNvdW5kLlxuICAgICAgICB2YXIgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWRzW2ldKTtcblxuICAgICAgICBpZiAoc291bmQpIHtcbiAgICAgICAgICBzb3VuZC5fbXV0ZWQgPSBtdXRlZDtcblxuICAgICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbyAmJiBzb3VuZC5fbm9kZSkge1xuICAgICAgICAgICAgc291bmQuX25vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZShtdXRlZCA/IDAgOiBzb3VuZC5fdm9sdW1lLCBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHNvdW5kLl9ub2RlKSB7XG4gICAgICAgICAgICBzb3VuZC5fbm9kZS5tdXRlZCA9IEhvd2xlci5fbXV0ZWQgPyB0cnVlIDogbXV0ZWQ7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fZW1pdCgnbXV0ZScsIHNvdW5kLl9pZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldC9zZXQgdGhlIHZvbHVtZSBvZiB0aGlzIHNvdW5kIG9yIG9mIHRoZSBIb3dsIGdyb3VwLiBUaGlzIG1ldGhvZCBjYW4gb3B0aW9uYWxseSB0YWtlIDAsIDEgb3IgMiBhcmd1bWVudHMuXG4gICAgICogICB2b2x1bWUoKSAtPiBSZXR1cm5zIHRoZSBncm91cCdzIHZvbHVtZSB2YWx1ZS5cbiAgICAgKiAgIHZvbHVtZShpZCkgLT4gUmV0dXJucyB0aGUgc291bmQgaWQncyBjdXJyZW50IHZvbHVtZS5cbiAgICAgKiAgIHZvbHVtZSh2b2wpIC0+IFNldHMgdGhlIHZvbHVtZSBvZiBhbGwgc291bmRzIGluIHRoaXMgSG93bCBncm91cC5cbiAgICAgKiAgIHZvbHVtZSh2b2wsIGlkKSAtPiBTZXRzIHRoZSB2b2x1bWUgb2YgcGFzc2VkIHNvdW5kIGlkLlxuICAgICAqIEByZXR1cm4ge0hvd2wvTnVtYmVyfSBSZXR1cm5zIHNlbGYgb3IgY3VycmVudCB2b2x1bWUuXG4gICAgICovXG4gICAgdm9sdW1lOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgdmFyIHZvbCwgaWQ7XG5cbiAgICAgIC8vIERldGVybWluZSB0aGUgdmFsdWVzIGJhc2VkIG9uIGFyZ3VtZW50cy5cbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAvLyBSZXR1cm4gdGhlIHZhbHVlIG9mIHRoZSBncm91cHMnIHZvbHVtZS5cbiAgICAgICAgcmV0dXJuIHNlbGYuX3ZvbHVtZTtcbiAgICAgIH0gZWxzZSBpZiAoYXJncy5sZW5ndGggPT09IDEgfHwgYXJncy5sZW5ndGggPT09IDIgJiYgdHlwZW9mIGFyZ3NbMV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIC8vIEZpcnN0IGNoZWNrIGlmIHRoaXMgaXMgYW4gSUQsIGFuZCBpZiBub3QsIGFzc3VtZSBpdCBpcyBhIG5ldyB2b2x1bWUuXG4gICAgICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcygpO1xuICAgICAgICB2YXIgaW5kZXggPSBpZHMuaW5kZXhPZihhcmdzWzBdKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBpZCA9IHBhcnNlSW50KGFyZ3NbMF0sIDEwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2b2wgPSBwYXJzZUZsb2F0KGFyZ3NbMF0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID49IDIpIHtcbiAgICAgICAgdm9sID0gcGFyc2VGbG9hdChhcmdzWzBdKTtcbiAgICAgICAgaWQgPSBwYXJzZUludChhcmdzWzFdLCAxMCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgdm9sdW1lIG9yIHJldHVybiB0aGUgY3VycmVudCB2b2x1bWUuXG4gICAgICB2YXIgc291bmQ7XG4gICAgICBpZiAodHlwZW9mIHZvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgdm9sID49IDAgJiYgdm9sIDw9IDEpIHtcbiAgICAgICAgLy8gSWYgdGhlIHNvdW5kIGhhc24ndCBsb2FkZWQsIGFkZCBpdCB0byB0aGUgbG9hZCBxdWV1ZSB0byBjaGFuZ2Ugdm9sdW1lIHdoZW4gY2FwYWJsZS5cbiAgICAgICAgaWYgKHNlbGYuX3N0YXRlICE9PSAnbG9hZGVkJykge1xuICAgICAgICAgIHNlbGYuX3F1ZXVlLnB1c2goe1xuICAgICAgICAgICAgZXZlbnQ6ICd2b2x1bWUnLFxuICAgICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgc2VsZi52b2x1bWUuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCB0aGUgZ3JvdXAgdm9sdW1lLlxuICAgICAgICBpZiAodHlwZW9mIGlkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHNlbGYuX3ZvbHVtZSA9IHZvbDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZSBvbmUgb3IgYWxsIHZvbHVtZXMuXG4gICAgICAgIGlkID0gc2VsZi5fZ2V0U291bmRJZHMoaWQpO1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8aWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAvLyBHZXQgdGhlIHNvdW5kLlxuICAgICAgICAgIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKGlkW2ldKTtcblxuICAgICAgICAgIGlmIChzb3VuZCkge1xuICAgICAgICAgICAgc291bmQuX3ZvbHVtZSA9IHZvbDtcblxuICAgICAgICAgICAgLy8gU3RvcCBjdXJyZW50bHkgcnVubmluZyBmYWRlcy5cbiAgICAgICAgICAgIGlmICghYXJnc1syXSkge1xuICAgICAgICAgICAgICBzZWxmLl9zdG9wRmFkZShpZFtpXSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbyAmJiBzb3VuZC5fbm9kZSAmJiAhc291bmQuX211dGVkKSB7XG4gICAgICAgICAgICAgIHNvdW5kLl9ub2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUodm9sLCBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc291bmQuX25vZGUgJiYgIXNvdW5kLl9tdXRlZCkge1xuICAgICAgICAgICAgICBzb3VuZC5fbm9kZS52b2x1bWUgPSB2b2wgKiBIb3dsZXIudm9sdW1lKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNlbGYuX2VtaXQoJ3ZvbHVtZScsIHNvdW5kLl9pZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzb3VuZCA9IGlkID8gc2VsZi5fc291bmRCeUlkKGlkKSA6IHNlbGYuX3NvdW5kc1swXTtcbiAgICAgICAgcmV0dXJuIHNvdW5kID8gc291bmQuX3ZvbHVtZSA6IDA7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGYWRlIGEgY3VycmVudGx5IHBsYXlpbmcgc291bmQgYmV0d2VlbiB0d28gdm9sdW1lcyAoaWYgbm8gaWQgaXMgcGFzc3NlZCwgYWxsIHNvdW5kcyB3aWxsIGZhZGUpLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gZnJvbSBUaGUgdmFsdWUgdG8gZmFkZSBmcm9tICgwLjAgdG8gMS4wKS5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHRvICAgVGhlIHZvbHVtZSB0byBmYWRlIHRvICgwLjAgdG8gMS4wKS5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGxlbiAgVGltZSBpbiBtaWxsaXNlY29uZHMgdG8gZmFkZS5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGlkICAgVGhlIHNvdW5kIGlkIChvbWl0IHRvIGZhZGUgYWxsIHNvdW5kcykuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBmYWRlOiBmdW5jdGlvbihmcm9tLCB0bywgbGVuLCBpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGRpZmYgPSBNYXRoLmFicyhmcm9tIC0gdG8pO1xuICAgICAgdmFyIGRpciA9IGZyb20gPiB0byA/ICdvdXQnIDogJ2luJztcbiAgICAgIHZhciBzdGVwcyA9IGRpZmYgLyAwLjAxO1xuICAgICAgdmFyIHN0ZXBMZW4gPSAoc3RlcHMgPiAwKSA/IGxlbiAvIHN0ZXBzIDogbGVuO1xuXG4gICAgICAvLyBTaW5jZSBicm93c2VycyBjbGFtcCB0aW1lb3V0cyB0byA0bXMsIHdlIG5lZWQgdG8gY2xhbXAgb3VyIHN0ZXBzIHRvIHRoYXQgdG9vLlxuICAgICAgaWYgKHN0ZXBMZW4gPCA0KSB7XG4gICAgICAgIHN0ZXBzID0gTWF0aC5jZWlsKHN0ZXBzIC8gKDQgLyBzdGVwTGVuKSk7XG4gICAgICAgIHN0ZXBMZW4gPSA0O1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGUgc291bmQgaGFzbid0IGxvYWRlZCwgYWRkIGl0IHRvIHRoZSBsb2FkIHF1ZXVlIHRvIGZhZGUgd2hlbiBjYXBhYmxlLlxuICAgICAgaWYgKHNlbGYuX3N0YXRlICE9PSAnbG9hZGVkJykge1xuICAgICAgICBzZWxmLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgICBldmVudDogJ2ZhZGUnLFxuICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLmZhZGUoZnJvbSwgdG8sIGxlbiwgaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIC8vIFNldCB0aGUgdm9sdW1lIHRvIHRoZSBzdGFydCBwb3NpdGlvbi5cbiAgICAgIHNlbGYudm9sdW1lKGZyb20sIGlkKTtcblxuICAgICAgLy8gRmFkZSB0aGUgdm9sdW1lIG9mIG9uZSBvciBhbGwgc291bmRzLlxuICAgICAgdmFyIGlkcyA9IHNlbGYuX2dldFNvdW5kSWRzKGlkKTtcbiAgICAgIGZvciAodmFyIGk9MDsgaTxpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gR2V0IHRoZSBzb3VuZC5cbiAgICAgICAgdmFyIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKGlkc1tpXSk7XG5cbiAgICAgICAgLy8gQ3JlYXRlIGEgbGluZWFyIGZhZGUgb3IgZmFsbCBiYWNrIHRvIHRpbWVvdXRzIHdpdGggSFRNTDUgQXVkaW8uXG4gICAgICAgIGlmIChzb3VuZCkge1xuICAgICAgICAgIC8vIFN0b3AgdGhlIHByZXZpb3VzIGZhZGUgaWYgbm8gc3ByaXRlIGlzIGJlaW5nIHVzZWQgKG90aGVyd2lzZSwgdm9sdW1lIGhhbmRsZXMgdGhpcykuXG4gICAgICAgICAgaWYgKCFpZCkge1xuICAgICAgICAgICAgc2VsZi5fc3RvcEZhZGUoaWRzW2ldKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBJZiB3ZSBhcmUgdXNpbmcgV2ViIEF1ZGlvLCBsZXQgdGhlIG5hdGl2ZSBtZXRob2RzIGRvIHRoZSBhY3R1YWwgZmFkZS5cbiAgICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8gJiYgIXNvdW5kLl9tdXRlZCkge1xuICAgICAgICAgICAgdmFyIGN1cnJlbnRUaW1lID0gSG93bGVyLmN0eC5jdXJyZW50VGltZTtcbiAgICAgICAgICAgIHZhciBlbmQgPSBjdXJyZW50VGltZSArIChsZW4gLyAxMDAwKTtcbiAgICAgICAgICAgIHNvdW5kLl92b2x1bWUgPSBmcm9tO1xuICAgICAgICAgICAgc291bmQuX25vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZShmcm9tLCBjdXJyZW50VGltZSk7XG4gICAgICAgICAgICBzb3VuZC5fbm9kZS5nYWluLmxpbmVhclJhbXBUb1ZhbHVlQXRUaW1lKHRvLCBlbmQpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHZhciB2b2wgPSBmcm9tO1xuICAgICAgICAgIHNvdW5kLl9pbnRlcnZhbCA9IHNldEludGVydmFsKGZ1bmN0aW9uKHNvdW5kSWQsIHNvdW5kKSB7XG4gICAgICAgICAgICAvLyBVcGRhdGUgdGhlIHZvbHVtZSBhbW91bnQsIGJ1dCBvbmx5IGlmIHRoZSB2b2x1bWUgc2hvdWxkIGNoYW5nZS5cbiAgICAgICAgICAgIGlmIChzdGVwcyA+IDApIHtcbiAgICAgICAgICAgICAgdm9sICs9IChkaXIgPT09ICdpbicgPyAwLjAxIDogLTAuMDEpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHZvbHVtZSBpcyBpbiB0aGUgcmlnaHQgYm91bmRzLlxuICAgICAgICAgICAgdm9sID0gTWF0aC5tYXgoMCwgdm9sKTtcbiAgICAgICAgICAgIHZvbCA9IE1hdGgubWluKDEsIHZvbCk7XG5cbiAgICAgICAgICAgIC8vIFJvdW5kIHRvIHdpdGhpbiAyIGRlY2ltYWwgcG9pbnRzLlxuICAgICAgICAgICAgdm9sID0gTWF0aC5yb3VuZCh2b2wgKiAxMDApIC8gMTAwO1xuXG4gICAgICAgICAgICAvLyBDaGFuZ2UgdGhlIHZvbHVtZS5cbiAgICAgICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICAgICAgICBpZiAodHlwZW9mIGlkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHNlbGYuX3ZvbHVtZSA9IHZvbDtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIHNvdW5kLl92b2x1bWUgPSB2b2w7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzZWxmLnZvbHVtZSh2b2wsIHNvdW5kSWQsIHRydWUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBXaGVuIHRoZSBmYWRlIGlzIGNvbXBsZXRlLCBzdG9wIGl0IGFuZCBmaXJlIGV2ZW50LlxuICAgICAgICAgICAgaWYgKHZvbCA9PT0gdG8pIHtcbiAgICAgICAgICAgICAgY2xlYXJJbnRlcnZhbChzb3VuZC5faW50ZXJ2YWwpO1xuICAgICAgICAgICAgICBzb3VuZC5faW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICAgICAgICBzZWxmLnZvbHVtZSh2b2wsIHNvdW5kSWQpO1xuICAgICAgICAgICAgICBzZWxmLl9lbWl0KCdmYWRlJywgc291bmRJZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfS5iaW5kKHNlbGYsIGlkc1tpXSwgc291bmQpLCBzdGVwTGVuKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSW50ZXJuYWwgbWV0aG9kIHRoYXQgc3RvcHMgdGhlIGN1cnJlbnRseSBwbGF5aW5nIGZhZGUgd2hlblxuICAgICAqIGEgbmV3IGZhZGUgc3RhcnRzLCB2b2x1bWUgaXMgY2hhbmdlZCBvciB0aGUgc291bmQgaXMgc3RvcHBlZC5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGlkIFRoZSBzb3VuZCBpZC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIF9zdG9wRmFkZTogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZCk7XG5cbiAgICAgIGlmIChzb3VuZCAmJiBzb3VuZC5faW50ZXJ2YWwpIHtcbiAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgc291bmQuX25vZGUuZ2Fpbi5jYW5jZWxTY2hlZHVsZWRWYWx1ZXMoSG93bGVyLmN0eC5jdXJyZW50VGltZSk7XG4gICAgICAgIH1cblxuICAgICAgICBjbGVhckludGVydmFsKHNvdW5kLl9pbnRlcnZhbCk7XG4gICAgICAgIHNvdW5kLl9pbnRlcnZhbCA9IG51bGw7XG4gICAgICAgIHNlbGYuX2VtaXQoJ2ZhZGUnLCBpZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQvc2V0IHRoZSBsb29wIHBhcmFtZXRlciBvbiBhIHNvdW5kLiBUaGlzIG1ldGhvZCBjYW4gb3B0aW9uYWxseSB0YWtlIDAsIDEgb3IgMiBhcmd1bWVudHMuXG4gICAgICogICBsb29wKCkgLT4gUmV0dXJucyB0aGUgZ3JvdXAncyBsb29wIHZhbHVlLlxuICAgICAqICAgbG9vcChpZCkgLT4gUmV0dXJucyB0aGUgc291bmQgaWQncyBsb29wIHZhbHVlLlxuICAgICAqICAgbG9vcChsb29wKSAtPiBTZXRzIHRoZSBsb29wIHZhbHVlIGZvciBhbGwgc291bmRzIGluIHRoaXMgSG93bCBncm91cC5cbiAgICAgKiAgIGxvb3AobG9vcCwgaWQpIC0+IFNldHMgdGhlIGxvb3AgdmFsdWUgb2YgcGFzc2VkIHNvdW5kIGlkLlxuICAgICAqIEByZXR1cm4ge0hvd2wvQm9vbGVhbn0gUmV0dXJucyBzZWxmIG9yIGN1cnJlbnQgbG9vcCB2YWx1ZS5cbiAgICAgKi9cbiAgICBsb29wOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgdmFyIGxvb3AsIGlkLCBzb3VuZDtcblxuICAgICAgLy8gRGV0ZXJtaW5lIHRoZSB2YWx1ZXMgZm9yIGxvb3AgYW5kIGlkLlxuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIC8vIFJldHVybiB0aGUgZ3JvdSdzIGxvb3AgdmFsdWUuXG4gICAgICAgIHJldHVybiBzZWxmLl9sb29wO1xuICAgICAgfSBlbHNlIGlmIChhcmdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09ICdib29sZWFuJykge1xuICAgICAgICAgIGxvb3AgPSBhcmdzWzBdO1xuICAgICAgICAgIHNlbGYuX2xvb3AgPSBsb29wO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIFJldHVybiB0aGlzIHNvdW5kJ3MgbG9vcCB2YWx1ZS5cbiAgICAgICAgICBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChwYXJzZUludChhcmdzWzBdLCAxMCkpO1xuICAgICAgICAgIHJldHVybiBzb3VuZCA/IHNvdW5kLl9sb29wIDogZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYXJncy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgbG9vcCA9IGFyZ3NbMF07XG4gICAgICAgIGlkID0gcGFyc2VJbnQoYXJnc1sxXSwgMTApO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBubyBpZCBpcyBwYXNzZWQsIGdldCBhbGwgSUQncyB0byBiZSBsb29wZWQuXG4gICAgICB2YXIgaWRzID0gc2VsZi5fZ2V0U291bmRJZHMoaWQpO1xuICAgICAgZm9yICh2YXIgaT0wOyBpPGlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZHNbaV0pO1xuXG4gICAgICAgIGlmIChzb3VuZCkge1xuICAgICAgICAgIHNvdW5kLl9sb29wID0gbG9vcDtcbiAgICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8gJiYgc291bmQuX25vZGUgJiYgc291bmQuX25vZGUuYnVmZmVyU291cmNlKSB7XG4gICAgICAgICAgICBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UubG9vcCA9IGxvb3A7XG4gICAgICAgICAgICBpZiAobG9vcCkge1xuICAgICAgICAgICAgICBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UubG9vcFN0YXJ0ID0gc291bmQuX3N0YXJ0IHx8IDA7XG4gICAgICAgICAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5sb29wRW5kID0gc291bmQuX3N0b3A7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQvc2V0IHRoZSBwbGF5YmFjayByYXRlIG9mIGEgc291bmQuIFRoaXMgbWV0aG9kIGNhbiBvcHRpb25hbGx5IHRha2UgMCwgMSBvciAyIGFyZ3VtZW50cy5cbiAgICAgKiAgIHJhdGUoKSAtPiBSZXR1cm5zIHRoZSBmaXJzdCBzb3VuZCBub2RlJ3MgY3VycmVudCBwbGF5YmFjayByYXRlLlxuICAgICAqICAgcmF0ZShpZCkgLT4gUmV0dXJucyB0aGUgc291bmQgaWQncyBjdXJyZW50IHBsYXliYWNrIHJhdGUuXG4gICAgICogICByYXRlKHJhdGUpIC0+IFNldHMgdGhlIHBsYXliYWNrIHJhdGUgb2YgYWxsIHNvdW5kcyBpbiB0aGlzIEhvd2wgZ3JvdXAuXG4gICAgICogICByYXRlKHJhdGUsIGlkKSAtPiBTZXRzIHRoZSBwbGF5YmFjayByYXRlIG9mIHBhc3NlZCBzb3VuZCBpZC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsL051bWJlcn0gUmV0dXJucyBzZWxmIG9yIHRoZSBjdXJyZW50IHBsYXliYWNrIHJhdGUuXG4gICAgICovXG4gICAgcmF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHZhciByYXRlLCBpZDtcblxuICAgICAgLy8gRGV0ZXJtaW5lIHRoZSB2YWx1ZXMgYmFzZWQgb24gYXJndW1lbnRzLlxuICAgICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIC8vIFdlIHdpbGwgc2ltcGx5IHJldHVybiB0aGUgY3VycmVudCByYXRlIG9mIHRoZSBmaXJzdCBub2RlLlxuICAgICAgICBpZCA9IHNlbGYuX3NvdW5kc1swXS5faWQ7XG4gICAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIC8vIEZpcnN0IGNoZWNrIGlmIHRoaXMgaXMgYW4gSUQsIGFuZCBpZiBub3QsIGFzc3VtZSBpdCBpcyBhIG5ldyByYXRlIHZhbHVlLlxuICAgICAgICB2YXIgaWRzID0gc2VsZi5fZ2V0U291bmRJZHMoKTtcbiAgICAgICAgdmFyIGluZGV4ID0gaWRzLmluZGV4T2YoYXJnc1swXSk7XG4gICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgaWQgPSBwYXJzZUludChhcmdzWzBdLCAxMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmF0ZSA9IHBhcnNlRmxvYXQoYXJnc1swXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYXJncy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgcmF0ZSA9IHBhcnNlRmxvYXQoYXJnc1swXSk7XG4gICAgICAgIGlkID0gcGFyc2VJbnQoYXJnc1sxXSwgMTApO1xuICAgICAgfVxuXG4gICAgICAvLyBVcGRhdGUgdGhlIHBsYXliYWNrIHJhdGUgb3IgcmV0dXJuIHRoZSBjdXJyZW50IHZhbHVlLlxuICAgICAgdmFyIHNvdW5kO1xuICAgICAgaWYgKHR5cGVvZiByYXRlID09PSAnbnVtYmVyJykge1xuICAgICAgICAvLyBJZiB0aGUgc291bmQgaGFzbid0IGxvYWRlZCwgYWRkIGl0IHRvIHRoZSBsb2FkIHF1ZXVlIHRvIGNoYW5nZSBwbGF5YmFjayByYXRlIHdoZW4gY2FwYWJsZS5cbiAgICAgICAgaWYgKHNlbGYuX3N0YXRlICE9PSAnbG9hZGVkJykge1xuICAgICAgICAgIHNlbGYuX3F1ZXVlLnB1c2goe1xuICAgICAgICAgICAgZXZlbnQ6ICdyYXRlJyxcbiAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHNlbGYucmF0ZS5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU2V0IHRoZSBncm91cCByYXRlLlxuICAgICAgICBpZiAodHlwZW9mIGlkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHNlbGYuX3JhdGUgPSByYXRlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVXBkYXRlIG9uZSBvciBhbGwgdm9sdW1lcy5cbiAgICAgICAgaWQgPSBzZWxmLl9nZXRTb3VuZElkcyhpZCk7XG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxpZC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIC8vIEdldCB0aGUgc291bmQuXG4gICAgICAgICAgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWRbaV0pO1xuXG4gICAgICAgICAgaWYgKHNvdW5kKSB7XG4gICAgICAgICAgICAvLyBLZWVwIHRyYWNrIG9mIG91ciBwb3NpdGlvbiB3aGVuIHRoZSByYXRlIGNoYW5nZWQgYW5kIHVwZGF0ZSB0aGUgcGxheWJhY2tcbiAgICAgICAgICAgIC8vIHN0YXJ0IHBvc2l0aW9uIHNvIHdlIGNhbiBwcm9wZXJseSBhZGp1c3QgdGhlIHNlZWsgcG9zaXRpb24gZm9yIHRpbWUgZWxhcHNlZC5cbiAgICAgICAgICAgIHNvdW5kLl9yYXRlU2VlayA9IHNlbGYuc2VlayhpZFtpXSk7XG4gICAgICAgICAgICBzb3VuZC5fcGxheVN0YXJ0ID0gc2VsZi5fd2ViQXVkaW8gPyBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lIDogc291bmQuX3BsYXlTdGFydDtcbiAgICAgICAgICAgIHNvdW5kLl9yYXRlID0gcmF0ZTtcblxuICAgICAgICAgICAgLy8gQ2hhbmdlIHRoZSBwbGF5YmFjayByYXRlLlxuICAgICAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvICYmIHNvdW5kLl9ub2RlICYmIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZSkge1xuICAgICAgICAgICAgICBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UucGxheWJhY2tSYXRlLnZhbHVlID0gcmF0ZTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoc291bmQuX25vZGUpIHtcbiAgICAgICAgICAgICAgc291bmQuX25vZGUucGxheWJhY2tSYXRlID0gcmF0ZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gUmVzZXQgdGhlIHRpbWVycy5cbiAgICAgICAgICAgIHZhciBzZWVrID0gc2VsZi5zZWVrKGlkW2ldKTtcbiAgICAgICAgICAgIHZhciBkdXJhdGlvbiA9ICgoc2VsZi5fc3ByaXRlW3NvdW5kLl9zcHJpdGVdWzBdICsgc2VsZi5fc3ByaXRlW3NvdW5kLl9zcHJpdGVdWzFdKSAvIDEwMDApIC0gc2VlaztcbiAgICAgICAgICAgIHZhciB0aW1lb3V0ID0gKGR1cmF0aW9uICogMTAwMCkgLyBNYXRoLmFicyhzb3VuZC5fcmF0ZSk7XG5cbiAgICAgICAgICAgIC8vIFN0YXJ0IGEgbmV3IGVuZCB0aW1lciBpZiBzb3VuZCBpcyBhbHJlYWR5IHBsYXlpbmcuXG4gICAgICAgICAgICBpZiAoc2VsZi5fZW5kVGltZXJzW2lkW2ldXSB8fCAhc291bmQuX3BhdXNlZCkge1xuICAgICAgICAgICAgICBzZWxmLl9jbGVhclRpbWVyKGlkW2ldKTtcbiAgICAgICAgICAgICAgc2VsZi5fZW5kVGltZXJzW2lkW2ldXSA9IHNldFRpbWVvdXQoc2VsZi5fZW5kZWQuYmluZChzZWxmLCBzb3VuZCksIHRpbWVvdXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLl9lbWl0KCdyYXRlJywgc291bmQuX2lkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKGlkKTtcbiAgICAgICAgcmV0dXJuIHNvdW5kID8gc291bmQuX3JhdGUgOiBzZWxmLl9yYXRlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0L3NldCB0aGUgc2VlayBwb3NpdGlvbiBvZiBhIHNvdW5kLiBUaGlzIG1ldGhvZCBjYW4gb3B0aW9uYWxseSB0YWtlIDAsIDEgb3IgMiBhcmd1bWVudHMuXG4gICAgICogICBzZWVrKCkgLT4gUmV0dXJucyB0aGUgZmlyc3Qgc291bmQgbm9kZSdzIGN1cnJlbnQgc2VlayBwb3NpdGlvbi5cbiAgICAgKiAgIHNlZWsoaWQpIC0+IFJldHVybnMgdGhlIHNvdW5kIGlkJ3MgY3VycmVudCBzZWVrIHBvc2l0aW9uLlxuICAgICAqICAgc2VlayhzZWVrKSAtPiBTZXRzIHRoZSBzZWVrIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBzb3VuZCBub2RlLlxuICAgICAqICAgc2VlayhzZWVrLCBpZCkgLT4gU2V0cyB0aGUgc2VlayBwb3NpdGlvbiBvZiBwYXNzZWQgc291bmQgaWQuXG4gICAgICogQHJldHVybiB7SG93bC9OdW1iZXJ9IFJldHVybnMgc2VsZiBvciB0aGUgY3VycmVudCBzZWVrIHBvc2l0aW9uLlxuICAgICAqL1xuICAgIHNlZWs6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB2YXIgc2VlaywgaWQ7XG5cbiAgICAgIC8vIERldGVybWluZSB0aGUgdmFsdWVzIGJhc2VkIG9uIGFyZ3VtZW50cy5cbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAvLyBXZSB3aWxsIHNpbXBseSByZXR1cm4gdGhlIGN1cnJlbnQgcG9zaXRpb24gb2YgdGhlIGZpcnN0IG5vZGUuXG4gICAgICAgIGlkID0gc2VsZi5fc291bmRzWzBdLl9pZDtcbiAgICAgIH0gZWxzZSBpZiAoYXJncy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgLy8gRmlyc3QgY2hlY2sgaWYgdGhpcyBpcyBhbiBJRCwgYW5kIGlmIG5vdCwgYXNzdW1lIGl0IGlzIGEgbmV3IHNlZWsgcG9zaXRpb24uXG4gICAgICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcygpO1xuICAgICAgICB2YXIgaW5kZXggPSBpZHMuaW5kZXhPZihhcmdzWzBdKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBpZCA9IHBhcnNlSW50KGFyZ3NbMF0sIDEwKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZCA9IHNlbGYuX3NvdW5kc1swXS5faWQ7XG4gICAgICAgICAgc2VlayA9IHBhcnNlRmxvYXQoYXJnc1swXSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoYXJncy5sZW5ndGggPT09IDIpIHtcbiAgICAgICAgc2VlayA9IHBhcnNlRmxvYXQoYXJnc1swXSk7XG4gICAgICAgIGlkID0gcGFyc2VJbnQoYXJnc1sxXSwgMTApO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB0aGVyZSBpcyBubyBJRCwgYmFpbCBvdXQuXG4gICAgICBpZiAodHlwZW9mIGlkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIHNvdW5kIGhhc24ndCBsb2FkZWQsIGFkZCBpdCB0byB0aGUgbG9hZCBxdWV1ZSB0byBzZWVrIHdoZW4gY2FwYWJsZS5cbiAgICAgIGlmIChzZWxmLl9zdGF0ZSAhPT0gJ2xvYWRlZCcpIHtcbiAgICAgICAgc2VsZi5fcXVldWUucHVzaCh7XG4gICAgICAgICAgZXZlbnQ6ICdzZWVrJyxcbiAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5zZWVrLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCB0aGUgc291bmQuXG4gICAgICB2YXIgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWQpO1xuXG4gICAgICBpZiAoc291bmQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBzZWVrID09PSAnbnVtYmVyJyAmJiBzZWVrID49IDApIHtcbiAgICAgICAgICAvLyBQYXVzZSB0aGUgc291bmQgYW5kIHVwZGF0ZSBwb3NpdGlvbiBmb3IgcmVzdGFydGluZyBwbGF5YmFjay5cbiAgICAgICAgICB2YXIgcGxheWluZyA9IHNlbGYucGxheWluZyhpZCk7XG4gICAgICAgICAgaWYgKHBsYXlpbmcpIHtcbiAgICAgICAgICAgIHNlbGYucGF1c2UoaWQsIHRydWUpO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIE1vdmUgdGhlIHBvc2l0aW9uIG9mIHRoZSB0cmFjayBhbmQgY2FuY2VsIHRpbWVyLlxuICAgICAgICAgIHNvdW5kLl9zZWVrID0gc2VlaztcbiAgICAgICAgICBzb3VuZC5fZW5kZWQgPSBmYWxzZTtcbiAgICAgICAgICBzZWxmLl9jbGVhclRpbWVyKGlkKTtcblxuICAgICAgICAgIC8vIFJlc3RhcnQgdGhlIHBsYXliYWNrIGlmIHRoZSBzb3VuZCB3YXMgcGxheWluZy5cbiAgICAgICAgICBpZiAocGxheWluZykge1xuICAgICAgICAgICAgc2VsZi5wbGF5KGlkLCB0cnVlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBVcGRhdGUgdGhlIHNlZWsgcG9zaXRpb24gZm9yIEhUTUw1IEF1ZGlvLlxuICAgICAgICAgIGlmICghc2VsZi5fd2ViQXVkaW8gJiYgc291bmQuX25vZGUpIHtcbiAgICAgICAgICAgIHNvdW5kLl9ub2RlLmN1cnJlbnRUaW1lID0gc2VlaztcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9lbWl0KCdzZWVrJywgaWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICAgICAgdmFyIHJlYWxUaW1lID0gc2VsZi5wbGF5aW5nKGlkKSA/IEhvd2xlci5jdHguY3VycmVudFRpbWUgLSBzb3VuZC5fcGxheVN0YXJ0IDogMDtcbiAgICAgICAgICAgIHZhciByYXRlU2VlayA9IHNvdW5kLl9yYXRlU2VlayA/IHNvdW5kLl9yYXRlU2VlayAtIHNvdW5kLl9zZWVrIDogMDtcbiAgICAgICAgICAgIHJldHVybiBzb3VuZC5fc2VlayArIChyYXRlU2VlayArIHJlYWxUaW1lICogTWF0aC5hYnMoc291bmQuX3JhdGUpKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHNvdW5kLl9ub2RlLmN1cnJlbnRUaW1lO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYSBzcGVjaWZpYyBzb3VuZCBpcyBjdXJyZW50bHkgcGxheWluZyBvciBub3QgKGlmIGlkIGlzIHByb3ZpZGVkKSwgb3IgY2hlY2sgaWYgYXQgbGVhc3Qgb25lIG9mIHRoZSBzb3VuZHMgaW4gdGhlIGdyb3VwIGlzIHBsYXlpbmcgb3Igbm90LlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gIGlkIFRoZSBzb3VuZCBpZCB0byBjaGVjay4gSWYgbm9uZSBpcyBwYXNzZWQsIHRoZSB3aG9sZSBzb3VuZCBncm91cCBpcyBjaGVja2VkLlxuICAgICAqIEByZXR1cm4ge0Jvb2xlYW59IFRydWUgaWYgcGxheWluZyBhbmQgZmFsc2UgaWYgbm90LlxuICAgICAqL1xuICAgIHBsYXlpbmc6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIENoZWNrIHRoZSBwYXNzZWQgc291bmQgSUQgKGlmIGFueSkuXG4gICAgICBpZiAodHlwZW9mIGlkID09PSAnbnVtYmVyJykge1xuICAgICAgICB2YXIgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWQpO1xuICAgICAgICByZXR1cm4gc291bmQgPyAhc291bmQuX3BhdXNlZCA6IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICAvLyBPdGhlcndpc2UsIGxvb3AgdGhyb3VnaCBhbGwgc291bmRzIGFuZCBjaGVjayBpZiBhbnkgYXJlIHBsYXlpbmcuXG4gICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5fc291bmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICghc2VsZi5fc291bmRzW2ldLl9wYXVzZWQpIHtcbiAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZHVyYXRpb24gb2YgdGhpcyBzb3VuZC4gUGFzc2luZyBhIHNvdW5kIGlkIHdpbGwgcmV0dXJuIHRoZSBzcHJpdGUgZHVyYXRpb24uXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBpZCBUaGUgc291bmQgaWQgdG8gY2hlY2suIElmIG5vbmUgaXMgcGFzc2VkLCByZXR1cm4gZnVsbCBzb3VyY2UgZHVyYXRpb24uXG4gICAgICogQHJldHVybiB7TnVtYmVyfSBBdWRpbyBkdXJhdGlvbiBpbiBzZWNvbmRzLlxuICAgICAqL1xuICAgIGR1cmF0aW9uOiBmdW5jdGlvbihpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGR1cmF0aW9uID0gc2VsZi5fZHVyYXRpb247XG5cbiAgICAgIC8vIElmIHdlIHBhc3MgYW4gSUQsIGdldCB0aGUgc291bmQgYW5kIHJldHVybiB0aGUgc3ByaXRlIGxlbmd0aC5cbiAgICAgIHZhciBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZCk7XG4gICAgICBpZiAoc291bmQpIHtcbiAgICAgICAgZHVyYXRpb24gPSBzZWxmLl9zcHJpdGVbc291bmQuX3Nwcml0ZV1bMV0gLyAxMDAwO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gZHVyYXRpb247XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIGN1cnJlbnQgbG9hZGVkIHN0YXRlIG9mIHRoaXMgSG93bC5cbiAgICAgKiBAcmV0dXJuIHtTdHJpbmd9ICd1bmxvYWRlZCcsICdsb2FkaW5nJywgJ2xvYWRlZCdcbiAgICAgKi9cbiAgICBzdGF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdGhpcy5fc3RhdGU7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVubG9hZCBhbmQgZGVzdHJveSB0aGUgY3VycmVudCBIb3dsIG9iamVjdC5cbiAgICAgKiBUaGlzIHdpbGwgaW1tZWRpYXRlbHkgc3RvcCBhbGwgc291bmQgaW5zdGFuY2VzIGF0dGFjaGVkIHRvIHRoaXMgZ3JvdXAuXG4gICAgICovXG4gICAgdW5sb2FkOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gU3RvcCBwbGF5aW5nIGFueSBhY3RpdmUgc291bmRzLlxuICAgICAgdmFyIHNvdW5kcyA9IHNlbGYuX3NvdW5kcztcbiAgICAgIGZvciAodmFyIGk9MDsgaTxzb3VuZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gU3RvcCB0aGUgc291bmQgaWYgaXQgaXMgY3VycmVudGx5IHBsYXlpbmcuXG4gICAgICAgIGlmICghc291bmRzW2ldLl9wYXVzZWQpIHtcbiAgICAgICAgICBzZWxmLnN0b3Aoc291bmRzW2ldLl9pZCk7XG4gICAgICAgICAgc2VsZi5fZW1pdCgnZW5kJywgc291bmRzW2ldLl9pZCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZW1vdmUgdGhlIHNvdXJjZSBvciBkaXNjb25uZWN0LlxuICAgICAgICBpZiAoIXNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgLy8gU2V0IHRoZSBzb3VyY2UgdG8gMC1zZWNvbmQgc2lsZW5jZSB0byBzdG9wIGFueSBkb3dubG9hZGluZy5cbiAgICAgICAgICBzb3VuZHNbaV0uX25vZGUuc3JjID0gJ2RhdGE6YXVkaW8vd2F2O2Jhc2U2NCxVa2xHUmlRQUFBQlhRVlpGWm0xMElCQUFBQUFCQUFFQVJLd0FBSWhZQVFBQ0FCQUFaR0YwWVFBQUFBQT0nO1xuXG4gICAgICAgICAgLy8gUmVtb3ZlIGFueSBldmVudCBsaXN0ZW5lcnMuXG4gICAgICAgICAgc291bmRzW2ldLl9ub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgc291bmRzW2ldLl9lcnJvckZuLCBmYWxzZSk7XG4gICAgICAgICAgc291bmRzW2ldLl9ub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoSG93bGVyLl9jYW5QbGF5RXZlbnQsIHNvdW5kc1tpXS5fbG9hZEZuLCBmYWxzZSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFbXB0eSBvdXQgYWxsIG9mIHRoZSBub2Rlcy5cbiAgICAgICAgZGVsZXRlIHNvdW5kc1tpXS5fbm9kZTtcblxuICAgICAgICAvLyBNYWtlIHN1cmUgYWxsIHRpbWVycyBhcmUgY2xlYXJlZCBvdXQuXG4gICAgICAgIHNlbGYuX2NsZWFyVGltZXIoc291bmRzW2ldLl9pZCk7XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSByZWZlcmVuY2VzIGluIHRoZSBnbG9iYWwgSG93bGVyIG9iamVjdC5cbiAgICAgICAgdmFyIGluZGV4ID0gSG93bGVyLl9ob3dscy5pbmRleE9mKHNlbGYpO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgIEhvd2xlci5faG93bHMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBEZWxldGUgdGhpcyBzb3VuZCBmcm9tIHRoZSBjYWNoZSAoaWYgbm8gb3RoZXIgSG93bCBpcyB1c2luZyBpdCkuXG4gICAgICB2YXIgcmVtQ2FjaGUgPSB0cnVlO1xuICAgICAgZm9yIChpPTA7IGk8SG93bGVyLl9ob3dscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoSG93bGVyLl9ob3dsc1tpXS5fc3JjID09PSBzZWxmLl9zcmMpIHtcbiAgICAgICAgICByZW1DYWNoZSA9IGZhbHNlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChjYWNoZSAmJiByZW1DYWNoZSkge1xuICAgICAgICBkZWxldGUgY2FjaGVbc2VsZi5fc3JjXTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2xlYXIgZ2xvYmFsIGVycm9ycy5cbiAgICAgIEhvd2xlci5ub0F1ZGlvID0gZmFsc2U7XG5cbiAgICAgIC8vIENsZWFyIG91dCBgc2VsZmAuXG4gICAgICBzZWxmLl9zdGF0ZSA9ICd1bmxvYWRlZCc7XG4gICAgICBzZWxmLl9zb3VuZHMgPSBbXTtcbiAgICAgIHNlbGYgPSBudWxsO1xuXG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTGlzdGVuIHRvIGEgY3VzdG9tIGV2ZW50LlxuICAgICAqIEBwYXJhbSAge1N0cmluZ30gICBldmVudCBFdmVudCBuYW1lLlxuICAgICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBmbiAgICBMaXN0ZW5lciB0byBjYWxsLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gICBpZCAgICAob3B0aW9uYWwpIE9ubHkgbGlzdGVuIHRvIGV2ZW50cyBmb3IgdGhpcyBzb3VuZC5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9ICAgb25jZSAgKElOVEVSTkFMKSBNYXJrcyBldmVudCB0byBmaXJlIG9ubHkgb25jZS5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIG9uOiBmdW5jdGlvbihldmVudCwgZm4sIGlkLCBvbmNlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgZXZlbnRzID0gc2VsZlsnX29uJyArIGV2ZW50XTtcblxuICAgICAgaWYgKHR5cGVvZiBmbiA9PT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICBldmVudHMucHVzaChvbmNlID8ge2lkOiBpZCwgZm46IGZuLCBvbmNlOiBvbmNlfSA6IHtpZDogaWQsIGZuOiBmbn0pO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlIGEgY3VzdG9tIGV2ZW50LiBDYWxsIHdpdGhvdXQgcGFyYW1ldGVycyB0byByZW1vdmUgYWxsIGV2ZW50cy5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgZXZlbnQgRXZlbnQgbmFtZS5cbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gZm4gICAgTGlzdGVuZXIgdG8gcmVtb3ZlLiBMZWF2ZSBlbXB0eSB0byByZW1vdmUgYWxsLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gICBpZCAgICAob3B0aW9uYWwpIE9ubHkgcmVtb3ZlIGV2ZW50cyBmb3IgdGhpcyBzb3VuZC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIG9mZjogZnVuY3Rpb24oZXZlbnQsIGZuLCBpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGV2ZW50cyA9IHNlbGZbJ19vbicgKyBldmVudF07XG4gICAgICB2YXIgaSA9IDA7XG5cbiAgICAgIGlmIChmbikge1xuICAgICAgICAvLyBMb29wIHRocm91Z2ggZXZlbnQgc3RvcmUgYW5kIHJlbW92ZSB0aGUgcGFzc2VkIGZ1bmN0aW9uLlxuICAgICAgICBmb3IgKGk9MDsgaTxldmVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoZm4gPT09IGV2ZW50c1tpXS5mbiAmJiBpZCA9PT0gZXZlbnRzW2ldLmlkKSB7XG4gICAgICAgICAgICBldmVudHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGV2ZW50KSB7XG4gICAgICAgIC8vIENsZWFyIG91dCBhbGwgZXZlbnRzIG9mIHRoaXMgdHlwZS5cbiAgICAgICAgc2VsZlsnX29uJyArIGV2ZW50XSA9IFtdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gQ2xlYXIgb3V0IGFsbCBldmVudHMgb2YgZXZlcnkgdHlwZS5cbiAgICAgICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhzZWxmKTtcbiAgICAgICAgZm9yIChpPTA7IGk8a2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICgoa2V5c1tpXS5pbmRleE9mKCdfb24nKSA9PT0gMCkgJiYgQXJyYXkuaXNBcnJheShzZWxmW2tleXNbaV1dKSkge1xuICAgICAgICAgICAgc2VsZltrZXlzW2ldXSA9IFtdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogTGlzdGVuIHRvIGEgY3VzdG9tIGV2ZW50IGFuZCByZW1vdmUgaXQgb25jZSBmaXJlZC5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgZXZlbnQgRXZlbnQgbmFtZS5cbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gZm4gICAgTGlzdGVuZXIgdG8gY2FsbC5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9ICAgaWQgICAgKG9wdGlvbmFsKSBPbmx5IGxpc3RlbiB0byBldmVudHMgZm9yIHRoaXMgc291bmQuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBvbmNlOiBmdW5jdGlvbihldmVudCwgZm4sIGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIFNldHVwIHRoZSBldmVudCBsaXN0ZW5lci5cbiAgICAgIHNlbGYub24oZXZlbnQsIGZuLCBpZCwgMSk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBFbWl0IGFsbCBldmVudHMgb2YgYSBzcGVjaWZpYyB0eXBlIGFuZCBwYXNzIHRoZSBzb3VuZCBpZC5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGV2ZW50IEV2ZW50IG5hbWUuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBpZCAgICBTb3VuZCBJRC5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IG1zZyAgIE1lc3NhZ2UgdG8gZ28gd2l0aCBldmVudC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIF9lbWl0OiBmdW5jdGlvbihldmVudCwgaWQsIG1zZykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGV2ZW50cyA9IHNlbGZbJ19vbicgKyBldmVudF07XG5cbiAgICAgIC8vIExvb3AgdGhyb3VnaCBldmVudCBzdG9yZSBhbmQgZmlyZSBhbGwgZnVuY3Rpb25zLlxuICAgICAgZm9yICh2YXIgaT1ldmVudHMubGVuZ3RoLTE7IGk+PTA7IGktLSkge1xuICAgICAgICBpZiAoIWV2ZW50c1tpXS5pZCB8fCBldmVudHNbaV0uaWQgPT09IGlkIHx8IGV2ZW50ID09PSAnbG9hZCcpIHtcbiAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKGZuKSB7XG4gICAgICAgICAgICBmbi5jYWxsKHRoaXMsIGlkLCBtc2cpO1xuICAgICAgICAgIH0uYmluZChzZWxmLCBldmVudHNbaV0uZm4pLCAwKTtcblxuICAgICAgICAgIC8vIElmIHRoaXMgZXZlbnQgd2FzIHNldHVwIHdpdGggYG9uY2VgLCByZW1vdmUgaXQuXG4gICAgICAgICAgaWYgKGV2ZW50c1tpXS5vbmNlKSB7XG4gICAgICAgICAgICBzZWxmLm9mZihldmVudCwgZXZlbnRzW2ldLmZuLCBldmVudHNbaV0uaWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUXVldWUgb2YgYWN0aW9ucyBpbml0aWF0ZWQgYmVmb3JlIHRoZSBzb3VuZCBoYXMgbG9hZGVkLlxuICAgICAqIFRoZXNlIHdpbGwgYmUgY2FsbGVkIGluIHNlcXVlbmNlLCB3aXRoIHRoZSBuZXh0IG9ubHkgZmlyaW5nXG4gICAgICogYWZ0ZXIgdGhlIHByZXZpb3VzIGhhcyBmaW5pc2hlZCBleGVjdXRpbmcgKGV2ZW4gaWYgYXN5bmMgbGlrZSBwbGF5KS5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIF9sb2FkUXVldWU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoc2VsZi5fcXVldWUubGVuZ3RoID4gMCkge1xuICAgICAgICB2YXIgdGFzayA9IHNlbGYuX3F1ZXVlWzBdO1xuXG4gICAgICAgIC8vIGRvbid0IG1vdmUgb250byB0aGUgbmV4dCB0YXNrIHVudGlsIHRoaXMgb25lIGlzIGRvbmVcbiAgICAgICAgc2VsZi5vbmNlKHRhc2suZXZlbnQsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuX3F1ZXVlLnNoaWZ0KCk7XG4gICAgICAgICAgc2VsZi5fbG9hZFF1ZXVlKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRhc2suYWN0aW9uKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBGaXJlZCB3aGVuIHBsYXliYWNrIGVuZHMgYXQgdGhlIGVuZCBvZiB0aGUgZHVyYXRpb24uXG4gICAgICogQHBhcmFtICB7U291bmR9IHNvdW5kIFRoZSBzb3VuZCBvYmplY3QgdG8gd29yayB3aXRoLlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgX2VuZGVkOiBmdW5jdGlvbihzb3VuZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIHNwcml0ZSA9IHNvdW5kLl9zcHJpdGU7XG5cbiAgICAgIC8vIFNob3VsZCB0aGlzIHNvdW5kIGxvb3A/XG4gICAgICB2YXIgbG9vcCA9ICEhKHNvdW5kLl9sb29wIHx8IHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzJdKTtcblxuICAgICAgLy8gRmlyZSB0aGUgZW5kZWQgZXZlbnQuXG4gICAgICBzZWxmLl9lbWl0KCdlbmQnLCBzb3VuZC5faWQpO1xuXG4gICAgICAvLyBSZXN0YXJ0IHRoZSBwbGF5YmFjayBmb3IgSFRNTDUgQXVkaW8gbG9vcC5cbiAgICAgIGlmICghc2VsZi5fd2ViQXVkaW8gJiYgbG9vcCkge1xuICAgICAgICBzZWxmLnN0b3Aoc291bmQuX2lkLCB0cnVlKS5wbGF5KHNvdW5kLl9pZCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFJlc3RhcnQgdGhpcyB0aW1lciBpZiBvbiBhIFdlYiBBdWRpbyBsb29wLlxuICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvICYmIGxvb3ApIHtcbiAgICAgICAgc2VsZi5fZW1pdCgncGxheScsIHNvdW5kLl9pZCk7XG4gICAgICAgIHNvdW5kLl9zZWVrID0gc291bmQuX3N0YXJ0IHx8IDA7XG4gICAgICAgIHNvdW5kLl9yYXRlU2VlayA9IDA7XG4gICAgICAgIHNvdW5kLl9wbGF5U3RhcnQgPSBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lO1xuXG4gICAgICAgIHZhciB0aW1lb3V0ID0gKChzb3VuZC5fc3RvcCAtIHNvdW5kLl9zdGFydCkgKiAxMDAwKSAvIE1hdGguYWJzKHNvdW5kLl9yYXRlKTtcbiAgICAgICAgc2VsZi5fZW5kVGltZXJzW3NvdW5kLl9pZF0gPSBzZXRUaW1lb3V0KHNlbGYuX2VuZGVkLmJpbmQoc2VsZiwgc291bmQpLCB0aW1lb3V0KTtcbiAgICAgIH1cblxuICAgICAgLy8gTWFyayB0aGUgbm9kZSBhcyBwYXVzZWQuXG4gICAgICBpZiAoc2VsZi5fd2ViQXVkaW8gJiYgIWxvb3ApIHtcbiAgICAgICAgc291bmQuX3BhdXNlZCA9IHRydWU7XG4gICAgICAgIHNvdW5kLl9lbmRlZCA9IHRydWU7XG4gICAgICAgIHNvdW5kLl9zZWVrID0gc291bmQuX3N0YXJ0IHx8IDA7XG4gICAgICAgIHNvdW5kLl9yYXRlU2VlayA9IDA7XG4gICAgICAgIHNlbGYuX2NsZWFyVGltZXIoc291bmQuX2lkKTtcblxuICAgICAgICAvLyBDbGVhbiB1cCB0aGUgYnVmZmVyIHNvdXJjZS5cbiAgICAgICAgc2VsZi5fY2xlYW5CdWZmZXIoc291bmQuX25vZGUpO1xuXG4gICAgICAgIC8vIEF0dGVtcHQgdG8gYXV0by1zdXNwZW5kIEF1ZGlvQ29udGV4dCBpZiBubyBzb3VuZHMgYXJlIHN0aWxsIHBsYXlpbmcuXG4gICAgICAgIEhvd2xlci5fYXV0b1N1c3BlbmQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gV2hlbiB1c2luZyBhIHNwcml0ZSwgZW5kIHRoZSB0cmFjay5cbiAgICAgIGlmICghc2VsZi5fd2ViQXVkaW8gJiYgIWxvb3ApIHtcbiAgICAgICAgc2VsZi5zdG9wKHNvdW5kLl9pZCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDbGVhciB0aGUgZW5kIHRpbWVyIGZvciBhIHNvdW5kIHBsYXliYWNrLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaWQgVGhlIHNvdW5kIElELlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgX2NsZWFyVGltZXI6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmIChzZWxmLl9lbmRUaW1lcnNbaWRdKSB7XG4gICAgICAgIGNsZWFyVGltZW91dChzZWxmLl9lbmRUaW1lcnNbaWRdKTtcbiAgICAgICAgZGVsZXRlIHNlbGYuX2VuZFRpbWVyc1tpZF07XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIHNvdW5kIGlkZW50aWZpZWQgYnkgdGhpcyBJRCwgb3IgcmV0dXJuIG51bGwuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBpZCBTb3VuZCBJRFxuICAgICAqIEByZXR1cm4ge09iamVjdH0gICAgU291bmQgb2JqZWN0IG9yIG51bGwuXG4gICAgICovXG4gICAgX3NvdW5kQnlJZDogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gTG9vcCB0aHJvdWdoIGFsbCBzb3VuZHMgYW5kIGZpbmQgdGhlIG9uZSB3aXRoIHRoaXMgSUQuXG4gICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5fc291bmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChpZCA9PT0gc2VsZi5fc291bmRzW2ldLl9pZCkge1xuICAgICAgICAgIHJldHVybiBzZWxmLl9zb3VuZHNbaV07XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJldHVybiBhbiBpbmFjdGl2ZSBzb3VuZCBmcm9tIHRoZSBwb29sIG9yIGNyZWF0ZSBhIG5ldyBvbmUuXG4gICAgICogQHJldHVybiB7U291bmR9IFNvdW5kIHBsYXliYWNrIG9iamVjdC5cbiAgICAgKi9cbiAgICBfaW5hY3RpdmVTb3VuZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIHNlbGYuX2RyYWluKCk7XG5cbiAgICAgIC8vIEZpbmQgdGhlIGZpcnN0IGluYWN0aXZlIG5vZGUgdG8gcmVjeWNsZS5cbiAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9zb3VuZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHNlbGYuX3NvdW5kc1tpXS5fZW5kZWQpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5fc291bmRzW2ldLnJlc2V0KCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gSWYgbm8gaW5hY3RpdmUgbm9kZSB3YXMgZm91bmQsIGNyZWF0ZSBhIG5ldyBvbmUuXG4gICAgICByZXR1cm4gbmV3IFNvdW5kKHNlbGYpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBEcmFpbiBleGNlc3MgaW5hY3RpdmUgc291bmRzIGZyb20gdGhlIHBvb2wuXG4gICAgICovXG4gICAgX2RyYWluOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBsaW1pdCA9IHNlbGYuX3Bvb2w7XG4gICAgICB2YXIgY250ID0gMDtcbiAgICAgIHZhciBpID0gMDtcblxuICAgICAgLy8gSWYgdGhlcmUgYXJlIGxlc3Mgc291bmRzIHRoYW4gdGhlIG1heCBwb29sIHNpemUsIHdlIGFyZSBkb25lLlxuICAgICAgaWYgKHNlbGYuX3NvdW5kcy5sZW5ndGggPCBsaW1pdCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIENvdW50IHRoZSBudW1iZXIgb2YgaW5hY3RpdmUgc291bmRzLlxuICAgICAgZm9yIChpPTA7IGk8c2VsZi5fc291bmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9zb3VuZHNbaV0uX2VuZGVkKSB7XG4gICAgICAgICAgY250Kys7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gUmVtb3ZlIGV4Y2VzcyBpbmFjdGl2ZSBzb3VuZHMsIGdvaW5nIGluIHJldmVyc2Ugb3JkZXIuXG4gICAgICBmb3IgKGk9c2VsZi5fc291bmRzLmxlbmd0aCAtIDE7IGk+PTA7IGktLSkge1xuICAgICAgICBpZiAoY250IDw9IGxpbWl0KSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHNlbGYuX3NvdW5kc1tpXS5fZW5kZWQpIHtcbiAgICAgICAgICAvLyBEaXNjb25uZWN0IHRoZSBhdWRpbyBzb3VyY2Ugd2hlbiB1c2luZyBXZWIgQXVkaW8uXG4gICAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvICYmIHNlbGYuX3NvdW5kc1tpXS5fbm9kZSkge1xuICAgICAgICAgICAgc2VsZi5fc291bmRzW2ldLl9ub2RlLmRpc2Nvbm5lY3QoMCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gUmVtb3ZlIHNvdW5kcyB1bnRpbCB3ZSBoYXZlIHRoZSBwb29sIHNpemUuXG4gICAgICAgICAgc2VsZi5fc291bmRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICBjbnQtLTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgYWxsIElEJ3MgZnJvbSB0aGUgc291bmRzIHBvb2wuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBpZCBPbmx5IHJldHVybiBvbmUgSUQgaWYgb25lIGlzIHBhc3NlZC5cbiAgICAgKiBAcmV0dXJuIHtBcnJheX0gICAgQXJyYXkgb2YgSURzLlxuICAgICAqL1xuICAgIF9nZXRTb3VuZElkczogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdmFyIGlkcyA9IFtdO1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5fc291bmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWRzLnB1c2goc2VsZi5fc291bmRzW2ldLl9pZCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gaWRzO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIFtpZF07XG4gICAgICB9XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExvYWQgdGhlIHNvdW5kIGJhY2sgaW50byB0aGUgYnVmZmVyIHNvdXJjZS5cbiAgICAgKiBAcGFyYW0gIHtTb3VuZH0gc291bmQgVGhlIHNvdW5kIG9iamVjdCB0byB3b3JrIHdpdGguXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBfcmVmcmVzaEJ1ZmZlcjogZnVuY3Rpb24oc291bmQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gU2V0dXAgdGhlIGJ1ZmZlciBzb3VyY2UgZm9yIHBsYXliYWNrLlxuICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlID0gSG93bGVyLmN0eC5jcmVhdGVCdWZmZXJTb3VyY2UoKTtcbiAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5idWZmZXIgPSBjYWNoZVtzZWxmLl9zcmNdO1xuXG4gICAgICAvLyBDb25uZWN0IHRvIHRoZSBjb3JyZWN0IG5vZGUuXG4gICAgICBpZiAoc291bmQuX3Bhbm5lcikge1xuICAgICAgICBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UuY29ubmVjdChzb3VuZC5fcGFubmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5jb25uZWN0KHNvdW5kLl9ub2RlKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2V0dXAgbG9vcGluZyBhbmQgcGxheWJhY2sgcmF0ZS5cbiAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5sb29wID0gc291bmQuX2xvb3A7XG4gICAgICBpZiAoc291bmQuX2xvb3ApIHtcbiAgICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlLmxvb3BTdGFydCA9IHNvdW5kLl9zdGFydCB8fCAwO1xuICAgICAgICBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UubG9vcEVuZCA9IHNvdW5kLl9zdG9wO1xuICAgICAgfVxuICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHNvdW5kLl9yYXRlO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUHJldmVudCBtZW1vcnkgbGVha3MgYnkgY2xlYW5pbmcgdXAgdGhlIGJ1ZmZlciBzb3VyY2UgYWZ0ZXIgcGxheWJhY2suXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBub2RlIFNvdW5kJ3MgYXVkaW8gbm9kZSBjb250YWluaW5nIHRoZSBidWZmZXIgc291cmNlLlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgX2NsZWFuQnVmZmVyOiBmdW5jdGlvbihub2RlKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmIChzZWxmLl9zY3JhdGNoQnVmZmVyKSB7XG4gICAgICAgIG5vZGUuYnVmZmVyU291cmNlLm9uZW5kZWQgPSBudWxsO1xuICAgICAgICBub2RlLmJ1ZmZlclNvdXJjZS5kaXNjb25uZWN0KDApO1xuICAgICAgICB0cnkgeyBub2RlLmJ1ZmZlclNvdXJjZS5idWZmZXIgPSBzZWxmLl9zY3JhdGNoQnVmZmVyOyB9IGNhdGNoKGUpIHt9XG4gICAgICB9XG4gICAgICBub2RlLmJ1ZmZlclNvdXJjZSA9IG51bGw7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cbiAgfTtcblxuICAvKiogU2luZ2xlIFNvdW5kIE1ldGhvZHMgKiovXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIFNldHVwIHRoZSBzb3VuZCBvYmplY3QsIHdoaWNoIGVhY2ggbm9kZSBhdHRhY2hlZCB0byBhIEhvd2wgZ3JvdXAgaXMgY29udGFpbmVkIGluLlxuICAgKiBAcGFyYW0ge09iamVjdH0gaG93bCBUaGUgSG93bCBwYXJlbnQgZ3JvdXAuXG4gICAqL1xuICB2YXIgU291bmQgPSBmdW5jdGlvbihob3dsKSB7XG4gICAgdGhpcy5fcGFyZW50ID0gaG93bDtcbiAgICB0aGlzLmluaXQoKTtcbiAgfTtcbiAgU291bmQucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgYSBuZXcgU291bmQgb2JqZWN0LlxuICAgICAqIEByZXR1cm4ge1NvdW5kfVxuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIHBhcmVudCA9IHNlbGYuX3BhcmVudDtcblxuICAgICAgLy8gU2V0dXAgdGhlIGRlZmF1bHQgcGFyYW1ldGVycy5cbiAgICAgIHNlbGYuX211dGVkID0gcGFyZW50Ll9tdXRlZDtcbiAgICAgIHNlbGYuX2xvb3AgPSBwYXJlbnQuX2xvb3A7XG4gICAgICBzZWxmLl92b2x1bWUgPSBwYXJlbnQuX3ZvbHVtZTtcbiAgICAgIHNlbGYuX211dGVkID0gcGFyZW50Ll9tdXRlZDtcbiAgICAgIHNlbGYuX3JhdGUgPSBwYXJlbnQuX3JhdGU7XG4gICAgICBzZWxmLl9zZWVrID0gMDtcbiAgICAgIHNlbGYuX3BhdXNlZCA9IHRydWU7XG4gICAgICBzZWxmLl9lbmRlZCA9IHRydWU7XG4gICAgICBzZWxmLl9zcHJpdGUgPSAnX19kZWZhdWx0JztcblxuICAgICAgLy8gR2VuZXJhdGUgYSB1bmlxdWUgSUQgZm9yIHRoaXMgc291bmQuXG4gICAgICBzZWxmLl9pZCA9IE1hdGgucm91bmQoRGF0ZS5ub3coKSAqIE1hdGgucmFuZG9tKCkpO1xuXG4gICAgICAvLyBBZGQgaXRzZWxmIHRvIHRoZSBwYXJlbnQncyBwb29sLlxuICAgICAgcGFyZW50Ll9zb3VuZHMucHVzaChzZWxmKTtcblxuICAgICAgLy8gQ3JlYXRlIHRoZSBuZXcgbm9kZS5cbiAgICAgIHNlbGYuY3JlYXRlKCk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGUgYW5kIHNldHVwIGEgbmV3IHNvdW5kIG9iamVjdCwgd2hldGhlciBIVE1MNSBBdWRpbyBvciBXZWIgQXVkaW8uXG4gICAgICogQHJldHVybiB7U291bmR9XG4gICAgICovXG4gICAgY3JlYXRlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBwYXJlbnQgPSBzZWxmLl9wYXJlbnQ7XG4gICAgICB2YXIgdm9sdW1lID0gKEhvd2xlci5fbXV0ZWQgfHwgc2VsZi5fbXV0ZWQgfHwgc2VsZi5fcGFyZW50Ll9tdXRlZCkgPyAwIDogc2VsZi5fdm9sdW1lO1xuXG4gICAgICBpZiAocGFyZW50Ll93ZWJBdWRpbykge1xuICAgICAgICAvLyBDcmVhdGUgdGhlIGdhaW4gbm9kZSBmb3IgY29udHJvbGxpbmcgdm9sdW1lICh0aGUgc291cmNlIHdpbGwgY29ubmVjdCB0byB0aGlzKS5cbiAgICAgICAgc2VsZi5fbm9kZSA9ICh0eXBlb2YgSG93bGVyLmN0eC5jcmVhdGVHYWluID09PSAndW5kZWZpbmVkJykgPyBIb3dsZXIuY3R4LmNyZWF0ZUdhaW5Ob2RlKCkgOiBIb3dsZXIuY3R4LmNyZWF0ZUdhaW4oKTtcbiAgICAgICAgc2VsZi5fbm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKHZvbHVtZSwgSG93bGVyLmN0eC5jdXJyZW50VGltZSk7XG4gICAgICAgIHNlbGYuX25vZGUucGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5fbm9kZS5jb25uZWN0KEhvd2xlci5tYXN0ZXJHYWluKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNlbGYuX25vZGUgPSBuZXcgQXVkaW8oKTtcblxuICAgICAgICAvLyBMaXN0ZW4gZm9yIGVycm9ycyAoaHR0cDovL2Rldi53My5vcmcvaHRtbDUvc3BlYy1hdXRob3Itdmlldy9zcGVjLmh0bWwjbWVkaWFlcnJvcikuXG4gICAgICAgIHNlbGYuX2Vycm9yRm4gPSBzZWxmLl9lcnJvckxpc3RlbmVyLmJpbmQoc2VsZik7XG4gICAgICAgIHNlbGYuX25vZGUuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBzZWxmLl9lcnJvckZuLCBmYWxzZSk7XG5cbiAgICAgICAgLy8gTGlzdGVuIGZvciAnY2FucGxheXRocm91Z2gnIGV2ZW50IHRvIGxldCB1cyBrbm93IHRoZSBzb3VuZCBpcyByZWFkeS5cbiAgICAgICAgc2VsZi5fbG9hZEZuID0gc2VsZi5fbG9hZExpc3RlbmVyLmJpbmQoc2VsZik7XG4gICAgICAgIHNlbGYuX25vZGUuYWRkRXZlbnRMaXN0ZW5lcihIb3dsZXIuX2NhblBsYXlFdmVudCwgc2VsZi5fbG9hZEZuLCBmYWxzZSk7XG5cbiAgICAgICAgLy8gU2V0dXAgdGhlIG5ldyBhdWRpbyBub2RlLlxuICAgICAgICBzZWxmLl9ub2RlLnNyYyA9IHBhcmVudC5fc3JjO1xuICAgICAgICBzZWxmLl9ub2RlLnByZWxvYWQgPSAnYXV0byc7XG4gICAgICAgIHNlbGYuX25vZGUudm9sdW1lID0gdm9sdW1lICogSG93bGVyLnZvbHVtZSgpO1xuXG4gICAgICAgIC8vIEJlZ2luIGxvYWRpbmcgdGhlIHNvdXJjZS5cbiAgICAgICAgc2VsZi5fbm9kZS5sb2FkKCk7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXNldCB0aGUgcGFyYW1ldGVycyBvZiB0aGlzIHNvdW5kIHRvIHRoZSBvcmlnaW5hbCBzdGF0ZSAoZm9yIHJlY3ljbGUpLlxuICAgICAqIEByZXR1cm4ge1NvdW5kfVxuICAgICAqL1xuICAgIHJlc2V0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBwYXJlbnQgPSBzZWxmLl9wYXJlbnQ7XG5cbiAgICAgIC8vIFJlc2V0IGFsbCBvZiB0aGUgcGFyYW1ldGVycyBvZiB0aGlzIHNvdW5kLlxuICAgICAgc2VsZi5fbXV0ZWQgPSBwYXJlbnQuX211dGVkO1xuICAgICAgc2VsZi5fbG9vcCA9IHBhcmVudC5fbG9vcDtcbiAgICAgIHNlbGYuX3ZvbHVtZSA9IHBhcmVudC5fdm9sdW1lO1xuICAgICAgc2VsZi5fbXV0ZWQgPSBwYXJlbnQuX211dGVkO1xuICAgICAgc2VsZi5fcmF0ZSA9IHBhcmVudC5fcmF0ZTtcbiAgICAgIHNlbGYuX3NlZWsgPSAwO1xuICAgICAgc2VsZi5fcmF0ZVNlZWsgPSAwO1xuICAgICAgc2VsZi5fcGF1c2VkID0gdHJ1ZTtcbiAgICAgIHNlbGYuX2VuZGVkID0gdHJ1ZTtcbiAgICAgIHNlbGYuX3Nwcml0ZSA9ICdfX2RlZmF1bHQnO1xuXG4gICAgICAvLyBHZW5lcmF0ZSBhIG5ldyBJRCBzbyB0aGF0IGl0IGlzbid0IGNvbmZ1c2VkIHdpdGggdGhlIHByZXZpb3VzIHNvdW5kLlxuICAgICAgc2VsZi5faWQgPSBNYXRoLnJvdW5kKERhdGUubm93KCkgKiBNYXRoLnJhbmRvbSgpKTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEhUTUw1IEF1ZGlvIGVycm9yIGxpc3RlbmVyIGNhbGxiYWNrLlxuICAgICAqL1xuICAgIF9lcnJvckxpc3RlbmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gRmlyZSBhbiBlcnJvciBldmVudCBhbmQgcGFzcyBiYWNrIHRoZSBjb2RlLlxuICAgICAgc2VsZi5fcGFyZW50Ll9lbWl0KCdsb2FkZXJyb3InLCBzZWxmLl9pZCwgc2VsZi5fbm9kZS5lcnJvciA/IHNlbGYuX25vZGUuZXJyb3IuY29kZSA6IDApO1xuXG4gICAgICAvLyBDbGVhciB0aGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICBzZWxmLl9ub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgc2VsZi5fZXJyb3JMaXN0ZW5lciwgZmFsc2UpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIVE1MNSBBdWRpbyBjYW5wbGF5dGhyb3VnaCBsaXN0ZW5lciBjYWxsYmFjay5cbiAgICAgKi9cbiAgICBfbG9hZExpc3RlbmVyOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBwYXJlbnQgPSBzZWxmLl9wYXJlbnQ7XG5cbiAgICAgIC8vIFJvdW5kIHVwIHRoZSBkdXJhdGlvbiB0byBhY2NvdW50IGZvciB0aGUgbG93ZXIgcHJlY2lzaW9uIGluIEhUTUw1IEF1ZGlvLlxuICAgICAgcGFyZW50Ll9kdXJhdGlvbiA9IE1hdGguY2VpbChzZWxmLl9ub2RlLmR1cmF0aW9uICogMTApIC8gMTA7XG5cbiAgICAgIC8vIFNldHVwIGEgc3ByaXRlIGlmIG5vbmUgaXMgZGVmaW5lZC5cbiAgICAgIGlmIChPYmplY3Qua2V5cyhwYXJlbnQuX3Nwcml0ZSkubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHBhcmVudC5fc3ByaXRlID0ge19fZGVmYXVsdDogWzAsIHBhcmVudC5fZHVyYXRpb24gKiAxMDAwXX07XG4gICAgICB9XG5cbiAgICAgIGlmIChwYXJlbnQuX3N0YXRlICE9PSAnbG9hZGVkJykge1xuICAgICAgICBwYXJlbnQuX3N0YXRlID0gJ2xvYWRlZCc7XG4gICAgICAgIHBhcmVudC5fZW1pdCgnbG9hZCcpO1xuICAgICAgICBwYXJlbnQuX2xvYWRRdWV1ZSgpO1xuICAgICAgfVxuXG4gICAgICAvLyBDbGVhciB0aGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICBzZWxmLl9ub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIoSG93bGVyLl9jYW5QbGF5RXZlbnQsIHNlbGYuX2xvYWRGbiwgZmFsc2UpO1xuICAgIH1cbiAgfTtcblxuICAvKiogSGVscGVyIE1ldGhvZHMgKiovXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgdmFyIGNhY2hlID0ge307XG5cbiAgLyoqXG4gICAqIEJ1ZmZlciBhIHNvdW5kIGZyb20gVVJMLCBEYXRhIFVSSSBvciBjYWNoZSBhbmQgZGVjb2RlIHRvIGF1ZGlvIHNvdXJjZSAoV2ViIEF1ZGlvIEFQSSkuXG4gICAqIEBwYXJhbSAge0hvd2x9IHNlbGZcbiAgICovXG4gIHZhciBsb2FkQnVmZmVyID0gZnVuY3Rpb24oc2VsZikge1xuICAgIHZhciB1cmwgPSBzZWxmLl9zcmM7XG5cbiAgICAvLyBDaGVjayBpZiB0aGUgYnVmZmVyIGhhcyBhbHJlYWR5IGJlZW4gY2FjaGVkIGFuZCB1c2UgaXQgaW5zdGVhZC5cbiAgICBpZiAoY2FjaGVbdXJsXSkge1xuICAgICAgLy8gU2V0IHRoZSBkdXJhdGlvbiBmcm9tIHRoZSBjYWNoZS5cbiAgICAgIHNlbGYuX2R1cmF0aW9uID0gY2FjaGVbdXJsXS5kdXJhdGlvbjtcblxuICAgICAgLy8gTG9hZCB0aGUgc291bmQgaW50byB0aGlzIEhvd2wuXG4gICAgICBsb2FkU291bmQoc2VsZik7XG5cbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBpZiAoL15kYXRhOlteO10rO2Jhc2U2NCwvLnRlc3QodXJsKSkge1xuICAgICAgLy8gRGVjb2RlIHRoZSBiYXNlNjQgZGF0YSBVUkkgd2l0aG91dCBYSFIsIHNpbmNlIHNvbWUgYnJvd3NlcnMgZG9uJ3Qgc3VwcG9ydCBpdC5cbiAgICAgIHZhciBkYXRhID0gYXRvYih1cmwuc3BsaXQoJywnKVsxXSk7XG4gICAgICB2YXIgZGF0YVZpZXcgPSBuZXcgVWludDhBcnJheShkYXRhLmxlbmd0aCk7XG4gICAgICBmb3IgKHZhciBpPTA7IGk8ZGF0YS5sZW5ndGg7ICsraSkge1xuICAgICAgICBkYXRhVmlld1tpXSA9IGRhdGEuY2hhckNvZGVBdChpKTtcbiAgICAgIH1cblxuICAgICAgZGVjb2RlQXVkaW9EYXRhKGRhdGFWaWV3LmJ1ZmZlciwgc2VsZik7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIExvYWQgdGhlIGJ1ZmZlciBmcm9tIHRoZSBVUkwuXG4gICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XG4gICAgICB4aHIub3BlbignR0VUJywgdXJsLCB0cnVlKTtcbiAgICAgIHhoci5yZXNwb25zZVR5cGUgPSAnYXJyYXlidWZmZXInO1xuICAgICAgeGhyLm9ubG9hZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBNYWtlIHN1cmUgd2UgZ2V0IGEgc3VjY2Vzc2Z1bCByZXNwb25zZSBiYWNrLlxuICAgICAgICB2YXIgY29kZSA9ICh4aHIuc3RhdHVzICsgJycpWzBdO1xuICAgICAgICBpZiAoY29kZSAhPT0gJzAnICYmIGNvZGUgIT09ICcyJyAmJiBjb2RlICE9PSAnMycpIHtcbiAgICAgICAgICBzZWxmLl9lbWl0KCdsb2FkZXJyb3InLCBudWxsLCAnRmFpbGVkIGxvYWRpbmcgYXVkaW8gZmlsZSB3aXRoIHN0YXR1czogJyArIHhoci5zdGF0dXMgKyAnLicpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGRlY29kZUF1ZGlvRGF0YSh4aHIucmVzcG9uc2UsIHNlbGYpO1xuICAgICAgfTtcbiAgICAgIHhoci5vbmVycm9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIC8vIElmIHRoZXJlIGlzIGFuIGVycm9yLCBzd2l0Y2ggdG8gSFRNTDUgQXVkaW8uXG4gICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICAgIHNlbGYuX2h0bWw1ID0gdHJ1ZTtcbiAgICAgICAgICBzZWxmLl93ZWJBdWRpbyA9IGZhbHNlO1xuICAgICAgICAgIHNlbGYuX3NvdW5kcyA9IFtdO1xuICAgICAgICAgIGRlbGV0ZSBjYWNoZVt1cmxdO1xuICAgICAgICAgIHNlbGYubG9hZCgpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgc2FmZVhoclNlbmQoeGhyKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFNlbmQgdGhlIFhIUiByZXF1ZXN0IHdyYXBwZWQgaW4gYSB0cnkvY2F0Y2guXG4gICAqIEBwYXJhbSAge09iamVjdH0geGhyIFhIUiB0byBzZW5kLlxuICAgKi9cbiAgdmFyIHNhZmVYaHJTZW5kID0gZnVuY3Rpb24oeGhyKSB7XG4gICAgdHJ5IHtcbiAgICAgIHhoci5zZW5kKCk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgeGhyLm9uZXJyb3IoKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIERlY29kZSBhdWRpbyBkYXRhIGZyb20gYW4gYXJyYXkgYnVmZmVyLlxuICAgKiBAcGFyYW0gIHtBcnJheUJ1ZmZlcn0gYXJyYXlidWZmZXIgVGhlIGF1ZGlvIGRhdGEuXG4gICAqIEBwYXJhbSAge0hvd2x9ICAgICAgICBzZWxmXG4gICAqL1xuICB2YXIgZGVjb2RlQXVkaW9EYXRhID0gZnVuY3Rpb24oYXJyYXlidWZmZXIsIHNlbGYpIHtcbiAgICAvLyBEZWNvZGUgdGhlIGJ1ZmZlciBpbnRvIGFuIGF1ZGlvIHNvdXJjZS5cbiAgICBIb3dsZXIuY3R4LmRlY29kZUF1ZGlvRGF0YShhcnJheWJ1ZmZlciwgZnVuY3Rpb24oYnVmZmVyKSB7XG4gICAgICBpZiAoYnVmZmVyICYmIHNlbGYuX3NvdW5kcy5sZW5ndGggPiAwKSB7XG4gICAgICAgIGNhY2hlW3NlbGYuX3NyY10gPSBidWZmZXI7XG4gICAgICAgIGxvYWRTb3VuZChzZWxmLCBidWZmZXIpO1xuICAgICAgfVxuICAgIH0sIGZ1bmN0aW9uKCkge1xuICAgICAgc2VsZi5fZW1pdCgnbG9hZGVycm9yJywgbnVsbCwgJ0RlY29kaW5nIGF1ZGlvIGRhdGEgZmFpbGVkLicpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8qKlxuICAgKiBTb3VuZCBpcyBub3cgbG9hZGVkLCBzbyBmaW5pc2ggc2V0dGluZyBldmVyeXRoaW5nIHVwIGFuZCBmaXJlIHRoZSBsb2FkZWQgZXZlbnQuXG4gICAqIEBwYXJhbSAge0hvd2x9IHNlbGZcbiAgICogQHBhcmFtICB7T2JqZWN0fSBidWZmZXIgVGhlIGRlY29kZWQgYnVmZmVyIHNvdW5kIHNvdXJjZS5cbiAgICovXG4gIHZhciBsb2FkU291bmQgPSBmdW5jdGlvbihzZWxmLCBidWZmZXIpIHtcbiAgICAvLyBTZXQgdGhlIGR1cmF0aW9uLlxuICAgIGlmIChidWZmZXIgJiYgIXNlbGYuX2R1cmF0aW9uKSB7XG4gICAgICBzZWxmLl9kdXJhdGlvbiA9IGJ1ZmZlci5kdXJhdGlvbjtcbiAgICB9XG5cbiAgICAvLyBTZXR1cCBhIHNwcml0ZSBpZiBub25lIGlzIGRlZmluZWQuXG4gICAgaWYgKE9iamVjdC5rZXlzKHNlbGYuX3Nwcml0ZSkubGVuZ3RoID09PSAwKSB7XG4gICAgICBzZWxmLl9zcHJpdGUgPSB7X19kZWZhdWx0OiBbMCwgc2VsZi5fZHVyYXRpb24gKiAxMDAwXX07XG4gICAgfVxuXG4gICAgLy8gRmlyZSB0aGUgbG9hZGVkIGV2ZW50LlxuICAgIGlmIChzZWxmLl9zdGF0ZSAhPT0gJ2xvYWRlZCcpIHtcbiAgICAgIHNlbGYuX3N0YXRlID0gJ2xvYWRlZCc7XG4gICAgICBzZWxmLl9lbWl0KCdsb2FkJyk7XG4gICAgICBzZWxmLl9sb2FkUXVldWUoKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqXG4gICAqIFNldHVwIHRoZSBhdWRpbyBjb250ZXh0IHdoZW4gYXZhaWxhYmxlLCBvciBzd2l0Y2ggdG8gSFRNTDUgQXVkaW8gbW9kZS5cbiAgICovXG4gIHZhciBzZXR1cEF1ZGlvQ29udGV4dCA9IGZ1bmN0aW9uKCkge1xuICAgIC8vIENoZWNrIGlmIHdlIGFyZSB1c2luZyBXZWIgQXVkaW8gYW5kIHNldHVwIHRoZSBBdWRpb0NvbnRleHQgaWYgd2UgYXJlLlxuICAgIHRyeSB7XG4gICAgICBpZiAodHlwZW9mIEF1ZGlvQ29udGV4dCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgSG93bGVyLmN0eCA9IG5ldyBBdWRpb0NvbnRleHQoKTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIHdlYmtpdEF1ZGlvQ29udGV4dCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgSG93bGVyLmN0eCA9IG5ldyB3ZWJraXRBdWRpb0NvbnRleHQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIEhvd2xlci51c2luZ1dlYkF1ZGlvID0gZmFsc2U7XG4gICAgICB9XG4gICAgfSBjYXRjaChlKSB7XG4gICAgICBIb3dsZXIudXNpbmdXZWJBdWRpbyA9IGZhbHNlO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGlmIGEgd2VidmlldyBpcyBiZWluZyB1c2VkIG9uIGlPUzggb3IgZWFybGllciAocmF0aGVyIHRoYW4gdGhlIGJyb3dzZXIpLlxuICAgIC8vIElmIGl0IGlzLCBkaXNhYmxlIFdlYiBBdWRpbyBhcyBpdCBjYXVzZXMgY3Jhc2hpbmcuXG4gICAgdmFyIGlPUyA9ICgvaVAoaG9uZXxvZHxhZCkvLnRlc3QoSG93bGVyLl9uYXZpZ2F0b3IgJiYgSG93bGVyLl9uYXZpZ2F0b3IucGxhdGZvcm0pKTtcbiAgICB2YXIgYXBwVmVyc2lvbiA9IEhvd2xlci5fbmF2aWdhdG9yICYmIEhvd2xlci5fbmF2aWdhdG9yLmFwcFZlcnNpb24ubWF0Y2goL09TIChcXGQrKV8oXFxkKylfPyhcXGQrKT8vKTtcbiAgICB2YXIgdmVyc2lvbiA9IGFwcFZlcnNpb24gPyBwYXJzZUludChhcHBWZXJzaW9uWzFdLCAxMCkgOiBudWxsO1xuICAgIGlmIChpT1MgJiYgdmVyc2lvbiAmJiB2ZXJzaW9uIDwgOSkge1xuICAgICAgdmFyIHNhZmFyaSA9IC9zYWZhcmkvLnRlc3QoSG93bGVyLl9uYXZpZ2F0b3IgJiYgSG93bGVyLl9uYXZpZ2F0b3IudXNlckFnZW50LnRvTG93ZXJDYXNlKCkpO1xuICAgICAgaWYgKEhvd2xlci5fbmF2aWdhdG9yICYmIEhvd2xlci5fbmF2aWdhdG9yLnN0YW5kYWxvbmUgJiYgIXNhZmFyaSB8fCBIb3dsZXIuX25hdmlnYXRvciAmJiAhSG93bGVyLl9uYXZpZ2F0b3Iuc3RhbmRhbG9uZSAmJiAhc2FmYXJpKSB7XG4gICAgICAgIEhvd2xlci51c2luZ1dlYkF1ZGlvID0gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ3JlYXRlIGFuZCBleHBvc2UgdGhlIG1hc3RlciBHYWluTm9kZSB3aGVuIHVzaW5nIFdlYiBBdWRpbyAodXNlZnVsIGZvciBwbHVnaW5zIG9yIGFkdmFuY2VkIHVzYWdlKS5cbiAgICBpZiAoSG93bGVyLnVzaW5nV2ViQXVkaW8pIHtcbiAgICAgIEhvd2xlci5tYXN0ZXJHYWluID0gKHR5cGVvZiBIb3dsZXIuY3R4LmNyZWF0ZUdhaW4gPT09ICd1bmRlZmluZWQnKSA/IEhvd2xlci5jdHguY3JlYXRlR2Fpbk5vZGUoKSA6IEhvd2xlci5jdHguY3JlYXRlR2FpbigpO1xuICAgICAgSG93bGVyLm1hc3RlckdhaW4uZ2Fpbi52YWx1ZSA9IDE7XG4gICAgICBIb3dsZXIubWFzdGVyR2Fpbi5jb25uZWN0KEhvd2xlci5jdHguZGVzdGluYXRpb24pO1xuICAgIH1cblxuICAgIC8vIFJlLXJ1biB0aGUgc2V0dXAgb24gSG93bGVyLlxuICAgIEhvd2xlci5fc2V0dXAoKTtcbiAgfTtcblxuICAvLyBBZGQgc3VwcG9ydCBmb3IgQU1EIChBc3luY2hyb25vdXMgTW9kdWxlIERlZmluaXRpb24pIGxpYnJhcmllcyBzdWNoIGFzIHJlcXVpcmUuanMuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoW10sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgSG93bGVyOiBIb3dsZXIsXG4gICAgICAgIEhvd2w6IEhvd2xcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICAvLyBBZGQgc3VwcG9ydCBmb3IgQ29tbW9uSlMgbGlicmFyaWVzIHN1Y2ggYXMgYnJvd3NlcmlmeS5cbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIGV4cG9ydHMuSG93bGVyID0gSG93bGVyO1xuICAgIGV4cG9ydHMuSG93bCA9IEhvd2w7XG4gIH1cblxuICAvLyBEZWZpbmUgZ2xvYmFsbHkgaW4gY2FzZSBBTUQgaXMgbm90IGF2YWlsYWJsZSBvciB1bnVzZWQuXG4gIGlmICh0eXBlb2Ygd2luZG93ICE9PSAndW5kZWZpbmVkJykge1xuICAgIHdpbmRvdy5Ib3dsZXJHbG9iYWwgPSBIb3dsZXJHbG9iYWw7XG4gICAgd2luZG93Lkhvd2xlciA9IEhvd2xlcjtcbiAgICB3aW5kb3cuSG93bCA9IEhvd2w7XG4gICAgd2luZG93LlNvdW5kID0gU291bmQ7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGdsb2JhbCAhPT0gJ3VuZGVmaW5lZCcpIHsgLy8gQWRkIHRvIGdsb2JhbCBpbiBOb2RlLmpzIChmb3IgdGVzdGluZywgZXRjKS5cbiAgICBnbG9iYWwuSG93bGVyR2xvYmFsID0gSG93bGVyR2xvYmFsO1xuICAgIGdsb2JhbC5Ib3dsZXIgPSBIb3dsZXI7XG4gICAgZ2xvYmFsLkhvd2wgPSBIb3dsO1xuICAgIGdsb2JhbC5Tb3VuZCA9IFNvdW5kO1xuICB9XG59KSgpO1xuXG5cbi8qIVxuICogIFNwYXRpYWwgUGx1Z2luIC0gQWRkcyBzdXBwb3J0IGZvciBzdGVyZW8gYW5kIDNEIGF1ZGlvIHdoZXJlIFdlYiBBdWRpbyBpcyBzdXBwb3J0ZWQuXG4gKiAgXG4gKiAgaG93bGVyLmpzIHYyLjAuMlxuICogIGhvd2xlcmpzLmNvbVxuICpcbiAqICAoYykgMjAxMy0yMDE2LCBKYW1lcyBTaW1wc29uIG9mIEdvbGRGaXJlIFN0dWRpb3NcbiAqICBnb2xkZmlyZXN0dWRpb3MuY29tXG4gKlxuICogIE1JVCBMaWNlbnNlXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuXG4gICd1c2Ugc3RyaWN0JztcblxuICAvLyBTZXR1cCBkZWZhdWx0IHByb3BlcnRpZXMuXG4gIEhvd2xlckdsb2JhbC5wcm90b3R5cGUuX3BvcyA9IFswLCAwLCAwXTtcbiAgSG93bGVyR2xvYmFsLnByb3RvdHlwZS5fb3JpZW50YXRpb24gPSBbMCwgMCwgLTEsIDAsIDEsIDBdO1xuICBcbiAgLyoqIEdsb2JhbCBNZXRob2RzICoqL1xuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBIZWxwZXIgbWV0aG9kIHRvIHVwZGF0ZSB0aGUgc3RlcmVvIHBhbm5pbmcgcG9zaXRpb24gb2YgYWxsIGN1cnJlbnQgSG93bHMuXG4gICAqIEZ1dHVyZSBIb3dscyB3aWxsIG5vdCB1c2UgdGhpcyB2YWx1ZSB1bmxlc3MgZXhwbGljaXRseSBzZXQuXG4gICAqIEBwYXJhbSAge051bWJlcn0gcGFuIEEgdmFsdWUgb2YgLTEuMCBpcyBhbGwgdGhlIHdheSBsZWZ0IGFuZCAxLjAgaXMgYWxsIHRoZSB3YXkgcmlnaHQuXG4gICAqIEByZXR1cm4ge0hvd2xlci9OdW1iZXJ9ICAgICBTZWxmIG9yIGN1cnJlbnQgc3RlcmVvIHBhbm5pbmcgdmFsdWUuXG4gICAqL1xuICBIb3dsZXJHbG9iYWwucHJvdG90eXBlLnN0ZXJlbyA9IGZ1bmN0aW9uKHBhbikge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIFN0b3AgcmlnaHQgaGVyZSBpZiBub3QgdXNpbmcgV2ViIEF1ZGlvLlxuICAgIGlmICghc2VsZi5jdHggfHwgIXNlbGYuY3R4Lmxpc3RlbmVyKSB7XG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICAvLyBMb29wIHRocm91Z2ggYWxsIEhvd2xzIGFuZCB1cGRhdGUgdGhlaXIgc3RlcmVvIHBhbm5pbmcuXG4gICAgZm9yICh2YXIgaT1zZWxmLl9ob3dscy5sZW5ndGgtMTsgaT49MDsgaS0tKSB7XG4gICAgICBzZWxmLl9ob3dsc1tpXS5zdGVyZW8ocGFuKTtcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICAvKipcbiAgICogR2V0L3NldCB0aGUgcG9zaXRpb24gb2YgdGhlIGxpc3RlbmVyIGluIDNEIGNhcnRlc2lhbiBzcGFjZS4gU291bmRzIHVzaW5nXG4gICAqIDNEIHBvc2l0aW9uIHdpbGwgYmUgcmVsYXRpdmUgdG8gdGhlIGxpc3RlbmVyJ3MgcG9zaXRpb24uXG4gICAqIEBwYXJhbSAge051bWJlcn0geCBUaGUgeC1wb3NpdGlvbiBvZiB0aGUgbGlzdGVuZXIuXG4gICAqIEBwYXJhbSAge051bWJlcn0geSBUaGUgeS1wb3NpdGlvbiBvZiB0aGUgbGlzdGVuZXIuXG4gICAqIEBwYXJhbSAge051bWJlcn0geiBUaGUgei1wb3NpdGlvbiBvZiB0aGUgbGlzdGVuZXIuXG4gICAqIEByZXR1cm4ge0hvd2xlci9BcnJheX0gICBTZWxmIG9yIGN1cnJlbnQgbGlzdGVuZXIgcG9zaXRpb24uXG4gICAqL1xuICBIb3dsZXJHbG9iYWwucHJvdG90eXBlLnBvcyA9IGZ1bmN0aW9uKHgsIHksIHopIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBTdG9wIHJpZ2h0IGhlcmUgaWYgbm90IHVzaW5nIFdlYiBBdWRpby5cbiAgICBpZiAoIXNlbGYuY3R4IHx8ICFzZWxmLmN0eC5saXN0ZW5lcikge1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBkZWZhdWx0cyBmb3Igb3B0aW9uYWwgJ3knICYgJ3onLlxuICAgIHkgPSAodHlwZW9mIHkgIT09ICdudW1iZXInKSA/IHNlbGYuX3Bvc1sxXSA6IHk7XG4gICAgeiA9ICh0eXBlb2YgeiAhPT0gJ251bWJlcicpID8gc2VsZi5fcG9zWzJdIDogejtcblxuICAgIGlmICh0eXBlb2YgeCA9PT0gJ251bWJlcicpIHtcbiAgICAgIHNlbGYuX3BvcyA9IFt4LCB5LCB6XTtcbiAgICAgIHNlbGYuY3R4Lmxpc3RlbmVyLnNldFBvc2l0aW9uKHNlbGYuX3Bvc1swXSwgc2VsZi5fcG9zWzFdLCBzZWxmLl9wb3NbMl0pO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gc2VsZi5fcG9zO1xuICAgIH1cblxuICAgIHJldHVybiBzZWxmO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQvc2V0IHRoZSBkaXJlY3Rpb24gdGhlIGxpc3RlbmVyIGlzIHBvaW50aW5nIGluIHRoZSAzRCBjYXJ0ZXNpYW4gc3BhY2UuXG4gICAqIEEgZnJvbnQgYW5kIHVwIHZlY3RvciBtdXN0IGJlIHByb3ZpZGVkLiBUaGUgZnJvbnQgaXMgdGhlIGRpcmVjdGlvbiB0aGVcbiAgICogZmFjZSBvZiB0aGUgbGlzdGVuZXIgaXMgcG9pbnRpbmcsIGFuZCB1cCBpcyB0aGUgZGlyZWN0aW9uIHRoZSB0b3Agb2YgdGhlXG4gICAqIGxpc3RlbmVyIGlzIHBvaW50aW5nLiBUaHVzLCB0aGVzZSB2YWx1ZXMgYXJlIGV4cGVjdGVkIHRvIGJlIGF0IHJpZ2h0IGFuZ2xlc1xuICAgKiBmcm9tIGVhY2ggb3RoZXIuXG4gICAqIEBwYXJhbSAge051bWJlcn0geCAgIFRoZSB4LW9yaWVudGF0aW9uIG9mIHRoZSBsaXN0ZW5lci5cbiAgICogQHBhcmFtICB7TnVtYmVyfSB5ICAgVGhlIHktb3JpZW50YXRpb24gb2YgdGhlIGxpc3RlbmVyLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHogICBUaGUgei1vcmllbnRhdGlvbiBvZiB0aGUgbGlzdGVuZXIuXG4gICAqIEBwYXJhbSAge051bWJlcn0geFVwIFRoZSB4LW9yaWVudGF0aW9uIG9mIHRoZSB0b3Agb2YgdGhlIGxpc3RlbmVyLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHlVcCBUaGUgeS1vcmllbnRhdGlvbiBvZiB0aGUgdG9wIG9mIHRoZSBsaXN0ZW5lci5cbiAgICogQHBhcmFtICB7TnVtYmVyfSB6VXAgVGhlIHotb3JpZW50YXRpb24gb2YgdGhlIHRvcCBvZiB0aGUgbGlzdGVuZXIuXG4gICAqIEByZXR1cm4ge0hvd2xlci9BcnJheX0gICAgIFJldHVybnMgc2VsZiBvciB0aGUgY3VycmVudCBvcmllbnRhdGlvbiB2ZWN0b3JzLlxuICAgKi9cbiAgSG93bGVyR2xvYmFsLnByb3RvdHlwZS5vcmllbnRhdGlvbiA9IGZ1bmN0aW9uKHgsIHksIHosIHhVcCwgeVVwLCB6VXApIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBTdG9wIHJpZ2h0IGhlcmUgaWYgbm90IHVzaW5nIFdlYiBBdWRpby5cbiAgICBpZiAoIXNlbGYuY3R4IHx8ICFzZWxmLmN0eC5saXN0ZW5lcikge1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBkZWZhdWx0cyBmb3Igb3B0aW9uYWwgJ3knICYgJ3onLlxuICAgIHZhciBvciA9IHNlbGYuX29yaWVudGF0aW9uO1xuICAgIHkgPSAodHlwZW9mIHkgIT09ICdudW1iZXInKSA/IG9yWzFdIDogeTtcbiAgICB6ID0gKHR5cGVvZiB6ICE9PSAnbnVtYmVyJykgPyBvclsyXSA6IHo7XG4gICAgeFVwID0gKHR5cGVvZiB4VXAgIT09ICdudW1iZXInKSA/IG9yWzNdIDogeFVwO1xuICAgIHlVcCA9ICh0eXBlb2YgeVVwICE9PSAnbnVtYmVyJykgPyBvcls0XSA6IHlVcDtcbiAgICB6VXAgPSAodHlwZW9mIHpVcCAhPT0gJ251bWJlcicpID8gb3JbNV0gOiB6VXA7XG5cbiAgICBpZiAodHlwZW9mIHggPT09ICdudW1iZXInKSB7XG4gICAgICBzZWxmLl9vcmllbnRhdGlvbiA9IFt4LCB5LCB6LCB4VXAsIHlVcCwgelVwXTtcbiAgICAgIHNlbGYuY3R4Lmxpc3RlbmVyLnNldE9yaWVudGF0aW9uKHgsIHksIHosIHhVcCwgeVVwLCB6VXApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gb3I7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgLyoqIEdyb3VwIE1ldGhvZHMgKiovXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIEFkZCBuZXcgcHJvcGVydGllcyB0byB0aGUgY29yZSBpbml0LlxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gX3N1cGVyIENvcmUgaW5pdCBtZXRob2QuXG4gICAqIEByZXR1cm4ge0hvd2x9XG4gICAqL1xuICBIb3dsLnByb3RvdHlwZS5pbml0ID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuICAgIHJldHVybiBmdW5jdGlvbihvKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIFNldHVwIHVzZXItZGVmaW5lZCBkZWZhdWx0IHByb3BlcnRpZXMuXG4gICAgICBzZWxmLl9vcmllbnRhdGlvbiA9IG8ub3JpZW50YXRpb24gfHwgWzEsIDAsIDBdO1xuICAgICAgc2VsZi5fc3RlcmVvID0gby5zdGVyZW8gfHwgbnVsbDtcbiAgICAgIHNlbGYuX3BvcyA9IG8ucG9zIHx8IG51bGw7XG4gICAgICBzZWxmLl9wYW5uZXJBdHRyID0ge1xuICAgICAgICBjb25lSW5uZXJBbmdsZTogdHlwZW9mIG8uY29uZUlubmVyQW5nbGUgIT09ICd1bmRlZmluZWQnID8gby5jb25lSW5uZXJBbmdsZSA6IDM2MCxcbiAgICAgICAgY29uZU91dGVyQW5nbGU6IHR5cGVvZiBvLmNvbmVPdXRlckFuZ2xlICE9PSAndW5kZWZpbmVkJyA/IG8uY29uZU91dGVyQW5nbGUgOiAzNjAsXG4gICAgICAgIGNvbmVPdXRlckdhaW46IHR5cGVvZiBvLmNvbmVPdXRlckdhaW4gIT09ICd1bmRlZmluZWQnID8gby5jb25lT3V0ZXJHYWluIDogMCxcbiAgICAgICAgZGlzdGFuY2VNb2RlbDogdHlwZW9mIG8uZGlzdGFuY2VNb2RlbCAhPT0gJ3VuZGVmaW5lZCcgPyBvLmRpc3RhbmNlTW9kZWwgOiAnaW52ZXJzZScsXG4gICAgICAgIG1heERpc3RhbmNlOiB0eXBlb2Ygby5tYXhEaXN0YW5jZSAhPT0gJ3VuZGVmaW5lZCcgPyBvLm1heERpc3RhbmNlIDogMTAwMDAsXG4gICAgICAgIHBhbm5pbmdNb2RlbDogdHlwZW9mIG8ucGFubmluZ01vZGVsICE9PSAndW5kZWZpbmVkJyA/IG8ucGFubmluZ01vZGVsIDogJ0hSVEYnLFxuICAgICAgICByZWZEaXN0YW5jZTogdHlwZW9mIG8ucmVmRGlzdGFuY2UgIT09ICd1bmRlZmluZWQnID8gby5yZWZEaXN0YW5jZSA6IDEsXG4gICAgICAgIHJvbGxvZmZGYWN0b3I6IHR5cGVvZiBvLnJvbGxvZmZGYWN0b3IgIT09ICd1bmRlZmluZWQnID8gby5yb2xsb2ZmRmFjdG9yIDogMVxuICAgICAgfTtcblxuICAgICAgLy8gU2V0dXAgZXZlbnQgbGlzdGVuZXJzLlxuICAgICAgc2VsZi5fb25zdGVyZW8gPSBvLm9uc3RlcmVvID8gW3tmbjogby5vbnN0ZXJlb31dIDogW107XG4gICAgICBzZWxmLl9vbnBvcyA9IG8ub25wb3MgPyBbe2ZuOiBvLm9ucG9zfV0gOiBbXTtcbiAgICAgIHNlbGYuX29ub3JpZW50YXRpb24gPSBvLm9ub3JpZW50YXRpb24gPyBbe2ZuOiBvLm9ub3JpZW50YXRpb259XSA6IFtdO1xuXG4gICAgICAvLyBDb21wbGV0ZSBpbml0aWxpemF0aW9uIHdpdGggaG93bGVyLmpzIGNvcmUncyBpbml0IGZ1bmN0aW9uLlxuICAgICAgcmV0dXJuIF9zdXBlci5jYWxsKHRoaXMsIG8pO1xuICAgIH07XG4gIH0pKEhvd2wucHJvdG90eXBlLmluaXQpO1xuXG4gIC8qKlxuICAgKiBHZXQvc2V0IHRoZSBzdGVyZW8gcGFubmluZyBvZiB0aGUgYXVkaW8gc291cmNlIGZvciB0aGlzIHNvdW5kIG9yIGFsbCBpbiB0aGUgZ3JvdXAuXG4gICAqIEBwYXJhbSAge051bWJlcn0gcGFuICBBIHZhbHVlIG9mIC0xLjAgaXMgYWxsIHRoZSB3YXkgbGVmdCBhbmQgMS4wIGlzIGFsbCB0aGUgd2F5IHJpZ2h0LlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGlkIChvcHRpb25hbCkgVGhlIHNvdW5kIElELiBJZiBub25lIGlzIHBhc3NlZCwgYWxsIGluIGdyb3VwIHdpbGwgYmUgdXBkYXRlZC5cbiAgICogQHJldHVybiB7SG93bC9OdW1iZXJ9ICAgIFJldHVybnMgc2VsZiBvciB0aGUgY3VycmVudCBzdGVyZW8gcGFubmluZyB2YWx1ZS5cbiAgICovXG4gIEhvd2wucHJvdG90eXBlLnN0ZXJlbyA9IGZ1bmN0aW9uKHBhbiwgaWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBTdG9wIHJpZ2h0IGhlcmUgaWYgbm90IHVzaW5nIFdlYiBBdWRpby5cbiAgICBpZiAoIXNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgc291bmQgaGFzbid0IGxvYWRlZCwgYWRkIGl0IHRvIHRoZSBsb2FkIHF1ZXVlIHRvIGNoYW5nZSBzdGVyZW8gcGFuIHdoZW4gY2FwYWJsZS5cbiAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnKSB7XG4gICAgICBzZWxmLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgZXZlbnQ6ICdzdGVyZW8nLFxuICAgICAgICBhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuc3RlcmVvKHBhbiwgaWQpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgLy8gQ2hlY2sgZm9yIFBhbm5lclN0ZXJlb05vZGUgc3VwcG9ydCBhbmQgZmFsbGJhY2sgdG8gUGFubmVyTm9kZSBpZiBpdCBkb2Vzbid0IGV4aXN0LlxuICAgIHZhciBwYW5uZXJUeXBlID0gKHR5cGVvZiBIb3dsZXIuY3R4LmNyZWF0ZVN0ZXJlb1Bhbm5lciA9PT0gJ3VuZGVmaW5lZCcpID8gJ3NwYXRpYWwnIDogJ3N0ZXJlbyc7XG5cbiAgICAvLyBTZXR1cCB0aGUgZ3JvdXAncyBzdGVyZW8gcGFubmluZyBpZiBubyBJRCBpcyBwYXNzZWQuXG4gICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIFJldHVybiB0aGUgZ3JvdXAncyBzdGVyZW8gcGFubmluZyBpZiBubyBwYXJhbWV0ZXJzIGFyZSBwYXNzZWQuXG4gICAgICBpZiAodHlwZW9mIHBhbiA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgc2VsZi5fc3RlcmVvID0gcGFuO1xuICAgICAgICBzZWxmLl9wb3MgPSBbcGFuLCAwLCAwXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBzZWxmLl9zdGVyZW87XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIHRoZSBzdHJlbyBwYW5uaW5nIG9mIG9uZSBvciBhbGwgc291bmRzIGluIGdyb3VwLlxuICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcyhpZCk7XG4gICAgZm9yICh2YXIgaT0wOyBpPGlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gR2V0IHRoZSBzb3VuZC5cbiAgICAgIHZhciBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZHNbaV0pO1xuXG4gICAgICBpZiAoc291bmQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBwYW4gPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgc291bmQuX3N0ZXJlbyA9IHBhbjtcbiAgICAgICAgICBzb3VuZC5fcG9zID0gW3BhbiwgMCwgMF07XG5cbiAgICAgICAgICBpZiAoc291bmQuX25vZGUpIHtcbiAgICAgICAgICAgIC8vIElmIHdlIGFyZSBmYWxsaW5nIGJhY2ssIG1ha2Ugc3VyZSB0aGUgcGFubmluZ01vZGVsIGlzIGVxdWFscG93ZXIuXG4gICAgICAgICAgICBzb3VuZC5fcGFubmVyQXR0ci5wYW5uaW5nTW9kZWwgPSAnZXF1YWxwb3dlcic7XG5cbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEgcGFubmVyIHNldHVwIGFuZCBjcmVhdGUgYSBuZXcgb25lIGlmIG5vdC5cbiAgICAgICAgICAgIGlmICghc291bmQuX3Bhbm5lciB8fCAhc291bmQuX3Bhbm5lci5wYW4pIHtcbiAgICAgICAgICAgICAgc2V0dXBQYW5uZXIoc291bmQsIHBhbm5lclR5cGUpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAocGFubmVyVHlwZSA9PT0gJ3NwYXRpYWwnKSB7XG4gICAgICAgICAgICAgIHNvdW5kLl9wYW5uZXIuc2V0UG9zaXRpb24ocGFuLCAwLCAwKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHNvdW5kLl9wYW5uZXIucGFuLnZhbHVlID0gcGFuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX2VtaXQoJ3N0ZXJlbycsIHNvdW5kLl9pZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHNvdW5kLl9zdGVyZW87XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICAvKipcbiAgICogR2V0L3NldCB0aGUgM0Qgc3BhdGlhbCBwb3NpdGlvbiBvZiB0aGUgYXVkaW8gc291cmNlIGZvciB0aGlzIHNvdW5kIG9yXG4gICAqIGFsbCBpbiB0aGUgZ3JvdXAuIFRoZSBtb3N0IGNvbW1vbiB1c2FnZSBpcyB0byBzZXQgdGhlICd4JyBwb3NpdGlvbiBmb3JcbiAgICogbGVmdC9yaWdodCBwYW5uaW5nLiBTZXR0aW5nIGFueSB2YWx1ZSBoaWdoZXIgdGhhbiAxLjAgd2lsbCBiZWdpbiB0b1xuICAgKiBkZWNyZWFzZSB0aGUgdm9sdW1lIG9mIHRoZSBzb3VuZCBhcyBpdCBtb3ZlcyBmdXJ0aGVyIGF3YXkuXG4gICAqIEBwYXJhbSAge051bWJlcn0geCAgVGhlIHgtcG9zaXRpb24gb2YgdGhlIGF1ZGlvIGZyb20gLTEwMDAuMCB0byAxMDAwLjAuXG4gICAqIEBwYXJhbSAge051bWJlcn0geSAgVGhlIHktcG9zaXRpb24gb2YgdGhlIGF1ZGlvIGZyb20gLTEwMDAuMCB0byAxMDAwLjAuXG4gICAqIEBwYXJhbSAge051bWJlcn0geiAgVGhlIHotcG9zaXRpb24gb2YgdGhlIGF1ZGlvIGZyb20gLTEwMDAuMCB0byAxMDAwLjAuXG4gICAqIEBwYXJhbSAge051bWJlcn0gaWQgKG9wdGlvbmFsKSBUaGUgc291bmQgSUQuIElmIG5vbmUgaXMgcGFzc2VkLCBhbGwgaW4gZ3JvdXAgd2lsbCBiZSB1cGRhdGVkLlxuICAgKiBAcmV0dXJuIHtIb3dsL0FycmF5fSAgICBSZXR1cm5zIHNlbGYgb3IgdGhlIGN1cnJlbnQgM0Qgc3BhdGlhbCBwb3NpdGlvbjogW3gsIHksIHpdLlxuICAgKi9cbiAgSG93bC5wcm90b3R5cGUucG9zID0gZnVuY3Rpb24oeCwgeSwgeiwgaWQpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBTdG9wIHJpZ2h0IGhlcmUgaWYgbm90IHVzaW5nIFdlYiBBdWRpby5cbiAgICBpZiAoIXNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICAvLyBJZiB0aGUgc291bmQgaGFzbid0IGxvYWRlZCwgYWRkIGl0IHRvIHRoZSBsb2FkIHF1ZXVlIHRvIGNoYW5nZSBwb3NpdGlvbiB3aGVuIGNhcGFibGUuXG4gICAgaWYgKHNlbGYuX3N0YXRlICE9PSAnbG9hZGVkJykge1xuICAgICAgc2VsZi5fcXVldWUucHVzaCh7XG4gICAgICAgIGV2ZW50OiAncG9zJyxcbiAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLnBvcyh4LCB5LCB6LCBpZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIGRlZmF1bHRzIGZvciBvcHRpb25hbCAneScgJiAneicuXG4gICAgeSA9ICh0eXBlb2YgeSAhPT0gJ251bWJlcicpID8gMCA6IHk7XG4gICAgeiA9ICh0eXBlb2YgeiAhPT0gJ251bWJlcicpID8gLTAuNSA6IHo7XG5cbiAgICAvLyBTZXR1cCB0aGUgZ3JvdXAncyBzcGF0aWFsIHBvc2l0aW9uIGlmIG5vIElEIGlzIHBhc3NlZC5cbiAgICBpZiAodHlwZW9mIGlkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgLy8gUmV0dXJuIHRoZSBncm91cCdzIHNwYXRpYWwgcG9zaXRpb24gaWYgbm8gcGFyYW1ldGVycyBhcmUgcGFzc2VkLlxuICAgICAgaWYgKHR5cGVvZiB4ID09PSAnbnVtYmVyJykge1xuICAgICAgICBzZWxmLl9wb3MgPSBbeCwgeSwgel07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2VsZi5fcG9zO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoYW5nZSB0aGUgc3BhdGlhbCBwb3NpdGlvbiBvZiBvbmUgb3IgYWxsIHNvdW5kcyBpbiBncm91cC5cbiAgICB2YXIgaWRzID0gc2VsZi5fZ2V0U291bmRJZHMoaWQpO1xuICAgIGZvciAodmFyIGk9MDsgaTxpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIEdldCB0aGUgc291bmQuXG4gICAgICB2YXIgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWRzW2ldKTtcblxuICAgICAgaWYgKHNvdW5kKSB7XG4gICAgICAgIGlmICh0eXBlb2YgeCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBzb3VuZC5fcG9zID0gW3gsIHksIHpdO1xuXG4gICAgICAgICAgaWYgKHNvdW5kLl9ub2RlKSB7XG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGVyZSBpcyBhIHBhbm5lciBzZXR1cCBhbmQgY3JlYXRlIGEgbmV3IG9uZSBpZiBub3QuXG4gICAgICAgICAgICBpZiAoIXNvdW5kLl9wYW5uZXIgfHwgc291bmQuX3Bhbm5lci5wYW4pIHtcbiAgICAgICAgICAgICAgc2V0dXBQYW5uZXIoc291bmQsICdzcGF0aWFsJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNvdW5kLl9wYW5uZXIuc2V0UG9zaXRpb24oeCwgeSwgeik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fZW1pdCgncG9zJywgc291bmQuX2lkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXR1cm4gc291bmQuX3BvcztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzZWxmO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQvc2V0IHRoZSBkaXJlY3Rpb24gdGhlIGF1ZGlvIHNvdXJjZSBpcyBwb2ludGluZyBpbiB0aGUgM0QgY2FydGVzaWFuIGNvb3JkaW5hdGVcbiAgICogc3BhY2UuIERlcGVuZGluZyBvbiBob3cgZGlyZWN0aW9uIHRoZSBzb3VuZCBpcywgYmFzZWQgb24gdGhlIGBjb25lYCBhdHRyaWJ1dGVzLFxuICAgKiBhIHNvdW5kIHBvaW50aW5nIGF3YXkgZnJvbSB0aGUgbGlzdGVuZXIgY2FuIGJlIHF1aWV0IG9yIHNpbGVudC5cbiAgICogQHBhcmFtICB7TnVtYmVyfSB4ICBUaGUgeC1vcmllbnRhdGlvbiBvZiB0aGUgc291cmNlLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHkgIFRoZSB5LW9yaWVudGF0aW9uIG9mIHRoZSBzb3VyY2UuXG4gICAqIEBwYXJhbSAge051bWJlcn0geiAgVGhlIHotb3JpZW50YXRpb24gb2YgdGhlIHNvdXJjZS5cbiAgICogQHBhcmFtICB7TnVtYmVyfSBpZCAob3B0aW9uYWwpIFRoZSBzb3VuZCBJRC4gSWYgbm9uZSBpcyBwYXNzZWQsIGFsbCBpbiBncm91cCB3aWxsIGJlIHVwZGF0ZWQuXG4gICAqIEByZXR1cm4ge0hvd2wvQXJyYXl9ICAgIFJldHVybnMgc2VsZiBvciB0aGUgY3VycmVudCAzRCBzcGF0aWFsIG9yaWVudGF0aW9uOiBbeCwgeSwgel0uXG4gICAqL1xuICBIb3dsLnByb3RvdHlwZS5vcmllbnRhdGlvbiA9IGZ1bmN0aW9uKHgsIHksIHosIGlkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gU3RvcCByaWdodCBoZXJlIGlmIG5vdCB1c2luZyBXZWIgQXVkaW8uXG4gICAgaWYgKCFzZWxmLl93ZWJBdWRpbykge1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHNvdW5kIGhhc24ndCBsb2FkZWQsIGFkZCBpdCB0byB0aGUgbG9hZCBxdWV1ZSB0byBjaGFuZ2Ugb3JpZW50YXRpb24gd2hlbiBjYXBhYmxlLlxuICAgIGlmIChzZWxmLl9zdGF0ZSAhPT0gJ2xvYWRlZCcpIHtcbiAgICAgIHNlbGYuX3F1ZXVlLnB1c2goe1xuICAgICAgICBldmVudDogJ29yaWVudGF0aW9uJyxcbiAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLm9yaWVudGF0aW9uKHgsIHksIHosIGlkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgZGVmYXVsdHMgZm9yIG9wdGlvbmFsICd5JyAmICd6Jy5cbiAgICB5ID0gKHR5cGVvZiB5ICE9PSAnbnVtYmVyJykgPyBzZWxmLl9vcmllbnRhdGlvblsxXSA6IHk7XG4gICAgeiA9ICh0eXBlb2YgeiAhPT0gJ251bWJlcicpID8gc2VsZi5fb3JpZW50YXRpb25bMl0gOiB6O1xuXG4gICAgLy8gU2V0dXAgdGhlIGdyb3VwJ3Mgc3BhdGlhbCBvcmllbnRhdGlvbiBpZiBubyBJRCBpcyBwYXNzZWQuXG4gICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIFJldHVybiB0aGUgZ3JvdXAncyBzcGF0aWFsIG9yaWVudGF0aW9uIGlmIG5vIHBhcmFtZXRlcnMgYXJlIHBhc3NlZC5cbiAgICAgIGlmICh0eXBlb2YgeCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgc2VsZi5fb3JpZW50YXRpb24gPSBbeCwgeSwgel07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2VsZi5fb3JpZW50YXRpb247XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gQ2hhbmdlIHRoZSBzcGF0aWFsIG9yaWVudGF0aW9uIG9mIG9uZSBvciBhbGwgc291bmRzIGluIGdyb3VwLlxuICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcyhpZCk7XG4gICAgZm9yICh2YXIgaT0wOyBpPGlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgLy8gR2V0IHRoZSBzb3VuZC5cbiAgICAgIHZhciBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZHNbaV0pO1xuXG4gICAgICBpZiAoc291bmQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB4ID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHNvdW5kLl9vcmllbnRhdGlvbiA9IFt4LCB5LCB6XTtcblxuICAgICAgICAgIGlmIChzb3VuZC5fbm9kZSkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBwYW5uZXIgc2V0dXAgYW5kIGNyZWF0ZSBhIG5ldyBvbmUgaWYgbm90LlxuICAgICAgICAgICAgaWYgKCFzb3VuZC5fcGFubmVyKSB7XG4gICAgICAgICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBoYXZlIGEgcG9zaXRpb24gdG8gc2V0dXAgdGhlIG5vZGUgd2l0aC5cbiAgICAgICAgICAgICAgaWYgKCFzb3VuZC5fcG9zKSB7XG4gICAgICAgICAgICAgICAgc291bmQuX3BvcyA9IHNlbGYuX3BvcyB8fCBbMCwgMCwgLTAuNV07XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBzZXR1cFBhbm5lcihzb3VuZCwgJ3NwYXRpYWwnKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc291bmQuX3Bhbm5lci5zZXRPcmllbnRhdGlvbih4LCB5LCB6KTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9lbWl0KCdvcmllbnRhdGlvbicsIHNvdW5kLl9pZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHNvdW5kLl9vcmllbnRhdGlvbjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzZWxmO1xuICB9O1xuXG4gIC8qKlxuICAgKiBHZXQvc2V0IHRoZSBwYW5uZXIgbm9kZSdzIGF0dHJpYnV0ZXMgZm9yIGEgc291bmQgb3IgZ3JvdXAgb2Ygc291bmRzLlxuICAgKiBUaGlzIG1ldGhvZCBjYW4gb3B0aW9uYWxsIHRha2UgMCwgMSBvciAyIGFyZ3VtZW50cy5cbiAgICogICBwYW5uZXJBdHRyKCkgLT4gUmV0dXJucyB0aGUgZ3JvdXAncyB2YWx1ZXMuXG4gICAqICAgcGFubmVyQXR0cihpZCkgLT4gUmV0dXJucyB0aGUgc291bmQgaWQncyB2YWx1ZXMuXG4gICAqICAgcGFubmVyQXR0cihvKSAtPiBTZXQncyB0aGUgdmFsdWVzIG9mIGFsbCBzb3VuZHMgaW4gdGhpcyBIb3dsIGdyb3VwLlxuICAgKiAgIHBhbm5lckF0dHIobywgaWQpIC0+IFNldCdzIHRoZSB2YWx1ZXMgb2YgcGFzc2VkIHNvdW5kIGlkLlxuICAgKlxuICAgKiAgIEF0dHJpYnV0ZXM6XG4gICAqICAgICBjb25lSW5uZXJBbmdsZSAtICgzNjAgYnkgZGVmYXVsdCkgVGhlcmUgd2lsbCBiZSBubyB2b2x1bWUgcmVkdWN0aW9uIGluc2lkZSB0aGlzIGFuZ2xlLlxuICAgKiAgICAgY29uZU91dGVyQW5nbGUgLSAoMzYwIGJ5IGRlZmF1bHQpIFRoZSB2b2x1bWUgd2lsbCBiZSByZWR1Y2VkIHRvIGEgY29uc3RhbnQgdmFsdWUgb2ZcbiAgICogICAgICAgICAgICAgICAgICAgICAgYGNvbmVPdXRlckdhaW5gIG91dHNpZGUgdGhpcyBhbmdsZS5cbiAgICogICAgIGNvbmVPdXRlckdhaW4gLSAoMCBieSBkZWZhdWx0KSBUaGUgYW1vdW50IG9mIHZvbHVtZSByZWR1Y3Rpb24gb3V0c2lkZSBvZiBgY29uZU91dGVyQW5nbGVgLlxuICAgKiAgICAgZGlzdGFuY2VNb2RlbCAtICgnaW52ZXJzZScgYnkgZGVmYXVsdCkgRGV0ZXJtaW5lcyBhbGdvcml0aG0gdG8gdXNlIHRvIHJlZHVjZSB2b2x1bWUgYXMgYXVkaW8gbW92ZXNcbiAgICogICAgICAgICAgICAgICAgICAgICAgYXdheSBmcm9tIGxpc3RlbmVyLiBDYW4gYmUgYGxpbmVhcmAsIGBpbnZlcnNlYCBvciBgZXhwb25lbnRpYWxgLlxuICAgKiAgICAgbWF4RGlzdGFuY2UgLSAoMTAwMDAgYnkgZGVmYXVsdCkgVm9sdW1lIHdvbid0IHJlZHVjZSBiZXR3ZWVuIHNvdXJjZS9saXN0ZW5lciBiZXlvbmQgdGhpcyBkaXN0YW5jZS5cbiAgICogICAgIHBhbm5pbmdNb2RlbCAtICgnSFJURicgYnkgZGVmYXVsdCkgRGV0ZXJtaW5lcyB3aGljaCBzcGF0aWFsaXphdGlvbiBhbGdvcml0aG0gaXMgdXNlZCB0byBwb3NpdGlvbiBhdWRpby5cbiAgICogICAgICAgICAgICAgICAgICAgICBDYW4gYmUgYEhSVEZgIG9yIGBlcXVhbHBvd2VyYC5cbiAgICogICAgIHJlZkRpc3RhbmNlIC0gKDEgYnkgZGVmYXVsdCkgQSByZWZlcmVuY2UgZGlzdGFuY2UgZm9yIHJlZHVjaW5nIHZvbHVtZSBhcyB0aGUgc291cmNlXG4gICAqICAgICAgICAgICAgICAgICAgICBtb3ZlcyBhd2F5IGZyb20gdGhlIGxpc3RlbmVyLlxuICAgKiAgICAgcm9sbG9mZkZhY3RvciAtICgxIGJ5IGRlZmF1bHQpIEhvdyBxdWlja2x5IHRoZSB2b2x1bWUgcmVkdWNlcyBhcyBzb3VyY2UgbW92ZXMgZnJvbSBsaXN0ZW5lci5cbiAgICogXG4gICAqIEByZXR1cm4ge0hvd2wvT2JqZWN0fSBSZXR1cm5zIHNlbGYgb3IgY3VycmVudCBwYW5uZXIgYXR0cmlidXRlcy5cbiAgICovXG4gIEhvd2wucHJvdG90eXBlLnBhbm5lckF0dHIgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgdmFyIG8sIGlkLCBzb3VuZDtcblxuICAgIC8vIFN0b3AgcmlnaHQgaGVyZSBpZiBub3QgdXNpbmcgV2ViIEF1ZGlvLlxuICAgIGlmICghc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIC8vIERldGVybWluZSB0aGUgdmFsdWVzIGJhc2VkIG9uIGFyZ3VtZW50cy5cbiAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgIC8vIFJldHVybiB0aGUgZ3JvdXAncyBwYW5uZXIgYXR0cmlidXRlIHZhbHVlcy5cbiAgICAgIHJldHVybiBzZWxmLl9wYW5uZXJBdHRyO1xuICAgIH0gZWxzZSBpZiAoYXJncy5sZW5ndGggPT09IDEpIHtcbiAgICAgIGlmICh0eXBlb2YgYXJnc1swXSA9PT0gJ29iamVjdCcpIHtcbiAgICAgICAgbyA9IGFyZ3NbMF07XG5cbiAgICAgICAgLy8gU2V0IHRoZSBncm91J3MgcGFubmVyIGF0dHJpYnV0ZSB2YWx1ZXMuXG4gICAgICAgIGlmICh0eXBlb2YgaWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgc2VsZi5fcGFubmVyQXR0ciA9IHtcbiAgICAgICAgICAgIGNvbmVJbm5lckFuZ2xlOiB0eXBlb2Ygby5jb25lSW5uZXJBbmdsZSAhPT0gJ3VuZGVmaW5lZCcgPyBvLmNvbmVJbm5lckFuZ2xlIDogc2VsZi5fY29uZUlubmVyQW5nbGUsXG4gICAgICAgICAgICBjb25lT3V0ZXJBbmdsZTogdHlwZW9mIG8uY29uZU91dGVyQW5nbGUgIT09ICd1bmRlZmluZWQnID8gby5jb25lT3V0ZXJBbmdsZSA6IHNlbGYuX2NvbmVPdXRlckFuZ2xlLFxuICAgICAgICAgICAgY29uZU91dGVyR2FpbjogdHlwZW9mIG8uY29uZU91dGVyR2FpbiAhPT0gJ3VuZGVmaW5lZCcgPyBvLmNvbmVPdXRlckdhaW4gOiBzZWxmLl9jb25lT3V0ZXJHYWluLFxuICAgICAgICAgICAgZGlzdGFuY2VNb2RlbDogdHlwZW9mIG8uZGlzdGFuY2VNb2RlbCAhPT0gJ3VuZGVmaW5lZCcgPyBvLmRpc3RhbmNlTW9kZWwgOiBzZWxmLl9kaXN0YW5jZU1vZGVsLFxuICAgICAgICAgICAgbWF4RGlzdGFuY2U6IHR5cGVvZiBvLm1heERpc3RhbmNlICE9PSAndW5kZWZpbmVkJyA/IG8ubWF4RGlzdGFuY2UgOiBzZWxmLl9tYXhEaXN0YW5jZSxcbiAgICAgICAgICAgIHBhbm5pbmdNb2RlbDogdHlwZW9mIG8ucGFubmluZ01vZGVsICE9PSAndW5kZWZpbmVkJyA/IG8ucGFubmluZ01vZGVsIDogc2VsZi5fcGFubmluZ01vZGVsLFxuICAgICAgICAgICAgcmVmRGlzdGFuY2U6IHR5cGVvZiBvLnJlZkRpc3RhbmNlICE9PSAndW5kZWZpbmVkJyA/IG8ucmVmRGlzdGFuY2UgOiBzZWxmLl9yZWZEaXN0YW5jZSxcbiAgICAgICAgICAgIHJvbGxvZmZGYWN0b3I6IHR5cGVvZiBvLnJvbGxvZmZGYWN0b3IgIT09ICd1bmRlZmluZWQnID8gby5yb2xsb2ZmRmFjdG9yIDogc2VsZi5fcm9sbG9mZkZhY3RvclxuICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFJldHVybiB0aGlzIHNvdW5kJ3MgcGFubmVyIGF0dHJpYnV0ZSB2YWx1ZXMuXG4gICAgICAgIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKHBhcnNlSW50KGFyZ3NbMF0sIDEwKSk7XG4gICAgICAgIHJldHVybiBzb3VuZCA/IHNvdW5kLl9wYW5uZXJBdHRyIDogc2VsZi5fcGFubmVyQXR0cjtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAyKSB7XG4gICAgICBvID0gYXJnc1swXTtcbiAgICAgIGlkID0gcGFyc2VJbnQoYXJnc1sxXSwgMTApO1xuICAgIH1cblxuICAgIC8vIFVwZGF0ZSB0aGUgdmFsdWVzIG9mIHRoZSBzcGVjaWZpZWQgc291bmRzLlxuICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcyhpZCk7XG4gICAgZm9yICh2YXIgaT0wOyBpPGlkcy5sZW5ndGg7IGkrKykge1xuICAgICAgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWRzW2ldKTtcblxuICAgICAgaWYgKHNvdW5kKSB7XG4gICAgICAgIC8vIE1lcmdlIHRoZSBuZXcgdmFsdWVzIGludG8gdGhlIHNvdW5kLlxuICAgICAgICB2YXIgcGEgPSBzb3VuZC5fcGFubmVyQXR0cjtcbiAgICAgICAgcGEgPSB7XG4gICAgICAgICAgY29uZUlubmVyQW5nbGU6IHR5cGVvZiBvLmNvbmVJbm5lckFuZ2xlICE9PSAndW5kZWZpbmVkJyA/IG8uY29uZUlubmVyQW5nbGUgOiBwYS5jb25lSW5uZXJBbmdsZSxcbiAgICAgICAgICBjb25lT3V0ZXJBbmdsZTogdHlwZW9mIG8uY29uZU91dGVyQW5nbGUgIT09ICd1bmRlZmluZWQnID8gby5jb25lT3V0ZXJBbmdsZSA6IHBhLmNvbmVPdXRlckFuZ2xlLFxuICAgICAgICAgIGNvbmVPdXRlckdhaW46IHR5cGVvZiBvLmNvbmVPdXRlckdhaW4gIT09ICd1bmRlZmluZWQnID8gby5jb25lT3V0ZXJHYWluIDogcGEuY29uZU91dGVyR2FpbixcbiAgICAgICAgICBkaXN0YW5jZU1vZGVsOiB0eXBlb2Ygby5kaXN0YW5jZU1vZGVsICE9PSAndW5kZWZpbmVkJyA/IG8uZGlzdGFuY2VNb2RlbCA6IHBhLmRpc3RhbmNlTW9kZWwsXG4gICAgICAgICAgbWF4RGlzdGFuY2U6IHR5cGVvZiBvLm1heERpc3RhbmNlICE9PSAndW5kZWZpbmVkJyA/IG8ubWF4RGlzdGFuY2UgOiBwYS5tYXhEaXN0YW5jZSxcbiAgICAgICAgICBwYW5uaW5nTW9kZWw6IHR5cGVvZiBvLnBhbm5pbmdNb2RlbCAhPT0gJ3VuZGVmaW5lZCcgPyBvLnBhbm5pbmdNb2RlbCA6IHBhLnBhbm5pbmdNb2RlbCxcbiAgICAgICAgICByZWZEaXN0YW5jZTogdHlwZW9mIG8ucmVmRGlzdGFuY2UgIT09ICd1bmRlZmluZWQnID8gby5yZWZEaXN0YW5jZSA6IHBhLnJlZkRpc3RhbmNlLFxuICAgICAgICAgIHJvbGxvZmZGYWN0b3I6IHR5cGVvZiBvLnJvbGxvZmZGYWN0b3IgIT09ICd1bmRlZmluZWQnID8gby5yb2xsb2ZmRmFjdG9yIDogcGEucm9sbG9mZkZhY3RvclxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFVwZGF0ZSB0aGUgcGFubmVyIHZhbHVlcyBvciBjcmVhdGUgYSBuZXcgcGFubmVyIGlmIG5vbmUgZXhpc3RzLlxuICAgICAgICB2YXIgcGFubmVyID0gc291bmQuX3Bhbm5lcjtcbiAgICAgICAgaWYgKHBhbm5lcikge1xuICAgICAgICAgIHBhbm5lci5jb25lSW5uZXJBbmdsZSA9IHBhLmNvbmVJbm5lckFuZ2xlO1xuICAgICAgICAgIHBhbm5lci5jb25lT3V0ZXJBbmdsZSA9IHBhLmNvbmVPdXRlckFuZ2xlO1xuICAgICAgICAgIHBhbm5lci5jb25lT3V0ZXJHYWluID0gcGEuY29uZU91dGVyR2FpbjtcbiAgICAgICAgICBwYW5uZXIuZGlzdGFuY2VNb2RlbCA9IHBhLmRpc3RhbmNlTW9kZWw7XG4gICAgICAgICAgcGFubmVyLm1heERpc3RhbmNlID0gcGEubWF4RGlzdGFuY2U7XG4gICAgICAgICAgcGFubmVyLnBhbm5pbmdNb2RlbCA9IHBhLnBhbm5pbmdNb2RlbDtcbiAgICAgICAgICBwYW5uZXIucmVmRGlzdGFuY2UgPSBwYS5yZWZEaXN0YW5jZTtcbiAgICAgICAgICBwYW5uZXIucm9sbG9mZkZhY3RvciA9IHBhLnJvbGxvZmZGYWN0b3I7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTWFrZSBzdXJlIHdlIGhhdmUgYSBwb3NpdGlvbiB0byBzZXR1cCB0aGUgbm9kZSB3aXRoLlxuICAgICAgICAgIGlmICghc291bmQuX3Bvcykge1xuICAgICAgICAgICAgc291bmQuX3BvcyA9IHNlbGYuX3BvcyB8fCBbMCwgMCwgLTAuNV07XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gQ3JlYXRlIGEgbmV3IHBhbm5lciBub2RlLlxuICAgICAgICAgIHNldHVwUGFubmVyKHNvdW5kLCAnc3BhdGlhbCcpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgLyoqIFNpbmdsZSBTb3VuZCBNZXRob2RzICoqL1xuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBBZGQgbmV3IHByb3BlcnRpZXMgdG8gdGhlIGNvcmUgU291bmQgaW5pdC5cbiAgICogQHBhcmFtICB7RnVuY3Rpb259IF9zdXBlciBDb3JlIFNvdW5kIGluaXQgbWV0aG9kLlxuICAgKiBAcmV0dXJuIHtTb3VuZH1cbiAgICovXG4gIFNvdW5kLnByb3RvdHlwZS5pbml0ID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBwYXJlbnQgPSBzZWxmLl9wYXJlbnQ7XG5cbiAgICAgIC8vIFNldHVwIHVzZXItZGVmaW5lZCBkZWZhdWx0IHByb3BlcnRpZXMuXG4gICAgICBzZWxmLl9vcmllbnRhdGlvbiA9IHBhcmVudC5fb3JpZW50YXRpb247XG4gICAgICBzZWxmLl9zdGVyZW8gPSBwYXJlbnQuX3N0ZXJlbztcbiAgICAgIHNlbGYuX3BvcyA9IHBhcmVudC5fcG9zO1xuICAgICAgc2VsZi5fcGFubmVyQXR0ciA9IHBhcmVudC5fcGFubmVyQXR0cjtcblxuICAgICAgLy8gQ29tcGxldGUgaW5pdGlsaXphdGlvbiB3aXRoIGhvd2xlci5qcyBjb3JlIFNvdW5kJ3MgaW5pdCBmdW5jdGlvbi5cbiAgICAgIF9zdXBlci5jYWxsKHRoaXMpO1xuXG4gICAgICAvLyBJZiBhIHN0ZXJlbyBvciBwb3NpdGlvbiB3YXMgc3BlY2lmaWVkLCBzZXQgaXQgdXAuXG4gICAgICBpZiAoc2VsZi5fc3RlcmVvKSB7XG4gICAgICAgIHBhcmVudC5zdGVyZW8oc2VsZi5fc3RlcmVvKTtcbiAgICAgIH0gZWxzZSBpZiAoc2VsZi5fcG9zKSB7XG4gICAgICAgIHBhcmVudC5wb3Moc2VsZi5fcG9zWzBdLCBzZWxmLl9wb3NbMV0sIHNlbGYuX3Bvc1syXSwgc2VsZi5faWQpO1xuICAgICAgfVxuICAgIH07XG4gIH0pKFNvdW5kLnByb3RvdHlwZS5pbml0KTtcblxuICAvKipcbiAgICogT3ZlcnJpZGUgdGhlIFNvdW5kLnJlc2V0IG1ldGhvZCB0byBjbGVhbiB1cCBwcm9wZXJ0aWVzIGZyb20gdGhlIHNwYXRpYWwgcGx1Z2luLlxuICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gX3N1cGVyIFNvdW5kIHJlc2V0IG1ldGhvZC5cbiAgICogQHJldHVybiB7U291bmR9XG4gICAqL1xuICBTb3VuZC5wcm90b3R5cGUucmVzZXQgPSAoZnVuY3Rpb24oX3N1cGVyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIHBhcmVudCA9IHNlbGYuX3BhcmVudDtcblxuICAgICAgLy8gUmVzZXQgYWxsIHNwYXRpYWwgcGx1Z2luIHByb3BlcnRpZXMgb24gdGhpcyBzb3VuZC5cbiAgICAgIHNlbGYuX29yaWVudGF0aW9uID0gcGFyZW50Ll9vcmllbnRhdGlvbjtcbiAgICAgIHNlbGYuX3BvcyA9IHBhcmVudC5fcG9zO1xuICAgICAgc2VsZi5fcGFubmVyQXR0ciA9IHBhcmVudC5fcGFubmVyQXR0cjtcblxuICAgICAgLy8gQ29tcGxldGUgcmVzZXR0aW5nIG9mIHRoZSBzb3VuZC5cbiAgICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzKTtcbiAgICB9O1xuICB9KShTb3VuZC5wcm90b3R5cGUucmVzZXQpO1xuXG4gIC8qKiBIZWxwZXIgTWV0aG9kcyAqKi9cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IHBhbm5lciBub2RlIGFuZCBzYXZlIGl0IG9uIHRoZSBzb3VuZC5cbiAgICogQHBhcmFtICB7U291bmR9IHNvdW5kIFNwZWNpZmljIHNvdW5kIHRvIHNldHVwIHBhbm5pbmcgb24uXG4gICAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlIFR5cGUgb2YgcGFubmVyIHRvIGNyZWF0ZTogJ3N0ZXJlbycgb3IgJ3NwYXRpYWwnLlxuICAgKi9cbiAgdmFyIHNldHVwUGFubmVyID0gZnVuY3Rpb24oc291bmQsIHR5cGUpIHtcbiAgICB0eXBlID0gdHlwZSB8fCAnc3BhdGlhbCc7XG5cbiAgICAvLyBDcmVhdGUgdGhlIG5ldyBwYW5uZXIgbm9kZS5cbiAgICBpZiAodHlwZSA9PT0gJ3NwYXRpYWwnKSB7XG4gICAgICBzb3VuZC5fcGFubmVyID0gSG93bGVyLmN0eC5jcmVhdGVQYW5uZXIoKTtcbiAgICAgIHNvdW5kLl9wYW5uZXIuY29uZUlubmVyQW5nbGUgPSBzb3VuZC5fcGFubmVyQXR0ci5jb25lSW5uZXJBbmdsZTtcbiAgICAgIHNvdW5kLl9wYW5uZXIuY29uZU91dGVyQW5nbGUgPSBzb3VuZC5fcGFubmVyQXR0ci5jb25lT3V0ZXJBbmdsZTtcbiAgICAgIHNvdW5kLl9wYW5uZXIuY29uZU91dGVyR2FpbiA9IHNvdW5kLl9wYW5uZXJBdHRyLmNvbmVPdXRlckdhaW47XG4gICAgICBzb3VuZC5fcGFubmVyLmRpc3RhbmNlTW9kZWwgPSBzb3VuZC5fcGFubmVyQXR0ci5kaXN0YW5jZU1vZGVsO1xuICAgICAgc291bmQuX3Bhbm5lci5tYXhEaXN0YW5jZSA9IHNvdW5kLl9wYW5uZXJBdHRyLm1heERpc3RhbmNlO1xuICAgICAgc291bmQuX3Bhbm5lci5wYW5uaW5nTW9kZWwgPSBzb3VuZC5fcGFubmVyQXR0ci5wYW5uaW5nTW9kZWw7XG4gICAgICBzb3VuZC5fcGFubmVyLnJlZkRpc3RhbmNlID0gc291bmQuX3Bhbm5lckF0dHIucmVmRGlzdGFuY2U7XG4gICAgICBzb3VuZC5fcGFubmVyLnJvbGxvZmZGYWN0b3IgPSBzb3VuZC5fcGFubmVyQXR0ci5yb2xsb2ZmRmFjdG9yO1xuICAgICAgc291bmQuX3Bhbm5lci5zZXRQb3NpdGlvbihzb3VuZC5fcG9zWzBdLCBzb3VuZC5fcG9zWzFdLCBzb3VuZC5fcG9zWzJdKTtcbiAgICAgIHNvdW5kLl9wYW5uZXIuc2V0T3JpZW50YXRpb24oc291bmQuX29yaWVudGF0aW9uWzBdLCBzb3VuZC5fb3JpZW50YXRpb25bMV0sIHNvdW5kLl9vcmllbnRhdGlvblsyXSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNvdW5kLl9wYW5uZXIgPSBIb3dsZXIuY3R4LmNyZWF0ZVN0ZXJlb1Bhbm5lcigpO1xuICAgICAgc291bmQuX3Bhbm5lci5wYW4udmFsdWUgPSBzb3VuZC5fc3RlcmVvO1xuICAgIH1cblxuICAgIHNvdW5kLl9wYW5uZXIuY29ubmVjdChzb3VuZC5fbm9kZSk7XG5cbiAgICAvLyBVcGRhdGUgdGhlIGNvbm5lY3Rpb25zLlxuICAgIGlmICghc291bmQuX3BhdXNlZCkge1xuICAgICAgc291bmQuX3BhcmVudC5wYXVzZShzb3VuZC5faWQsIHRydWUpLnBsYXkoc291bmQuX2lkKTtcbiAgICB9XG4gIH07XG59KSgpO1xuIiwiY29uc3QgY29uZmlnID0gcmVxdWlyZSgnLi8uLi8uLi9jb25maWcnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbG9yTmFtZShjb2xvcikge1xuICBpZiAoY29sb3IgaW4gY29uZmlnLnBhbGV0dGUuY29sb3JOYW1lcykge1xuICAgIHJldHVybiBjb25maWcucGFsZXR0ZS5jb2xvck5hbWVzW2NvbG9yXTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuIiwiKGZ1bmN0aW9uIChyb290LCBmYWN0b3J5KSB7XG5cblx0aWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuXHRcdGRlZmluZShbXSwgZmFjdG9yeSk7XG5cdH1cblx0ZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gXCJ1bmRlZmluZWRcIiAmJiBtb2R1bGUuZXhwb3J0cykge1xuXHRcdG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuXHR9XG5cdGVsc2Uge1xuXHRcdHJvb3QuU2hhcGVEZXRlY3RvciA9IGZhY3RvcnkoKTtcblx0fVxufSh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cblx0dmFyIF9uYlNhbXBsZVBvaW50cztcblx0dmFyIF9zcXVhcmVTaXplID0gMjUwO1xuXHR2YXIgX3BoaSA9IDAuNSAqICgtMS4wICsgTWF0aC5zcXJ0KDUuMCkpO1xuXHR2YXIgX2FuZ2xlUmFuZ2UgPSBkZWcyUmFkKDQ1LjApO1xuXHR2YXIgX2FuZ2xlUHJlY2lzaW9uID0gZGVnMlJhZCgyLjApO1xuXHR2YXIgX2hhbGZEaWFnb25hbCA9IE1hdGguc3FydChfc3F1YXJlU2l6ZSAqIF9zcXVhcmVTaXplICsgX3NxdWFyZVNpemUgKiBfc3F1YXJlU2l6ZSkgKiAwLjU7XG5cdHZhciBfb3JpZ2luID0geyB4OiAwLCB5OiAwIH07XG5cblx0ZnVuY3Rpb24gZGVnMlJhZCAoZCkge1xuXG5cdFx0cmV0dXJuIGQgKiBNYXRoLlBJIC8gMTgwLjA7XG5cdH07XG5cblx0ZnVuY3Rpb24gZ2V0RGlzdGFuY2UgKGEsIGIpIHtcblxuXHRcdHZhciBkeCA9IGIueCAtIGEueDtcblx0XHR2YXIgZHkgPSBiLnkgLSBhLnk7XG5cblx0XHRyZXR1cm4gTWF0aC5zcXJ0KGR4ICogZHggKyBkeSAqIGR5KTtcblx0fTtcblxuXHRmdW5jdGlvbiBTdHJva2UgKHBvaW50cywgbmFtZSkge1xuXG5cdFx0dGhpcy5wb2ludHMgPSBwb2ludHM7XG5cdFx0dGhpcy5uYW1lID0gbmFtZTtcblx0XHR0aGlzLnByb2Nlc3NTdHJva2UoKTtcblx0fTtcblxuXHRTdHJva2UucHJvdG90eXBlLnByb2Nlc3NTdHJva2UgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHR0aGlzLnBvaW50cyA9IHRoaXMucmVzYW1wbGUoKTtcblx0XHR0aGlzLnNldENlbnRyb2lkKCk7XG5cdFx0dGhpcy5wb2ludHMgPSB0aGlzLnJvdGF0ZUJ5KC10aGlzLmluZGljYXRpdmVBbmdsZSgpKTtcblx0XHR0aGlzLnBvaW50cyA9IHRoaXMuc2NhbGVUb1NxdWFyZSgpO1xuXHRcdHRoaXMuc2V0Q2VudHJvaWQoKTtcblx0XHR0aGlzLnBvaW50cyA9IHRoaXMudHJhbnNsYXRlVG9PcmlnaW4oKTtcblxuXHRcdHJldHVybiB0aGlzO1xuXHR9O1xuXG5cdFN0cm9rZS5wcm90b3R5cGUucmVzYW1wbGUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgbG9jYWxEaXN0YW5jZSwgcTtcblx0XHR2YXIgaW50ZXJ2YWwgPSB0aGlzLnN0cm9rZUxlbmd0aCgpIC8gKF9uYlNhbXBsZVBvaW50cyAtIDEpO1xuXHRcdHZhciBkaXN0YW5jZSA9IDAuMDtcblx0XHR2YXIgbmV3UG9pbnRzID0gW3RoaXMucG9pbnRzWzBdXTtcblxuXHRcdGZvciAodmFyIGkgPSAxOyBpIDwgdGhpcy5wb2ludHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGxvY2FsRGlzdGFuY2UgPSBnZXREaXN0YW5jZSh0aGlzLnBvaW50c1tpIC0gMV0sIHRoaXMucG9pbnRzW2ldKTtcblxuXHRcdFx0aWYgKGRpc3RhbmNlICsgbG9jYWxEaXN0YW5jZSA+PSBpbnRlcnZhbCkge1xuXHRcdFx0XHRxID0ge1xuXHRcdFx0XHRcdHg6IHRoaXMucG9pbnRzW2kgLSAxXS54ICsgKChpbnRlcnZhbCAtIGRpc3RhbmNlKSAvIGxvY2FsRGlzdGFuY2UpICogKHRoaXMucG9pbnRzW2ldLnggLSB0aGlzLnBvaW50c1tpIC0gMV0ueCksXG5cdFx0XHRcdFx0eTogdGhpcy5wb2ludHNbaSAtIDFdLnkgKyAoKGludGVydmFsIC0gZGlzdGFuY2UpIC8gbG9jYWxEaXN0YW5jZSkgKiAodGhpcy5wb2ludHNbaV0ueSAtIHRoaXMucG9pbnRzW2kgLSAxXS55KVxuXHRcdFx0XHR9O1xuXG5cdFx0XHRcdG5ld1BvaW50cy5wdXNoKHEpO1xuXHRcdFx0XHR0aGlzLnBvaW50cy5zcGxpY2UoaSwgMCwgcSk7XG5cdFx0XHRcdGRpc3RhbmNlID0gMC4wO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGRpc3RhbmNlICs9IGxvY2FsRGlzdGFuY2U7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0aWYgKG5ld1BvaW50cy5sZW5ndGggPT09IF9uYlNhbXBsZVBvaW50cyAtIDEpIHtcblx0XHRcdG5ld1BvaW50cy5wdXNoKHRoaXMucG9pbnRzW3RoaXMucG9pbnRzLmxlbmd0aCAtIDFdKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3UG9pbnRzO1xuXHR9O1xuXG5cdFN0cm9rZS5wcm90b3R5cGUucm90YXRlQnkgPSBmdW5jdGlvbiAoYW5nbGUpIHtcblxuXHRcdHZhciBwb2ludDtcblx0XHR2YXIgY29zID0gTWF0aC5jb3MoYW5nbGUpO1xuXHRcdHZhciBzaW4gPSBNYXRoLnNpbihhbmdsZSk7XG5cdFx0dmFyIG5ld1BvaW50cyA9IFtdO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBvaW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cG9pbnQgPSB0aGlzLnBvaW50c1tpXTtcblxuXHRcdFx0bmV3UG9pbnRzLnB1c2goe1xuXHRcdFx0XHR4OiAocG9pbnQueCAtIHRoaXMuYy54KSAqIGNvcyAtIChwb2ludC55IC0gdGhpcy5jLnkpICogc2luICsgdGhpcy5jLngsXG5cdFx0XHRcdHk6IChwb2ludC54IC0gdGhpcy5jLngpICogc2luICsgKHBvaW50LnkgLSB0aGlzLmMueSkgKiBjb3MgKyB0aGlzLmMueVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ld1BvaW50cztcblx0fTtcblxuXHRTdHJva2UucHJvdG90eXBlLnNjYWxlVG9TcXVhcmUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgcG9pbnQ7XG5cdFx0dmFyIG5ld1BvaW50cyA9IFtdXG5cdFx0dmFyIGJveCA9IHtcblx0XHRcdG1pblg6ICtJbmZpbml0eSxcblx0XHRcdG1heFg6IC1JbmZpbml0eSxcblx0XHRcdG1pblk6ICtJbmZpbml0eSxcblx0XHRcdG1heFk6IC1JbmZpbml0eVxuXHRcdH07XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucG9pbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRwb2ludCA9IHRoaXMucG9pbnRzW2ldO1xuXG5cdFx0XHRib3gubWluWCA9IE1hdGgubWluKGJveC5taW5YLCBwb2ludC54KTtcblx0XHRcdGJveC5taW5ZID0gTWF0aC5taW4oYm94Lm1pblksIHBvaW50LnkpO1xuXHRcdFx0Ym94Lm1heFggPSBNYXRoLm1heChib3gubWF4WCwgcG9pbnQueCk7XG5cdFx0XHRib3gubWF4WSA9IE1hdGgubWF4KGJveC5tYXhZLCBwb2ludC55KTtcblx0XHR9XG5cblx0XHRib3gud2lkdGggPSBib3gubWF4WCAtIGJveC5taW5YO1xuXHRcdGJveC5oZWlnaHQgPSBib3gubWF4WSAtIGJveC5taW5ZO1xuXG5cdFx0Zm9yIChpID0gMDsgaSA8IHRoaXMucG9pbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRwb2ludCA9IHRoaXMucG9pbnRzW2ldO1xuXG5cdFx0XHRuZXdQb2ludHMucHVzaCh7XG5cdFx0XHRcdHg6IHBvaW50LnggKiAoX3NxdWFyZVNpemUgLyBib3gud2lkdGgpLFxuXHRcdFx0XHR5OiBwb2ludC55ICogKF9zcXVhcmVTaXplIC8gYm94LmhlaWdodClcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXdQb2ludHM7XG5cdH07XG5cblx0U3Ryb2tlLnByb3RvdHlwZS50cmFuc2xhdGVUb09yaWdpbiA9IGZ1bmN0aW9uIChwb2ludHMpIHtcblxuXHRcdHZhciBwb2ludDtcblx0XHR2YXIgbmV3UG9pbnRzID0gW107XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucG9pbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRwb2ludCA9IHRoaXMucG9pbnRzW2ldO1xuXG5cdFx0XHRuZXdQb2ludHMucHVzaCh7XG5cdFx0XHRcdHg6IHBvaW50LnggKyBfb3JpZ2luLnggLSB0aGlzLmMueCxcblx0XHRcdFx0eTogcG9pbnQueSArIF9vcmlnaW4ueSAtIHRoaXMuYy55XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3UG9pbnRzO1xuXHR9O1xuXG5cdFN0cm9rZS5wcm90b3R5cGUuc2V0Q2VudHJvaWQgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgcG9pbnQ7XG5cdFx0dGhpcy5jID0ge1xuXHRcdFx0eDogMC4wLFxuXHRcdFx0eTogMC4wXG5cdFx0fTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wb2ludHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHBvaW50ID0gdGhpcy5wb2ludHNbaV07XG5cblx0XHRcdHRoaXMuYy54ICs9IHBvaW50Lng7XG5cdFx0XHR0aGlzLmMueSArPSBwb2ludC55O1xuXHRcdH1cblxuXHRcdHRoaXMuYy54IC89IHRoaXMucG9pbnRzLmxlbmd0aDtcblx0XHR0aGlzLmMueSAvPSB0aGlzLnBvaW50cy5sZW5ndGg7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fTtcblxuXHRTdHJva2UucHJvdG90eXBlLmluZGljYXRpdmVBbmdsZSA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdHJldHVybiBNYXRoLmF0YW4yKHRoaXMuYy55IC0gdGhpcy5wb2ludHNbMF0ueSwgdGhpcy5jLnggLSB0aGlzLnBvaW50c1swXS54KTtcblx0fTtcblxuXHRTdHJva2UucHJvdG90eXBlLnN0cm9rZUxlbmd0aCA9IGZ1bmN0aW9uICgpIHtcblxuXHRcdHZhciBkID0gMC4wO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDE7IGkgPCB0aGlzLnBvaW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0ZCArPSBnZXREaXN0YW5jZSh0aGlzLnBvaW50c1tpIC0gMV0sIHRoaXMucG9pbnRzW2ldKTtcblx0XHR9XG5cblx0XHRyZXR1cm4gZDtcblx0fTtcblxuXHRTdHJva2UucHJvdG90eXBlLmRpc3RhbmNlQXRCZXN0QW5nbGUgPSBmdW5jdGlvbiAocGF0dGVybikge1xuXG5cdFx0dmFyIGEgPSAtX2FuZ2xlUmFuZ2U7XG5cdFx0dmFyIGIgPSBfYW5nbGVSYW5nZTtcblx0XHR2YXIgeDEgPSBfcGhpICogYSArICgxLjAgLSBfcGhpKSAqIGI7XG5cdFx0dmFyIGYxID0gdGhpcy5kaXN0YW5jZUF0QW5nbGUocGF0dGVybiwgeDEpO1xuXHRcdHZhciB4MiA9ICgxLjAgLSBfcGhpKSAqIGEgKyBfcGhpICogYjtcblx0XHR2YXIgZjIgPSB0aGlzLmRpc3RhbmNlQXRBbmdsZShwYXR0ZXJuLCB4Mik7XG5cblx0XHR3aGlsZSAoTWF0aC5hYnMoYiAtIGEpID4gX2FuZ2xlUHJlY2lzaW9uKSB7XG5cblx0XHRcdGlmIChmMSA8IGYyKSB7XG5cdFx0XHRcdGIgPSB4Mjtcblx0XHRcdFx0eDIgPSB4MTtcblx0XHRcdFx0ZjIgPSBmMTtcblx0XHRcdFx0eDEgPSBfcGhpICogYSArICgxLjAgLSBfcGhpKSAqIGI7XG5cdFx0XHRcdGYxID0gdGhpcy5kaXN0YW5jZUF0QW5nbGUocGF0dGVybiwgeDEpO1xuXHRcdFx0fVxuXHRcdFx0ZWxzZSB7XG5cdFx0XHRcdGEgPSB4MTtcblx0XHRcdFx0eDEgPSB4Mjtcblx0XHRcdFx0ZjEgPSBmMjtcblx0XHRcdFx0eDIgPSAoMS4wIC0gX3BoaSkgKiBhICsgX3BoaSAqIGI7XG5cdFx0XHRcdGYyID0gdGhpcy5kaXN0YW5jZUF0QW5nbGUocGF0dGVybiwgeDIpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJldHVybiBNYXRoLm1pbihmMSwgZjIpO1xuXHR9O1xuXG5cdFN0cm9rZS5wcm90b3R5cGUuZGlzdGFuY2VBdEFuZ2xlID0gZnVuY3Rpb24gKHBhdHRlcm4sIGFuZ2xlKSB7XG5cblx0XHR2YXIgc3Ryb2tlUG9pbnRzID0gdGhpcy5yb3RhdGVCeShhbmdsZSk7XG5cdFx0dmFyIHBhdHRlcm5Qb2ludHMgPSBwYXR0ZXJuLnBvaW50cztcblx0XHR2YXIgZCA9IDAuMDtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgc3Ryb2tlUG9pbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRkICs9IGdldERpc3RhbmNlKHN0cm9rZVBvaW50c1tpXSwgcGF0dGVyblBvaW50c1tpXSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGQgLyBzdHJva2VQb2ludHMubGVuZ3RoO1xuXHR9O1xuXG5cdGZ1bmN0aW9uIFNoYXBlRGV0ZWN0b3IgKHBhdHRlcm5zLCBvcHRpb25zKSB7XG5cblx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblx0XHR0aGlzLnRocmVzaG9sZCA9IG9wdGlvbnMudGhyZXNob2xkIHx8IDA7XG5cdFx0X25iU2FtcGxlUG9pbnRzID0gb3B0aW9ucy5uYlNhbXBsZVBvaW50cyB8fCA2NDtcblxuXHRcdHRoaXMucGF0dGVybnMgPSBbXTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgcGF0dGVybnMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHRoaXMubGVhcm4ocGF0dGVybnNbaV0ubmFtZSwgcGF0dGVybnNbaV0ucG9pbnRzKTtcblx0XHR9XG5cdH1cblxuXHRTaGFwZURldGVjdG9yLmRlZmF1bHRTaGFwZXMgPSBbXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OjQ3LCB5IDo1NSB9LCB7IHg6MTU2LCB5IDo1NSB9XSxcblx0XHRcdG5hbWU6IFwibGluZVwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwb2ludHM6IFt7IHg6NTcsIHkgOjE1OCB9LCB7IHg6MTQ4LCB5IDo3NSB9LCB7IHg6MjA3LCB5IDoyOSB9XSxcblx0XHRcdG5hbWU6IFwibGluZVwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwb2ludHM6IFt7IHg6MjIsIHkgOjM4IH0sIHsgeDo2MCwgeSA6NTUgfSwgeyB4OjExOSwgeSA6ODcgfSwgeyB4OjE4NiwgeSA6MTI1IH0sIHsgeDoyNTksIHkgOjE1OCB9LCB7IHg6MjcxLCB5IDoxNjEgfSwgeyB4OjI3NywgeSA6MTY2IH0sIHsgeDoyOTUsIHkgOjE3MiB9XSxcblx0XHRcdG5hbWU6IFwibGluZVwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwb2ludHM6IFt7IHg6MTU0LCB5IDo0MiB9LCB7IHg6MTU3LCB5IDoxNTAgfSwgeyB4OjE2MCwgeSA6MjQwIH0sIHsgeDoxNjgsIHkgOjMyNSB9LCB7IHg6MTcxLCB5IDozMzkgfV0sXG5cdFx0XHRuYW1lOiBcImxpbmVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OjksIHkgOjk1IH0sIHsgeDoyMywgeSA6NjYgfSwgeyB4OjU3LCB5IDo0MSB9LCB7IHg6ODMsIHkgOjQ4IH0sIHsgeDoxMTYsIHkgOjgxIH0sIHsgeDoxNzQsIHkgOjEwMiB9LCB7IHg6MjU2LCB5IDo0NSB9LCB7IHg6MzEyLCB5IDoxOCB9LCB7IHg6MzcxLCB5IDo3NCB9LCB7IHg6MzgyLCB5IDo5OCB9LCB7IHg6Mzg4LCB5IDoxMDggfV0sXG5cdFx0XHRuYW1lOiBcImxpbmVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OjE1MSwgeSA6NyB9LCB7IHg6MTQxLCB5IDoxNyB9LCB7IHg6MTIxLCB5IDo1MCB9LCB7IHg6MTQ5LCB5IDo2OSB9LCB7IHg6MTcwLCB5IDo5MiB9LCB7IHg6MTk4LCB5IDoxNzIgfSwgeyB4OjE5MSwgeSA6MjM3IH0sIHsgeDoxNzAsIHkgOjI4NyB9LCB7IHg6MTczLCB5IDozMDYgfSwgeyB4OjIyOSwgeSA6MzYzIH0sIHsgeDoyNTksIHkgOjM4OCB9XSxcblx0XHRcdG5hbWU6IFwibGluZVwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwb2ludHM6IFt7IHg6NzEsIHkgOjI3OSB9LCB7IHg6MjIwLCB5IDoyNzkgfSwgeyB4OjI5MCwgeSA6MjczIH0sIHsgeDo0MjQsIHkgOjI2OSB9LCB7IHg6NTkzLCB5IDoyNjkgfSwgeyB4OjY4OSwgeSA6MjY0IH0sIHsgeDo3NjMsIHkgOjI0MCB9LCB7IHg6ODczLCB5IDoyMjggfSwgeyB4OjkwMSwgeSA6MjMxIH0sIHsgeDo5MTIsIHkgOjIzMyB9LCB7IHg6OTE4LCB5IDoyMjcgfV0sXG5cdFx0XHRuYW1lOiBcImxpbmVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OjU2NSwgeSA6OTEgfSwgeyB4OjU2NSwgeSA6NTAxIH1dLFxuXHRcdFx0bmFtZTogXCJsaW5lXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDoxMzEsIHkgOjc5IH0sIHsgeDoxMzEsIHkgOjM4MyB9XSxcblx0XHRcdG5hbWU6IFwibGluZVwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwb2ludHM6IFt7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTU3LjY5Njg3ODQzMzIyNzQ4LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDE5Mi43NDA2MjkxOTYxNjY5LCB5OiAzMTUuMzkzNzU2ODY2NDU0OTYgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMjI3Ljc4NDM3OTk1OTEwNjM2LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDI2Mi44MjgxMzA3MjIwNDU4LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjk3Ljg3MTg4MTQ4NDk4NTI0LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogMzMyLjkxNTYzMjI0NzkyNDcsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDM2Ny45NTkzODMwMTA4NjQxNCwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogNDAzLjAwMzEzMzc3MzgwMzU0LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjd9XSxcblx0XHRcdG5hbWU6IFwidHJpYW5nbGVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjk3Ljg3MTg4MTQ4NDk4NTI0LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogMzMyLjkxNTYzMjI0NzkyNDcsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDM2Ny45NTkzODMwMTA4NjQxNCwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogNDAzLjAwMzEzMzc3MzgwMzU0LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE1Ny42OTY4Nzg0MzMyMjc0OCwgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiAxOTIuNzQwNjI5MTk2MTY2OSwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDIyNy43ODQzNzk5NTkxMDYzNiwgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiAyNjIuODI4MTMwNzIyMDQ1OCwgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2fV0sXG5cdFx0XHRuYW1lOiBcInRyaWFuZ2xlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogIFt7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNTcuNjk2ODc4NDMzMjI3NDgsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogMTkyLjc0MDYyOTE5NjE2NjksIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiAyMjcuNzg0Mzc5OTU5MTA2MzYsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogMjYyLjgyODEzMDcyMjA0NTgsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyOTcuODcxODgxNDg0OTg1MjQsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogMzE1LjM5Mzc1Njg2NjQ1NDk2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiAzMzIuOTE1NjMyMjQ3OTI0NywgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMzY3Ljk1OTM4MzAxMDg2NDE0LCB5OiAzMTUuMzkzNzU2ODY2NDU0OTYgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiA0MDMuMDAzMTMzNzczODAzNTQsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjd9XSxcblx0XHRcdG5hbWU6IFwidHJpYW5nbGVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDAzLjAwMzEzMzc3MzgwMzU0LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDM2Ny45NTkzODMwMTA4NjQxLCB5OiAzMTUuMzkzNzU2ODY2NDU0OTYgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiAzMzIuOTE1NjMyMjQ3OTI0NywgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogMzE1LjM5Mzc1Njg2NjQ1NDk2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiAyOTcuODcxODgxNDg0OTg1MjQsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyNjIuODI4MTMwNzIyMDQ1OCwgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDIyNy43ODQzNzk5NTkxMDYzNiwgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDE5Mi43NDA2MjkxOTYxNjY5LCB5OiAzMTUuMzkzNzU2ODY2NDU0OTYgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiAxNTcuNjk2ODc4NDMzMjI3NDgsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjd9XSxcblx0XHRcdG5hbWU6IFwidHJpYW5nbGVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQwMy4wMDMxMzM3NzM4MDM1NCwgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiAzNjcuOTU5MzgzMDEwODY0MSwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMzMyLjkxNTYzMjI0NzkyNDcsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogMjk3Ljg3MTg4MTQ4NDk4NTI0LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjYyLjgyODEzMDcyMjA0NTgsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiAyMjcuNzg0Mzc5OTU5MTA2MzYsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiAxOTIuNzQwNjI5MTk2MTY2OSwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogMTU3LjY5Njg3ODQzMzIyNzQ4LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjd9XSxcblx0XHRcdG5hbWU6IFwidHJpYW5nbGVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjYyLjgyODEzMDcyMjA0NTgsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiAyMjcuNzg0Mzc5OTU5MTA2MzYsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiAxOTIuNzQwNjI5MTk2MTY2OSwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogMTU3LjY5Njg3ODQzMzIyNzQ4LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQwMy4wMDMxMzM3NzM4MDM1NCwgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiAzNjcuOTU5MzgzMDEwODY0MSwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMzMyLjkxNTYzMjI0NzkyNDcsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogMjk3Ljg3MTg4MTQ4NDk4NTI0LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzZ9XSxcblx0XHRcdG5hbWU6IFwidHJpYW5nbGVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzMTUuMzkzNzU2ODY2NDU0OTYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzMTUuMzkzNzU2ODY2NDU0OTYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3Nn1dLFxuXHRcdFx0bmFtZTogXCJzcXVhcmVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE0MC4xNzUwMDMwNTE3NTc3Nn1dLFxuXHRcdFx0bmFtZTogXCJzcXVhcmVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiAgW3sgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzMTUuMzkzNzU2ODY2NDU0OTYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzE1LjM5Mzc1Njg2NjQ1NDk2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjd9XSxcblx0XHRcdG5hbWU6IFwic3F1YXJlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzMTUuMzkzNzU2ODY2NDU0OTYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjd9XSxcblx0XHRcdG5hbWU6IFwic3F1YXJlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogIFt7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzE1LjM5Mzc1Njg2NjQ1NDk2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzE1LjM5Mzc1Njg2NjQ1NDk2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzMTUuMzkzNzU2ODY2NDU0OTYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3fV0sXG5cdFx0XHRuYW1lOiBcInNxdWFyZVwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwb2ludHM6ICBbeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzMTUuMzkzNzU2ODY2NDU0OTYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyN31dLFxuXHRcdFx0bmFtZTogXCJzcXVhcmVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzE1LjM5Mzc1Njg2NjQ1NDk2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzMTUuMzkzNzU2ODY2NDU0OTYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzMTUuMzkzNzU2ODY2NDU0OTYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE0MC4xNzUwMDMwNTE3NTc3Nn1dLFxuXHRcdFx0bmFtZTogXCJzcXVhcmVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzE1LjM5Mzc1Njg2NjQ1NDk2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzE1LjM5Mzc1Njg2NjQ1NDk2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3Nn1dLFxuXHRcdFx0bmFtZTogXCJzcXVhcmVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogNDE4LjM5NTQzNTg4NzM5NjUsIHk6IDMwNC42OTExMzk5Mzc5MDk2NyB9LCB7IHg6IDQxMi4wNzE0MjIwODk4OTQ0NCwgeTogMzI4LjI5MjY4MDczNzk1MzczIH0sIHsgeDogNDAxLjc0NTExOTcyMTg5ODk2LCB5OiAzNTAuNDM3NTA3NjI5Mzk0MzYgfSwgeyB4OiAzODcuNzMwMjg4MjU1NTAwMzQsIHk6IDM3MC40NTI3NjEyNTI5NTgyIH0sIHsgeDogMzcwLjQ1Mjc2MTI1Mjk1ODIsIHk6IDM4Ny43MzAyODgyNTU1MDAzNCB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MDEuNzQ1MTE5NzIxODk4OTYgfSwgeyB4OiAzMjguMjkyNjgwNzM3OTUzOCwgeTogNDEyLjA3MTQyMjA4OTg5NDQ0IH0sIHsgeDogMzA0LjY5MTEzOTkzNzkwOTY3LCB5OiA0MTguMzk1NDM1ODg3Mzk2NSB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyNTYuMDA4ODcyMjY5MTIxNCwgeTogNDE4LjM5NTQzNTg4NzM5NjUgfSwgeyB4OiAyMzIuNDA3MzMxNDY5MDc3MywgeTogNDEyLjA3MTQyMjA4OTg5NDQ0IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjY2LCB5OiA0MDEuNzQ1MTE5NzIxODk4OTYgfSwgeyB4OiAxOTAuMjQ3MjUwOTU0MDcyOCwgeTogMzg3LjczMDI4ODI1NTUwMDM0IH0sIHsgeDogMTcyLjk2OTcyMzk1MTUzMDcsIHk6IDM3MC40NTI3NjEyNTI5NTgyIH0sIHsgeDogMTU4Ljk1NDg5MjQ4NTEzMjA2LCB5OiAzNTAuNDM3NTA3NjI5Mzk0MzYgfSwgeyB4OiAxNDguNjI4NTkwMTE3MTM2NTgsIHk6IDMyOC4yOTI2ODA3Mzc5NTM4IH0sIHsgeDogMTQyLjMwNDU3NjMxOTYzNDU1LCB5OiAzMDQuNjkxMTM5OTM3OTA5NiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiAxNDIuMzA0NTc2MzE5NjM0NTUsIHk6IDI1Ni4wMDg4NzIyNjkxMjEzNSB9LCB7IHg6IDE0OC42Mjg1OTAxMTcxMzY1NSwgeTogMjMyLjQwNzMzMTQ2OTA3NzMgfSwgeyB4OiAxNTguOTU0ODkyNDg1MTMyMSwgeTogMjEwLjI2MjUwNDU3NzYzNjYgfSwgeyB4OiAxNzIuOTY5NzIzOTUxNTMwNjgsIHk6IDE5MC4yNDcyNTA5NTQwNzI4IH0sIHsgeDogMTkwLjI0NzI1MDk1NDA3Mjc3LCB5OiAxNzIuOTY5NzIzOTUxNTMwNyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY1OCwgeTogMTU4Ljk1NDg5MjQ4NTEzMjEyIH0sIHsgeDogMjMyLjQwNzMzMTQ2OTA3NzE4LCB5OiAxNDguNjI4NTkwMTE3MTM2NTggfSwgeyB4OiAyNTYuMDA4ODcyMjY5MTIxMzUsIHk6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzMDQuNjkxMTM5OTM3OTA5NiwgeTogMTQyLjMwNDU3NjMxOTYzNDU1IH0sIHsgeDogMzI4LjI5MjY4MDczNzk1MzcsIHk6IDE0OC42Mjg1OTAxMTcxMzY1MyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiAxNTguOTU0ODkyNDg1MTMyMSB9LCB7IHg6IDM3MC40NTI3NjEyNTI5NTgyLCB5OiAxNzIuOTY5NzIzOTUxNTMwNjggfSwgeyB4OiAzODcuNzMwMjg4MjU1NTAwMzQsIHk6IDE5MC4yNDcyNTA5NTQwNzI3NCB9LCB7IHg6IDQwMS43NDUxMTk3MjE4OTg5LCB5OiAyMTAuMjYyNTA0NTc3NjM2NTggfSwgeyB4OiA0MTIuMDcxNDIyMDg5ODk0NDQsIHk6IDIzMi40MDczMzE0NjkwNzczIH0sIHsgeDogNDE4LjM5NTQzNTg4NzM5NjQ1LCB5OiAyNTYuMDA4ODcyMjY5MTIxMjQgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI4MC4zNTAwMDYxMDM1MTU0NX1dLFxuXHRcdFx0bmFtZTogXCJjaXJjbGVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogNDE4LjM5NTQzNTg4NzM5NjUsIHk6IDI1Ni4wMDg4NzIyNjkxMjEzNSB9LCB7IHg6IDQxMi4wNzE0MjIwODk4OTQ0NCwgeTogMjMyLjQwNzMzMTQ2OTA3NzMgfSwgeyB4OiA0MDEuNzQ1MTE5NzIxODk4OTYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2NiB9LCB7IHg6IDM4Ny43MzAyODgyNTU1MDAzNCwgeTogMTkwLjI0NzI1MDk1NDA3MjggfSwgeyB4OiAzNzAuNDUyNzYxMjUyOTU4MiwgeTogMTcyLjk2OTcyMzk1MTUzMDY4IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDE1OC45NTQ4OTI0ODUxMzIxIH0sIHsgeDogMzI4LjI5MjY4MDczNzk1MzgsIHk6IDE0OC42Mjg1OTAxMTcxMzY1OCB9LCB7IHg6IDMwNC42OTExMzk5Mzc5MDk2NywgeTogMTQyLjMwNDU3NjMxOTYzNDU1IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI1Ni4wMDg4NzIyNjkxMjE0LCB5OiAxNDIuMzA0NTc2MzE5NjM0NTUgfSwgeyB4OiAyMzIuNDA3MzMxNDY5MDc3MywgeTogMTQ4LjYyODU5MDExNzEzNjU1IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjY2LCB5OiAxNTguOTU0ODkyNDg1MTMyMDYgfSwgeyB4OiAxOTAuMjQ3MjUwOTU0MDcyOCwgeTogMTcyLjk2OTcyMzk1MTUzMDY4IH0sIHsgeDogMTcyLjk2OTcyMzk1MTUzMDcsIHk6IDE5MC4yNDcyNTA5NTQwNzI3NyB9LCB7IHg6IDE1OC45NTQ4OTI0ODUxMzIwNiwgeTogMjEwLjI2MjUwNDU3NzYzNjY2IH0sIHsgeDogMTQ4LjYyODU5MDExNzEzNjU4LCB5OiAyMzIuNDA3MzMxNDY5MDc3MjMgfSwgeyB4OiAxNDIuMzA0NTc2MzE5NjM0NTUsIHk6IDI1Ni4wMDg4NzIyNjkxMjE0IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSwgeTogMzA0LjY5MTEzOTkzNzkwOTY3IH0sIHsgeDogMTQ4LjYyODU5MDExNzEzNjU1LCB5OiAzMjguMjkyNjgwNzM3OTUzNzMgfSwgeyB4OiAxNTguOTU0ODkyNDg1MTMyMSwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiAxNzIuOTY5NzIzOTUxNTMwNjgsIHk6IDM3MC40NTI3NjEyNTI5NTgyIH0sIHsgeDogMTkwLjI0NzI1MDk1NDA3Mjc3LCB5OiAzODcuNzMwMjg4MjU1NTAwMzQgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NTgsIHk6IDQwMS43NDUxMTk3MjE4OTg5IH0sIHsgeDogMjMyLjQwNzMzMTQ2OTA3NzE4LCB5OiA0MTIuMDcxNDIyMDg5ODk0NDQgfSwgeyB4OiAyNTYuMDA4ODcyMjY5MTIxMzUsIHk6IDQxOC4zOTU0MzU4ODczOTY1IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDMwNC42OTExMzk5Mzc5MDk2LCB5OiA0MTguMzk1NDM1ODg3Mzk2NSB9LCB7IHg6IDMyOC4yOTI2ODA3Mzc5NTM3LCB5OiA0MTIuMDcxNDIyMDg5ODk0NSB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MDEuNzQ1MTE5NzIxODk4OTYgfSwgeyB4OiAzNzAuNDUyNzYxMjUyOTU4MiwgeTogMzg3LjczMDI4ODI1NTUwMDM0IH0sIHsgeDogMzg3LjczMDI4ODI1NTUwMDM0LCB5OiAzNzAuNDUyNzYxMjUyOTU4MyB9LCB7IHg6IDQwMS43NDUxMTk3MjE4OTg5LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDQxMi4wNzE0MjIwODk4OTQ0NCwgeTogMzI4LjI5MjY4MDczNzk1MzczIH0sIHsgeDogNDE4LjM5NTQzNTg4NzM5NjQ1LCB5OiAzMDQuNjkxMTM5OTM3OTA5OCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjgwLjM1MDAwNjEwMzUxNTU3fV0sXG5cdFx0XHRuYW1lOiBcImNpcmNsZVwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwb2ludHM6IFt7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiAxNDIuMzA0NTc2MzE5NjM0NTUsIHk6IDI1Ni4wMDg4NzIyNjkxMjEzNSB9LCB7IHg6IDE0OC42Mjg1OTAxMTcxMzY1NSwgeTogMjMyLjQwNzMzMTQ2OTA3NzMgfSwgeyB4OiAxNTguOTU0ODkyNDg1MTMyMDYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2NiB9LCB7IHg6IDE3Mi45Njk3MjM5NTE1MzA2OCwgeTogMTkwLjI0NzI1MDk1NDA3MjggfSwgeyB4OiAxOTAuMjQ3MjUwOTU0MDcyOCwgeTogMTcyLjk2OTcyMzk1MTUzMDY4IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYsIHk6IDE1OC45NTQ4OTI0ODUxMzIxIH0sIHsgeDogMjMyLjQwNzMzMTQ2OTA3NzI2LCB5OiAxNDguNjI4NTkwMTE3MTM2NTggfSwgeyB4OiAyNTYuMDA4ODcyMjY5MTIxMzUsIHk6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzMDQuNjkxMTM5OTM3OTA5NiwgeTogMTQyLjMwNDU3NjMxOTYzNDU1IH0sIHsgeDogMzI4LjI5MjY4MDczNzk1MzczLCB5OiAxNDguNjI4NTkwMTE3MTM2NTUgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0MzYsIHk6IDE1OC45NTQ4OTI0ODUxMzIwNiB9LCB7IHg6IDM3MC40NTI3NjEyNTI5NTgyLCB5OiAxNzIuOTY5NzIzOTUxNTMwNjggfSwgeyB4OiAzODcuNzMwMjg4MjU1NTAwMzQsIHk6IDE5MC4yNDcyNTA5NTQwNzI3NyB9LCB7IHg6IDQwMS43NDUxMTk3MjE4OTg5NiwgeTogMjEwLjI2MjUwNDU3NzYzNjY2IH0sIHsgeDogNDEyLjA3MTQyMjA4OTg5NDQ0LCB5OiAyMzIuNDA3MzMxNDY5MDc3MjMgfSwgeyB4OiA0MTguMzk1NDM1ODg3Mzk2NSwgeTogMjU2LjAwODg3MjI2OTEyMTQgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogNDE4LjM5NTQzNTg4NzM5NjUsIHk6IDMwNC42OTExMzk5Mzc5MDk2NyB9LCB7IHg6IDQxMi4wNzE0MjIwODk4OTQ0NCwgeTogMzI4LjI5MjY4MDczNzk1MzczIH0sIHsgeDogNDAxLjc0NTExOTcyMTg5ODk2LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDM4Ny43MzAyODgyNTU1MDAzNCwgeTogMzcwLjQ1Mjc2MTI1Mjk1ODIgfSwgeyB4OiAzNzAuNDUyNzYxMjUyOTU4MiwgeTogMzg3LjczMDI4ODI1NTUwMDM0IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDQwMS43NDUxMTk3MjE4OTg5IH0sIHsgeDogMzI4LjI5MjY4MDczNzk1Mzg0LCB5OiA0MTIuMDcxNDIyMDg5ODk0NDQgfSwgeyB4OiAzMDQuNjkxMTM5OTM3OTA5NjcsIHk6IDQxOC4zOTU0MzU4ODczOTY1IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI1Ni4wMDg4NzIyNjkxMjE0LCB5OiA0MTguMzk1NDM1ODg3Mzk2NSB9LCB7IHg6IDIzMi40MDczMzE0NjkwNzczNSwgeTogNDEyLjA3MTQyMjA4OTg5NDUgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NiwgeTogNDAxLjc0NTExOTcyMTg5ODk2IH0sIHsgeDogMTkwLjI0NzI1MDk1NDA3MjgsIHk6IDM4Ny43MzAyODgyNTU1MDAzNCB9LCB7IHg6IDE3Mi45Njk3MjM5NTE1MzA3LCB5OiAzNzAuNDUyNzYxMjUyOTU4MyB9LCB7IHg6IDE1OC45NTQ4OTI0ODUxMzIxMiwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiAxNDguNjI4NTkwMTE3MTM2NTUsIHk6IDMyOC4yOTI2ODA3Mzc5NTM3MyB9LCB7IHg6IDE0Mi4zMDQ1NzYzMTk2MzQ1OCwgeTogMzA0LjY5MTEzOTkzNzkwOTggfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI4MC4zNTAwMDYxMDM1MTU1N31dLFxuXHRcdFx0bmFtZTogXCJjaXJjbGVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMTQyLjMwNDU3NjMxOTYzNDU1LCB5OiAzMDQuNjkxMTM5OTM3OTA5NjcgfSwgeyB4OiAxNDguNjI4NTkwMTE3MTM2NTUsIHk6IDMyOC4yOTI2ODA3Mzc5NTM3MyB9LCB7IHg6IDE1OC45NTQ4OTI0ODUxMzIwNiwgeTogMzUwLjQzNzUwNzYyOTM5NDM2IH0sIHsgeDogMTcyLjk2OTcyMzk1MTUzMDY4LCB5OiAzNzAuNDUyNzYxMjUyOTU4MiB9LCB7IHg6IDE5MC4yNDcyNTA5NTQwNzI4LCB5OiAzODcuNzMwMjg4MjU1NTAwMzQgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NiwgeTogNDAxLjc0NTExOTcyMTg5ODk2IH0sIHsgeDogMjMyLjQwNzMzMTQ2OTA3NzI2LCB5OiA0MTIuMDcxNDIyMDg5ODk0NDQgfSwgeyB4OiAyNTYuMDA4ODcyMjY5MTIxMzUsIHk6IDQxOC4zOTU0MzU4ODczOTY1IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDMwNC42OTExMzk5Mzc5MDk2LCB5OiA0MTguMzk1NDM1ODg3Mzk2NSB9LCB7IHg6IDMyOC4yOTI2ODA3Mzc5NTM3MywgeTogNDEyLjA3MTQyMjA4OTg5NDQ0IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDM2LCB5OiA0MDEuNzQ1MTE5NzIxODk4OTYgfSwgeyB4OiAzNzAuNDUyNzYxMjUyOTU4MiwgeTogMzg3LjczMDI4ODI1NTUwMDM0IH0sIHsgeDogMzg3LjczMDI4ODI1NTUwMDM0LCB5OiAzNzAuNDUyNzYxMjUyOTU4MiB9LCB7IHg6IDQwMS43NDUxMTk3MjE4OTg5NiwgeTogMzUwLjQzNzUwNzYyOTM5NDM2IH0sIHsgeDogNDEyLjA3MTQyMjA4OTg5NDQ0LCB5OiAzMjguMjkyNjgwNzM3OTUzOCB9LCB7IHg6IDQxOC4zOTU0MzU4ODczOTY1LCB5OiAzMDQuNjkxMTM5OTM3OTA5NiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiA0MTguMzk1NDM1ODg3Mzk2NSwgeTogMjU2LjAwODg3MjI2OTEyMTM1IH0sIHsgeDogNDEyLjA3MTQyMjA4OTg5NDQ0LCB5OiAyMzIuNDA3MzMxNDY5MDc3MyB9LCB7IHg6IDQwMS43NDUxMTk3MjE4OTg5NiwgeTogMjEwLjI2MjUwNDU3NzYzNjYgfSwgeyB4OiAzODcuNzMwMjg4MjU1NTAwMzQsIHk6IDE5MC4yNDcyNTA5NTQwNzI4IH0sIHsgeDogMzcwLjQ1Mjc2MTI1Mjk1ODIsIHk6IDE3Mi45Njk3MjM5NTE1MzA3IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDE1OC45NTQ4OTI0ODUxMzIxMiB9LCB7IHg6IDMyOC4yOTI2ODA3Mzc5NTM4NCwgeTogMTQ4LjYyODU5MDExNzEzNjU4IH0sIHsgeDogMzA0LjY5MTEzOTkzNzkwOTY3LCB5OiAxNDIuMzA0NTc2MzE5NjM0NTUgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjU2LjAwODg3MjI2OTEyMTQsIHk6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSB9LCB7IHg6IDIzMi40MDczMzE0NjkwNzczNSwgeTogMTQ4LjYyODU5MDExNzEzNjUzIH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYsIHk6IDE1OC45NTQ4OTI0ODUxMzIxIH0sIHsgeDogMTkwLjI0NzI1MDk1NDA3MjgsIHk6IDE3Mi45Njk3MjM5NTE1MzA2OCB9LCB7IHg6IDE3Mi45Njk3MjM5NTE1MzA3LCB5OiAxOTAuMjQ3MjUwOTU0MDcyNzQgfSwgeyB4OiAxNTguOTU0ODkyNDg1MTMyMTIsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY1OCB9LCB7IHg6IDE0OC42Mjg1OTAxMTcxMzY1NSwgeTogMjMyLjQwNzMzMTQ2OTA3NzMgfSwgeyB4OiAxNDIuMzA0NTc2MzE5NjM0NTgsIHk6IDI1Ni4wMDg4NzIyNjkxMjEyNCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjgwLjM1MDAwNjEwMzUxNTQ1fV0sXG5cdFx0XHRuYW1lOiBcImNpcmNsZVwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwb2ludHM6IFt7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzMDQuNjkxMTM5OTM3OTA5NiwgeTogNDE4LjM5NTQzNTg4NzM5NjUgfSwgeyB4OiAzMjguMjkyNjgwNzM3OTUzNzMsIHk6IDQxMi4wNzE0MjIwODk4OTQ0NCB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQzNiwgeTogNDAxLjc0NTExOTcyMTg5ODk2IH0sIHsgeDogMzcwLjQ1Mjc2MTI1Mjk1ODIsIHk6IDM4Ny43MzAyODgyNTU1MDAzNCB9LCB7IHg6IDM4Ny43MzAyODgyNTU1MDAzNCwgeTogMzcwLjQ1Mjc2MTI1Mjk1ODIgfSwgeyB4OiA0MDEuNzQ1MTE5NzIxODk4OTYsIHk6IDM1MC40Mzc1MDc2MjkzOTQzNiB9LCB7IHg6IDQxMi4wNzE0MjIwODk4OTQ0NCwgeTogMzI4LjI5MjY4MDczNzk1MzggfSwgeyB4OiA0MTguMzk1NDM1ODg3Mzk2NSwgeTogMzA0LjY5MTEzOTkzNzkwOTYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogNDE4LjM5NTQzNTg4NzM5NjUsIHk6IDI1Ni4wMDg4NzIyNjkxMjEzNSB9LCB7IHg6IDQxMi4wNzE0MjIwODk4OTQ0NCwgeTogMjMyLjQwNzMzMTQ2OTA3NzMgfSwgeyB4OiA0MDEuNzQ1MTE5NzIxODk4OTYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2IH0sIHsgeDogMzg3LjczMDI4ODI1NTUwMDM0LCB5OiAxOTAuMjQ3MjUwOTU0MDcyOCB9LCB7IHg6IDM3MC40NTI3NjEyNTI5NTgyLCB5OiAxNzIuOTY5NzIzOTUxNTMwNyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiAxNTguOTU0ODkyNDg1MTMyMTIgfSwgeyB4OiAzMjguMjkyNjgwNzM3OTUzODQsIHk6IDE0OC42Mjg1OTAxMTcxMzY1OCB9LCB7IHg6IDMwNC42OTExMzk5Mzc5MDk2NywgeTogMTQyLjMwNDU3NjMxOTYzNDU1IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI1Ni4wMDg4NzIyNjkxMjE0LCB5OiAxNDIuMzA0NTc2MzE5NjM0NTUgfSwgeyB4OiAyMzIuNDA3MzMxNDY5MDc3MzUsIHk6IDE0OC42Mjg1OTAxMTcxMzY1MyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2LCB5OiAxNTguOTU0ODkyNDg1MTMyMSB9LCB7IHg6IDE5MC4yNDcyNTA5NTQwNzI4LCB5OiAxNzIuOTY5NzIzOTUxNTMwNjggfSwgeyB4OiAxNzIuOTY5NzIzOTUxNTMwNywgeTogMTkwLjI0NzI1MDk1NDA3Mjc0IH0sIHsgeDogMTU4Ljk1NDg5MjQ4NTEzMjEyLCB5OiAyMTAuMjYyNTA0NTc3NjM2NTggfSwgeyB4OiAxNDguNjI4NTkwMTE3MTM2NTUsIHk6IDIzMi40MDczMzE0NjkwNzczIH0sIHsgeDogMTQyLjMwNDU3NjMxOTYzNDU4LCB5OiAyNTYuMDA4ODcyMjY5MTIxMjQgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI4MC4zNTAwMDYxMDM1MTU0NSB9LCB7IHg6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSwgeTogMzA0LjY5MTEzOTkzNzkwOTYgfSwgeyB4OiAxNDguNjI4NTkwMTE3MTM2NTgsIHk6IDMyOC4yOTI2ODA3Mzc5NTM4IH0sIHsgeDogMTU4Ljk1NDg5MjQ4NTEzMiwgeTogMzUwLjQzNzUwNzYyOTM5NDMgfSwgeyB4OiAxNzIuOTY5NzIzOTUxNTMwNjgsIHk6IDM3MC40NTI3NjEyNTI5NTgyIH0sIHsgeDogMTkwLjI0NzI1MDk1NDA3Mjc0LCB5OiAzODcuNzMwMjg4MjU1NTAwMyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2NiwgeTogNDAxLjc0NTExOTcyMTg5ODk2IH0sIHsgeDogMjMyLjQwNzMzMTQ2OTA3NzE4LCB5OiA0MTIuMDcxNDIyMDg5ODk0NDQgfSwgeyB4OiAyNTYuMDA4ODcyMjY5MTIxMzUsIHk6IDQxOC4zOTU0MzU4ODczOTY1IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTQ1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjd9XSxcblx0XHRcdG5hbWU6IFwiY2lyY2xlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDMwNC42OTExMzk5Mzc5MDk2LCB5OiAxNDIuMzA0NTc2MzE5NjM0NTUgfSwgeyB4OiAzMjguMjkyNjgwNzM3OTUzNzMsIHk6IDE0OC42Mjg1OTAxMTcxMzY1NSB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQzNiwgeTogMTU4Ljk1NDg5MjQ4NTEzMjA2IH0sIHsgeDogMzcwLjQ1Mjc2MTI1Mjk1ODIsIHk6IDE3Mi45Njk3MjM5NTE1MzA2OCB9LCB7IHg6IDM4Ny43MzAyODgyNTU1MDAzNCwgeTogMTkwLjI0NzI1MDk1NDA3Mjc3IH0sIHsgeDogNDAxLjc0NTExOTcyMTg5ODk2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjYgfSwgeyB4OiA0MTIuMDcxNDIyMDg5ODk0NDQsIHk6IDIzMi40MDczMzE0NjkwNzcyMyB9LCB7IHg6IDQxOC4zOTU0MzU4ODczOTY1LCB5OiAyNTYuMDA4ODcyMjY5MTIxNCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiA0MTguMzk1NDM1ODg3Mzk2NSwgeTogMzA0LjY5MTEzOTkzNzkwOTY3IH0sIHsgeDogNDEyLjA3MTQyMjA4OTg5NDQ0LCB5OiAzMjguMjkyNjgwNzM3OTUzNzMgfSwgeyB4OiA0MDEuNzQ1MTE5NzIxODk4OTYsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogMzg3LjczMDI4ODI1NTUwMDM0LCB5OiAzNzAuNDUyNzYxMjUyOTU4MiB9LCB7IHg6IDM3MC40NTI3NjEyNTI5NTgyLCB5OiAzODcuNzMwMjg4MjU1NTAwMzQgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogNDAxLjc0NTExOTcyMTg5ODkgfSwgeyB4OiAzMjguMjkyNjgwNzM3OTUzODQsIHk6IDQxMi4wNzE0MjIwODk4OTQ0NCB9LCB7IHg6IDMwNC42OTExMzk5Mzc5MDk2NywgeTogNDE4LjM5NTQzNTg4NzM5NjUgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjU2LjAwODg3MjI2OTEyMTQsIHk6IDQxOC4zOTU0MzU4ODczOTY1IH0sIHsgeDogMjMyLjQwNzMzMTQ2OTA3NzM1LCB5OiA0MTIuMDcxNDIyMDg5ODk0NSB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2LCB5OiA0MDEuNzQ1MTE5NzIxODk4OTYgfSwgeyB4OiAxOTAuMjQ3MjUwOTU0MDcyOCwgeTogMzg3LjczMDI4ODI1NTUwMDM0IH0sIHsgeDogMTcyLjk2OTcyMzk1MTUzMDcsIHk6IDM3MC40NTI3NjEyNTI5NTgzIH0sIHsgeDogMTU4Ljk1NDg5MjQ4NTEzMjEyLCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDE0OC42Mjg1OTAxMTcxMzY1NSwgeTogMzI4LjI5MjY4MDczNzk1MzczIH0sIHsgeDogMTQyLjMwNDU3NjMxOTYzNDU4LCB5OiAzMDQuNjkxMTM5OTM3OTA5OCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjgwLjM1MDAwNjEwMzUxNTU3IH0sIHsgeDogMTQyLjMwNDU3NjMxOTYzNDU1LCB5OiAyNTYuMDA4ODcyMjY5MTIxNCB9LCB7IHg6IDE0OC42Mjg1OTAxMTcxMzY1OCwgeTogMjMyLjQwNzMzMTQ2OTA3NzIzIH0sIHsgeDogMTU4Ljk1NDg5MjQ4NTEzMiwgeTogMjEwLjI2MjUwNDU3NzYzNjcyIH0sIHsgeDogMTcyLjk2OTcyMzk1MTUzMDY4LCB5OiAxOTAuMjQ3MjUwOTU0MDcyOCB9LCB7IHg6IDE5MC4yNDcyNTA5NTQwNzI3NCwgeTogMTcyLjk2OTcyMzk1MTUzMDc0IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjY2LCB5OiAxNTguOTU0ODkyNDg1MTMyMDYgfSwgeyB4OiAyMzIuNDA3MzMxNDY5MDc3MTgsIHk6IDE0OC42Mjg1OTAxMTcxMzY2IH0sIHsgeDogMjU2LjAwODg3MjI2OTEyMTM1LCB5OiAxNDIuMzA0NTc2MzE5NjM0NTUgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NDUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3Nn1dLFxuXHRcdFx0bmFtZTogXCJjaXJjbGVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjU2LjAwODg3MjI2OTEyMTQsIHk6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSB9LCB7IHg6IDIzMi40MDczMzE0NjkwNzczLCB5OiAxNDguNjI4NTkwMTE3MTM2NTUgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjYsIHk6IDE1OC45NTQ4OTI0ODUxMzIwNiB9LCB7IHg6IDE5MC4yNDcyNTA5NTQwNzI4LCB5OiAxNzIuOTY5NzIzOTUxNTMwNjggfSwgeyB4OiAxNzIuOTY5NzIzOTUxNTMwNywgeTogMTkwLjI0NzI1MDk1NDA3Mjc3IH0sIHsgeDogMTU4Ljk1NDg5MjQ4NTEzMjA2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjYgfSwgeyB4OiAxNDguNjI4NTkwMTE3MTM2NTgsIHk6IDIzMi40MDczMzE0NjkwNzcyMyB9LCB7IHg6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSwgeTogMjU2LjAwODg3MjI2OTEyMTQgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMTQyLjMwNDU3NjMxOTYzNDU1LCB5OiAzMDQuNjkxMTM5OTM3OTA5NjcgfSwgeyB4OiAxNDguNjI4NTkwMTE3MTM2NTUsIHk6IDMyOC4yOTI2ODA3Mzc5NTM3MyB9LCB7IHg6IDE1OC45NTQ4OTI0ODUxMzIxLCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDE3Mi45Njk3MjM5NTE1MzA2OCwgeTogMzcwLjQ1Mjc2MTI1Mjk1ODIgfSwgeyB4OiAxOTAuMjQ3MjUwOTU0MDcyNzcsIHk6IDM4Ny43MzAyODgyNTU1MDAzNCB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY1OCwgeTogNDAxLjc0NTExOTcyMTg5ODkgfSwgeyB4OiAyMzIuNDA3MzMxNDY5MDc3MTgsIHk6IDQxMi4wNzE0MjIwODk4OTQ0NCB9LCB7IHg6IDI1Ni4wMDg4NzIyNjkxMjEzNSwgeTogNDE4LjM5NTQzNTg4NzM5NjUgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzA0LjY5MTEzOTkzNzkwOTYsIHk6IDQxOC4zOTU0MzU4ODczOTY1IH0sIHsgeDogMzI4LjI5MjY4MDczNzk1MzcsIHk6IDQxMi4wNzE0MjIwODk4OTQ1IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDQwMS43NDUxMTk3MjE4OTg5NiB9LCB7IHg6IDM3MC40NTI3NjEyNTI5NTgyLCB5OiAzODcuNzMwMjg4MjU1NTAwMzQgfSwgeyB4OiAzODcuNzMwMjg4MjU1NTAwMzQsIHk6IDM3MC40NTI3NjEyNTI5NTgzIH0sIHsgeDogNDAxLjc0NTExOTcyMTg5ODksIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogNDEyLjA3MTQyMjA4OTg5NDQ0LCB5OiAzMjguMjkyNjgwNzM3OTUzNzMgfSwgeyB4OiA0MTguMzk1NDM1ODg3Mzk2NDUsIHk6IDMwNC42OTExMzk5Mzc5MDk4IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyODAuMzUwMDA2MTAzNTE1NTcgfSwgeyB4OiA0MTguMzk1NDM1ODg3Mzk2NSwgeTogMjU2LjAwODg3MjI2OTEyMTQgfSwgeyB4OiA0MTIuMDcxNDIyMDg5ODk0NDQsIHk6IDIzMi40MDczMzE0NjkwNzcyMyB9LCB7IHg6IDQwMS43NDUxMTk3MjE4OTksIHk6IDIxMC4yNjI1MDQ1Nzc2MzY3MiB9LCB7IHg6IDM4Ny43MzAyODgyNTU1MDAzNCwgeTogMTkwLjI0NzI1MDk1NDA3MjggfSwgeyB4OiAzNzAuNDUyNzYxMjUyOTU4MywgeTogMTcyLjk2OTcyMzk1MTUzMDc0IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDM2LCB5OiAxNTguOTU0ODkyNDg1MTMyMDYgfSwgeyB4OiAzMjguMjkyNjgwNzM3OTUzODQsIHk6IDE0OC42Mjg1OTAxMTcxMzY2IH0sIHsgeDogMzA0LjY5MTEzOTkzNzkwOTY3LCB5OiAxNDIuMzA0NTc2MzE5NjM0NTUgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NTcsIHk6IDE0MC4xNzUwMDMwNTE3NTc3Nn1dLFxuXHRcdFx0bmFtZTogXCJjaXJjbGVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjU2LjAwODg3MjI2OTEyMTQsIHk6IDQxOC4zOTU0MzU4ODczOTY1IH0sIHsgeDogMjMyLjQwNzMzMTQ2OTA3NzMsIHk6IDQxMi4wNzE0MjIwODk4OTQ0NCB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2NiwgeTogNDAxLjc0NTExOTcyMTg5ODk2IH0sIHsgeDogMTkwLjI0NzI1MDk1NDA3MjgsIHk6IDM4Ny43MzAyODgyNTU1MDAzNCB9LCB7IHg6IDE3Mi45Njk3MjM5NTE1MzA3LCB5OiAzNzAuNDUyNzYxMjUyOTU4MiB9LCB7IHg6IDE1OC45NTQ4OTI0ODUxMzIwNiwgeTogMzUwLjQzNzUwNzYyOTM5NDM2IH0sIHsgeDogMTQ4LjYyODU5MDExNzEzNjU4LCB5OiAzMjguMjkyNjgwNzM3OTUzOCB9LCB7IHg6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSwgeTogMzA0LjY5MTEzOTkzNzkwOTYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMTQyLjMwNDU3NjMxOTYzNDU1LCB5OiAyNTYuMDA4ODcyMjY5MTIxMzUgfSwgeyB4OiAxNDguNjI4NTkwMTE3MTM2NTUsIHk6IDIzMi40MDczMzE0NjkwNzczIH0sIHsgeDogMTU4Ljk1NDg5MjQ4NTEzMjEsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2IH0sIHsgeDogMTcyLjk2OTcyMzk1MTUzMDY4LCB5OiAxOTAuMjQ3MjUwOTU0MDcyOCB9LCB7IHg6IDE5MC4yNDcyNTA5NTQwNzI3NywgeTogMTcyLjk2OTcyMzk1MTUzMDcgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NTgsIHk6IDE1OC45NTQ4OTI0ODUxMzIxMiB9LCB7IHg6IDIzMi40MDczMzE0NjkwNzcxOCwgeTogMTQ4LjYyODU5MDExNzEzNjU4IH0sIHsgeDogMjU2LjAwODg3MjI2OTEyMTM1LCB5OiAxNDIuMzA0NTc2MzE5NjM0NTUgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzA0LjY5MTEzOTkzNzkwOTYsIHk6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSB9LCB7IHg6IDMyOC4yOTI2ODA3Mzc5NTM3LCB5OiAxNDguNjI4NTkwMTE3MTM2NTMgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogMTU4Ljk1NDg5MjQ4NTEzMjEgfSwgeyB4OiAzNzAuNDUyNzYxMjUyOTU4MiwgeTogMTcyLjk2OTcyMzk1MTUzMDY4IH0sIHsgeDogMzg3LjczMDI4ODI1NTUwMDM0LCB5OiAxOTAuMjQ3MjUwOTU0MDcyNzQgfSwgeyB4OiA0MDEuNzQ1MTE5NzIxODk4OSwgeTogMjEwLjI2MjUwNDU3NzYzNjU4IH0sIHsgeDogNDEyLjA3MTQyMjA4OTg5NDQ0LCB5OiAyMzIuNDA3MzMxNDY5MDc3MyB9LCB7IHg6IDQxOC4zOTU0MzU4ODczOTY0NSwgeTogMjU2LjAwODg3MjI2OTEyMTI0IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyODAuMzUwMDA2MTAzNTE1NDUgfSwgeyB4OiA0MTguMzk1NDM1ODg3Mzk2NSwgeTogMzA0LjY5MTEzOTkzNzkwOTYgfSwgeyB4OiA0MTIuMDcxNDIyMDg5ODk0NDQsIHk6IDMyOC4yOTI2ODA3Mzc5NTM4IH0sIHsgeDogNDAxLjc0NTExOTcyMTg5OSwgeTogMzUwLjQzNzUwNzYyOTM5NDMgfSwgeyB4OiAzODcuNzMwMjg4MjU1NTAwMzQsIHk6IDM3MC40NTI3NjEyNTI5NTgyIH0sIHsgeDogMzcwLjQ1Mjc2MTI1Mjk1ODMsIHk6IDM4Ny43MzAyODgyNTU1MDAzIH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDM2LCB5OiA0MDEuNzQ1MTE5NzIxODk4OTYgfSwgeyB4OiAzMjguMjkyNjgwNzM3OTUzODQsIHk6IDQxMi4wNzE0MjIwODk4OTQ0NCB9LCB7IHg6IDMwNC42OTExMzk5Mzc5MDk2NywgeTogNDE4LjM5NTQzNTg4NzM5NjUgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NTcsIHk6IDQyMC41MjUwMDkxNTUyNzMyN31dLFxuXHRcdFx0bmFtZTogXCJjaXJjbGVcIlxuXHRcdH1cblxuXG5cdF07XG5cblx0U2hhcGVEZXRlY3Rvci5wcm90b3R5cGUuc3BvdCA9IGZ1bmN0aW9uIChwb2ludHMsIHBhdHRlcm5OYW1lKSB7XG5cblx0XHRpZiAocGF0dGVybk5hbWUgPT0gbnVsbCkge1xuXHRcdFx0cGF0dGVybk5hbWUgPSAnJztcblx0XHR9XG5cblx0XHR2YXIgZGlzdGFuY2UsIHBhdHRlcm4sIHNjb3JlO1xuXHRcdHZhciBzdHJva2UgPSBuZXcgU3Ryb2tlKHBvaW50cyk7XG5cdFx0dmFyIGJlc3REaXN0YW5jZSA9ICtJbmZpbml0eTtcblx0XHR2YXIgYmVzdFBhdHRlcm4gPSBudWxsO1xuXHRcdHZhciBiZXN0U2NvcmUgPSAwO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhdHRlcm5zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRwYXR0ZXJuID0gdGhpcy5wYXR0ZXJuc1tpXTtcblxuXHRcdFx0aWYgKHBhdHRlcm4ubmFtZS5pbmRleE9mKHBhdHRlcm5OYW1lKSA+IC0xKSB7XG5cdFx0XHRcdGRpc3RhbmNlID0gc3Ryb2tlLmRpc3RhbmNlQXRCZXN0QW5nbGUocGF0dGVybik7XG5cdFx0XHRcdHNjb3JlID0gMS4wIC0gZGlzdGFuY2UgLyBfaGFsZkRpYWdvbmFsO1xuXG5cdFx0XHRcdGlmIChkaXN0YW5jZSA8IGJlc3REaXN0YW5jZSAmJiBzY29yZSA+IHRoaXMudGhyZXNob2xkKSB7XG5cdFx0XHRcdFx0YmVzdERpc3RhbmNlID0gZGlzdGFuY2U7XG5cdFx0XHRcdFx0YmVzdFBhdHRlcm4gPSBwYXR0ZXJuLm5hbWU7XG5cdFx0XHRcdFx0YmVzdFNjb3JlID0gc2NvcmU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4geyBwYXR0ZXJuOiBiZXN0UGF0dGVybiwgc2NvcmU6IGJlc3RTY29yZSB9O1xuXHR9O1xuXG5cdFNoYXBlRGV0ZWN0b3IucHJvdG90eXBlLmxlYXJuID0gZnVuY3Rpb24gKG5hbWUsIHBvaW50cykge1xuXG5cdFx0cmV0dXJuIHRoaXMucGF0dGVybnMucHVzaChuZXcgU3Ryb2tlKHBvaW50cywgbmFtZSkpO1xuXHR9O1xuXG5cdHJldHVybiBTaGFwZURldGVjdG9yO1xufSkpO1xuIiwiY29uc3QgY29uZmlnID0gcmVxdWlyZSgnLi8uLi8uLi9jb25maWcnKTtcblxucmVxdWlyZSgnaGFtbWVyanMnKTtcbnJlcXVpcmUoJ2hvd2xlcicpO1xuXG5jb25zdCBTaGFwZURldGVjdG9yID0gcmVxdWlyZSgnLi9saWIvc2hhcGUtZGV0ZWN0b3InKTtcblxuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuY29uc3Qgc2hhcGUgPSByZXF1aXJlKCcuL3NoYXBlJyk7XG5jb25zdCBjb2xvciA9IHJlcXVpcmUoJy4vY29sb3InKTtcbmNvbnN0IHNvdW5kID0gcmVxdWlyZSgnLi9zb3VuZCcpO1xuXG53aW5kb3cua2FuID0gd2luZG93LmthbiB8fCB7XG4gIHBhbGV0dGU6IFtcIiMyMDE3MUNcIiwgXCIjMUUyQTQzXCIsIFwiIzI4Mzc3RFwiLCBcIiMzNTI3NDdcIiwgXCIjQ0EyRTI2XCIsIFwiIzlBMkExRlwiLCBcIiNEQTZDMjZcIiwgXCIjNDUzMTIxXCIsIFwiIzkxNkE0N1wiLCBcIiNEQUFEMjdcIiwgXCIjN0Y3RDMxXCIsXCIjMkI1RTJFXCJdLFxuICBwYWxldHRlTmFtZXM6IFtdLFxuICBjdXJyZW50Q29sb3I6ICcjMjAxNzFDJyxcbiAgbnVtUGF0aHM6IDEwLFxuICBwYXRoczogW10sXG59O1xuXG5wYXBlci5pbnN0YWxsKHdpbmRvdyk7XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICBsZXQgTU9WRVMgPSBbXTsgLy8gc3RvcmUgZ2xvYmFsIG1vdmVzIGxpc3RcbiAgLy8gbW92ZXMgPSBbXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAnY29sb3JDaGFuZ2UnLFxuICAvLyAgICAgJ29sZCc6ICcjMjAxNzFDJyxcbiAgLy8gICAgICduZXcnOiAnI0YyODVBNSdcbiAgLy8gICB9LFxuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ25ld1BhdGgnLFxuICAvLyAgICAgJ3JlZic6ICc/Pz8nIC8vIHV1aWQ/IGRvbSByZWZlcmVuY2U/XG4gIC8vICAgfSxcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICdwYXRoVHJhbnNmb3JtJyxcbiAgLy8gICAgICdyZWYnOiAnPz8/JywgLy8gdXVpZD8gZG9tIHJlZmVyZW5jZT9cbiAgLy8gICAgICdvbGQnOiAncm90YXRlKDkwZGVnKXNjYWxlKDEuNSknLCAvLyA/Pz9cbiAgLy8gICAgICduZXcnOiAncm90YXRlKDEyMGRlZylzY2FsZSgtMC41KScgLy8gPz8/XG4gIC8vICAgfSxcbiAgLy8gICAvLyBvdGhlcnM/XG4gIC8vIF1cblxuICBjb25zdCAkd2luZG93ID0gJCh3aW5kb3cpO1xuICBjb25zdCAkYm9keSA9ICQoJ2JvZHknKTtcbiAgY29uc3QgJGNhbnZhcyA9ICQoJ2NhbnZhcyNtYWluQ2FudmFzJyk7XG4gIGNvbnN0IHJ1bkFuaW1hdGlvbnMgPSB0cnVlO1xuICBjb25zdCB0cmFuc3BhcmVudCA9IG5ldyBDb2xvcigwLCAwKTtcbiAgY29uc3QgZGV0ZWN0b3IgPSBuZXcgU2hhcGVEZXRlY3RvcihTaGFwZURldGVjdG9yLmRlZmF1bHRTaGFwZXMpO1xuXG4gIGxldCB2aWV3V2lkdGgsIHZpZXdIZWlnaHQ7XG5cblxuICBmdW5jdGlvbiBoaXRUZXN0Qm91bmRzKHBvaW50KSB7XG4gICAgcmV0dXJuIHV0aWwuaGl0VGVzdEJvdW5kcyhwb2ludCwgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5jaGlsZHJlbik7XG4gIH1cblxuICBmdW5jdGlvbiBoaXRUZXN0R3JvdXBCb3VuZHMocG9pbnQpIHtcbiAgICBsZXQgZ3JvdXBzID0gcGFwZXIucHJvamVjdC5nZXRJdGVtcyh7XG4gICAgICBjbGFzc05hbWU6ICdHcm91cCdcbiAgICB9KTtcbiAgICByZXR1cm4gdXRpbC5oaXRUZXN0Qm91bmRzKHBvaW50LCBncm91cHMpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFZpZXdWYXJzKCkge1xuICAgIHZpZXdXaWR0aCA9IHBhcGVyLnZpZXcudmlld1NpemUud2lkdGg7XG4gICAgdmlld0hlaWdodCA9IHBhcGVyLnZpZXcudmlld1NpemUuaGVpZ2h0O1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdENvbnRyb2xQYW5lbCgpIHtcbiAgICBpbml0Q29sb3JQYWxldHRlKCk7XG4gICAgaW5pdENhbnZhc0RyYXcoKTtcbiAgICBpbml0TmV3KCk7XG4gICAgaW5pdFVuZG8oKTtcbiAgICBpbml0UGxheSgpO1xuICAgIGluaXRUaXBzKCk7XG4gICAgaW5pdFNoYXJlKCk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q29sb3JQYWxldHRlKCkge1xuICAgIGNvbnN0ICRwYWxldHRlV3JhcCA9ICQoJ3VsLnBhbGV0dGUtY29sb3JzJyk7XG4gICAgY29uc3QgJHBhbGV0dGVDb2xvcnMgPSAkcGFsZXR0ZVdyYXAuZmluZCgnbGknKTtcbiAgICBjb25zdCBwYWxldHRlQ29sb3JTaXplID0gMjA7XG4gICAgY29uc3QgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplID0gMzA7XG4gICAgY29uc3QgcGFsZXR0ZVNlbGVjdGVkQ2xhc3MgPSAncGFsZXR0ZS1zZWxlY3RlZCc7XG5cbiAgICAvLyBob29rIHVwIGNsaWNrXG4gICAgICAkcGFsZXR0ZUNvbG9ycy5vbignY2xpY2sgdGFwIHRvdWNoJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgbGV0ICRzdmcgPSAkKHRoaXMpLmZpbmQoJ3N2Zy5wYWxldHRlLWNvbG9yJyk7XG5cbiAgICAgICAgICBpZiAoISRzdmcuaGFzQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpKSB7XG4gICAgICAgICAgICAkKCcuJyArIHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAucmVtb3ZlQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAgIC5hdHRyKCd3aWR0aCcsIHBhbGV0dGVDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBwYWxldHRlQ29sb3JTaXplKVxuICAgICAgICAgICAgICAuZmluZCgncmVjdCcpXG4gICAgICAgICAgICAgIC5hdHRyKCdyeCcsIDApXG4gICAgICAgICAgICAgIC5hdHRyKCdyeScsIDApO1xuXG4gICAgICAgICAgICAkc3ZnLmFkZENsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgICAuYXR0cignd2lkdGgnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5hdHRyKCdoZWlnaHQnLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUpXG4gICAgICAgICAgICAgIC5maW5kKCdyZWN0JylcbiAgICAgICAgICAgICAgLmF0dHIoJ3J4JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplIC8gMilcbiAgICAgICAgICAgICAgLmF0dHIoJ3J5JywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplIC8gMilcblxuICAgICAgICAgICAgd2luZG93Lmthbi5jdXJyZW50Q29sb3IgPSAkc3ZnLmZpbmQoJ3JlY3QnKS5hdHRyKCdmaWxsJyk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDYW52YXNEcmF3KCkge1xuXG4gICAgcGFwZXIuc2V0dXAoJGNhbnZhc1swXSk7XG5cbiAgICBsZXQgbWlkZGxlLCBib3VuZHM7XG4gICAgbGV0IHBhc3Q7XG4gICAgbGV0IHNpemVzO1xuICAgIC8vIGxldCBwYXRocyA9IGdldEZyZXNoUGF0aHMod2luZG93Lmthbi5udW1QYXRocyk7XG4gICAgbGV0IHRvdWNoID0gZmFsc2U7XG4gICAgbGV0IGxhc3RDaGlsZDtcblxuICAgIGxldCBzb3VuZHNcbiAgICBzb3VuZC5pbml0U2hhcGVTb3VuZHMoKVxuICAgICAgLnRoZW4oKHJlc3ApID0+IHtcbiAgICAgICAgc291bmRzID0gcmVzcDtcbiAgICAgIH0pXG4gICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGxldCBjaXJjbGUgPSBzb3VuZHMuY2lyY2xlO1xuICAgICAgICBjb25zb2xlLmxvZyhjaXJjbGUpO1xuICAgICAgICBjaXJjbGUucGxheSgncmVkJyk7XG4gICAgICAgIGRlYnVnZ2VyO1xuICAgICAgfSlcblxuXG4gICAgZnVuY3Rpb24gcGFuU3RhcnQoZXZlbnQpIHtcbiAgICAgIHBhcGVyLnByb2plY3QuYWN0aXZlTGF5ZXIucmVtb3ZlQ2hpbGRyZW4oKTsgLy8gUkVNT1ZFXG4gICAgICAvLyBkcmF3Q2lyY2xlKCk7XG5cbiAgICAgIHNpemVzID0gW107XG5cbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuICAgICAgaWYgKCEoZXZlbnQuY2hhbmdlZFBvaW50ZXJzICYmIGV2ZW50LmNoYW5nZWRQb2ludGVycy5sZW5ndGggPiAwKSkgcmV0dXJuO1xuICAgICAgaWYgKGV2ZW50LmNoYW5nZWRQb2ludGVycy5sZW5ndGggPiAxKSB7XG4gICAgICAgIGNvbnNvbGUubG9nKCdldmVudC5jaGFuZ2VkUG9pbnRlcnMgPiAxJyk7XG4gICAgICB9XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBjb25zdCBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSk7XG5cbiAgICAgIGJvdW5kcyA9IG5ldyBQYXRoKHtcbiAgICAgICAgc3Ryb2tlQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBmaWxsQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBuYW1lOiAnYm91bmRzJyxcbiAgICAgIH0pO1xuXG4gICAgICBtaWRkbGUgPSBuZXcgUGF0aCh7XG4gICAgICAgIHN0cm9rZUNvbG9yOiB3aW5kb3cua2FuLmN1cnJlbnRDb2xvcixcbiAgICAgICAgbmFtZTogJ21pZGRsZScsXG4gICAgICAgIHN0cm9rZVdpZHRoOiAxLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIGJvdW5kcy5hZGQocG9pbnQpO1xuICAgICAgbWlkZGxlLmFkZChwb2ludCk7XG4gICAgfVxuXG4gICAgY29uc3QgbWluID0gMDtcbiAgICBjb25zdCBtYXggPSAyMDtcbiAgICBjb25zdCBhbHBoYSA9IDAuMztcbiAgICBjb25zdCBtZW1vcnkgPSAxMDtcbiAgICB2YXIgY3VtRGlzdGFuY2UgPSAwO1xuICAgIGxldCBjdW1TaXplLCBhdmdTaXplO1xuICAgIGZ1bmN0aW9uIHBhbk1vdmUoZXZlbnQpIHtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBpZiAocGluY2hpbmcpIHJldHVybjtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGV2ZW50Lm92ZXJhbGxWZWxvY2l0eSk7XG4gICAgICAvLyBsZXQgdGhpc0Rpc3QgPSBwYXJzZUludChldmVudC5kaXN0YW5jZSk7XG4gICAgICAvLyBjdW1EaXN0YW5jZSArPSB0aGlzRGlzdDtcbiAgICAgIC8vXG4gICAgICAvLyBpZiAoY3VtRGlzdGFuY2UgPCAxMDApIHtcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ2lnbm9yaW5nJyk7XG4gICAgICAvLyAgIHJldHVybjtcbiAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyAgIGN1bURpc3RhbmNlID0gMDtcbiAgICAgIC8vICAgY29uc29sZS5sb2coJ25vdCBpZ25vcmluZycpO1xuICAgICAgLy8gfVxuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyO1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICB3aGlsZSAoc2l6ZXMubGVuZ3RoID4gbWVtb3J5KSB7XG4gICAgICAgIHNpemVzLnNoaWZ0KCk7XG4gICAgICB9XG5cbiAgICAgIGxldCBib3R0b21YLCBib3R0b21ZLCBib3R0b20sXG4gICAgICAgIHRvcFgsIHRvcFksIHRvcCxcbiAgICAgICAgcDAsIHAxLFxuICAgICAgICBzdGVwLCBhbmdsZSwgZGlzdCwgc2l6ZTtcblxuICAgICAgaWYgKHNpemVzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgLy8gbm90IHRoZSBmaXJzdCBwb2ludCwgc28gd2UgaGF2ZSBvdGhlcnMgdG8gY29tcGFyZSB0b1xuICAgICAgICBwMCA9IHBhc3Q7XG4gICAgICAgIGRpc3QgPSB1dGlsLmRlbHRhKHBvaW50LCBwMCk7XG4gICAgICAgIHNpemUgPSBkaXN0ICogYWxwaGE7XG4gICAgICAgIGlmIChzaXplID49IG1heCkgc2l6ZSA9IG1heDtcbiAgICAgICAgLy8gc2l6ZSA9IE1hdGgubWF4KE1hdGgubWluKHNpemUsIG1heCksIG1pbik7IC8vIGNsYW1wIHNpemUgdG8gW21pbiwgbWF4XVxuICAgICAgICAvLyBzaXplID0gbWF4IC0gc2l6ZTtcblxuICAgICAgICBjdW1TaXplID0gMDtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBzaXplcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgIGN1bVNpemUgKz0gc2l6ZXNbal07XG4gICAgICAgIH1cbiAgICAgICAgYXZnU2l6ZSA9IE1hdGgucm91bmQoKChjdW1TaXplIC8gc2l6ZXMubGVuZ3RoKSArIHNpemUpIC8gMik7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGF2Z1NpemUpO1xuXG4gICAgICAgIGFuZ2xlID0gTWF0aC5hdGFuMihwb2ludC55IC0gcDAueSwgcG9pbnQueCAtIHAwLngpOyAvLyByYWRcblxuICAgICAgICAvLyBQb2ludChib3R0b21YLCBib3R0b21ZKSBpcyBib3R0b20sIFBvaW50KHRvcFgsIHRvcFkpIGlzIHRvcFxuICAgICAgICBib3R0b21YID0gcG9pbnQueCArIE1hdGguY29zKGFuZ2xlICsgTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAgIGJvdHRvbVkgPSBwb2ludC55ICsgTWF0aC5zaW4oYW5nbGUgKyBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgYm90dG9tID0gbmV3IFBvaW50KGJvdHRvbVgsIGJvdHRvbVkpO1xuXG4gICAgICAgIHRvcFggPSBwb2ludC54ICsgTWF0aC5jb3MoYW5nbGUgLSBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgICAgdG9wWSA9IHBvaW50LnkgKyBNYXRoLnNpbihhbmdsZSAtIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgICB0b3AgPSBuZXcgUG9pbnQodG9wWCwgdG9wWSk7XG5cbiAgICAgICAgYm91bmRzLmFkZCh0b3ApO1xuICAgICAgICBib3VuZHMuaW5zZXJ0KDAsIGJvdHRvbSk7XG4gICAgICAgIC8vIGJvdW5kcy5zbW9vdGgoKTtcblxuICAgICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICAgICAgLy8gbWlkZGxlLnNtb290aCgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gZG9uJ3QgaGF2ZSBhbnl0aGluZyB0byBjb21wYXJlIHRvXG4gICAgICAgIGRpc3QgPSAxO1xuICAgICAgICBhbmdsZSA9IDA7XG5cbiAgICAgICAgc2l6ZSA9IGRpc3QgKiBhbHBoYTtcbiAgICAgICAgc2l6ZSA9IE1hdGgubWF4KE1hdGgubWluKHNpemUsIG1heCksIG1pbik7IC8vIGNsYW1wIHNpemUgdG8gW21pbiwgbWF4XVxuICAgICAgfVxuXG4gICAgICBwYXBlci52aWV3LmRyYXcoKTtcblxuICAgICAgcGFzdCA9IHBvaW50O1xuICAgICAgc2l6ZXMucHVzaChzaXplKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYW5FbmQoZXZlbnQpIHtcbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyO1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICBjb25zdCBncm91cCA9IG5ldyBHcm91cChbYm91bmRzLCBtaWRkbGVdKTtcbiAgICAgIGdyb3VwLmRhdGEuY29sb3IgPSBib3VuZHMuZmlsbENvbG9yO1xuICAgICAgZ3JvdXAuZGF0YS51cGRhdGUgPSB0cnVlO1xuXG4gICAgICBib3VuZHMuYWRkKHBvaW50KTtcbiAgICAgIGJvdW5kcy5mbGF0dGVuKDQpO1xuICAgICAgYm91bmRzLnNtb290aCgpO1xuICAgICAgYm91bmRzLnNpbXBsaWZ5KCk7XG4gICAgICBib3VuZHMuY2xvc2VkID0gdHJ1ZTtcblxuICAgICAgbWlkZGxlLmFkZChwb2ludCk7XG4gICAgICBtaWRkbGUuZmxhdHRlbig0KTtcbiAgICAgIG1pZGRsZS5zbW9vdGgoKTtcbiAgICAgIG1pZGRsZS5zaW1wbGlmeSgpO1xuXG4gICAgICAvLyB1dGlsLnRydWVHcm91cChncm91cCk7XG5cbiAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gbWlkZGxlLmdldENyb3NzaW5ncygpO1xuICAgICAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyB3ZSBjcmVhdGUgYSBjb3B5IG9mIHRoZSBwYXRoIGJlY2F1c2UgcmVzb2x2ZUNyb3NzaW5ncygpIHNwbGl0cyBzb3VyY2UgcGF0aFxuICAgICAgICBsZXQgcGF0aENvcHkgPSBuZXcgUGF0aCgpO1xuICAgICAgICBwYXRoQ29weS5jb3B5Q29udGVudChtaWRkbGUpO1xuICAgICAgICBwYXRoQ29weS52aXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgbGV0IGRpdmlkZWRQYXRoID0gcGF0aENvcHkucmVzb2x2ZUNyb3NzaW5ncygpO1xuICAgICAgICBkaXZpZGVkUGF0aC52aXNpYmxlID0gZmFsc2U7XG5cblxuICAgICAgICBsZXQgZW5jbG9zZWRMb29wcyA9IHV0aWwuZmluZEludGVyaW9yQ3VydmVzKGRpdmlkZWRQYXRoKTtcblxuICAgICAgICBpZiAoZW5jbG9zZWRMb29wcykge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW5jbG9zZWRMb29wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uZmlsbENvbG9yID0gbmV3IENvbG9yKDAsIDApOyAvLyB0cmFuc3BhcmVudFxuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5kYXRhLmludGVyaW9yID0gdHJ1ZTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uZGF0YS50cmFuc3BhcmVudCA9IHRydWU7XG4gICAgICAgICAgICAvLyBlbmNsb3NlZExvb3BzW2ldLmJsZW5kTW9kZSA9ICdtdWx0aXBseSc7XG4gICAgICAgICAgICBncm91cC5hZGRDaGlsZChlbmNsb3NlZExvb3BzW2ldKTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uc2VuZFRvQmFjaygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwYXRoQ29weS5yZW1vdmUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKCdubyBpbnRlcnNlY3Rpb25zJyk7XG4gICAgICB9XG5cbiAgICAgIGdyb3VwLmRhdGEuY29sb3IgPSBib3VuZHMuZmlsbENvbG9yO1xuICAgICAgZ3JvdXAuZGF0YS5zY2FsZSA9IDE7IC8vIGluaXQgdmFyaWFibGUgdG8gdHJhY2sgc2NhbGUgY2hhbmdlc1xuICAgICAgZ3JvdXAuZGF0YS5yb3RhdGlvbiA9IDA7IC8vIGluaXQgdmFyaWFibGUgdG8gdHJhY2sgcm90YXRpb24gY2hhbmdlc1xuXG4gICAgICBsZXQgY2hpbGRyZW4gPSBncm91cC5nZXRJdGVtcyh7XG4gICAgICAgIG1hdGNoOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0ubmFtZSAhPT0gJ21pZGRsZSdcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKCctLS0tLScpO1xuICAgICAgLy8gY29uc29sZS5sb2coZ3JvdXApO1xuICAgICAgLy8gY29uc29sZS5sb2coY2hpbGRyZW4pO1xuICAgICAgLy8gZ3JvdXAuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgbGV0IHVuaXRlZFBhdGggPSBuZXcgUGF0aCgpO1xuICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgbGV0IGFjY3VtdWxhdG9yID0gbmV3IFBhdGgoKTtcbiAgICAgICAgYWNjdW11bGF0b3IuY29weUNvbnRlbnQoY2hpbGRyZW5bMF0pO1xuICAgICAgICBhY2N1bXVsYXRvci52aXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxldCBvdGhlclBhdGggPSBuZXcgUGF0aCgpO1xuICAgICAgICAgIG90aGVyUGF0aC5jb3B5Q29udGVudChjaGlsZHJlbltpXSk7XG4gICAgICAgICAgb3RoZXJQYXRoLnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICAgIHVuaXRlZFBhdGggPSBhY2N1bXVsYXRvci51bml0ZShvdGhlclBhdGgpO1xuICAgICAgICAgIG90aGVyUGF0aC5yZW1vdmUoKTtcbiAgICAgICAgICBhY2N1bXVsYXRvciA9IHVuaXRlZFBhdGg7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY2hpbGRyZW5bMF0gaXMgdW5pdGVkIGdyb3VwXG4gICAgICAgIHVuaXRlZFBhdGguY29weUNvbnRlbnQoY2hpbGRyZW5bMF0pO1xuICAgICAgfVxuXG4gICAgICB1bml0ZWRQYXRoLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIHVuaXRlZFBhdGguZGF0YS5uYW1lID0gJ21hc2snO1xuXG4gICAgICBncm91cC5hZGRDaGlsZCh1bml0ZWRQYXRoKTtcbiAgICAgIHVuaXRlZFBhdGguc2VuZFRvQmFjaygpO1xuXG4gICAgICAvLyBjaGVjayBzaGFwZVxuICAgICAgY29uc3Qgc2hhcGVKU09OID0gbWlkZGxlLmV4cG9ydEpTT04oKTtcbiAgICAgIGNvbnN0IHBhdGhEYXRhID0gc2hhcGUucHJvY2Vzc1NoYXBlRGF0YShzaGFwZUpTT04pO1xuICAgICAgY29uc3Qgc2hhcGVQcmVkaWN0aW9uID0gZGV0ZWN0b3Iuc3BvdChwYXRoRGF0YSk7XG4gICAgICBsZXQgc2hhcGVQYXR0ZXJuO1xuICAgICAgaWYgKHNoYXBlUHJlZGljdGlvbi5zY29yZSA+IDAuNSkge1xuICAgICAgICBzaGFwZVBhdHRlcm4gPSBzaGFwZVByZWRpY3Rpb24ucGF0dGVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNoYXBlUGF0dGVybiA9IFwib3RoZXJcIjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvbG9yTmFtZSA9IGNvbG9yLmdldENvbG9yTmFtZSh3aW5kb3cua2FuLmN1cnJlbnRDb2xvcik7XG4gICAgICBjb25zb2xlLmxvZyhjb25maWcuc2hhcGVzW3NoYXBlUGF0dGVybl0pO1xuICAgICAgY29uc29sZS5sb2coc291bmRzW3NoYXBlUGF0dGVybl0pO1xuICAgICAgaWYgKGNvbmZpZy5zaGFwZXNbc2hhcGVQYXR0ZXJuXS5zcHJpdGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coY29sb3JOYW1lKTtcbiAgICAgICAgc291bmRzW3NoYXBlUGF0dGVybl0ucGxheShjb2xvck5hbWUpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc291bmRzW3NoYXBlUGF0dGVybl0ucGxheSgpO1xuICAgICAgfVxuICAgICAgY29uc29sZS5sb2coYCR7c2hhcGVQYXR0ZXJufS0ke2NvbG9yTmFtZX1gKTtcblxuICAgICAgbGFzdENoaWxkID0gZ3JvdXA7XG5cbiAgICAgIE1PVkVTLnB1c2goe1xuICAgICAgICB0eXBlOiAnbmV3R3JvdXAnLFxuICAgICAgICBpZDogZ3JvdXAuaWRcbiAgICAgIH0pO1xuXG4gICAgICBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICBncm91cC5hbmltYXRlKFxuICAgICAgICAgIFt7XG4gICAgICAgICAgICBwcm9wZXJ0aWVzOiB7XG4gICAgICAgICAgICAgIHNjYWxlOiAwLjlcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZU91dFwiLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sXG4gICAgICAgICAge1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMS4xMVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlSW5cIlxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1dXG4gICAgICAgICk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgbGV0IHBpbmNoaW5nO1xuICAgIGxldCBwaW5jaGVkR3JvdXAsIGxhc3RTY2FsZSwgbGFzdFJvdGF0aW9uO1xuICAgIGxldCBvcmlnaW5hbFBvc2l0aW9uLCBvcmlnaW5hbFJvdGF0aW9uLCBvcmlnaW5hbFNjYWxlO1xuXG4gICAgZnVuY3Rpb24gcGluY2hTdGFydChldmVudCkge1xuICAgICAgY29uc29sZS5sb2coJ3BpbmNoU3RhcnQnLCBldmVudC5jZW50ZXIpO1xuICAgICAgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnNldCh7ZW5hYmxlOiBmYWxzZX0pO1xuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcixcbiAgICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSksXG4gICAgICAgICAgaGl0UmVzdWx0ID0gaGl0VGVzdEdyb3VwQm91bmRzKHBvaW50KTtcblxuICAgICAgaWYgKGhpdFJlc3VsdCkge1xuICAgICAgICBwaW5jaGluZyA9IHRydWU7XG4gICAgICAgIC8vIHBpbmNoZWRHcm91cCA9IGhpdFJlc3VsdC5pdGVtLnBhcmVudDtcbiAgICAgICAgcGluY2hlZEdyb3VwID0gaGl0UmVzdWx0O1xuICAgICAgICBsYXN0U2NhbGUgPSAxO1xuICAgICAgICBsYXN0Um90YXRpb24gPSBldmVudC5yb3RhdGlvbjtcblxuICAgICAgICBvcmlnaW5hbFBvc2l0aW9uID0gcGluY2hlZEdyb3VwLnBvc2l0aW9uO1xuICAgICAgICAvLyBvcmlnaW5hbFJvdGF0aW9uID0gcGluY2hlZEdyb3VwLnJvdGF0aW9uO1xuICAgICAgICBvcmlnaW5hbFJvdGF0aW9uID0gcGluY2hlZEdyb3VwLmRhdGEucm90YXRpb247XG4gICAgICAgIG9yaWdpbmFsU2NhbGUgPSBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZTtcblxuICAgICAgICBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICAgIHBpbmNoZWRHcm91cC5hbmltYXRlKHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDEuMjVcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZU91dFwiLFxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBudWxsO1xuICAgICAgICBjb25zb2xlLmxvZygnaGl0IG5vIGl0ZW0nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwaW5jaE1vdmUoZXZlbnQpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdwaW5jaE1vdmUnKTtcbiAgICAgIGlmICghIXBpbmNoZWRHcm91cCkge1xuICAgICAgICAvLyBjb25zb2xlLmxvZygncGluY2htb3ZlJywgZXZlbnQpO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhwaW5jaGVkR3JvdXApO1xuICAgICAgICBsZXQgY3VycmVudFNjYWxlID0gZXZlbnQuc2NhbGU7XG4gICAgICAgIGxldCBzY2FsZURlbHRhID0gY3VycmVudFNjYWxlIC8gbGFzdFNjYWxlO1xuICAgICAgICAvLyBjb25zb2xlLmxvZyhsYXN0U2NhbGUsIGN1cnJlbnRTY2FsZSwgc2NhbGVEZWx0YSk7XG4gICAgICAgIGxhc3RTY2FsZSA9IGN1cnJlbnRTY2FsZTtcblxuICAgICAgICBsZXQgY3VycmVudFJvdGF0aW9uID0gZXZlbnQucm90YXRpb247XG4gICAgICAgIGxldCByb3RhdGlvbkRlbHRhID0gY3VycmVudFJvdGF0aW9uIC0gbGFzdFJvdGF0aW9uO1xuICAgICAgICBjb25zb2xlLmxvZyhsYXN0Um90YXRpb24sIGN1cnJlbnRSb3RhdGlvbiwgcm90YXRpb25EZWx0YSk7XG4gICAgICAgIGxhc3RSb3RhdGlvbiA9IGN1cnJlbnRSb3RhdGlvbjtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhgc2NhbGluZyBieSAke3NjYWxlRGVsdGF9YCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKGByb3RhdGluZyBieSAke3JvdGF0aW9uRGVsdGF9YCk7XG5cbiAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uID0gZXZlbnQuY2VudGVyO1xuICAgICAgICBwaW5jaGVkR3JvdXAuc2NhbGUoc2NhbGVEZWx0YSk7XG4gICAgICAgIHBpbmNoZWRHcm91cC5yb3RhdGUocm90YXRpb25EZWx0YSk7XG5cbiAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEuc2NhbGUgKj0gc2NhbGVEZWx0YTtcbiAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEucm90YXRpb24gKz0gcm90YXRpb25EZWx0YTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgbGFzdEV2ZW50O1xuICAgIGZ1bmN0aW9uIHBpbmNoRW5kKGV2ZW50KSB7XG4gICAgICAvLyB3YWl0IDI1MCBtcyB0byBwcmV2ZW50IG1pc3Rha2VuIHBhbiByZWFkaW5nc1xuICAgICAgbGFzdEV2ZW50ID0gZXZlbnQ7XG4gICAgICBpZiAoISFwaW5jaGVkR3JvdXApIHtcbiAgICAgICAgcGluY2hlZEdyb3VwLmRhdGEudXBkYXRlID0gdHJ1ZTtcbiAgICAgICAgbGV0IG1vdmUgPSB7XG4gICAgICAgICAgaWQ6IHBpbmNoZWRHcm91cC5pZCxcbiAgICAgICAgICB0eXBlOiAndHJhbnNmb3JtJ1xuICAgICAgICB9O1xuICAgICAgICBpZiAocGluY2hlZEdyb3VwLnBvc2l0aW9uICE9IG9yaWdpbmFsUG9zaXRpb24pIHtcbiAgICAgICAgICBtb3ZlLnBvc2l0aW9uID0gb3JpZ2luYWxQb3NpdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbiAhPSBvcmlnaW5hbFJvdGF0aW9uKSB7XG4gICAgICAgICAgbW92ZS5yb3RhdGlvbiA9IG9yaWdpbmFsUm90YXRpb24gLSBwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZSAhPSBvcmlnaW5hbFNjYWxlKSB7XG4gICAgICAgICAgbW92ZS5zY2FsZSA9IG9yaWdpbmFsU2NhbGUgLyBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnNvbGUubG9nKCdmaW5hbCBzY2FsZScsIHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlKTtcbiAgICAgICAgY29uc29sZS5sb2cobW92ZSk7XG5cbiAgICAgICAgTU9WRVMucHVzaChtb3ZlKTtcblxuICAgICAgICBpZiAoTWF0aC5hYnMoZXZlbnQudmVsb2NpdHkpID4gMSkge1xuICAgICAgICAgIC8vIGRpc3Bvc2Ugb2YgZ3JvdXAgb2Zmc2NyZWVuXG4gICAgICAgICAgdGhyb3dQaW5jaGVkR3JvdXAoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgIC8vICAgcGluY2hlZEdyb3VwLmFuaW1hdGUoe1xuICAgICAgICAvLyAgICAgcHJvcGVydGllczoge1xuICAgICAgICAvLyAgICAgICBzY2FsZTogMC44XG4gICAgICAgIC8vICAgICB9LFxuICAgICAgICAvLyAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgLy8gICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgLy8gICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgLy8gICAgIH1cbiAgICAgICAgLy8gICB9KTtcbiAgICAgICAgLy8gfVxuICAgICAgfVxuICAgICAgcGluY2hpbmcgPSBmYWxzZTtcbiAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogdHJ1ZX0pO1xuICAgICAgfSwgMjUwKTtcbiAgICB9XG5cbiAgICBjb25zdCBoaXRPcHRpb25zID0ge1xuICAgICAgc2VnbWVudHM6IGZhbHNlLFxuICAgICAgc3Ryb2tlOiB0cnVlLFxuICAgICAgZmlsbDogdHJ1ZSxcbiAgICAgIHRvbGVyYW5jZTogNVxuICAgIH07XG5cbiAgICBmdW5jdGlvbiBzaW5nbGVUYXAoZXZlbnQpIHtcbiAgICAgIHJldHVybjtcbiAgICAgIC8vIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXIsXG4gICAgICAvLyAgICAgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpLFxuICAgICAgLy8gICAgIGhpdFJlc3VsdCA9IHBhcGVyLnByb2plY3QuaGl0VGVzdChwb2ludCwgaGl0T3B0aW9ucyk7XG4gICAgICAvL1xuICAgICAgLy8gaWYgKGhpdFJlc3VsdCkge1xuICAgICAgLy8gICBsZXQgaXRlbSA9IGhpdFJlc3VsdC5pdGVtO1xuICAgICAgLy8gICBpdGVtLnNlbGVjdGVkID0gIWl0ZW0uc2VsZWN0ZWQ7XG4gICAgICAvLyB9XG4gICAgfVxuXG4gICAgZnVuY3Rpb24gZG91YmxlVGFwKGV2ZW50KSB7XG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyLFxuICAgICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KSxcbiAgICAgICAgICBoaXRSZXN1bHQgPSBwYXBlci5wcm9qZWN0LmhpdFRlc3QocG9pbnQsIGhpdE9wdGlvbnMpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIGxldCBpdGVtID0gaGl0UmVzdWx0Lml0ZW07XG4gICAgICAgIGxldCBwYXJlbnQgPSBpdGVtLnBhcmVudDtcblxuICAgICAgICBpZiAoaXRlbS5kYXRhLmludGVyaW9yKSB7XG4gICAgICAgICAgaXRlbS5kYXRhLnRyYW5zcGFyZW50ID0gIWl0ZW0uZGF0YS50cmFuc3BhcmVudDtcblxuICAgICAgICAgIGlmIChpdGVtLmRhdGEudHJhbnNwYXJlbnQpIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gdHJhbnNwYXJlbnQ7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gcGFyZW50LmRhdGEuY29sb3I7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gcGFyZW50LmRhdGEuY29sb3I7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgTU9WRVMucHVzaCh7XG4gICAgICAgICAgICB0eXBlOiAnZmlsbENoYW5nZScsXG4gICAgICAgICAgICBpZDogaXRlbS5pZCxcbiAgICAgICAgICAgIGZpbGw6IHBhcmVudC5kYXRhLmNvbG9yLFxuICAgICAgICAgICAgdHJhbnNwYXJlbnQ6IGl0ZW0uZGF0YS50cmFuc3BhcmVudFxuICAgICAgICAgIH0pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGNvbnNvbGUubG9nKCdub3QgaW50ZXJpb3InKVxuICAgICAgICB9XG5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBpbmNoZWRHcm91cCA9IG51bGw7XG4gICAgICAgIGNvbnNvbGUubG9nKCdoaXQgbm8gaXRlbScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHZlbG9jaXR5TXVsdGlwbGllciA9IDI1O1xuICAgIGZ1bmN0aW9uIHRocm93UGluY2hlZEdyb3VwKCkge1xuICAgICAgY29uc29sZS5sb2cocGluY2hlZEdyb3VwLnBvc2l0aW9uKTtcbiAgICAgIGlmIChwaW5jaGVkR3JvdXAucG9zaXRpb24ueCA8PSAwIC0gcGluY2hlZEdyb3VwLmJvdW5kcy53aWR0aCB8fFxuICAgICAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi54ID49IHZpZXdXaWR0aCArIHBpbmNoZWRHcm91cC5ib3VuZHMud2lkdGggfHxcbiAgICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueSA8PSAwIC0gcGluY2hlZEdyb3VwLmJvdW5kcy5oZWlnaHQgfHxcbiAgICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueSA+PSB2aWV3SGVpZ2h0ICsgcGluY2hlZEdyb3VwLmJvdW5kcy5oZWlnaHQpIHtcbiAgICAgICAgICAgIHBpbmNoZWRHcm91cC5kYXRhLm9mZlNjcmVlbiA9IHRydWU7XG4gICAgICAgICAgICBwaW5jaGVkR3JvdXAudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICByZXF1ZXN0QW5pbWF0aW9uRnJhbWUodGhyb3dQaW5jaGVkR3JvdXApO1xuICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnggKz0gbGFzdEV2ZW50LnZlbG9jaXR5WCAqIHZlbG9jaXR5TXVsdGlwbGllcjtcbiAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi55ICs9IGxhc3RFdmVudC52ZWxvY2l0eVkgKiB2ZWxvY2l0eU11bHRpcGxpZXI7XG4gICAgfVxuXG4gICAgdmFyIGhhbW1lck1hbmFnZXIgPSBuZXcgSGFtbWVyLk1hbmFnZXIoJGNhbnZhc1swXSk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlRhcCh7IGV2ZW50OiAnZG91YmxldGFwJywgdGFwczogMiB9KSk7XG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5UYXAoeyBldmVudDogJ3NpbmdsZXRhcCcgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuUGFuKHsgZGlyZWN0aW9uOiBIYW1tZXIuRElSRUNUSU9OX0FMTCB9KSk7XG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5QaW5jaCgpKTtcblxuICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdkb3VibGV0YXAnKS5yZWNvZ25pemVXaXRoKCdzaW5nbGV0YXAnKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgnc2luZ2xldGFwJykucmVxdWlyZUZhaWx1cmUoJ2RvdWJsZXRhcCcpO1xuICAgIGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5yZXF1aXJlRmFpbHVyZSgncGluY2gnKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3NpbmdsZXRhcCcsIHNpbmdsZVRhcCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbignZG91YmxldGFwJywgZG91YmxlVGFwKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3BhbnN0YXJ0JywgcGFuU3RhcnQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3Bhbm1vdmUnLCBwYW5Nb3ZlKTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5lbmQnLCBwYW5FbmQpO1xuXG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2hzdGFydCcsIHBpbmNoU3RhcnQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNobW92ZScsIHBpbmNoTW92ZSk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2hlbmQnLCBwaW5jaEVuZCk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGluY2hjYW5jZWwnLCBmdW5jdGlvbigpIHsgaGFtbWVyTWFuYWdlci5nZXQoJ3BhbicpLnNldCh7ZW5hYmxlOiB0cnVlfSk7IH0pOyAvLyBtYWtlIHN1cmUgaXQncyByZWVuYWJsZWRcbiAgfVxuXG4gIGZ1bmN0aW9uIG5ld1ByZXNzZWQoKSB7XG4gICAgY29uc29sZS5sb2coJ25ldyBwcmVzc2VkJyk7XG5cbiAgICBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLnJlbW92ZUNoaWxkcmVuKCk7XG4gIH1cblxuICBmdW5jdGlvbiB1bmRvUHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygndW5kbyBwcmVzc2VkJyk7XG4gICAgaWYgKCEoTU9WRVMubGVuZ3RoID4gMCkpIHtcbiAgICAgIGNvbnNvbGUubG9nKCdubyBtb3ZlcyB5ZXQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbGFzdE1vdmUgPSBNT1ZFUy5wb3AoKTtcbiAgICBsZXQgaXRlbSA9IHByb2plY3QuZ2V0SXRlbSh7XG4gICAgICBpZDogbGFzdE1vdmUuaWRcbiAgICB9KTtcblxuICAgIGlmIChpdGVtKSB7XG4gICAgICBpdGVtLnZpc2libGUgPSB0cnVlOyAvLyBtYWtlIHN1cmVcbiAgICAgIHN3aXRjaChsYXN0TW92ZS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ25ld0dyb3VwJzpcbiAgICAgICAgICBjb25zb2xlLmxvZygncmVtb3ZpbmcgZ3JvdXAnKTtcbiAgICAgICAgICBpdGVtLnJlbW92ZSgpO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlICdmaWxsQ2hhbmdlJzpcbiAgICAgICAgICBpZiAobGFzdE1vdmUudHJhbnNwYXJlbnQpIHtcbiAgICAgICAgICAgIGl0ZW0uZmlsbENvbG9yID0gbGFzdE1vdmUuZmlsbDtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSBsYXN0TW92ZS5maWxsO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgIH1cbiAgICAgICAgY2FzZSAndHJhbnNmb3JtJzpcbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5wb3NpdGlvbikge1xuICAgICAgICAgICAgaXRlbS5wb3NpdGlvbiA9IGxhc3RNb3ZlLnBvc2l0aW9uXG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghIWxhc3RNb3ZlLnJvdGF0aW9uKSB7XG4gICAgICAgICAgICBpdGVtLnJvdGF0aW9uID0gbGFzdE1vdmUucm90YXRpb247XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghIWxhc3RNb3ZlLnNjYWxlKSB7XG4gICAgICAgICAgICBpdGVtLnNjYWxlKGxhc3RNb3ZlLnNjYWxlKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgY29uc29sZS5sb2coJ3Vua25vd24gY2FzZScpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zb2xlLmxvZygnY291bGQgbm90IGZpbmQgbWF0Y2hpbmcgaXRlbScpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHBsYXlQcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCdwbGF5IHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpcHNQcmVzc2VkKCkge1xuICAgIGNvbnNvbGUubG9nKCd0aXBzIHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHNoYXJlUHJlc3NlZCgpIHtcbiAgICBjb25zb2xlLmxvZygnc2hhcmUgcHJlc3NlZCcpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdE5ldygpIHtcbiAgICAkKCcubWFpbi1jb250cm9scyAubmV3Jykub24oJ2NsaWNrIHRhcCB0b3VjaCcsIG5ld1ByZXNzZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFVuZG8oKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLnVuZG8nKS5vbignY2xpY2snLCB1bmRvUHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFBsYXkoKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLnBsYXknKS5vbignY2xpY2snLCBwbGF5UHJlc3NlZCk7XG4gIH1cbiAgZnVuY3Rpb24gaW5pdFRpcHMoKSB7XG4gICAgJCgnLmF1eC1jb250cm9scyAudGlwcycpLm9uKCdjbGljaycsIHRpcHNQcmVzc2VkKTtcbiAgfVxuICBmdW5jdGlvbiBpbml0U2hhcmUoKSB7XG4gICAgJCgnLmF1eC1jb250cm9scyAuc2hhcmUnKS5vbignY2xpY2snLCBzaGFyZVByZXNzZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gZHJhd0NpcmNsZSgpIHtcbiAgICBsZXQgY2lyY2xlID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgIGNlbnRlcjogWzQwMCwgNDAwXSxcbiAgICAgIHJhZGl1czogMTAwLFxuICAgICAgc3Ryb2tlQ29sb3I6ICdncmVlbicsXG4gICAgICBmaWxsQ29sb3I6ICdncmVlbidcbiAgICB9KTtcbiAgICBsZXQgZ3JvdXAgPSBuZXcgR3JvdXAoY2lyY2xlKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIG1haW4oKSB7XG4gICAgaW5pdENvbnRyb2xQYW5lbCgpO1xuICAgIC8vIGRyYXdDaXJjbGUoKTtcbiAgICBpbml0Vmlld1ZhcnMoKTtcbiAgfVxuXG4gIG1haW4oKTtcbn0pO1xuIiwiZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NTaGFwZURhdGEoanNvbikge1xuICBsZXQgcmV0dXJuU2hhcGUgPSBbXTtcbiAgbGV0IGpzb25PYmogPSBKU09OLnBhcnNlKGpzb24pWzFdOyAvLyB6ZXJvIGluZGV4IGlzIHN0cmluZ2lmaWVkIHR5cGUgKGUuZy4gXCJQYXRoXCIpXG5cbiAgaWYgKCdzZWdtZW50cycgaW4ganNvbk9iaikge1xuICAgIGxldCBzZWdtZW50cyA9IGpzb25PYmouc2VnbWVudHM7XG4gICAgQmFzZS5lYWNoKHNlZ21lbnRzLCAoc2VnbWVudCwgaSkgPT4ge1xuICAgICAgbGV0IHBvc2l0aW9uSW5mbyA9IHNlZ21lbnRbMF07IC8vIGluZGV4ZXMgMSBhbmQgMiBhcmUgc3VwZXJmbHVvdXMgbWF0cml4IGRldGFpbHNcbiAgICAgIHJldHVyblNoYXBlLnB1c2goe1xuICAgICAgICB4OiBwb3NpdGlvbkluZm9bMF0sXG4gICAgICAgIHk6IHBvc2l0aW9uSW5mb1sxXVxuICAgICAgfSlcbiAgICB9KTtcbiAgfVxuICByZXR1cm4gcmV0dXJuU2hhcGU7XG59XG4iLCJjb25zdCBjb25maWcgPSByZXF1aXJlKCcuLy4uLy4uL2NvbmZpZycpO1xuXG5leHBvcnQgZnVuY3Rpb24gaW5pdFNoYXBlU291bmRzKCkge1xuICBsZXQgcmV0dXJuU291bmRzID0ge307XG4gIGNvbnN0IGV4dGVuc2lvbnMgPSBbJ29nZycsICdtNGEnLCAnbXAzJywgJ2FjMyddO1xuXG4gIGxldCBzaGFwZVByb21pc2VzID0gW107XG4gIEJhc2UuZWFjaChjb25maWcuc2hhcGVzLCAoc2hhcGUsIHNoYXBlTmFtZSkgPT4ge1xuICAgIC8vIGNvbnNvbGUubG9nKHNoYXBlLCBzaGFwZU5hbWUpO1xuICAgIGlmIChzaGFwZS5zcHJpdGUpIHtcbiAgICAgIGxldCBzaGFwZVNvdW5kSlNPTlBhdGggPSBgLi9hdWRpby9zaGFwZXMvJHtzaGFwZU5hbWV9LyR7c2hhcGVOYW1lfS5qc29uYDtcbiAgICAgIGxldCBzaGFwZVByb21pc2UgPSAkLmdldEpTT04oc2hhcGVTb3VuZEpTT05QYXRoLCAocmVzcCkgPT4ge1xuICAgICAgICBsZXQgc2hhcGVTb3VuZERhdGEgPSBmb3JtYXRTaGFwZVNvdW5kRGF0YShzaGFwZU5hbWUsIHJlc3ApO1xuICAgICAgICBjb25zb2xlLmxvZyhKU09OLnN0cmluZ2lmeShzaGFwZVNvdW5kRGF0YSkpO1xuICAgICAgICBsZXQgc291bmQgPSBuZXcgSG93bChzaGFwZVNvdW5kRGF0YSk7XG4gICAgICAgIHJldHVyblNvdW5kc1tzaGFwZU5hbWVdID0gc291bmQ7XG4gICAgICB9KTtcbiAgICAgIHNoYXBlUHJvbWlzZXMucHVzaChzaGFwZVByb21pc2UpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBsZXQgc291bmQgPSBuZXcgSG93bCh7XG4gICAgICAvLyAgIHNyYzogZXh0ZW5zaW9ucy5tYXAoKGV4dGVuc2lvbikgPT4gYC4vYXVkaW8vc2hhcGVzLyR7c2hhcGUubmFtZX0vJHtzaGFwZS5uYW1lfS4ke2V4dGVuc2lvbn1gKSxcbiAgICAgIC8vIH0pO1xuICAgICAgLy8gY29uc29sZS5sb2coe1xuICAgICAgLy8gICBzcmM6IGV4dGVuc2lvbnMubWFwKChleHRlbnNpb24pID0+IGAuL2F1ZGlvL3NoYXBlcy8ke3NoYXBlLm5hbWV9LyR7c2hhcGUubmFtZX0uJHtleHRlbnNpb259YCksXG4gICAgICAvLyB9KVxuICAgICAgbGV0IHNvdW5kID0gbmV3IEhvd2woe1xuICAgICAgICBzcmM6IGAuL2F1ZGlvL3NoYXBlcy8ke3NoYXBlTmFtZX0vJHtzaGFwZU5hbWV9Lm1wM2BcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuU291bmRzW3NoYXBlTmFtZV0gPSBzb3VuZDtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiAkLndoZW4oc2hhcGVQcm9taXNlcylcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICByZXR1cm4gcmV0dXJuU291bmRzO1xuICAgIH0pXG5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZvcm1hdFNoYXBlU291bmREYXRhKHNoYXBlTmFtZSwgZGF0YSkge1xuICBsZXQgcmV0dXJuRGF0YSA9IHt9O1xuXG4gIHJldHVybkRhdGEuc3JjID0gZGF0YS5yZXNvdXJjZXMubWFwKChyZXNvdXJjZSkgPT4gYC4vYXVkaW8vc2hhcGVzLyR7c2hhcGVOYW1lfS8ke3Jlc291cmNlfWApO1xuXG4gIHJldHVybkRhdGEuc3ByaXRlID0ge307XG4gIEJhc2UuZWFjaChkYXRhLnNwcml0ZW1hcCwgKHNwcml0ZSwgc3ByaXRlTmFtZSkgPT4ge1xuICAgIHJldHVybkRhdGEuc3ByaXRlW3Nwcml0ZU5hbWVdID0gW3Nwcml0ZS5zdGFydCwgc3ByaXRlLmVuZCAtIHNwcml0ZS5zdGFydF07XG4gIH0pO1xuICByZXR1cm5EYXRhLm9uZW5kID0gZnVuY3Rpb24oKSB7XG4gICAgY29uc29sZS5sb2coJ2RvbmUnKTtcbiAgfVxuICByZXR1cm5EYXRhLmh0bWw1ID0gdHJ1ZTtcblxuICByZXR1cm4gcmV0dXJuRGF0YTtcbn1cbiIsIi8vIENvbnZlcnRzIGZyb20gZGVncmVlcyB0byByYWRpYW5zLlxuZXhwb3J0IGZ1bmN0aW9uIHJhZChkZWdyZWVzKSB7XG4gIHJldHVybiBkZWdyZWVzICogTWF0aC5QSSAvIDE4MDtcbn07XG5cbi8vIENvbnZlcnRzIGZyb20gcmFkaWFucyB0byBkZWdyZWVzLlxuZXhwb3J0IGZ1bmN0aW9uIGRlZyhyYWRpYW5zKSB7XG4gIHJldHVybiByYWRpYW5zICogMTgwIC8gTWF0aC5QSTtcbn07XG5cbi8vIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xuZXhwb3J0IGZ1bmN0aW9uIGRlbHRhKHAxLCBwMikge1xuICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHAxLnggLSBwMi54LCAyKSArIE1hdGgucG93KHAxLnkgLSBwMi55LCAyKSk7IC8vIHB5dGhhZ29yZWFuIVxufVxuXG4vLyByZXR1cm5zIGFuIGFycmF5IG9mIHRoZSBpbnRlcmlvciBjdXJ2ZXMgb2YgYSBnaXZlbiBjb21wb3VuZCBwYXRoXG5leHBvcnQgZnVuY3Rpb24gZmluZEludGVyaW9yQ3VydmVzKHBhdGgpIHtcbiAgbGV0IGludGVyaW9yQ3VydmVzID0gW107XG4gIGlmICghcGF0aCB8fCAhcGF0aC5jaGlsZHJlbiB8fCAhcGF0aC5jaGlsZHJlbi5sZW5ndGgpIHJldHVybjtcblxuICBmb3IgKGxldCBpID0gMDsgaSA8IHBhdGguY2hpbGRyZW4ubGVuZ3RoOyBpKyspIHtcbiAgICBsZXQgY2hpbGQgPSBwYXRoLmNoaWxkcmVuW2ldO1xuXG4gICAgaWYgKGNoaWxkLmNsb3NlZCl7XG4gICAgICBpbnRlcmlvckN1cnZlcy5wdXNoKG5ldyBQYXRoKGNoaWxkLnNlZ21lbnRzKSk7XG4gICAgfVxuICB9XG5cbiAgcGF0aC5yZW1vdmUoKTtcbiAgcmV0dXJuIGludGVyaW9yQ3VydmVzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJ1ZUdyb3VwKGdyb3VwKSB7XG4gIGxldCBib3VuZHMgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5ib3VuZHNbMF0sXG4gICAgICBtaWRkbGUgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5taWRkbGVbMF07XG5cbiAgbGV0IG1pZGRsZUNvcHkgPSBuZXcgUGF0aCgpO1xuICBtaWRkbGVDb3B5LmNvcHlDb250ZW50KG1pZGRsZSk7XG4gIG1pZGRsZUNvcHkudmlzaWJsZSA9IGZhbHNlO1xuICBsZXQgZGl2aWRlZFBhdGggPSBtaWRkbGVDb3B5LnJlc29sdmVDcm9zc2luZ3MoKTtcbiAgZGl2aWRlZFBhdGgudmlzaWJsZSA9IGZhbHNlO1xuICBCYXNlLmVhY2goZGl2aWRlZFBhdGguY2hpbGRyZW4sIGZ1bmN0aW9uKGNoaWxkLCBpKSB7XG4gICAgaWYgKGNoaWxkLmNsb3NlZCkge1xuICAgICAgY2hpbGQuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICB9IGVsc2Uge1xuICAgICAgY2hpbGQuc2VsZWN0ZWQgPSB0cnVlO1xuICAgIH1cbiAgICAvLyBjb25zb2xlLmxvZyhjaGlsZCwgaSk7XG4gIH0pXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cnVlUGF0aChwYXRoKSB7XG4gIC8vIGNvbnNvbGUubG9nKGdyb3VwKTtcbiAgLy8gaWYgKHBhdGggJiYgcGF0aC5jaGlsZHJlbiAmJiBwYXRoLmNoaWxkcmVuLmxlbmd0aCA+IDAgJiYgcGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pIHtcbiAgLy8gICBsZXQgcGF0aENvcHkgPSBuZXcgUGF0aCgpO1xuICAvLyAgIGNvbnNvbGUubG9nKHBhdGguX25hbWVkQ2hpbGRyZW5bJ21pZGRsZSddKTtcbiAgLy8gICBwYXRoQ29weS5jb3B5Q29udGVudChwYXRoLl9uYW1lZENoaWxkcmVuWydtaWRkbGUnXSk7XG4gIC8vICAgY29uc29sZS5sb2cocGF0aENvcHkpO1xuICAvLyB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja1BvcHMoKSB7XG4gIGxldCBncm91cHMgPSBwYXBlci5wcm9qZWN0LmdldEl0ZW1zKHtcbiAgICBjbGFzc05hbWU6ICdHcm91cCcsXG4gICAgbWF0Y2g6IGZ1bmN0aW9uKGVsKSB7XG4gICAgICByZXR1cm4gKCEhZWwuZGF0YSAmJiBlbC5kYXRhLnVwZGF0ZSk7XG4gICAgfVxuICB9KTtcbn1cblxuLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIXRvcGljL3BhcGVyanMvVUQ4TDBNVHlSZVFcbmV4cG9ydCBmdW5jdGlvbiBvdmVybGFwcyhwYXRoLCBvdGhlcikge1xuICByZXR1cm4gIShwYXRoLmdldEludGVyc2VjdGlvbnMob3RoZXIpLmxlbmd0aCA9PT0gMCk7XG59XG5cbi8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyF0b3BpYy9wYXBlcmpzL1VEOEwwTVR5UmVRXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VPbmVQYXRoKHBhdGgsIG90aGVycykge1xuICBsZXQgaSwgbWVyZ2VkLCBvdGhlciwgdW5pb24sIF9pLCBfbGVuLCBfcmVmO1xuICBmb3IgKGkgPSBfaSA9IDAsIF9sZW4gPSBvdGhlcnMubGVuZ3RoOyBfaSA8IF9sZW47IGkgPSArK19pKSB7XG4gICAgb3RoZXIgPSBvdGhlcnNbaV07XG4gICAgaWYgKG92ZXJsYXBzKHBhdGgsIG90aGVyKSkge1xuICAgICAgdW5pb24gPSBwYXRoLnVuaXRlKG90aGVyKTtcbiAgICAgIG1lcmdlZCA9IG1lcmdlT25lUGF0aCh1bmlvbiwgb3RoZXJzLnNsaWNlKGkgKyAxKSk7XG4gICAgICByZXR1cm4gKF9yZWYgPSBvdGhlcnMuc2xpY2UoMCwgaSkpLmNvbmNhdC5hcHBseShfcmVmLCBtZXJnZWQpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gb3RoZXJzLmNvbmNhdChwYXRoKTtcbn07XG5cbi8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyF0b3BpYy9wYXBlcmpzL1VEOEwwTVR5UmVRXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VQYXRocyhwYXRocykge1xuICB2YXIgcGF0aCwgcmVzdWx0LCBfaSwgX2xlbjtcbiAgcmVzdWx0ID0gW107XG4gIGZvciAoX2kgPSAwLCBfbGVuID0gcGF0aHMubGVuZ3RoOyBfaSA8IF9sZW47IF9pKyspIHtcbiAgICBwYXRoID0gcGF0aHNbX2ldO1xuICAgIHJlc3VsdCA9IG1lcmdlT25lUGF0aChwYXRoLCByZXN1bHQpO1xuICB9XG4gIHJldHVybiByZXN1bHQ7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gaGl0VGVzdEJvdW5kcyhwb2ludCwgY2hpbGRyZW4pIHtcbiAgaWYgKCFwb2ludCkgcmV0dXJuIG51bGw7XG5cbiAgZm9yIChsZXQgaSA9IGNoaWxkcmVuLmxlbmd0aCAtIDE7IGkgPj0gMDsgaS0tKSB7XG4gICAgbGV0IGNoaWxkID0gY2hpbGRyZW5baV07XG4gICAgbGV0IGJvdW5kcyA9IGNoaWxkLnN0cm9rZUJvdW5kcztcbiAgICBpZiAocG9pbnQuaXNJbnNpZGUoY2hpbGQuc3Ryb2tlQm91bmRzKSkge1xuICAgICAgcmV0dXJuIGNoaWxkO1xuICAgIH1cbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuIl19
