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

exports.shape = {
  extendingThreshold: 0.1,
  trimmingThreshold: 0.075,
  cornerThresholdDeg: 30
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

exports.log = true;

exports.runAnimations = true;

exports.sound = {
  bpm: 140,
  measures: 4
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
	}, {
		points: [{ "x": 290, "y": 256 }, { "x": 285, "y": 291 }, { "x": 301, "y": 347 }, { "x": 359, "y": 367 }, { "x": 402, "y": 367 }, { "x": 511, "y": 308 }, { "x": 559, "y": 246 }, { "x": 560, "y": 225 }, { "x": 513, "y": 194 }, { "x": 477, "y": 186 }, { "x": 410.44786, "y": 185.58245 }],
		name: "circle"
	}, {
		points: [{ "x": 342, "y": 187 }, { "x": 270, "y": 267 }, { "x": 234, "y": 380 }, { "x": 234, "y": 398 }, { "x": 278, "y": 445 }, { "x": 386, "y": 467 }, { "x": 452, "y": 450 }, { "x": 479, "y": 425 }, { "x": 489, "y": 272 }, { "x": 445, "y": 178 }, { "x": 356, "y": 170 }],
		name: "circle"
	},
	// {
	// 	points: [{"x":597,"y":58},{"x":590,"y":111},{"x":642,"y":78},{"x":636,"y":67},{"x":600,"y":52},{"x":597,"y":52}],
	// 	name: "circle"
	// },
	// {
	// 	points: [{"x":228,"y":464},{"x":191,"y":467},{"x":190,"y":519},{"x":224,"y":524},{"x":248,"y":523},{"x":314,"y":477},{"x":291,"y":460},{"x":229,"y":452},{"x":206,"y":452}],
	// 	name: "circle"
	// },
	{
		points: [{ x: 380, y: 202 }, { x: 529, y: 265 }, { x: 580, y: 313 }, { x: 571, y: 367 }, { x: 492, y: 401 }, { x: 472, y: 334 }, { x: 478, y: 313 }, { x: 521, y: 248 }, { x: 611, y: 174 }],
		name: "other"
	}, {
		points: [{ x: 553, y: 292 }, { x: 579, y: 297 }, { x: 608, y: 297 }, { x: 609, y: 286 }, { x: 585, y: 267 }, { x: 540, y: 282 }, { x: 521, y: 311 }, { x: 540, y: 321 }, { x: 611, y: 319 }, { x: 626, y: 290 }, { x: 625, y: 257 }, { x: 548, y: 227 }, { x: 516, y: 228 }, { x: 495, y: 236 }, { x: 451, y: 276 }, { x: 447, y: 324 }, { x: 506, y: 400 }, { x: 593, y: 416 }, { x: 680, y: 385 }],
		name: "other"
	}, {
		points: [{ x: 42, y: 83 }, { x: 74, y: 84 }, { x: 82, y: 85 }, { x: 86, y: 86 }, { x: 44, y: 74 }, { x: 63, y: 82 }, { x: 56, y: 88 }, { x: 48, y: 95 }, { x: 57, y: 63 }, { x: 65, y: 53 }, { x: 64, y: 69 }, { x: 58, y: 106 }],
		name: "other"
	}, {
		points: [{ x: 135, y: 491 }, { x: 124, y: 424 }, { x: 96, y: 418 }, { x: 88, y: 434 }, { x: 88, y: 437 }, { x: 113, y: 413 }, { x: 114, y: 395 }, { x: 102, y: 391 }, { x: 90, y: 390 }, { x: 78, y: 405 }, { x: 70, y: 480 }, { x: 85, y: 502 }, { x: 93, y: 510 }],
		name: "other"
	}, {
		points: [{ x: 81, y: 219 }, { x: 84, y: 218 }, { x: 86, y: 220 }, { x: 88, y: 220 }, { x: 90, y: 220 }, { x: 92, y: 219 }, { x: 95, y: 220 }, { x: 97, y: 219 }, { x: 99, y: 220 }, { x: 102, y: 218 }, { x: 105, y: 217 }, { x: 107, y: 216 }, { x: 110, y: 216 }, { x: 113, y: 214 }, { x: 116, y: 212 }, { x: 118, y: 210 }, { x: 121, y: 208 }, { x: 124, y: 205 }, { x: 126, y: 202 }, { x: 129, y: 199 }, { x: 132, y: 196 }, { x: 136, y: 191 }, { x: 139, y: 187 }, { x: 142, y: 182 }, { x: 144, y: 179 }, { x: 146, y: 174 }, { x: 148, y: 170 }, { x: 149, y: 168 }, { x: 151, y: 162 }, { x: 152, y: 160 }, { x: 152, y: 157 }, { x: 152, y: 155 }, { x: 152, y: 151 }, { x: 152, y: 149 }, { x: 152, y: 146 }, { x: 149, y: 142 }, { x: 148, y: 139 }, { x: 145, y: 137 }, { x: 141, y: 135 }, { x: 139, y: 135 }, { x: 134, y: 136 }, { x: 130, y: 140 }, { x: 128, y: 142 }, { x: 126, y: 145 }, { x: 122, y: 150 }, { x: 119, y: 158 }, { x: 117, y: 163 }, { x: 115, y: 170 }, { x: 114, y: 175 }, { x: 117, y: 184 }, { x: 120, y: 190 }, { x: 125, y: 199 }, { x: 129, y: 203 }, { x: 133, y: 208 }, { x: 138, y: 213 }, { x: 145, y: 215 }, { x: 155, y: 218 }, { x: 164, y: 219 }, { x: 166, y: 219 }, { x: 177, y: 219 }, { x: 182, y: 218 }, { x: 192, y: 216 }, { x: 196, y: 213 }, { x: 199, y: 212 }, { x: 201, y: 211 }],
		name: "other"
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

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

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

function log(thing) {
  util.log(thing);
}

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
  var runAnimations = config.runAnimations;
  var transparent = new Color(0, 0);
  var thresholdAngle = util.rad(config.shape.cornerThresholdDeg);
  var detector = new ShapeDetector(ShapeDetector.defaultShapes);
  var composition = [];
  var compositionInterval = void 0;

  var viewWidth = void 0,
      viewHeight = void 0;

  var playing = false;

  function quantizePosition(position) {
    return sound.quantizePosition(position, viewWidth);
  }

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
      if (!$body.hasClass(playingClass)) {
        var $svg = $(this).find('svg.palette-color');

        if (!$svg.hasClass(paletteSelectedClass)) {
          $('.' + paletteSelectedClass).removeClass(paletteSelectedClass).attr('width', paletteColorSize).attr('height', paletteColorSize).find('rect').attr('rx', 0).attr('ry', 0);

          $svg.addClass(paletteSelectedClass).attr('width', paletteSelectedColorSize).attr('height', paletteSelectedColorSize).find('rect').attr('rx', paletteSelectedColorSize / 2).attr('ry', paletteSelectedColorSize / 2);

          window.kan.currentColor = $svg.find('rect').attr('fill');
        }
      };
    });
  }

  function initCanvasDraw() {

    paper.setup($canvas[0]);

    var middle = void 0,
        bounds = void 0;
    var sizes = void 0;
    // let paths = getFreshPaths(window.kan.numPaths);
    var touch = false;
    var lastChild = void 0;
    var pathData = {};
    var prevAngle = void 0,
        prevPoint = void 0;

    var sides = void 0;
    var side = void 0;

    var corners = void 0;

    var sounds = sound.initShapeSounds();
    var beatLength = 60 / config.sound.bpm;
    var measureLength = beatLength * 4;
    var compositionLength = measureLength * config.sound.measures;

    function panStart(event) {
      // paper.project.activeLayer.removeChildren(); // REMOVE
      // drawCircle();

      sizes = [];
      prevAngle = Math.atan2(event.velocityY, event.velocityX);

      stopPlaying();
      if (pinching) return;
      if (!(event.changedPointers && event.changedPointers.length > 0)) return;
      if (event.changedPointers.length > 1) {
        log('event.changedPointers > 1');
      }

      var pointer = event.center;
      var point = new Point(pointer.x, pointer.y);

      bounds = new Path({
        strokeColor: window.kan.currentColor,
        fillColor: window.kan.currentColor,
        name: 'bounds',
        visible: false
      });

      middle = new Path({
        strokeColor: window.kan.currentColor,
        name: 'middle',
        strokeWidth: 5,
        visible: true,
        strokeCap: 'round'
      });

      bounds.add(point);
      middle.add(point);

      prevPoint = point;
      corners = [point];

      sides = [];
      side = [point];

      pathData[shape.stringifyPoint(point)] = {
        point: point,
        first: true
      };
    }

    var min = 1;
    var max = 15;
    var alpha = 0.3;
    var memory = 10;
    var cumDistance = 0;
    var cumSize = void 0,
        avgSize = void 0;
    function panMove(event) {
      event.preventDefault();
      if (pinching) return;
      // log(event.overallVelocity);
      // let thisDist = parseInt(event.distance);
      // cumDistance += thisDist;
      //
      // if (cumDistance < 100) {
      //   log('ignoring');
      //   return;
      // } else {
      //   cumDistance = 0;
      //   log('not ignoring');
      // }

      var pointer = event.center;
      var point = new Point(pointer.x, pointer.y);

      // angle = -1 * event.angle; // make up positive rather than negative
      // angle = angle += 180;
      // console.log(event.velocityX, event.velocityY);
      var angle = Math.atan2(event.velocityY, event.velocityX);
      var angleDelta = util.angleDelta(angle, prevAngle);
      prevAngle = angle;

      if (angleDelta > thresholdAngle) {
        if (side.length > 0) {
          // console.log('corner');
          var cornerPoint = point;
          // new Path.Circle({
          //   center: cornerPoint,
          //   radius: 15,
          //   strokeColor: 'black'
          // });
          corners.push(cornerPoint);
          sides.push(side);
          side = [];
        }
      }
      side.push(point);
      // let angleDeg = -1 * event.angle;
      // if (angleDeg < 0) angleDeg += 360; // normalize to [0, 360)
      // angle = util.rad(angleDeg);
      //
      // // let angleDelta = Math.atan2(Math.sin(angle), Math.cos(angle)) - Math.atan2(Math.sin(prevAngle), Math.cos(prevAngle));
      // console.log(angle, prevAngle);
      // // console.log(angleDelta);

      // console.log(angle);

      // let angleDelta = Math.abs(prevAngle - angle);
      // if (angleDelta > 360) angleDelta = angleDelta - 360;
      // if (angleDelta > 90) {
      //   console.log(angle, prevAngle, angleDelta);
      //   console.error('corner!');
      // } else {
      //   // console.log(angleDelta);
      // }

      // while (sizes.length > memory) {
      //   sizes.shift();
      // }

      // let bottomX, bottomY, bottom,
      //   topX, topY, top,
      //   p0, p1,
      //   step, angle, dist, size;

      // if (sizes.length > 0) {
      //   // not the first point, so we have others to compare to
      //   p0 = prevPoint;
      //   dist = util.delta(point, p0);
      //   size = dist * alpha;
      //   // if (size >= max) size = max;
      //   size = Math.max(Math.min(size, max), min); // clamp size to [min, max]
      //   // size = max - size;
      //
      //   cumSize = 0;
      //   for (let j = 0; j < sizes.length; j++) {
      //     cumSize += sizes[j];
      //   }
      //   avgSize = Math.round(((cumSize / sizes.length) + size) / 2);
      //   // log(avgSize);
      //
      //   angle = Math.atan2(point.y - p0.y, point.x - p0.x); // rad
      //
      //   // Point(bottomX, bottomY) is bottom, Point(topX, topY) is top
      //   bottomX = point.x + Math.cos(angle + Math.PI/2) * avgSize;
      //   bottomY = point.y + Math.sin(angle + Math.PI/2) * avgSize;
      //   bottom = new Point(bottomX, bottomY);
      //
      //   topX = point.x + Math.cos(angle - Math.PI/2) * avgSize;
      //   topY = point.y + Math.sin(angle - Math.PI/2) * avgSize;
      //   top = new Point(topX, topY);
      //
      //   // bounds.add(top);
      //   // bounds.insert(0, bottom);
      //   // bounds.smooth();
      //
      //   // pathData[shape.stringifyPoint(point)] = {
      //   //   point: point,
      //   //   speed: Math.abs(event.overallVelocity)
      //   // };
      //   // if (shape.stringifyPoint(point) in pathData) {
      //   //   log('duplicate!');
      //   // } else {
      //   // }
      //   // middle.smooth();
      // } else {
      //   // don't have anything to compare to
      //   dist = 1;
      //   angle = 0;
      //
      //   size = dist * alpha;
      //   size = Math.max(Math.min(size, max), min); // clamp size to [min, max]
      // }

      pathData[shape.stringifyPoint(point)] = {
        point: point,
        speed: Math.abs(event.overallVelocity),
        angle: angle
      };
      middle.add(point);

      paper.view.draw();

      prevPoint = point;
      // sizes.push(size);
    }

    function panEnd(event) {
      if (pinching) return;

      var pointer = event.center;
      var point = new Point(pointer.x, pointer.y);

      var group = new Group([bounds, middle]);
      group.data.color = bounds.fillColor;
      group.data.update = true;

      bounds.add(point);
      bounds.closed = true;
      // bounds.simplify();

      middle.add(point);
      // middle.simplify();

      side.push(point);
      sides.push(side);

      pathData[shape.stringifyPoint(point)] = {
        point: point,
        last: true
      };

      corners.push(point);

      middle.simplify();

      var shapeJSON = middle.exportJSON();
      var shapeData = shape.processShapeData(shapeJSON);
      console.log(shapeData);
      var shapePrediction = detector.spot(shapeData);
      var shapePattern = void 0;
      if (shapePrediction.score > 0.5) {
        shapePattern = shapePrediction.pattern;
      } else {
        shapePattern = "other";
      }

      console.log('shape before', shapePattern, shapePrediction.score);;
      // middle.reduce();

      var _util$trueGroup = util.trueGroup(group, corners),
          _util$trueGroup2 = _slicedToArray(_util$trueGroup, 2),
          truedGroup = _util$trueGroup2[0],
          trueWasNecessary = _util$trueGroup2[1];

      group.replaceWith(truedGroup);
      middle = group._namedChildren.middle[0];
      middle.strokeColor = group.strokeColor;
      // middle.selected = true;

      // bounds.flatten(4);
      // bounds.smooth();

      // middle.flatten(4);
      // middle.reduce();

      // middle.simplify();
      if (trueWasNecessary) {
        var computedCorners = shape.getComputedCorners(middle);
        var computedCornersPath = new Path(computedCorners);
        computedCornersPath.visible = false;
        var computedCornersPathLength = computedCornersPath.length;
        if (Math.abs(computedCornersPathLength - middle.length) / middle.length <= 0.1) {
          middle.removeSegments();
          // console.log(computedCorners);
          middle.segments = computedCorners;
          // middle.reduce();
        }
      }

      // if (['circle'].includes(shapePattern)) {
      //   middle.simplify();
      // }

      var strokes = shape.getStrokes(middle, pathData);
      middle.replaceWith(strokes);

      // middle.reduce();

      // middle.selected = false;
      // middle.visible = true;
      // middle.strokeColor = 'pink';
      // middle.strokeWeight = 50;


      // let mergedCorners = corners.concat(computedCorners);
      // let foo = new Path(mergedCorners);
      // foo.strokeWidth = 5;
      // foo.strokeColor = 'blue';
      // let cornersPath = new Path({
      //   strokeWidth: 5,
      //   strokeColor: 'red'
      // });
      // Base.each(mergedCorners, (corner, i) => {
      //   cornersPath.add(corner);
      //   // if (i < 2) {
      //   //   cornersPath.add(corner);
      //   // } else {
      //   //   let closestPoint = cornersPath.getNearestPoint(corner);
      //   //   cornersPath.insert(corner, closestPoint.index + 1);
      //   // }
      // });
      // let cornersPath = new Path({
      //   strokeWidth: 5,
      //   strokeColor: 'red',
      //   segments: corners
      // });
      // let computedCornersPath = new Path({
      //   strokeWidth: 5,
      //   strokeColor: 'blue',
      //   segments: computedCorners,
      //   closed: true
      // });

      // let thresholdDist = 0.05 * computedCornersPath.length;
      //
      // Base.each(corners, (corner, i) => {
      //   let integerPoint = shape.getIntegerPoint(corner);
      //   let closestPoint = computedCornersPath.getNearestPoint(corner);
      // });
      // computedCorners.visible = false;
      // computedCornersPath.visible = false;
      // let mergedCornersPath = cornersPath.unite(computedCornersPath);
      // mergedCornersPath.strokeColor = 'purple';
      // cornersPath.flatten();
      // }

      // if (trueWasNecessary) {
      //   let idealGeometry = shape.getIdealGeometry(pathData, sides, middle);
      //   log(idealGeometry);
      //   Base.each(corners, (corner, i) => {
      //     idealGeometry.add(corner);
      //   });
      //   idealGeometry.reduce();
      //
      //   idealGeometry.strokeColor = 'red';
      // } else {
      //   log('no trueing necessary');
      // }
      // middle.smooth({
      //   type: 'geometric'
      // });
      // middle.flatten(10);
      // middle.simplify();
      // middle.flatten(20);
      // middle.simplify();
      // middle.flatten();
      // middle.simplify();

      // middle.selected = true;
      // let middleClone = middle.clone();
      // middleClone.visible = true;
      // middleClone.strokeColor = 'pink';

      // check shape
      shapeJSON = middle.exportJSON();
      shapeData = shape.processShapeData(shapeJSON);
      shapePrediction = detector.spot(shapeData);
      if (shapePrediction.score > 0.6) {
        shapePattern = shapePrediction.pattern;
      } else {
        shapePattern = "other";
      }
      var colorName = color.getColorName(window.kan.currentColor);

      // get size
      var quantizedSoundStartTime = sound.quantizeLength(group.bounds.x / viewWidth * compositionLength) * 1000; // ms
      var quantizedSoundDuration = sound.quantizeLength(group.bounds.width / viewWidth * compositionLength) * 1000; // ms

      // console.log(config.shapes[shapePattern]);
      // console.log(sounds[shapePattern]);
      var playSounds = false;
      var compositionObj = {};
      compositionObj.sound = sounds[shapePattern];
      compositionObj.startTime = quantizedSoundStartTime;
      compositionObj.duration = quantizedSoundDuration;
      compositionObj.groupId = group.id;
      if (config.shapes[shapePattern].sprite) {
        compositionObj.sprite = true;
        compositionObj.spriteName = colorName;

        if (playSounds) {
          sounds[shapePattern].play(colorName);
        }
      } else {
        compositionObj.sprite = false;

        if (playSounds) {
          sounds[shapePattern].play();
        }
      }

      composition.push(compositionObj);

      // set sound to loop again
      console.log(shapePattern + '-' + colorName);

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
            enclosedLoops[i].fillColor = group.strokeColor;
            enclosedLoops[i].data.interior = true;
            enclosedLoops[i].data.transparent = false;
            // enclosedLoops[i].blendMode = 'multiply';
            group.addChild(enclosedLoops[i]);
            enclosedLoops[i].sendToBack();
          }
        }
        pathCopy.remove();
      } else {
        if (middle.closed) {
          var enclosedLoop = middle.clone();
          enclosedLoop.visible = true;
          enclosedLoop.fillColor = group.strokeColor;
          enclosedLoop.data.interior = true;
          enclosedLoop.data.transparent = false;
          group.addChild(enclosedLoop);
          enclosedLoop.sendToBack();
        }
      }

      group.data.color = bounds.fillColor;
      group.data.scale = 1; // init variable to track scale changes
      group.data.rotation = 0; // init variable to track rotation changes

      var children = group.getItems({
        match: function match(item) {
          return item.name !== 'middle';
        }
      });

      // log('-----');
      // log(group);
      // log(children);
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

      // middle.selected = true

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
      stopPlaying();

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
        log('hit no item');
      }
    }

    function pinchMove(event) {
      log('pinchMove');
      event.preventDefault();
      if (!!pinchedGroup) {
        // log('pinchmove', event);
        // log(pinchedGroup);
        var currentScale = event.scale;
        var scaleDelta = currentScale / lastScale;
        // log(lastScale, currentScale, scaleDelta);
        lastScale = currentScale;

        var currentRotation = event.rotation;
        var rotationDelta = currentRotation - lastRotation;
        log(lastRotation, currentRotation, rotationDelta);
        lastRotation = currentRotation;

        // log(`scaling by ${scaleDelta}`);
        // log(`rotating by ${rotationDelta}`);

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

        log('final scale', pinchedGroup.data.scale);
        log(move);

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
      stopPlaying();

      var pointer = event.center,
          point = new Point(pointer.x, pointer.y),
          hitResult = paper.project.hitTest(point, hitOptions);

      if (hitResult) {
        var item = hitResult.item;
        item.selected = !item.selected;
        log(item);
      }
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
          log('not interior');
        }
      } else {
        pinchedGroup = null;
        log('hit no item');
      }
    }

    var velocityMultiplier = 25;
    function throwPinchedGroup() {
      log(pinchedGroup.position);
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

  var playingClass = 'playing';
  function newPressed() {
    log('new pressed');
    composition = [];
    paper.project.activeLayer.removeChildren();
  }

  function undoPressed() {
    log('undo pressed');
    if (!(MOVES.length > 0)) {
      log('no moves yet');
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
          log('removing group');
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
          log('unknown case');
      }
    } else {
      log('could not find matching item');
    }
  }

  function stopPlaying() {
    var mute = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

    if (!!mute) {
      Howler.mute(true);
    }
    $body.removeClass(playingClass);

    playing = false;
    sound.stopComposition(compositionInterval);
  }

  function startPlaying() {
    $body.addClass(playingClass);
    Howler.mute(false);
    playing = true;
    compositionInterval = sound.startComposition(composition);
  }

  function playPressed() {
    log('play pressed');
    if (playing) {
      stopPlaying(true);
    } else {
      startPlaying();
    }
    console.log('play pressed');
  }

  function tipsPressed() {
    log('tips pressed');
  }

  function sharePressed() {
    log('share pressed');
  }

  function initNew() {
    $('.main-controls .new').on('click tap touch', function () {
      if (!$body.hasClass(playingClass)) {
        newPressed();
      }
    });
  }

  function initUndo() {
    $('.main-controls .undo').on('click', function () {
      if (!$body.hasClass(playingClass)) {
        undoPressed();
      }
    });
  }

  function initPlay() {
    $('.main-controls .play-stop').on('click', playPressed);
  }

  function initTips() {
    $('.aux-controls .tips').on('click', function () {
      if (!$body.hasClass(playingClass)) {
        tipsPressed();
      }
    });
  }

  function initShare() {
    $('.aux-controls .share').on('click', function () {
      if (!$body.hasClass(playingClass)) {
        sharePressed();
      }
    });
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
exports.getStrokes = getStrokes;
exports.getIdealGeometry = getIdealGeometry;
exports.OldgetIdealGeometry = OldgetIdealGeometry;
exports.getIntegerPoint = getIntegerPoint;
exports.stringifyPoint = stringifyPoint;
exports.parsePoint = parsePoint;
exports.getClosestPointFromPathData = getClosestPointFromPathData;
exports.getComputedCorners = getComputedCorners;
exports.processShapeData = processShapeData;
var util = require('./util');
var config = require('./../../config');

function log() {
  util.log.apply(util, arguments);
}

function getStrokes(path, pathData) {
  var pathClone = path.clone();
  var strokes = new Path();
  Base.each(pathClone.segments, function (segment, i) {
    console.log(segment);
    var point = segment.point;
    var pointStr = stringifyPoint(point);
    var pointData = void 0;
    if (pointStr in pathData) {
      pointData = pathData[pointStr];
    } else {
      var nearestPoint = getClosestPointFromPathData(point, pathData);
      pointStr = stringifyPoint(nearestPoint);
      if (pointStr in pathData) {
        pointData = pathData[pointStr];
      } else {
        log('could not find close point');
      }
    }

    if (pointData) {
      console.log(pointData);
    }
  });
  return pathClone;
}

function getIdealGeometry(pathData, sides, simplifiedPath) {
  var thresholdDist = 0.05 * simplifiedPath.length;

  var returnPath = new Path({
    strokeWidth: 5,
    strokeColor: 'pink'
  });

  var truedPath = new Path({
    strokeWidth: 5,
    strokeColor: 'green'
  });

  // new Path.Circle({
  //   center: simplifiedPath.firstSegment.point,
  //   radius: 3,
  //   fillColor: 'black'
  // });

  var firstPoint = new Path.Circle({
    center: simplifiedPath.firstSegment.point,
    radius: 10,
    strokeColor: 'blue'
  });

  var lastPoint = new Path.Circle({
    center: simplifiedPath.lastSegment.point,
    radius: 10,
    strokeColor: 'red'
  });

  var angle = void 0,
      prevAngle = void 0,
      angleDelta = void 0;
  Base.each(sides, function (side, i) {
    var firstPoint = side[0];
    var lastPoint = side[side.length - 1];

    angle = Math.atan2(lastPoint.y - firstPoint.y, lastPoint.x - firstPoint.x);

    if (!!prevAngle) {
      angleDelta = util.angleDelta(angle, prevAngle);
      console.log(angleDelta);
      returnPath.add(firstPoint);
      returnPath.add(lastPoint);
    }

    prevAngle = angle;
  });

  Base.each(simplifiedPath.segments, function (segment, i) {
    var integerPoint = getIntegerPoint(segment.point);
    var nearestPoint = returnPath.getNearestPoint(integerPoint);
    // console.log(integerPoint.getDistance(nearestPoint), thresholdDist);
    if (integerPoint.getDistance(nearestPoint) <= thresholdDist) {
      truedPath.add(nearestPoint);
      new Path.Circle({
        center: nearestPoint,
        radius: 3,
        fillColor: 'black'
      });
    } else {
      console.log('off path');
      truedPath.add(integerPoint);
      new Path.Circle({
        center: integerPoint,
        radius: 3,
        fillColor: 'green'
      });
    }
  });

  // truedPath.add(simplifiedPath.lastSegment.point);
  // new Path.Circle({
  //   center: simplifiedPath.lastSegment.point,
  //   radius: 3,
  //   fillColor: 'black'
  // });

  if (simplifiedPath.closed) {
    truedPath.closed = true;
  }

  // Base.each(truedPath, (point, i) => {
  //   truedPath.removeSegment(i);
  // });

  return truedPath;
}

function OldgetIdealGeometry(pathData, path) {
  var thresholdAngle = Math.PI / 2;
  var thresholdDist = 0.1 * path.length;
  // log(path);

  var count = 0;

  var sides = [];
  var side = [];
  var prev = void 0;
  var prevAngle = void 0;

  // log('thresholdAngle', thresholdAngle);

  var returnPath = new Path();

  Base.each(path.segments, function (segment, i) {
    var integerPoint = getIntegerPoint(segment.point);
    var pointStr = stringifyPoint(integerPoint);
    var pointData = void 0;
    if (pointStr in pathData) {
      pointData = pathData[pointStr];
    } else {
      var nearestPoint = getClosestPointFromPathData(pathData, integerPoint);
      pointStr = stringifyPoint(nearestPoint);

      if (pointStr in pathData) {
        pointData = pathData[pointStr];
      } else {
        log('could not find close point');
      }
    }

    if (pointData) {
      returnPath.add(integerPoint);
      new Path.Circle({
        center: integerPoint,
        radius: 5,
        strokeColor: new Color(i / path.segments.length, i / path.segments.length, i / path.segments.length)
      });
      log(pointData.point);
      if (!prev) {
        // first point
        // log('pushing first point to side');
        side.push(pointData);
      } else {
        // let angleFoo = integerPoint.getDirectedAngle(prev);
        var angle = Math.atan2(integerPoint.y, integerPoint.x) - Math.atan2(prev.y, prev.x);
        if (angle < 0) angle += 2 * Math.PI; // normalize to [0, 2π)
        // log(angleFoo, angleBar);
        // let angle = Math.atan2(integerPoint.y - prev.y, integerPoint.x - prev.x);
        // let line = new Path.Line(prev, integerPoint);
        // line.strokeWidth = 5;
        // line.strokeColor = 'pink';
        // line.rotate(util.deg(Math.cos(angle) * Math.PI * 2));
        // log('angle', angle);
        if (typeof prevAngle === 'undefined') {
          // second point
          side.push(pointData);
        } else {
          var angleDifference = Math.pow(angle - prevAngle, 2);
          log('angleDifference', angleDifference);
          if (angleDifference <= thresholdAngle) {
            // same side
            // log('pushing point to same side');
            side.push(pointData);
          } else {
            // new side
            // log('new side');
            sides.push(side);
            side = [pointData];
          }
        }

        prevAngle = angle;
      }

      prev = integerPoint;
      count++;
    } else {
      log('no data');
    }
  });

  // log(count);

  sides.push(side);

  return sides;
}

function getIntegerPoint(point) {
  return new Point(Math.floor(point.x), Math.floor(point.y));
}

function stringifyPoint(point) {
  return Math.floor(point.x) + ',' + Math.floor(point.y);
}

function parsePoint(pointStr) {
  var split = pointStr.split(',').map(function (num) {
    return Math.floor(num);
  });

  if (split.length >= 2) {
    return new Point(split[0], split[1]);
  }

  return null;
}

function getClosestPointFromPathData(point, pathData) {
  var leastDistance = void 0,
      closestPoint = void 0;

  Base.each(pathData, function (datum, i) {
    var distance = point.getDistance(datum.point);
    if (!leastDistance || distance < leastDistance) {
      leastDistance = distance;
      closestPoint = datum.point;
    }
  });

  return closestPoint || point;
}

function getComputedCorners(path) {
  var thresholdAngle = util.rad(config.shape.cornerThresholdDeg);
  var thresholdDistance = 0.1 * path.length;

  var corners = [];

  if (path.length > 0) {
    (function () {
      var point = void 0,
          prev = void 0;
      var angle = void 0,
          prevAngle = void 0,
          angleDelta = void 0;

      Base.each(path.segments, function (segment, i) {
        var point = getIntegerPoint(segment.point);
        if (!!prev) {
          var _angle = Math.atan2(point.y - prev.y, point.x - prev.x);
          if (_angle < 0) _angle += 2 * Math.PI; // normalize to [0, 2π)
          if (!!prevAngle) {
            angleDelta = util.angleDelta(_angle, prevAngle);
            if (angleDelta >= thresholdAngle) {
              // console.log('corner');
              // new Path.Circle({
              //   center: prev,
              //   radius: 10,
              //   fillColor: 'pink'
              // });
              corners.push(prev);
            } else {
              // console.log(angleDelta);
            }
          }

          prevAngle = _angle;
        } else {
          // first point
          corners.push(point);
          // new Path.Circle({
          //   center: point,
          //   radius: 10,
          //   fillColor: 'pink'
          // })
        }
        prev = point;
      });

      var lastSegmentPoint = getIntegerPoint(path.lastSegment.point);
      corners.push(lastSegmentPoint);

      var returnCorners = [];
      var skippedIds = [];
      for (var i = 0; i < corners.length; i++) {
        var _point = corners[i];

        if (i !== 0) {
          var dist = _point.getDistance(prev);
          var closestPoints = [];
          while (dist < thresholdDistance) {
            closestPoints.push({
              point: _point,
              index: i
            });

            if (i < corners.length - 1) {
              i++;
              prev = _point;
              _point = corners[i];
              dist = _point.getDistance(prev);
            } else {
              break;
            }
          }
          if (closestPoints.length > 0) {
            var sumX = 0,
                sumY = 0;


            Base.each(closestPoints, function (pointObj) {
              sumX += pointObj.point.x;
              sumY += pointObj.point.y;
            });

            var avgX = sumX / closestPoints.length,
                avgY = sumY / closestPoints.length;

            returnCorners.push(new Point(avgX, avgY));
          }
        } else {
          returnCorners.push(_point);
        }

        prev = _point;
      }

      // Base.each(corners, (corner, i) => {
      //   let point = corner;
      //
      //   if (i !== 0) {
      //     let dist = point.getDistance(prev);
      //     let closestPoints = [];
      //     let index = i;
      //     while (dist < thresholdDistance) {
      //       closestPoints.push({
      //         point: point,
      //         index: index
      //       });
      //     }
      //     console.log(dist, thresholdDistance);
      //     while (dist < thresholdDistance) {
      //
      //     }
      //   } else {
      //     returnCorners.push(corner);
      //   }
      //
      //   prev = point;
      // });
      // new Path.Circle({
      //   center: lastSegmentPoint,
      //   radius: 10,
      //   fillColor: 'pink'
      // });
    })();
  }

  return corners;
}

function processShapeData(json) {
  var returnShape = [];
  var jsonObj = JSON.parse(json)[1]; // zero index is stringified type (e.g. "Path")

  if ('segments' in jsonObj) {
    var segments = jsonObj.segments;
    Base.each(segments, function (segment, i) {
      if (segment.length === 3) {
        var positionInfo = segment[0]; // indexes 1 and 2 are superfluous matrix details
        returnShape.push({
          x: positionInfo[0],
          y: positionInfo[1]
        });
      } else {
        returnShape.push({
          x: segment[0],
          y: segment[1]
        });
      };
    });
  }
  return returnShape;
}

},{"./../../config":1,"./util":9}],8:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.initShapeSounds = initShapeSounds;
exports.formatShapeSoundData = formatShapeSoundData;
exports.quantizeLength = quantizeLength;
exports.quantizePosition = quantizePosition;
exports.startComposition = startComposition;
exports.stopComposition = stopComposition;
var config = require('./../../config');

function initShapeSounds() {
  var returnSounds = {};
  var extensions = ['ogg', 'm4a', 'mp3', 'ac3'];

  Base.each(config.shapes, function (shape, shapeName) {
    // console.log(shape, shapeName);
    if (shape.sprite) {
      var shapeSoundJSONPath = './audio/shapes/' + shapeName + '/' + shapeName + '.json';
      $.getJSON(shapeSoundJSONPath, function (resp) {
        var shapeSoundData = formatShapeSoundData(shapeName, resp);
        var sound = new Howl(shapeSoundData);
        returnSounds[shapeName] = sound;
      });
    } else {
      // let sound = new Howl({
      //   src: extensions.map((extension) => `./audio/shapes/${shape.name}/${shape.name}.${extension}`),
      // });
      // console.log({
      //   src: extensions.map((extension) => `./audio/shapes/${shape.name}/${shape.name}.${extension}`),
      // }) Math.
      var sound = new Howl({
        src: './audio/shapes/' + shapeName + '/' + shapeName + '.mp3'
      });
      returnSounds[shapeName] = sound;
    }
  });

  return returnSounds;
}

function formatShapeSoundData(shapeName, data) {
  var returnData = {};

  returnData.src = data.urls.map(function (url) {
    return './audio/shapes/' + shapeName + '/' + url;
  });
  returnData.sprite = data.sprite;

  return returnData;
}

function quantizeLength(duration) {
  var smallestDuration = 60 / config.sound.bpm;
  var returnDuration = Math.floor(duration / smallestDuration) * smallestDuration;

  if (returnDuration > 0) {
    return returnDuration;
  } else {
    // always return something greater than zero
    return smallestDuration;
  }
}

function quantizePosition(position, viewWidth) {
  var smallestInterval = viewWidth / (4 * config.sound.measures);
  return returnPosition = Math.floor(position / smallestInterval) * smallestInterval;
}

function startComposition(composition) {
  var beatLength = 60 / config.sound.bpm * 1000;
  var measureLength = beatLength * 4;
  var compositionLength = measureLength * config.sound.measures - 250; // adjust for time to set up

  function playCompositionOnce() {
    console.log('repeat');
    Base.each(composition, function (shape, i) {
      console.log(shape);
      if (shape.sprite) {
        setTimeout(function () {
          console.log('playing shape ' + shape.groupId);
          shape.sound.loop(true);
          shape.sound.play(shape.spriteName);
        }, shape.startTime);

        setTimeout(function () {
          console.log('stopping shape ' + shape.groupId);
          shape.sound.stop();
        }, shape.startTime + shape.duration);
      } else {
        setTimeout(function () {
          console.log('playing shape ' + shape.groupId);
          shape.sound.loop(true);
          shape.sound.play();
        }, shape.startTime);

        setTimeout(function () {
          console.log('stopping shape ' + shape.groupId);
          shape.sound.stop();
        }, shape.startTime + shape.duration);
      }
    });
  }

  playCompositionOnce();
  return setInterval(playCompositionOnce, compositionLength);
}

function stopComposition(interval) {
  clearInterval(interval);
}

},{"./../../config":1}],9:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

exports.log = log;
exports.rad = rad;
exports.deg = deg;
exports.angleDelta = angleDelta;
exports.delta = delta;
exports.findInteriorCurves = findInteriorCurves;
exports.trueGroup = trueGroup;
exports.extendPath = extendPath;
exports.trimPath = trimPath;
exports.removePathExtensions = removePathExtensions;
exports.checkPops = checkPops;
exports.overlaps = overlaps;
exports.mergeOnePath = mergeOnePath;
exports.mergePaths = mergePaths;
exports.hitTestBounds = hitTestBounds;
var config = require('./../../config');

function log() {
  if (config.log) {
    var _console;

    (_console = console).log.apply(_console, arguments);
  }
}

// Converts from degrees to radians.
function rad(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
function deg(radians) {
  return radians * 180 / Math.PI;
};

// returns absolute value of the delta of two angles in radians
function angleDelta(x, y) {
  return Math.abs(Math.atan2(Math.sin(y - x), Math.cos(y - x)));;
}

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

function trueGroup(group, corners) {
  var middle = group._namedChildren.middle[0];
  console.log('num corners', corners.length);

  var intersections = middle.getIntersections();
  var trueNecessary = false;

  var middleCopy = middle.clone();
  middleCopy.visible = false;
  // debugger;

  if (intersections.length > 0) {
    // middleCopy.strokeColor = 'orange';
    var _trimPath = trimPath(middleCopy, middle);
    // see if we can trim the path while maintaining intersections
    // log('intersections!');
    // middleCopy.strokeColor = 'yellow';


    var _trimPath2 = _slicedToArray(_trimPath, 2);

    middleCopy = _trimPath2[0];
    trueNecessary = _trimPath2[1];
  } else {
    // extend first and last segment by threshold, see if intersection
    // log('no intersections, extending first!');
    // middleCopy.strokeColor = 'yellow';
    middleCopy = extendPath(middleCopy);
    // middleCopy.strokeColor = 'orange';
    var _intersections = middleCopy.getIntersections();
    if (_intersections.length > 0) {
      // middleCopy.strokeColor = 'green';
      var _trimPath3 = trimPath(middleCopy, middle);
      // middleCopy.strokeColor = 'pink';


      var _trimPath4 = _slicedToArray(_trimPath3, 2);

      middleCopy = _trimPath4[0];
      trueNecessary = _trimPath4[1];
    } else {
      // middleCopy.strokeColor = 'red';
      middleCopy = removePathExtensions(middleCopy);
      // middleCopy.strokeColor = 'blue';
    }
  }

  console.log('original length:', middle.length);
  console.log('trued length:', middleCopy.length);

  middleCopy.name = 'middle'; // make sure
  middleCopy.visible = true;

  // group.addChild(middleCopy);
  // group._namedChildren.middle[0] = middleCopy;
  group._namedChildren.middle[0].replaceWith(middleCopy);

  return [group, trueNecessary];
}

function extendPath(path) {
  if (path.length > 0) {
    var lengthTolerance = config.shape.trimmingThreshold * path.length;

    var firstSegment = path.firstSegment;
    var nextSegment = firstSegment.next;
    var startAngle = Math.atan2(nextSegment.point.y - firstSegment.point.y, nextSegment.point.x - firstSegment.point.x); // rad
    var inverseStartAngle = startAngle + Math.PI;
    var extendedStartPoint = new Point(firstSegment.point.x + Math.cos(inverseStartAngle) * lengthTolerance, firstSegment.point.y + Math.sin(inverseStartAngle) * lengthTolerance);
    path.insert(0, extendedStartPoint);

    var lastSegment = path.lastSegment;
    var penSegment = lastSegment.previous; // penultimate
    var endAngle = Math.atan2(lastSegment.point.y - penSegment.point.y, lastSegment.point.x - penSegment.point.x); // rad
    var extendedEndPoint = new Point(lastSegment.point.x + Math.cos(endAngle) * lengthTolerance, lastSegment.point.y + Math.sin(endAngle) * lengthTolerance);
    path.add(extendedEndPoint);
  }
  return path;
}

function trimPath(path, original) {
  // originalPath.strokeColor = 'pink';
  try {
    var _ret = function () {
      var intersections = path.getIntersections();
      var dividedPath = path.resolveCrossings();

      if (intersections.length > 1) {
        return {
          v: [original, false]
        }; // more than one intersection, don't worry about trimming
      }

      var extendingThreshold = config.shape.extendingThreshold;
      var totalLength = path.length;

      // we want to remove all closed loops from the path, since these are necessarily interior and not first or last
      Base.each(dividedPath.children, function (child, i) {
        if (child.closed) {
          // log('subtracting closed child');
          dividedPath = dividedPath.subtract(child);
        } else {
          // dividedPath = dividedPath.unite(child);
        }
      });

      // log(dividedPath);

      if (!!dividedPath.children && dividedPath.children.length > 1) {
        (function () {
          // divided path is a compound path
          var unitedDividedPath = new Path();
          // unitedDividedPath.copyAttributes(dividedPath);
          // log('before', unitedDividedPath);
          Base.each(dividedPath.children, function (child, i) {
            if (!child.closed) {
              unitedDividedPath = unitedDividedPath.unite(child);
            }
          });
          dividedPath = unitedDividedPath;
          // log('after', unitedDividedPath);
          // return;
        })();
      } else {
          // log('dividedPath has one child');
        }

      if (intersections.length > 0) {
        // we have to get the nearest location because the exact intersection point has already been removed as a part of resolveCrossings()
        var firstIntersection = dividedPath.getNearestLocation(intersections[0].point);
        // log(dividedPath);
        var rest = dividedPath.splitAt(firstIntersection); // dividedPath is now the first segment
        var firstSegment = dividedPath;
        var lastSegment = void 0;

        // firstSegment.strokeColor = 'pink';

        // let circleOne = new Path.Circle({
        //   center: firstIntersection.point,
        //   radius: 5,
        //   strokeColor: 'red'
        // });

        // log(intersections);
        if (intersections.length > 1) {
          // log('foo');
          // rest.reverse(); // start from end
          var lastIntersection = rest.getNearestLocation(intersections[intersections.length - 1].point);
          // let circleTwo = new Path.Circle({
          //   center: lastIntersection.point,
          //   radius: 5,
          //   strokeColor: 'green'
          // });
          lastSegment = rest.splitAt(lastIntersection); // rest is now everything BUT the first and last segments
          if (!lastSegment || !lastSegment.length) lastSegment = rest;
          rest.reverse();
        } else {
          lastSegment = rest;
        }

        if (!!firstSegment && firstSegment.length <= extendingThreshold * totalLength) {
          path = path.subtract(firstSegment);
          if (path.className === 'CompoundPath') {
            Base.each(path.children, function (child, i) {
              if (!child.closed) {
                child.remove();
              }
            });
          }
        }

        if (!!lastSegment && lastSegment.length <= extendingThreshold * totalLength) {
          path = path.subtract(lastSegment);
          if (path.className === 'CompoundPath') {
            Base.each(path.children, function (child, i) {
              if (!child.closed) {
                child.remove();
              }
            });
          }
        }
      }

      // this is hacky but I'm not sure how to get around it
      // sometimes path.subtract() returns a compound path, with children consisting of the closed path I want and another extraneous closed path
      // it appears that the correct path always has a higher version, though I'm not 100% sure that this is always the case

      if (path.className === 'CompoundPath' && path.children.length > 0) {
        if (path.children.length > 1) {
          (function () {
            var largestChild = void 0;
            var largestChildArea = 0;

            Base.each(path.children, function (child, i) {
              if (child.area > largestChildArea) {
                largestChildArea = child.area;
                largestChild = child;
              }
            });

            if (largestChild) {
              path = largestChild;
            } else {
              path = path.children[0];
            }
          })();
        } else {
          path = path.children[0];
        }
        // log(path);
        // log(path.lastChild);
        // path.firstChild.strokeColor = 'pink';
        // path.lastChild.strokeColor = 'green';
        // path = path.lastChild; // return last child?
        // find highest version
        //
        // log(realPathVersion);
        //
        // Base.each(path.children, (child, i) => {
        //   if (child.version == realPathVersion) {
        //     log('returning child');
        //     return child;
        //   }
        // })
      }
      log('original length:', totalLength);
      log('edited length:', path.length);
      if (Math.abs(path.length - totalLength) / totalLength <= 0.01) {
        log('returning original');
        return {
          v: [original, false]
        };
      } else {
        return {
          v: [path, true]
        };
      }
    }();

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  } catch (e) {
    console.error(e);
    return [original, false];
  }
}

function removePathExtensions(path) {
  path.removeSegment(0);
  path.removeSegment(path.segments.length - 1);
  return path;
}

// export function truePath(path) {
//   // log(group);
//   // if (path && path.children && path.children.length > 0 && path._namedChildren['middle']) {
//   //   let pathCopy = new Path();
//   //   log(path._namedChildren['middle']);
//   //   pathCopy.copyContent(path._namedChildren['middle']);
//   //   log(pathCopy);
//   // }
// }

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

},{"./../../config":1}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJjb25maWcuanMiLCJub2RlX21vZHVsZXMvaGFtbWVyanMvaGFtbWVyLmpzIiwibm9kZV9tb2R1bGVzL2hvd2xlci9kaXN0L2hvd2xlci5qcyIsInNyYy9qcy9jb2xvci5qcyIsInNyYy9qcy9saWIvc2hhcGUtZGV0ZWN0b3IuanMiLCJzcmMvanMvbWFpbi5qcyIsInNyYy9qcy9zaGFwZS5qcyIsInNyYy9qcy9zb3VuZC5qcyIsInNyYy9qcy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBOzs7QUNBQSxRQUFRLE9BQVIsR0FBa0I7QUFDaEIsVUFBUSxDQUFDLFNBQUQsRUFBWSxTQUFaLEVBQXVCLFNBQXZCLEVBQWtDLFNBQWxDLEVBQTZDLFNBQTdDLEVBQXdELFNBQXhELEVBQW1FLFNBQW5FLEVBQThFLFNBQTlFLEVBQXlGLFNBQXpGLEVBQW9HLFNBQXBHLEVBQStHLFNBQS9HLEVBQXlILFNBQXpILENBRFE7QUFFaEIsY0FBWTtBQUNWLGVBQVcsT0FERDtBQUVWLGVBQVcsTUFGRDtBQUdWLGVBQVcsTUFIRDtBQUlWLGVBQVcsTUFKRDtBQUtWLGVBQVcsS0FMRDtBQU1WLGVBQVcsS0FORDtBQU9WLGVBQVcsUUFQRDtBQVFWLGVBQVcsT0FSRDtBQVNWLGVBQVcsT0FURDtBQVVWLGVBQVcsUUFWRDtBQVdWLGVBQVcsT0FYRDtBQVlWLGVBQVc7QUFaRCxHQUZJO0FBZ0JoQixRQUFNLENBQUMsU0FBRCxFQUFZLFNBQVosRUFBdUIsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkMsU0FBN0MsQ0FoQlU7QUFpQmhCLGFBQVcsRUFqQks7QUFrQmhCLHFCQUFtQjtBQWxCSCxDQUFsQjs7QUFxQkEsUUFBUSxLQUFSLEdBQWdCO0FBQ2Qsc0JBQW9CLEdBRE47QUFFZCxxQkFBbUIsS0FGTDtBQUdkLHNCQUFvQjtBQUhOLENBQWhCOztBQU1BLFFBQVEsTUFBUixHQUFpQjtBQUNmLFVBQVE7QUFDTixZQUFRO0FBREYsR0FETztBQUlmLFlBQVU7QUFDUixZQUFRO0FBREEsR0FKSztBQU9mLFlBQVU7QUFDUixZQUFRO0FBREEsR0FQSztBQVVmLGNBQVk7QUFDVixZQUFRO0FBREUsR0FWRztBQWFmLFdBQVM7QUFDUCxZQUFRO0FBREQ7QUFiTSxDQUFqQjs7QUFrQkEsUUFBUSxHQUFSLEdBQWMsSUFBZDs7QUFFQSxRQUFRLGFBQVIsR0FBd0IsSUFBeEI7O0FBRUEsUUFBUSxLQUFSLEdBQWdCO0FBQ2QsT0FBSyxHQURTO0FBRWQsWUFBVTtBQUZJLENBQWhCOzs7QUNqREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7OztBQ25sRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNB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QWlCLEVBQUMsR0FBRyxFQUFKLEVBQVEsR0FBRyxHQUFYLEVBQWpCLEVBQWlDLEVBQUMsR0FBRyxFQUFKLEVBQVEsR0FBRyxHQUFYLEVBQWpDLEVBQWlELEVBQUMsR0FBRyxFQUFKLEVBQVEsR0FBRyxHQUFYLEVBQWpELEVBQWlFLEVBQUMsR0FBRyxFQUFKLEVBQVEsR0FBRyxHQUFYLEVBQWpFLEVBQWlGLEVBQUMsR0FBRyxFQUFKLEVBQVEsR0FBRyxHQUFYLEVBQWpGLEVBQWlHLEVBQUMsR0FBRyxFQUFKLEVBQVEsR0FBRyxHQUFYLEVBQWpHLEVBQWlILEVBQUMsR0FBRyxFQUFKLEVBQVEsR0FBRyxHQUFYLEVBQWpILEVBQWlJLEVBQUMsR0FBRyxFQUFKLEVBQVEsR0FBRyxHQUFYLEVBQWpJLEVBQWlKLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQWpKLEVBQWtLLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQWxLLEVBQW1MLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQW5MLEVBQW9NLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQXBNLEVBQXFOLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQXJOLEVBQXNPLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQXRPLEVBQXVQLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQXZQLEVBQXdRLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQXhRLEVBQXlSLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQXpSLEVBQTBTLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQTFTLEVBQTJULEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQTNULEVBQTRVLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQTVVLEVBQTZWLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQTdWLEVBQThXLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQTlXLEVBQStYLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQS9YLEVBQWdaLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQWhaLEVBQWlhLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQWphLEVBQWtiLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQWxiLEVBQW1jLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQW5jLEVBQW9kLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQXBkLEVBQXFlLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQXJlLEVBQXNmLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQXRmLEVBQXVnQixFQUFDLEdBQUcsR0FBSixFQUFTLEdBQUcsR0FBWixFQUF2Z0IsRUFBd2hCLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQXhoQixFQUF5aUIsRUFBQyxHQUFHLEdBQUosRUFBUyxHQUFHLEdBQVosRUFBemlCLEVBQTBqQixFQUFDLEdBQUcsR0FBSixFQUFTLEdBQUcsR0FBWixFQUExakIsRUFBMmtCLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQTNrQixFQUE0bEIsRUFBQyxHQUFHLEdBQUosRUFBUyxHQUFHLEdBQVosRUFBNWxCLEVBQTZtQixFQUFDLEdBQUcsR0FBSixFQUFTLEdBQUcsR0FBWixFQUE3bUIsRUFBOG5CLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQTluQixFQUErb0IsRUFBQyxHQUFHLEdBQUosRUFBUyxHQUFHLEdBQVosRUFBL29CLEVBQWdxQixFQUFDLEdBQUcsR0FBSixFQUFTLEdBQUcsR0FBWixFQUFocUIsRUFBaXJCLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQWpyQixFQUFrc0IsRUFBQyxHQUFHLEdBQUosRUFBUyxHQUFHLEdBQVosRUFBbHNCLEVBQW10QixFQUFDLEdBQUcsR0FBSixFQUFTLEdBQUcsR0FBWixFQUFudEIsRUFBb3VCLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQXB1QixFQUFxdkIsRUFBQyxHQUFHLEdBQUosRUFBUyxHQUFHLEdBQVosRUFBcnZCLEVBQXN3QixFQUFDLEdBQUcsR0FBSixFQUFTLEdBQUcsR0FBWixFQUF0d0IsRUFBdXhCLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQXZ4QixFQUF3eUIsRUFBQyxHQUFHLEdBQUosRUFBUyxHQUFHLEdBQVosRUFBeHlCLEVBQXl6QixFQUFDLEdBQUcsR0FBSixFQUFTLEdBQUcsR0FBWixFQUF6ekIsRUFBMDBCLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQTEwQixFQUEyMUIsRUFBQyxHQUFHLEdBQUosRUFBUyxHQUFHLEdBQVosRUFBMzFCLEVBQTQyQixFQUFDLEdBQUcsR0FBSixFQUFTLEdBQUcsR0FBWixFQUE1MkIsRUFBNjNCLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQTczQixFQUE4NEIsRUFBQyxHQUFHLEdBQUosRUFBUyxHQUFHLEdBQVosRUFBOTRCLEVBQSs1QixFQUFDLEdBQUcsR0FBSixFQUFTLEdBQUcsR0FBWixFQUEvNUIsRUFBZzdCLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQWg3QixFQUFpOEIsRUFBQyxHQUFHLEdBQUosRUFBUyxHQUFHLEdBQVosRUFBajhCLEVBQWs5QixFQUFDLEdBQUcsR0FBSixFQUFTLEdBQUcsR0FBWixFQUFsOUIsRUFBbStCLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQW4rQixFQUFvL0IsRUFBQyxHQUFHLEdBQUosRUFBUyxHQUFHLEdBQVosRUFBcC9CLEVBQXFnQyxFQUFDLEdBQUcsR0FBSixFQUFTLEdBQUcsR0FBWixFQUFyZ0MsRUFBc2hDLEVBQUMsR0FBRyxHQUFKLEVBQVMsR0FBRyxHQUFaLEVBQXRoQyxFQUF1aUMsRUFBQyxHQUFHLEdBQUosRUFBUyxHQUFHLEdBQVosRUFBdmlDLEVBQXdqQyxFQUFDLEdBQUcsR0FBSixFQUFTLEdBQUcsR0FBWixFQUF4akMsQ0FEVDtBQUVDLFFBQU07QUFGUCxFQTdKNkIsQ0FBOUI7O0FBd0tBLGVBQWMsU0FBZCxDQUF3QixJQUF4QixHQUErQixVQUFVLE1BQVYsRUFBa0IsV0FBbEIsRUFBK0I7O0FBRTdELE1BQUksZUFBZSxJQUFuQixFQUF5QjtBQUN4QixpQkFBYyxFQUFkO0FBQ0E7O0FBRUQsTUFBSSxRQUFKLEVBQWMsT0FBZCxFQUF1QixLQUF2QjtBQUNBLE1BQUksU0FBUyxJQUFJLE1BQUosQ0FBVyxNQUFYLENBQWI7QUFDQSxNQUFJLGVBQWUsQ0FBQyxRQUFwQjtBQUNBLE1BQUksY0FBYyxJQUFsQjtBQUNBLE1BQUksWUFBWSxDQUFoQjs7QUFFQSxPQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksS0FBSyxRQUFMLENBQWMsTUFBbEMsRUFBMEMsR0FBMUMsRUFBK0M7QUFDOUMsYUFBVSxLQUFLLFFBQUwsQ0FBYyxDQUFkLENBQVY7O0FBRUEsT0FBSSxRQUFRLElBQVIsQ0FBYSxPQUFiLENBQXFCLFdBQXJCLElBQW9DLENBQUMsQ0FBekMsRUFBNEM7QUFDM0MsZUFBVyxPQUFPLG1CQUFQLENBQTJCLE9BQTNCLENBQVg7QUFDQSxZQUFRLE1BQU0sV0FBVyxhQUF6Qjs7QUFFQSxRQUFJLFdBQVcsWUFBWCxJQUEyQixRQUFRLEtBQUssU0FBNUMsRUFBdUQ7QUFDdEQsb0JBQWUsUUFBZjtBQUNBLG1CQUFjLFFBQVEsSUFBdEI7QUFDQSxpQkFBWSxLQUFaO0FBQ0E7QUFDRDtBQUNEOztBQUVELFNBQU8sRUFBRSxTQUFTLFdBQVgsRUFBd0IsT0FBTyxTQUEvQixFQUFQO0FBQ0EsRUE1QkQ7O0FBOEJBLGVBQWMsU0FBZCxDQUF3QixLQUF4QixHQUFnQyxVQUFVLElBQVYsRUFBZ0IsTUFBaEIsRUFBd0I7O0FBRXZELFNBQU8sS0FBSyxRQUFMLENBQWMsSUFBZCxDQUFtQixJQUFJLE1BQUosQ0FBVyxNQUFYLEVBQW1CLElBQW5CLENBQW5CLENBQVA7QUFDQSxFQUhEOztBQUtBLFFBQU8sYUFBUDtBQUNBLENBcmNBLENBQUQ7Ozs7Ozs7QUNBQSxJQUFNLFNBQVMsUUFBUSxnQkFBUixDQUFmOztBQUVBLFFBQVEsVUFBUjtBQUNBLFFBQVEsUUFBUjs7QUFFQSxJQUFNLGdCQUFnQixRQUFRLHNCQUFSLENBQXRCOztBQUVBLElBQU0sT0FBTyxRQUFRLFFBQVIsQ0FBYjtBQUNBLElBQU0sUUFBUSxRQUFRLFNBQVIsQ0FBZDtBQUNBLElBQU0sUUFBUSxRQUFRLFNBQVIsQ0FBZDtBQUNBLElBQU0sUUFBUSxRQUFRLFNBQVIsQ0FBZDs7QUFFQSxPQUFPLEdBQVAsR0FBYSxPQUFPLEdBQVAsSUFBYztBQUN6QixXQUFTLENBQUMsU0FBRCxFQUFZLFNBQVosRUFBdUIsU0FBdkIsRUFBa0MsU0FBbEMsRUFBNkMsU0FBN0MsRUFBd0QsU0FBeEQsRUFBbUUsU0FBbkUsRUFBOEUsU0FBOUUsRUFBeUYsU0FBekYsRUFBb0csU0FBcEcsRUFBK0csU0FBL0csRUFBeUgsU0FBekgsQ0FEZ0I7QUFFekIsZ0JBQWMsRUFGVztBQUd6QixnQkFBYyxTQUhXO0FBSXpCLFlBQVUsRUFKZTtBQUt6QixTQUFPO0FBTGtCLENBQTNCOztBQVFBLE1BQU0sT0FBTixDQUFjLE1BQWQ7O0FBRUEsU0FBUyxHQUFULENBQWEsS0FBYixFQUFvQjtBQUNsQixPQUFLLEdBQUwsQ0FBUyxLQUFUO0FBQ0Q7O0FBRUQsRUFBRSxRQUFGLEVBQVksS0FBWixDQUFrQixZQUFXO0FBQzNCLE1BQUksUUFBUSxFQUFaLENBRDJCLENBQ1g7QUFDaEI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQU0sVUFBVSxFQUFFLE1BQUYsQ0FBaEI7QUFDQSxNQUFNLFFBQVEsRUFBRSxNQUFGLENBQWQ7QUFDQSxNQUFNLFVBQVUsRUFBRSxtQkFBRixDQUFoQjtBQUNBLE1BQU0sZ0JBQWdCLE9BQU8sYUFBN0I7QUFDQSxNQUFNLGNBQWMsSUFBSSxLQUFKLENBQVUsQ0FBVixFQUFhLENBQWIsQ0FBcEI7QUFDQSxNQUFNLGlCQUFpQixLQUFLLEdBQUwsQ0FBUyxPQUFPLEtBQVAsQ0FBYSxrQkFBdEIsQ0FBdkI7QUFDQSxNQUFNLFdBQVcsSUFBSSxhQUFKLENBQWtCLGNBQWMsYUFBaEMsQ0FBakI7QUFDQSxNQUFJLGNBQWMsRUFBbEI7QUFDQSxNQUFJLDRCQUFKOztBQUVBLE1BQUksa0JBQUo7QUFBQSxNQUFlLG1CQUFmOztBQUVBLE1BQUksVUFBVSxLQUFkOztBQUVBLFdBQVMsZ0JBQVQsQ0FBMEIsUUFBMUIsRUFBb0M7QUFDbEMsV0FBTyxNQUFNLGdCQUFOLENBQXVCLFFBQXZCLEVBQWlDLFNBQWpDLENBQVA7QUFDRDs7QUFHRCxXQUFTLGFBQVQsQ0FBdUIsS0FBdkIsRUFBOEI7QUFDNUIsV0FBTyxLQUFLLGFBQUwsQ0FBbUIsS0FBbkIsRUFBMEIsTUFBTSxPQUFOLENBQWMsV0FBZCxDQUEwQixRQUFwRCxDQUFQO0FBQ0Q7O0FBRUQsV0FBUyxrQkFBVCxDQUE0QixLQUE1QixFQUFtQztBQUNqQyxRQUFJLFNBQVMsTUFBTSxPQUFOLENBQWMsUUFBZCxDQUF1QjtBQUNsQyxpQkFBVztBQUR1QixLQUF2QixDQUFiO0FBR0EsV0FBTyxLQUFLLGFBQUwsQ0FBbUIsS0FBbkIsRUFBMEIsTUFBMUIsQ0FBUDtBQUNEOztBQUVELFdBQVMsWUFBVCxHQUF3QjtBQUN0QixnQkFBWSxNQUFNLElBQU4sQ0FBVyxRQUFYLENBQW9CLEtBQWhDO0FBQ0EsaUJBQWEsTUFBTSxJQUFOLENBQVcsUUFBWCxDQUFvQixNQUFqQztBQUNEOztBQUVELFdBQVMsZ0JBQVQsR0FBNEI7QUFDMUI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRDs7QUFFRCxXQUFTLGdCQUFULEdBQTRCO0FBQzFCLFFBQU0sZUFBZSxFQUFFLG1CQUFGLENBQXJCO0FBQ0EsUUFBTSxpQkFBaUIsYUFBYSxJQUFiLENBQWtCLElBQWxCLENBQXZCO0FBQ0EsUUFBTSxtQkFBbUIsRUFBekI7QUFDQSxRQUFNLDJCQUEyQixFQUFqQztBQUNBLFFBQU0sdUJBQXVCLGtCQUE3Qjs7QUFFQTtBQUNBLG1CQUFlLEVBQWYsQ0FBa0IsaUJBQWxCLEVBQXFDLFlBQVc7QUFDOUMsVUFBSSxDQUFDLE1BQU0sUUFBTixDQUFlLFlBQWYsQ0FBTCxFQUFtQztBQUNqQyxZQUFJLE9BQU8sRUFBRSxJQUFGLEVBQVEsSUFBUixDQUFhLG1CQUFiLENBQVg7O0FBRUEsWUFBSSxDQUFDLEtBQUssUUFBTCxDQUFjLG9CQUFkLENBQUwsRUFBMEM7QUFDeEMsWUFBRSxNQUFNLG9CQUFSLEVBQ0csV0FESCxDQUNlLG9CQURmLEVBRUcsSUFGSCxDQUVRLE9BRlIsRUFFaUIsZ0JBRmpCLEVBR0csSUFISCxDQUdRLFFBSFIsRUFHa0IsZ0JBSGxCLEVBSUcsSUFKSCxDQUlRLE1BSlIsRUFLRyxJQUxILENBS1EsSUFMUixFQUtjLENBTGQsRUFNRyxJQU5ILENBTVEsSUFOUixFQU1jLENBTmQ7O0FBUUEsZUFBSyxRQUFMLENBQWMsb0JBQWQsRUFDRyxJQURILENBQ1EsT0FEUixFQUNpQix3QkFEakIsRUFFRyxJQUZILENBRVEsUUFGUixFQUVrQix3QkFGbEIsRUFHRyxJQUhILENBR1EsTUFIUixFQUlHLElBSkgsQ0FJUSxJQUpSLEVBSWMsMkJBQTJCLENBSnpDLEVBS0csSUFMSCxDQUtRLElBTFIsRUFLYywyQkFBMkIsQ0FMekM7O0FBT0EsaUJBQU8sR0FBUCxDQUFXLFlBQVgsR0FBMEIsS0FBSyxJQUFMLENBQVUsTUFBVixFQUFrQixJQUFsQixDQUF1QixNQUF2QixDQUExQjtBQUNEO0FBQ0Y7QUFDRixLQXZCRDtBQXdCRDs7QUFFRCxXQUFTLGNBQVQsR0FBMEI7O0FBRXhCLFVBQU0sS0FBTixDQUFZLFFBQVEsQ0FBUixDQUFaOztBQUVBLFFBQUksZUFBSjtBQUFBLFFBQVksZUFBWjtBQUNBLFFBQUksY0FBSjtBQUNBO0FBQ0EsUUFBSSxRQUFRLEtBQVo7QUFDQSxRQUFJLGtCQUFKO0FBQ0EsUUFBSSxXQUFXLEVBQWY7QUFDQSxRQUFJLGtCQUFKO0FBQUEsUUFBZSxrQkFBZjs7QUFFQSxRQUFJLGNBQUo7QUFDQSxRQUFJLGFBQUo7O0FBRUEsUUFBSSxnQkFBSjs7QUFFQSxRQUFNLFNBQVMsTUFBTSxlQUFOLEVBQWY7QUFDQSxRQUFNLGFBQWMsS0FBSyxPQUFPLEtBQVAsQ0FBYSxHQUF0QztBQUNBLFFBQU0sZ0JBQWdCLGFBQWEsQ0FBbkM7QUFDQSxRQUFNLG9CQUFvQixnQkFBZ0IsT0FBTyxLQUFQLENBQWEsUUFBdkQ7O0FBRUEsYUFBUyxRQUFULENBQWtCLEtBQWxCLEVBQXlCO0FBQ3ZCO0FBQ0E7O0FBRUEsY0FBUSxFQUFSO0FBQ0Esa0JBQVksS0FBSyxLQUFMLENBQVcsTUFBTSxTQUFqQixFQUE0QixNQUFNLFNBQWxDLENBQVo7O0FBRUE7QUFDQSxVQUFJLFFBQUosRUFBYztBQUNkLFVBQUksRUFBRSxNQUFNLGVBQU4sSUFBeUIsTUFBTSxlQUFOLENBQXNCLE1BQXRCLEdBQStCLENBQTFELENBQUosRUFBa0U7QUFDbEUsVUFBSSxNQUFNLGVBQU4sQ0FBc0IsTUFBdEIsR0FBK0IsQ0FBbkMsRUFBc0M7QUFDcEMsWUFBSSwyQkFBSjtBQUNEOztBQUVELFVBQU0sVUFBVSxNQUFNLE1BQXRCO0FBQ0EsVUFBTSxRQUFRLElBQUksS0FBSixDQUFVLFFBQVEsQ0FBbEIsRUFBcUIsUUFBUSxDQUE3QixDQUFkOztBQUVBLGVBQVMsSUFBSSxJQUFKLENBQVM7QUFDaEIscUJBQWEsT0FBTyxHQUFQLENBQVcsWUFEUjtBQUVoQixtQkFBVyxPQUFPLEdBQVAsQ0FBVyxZQUZOO0FBR2hCLGNBQU0sUUFIVTtBQUloQixpQkFBUztBQUpPLE9BQVQsQ0FBVDs7QUFPQSxlQUFTLElBQUksSUFBSixDQUFTO0FBQ2hCLHFCQUFhLE9BQU8sR0FBUCxDQUFXLFlBRFI7QUFFaEIsY0FBTSxRQUZVO0FBR2hCLHFCQUFhLENBSEc7QUFJaEIsaUJBQVMsSUFKTztBQUtoQixtQkFBVztBQUxLLE9BQVQsQ0FBVDs7QUFRQSxhQUFPLEdBQVAsQ0FBVyxLQUFYO0FBQ0EsYUFBTyxHQUFQLENBQVcsS0FBWDs7QUFFQSxrQkFBWSxLQUFaO0FBQ0EsZ0JBQVUsQ0FBQyxLQUFELENBQVY7O0FBRUEsY0FBUSxFQUFSO0FBQ0EsYUFBTyxDQUFDLEtBQUQsQ0FBUDs7QUFFQSxlQUFTLE1BQU0sY0FBTixDQUFxQixLQUFyQixDQUFULElBQXdDO0FBQ3RDLGVBQU8sS0FEK0I7QUFFdEMsZUFBTztBQUYrQixPQUF4QztBQUlEOztBQUVELFFBQU0sTUFBTSxDQUFaO0FBQ0EsUUFBTSxNQUFNLEVBQVo7QUFDQSxRQUFNLFFBQVEsR0FBZDtBQUNBLFFBQU0sU0FBUyxFQUFmO0FBQ0EsUUFBSSxjQUFjLENBQWxCO0FBQ0EsUUFBSSxnQkFBSjtBQUFBLFFBQWEsZ0JBQWI7QUFDQSxhQUFTLE9BQVQsQ0FBaUIsS0FBakIsRUFBd0I7QUFDdEIsWUFBTSxjQUFOO0FBQ0EsVUFBSSxRQUFKLEVBQWM7QUFDZDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLFVBQU0sVUFBVSxNQUFNLE1BQXRCO0FBQ0EsVUFBSSxRQUFRLElBQUksS0FBSixDQUFVLFFBQVEsQ0FBbEIsRUFBcUIsUUFBUSxDQUE3QixDQUFaOztBQUVBO0FBQ0E7QUFDQTtBQUNBLFVBQUksUUFBUSxLQUFLLEtBQUwsQ0FBVyxNQUFNLFNBQWpCLEVBQTRCLE1BQU0sU0FBbEMsQ0FBWjtBQUNBLFVBQUksYUFBYSxLQUFLLFVBQUwsQ0FBZ0IsS0FBaEIsRUFBdUIsU0FBdkIsQ0FBakI7QUFDQSxrQkFBWSxLQUFaOztBQUVBLFVBQUksYUFBYSxjQUFqQixFQUFpQztBQUMvQixZQUFJLEtBQUssTUFBTCxHQUFjLENBQWxCLEVBQXFCO0FBQ25CO0FBQ0EsY0FBSSxjQUFjLEtBQWxCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLGtCQUFRLElBQVIsQ0FBYSxXQUFiO0FBQ0EsZ0JBQU0sSUFBTixDQUFXLElBQVg7QUFDQSxpQkFBTyxFQUFQO0FBQ0Q7QUFDRjtBQUNELFdBQUssSUFBTCxDQUFVLEtBQVY7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsZUFBUyxNQUFNLGNBQU4sQ0FBcUIsS0FBckIsQ0FBVCxJQUF3QztBQUN0QyxlQUFPLEtBRCtCO0FBRXRDLGVBQU8sS0FBSyxHQUFMLENBQVMsTUFBTSxlQUFmLENBRitCO0FBR3RDLGVBQU87QUFIK0IsT0FBeEM7QUFLQSxhQUFPLEdBQVAsQ0FBVyxLQUFYOztBQUVBLFlBQU0sSUFBTixDQUFXLElBQVg7O0FBRUEsa0JBQVksS0FBWjtBQUNBO0FBQ0Q7O0FBRUQsYUFBUyxNQUFULENBQWdCLEtBQWhCLEVBQXVCO0FBQ3JCLFVBQUksUUFBSixFQUFjOztBQUVkLFVBQU0sVUFBVSxNQUFNLE1BQXRCO0FBQ0EsVUFBTSxRQUFRLElBQUksS0FBSixDQUFVLFFBQVEsQ0FBbEIsRUFBcUIsUUFBUSxDQUE3QixDQUFkOztBQUVBLFVBQUksUUFBUSxJQUFJLEtBQUosQ0FBVSxDQUFDLE1BQUQsRUFBUyxNQUFULENBQVYsQ0FBWjtBQUNBLFlBQU0sSUFBTixDQUFXLEtBQVgsR0FBbUIsT0FBTyxTQUExQjtBQUNBLFlBQU0sSUFBTixDQUFXLE1BQVgsR0FBb0IsSUFBcEI7O0FBRUEsYUFBTyxHQUFQLENBQVcsS0FBWDtBQUNBLGFBQU8sTUFBUCxHQUFnQixJQUFoQjtBQUNBOztBQUVBLGFBQU8sR0FBUCxDQUFXLEtBQVg7QUFDQTs7QUFFQSxXQUFLLElBQUwsQ0FBVSxLQUFWO0FBQ0EsWUFBTSxJQUFOLENBQVcsSUFBWDs7QUFFQSxlQUFTLE1BQU0sY0FBTixDQUFxQixLQUFyQixDQUFULElBQXdDO0FBQ3RDLGVBQU8sS0FEK0I7QUFFdEMsY0FBTTtBQUZnQyxPQUF4Qzs7QUFLQSxjQUFRLElBQVIsQ0FBYSxLQUFiOztBQUVBLGFBQU8sUUFBUDs7QUFFQSxVQUFJLFlBQVksT0FBTyxVQUFQLEVBQWhCO0FBQ0EsVUFBSSxZQUFZLE1BQU0sZ0JBQU4sQ0FBdUIsU0FBdkIsQ0FBaEI7QUFDQSxjQUFRLEdBQVIsQ0FBWSxTQUFaO0FBQ0EsVUFBSSxrQkFBa0IsU0FBUyxJQUFULENBQWMsU0FBZCxDQUF0QjtBQUNBLFVBQUkscUJBQUo7QUFDQSxVQUFJLGdCQUFnQixLQUFoQixHQUF3QixHQUE1QixFQUFpQztBQUMvQix1QkFBZSxnQkFBZ0IsT0FBL0I7QUFDRCxPQUZELE1BRU87QUFDTCx1QkFBZSxPQUFmO0FBQ0Q7O0FBRUQsY0FBUSxHQUFSLENBQVksY0FBWixFQUE0QixZQUE1QixFQUEwQyxnQkFBZ0IsS0FBMUQsRUFBaUU7QUFDakU7O0FBekNxQiw0QkEwQ2dCLEtBQUssU0FBTCxDQUFlLEtBQWYsRUFBc0IsT0FBdEIsQ0ExQ2hCO0FBQUE7QUFBQSxVQTBDaEIsVUExQ2dCO0FBQUEsVUEwQ0osZ0JBMUNJOztBQTJDckIsWUFBTSxXQUFOLENBQWtCLFVBQWxCO0FBQ0EsZUFBUyxNQUFNLGNBQU4sQ0FBcUIsTUFBckIsQ0FBNEIsQ0FBNUIsQ0FBVDtBQUNBLGFBQU8sV0FBUCxHQUFxQixNQUFNLFdBQTNCO0FBQ0E7O0FBRUE7QUFDQTs7QUFFQTtBQUNBOztBQUVBO0FBQ0EsVUFBSSxnQkFBSixFQUFzQjtBQUNwQixZQUFJLGtCQUFrQixNQUFNLGtCQUFOLENBQXlCLE1BQXpCLENBQXRCO0FBQ0EsWUFBSSxzQkFBc0IsSUFBSSxJQUFKLENBQVMsZUFBVCxDQUExQjtBQUNBLDRCQUFvQixPQUFwQixHQUE4QixLQUE5QjtBQUNBLFlBQUksNEJBQTRCLG9CQUFvQixNQUFwRDtBQUNBLFlBQUksS0FBSyxHQUFMLENBQVMsNEJBQTRCLE9BQU8sTUFBNUMsSUFBc0QsT0FBTyxNQUE3RCxJQUF1RSxHQUEzRSxFQUFnRjtBQUM5RSxpQkFBTyxjQUFQO0FBQ0E7QUFDQSxpQkFBTyxRQUFQLEdBQWtCLGVBQWxCO0FBQ0E7QUFDRDtBQUNGOztBQUVEO0FBQ0E7QUFDQTs7QUFFQSxVQUFJLFVBQVUsTUFBTSxVQUFOLENBQWlCLE1BQWpCLEVBQXlCLFFBQXpCLENBQWQ7QUFDQSxhQUFPLFdBQVAsQ0FBbUIsT0FBbkI7O0FBRUE7O0FBRUU7QUFDQTtBQUNBO0FBQ0E7OztBQUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDRjs7QUFFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxrQkFBWSxPQUFPLFVBQVAsRUFBWjtBQUNBLGtCQUFZLE1BQU0sZ0JBQU4sQ0FBdUIsU0FBdkIsQ0FBWjtBQUNBLHdCQUFrQixTQUFTLElBQVQsQ0FBYyxTQUFkLENBQWxCO0FBQ0EsVUFBSSxnQkFBZ0IsS0FBaEIsR0FBd0IsR0FBNUIsRUFBaUM7QUFDL0IsdUJBQWUsZ0JBQWdCLE9BQS9CO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsdUJBQWUsT0FBZjtBQUNEO0FBQ0QsVUFBTSxZQUFZLE1BQU0sWUFBTixDQUFtQixPQUFPLEdBQVAsQ0FBVyxZQUE5QixDQUFsQjs7QUFFQTtBQUNBLFVBQU0sMEJBQTBCLE1BQU0sY0FBTixDQUFxQixNQUFNLE1BQU4sQ0FBYSxDQUFiLEdBQWlCLFNBQWpCLEdBQTZCLGlCQUFsRCxJQUF1RSxJQUF2RyxDQXBLcUIsQ0FvS3dGO0FBQzdHLFVBQU0seUJBQXlCLE1BQU0sY0FBTixDQUFxQixNQUFNLE1BQU4sQ0FBYSxLQUFiLEdBQXFCLFNBQXJCLEdBQWlDLGlCQUF0RCxJQUEyRSxJQUExRyxDQXJLcUIsQ0FxSzJGOztBQUVoSDtBQUNBO0FBQ0EsVUFBTSxhQUFhLEtBQW5CO0FBQ0EsVUFBSSxpQkFBaUIsRUFBckI7QUFDQSxxQkFBZSxLQUFmLEdBQXVCLE9BQU8sWUFBUCxDQUF2QjtBQUNBLHFCQUFlLFNBQWYsR0FBMkIsdUJBQTNCO0FBQ0EscUJBQWUsUUFBZixHQUEwQixzQkFBMUI7QUFDQSxxQkFBZSxPQUFmLEdBQXlCLE1BQU0sRUFBL0I7QUFDQSxVQUFJLE9BQU8sTUFBUCxDQUFjLFlBQWQsRUFBNEIsTUFBaEMsRUFBd0M7QUFDdEMsdUJBQWUsTUFBZixHQUF3QixJQUF4QjtBQUNBLHVCQUFlLFVBQWYsR0FBNEIsU0FBNUI7O0FBRUEsWUFBSSxVQUFKLEVBQWdCO0FBQ2QsaUJBQU8sWUFBUCxFQUFxQixJQUFyQixDQUEwQixTQUExQjtBQUNEO0FBQ0YsT0FQRCxNQU9PO0FBQ0wsdUJBQWUsTUFBZixHQUF3QixLQUF4Qjs7QUFFQSxZQUFJLFVBQUosRUFBZ0I7QUFDZCxpQkFBTyxZQUFQLEVBQXFCLElBQXJCO0FBQ0Q7QUFDRjs7QUFFRCxrQkFBWSxJQUFaLENBQWlCLGNBQWpCOztBQUVBO0FBQ0EsY0FBUSxHQUFSLENBQWUsWUFBZixTQUErQixTQUEvQjs7QUFFQSxVQUFJLGdCQUFnQixPQUFPLFlBQVAsRUFBcEI7QUFDQSxVQUFJLGNBQWMsTUFBZCxHQUF1QixDQUEzQixFQUE4QjtBQUM1QjtBQUNBLFlBQUksV0FBVyxJQUFJLElBQUosRUFBZjtBQUNBLGlCQUFTLFdBQVQsQ0FBcUIsTUFBckI7QUFDQSxpQkFBUyxPQUFULEdBQW1CLEtBQW5COztBQUVBLFlBQUksY0FBYyxTQUFTLGdCQUFULEVBQWxCO0FBQ0Esb0JBQVksT0FBWixHQUFzQixLQUF0Qjs7QUFHQSxZQUFJLGdCQUFnQixLQUFLLGtCQUFMLENBQXdCLFdBQXhCLENBQXBCOztBQUVBLFlBQUksYUFBSixFQUFtQjtBQUNqQixlQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksY0FBYyxNQUFsQyxFQUEwQyxHQUExQyxFQUErQztBQUM3QywwQkFBYyxDQUFkLEVBQWlCLE9BQWpCLEdBQTJCLElBQTNCO0FBQ0EsMEJBQWMsQ0FBZCxFQUFpQixNQUFqQixHQUEwQixJQUExQjtBQUNBLDBCQUFjLENBQWQsRUFBaUIsU0FBakIsR0FBNkIsTUFBTSxXQUFuQztBQUNBLDBCQUFjLENBQWQsRUFBaUIsSUFBakIsQ0FBc0IsUUFBdEIsR0FBaUMsSUFBakM7QUFDQSwwQkFBYyxDQUFkLEVBQWlCLElBQWpCLENBQXNCLFdBQXRCLEdBQW9DLEtBQXBDO0FBQ0E7QUFDQSxrQkFBTSxRQUFOLENBQWUsY0FBYyxDQUFkLENBQWY7QUFDQSwwQkFBYyxDQUFkLEVBQWlCLFVBQWpCO0FBQ0Q7QUFDRjtBQUNELGlCQUFTLE1BQVQ7QUFDRCxPQXpCRCxNQXlCTztBQUNMLFlBQUksT0FBTyxNQUFYLEVBQW1CO0FBQ2pCLGNBQUksZUFBZSxPQUFPLEtBQVAsRUFBbkI7QUFDQSx1QkFBYSxPQUFiLEdBQXVCLElBQXZCO0FBQ0EsdUJBQWEsU0FBYixHQUF5QixNQUFNLFdBQS9CO0FBQ0EsdUJBQWEsSUFBYixDQUFrQixRQUFsQixHQUE2QixJQUE3QjtBQUNBLHVCQUFhLElBQWIsQ0FBa0IsV0FBbEIsR0FBZ0MsS0FBaEM7QUFDQSxnQkFBTSxRQUFOLENBQWUsWUFBZjtBQUNBLHVCQUFhLFVBQWI7QUFDRDtBQUNGOztBQUVELFlBQU0sSUFBTixDQUFXLEtBQVgsR0FBbUIsT0FBTyxTQUExQjtBQUNBLFlBQU0sSUFBTixDQUFXLEtBQVgsR0FBbUIsQ0FBbkIsQ0ExT3FCLENBME9DO0FBQ3RCLFlBQU0sSUFBTixDQUFXLFFBQVgsR0FBc0IsQ0FBdEIsQ0EzT3FCLENBMk9JOztBQUV6QixVQUFJLFdBQVcsTUFBTSxRQUFOLENBQWU7QUFDNUIsZUFBTyxlQUFTLElBQVQsRUFBZTtBQUNwQixpQkFBTyxLQUFLLElBQUwsS0FBYyxRQUFyQjtBQUNEO0FBSDJCLE9BQWYsQ0FBZjs7QUFNQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQUksYUFBYSxJQUFJLElBQUosRUFBakI7QUFDQSxVQUFJLFNBQVMsTUFBVCxHQUFrQixDQUF0QixFQUF5QjtBQUN2QixZQUFJLGNBQWMsSUFBSSxJQUFKLEVBQWxCO0FBQ0Esb0JBQVksV0FBWixDQUF3QixTQUFTLENBQVQsQ0FBeEI7QUFDQSxvQkFBWSxPQUFaLEdBQXNCLEtBQXRCOztBQUVBLGFBQUssSUFBSSxLQUFJLENBQWIsRUFBZ0IsS0FBSSxTQUFTLE1BQTdCLEVBQXFDLElBQXJDLEVBQTBDO0FBQ3hDLGNBQUksWUFBWSxJQUFJLElBQUosRUFBaEI7QUFDQSxvQkFBVSxXQUFWLENBQXNCLFNBQVMsRUFBVCxDQUF0QjtBQUNBLG9CQUFVLE9BQVYsR0FBb0IsS0FBcEI7O0FBRUEsdUJBQWEsWUFBWSxLQUFaLENBQWtCLFNBQWxCLENBQWI7QUFDQSxvQkFBVSxNQUFWO0FBQ0Esd0JBQWMsVUFBZDtBQUNEO0FBRUYsT0FmRCxNQWVPO0FBQ0w7QUFDQSxtQkFBVyxXQUFYLENBQXVCLFNBQVMsQ0FBVCxDQUF2QjtBQUNEOztBQUVELGlCQUFXLE9BQVgsR0FBcUIsS0FBckI7QUFDQSxpQkFBVyxJQUFYLENBQWdCLElBQWhCLEdBQXVCLE1BQXZCOztBQUVBLFlBQU0sUUFBTixDQUFlLFVBQWY7QUFDQSxpQkFBVyxVQUFYOztBQUVBOztBQUVBLGtCQUFZLEtBQVo7O0FBRUEsWUFBTSxJQUFOLENBQVc7QUFDVCxjQUFNLFVBREc7QUFFVCxZQUFJLE1BQU07QUFGRCxPQUFYOztBQUtBLFVBQUksYUFBSixFQUFtQjtBQUNqQixjQUFNLE9BQU4sQ0FDRSxDQUFDO0FBQ0Msc0JBQVk7QUFDVixtQkFBTztBQURHLFdBRGI7QUFJQyxvQkFBVTtBQUNSLHNCQUFVLEdBREY7QUFFUixvQkFBUTtBQUZBO0FBSlgsU0FBRCxFQVNBO0FBQ0Usc0JBQVk7QUFDVixtQkFBTztBQURHLFdBRGQ7QUFJRSxvQkFBVTtBQUNSLHNCQUFVLEdBREY7QUFFUixvQkFBUTtBQUZBO0FBSlosU0FUQSxDQURGO0FBb0JEO0FBQ0Y7O0FBRUQsUUFBSSxpQkFBSjtBQUNBLFFBQUkscUJBQUo7QUFBQSxRQUFrQixrQkFBbEI7QUFBQSxRQUE2QixxQkFBN0I7QUFDQSxRQUFJLHlCQUFKO0FBQUEsUUFBc0IseUJBQXRCO0FBQUEsUUFBd0Msc0JBQXhDOztBQUVBLGFBQVMsVUFBVCxDQUFvQixLQUFwQixFQUEyQjtBQUN6QixjQUFRLEdBQVIsQ0FBWSxZQUFaLEVBQTBCLE1BQU0sTUFBaEM7QUFDQTs7QUFFQSxvQkFBYyxHQUFkLENBQWtCLEtBQWxCLEVBQXlCLEdBQXpCLENBQTZCLEVBQUMsUUFBUSxLQUFULEVBQTdCO0FBQ0EsVUFBTSxVQUFVLE1BQU0sTUFBdEI7QUFBQSxVQUNJLFFBQVEsSUFBSSxLQUFKLENBQVUsUUFBUSxDQUFsQixFQUFxQixRQUFRLENBQTdCLENBRFo7QUFBQSxVQUVJLFlBQVksbUJBQW1CLEtBQW5CLENBRmhCOztBQUlBLFVBQUksU0FBSixFQUFlO0FBQ2IsbUJBQVcsSUFBWDtBQUNBO0FBQ0EsdUJBQWUsU0FBZjtBQUNBLG9CQUFZLENBQVo7QUFDQSx1QkFBZSxNQUFNLFFBQXJCOztBQUVBLDJCQUFtQixhQUFhLFFBQWhDO0FBQ0E7QUFDQSwyQkFBbUIsYUFBYSxJQUFiLENBQWtCLFFBQXJDO0FBQ0Esd0JBQWdCLGFBQWEsSUFBYixDQUFrQixLQUFsQzs7QUFFQSxZQUFJLGFBQUosRUFBbUI7QUFDakIsdUJBQWEsT0FBYixDQUFxQjtBQUNuQix3QkFBWTtBQUNWLHFCQUFPO0FBREcsYUFETztBQUluQixzQkFBVTtBQUNSLHdCQUFVLEdBREY7QUFFUixzQkFBUTtBQUZBO0FBSlMsV0FBckI7QUFTRDtBQUNGLE9BdkJELE1BdUJPO0FBQ0wsdUJBQWUsSUFBZjtBQUNBLFlBQUksYUFBSjtBQUNEO0FBQ0Y7O0FBRUQsYUFBUyxTQUFULENBQW1CLEtBQW5CLEVBQTBCO0FBQ3hCLFVBQUksV0FBSjtBQUNBLFlBQU0sY0FBTjtBQUNBLFVBQUksQ0FBQyxDQUFDLFlBQU4sRUFBb0I7QUFDbEI7QUFDQTtBQUNBLFlBQUksZUFBZSxNQUFNLEtBQXpCO0FBQ0EsWUFBSSxhQUFhLGVBQWUsU0FBaEM7QUFDQTtBQUNBLG9CQUFZLFlBQVo7O0FBRUEsWUFBSSxrQkFBa0IsTUFBTSxRQUE1QjtBQUNBLFlBQUksZ0JBQWdCLGtCQUFrQixZQUF0QztBQUNBLFlBQUksWUFBSixFQUFrQixlQUFsQixFQUFtQyxhQUFuQztBQUNBLHVCQUFlLGVBQWY7O0FBRUE7QUFDQTs7QUFFQSxxQkFBYSxRQUFiLEdBQXdCLE1BQU0sTUFBOUI7QUFDQSxxQkFBYSxLQUFiLENBQW1CLFVBQW5CO0FBQ0EscUJBQWEsTUFBYixDQUFvQixhQUFwQjs7QUFFQSxxQkFBYSxJQUFiLENBQWtCLEtBQWxCLElBQTJCLFVBQTNCO0FBQ0EscUJBQWEsSUFBYixDQUFrQixRQUFsQixJQUE4QixhQUE5QjtBQUNEO0FBQ0Y7O0FBRUQsUUFBSSxrQkFBSjtBQUNBLGFBQVMsUUFBVCxDQUFrQixLQUFsQixFQUF5QjtBQUN2QjtBQUNBLGtCQUFZLEtBQVo7QUFDQSxVQUFJLENBQUMsQ0FBQyxZQUFOLEVBQW9CO0FBQ2xCLHFCQUFhLElBQWIsQ0FBa0IsTUFBbEIsR0FBMkIsSUFBM0I7QUFDQSxZQUFJLE9BQU87QUFDVCxjQUFJLGFBQWEsRUFEUjtBQUVULGdCQUFNO0FBRkcsU0FBWDtBQUlBLFlBQUksYUFBYSxRQUFiLElBQXlCLGdCQUE3QixFQUErQztBQUM3QyxlQUFLLFFBQUwsR0FBZ0IsZ0JBQWhCO0FBQ0Q7O0FBRUQsWUFBSSxhQUFhLElBQWIsQ0FBa0IsUUFBbEIsSUFBOEIsZ0JBQWxDLEVBQW9EO0FBQ2xELGVBQUssUUFBTCxHQUFnQixtQkFBbUIsYUFBYSxJQUFiLENBQWtCLFFBQXJEO0FBQ0Q7O0FBRUQsWUFBSSxhQUFhLElBQWIsQ0FBa0IsS0FBbEIsSUFBMkIsYUFBL0IsRUFBOEM7QUFDNUMsZUFBSyxLQUFMLEdBQWEsZ0JBQWdCLGFBQWEsSUFBYixDQUFrQixLQUEvQztBQUNEOztBQUVELFlBQUksYUFBSixFQUFtQixhQUFhLElBQWIsQ0FBa0IsS0FBckM7QUFDQSxZQUFJLElBQUo7O0FBRUEsY0FBTSxJQUFOLENBQVcsSUFBWDs7QUFFQSxZQUFJLEtBQUssR0FBTCxDQUFTLE1BQU0sUUFBZixJQUEyQixDQUEvQixFQUFrQztBQUNoQztBQUNBO0FBQ0Q7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNEO0FBQ0QsaUJBQVcsS0FBWDtBQUNBLGlCQUFXLFlBQVc7QUFDcEIsc0JBQWMsR0FBZCxDQUFrQixLQUFsQixFQUF5QixHQUF6QixDQUE2QixFQUFDLFFBQVEsSUFBVCxFQUE3QjtBQUNELE9BRkQsRUFFRyxHQUZIO0FBR0Q7O0FBRUQsUUFBTSxhQUFhO0FBQ2pCLGdCQUFVLEtBRE87QUFFakIsY0FBUSxJQUZTO0FBR2pCLFlBQU0sSUFIVztBQUlqQixpQkFBVztBQUpNLEtBQW5COztBQU9BLGFBQVMsU0FBVCxDQUFtQixLQUFuQixFQUEwQjtBQUN4Qjs7QUFFQSxVQUFNLFVBQVUsTUFBTSxNQUF0QjtBQUFBLFVBQ0ksUUFBUSxJQUFJLEtBQUosQ0FBVSxRQUFRLENBQWxCLEVBQXFCLFFBQVEsQ0FBN0IsQ0FEWjtBQUFBLFVBRUksWUFBWSxNQUFNLE9BQU4sQ0FBYyxPQUFkLENBQXNCLEtBQXRCLEVBQTZCLFVBQTdCLENBRmhCOztBQUlBLFVBQUksU0FBSixFQUFlO0FBQ2IsWUFBSSxPQUFPLFVBQVUsSUFBckI7QUFDQSxhQUFLLFFBQUwsR0FBZ0IsQ0FBQyxLQUFLLFFBQXRCO0FBQ0EsWUFBSSxJQUFKO0FBQ0Q7QUFDRjs7QUFFRCxhQUFTLFNBQVQsQ0FBbUIsS0FBbkIsRUFBMEI7QUFDeEIsVUFBTSxVQUFVLE1BQU0sTUFBdEI7QUFBQSxVQUNJLFFBQVEsSUFBSSxLQUFKLENBQVUsUUFBUSxDQUFsQixFQUFxQixRQUFRLENBQTdCLENBRFo7QUFBQSxVQUVJLFlBQVksTUFBTSxPQUFOLENBQWMsT0FBZCxDQUFzQixLQUF0QixFQUE2QixVQUE3QixDQUZoQjs7QUFJQSxVQUFJLFNBQUosRUFBZTtBQUNiLFlBQUksT0FBTyxVQUFVLElBQXJCO0FBQ0EsWUFBSSxTQUFTLEtBQUssTUFBbEI7O0FBRUEsWUFBSSxLQUFLLElBQUwsQ0FBVSxRQUFkLEVBQXdCO0FBQ3RCLGVBQUssSUFBTCxDQUFVLFdBQVYsR0FBd0IsQ0FBQyxLQUFLLElBQUwsQ0FBVSxXQUFuQzs7QUFFQSxjQUFJLEtBQUssSUFBTCxDQUFVLFdBQWQsRUFBMkI7QUFDekIsaUJBQUssU0FBTCxHQUFpQixXQUFqQjtBQUNBLGlCQUFLLFdBQUwsR0FBbUIsV0FBbkI7QUFDRCxXQUhELE1BR087QUFDTCxpQkFBSyxTQUFMLEdBQWlCLE9BQU8sSUFBUCxDQUFZLEtBQTdCO0FBQ0EsaUJBQUssV0FBTCxHQUFtQixPQUFPLElBQVAsQ0FBWSxLQUEvQjtBQUNEOztBQUVELGdCQUFNLElBQU4sQ0FBVztBQUNULGtCQUFNLFlBREc7QUFFVCxnQkFBSSxLQUFLLEVBRkE7QUFHVCxrQkFBTSxPQUFPLElBQVAsQ0FBWSxLQUhUO0FBSVQseUJBQWEsS0FBSyxJQUFMLENBQVU7QUFKZCxXQUFYO0FBTUQsU0FqQkQsTUFpQk87QUFDTCxjQUFJLGNBQUo7QUFDRDtBQUVGLE9BekJELE1BeUJPO0FBQ0wsdUJBQWUsSUFBZjtBQUNBLFlBQUksYUFBSjtBQUNEO0FBQ0Y7O0FBRUQsUUFBTSxxQkFBcUIsRUFBM0I7QUFDQSxhQUFTLGlCQUFULEdBQTZCO0FBQzNCLFVBQUksYUFBYSxRQUFqQjtBQUNBLFVBQUksYUFBYSxRQUFiLENBQXNCLENBQXRCLElBQTJCLElBQUksYUFBYSxNQUFiLENBQW9CLEtBQW5ELElBQ0EsYUFBYSxRQUFiLENBQXNCLENBQXRCLElBQTJCLFlBQVksYUFBYSxNQUFiLENBQW9CLEtBRDNELElBRUEsYUFBYSxRQUFiLENBQXNCLENBQXRCLElBQTJCLElBQUksYUFBYSxNQUFiLENBQW9CLE1BRm5ELElBR0EsYUFBYSxRQUFiLENBQXNCLENBQXRCLElBQTJCLGFBQWEsYUFBYSxNQUFiLENBQW9CLE1BSGhFLEVBR3dFO0FBQ2xFLHFCQUFhLElBQWIsQ0FBa0IsU0FBbEIsR0FBOEIsSUFBOUI7QUFDQSxxQkFBYSxPQUFiLEdBQXVCLEtBQXZCO0FBQ0o7QUFDRDtBQUNELDRCQUFzQixpQkFBdEI7QUFDQSxtQkFBYSxRQUFiLENBQXNCLENBQXRCLElBQTJCLFVBQVUsU0FBVixHQUFzQixrQkFBakQ7QUFDQSxtQkFBYSxRQUFiLENBQXNCLENBQXRCLElBQTJCLFVBQVUsU0FBVixHQUFzQixrQkFBakQ7QUFDRDs7QUFFRCxRQUFJLGdCQUFnQixJQUFJLE9BQU8sT0FBWCxDQUFtQixRQUFRLENBQVIsQ0FBbkIsQ0FBcEI7O0FBRUEsa0JBQWMsR0FBZCxDQUFrQixJQUFJLE9BQU8sR0FBWCxDQUFlLEVBQUUsT0FBTyxXQUFULEVBQXNCLE1BQU0sQ0FBNUIsRUFBZixDQUFsQjtBQUNBLGtCQUFjLEdBQWQsQ0FBa0IsSUFBSSxPQUFPLEdBQVgsQ0FBZSxFQUFFLE9BQU8sV0FBVCxFQUFmLENBQWxCO0FBQ0Esa0JBQWMsR0FBZCxDQUFrQixJQUFJLE9BQU8sR0FBWCxDQUFlLEVBQUUsV0FBVyxPQUFPLGFBQXBCLEVBQWYsQ0FBbEI7QUFDQSxrQkFBYyxHQUFkLENBQWtCLElBQUksT0FBTyxLQUFYLEVBQWxCOztBQUVBLGtCQUFjLEdBQWQsQ0FBa0IsV0FBbEIsRUFBK0IsYUFBL0IsQ0FBNkMsV0FBN0M7QUFDQSxrQkFBYyxHQUFkLENBQWtCLFdBQWxCLEVBQStCLGNBQS9CLENBQThDLFdBQTlDO0FBQ0Esa0JBQWMsR0FBZCxDQUFrQixLQUFsQixFQUF5QixjQUF6QixDQUF3QyxPQUF4Qzs7QUFFQSxrQkFBYyxFQUFkLENBQWlCLFdBQWpCLEVBQThCLFNBQTlCO0FBQ0Esa0JBQWMsRUFBZCxDQUFpQixXQUFqQixFQUE4QixTQUE5Qjs7QUFFQSxrQkFBYyxFQUFkLENBQWlCLFVBQWpCLEVBQTZCLFFBQTdCO0FBQ0Esa0JBQWMsRUFBZCxDQUFpQixTQUFqQixFQUE0QixPQUE1QjtBQUNBLGtCQUFjLEVBQWQsQ0FBaUIsUUFBakIsRUFBMkIsTUFBM0I7O0FBRUEsa0JBQWMsRUFBZCxDQUFpQixZQUFqQixFQUErQixVQUEvQjtBQUNBLGtCQUFjLEVBQWQsQ0FBaUIsV0FBakIsRUFBOEIsU0FBOUI7QUFDQSxrQkFBYyxFQUFkLENBQWlCLFVBQWpCLEVBQTZCLFFBQTdCO0FBQ0Esa0JBQWMsRUFBZCxDQUFpQixhQUFqQixFQUFnQyxZQUFXO0FBQUUsb0JBQWMsR0FBZCxDQUFrQixLQUFsQixFQUF5QixHQUF6QixDQUE2QixFQUFDLFFBQVEsSUFBVCxFQUE3QjtBQUErQyxLQUE1RixFQXR0QndCLENBc3RCdUU7QUFDaEc7O0FBRUQsTUFBTSxlQUFlLFNBQXJCO0FBQ0EsV0FBUyxVQUFULEdBQXNCO0FBQ3BCLFFBQUksYUFBSjtBQUNBLGtCQUFjLEVBQWQ7QUFDQSxVQUFNLE9BQU4sQ0FBYyxXQUFkLENBQTBCLGNBQTFCO0FBQ0Q7O0FBRUQsV0FBUyxXQUFULEdBQXVCO0FBQ3JCLFFBQUksY0FBSjtBQUNBLFFBQUksRUFBRSxNQUFNLE1BQU4sR0FBZSxDQUFqQixDQUFKLEVBQXlCO0FBQ3ZCLFVBQUksY0FBSjtBQUNBO0FBQ0Q7O0FBRUQsUUFBSSxXQUFXLE1BQU0sR0FBTixFQUFmO0FBQ0EsUUFBSSxPQUFPLFFBQVEsT0FBUixDQUFnQjtBQUN6QixVQUFJLFNBQVM7QUFEWSxLQUFoQixDQUFYOztBQUlBLFFBQUksSUFBSixFQUFVO0FBQ1IsV0FBSyxPQUFMLEdBQWUsSUFBZixDQURRLENBQ2E7QUFDckIsY0FBTyxTQUFTLElBQWhCO0FBQ0UsYUFBSyxVQUFMO0FBQ0UsY0FBSSxnQkFBSjtBQUNBLGVBQUssTUFBTDtBQUNBO0FBQ0YsYUFBSyxZQUFMO0FBQ0UsY0FBSSxTQUFTLFdBQWIsRUFBMEI7QUFDeEIsaUJBQUssU0FBTCxHQUFpQixTQUFTLElBQTFCO0FBQ0EsaUJBQUssV0FBTCxHQUFtQixTQUFTLElBQTVCO0FBQ0QsV0FIRCxNQUdPO0FBQ0wsaUJBQUssU0FBTCxHQUFpQixXQUFqQjtBQUNBLGlCQUFLLFdBQUwsR0FBbUIsV0FBbkI7QUFDRDtBQUNILGFBQUssV0FBTDtBQUNFLGNBQUksQ0FBQyxDQUFDLFNBQVMsUUFBZixFQUF5QjtBQUN2QixpQkFBSyxRQUFMLEdBQWdCLFNBQVMsUUFBekI7QUFDRDtBQUNELGNBQUksQ0FBQyxDQUFDLFNBQVMsUUFBZixFQUF5QjtBQUN2QixpQkFBSyxRQUFMLEdBQWdCLFNBQVMsUUFBekI7QUFDRDtBQUNELGNBQUksQ0FBQyxDQUFDLFNBQVMsS0FBZixFQUFzQjtBQUNwQixpQkFBSyxLQUFMLENBQVcsU0FBUyxLQUFwQjtBQUNEO0FBQ0Q7QUFDRjtBQUNFLGNBQUksY0FBSjtBQXpCSjtBQTJCRCxLQTdCRCxNQTZCTztBQUNMLFVBQUksOEJBQUo7QUFDRDtBQUNGOztBQUVELFdBQVMsV0FBVCxHQUFtQztBQUFBLFFBQWQsSUFBYyx1RUFBUCxLQUFPOztBQUNqQyxRQUFJLENBQUMsQ0FBQyxJQUFOLEVBQVk7QUFDVixhQUFPLElBQVAsQ0FBWSxJQUFaO0FBQ0Q7QUFDRCxVQUFNLFdBQU4sQ0FBa0IsWUFBbEI7O0FBRUEsY0FBVSxLQUFWO0FBQ0EsVUFBTSxlQUFOLENBQXNCLG1CQUF0QjtBQUNEOztBQUVELFdBQVMsWUFBVCxHQUF3QjtBQUN0QixVQUFNLFFBQU4sQ0FBZSxZQUFmO0FBQ0EsV0FBTyxJQUFQLENBQVksS0FBWjtBQUNBLGNBQVUsSUFBVjtBQUNBLDBCQUFzQixNQUFNLGdCQUFOLENBQXVCLFdBQXZCLENBQXRCO0FBQ0Q7O0FBRUQsV0FBUyxXQUFULEdBQXVCO0FBQ3JCLFFBQUksY0FBSjtBQUNBLFFBQUksT0FBSixFQUFhO0FBQ1gsa0JBQVksSUFBWjtBQUNELEtBRkQsTUFFTztBQUNMO0FBQ0Q7QUFDRCxZQUFRLEdBQVIsQ0FBWSxjQUFaO0FBQ0Q7O0FBRUQsV0FBUyxXQUFULEdBQXVCO0FBQ3JCLFFBQUksY0FBSjtBQUNEOztBQUVELFdBQVMsWUFBVCxHQUF3QjtBQUN0QixRQUFJLGVBQUo7QUFDRDs7QUFFRCxXQUFTLE9BQVQsR0FBbUI7QUFDakIsTUFBRSxxQkFBRixFQUF5QixFQUF6QixDQUE0QixpQkFBNUIsRUFBK0MsWUFBVztBQUN4RCxVQUFJLENBQUMsTUFBTSxRQUFOLENBQWUsWUFBZixDQUFMLEVBQW1DO0FBQ2pDO0FBQ0Q7QUFDRixLQUpEO0FBS0Q7O0FBRUQsV0FBUyxRQUFULEdBQW9CO0FBQ2xCLE1BQUUsc0JBQUYsRUFBMEIsRUFBMUIsQ0FBNkIsT0FBN0IsRUFBc0MsWUFBVztBQUMvQyxVQUFJLENBQUMsTUFBTSxRQUFOLENBQWUsWUFBZixDQUFMLEVBQW1DO0FBQ2pDO0FBQ0Q7QUFDRixLQUpEO0FBS0Q7O0FBRUQsV0FBUyxRQUFULEdBQW9CO0FBQ2xCLE1BQUUsMkJBQUYsRUFBK0IsRUFBL0IsQ0FBa0MsT0FBbEMsRUFBMkMsV0FBM0M7QUFDRDs7QUFFRCxXQUFTLFFBQVQsR0FBb0I7QUFDbEIsTUFBRSxxQkFBRixFQUF5QixFQUF6QixDQUE0QixPQUE1QixFQUFxQyxZQUFXO0FBQzlDLFVBQUksQ0FBQyxNQUFNLFFBQU4sQ0FBZSxZQUFmLENBQUwsRUFBbUM7QUFDakM7QUFDRDtBQUNGLEtBSkQ7QUFLRDs7QUFFRCxXQUFTLFNBQVQsR0FBcUI7QUFDbkIsTUFBRSxzQkFBRixFQUEwQixFQUExQixDQUE2QixPQUE3QixFQUFzQyxZQUFXO0FBQy9DLFVBQUksQ0FBQyxNQUFNLFFBQU4sQ0FBZSxZQUFmLENBQUwsRUFBbUM7QUFDakM7QUFDRDtBQUNGLEtBSkQ7QUFLRDs7QUFFRCxXQUFTLFVBQVQsR0FBc0I7QUFDcEIsUUFBSSxTQUFTLElBQUksS0FBSyxNQUFULENBQWdCO0FBQzNCLGNBQVEsQ0FBQyxHQUFELEVBQU0sR0FBTixDQURtQjtBQUUzQixjQUFRLEdBRm1CO0FBRzNCLG1CQUFhLE9BSGM7QUFJM0IsaUJBQVc7QUFKZ0IsS0FBaEIsQ0FBYjtBQU1BLFFBQUksUUFBUSxJQUFJLEtBQUosQ0FBVSxNQUFWLENBQVo7QUFDRDs7QUFFRCxXQUFTLElBQVQsR0FBZ0I7QUFDZDtBQUNBO0FBQ0E7QUFDRDs7QUFFRDtBQUNELENBMThCRDs7Ozs7Ozs7UUNuQmdCLFUsR0FBQSxVO1FBMkJBLGdCLEdBQUEsZ0I7UUF5RkEsbUIsR0FBQSxtQjtRQTRGQSxlLEdBQUEsZTtRQUlBLGMsR0FBQSxjO1FBSUEsVSxHQUFBLFU7UUFVQSwyQixHQUFBLDJCO1FBY0Esa0IsR0FBQSxrQjtRQXlIQSxnQixHQUFBLGdCO0FBaFhoQixJQUFNLE9BQU8sUUFBUSxRQUFSLENBQWI7QUFDQSxJQUFNLFNBQVMsUUFBUSxnQkFBUixDQUFmOztBQUVBLFNBQVMsR0FBVCxHQUF1QjtBQUNyQixPQUFLLEdBQUw7QUFDRDs7QUFFTSxTQUFTLFVBQVQsQ0FBb0IsSUFBcEIsRUFBMEIsUUFBMUIsRUFBb0M7QUFDekMsTUFBSSxZQUFZLEtBQUssS0FBTCxFQUFoQjtBQUNBLE1BQUksVUFBVSxJQUFJLElBQUosRUFBZDtBQUNBLE9BQUssSUFBTCxDQUFVLFVBQVUsUUFBcEIsRUFBOEIsVUFBQyxPQUFELEVBQVUsQ0FBVixFQUFnQjtBQUM1QyxZQUFRLEdBQVIsQ0FBWSxPQUFaO0FBQ0EsUUFBSSxRQUFRLFFBQVEsS0FBcEI7QUFDQSxRQUFJLFdBQVcsZUFBZSxLQUFmLENBQWY7QUFDQSxRQUFJLGtCQUFKO0FBQ0EsUUFBSSxZQUFZLFFBQWhCLEVBQTBCO0FBQ3hCLGtCQUFZLFNBQVMsUUFBVCxDQUFaO0FBQ0QsS0FGRCxNQUVPO0FBQ0wsVUFBSSxlQUFlLDRCQUE0QixLQUE1QixFQUFtQyxRQUFuQyxDQUFuQjtBQUNBLGlCQUFXLGVBQWUsWUFBZixDQUFYO0FBQ0EsVUFBSSxZQUFZLFFBQWhCLEVBQTBCO0FBQ3hCLG9CQUFZLFNBQVMsUUFBVCxDQUFaO0FBQ0QsT0FGRCxNQUVPO0FBQ0wsWUFBSSw0QkFBSjtBQUNEO0FBQ0Y7O0FBRUQsUUFBSSxTQUFKLEVBQWU7QUFDYixjQUFRLEdBQVIsQ0FBWSxTQUFaO0FBQ0Q7QUFDRixHQXBCRDtBQXFCQSxTQUFPLFNBQVA7QUFDRDs7QUFFTSxTQUFTLGdCQUFULENBQTBCLFFBQTFCLEVBQW9DLEtBQXBDLEVBQTJDLGNBQTNDLEVBQTJEO0FBQ2hFLE1BQU0sZ0JBQWdCLE9BQU8sZUFBZSxNQUE1Qzs7QUFFQSxNQUFJLGFBQWEsSUFBSSxJQUFKLENBQVM7QUFDeEIsaUJBQWEsQ0FEVztBQUV4QixpQkFBYTtBQUZXLEdBQVQsQ0FBakI7O0FBS0EsTUFBSSxZQUFZLElBQUksSUFBSixDQUFTO0FBQ3ZCLGlCQUFhLENBRFU7QUFFdkIsaUJBQWE7QUFGVSxHQUFULENBQWhCOztBQUtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUEsTUFBSSxhQUFhLElBQUksS0FBSyxNQUFULENBQWdCO0FBQy9CLFlBQVEsZUFBZSxZQUFmLENBQTRCLEtBREw7QUFFL0IsWUFBUSxFQUZ1QjtBQUcvQixpQkFBYTtBQUhrQixHQUFoQixDQUFqQjs7QUFNQSxNQUFJLFlBQVksSUFBSSxLQUFLLE1BQVQsQ0FBZ0I7QUFDOUIsWUFBUSxlQUFlLFdBQWYsQ0FBMkIsS0FETDtBQUU5QixZQUFRLEVBRnNCO0FBRzlCLGlCQUFhO0FBSGlCLEdBQWhCLENBQWhCOztBQU9BLE1BQUksY0FBSjtBQUFBLE1BQVcsa0JBQVg7QUFBQSxNQUFzQixtQkFBdEI7QUFDQSxPQUFLLElBQUwsQ0FBVSxLQUFWLEVBQWlCLFVBQUMsSUFBRCxFQUFPLENBQVAsRUFBYTtBQUM1QixRQUFJLGFBQWEsS0FBSyxDQUFMLENBQWpCO0FBQ0EsUUFBSSxZQUFZLEtBQUssS0FBSyxNQUFMLEdBQWMsQ0FBbkIsQ0FBaEI7O0FBRUEsWUFBUSxLQUFLLEtBQUwsQ0FBVyxVQUFVLENBQVYsR0FBYyxXQUFXLENBQXBDLEVBQXVDLFVBQVUsQ0FBVixHQUFjLFdBQVcsQ0FBaEUsQ0FBUjs7QUFFQSxRQUFJLENBQUMsQ0FBQyxTQUFOLEVBQWlCO0FBQ2YsbUJBQWEsS0FBSyxVQUFMLENBQWdCLEtBQWhCLEVBQXVCLFNBQXZCLENBQWI7QUFDQSxjQUFRLEdBQVIsQ0FBWSxVQUFaO0FBQ0EsaUJBQVcsR0FBWCxDQUFlLFVBQWY7QUFDQSxpQkFBVyxHQUFYLENBQWUsU0FBZjtBQUNEOztBQUVELGdCQUFZLEtBQVo7QUFDRCxHQWREOztBQWdCQSxPQUFLLElBQUwsQ0FBVSxlQUFlLFFBQXpCLEVBQW1DLFVBQUMsT0FBRCxFQUFVLENBQVYsRUFBZ0I7QUFDakQsUUFBSSxlQUFlLGdCQUFnQixRQUFRLEtBQXhCLENBQW5CO0FBQ0EsUUFBSSxlQUFlLFdBQVcsZUFBWCxDQUEyQixZQUEzQixDQUFuQjtBQUNBO0FBQ0EsUUFBSSxhQUFhLFdBQWIsQ0FBeUIsWUFBekIsS0FBMEMsYUFBOUMsRUFBNkQ7QUFDM0QsZ0JBQVUsR0FBVixDQUFjLFlBQWQ7QUFDQSxVQUFJLEtBQUssTUFBVCxDQUFnQjtBQUNkLGdCQUFRLFlBRE07QUFFZCxnQkFBUSxDQUZNO0FBR2QsbUJBQVc7QUFIRyxPQUFoQjtBQUtELEtBUEQsTUFPTztBQUNMLGNBQVEsR0FBUixDQUFZLFVBQVo7QUFDQSxnQkFBVSxHQUFWLENBQWMsWUFBZDtBQUNBLFVBQUksS0FBSyxNQUFULENBQWdCO0FBQ2QsZ0JBQVEsWUFETTtBQUVkLGdCQUFRLENBRk07QUFHZCxtQkFBVztBQUhHLE9BQWhCO0FBS0Q7QUFDRixHQXBCRDs7QUFzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQUVBLE1BQUksZUFBZSxNQUFuQixFQUEyQjtBQUN6QixjQUFVLE1BQVYsR0FBbUIsSUFBbkI7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7O0FBRUEsU0FBTyxTQUFQO0FBQ0Q7O0FBRU0sU0FBUyxtQkFBVCxDQUE2QixRQUE3QixFQUF1QyxJQUF2QyxFQUE2QztBQUNsRCxNQUFNLGlCQUFpQixLQUFLLEVBQUwsR0FBVSxDQUFqQztBQUNBLE1BQU0sZ0JBQWdCLE1BQU0sS0FBSyxNQUFqQztBQUNBOztBQUVBLE1BQUksUUFBUSxDQUFaOztBQUVBLE1BQUksUUFBUSxFQUFaO0FBQ0EsTUFBSSxPQUFPLEVBQVg7QUFDQSxNQUFJLGFBQUo7QUFDQSxNQUFJLGtCQUFKOztBQUVBOztBQUVBLE1BQUksYUFBYSxJQUFJLElBQUosRUFBakI7O0FBRUEsT0FBSyxJQUFMLENBQVUsS0FBSyxRQUFmLEVBQXlCLFVBQUMsT0FBRCxFQUFVLENBQVYsRUFBZ0I7QUFDdkMsUUFBSSxlQUFlLGdCQUFnQixRQUFRLEtBQXhCLENBQW5CO0FBQ0EsUUFBSSxXQUFXLGVBQWUsWUFBZixDQUFmO0FBQ0EsUUFBSSxrQkFBSjtBQUNBLFFBQUksWUFBWSxRQUFoQixFQUEwQjtBQUN4QixrQkFBWSxTQUFTLFFBQVQsQ0FBWjtBQUNELEtBRkQsTUFFTztBQUNMLFVBQUksZUFBZSw0QkFBNEIsUUFBNUIsRUFBc0MsWUFBdEMsQ0FBbkI7QUFDQSxpQkFBVyxlQUFlLFlBQWYsQ0FBWDs7QUFFQSxVQUFJLFlBQVksUUFBaEIsRUFBMEI7QUFDeEIsb0JBQVksU0FBUyxRQUFULENBQVo7QUFDRCxPQUZELE1BRU87QUFDTCxZQUFJLDRCQUFKO0FBQ0Q7QUFDRjs7QUFFRCxRQUFJLFNBQUosRUFBZTtBQUNiLGlCQUFXLEdBQVgsQ0FBZSxZQUFmO0FBQ0EsVUFBSSxLQUFLLE1BQVQsQ0FBZ0I7QUFDZCxnQkFBUSxZQURNO0FBRWQsZ0JBQVEsQ0FGTTtBQUdkLHFCQUFhLElBQUksS0FBSixDQUFVLElBQUksS0FBSyxRQUFMLENBQWMsTUFBNUIsRUFBb0MsSUFBSSxLQUFLLFFBQUwsQ0FBYyxNQUF0RCxFQUE4RCxJQUFJLEtBQUssUUFBTCxDQUFjLE1BQWhGO0FBSEMsT0FBaEI7QUFLQSxVQUFJLFVBQVUsS0FBZDtBQUNBLFVBQUksQ0FBQyxJQUFMLEVBQVc7QUFDVDtBQUNBO0FBQ0EsYUFBSyxJQUFMLENBQVUsU0FBVjtBQUNELE9BSkQsTUFJTztBQUNMO0FBQ0EsWUFBSSxRQUFRLEtBQUssS0FBTCxDQUFXLGFBQWEsQ0FBeEIsRUFBMkIsYUFBYSxDQUF4QyxJQUE2QyxLQUFLLEtBQUwsQ0FBVyxLQUFLLENBQWhCLEVBQW1CLEtBQUssQ0FBeEIsQ0FBekQ7QUFDQSxZQUFJLFFBQVEsQ0FBWixFQUFlLFNBQVUsSUFBSSxLQUFLLEVBQW5CLENBSFYsQ0FHa0M7QUFDdkM7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxZQUFJLE9BQU8sU0FBUCxLQUFxQixXQUF6QixFQUFzQztBQUNwQztBQUNBLGVBQUssSUFBTCxDQUFVLFNBQVY7QUFDRCxTQUhELE1BR087QUFDTCxjQUFJLGtCQUFrQixLQUFLLEdBQUwsQ0FBUyxRQUFRLFNBQWpCLEVBQTRCLENBQTVCLENBQXRCO0FBQ0EsY0FBSSxpQkFBSixFQUF1QixlQUF2QjtBQUNBLGNBQUksbUJBQW1CLGNBQXZCLEVBQXVDO0FBQ3JDO0FBQ0E7QUFDQSxpQkFBSyxJQUFMLENBQVUsU0FBVjtBQUNELFdBSkQsTUFJTztBQUNMO0FBQ0E7QUFDQSxrQkFBTSxJQUFOLENBQVcsSUFBWDtBQUNBLG1CQUFPLENBQUMsU0FBRCxDQUFQO0FBRUQ7QUFDRjs7QUFFRCxvQkFBWSxLQUFaO0FBQ0Q7O0FBRUQsYUFBTyxZQUFQO0FBQ0E7QUFDRCxLQS9DRCxNQStDTztBQUNMLFVBQUksU0FBSjtBQUNEO0FBQ0YsR0FuRUQ7O0FBcUVBOztBQUVBLFFBQU0sSUFBTixDQUFXLElBQVg7O0FBRUEsU0FBTyxLQUFQO0FBQ0Q7O0FBRU0sU0FBUyxlQUFULENBQXlCLEtBQXpCLEVBQWdDO0FBQ3JDLFNBQU8sSUFBSSxLQUFKLENBQVUsS0FBSyxLQUFMLENBQVcsTUFBTSxDQUFqQixDQUFWLEVBQStCLEtBQUssS0FBTCxDQUFXLE1BQU0sQ0FBakIsQ0FBL0IsQ0FBUDtBQUNEOztBQUVNLFNBQVMsY0FBVCxDQUF3QixLQUF4QixFQUErQjtBQUNwQyxTQUFVLEtBQUssS0FBTCxDQUFXLE1BQU0sQ0FBakIsQ0FBVixTQUFpQyxLQUFLLEtBQUwsQ0FBVyxNQUFNLENBQWpCLENBQWpDO0FBQ0Q7O0FBRU0sU0FBUyxVQUFULENBQW9CLFFBQXBCLEVBQThCO0FBQ25DLE1BQUksUUFBUSxTQUFTLEtBQVQsQ0FBZSxHQUFmLEVBQW9CLEdBQXBCLENBQXdCLFVBQUMsR0FBRDtBQUFBLFdBQVMsS0FBSyxLQUFMLENBQVcsR0FBWCxDQUFUO0FBQUEsR0FBeEIsQ0FBWjs7QUFFQSxNQUFJLE1BQU0sTUFBTixJQUFnQixDQUFwQixFQUF1QjtBQUNyQixXQUFPLElBQUksS0FBSixDQUFVLE1BQU0sQ0FBTixDQUFWLEVBQW9CLE1BQU0sQ0FBTixDQUFwQixDQUFQO0FBQ0Q7O0FBRUQsU0FBTyxJQUFQO0FBQ0Q7O0FBRU0sU0FBUywyQkFBVCxDQUFxQyxLQUFyQyxFQUE0QyxRQUE1QyxFQUFzRDtBQUMzRCxNQUFJLHNCQUFKO0FBQUEsTUFBbUIscUJBQW5COztBQUVBLE9BQUssSUFBTCxDQUFVLFFBQVYsRUFBb0IsVUFBQyxLQUFELEVBQVEsQ0FBUixFQUFjO0FBQ2hDLFFBQUksV0FBVyxNQUFNLFdBQU4sQ0FBa0IsTUFBTSxLQUF4QixDQUFmO0FBQ0EsUUFBSSxDQUFDLGFBQUQsSUFBa0IsV0FBVyxhQUFqQyxFQUFnRDtBQUM5QyxzQkFBZ0IsUUFBaEI7QUFDQSxxQkFBZSxNQUFNLEtBQXJCO0FBQ0Q7QUFDRixHQU5EOztBQVFBLFNBQU8sZ0JBQWdCLEtBQXZCO0FBQ0Q7O0FBRU0sU0FBUyxrQkFBVCxDQUE0QixJQUE1QixFQUFrQztBQUN2QyxNQUFNLGlCQUFpQixLQUFLLEdBQUwsQ0FBUyxPQUFPLEtBQVAsQ0FBYSxrQkFBdEIsQ0FBdkI7QUFDQSxNQUFNLG9CQUFvQixNQUFNLEtBQUssTUFBckM7O0FBRUEsTUFBSSxVQUFVLEVBQWQ7O0FBRUEsTUFBSSxLQUFLLE1BQUwsR0FBYyxDQUFsQixFQUFxQjtBQUFBO0FBQ25CLFVBQUksY0FBSjtBQUFBLFVBQVcsYUFBWDtBQUNBLFVBQUksY0FBSjtBQUFBLFVBQVcsa0JBQVg7QUFBQSxVQUFzQixtQkFBdEI7O0FBRUEsV0FBSyxJQUFMLENBQVUsS0FBSyxRQUFmLEVBQXlCLFVBQUMsT0FBRCxFQUFVLENBQVYsRUFBZ0I7QUFDdkMsWUFBSSxRQUFRLGdCQUFnQixRQUFRLEtBQXhCLENBQVo7QUFDQSxZQUFJLENBQUMsQ0FBQyxJQUFOLEVBQVk7QUFDVixjQUFJLFNBQVEsS0FBSyxLQUFMLENBQVcsTUFBTSxDQUFOLEdBQVUsS0FBSyxDQUExQixFQUE2QixNQUFNLENBQU4sR0FBVSxLQUFLLENBQTVDLENBQVo7QUFDQSxjQUFJLFNBQVEsQ0FBWixFQUFlLFVBQVUsSUFBSSxLQUFLLEVBQW5CLENBRkwsQ0FFNkI7QUFDdkMsY0FBSSxDQUFDLENBQUMsU0FBTixFQUFpQjtBQUNmLHlCQUFhLEtBQUssVUFBTCxDQUFnQixNQUFoQixFQUF1QixTQUF2QixDQUFiO0FBQ0EsZ0JBQUksY0FBYyxjQUFsQixFQUFrQztBQUNoQztBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxzQkFBUSxJQUFSLENBQWEsSUFBYjtBQUNELGFBUkQsTUFRTztBQUNMO0FBQ0Q7QUFDRjs7QUFFRCxzQkFBWSxNQUFaO0FBQ0QsU0FuQkQsTUFtQk87QUFDTDtBQUNBLGtCQUFRLElBQVIsQ0FBYSxLQUFiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNEO0FBQ0QsZUFBTyxLQUFQO0FBQ0QsT0EvQkQ7O0FBaUNBLFVBQUksbUJBQW1CLGdCQUFnQixLQUFLLFdBQUwsQ0FBaUIsS0FBakMsQ0FBdkI7QUFDQSxjQUFRLElBQVIsQ0FBYSxnQkFBYjs7QUFFQSxVQUFJLGdCQUFnQixFQUFwQjtBQUNBLFVBQUksYUFBYSxFQUFqQjtBQUNBLFdBQUssSUFBSSxJQUFJLENBQWIsRUFBZ0IsSUFBSSxRQUFRLE1BQTVCLEVBQW9DLEdBQXBDLEVBQXlDO0FBQ3ZDLFlBQUksU0FBUSxRQUFRLENBQVIsQ0FBWjs7QUFFQSxZQUFJLE1BQU0sQ0FBVixFQUFhO0FBQ1gsY0FBSSxPQUFPLE9BQU0sV0FBTixDQUFrQixJQUFsQixDQUFYO0FBQ0EsY0FBSSxnQkFBZ0IsRUFBcEI7QUFDQSxpQkFBTyxPQUFPLGlCQUFkLEVBQWlDO0FBQy9CLDBCQUFjLElBQWQsQ0FBbUI7QUFDakIscUJBQU8sTUFEVTtBQUVqQixxQkFBTztBQUZVLGFBQW5COztBQUtBLGdCQUFJLElBQUksUUFBUSxNQUFSLEdBQWlCLENBQXpCLEVBQTRCO0FBQzFCO0FBQ0EscUJBQU8sTUFBUDtBQUNBLHVCQUFRLFFBQVEsQ0FBUixDQUFSO0FBQ0EscUJBQU8sT0FBTSxXQUFOLENBQWtCLElBQWxCLENBQVA7QUFDRCxhQUxELE1BS087QUFDTDtBQUNEO0FBQ0Y7QUFDRCxjQUFJLGNBQWMsTUFBZCxHQUF1QixDQUEzQixFQUE4QjtBQUFBLGdCQUN2QixJQUR1QixHQUNSLENBRFE7QUFBQSxnQkFDakIsSUFEaUIsR0FDTCxDQURLOzs7QUFHNUIsaUJBQUssSUFBTCxDQUFVLGFBQVYsRUFBeUIsVUFBQyxRQUFELEVBQWM7QUFDckMsc0JBQVEsU0FBUyxLQUFULENBQWUsQ0FBdkI7QUFDQSxzQkFBUSxTQUFTLEtBQVQsQ0FBZSxDQUF2QjtBQUNELGFBSEQ7O0FBSDRCLGdCQVN2QixJQVR1QixHQVNSLE9BQU8sY0FBYyxNQVRiO0FBQUEsZ0JBU2pCLElBVGlCLEdBU3FCLE9BQU8sY0FBYyxNQVQxQzs7QUFVNUIsMEJBQWMsSUFBZCxDQUFtQixJQUFJLEtBQUosQ0FBVSxJQUFWLEVBQWdCLElBQWhCLENBQW5CO0FBQ0Q7QUFDRixTQTlCRCxNQThCTztBQUNMLHdCQUFjLElBQWQsQ0FBbUIsTUFBbkI7QUFDRDs7QUFFRCxlQUFPLE1BQVA7QUFDRDs7QUFFRDtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQTdHbUI7QUE4R3BCOztBQUVELFNBQU8sT0FBUDtBQUNEOztBQUVNLFNBQVMsZ0JBQVQsQ0FBMEIsSUFBMUIsRUFBZ0M7QUFDckMsTUFBSSxjQUFjLEVBQWxCO0FBQ0EsTUFBSSxVQUFVLEtBQUssS0FBTCxDQUFXLElBQVgsRUFBaUIsQ0FBakIsQ0FBZCxDQUZxQyxDQUVGOztBQUVuQyxNQUFJLGNBQWMsT0FBbEIsRUFBMkI7QUFDekIsUUFBSSxXQUFXLFFBQVEsUUFBdkI7QUFDQSxTQUFLLElBQUwsQ0FBVSxRQUFWLEVBQW9CLFVBQUMsT0FBRCxFQUFVLENBQVYsRUFBZ0I7QUFDbEMsVUFBSSxRQUFRLE1BQVIsS0FBbUIsQ0FBdkIsRUFBMEI7QUFDeEIsWUFBSSxlQUFlLFFBQVEsQ0FBUixDQUFuQixDQUR3QixDQUNPO0FBQy9CLG9CQUFZLElBQVosQ0FBaUI7QUFDZixhQUFHLGFBQWEsQ0FBYixDQURZO0FBRWYsYUFBRyxhQUFhLENBQWI7QUFGWSxTQUFqQjtBQUlELE9BTkQsTUFNTztBQUNMLG9CQUFZLElBQVosQ0FBaUI7QUFDZixhQUFHLFFBQVEsQ0FBUixDQURZO0FBRWYsYUFBRyxRQUFRLENBQVI7QUFGWSxTQUFqQjtBQUlEO0FBQ0YsS0FiRDtBQWNEO0FBQ0QsU0FBTyxXQUFQO0FBQ0Q7Ozs7Ozs7O1FDcFllLGUsR0FBQSxlO1FBK0JBLG9CLEdBQUEsb0I7UUFTQSxjLEdBQUEsYztRQVlBLGdCLEdBQUEsZ0I7UUFLQSxnQixHQUFBLGdCO1FBdUNBLGUsR0FBQSxlO0FBbEdoQixJQUFNLFNBQVMsUUFBUSxnQkFBUixDQUFmOztBQUVPLFNBQVMsZUFBVCxHQUEyQjtBQUNoQyxNQUFJLGVBQWUsRUFBbkI7QUFDQSxNQUFNLGFBQWEsQ0FBQyxLQUFELEVBQVEsS0FBUixFQUFlLEtBQWYsRUFBc0IsS0FBdEIsQ0FBbkI7O0FBRUEsT0FBSyxJQUFMLENBQVUsT0FBTyxNQUFqQixFQUF5QixVQUFDLEtBQUQsRUFBUSxTQUFSLEVBQXNCO0FBQzdDO0FBQ0EsUUFBSSxNQUFNLE1BQVYsRUFBa0I7QUFDaEIsVUFBSSx5Q0FBdUMsU0FBdkMsU0FBb0QsU0FBcEQsVUFBSjtBQUNBLFFBQUUsT0FBRixDQUFVLGtCQUFWLEVBQThCLFVBQUMsSUFBRCxFQUFVO0FBQ3RDLFlBQUksaUJBQWlCLHFCQUFxQixTQUFyQixFQUFnQyxJQUFoQyxDQUFyQjtBQUNBLFlBQUksUUFBUSxJQUFJLElBQUosQ0FBUyxjQUFULENBQVo7QUFDQSxxQkFBYSxTQUFiLElBQTBCLEtBQTFCO0FBQ0QsT0FKRDtBQUtELEtBUEQsTUFPTztBQUNMO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLFVBQUksUUFBUSxJQUFJLElBQUosQ0FBUztBQUNuQixpQ0FBdUIsU0FBdkIsU0FBb0MsU0FBcEM7QUFEbUIsT0FBVCxDQUFaO0FBR0EsbUJBQWEsU0FBYixJQUEwQixLQUExQjtBQUNEO0FBQ0YsR0FyQkQ7O0FBdUJBLFNBQU8sWUFBUDtBQUVEOztBQUVNLFNBQVMsb0JBQVQsQ0FBOEIsU0FBOUIsRUFBeUMsSUFBekMsRUFBK0M7QUFDcEQsTUFBSSxhQUFhLEVBQWpCOztBQUVBLGFBQVcsR0FBWCxHQUFpQixLQUFLLElBQUwsQ0FBVSxHQUFWLENBQWMsVUFBQyxHQUFEO0FBQUEsK0JBQTJCLFNBQTNCLFNBQXdDLEdBQXhDO0FBQUEsR0FBZCxDQUFqQjtBQUNBLGFBQVcsTUFBWCxHQUFvQixLQUFLLE1BQXpCOztBQUVBLFNBQU8sVUFBUDtBQUNEOztBQUVNLFNBQVMsY0FBVCxDQUF3QixRQUF4QixFQUFrQztBQUN2QyxNQUFNLG1CQUFvQixLQUFLLE9BQU8sS0FBUCxDQUFhLEdBQTVDO0FBQ0EsTUFBTSxpQkFBaUIsS0FBSyxLQUFMLENBQVcsV0FBVyxnQkFBdEIsSUFBMEMsZ0JBQWpFOztBQUVBLE1BQUksaUJBQWlCLENBQXJCLEVBQXdCO0FBQ3RCLFdBQU8sY0FBUDtBQUNELEdBRkQsTUFFTztBQUNMO0FBQ0EsV0FBTyxnQkFBUDtBQUNEO0FBQ0Y7O0FBRU0sU0FBUyxnQkFBVCxDQUEwQixRQUExQixFQUFvQyxTQUFwQyxFQUErQztBQUNwRCxNQUFNLG1CQUFtQixhQUFhLElBQUksT0FBTyxLQUFQLENBQWEsUUFBOUIsQ0FBekI7QUFDQSxTQUFPLGlCQUFpQixLQUFLLEtBQUwsQ0FBVyxXQUFXLGdCQUF0QixJQUEwQyxnQkFBbEU7QUFDRDs7QUFFTSxTQUFTLGdCQUFULENBQTBCLFdBQTFCLEVBQXVDO0FBQzVDLE1BQU0sYUFBYyxLQUFLLE9BQU8sS0FBUCxDQUFhLEdBQW5CLEdBQTBCLElBQTdDO0FBQ0EsTUFBTSxnQkFBZ0IsYUFBYSxDQUFuQztBQUNBLE1BQU0sb0JBQW9CLGdCQUFnQixPQUFPLEtBQVAsQ0FBYSxRQUE3QixHQUF3QyxHQUFsRSxDQUg0QyxDQUcyQjs7QUFFdkUsV0FBUyxtQkFBVCxHQUErQjtBQUM3QixZQUFRLEdBQVIsQ0FBWSxRQUFaO0FBQ0EsU0FBSyxJQUFMLENBQVUsV0FBVixFQUF1QixVQUFDLEtBQUQsRUFBUSxDQUFSLEVBQWM7QUFDbkMsY0FBUSxHQUFSLENBQVksS0FBWjtBQUNBLFVBQUksTUFBTSxNQUFWLEVBQWtCO0FBQ2hCLG1CQUFXLFlBQU07QUFDZixrQkFBUSxHQUFSLG9CQUE2QixNQUFNLE9BQW5DO0FBQ0EsZ0JBQU0sS0FBTixDQUFZLElBQVosQ0FBaUIsSUFBakI7QUFDQSxnQkFBTSxLQUFOLENBQVksSUFBWixDQUFpQixNQUFNLFVBQXZCO0FBQ0QsU0FKRCxFQUlHLE1BQU0sU0FKVDs7QUFNQSxtQkFBVyxZQUFNO0FBQ2Ysa0JBQVEsR0FBUixxQkFBOEIsTUFBTSxPQUFwQztBQUNBLGdCQUFNLEtBQU4sQ0FBWSxJQUFaO0FBQ0QsU0FIRCxFQUdHLE1BQU0sU0FBTixHQUFrQixNQUFNLFFBSDNCO0FBSUQsT0FYRCxNQVdPO0FBQ0wsbUJBQVcsWUFBTTtBQUNmLGtCQUFRLEdBQVIsb0JBQTZCLE1BQU0sT0FBbkM7QUFDQSxnQkFBTSxLQUFOLENBQVksSUFBWixDQUFpQixJQUFqQjtBQUNBLGdCQUFNLEtBQU4sQ0FBWSxJQUFaO0FBQ0QsU0FKRCxFQUlHLE1BQU0sU0FKVDs7QUFNQSxtQkFBVyxZQUFNO0FBQ2Ysa0JBQVEsR0FBUixxQkFBOEIsTUFBTSxPQUFwQztBQUNBLGdCQUFNLEtBQU4sQ0FBWSxJQUFaO0FBQ0QsU0FIRCxFQUdHLE1BQU0sU0FBTixHQUFrQixNQUFNLFFBSDNCO0FBSUQ7QUFDRixLQXpCRDtBQTBCRDs7QUFFRDtBQUNBLFNBQU8sWUFBWSxtQkFBWixFQUFpQyxpQkFBakMsQ0FBUDtBQUNEOztBQUVNLFNBQVMsZUFBVCxDQUF5QixRQUF6QixFQUFtQztBQUN4QyxnQkFBYyxRQUFkO0FBQ0Q7Ozs7Ozs7Ozs7Ozs7UUNsR2UsRyxHQUFBLEc7UUFPQSxHLEdBQUEsRztRQUtBLEcsR0FBQSxHO1FBS0EsVSxHQUFBLFU7UUFLQSxLLEdBQUEsSztRQUtBLGtCLEdBQUEsa0I7UUFnQkEsUyxHQUFBLFM7UUFpREEsVSxHQUFBLFU7UUFvQkEsUSxHQUFBLFE7UUF3SkEsb0IsR0FBQSxvQjtRQWdCQSxTLEdBQUEsUztRQVVBLFEsR0FBQSxRO1FBS0EsWSxHQUFBLFk7UUFjQSxVLEdBQUEsVTtRQVVBLGEsR0FBQSxhO0FBalVoQixJQUFNLFNBQVMsUUFBUSxnQkFBUixDQUFmOztBQUVPLFNBQVMsR0FBVCxHQUF1QjtBQUM1QixNQUFJLE9BQU8sR0FBWCxFQUFnQjtBQUFBOztBQUNkLHlCQUFRLEdBQVI7QUFDRDtBQUNGOztBQUVEO0FBQ08sU0FBUyxHQUFULENBQWEsT0FBYixFQUFzQjtBQUMzQixTQUFPLFVBQVUsS0FBSyxFQUFmLEdBQW9CLEdBQTNCO0FBQ0Q7O0FBRUQ7QUFDTyxTQUFTLEdBQVQsQ0FBYSxPQUFiLEVBQXNCO0FBQzNCLFNBQU8sVUFBVSxHQUFWLEdBQWdCLEtBQUssRUFBNUI7QUFDRDs7QUFFRDtBQUNPLFNBQVMsVUFBVCxDQUFvQixDQUFwQixFQUF1QixDQUF2QixFQUEwQjtBQUMvQixTQUFPLEtBQUssR0FBTCxDQUFTLEtBQUssS0FBTCxDQUFXLEtBQUssR0FBTCxDQUFTLElBQUksQ0FBYixDQUFYLEVBQTRCLEtBQUssR0FBTCxDQUFTLElBQUksQ0FBYixDQUE1QixDQUFULENBQVAsQ0FBOEQ7QUFDL0Q7O0FBRUQ7QUFDTyxTQUFTLEtBQVQsQ0FBZSxFQUFmLEVBQW1CLEVBQW5CLEVBQXVCO0FBQzVCLFNBQU8sS0FBSyxJQUFMLENBQVUsS0FBSyxHQUFMLENBQVMsR0FBRyxDQUFILEdBQU8sR0FBRyxDQUFuQixFQUFzQixDQUF0QixJQUEyQixLQUFLLEdBQUwsQ0FBUyxHQUFHLENBQUgsR0FBTyxHQUFHLENBQW5CLEVBQXNCLENBQXRCLENBQXJDLENBQVAsQ0FENEIsQ0FDMkM7QUFDeEU7O0FBRUQ7QUFDTyxTQUFTLGtCQUFULENBQTRCLElBQTVCLEVBQWtDO0FBQ3ZDLE1BQUksaUJBQWlCLEVBQXJCO0FBQ0EsTUFBSSxDQUFDLElBQUQsSUFBUyxDQUFDLEtBQUssUUFBZixJQUEyQixDQUFDLEtBQUssUUFBTCxDQUFjLE1BQTlDLEVBQXNEOztBQUV0RCxPQUFLLElBQUksSUFBSSxDQUFiLEVBQWdCLElBQUksS0FBSyxRQUFMLENBQWMsTUFBbEMsRUFBMEMsR0FBMUMsRUFBK0M7QUFDN0MsUUFBSSxRQUFRLEtBQUssUUFBTCxDQUFjLENBQWQsQ0FBWjs7QUFFQSxRQUFJLE1BQU0sTUFBVixFQUFpQjtBQUNmLHFCQUFlLElBQWYsQ0FBb0IsSUFBSSxJQUFKLENBQVMsTUFBTSxRQUFmLENBQXBCO0FBQ0Q7QUFDRjs7QUFFRCxPQUFLLE1BQUw7QUFDQSxTQUFPLGNBQVA7QUFDRDs7QUFFTSxTQUFTLFNBQVQsQ0FBbUIsS0FBbkIsRUFBMEIsT0FBMUIsRUFBbUM7QUFDeEMsTUFBSSxTQUFTLE1BQU0sY0FBTixDQUFxQixNQUFyQixDQUE0QixDQUE1QixDQUFiO0FBQ0EsVUFBUSxHQUFSLENBQVksYUFBWixFQUEyQixRQUFRLE1BQW5DOztBQUVBLE1BQUksZ0JBQWdCLE9BQU8sZ0JBQVAsRUFBcEI7QUFDQSxNQUFJLGdCQUFnQixLQUFwQjs7QUFFQSxNQUFJLGFBQWEsT0FBTyxLQUFQLEVBQWpCO0FBQ0EsYUFBVyxPQUFYLEdBQXFCLEtBQXJCO0FBQ0E7O0FBRUEsTUFBSSxjQUFjLE1BQWQsR0FBdUIsQ0FBM0IsRUFBOEI7QUFLNUI7QUFMNEIsb0JBSUUsU0FBUyxVQUFULEVBQXFCLE1BQXJCLENBSkY7QUFDNUI7QUFDQTtBQUNBOzs7QUFINEI7O0FBSTNCLGNBSjJCO0FBSWYsaUJBSmU7QUFNN0IsR0FORCxNQU1PO0FBQ0w7QUFDQTtBQUNBO0FBQ0EsaUJBQWEsV0FBVyxVQUFYLENBQWI7QUFDQTtBQUNBLFFBQUksaUJBQWdCLFdBQVcsZ0JBQVgsRUFBcEI7QUFDQSxRQUFJLGVBQWMsTUFBZCxHQUF1QixDQUEzQixFQUE4QjtBQUc1QjtBQUg0Qix1QkFFRSxTQUFTLFVBQVQsRUFBcUIsTUFBckIsQ0FGRjtBQUM1Qjs7O0FBRDRCOztBQUUzQixnQkFGMkI7QUFFZixtQkFGZTtBQUk3QixLQUpELE1BSU87QUFDTDtBQUNBLG1CQUFhLHFCQUFxQixVQUFyQixDQUFiO0FBQ0E7QUFDRDtBQUNGOztBQUVELFVBQVEsR0FBUixDQUFZLGtCQUFaLEVBQWdDLE9BQU8sTUFBdkM7QUFDQSxVQUFRLEdBQVIsQ0FBWSxlQUFaLEVBQTZCLFdBQVcsTUFBeEM7O0FBRUEsYUFBVyxJQUFYLEdBQWtCLFFBQWxCLENBdEN3QyxDQXNDWjtBQUM1QixhQUFXLE9BQVgsR0FBcUIsSUFBckI7O0FBRUE7QUFDQTtBQUNBLFFBQU0sY0FBTixDQUFxQixNQUFyQixDQUE0QixDQUE1QixFQUErQixXQUEvQixDQUEyQyxVQUEzQzs7QUFHQSxTQUFPLENBQUMsS0FBRCxFQUFRLGFBQVIsQ0FBUDtBQUNEOztBQUVNLFNBQVMsVUFBVCxDQUFvQixJQUFwQixFQUEwQjtBQUMvQixNQUFJLEtBQUssTUFBTCxHQUFjLENBQWxCLEVBQXFCO0FBQ25CLFFBQU0sa0JBQWtCLE9BQU8sS0FBUCxDQUFhLGlCQUFiLEdBQWlDLEtBQUssTUFBOUQ7O0FBRUEsUUFBSSxlQUFlLEtBQUssWUFBeEI7QUFDQSxRQUFJLGNBQWMsYUFBYSxJQUEvQjtBQUNBLFFBQUksYUFBYSxLQUFLLEtBQUwsQ0FBVyxZQUFZLEtBQVosQ0FBa0IsQ0FBbEIsR0FBc0IsYUFBYSxLQUFiLENBQW1CLENBQXBELEVBQXVELFlBQVksS0FBWixDQUFrQixDQUFsQixHQUFzQixhQUFhLEtBQWIsQ0FBbUIsQ0FBaEcsQ0FBakIsQ0FMbUIsQ0FLa0c7QUFDckgsUUFBSSxvQkFBb0IsYUFBYSxLQUFLLEVBQTFDO0FBQ0EsUUFBSSxxQkFBcUIsSUFBSSxLQUFKLENBQVUsYUFBYSxLQUFiLENBQW1CLENBQW5CLEdBQXdCLEtBQUssR0FBTCxDQUFTLGlCQUFULElBQThCLGVBQWhFLEVBQWtGLGFBQWEsS0FBYixDQUFtQixDQUFuQixHQUF3QixLQUFLLEdBQUwsQ0FBUyxpQkFBVCxJQUE4QixlQUF4SSxDQUF6QjtBQUNBLFNBQUssTUFBTCxDQUFZLENBQVosRUFBZSxrQkFBZjs7QUFFQSxRQUFJLGNBQWMsS0FBSyxXQUF2QjtBQUNBLFFBQUksYUFBYSxZQUFZLFFBQTdCLENBWG1CLENBV29CO0FBQ3ZDLFFBQUksV0FBVyxLQUFLLEtBQUwsQ0FBVyxZQUFZLEtBQVosQ0FBa0IsQ0FBbEIsR0FBc0IsV0FBVyxLQUFYLENBQWlCLENBQWxELEVBQXFELFlBQVksS0FBWixDQUFrQixDQUFsQixHQUFzQixXQUFXLEtBQVgsQ0FBaUIsQ0FBNUYsQ0FBZixDQVptQixDQVk0RjtBQUMvRyxRQUFJLG1CQUFtQixJQUFJLEtBQUosQ0FBVSxZQUFZLEtBQVosQ0FBa0IsQ0FBbEIsR0FBdUIsS0FBSyxHQUFMLENBQVMsUUFBVCxJQUFxQixlQUF0RCxFQUF3RSxZQUFZLEtBQVosQ0FBa0IsQ0FBbEIsR0FBdUIsS0FBSyxHQUFMLENBQVMsUUFBVCxJQUFxQixlQUFwSCxDQUF2QjtBQUNBLFNBQUssR0FBTCxDQUFTLGdCQUFUO0FBQ0Q7QUFDRCxTQUFPLElBQVA7QUFDRDs7QUFFTSxTQUFTLFFBQVQsQ0FBa0IsSUFBbEIsRUFBd0IsUUFBeEIsRUFBa0M7QUFDdkM7QUFDQSxNQUFJO0FBQUE7QUFDRixVQUFJLGdCQUFnQixLQUFLLGdCQUFMLEVBQXBCO0FBQ0EsVUFBSSxjQUFjLEtBQUssZ0JBQUwsRUFBbEI7O0FBRUEsVUFBSSxjQUFjLE1BQWQsR0FBdUIsQ0FBM0IsRUFBOEI7QUFDNUI7QUFBQSxhQUFPLENBQUMsUUFBRCxFQUFXLEtBQVg7QUFBUCxVQUQ0QixDQUNGO0FBQzNCOztBQUVELFVBQU0scUJBQXFCLE9BQU8sS0FBUCxDQUFhLGtCQUF4QztBQUNBLFVBQU0sY0FBYyxLQUFLLE1BQXpCOztBQUVBO0FBQ0EsV0FBSyxJQUFMLENBQVUsWUFBWSxRQUF0QixFQUFnQyxVQUFDLEtBQUQsRUFBUSxDQUFSLEVBQWM7QUFDNUMsWUFBSSxNQUFNLE1BQVYsRUFBa0I7QUFDaEI7QUFDQSx3QkFBYyxZQUFZLFFBQVosQ0FBcUIsS0FBckIsQ0FBZDtBQUNELFNBSEQsTUFHTztBQUNMO0FBQ0Q7QUFDRixPQVBEOztBQVNBOztBQUVBLFVBQUksQ0FBQyxDQUFDLFlBQVksUUFBZCxJQUEwQixZQUFZLFFBQVosQ0FBcUIsTUFBckIsR0FBOEIsQ0FBNUQsRUFBK0Q7QUFBQTtBQUM3RDtBQUNBLGNBQUksb0JBQW9CLElBQUksSUFBSixFQUF4QjtBQUNBO0FBQ0E7QUFDQSxlQUFLLElBQUwsQ0FBVSxZQUFZLFFBQXRCLEVBQWdDLFVBQUMsS0FBRCxFQUFRLENBQVIsRUFBYztBQUM1QyxnQkFBSSxDQUFDLE1BQU0sTUFBWCxFQUFtQjtBQUNqQixrQ0FBb0Isa0JBQWtCLEtBQWxCLENBQXdCLEtBQXhCLENBQXBCO0FBQ0Q7QUFDRixXQUpEO0FBS0Esd0JBQWMsaUJBQWQ7QUFDQTtBQUNBO0FBWjZEO0FBYTlELE9BYkQsTUFhTztBQUNMO0FBQ0Q7O0FBRUQsVUFBSSxjQUFjLE1BQWQsR0FBdUIsQ0FBM0IsRUFBOEI7QUFDNUI7QUFDQSxZQUFJLG9CQUFvQixZQUFZLGtCQUFaLENBQStCLGNBQWMsQ0FBZCxFQUFpQixLQUFoRCxDQUF4QjtBQUNBO0FBQ0EsWUFBSSxPQUFPLFlBQVksT0FBWixDQUFvQixpQkFBcEIsQ0FBWCxDQUo0QixDQUl1QjtBQUNuRCxZQUFJLGVBQWUsV0FBbkI7QUFDQSxZQUFJLG9CQUFKOztBQUVBOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FBRUE7QUFDQSxZQUFJLGNBQWMsTUFBZCxHQUF1QixDQUEzQixFQUE4QjtBQUM1QjtBQUNBO0FBQ0EsY0FBSSxtQkFBbUIsS0FBSyxrQkFBTCxDQUF3QixjQUFjLGNBQWMsTUFBZCxHQUF1QixDQUFyQyxFQUF3QyxLQUFoRSxDQUF2QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSx3QkFBYyxLQUFLLE9BQUwsQ0FBYSxnQkFBYixDQUFkLENBVDRCLENBU2tCO0FBQzlDLGNBQUksQ0FBQyxXQUFELElBQWdCLENBQUMsWUFBWSxNQUFqQyxFQUF5QyxjQUFjLElBQWQ7QUFDekMsZUFBSyxPQUFMO0FBQ0QsU0FaRCxNQVlPO0FBQ0wsd0JBQWMsSUFBZDtBQUNEOztBQUVELFlBQUksQ0FBQyxDQUFDLFlBQUYsSUFBa0IsYUFBYSxNQUFiLElBQXVCLHFCQUFxQixXQUFsRSxFQUErRTtBQUM3RSxpQkFBTyxLQUFLLFFBQUwsQ0FBYyxZQUFkLENBQVA7QUFDQSxjQUFJLEtBQUssU0FBTCxLQUFtQixjQUF2QixFQUF1QztBQUNyQyxpQkFBSyxJQUFMLENBQVUsS0FBSyxRQUFmLEVBQXlCLFVBQUMsS0FBRCxFQUFRLENBQVIsRUFBYztBQUNyQyxrQkFBSSxDQUFDLE1BQU0sTUFBWCxFQUFtQjtBQUNqQixzQkFBTSxNQUFOO0FBQ0Q7QUFDRixhQUpEO0FBS0Q7QUFDRjs7QUFFRCxZQUFJLENBQUMsQ0FBQyxXQUFGLElBQWlCLFlBQVksTUFBWixJQUFzQixxQkFBcUIsV0FBaEUsRUFBNkU7QUFDM0UsaUJBQU8sS0FBSyxRQUFMLENBQWMsV0FBZCxDQUFQO0FBQ0EsY0FBSSxLQUFLLFNBQUwsS0FBbUIsY0FBdkIsRUFBdUM7QUFDckMsaUJBQUssSUFBTCxDQUFVLEtBQUssUUFBZixFQUF5QixVQUFDLEtBQUQsRUFBUSxDQUFSLEVBQWM7QUFDckMsa0JBQUksQ0FBQyxNQUFNLE1BQVgsRUFBbUI7QUFDakIsc0JBQU0sTUFBTjtBQUNEO0FBQ0YsYUFKRDtBQUtEO0FBQ0Y7QUFDRjs7QUFFRDtBQUNBO0FBQ0E7O0FBRUEsVUFBSSxLQUFLLFNBQUwsS0FBbUIsY0FBbkIsSUFBcUMsS0FBSyxRQUFMLENBQWMsTUFBZCxHQUF1QixDQUFoRSxFQUFtRTtBQUNqRSxZQUFJLEtBQUssUUFBTCxDQUFjLE1BQWQsR0FBdUIsQ0FBM0IsRUFBOEI7QUFBQTtBQUM1QixnQkFBSSxxQkFBSjtBQUNBLGdCQUFJLG1CQUFtQixDQUF2Qjs7QUFFQSxpQkFBSyxJQUFMLENBQVUsS0FBSyxRQUFmLEVBQXlCLFVBQUMsS0FBRCxFQUFRLENBQVIsRUFBYztBQUNyQyxrQkFBSSxNQUFNLElBQU4sR0FBYSxnQkFBakIsRUFBbUM7QUFDakMsbUNBQW1CLE1BQU0sSUFBekI7QUFDQSwrQkFBZSxLQUFmO0FBQ0Q7QUFDRixhQUxEOztBQU9BLGdCQUFJLFlBQUosRUFBa0I7QUFDaEIscUJBQU8sWUFBUDtBQUNELGFBRkQsTUFFTztBQUNMLHFCQUFPLEtBQUssUUFBTCxDQUFjLENBQWQsQ0FBUDtBQUNEO0FBZjJCO0FBZ0I3QixTQWhCRCxNQWdCTztBQUNMLGlCQUFPLEtBQUssUUFBTCxDQUFjLENBQWQsQ0FBUDtBQUNEO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Q7QUFDRCxVQUFJLGtCQUFKLEVBQXdCLFdBQXhCO0FBQ0EsVUFBSSxnQkFBSixFQUFzQixLQUFLLE1BQTNCO0FBQ0EsVUFBSSxLQUFLLEdBQUwsQ0FBUyxLQUFLLE1BQUwsR0FBYyxXQUF2QixJQUFzQyxXQUF0QyxJQUFxRCxJQUF6RCxFQUErRDtBQUM3RCxZQUFJLG9CQUFKO0FBQ0E7QUFBQSxhQUFPLENBQUMsUUFBRCxFQUFXLEtBQVg7QUFBUDtBQUNELE9BSEQsTUFHTztBQUNMO0FBQUEsYUFBTyxDQUFDLElBQUQsRUFBTyxJQUFQO0FBQVA7QUFDRDtBQS9JQzs7QUFBQTtBQWdKSCxHQWhKRCxDQWdKRSxPQUFNLENBQU4sRUFBUztBQUNULFlBQVEsS0FBUixDQUFjLENBQWQ7QUFDQSxXQUFPLENBQUMsUUFBRCxFQUFXLEtBQVgsQ0FBUDtBQUNEO0FBQ0Y7O0FBRU0sU0FBUyxvQkFBVCxDQUE4QixJQUE5QixFQUFvQztBQUN6QyxPQUFLLGFBQUwsQ0FBbUIsQ0FBbkI7QUFDQSxPQUFLLGFBQUwsQ0FBbUIsS0FBSyxRQUFMLENBQWMsTUFBZCxHQUF1QixDQUExQztBQUNBLFNBQU8sSUFBUDtBQUNEOztBQUVEO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUFFTyxTQUFTLFNBQVQsR0FBcUI7QUFDMUIsTUFBSSxTQUFTLE1BQU0sT0FBTixDQUFjLFFBQWQsQ0FBdUI7QUFDbEMsZUFBVyxPQUR1QjtBQUVsQyxXQUFPLGVBQVMsRUFBVCxFQUFhO0FBQ2xCLGFBQVEsQ0FBQyxDQUFDLEdBQUcsSUFBTCxJQUFhLEdBQUcsSUFBSCxDQUFRLE1BQTdCO0FBQ0Q7QUFKaUMsR0FBdkIsQ0FBYjtBQU1EOztBQUVEO0FBQ08sU0FBUyxRQUFULENBQWtCLElBQWxCLEVBQXdCLEtBQXhCLEVBQStCO0FBQ3BDLFNBQU8sRUFBRSxLQUFLLGdCQUFMLENBQXNCLEtBQXRCLEVBQTZCLE1BQTdCLEtBQXdDLENBQTFDLENBQVA7QUFDRDs7QUFFRDtBQUNPLFNBQVMsWUFBVCxDQUFzQixJQUF0QixFQUE0QixNQUE1QixFQUFvQztBQUN6QyxNQUFJLFVBQUo7QUFBQSxNQUFPLGVBQVA7QUFBQSxNQUFlLGNBQWY7QUFBQSxNQUFzQixjQUF0QjtBQUFBLE1BQTZCLFdBQTdCO0FBQUEsTUFBaUMsYUFBakM7QUFBQSxNQUF1QyxhQUF2QztBQUNBLE9BQUssSUFBSSxLQUFLLENBQVQsRUFBWSxPQUFPLE9BQU8sTUFBL0IsRUFBdUMsS0FBSyxJQUE1QyxFQUFrRCxJQUFJLEVBQUUsRUFBeEQsRUFBNEQ7QUFDMUQsWUFBUSxPQUFPLENBQVAsQ0FBUjtBQUNBLFFBQUksU0FBUyxJQUFULEVBQWUsS0FBZixDQUFKLEVBQTJCO0FBQ3pCLGNBQVEsS0FBSyxLQUFMLENBQVcsS0FBWCxDQUFSO0FBQ0EsZUFBUyxhQUFhLEtBQWIsRUFBb0IsT0FBTyxLQUFQLENBQWEsSUFBSSxDQUFqQixDQUFwQixDQUFUO0FBQ0EsYUFBTyxDQUFDLE9BQU8sT0FBTyxLQUFQLENBQWEsQ0FBYixFQUFnQixDQUFoQixDQUFSLEVBQTRCLE1BQTVCLENBQW1DLEtBQW5DLENBQXlDLElBQXpDLEVBQStDLE1BQS9DLENBQVA7QUFDRDtBQUNGO0FBQ0QsU0FBTyxPQUFPLE1BQVAsQ0FBYyxJQUFkLENBQVA7QUFDRDs7QUFFRDtBQUNPLFNBQVMsVUFBVCxDQUFvQixLQUFwQixFQUEyQjtBQUNoQyxNQUFJLElBQUosRUFBVSxNQUFWLEVBQWtCLEVBQWxCLEVBQXNCLElBQXRCO0FBQ0EsV0FBUyxFQUFUO0FBQ0EsT0FBSyxLQUFLLENBQUwsRUFBUSxPQUFPLE1BQU0sTUFBMUIsRUFBa0MsS0FBSyxJQUF2QyxFQUE2QyxJQUE3QyxFQUFtRDtBQUNqRCxXQUFPLE1BQU0sRUFBTixDQUFQO0FBQ0EsYUFBUyxhQUFhLElBQWIsRUFBbUIsTUFBbkIsQ0FBVDtBQUNEO0FBQ0QsU0FBTyxNQUFQO0FBQ0Q7O0FBRU0sU0FBUyxhQUFULENBQXVCLEtBQXZCLEVBQThCLFFBQTlCLEVBQXdDO0FBQzdDLE1BQUksQ0FBQyxLQUFMLEVBQVksT0FBTyxJQUFQOztBQUVaLE9BQUssSUFBSSxJQUFJLFNBQVMsTUFBVCxHQUFrQixDQUEvQixFQUFrQyxLQUFLLENBQXZDLEVBQTBDLEdBQTFDLEVBQStDO0FBQzdDLFFBQUksUUFBUSxTQUFTLENBQVQsQ0FBWjtBQUNBLFFBQUksU0FBUyxNQUFNLFlBQW5CO0FBQ0EsUUFBSSxNQUFNLFFBQU4sQ0FBZSxNQUFNLFlBQXJCLENBQUosRUFBd0M7QUFDdEMsYUFBTyxLQUFQO0FBQ0Q7QUFDRjs7QUFFRCxTQUFPLElBQVA7QUFDRCIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJleHBvcnRzLnBhbGV0dGUgPSB7XG4gIGNvbG9yczogW1wiIzIwMTcxQ1wiLCBcIiMxRTJBNDNcIiwgXCIjMjgzNzdEXCIsIFwiIzM1Mjc0N1wiLCBcIiNDQTJFMjZcIiwgXCIjOUEyQTFGXCIsIFwiI0RBNkMyNlwiLCBcIiM0NTMxMjFcIiwgXCIjOTE2QTQ3XCIsIFwiI0RBQUQyN1wiLCBcIiM3RjdEMzFcIixcIiMyQjVFMkVcIl0sXG4gIGNvbG9yTmFtZXM6IHtcbiAgICBcIiMyMDE3MUNcIjogXCJibGFja1wiLFxuICAgIFwiIzFFMkE0M1wiOiBcImJsdWVcIixcbiAgICBcIiMyODM3N0RcIjogXCJibHVlXCIsXG4gICAgXCIjMzUyNzQ3XCI6IFwiYmx1ZVwiLFxuICAgIFwiI0NBMkUyNlwiOiBcInJlZFwiLFxuICAgIFwiIzlBMkExRlwiOiBcInJlZFwiLFxuICAgIFwiI0RBNkMyNlwiOiBcIm9yYW5nZVwiLFxuICAgIFwiIzQ1MzEyMVwiOiBcImJyb3duXCIsXG4gICAgXCIjOTE2QTQ3XCI6IFwiYnJvd25cIixcbiAgICBcIiNEQUFEMjdcIjogXCJvcmFuZ2VcIixcbiAgICBcIiM3RjdEMzFcIjogXCJncmVlblwiLFxuICAgIFwiIzJCNUUyRVwiOiBcImdyZWVuXCJcbiAgfSxcbiAgcG9wczogW1wiIzAwQURFRlwiLCBcIiNGMjg1QTVcIiwgXCIjN0RDNTdGXCIsIFwiI0Y2RUIxNlwiLCBcIiNGNEVBRTBcIl0sXG4gIGNvbG9yU2l6ZTogMjAsXG4gIHNlbGVjdGVkQ29sb3JTaXplOiAzMFxufVxuXG5leHBvcnRzLnNoYXBlID0ge1xuICBleHRlbmRpbmdUaHJlc2hvbGQ6IDAuMSxcbiAgdHJpbW1pbmdUaHJlc2hvbGQ6IDAuMDc1LFxuICBjb3JuZXJUaHJlc2hvbGREZWc6IDMwXG59XG5cbmV4cG9ydHMuc2hhcGVzID0ge1xuICBcImxpbmVcIjoge1xuICAgIHNwcml0ZTogZmFsc2UsXG4gIH0sXG4gIFwiY2lyY2xlXCI6IHtcbiAgICBzcHJpdGU6IHRydWUsXG4gIH0sXG4gIFwic3F1YXJlXCI6IHtcbiAgICBzcHJpdGU6IHRydWUsXG4gIH0sXG4gIFwidHJpYW5nbGVcIjoge1xuICAgIHNwcml0ZTogZmFsc2UsXG4gIH0sXG4gIFwib3RoZXJcIjoge1xuICAgIHNwcml0ZTogZmFsc2UsXG4gIH1cbn07XG5cbmV4cG9ydHMubG9nID0gdHJ1ZTtcblxuZXhwb3J0cy5ydW5BbmltYXRpb25zID0gdHJ1ZTtcblxuZXhwb3J0cy5zb3VuZCA9IHtcbiAgYnBtOiAxNDAsXG4gIG1lYXN1cmVzOiA0XG59XG4iLCIvKiEgSGFtbWVyLkpTIC0gdjIuMC43IC0gMjAxNi0wNC0yMlxuICogaHR0cDovL2hhbW1lcmpzLmdpdGh1Yi5pby9cbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTYgSm9yaWsgVGFuZ2VsZGVyO1xuICogTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlICovXG4oZnVuY3Rpb24od2luZG93LCBkb2N1bWVudCwgZXhwb3J0TmFtZSwgdW5kZWZpbmVkKSB7XG4gICd1c2Ugc3RyaWN0JztcblxudmFyIFZFTkRPUl9QUkVGSVhFUyA9IFsnJywgJ3dlYmtpdCcsICdNb3onLCAnTVMnLCAnbXMnLCAnbyddO1xudmFyIFRFU1RfRUxFTUVOVCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuXG52YXIgVFlQRV9GVU5DVElPTiA9ICdmdW5jdGlvbic7XG5cbnZhciByb3VuZCA9IE1hdGgucm91bmQ7XG52YXIgYWJzID0gTWF0aC5hYnM7XG52YXIgbm93ID0gRGF0ZS5ub3c7XG5cbi8qKlxuICogc2V0IGEgdGltZW91dCB3aXRoIGEgZ2l2ZW4gc2NvcGVcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGZuXG4gKiBAcGFyYW0ge051bWJlcn0gdGltZW91dFxuICogQHBhcmFtIHtPYmplY3R9IGNvbnRleHRcbiAqIEByZXR1cm5zIHtudW1iZXJ9XG4gKi9cbmZ1bmN0aW9uIHNldFRpbWVvdXRDb250ZXh0KGZuLCB0aW1lb3V0LCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoYmluZEZuKGZuLCBjb250ZXh0KSwgdGltZW91dCk7XG59XG5cbi8qKlxuICogaWYgdGhlIGFyZ3VtZW50IGlzIGFuIGFycmF5LCB3ZSB3YW50IHRvIGV4ZWN1dGUgdGhlIGZuIG9uIGVhY2ggZW50cnlcbiAqIGlmIGl0IGFpbnQgYW4gYXJyYXkgd2UgZG9uJ3Qgd2FudCB0byBkbyBhIHRoaW5nLlxuICogdGhpcyBpcyB1c2VkIGJ5IGFsbCB0aGUgbWV0aG9kcyB0aGF0IGFjY2VwdCBhIHNpbmdsZSBhbmQgYXJyYXkgYXJndW1lbnQuXG4gKiBAcGFyYW0geyp8QXJyYXl9IGFyZ1xuICogQHBhcmFtIHtTdHJpbmd9IGZuXG4gKiBAcGFyYW0ge09iamVjdH0gW2NvbnRleHRdXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn1cbiAqL1xuZnVuY3Rpb24gaW52b2tlQXJyYXlBcmcoYXJnLCBmbiwgY29udGV4dCkge1xuICAgIGlmIChBcnJheS5pc0FycmF5KGFyZykpIHtcbiAgICAgICAgZWFjaChhcmcsIGNvbnRleHRbZm5dLCBjb250ZXh0KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn1cblxuLyoqXG4gKiB3YWxrIG9iamVjdHMgYW5kIGFycmF5c1xuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtGdW5jdGlvbn0gaXRlcmF0b3JcbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gKi9cbmZ1bmN0aW9uIGVhY2gob2JqLCBpdGVyYXRvciwgY29udGV4dCkge1xuICAgIHZhciBpO1xuXG4gICAgaWYgKCFvYmopIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmIChvYmouZm9yRWFjaCkge1xuICAgICAgICBvYmouZm9yRWFjaChpdGVyYXRvciwgY29udGV4dCk7XG4gICAgfSBlbHNlIGlmIChvYmoubGVuZ3RoICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgb2JqLmxlbmd0aCkge1xuICAgICAgICAgICAgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaik7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgICBmb3IgKGkgaW4gb2JqKSB7XG4gICAgICAgICAgICBvYmouaGFzT3duUHJvcGVydHkoaSkgJiYgaXRlcmF0b3IuY2FsbChjb250ZXh0LCBvYmpbaV0sIGksIG9iaik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbi8qKlxuICogd3JhcCBhIG1ldGhvZCB3aXRoIGEgZGVwcmVjYXRpb24gd2FybmluZyBhbmQgc3RhY2sgdHJhY2VcbiAqIEBwYXJhbSB7RnVuY3Rpb259IG1ldGhvZFxuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVcbiAqIEBwYXJhbSB7U3RyaW5nfSBtZXNzYWdlXG4gKiBAcmV0dXJucyB7RnVuY3Rpb259IEEgbmV3IGZ1bmN0aW9uIHdyYXBwaW5nIHRoZSBzdXBwbGllZCBtZXRob2QuXG4gKi9cbmZ1bmN0aW9uIGRlcHJlY2F0ZShtZXRob2QsIG5hbWUsIG1lc3NhZ2UpIHtcbiAgICB2YXIgZGVwcmVjYXRpb25NZXNzYWdlID0gJ0RFUFJFQ0FURUQgTUVUSE9EOiAnICsgbmFtZSArICdcXG4nICsgbWVzc2FnZSArICcgQVQgXFxuJztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBlID0gbmV3IEVycm9yKCdnZXQtc3RhY2stdHJhY2UnKTtcbiAgICAgICAgdmFyIHN0YWNrID0gZSAmJiBlLnN0YWNrID8gZS5zdGFjay5yZXBsYWNlKC9eW15cXChdKz9bXFxuJF0vZ20sICcnKVxuICAgICAgICAgICAgLnJlcGxhY2UoL15cXHMrYXRcXHMrL2dtLCAnJylcbiAgICAgICAgICAgIC5yZXBsYWNlKC9eT2JqZWN0Ljxhbm9ueW1vdXM+XFxzKlxcKC9nbSwgJ3thbm9ueW1vdXN9KClAJykgOiAnVW5rbm93biBTdGFjayBUcmFjZSc7XG5cbiAgICAgICAgdmFyIGxvZyA9IHdpbmRvdy5jb25zb2xlICYmICh3aW5kb3cuY29uc29sZS53YXJuIHx8IHdpbmRvdy5jb25zb2xlLmxvZyk7XG4gICAgICAgIGlmIChsb2cpIHtcbiAgICAgICAgICAgIGxvZy5jYWxsKHdpbmRvdy5jb25zb2xlLCBkZXByZWNhdGlvbk1lc3NhZ2UsIHN0YWNrKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbWV0aG9kLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbn1cblxuLyoqXG4gKiBleHRlbmQgb2JqZWN0LlxuICogbWVhbnMgdGhhdCBwcm9wZXJ0aWVzIGluIGRlc3Qgd2lsbCBiZSBvdmVyd3JpdHRlbiBieSB0aGUgb25lcyBpbiBzcmMuXG4gKiBAcGFyYW0ge09iamVjdH0gdGFyZ2V0XG4gKiBAcGFyYW0gey4uLk9iamVjdH0gb2JqZWN0c190b19hc3NpZ25cbiAqIEByZXR1cm5zIHtPYmplY3R9IHRhcmdldFxuICovXG52YXIgYXNzaWduO1xuaWYgKHR5cGVvZiBPYmplY3QuYXNzaWduICE9PSAnZnVuY3Rpb24nKSB7XG4gICAgYXNzaWduID0gZnVuY3Rpb24gYXNzaWduKHRhcmdldCkge1xuICAgICAgICBpZiAodGFyZ2V0ID09PSB1bmRlZmluZWQgfHwgdGFyZ2V0ID09PSBudWxsKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdDYW5ub3QgY29udmVydCB1bmRlZmluZWQgb3IgbnVsbCB0byBvYmplY3QnKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvdXRwdXQgPSBPYmplY3QodGFyZ2V0KTtcbiAgICAgICAgZm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8IGFyZ3VtZW50cy5sZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaW5kZXhdO1xuICAgICAgICAgICAgaWYgKHNvdXJjZSAhPT0gdW5kZWZpbmVkICYmIHNvdXJjZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGZvciAodmFyIG5leHRLZXkgaW4gc291cmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChzb3VyY2UuaGFzT3duUHJvcGVydHkobmV4dEtleSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG91dHB1dFtuZXh0S2V5XSA9IHNvdXJjZVtuZXh0S2V5XTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gb3V0cHV0O1xuICAgIH07XG59IGVsc2Uge1xuICAgIGFzc2lnbiA9IE9iamVjdC5hc3NpZ247XG59XG5cbi8qKlxuICogZXh0ZW5kIG9iamVjdC5cbiAqIG1lYW5zIHRoYXQgcHJvcGVydGllcyBpbiBkZXN0IHdpbGwgYmUgb3ZlcndyaXR0ZW4gYnkgdGhlIG9uZXMgaW4gc3JjLlxuICogQHBhcmFtIHtPYmplY3R9IGRlc3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBzcmNcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW21lcmdlPWZhbHNlXVxuICogQHJldHVybnMge09iamVjdH0gZGVzdFxuICovXG52YXIgZXh0ZW5kID0gZGVwcmVjYXRlKGZ1bmN0aW9uIGV4dGVuZChkZXN0LCBzcmMsIG1lcmdlKSB7XG4gICAgdmFyIGtleXMgPSBPYmplY3Qua2V5cyhzcmMpO1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAoaSA8IGtleXMubGVuZ3RoKSB7XG4gICAgICAgIGlmICghbWVyZ2UgfHwgKG1lcmdlICYmIGRlc3Rba2V5c1tpXV0gPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgICAgIGRlc3Rba2V5c1tpXV0gPSBzcmNba2V5c1tpXV07XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgIH1cbiAgICByZXR1cm4gZGVzdDtcbn0sICdleHRlbmQnLCAnVXNlIGBhc3NpZ25gLicpO1xuXG4vKipcbiAqIG1lcmdlIHRoZSB2YWx1ZXMgZnJvbSBzcmMgaW4gdGhlIGRlc3QuXG4gKiBtZWFucyB0aGF0IHByb3BlcnRpZXMgdGhhdCBleGlzdCBpbiBkZXN0IHdpbGwgbm90IGJlIG92ZXJ3cml0dGVuIGJ5IHNyY1xuICogQHBhcmFtIHtPYmplY3R9IGRlc3RcbiAqIEBwYXJhbSB7T2JqZWN0fSBzcmNcbiAqIEByZXR1cm5zIHtPYmplY3R9IGRlc3RcbiAqL1xudmFyIG1lcmdlID0gZGVwcmVjYXRlKGZ1bmN0aW9uIG1lcmdlKGRlc3QsIHNyYykge1xuICAgIHJldHVybiBleHRlbmQoZGVzdCwgc3JjLCB0cnVlKTtcbn0sICdtZXJnZScsICdVc2UgYGFzc2lnbmAuJyk7XG5cbi8qKlxuICogc2ltcGxlIGNsYXNzIGluaGVyaXRhbmNlXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBjaGlsZFxuICogQHBhcmFtIHtGdW5jdGlvbn0gYmFzZVxuICogQHBhcmFtIHtPYmplY3R9IFtwcm9wZXJ0aWVzXVxuICovXG5mdW5jdGlvbiBpbmhlcml0KGNoaWxkLCBiYXNlLCBwcm9wZXJ0aWVzKSB7XG4gICAgdmFyIGJhc2VQID0gYmFzZS5wcm90b3R5cGUsXG4gICAgICAgIGNoaWxkUDtcblxuICAgIGNoaWxkUCA9IGNoaWxkLnByb3RvdHlwZSA9IE9iamVjdC5jcmVhdGUoYmFzZVApO1xuICAgIGNoaWxkUC5jb25zdHJ1Y3RvciA9IGNoaWxkO1xuICAgIGNoaWxkUC5fc3VwZXIgPSBiYXNlUDtcblxuICAgIGlmIChwcm9wZXJ0aWVzKSB7XG4gICAgICAgIGFzc2lnbihjaGlsZFAsIHByb3BlcnRpZXMpO1xuICAgIH1cbn1cblxuLyoqXG4gKiBzaW1wbGUgZnVuY3Rpb24gYmluZFxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm5cbiAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0XG4gKiBAcmV0dXJucyB7RnVuY3Rpb259XG4gKi9cbmZ1bmN0aW9uIGJpbmRGbihmbiwgY29udGV4dCkge1xuICAgIHJldHVybiBmdW5jdGlvbiBib3VuZEZuKCkge1xuICAgICAgICByZXR1cm4gZm4uYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgICB9O1xufVxuXG4vKipcbiAqIGxldCBhIGJvb2xlYW4gdmFsdWUgYWxzbyBiZSBhIGZ1bmN0aW9uIHRoYXQgbXVzdCByZXR1cm4gYSBib29sZWFuXG4gKiB0aGlzIGZpcnN0IGl0ZW0gaW4gYXJncyB3aWxsIGJlIHVzZWQgYXMgdGhlIGNvbnRleHRcbiAqIEBwYXJhbSB7Qm9vbGVhbnxGdW5jdGlvbn0gdmFsXG4gKiBAcGFyYW0ge0FycmF5fSBbYXJnc11cbiAqIEByZXR1cm5zIHtCb29sZWFufVxuICovXG5mdW5jdGlvbiBib29sT3JGbih2YWwsIGFyZ3MpIHtcbiAgICBpZiAodHlwZW9mIHZhbCA9PSBUWVBFX0ZVTkNUSU9OKSB7XG4gICAgICAgIHJldHVybiB2YWwuYXBwbHkoYXJncyA/IGFyZ3NbMF0gfHwgdW5kZWZpbmVkIDogdW5kZWZpbmVkLCBhcmdzKTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbDtcbn1cblxuLyoqXG4gKiB1c2UgdGhlIHZhbDIgd2hlbiB2YWwxIGlzIHVuZGVmaW5lZFxuICogQHBhcmFtIHsqfSB2YWwxXG4gKiBAcGFyYW0geyp9IHZhbDJcbiAqIEByZXR1cm5zIHsqfVxuICovXG5mdW5jdGlvbiBpZlVuZGVmaW5lZCh2YWwxLCB2YWwyKSB7XG4gICAgcmV0dXJuICh2YWwxID09PSB1bmRlZmluZWQpID8gdmFsMiA6IHZhbDE7XG59XG5cbi8qKlxuICogYWRkRXZlbnRMaXN0ZW5lciB3aXRoIG11bHRpcGxlIGV2ZW50cyBhdCBvbmNlXG4gKiBAcGFyYW0ge0V2ZW50VGFyZ2V0fSB0YXJnZXRcbiAqIEBwYXJhbSB7U3RyaW5nfSB0eXBlc1xuICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICovXG5mdW5jdGlvbiBhZGRFdmVudExpc3RlbmVycyh0YXJnZXQsIHR5cGVzLCBoYW5kbGVyKSB7XG4gICAgZWFjaChzcGxpdFN0cih0eXBlcyksIGZ1bmN0aW9uKHR5cGUpIHtcbiAgICAgICAgdGFyZ2V0LmFkZEV2ZW50TGlzdGVuZXIodHlwZSwgaGFuZGxlciwgZmFsc2UpO1xuICAgIH0pO1xufVxuXG4vKipcbiAqIHJlbW92ZUV2ZW50TGlzdGVuZXIgd2l0aCBtdWx0aXBsZSBldmVudHMgYXQgb25jZVxuICogQHBhcmFtIHtFdmVudFRhcmdldH0gdGFyZ2V0XG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZXNcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGhhbmRsZXJcbiAqL1xuZnVuY3Rpb24gcmVtb3ZlRXZlbnRMaXN0ZW5lcnModGFyZ2V0LCB0eXBlcywgaGFuZGxlcikge1xuICAgIGVhY2goc3BsaXRTdHIodHlwZXMpLCBmdW5jdGlvbih0eXBlKSB7XG4gICAgICAgIHRhcmdldC5yZW1vdmVFdmVudExpc3RlbmVyKHR5cGUsIGhhbmRsZXIsIGZhbHNlKTtcbiAgICB9KTtcbn1cblxuLyoqXG4gKiBmaW5kIGlmIGEgbm9kZSBpcyBpbiB0aGUgZ2l2ZW4gcGFyZW50XG4gKiBAbWV0aG9kIGhhc1BhcmVudFxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gbm9kZVxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gcGFyZW50XG4gKiBAcmV0dXJuIHtCb29sZWFufSBmb3VuZFxuICovXG5mdW5jdGlvbiBoYXNQYXJlbnQobm9kZSwgcGFyZW50KSB7XG4gICAgd2hpbGUgKG5vZGUpIHtcbiAgICAgICAgaWYgKG5vZGUgPT0gcGFyZW50KSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgICAgICBub2RlID0gbm9kZS5wYXJlbnROb2RlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbi8qKlxuICogc21hbGwgaW5kZXhPZiB3cmFwcGVyXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcGFyYW0ge1N0cmluZ30gZmluZFxuICogQHJldHVybnMge0Jvb2xlYW59IGZvdW5kXG4gKi9cbmZ1bmN0aW9uIGluU3RyKHN0ciwgZmluZCkge1xuICAgIHJldHVybiBzdHIuaW5kZXhPZihmaW5kKSA+IC0xO1xufVxuXG4vKipcbiAqIHNwbGl0IHN0cmluZyBvbiB3aGl0ZXNwYWNlXG4gKiBAcGFyYW0ge1N0cmluZ30gc3RyXG4gKiBAcmV0dXJucyB7QXJyYXl9IHdvcmRzXG4gKi9cbmZ1bmN0aW9uIHNwbGl0U3RyKHN0cikge1xuICAgIHJldHVybiBzdHIudHJpbSgpLnNwbGl0KC9cXHMrL2cpO1xufVxuXG4vKipcbiAqIGZpbmQgaWYgYSBhcnJheSBjb250YWlucyB0aGUgb2JqZWN0IHVzaW5nIGluZGV4T2Ygb3IgYSBzaW1wbGUgcG9seUZpbGxcbiAqIEBwYXJhbSB7QXJyYXl9IHNyY1xuICogQHBhcmFtIHtTdHJpbmd9IGZpbmRcbiAqIEBwYXJhbSB7U3RyaW5nfSBbZmluZEJ5S2V5XVxuICogQHJldHVybiB7Qm9vbGVhbnxOdW1iZXJ9IGZhbHNlIHdoZW4gbm90IGZvdW5kLCBvciB0aGUgaW5kZXhcbiAqL1xuZnVuY3Rpb24gaW5BcnJheShzcmMsIGZpbmQsIGZpbmRCeUtleSkge1xuICAgIGlmIChzcmMuaW5kZXhPZiAmJiAhZmluZEJ5S2V5KSB7XG4gICAgICAgIHJldHVybiBzcmMuaW5kZXhPZihmaW5kKTtcbiAgICB9IGVsc2Uge1xuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgc3JjLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKChmaW5kQnlLZXkgJiYgc3JjW2ldW2ZpbmRCeUtleV0gPT0gZmluZCkgfHwgKCFmaW5kQnlLZXkgJiYgc3JjW2ldID09PSBmaW5kKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG59XG5cbi8qKlxuICogY29udmVydCBhcnJheS1saWtlIG9iamVjdHMgdG8gcmVhbCBhcnJheXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvYmpcbiAqIEByZXR1cm5zIHtBcnJheX1cbiAqL1xuZnVuY3Rpb24gdG9BcnJheShvYmopIHtcbiAgICByZXR1cm4gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwob2JqLCAwKTtcbn1cblxuLyoqXG4gKiB1bmlxdWUgYXJyYXkgd2l0aCBvYmplY3RzIGJhc2VkIG9uIGEga2V5IChsaWtlICdpZCcpIG9yIGp1c3QgYnkgdGhlIGFycmF5J3MgdmFsdWVcbiAqIEBwYXJhbSB7QXJyYXl9IHNyYyBbe2lkOjF9LHtpZDoyfSx7aWQ6MX1dXG4gKiBAcGFyYW0ge1N0cmluZ30gW2tleV1cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gW3NvcnQ9RmFsc2VdXG4gKiBAcmV0dXJucyB7QXJyYXl9IFt7aWQ6MX0se2lkOjJ9XVxuICovXG5mdW5jdGlvbiB1bmlxdWVBcnJheShzcmMsIGtleSwgc29ydCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgdmFyIHZhbHVlcyA9IFtdO1xuICAgIHZhciBpID0gMDtcblxuICAgIHdoaWxlIChpIDwgc3JjLmxlbmd0aCkge1xuICAgICAgICB2YXIgdmFsID0ga2V5ID8gc3JjW2ldW2tleV0gOiBzcmNbaV07XG4gICAgICAgIGlmIChpbkFycmF5KHZhbHVlcywgdmFsKSA8IDApIHtcbiAgICAgICAgICAgIHJlc3VsdHMucHVzaChzcmNbaV0pO1xuICAgICAgICB9XG4gICAgICAgIHZhbHVlc1tpXSA9IHZhbDtcbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIGlmIChzb3J0KSB7XG4gICAgICAgIGlmICgha2V5KSB7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5zb3J0KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXN1bHRzID0gcmVzdWx0cy5zb3J0KGZ1bmN0aW9uIHNvcnRVbmlxdWVBcnJheShhLCBiKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFba2V5XSA+IGJba2V5XTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlc3VsdHM7XG59XG5cbi8qKlxuICogZ2V0IHRoZSBwcmVmaXhlZCBwcm9wZXJ0eVxuICogQHBhcmFtIHtPYmplY3R9IG9ialxuICogQHBhcmFtIHtTdHJpbmd9IHByb3BlcnR5XG4gKiBAcmV0dXJucyB7U3RyaW5nfFVuZGVmaW5lZH0gcHJlZml4ZWRcbiAqL1xuZnVuY3Rpb24gcHJlZml4ZWQob2JqLCBwcm9wZXJ0eSkge1xuICAgIHZhciBwcmVmaXgsIHByb3A7XG4gICAgdmFyIGNhbWVsUHJvcCA9IHByb3BlcnR5WzBdLnRvVXBwZXJDYXNlKCkgKyBwcm9wZXJ0eS5zbGljZSgxKTtcblxuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAoaSA8IFZFTkRPUl9QUkVGSVhFUy5sZW5ndGgpIHtcbiAgICAgICAgcHJlZml4ID0gVkVORE9SX1BSRUZJWEVTW2ldO1xuICAgICAgICBwcm9wID0gKHByZWZpeCkgPyBwcmVmaXggKyBjYW1lbFByb3AgOiBwcm9wZXJ0eTtcblxuICAgICAgICBpZiAocHJvcCBpbiBvYmopIHtcbiAgICAgICAgICAgIHJldHVybiBwcm9wO1xuICAgICAgICB9XG4gICAgICAgIGkrKztcbiAgICB9XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn1cblxuLyoqXG4gKiBnZXQgYSB1bmlxdWUgaWRcbiAqIEByZXR1cm5zIHtudW1iZXJ9IHVuaXF1ZUlkXG4gKi9cbnZhciBfdW5pcXVlSWQgPSAxO1xuZnVuY3Rpb24gdW5pcXVlSWQoKSB7XG4gICAgcmV0dXJuIF91bmlxdWVJZCsrO1xufVxuXG4vKipcbiAqIGdldCB0aGUgd2luZG93IG9iamVjdCBvZiBhbiBlbGVtZW50XG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gKiBAcmV0dXJucyB7RG9jdW1lbnRWaWV3fFdpbmRvd31cbiAqL1xuZnVuY3Rpb24gZ2V0V2luZG93Rm9yRWxlbWVudChlbGVtZW50KSB7XG4gICAgdmFyIGRvYyA9IGVsZW1lbnQub3duZXJEb2N1bWVudCB8fCBlbGVtZW50O1xuICAgIHJldHVybiAoZG9jLmRlZmF1bHRWaWV3IHx8IGRvYy5wYXJlbnRXaW5kb3cgfHwgd2luZG93KTtcbn1cblxudmFyIE1PQklMRV9SRUdFWCA9IC9tb2JpbGV8dGFibGV0fGlwKGFkfGhvbmV8b2QpfGFuZHJvaWQvaTtcblxudmFyIFNVUFBPUlRfVE9VQ0ggPSAoJ29udG91Y2hzdGFydCcgaW4gd2luZG93KTtcbnZhciBTVVBQT1JUX1BPSU5URVJfRVZFTlRTID0gcHJlZml4ZWQod2luZG93LCAnUG9pbnRlckV2ZW50JykgIT09IHVuZGVmaW5lZDtcbnZhciBTVVBQT1JUX09OTFlfVE9VQ0ggPSBTVVBQT1JUX1RPVUNIICYmIE1PQklMRV9SRUdFWC50ZXN0KG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG52YXIgSU5QVVRfVFlQRV9UT1VDSCA9ICd0b3VjaCc7XG52YXIgSU5QVVRfVFlQRV9QRU4gPSAncGVuJztcbnZhciBJTlBVVF9UWVBFX01PVVNFID0gJ21vdXNlJztcbnZhciBJTlBVVF9UWVBFX0tJTkVDVCA9ICdraW5lY3QnO1xuXG52YXIgQ09NUFVURV9JTlRFUlZBTCA9IDI1O1xuXG52YXIgSU5QVVRfU1RBUlQgPSAxO1xudmFyIElOUFVUX01PVkUgPSAyO1xudmFyIElOUFVUX0VORCA9IDQ7XG52YXIgSU5QVVRfQ0FOQ0VMID0gODtcblxudmFyIERJUkVDVElPTl9OT05FID0gMTtcbnZhciBESVJFQ1RJT05fTEVGVCA9IDI7XG52YXIgRElSRUNUSU9OX1JJR0hUID0gNDtcbnZhciBESVJFQ1RJT05fVVAgPSA4O1xudmFyIERJUkVDVElPTl9ET1dOID0gMTY7XG5cbnZhciBESVJFQ1RJT05fSE9SSVpPTlRBTCA9IERJUkVDVElPTl9MRUZUIHwgRElSRUNUSU9OX1JJR0hUO1xudmFyIERJUkVDVElPTl9WRVJUSUNBTCA9IERJUkVDVElPTl9VUCB8IERJUkVDVElPTl9ET1dOO1xudmFyIERJUkVDVElPTl9BTEwgPSBESVJFQ1RJT05fSE9SSVpPTlRBTCB8IERJUkVDVElPTl9WRVJUSUNBTDtcblxudmFyIFBST1BTX1hZID0gWyd4JywgJ3knXTtcbnZhciBQUk9QU19DTElFTlRfWFkgPSBbJ2NsaWVudFgnLCAnY2xpZW50WSddO1xuXG4vKipcbiAqIGNyZWF0ZSBuZXcgaW5wdXQgdHlwZSBtYW5hZ2VyXG4gKiBAcGFyYW0ge01hbmFnZXJ9IG1hbmFnZXJcbiAqIEBwYXJhbSB7RnVuY3Rpb259IGNhbGxiYWNrXG4gKiBAcmV0dXJucyB7SW5wdXR9XG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gSW5wdXQobWFuYWdlciwgY2FsbGJhY2spIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgdGhpcy5tYW5hZ2VyID0gbWFuYWdlcjtcbiAgICB0aGlzLmNhbGxiYWNrID0gY2FsbGJhY2s7XG4gICAgdGhpcy5lbGVtZW50ID0gbWFuYWdlci5lbGVtZW50O1xuICAgIHRoaXMudGFyZ2V0ID0gbWFuYWdlci5vcHRpb25zLmlucHV0VGFyZ2V0O1xuXG4gICAgLy8gc21hbGxlciB3cmFwcGVyIGFyb3VuZCB0aGUgaGFuZGxlciwgZm9yIHRoZSBzY29wZSBhbmQgdGhlIGVuYWJsZWQgc3RhdGUgb2YgdGhlIG1hbmFnZXIsXG4gICAgLy8gc28gd2hlbiBkaXNhYmxlZCB0aGUgaW5wdXQgZXZlbnRzIGFyZSBjb21wbGV0ZWx5IGJ5cGFzc2VkLlxuICAgIHRoaXMuZG9tSGFuZGxlciA9IGZ1bmN0aW9uKGV2KSB7XG4gICAgICAgIGlmIChib29sT3JGbihtYW5hZ2VyLm9wdGlvbnMuZW5hYmxlLCBbbWFuYWdlcl0pKSB7XG4gICAgICAgICAgICBzZWxmLmhhbmRsZXIoZXYpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIHRoaXMuaW5pdCgpO1xuXG59XG5cbklucHV0LnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBzaG91bGQgaGFuZGxlIHRoZSBpbnB1dEV2ZW50IGRhdGEgYW5kIHRyaWdnZXIgdGhlIGNhbGxiYWNrXG4gICAgICogQHZpcnR1YWxcbiAgICAgKi9cbiAgICBoYW5kbGVyOiBmdW5jdGlvbigpIHsgfSxcblxuICAgIC8qKlxuICAgICAqIGJpbmQgdGhlIGV2ZW50c1xuICAgICAqL1xuICAgIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmV2RWwgJiYgYWRkRXZlbnRMaXN0ZW5lcnModGhpcy5lbGVtZW50LCB0aGlzLmV2RWwsIHRoaXMuZG9tSGFuZGxlcik7XG4gICAgICAgIHRoaXMuZXZUYXJnZXQgJiYgYWRkRXZlbnRMaXN0ZW5lcnModGhpcy50YXJnZXQsIHRoaXMuZXZUYXJnZXQsIHRoaXMuZG9tSGFuZGxlcik7XG4gICAgICAgIHRoaXMuZXZXaW4gJiYgYWRkRXZlbnRMaXN0ZW5lcnMoZ2V0V2luZG93Rm9yRWxlbWVudCh0aGlzLmVsZW1lbnQpLCB0aGlzLmV2V2luLCB0aGlzLmRvbUhhbmRsZXIpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiB1bmJpbmQgdGhlIGV2ZW50c1xuICAgICAqL1xuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmV2RWwgJiYgcmVtb3ZlRXZlbnRMaXN0ZW5lcnModGhpcy5lbGVtZW50LCB0aGlzLmV2RWwsIHRoaXMuZG9tSGFuZGxlcik7XG4gICAgICAgIHRoaXMuZXZUYXJnZXQgJiYgcmVtb3ZlRXZlbnRMaXN0ZW5lcnModGhpcy50YXJnZXQsIHRoaXMuZXZUYXJnZXQsIHRoaXMuZG9tSGFuZGxlcik7XG4gICAgICAgIHRoaXMuZXZXaW4gJiYgcmVtb3ZlRXZlbnRMaXN0ZW5lcnMoZ2V0V2luZG93Rm9yRWxlbWVudCh0aGlzLmVsZW1lbnQpLCB0aGlzLmV2V2luLCB0aGlzLmRvbUhhbmRsZXIpO1xuICAgIH1cbn07XG5cbi8qKlxuICogY3JlYXRlIG5ldyBpbnB1dCB0eXBlIG1hbmFnZXJcbiAqIGNhbGxlZCBieSB0aGUgTWFuYWdlciBjb25zdHJ1Y3RvclxuICogQHBhcmFtIHtIYW1tZXJ9IG1hbmFnZXJcbiAqIEByZXR1cm5zIHtJbnB1dH1cbiAqL1xuZnVuY3Rpb24gY3JlYXRlSW5wdXRJbnN0YW5jZShtYW5hZ2VyKSB7XG4gICAgdmFyIFR5cGU7XG4gICAgdmFyIGlucHV0Q2xhc3MgPSBtYW5hZ2VyLm9wdGlvbnMuaW5wdXRDbGFzcztcblxuICAgIGlmIChpbnB1dENsYXNzKSB7XG4gICAgICAgIFR5cGUgPSBpbnB1dENsYXNzO1xuICAgIH0gZWxzZSBpZiAoU1VQUE9SVF9QT0lOVEVSX0VWRU5UUykge1xuICAgICAgICBUeXBlID0gUG9pbnRlckV2ZW50SW5wdXQ7XG4gICAgfSBlbHNlIGlmIChTVVBQT1JUX09OTFlfVE9VQ0gpIHtcbiAgICAgICAgVHlwZSA9IFRvdWNoSW5wdXQ7XG4gICAgfSBlbHNlIGlmICghU1VQUE9SVF9UT1VDSCkge1xuICAgICAgICBUeXBlID0gTW91c2VJbnB1dDtcbiAgICB9IGVsc2Uge1xuICAgICAgICBUeXBlID0gVG91Y2hNb3VzZUlucHV0O1xuICAgIH1cbiAgICByZXR1cm4gbmV3IChUeXBlKShtYW5hZ2VyLCBpbnB1dEhhbmRsZXIpO1xufVxuXG4vKipcbiAqIGhhbmRsZSBpbnB1dCBldmVudHNcbiAqIEBwYXJhbSB7TWFuYWdlcn0gbWFuYWdlclxuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50VHlwZVxuICogQHBhcmFtIHtPYmplY3R9IGlucHV0XG4gKi9cbmZ1bmN0aW9uIGlucHV0SGFuZGxlcihtYW5hZ2VyLCBldmVudFR5cGUsIGlucHV0KSB7XG4gICAgdmFyIHBvaW50ZXJzTGVuID0gaW5wdXQucG9pbnRlcnMubGVuZ3RoO1xuICAgIHZhciBjaGFuZ2VkUG9pbnRlcnNMZW4gPSBpbnB1dC5jaGFuZ2VkUG9pbnRlcnMubGVuZ3RoO1xuICAgIHZhciBpc0ZpcnN0ID0gKGV2ZW50VHlwZSAmIElOUFVUX1NUQVJUICYmIChwb2ludGVyc0xlbiAtIGNoYW5nZWRQb2ludGVyc0xlbiA9PT0gMCkpO1xuICAgIHZhciBpc0ZpbmFsID0gKGV2ZW50VHlwZSAmIChJTlBVVF9FTkQgfCBJTlBVVF9DQU5DRUwpICYmIChwb2ludGVyc0xlbiAtIGNoYW5nZWRQb2ludGVyc0xlbiA9PT0gMCkpO1xuXG4gICAgaW5wdXQuaXNGaXJzdCA9ICEhaXNGaXJzdDtcbiAgICBpbnB1dC5pc0ZpbmFsID0gISFpc0ZpbmFsO1xuXG4gICAgaWYgKGlzRmlyc3QpIHtcbiAgICAgICAgbWFuYWdlci5zZXNzaW9uID0ge307XG4gICAgfVxuXG4gICAgLy8gc291cmNlIGV2ZW50IGlzIHRoZSBub3JtYWxpemVkIHZhbHVlIG9mIHRoZSBkb21FdmVudHNcbiAgICAvLyBsaWtlICd0b3VjaHN0YXJ0LCBtb3VzZXVwLCBwb2ludGVyZG93bidcbiAgICBpbnB1dC5ldmVudFR5cGUgPSBldmVudFR5cGU7XG5cbiAgICAvLyBjb21wdXRlIHNjYWxlLCByb3RhdGlvbiBldGNcbiAgICBjb21wdXRlSW5wdXREYXRhKG1hbmFnZXIsIGlucHV0KTtcblxuICAgIC8vIGVtaXQgc2VjcmV0IGV2ZW50XG4gICAgbWFuYWdlci5lbWl0KCdoYW1tZXIuaW5wdXQnLCBpbnB1dCk7XG5cbiAgICBtYW5hZ2VyLnJlY29nbml6ZShpbnB1dCk7XG4gICAgbWFuYWdlci5zZXNzaW9uLnByZXZJbnB1dCA9IGlucHV0O1xufVxuXG4vKipcbiAqIGV4dGVuZCB0aGUgZGF0YSB3aXRoIHNvbWUgdXNhYmxlIHByb3BlcnRpZXMgbGlrZSBzY2FsZSwgcm90YXRlLCB2ZWxvY2l0eSBldGNcbiAqIEBwYXJhbSB7T2JqZWN0fSBtYW5hZ2VyXG4gKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAqL1xuZnVuY3Rpb24gY29tcHV0ZUlucHV0RGF0YShtYW5hZ2VyLCBpbnB1dCkge1xuICAgIHZhciBzZXNzaW9uID0gbWFuYWdlci5zZXNzaW9uO1xuICAgIHZhciBwb2ludGVycyA9IGlucHV0LnBvaW50ZXJzO1xuICAgIHZhciBwb2ludGVyc0xlbmd0aCA9IHBvaW50ZXJzLmxlbmd0aDtcblxuICAgIC8vIHN0b3JlIHRoZSBmaXJzdCBpbnB1dCB0byBjYWxjdWxhdGUgdGhlIGRpc3RhbmNlIGFuZCBkaXJlY3Rpb25cbiAgICBpZiAoIXNlc3Npb24uZmlyc3RJbnB1dCkge1xuICAgICAgICBzZXNzaW9uLmZpcnN0SW5wdXQgPSBzaW1wbGVDbG9uZUlucHV0RGF0YShpbnB1dCk7XG4gICAgfVxuXG4gICAgLy8gdG8gY29tcHV0ZSBzY2FsZSBhbmQgcm90YXRpb24gd2UgbmVlZCB0byBzdG9yZSB0aGUgbXVsdGlwbGUgdG91Y2hlc1xuICAgIGlmIChwb2ludGVyc0xlbmd0aCA+IDEgJiYgIXNlc3Npb24uZmlyc3RNdWx0aXBsZSkge1xuICAgICAgICBzZXNzaW9uLmZpcnN0TXVsdGlwbGUgPSBzaW1wbGVDbG9uZUlucHV0RGF0YShpbnB1dCk7XG4gICAgfSBlbHNlIGlmIChwb2ludGVyc0xlbmd0aCA9PT0gMSkge1xuICAgICAgICBzZXNzaW9uLmZpcnN0TXVsdGlwbGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICB2YXIgZmlyc3RJbnB1dCA9IHNlc3Npb24uZmlyc3RJbnB1dDtcbiAgICB2YXIgZmlyc3RNdWx0aXBsZSA9IHNlc3Npb24uZmlyc3RNdWx0aXBsZTtcbiAgICB2YXIgb2Zmc2V0Q2VudGVyID0gZmlyc3RNdWx0aXBsZSA/IGZpcnN0TXVsdGlwbGUuY2VudGVyIDogZmlyc3RJbnB1dC5jZW50ZXI7XG5cbiAgICB2YXIgY2VudGVyID0gaW5wdXQuY2VudGVyID0gZ2V0Q2VudGVyKHBvaW50ZXJzKTtcbiAgICBpbnB1dC50aW1lU3RhbXAgPSBub3coKTtcbiAgICBpbnB1dC5kZWx0YVRpbWUgPSBpbnB1dC50aW1lU3RhbXAgLSBmaXJzdElucHV0LnRpbWVTdGFtcDtcblxuICAgIGlucHV0LmFuZ2xlID0gZ2V0QW5nbGUob2Zmc2V0Q2VudGVyLCBjZW50ZXIpO1xuICAgIGlucHV0LmRpc3RhbmNlID0gZ2V0RGlzdGFuY2Uob2Zmc2V0Q2VudGVyLCBjZW50ZXIpO1xuXG4gICAgY29tcHV0ZURlbHRhWFkoc2Vzc2lvbiwgaW5wdXQpO1xuICAgIGlucHV0Lm9mZnNldERpcmVjdGlvbiA9IGdldERpcmVjdGlvbihpbnB1dC5kZWx0YVgsIGlucHV0LmRlbHRhWSk7XG5cbiAgICB2YXIgb3ZlcmFsbFZlbG9jaXR5ID0gZ2V0VmVsb2NpdHkoaW5wdXQuZGVsdGFUaW1lLCBpbnB1dC5kZWx0YVgsIGlucHV0LmRlbHRhWSk7XG4gICAgaW5wdXQub3ZlcmFsbFZlbG9jaXR5WCA9IG92ZXJhbGxWZWxvY2l0eS54O1xuICAgIGlucHV0Lm92ZXJhbGxWZWxvY2l0eVkgPSBvdmVyYWxsVmVsb2NpdHkueTtcbiAgICBpbnB1dC5vdmVyYWxsVmVsb2NpdHkgPSAoYWJzKG92ZXJhbGxWZWxvY2l0eS54KSA+IGFicyhvdmVyYWxsVmVsb2NpdHkueSkpID8gb3ZlcmFsbFZlbG9jaXR5LnggOiBvdmVyYWxsVmVsb2NpdHkueTtcblxuICAgIGlucHV0LnNjYWxlID0gZmlyc3RNdWx0aXBsZSA/IGdldFNjYWxlKGZpcnN0TXVsdGlwbGUucG9pbnRlcnMsIHBvaW50ZXJzKSA6IDE7XG4gICAgaW5wdXQucm90YXRpb24gPSBmaXJzdE11bHRpcGxlID8gZ2V0Um90YXRpb24oZmlyc3RNdWx0aXBsZS5wb2ludGVycywgcG9pbnRlcnMpIDogMDtcblxuICAgIGlucHV0Lm1heFBvaW50ZXJzID0gIXNlc3Npb24ucHJldklucHV0ID8gaW5wdXQucG9pbnRlcnMubGVuZ3RoIDogKChpbnB1dC5wb2ludGVycy5sZW5ndGggPlxuICAgICAgICBzZXNzaW9uLnByZXZJbnB1dC5tYXhQb2ludGVycykgPyBpbnB1dC5wb2ludGVycy5sZW5ndGggOiBzZXNzaW9uLnByZXZJbnB1dC5tYXhQb2ludGVycyk7XG5cbiAgICBjb21wdXRlSW50ZXJ2YWxJbnB1dERhdGEoc2Vzc2lvbiwgaW5wdXQpO1xuXG4gICAgLy8gZmluZCB0aGUgY29ycmVjdCB0YXJnZXRcbiAgICB2YXIgdGFyZ2V0ID0gbWFuYWdlci5lbGVtZW50O1xuICAgIGlmIChoYXNQYXJlbnQoaW5wdXQuc3JjRXZlbnQudGFyZ2V0LCB0YXJnZXQpKSB7XG4gICAgICAgIHRhcmdldCA9IGlucHV0LnNyY0V2ZW50LnRhcmdldDtcbiAgICB9XG4gICAgaW5wdXQudGFyZ2V0ID0gdGFyZ2V0O1xufVxuXG5mdW5jdGlvbiBjb21wdXRlRGVsdGFYWShzZXNzaW9uLCBpbnB1dCkge1xuICAgIHZhciBjZW50ZXIgPSBpbnB1dC5jZW50ZXI7XG4gICAgdmFyIG9mZnNldCA9IHNlc3Npb24ub2Zmc2V0RGVsdGEgfHwge307XG4gICAgdmFyIHByZXZEZWx0YSA9IHNlc3Npb24ucHJldkRlbHRhIHx8IHt9O1xuICAgIHZhciBwcmV2SW5wdXQgPSBzZXNzaW9uLnByZXZJbnB1dCB8fCB7fTtcblxuICAgIGlmIChpbnB1dC5ldmVudFR5cGUgPT09IElOUFVUX1NUQVJUIHx8IHByZXZJbnB1dC5ldmVudFR5cGUgPT09IElOUFVUX0VORCkge1xuICAgICAgICBwcmV2RGVsdGEgPSBzZXNzaW9uLnByZXZEZWx0YSA9IHtcbiAgICAgICAgICAgIHg6IHByZXZJbnB1dC5kZWx0YVggfHwgMCxcbiAgICAgICAgICAgIHk6IHByZXZJbnB1dC5kZWx0YVkgfHwgMFxuICAgICAgICB9O1xuXG4gICAgICAgIG9mZnNldCA9IHNlc3Npb24ub2Zmc2V0RGVsdGEgPSB7XG4gICAgICAgICAgICB4OiBjZW50ZXIueCxcbiAgICAgICAgICAgIHk6IGNlbnRlci55XG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgaW5wdXQuZGVsdGFYID0gcHJldkRlbHRhLnggKyAoY2VudGVyLnggLSBvZmZzZXQueCk7XG4gICAgaW5wdXQuZGVsdGFZID0gcHJldkRlbHRhLnkgKyAoY2VudGVyLnkgLSBvZmZzZXQueSk7XG59XG5cbi8qKlxuICogdmVsb2NpdHkgaXMgY2FsY3VsYXRlZCBldmVyeSB4IG1zXG4gKiBAcGFyYW0ge09iamVjdH0gc2Vzc2lvblxuICogQHBhcmFtIHtPYmplY3R9IGlucHV0XG4gKi9cbmZ1bmN0aW9uIGNvbXB1dGVJbnRlcnZhbElucHV0RGF0YShzZXNzaW9uLCBpbnB1dCkge1xuICAgIHZhciBsYXN0ID0gc2Vzc2lvbi5sYXN0SW50ZXJ2YWwgfHwgaW5wdXQsXG4gICAgICAgIGRlbHRhVGltZSA9IGlucHV0LnRpbWVTdGFtcCAtIGxhc3QudGltZVN0YW1wLFxuICAgICAgICB2ZWxvY2l0eSwgdmVsb2NpdHlYLCB2ZWxvY2l0eVksIGRpcmVjdGlvbjtcblxuICAgIGlmIChpbnB1dC5ldmVudFR5cGUgIT0gSU5QVVRfQ0FOQ0VMICYmIChkZWx0YVRpbWUgPiBDT01QVVRFX0lOVEVSVkFMIHx8IGxhc3QudmVsb2NpdHkgPT09IHVuZGVmaW5lZCkpIHtcbiAgICAgICAgdmFyIGRlbHRhWCA9IGlucHV0LmRlbHRhWCAtIGxhc3QuZGVsdGFYO1xuICAgICAgICB2YXIgZGVsdGFZID0gaW5wdXQuZGVsdGFZIC0gbGFzdC5kZWx0YVk7XG5cbiAgICAgICAgdmFyIHYgPSBnZXRWZWxvY2l0eShkZWx0YVRpbWUsIGRlbHRhWCwgZGVsdGFZKTtcbiAgICAgICAgdmVsb2NpdHlYID0gdi54O1xuICAgICAgICB2ZWxvY2l0eVkgPSB2Lnk7XG4gICAgICAgIHZlbG9jaXR5ID0gKGFicyh2LngpID4gYWJzKHYueSkpID8gdi54IDogdi55O1xuICAgICAgICBkaXJlY3Rpb24gPSBnZXREaXJlY3Rpb24oZGVsdGFYLCBkZWx0YVkpO1xuXG4gICAgICAgIHNlc3Npb24ubGFzdEludGVydmFsID0gaW5wdXQ7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgLy8gdXNlIGxhdGVzdCB2ZWxvY2l0eSBpbmZvIGlmIGl0IGRvZXNuJ3Qgb3ZlcnRha2UgYSBtaW5pbXVtIHBlcmlvZFxuICAgICAgICB2ZWxvY2l0eSA9IGxhc3QudmVsb2NpdHk7XG4gICAgICAgIHZlbG9jaXR5WCA9IGxhc3QudmVsb2NpdHlYO1xuICAgICAgICB2ZWxvY2l0eVkgPSBsYXN0LnZlbG9jaXR5WTtcbiAgICAgICAgZGlyZWN0aW9uID0gbGFzdC5kaXJlY3Rpb247XG4gICAgfVxuXG4gICAgaW5wdXQudmVsb2NpdHkgPSB2ZWxvY2l0eTtcbiAgICBpbnB1dC52ZWxvY2l0eVggPSB2ZWxvY2l0eVg7XG4gICAgaW5wdXQudmVsb2NpdHlZID0gdmVsb2NpdHlZO1xuICAgIGlucHV0LmRpcmVjdGlvbiA9IGRpcmVjdGlvbjtcbn1cblxuLyoqXG4gKiBjcmVhdGUgYSBzaW1wbGUgY2xvbmUgZnJvbSB0aGUgaW5wdXQgdXNlZCBmb3Igc3RvcmFnZSBvZiBmaXJzdElucHV0IGFuZCBmaXJzdE11bHRpcGxlXG4gKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAqIEByZXR1cm5zIHtPYmplY3R9IGNsb25lZElucHV0RGF0YVxuICovXG5mdW5jdGlvbiBzaW1wbGVDbG9uZUlucHV0RGF0YShpbnB1dCkge1xuICAgIC8vIG1ha2UgYSBzaW1wbGUgY29weSBvZiB0aGUgcG9pbnRlcnMgYmVjYXVzZSB3ZSB3aWxsIGdldCBhIHJlZmVyZW5jZSBpZiB3ZSBkb24ndFxuICAgIC8vIHdlIG9ubHkgbmVlZCBjbGllbnRYWSBmb3IgdGhlIGNhbGN1bGF0aW9uc1xuICAgIHZhciBwb2ludGVycyA9IFtdO1xuICAgIHZhciBpID0gMDtcbiAgICB3aGlsZSAoaSA8IGlucHV0LnBvaW50ZXJzLmxlbmd0aCkge1xuICAgICAgICBwb2ludGVyc1tpXSA9IHtcbiAgICAgICAgICAgIGNsaWVudFg6IHJvdW5kKGlucHV0LnBvaW50ZXJzW2ldLmNsaWVudFgpLFxuICAgICAgICAgICAgY2xpZW50WTogcm91bmQoaW5wdXQucG9pbnRlcnNbaV0uY2xpZW50WSlcbiAgICAgICAgfTtcbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHRpbWVTdGFtcDogbm93KCksXG4gICAgICAgIHBvaW50ZXJzOiBwb2ludGVycyxcbiAgICAgICAgY2VudGVyOiBnZXRDZW50ZXIocG9pbnRlcnMpLFxuICAgICAgICBkZWx0YVg6IGlucHV0LmRlbHRhWCxcbiAgICAgICAgZGVsdGFZOiBpbnB1dC5kZWx0YVlcbiAgICB9O1xufVxuXG4vKipcbiAqIGdldCB0aGUgY2VudGVyIG9mIGFsbCB0aGUgcG9pbnRlcnNcbiAqIEBwYXJhbSB7QXJyYXl9IHBvaW50ZXJzXG4gKiBAcmV0dXJuIHtPYmplY3R9IGNlbnRlciBjb250YWlucyBgeGAgYW5kIGB5YCBwcm9wZXJ0aWVzXG4gKi9cbmZ1bmN0aW9uIGdldENlbnRlcihwb2ludGVycykge1xuICAgIHZhciBwb2ludGVyc0xlbmd0aCA9IHBvaW50ZXJzLmxlbmd0aDtcblxuICAgIC8vIG5vIG5lZWQgdG8gbG9vcCB3aGVuIG9ubHkgb25lIHRvdWNoXG4gICAgaWYgKHBvaW50ZXJzTGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB4OiByb3VuZChwb2ludGVyc1swXS5jbGllbnRYKSxcbiAgICAgICAgICAgIHk6IHJvdW5kKHBvaW50ZXJzWzBdLmNsaWVudFkpXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgdmFyIHggPSAwLCB5ID0gMCwgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBwb2ludGVyc0xlbmd0aCkge1xuICAgICAgICB4ICs9IHBvaW50ZXJzW2ldLmNsaWVudFg7XG4gICAgICAgIHkgKz0gcG9pbnRlcnNbaV0uY2xpZW50WTtcbiAgICAgICAgaSsrO1xuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIHg6IHJvdW5kKHggLyBwb2ludGVyc0xlbmd0aCksXG4gICAgICAgIHk6IHJvdW5kKHkgLyBwb2ludGVyc0xlbmd0aClcbiAgICB9O1xufVxuXG4vKipcbiAqIGNhbGN1bGF0ZSB0aGUgdmVsb2NpdHkgYmV0d2VlbiB0d28gcG9pbnRzLiB1bml0IGlzIGluIHB4IHBlciBtcy5cbiAqIEBwYXJhbSB7TnVtYmVyfSBkZWx0YVRpbWVcbiAqIEBwYXJhbSB7TnVtYmVyfSB4XG4gKiBAcGFyYW0ge051bWJlcn0geVxuICogQHJldHVybiB7T2JqZWN0fSB2ZWxvY2l0eSBgeGAgYW5kIGB5YFxuICovXG5mdW5jdGlvbiBnZXRWZWxvY2l0eShkZWx0YVRpbWUsIHgsIHkpIHtcbiAgICByZXR1cm4ge1xuICAgICAgICB4OiB4IC8gZGVsdGFUaW1lIHx8IDAsXG4gICAgICAgIHk6IHkgLyBkZWx0YVRpbWUgfHwgMFxuICAgIH07XG59XG5cbi8qKlxuICogZ2V0IHRoZSBkaXJlY3Rpb24gYmV0d2VlbiB0d28gcG9pbnRzXG4gKiBAcGFyYW0ge051bWJlcn0geFxuICogQHBhcmFtIHtOdW1iZXJ9IHlcbiAqIEByZXR1cm4ge051bWJlcn0gZGlyZWN0aW9uXG4gKi9cbmZ1bmN0aW9uIGdldERpcmVjdGlvbih4LCB5KSB7XG4gICAgaWYgKHggPT09IHkpIHtcbiAgICAgICAgcmV0dXJuIERJUkVDVElPTl9OT05FO1xuICAgIH1cblxuICAgIGlmIChhYnMoeCkgPj0gYWJzKHkpKSB7XG4gICAgICAgIHJldHVybiB4IDwgMCA/IERJUkVDVElPTl9MRUZUIDogRElSRUNUSU9OX1JJR0hUO1xuICAgIH1cbiAgICByZXR1cm4geSA8IDAgPyBESVJFQ1RJT05fVVAgOiBESVJFQ1RJT05fRE9XTjtcbn1cblxuLyoqXG4gKiBjYWxjdWxhdGUgdGhlIGFic29sdXRlIGRpc3RhbmNlIGJldHdlZW4gdHdvIHBvaW50c1xuICogQHBhcmFtIHtPYmplY3R9IHAxIHt4LCB5fVxuICogQHBhcmFtIHtPYmplY3R9IHAyIHt4LCB5fVxuICogQHBhcmFtIHtBcnJheX0gW3Byb3BzXSBjb250YWluaW5nIHggYW5kIHkga2V5c1xuICogQHJldHVybiB7TnVtYmVyfSBkaXN0YW5jZVxuICovXG5mdW5jdGlvbiBnZXREaXN0YW5jZShwMSwgcDIsIHByb3BzKSB7XG4gICAgaWYgKCFwcm9wcykge1xuICAgICAgICBwcm9wcyA9IFBST1BTX1hZO1xuICAgIH1cbiAgICB2YXIgeCA9IHAyW3Byb3BzWzBdXSAtIHAxW3Byb3BzWzBdXSxcbiAgICAgICAgeSA9IHAyW3Byb3BzWzFdXSAtIHAxW3Byb3BzWzFdXTtcblxuICAgIHJldHVybiBNYXRoLnNxcnQoKHggKiB4KSArICh5ICogeSkpO1xufVxuXG4vKipcbiAqIGNhbGN1bGF0ZSB0aGUgYW5nbGUgYmV0d2VlbiB0d28gY29vcmRpbmF0ZXNcbiAqIEBwYXJhbSB7T2JqZWN0fSBwMVxuICogQHBhcmFtIHtPYmplY3R9IHAyXG4gKiBAcGFyYW0ge0FycmF5fSBbcHJvcHNdIGNvbnRhaW5pbmcgeCBhbmQgeSBrZXlzXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IGFuZ2xlXG4gKi9cbmZ1bmN0aW9uIGdldEFuZ2xlKHAxLCBwMiwgcHJvcHMpIHtcbiAgICBpZiAoIXByb3BzKSB7XG4gICAgICAgIHByb3BzID0gUFJPUFNfWFk7XG4gICAgfVxuICAgIHZhciB4ID0gcDJbcHJvcHNbMF1dIC0gcDFbcHJvcHNbMF1dLFxuICAgICAgICB5ID0gcDJbcHJvcHNbMV1dIC0gcDFbcHJvcHNbMV1dO1xuICAgIHJldHVybiBNYXRoLmF0YW4yKHksIHgpICogMTgwIC8gTWF0aC5QSTtcbn1cblxuLyoqXG4gKiBjYWxjdWxhdGUgdGhlIHJvdGF0aW9uIGRlZ3JlZXMgYmV0d2VlbiB0d28gcG9pbnRlcnNldHNcbiAqIEBwYXJhbSB7QXJyYXl9IHN0YXJ0IGFycmF5IG9mIHBvaW50ZXJzXG4gKiBAcGFyYW0ge0FycmF5fSBlbmQgYXJyYXkgb2YgcG9pbnRlcnNcbiAqIEByZXR1cm4ge051bWJlcn0gcm90YXRpb25cbiAqL1xuZnVuY3Rpb24gZ2V0Um90YXRpb24oc3RhcnQsIGVuZCkge1xuICAgIHJldHVybiBnZXRBbmdsZShlbmRbMV0sIGVuZFswXSwgUFJPUFNfQ0xJRU5UX1hZKSArIGdldEFuZ2xlKHN0YXJ0WzFdLCBzdGFydFswXSwgUFJPUFNfQ0xJRU5UX1hZKTtcbn1cblxuLyoqXG4gKiBjYWxjdWxhdGUgdGhlIHNjYWxlIGZhY3RvciBiZXR3ZWVuIHR3byBwb2ludGVyc2V0c1xuICogbm8gc2NhbGUgaXMgMSwgYW5kIGdvZXMgZG93biB0byAwIHdoZW4gcGluY2hlZCB0b2dldGhlciwgYW5kIGJpZ2dlciB3aGVuIHBpbmNoZWQgb3V0XG4gKiBAcGFyYW0ge0FycmF5fSBzdGFydCBhcnJheSBvZiBwb2ludGVyc1xuICogQHBhcmFtIHtBcnJheX0gZW5kIGFycmF5IG9mIHBvaW50ZXJzXG4gKiBAcmV0dXJuIHtOdW1iZXJ9IHNjYWxlXG4gKi9cbmZ1bmN0aW9uIGdldFNjYWxlKHN0YXJ0LCBlbmQpIHtcbiAgICByZXR1cm4gZ2V0RGlzdGFuY2UoZW5kWzBdLCBlbmRbMV0sIFBST1BTX0NMSUVOVF9YWSkgLyBnZXREaXN0YW5jZShzdGFydFswXSwgc3RhcnRbMV0sIFBST1BTX0NMSUVOVF9YWSk7XG59XG5cbnZhciBNT1VTRV9JTlBVVF9NQVAgPSB7XG4gICAgbW91c2Vkb3duOiBJTlBVVF9TVEFSVCxcbiAgICBtb3VzZW1vdmU6IElOUFVUX01PVkUsXG4gICAgbW91c2V1cDogSU5QVVRfRU5EXG59O1xuXG52YXIgTU9VU0VfRUxFTUVOVF9FVkVOVFMgPSAnbW91c2Vkb3duJztcbnZhciBNT1VTRV9XSU5ET1dfRVZFTlRTID0gJ21vdXNlbW92ZSBtb3VzZXVwJztcblxuLyoqXG4gKiBNb3VzZSBldmVudHMgaW5wdXRcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgSW5wdXRcbiAqL1xuZnVuY3Rpb24gTW91c2VJbnB1dCgpIHtcbiAgICB0aGlzLmV2RWwgPSBNT1VTRV9FTEVNRU5UX0VWRU5UUztcbiAgICB0aGlzLmV2V2luID0gTU9VU0VfV0lORE9XX0VWRU5UUztcblxuICAgIHRoaXMucHJlc3NlZCA9IGZhbHNlOyAvLyBtb3VzZWRvd24gc3RhdGVcblxuICAgIElucHV0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbmluaGVyaXQoTW91c2VJbnB1dCwgSW5wdXQsIHtcbiAgICAvKipcbiAgICAgKiBoYW5kbGUgbW91c2UgZXZlbnRzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2XG4gICAgICovXG4gICAgaGFuZGxlcjogZnVuY3Rpb24gTUVoYW5kbGVyKGV2KSB7XG4gICAgICAgIHZhciBldmVudFR5cGUgPSBNT1VTRV9JTlBVVF9NQVBbZXYudHlwZV07XG5cbiAgICAgICAgLy8gb24gc3RhcnQgd2Ugd2FudCB0byBoYXZlIHRoZSBsZWZ0IG1vdXNlIGJ1dHRvbiBkb3duXG4gICAgICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9TVEFSVCAmJiBldi5idXR0b24gPT09IDApIHtcbiAgICAgICAgICAgIHRoaXMucHJlc3NlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnRUeXBlICYgSU5QVVRfTU9WRSAmJiBldi53aGljaCAhPT0gMSkge1xuICAgICAgICAgICAgZXZlbnRUeXBlID0gSU5QVVRfRU5EO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbW91c2UgbXVzdCBiZSBkb3duXG4gICAgICAgIGlmICghdGhpcy5wcmVzc2VkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoZXZlbnRUeXBlICYgSU5QVVRfRU5EKSB7XG4gICAgICAgICAgICB0aGlzLnByZXNzZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FsbGJhY2sodGhpcy5tYW5hZ2VyLCBldmVudFR5cGUsIHtcbiAgICAgICAgICAgIHBvaW50ZXJzOiBbZXZdLFxuICAgICAgICAgICAgY2hhbmdlZFBvaW50ZXJzOiBbZXZdLFxuICAgICAgICAgICAgcG9pbnRlclR5cGU6IElOUFVUX1RZUEVfTU9VU0UsXG4gICAgICAgICAgICBzcmNFdmVudDogZXZcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbnZhciBQT0lOVEVSX0lOUFVUX01BUCA9IHtcbiAgICBwb2ludGVyZG93bjogSU5QVVRfU1RBUlQsXG4gICAgcG9pbnRlcm1vdmU6IElOUFVUX01PVkUsXG4gICAgcG9pbnRlcnVwOiBJTlBVVF9FTkQsXG4gICAgcG9pbnRlcmNhbmNlbDogSU5QVVRfQ0FOQ0VMLFxuICAgIHBvaW50ZXJvdXQ6IElOUFVUX0NBTkNFTFxufTtcblxuLy8gaW4gSUUxMCB0aGUgcG9pbnRlciB0eXBlcyBpcyBkZWZpbmVkIGFzIGFuIGVudW1cbnZhciBJRTEwX1BPSU5URVJfVFlQRV9FTlVNID0ge1xuICAgIDI6IElOUFVUX1RZUEVfVE9VQ0gsXG4gICAgMzogSU5QVVRfVFlQRV9QRU4sXG4gICAgNDogSU5QVVRfVFlQRV9NT1VTRSxcbiAgICA1OiBJTlBVVF9UWVBFX0tJTkVDVCAvLyBzZWUgaHR0cHM6Ly90d2l0dGVyLmNvbS9qYWNvYnJvc3NpL3N0YXR1cy80ODA1OTY0Mzg0ODk4OTA4MTZcbn07XG5cbnZhciBQT0lOVEVSX0VMRU1FTlRfRVZFTlRTID0gJ3BvaW50ZXJkb3duJztcbnZhciBQT0lOVEVSX1dJTkRPV19FVkVOVFMgPSAncG9pbnRlcm1vdmUgcG9pbnRlcnVwIHBvaW50ZXJjYW5jZWwnO1xuXG4vLyBJRTEwIGhhcyBwcmVmaXhlZCBzdXBwb3J0LCBhbmQgY2FzZS1zZW5zaXRpdmVcbmlmICh3aW5kb3cuTVNQb2ludGVyRXZlbnQgJiYgIXdpbmRvdy5Qb2ludGVyRXZlbnQpIHtcbiAgICBQT0lOVEVSX0VMRU1FTlRfRVZFTlRTID0gJ01TUG9pbnRlckRvd24nO1xuICAgIFBPSU5URVJfV0lORE9XX0VWRU5UUyA9ICdNU1BvaW50ZXJNb3ZlIE1TUG9pbnRlclVwIE1TUG9pbnRlckNhbmNlbCc7XG59XG5cbi8qKlxuICogUG9pbnRlciBldmVudHMgaW5wdXRcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgSW5wdXRcbiAqL1xuZnVuY3Rpb24gUG9pbnRlckV2ZW50SW5wdXQoKSB7XG4gICAgdGhpcy5ldkVsID0gUE9JTlRFUl9FTEVNRU5UX0VWRU5UUztcbiAgICB0aGlzLmV2V2luID0gUE9JTlRFUl9XSU5ET1dfRVZFTlRTO1xuXG4gICAgSW5wdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcblxuICAgIHRoaXMuc3RvcmUgPSAodGhpcy5tYW5hZ2VyLnNlc3Npb24ucG9pbnRlckV2ZW50cyA9IFtdKTtcbn1cblxuaW5oZXJpdChQb2ludGVyRXZlbnRJbnB1dCwgSW5wdXQsIHtcbiAgICAvKipcbiAgICAgKiBoYW5kbGUgbW91c2UgZXZlbnRzXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGV2XG4gICAgICovXG4gICAgaGFuZGxlcjogZnVuY3Rpb24gUEVoYW5kbGVyKGV2KSB7XG4gICAgICAgIHZhciBzdG9yZSA9IHRoaXMuc3RvcmU7XG4gICAgICAgIHZhciByZW1vdmVQb2ludGVyID0gZmFsc2U7XG5cbiAgICAgICAgdmFyIGV2ZW50VHlwZU5vcm1hbGl6ZWQgPSBldi50eXBlLnRvTG93ZXJDYXNlKCkucmVwbGFjZSgnbXMnLCAnJyk7XG4gICAgICAgIHZhciBldmVudFR5cGUgPSBQT0lOVEVSX0lOUFVUX01BUFtldmVudFR5cGVOb3JtYWxpemVkXTtcbiAgICAgICAgdmFyIHBvaW50ZXJUeXBlID0gSUUxMF9QT0lOVEVSX1RZUEVfRU5VTVtldi5wb2ludGVyVHlwZV0gfHwgZXYucG9pbnRlclR5cGU7XG5cbiAgICAgICAgdmFyIGlzVG91Y2ggPSAocG9pbnRlclR5cGUgPT0gSU5QVVRfVFlQRV9UT1VDSCk7XG5cbiAgICAgICAgLy8gZ2V0IGluZGV4IG9mIHRoZSBldmVudCBpbiB0aGUgc3RvcmVcbiAgICAgICAgdmFyIHN0b3JlSW5kZXggPSBpbkFycmF5KHN0b3JlLCBldi5wb2ludGVySWQsICdwb2ludGVySWQnKTtcblxuICAgICAgICAvLyBzdGFydCBhbmQgbW91c2UgbXVzdCBiZSBkb3duXG4gICAgICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9TVEFSVCAmJiAoZXYuYnV0dG9uID09PSAwIHx8IGlzVG91Y2gpKSB7XG4gICAgICAgICAgICBpZiAoc3RvcmVJbmRleCA8IDApIHtcbiAgICAgICAgICAgICAgICBzdG9yZS5wdXNoKGV2KTtcbiAgICAgICAgICAgICAgICBzdG9yZUluZGV4ID0gc3RvcmUubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChldmVudFR5cGUgJiAoSU5QVVRfRU5EIHwgSU5QVVRfQ0FOQ0VMKSkge1xuICAgICAgICAgICAgcmVtb3ZlUG9pbnRlciA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpdCBub3QgZm91bmQsIHNvIHRoZSBwb2ludGVyIGhhc24ndCBiZWVuIGRvd24gKHNvIGl0J3MgcHJvYmFibHkgYSBob3ZlcilcbiAgICAgICAgaWYgKHN0b3JlSW5kZXggPCAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB1cGRhdGUgdGhlIGV2ZW50IGluIHRoZSBzdG9yZVxuICAgICAgICBzdG9yZVtzdG9yZUluZGV4XSA9IGV2O1xuXG4gICAgICAgIHRoaXMuY2FsbGJhY2sodGhpcy5tYW5hZ2VyLCBldmVudFR5cGUsIHtcbiAgICAgICAgICAgIHBvaW50ZXJzOiBzdG9yZSxcbiAgICAgICAgICAgIGNoYW5nZWRQb2ludGVyczogW2V2XSxcbiAgICAgICAgICAgIHBvaW50ZXJUeXBlOiBwb2ludGVyVHlwZSxcbiAgICAgICAgICAgIHNyY0V2ZW50OiBldlxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAocmVtb3ZlUG9pbnRlcikge1xuICAgICAgICAgICAgLy8gcmVtb3ZlIGZyb20gdGhlIHN0b3JlXG4gICAgICAgICAgICBzdG9yZS5zcGxpY2Uoc3RvcmVJbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxudmFyIFNJTkdMRV9UT1VDSF9JTlBVVF9NQVAgPSB7XG4gICAgdG91Y2hzdGFydDogSU5QVVRfU1RBUlQsXG4gICAgdG91Y2htb3ZlOiBJTlBVVF9NT1ZFLFxuICAgIHRvdWNoZW5kOiBJTlBVVF9FTkQsXG4gICAgdG91Y2hjYW5jZWw6IElOUFVUX0NBTkNFTFxufTtcblxudmFyIFNJTkdMRV9UT1VDSF9UQVJHRVRfRVZFTlRTID0gJ3RvdWNoc3RhcnQnO1xudmFyIFNJTkdMRV9UT1VDSF9XSU5ET1dfRVZFTlRTID0gJ3RvdWNoc3RhcnQgdG91Y2htb3ZlIHRvdWNoZW5kIHRvdWNoY2FuY2VsJztcblxuLyoqXG4gKiBUb3VjaCBldmVudHMgaW5wdXRcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgSW5wdXRcbiAqL1xuZnVuY3Rpb24gU2luZ2xlVG91Y2hJbnB1dCgpIHtcbiAgICB0aGlzLmV2VGFyZ2V0ID0gU0lOR0xFX1RPVUNIX1RBUkdFVF9FVkVOVFM7XG4gICAgdGhpcy5ldldpbiA9IFNJTkdMRV9UT1VDSF9XSU5ET1dfRVZFTlRTO1xuICAgIHRoaXMuc3RhcnRlZCA9IGZhbHNlO1xuXG4gICAgSW5wdXQuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuaW5oZXJpdChTaW5nbGVUb3VjaElucHV0LCBJbnB1dCwge1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uIFRFaGFuZGxlcihldikge1xuICAgICAgICB2YXIgdHlwZSA9IFNJTkdMRV9UT1VDSF9JTlBVVF9NQVBbZXYudHlwZV07XG5cbiAgICAgICAgLy8gc2hvdWxkIHdlIGhhbmRsZSB0aGUgdG91Y2ggZXZlbnRzP1xuICAgICAgICBpZiAodHlwZSA9PT0gSU5QVVRfU1RBUlQpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnRlZCA9IHRydWU7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoIXRoaXMuc3RhcnRlZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHRvdWNoZXMgPSBub3JtYWxpemVTaW5nbGVUb3VjaGVzLmNhbGwodGhpcywgZXYsIHR5cGUpO1xuXG4gICAgICAgIC8vIHdoZW4gZG9uZSwgcmVzZXQgdGhlIHN0YXJ0ZWQgc3RhdGVcbiAgICAgICAgaWYgKHR5cGUgJiAoSU5QVVRfRU5EIHwgSU5QVVRfQ0FOQ0VMKSAmJiB0b3VjaGVzWzBdLmxlbmd0aCAtIHRvdWNoZXNbMV0ubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0ZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuY2FsbGJhY2sodGhpcy5tYW5hZ2VyLCB0eXBlLCB7XG4gICAgICAgICAgICBwb2ludGVyczogdG91Y2hlc1swXSxcbiAgICAgICAgICAgIGNoYW5nZWRQb2ludGVyczogdG91Y2hlc1sxXSxcbiAgICAgICAgICAgIHBvaW50ZXJUeXBlOiBJTlBVVF9UWVBFX1RPVUNILFxuICAgICAgICAgICAgc3JjRXZlbnQ6IGV2XG4gICAgICAgIH0pO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIEB0aGlzIHtUb3VjaElucHV0fVxuICogQHBhcmFtIHtPYmplY3R9IGV2XG4gKiBAcGFyYW0ge051bWJlcn0gdHlwZSBmbGFnXG4gKiBAcmV0dXJucyB7dW5kZWZpbmVkfEFycmF5fSBbYWxsLCBjaGFuZ2VkXVxuICovXG5mdW5jdGlvbiBub3JtYWxpemVTaW5nbGVUb3VjaGVzKGV2LCB0eXBlKSB7XG4gICAgdmFyIGFsbCA9IHRvQXJyYXkoZXYudG91Y2hlcyk7XG4gICAgdmFyIGNoYW5nZWQgPSB0b0FycmF5KGV2LmNoYW5nZWRUb3VjaGVzKTtcblxuICAgIGlmICh0eXBlICYgKElOUFVUX0VORCB8IElOUFVUX0NBTkNFTCkpIHtcbiAgICAgICAgYWxsID0gdW5pcXVlQXJyYXkoYWxsLmNvbmNhdChjaGFuZ2VkKSwgJ2lkZW50aWZpZXInLCB0cnVlKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW2FsbCwgY2hhbmdlZF07XG59XG5cbnZhciBUT1VDSF9JTlBVVF9NQVAgPSB7XG4gICAgdG91Y2hzdGFydDogSU5QVVRfU1RBUlQsXG4gICAgdG91Y2htb3ZlOiBJTlBVVF9NT1ZFLFxuICAgIHRvdWNoZW5kOiBJTlBVVF9FTkQsXG4gICAgdG91Y2hjYW5jZWw6IElOUFVUX0NBTkNFTFxufTtcblxudmFyIFRPVUNIX1RBUkdFVF9FVkVOVFMgPSAndG91Y2hzdGFydCB0b3VjaG1vdmUgdG91Y2hlbmQgdG91Y2hjYW5jZWwnO1xuXG4vKipcbiAqIE11bHRpLXVzZXIgdG91Y2ggZXZlbnRzIGlucHV0XG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIElucHV0XG4gKi9cbmZ1bmN0aW9uIFRvdWNoSW5wdXQoKSB7XG4gICAgdGhpcy5ldlRhcmdldCA9IFRPVUNIX1RBUkdFVF9FVkVOVFM7XG4gICAgdGhpcy50YXJnZXRJZHMgPSB7fTtcblxuICAgIElucHV0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbmluaGVyaXQoVG91Y2hJbnB1dCwgSW5wdXQsIHtcbiAgICBoYW5kbGVyOiBmdW5jdGlvbiBNVEVoYW5kbGVyKGV2KSB7XG4gICAgICAgIHZhciB0eXBlID0gVE9VQ0hfSU5QVVRfTUFQW2V2LnR5cGVdO1xuICAgICAgICB2YXIgdG91Y2hlcyA9IGdldFRvdWNoZXMuY2FsbCh0aGlzLCBldiwgdHlwZSk7XG4gICAgICAgIGlmICghdG91Y2hlcykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYWxsYmFjayh0aGlzLm1hbmFnZXIsIHR5cGUsIHtcbiAgICAgICAgICAgIHBvaW50ZXJzOiB0b3VjaGVzWzBdLFxuICAgICAgICAgICAgY2hhbmdlZFBvaW50ZXJzOiB0b3VjaGVzWzFdLFxuICAgICAgICAgICAgcG9pbnRlclR5cGU6IElOUFVUX1RZUEVfVE9VQ0gsXG4gICAgICAgICAgICBzcmNFdmVudDogZXZcbiAgICAgICAgfSk7XG4gICAgfVxufSk7XG5cbi8qKlxuICogQHRoaXMge1RvdWNoSW5wdXR9XG4gKiBAcGFyYW0ge09iamVjdH0gZXZcbiAqIEBwYXJhbSB7TnVtYmVyfSB0eXBlIGZsYWdcbiAqIEByZXR1cm5zIHt1bmRlZmluZWR8QXJyYXl9IFthbGwsIGNoYW5nZWRdXG4gKi9cbmZ1bmN0aW9uIGdldFRvdWNoZXMoZXYsIHR5cGUpIHtcbiAgICB2YXIgYWxsVG91Y2hlcyA9IHRvQXJyYXkoZXYudG91Y2hlcyk7XG4gICAgdmFyIHRhcmdldElkcyA9IHRoaXMudGFyZ2V0SWRzO1xuXG4gICAgLy8gd2hlbiB0aGVyZSBpcyBvbmx5IG9uZSB0b3VjaCwgdGhlIHByb2Nlc3MgY2FuIGJlIHNpbXBsaWZpZWRcbiAgICBpZiAodHlwZSAmIChJTlBVVF9TVEFSVCB8IElOUFVUX01PVkUpICYmIGFsbFRvdWNoZXMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHRhcmdldElkc1thbGxUb3VjaGVzWzBdLmlkZW50aWZpZXJdID0gdHJ1ZTtcbiAgICAgICAgcmV0dXJuIFthbGxUb3VjaGVzLCBhbGxUb3VjaGVzXTtcbiAgICB9XG5cbiAgICB2YXIgaSxcbiAgICAgICAgdGFyZ2V0VG91Y2hlcyxcbiAgICAgICAgY2hhbmdlZFRvdWNoZXMgPSB0b0FycmF5KGV2LmNoYW5nZWRUb3VjaGVzKSxcbiAgICAgICAgY2hhbmdlZFRhcmdldFRvdWNoZXMgPSBbXSxcbiAgICAgICAgdGFyZ2V0ID0gdGhpcy50YXJnZXQ7XG5cbiAgICAvLyBnZXQgdGFyZ2V0IHRvdWNoZXMgZnJvbSB0b3VjaGVzXG4gICAgdGFyZ2V0VG91Y2hlcyA9IGFsbFRvdWNoZXMuZmlsdGVyKGZ1bmN0aW9uKHRvdWNoKSB7XG4gICAgICAgIHJldHVybiBoYXNQYXJlbnQodG91Y2gudGFyZ2V0LCB0YXJnZXQpO1xuICAgIH0pO1xuXG4gICAgLy8gY29sbGVjdCB0b3VjaGVzXG4gICAgaWYgKHR5cGUgPT09IElOUFVUX1NUQVJUKSB7XG4gICAgICAgIGkgPSAwO1xuICAgICAgICB3aGlsZSAoaSA8IHRhcmdldFRvdWNoZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICB0YXJnZXRJZHNbdGFyZ2V0VG91Y2hlc1tpXS5pZGVudGlmaWVyXSA9IHRydWU7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBmaWx0ZXIgY2hhbmdlZCB0b3VjaGVzIHRvIG9ubHkgY29udGFpbiB0b3VjaGVzIHRoYXQgZXhpc3QgaW4gdGhlIGNvbGxlY3RlZCB0YXJnZXQgaWRzXG4gICAgaSA9IDA7XG4gICAgd2hpbGUgKGkgPCBjaGFuZ2VkVG91Y2hlcy5sZW5ndGgpIHtcbiAgICAgICAgaWYgKHRhcmdldElkc1tjaGFuZ2VkVG91Y2hlc1tpXS5pZGVudGlmaWVyXSkge1xuICAgICAgICAgICAgY2hhbmdlZFRhcmdldFRvdWNoZXMucHVzaChjaGFuZ2VkVG91Y2hlc1tpXSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBjbGVhbnVwIHJlbW92ZWQgdG91Y2hlc1xuICAgICAgICBpZiAodHlwZSAmIChJTlBVVF9FTkQgfCBJTlBVVF9DQU5DRUwpKSB7XG4gICAgICAgICAgICBkZWxldGUgdGFyZ2V0SWRzW2NoYW5nZWRUb3VjaGVzW2ldLmlkZW50aWZpZXJdO1xuICAgICAgICB9XG4gICAgICAgIGkrKztcbiAgICB9XG5cbiAgICBpZiAoIWNoYW5nZWRUYXJnZXRUb3VjaGVzLmxlbmd0aCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgcmV0dXJuIFtcbiAgICAgICAgLy8gbWVyZ2UgdGFyZ2V0VG91Y2hlcyB3aXRoIGNoYW5nZWRUYXJnZXRUb3VjaGVzIHNvIGl0IGNvbnRhaW5zIEFMTCB0b3VjaGVzLCBpbmNsdWRpbmcgJ2VuZCcgYW5kICdjYW5jZWwnXG4gICAgICAgIHVuaXF1ZUFycmF5KHRhcmdldFRvdWNoZXMuY29uY2F0KGNoYW5nZWRUYXJnZXRUb3VjaGVzKSwgJ2lkZW50aWZpZXInLCB0cnVlKSxcbiAgICAgICAgY2hhbmdlZFRhcmdldFRvdWNoZXNcbiAgICBdO1xufVxuXG4vKipcbiAqIENvbWJpbmVkIHRvdWNoIGFuZCBtb3VzZSBpbnB1dFxuICpcbiAqIFRvdWNoIGhhcyBhIGhpZ2hlciBwcmlvcml0eSB0aGVuIG1vdXNlLCBhbmQgd2hpbGUgdG91Y2hpbmcgbm8gbW91c2UgZXZlbnRzIGFyZSBhbGxvd2VkLlxuICogVGhpcyBiZWNhdXNlIHRvdWNoIGRldmljZXMgYWxzbyBlbWl0IG1vdXNlIGV2ZW50cyB3aGlsZSBkb2luZyBhIHRvdWNoLlxuICpcbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgSW5wdXRcbiAqL1xuXG52YXIgREVEVVBfVElNRU9VVCA9IDI1MDA7XG52YXIgREVEVVBfRElTVEFOQ0UgPSAyNTtcblxuZnVuY3Rpb24gVG91Y2hNb3VzZUlucHV0KCkge1xuICAgIElucHV0LmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB2YXIgaGFuZGxlciA9IGJpbmRGbih0aGlzLmhhbmRsZXIsIHRoaXMpO1xuICAgIHRoaXMudG91Y2ggPSBuZXcgVG91Y2hJbnB1dCh0aGlzLm1hbmFnZXIsIGhhbmRsZXIpO1xuICAgIHRoaXMubW91c2UgPSBuZXcgTW91c2VJbnB1dCh0aGlzLm1hbmFnZXIsIGhhbmRsZXIpO1xuXG4gICAgdGhpcy5wcmltYXJ5VG91Y2ggPSBudWxsO1xuICAgIHRoaXMubGFzdFRvdWNoZXMgPSBbXTtcbn1cblxuaW5oZXJpdChUb3VjaE1vdXNlSW5wdXQsIElucHV0LCB7XG4gICAgLyoqXG4gICAgICogaGFuZGxlIG1vdXNlIGFuZCB0b3VjaCBldmVudHNcbiAgICAgKiBAcGFyYW0ge0hhbW1lcn0gbWFuYWdlclxuICAgICAqIEBwYXJhbSB7U3RyaW5nfSBpbnB1dEV2ZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0RGF0YVxuICAgICAqL1xuICAgIGhhbmRsZXI6IGZ1bmN0aW9uIFRNRWhhbmRsZXIobWFuYWdlciwgaW5wdXRFdmVudCwgaW5wdXREYXRhKSB7XG4gICAgICAgIHZhciBpc1RvdWNoID0gKGlucHV0RGF0YS5wb2ludGVyVHlwZSA9PSBJTlBVVF9UWVBFX1RPVUNIKSxcbiAgICAgICAgICAgIGlzTW91c2UgPSAoaW5wdXREYXRhLnBvaW50ZXJUeXBlID09IElOUFVUX1RZUEVfTU9VU0UpO1xuXG4gICAgICAgIGlmIChpc01vdXNlICYmIGlucHV0RGF0YS5zb3VyY2VDYXBhYmlsaXRpZXMgJiYgaW5wdXREYXRhLnNvdXJjZUNhcGFiaWxpdGllcy5maXJlc1RvdWNoRXZlbnRzKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3aGVuIHdlJ3JlIGluIGEgdG91Y2ggZXZlbnQsIHJlY29yZCB0b3VjaGVzIHRvICBkZS1kdXBlIHN5bnRoZXRpYyBtb3VzZSBldmVudFxuICAgICAgICBpZiAoaXNUb3VjaCkge1xuICAgICAgICAgICAgcmVjb3JkVG91Y2hlcy5jYWxsKHRoaXMsIGlucHV0RXZlbnQsIGlucHV0RGF0YSk7XG4gICAgICAgIH0gZWxzZSBpZiAoaXNNb3VzZSAmJiBpc1N5bnRoZXRpY0V2ZW50LmNhbGwodGhpcywgaW5wdXREYXRhKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5jYWxsYmFjayhtYW5hZ2VyLCBpbnB1dEV2ZW50LCBpbnB1dERhdGEpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZW1vdmUgdGhlIGV2ZW50IGxpc3RlbmVyc1xuICAgICAqL1xuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG4gICAgICAgIHRoaXMudG91Y2guZGVzdHJveSgpO1xuICAgICAgICB0aGlzLm1vdXNlLmRlc3Ryb3koKTtcbiAgICB9XG59KTtcblxuZnVuY3Rpb24gcmVjb3JkVG91Y2hlcyhldmVudFR5cGUsIGV2ZW50RGF0YSkge1xuICAgIGlmIChldmVudFR5cGUgJiBJTlBVVF9TVEFSVCkge1xuICAgICAgICB0aGlzLnByaW1hcnlUb3VjaCA9IGV2ZW50RGF0YS5jaGFuZ2VkUG9pbnRlcnNbMF0uaWRlbnRpZmllcjtcbiAgICAgICAgc2V0TGFzdFRvdWNoLmNhbGwodGhpcywgZXZlbnREYXRhKTtcbiAgICB9IGVsc2UgaWYgKGV2ZW50VHlwZSAmIChJTlBVVF9FTkQgfCBJTlBVVF9DQU5DRUwpKSB7XG4gICAgICAgIHNldExhc3RUb3VjaC5jYWxsKHRoaXMsIGV2ZW50RGF0YSk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBzZXRMYXN0VG91Y2goZXZlbnREYXRhKSB7XG4gICAgdmFyIHRvdWNoID0gZXZlbnREYXRhLmNoYW5nZWRQb2ludGVyc1swXTtcblxuICAgIGlmICh0b3VjaC5pZGVudGlmaWVyID09PSB0aGlzLnByaW1hcnlUb3VjaCkge1xuICAgICAgICB2YXIgbGFzdFRvdWNoID0ge3g6IHRvdWNoLmNsaWVudFgsIHk6IHRvdWNoLmNsaWVudFl9O1xuICAgICAgICB0aGlzLmxhc3RUb3VjaGVzLnB1c2gobGFzdFRvdWNoKTtcbiAgICAgICAgdmFyIGx0cyA9IHRoaXMubGFzdFRvdWNoZXM7XG4gICAgICAgIHZhciByZW1vdmVMYXN0VG91Y2ggPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHZhciBpID0gbHRzLmluZGV4T2YobGFzdFRvdWNoKTtcbiAgICAgICAgICAgIGlmIChpID4gLTEpIHtcbiAgICAgICAgICAgICAgICBsdHMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgICAgICBzZXRUaW1lb3V0KHJlbW92ZUxhc3RUb3VjaCwgREVEVVBfVElNRU9VVCk7XG4gICAgfVxufVxuXG5mdW5jdGlvbiBpc1N5bnRoZXRpY0V2ZW50KGV2ZW50RGF0YSkge1xuICAgIHZhciB4ID0gZXZlbnREYXRhLnNyY0V2ZW50LmNsaWVudFgsIHkgPSBldmVudERhdGEuc3JjRXZlbnQuY2xpZW50WTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubGFzdFRvdWNoZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIHQgPSB0aGlzLmxhc3RUb3VjaGVzW2ldO1xuICAgICAgICB2YXIgZHggPSBNYXRoLmFicyh4IC0gdC54KSwgZHkgPSBNYXRoLmFicyh5IC0gdC55KTtcbiAgICAgICAgaWYgKGR4IDw9IERFRFVQX0RJU1RBTkNFICYmIGR5IDw9IERFRFVQX0RJU1RBTkNFKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59XG5cbnZhciBQUkVGSVhFRF9UT1VDSF9BQ1RJT04gPSBwcmVmaXhlZChURVNUX0VMRU1FTlQuc3R5bGUsICd0b3VjaEFjdGlvbicpO1xudmFyIE5BVElWRV9UT1VDSF9BQ1RJT04gPSBQUkVGSVhFRF9UT1VDSF9BQ1RJT04gIT09IHVuZGVmaW5lZDtcblxuLy8gbWFnaWNhbCB0b3VjaEFjdGlvbiB2YWx1ZVxudmFyIFRPVUNIX0FDVElPTl9DT01QVVRFID0gJ2NvbXB1dGUnO1xudmFyIFRPVUNIX0FDVElPTl9BVVRPID0gJ2F1dG8nO1xudmFyIFRPVUNIX0FDVElPTl9NQU5JUFVMQVRJT04gPSAnbWFuaXB1bGF0aW9uJzsgLy8gbm90IGltcGxlbWVudGVkXG52YXIgVE9VQ0hfQUNUSU9OX05PTkUgPSAnbm9uZSc7XG52YXIgVE9VQ0hfQUNUSU9OX1BBTl9YID0gJ3Bhbi14JztcbnZhciBUT1VDSF9BQ1RJT05fUEFOX1kgPSAncGFuLXknO1xudmFyIFRPVUNIX0FDVElPTl9NQVAgPSBnZXRUb3VjaEFjdGlvblByb3BzKCk7XG5cbi8qKlxuICogVG91Y2ggQWN0aW9uXG4gKiBzZXRzIHRoZSB0b3VjaEFjdGlvbiBwcm9wZXJ0eSBvciB1c2VzIHRoZSBqcyBhbHRlcm5hdGl2ZVxuICogQHBhcmFtIHtNYW5hZ2VyfSBtYW5hZ2VyXG4gKiBAcGFyYW0ge1N0cmluZ30gdmFsdWVcbiAqIEBjb25zdHJ1Y3RvclxuICovXG5mdW5jdGlvbiBUb3VjaEFjdGlvbihtYW5hZ2VyLCB2YWx1ZSkge1xuICAgIHRoaXMubWFuYWdlciA9IG1hbmFnZXI7XG4gICAgdGhpcy5zZXQodmFsdWUpO1xufVxuXG5Ub3VjaEFjdGlvbi5wcm90b3R5cGUgPSB7XG4gICAgLyoqXG4gICAgICogc2V0IHRoZSB0b3VjaEFjdGlvbiB2YWx1ZSBvbiB0aGUgZWxlbWVudCBvciBlbmFibGUgdGhlIHBvbHlmaWxsXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IHZhbHVlXG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICAvLyBmaW5kIG91dCB0aGUgdG91Y2gtYWN0aW9uIGJ5IHRoZSBldmVudCBoYW5kbGVyc1xuICAgICAgICBpZiAodmFsdWUgPT0gVE9VQ0hfQUNUSU9OX0NPTVBVVEUpIHtcbiAgICAgICAgICAgIHZhbHVlID0gdGhpcy5jb21wdXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoTkFUSVZFX1RPVUNIX0FDVElPTiAmJiB0aGlzLm1hbmFnZXIuZWxlbWVudC5zdHlsZSAmJiBUT1VDSF9BQ1RJT05fTUFQW3ZhbHVlXSkge1xuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyLmVsZW1lbnQuc3R5bGVbUFJFRklYRURfVE9VQ0hfQUNUSU9OXSA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuYWN0aW9ucyA9IHZhbHVlLnRvTG93ZXJDYXNlKCkudHJpbSgpO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBqdXN0IHJlLXNldCB0aGUgdG91Y2hBY3Rpb24gdmFsdWVcbiAgICAgKi9cbiAgICB1cGRhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLnNldCh0aGlzLm1hbmFnZXIub3B0aW9ucy50b3VjaEFjdGlvbik7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGNvbXB1dGUgdGhlIHZhbHVlIGZvciB0aGUgdG91Y2hBY3Rpb24gcHJvcGVydHkgYmFzZWQgb24gdGhlIHJlY29nbml6ZXIncyBzZXR0aW5nc1xuICAgICAqIEByZXR1cm5zIHtTdHJpbmd9IHZhbHVlXG4gICAgICovXG4gICAgY29tcHV0ZTogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhY3Rpb25zID0gW107XG4gICAgICAgIGVhY2godGhpcy5tYW5hZ2VyLnJlY29nbml6ZXJzLCBmdW5jdGlvbihyZWNvZ25pemVyKSB7XG4gICAgICAgICAgICBpZiAoYm9vbE9yRm4ocmVjb2duaXplci5vcHRpb25zLmVuYWJsZSwgW3JlY29nbml6ZXJdKSkge1xuICAgICAgICAgICAgICAgIGFjdGlvbnMgPSBhY3Rpb25zLmNvbmNhdChyZWNvZ25pemVyLmdldFRvdWNoQWN0aW9uKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIGNsZWFuVG91Y2hBY3Rpb25zKGFjdGlvbnMuam9pbignICcpKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogdGhpcyBtZXRob2QgaXMgY2FsbGVkIG9uIGVhY2ggaW5wdXQgY3ljbGUgYW5kIHByb3ZpZGVzIHRoZSBwcmV2ZW50aW5nIG9mIHRoZSBicm93c2VyIGJlaGF2aW9yXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0XG4gICAgICovXG4gICAgcHJldmVudERlZmF1bHRzOiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgc3JjRXZlbnQgPSBpbnB1dC5zcmNFdmVudDtcbiAgICAgICAgdmFyIGRpcmVjdGlvbiA9IGlucHV0Lm9mZnNldERpcmVjdGlvbjtcblxuICAgICAgICAvLyBpZiB0aGUgdG91Y2ggYWN0aW9uIGRpZCBwcmV2ZW50ZWQgb25jZSB0aGlzIHNlc3Npb25cbiAgICAgICAgaWYgKHRoaXMubWFuYWdlci5zZXNzaW9uLnByZXZlbnRlZCkge1xuICAgICAgICAgICAgc3JjRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhY3Rpb25zID0gdGhpcy5hY3Rpb25zO1xuICAgICAgICB2YXIgaGFzTm9uZSA9IGluU3RyKGFjdGlvbnMsIFRPVUNIX0FDVElPTl9OT05FKSAmJiAhVE9VQ0hfQUNUSU9OX01BUFtUT1VDSF9BQ1RJT05fTk9ORV07XG4gICAgICAgIHZhciBoYXNQYW5ZID0gaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX1BBTl9ZKSAmJiAhVE9VQ0hfQUNUSU9OX01BUFtUT1VDSF9BQ1RJT05fUEFOX1ldO1xuICAgICAgICB2YXIgaGFzUGFuWCA9IGluU3RyKGFjdGlvbnMsIFRPVUNIX0FDVElPTl9QQU5fWCkgJiYgIVRPVUNIX0FDVElPTl9NQVBbVE9VQ0hfQUNUSU9OX1BBTl9YXTtcblxuICAgICAgICBpZiAoaGFzTm9uZSkge1xuICAgICAgICAgICAgLy9kbyBub3QgcHJldmVudCBkZWZhdWx0cyBpZiB0aGlzIGlzIGEgdGFwIGdlc3R1cmVcblxuICAgICAgICAgICAgdmFyIGlzVGFwUG9pbnRlciA9IGlucHV0LnBvaW50ZXJzLmxlbmd0aCA9PT0gMTtcbiAgICAgICAgICAgIHZhciBpc1RhcE1vdmVtZW50ID0gaW5wdXQuZGlzdGFuY2UgPCAyO1xuICAgICAgICAgICAgdmFyIGlzVGFwVG91Y2hUaW1lID0gaW5wdXQuZGVsdGFUaW1lIDwgMjUwO1xuXG4gICAgICAgICAgICBpZiAoaXNUYXBQb2ludGVyICYmIGlzVGFwTW92ZW1lbnQgJiYgaXNUYXBUb3VjaFRpbWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzUGFuWCAmJiBoYXNQYW5ZKSB7XG4gICAgICAgICAgICAvLyBgcGFuLXggcGFuLXlgIG1lYW5zIGJyb3dzZXIgaGFuZGxlcyBhbGwgc2Nyb2xsaW5nL3Bhbm5pbmcsIGRvIG5vdCBwcmV2ZW50XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaGFzTm9uZSB8fFxuICAgICAgICAgICAgKGhhc1BhblkgJiYgZGlyZWN0aW9uICYgRElSRUNUSU9OX0hPUklaT05UQUwpIHx8XG4gICAgICAgICAgICAoaGFzUGFuWCAmJiBkaXJlY3Rpb24gJiBESVJFQ1RJT05fVkVSVElDQUwpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcmV2ZW50U3JjKHNyY0V2ZW50KTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBjYWxsIHByZXZlbnREZWZhdWx0IHRvIHByZXZlbnQgdGhlIGJyb3dzZXIncyBkZWZhdWx0IGJlaGF2aW9yIChzY3JvbGxpbmcgaW4gbW9zdCBjYXNlcylcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gc3JjRXZlbnRcbiAgICAgKi9cbiAgICBwcmV2ZW50U3JjOiBmdW5jdGlvbihzcmNFdmVudCkge1xuICAgICAgICB0aGlzLm1hbmFnZXIuc2Vzc2lvbi5wcmV2ZW50ZWQgPSB0cnVlO1xuICAgICAgICBzcmNFdmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH1cbn07XG5cbi8qKlxuICogd2hlbiB0aGUgdG91Y2hBY3Rpb25zIGFyZSBjb2xsZWN0ZWQgdGhleSBhcmUgbm90IGEgdmFsaWQgdmFsdWUsIHNvIHdlIG5lZWQgdG8gY2xlYW4gdGhpbmdzIHVwLiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gYWN0aW9uc1xuICogQHJldHVybnMgeyp9XG4gKi9cbmZ1bmN0aW9uIGNsZWFuVG91Y2hBY3Rpb25zKGFjdGlvbnMpIHtcbiAgICAvLyBub25lXG4gICAgaWYgKGluU3RyKGFjdGlvbnMsIFRPVUNIX0FDVElPTl9OT05FKSkge1xuICAgICAgICByZXR1cm4gVE9VQ0hfQUNUSU9OX05PTkU7XG4gICAgfVxuXG4gICAgdmFyIGhhc1BhblggPSBpblN0cihhY3Rpb25zLCBUT1VDSF9BQ1RJT05fUEFOX1gpO1xuICAgIHZhciBoYXNQYW5ZID0gaW5TdHIoYWN0aW9ucywgVE9VQ0hfQUNUSU9OX1BBTl9ZKTtcblxuICAgIC8vIGlmIGJvdGggcGFuLXggYW5kIHBhbi15IGFyZSBzZXQgKGRpZmZlcmVudCByZWNvZ25pemVyc1xuICAgIC8vIGZvciBkaWZmZXJlbnQgZGlyZWN0aW9ucywgZS5nLiBob3Jpem9udGFsIHBhbiBidXQgdmVydGljYWwgc3dpcGU/KVxuICAgIC8vIHdlIG5lZWQgbm9uZSAoYXMgb3RoZXJ3aXNlIHdpdGggcGFuLXggcGFuLXkgY29tYmluZWQgbm9uZSBvZiB0aGVzZVxuICAgIC8vIHJlY29nbml6ZXJzIHdpbGwgd29yaywgc2luY2UgdGhlIGJyb3dzZXIgd291bGQgaGFuZGxlIGFsbCBwYW5uaW5nXG4gICAgaWYgKGhhc1BhblggJiYgaGFzUGFuWSkge1xuICAgICAgICByZXR1cm4gVE9VQ0hfQUNUSU9OX05PTkU7XG4gICAgfVxuXG4gICAgLy8gcGFuLXggT1IgcGFuLXlcbiAgICBpZiAoaGFzUGFuWCB8fCBoYXNQYW5ZKSB7XG4gICAgICAgIHJldHVybiBoYXNQYW5YID8gVE9VQ0hfQUNUSU9OX1BBTl9YIDogVE9VQ0hfQUNUSU9OX1BBTl9ZO1xuICAgIH1cblxuICAgIC8vIG1hbmlwdWxhdGlvblxuICAgIGlmIChpblN0cihhY3Rpb25zLCBUT1VDSF9BQ1RJT05fTUFOSVBVTEFUSU9OKSkge1xuICAgICAgICByZXR1cm4gVE9VQ0hfQUNUSU9OX01BTklQVUxBVElPTjtcbiAgICB9XG5cbiAgICByZXR1cm4gVE9VQ0hfQUNUSU9OX0FVVE87XG59XG5cbmZ1bmN0aW9uIGdldFRvdWNoQWN0aW9uUHJvcHMoKSB7XG4gICAgaWYgKCFOQVRJVkVfVE9VQ0hfQUNUSU9OKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgdmFyIHRvdWNoTWFwID0ge307XG4gICAgdmFyIGNzc1N1cHBvcnRzID0gd2luZG93LkNTUyAmJiB3aW5kb3cuQ1NTLnN1cHBvcnRzO1xuICAgIFsnYXV0bycsICdtYW5pcHVsYXRpb24nLCAncGFuLXknLCAncGFuLXgnLCAncGFuLXggcGFuLXknLCAnbm9uZSddLmZvckVhY2goZnVuY3Rpb24odmFsKSB7XG5cbiAgICAgICAgLy8gSWYgY3NzLnN1cHBvcnRzIGlzIG5vdCBzdXBwb3J0ZWQgYnV0IHRoZXJlIGlzIG5hdGl2ZSB0b3VjaC1hY3Rpb24gYXNzdW1lIGl0IHN1cHBvcnRzXG4gICAgICAgIC8vIGFsbCB2YWx1ZXMuIFRoaXMgaXMgdGhlIGNhc2UgZm9yIElFIDEwIGFuZCAxMS5cbiAgICAgICAgdG91Y2hNYXBbdmFsXSA9IGNzc1N1cHBvcnRzID8gd2luZG93LkNTUy5zdXBwb3J0cygndG91Y2gtYWN0aW9uJywgdmFsKSA6IHRydWU7XG4gICAgfSk7XG4gICAgcmV0dXJuIHRvdWNoTWFwO1xufVxuXG4vKipcbiAqIFJlY29nbml6ZXIgZmxvdyBleHBsYWluZWQ7ICpcbiAqIEFsbCByZWNvZ25pemVycyBoYXZlIHRoZSBpbml0aWFsIHN0YXRlIG9mIFBPU1NJQkxFIHdoZW4gYSBpbnB1dCBzZXNzaW9uIHN0YXJ0cy5cbiAqIFRoZSBkZWZpbml0aW9uIG9mIGEgaW5wdXQgc2Vzc2lvbiBpcyBmcm9tIHRoZSBmaXJzdCBpbnB1dCB1bnRpbCB0aGUgbGFzdCBpbnB1dCwgd2l0aCBhbGwgaXQncyBtb3ZlbWVudCBpbiBpdC4gKlxuICogRXhhbXBsZSBzZXNzaW9uIGZvciBtb3VzZS1pbnB1dDogbW91c2Vkb3duIC0+IG1vdXNlbW92ZSAtPiBtb3VzZXVwXG4gKlxuICogT24gZWFjaCByZWNvZ25pemluZyBjeWNsZSAoc2VlIE1hbmFnZXIucmVjb2duaXplKSB0aGUgLnJlY29nbml6ZSgpIG1ldGhvZCBpcyBleGVjdXRlZFxuICogd2hpY2ggZGV0ZXJtaW5lcyB3aXRoIHN0YXRlIGl0IHNob3VsZCBiZS5cbiAqXG4gKiBJZiB0aGUgcmVjb2duaXplciBoYXMgdGhlIHN0YXRlIEZBSUxFRCwgQ0FOQ0VMTEVEIG9yIFJFQ09HTklaRUQgKGVxdWFscyBFTkRFRCksIGl0IGlzIHJlc2V0IHRvXG4gKiBQT1NTSUJMRSB0byBnaXZlIGl0IGFub3RoZXIgY2hhbmdlIG9uIHRoZSBuZXh0IGN5Y2xlLlxuICpcbiAqICAgICAgICAgICAgICAgUG9zc2libGVcbiAqICAgICAgICAgICAgICAgICAgfFxuICogICAgICAgICAgICArLS0tLS0rLS0tLS0tLS0tLS0tLS0tK1xuICogICAgICAgICAgICB8ICAgICAgICAgICAgICAgICAgICAgfFxuICogICAgICArLS0tLS0rLS0tLS0rICAgICAgICAgICAgICAgfFxuICogICAgICB8ICAgICAgICAgICB8ICAgICAgICAgICAgICAgfFxuICogICBGYWlsZWQgICAgICBDYW5jZWxsZWQgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICstLS0tLS0tKy0tLS0tLStcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICB8ICAgICAgICAgICAgICB8XG4gKiAgICAgICAgICAgICAgICAgICAgICBSZWNvZ25pemVkICAgICAgIEJlZ2FuXG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfFxuICogICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIENoYW5nZWRcbiAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB8XG4gKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBFbmRlZC9SZWNvZ25pemVkXG4gKi9cbnZhciBTVEFURV9QT1NTSUJMRSA9IDE7XG52YXIgU1RBVEVfQkVHQU4gPSAyO1xudmFyIFNUQVRFX0NIQU5HRUQgPSA0O1xudmFyIFNUQVRFX0VOREVEID0gODtcbnZhciBTVEFURV9SRUNPR05JWkVEID0gU1RBVEVfRU5ERUQ7XG52YXIgU1RBVEVfQ0FOQ0VMTEVEID0gMTY7XG52YXIgU1RBVEVfRkFJTEVEID0gMzI7XG5cbi8qKlxuICogUmVjb2duaXplclxuICogRXZlcnkgcmVjb2duaXplciBuZWVkcyB0byBleHRlbmQgZnJvbSB0aGlzIGNsYXNzLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICovXG5mdW5jdGlvbiBSZWNvZ25pemVyKG9wdGlvbnMpIHtcbiAgICB0aGlzLm9wdGlvbnMgPSBhc3NpZ24oe30sIHRoaXMuZGVmYXVsdHMsIG9wdGlvbnMgfHwge30pO1xuXG4gICAgdGhpcy5pZCA9IHVuaXF1ZUlkKCk7XG5cbiAgICB0aGlzLm1hbmFnZXIgPSBudWxsO1xuXG4gICAgLy8gZGVmYXVsdCBpcyBlbmFibGUgdHJ1ZVxuICAgIHRoaXMub3B0aW9ucy5lbmFibGUgPSBpZlVuZGVmaW5lZCh0aGlzLm9wdGlvbnMuZW5hYmxlLCB0cnVlKTtcblxuICAgIHRoaXMuc3RhdGUgPSBTVEFURV9QT1NTSUJMRTtcblxuICAgIHRoaXMuc2ltdWx0YW5lb3VzID0ge307XG4gICAgdGhpcy5yZXF1aXJlRmFpbCA9IFtdO1xufVxuXG5SZWNvZ25pemVyLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBAdmlydHVhbFxuICAgICAqIEB0eXBlIHtPYmplY3R9XG4gICAgICovXG4gICAgZGVmYXVsdHM6IHt9LFxuXG4gICAgLyoqXG4gICAgICogc2V0IG9wdGlvbnNcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gb3B0aW9uc1xuICAgICAqIEByZXR1cm4ge1JlY29nbml6ZXJ9XG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIGFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIGFsc28gdXBkYXRlIHRoZSB0b3VjaEFjdGlvbiwgaW4gY2FzZSBzb21ldGhpbmcgY2hhbmdlZCBhYm91dCB0aGUgZGlyZWN0aW9ucy9lbmFibGVkIHN0YXRlXG4gICAgICAgIHRoaXMubWFuYWdlciAmJiB0aGlzLm1hbmFnZXIudG91Y2hBY3Rpb24udXBkYXRlKCk7XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZWNvZ25pemUgc2ltdWx0YW5lb3VzIHdpdGggYW4gb3RoZXIgcmVjb2duaXplci5cbiAgICAgKiBAcGFyYW0ge1JlY29nbml6ZXJ9IG90aGVyUmVjb2duaXplclxuICAgICAqIEByZXR1cm5zIHtSZWNvZ25pemVyfSB0aGlzXG4gICAgICovXG4gICAgcmVjb2duaXplV2l0aDogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XG4gICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhvdGhlclJlY29nbml6ZXIsICdyZWNvZ25pemVXaXRoJywgdGhpcykpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHNpbXVsdGFuZW91cyA9IHRoaXMuc2ltdWx0YW5lb3VzO1xuICAgICAgICBvdGhlclJlY29nbml6ZXIgPSBnZXRSZWNvZ25pemVyQnlOYW1lSWZNYW5hZ2VyKG90aGVyUmVjb2duaXplciwgdGhpcyk7XG4gICAgICAgIGlmICghc2ltdWx0YW5lb3VzW290aGVyUmVjb2duaXplci5pZF0pIHtcbiAgICAgICAgICAgIHNpbXVsdGFuZW91c1tvdGhlclJlY29nbml6ZXIuaWRdID0gb3RoZXJSZWNvZ25pemVyO1xuICAgICAgICAgICAgb3RoZXJSZWNvZ25pemVyLnJlY29nbml6ZVdpdGgodGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGRyb3AgdGhlIHNpbXVsdGFuZW91cyBsaW5rLiBpdCBkb2VzbnQgcmVtb3ZlIHRoZSBsaW5rIG9uIHRoZSBvdGhlciByZWNvZ25pemVyLlxuICAgICAqIEBwYXJhbSB7UmVjb2duaXplcn0gb3RoZXJSZWNvZ25pemVyXG4gICAgICogQHJldHVybnMge1JlY29nbml6ZXJ9IHRoaXNcbiAgICAgKi9cbiAgICBkcm9wUmVjb2duaXplV2l0aDogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XG4gICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhvdGhlclJlY29nbml6ZXIsICdkcm9wUmVjb2duaXplV2l0aCcsIHRoaXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIG90aGVyUmVjb2duaXplciA9IGdldFJlY29nbml6ZXJCeU5hbWVJZk1hbmFnZXIob3RoZXJSZWNvZ25pemVyLCB0aGlzKTtcbiAgICAgICAgZGVsZXRlIHRoaXMuc2ltdWx0YW5lb3VzW290aGVyUmVjb2duaXplci5pZF07XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZWNvZ25pemVyIGNhbiBvbmx5IHJ1biB3aGVuIGFuIG90aGVyIGlzIGZhaWxpbmdcbiAgICAgKiBAcGFyYW0ge1JlY29nbml6ZXJ9IG90aGVyUmVjb2duaXplclxuICAgICAqIEByZXR1cm5zIHtSZWNvZ25pemVyfSB0aGlzXG4gICAgICovXG4gICAgcmVxdWlyZUZhaWx1cmU6IGZ1bmN0aW9uKG90aGVyUmVjb2duaXplcikge1xuICAgICAgICBpZiAoaW52b2tlQXJyYXlBcmcob3RoZXJSZWNvZ25pemVyLCAncmVxdWlyZUZhaWx1cmUnLCB0aGlzKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVxdWlyZUZhaWwgPSB0aGlzLnJlcXVpcmVGYWlsO1xuICAgICAgICBvdGhlclJlY29nbml6ZXIgPSBnZXRSZWNvZ25pemVyQnlOYW1lSWZNYW5hZ2VyKG90aGVyUmVjb2duaXplciwgdGhpcyk7XG4gICAgICAgIGlmIChpbkFycmF5KHJlcXVpcmVGYWlsLCBvdGhlclJlY29nbml6ZXIpID09PSAtMSkge1xuICAgICAgICAgICAgcmVxdWlyZUZhaWwucHVzaChvdGhlclJlY29nbml6ZXIpO1xuICAgICAgICAgICAgb3RoZXJSZWNvZ25pemVyLnJlcXVpcmVGYWlsdXJlKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBkcm9wIHRoZSByZXF1aXJlRmFpbHVyZSBsaW5rLiBpdCBkb2VzIG5vdCByZW1vdmUgdGhlIGxpbmsgb24gdGhlIG90aGVyIHJlY29nbml6ZXIuXG4gICAgICogQHBhcmFtIHtSZWNvZ25pemVyfSBvdGhlclJlY29nbml6ZXJcbiAgICAgKiBAcmV0dXJucyB7UmVjb2duaXplcn0gdGhpc1xuICAgICAqL1xuICAgIGRyb3BSZXF1aXJlRmFpbHVyZTogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XG4gICAgICAgIGlmIChpbnZva2VBcnJheUFyZyhvdGhlclJlY29nbml6ZXIsICdkcm9wUmVxdWlyZUZhaWx1cmUnLCB0aGlzKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBvdGhlclJlY29nbml6ZXIgPSBnZXRSZWNvZ25pemVyQnlOYW1lSWZNYW5hZ2VyKG90aGVyUmVjb2duaXplciwgdGhpcyk7XG4gICAgICAgIHZhciBpbmRleCA9IGluQXJyYXkodGhpcy5yZXF1aXJlRmFpbCwgb3RoZXJSZWNvZ25pemVyKTtcbiAgICAgICAgaWYgKGluZGV4ID4gLTEpIHtcbiAgICAgICAgICAgIHRoaXMucmVxdWlyZUZhaWwuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogaGFzIHJlcXVpcmUgZmFpbHVyZXMgYm9vbGVhblxuICAgICAqIEByZXR1cm5zIHtib29sZWFufVxuICAgICAqL1xuICAgIGhhc1JlcXVpcmVGYWlsdXJlczogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlcXVpcmVGYWlsLmxlbmd0aCA+IDA7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGlmIHRoZSByZWNvZ25pemVyIGNhbiByZWNvZ25pemUgc2ltdWx0YW5lb3VzIHdpdGggYW4gb3RoZXIgcmVjb2duaXplclxuICAgICAqIEBwYXJhbSB7UmVjb2duaXplcn0gb3RoZXJSZWNvZ25pemVyXG4gICAgICogQHJldHVybnMge0Jvb2xlYW59XG4gICAgICovXG4gICAgY2FuUmVjb2duaXplV2l0aDogZnVuY3Rpb24ob3RoZXJSZWNvZ25pemVyKSB7XG4gICAgICAgIHJldHVybiAhIXRoaXMuc2ltdWx0YW5lb3VzW290aGVyUmVjb2duaXplci5pZF07XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFlvdSBzaG91bGQgdXNlIGB0cnlFbWl0YCBpbnN0ZWFkIG9mIGBlbWl0YCBkaXJlY3RseSB0byBjaGVja1xuICAgICAqIHRoYXQgYWxsIHRoZSBuZWVkZWQgcmVjb2duaXplcnMgaGFzIGZhaWxlZCBiZWZvcmUgZW1pdHRpbmcuXG4gICAgICogQHBhcmFtIHtPYmplY3R9IGlucHV0XG4gICAgICovXG4gICAgZW1pdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xuXG4gICAgICAgIGZ1bmN0aW9uIGVtaXQoZXZlbnQpIHtcbiAgICAgICAgICAgIHNlbGYubWFuYWdlci5lbWl0KGV2ZW50LCBpbnB1dCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAncGFuc3RhcnQnIGFuZCAncGFubW92ZSdcbiAgICAgICAgaWYgKHN0YXRlIDwgU1RBVEVfRU5ERUQpIHtcbiAgICAgICAgICAgIGVtaXQoc2VsZi5vcHRpb25zLmV2ZW50ICsgc3RhdGVTdHIoc3RhdGUpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGVtaXQoc2VsZi5vcHRpb25zLmV2ZW50KTsgLy8gc2ltcGxlICdldmVudE5hbWUnIGV2ZW50c1xuXG4gICAgICAgIGlmIChpbnB1dC5hZGRpdGlvbmFsRXZlbnQpIHsgLy8gYWRkaXRpb25hbCBldmVudChwYW5sZWZ0LCBwYW5yaWdodCwgcGluY2hpbiwgcGluY2hvdXQuLi4pXG4gICAgICAgICAgICBlbWl0KGlucHV0LmFkZGl0aW9uYWxFdmVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBwYW5lbmQgYW5kIHBhbmNhbmNlbFxuICAgICAgICBpZiAoc3RhdGUgPj0gU1RBVEVfRU5ERUQpIHtcbiAgICAgICAgICAgIGVtaXQoc2VsZi5vcHRpb25zLmV2ZW50ICsgc3RhdGVTdHIoc3RhdGUpKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBDaGVjayB0aGF0IGFsbCB0aGUgcmVxdWlyZSBmYWlsdXJlIHJlY29nbml6ZXJzIGhhcyBmYWlsZWQsXG4gICAgICogaWYgdHJ1ZSwgaXQgZW1pdHMgYSBnZXN0dXJlIGV2ZW50LFxuICAgICAqIG90aGVyd2lzZSwgc2V0dXAgdGhlIHN0YXRlIHRvIEZBSUxFRC5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAgICAgKi9cbiAgICB0cnlFbWl0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICBpZiAodGhpcy5jYW5FbWl0KCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmVtaXQoaW5wdXQpO1xuICAgICAgICB9XG4gICAgICAgIC8vIGl0J3MgZmFpbGluZyBhbnl3YXlcbiAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFX0ZBSUxFRDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogY2FuIHdlIGVtaXQ/XG4gICAgICogQHJldHVybnMge2Jvb2xlYW59XG4gICAgICovXG4gICAgY2FuRW1pdDogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBpID0gMDtcbiAgICAgICAgd2hpbGUgKGkgPCB0aGlzLnJlcXVpcmVGYWlsLmxlbmd0aCkge1xuICAgICAgICAgICAgaWYgKCEodGhpcy5yZXF1aXJlRmFpbFtpXS5zdGF0ZSAmIChTVEFURV9GQUlMRUQgfCBTVEFURV9QT1NTSUJMRSkpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiB1cGRhdGUgdGhlIHJlY29nbml6ZXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXREYXRhXG4gICAgICovXG4gICAgcmVjb2duaXplOiBmdW5jdGlvbihpbnB1dERhdGEpIHtcbiAgICAgICAgLy8gbWFrZSBhIG5ldyBjb3B5IG9mIHRoZSBpbnB1dERhdGFcbiAgICAgICAgLy8gc28gd2UgY2FuIGNoYW5nZSB0aGUgaW5wdXREYXRhIHdpdGhvdXQgbWVzc2luZyB1cCB0aGUgb3RoZXIgcmVjb2duaXplcnNcbiAgICAgICAgdmFyIGlucHV0RGF0YUNsb25lID0gYXNzaWduKHt9LCBpbnB1dERhdGEpO1xuXG4gICAgICAgIC8vIGlzIGlzIGVuYWJsZWQgYW5kIGFsbG93IHJlY29nbml6aW5nP1xuICAgICAgICBpZiAoIWJvb2xPckZuKHRoaXMub3B0aW9ucy5lbmFibGUsIFt0aGlzLCBpbnB1dERhdGFDbG9uZV0pKSB7XG4gICAgICAgICAgICB0aGlzLnJlc2V0KCk7XG4gICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVfRkFJTEVEO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gcmVzZXQgd2hlbiB3ZSd2ZSByZWFjaGVkIHRoZSBlbmRcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgJiAoU1RBVEVfUkVDT0dOSVpFRCB8IFNUQVRFX0NBTkNFTExFRCB8IFNUQVRFX0ZBSUxFRCkpIHtcbiAgICAgICAgICAgIHRoaXMuc3RhdGUgPSBTVEFURV9QT1NTSUJMRTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc3RhdGUgPSB0aGlzLnByb2Nlc3MoaW5wdXREYXRhQ2xvbmUpO1xuXG4gICAgICAgIC8vIHRoZSByZWNvZ25pemVyIGhhcyByZWNvZ25pemVkIGEgZ2VzdHVyZVxuICAgICAgICAvLyBzbyB0cmlnZ2VyIGFuIGV2ZW50XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICYgKFNUQVRFX0JFR0FOIHwgU1RBVEVfQ0hBTkdFRCB8IFNUQVRFX0VOREVEIHwgU1RBVEVfQ0FOQ0VMTEVEKSkge1xuICAgICAgICAgICAgdGhpcy50cnlFbWl0KGlucHV0RGF0YUNsb25lKTtcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiByZXR1cm4gdGhlIHN0YXRlIG9mIHRoZSByZWNvZ25pemVyXG4gICAgICogdGhlIGFjdHVhbCByZWNvZ25pemluZyBoYXBwZW5zIGluIHRoaXMgbWV0aG9kXG4gICAgICogQHZpcnR1YWxcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXREYXRhXG4gICAgICogQHJldHVybnMge0NvbnN0fSBTVEFURVxuICAgICAqL1xuICAgIHByb2Nlc3M6IGZ1bmN0aW9uKGlucHV0RGF0YSkgeyB9LCAvLyBqc2hpbnQgaWdub3JlOmxpbmVcblxuICAgIC8qKlxuICAgICAqIHJldHVybiB0aGUgcHJlZmVycmVkIHRvdWNoLWFjdGlvblxuICAgICAqIEB2aXJ0dWFsXG4gICAgICogQHJldHVybnMge0FycmF5fVxuICAgICAqL1xuICAgIGdldFRvdWNoQWN0aW9uOiBmdW5jdGlvbigpIHsgfSxcblxuICAgIC8qKlxuICAgICAqIGNhbGxlZCB3aGVuIHRoZSBnZXN0dXJlIGlzbid0IGFsbG93ZWQgdG8gcmVjb2duaXplXG4gICAgICogbGlrZSB3aGVuIGFub3RoZXIgaXMgYmVpbmcgcmVjb2duaXplZCBvciBpdCBpcyBkaXNhYmxlZFxuICAgICAqIEB2aXJ0dWFsXG4gICAgICovXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkgeyB9XG59O1xuXG4vKipcbiAqIGdldCBhIHVzYWJsZSBzdHJpbmcsIHVzZWQgYXMgZXZlbnQgcG9zdGZpeFxuICogQHBhcmFtIHtDb25zdH0gc3RhdGVcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0YXRlXG4gKi9cbmZ1bmN0aW9uIHN0YXRlU3RyKHN0YXRlKSB7XG4gICAgaWYgKHN0YXRlICYgU1RBVEVfQ0FOQ0VMTEVEKSB7XG4gICAgICAgIHJldHVybiAnY2FuY2VsJztcbiAgICB9IGVsc2UgaWYgKHN0YXRlICYgU1RBVEVfRU5ERUQpIHtcbiAgICAgICAgcmV0dXJuICdlbmQnO1xuICAgIH0gZWxzZSBpZiAoc3RhdGUgJiBTVEFURV9DSEFOR0VEKSB7XG4gICAgICAgIHJldHVybiAnbW92ZSc7XG4gICAgfSBlbHNlIGlmIChzdGF0ZSAmIFNUQVRFX0JFR0FOKSB7XG4gICAgICAgIHJldHVybiAnc3RhcnQnO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG59XG5cbi8qKlxuICogZGlyZWN0aW9uIGNvbnMgdG8gc3RyaW5nXG4gKiBAcGFyYW0ge0NvbnN0fSBkaXJlY3Rpb25cbiAqIEByZXR1cm5zIHtTdHJpbmd9XG4gKi9cbmZ1bmN0aW9uIGRpcmVjdGlvblN0cihkaXJlY3Rpb24pIHtcbiAgICBpZiAoZGlyZWN0aW9uID09IERJUkVDVElPTl9ET1dOKSB7XG4gICAgICAgIHJldHVybiAnZG93bic7XG4gICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRElSRUNUSU9OX1VQKSB7XG4gICAgICAgIHJldHVybiAndXAnO1xuICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uID09IERJUkVDVElPTl9MRUZUKSB7XG4gICAgICAgIHJldHVybiAnbGVmdCc7XG4gICAgfSBlbHNlIGlmIChkaXJlY3Rpb24gPT0gRElSRUNUSU9OX1JJR0hUKSB7XG4gICAgICAgIHJldHVybiAncmlnaHQnO1xuICAgIH1cbiAgICByZXR1cm4gJyc7XG59XG5cbi8qKlxuICogZ2V0IGEgcmVjb2duaXplciBieSBuYW1lIGlmIGl0IGlzIGJvdW5kIHRvIGEgbWFuYWdlclxuICogQHBhcmFtIHtSZWNvZ25pemVyfFN0cmluZ30gb3RoZXJSZWNvZ25pemVyXG4gKiBAcGFyYW0ge1JlY29nbml6ZXJ9IHJlY29nbml6ZXJcbiAqIEByZXR1cm5zIHtSZWNvZ25pemVyfVxuICovXG5mdW5jdGlvbiBnZXRSZWNvZ25pemVyQnlOYW1lSWZNYW5hZ2VyKG90aGVyUmVjb2duaXplciwgcmVjb2duaXplcikge1xuICAgIHZhciBtYW5hZ2VyID0gcmVjb2duaXplci5tYW5hZ2VyO1xuICAgIGlmIChtYW5hZ2VyKSB7XG4gICAgICAgIHJldHVybiBtYW5hZ2VyLmdldChvdGhlclJlY29nbml6ZXIpO1xuICAgIH1cbiAgICByZXR1cm4gb3RoZXJSZWNvZ25pemVyO1xufVxuXG4vKipcbiAqIFRoaXMgcmVjb2duaXplciBpcyBqdXN0IHVzZWQgYXMgYSBiYXNlIGZvciB0aGUgc2ltcGxlIGF0dHJpYnV0ZSByZWNvZ25pemVycy5cbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBBdHRyUmVjb2duaXplcigpIHtcbiAgICBSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG59XG5cbmluaGVyaXQoQXR0clJlY29nbml6ZXIsIFJlY29nbml6ZXIsIHtcbiAgICAvKipcbiAgICAgKiBAbmFtZXNwYWNlXG4gICAgICogQG1lbWJlcm9mIEF0dHJSZWNvZ25pemVyXG4gICAgICovXG4gICAgZGVmYXVsdHM6IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIHtOdW1iZXJ9XG4gICAgICAgICAqIEBkZWZhdWx0IDFcbiAgICAgICAgICovXG4gICAgICAgIHBvaW50ZXJzOiAxXG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVzZWQgdG8gY2hlY2sgaWYgaXQgdGhlIHJlY29nbml6ZXIgcmVjZWl2ZXMgdmFsaWQgaW5wdXQsIGxpa2UgaW5wdXQuZGlzdGFuY2UgPiAxMC5cbiAgICAgKiBAbWVtYmVyb2YgQXR0clJlY29nbml6ZXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAgICAgKiBAcmV0dXJucyB7Qm9vbGVhbn0gcmVjb2duaXplZFxuICAgICAqL1xuICAgIGF0dHJUZXN0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgb3B0aW9uUG9pbnRlcnMgPSB0aGlzLm9wdGlvbnMucG9pbnRlcnM7XG4gICAgICAgIHJldHVybiBvcHRpb25Qb2ludGVycyA9PT0gMCB8fCBpbnB1dC5wb2ludGVycy5sZW5ndGggPT09IG9wdGlvblBvaW50ZXJzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQcm9jZXNzIHRoZSBpbnB1dCBhbmQgcmV0dXJuIHRoZSBzdGF0ZSBmb3IgdGhlIHJlY29nbml6ZXJcbiAgICAgKiBAbWVtYmVyb2YgQXR0clJlY29nbml6ZXJcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXRcbiAgICAgKiBAcmV0dXJucyB7Kn0gU3RhdGVcbiAgICAgKi9cbiAgICBwcm9jZXNzOiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgc3RhdGUgPSB0aGlzLnN0YXRlO1xuICAgICAgICB2YXIgZXZlbnRUeXBlID0gaW5wdXQuZXZlbnRUeXBlO1xuXG4gICAgICAgIHZhciBpc1JlY29nbml6ZWQgPSBzdGF0ZSAmIChTVEFURV9CRUdBTiB8IFNUQVRFX0NIQU5HRUQpO1xuICAgICAgICB2YXIgaXNWYWxpZCA9IHRoaXMuYXR0clRlc3QoaW5wdXQpO1xuXG4gICAgICAgIC8vIG9uIGNhbmNlbCBpbnB1dCBhbmQgd2UndmUgcmVjb2duaXplZCBiZWZvcmUsIHJldHVybiBTVEFURV9DQU5DRUxMRURcbiAgICAgICAgaWYgKGlzUmVjb2duaXplZCAmJiAoZXZlbnRUeXBlICYgSU5QVVRfQ0FOQ0VMIHx8ICFpc1ZhbGlkKSkge1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRlIHwgU1RBVEVfQ0FOQ0VMTEVEO1xuICAgICAgICB9IGVsc2UgaWYgKGlzUmVjb2duaXplZCB8fCBpc1ZhbGlkKSB7XG4gICAgICAgICAgICBpZiAoZXZlbnRUeXBlICYgSU5QVVRfRU5EKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0YXRlIHwgU1RBVEVfRU5ERUQ7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKCEoc3RhdGUgJiBTVEFURV9CRUdBTikpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gU1RBVEVfQkVHQU47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc3RhdGUgfCBTVEFURV9DSEFOR0VEO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBTVEFURV9GQUlMRUQ7XG4gICAgfVxufSk7XG5cbi8qKlxuICogUGFuXG4gKiBSZWNvZ25pemVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgZG93biBhbmQgbW92ZWQgaW4gdGhlIGFsbG93ZWQgZGlyZWN0aW9uLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBBdHRyUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBQYW5SZWNvZ25pemVyKCkge1xuICAgIEF0dHJSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICB0aGlzLnBYID0gbnVsbDtcbiAgICB0aGlzLnBZID0gbnVsbDtcbn1cblxuaW5oZXJpdChQYW5SZWNvZ25pemVyLCBBdHRyUmVjb2duaXplciwge1xuICAgIC8qKlxuICAgICAqIEBuYW1lc3BhY2VcbiAgICAgKiBAbWVtYmVyb2YgUGFuUmVjb2duaXplclxuICAgICAqL1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGV2ZW50OiAncGFuJyxcbiAgICAgICAgdGhyZXNob2xkOiAxMCxcbiAgICAgICAgcG9pbnRlcnM6IDEsXG4gICAgICAgIGRpcmVjdGlvbjogRElSRUNUSU9OX0FMTFxuICAgIH0sXG5cbiAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uO1xuICAgICAgICB2YXIgYWN0aW9ucyA9IFtdO1xuICAgICAgICBpZiAoZGlyZWN0aW9uICYgRElSRUNUSU9OX0hPUklaT05UQUwpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChUT1VDSF9BQ1RJT05fUEFOX1kpO1xuICAgICAgICB9XG4gICAgICAgIGlmIChkaXJlY3Rpb24gJiBESVJFQ1RJT05fVkVSVElDQUwpIHtcbiAgICAgICAgICAgIGFjdGlvbnMucHVzaChUT1VDSF9BQ1RJT05fUEFOX1gpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBhY3Rpb25zO1xuICAgIH0sXG5cbiAgICBkaXJlY3Rpb25UZXN0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgb3B0aW9ucyA9IHRoaXMub3B0aW9ucztcbiAgICAgICAgdmFyIGhhc01vdmVkID0gdHJ1ZTtcbiAgICAgICAgdmFyIGRpc3RhbmNlID0gaW5wdXQuZGlzdGFuY2U7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBpbnB1dC5kaXJlY3Rpb247XG4gICAgICAgIHZhciB4ID0gaW5wdXQuZGVsdGFYO1xuICAgICAgICB2YXIgeSA9IGlucHV0LmRlbHRhWTtcblxuICAgICAgICAvLyBsb2NrIHRvIGF4aXM/XG4gICAgICAgIGlmICghKGRpcmVjdGlvbiAmIG9wdGlvbnMuZGlyZWN0aW9uKSkge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuZGlyZWN0aW9uICYgRElSRUNUSU9OX0hPUklaT05UQUwpIHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSAoeCA9PT0gMCkgPyBESVJFQ1RJT05fTk9ORSA6ICh4IDwgMCkgPyBESVJFQ1RJT05fTEVGVCA6IERJUkVDVElPTl9SSUdIVDtcbiAgICAgICAgICAgICAgICBoYXNNb3ZlZCA9IHggIT0gdGhpcy5wWDtcbiAgICAgICAgICAgICAgICBkaXN0YW5jZSA9IE1hdGguYWJzKGlucHV0LmRlbHRhWCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpcmVjdGlvbiA9ICh5ID09PSAwKSA/IERJUkVDVElPTl9OT05FIDogKHkgPCAwKSA/IERJUkVDVElPTl9VUCA6IERJUkVDVElPTl9ET1dOO1xuICAgICAgICAgICAgICAgIGhhc01vdmVkID0geSAhPSB0aGlzLnBZO1xuICAgICAgICAgICAgICAgIGRpc3RhbmNlID0gTWF0aC5hYnMoaW5wdXQuZGVsdGFZKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpbnB1dC5kaXJlY3Rpb24gPSBkaXJlY3Rpb247XG4gICAgICAgIHJldHVybiBoYXNNb3ZlZCAmJiBkaXN0YW5jZSA+IG9wdGlvbnMudGhyZXNob2xkICYmIGRpcmVjdGlvbiAmIG9wdGlvbnMuZGlyZWN0aW9uO1xuICAgIH0sXG5cbiAgICBhdHRyVGVzdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIEF0dHJSZWNvZ25pemVyLnByb3RvdHlwZS5hdHRyVGVzdC5jYWxsKHRoaXMsIGlucHV0KSAmJlxuICAgICAgICAgICAgKHRoaXMuc3RhdGUgJiBTVEFURV9CRUdBTiB8fCAoISh0aGlzLnN0YXRlICYgU1RBVEVfQkVHQU4pICYmIHRoaXMuZGlyZWN0aW9uVGVzdChpbnB1dCkpKTtcbiAgICB9LFxuXG4gICAgZW1pdDogZnVuY3Rpb24oaW5wdXQpIHtcblxuICAgICAgICB0aGlzLnBYID0gaW5wdXQuZGVsdGFYO1xuICAgICAgICB0aGlzLnBZID0gaW5wdXQuZGVsdGFZO1xuXG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSBkaXJlY3Rpb25TdHIoaW5wdXQuZGlyZWN0aW9uKTtcblxuICAgICAgICBpZiAoZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICBpbnB1dC5hZGRpdGlvbmFsRXZlbnQgPSB0aGlzLm9wdGlvbnMuZXZlbnQgKyBkaXJlY3Rpb247XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fc3VwZXIuZW1pdC5jYWxsKHRoaXMsIGlucHV0KTtcbiAgICB9XG59KTtcblxuLyoqXG4gKiBQaW5jaFxuICogUmVjb2duaXplZCB3aGVuIHR3byBvciBtb3JlIHBvaW50ZXJzIGFyZSBtb3ZpbmcgdG93YXJkICh6b29tLWluKSBvciBhd2F5IGZyb20gZWFjaCBvdGhlciAoem9vbS1vdXQpLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBBdHRyUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBQaW5jaFJlY29nbml6ZXIoKSB7XG4gICAgQXR0clJlY29nbml6ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuaW5oZXJpdChQaW5jaFJlY29nbml6ZXIsIEF0dHJSZWNvZ25pemVyLCB7XG4gICAgLyoqXG4gICAgICogQG5hbWVzcGFjZVxuICAgICAqIEBtZW1iZXJvZiBQaW5jaFJlY29nbml6ZXJcbiAgICAgKi9cbiAgICBkZWZhdWx0czoge1xuICAgICAgICBldmVudDogJ3BpbmNoJyxcbiAgICAgICAgdGhyZXNob2xkOiAwLFxuICAgICAgICBwb2ludGVyczogMlxuICAgIH0sXG5cbiAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBbVE9VQ0hfQUNUSU9OX05PTkVdO1xuICAgIH0sXG5cbiAgICBhdHRyVGVzdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyLmF0dHJUZXN0LmNhbGwodGhpcywgaW5wdXQpICYmXG4gICAgICAgICAgICAoTWF0aC5hYnMoaW5wdXQuc2NhbGUgLSAxKSA+IHRoaXMub3B0aW9ucy50aHJlc2hvbGQgfHwgdGhpcy5zdGF0ZSAmIFNUQVRFX0JFR0FOKTtcbiAgICB9LFxuXG4gICAgZW1pdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgaWYgKGlucHV0LnNjYWxlICE9PSAxKSB7XG4gICAgICAgICAgICB2YXIgaW5PdXQgPSBpbnB1dC5zY2FsZSA8IDEgPyAnaW4nIDogJ291dCc7XG4gICAgICAgICAgICBpbnB1dC5hZGRpdGlvbmFsRXZlbnQgPSB0aGlzLm9wdGlvbnMuZXZlbnQgKyBpbk91dDtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLl9zdXBlci5lbWl0LmNhbGwodGhpcywgaW5wdXQpO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIFByZXNzXG4gKiBSZWNvZ25pemVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgZG93biBmb3IgeCBtcyB3aXRob3V0IGFueSBtb3ZlbWVudC5cbiAqIEBjb25zdHJ1Y3RvclxuICogQGV4dGVuZHMgUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBQcmVzc1JlY29nbml6ZXIoKSB7XG4gICAgUmVjb2duaXplci5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuXG4gICAgdGhpcy5fdGltZXIgPSBudWxsO1xuICAgIHRoaXMuX2lucHV0ID0gbnVsbDtcbn1cblxuaW5oZXJpdChQcmVzc1JlY29nbml6ZXIsIFJlY29nbml6ZXIsIHtcbiAgICAvKipcbiAgICAgKiBAbmFtZXNwYWNlXG4gICAgICogQG1lbWJlcm9mIFByZXNzUmVjb2duaXplclxuICAgICAqL1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGV2ZW50OiAncHJlc3MnLFxuICAgICAgICBwb2ludGVyczogMSxcbiAgICAgICAgdGltZTogMjUxLCAvLyBtaW5pbWFsIHRpbWUgb2YgdGhlIHBvaW50ZXIgdG8gYmUgcHJlc3NlZFxuICAgICAgICB0aHJlc2hvbGQ6IDkgLy8gYSBtaW5pbWFsIG1vdmVtZW50IGlzIG9rLCBidXQga2VlcCBpdCBsb3dcbiAgICB9LFxuXG4gICAgZ2V0VG91Y2hBY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gW1RPVUNIX0FDVElPTl9BVVRPXTtcbiAgICB9LFxuXG4gICAgcHJvY2VzczogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG4gICAgICAgIHZhciB2YWxpZFBvaW50ZXJzID0gaW5wdXQucG9pbnRlcnMubGVuZ3RoID09PSBvcHRpb25zLnBvaW50ZXJzO1xuICAgICAgICB2YXIgdmFsaWRNb3ZlbWVudCA9IGlucHV0LmRpc3RhbmNlIDwgb3B0aW9ucy50aHJlc2hvbGQ7XG4gICAgICAgIHZhciB2YWxpZFRpbWUgPSBpbnB1dC5kZWx0YVRpbWUgPiBvcHRpb25zLnRpbWU7XG5cbiAgICAgICAgdGhpcy5faW5wdXQgPSBpbnB1dDtcblxuICAgICAgICAvLyB3ZSBvbmx5IGFsbG93IGxpdHRsZSBtb3ZlbWVudFxuICAgICAgICAvLyBhbmQgd2UndmUgcmVhY2hlZCBhbiBlbmQgZXZlbnQsIHNvIGEgdGFwIGlzIHBvc3NpYmxlXG4gICAgICAgIGlmICghdmFsaWRNb3ZlbWVudCB8fCAhdmFsaWRQb2ludGVycyB8fCAoaW5wdXQuZXZlbnRUeXBlICYgKElOUFVUX0VORCB8IElOUFVUX0NBTkNFTCkgJiYgIXZhbGlkVGltZSkpIHtcbiAgICAgICAgICAgIHRoaXMucmVzZXQoKTtcbiAgICAgICAgfSBlbHNlIGlmIChpbnB1dC5ldmVudFR5cGUgJiBJTlBVVF9TVEFSVCkge1xuICAgICAgICAgICAgdGhpcy5yZXNldCgpO1xuICAgICAgICAgICAgdGhpcy5fdGltZXIgPSBzZXRUaW1lb3V0Q29udGV4dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0YXRlID0gU1RBVEVfUkVDT0dOSVpFRDtcbiAgICAgICAgICAgICAgICB0aGlzLnRyeUVtaXQoKTtcbiAgICAgICAgICAgIH0sIG9wdGlvbnMudGltZSwgdGhpcyk7XG4gICAgICAgIH0gZWxzZSBpZiAoaW5wdXQuZXZlbnRUeXBlICYgSU5QVVRfRU5EKSB7XG4gICAgICAgICAgICByZXR1cm4gU1RBVEVfUkVDT0dOSVpFRDtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gU1RBVEVfRkFJTEVEO1xuICAgIH0sXG5cbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICAgIGNsZWFyVGltZW91dCh0aGlzLl90aW1lcik7XG4gICAgfSxcblxuICAgIGVtaXQ6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIGlmICh0aGlzLnN0YXRlICE9PSBTVEFURV9SRUNPR05JWkVEKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaW5wdXQgJiYgKGlucHV0LmV2ZW50VHlwZSAmIElOUFVUX0VORCkpIHtcbiAgICAgICAgICAgIHRoaXMubWFuYWdlci5lbWl0KHRoaXMub3B0aW9ucy5ldmVudCArICd1cCcsIGlucHV0KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMuX2lucHV0LnRpbWVTdGFtcCA9IG5vdygpO1xuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQodGhpcy5vcHRpb25zLmV2ZW50LCB0aGlzLl9pbnB1dCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuLyoqXG4gKiBSb3RhdGVcbiAqIFJlY29nbml6ZWQgd2hlbiB0d28gb3IgbW9yZSBwb2ludGVyIGFyZSBtb3ZpbmcgaW4gYSBjaXJjdWxhciBtb3Rpb24uXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIEF0dHJSZWNvZ25pemVyXG4gKi9cbmZ1bmN0aW9uIFJvdGF0ZVJlY29nbml6ZXIoKSB7XG4gICAgQXR0clJlY29nbml6ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuaW5oZXJpdChSb3RhdGVSZWNvZ25pemVyLCBBdHRyUmVjb2duaXplciwge1xuICAgIC8qKlxuICAgICAqIEBuYW1lc3BhY2VcbiAgICAgKiBAbWVtYmVyb2YgUm90YXRlUmVjb2duaXplclxuICAgICAqL1xuICAgIGRlZmF1bHRzOiB7XG4gICAgICAgIGV2ZW50OiAncm90YXRlJyxcbiAgICAgICAgdGhyZXNob2xkOiAwLFxuICAgICAgICBwb2ludGVyczogMlxuICAgIH0sXG5cbiAgICBnZXRUb3VjaEFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgIHJldHVybiBbVE9VQ0hfQUNUSU9OX05PTkVdO1xuICAgIH0sXG5cbiAgICBhdHRyVGVzdDogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3N1cGVyLmF0dHJUZXN0LmNhbGwodGhpcywgaW5wdXQpICYmXG4gICAgICAgICAgICAoTWF0aC5hYnMoaW5wdXQucm90YXRpb24pID4gdGhpcy5vcHRpb25zLnRocmVzaG9sZCB8fCB0aGlzLnN0YXRlICYgU1RBVEVfQkVHQU4pO1xuICAgIH1cbn0pO1xuXG4vKipcbiAqIFN3aXBlXG4gKiBSZWNvZ25pemVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgbW92aW5nIGZhc3QgKHZlbG9jaXR5KSwgd2l0aCBlbm91Z2ggZGlzdGFuY2UgaW4gdGhlIGFsbG93ZWQgZGlyZWN0aW9uLlxuICogQGNvbnN0cnVjdG9yXG4gKiBAZXh0ZW5kcyBBdHRyUmVjb2duaXplclxuICovXG5mdW5jdGlvbiBTd2lwZVJlY29nbml6ZXIoKSB7XG4gICAgQXR0clJlY29nbml6ZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbn1cblxuaW5oZXJpdChTd2lwZVJlY29nbml6ZXIsIEF0dHJSZWNvZ25pemVyLCB7XG4gICAgLyoqXG4gICAgICogQG5hbWVzcGFjZVxuICAgICAqIEBtZW1iZXJvZiBTd2lwZVJlY29nbml6ZXJcbiAgICAgKi9cbiAgICBkZWZhdWx0czoge1xuICAgICAgICBldmVudDogJ3N3aXBlJyxcbiAgICAgICAgdGhyZXNob2xkOiAxMCxcbiAgICAgICAgdmVsb2NpdHk6IDAuMyxcbiAgICAgICAgZGlyZWN0aW9uOiBESVJFQ1RJT05fSE9SSVpPTlRBTCB8IERJUkVDVElPTl9WRVJUSUNBTCxcbiAgICAgICAgcG9pbnRlcnM6IDFcbiAgICB9LFxuXG4gICAgZ2V0VG91Y2hBY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gUGFuUmVjb2duaXplci5wcm90b3R5cGUuZ2V0VG91Y2hBY3Rpb24uY2FsbCh0aGlzKTtcbiAgICB9LFxuXG4gICAgYXR0clRlc3Q6IGZ1bmN0aW9uKGlucHV0KSB7XG4gICAgICAgIHZhciBkaXJlY3Rpb24gPSB0aGlzLm9wdGlvbnMuZGlyZWN0aW9uO1xuICAgICAgICB2YXIgdmVsb2NpdHk7XG5cbiAgICAgICAgaWYgKGRpcmVjdGlvbiAmIChESVJFQ1RJT05fSE9SSVpPTlRBTCB8IERJUkVDVElPTl9WRVJUSUNBTCkpIHtcbiAgICAgICAgICAgIHZlbG9jaXR5ID0gaW5wdXQub3ZlcmFsbFZlbG9jaXR5O1xuICAgICAgICB9IGVsc2UgaWYgKGRpcmVjdGlvbiAmIERJUkVDVElPTl9IT1JJWk9OVEFMKSB7XG4gICAgICAgICAgICB2ZWxvY2l0eSA9IGlucHV0Lm92ZXJhbGxWZWxvY2l0eVg7XG4gICAgICAgIH0gZWxzZSBpZiAoZGlyZWN0aW9uICYgRElSRUNUSU9OX1ZFUlRJQ0FMKSB7XG4gICAgICAgICAgICB2ZWxvY2l0eSA9IGlucHV0Lm92ZXJhbGxWZWxvY2l0eVk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fc3VwZXIuYXR0clRlc3QuY2FsbCh0aGlzLCBpbnB1dCkgJiZcbiAgICAgICAgICAgIGRpcmVjdGlvbiAmIGlucHV0Lm9mZnNldERpcmVjdGlvbiAmJlxuICAgICAgICAgICAgaW5wdXQuZGlzdGFuY2UgPiB0aGlzLm9wdGlvbnMudGhyZXNob2xkICYmXG4gICAgICAgICAgICBpbnB1dC5tYXhQb2ludGVycyA9PSB0aGlzLm9wdGlvbnMucG9pbnRlcnMgJiZcbiAgICAgICAgICAgIGFicyh2ZWxvY2l0eSkgPiB0aGlzLm9wdGlvbnMudmVsb2NpdHkgJiYgaW5wdXQuZXZlbnRUeXBlICYgSU5QVVRfRU5EO1xuICAgIH0sXG5cbiAgICBlbWl0OiBmdW5jdGlvbihpbnB1dCkge1xuICAgICAgICB2YXIgZGlyZWN0aW9uID0gZGlyZWN0aW9uU3RyKGlucHV0Lm9mZnNldERpcmVjdGlvbik7XG4gICAgICAgIGlmIChkaXJlY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMubWFuYWdlci5lbWl0KHRoaXMub3B0aW9ucy5ldmVudCArIGRpcmVjdGlvbiwgaW5wdXQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQodGhpcy5vcHRpb25zLmV2ZW50LCBpbnB1dCk7XG4gICAgfVxufSk7XG5cbi8qKlxuICogQSB0YXAgaXMgZWNvZ25pemVkIHdoZW4gdGhlIHBvaW50ZXIgaXMgZG9pbmcgYSBzbWFsbCB0YXAvY2xpY2suIE11bHRpcGxlIHRhcHMgYXJlIHJlY29nbml6ZWQgaWYgdGhleSBvY2N1clxuICogYmV0d2VlbiB0aGUgZ2l2ZW4gaW50ZXJ2YWwgYW5kIHBvc2l0aW9uLiBUaGUgZGVsYXkgb3B0aW9uIGNhbiBiZSB1c2VkIHRvIHJlY29nbml6ZSBtdWx0aS10YXBzIHdpdGhvdXQgZmlyaW5nXG4gKiBhIHNpbmdsZSB0YXAuXG4gKlxuICogVGhlIGV2ZW50RGF0YSBmcm9tIHRoZSBlbWl0dGVkIGV2ZW50IGNvbnRhaW5zIHRoZSBwcm9wZXJ0eSBgdGFwQ291bnRgLCB3aGljaCBjb250YWlucyB0aGUgYW1vdW50IG9mXG4gKiBtdWx0aS10YXBzIGJlaW5nIHJlY29nbml6ZWQuXG4gKiBAY29uc3RydWN0b3JcbiAqIEBleHRlbmRzIFJlY29nbml6ZXJcbiAqL1xuZnVuY3Rpb24gVGFwUmVjb2duaXplcigpIHtcbiAgICBSZWNvZ25pemVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG5cbiAgICAvLyBwcmV2aW91cyB0aW1lIGFuZCBjZW50ZXIsXG4gICAgLy8gdXNlZCBmb3IgdGFwIGNvdW50aW5nXG4gICAgdGhpcy5wVGltZSA9IGZhbHNlO1xuICAgIHRoaXMucENlbnRlciA9IGZhbHNlO1xuXG4gICAgdGhpcy5fdGltZXIgPSBudWxsO1xuICAgIHRoaXMuX2lucHV0ID0gbnVsbDtcbiAgICB0aGlzLmNvdW50ID0gMDtcbn1cblxuaW5oZXJpdChUYXBSZWNvZ25pemVyLCBSZWNvZ25pemVyLCB7XG4gICAgLyoqXG4gICAgICogQG5hbWVzcGFjZVxuICAgICAqIEBtZW1iZXJvZiBQaW5jaFJlY29nbml6ZXJcbiAgICAgKi9cbiAgICBkZWZhdWx0czoge1xuICAgICAgICBldmVudDogJ3RhcCcsXG4gICAgICAgIHBvaW50ZXJzOiAxLFxuICAgICAgICB0YXBzOiAxLFxuICAgICAgICBpbnRlcnZhbDogMzAwLCAvLyBtYXggdGltZSBiZXR3ZWVuIHRoZSBtdWx0aS10YXAgdGFwc1xuICAgICAgICB0aW1lOiAyNTAsIC8vIG1heCB0aW1lIG9mIHRoZSBwb2ludGVyIHRvIGJlIGRvd24gKGxpa2UgZmluZ2VyIG9uIHRoZSBzY3JlZW4pXG4gICAgICAgIHRocmVzaG9sZDogOSwgLy8gYSBtaW5pbWFsIG1vdmVtZW50IGlzIG9rLCBidXQga2VlcCBpdCBsb3dcbiAgICAgICAgcG9zVGhyZXNob2xkOiAxMCAvLyBhIG11bHRpLXRhcCBjYW4gYmUgYSBiaXQgb2ZmIHRoZSBpbml0aWFsIHBvc2l0aW9uXG4gICAgfSxcblxuICAgIGdldFRvdWNoQWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgcmV0dXJuIFtUT1VDSF9BQ1RJT05fTUFOSVBVTEFUSU9OXTtcbiAgICB9LFxuXG4gICAgcHJvY2VzczogZnVuY3Rpb24oaW5wdXQpIHtcbiAgICAgICAgdmFyIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnM7XG5cbiAgICAgICAgdmFyIHZhbGlkUG9pbnRlcnMgPSBpbnB1dC5wb2ludGVycy5sZW5ndGggPT09IG9wdGlvbnMucG9pbnRlcnM7XG4gICAgICAgIHZhciB2YWxpZE1vdmVtZW50ID0gaW5wdXQuZGlzdGFuY2UgPCBvcHRpb25zLnRocmVzaG9sZDtcbiAgICAgICAgdmFyIHZhbGlkVG91Y2hUaW1lID0gaW5wdXQuZGVsdGFUaW1lIDwgb3B0aW9ucy50aW1lO1xuXG4gICAgICAgIHRoaXMucmVzZXQoKTtcblxuICAgICAgICBpZiAoKGlucHV0LmV2ZW50VHlwZSAmIElOUFVUX1NUQVJUKSAmJiAodGhpcy5jb3VudCA9PT0gMCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmZhaWxUaW1lb3V0KCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyB3ZSBvbmx5IGFsbG93IGxpdHRsZSBtb3ZlbWVudFxuICAgICAgICAvLyBhbmQgd2UndmUgcmVhY2hlZCBhbiBlbmQgZXZlbnQsIHNvIGEgdGFwIGlzIHBvc3NpYmxlXG4gICAgICAgIGlmICh2YWxpZE1vdmVtZW50ICYmIHZhbGlkVG91Y2hUaW1lICYmIHZhbGlkUG9pbnRlcnMpIHtcbiAgICAgICAgICAgIGlmIChpbnB1dC5ldmVudFR5cGUgIT0gSU5QVVRfRU5EKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZmFpbFRpbWVvdXQoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHZhbGlkSW50ZXJ2YWwgPSB0aGlzLnBUaW1lID8gKGlucHV0LnRpbWVTdGFtcCAtIHRoaXMucFRpbWUgPCBvcHRpb25zLmludGVydmFsKSA6IHRydWU7XG4gICAgICAgICAgICB2YXIgdmFsaWRNdWx0aVRhcCA9ICF0aGlzLnBDZW50ZXIgfHwgZ2V0RGlzdGFuY2UodGhpcy5wQ2VudGVyLCBpbnB1dC5jZW50ZXIpIDwgb3B0aW9ucy5wb3NUaHJlc2hvbGQ7XG5cbiAgICAgICAgICAgIHRoaXMucFRpbWUgPSBpbnB1dC50aW1lU3RhbXA7XG4gICAgICAgICAgICB0aGlzLnBDZW50ZXIgPSBpbnB1dC5jZW50ZXI7XG5cbiAgICAgICAgICAgIGlmICghdmFsaWRNdWx0aVRhcCB8fCAhdmFsaWRJbnRlcnZhbCkge1xuICAgICAgICAgICAgICAgIHRoaXMuY291bnQgPSAxO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmNvdW50ICs9IDE7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX2lucHV0ID0gaW5wdXQ7XG5cbiAgICAgICAgICAgIC8vIGlmIHRhcCBjb3VudCBtYXRjaGVzIHdlIGhhdmUgcmVjb2duaXplZCBpdCxcbiAgICAgICAgICAgIC8vIGVsc2UgaXQgaGFzIGJlZ2FuIHJlY29nbml6aW5nLi4uXG4gICAgICAgICAgICB2YXIgdGFwQ291bnQgPSB0aGlzLmNvdW50ICUgb3B0aW9ucy50YXBzO1xuICAgICAgICAgICAgaWYgKHRhcENvdW50ID09PSAwKSB7XG4gICAgICAgICAgICAgICAgLy8gbm8gZmFpbGluZyByZXF1aXJlbWVudHMsIGltbWVkaWF0ZWx5IHRyaWdnZXIgdGhlIHRhcCBldmVudFxuICAgICAgICAgICAgICAgIC8vIG9yIHdhaXQgYXMgbG9uZyBhcyB0aGUgbXVsdGl0YXAgaW50ZXJ2YWwgdG8gdHJpZ2dlclxuICAgICAgICAgICAgICAgIGlmICghdGhpcy5oYXNSZXF1aXJlRmFpbHVyZXMoKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gU1RBVEVfUkVDT0dOSVpFRDtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXRDb250ZXh0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFX1JFQ09HTklaRUQ7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyeUVtaXQoKTtcbiAgICAgICAgICAgICAgICAgICAgfSwgb3B0aW9ucy5pbnRlcnZhbCwgdGhpcyk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBTVEFURV9CRUdBTjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFNUQVRFX0ZBSUxFRDtcbiAgICB9LFxuXG4gICAgZmFpbFRpbWVvdXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLl90aW1lciA9IHNldFRpbWVvdXRDb250ZXh0KGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgdGhpcy5zdGF0ZSA9IFNUQVRFX0ZBSUxFRDtcbiAgICAgICAgfSwgdGhpcy5vcHRpb25zLmludGVydmFsLCB0aGlzKTtcbiAgICAgICAgcmV0dXJuIFNUQVRFX0ZBSUxFRDtcbiAgICB9LFxuXG4gICAgcmVzZXQ6IGZ1bmN0aW9uKCkge1xuICAgICAgICBjbGVhclRpbWVvdXQodGhpcy5fdGltZXIpO1xuICAgIH0sXG5cbiAgICBlbWl0OiBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKHRoaXMuc3RhdGUgPT0gU1RBVEVfUkVDT0dOSVpFRCkge1xuICAgICAgICAgICAgdGhpcy5faW5wdXQudGFwQ291bnQgPSB0aGlzLmNvdW50O1xuICAgICAgICAgICAgdGhpcy5tYW5hZ2VyLmVtaXQodGhpcy5vcHRpb25zLmV2ZW50LCB0aGlzLl9pbnB1dCk7XG4gICAgICAgIH1cbiAgICB9XG59KTtcblxuLyoqXG4gKiBTaW1wbGUgd2F5IHRvIGNyZWF0ZSBhIG1hbmFnZXIgd2l0aCBhIGRlZmF1bHQgc2V0IG9mIHJlY29nbml6ZXJzLlxuICogQHBhcmFtIHtIVE1MRWxlbWVudH0gZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IFtvcHRpb25zXVxuICogQGNvbnN0cnVjdG9yXG4gKi9cbmZ1bmN0aW9uIEhhbW1lcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgb3B0aW9ucy5yZWNvZ25pemVycyA9IGlmVW5kZWZpbmVkKG9wdGlvbnMucmVjb2duaXplcnMsIEhhbW1lci5kZWZhdWx0cy5wcmVzZXQpO1xuICAgIHJldHVybiBuZXcgTWFuYWdlcihlbGVtZW50LCBvcHRpb25zKTtcbn1cblxuLyoqXG4gKiBAY29uc3Qge3N0cmluZ31cbiAqL1xuSGFtbWVyLlZFUlNJT04gPSAnMi4wLjcnO1xuXG4vKipcbiAqIGRlZmF1bHQgc2V0dGluZ3NcbiAqIEBuYW1lc3BhY2VcbiAqL1xuSGFtbWVyLmRlZmF1bHRzID0ge1xuICAgIC8qKlxuICAgICAqIHNldCBpZiBET00gZXZlbnRzIGFyZSBiZWluZyB0cmlnZ2VyZWQuXG4gICAgICogQnV0IHRoaXMgaXMgc2xvd2VyIGFuZCB1bnVzZWQgYnkgc2ltcGxlIGltcGxlbWVudGF0aW9ucywgc28gZGlzYWJsZWQgYnkgZGVmYXVsdC5cbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCBmYWxzZVxuICAgICAqL1xuICAgIGRvbUV2ZW50czogZmFsc2UsXG5cbiAgICAvKipcbiAgICAgKiBUaGUgdmFsdWUgZm9yIHRoZSB0b3VjaEFjdGlvbiBwcm9wZXJ0eS9mYWxsYmFjay5cbiAgICAgKiBXaGVuIHNldCB0byBgY29tcHV0ZWAgaXQgd2lsbCBtYWdpY2FsbHkgc2V0IHRoZSBjb3JyZWN0IHZhbHVlIGJhc2VkIG9uIHRoZSBhZGRlZCByZWNvZ25pemVycy5cbiAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAqIEBkZWZhdWx0IGNvbXB1dGVcbiAgICAgKi9cbiAgICB0b3VjaEFjdGlvbjogVE9VQ0hfQUNUSU9OX0NPTVBVVEUsXG5cbiAgICAvKipcbiAgICAgKiBAdHlwZSB7Qm9vbGVhbn1cbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgZW5hYmxlOiB0cnVlLFxuXG4gICAgLyoqXG4gICAgICogRVhQRVJJTUVOVEFMIEZFQVRVUkUgLS0gY2FuIGJlIHJlbW92ZWQvY2hhbmdlZFxuICAgICAqIENoYW5nZSB0aGUgcGFyZW50IGlucHV0IHRhcmdldCBlbGVtZW50LlxuICAgICAqIElmIE51bGwsIHRoZW4gaXQgaXMgYmVpbmcgc2V0IHRoZSB0byBtYWluIGVsZW1lbnQuXG4gICAgICogQHR5cGUge051bGx8RXZlbnRUYXJnZXR9XG4gICAgICogQGRlZmF1bHQgbnVsbFxuICAgICAqL1xuICAgIGlucHV0VGFyZ2V0OiBudWxsLFxuXG4gICAgLyoqXG4gICAgICogZm9yY2UgYW4gaW5wdXQgY2xhc3NcbiAgICAgKiBAdHlwZSB7TnVsbHxGdW5jdGlvbn1cbiAgICAgKiBAZGVmYXVsdCBudWxsXG4gICAgICovXG4gICAgaW5wdXRDbGFzczogbnVsbCxcblxuICAgIC8qKlxuICAgICAqIERlZmF1bHQgcmVjb2duaXplciBzZXR1cCB3aGVuIGNhbGxpbmcgYEhhbW1lcigpYFxuICAgICAqIFdoZW4gY3JlYXRpbmcgYSBuZXcgTWFuYWdlciB0aGVzZSB3aWxsIGJlIHNraXBwZWQuXG4gICAgICogQHR5cGUge0FycmF5fVxuICAgICAqL1xuICAgIHByZXNldDogW1xuICAgICAgICAvLyBSZWNvZ25pemVyQ2xhc3MsIG9wdGlvbnMsIFtyZWNvZ25pemVXaXRoLCAuLi5dLCBbcmVxdWlyZUZhaWx1cmUsIC4uLl1cbiAgICAgICAgW1JvdGF0ZVJlY29nbml6ZXIsIHtlbmFibGU6IGZhbHNlfV0sXG4gICAgICAgIFtQaW5jaFJlY29nbml6ZXIsIHtlbmFibGU6IGZhbHNlfSwgWydyb3RhdGUnXV0sXG4gICAgICAgIFtTd2lwZVJlY29nbml6ZXIsIHtkaXJlY3Rpb246IERJUkVDVElPTl9IT1JJWk9OVEFMfV0sXG4gICAgICAgIFtQYW5SZWNvZ25pemVyLCB7ZGlyZWN0aW9uOiBESVJFQ1RJT05fSE9SSVpPTlRBTH0sIFsnc3dpcGUnXV0sXG4gICAgICAgIFtUYXBSZWNvZ25pemVyXSxcbiAgICAgICAgW1RhcFJlY29nbml6ZXIsIHtldmVudDogJ2RvdWJsZXRhcCcsIHRhcHM6IDJ9LCBbJ3RhcCddXSxcbiAgICAgICAgW1ByZXNzUmVjb2duaXplcl1cbiAgICBdLFxuXG4gICAgLyoqXG4gICAgICogU29tZSBDU1MgcHJvcGVydGllcyBjYW4gYmUgdXNlZCB0byBpbXByb3ZlIHRoZSB3b3JraW5nIG9mIEhhbW1lci5cbiAgICAgKiBBZGQgdGhlbSB0byB0aGlzIG1ldGhvZCBhbmQgdGhleSB3aWxsIGJlIHNldCB3aGVuIGNyZWF0aW5nIGEgbmV3IE1hbmFnZXIuXG4gICAgICogQG5hbWVzcGFjZVxuICAgICAqL1xuICAgIGNzc1Byb3BzOiB7XG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNhYmxlcyB0ZXh0IHNlbGVjdGlvbiB0byBpbXByb3ZlIHRoZSBkcmFnZ2luZyBnZXN0dXJlLiBNYWlubHkgZm9yIGRlc2t0b3AgYnJvd3NlcnMuXG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICAgICAqIEBkZWZhdWx0ICdub25lJ1xuICAgICAgICAgKi9cbiAgICAgICAgdXNlclNlbGVjdDogJ25vbmUnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNhYmxlIHRoZSBXaW5kb3dzIFBob25lIGdyaXBwZXJzIHdoZW4gcHJlc3NpbmcgYW4gZWxlbWVudC5cbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICogQGRlZmF1bHQgJ25vbmUnXG4gICAgICAgICAqL1xuICAgICAgICB0b3VjaFNlbGVjdDogJ25vbmUnLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNhYmxlcyB0aGUgZGVmYXVsdCBjYWxsb3V0IHNob3duIHdoZW4geW91IHRvdWNoIGFuZCBob2xkIGEgdG91Y2ggdGFyZ2V0LlxuICAgICAgICAgKiBPbiBpT1MsIHdoZW4geW91IHRvdWNoIGFuZCBob2xkIGEgdG91Y2ggdGFyZ2V0IHN1Y2ggYXMgYSBsaW5rLCBTYWZhcmkgZGlzcGxheXNcbiAgICAgICAgICogYSBjYWxsb3V0IGNvbnRhaW5pbmcgaW5mb3JtYXRpb24gYWJvdXQgdGhlIGxpbmsuIFRoaXMgcHJvcGVydHkgYWxsb3dzIHlvdSB0byBkaXNhYmxlIHRoYXQgY2FsbG91dC5cbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICogQGRlZmF1bHQgJ25vbmUnXG4gICAgICAgICAqL1xuICAgICAgICB0b3VjaENhbGxvdXQ6ICdub25lJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3BlY2lmaWVzIHdoZXRoZXIgem9vbWluZyBpcyBlbmFibGVkLiBVc2VkIGJ5IElFMTA+XG4gICAgICAgICAqIEB0eXBlIHtTdHJpbmd9XG4gICAgICAgICAqIEBkZWZhdWx0ICdub25lJ1xuICAgICAgICAgKi9cbiAgICAgICAgY29udGVudFpvb21pbmc6ICdub25lJyxcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3BlY2lmaWVzIHRoYXQgYW4gZW50aXJlIGVsZW1lbnQgc2hvdWxkIGJlIGRyYWdnYWJsZSBpbnN0ZWFkIG9mIGl0cyBjb250ZW50cy4gTWFpbmx5IGZvciBkZXNrdG9wIGJyb3dzZXJzLlxuICAgICAgICAgKiBAdHlwZSB7U3RyaW5nfVxuICAgICAgICAgKiBAZGVmYXVsdCAnbm9uZSdcbiAgICAgICAgICovXG4gICAgICAgIHVzZXJEcmFnOiAnbm9uZScsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIE92ZXJyaWRlcyB0aGUgaGlnaGxpZ2h0IGNvbG9yIHNob3duIHdoZW4gdGhlIHVzZXIgdGFwcyBhIGxpbmsgb3IgYSBKYXZhU2NyaXB0XG4gICAgICAgICAqIGNsaWNrYWJsZSBlbGVtZW50IGluIGlPUy4gVGhpcyBwcm9wZXJ0eSBvYmV5cyB0aGUgYWxwaGEgdmFsdWUsIGlmIHNwZWNpZmllZC5cbiAgICAgICAgICogQHR5cGUge1N0cmluZ31cbiAgICAgICAgICogQGRlZmF1bHQgJ3JnYmEoMCwwLDAsMCknXG4gICAgICAgICAqL1xuICAgICAgICB0YXBIaWdobGlnaHRDb2xvcjogJ3JnYmEoMCwwLDAsMCknXG4gICAgfVxufTtcblxudmFyIFNUT1AgPSAxO1xudmFyIEZPUkNFRF9TVE9QID0gMjtcblxuLyoqXG4gKiBNYW5hZ2VyXG4gKiBAcGFyYW0ge0hUTUxFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0ge09iamVjdH0gW29wdGlvbnNdXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gTWFuYWdlcihlbGVtZW50LCBvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gYXNzaWduKHt9LCBIYW1tZXIuZGVmYXVsdHMsIG9wdGlvbnMgfHwge30pO1xuXG4gICAgdGhpcy5vcHRpb25zLmlucHV0VGFyZ2V0ID0gdGhpcy5vcHRpb25zLmlucHV0VGFyZ2V0IHx8IGVsZW1lbnQ7XG5cbiAgICB0aGlzLmhhbmRsZXJzID0ge307XG4gICAgdGhpcy5zZXNzaW9uID0ge307XG4gICAgdGhpcy5yZWNvZ25pemVycyA9IFtdO1xuICAgIHRoaXMub2xkQ3NzUHJvcHMgPSB7fTtcblxuICAgIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gICAgdGhpcy5pbnB1dCA9IGNyZWF0ZUlucHV0SW5zdGFuY2UodGhpcyk7XG4gICAgdGhpcy50b3VjaEFjdGlvbiA9IG5ldyBUb3VjaEFjdGlvbih0aGlzLCB0aGlzLm9wdGlvbnMudG91Y2hBY3Rpb24pO1xuXG4gICAgdG9nZ2xlQ3NzUHJvcHModGhpcywgdHJ1ZSk7XG5cbiAgICBlYWNoKHRoaXMub3B0aW9ucy5yZWNvZ25pemVycywgZnVuY3Rpb24oaXRlbSkge1xuICAgICAgICB2YXIgcmVjb2duaXplciA9IHRoaXMuYWRkKG5ldyAoaXRlbVswXSkoaXRlbVsxXSkpO1xuICAgICAgICBpdGVtWzJdICYmIHJlY29nbml6ZXIucmVjb2duaXplV2l0aChpdGVtWzJdKTtcbiAgICAgICAgaXRlbVszXSAmJiByZWNvZ25pemVyLnJlcXVpcmVGYWlsdXJlKGl0ZW1bM10pO1xuICAgIH0sIHRoaXMpO1xufVxuXG5NYW5hZ2VyLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBzZXQgb3B0aW9uc1xuICAgICAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gICAgICogQHJldHVybnMge01hbmFnZXJ9XG4gICAgICovXG4gICAgc2V0OiBmdW5jdGlvbihvcHRpb25zKSB7XG4gICAgICAgIGFzc2lnbih0aGlzLm9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgICAgIC8vIE9wdGlvbnMgdGhhdCBuZWVkIGEgbGl0dGxlIG1vcmUgc2V0dXBcbiAgICAgICAgaWYgKG9wdGlvbnMudG91Y2hBY3Rpb24pIHtcbiAgICAgICAgICAgIHRoaXMudG91Y2hBY3Rpb24udXBkYXRlKCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKG9wdGlvbnMuaW5wdXRUYXJnZXQpIHtcbiAgICAgICAgICAgIC8vIENsZWFuIHVwIGV4aXN0aW5nIGV2ZW50IGxpc3RlbmVycyBhbmQgcmVpbml0aWFsaXplXG4gICAgICAgICAgICB0aGlzLmlucHV0LmRlc3Ryb3koKTtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQudGFyZ2V0ID0gb3B0aW9ucy5pbnB1dFRhcmdldDtcbiAgICAgICAgICAgIHRoaXMuaW5wdXQuaW5pdCgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBzdG9wIHJlY29nbml6aW5nIGZvciB0aGlzIHNlc3Npb24uXG4gICAgICogVGhpcyBzZXNzaW9uIHdpbGwgYmUgZGlzY2FyZGVkLCB3aGVuIGEgbmV3IFtpbnB1dF1zdGFydCBldmVudCBpcyBmaXJlZC5cbiAgICAgKiBXaGVuIGZvcmNlZCwgdGhlIHJlY29nbml6ZXIgY3ljbGUgaXMgc3RvcHBlZCBpbW1lZGlhdGVseS5cbiAgICAgKiBAcGFyYW0ge0Jvb2xlYW59IFtmb3JjZV1cbiAgICAgKi9cbiAgICBzdG9wOiBmdW5jdGlvbihmb3JjZSkge1xuICAgICAgICB0aGlzLnNlc3Npb24uc3RvcHBlZCA9IGZvcmNlID8gRk9SQ0VEX1NUT1AgOiBTVE9QO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBydW4gdGhlIHJlY29nbml6ZXJzIVxuICAgICAqIGNhbGxlZCBieSB0aGUgaW5wdXRIYW5kbGVyIGZ1bmN0aW9uIG9uIGV2ZXJ5IG1vdmVtZW50IG9mIHRoZSBwb2ludGVycyAodG91Y2hlcylcbiAgICAgKiBpdCB3YWxrcyB0aHJvdWdoIGFsbCB0aGUgcmVjb2duaXplcnMgYW5kIHRyaWVzIHRvIGRldGVjdCB0aGUgZ2VzdHVyZSB0aGF0IGlzIGJlaW5nIG1hZGVcbiAgICAgKiBAcGFyYW0ge09iamVjdH0gaW5wdXREYXRhXG4gICAgICovXG4gICAgcmVjb2duaXplOiBmdW5jdGlvbihpbnB1dERhdGEpIHtcbiAgICAgICAgdmFyIHNlc3Npb24gPSB0aGlzLnNlc3Npb247XG4gICAgICAgIGlmIChzZXNzaW9uLnN0b3BwZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJ1biB0aGUgdG91Y2gtYWN0aW9uIHBvbHlmaWxsXG4gICAgICAgIHRoaXMudG91Y2hBY3Rpb24ucHJldmVudERlZmF1bHRzKGlucHV0RGF0YSk7XG5cbiAgICAgICAgdmFyIHJlY29nbml6ZXI7XG4gICAgICAgIHZhciByZWNvZ25pemVycyA9IHRoaXMucmVjb2duaXplcnM7XG5cbiAgICAgICAgLy8gdGhpcyBob2xkcyB0aGUgcmVjb2duaXplciB0aGF0IGlzIGJlaW5nIHJlY29nbml6ZWQuXG4gICAgICAgIC8vIHNvIHRoZSByZWNvZ25pemVyJ3Mgc3RhdGUgbmVlZHMgdG8gYmUgQkVHQU4sIENIQU5HRUQsIEVOREVEIG9yIFJFQ09HTklaRURcbiAgICAgICAgLy8gaWYgbm8gcmVjb2duaXplciBpcyBkZXRlY3RpbmcgYSB0aGluZywgaXQgaXMgc2V0IHRvIGBudWxsYFxuICAgICAgICB2YXIgY3VyUmVjb2duaXplciA9IHNlc3Npb24uY3VyUmVjb2duaXplcjtcblxuICAgICAgICAvLyByZXNldCB3aGVuIHRoZSBsYXN0IHJlY29nbml6ZXIgaXMgcmVjb2duaXplZFxuICAgICAgICAvLyBvciB3aGVuIHdlJ3JlIGluIGEgbmV3IHNlc3Npb25cbiAgICAgICAgaWYgKCFjdXJSZWNvZ25pemVyIHx8IChjdXJSZWNvZ25pemVyICYmIGN1clJlY29nbml6ZXIuc3RhdGUgJiBTVEFURV9SRUNPR05JWkVEKSkge1xuICAgICAgICAgICAgY3VyUmVjb2duaXplciA9IHNlc3Npb24uY3VyUmVjb2duaXplciA9IG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgcmVjb2duaXplcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZWNvZ25pemVyID0gcmVjb2duaXplcnNbaV07XG5cbiAgICAgICAgICAgIC8vIGZpbmQgb3V0IGlmIHdlIGFyZSBhbGxvd2VkIHRyeSB0byByZWNvZ25pemUgdGhlIGlucHV0IGZvciB0aGlzIG9uZS5cbiAgICAgICAgICAgIC8vIDEuICAgYWxsb3cgaWYgdGhlIHNlc3Npb24gaXMgTk9UIGZvcmNlZCBzdG9wcGVkIChzZWUgdGhlIC5zdG9wKCkgbWV0aG9kKVxuICAgICAgICAgICAgLy8gMi4gICBhbGxvdyBpZiB3ZSBzdGlsbCBoYXZlbid0IHJlY29nbml6ZWQgYSBnZXN0dXJlIGluIHRoaXMgc2Vzc2lvbiwgb3IgdGhlIHRoaXMgcmVjb2duaXplciBpcyB0aGUgb25lXG4gICAgICAgICAgICAvLyAgICAgIHRoYXQgaXMgYmVpbmcgcmVjb2duaXplZC5cbiAgICAgICAgICAgIC8vIDMuICAgYWxsb3cgaWYgdGhlIHJlY29nbml6ZXIgaXMgYWxsb3dlZCB0byBydW4gc2ltdWx0YW5lb3VzIHdpdGggdGhlIGN1cnJlbnQgcmVjb2duaXplZCByZWNvZ25pemVyLlxuICAgICAgICAgICAgLy8gICAgICB0aGlzIGNhbiBiZSBzZXR1cCB3aXRoIHRoZSBgcmVjb2duaXplV2l0aCgpYCBtZXRob2Qgb24gdGhlIHJlY29nbml6ZXIuXG4gICAgICAgICAgICBpZiAoc2Vzc2lvbi5zdG9wcGVkICE9PSBGT1JDRURfU1RPUCAmJiAoIC8vIDFcbiAgICAgICAgICAgICAgICAgICAgIWN1clJlY29nbml6ZXIgfHwgcmVjb2duaXplciA9PSBjdXJSZWNvZ25pemVyIHx8IC8vIDJcbiAgICAgICAgICAgICAgICAgICAgcmVjb2duaXplci5jYW5SZWNvZ25pemVXaXRoKGN1clJlY29nbml6ZXIpKSkgeyAvLyAzXG4gICAgICAgICAgICAgICAgcmVjb2duaXplci5yZWNvZ25pemUoaW5wdXREYXRhKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVjb2duaXplci5yZXNldCgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBpZiB0aGUgcmVjb2duaXplciBoYXMgYmVlbiByZWNvZ25pemluZyB0aGUgaW5wdXQgYXMgYSB2YWxpZCBnZXN0dXJlLCB3ZSB3YW50IHRvIHN0b3JlIHRoaXMgb25lIGFzIHRoZVxuICAgICAgICAgICAgLy8gY3VycmVudCBhY3RpdmUgcmVjb2duaXplci4gYnV0IG9ubHkgaWYgd2UgZG9uJ3QgYWxyZWFkeSBoYXZlIGFuIGFjdGl2ZSByZWNvZ25pemVyXG4gICAgICAgICAgICBpZiAoIWN1clJlY29nbml6ZXIgJiYgcmVjb2duaXplci5zdGF0ZSAmIChTVEFURV9CRUdBTiB8IFNUQVRFX0NIQU5HRUQgfCBTVEFURV9FTkRFRCkpIHtcbiAgICAgICAgICAgICAgICBjdXJSZWNvZ25pemVyID0gc2Vzc2lvbi5jdXJSZWNvZ25pemVyID0gcmVjb2duaXplcjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBnZXQgYSByZWNvZ25pemVyIGJ5IGl0cyBldmVudCBuYW1lLlxuICAgICAqIEBwYXJhbSB7UmVjb2duaXplcnxTdHJpbmd9IHJlY29nbml6ZXJcbiAgICAgKiBAcmV0dXJucyB7UmVjb2duaXplcnxOdWxsfVxuICAgICAqL1xuICAgIGdldDogZnVuY3Rpb24ocmVjb2duaXplcikge1xuICAgICAgICBpZiAocmVjb2duaXplciBpbnN0YW5jZW9mIFJlY29nbml6ZXIpIHtcbiAgICAgICAgICAgIHJldHVybiByZWNvZ25pemVyO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIHJlY29nbml6ZXJzID0gdGhpcy5yZWNvZ25pemVycztcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCByZWNvZ25pemVycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgaWYgKHJlY29nbml6ZXJzW2ldLm9wdGlvbnMuZXZlbnQgPT0gcmVjb2duaXplcikge1xuICAgICAgICAgICAgICAgIHJldHVybiByZWNvZ25pemVyc1tpXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbnVsbDtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogYWRkIGEgcmVjb2duaXplciB0byB0aGUgbWFuYWdlclxuICAgICAqIGV4aXN0aW5nIHJlY29nbml6ZXJzIHdpdGggdGhlIHNhbWUgZXZlbnQgbmFtZSB3aWxsIGJlIHJlbW92ZWRcbiAgICAgKiBAcGFyYW0ge1JlY29nbml6ZXJ9IHJlY29nbml6ZXJcbiAgICAgKiBAcmV0dXJucyB7UmVjb2duaXplcnxNYW5hZ2VyfVxuICAgICAqL1xuICAgIGFkZDogZnVuY3Rpb24ocmVjb2duaXplcikge1xuICAgICAgICBpZiAoaW52b2tlQXJyYXlBcmcocmVjb2duaXplciwgJ2FkZCcsIHRoaXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIHJlbW92ZSBleGlzdGluZ1xuICAgICAgICB2YXIgZXhpc3RpbmcgPSB0aGlzLmdldChyZWNvZ25pemVyLm9wdGlvbnMuZXZlbnQpO1xuICAgICAgICBpZiAoZXhpc3RpbmcpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlKGV4aXN0aW5nKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMucmVjb2duaXplcnMucHVzaChyZWNvZ25pemVyKTtcbiAgICAgICAgcmVjb2duaXplci5tYW5hZ2VyID0gdGhpcztcblxuICAgICAgICB0aGlzLnRvdWNoQWN0aW9uLnVwZGF0ZSgpO1xuICAgICAgICByZXR1cm4gcmVjb2duaXplcjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogcmVtb3ZlIGEgcmVjb2duaXplciBieSBuYW1lIG9yIGluc3RhbmNlXG4gICAgICogQHBhcmFtIHtSZWNvZ25pemVyfFN0cmluZ30gcmVjb2duaXplclxuICAgICAqIEByZXR1cm5zIHtNYW5hZ2VyfVxuICAgICAqL1xuICAgIHJlbW92ZTogZnVuY3Rpb24ocmVjb2duaXplcikge1xuICAgICAgICBpZiAoaW52b2tlQXJyYXlBcmcocmVjb2duaXplciwgJ3JlbW92ZScsIHRoaXMpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfVxuXG4gICAgICAgIHJlY29nbml6ZXIgPSB0aGlzLmdldChyZWNvZ25pemVyKTtcblxuICAgICAgICAvLyBsZXQncyBtYWtlIHN1cmUgdGhpcyByZWNvZ25pemVyIGV4aXN0c1xuICAgICAgICBpZiAocmVjb2duaXplcikge1xuICAgICAgICAgICAgdmFyIHJlY29nbml6ZXJzID0gdGhpcy5yZWNvZ25pemVycztcbiAgICAgICAgICAgIHZhciBpbmRleCA9IGluQXJyYXkocmVjb2duaXplcnMsIHJlY29nbml6ZXIpO1xuXG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgcmVjb2duaXplcnMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgICAgICB0aGlzLnRvdWNoQWN0aW9uLnVwZGF0ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIGJpbmQgZXZlbnRcbiAgICAgKiBAcGFyYW0ge1N0cmluZ30gZXZlbnRzXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gaGFuZGxlclxuICAgICAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IHRoaXNcbiAgICAgKi9cbiAgICBvbjogZnVuY3Rpb24oZXZlbnRzLCBoYW5kbGVyKSB7XG4gICAgICAgIGlmIChldmVudHMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICAgIGlmIChoYW5kbGVyID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnM7XG4gICAgICAgIGVhY2goc3BsaXRTdHIoZXZlbnRzKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGhhbmRsZXJzW2V2ZW50XSA9IGhhbmRsZXJzW2V2ZW50XSB8fCBbXTtcbiAgICAgICAgICAgIGhhbmRsZXJzW2V2ZW50XS5wdXNoKGhhbmRsZXIpO1xuICAgICAgICB9KTtcbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIHVuYmluZCBldmVudCwgbGVhdmUgZW1pdCBibGFuayB0byByZW1vdmUgYWxsIGhhbmRsZXJzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50c1xuICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IFtoYW5kbGVyXVxuICAgICAqIEByZXR1cm5zIHtFdmVudEVtaXR0ZXJ9IHRoaXNcbiAgICAgKi9cbiAgICBvZmY6IGZ1bmN0aW9uKGV2ZW50cywgaGFuZGxlcikge1xuICAgICAgICBpZiAoZXZlbnRzID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnM7XG4gICAgICAgIGVhY2goc3BsaXRTdHIoZXZlbnRzKSwgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAgICAgICAgIGlmICghaGFuZGxlcikge1xuICAgICAgICAgICAgICAgIGRlbGV0ZSBoYW5kbGVyc1tldmVudF07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGhhbmRsZXJzW2V2ZW50XSAmJiBoYW5kbGVyc1tldmVudF0uc3BsaWNlKGluQXJyYXkoaGFuZGxlcnNbZXZlbnRdLCBoYW5kbGVyKSwgMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogZW1pdCBldmVudCB0byB0aGUgbGlzdGVuZXJzXG4gICAgICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50XG4gICAgICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAgICAgKi9cbiAgICBlbWl0OiBmdW5jdGlvbihldmVudCwgZGF0YSkge1xuICAgICAgICAvLyB3ZSBhbHNvIHdhbnQgdG8gdHJpZ2dlciBkb20gZXZlbnRzXG4gICAgICAgIGlmICh0aGlzLm9wdGlvbnMuZG9tRXZlbnRzKSB7XG4gICAgICAgICAgICB0cmlnZ2VyRG9tRXZlbnQoZXZlbnQsIGRhdGEpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gbm8gaGFuZGxlcnMsIHNvIHNraXAgaXQgYWxsXG4gICAgICAgIHZhciBoYW5kbGVycyA9IHRoaXMuaGFuZGxlcnNbZXZlbnRdICYmIHRoaXMuaGFuZGxlcnNbZXZlbnRdLnNsaWNlKCk7XG4gICAgICAgIGlmICghaGFuZGxlcnMgfHwgIWhhbmRsZXJzLmxlbmd0aCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgZGF0YS50eXBlID0gZXZlbnQ7XG4gICAgICAgIGRhdGEucHJldmVudERlZmF1bHQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIGRhdGEuc3JjRXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfTtcblxuICAgICAgICB2YXIgaSA9IDA7XG4gICAgICAgIHdoaWxlIChpIDwgaGFuZGxlcnMubGVuZ3RoKSB7XG4gICAgICAgICAgICBoYW5kbGVyc1tpXShkYXRhKTtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBkZXN0cm95IHRoZSBtYW5hZ2VyIGFuZCB1bmJpbmRzIGFsbCBldmVudHNcbiAgICAgKiBpdCBkb2Vzbid0IHVuYmluZCBkb20gZXZlbnRzLCB0aGF0IGlzIHRoZSB1c2VyIG93biByZXNwb25zaWJpbGl0eVxuICAgICAqL1xuICAgIGRlc3Ryb3k6IGZ1bmN0aW9uKCkge1xuICAgICAgICB0aGlzLmVsZW1lbnQgJiYgdG9nZ2xlQ3NzUHJvcHModGhpcywgZmFsc2UpO1xuXG4gICAgICAgIHRoaXMuaGFuZGxlcnMgPSB7fTtcbiAgICAgICAgdGhpcy5zZXNzaW9uID0ge307XG4gICAgICAgIHRoaXMuaW5wdXQuZGVzdHJveSgpO1xuICAgICAgICB0aGlzLmVsZW1lbnQgPSBudWxsO1xuICAgIH1cbn07XG5cbi8qKlxuICogYWRkL3JlbW92ZSB0aGUgY3NzIHByb3BlcnRpZXMgYXMgZGVmaW5lZCBpbiBtYW5hZ2VyLm9wdGlvbnMuY3NzUHJvcHNcbiAqIEBwYXJhbSB7TWFuYWdlcn0gbWFuYWdlclxuICogQHBhcmFtIHtCb29sZWFufSBhZGRcbiAqL1xuZnVuY3Rpb24gdG9nZ2xlQ3NzUHJvcHMobWFuYWdlciwgYWRkKSB7XG4gICAgdmFyIGVsZW1lbnQgPSBtYW5hZ2VyLmVsZW1lbnQ7XG4gICAgaWYgKCFlbGVtZW50LnN0eWxlKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHByb3A7XG4gICAgZWFjaChtYW5hZ2VyLm9wdGlvbnMuY3NzUHJvcHMsIGZ1bmN0aW9uKHZhbHVlLCBuYW1lKSB7XG4gICAgICAgIHByb3AgPSBwcmVmaXhlZChlbGVtZW50LnN0eWxlLCBuYW1lKTtcbiAgICAgICAgaWYgKGFkZCkge1xuICAgICAgICAgICAgbWFuYWdlci5vbGRDc3NQcm9wc1twcm9wXSA9IGVsZW1lbnQuc3R5bGVbcHJvcF07XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlW3Byb3BdID0gdmFsdWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBlbGVtZW50LnN0eWxlW3Byb3BdID0gbWFuYWdlci5vbGRDc3NQcm9wc1twcm9wXSB8fCAnJztcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghYWRkKSB7XG4gICAgICAgIG1hbmFnZXIub2xkQ3NzUHJvcHMgPSB7fTtcbiAgICB9XG59XG5cbi8qKlxuICogdHJpZ2dlciBkb20gZXZlbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBldmVudFxuICogQHBhcmFtIHtPYmplY3R9IGRhdGFcbiAqL1xuZnVuY3Rpb24gdHJpZ2dlckRvbUV2ZW50KGV2ZW50LCBkYXRhKSB7XG4gICAgdmFyIGdlc3R1cmVFdmVudCA9IGRvY3VtZW50LmNyZWF0ZUV2ZW50KCdFdmVudCcpO1xuICAgIGdlc3R1cmVFdmVudC5pbml0RXZlbnQoZXZlbnQsIHRydWUsIHRydWUpO1xuICAgIGdlc3R1cmVFdmVudC5nZXN0dXJlID0gZGF0YTtcbiAgICBkYXRhLnRhcmdldC5kaXNwYXRjaEV2ZW50KGdlc3R1cmVFdmVudCk7XG59XG5cbmFzc2lnbihIYW1tZXIsIHtcbiAgICBJTlBVVF9TVEFSVDogSU5QVVRfU1RBUlQsXG4gICAgSU5QVVRfTU9WRTogSU5QVVRfTU9WRSxcbiAgICBJTlBVVF9FTkQ6IElOUFVUX0VORCxcbiAgICBJTlBVVF9DQU5DRUw6IElOUFVUX0NBTkNFTCxcblxuICAgIFNUQVRFX1BPU1NJQkxFOiBTVEFURV9QT1NTSUJMRSxcbiAgICBTVEFURV9CRUdBTjogU1RBVEVfQkVHQU4sXG4gICAgU1RBVEVfQ0hBTkdFRDogU1RBVEVfQ0hBTkdFRCxcbiAgICBTVEFURV9FTkRFRDogU1RBVEVfRU5ERUQsXG4gICAgU1RBVEVfUkVDT0dOSVpFRDogU1RBVEVfUkVDT0dOSVpFRCxcbiAgICBTVEFURV9DQU5DRUxMRUQ6IFNUQVRFX0NBTkNFTExFRCxcbiAgICBTVEFURV9GQUlMRUQ6IFNUQVRFX0ZBSUxFRCxcblxuICAgIERJUkVDVElPTl9OT05FOiBESVJFQ1RJT05fTk9ORSxcbiAgICBESVJFQ1RJT05fTEVGVDogRElSRUNUSU9OX0xFRlQsXG4gICAgRElSRUNUSU9OX1JJR0hUOiBESVJFQ1RJT05fUklHSFQsXG4gICAgRElSRUNUSU9OX1VQOiBESVJFQ1RJT05fVVAsXG4gICAgRElSRUNUSU9OX0RPV046IERJUkVDVElPTl9ET1dOLFxuICAgIERJUkVDVElPTl9IT1JJWk9OVEFMOiBESVJFQ1RJT05fSE9SSVpPTlRBTCxcbiAgICBESVJFQ1RJT05fVkVSVElDQUw6IERJUkVDVElPTl9WRVJUSUNBTCxcbiAgICBESVJFQ1RJT05fQUxMOiBESVJFQ1RJT05fQUxMLFxuXG4gICAgTWFuYWdlcjogTWFuYWdlcixcbiAgICBJbnB1dDogSW5wdXQsXG4gICAgVG91Y2hBY3Rpb246IFRvdWNoQWN0aW9uLFxuXG4gICAgVG91Y2hJbnB1dDogVG91Y2hJbnB1dCxcbiAgICBNb3VzZUlucHV0OiBNb3VzZUlucHV0LFxuICAgIFBvaW50ZXJFdmVudElucHV0OiBQb2ludGVyRXZlbnRJbnB1dCxcbiAgICBUb3VjaE1vdXNlSW5wdXQ6IFRvdWNoTW91c2VJbnB1dCxcbiAgICBTaW5nbGVUb3VjaElucHV0OiBTaW5nbGVUb3VjaElucHV0LFxuXG4gICAgUmVjb2duaXplcjogUmVjb2duaXplcixcbiAgICBBdHRyUmVjb2duaXplcjogQXR0clJlY29nbml6ZXIsXG4gICAgVGFwOiBUYXBSZWNvZ25pemVyLFxuICAgIFBhbjogUGFuUmVjb2duaXplcixcbiAgICBTd2lwZTogU3dpcGVSZWNvZ25pemVyLFxuICAgIFBpbmNoOiBQaW5jaFJlY29nbml6ZXIsXG4gICAgUm90YXRlOiBSb3RhdGVSZWNvZ25pemVyLFxuICAgIFByZXNzOiBQcmVzc1JlY29nbml6ZXIsXG5cbiAgICBvbjogYWRkRXZlbnRMaXN0ZW5lcnMsXG4gICAgb2ZmOiByZW1vdmVFdmVudExpc3RlbmVycyxcbiAgICBlYWNoOiBlYWNoLFxuICAgIG1lcmdlOiBtZXJnZSxcbiAgICBleHRlbmQ6IGV4dGVuZCxcbiAgICBhc3NpZ246IGFzc2lnbixcbiAgICBpbmhlcml0OiBpbmhlcml0LFxuICAgIGJpbmRGbjogYmluZEZuLFxuICAgIHByZWZpeGVkOiBwcmVmaXhlZFxufSk7XG5cbi8vIHRoaXMgcHJldmVudHMgZXJyb3JzIHdoZW4gSGFtbWVyIGlzIGxvYWRlZCBpbiB0aGUgcHJlc2VuY2Ugb2YgYW4gQU1EXG4vLyAgc3R5bGUgbG9hZGVyIGJ1dCBieSBzY3JpcHQgdGFnLCBub3QgYnkgdGhlIGxvYWRlci5cbnZhciBmcmVlR2xvYmFsID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnID8gd2luZG93IDogKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyA/IHNlbGYgOiB7fSkpOyAvLyBqc2hpbnQgaWdub3JlOmxpbmVcbmZyZWVHbG9iYWwuSGFtbWVyID0gSGFtbWVyO1xuXG5pZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKGZ1bmN0aW9uKCkge1xuICAgICAgICByZXR1cm4gSGFtbWVyO1xuICAgIH0pO1xufSBlbHNlIGlmICh0eXBlb2YgbW9kdWxlICE9ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgbW9kdWxlLmV4cG9ydHMgPSBIYW1tZXI7XG59IGVsc2Uge1xuICAgIHdpbmRvd1tleHBvcnROYW1lXSA9IEhhbW1lcjtcbn1cblxufSkod2luZG93LCBkb2N1bWVudCwgJ0hhbW1lcicpO1xuIiwiLyohXG4gKiAgaG93bGVyLmpzIHYyLjAuMlxuICogIGhvd2xlcmpzLmNvbVxuICpcbiAqICAoYykgMjAxMy0yMDE2LCBKYW1lcyBTaW1wc29uIG9mIEdvbGRGaXJlIFN0dWRpb3NcbiAqICBnb2xkZmlyZXN0dWRpb3MuY29tXG4gKlxuICogIE1JVCBMaWNlbnNlXG4gKi9cblxuKGZ1bmN0aW9uKCkge1xuXG4gICd1c2Ugc3RyaWN0JztcblxuICAvKiogR2xvYmFsIE1ldGhvZHMgKiovXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIENyZWF0ZSB0aGUgZ2xvYmFsIGNvbnRyb2xsZXIuIEFsbCBjb250YWluZWQgbWV0aG9kcyBhbmQgcHJvcGVydGllcyBhcHBseVxuICAgKiB0byBhbGwgc291bmRzIHRoYXQgYXJlIGN1cnJlbnRseSBwbGF5aW5nIG9yIHdpbGwgYmUgaW4gdGhlIGZ1dHVyZS5cbiAgICovXG4gIHZhciBIb3dsZXJHbG9iYWwgPSBmdW5jdGlvbigpIHtcbiAgICB0aGlzLmluaXQoKTtcbiAgfTtcbiAgSG93bGVyR2xvYmFsLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIHRoZSBnbG9iYWwgSG93bGVyIG9iamVjdC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsZXJ9XG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMgfHwgSG93bGVyO1xuXG4gICAgICAvLyBJbnRlcm5hbCBwcm9wZXJ0aWVzLlxuICAgICAgc2VsZi5fY29kZWNzID0ge307XG4gICAgICBzZWxmLl9ob3dscyA9IFtdO1xuICAgICAgc2VsZi5fbXV0ZWQgPSBmYWxzZTtcbiAgICAgIHNlbGYuX3ZvbHVtZSA9IDE7XG4gICAgICBzZWxmLl9jYW5QbGF5RXZlbnQgPSAnY2FucGxheXRocm91Z2gnO1xuICAgICAgc2VsZi5fbmF2aWdhdG9yID0gKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5uYXZpZ2F0b3IpID8gd2luZG93Lm5hdmlnYXRvciA6IG51bGw7XG5cbiAgICAgIC8vIFB1YmxpYyBwcm9wZXJ0aWVzLlxuICAgICAgc2VsZi5tYXN0ZXJHYWluID0gbnVsbDtcbiAgICAgIHNlbGYubm9BdWRpbyA9IGZhbHNlO1xuICAgICAgc2VsZi51c2luZ1dlYkF1ZGlvID0gdHJ1ZTtcbiAgICAgIHNlbGYuYXV0b1N1c3BlbmQgPSB0cnVlO1xuICAgICAgc2VsZi5jdHggPSBudWxsO1xuXG4gICAgICAvLyBTZXQgdG8gZmFsc2UgdG8gZGlzYWJsZSB0aGUgYXV0byBpT1MgZW5hYmxlci5cbiAgICAgIHNlbGYubW9iaWxlQXV0b0VuYWJsZSA9IHRydWU7XG5cbiAgICAgIC8vIFNldHVwIHRoZSB2YXJpb3VzIHN0YXRlIHZhbHVlcyBmb3IgZ2xvYmFsIHRyYWNraW5nLlxuICAgICAgc2VsZi5fc2V0dXAoKTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldC9zZXQgdGhlIGdsb2JhbCB2b2x1bWUgZm9yIGFsbCBzb3VuZHMuXG4gICAgICogQHBhcmFtICB7RmxvYXR9IHZvbCBWb2x1bWUgZnJvbSAwLjAgdG8gMS4wLlxuICAgICAqIEByZXR1cm4ge0hvd2xlci9GbG9hdH0gICAgIFJldHVybnMgc2VsZiBvciBjdXJyZW50IHZvbHVtZS5cbiAgICAgKi9cbiAgICB2b2x1bWU6IGZ1bmN0aW9uKHZvbCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzIHx8IEhvd2xlcjtcbiAgICAgIHZvbCA9IHBhcnNlRmxvYXQodm9sKTtcblxuICAgICAgLy8gSWYgd2UgZG9uJ3QgaGF2ZSBhbiBBdWRpb0NvbnRleHQgY3JlYXRlZCB5ZXQsIHJ1biB0aGUgc2V0dXAuXG4gICAgICBpZiAoIXNlbGYuY3R4KSB7XG4gICAgICAgIHNldHVwQXVkaW9Db250ZXh0KCk7XG4gICAgICB9XG5cbiAgICAgIGlmICh0eXBlb2Ygdm9sICE9PSAndW5kZWZpbmVkJyAmJiB2b2wgPj0gMCAmJiB2b2wgPD0gMSkge1xuICAgICAgICBzZWxmLl92b2x1bWUgPSB2b2w7XG5cbiAgICAgICAgLy8gRG9uJ3QgdXBkYXRlIGFueSBvZiB0aGUgbm9kZXMgaWYgd2UgYXJlIG11dGVkLlxuICAgICAgICBpZiAoc2VsZi5fbXV0ZWQpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFdoZW4gdXNpbmcgV2ViIEF1ZGlvLCB3ZSBqdXN0IG5lZWQgdG8gYWRqdXN0IHRoZSBtYXN0ZXIgZ2Fpbi5cbiAgICAgICAgaWYgKHNlbGYudXNpbmdXZWJBdWRpbykge1xuICAgICAgICAgIHNlbGYubWFzdGVyR2Fpbi5nYWluLnZhbHVlID0gdm9sO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGFuZCBjaGFuZ2Ugdm9sdW1lIGZvciBhbGwgSFRNTDUgYXVkaW8gbm9kZXMuXG4gICAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9ob3dscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmICghc2VsZi5faG93bHNbaV0uX3dlYkF1ZGlvKSB7XG4gICAgICAgICAgICAvLyBHZXQgYWxsIG9mIHRoZSBzb3VuZHMgaW4gdGhpcyBIb3dsIGdyb3VwLlxuICAgICAgICAgICAgdmFyIGlkcyA9IHNlbGYuX2hvd2xzW2ldLl9nZXRTb3VuZElkcygpO1xuXG4gICAgICAgICAgICAvLyBMb29wIHRocm91Z2ggYWxsIHNvdW5kcyBhbmQgY2hhbmdlIHRoZSB2b2x1bWVzLlxuICAgICAgICAgICAgZm9yICh2YXIgaj0wOyBqPGlkcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICB2YXIgc291bmQgPSBzZWxmLl9ob3dsc1tpXS5fc291bmRCeUlkKGlkc1tqXSk7XG5cbiAgICAgICAgICAgICAgaWYgKHNvdW5kICYmIHNvdW5kLl9ub2RlKSB7XG4gICAgICAgICAgICAgICAgc291bmQuX25vZGUudm9sdW1lID0gc291bmQuX3ZvbHVtZSAqIHZvbDtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZi5fdm9sdW1lO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIYW5kbGUgbXV0aW5nIGFuZCB1bm11dGluZyBnbG9iYWxseS5cbiAgICAgKiBAcGFyYW0gIHtCb29sZWFufSBtdXRlZCBJcyBtdXRlZCBvciBub3QuXG4gICAgICovXG4gICAgbXV0ZTogZnVuY3Rpb24obXV0ZWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyB8fCBIb3dsZXI7XG5cbiAgICAgIC8vIElmIHdlIGRvbid0IGhhdmUgYW4gQXVkaW9Db250ZXh0IGNyZWF0ZWQgeWV0LCBydW4gdGhlIHNldHVwLlxuICAgICAgaWYgKCFzZWxmLmN0eCkge1xuICAgICAgICBzZXR1cEF1ZGlvQ29udGV4dCgpO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9tdXRlZCA9IG11dGVkO1xuXG4gICAgICAvLyBXaXRoIFdlYiBBdWRpbywgd2UganVzdCBuZWVkIHRvIG11dGUgdGhlIG1hc3RlciBnYWluLlxuICAgICAgaWYgKHNlbGYudXNpbmdXZWJBdWRpbykge1xuICAgICAgICBzZWxmLm1hc3RlckdhaW4uZ2Fpbi52YWx1ZSA9IG11dGVkID8gMCA6IHNlbGYuX3ZvbHVtZTtcbiAgICAgIH1cblxuICAgICAgLy8gTG9vcCB0aHJvdWdoIGFuZCBtdXRlIGFsbCBIVE1MNSBBdWRpbyBub2Rlcy5cbiAgICAgIGZvciAodmFyIGk9MDsgaTxzZWxmLl9ob3dscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXNlbGYuX2hvd2xzW2ldLl93ZWJBdWRpbykge1xuICAgICAgICAgIC8vIEdldCBhbGwgb2YgdGhlIHNvdW5kcyBpbiB0aGlzIEhvd2wgZ3JvdXAuXG4gICAgICAgICAgdmFyIGlkcyA9IHNlbGYuX2hvd2xzW2ldLl9nZXRTb3VuZElkcygpO1xuXG4gICAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGFsbCBzb3VuZHMgYW5kIG1hcmsgdGhlIGF1ZGlvIG5vZGUgYXMgbXV0ZWQuXG4gICAgICAgICAgZm9yICh2YXIgaj0wOyBqPGlkcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdmFyIHNvdW5kID0gc2VsZi5faG93bHNbaV0uX3NvdW5kQnlJZChpZHNbal0pO1xuXG4gICAgICAgICAgICBpZiAoc291bmQgJiYgc291bmQuX25vZGUpIHtcbiAgICAgICAgICAgICAgc291bmQuX25vZGUubXV0ZWQgPSAobXV0ZWQpID8gdHJ1ZSA6IHNvdW5kLl9tdXRlZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFVubG9hZCBhbmQgZGVzdHJveSBhbGwgY3VycmVudGx5IGxvYWRlZCBIb3dsIG9iamVjdHMuXG4gICAgICogQHJldHVybiB7SG93bGVyfVxuICAgICAqL1xuICAgIHVubG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMgfHwgSG93bGVyO1xuXG4gICAgICBmb3IgKHZhciBpPXNlbGYuX2hvd2xzLmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcbiAgICAgICAgc2VsZi5faG93bHNbaV0udW5sb2FkKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIENyZWF0ZSBhIG5ldyBBdWRpb0NvbnRleHQgdG8gbWFrZSBzdXJlIGl0IGlzIGZ1bGx5IHJlc2V0LlxuICAgICAgaWYgKHNlbGYudXNpbmdXZWJBdWRpbyAmJiBzZWxmLmN0eCAmJiB0eXBlb2Ygc2VsZi5jdHguY2xvc2UgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHNlbGYuY3R4LmNsb3NlKCk7XG4gICAgICAgIHNlbGYuY3R4ID0gbnVsbDtcbiAgICAgICAgc2V0dXBBdWRpb0NvbnRleHQoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGZvciBjb2RlYyBzdXBwb3J0IG9mIHNwZWNpZmljIGV4dGVuc2lvbi5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9IGV4dCBBdWRpbyBmaWxlIGV4dGVudGlvbi5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufVxuICAgICAqL1xuICAgIGNvZGVjczogZnVuY3Rpb24oZXh0KSB7XG4gICAgICByZXR1cm4gKHRoaXMgfHwgSG93bGVyKS5fY29kZWNzW2V4dC5yZXBsYWNlKC9eeC0vLCAnJyldO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBTZXR1cCB2YXJpb3VzIHN0YXRlIHZhbHVlcyBmb3IgZ2xvYmFsIHRyYWNraW5nLlxuICAgICAqIEByZXR1cm4ge0hvd2xlcn1cbiAgICAgKi9cbiAgICBfc2V0dXA6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzIHx8IEhvd2xlcjtcblxuICAgICAgLy8gS2VlcHMgdHJhY2sgb2YgdGhlIHN1c3BlbmQvcmVzdW1lIHN0YXRlIG9mIHRoZSBBdWRpb0NvbnRleHQuXG4gICAgICBzZWxmLnN0YXRlID0gc2VsZi5jdHggPyBzZWxmLmN0eC5zdGF0ZSB8fCAncnVubmluZycgOiAncnVubmluZyc7XG5cbiAgICAgIC8vIEF1dG9tYXRpY2FsbHkgYmVnaW4gdGhlIDMwLXNlY29uZCBzdXNwZW5kIHByb2Nlc3NcbiAgICAgIHNlbGYuX2F1dG9TdXNwZW5kKCk7XG5cbiAgICAgIC8vIENoZWNrIGlmIGF1ZGlvIGlzIGF2YWlsYWJsZS5cbiAgICAgIGlmICghc2VsZi51c2luZ1dlYkF1ZGlvKSB7XG4gICAgICAgIC8vIE5vIGF1ZGlvIGlzIGF2YWlsYWJsZSBvbiB0aGlzIHN5c3RlbSBpZiBub0F1ZGlvIGlzIHNldCB0byB0cnVlLlxuICAgICAgICBpZiAodHlwZW9mIEF1ZGlvICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICB2YXIgdGVzdCA9IG5ldyBBdWRpbygpO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGUgY2FucGxheXRocm91Z2ggZXZlbnQgaXMgYXZhaWxhYmxlLlxuICAgICAgICAgICAgaWYgKHR5cGVvZiB0ZXN0Lm9uY2FucGxheXRocm91Z2ggPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgIHNlbGYuX2NhblBsYXlFdmVudCA9ICdjYW5wbGF5JztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGNhdGNoKGUpIHtcbiAgICAgICAgICAgIHNlbGYubm9BdWRpbyA9IHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNlbGYubm9BdWRpbyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gVGVzdCB0byBtYWtlIHN1cmUgYXVkaW8gaXNuJ3QgZGlzYWJsZWQgaW4gSW50ZXJuZXQgRXhwbG9yZXIuXG4gICAgICB0cnkge1xuICAgICAgICB2YXIgdGVzdCA9IG5ldyBBdWRpbygpO1xuICAgICAgICBpZiAodGVzdC5tdXRlZCkge1xuICAgICAgICAgIHNlbGYubm9BdWRpbyA9IHRydWU7XG4gICAgICAgIH1cbiAgICAgIH0gY2F0Y2ggKGUpIHt9XG5cbiAgICAgIC8vIENoZWNrIGZvciBzdXBwb3J0ZWQgY29kZWNzLlxuICAgICAgaWYgKCFzZWxmLm5vQXVkaW8pIHtcbiAgICAgICAgc2VsZi5fc2V0dXBDb2RlY3MoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGZvciBicm93c2VyIHN1cHBvcnQgZm9yIHZhcmlvdXMgY29kZWNzIGFuZCBjYWNoZSB0aGUgcmVzdWx0cy5cbiAgICAgKiBAcmV0dXJuIHtIb3dsZXJ9XG4gICAgICovXG4gICAgX3NldHVwQ29kZWNzOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyB8fCBIb3dsZXI7XG4gICAgICB2YXIgYXVkaW9UZXN0ID0gbnVsbDtcblxuICAgICAgLy8gTXVzdCB3cmFwIGluIGEgdHJ5L2NhdGNoIGJlY2F1c2UgSUUxMSBpbiBzZXJ2ZXIgbW9kZSB0aHJvd3MgYW4gZXJyb3IuXG4gICAgICB0cnkge1xuICAgICAgICBhdWRpb1Rlc3QgPSAodHlwZW9mIEF1ZGlvICE9PSAndW5kZWZpbmVkJykgPyBuZXcgQXVkaW8oKSA6IG51bGw7XG4gICAgICB9IGNhdGNoIChlcnIpIHtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIGlmICghYXVkaW9UZXN0IHx8IHR5cGVvZiBhdWRpb1Rlc3QuY2FuUGxheVR5cGUgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIHZhciBtcGVnVGVzdCA9IGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vbXBlZzsnKS5yZXBsYWNlKC9ebm8kLywgJycpO1xuXG4gICAgICAvLyBPcGVyYSB2ZXJzaW9uIDwzMyBoYXMgbWl4ZWQgTVAzIHN1cHBvcnQsIHNvIHdlIG5lZWQgdG8gY2hlY2sgZm9yIGFuZCBibG9jayBpdC5cbiAgICAgIHZhciBjaGVja09wZXJhID0gc2VsZi5fbmF2aWdhdG9yICYmIHNlbGYuX25hdmlnYXRvci51c2VyQWdlbnQubWF0Y2goL09QUlxcLyhbMC02XS4pL2cpO1xuICAgICAgdmFyIGlzT2xkT3BlcmEgPSAoY2hlY2tPcGVyYSAmJiBwYXJzZUludChjaGVja09wZXJhWzBdLnNwbGl0KCcvJylbMV0sIDEwKSA8IDMzKTtcblxuICAgICAgc2VsZi5fY29kZWNzID0ge1xuICAgICAgICBtcDM6ICEhKCFpc09sZE9wZXJhICYmIChtcGVnVGVzdCB8fCBhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL21wMzsnKS5yZXBsYWNlKC9ebm8kLywgJycpKSksXG4gICAgICAgIG1wZWc6ICEhbXBlZ1Rlc3QsXG4gICAgICAgIG9wdXM6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9vZ2c7IGNvZGVjcz1cIm9wdXNcIicpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICAgIG9nZzogISFhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL29nZzsgY29kZWNzPVwidm9yYmlzXCInKS5yZXBsYWNlKC9ebm8kLywgJycpLFxuICAgICAgICBvZ2E6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9vZ2c7IGNvZGVjcz1cInZvcmJpc1wiJykucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgICAgd2F2OiAhIWF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vd2F2OyBjb2RlY3M9XCIxXCInKS5yZXBsYWNlKC9ebm8kLywgJycpLFxuICAgICAgICBhYWM6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9hYWM7JykucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgICAgY2FmOiAhIWF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8veC1jYWY7JykucmVwbGFjZSgvXm5vJC8sICcnKSxcbiAgICAgICAgbTRhOiAhIShhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL3gtbTRhOycpIHx8IGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vbTRhOycpIHx8IGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vYWFjOycpKS5yZXBsYWNlKC9ebm8kLywgJycpLFxuICAgICAgICBtcDQ6ICEhKGF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8veC1tcDQ7JykgfHwgYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9tcDQ7JykgfHwgYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby9hYWM7JykpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICAgIHdlYmE6ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby93ZWJtOyBjb2RlY3M9XCJ2b3JiaXNcIicpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICAgIHdlYm06ICEhYXVkaW9UZXN0LmNhblBsYXlUeXBlKCdhdWRpby93ZWJtOyBjb2RlY3M9XCJ2b3JiaXNcIicpLnJlcGxhY2UoL15ubyQvLCAnJyksXG4gICAgICAgIGRvbGJ5OiAhIWF1ZGlvVGVzdC5jYW5QbGF5VHlwZSgnYXVkaW8vbXA0OyBjb2RlY3M9XCJlYy0zXCInKS5yZXBsYWNlKC9ebm8kLywgJycpLFxuICAgICAgICBmbGFjOiAhIShhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL3gtZmxhYzsnKSB8fCBhdWRpb1Rlc3QuY2FuUGxheVR5cGUoJ2F1ZGlvL2ZsYWM7JykpLnJlcGxhY2UoL15ubyQvLCAnJylcbiAgICAgIH07XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBNb2JpbGUgYnJvd3NlcnMgd2lsbCBvbmx5IGFsbG93IGF1ZGlvIHRvIGJlIHBsYXllZCBhZnRlciBhIHVzZXIgaW50ZXJhY3Rpb24uXG4gICAgICogQXR0ZW1wdCB0byBhdXRvbWF0aWNhbGx5IHVubG9jayBhdWRpbyBvbiB0aGUgZmlyc3QgdXNlciBpbnRlcmFjdGlvbi5cbiAgICAgKiBDb25jZXB0IGZyb206IGh0dHA6Ly9wYXVsYmFrYXVzLmNvbS90dXRvcmlhbHMvaHRtbDUvd2ViLWF1ZGlvLW9uLWlvcy9cbiAgICAgKiBAcmV0dXJuIHtIb3dsZXJ9XG4gICAgICovXG4gICAgX2VuYWJsZU1vYmlsZUF1ZGlvOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcyB8fCBIb3dsZXI7XG5cbiAgICAgIC8vIE9ubHkgcnVuIHRoaXMgb24gbW9iaWxlIGRldmljZXMgaWYgYXVkaW8gaXNuJ3QgYWxyZWFkeSBlYW5ibGVkLlxuICAgICAgdmFyIGlzTW9iaWxlID0gL2lQaG9uZXxpUGFkfGlQb2R8QW5kcm9pZHxCbGFja0JlcnJ5fEJCMTB8U2lsa3xNb2JpL2kudGVzdChzZWxmLl9uYXZpZ2F0b3IgJiYgc2VsZi5fbmF2aWdhdG9yLnVzZXJBZ2VudCk7XG4gICAgICB2YXIgaXNUb3VjaCA9ICEhKCgnb250b3VjaGVuZCcgaW4gd2luZG93KSB8fCAoc2VsZi5fbmF2aWdhdG9yICYmIHNlbGYuX25hdmlnYXRvci5tYXhUb3VjaFBvaW50cyA+IDApIHx8IChzZWxmLl9uYXZpZ2F0b3IgJiYgc2VsZi5fbmF2aWdhdG9yLm1zTWF4VG91Y2hQb2ludHMgPiAwKSk7XG4gICAgICBpZiAoc2VsZi5fbW9iaWxlRW5hYmxlZCB8fCAhc2VsZi5jdHggfHwgKCFpc01vYmlsZSAmJiAhaXNUb3VjaCkpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBzZWxmLl9tb2JpbGVFbmFibGVkID0gZmFsc2U7XG5cbiAgICAgIC8vIFNvbWUgbW9iaWxlIGRldmljZXMvcGxhdGZvcm1zIGhhdmUgZGlzdG9ydGlvbiBpc3N1ZXMgd2hlbiBvcGVuaW5nL2Nsb3NpbmcgdGFicyBhbmQvb3Igd2ViIHZpZXdzLlxuICAgICAgLy8gQnVncyBpbiB0aGUgYnJvd3NlciAoZXNwZWNpYWxseSBNb2JpbGUgU2FmYXJpKSBjYW4gY2F1c2UgdGhlIHNhbXBsZVJhdGUgdG8gY2hhbmdlIGZyb20gNDQxMDAgdG8gNDgwMDAuXG4gICAgICAvLyBCeSBjYWxsaW5nIEhvd2xlci51bmxvYWQoKSwgd2UgY3JlYXRlIGEgbmV3IEF1ZGlvQ29udGV4dCB3aXRoIHRoZSBjb3JyZWN0IHNhbXBsZVJhdGUuXG4gICAgICBpZiAoIXNlbGYuX21vYmlsZVVubG9hZGVkICYmIHNlbGYuY3R4LnNhbXBsZVJhdGUgIT09IDQ0MTAwKSB7XG4gICAgICAgIHNlbGYuX21vYmlsZVVubG9hZGVkID0gdHJ1ZTtcbiAgICAgICAgc2VsZi51bmxvYWQoKTtcbiAgICAgIH1cblxuICAgICAgLy8gU2NyYXRjaCBidWZmZXIgZm9yIGVuYWJsaW5nIGlPUyB0byBkaXNwb3NlIG9mIHdlYiBhdWRpbyBidWZmZXJzIGNvcnJlY3RseSwgYXMgcGVyOlxuICAgICAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL3F1ZXN0aW9ucy8yNDExOTY4NFxuICAgICAgc2VsZi5fc2NyYXRjaEJ1ZmZlciA9IHNlbGYuY3R4LmNyZWF0ZUJ1ZmZlcigxLCAxLCAyMjA1MCk7XG5cbiAgICAgIC8vIENhbGwgdGhpcyBtZXRob2Qgb24gdG91Y2ggc3RhcnQgdG8gY3JlYXRlIGFuZCBwbGF5IGEgYnVmZmVyLFxuICAgICAgLy8gdGhlbiBjaGVjayBpZiB0aGUgYXVkaW8gYWN0dWFsbHkgcGxheWVkIHRvIGRldGVybWluZSBpZlxuICAgICAgLy8gYXVkaW8gaGFzIG5vdyBiZWVuIHVubG9ja2VkIG9uIGlPUywgQW5kcm9pZCwgZXRjLlxuICAgICAgdmFyIHVubG9jayA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBDcmVhdGUgYW4gZW1wdHkgYnVmZmVyLlxuICAgICAgICB2YXIgc291cmNlID0gc2VsZi5jdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICAgIHNvdXJjZS5idWZmZXIgPSBzZWxmLl9zY3JhdGNoQnVmZmVyO1xuICAgICAgICBzb3VyY2UuY29ubmVjdChzZWxmLmN0eC5kZXN0aW5hdGlvbik7XG5cbiAgICAgICAgLy8gUGxheSB0aGUgZW1wdHkgYnVmZmVyLlxuICAgICAgICBpZiAodHlwZW9mIHNvdXJjZS5zdGFydCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBzb3VyY2Uubm90ZU9uKDApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHNvdXJjZS5zdGFydCgwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldHVwIGEgdGltZW91dCB0byBjaGVjayB0aGF0IHdlIGFyZSB1bmxvY2tlZCBvbiB0aGUgbmV4dCBldmVudCBsb29wLlxuICAgICAgICBzb3VyY2Uub25lbmRlZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNvdXJjZS5kaXNjb25uZWN0KDApO1xuXG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSB1bmxvY2tlZCBzdGF0ZSBhbmQgcHJldmVudCB0aGlzIGNoZWNrIGZyb20gaGFwcGVuaW5nIGFnYWluLlxuICAgICAgICAgIHNlbGYuX21vYmlsZUVuYWJsZWQgPSB0cnVlO1xuICAgICAgICAgIHNlbGYubW9iaWxlQXV0b0VuYWJsZSA9IGZhbHNlO1xuXG4gICAgICAgICAgLy8gUmVtb3ZlIHRoZSB0b3VjaCBzdGFydCBsaXN0ZW5lci5cbiAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCd0b3VjaGVuZCcsIHVubG9jaywgdHJ1ZSk7XG4gICAgICAgIH07XG4gICAgICB9O1xuXG4gICAgICAvLyBTZXR1cCBhIHRvdWNoIHN0YXJ0IGxpc3RlbmVyIHRvIGF0dGVtcHQgYW4gdW5sb2NrIGluLlxuICAgICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCB1bmxvY2ssIHRydWUpO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQXV0b21hdGljYWxseSBzdXNwZW5kIHRoZSBXZWIgQXVkaW8gQXVkaW9Db250ZXh0IGFmdGVyIG5vIHNvdW5kIGhhcyBwbGF5ZWQgZm9yIDMwIHNlY29uZHMuXG4gICAgICogVGhpcyBzYXZlcyBwcm9jZXNzaW5nL2VuZXJneSBhbmQgZml4ZXMgdmFyaW91cyBicm93c2VyLXNwZWNpZmljIGJ1Z3Mgd2l0aCBhdWRpbyBnZXR0aW5nIHN0dWNrLlxuICAgICAqIEByZXR1cm4ge0hvd2xlcn1cbiAgICAgKi9cbiAgICBfYXV0b1N1c3BlbmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoIXNlbGYuYXV0b1N1c3BlbmQgfHwgIXNlbGYuY3R4IHx8IHR5cGVvZiBzZWxmLmN0eC5zdXNwZW5kID09PSAndW5kZWZpbmVkJyB8fCAhSG93bGVyLnVzaW5nV2ViQXVkaW8pIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBDaGVjayBpZiBhbnkgc291bmRzIGFyZSBwbGF5aW5nLlxuICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGYuX2hvd2xzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9ob3dsc1tpXS5fd2ViQXVkaW8pIHtcbiAgICAgICAgICBmb3IgKHZhciBqPTA7IGo8c2VsZi5faG93bHNbaV0uX3NvdW5kcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKCFzZWxmLl9ob3dsc1tpXS5fc291bmRzW2pdLl9wYXVzZWQpIHtcbiAgICAgICAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmIChzZWxmLl9zdXNwZW5kVGltZXIpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuX3N1c3BlbmRUaW1lcik7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG5vIHNvdW5kIGhhcyBwbGF5ZWQgYWZ0ZXIgMzAgc2Vjb25kcywgc3VzcGVuZCB0aGUgY29udGV4dC5cbiAgICAgIHNlbGYuX3N1c3BlbmRUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICghc2VsZi5hdXRvU3VzcGVuZCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHNlbGYuX3N1c3BlbmRUaW1lciA9IG51bGw7XG4gICAgICAgIHNlbGYuc3RhdGUgPSAnc3VzcGVuZGluZyc7XG4gICAgICAgIHNlbGYuY3R4LnN1c3BlbmQoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuc3RhdGUgPSAnc3VzcGVuZGVkJztcblxuICAgICAgICAgIGlmIChzZWxmLl9yZXN1bWVBZnRlclN1c3BlbmQpIHtcbiAgICAgICAgICAgIGRlbGV0ZSBzZWxmLl9yZXN1bWVBZnRlclN1c3BlbmQ7XG4gICAgICAgICAgICBzZWxmLl9hdXRvUmVzdW1lKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH0sIDMwMDAwKTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEF1dG9tYXRpY2FsbHkgcmVzdW1lIHRoZSBXZWIgQXVkaW8gQXVkaW9Db250ZXh0IHdoZW4gYSBuZXcgc291bmQgaXMgcGxheWVkLlxuICAgICAqIEByZXR1cm4ge0hvd2xlcn1cbiAgICAgKi9cbiAgICBfYXV0b1Jlc3VtZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmICghc2VsZi5jdHggfHwgdHlwZW9mIHNlbGYuY3R4LnJlc3VtZSA9PT0gJ3VuZGVmaW5lZCcgfHwgIUhvd2xlci51c2luZ1dlYkF1ZGlvKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKHNlbGYuc3RhdGUgPT09ICdydW5uaW5nJyAmJiBzZWxmLl9zdXNwZW5kVGltZXIpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KHNlbGYuX3N1c3BlbmRUaW1lcik7XG4gICAgICAgIHNlbGYuX3N1c3BlbmRUaW1lciA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKHNlbGYuc3RhdGUgPT09ICdzdXNwZW5kZWQnKSB7XG4gICAgICAgIHNlbGYuc3RhdGUgPSAncmVzdW1pbmcnO1xuICAgICAgICBzZWxmLmN0eC5yZXN1bWUoKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIHNlbGYuc3RhdGUgPSAncnVubmluZyc7XG5cbiAgICAgICAgICAvLyBFbWl0IHRvIGFsbCBIb3dscyB0aGF0IHRoZSBhdWRpbyBoYXMgcmVzdW1lZC5cbiAgICAgICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5faG93bHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHNlbGYuX2hvd2xzW2ldLl9lbWl0KCdyZXN1bWUnKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChzZWxmLl9zdXNwZW5kVGltZXIpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5fc3VzcGVuZFRpbWVyKTtcbiAgICAgICAgICBzZWxmLl9zdXNwZW5kVGltZXIgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHNlbGYuc3RhdGUgPT09ICdzdXNwZW5kaW5nJykge1xuICAgICAgICBzZWxmLl9yZXN1bWVBZnRlclN1c3BlbmQgPSB0cnVlO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG4gIH07XG5cbiAgLy8gU2V0dXAgdGhlIGdsb2JhbCBhdWRpbyBjb250cm9sbGVyLlxuICB2YXIgSG93bGVyID0gbmV3IEhvd2xlckdsb2JhbCgpO1xuXG4gIC8qKiBHcm91cCBNZXRob2RzICoqL1xuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYW4gYXVkaW8gZ3JvdXAgY29udHJvbGxlci5cbiAgICogQHBhcmFtIHtPYmplY3R9IG8gUGFzc2VkIGluIHByb3BlcnRpZXMgZm9yIHRoaXMgZ3JvdXAuXG4gICAqL1xuICB2YXIgSG93bCA9IGZ1bmN0aW9uKG8pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBUaHJvdyBhbiBlcnJvciBpZiBubyBzb3VyY2UgaXMgcHJvdmlkZWQuXG4gICAgaWYgKCFvLnNyYyB8fCBvLnNyYy5sZW5ndGggPT09IDApIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0FuIGFycmF5IG9mIHNvdXJjZSBmaWxlcyBtdXN0IGJlIHBhc3NlZCB3aXRoIGFueSBuZXcgSG93bC4nKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBzZWxmLmluaXQobyk7XG4gIH07XG4gIEhvd2wucHJvdG90eXBlID0ge1xuICAgIC8qKlxuICAgICAqIEluaXRpYWxpemUgYSBuZXcgSG93bCBncm91cCBvYmplY3QuXG4gICAgICogQHBhcmFtICB7T2JqZWN0fSBvIFBhc3NlZCBpbiBwcm9wZXJ0aWVzIGZvciB0aGlzIGdyb3VwLlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgaW5pdDogZnVuY3Rpb24obykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBJZiB3ZSBkb24ndCBoYXZlIGFuIEF1ZGlvQ29udGV4dCBjcmVhdGVkIHlldCwgcnVuIHRoZSBzZXR1cC5cbiAgICAgIGlmICghSG93bGVyLmN0eCkge1xuICAgICAgICBzZXR1cEF1ZGlvQ29udGV4dCgpO1xuICAgICAgfVxuXG4gICAgICAvLyBTZXR1cCB1c2VyLWRlZmluZWQgZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICAgICAgc2VsZi5fYXV0b3BsYXkgPSBvLmF1dG9wbGF5IHx8IGZhbHNlO1xuICAgICAgc2VsZi5fZm9ybWF0ID0gKHR5cGVvZiBvLmZvcm1hdCAhPT0gJ3N0cmluZycpID8gby5mb3JtYXQgOiBbby5mb3JtYXRdO1xuICAgICAgc2VsZi5faHRtbDUgPSBvLmh0bWw1IHx8IGZhbHNlO1xuICAgICAgc2VsZi5fbXV0ZWQgPSBvLm11dGUgfHwgZmFsc2U7XG4gICAgICBzZWxmLl9sb29wID0gby5sb29wIHx8IGZhbHNlO1xuICAgICAgc2VsZi5fcG9vbCA9IG8ucG9vbCB8fCA1O1xuICAgICAgc2VsZi5fcHJlbG9hZCA9ICh0eXBlb2Ygby5wcmVsb2FkID09PSAnYm9vbGVhbicpID8gby5wcmVsb2FkIDogdHJ1ZTtcbiAgICAgIHNlbGYuX3JhdGUgPSBvLnJhdGUgfHwgMTtcbiAgICAgIHNlbGYuX3Nwcml0ZSA9IG8uc3ByaXRlIHx8IHt9O1xuICAgICAgc2VsZi5fc3JjID0gKHR5cGVvZiBvLnNyYyAhPT0gJ3N0cmluZycpID8gby5zcmMgOiBbby5zcmNdO1xuICAgICAgc2VsZi5fdm9sdW1lID0gby52b2x1bWUgIT09IHVuZGVmaW5lZCA/IG8udm9sdW1lIDogMTtcblxuICAgICAgLy8gU2V0dXAgYWxsIG90aGVyIGRlZmF1bHQgcHJvcGVydGllcy5cbiAgICAgIHNlbGYuX2R1cmF0aW9uID0gMDtcbiAgICAgIHNlbGYuX3N0YXRlID0gJ3VubG9hZGVkJztcbiAgICAgIHNlbGYuX3NvdW5kcyA9IFtdO1xuICAgICAgc2VsZi5fZW5kVGltZXJzID0ge307XG4gICAgICBzZWxmLl9xdWV1ZSA9IFtdO1xuXG4gICAgICAvLyBTZXR1cCBldmVudCBsaXN0ZW5lcnMuXG4gICAgICBzZWxmLl9vbmVuZCA9IG8ub25lbmQgPyBbe2ZuOiBvLm9uZW5kfV0gOiBbXTtcbiAgICAgIHNlbGYuX29uZmFkZSA9IG8ub25mYWRlID8gW3tmbjogby5vbmZhZGV9XSA6IFtdO1xuICAgICAgc2VsZi5fb25sb2FkID0gby5vbmxvYWQgPyBbe2ZuOiBvLm9ubG9hZH1dIDogW107XG4gICAgICBzZWxmLl9vbmxvYWRlcnJvciA9IG8ub25sb2FkZXJyb3IgPyBbe2ZuOiBvLm9ubG9hZGVycm9yfV0gOiBbXTtcbiAgICAgIHNlbGYuX29ucGF1c2UgPSBvLm9ucGF1c2UgPyBbe2ZuOiBvLm9ucGF1c2V9XSA6IFtdO1xuICAgICAgc2VsZi5fb25wbGF5ID0gby5vbnBsYXkgPyBbe2ZuOiBvLm9ucGxheX1dIDogW107XG4gICAgICBzZWxmLl9vbnN0b3AgPSBvLm9uc3RvcCA/IFt7Zm46IG8ub25zdG9wfV0gOiBbXTtcbiAgICAgIHNlbGYuX29ubXV0ZSA9IG8ub25tdXRlID8gW3tmbjogby5vbm11dGV9XSA6IFtdO1xuICAgICAgc2VsZi5fb252b2x1bWUgPSBvLm9udm9sdW1lID8gW3tmbjogby5vbnZvbHVtZX1dIDogW107XG4gICAgICBzZWxmLl9vbnJhdGUgPSBvLm9ucmF0ZSA/IFt7Zm46IG8ub25yYXRlfV0gOiBbXTtcbiAgICAgIHNlbGYuX29uc2VlayA9IG8ub25zZWVrID8gW3tmbjogby5vbnNlZWt9XSA6IFtdO1xuICAgICAgc2VsZi5fb25yZXN1bWUgPSBbXTtcblxuICAgICAgLy8gV2ViIEF1ZGlvIG9yIEhUTUw1IEF1ZGlvP1xuICAgICAgc2VsZi5fd2ViQXVkaW8gPSBIb3dsZXIudXNpbmdXZWJBdWRpbyAmJiAhc2VsZi5faHRtbDU7XG5cbiAgICAgIC8vIEF1dG9tYXRpY2FsbHkgdHJ5IHRvIGVuYWJsZSBhdWRpbyBvbiBpT1MuXG4gICAgICBpZiAodHlwZW9mIEhvd2xlci5jdHggIT09ICd1bmRlZmluZWQnICYmIEhvd2xlci5jdHggJiYgSG93bGVyLm1vYmlsZUF1dG9FbmFibGUpIHtcbiAgICAgICAgSG93bGVyLl9lbmFibGVNb2JpbGVBdWRpbygpO1xuICAgICAgfVxuXG4gICAgICAvLyBLZWVwIHRyYWNrIG9mIHRoaXMgSG93bCBncm91cCBpbiB0aGUgZ2xvYmFsIGNvbnRyb2xsZXIuXG4gICAgICBIb3dsZXIuX2hvd2xzLnB1c2goc2VsZik7XG5cbiAgICAgIC8vIElmIHRoZXkgc2VsZWN0ZWQgYXV0b3BsYXksIGFkZCBhIHBsYXkgZXZlbnQgdG8gdGhlIGxvYWQgcXVldWUuXG4gICAgICBpZiAoc2VsZi5fYXV0b3BsYXkpIHtcbiAgICAgICAgc2VsZi5fcXVldWUucHVzaCh7XG4gICAgICAgICAgZXZlbnQ6ICdwbGF5JyxcbiAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5wbGF5KCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8gTG9hZCB0aGUgc291cmNlIGZpbGUgdW5sZXNzIG90aGVyd2lzZSBzcGVjaWZpZWQuXG4gICAgICBpZiAoc2VsZi5fcHJlbG9hZCkge1xuICAgICAgICBzZWxmLmxvYWQoKTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExvYWQgdGhlIGF1ZGlvIGZpbGUuXG4gICAgICogQHJldHVybiB7SG93bGVyfVxuICAgICAqL1xuICAgIGxvYWQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIHVybCA9IG51bGw7XG5cbiAgICAgIC8vIElmIG5vIGF1ZGlvIGlzIGF2YWlsYWJsZSwgcXVpdCBpbW1lZGlhdGVseS5cbiAgICAgIGlmIChIb3dsZXIubm9BdWRpbykge1xuICAgICAgICBzZWxmLl9lbWl0KCdsb2FkZXJyb3InLCBudWxsLCAnTm8gYXVkaW8gc3VwcG9ydC4nKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBNYWtlIHN1cmUgb3VyIHNvdXJjZSBpcyBpbiBhbiBhcnJheS5cbiAgICAgIGlmICh0eXBlb2Ygc2VsZi5fc3JjID09PSAnc3RyaW5nJykge1xuICAgICAgICBzZWxmLl9zcmMgPSBbc2VsZi5fc3JjXTtcbiAgICAgIH1cblxuICAgICAgLy8gTG9vcCB0aHJvdWdoIHRoZSBzb3VyY2VzIGFuZCBwaWNrIHRoZSBmaXJzdCBvbmUgdGhhdCBpcyBjb21wYXRpYmxlLlxuICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGYuX3NyYy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZXh0LCBzdHI7XG5cbiAgICAgICAgaWYgKHNlbGYuX2Zvcm1hdCAmJiBzZWxmLl9mb3JtYXRbaV0pIHtcbiAgICAgICAgICAvLyBJZiBhbiBleHRlbnNpb24gd2FzIHNwZWNpZmllZCwgdXNlIHRoYXQgaW5zdGVhZC5cbiAgICAgICAgICBleHQgPSBzZWxmLl9mb3JtYXRbaV07XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBzb3VyY2UgaXMgYSBzdHJpbmcuXG4gICAgICAgICAgc3RyID0gc2VsZi5fc3JjW2ldO1xuICAgICAgICAgIGlmICh0eXBlb2Ygc3RyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgc2VsZi5fZW1pdCgnbG9hZGVycm9yJywgbnVsbCwgJ05vbi1zdHJpbmcgZm91bmQgaW4gc2VsZWN0ZWQgYXVkaW8gc291cmNlcyAtIGlnbm9yaW5nLicpO1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gRXh0cmFjdCB0aGUgZmlsZSBleHRlbnNpb24gZnJvbSB0aGUgVVJMIG9yIGJhc2U2NCBkYXRhIFVSSS5cbiAgICAgICAgICBleHQgPSAvXmRhdGE6YXVkaW9cXC8oW147LF0rKTsvaS5leGVjKHN0cik7XG4gICAgICAgICAgaWYgKCFleHQpIHtcbiAgICAgICAgICAgIGV4dCA9IC9cXC4oW14uXSspJC8uZXhlYyhzdHIuc3BsaXQoJz8nLCAxKVswXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGV4dCkge1xuICAgICAgICAgICAgZXh0ID0gZXh0WzFdLnRvTG93ZXJDYXNlKCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ2hlY2sgaWYgdGhpcyBleHRlbnNpb24gaXMgYXZhaWxhYmxlLlxuICAgICAgICBpZiAoSG93bGVyLmNvZGVjcyhleHQpKSB7XG4gICAgICAgICAgdXJsID0gc2VsZi5fc3JjW2ldO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGlmICghdXJsKSB7XG4gICAgICAgIHNlbGYuX2VtaXQoJ2xvYWRlcnJvcicsIG51bGwsICdObyBjb2RlYyBzdXBwb3J0IGZvciBzZWxlY3RlZCBhdWRpbyBzb3VyY2VzLicpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHNlbGYuX3NyYyA9IHVybDtcbiAgICAgIHNlbGYuX3N0YXRlID0gJ2xvYWRpbmcnO1xuXG4gICAgICAvLyBJZiB0aGUgaG9zdGluZyBwYWdlIGlzIEhUVFBTIGFuZCB0aGUgc291cmNlIGlzbid0LFxuICAgICAgLy8gZHJvcCBkb3duIHRvIEhUTUw1IEF1ZGlvIHRvIGF2b2lkIE1peGVkIENvbnRlbnQgZXJyb3JzLlxuICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5wcm90b2NvbCA9PT0gJ2h0dHBzOicgJiYgdXJsLnNsaWNlKDAsIDUpID09PSAnaHR0cDonKSB7XG4gICAgICAgIHNlbGYuX2h0bWw1ID0gdHJ1ZTtcbiAgICAgICAgc2VsZi5fd2ViQXVkaW8gPSBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gQ3JlYXRlIGEgbmV3IHNvdW5kIG9iamVjdCBhbmQgYWRkIGl0IHRvIHRoZSBwb29sLlxuICAgICAgbmV3IFNvdW5kKHNlbGYpO1xuXG4gICAgICAvLyBMb2FkIGFuZCBkZWNvZGUgdGhlIGF1ZGlvIGRhdGEgZm9yIHBsYXliYWNrLlxuICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICAgIGxvYWRCdWZmZXIoc2VsZik7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBQbGF5IGEgc291bmQgb3IgcmVzdW1lIHByZXZpb3VzIHBsYXliYWNrLlxuICAgICAqIEBwYXJhbSAge1N0cmluZy9OdW1iZXJ9IHNwcml0ZSAgIFNwcml0ZSBuYW1lIGZvciBzcHJpdGUgcGxheWJhY2sgb3Igc291bmQgaWQgdG8gY29udGludWUgcHJldmlvdXMuXG4gICAgICogQHBhcmFtICB7Qm9vbGVhbn0gaW50ZXJuYWwgSW50ZXJuYWwgVXNlOiB0cnVlIHByZXZlbnRzIGV2ZW50IGZpcmluZy5cbiAgICAgKiBAcmV0dXJuIHtOdW1iZXJ9ICAgICAgICAgIFNvdW5kIElELlxuICAgICAqL1xuICAgIHBsYXk6IGZ1bmN0aW9uKHNwcml0ZSwgaW50ZXJuYWwpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBpZCA9IG51bGw7XG5cbiAgICAgIC8vIERldGVybWluZSBpZiBhIHNwcml0ZSwgc291bmQgaWQgb3Igbm90aGluZyB3YXMgcGFzc2VkXG4gICAgICBpZiAodHlwZW9mIHNwcml0ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgaWQgPSBzcHJpdGU7XG4gICAgICAgIHNwcml0ZSA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzcHJpdGUgPT09ICdzdHJpbmcnICYmIHNlbGYuX3N0YXRlID09PSAnbG9hZGVkJyAmJiAhc2VsZi5fc3ByaXRlW3Nwcml0ZV0pIHtcbiAgICAgICAgLy8gSWYgdGhlIHBhc3NlZCBzcHJpdGUgZG9lc24ndCBleGlzdCwgZG8gbm90aGluZy5cbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBzcHJpdGUgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIC8vIFVzZSB0aGUgZGVmYXVsdCBzb3VuZCBzcHJpdGUgKHBsYXlzIHRoZSBmdWxsIGF1ZGlvIGxlbmd0aCkuXG4gICAgICAgIHNwcml0ZSA9ICdfX2RlZmF1bHQnO1xuXG4gICAgICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEgc2luZ2xlIHBhdXNlZCBzb3VuZCB0aGF0IGlzbid0IGVuZGVkLlxuICAgICAgICAvLyBJZiB0aGVyZSBpcywgcGxheSB0aGF0IHNvdW5kLiBJZiBub3QsIGNvbnRpbnVlIGFzIHVzdWFsLlxuICAgICAgICB2YXIgbnVtID0gMDtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGYuX3NvdW5kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlmIChzZWxmLl9zb3VuZHNbaV0uX3BhdXNlZCAmJiAhc2VsZi5fc291bmRzW2ldLl9lbmRlZCkge1xuICAgICAgICAgICAgbnVtKys7XG4gICAgICAgICAgICBpZCA9IHNlbGYuX3NvdW5kc1tpXS5faWQ7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG51bSA9PT0gMSkge1xuICAgICAgICAgIHNwcml0ZSA9IG51bGw7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIEdldCB0aGUgc2VsZWN0ZWQgbm9kZSwgb3IgZ2V0IG9uZSBmcm9tIHRoZSBwb29sLlxuICAgICAgdmFyIHNvdW5kID0gaWQgPyBzZWxmLl9zb3VuZEJ5SWQoaWQpIDogc2VsZi5faW5hY3RpdmVTb3VuZCgpO1xuXG4gICAgICAvLyBJZiB0aGUgc291bmQgZG9lc24ndCBleGlzdCwgZG8gbm90aGluZy5cbiAgICAgIGlmICghc291bmQpIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG5cbiAgICAgIC8vIFNlbGVjdCB0aGUgc3ByaXRlIGRlZmluaXRpb24uXG4gICAgICBpZiAoaWQgJiYgIXNwcml0ZSkge1xuICAgICAgICBzcHJpdGUgPSBzb3VuZC5fc3ByaXRlIHx8ICdfX2RlZmF1bHQnO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiB3ZSBoYXZlIG5vIHNwcml0ZSBhbmQgdGhlIHNvdW5kIGhhc24ndCBsb2FkZWQsIHdlIG11c3Qgd2FpdFxuICAgICAgLy8gZm9yIHRoZSBzb3VuZCB0byBsb2FkIHRvIGdldCBvdXIgYXVkaW8ncyBkdXJhdGlvbi5cbiAgICAgIGlmIChzZWxmLl9zdGF0ZSAhPT0gJ2xvYWRlZCcgJiYgIXNlbGYuX3Nwcml0ZVtzcHJpdGVdKSB7XG4gICAgICAgIHNlbGYuX3F1ZXVlLnB1c2goe1xuICAgICAgICAgIGV2ZW50OiAncGxheScsXG4gICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYucGxheShzZWxmLl9zb3VuZEJ5SWQoc291bmQuX2lkKSA/IHNvdW5kLl9pZCA6IHVuZGVmaW5lZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gc291bmQuX2lkO1xuICAgICAgfVxuXG4gICAgICAvLyBEb24ndCBwbGF5IHRoZSBzb3VuZCBpZiBhbiBpZCB3YXMgcGFzc2VkIGFuZCBpdCBpcyBhbHJlYWR5IHBsYXlpbmcuXG4gICAgICBpZiAoaWQgJiYgIXNvdW5kLl9wYXVzZWQpIHtcbiAgICAgICAgLy8gVHJpZ2dlciB0aGUgcGxheSBldmVudCwgaW4gb3JkZXIgdG8ga2VlcCBpdGVyYXRpbmcgdGhyb3VnaCBxdWV1ZS5cbiAgICAgICAgaWYgKCFpbnRlcm5hbCkge1xuICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLl9lbWl0KCdwbGF5Jywgc291bmQuX2lkKTtcbiAgICAgICAgICB9LCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBzb3VuZC5faWQ7XG4gICAgICB9XG5cbiAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgQXVkaW9Db250ZXh0IGlzbid0IHN1c3BlbmRlZCwgYW5kIHJlc3VtZSBpdCBpZiBpdCBpcy5cbiAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICBIb3dsZXIuX2F1dG9SZXN1bWUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gRGV0ZXJtaW5lIGhvdyBsb25nIHRvIHBsYXkgZm9yIGFuZCB3aGVyZSB0byBzdGFydCBwbGF5aW5nLlxuICAgICAgdmFyIHNlZWsgPSBNYXRoLm1heCgwLCBzb3VuZC5fc2VlayA+IDAgPyBzb3VuZC5fc2VlayA6IHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzBdIC8gMTAwMCk7XG4gICAgICB2YXIgZHVyYXRpb24gPSBNYXRoLm1heCgwLCAoKHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzBdICsgc2VsZi5fc3ByaXRlW3Nwcml0ZV1bMV0pIC8gMTAwMCkgLSBzZWVrKTtcbiAgICAgIHZhciB0aW1lb3V0ID0gKGR1cmF0aW9uICogMTAwMCkgLyBNYXRoLmFicyhzb3VuZC5fcmF0ZSk7XG5cbiAgICAgIC8vIFVwZGF0ZSB0aGUgcGFyYW1ldGVycyBvZiB0aGUgc291bmRcbiAgICAgIHNvdW5kLl9wYXVzZWQgPSBmYWxzZTtcbiAgICAgIHNvdW5kLl9lbmRlZCA9IGZhbHNlO1xuICAgICAgc291bmQuX3Nwcml0ZSA9IHNwcml0ZTtcbiAgICAgIHNvdW5kLl9zZWVrID0gc2VlaztcbiAgICAgIHNvdW5kLl9zdGFydCA9IHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzBdIC8gMTAwMDtcbiAgICAgIHNvdW5kLl9zdG9wID0gKHNlbGYuX3Nwcml0ZVtzcHJpdGVdWzBdICsgc2VsZi5fc3ByaXRlW3Nwcml0ZV1bMV0pIC8gMTAwMDtcbiAgICAgIHNvdW5kLl9sb29wID0gISEoc291bmQuX2xvb3AgfHwgc2VsZi5fc3ByaXRlW3Nwcml0ZV1bMl0pO1xuXG4gICAgICAvLyBCZWdpbiB0aGUgYWN0dWFsIHBsYXliYWNrLlxuICAgICAgdmFyIG5vZGUgPSBzb3VuZC5fbm9kZTtcbiAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICAvLyBGaXJlIHRoaXMgd2hlbiB0aGUgc291bmQgaXMgcmVhZHkgdG8gcGxheSB0byBiZWdpbiBXZWIgQXVkaW8gcGxheWJhY2suXG4gICAgICAgIHZhciBwbGF5V2ViQXVkaW8gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLl9yZWZyZXNoQnVmZmVyKHNvdW5kKTtcblxuICAgICAgICAgIC8vIFNldHVwIHRoZSBwbGF5YmFjayBwYXJhbXMuXG4gICAgICAgICAgdmFyIHZvbCA9IChzb3VuZC5fbXV0ZWQgfHwgc2VsZi5fbXV0ZWQpID8gMCA6IHNvdW5kLl92b2x1bWU7XG4gICAgICAgICAgbm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKHZvbCwgSG93bGVyLmN0eC5jdXJyZW50VGltZSk7XG4gICAgICAgICAgc291bmQuX3BsYXlTdGFydCA9IEhvd2xlci5jdHguY3VycmVudFRpbWU7XG5cbiAgICAgICAgICAvLyBQbGF5IHRoZSBzb3VuZCB1c2luZyB0aGUgc3VwcG9ydGVkIG1ldGhvZC5cbiAgICAgICAgICBpZiAodHlwZW9mIG5vZGUuYnVmZmVyU291cmNlLnN0YXJ0ID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgc291bmQuX2xvb3AgPyBub2RlLmJ1ZmZlclNvdXJjZS5ub3RlR3JhaW5PbigwLCBzZWVrLCA4NjQwMCkgOiBub2RlLmJ1ZmZlclNvdXJjZS5ub3RlR3JhaW5PbigwLCBzZWVrLCBkdXJhdGlvbik7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHNvdW5kLl9sb29wID8gbm9kZS5idWZmZXJTb3VyY2Uuc3RhcnQoMCwgc2VlaywgODY0MDApIDogbm9kZS5idWZmZXJTb3VyY2Uuc3RhcnQoMCwgc2VlaywgZHVyYXRpb24pO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFN0YXJ0IGEgbmV3IHRpbWVyIGlmIG5vbmUgaXMgcHJlc2VudC5cbiAgICAgICAgICBpZiAodGltZW91dCAhPT0gSW5maW5pdHkpIHtcbiAgICAgICAgICAgIHNlbGYuX2VuZFRpbWVyc1tzb3VuZC5faWRdID0gc2V0VGltZW91dChzZWxmLl9lbmRlZC5iaW5kKHNlbGYsIHNvdW5kKSwgdGltZW91dCk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKCFpbnRlcm5hbCkge1xuICAgICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgc2VsZi5fZW1pdCgncGxheScsIHNvdW5kLl9pZCk7XG4gICAgICAgICAgICB9LCAwKTtcbiAgICAgICAgICB9XG4gICAgICAgIH07XG5cbiAgICAgICAgdmFyIGlzUnVubmluZyA9IChIb3dsZXIuc3RhdGUgPT09ICdydW5uaW5nJyk7XG4gICAgICAgIGlmIChzZWxmLl9zdGF0ZSA9PT0gJ2xvYWRlZCcgJiYgaXNSdW5uaW5nKSB7XG4gICAgICAgICAgcGxheVdlYkF1ZGlvKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIGF1ZGlvIHRvIGxvYWQgYW5kIHRoZW4gYmVnaW4gcGxheWJhY2suXG4gICAgICAgICAgc2VsZi5vbmNlKGlzUnVubmluZyA/ICdsb2FkJyA6ICdyZXN1bWUnLCBwbGF5V2ViQXVkaW8sIGlzUnVubmluZyA/IHNvdW5kLl9pZCA6IG51bGwpO1xuXG4gICAgICAgICAgLy8gQ2FuY2VsIHRoZSBlbmQgdGltZXIuXG4gICAgICAgICAgc2VsZi5fY2xlYXJUaW1lcihzb3VuZC5faWQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBGaXJlIHRoaXMgd2hlbiB0aGUgc291bmQgaXMgcmVhZHkgdG8gcGxheSB0byBiZWdpbiBIVE1MNSBBdWRpbyBwbGF5YmFjay5cbiAgICAgICAgdmFyIHBsYXlIdG1sNSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAgIG5vZGUuY3VycmVudFRpbWUgPSBzZWVrO1xuICAgICAgICAgIG5vZGUubXV0ZWQgPSBzb3VuZC5fbXV0ZWQgfHwgc2VsZi5fbXV0ZWQgfHwgSG93bGVyLl9tdXRlZCB8fCBub2RlLm11dGVkO1xuICAgICAgICAgIG5vZGUudm9sdW1lID0gc291bmQuX3ZvbHVtZSAqIEhvd2xlci52b2x1bWUoKTtcbiAgICAgICAgICBub2RlLnBsYXliYWNrUmF0ZSA9IHNvdW5kLl9yYXRlO1xuXG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIG5vZGUucGxheSgpO1xuXG4gICAgICAgICAgICAvLyBTZXR1cCB0aGUgbmV3IGVuZCB0aW1lci5cbiAgICAgICAgICAgIGlmICh0aW1lb3V0ICE9PSBJbmZpbml0eSkge1xuICAgICAgICAgICAgICBzZWxmLl9lbmRUaW1lcnNbc291bmQuX2lkXSA9IHNldFRpbWVvdXQoc2VsZi5fZW5kZWQuYmluZChzZWxmLCBzb3VuZCksIHRpbWVvdXQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoIWludGVybmFsKSB7XG4gICAgICAgICAgICAgIHNlbGYuX2VtaXQoJ3BsYXknLCBzb3VuZC5faWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9O1xuXG4gICAgICAgIC8vIFBsYXkgaW1tZWRpYXRlbHkgaWYgcmVhZHksIG9yIHdhaXQgZm9yIHRoZSAnY2FucGxheXRocm91Z2gnZSB2ZW50LlxuICAgICAgICB2YXIgbG9hZGVkTm9SZWFkeVN0YXRlID0gKHNlbGYuX3N0YXRlID09PSAnbG9hZGVkJyAmJiAod2luZG93ICYmIHdpbmRvdy5lamVjdGEgfHwgIW5vZGUucmVhZHlTdGF0ZSAmJiBIb3dsZXIuX25hdmlnYXRvci5pc0NvY29vbkpTKSk7XG4gICAgICAgIGlmIChub2RlLnJlYWR5U3RhdGUgPT09IDQgfHwgbG9hZGVkTm9SZWFkeVN0YXRlKSB7XG4gICAgICAgICAgcGxheUh0bWw1KCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdmFyIGxpc3RlbmVyID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAvLyBCZWdpbiBwbGF5YmFjay5cbiAgICAgICAgICAgIHBsYXlIdG1sNSgpO1xuXG4gICAgICAgICAgICAvLyBDbGVhciB0aGlzIGxpc3RlbmVyLlxuICAgICAgICAgICAgbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKEhvd2xlci5fY2FuUGxheUV2ZW50LCBsaXN0ZW5lciwgZmFsc2UpO1xuICAgICAgICAgIH07XG4gICAgICAgICAgbm9kZS5hZGRFdmVudExpc3RlbmVyKEhvd2xlci5fY2FuUGxheUV2ZW50LCBsaXN0ZW5lciwgZmFsc2UpO1xuXG4gICAgICAgICAgLy8gQ2FuY2VsIHRoZSBlbmQgdGltZXIuXG4gICAgICAgICAgc2VsZi5fY2xlYXJUaW1lcihzb3VuZC5faWQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzb3VuZC5faWQ7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFBhdXNlIHBsYXliYWNrIGFuZCBzYXZlIGN1cnJlbnQgcG9zaXRpb24uXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBpZCBUaGUgc291bmQgSUQgKGVtcHR5IHRvIHBhdXNlIGFsbCBpbiBncm91cCkuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBwYXVzZTogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgLy8gSWYgdGhlIHNvdW5kIGhhc24ndCBsb2FkZWQsIGFkZCBpdCB0byB0aGUgbG9hZCBxdWV1ZSB0byBwYXVzZSB3aGVuIGNhcGFibGUuXG4gICAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnKSB7XG4gICAgICAgIHNlbGYuX3F1ZXVlLnB1c2goe1xuICAgICAgICAgIGV2ZW50OiAncGF1c2UnLFxuICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLnBhdXNlKGlkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBubyBpZCBpcyBwYXNzZWQsIGdldCBhbGwgSUQncyB0byBiZSBwYXVzZWQuXG4gICAgICB2YXIgaWRzID0gc2VsZi5fZ2V0U291bmRJZHMoaWQpO1xuXG4gICAgICBmb3IgKHZhciBpPTA7IGk8aWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIENsZWFyIHRoZSBlbmQgdGltZXIuXG4gICAgICAgIHNlbGYuX2NsZWFyVGltZXIoaWRzW2ldKTtcblxuICAgICAgICAvLyBHZXQgdGhlIHNvdW5kLlxuICAgICAgICB2YXIgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWRzW2ldKTtcblxuICAgICAgICBpZiAoc291bmQgJiYgIXNvdW5kLl9wYXVzZWQpIHtcbiAgICAgICAgICAvLyBSZXNldCB0aGUgc2VlayBwb3NpdGlvbi5cbiAgICAgICAgICBzb3VuZC5fc2VlayA9IHNlbGYuc2VlayhpZHNbaV0pO1xuICAgICAgICAgIHNvdW5kLl9yYXRlU2VlayA9IDA7XG4gICAgICAgICAgc291bmQuX3BhdXNlZCA9IHRydWU7XG5cbiAgICAgICAgICAvLyBTdG9wIGN1cnJlbnRseSBydW5uaW5nIGZhZGVzLlxuICAgICAgICAgIHNlbGYuX3N0b3BGYWRlKGlkc1tpXSk7XG5cbiAgICAgICAgICBpZiAoc291bmQuX25vZGUpIHtcbiAgICAgICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICAgICAgICAvLyBtYWtlIHN1cmUgdGhlIHNvdW5kIGhhcyBiZWVuIGNyZWF0ZWRcbiAgICAgICAgICAgICAgaWYgKCFzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIGlmICh0eXBlb2Ygc291bmQuX25vZGUuYnVmZmVyU291cmNlLnN0b3AgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlLm5vdGVPZmYoMCk7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlLnN0b3AoMCk7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAvLyBDbGVhbiB1cCB0aGUgYnVmZmVyIHNvdXJjZS5cbiAgICAgICAgICAgICAgc2VsZi5fY2xlYW5CdWZmZXIoc291bmQuX25vZGUpO1xuICAgICAgICAgICAgfSBlbHNlIGlmICghaXNOYU4oc291bmQuX25vZGUuZHVyYXRpb24pIHx8IHNvdW5kLl9ub2RlLmR1cmF0aW9uID09PSBJbmZpbml0eSkge1xuICAgICAgICAgICAgICBzb3VuZC5fbm9kZS5wYXVzZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEZpcmUgdGhlIHBhdXNlIGV2ZW50LCB1bmxlc3MgYHRydWVgIGlzIHBhc3NlZCBhcyB0aGUgMm5kIGFyZ3VtZW50LlxuICAgICAgICBpZiAoIWFyZ3VtZW50c1sxXSkge1xuICAgICAgICAgIHNlbGYuX2VtaXQoJ3BhdXNlJywgc291bmQgPyBzb3VuZC5faWQgOiBudWxsKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogU3RvcCBwbGF5YmFjayBhbmQgcmVzZXQgdG8gc3RhcnQuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBpZCBUaGUgc291bmQgSUQgKGVtcHR5IHRvIHN0b3AgYWxsIGluIGdyb3VwKS5cbiAgICAgKiBAcGFyYW0gIHtCb29sZWFufSBpbnRlcm5hbCBJbnRlcm5hbCBVc2U6IHRydWUgcHJldmVudHMgZXZlbnQgZmlyaW5nLlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgc3RvcDogZnVuY3Rpb24oaWQsIGludGVybmFsKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIElmIHRoZSBzb3VuZCBoYXNuJ3QgbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGxvYWQgcXVldWUgdG8gc3RvcCB3aGVuIGNhcGFibGUuXG4gICAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnKSB7XG4gICAgICAgIHNlbGYuX3F1ZXVlLnB1c2goe1xuICAgICAgICAgIGV2ZW50OiAnc3RvcCcsXG4gICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuc3RvcChpZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgbm8gaWQgaXMgcGFzc2VkLCBnZXQgYWxsIElEJ3MgdG8gYmUgc3RvcHBlZC5cbiAgICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcyhpZCk7XG5cbiAgICAgIGZvciAodmFyIGk9MDsgaTxpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gQ2xlYXIgdGhlIGVuZCB0aW1lci5cbiAgICAgICAgc2VsZi5fY2xlYXJUaW1lcihpZHNbaV0pO1xuXG4gICAgICAgIC8vIEdldCB0aGUgc291bmQuXG4gICAgICAgIHZhciBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZHNbaV0pO1xuXG4gICAgICAgIGlmIChzb3VuZCkge1xuICAgICAgICAgIC8vIFJlc2V0IHRoZSBzZWVrIHBvc2l0aW9uLlxuICAgICAgICAgIHNvdW5kLl9zZWVrID0gc291bmQuX3N0YXJ0IHx8IDA7XG4gICAgICAgICAgc291bmQuX3JhdGVTZWVrID0gMDtcbiAgICAgICAgICBzb3VuZC5fcGF1c2VkID0gdHJ1ZTtcbiAgICAgICAgICBzb3VuZC5fZW5kZWQgPSB0cnVlO1xuXG4gICAgICAgICAgLy8gU3RvcCBjdXJyZW50bHkgcnVubmluZyBmYWRlcy5cbiAgICAgICAgICBzZWxmLl9zdG9wRmFkZShpZHNbaV0pO1xuXG4gICAgICAgICAgaWYgKHNvdW5kLl9ub2RlKSB7XG4gICAgICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgICAgICAgLy8gbWFrZSBzdXJlIHRoZSBzb3VuZCBoYXMgYmVlbiBjcmVhdGVkXG4gICAgICAgICAgICAgIGlmICghc291bmQuX25vZGUuYnVmZmVyU291cmNlKSB7XG4gICAgICAgICAgICAgICAgaWYgKCFpbnRlcm5hbCkge1xuICAgICAgICAgICAgICAgICAgc2VsZi5fZW1pdCgnc3RvcCcsIHNvdW5kLl9pZCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBpZiAodHlwZW9mIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5zdG9wID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5ub3RlT2ZmKDApO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5zdG9wKDApO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGJ1ZmZlciBzb3VyY2UuXG4gICAgICAgICAgICAgIHNlbGYuX2NsZWFuQnVmZmVyKHNvdW5kLl9ub2RlKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoIWlzTmFOKHNvdW5kLl9ub2RlLmR1cmF0aW9uKSB8fCBzb3VuZC5fbm9kZS5kdXJhdGlvbiA9PT0gSW5maW5pdHkpIHtcbiAgICAgICAgICAgICAgc291bmQuX25vZGUuY3VycmVudFRpbWUgPSBzb3VuZC5fc3RhcnQgfHwgMDtcbiAgICAgICAgICAgICAgc291bmQuX25vZGUucGF1c2UoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoc291bmQgJiYgIWludGVybmFsKSB7XG4gICAgICAgICAgc2VsZi5fZW1pdCgnc3RvcCcsIHNvdW5kLl9pZCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIE11dGUvdW5tdXRlIGEgc2luZ2xlIHNvdW5kIG9yIGFsbCBzb3VuZHMgaW4gdGhpcyBIb3dsIGdyb3VwLlxuICAgICAqIEBwYXJhbSAge0Jvb2xlYW59IG11dGVkIFNldCB0byB0cnVlIHRvIG11dGUgYW5kIGZhbHNlIHRvIHVubXV0ZS5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGlkICAgIFRoZSBzb3VuZCBJRCB0byB1cGRhdGUgKG9taXQgdG8gbXV0ZS91bm11dGUgYWxsKS5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIG11dGU6IGZ1bmN0aW9uKG11dGVkLCBpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBJZiB0aGUgc291bmQgaGFzbid0IGxvYWRlZCwgYWRkIGl0IHRvIHRoZSBsb2FkIHF1ZXVlIHRvIG11dGUgd2hlbiBjYXBhYmxlLlxuICAgICAgaWYgKHNlbGYuX3N0YXRlICE9PSAnbG9hZGVkJykge1xuICAgICAgICBzZWxmLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgICBldmVudDogJ211dGUnLFxuICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICBzZWxmLm11dGUobXV0ZWQsIGlkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfVxuXG4gICAgICAvLyBJZiBhcHBseWluZyBtdXRlL3VubXV0ZSB0byBhbGwgc291bmRzLCB1cGRhdGUgdGhlIGdyb3VwJ3MgdmFsdWUuXG4gICAgICBpZiAodHlwZW9mIGlkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICBpZiAodHlwZW9mIG11dGVkID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBzZWxmLl9tdXRlZCA9IG11dGVkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBzZWxmLl9tdXRlZDtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBJZiBubyBpZCBpcyBwYXNzZWQsIGdldCBhbGwgSUQncyB0byBiZSBtdXRlZC5cbiAgICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcyhpZCk7XG5cbiAgICAgIGZvciAodmFyIGk9MDsgaTxpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgLy8gR2V0IHRoZSBzb3VuZC5cbiAgICAgICAgdmFyIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKGlkc1tpXSk7XG5cbiAgICAgICAgaWYgKHNvdW5kKSB7XG4gICAgICAgICAgc291bmQuX211dGVkID0gbXV0ZWQ7XG5cbiAgICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8gJiYgc291bmQuX25vZGUpIHtcbiAgICAgICAgICAgIHNvdW5kLl9ub2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUobXV0ZWQgPyAwIDogc291bmQuX3ZvbHVtZSwgSG93bGVyLmN0eC5jdXJyZW50VGltZSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChzb3VuZC5fbm9kZSkge1xuICAgICAgICAgICAgc291bmQuX25vZGUubXV0ZWQgPSBIb3dsZXIuX211dGVkID8gdHJ1ZSA6IG11dGVkO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX2VtaXQoJ211dGUnLCBzb3VuZC5faWQpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQvc2V0IHRoZSB2b2x1bWUgb2YgdGhpcyBzb3VuZCBvciBvZiB0aGUgSG93bCBncm91cC4gVGhpcyBtZXRob2QgY2FuIG9wdGlvbmFsbHkgdGFrZSAwLCAxIG9yIDIgYXJndW1lbnRzLlxuICAgICAqICAgdm9sdW1lKCkgLT4gUmV0dXJucyB0aGUgZ3JvdXAncyB2b2x1bWUgdmFsdWUuXG4gICAgICogICB2b2x1bWUoaWQpIC0+IFJldHVybnMgdGhlIHNvdW5kIGlkJ3MgY3VycmVudCB2b2x1bWUuXG4gICAgICogICB2b2x1bWUodm9sKSAtPiBTZXRzIHRoZSB2b2x1bWUgb2YgYWxsIHNvdW5kcyBpbiB0aGlzIEhvd2wgZ3JvdXAuXG4gICAgICogICB2b2x1bWUodm9sLCBpZCkgLT4gU2V0cyB0aGUgdm9sdW1lIG9mIHBhc3NlZCBzb3VuZCBpZC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsL051bWJlcn0gUmV0dXJucyBzZWxmIG9yIGN1cnJlbnQgdm9sdW1lLlxuICAgICAqL1xuICAgIHZvbHVtZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHZhciB2b2wsIGlkO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgdGhlIHZhbHVlcyBiYXNlZCBvbiBhcmd1bWVudHMuXG4gICAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gUmV0dXJuIHRoZSB2YWx1ZSBvZiB0aGUgZ3JvdXBzJyB2b2x1bWUuXG4gICAgICAgIHJldHVybiBzZWxmLl92b2x1bWU7XG4gICAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAxIHx8IGFyZ3MubGVuZ3RoID09PSAyICYmIHR5cGVvZiBhcmdzWzFdID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAvLyBGaXJzdCBjaGVjayBpZiB0aGlzIGlzIGFuIElELCBhbmQgaWYgbm90LCBhc3N1bWUgaXQgaXMgYSBuZXcgdm9sdW1lLlxuICAgICAgICB2YXIgaWRzID0gc2VsZi5fZ2V0U291bmRJZHMoKTtcbiAgICAgICAgdmFyIGluZGV4ID0gaWRzLmluZGV4T2YoYXJnc1swXSk7XG4gICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgaWQgPSBwYXJzZUludChhcmdzWzBdLCAxMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgdm9sID0gcGFyc2VGbG9hdChhcmdzWzBdKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChhcmdzLmxlbmd0aCA+PSAyKSB7XG4gICAgICAgIHZvbCA9IHBhcnNlRmxvYXQoYXJnc1swXSk7XG4gICAgICAgIGlkID0gcGFyc2VJbnQoYXJnc1sxXSwgMTApO1xuICAgICAgfVxuXG4gICAgICAvLyBVcGRhdGUgdGhlIHZvbHVtZSBvciByZXR1cm4gdGhlIGN1cnJlbnQgdm9sdW1lLlxuICAgICAgdmFyIHNvdW5kO1xuICAgICAgaWYgKHR5cGVvZiB2b2wgIT09ICd1bmRlZmluZWQnICYmIHZvbCA+PSAwICYmIHZvbCA8PSAxKSB7XG4gICAgICAgIC8vIElmIHRoZSBzb3VuZCBoYXNuJ3QgbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGxvYWQgcXVldWUgdG8gY2hhbmdlIHZvbHVtZSB3aGVuIGNhcGFibGUuXG4gICAgICAgIGlmIChzZWxmLl9zdGF0ZSAhPT0gJ2xvYWRlZCcpIHtcbiAgICAgICAgICBzZWxmLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgICAgIGV2ZW50OiAndm9sdW1lJyxcbiAgICAgICAgICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgIHNlbGYudm9sdW1lLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgdGhlIGdyb3VwIHZvbHVtZS5cbiAgICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBzZWxmLl92b2x1bWUgPSB2b2w7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBVcGRhdGUgb25lIG9yIGFsbCB2b2x1bWVzLlxuICAgICAgICBpZCA9IHNlbGYuX2dldFNvdW5kSWRzKGlkKTtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPGlkLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgLy8gR2V0IHRoZSBzb3VuZC5cbiAgICAgICAgICBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZFtpXSk7XG5cbiAgICAgICAgICBpZiAoc291bmQpIHtcbiAgICAgICAgICAgIHNvdW5kLl92b2x1bWUgPSB2b2w7XG5cbiAgICAgICAgICAgIC8vIFN0b3AgY3VycmVudGx5IHJ1bm5pbmcgZmFkZXMuXG4gICAgICAgICAgICBpZiAoIWFyZ3NbMl0pIHtcbiAgICAgICAgICAgICAgc2VsZi5fc3RvcEZhZGUoaWRbaV0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8gJiYgc291bmQuX25vZGUgJiYgIXNvdW5kLl9tdXRlZCkge1xuICAgICAgICAgICAgICBzb3VuZC5fbm9kZS5nYWluLnNldFZhbHVlQXRUaW1lKHZvbCwgSG93bGVyLmN0eC5jdXJyZW50VGltZSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNvdW5kLl9ub2RlICYmICFzb3VuZC5fbXV0ZWQpIHtcbiAgICAgICAgICAgICAgc291bmQuX25vZGUudm9sdW1lID0gdm9sICogSG93bGVyLnZvbHVtZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzZWxmLl9lbWl0KCd2b2x1bWUnLCBzb3VuZC5faWQpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc291bmQgPSBpZCA/IHNlbGYuX3NvdW5kQnlJZChpZCkgOiBzZWxmLl9zb3VuZHNbMF07XG4gICAgICAgIHJldHVybiBzb3VuZCA/IHNvdW5kLl92b2x1bWUgOiAwO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmFkZSBhIGN1cnJlbnRseSBwbGF5aW5nIHNvdW5kIGJldHdlZW4gdHdvIHZvbHVtZXMgKGlmIG5vIGlkIGlzIHBhc3NzZWQsIGFsbCBzb3VuZHMgd2lsbCBmYWRlKS5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGZyb20gVGhlIHZhbHVlIHRvIGZhZGUgZnJvbSAoMC4wIHRvIDEuMCkuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSB0byAgIFRoZSB2b2x1bWUgdG8gZmFkZSB0byAoMC4wIHRvIDEuMCkuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBsZW4gIFRpbWUgaW4gbWlsbGlzZWNvbmRzIHRvIGZhZGUuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBpZCAgIFRoZSBzb3VuZCBpZCAob21pdCB0byBmYWRlIGFsbCBzb3VuZHMpLlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgZmFkZTogZnVuY3Rpb24oZnJvbSwgdG8sIGxlbiwgaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBkaWZmID0gTWF0aC5hYnMoZnJvbSAtIHRvKTtcbiAgICAgIHZhciBkaXIgPSBmcm9tID4gdG8gPyAnb3V0JyA6ICdpbic7XG4gICAgICB2YXIgc3RlcHMgPSBkaWZmIC8gMC4wMTtcbiAgICAgIHZhciBzdGVwTGVuID0gKHN0ZXBzID4gMCkgPyBsZW4gLyBzdGVwcyA6IGxlbjtcblxuICAgICAgLy8gU2luY2UgYnJvd3NlcnMgY2xhbXAgdGltZW91dHMgdG8gNG1zLCB3ZSBuZWVkIHRvIGNsYW1wIG91ciBzdGVwcyB0byB0aGF0IHRvby5cbiAgICAgIGlmIChzdGVwTGVuIDwgNCkge1xuICAgICAgICBzdGVwcyA9IE1hdGguY2VpbChzdGVwcyAvICg0IC8gc3RlcExlbikpO1xuICAgICAgICBzdGVwTGVuID0gNDtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlIHNvdW5kIGhhc24ndCBsb2FkZWQsIGFkZCBpdCB0byB0aGUgbG9hZCBxdWV1ZSB0byBmYWRlIHdoZW4gY2FwYWJsZS5cbiAgICAgIGlmIChzZWxmLl9zdGF0ZSAhPT0gJ2xvYWRlZCcpIHtcbiAgICAgICAgc2VsZi5fcXVldWUucHVzaCh7XG4gICAgICAgICAgZXZlbnQ6ICdmYWRlJyxcbiAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgc2VsZi5mYWRlKGZyb20sIHRvLCBsZW4sIGlkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfVxuXG4gICAgICAvLyBTZXQgdGhlIHZvbHVtZSB0byB0aGUgc3RhcnQgcG9zaXRpb24uXG4gICAgICBzZWxmLnZvbHVtZShmcm9tLCBpZCk7XG5cbiAgICAgIC8vIEZhZGUgdGhlIHZvbHVtZSBvZiBvbmUgb3IgYWxsIHNvdW5kcy5cbiAgICAgIHZhciBpZHMgPSBzZWxmLl9nZXRTb3VuZElkcyhpZCk7XG4gICAgICBmb3IgKHZhciBpPTA7IGk8aWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIEdldCB0aGUgc291bmQuXG4gICAgICAgIHZhciBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZHNbaV0pO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIGxpbmVhciBmYWRlIG9yIGZhbGwgYmFjayB0byB0aW1lb3V0cyB3aXRoIEhUTUw1IEF1ZGlvLlxuICAgICAgICBpZiAoc291bmQpIHtcbiAgICAgICAgICAvLyBTdG9wIHRoZSBwcmV2aW91cyBmYWRlIGlmIG5vIHNwcml0ZSBpcyBiZWluZyB1c2VkIChvdGhlcndpc2UsIHZvbHVtZSBoYW5kbGVzIHRoaXMpLlxuICAgICAgICAgIGlmICghaWQpIHtcbiAgICAgICAgICAgIHNlbGYuX3N0b3BGYWRlKGlkc1tpXSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gSWYgd2UgYXJlIHVzaW5nIFdlYiBBdWRpbywgbGV0IHRoZSBuYXRpdmUgbWV0aG9kcyBkbyB0aGUgYWN0dWFsIGZhZGUuXG4gICAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvICYmICFzb3VuZC5fbXV0ZWQpIHtcbiAgICAgICAgICAgIHZhciBjdXJyZW50VGltZSA9IEhvd2xlci5jdHguY3VycmVudFRpbWU7XG4gICAgICAgICAgICB2YXIgZW5kID0gY3VycmVudFRpbWUgKyAobGVuIC8gMTAwMCk7XG4gICAgICAgICAgICBzb3VuZC5fdm9sdW1lID0gZnJvbTtcbiAgICAgICAgICAgIHNvdW5kLl9ub2RlLmdhaW4uc2V0VmFsdWVBdFRpbWUoZnJvbSwgY3VycmVudFRpbWUpO1xuICAgICAgICAgICAgc291bmQuX25vZGUuZ2Fpbi5saW5lYXJSYW1wVG9WYWx1ZUF0VGltZSh0bywgZW5kKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICB2YXIgdm9sID0gZnJvbTtcbiAgICAgICAgICBzb3VuZC5faW50ZXJ2YWwgPSBzZXRJbnRlcnZhbChmdW5jdGlvbihzb3VuZElkLCBzb3VuZCkge1xuICAgICAgICAgICAgLy8gVXBkYXRlIHRoZSB2b2x1bWUgYW1vdW50LCBidXQgb25seSBpZiB0aGUgdm9sdW1lIHNob3VsZCBjaGFuZ2UuXG4gICAgICAgICAgICBpZiAoc3RlcHMgPiAwKSB7XG4gICAgICAgICAgICAgIHZvbCArPSAoZGlyID09PSAnaW4nID8gMC4wMSA6IC0wLjAxKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSB2b2x1bWUgaXMgaW4gdGhlIHJpZ2h0IGJvdW5kcy5cbiAgICAgICAgICAgIHZvbCA9IE1hdGgubWF4KDAsIHZvbCk7XG4gICAgICAgICAgICB2b2wgPSBNYXRoLm1pbigxLCB2b2wpO1xuXG4gICAgICAgICAgICAvLyBSb3VuZCB0byB3aXRoaW4gMiBkZWNpbWFsIHBvaW50cy5cbiAgICAgICAgICAgIHZvbCA9IE1hdGgucm91bmQodm9sICogMTAwKSAvIDEwMDtcblxuICAgICAgICAgICAgLy8gQ2hhbmdlIHRoZSB2b2x1bWUuXG4gICAgICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICAgICBzZWxmLl92b2x1bWUgPSB2b2w7XG4gICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICBzb3VuZC5fdm9sdW1lID0gdm9sO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgc2VsZi52b2x1bWUodm9sLCBzb3VuZElkLCB0cnVlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gV2hlbiB0aGUgZmFkZSBpcyBjb21wbGV0ZSwgc3RvcCBpdCBhbmQgZmlyZSBldmVudC5cbiAgICAgICAgICAgIGlmICh2b2wgPT09IHRvKSB7XG4gICAgICAgICAgICAgIGNsZWFySW50ZXJ2YWwoc291bmQuX2ludGVydmFsKTtcbiAgICAgICAgICAgICAgc291bmQuX2ludGVydmFsID0gbnVsbDtcbiAgICAgICAgICAgICAgc2VsZi52b2x1bWUodm9sLCBzb3VuZElkKTtcbiAgICAgICAgICAgICAgc2VsZi5fZW1pdCgnZmFkZScsIHNvdW5kSWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0uYmluZChzZWxmLCBpZHNbaV0sIHNvdW5kKSwgc3RlcExlbik7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEludGVybmFsIG1ldGhvZCB0aGF0IHN0b3BzIHRoZSBjdXJyZW50bHkgcGxheWluZyBmYWRlIHdoZW5cbiAgICAgKiBhIG5ldyBmYWRlIHN0YXJ0cywgdm9sdW1lIGlzIGNoYW5nZWQgb3IgdGhlIHNvdW5kIGlzIHN0b3BwZWQuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBpZCBUaGUgc291bmQgaWQuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBfc3RvcEZhZGU6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWQpO1xuXG4gICAgICBpZiAoc291bmQgJiYgc291bmQuX2ludGVydmFsKSB7XG4gICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICAgIHNvdW5kLl9ub2RlLmdhaW4uY2FuY2VsU2NoZWR1bGVkVmFsdWVzKEhvd2xlci5jdHguY3VycmVudFRpbWUpO1xuICAgICAgICB9XG5cbiAgICAgICAgY2xlYXJJbnRlcnZhbChzb3VuZC5faW50ZXJ2YWwpO1xuICAgICAgICBzb3VuZC5faW50ZXJ2YWwgPSBudWxsO1xuICAgICAgICBzZWxmLl9lbWl0KCdmYWRlJywgaWQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0L3NldCB0aGUgbG9vcCBwYXJhbWV0ZXIgb24gYSBzb3VuZC4gVGhpcyBtZXRob2QgY2FuIG9wdGlvbmFsbHkgdGFrZSAwLCAxIG9yIDIgYXJndW1lbnRzLlxuICAgICAqICAgbG9vcCgpIC0+IFJldHVybnMgdGhlIGdyb3VwJ3MgbG9vcCB2YWx1ZS5cbiAgICAgKiAgIGxvb3AoaWQpIC0+IFJldHVybnMgdGhlIHNvdW5kIGlkJ3MgbG9vcCB2YWx1ZS5cbiAgICAgKiAgIGxvb3AobG9vcCkgLT4gU2V0cyB0aGUgbG9vcCB2YWx1ZSBmb3IgYWxsIHNvdW5kcyBpbiB0aGlzIEhvd2wgZ3JvdXAuXG4gICAgICogICBsb29wKGxvb3AsIGlkKSAtPiBTZXRzIHRoZSBsb29wIHZhbHVlIG9mIHBhc3NlZCBzb3VuZCBpZC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsL0Jvb2xlYW59IFJldHVybnMgc2VsZiBvciBjdXJyZW50IGxvb3AgdmFsdWUuXG4gICAgICovXG4gICAgbG9vcDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHZhciBsb29wLCBpZCwgc291bmQ7XG5cbiAgICAgIC8vIERldGVybWluZSB0aGUgdmFsdWVzIGZvciBsb29wIGFuZCBpZC5cbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAvLyBSZXR1cm4gdGhlIGdyb3UncyBsb29wIHZhbHVlLlxuICAgICAgICByZXR1cm4gc2VsZi5fbG9vcDtcbiAgICAgIH0gZWxzZSBpZiAoYXJncy5sZW5ndGggPT09IDEpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBhcmdzWzBdID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICBsb29wID0gYXJnc1swXTtcbiAgICAgICAgICBzZWxmLl9sb29wID0gbG9vcDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBSZXR1cm4gdGhpcyBzb3VuZCdzIGxvb3AgdmFsdWUuXG4gICAgICAgICAgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQocGFyc2VJbnQoYXJnc1swXSwgMTApKTtcbiAgICAgICAgICByZXR1cm4gc291bmQgPyBzb3VuZC5fbG9vcCA6IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIGxvb3AgPSBhcmdzWzBdO1xuICAgICAgICBpZCA9IHBhcnNlSW50KGFyZ3NbMV0sIDEwKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgbm8gaWQgaXMgcGFzc2VkLCBnZXQgYWxsIElEJ3MgdG8gYmUgbG9vcGVkLlxuICAgICAgdmFyIGlkcyA9IHNlbGYuX2dldFNvdW5kSWRzKGlkKTtcbiAgICAgIGZvciAodmFyIGk9MDsgaTxpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWRzW2ldKTtcblxuICAgICAgICBpZiAoc291bmQpIHtcbiAgICAgICAgICBzb3VuZC5fbG9vcCA9IGxvb3A7XG4gICAgICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvICYmIHNvdW5kLl9ub2RlICYmIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZSkge1xuICAgICAgICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlLmxvb3AgPSBsb29wO1xuICAgICAgICAgICAgaWYgKGxvb3ApIHtcbiAgICAgICAgICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlLmxvb3BTdGFydCA9IHNvdW5kLl9zdGFydCB8fCAwO1xuICAgICAgICAgICAgICBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UubG9vcEVuZCA9IHNvdW5kLl9zdG9wO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0L3NldCB0aGUgcGxheWJhY2sgcmF0ZSBvZiBhIHNvdW5kLiBUaGlzIG1ldGhvZCBjYW4gb3B0aW9uYWxseSB0YWtlIDAsIDEgb3IgMiBhcmd1bWVudHMuXG4gICAgICogICByYXRlKCkgLT4gUmV0dXJucyB0aGUgZmlyc3Qgc291bmQgbm9kZSdzIGN1cnJlbnQgcGxheWJhY2sgcmF0ZS5cbiAgICAgKiAgIHJhdGUoaWQpIC0+IFJldHVybnMgdGhlIHNvdW5kIGlkJ3MgY3VycmVudCBwbGF5YmFjayByYXRlLlxuICAgICAqICAgcmF0ZShyYXRlKSAtPiBTZXRzIHRoZSBwbGF5YmFjayByYXRlIG9mIGFsbCBzb3VuZHMgaW4gdGhpcyBIb3dsIGdyb3VwLlxuICAgICAqICAgcmF0ZShyYXRlLCBpZCkgLT4gU2V0cyB0aGUgcGxheWJhY2sgcmF0ZSBvZiBwYXNzZWQgc291bmQgaWQuXG4gICAgICogQHJldHVybiB7SG93bC9OdW1iZXJ9IFJldHVybnMgc2VsZiBvciB0aGUgY3VycmVudCBwbGF5YmFjayByYXRlLlxuICAgICAqL1xuICAgIHJhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB2YXIgcmF0ZSwgaWQ7XG5cbiAgICAgIC8vIERldGVybWluZSB0aGUgdmFsdWVzIGJhc2VkIG9uIGFyZ3VtZW50cy5cbiAgICAgIGlmIChhcmdzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAvLyBXZSB3aWxsIHNpbXBseSByZXR1cm4gdGhlIGN1cnJlbnQgcmF0ZSBvZiB0aGUgZmlyc3Qgbm9kZS5cbiAgICAgICAgaWQgPSBzZWxmLl9zb3VuZHNbMF0uX2lkO1xuICAgICAgfSBlbHNlIGlmIChhcmdzLmxlbmd0aCA9PT0gMSkge1xuICAgICAgICAvLyBGaXJzdCBjaGVjayBpZiB0aGlzIGlzIGFuIElELCBhbmQgaWYgbm90LCBhc3N1bWUgaXQgaXMgYSBuZXcgcmF0ZSB2YWx1ZS5cbiAgICAgICAgdmFyIGlkcyA9IHNlbGYuX2dldFNvdW5kSWRzKCk7XG4gICAgICAgIHZhciBpbmRleCA9IGlkcy5pbmRleE9mKGFyZ3NbMF0pO1xuICAgICAgICBpZiAoaW5kZXggPj0gMCkge1xuICAgICAgICAgIGlkID0gcGFyc2VJbnQoYXJnc1swXSwgMTApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJhdGUgPSBwYXJzZUZsb2F0KGFyZ3NbMF0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIHJhdGUgPSBwYXJzZUZsb2F0KGFyZ3NbMF0pO1xuICAgICAgICBpZCA9IHBhcnNlSW50KGFyZ3NbMV0sIDEwKTtcbiAgICAgIH1cblxuICAgICAgLy8gVXBkYXRlIHRoZSBwbGF5YmFjayByYXRlIG9yIHJldHVybiB0aGUgY3VycmVudCB2YWx1ZS5cbiAgICAgIHZhciBzb3VuZDtcbiAgICAgIGlmICh0eXBlb2YgcmF0ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgLy8gSWYgdGhlIHNvdW5kIGhhc24ndCBsb2FkZWQsIGFkZCBpdCB0byB0aGUgbG9hZCBxdWV1ZSB0byBjaGFuZ2UgcGxheWJhY2sgcmF0ZSB3aGVuIGNhcGFibGUuXG4gICAgICAgIGlmIChzZWxmLl9zdGF0ZSAhPT0gJ2xvYWRlZCcpIHtcbiAgICAgICAgICBzZWxmLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgICAgIGV2ZW50OiAncmF0ZScsXG4gICAgICAgICAgICBhY3Rpb246IGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICBzZWxmLnJhdGUuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICByZXR1cm4gc2VsZjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNldCB0aGUgZ3JvdXAgcmF0ZS5cbiAgICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICBzZWxmLl9yYXRlID0gcmF0ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVwZGF0ZSBvbmUgb3IgYWxsIHZvbHVtZXMuXG4gICAgICAgIGlkID0gc2VsZi5fZ2V0U291bmRJZHMoaWQpO1xuICAgICAgICBmb3IgKHZhciBpPTA7IGk8aWQubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAvLyBHZXQgdGhlIHNvdW5kLlxuICAgICAgICAgIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKGlkW2ldKTtcblxuICAgICAgICAgIGlmIChzb3VuZCkge1xuICAgICAgICAgICAgLy8gS2VlcCB0cmFjayBvZiBvdXIgcG9zaXRpb24gd2hlbiB0aGUgcmF0ZSBjaGFuZ2VkIGFuZCB1cGRhdGUgdGhlIHBsYXliYWNrXG4gICAgICAgICAgICAvLyBzdGFydCBwb3NpdGlvbiBzbyB3ZSBjYW4gcHJvcGVybHkgYWRqdXN0IHRoZSBzZWVrIHBvc2l0aW9uIGZvciB0aW1lIGVsYXBzZWQuXG4gICAgICAgICAgICBzb3VuZC5fcmF0ZVNlZWsgPSBzZWxmLnNlZWsoaWRbaV0pO1xuICAgICAgICAgICAgc291bmQuX3BsYXlTdGFydCA9IHNlbGYuX3dlYkF1ZGlvID8gSG93bGVyLmN0eC5jdXJyZW50VGltZSA6IHNvdW5kLl9wbGF5U3RhcnQ7XG4gICAgICAgICAgICBzb3VuZC5fcmF0ZSA9IHJhdGU7XG5cbiAgICAgICAgICAgIC8vIENoYW5nZSB0aGUgcGxheWJhY2sgcmF0ZS5cbiAgICAgICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbyAmJiBzb3VuZC5fbm9kZSAmJiBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UpIHtcbiAgICAgICAgICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlLnBsYXliYWNrUmF0ZS52YWx1ZSA9IHJhdGU7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHNvdW5kLl9ub2RlKSB7XG4gICAgICAgICAgICAgIHNvdW5kLl9ub2RlLnBsYXliYWNrUmF0ZSA9IHJhdGU7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFJlc2V0IHRoZSB0aW1lcnMuXG4gICAgICAgICAgICB2YXIgc2VlayA9IHNlbGYuc2VlayhpZFtpXSk7XG4gICAgICAgICAgICB2YXIgZHVyYXRpb24gPSAoKHNlbGYuX3Nwcml0ZVtzb3VuZC5fc3ByaXRlXVswXSArIHNlbGYuX3Nwcml0ZVtzb3VuZC5fc3ByaXRlXVsxXSkgLyAxMDAwKSAtIHNlZWs7XG4gICAgICAgICAgICB2YXIgdGltZW91dCA9IChkdXJhdGlvbiAqIDEwMDApIC8gTWF0aC5hYnMoc291bmQuX3JhdGUpO1xuXG4gICAgICAgICAgICAvLyBTdGFydCBhIG5ldyBlbmQgdGltZXIgaWYgc291bmQgaXMgYWxyZWFkeSBwbGF5aW5nLlxuICAgICAgICAgICAgaWYgKHNlbGYuX2VuZFRpbWVyc1tpZFtpXV0gfHwgIXNvdW5kLl9wYXVzZWQpIHtcbiAgICAgICAgICAgICAgc2VsZi5fY2xlYXJUaW1lcihpZFtpXSk7XG4gICAgICAgICAgICAgIHNlbGYuX2VuZFRpbWVyc1tpZFtpXV0gPSBzZXRUaW1lb3V0KHNlbGYuX2VuZGVkLmJpbmQoc2VsZiwgc291bmQpLCB0aW1lb3V0KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2VsZi5fZW1pdCgncmF0ZScsIHNvdW5kLl9pZCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChpZCk7XG4gICAgICAgIHJldHVybiBzb3VuZCA/IHNvdW5kLl9yYXRlIDogc2VsZi5fcmF0ZTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIEdldC9zZXQgdGhlIHNlZWsgcG9zaXRpb24gb2YgYSBzb3VuZC4gVGhpcyBtZXRob2QgY2FuIG9wdGlvbmFsbHkgdGFrZSAwLCAxIG9yIDIgYXJndW1lbnRzLlxuICAgICAqICAgc2VlaygpIC0+IFJldHVybnMgdGhlIGZpcnN0IHNvdW5kIG5vZGUncyBjdXJyZW50IHNlZWsgcG9zaXRpb24uXG4gICAgICogICBzZWVrKGlkKSAtPiBSZXR1cm5zIHRoZSBzb3VuZCBpZCdzIGN1cnJlbnQgc2VlayBwb3NpdGlvbi5cbiAgICAgKiAgIHNlZWsoc2VlaykgLT4gU2V0cyB0aGUgc2VlayBwb3NpdGlvbiBvZiB0aGUgZmlyc3Qgc291bmQgbm9kZS5cbiAgICAgKiAgIHNlZWsoc2VlaywgaWQpIC0+IFNldHMgdGhlIHNlZWsgcG9zaXRpb24gb2YgcGFzc2VkIHNvdW5kIGlkLlxuICAgICAqIEByZXR1cm4ge0hvd2wvTnVtYmVyfSBSZXR1cm5zIHNlbGYgb3IgdGhlIGN1cnJlbnQgc2VlayBwb3NpdGlvbi5cbiAgICAgKi9cbiAgICBzZWVrOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgdmFyIHNlZWssIGlkO1xuXG4gICAgICAvLyBEZXRlcm1pbmUgdGhlIHZhbHVlcyBiYXNlZCBvbiBhcmd1bWVudHMuXG4gICAgICBpZiAoYXJncy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgLy8gV2Ugd2lsbCBzaW1wbHkgcmV0dXJuIHRoZSBjdXJyZW50IHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBub2RlLlxuICAgICAgICBpZCA9IHNlbGYuX3NvdW5kc1swXS5faWQ7XG4gICAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIC8vIEZpcnN0IGNoZWNrIGlmIHRoaXMgaXMgYW4gSUQsIGFuZCBpZiBub3QsIGFzc3VtZSBpdCBpcyBhIG5ldyBzZWVrIHBvc2l0aW9uLlxuICAgICAgICB2YXIgaWRzID0gc2VsZi5fZ2V0U291bmRJZHMoKTtcbiAgICAgICAgdmFyIGluZGV4ID0gaWRzLmluZGV4T2YoYXJnc1swXSk7XG4gICAgICAgIGlmIChpbmRleCA+PSAwKSB7XG4gICAgICAgICAgaWQgPSBwYXJzZUludChhcmdzWzBdLCAxMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWQgPSBzZWxmLl9zb3VuZHNbMF0uX2lkO1xuICAgICAgICAgIHNlZWsgPSBwYXJzZUZsb2F0KGFyZ3NbMF0pO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAyKSB7XG4gICAgICAgIHNlZWsgPSBwYXJzZUZsb2F0KGFyZ3NbMF0pO1xuICAgICAgICBpZCA9IHBhcnNlSW50KGFyZ3NbMV0sIDEwKTtcbiAgICAgIH1cblxuICAgICAgLy8gSWYgdGhlcmUgaXMgbm8gSUQsIGJhaWwgb3V0LlxuICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgcmV0dXJuIHNlbGY7XG4gICAgICB9XG5cbiAgICAgIC8vIElmIHRoZSBzb3VuZCBoYXNuJ3QgbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGxvYWQgcXVldWUgdG8gc2VlayB3aGVuIGNhcGFibGUuXG4gICAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnKSB7XG4gICAgICAgIHNlbGYuX3F1ZXVlLnB1c2goe1xuICAgICAgICAgIGV2ZW50OiAnc2VlaycsXG4gICAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgIHNlbGYuc2Vlay5hcHBseShzZWxmLCBhcmdzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBzZWxmO1xuICAgICAgfVxuXG4gICAgICAvLyBHZXQgdGhlIHNvdW5kLlxuICAgICAgdmFyIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKGlkKTtcblxuICAgICAgaWYgKHNvdW5kKSB7XG4gICAgICAgIGlmICh0eXBlb2Ygc2VlayA9PT0gJ251bWJlcicgJiYgc2VlayA+PSAwKSB7XG4gICAgICAgICAgLy8gUGF1c2UgdGhlIHNvdW5kIGFuZCB1cGRhdGUgcG9zaXRpb24gZm9yIHJlc3RhcnRpbmcgcGxheWJhY2suXG4gICAgICAgICAgdmFyIHBsYXlpbmcgPSBzZWxmLnBsYXlpbmcoaWQpO1xuICAgICAgICAgIGlmIChwbGF5aW5nKSB7XG4gICAgICAgICAgICBzZWxmLnBhdXNlKGlkLCB0cnVlKTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICAvLyBNb3ZlIHRoZSBwb3NpdGlvbiBvZiB0aGUgdHJhY2sgYW5kIGNhbmNlbCB0aW1lci5cbiAgICAgICAgICBzb3VuZC5fc2VlayA9IHNlZWs7XG4gICAgICAgICAgc291bmQuX2VuZGVkID0gZmFsc2U7XG4gICAgICAgICAgc2VsZi5fY2xlYXJUaW1lcihpZCk7XG5cbiAgICAgICAgICAvLyBSZXN0YXJ0IHRoZSBwbGF5YmFjayBpZiB0aGUgc291bmQgd2FzIHBsYXlpbmcuXG4gICAgICAgICAgaWYgKHBsYXlpbmcpIHtcbiAgICAgICAgICAgIHNlbGYucGxheShpZCwgdHJ1ZSk7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gVXBkYXRlIHRoZSBzZWVrIHBvc2l0aW9uIGZvciBIVE1MNSBBdWRpby5cbiAgICAgICAgICBpZiAoIXNlbGYuX3dlYkF1ZGlvICYmIHNvdW5kLl9ub2RlKSB7XG4gICAgICAgICAgICBzb3VuZC5fbm9kZS5jdXJyZW50VGltZSA9IHNlZWs7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fZW1pdCgnc2VlaycsIGlkKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgICAgIHZhciByZWFsVGltZSA9IHNlbGYucGxheWluZyhpZCkgPyBIb3dsZXIuY3R4LmN1cnJlbnRUaW1lIC0gc291bmQuX3BsYXlTdGFydCA6IDA7XG4gICAgICAgICAgICB2YXIgcmF0ZVNlZWsgPSBzb3VuZC5fcmF0ZVNlZWsgPyBzb3VuZC5fcmF0ZVNlZWsgLSBzb3VuZC5fc2VlayA6IDA7XG4gICAgICAgICAgICByZXR1cm4gc291bmQuX3NlZWsgKyAocmF0ZVNlZWsgKyByZWFsVGltZSAqIE1hdGguYWJzKHNvdW5kLl9yYXRlKSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBzb3VuZC5fbm9kZS5jdXJyZW50VGltZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIENoZWNrIGlmIGEgc3BlY2lmaWMgc291bmQgaXMgY3VycmVudGx5IHBsYXlpbmcgb3Igbm90IChpZiBpZCBpcyBwcm92aWRlZCksIG9yIGNoZWNrIGlmIGF0IGxlYXN0IG9uZSBvZiB0aGUgc291bmRzIGluIHRoZSBncm91cCBpcyBwbGF5aW5nIG9yIG5vdC5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9ICBpZCBUaGUgc291bmQgaWQgdG8gY2hlY2suIElmIG5vbmUgaXMgcGFzc2VkLCB0aGUgd2hvbGUgc291bmQgZ3JvdXAgaXMgY2hlY2tlZC5cbiAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBUcnVlIGlmIHBsYXlpbmcgYW5kIGZhbHNlIGlmIG5vdC5cbiAgICAgKi9cbiAgICBwbGF5aW5nOiBmdW5jdGlvbihpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBDaGVjayB0aGUgcGFzc2VkIHNvdW5kIElEIChpZiBhbnkpLlxuICAgICAgaWYgKHR5cGVvZiBpZCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgdmFyIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKGlkKTtcbiAgICAgICAgcmV0dXJuIHNvdW5kID8gIXNvdW5kLl9wYXVzZWQgOiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgLy8gT3RoZXJ3aXNlLCBsb29wIHRocm91Z2ggYWxsIHNvdW5kcyBhbmQgY2hlY2sgaWYgYW55IGFyZSBwbGF5aW5nLlxuICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGYuX3NvdW5kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoIXNlbGYuX3NvdW5kc1tpXS5fcGF1c2VkKSB7XG4gICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIGR1cmF0aW9uIG9mIHRoaXMgc291bmQuIFBhc3NpbmcgYSBzb3VuZCBpZCB3aWxsIHJldHVybiB0aGUgc3ByaXRlIGR1cmF0aW9uLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaWQgVGhlIHNvdW5kIGlkIHRvIGNoZWNrLiBJZiBub25lIGlzIHBhc3NlZCwgcmV0dXJuIGZ1bGwgc291cmNlIGR1cmF0aW9uLlxuICAgICAqIEByZXR1cm4ge051bWJlcn0gQXVkaW8gZHVyYXRpb24gaW4gc2Vjb25kcy5cbiAgICAgKi9cbiAgICBkdXJhdGlvbjogZnVuY3Rpb24oaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBkdXJhdGlvbiA9IHNlbGYuX2R1cmF0aW9uO1xuXG4gICAgICAvLyBJZiB3ZSBwYXNzIGFuIElELCBnZXQgdGhlIHNvdW5kIGFuZCByZXR1cm4gdGhlIHNwcml0ZSBsZW5ndGguXG4gICAgICB2YXIgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWQpO1xuICAgICAgaWYgKHNvdW5kKSB7XG4gICAgICAgIGR1cmF0aW9uID0gc2VsZi5fc3ByaXRlW3NvdW5kLl9zcHJpdGVdWzFdIC8gMTAwMDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIGR1cmF0aW9uO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIHRoZSBjdXJyZW50IGxvYWRlZCBzdGF0ZSBvZiB0aGlzIEhvd2wuXG4gICAgICogQHJldHVybiB7U3RyaW5nfSAndW5sb2FkZWQnLCAnbG9hZGluZycsICdsb2FkZWQnXG4gICAgICovXG4gICAgc3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHRoaXMuX3N0YXRlO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBVbmxvYWQgYW5kIGRlc3Ryb3kgdGhlIGN1cnJlbnQgSG93bCBvYmplY3QuXG4gICAgICogVGhpcyB3aWxsIGltbWVkaWF0ZWx5IHN0b3AgYWxsIHNvdW5kIGluc3RhbmNlcyBhdHRhY2hlZCB0byB0aGlzIGdyb3VwLlxuICAgICAqL1xuICAgIHVubG9hZDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIFN0b3AgcGxheWluZyBhbnkgYWN0aXZlIHNvdW5kcy5cbiAgICAgIHZhciBzb3VuZHMgPSBzZWxmLl9zb3VuZHM7XG4gICAgICBmb3IgKHZhciBpPTA7IGk8c291bmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIC8vIFN0b3AgdGhlIHNvdW5kIGlmIGl0IGlzIGN1cnJlbnRseSBwbGF5aW5nLlxuICAgICAgICBpZiAoIXNvdW5kc1tpXS5fcGF1c2VkKSB7XG4gICAgICAgICAgc2VsZi5zdG9wKHNvdW5kc1tpXS5faWQpO1xuICAgICAgICAgIHNlbGYuX2VtaXQoJ2VuZCcsIHNvdW5kc1tpXS5faWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVtb3ZlIHRoZSBzb3VyY2Ugb3IgZGlzY29ubmVjdC5cbiAgICAgICAgaWYgKCFzZWxmLl93ZWJBdWRpbykge1xuICAgICAgICAgIC8vIFNldCB0aGUgc291cmNlIHRvIDAtc2Vjb25kIHNpbGVuY2UgdG8gc3RvcCBhbnkgZG93bmxvYWRpbmcuXG4gICAgICAgICAgc291bmRzW2ldLl9ub2RlLnNyYyA9ICdkYXRhOmF1ZGlvL3dhdjtiYXNlNjQsVWtsR1JpUUFBQUJYUVZaRlptMTBJQkFBQUFBQkFBRUFSS3dBQUloWUFRQUNBQkFBWkdGMFlRQUFBQUE9JztcblxuICAgICAgICAgIC8vIFJlbW92ZSBhbnkgZXZlbnQgbGlzdGVuZXJzLlxuICAgICAgICAgIHNvdW5kc1tpXS5fbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHNvdW5kc1tpXS5fZXJyb3JGbiwgZmFsc2UpO1xuICAgICAgICAgIHNvdW5kc1tpXS5fbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKEhvd2xlci5fY2FuUGxheUV2ZW50LCBzb3VuZHNbaV0uX2xvYWRGbiwgZmFsc2UpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRW1wdHkgb3V0IGFsbCBvZiB0aGUgbm9kZXMuXG4gICAgICAgIGRlbGV0ZSBzb3VuZHNbaV0uX25vZGU7XG5cbiAgICAgICAgLy8gTWFrZSBzdXJlIGFsbCB0aW1lcnMgYXJlIGNsZWFyZWQgb3V0LlxuICAgICAgICBzZWxmLl9jbGVhclRpbWVyKHNvdW5kc1tpXS5faWQpO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgcmVmZXJlbmNlcyBpbiB0aGUgZ2xvYmFsIEhvd2xlciBvYmplY3QuXG4gICAgICAgIHZhciBpbmRleCA9IEhvd2xlci5faG93bHMuaW5kZXhPZihzZWxmKTtcbiAgICAgICAgaWYgKGluZGV4ID49IDApIHtcbiAgICAgICAgICBIb3dsZXIuX2hvd2xzLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gRGVsZXRlIHRoaXMgc291bmQgZnJvbSB0aGUgY2FjaGUgKGlmIG5vIG90aGVyIEhvd2wgaXMgdXNpbmcgaXQpLlxuICAgICAgdmFyIHJlbUNhY2hlID0gdHJ1ZTtcbiAgICAgIGZvciAoaT0wOyBpPEhvd2xlci5faG93bHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKEhvd2xlci5faG93bHNbaV0uX3NyYyA9PT0gc2VsZi5fc3JjKSB7XG4gICAgICAgICAgcmVtQ2FjaGUgPSBmYWxzZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoY2FjaGUgJiYgcmVtQ2FjaGUpIHtcbiAgICAgICAgZGVsZXRlIGNhY2hlW3NlbGYuX3NyY107XG4gICAgICB9XG5cbiAgICAgIC8vIENsZWFyIGdsb2JhbCBlcnJvcnMuXG4gICAgICBIb3dsZXIubm9BdWRpbyA9IGZhbHNlO1xuXG4gICAgICAvLyBDbGVhciBvdXQgYHNlbGZgLlxuICAgICAgc2VsZi5fc3RhdGUgPSAndW5sb2FkZWQnO1xuICAgICAgc2VsZi5fc291bmRzID0gW107XG4gICAgICBzZWxmID0gbnVsbDtcblxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExpc3RlbiB0byBhIGN1c3RvbSBldmVudC5cbiAgICAgKiBAcGFyYW0gIHtTdHJpbmd9ICAgZXZlbnQgRXZlbnQgbmFtZS5cbiAgICAgKiBAcGFyYW0gIHtGdW5jdGlvbn0gZm4gICAgTGlzdGVuZXIgdG8gY2FsbC5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9ICAgaWQgICAgKG9wdGlvbmFsKSBPbmx5IGxpc3RlbiB0byBldmVudHMgZm9yIHRoaXMgc291bmQuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSAgIG9uY2UgIChJTlRFUk5BTCkgTWFya3MgZXZlbnQgdG8gZmlyZSBvbmx5IG9uY2UuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBvbjogZnVuY3Rpb24oZXZlbnQsIGZuLCBpZCwgb25jZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgICAgdmFyIGV2ZW50cyA9IHNlbGZbJ19vbicgKyBldmVudF07XG5cbiAgICAgIGlmICh0eXBlb2YgZm4gPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgZXZlbnRzLnB1c2gob25jZSA/IHtpZDogaWQsIGZuOiBmbiwgb25jZTogb25jZX0gOiB7aWQ6IGlkLCBmbjogZm59KTtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFJlbW92ZSBhIGN1c3RvbSBldmVudC4gQ2FsbCB3aXRob3V0IHBhcmFtZXRlcnMgdG8gcmVtb3ZlIGFsbCBldmVudHMuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSAgIGV2ZW50IEV2ZW50IG5hbWUuXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGZuICAgIExpc3RlbmVyIHRvIHJlbW92ZS4gTGVhdmUgZW1wdHkgdG8gcmVtb3ZlIGFsbC5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9ICAgaWQgICAgKG9wdGlvbmFsKSBPbmx5IHJlbW92ZSBldmVudHMgZm9yIHRoaXMgc291bmQuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBvZmY6IGZ1bmN0aW9uKGV2ZW50LCBmbiwgaWQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBldmVudHMgPSBzZWxmWydfb24nICsgZXZlbnRdO1xuICAgICAgdmFyIGkgPSAwO1xuXG4gICAgICBpZiAoZm4pIHtcbiAgICAgICAgLy8gTG9vcCB0aHJvdWdoIGV2ZW50IHN0b3JlIGFuZCByZW1vdmUgdGhlIHBhc3NlZCBmdW5jdGlvbi5cbiAgICAgICAgZm9yIChpPTA7IGk8ZXZlbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYgKGZuID09PSBldmVudHNbaV0uZm4gJiYgaWQgPT09IGV2ZW50c1tpXS5pZCkge1xuICAgICAgICAgICAgZXZlbnRzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChldmVudCkge1xuICAgICAgICAvLyBDbGVhciBvdXQgYWxsIGV2ZW50cyBvZiB0aGlzIHR5cGUuXG4gICAgICAgIHNlbGZbJ19vbicgKyBldmVudF0gPSBbXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIENsZWFyIG91dCBhbGwgZXZlbnRzIG9mIGV2ZXJ5IHR5cGUuXG4gICAgICAgIHZhciBrZXlzID0gT2JqZWN0LmtleXMoc2VsZik7XG4gICAgICAgIGZvciAoaT0wOyBpPGtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICBpZiAoKGtleXNbaV0uaW5kZXhPZignX29uJykgPT09IDApICYmIEFycmF5LmlzQXJyYXkoc2VsZltrZXlzW2ldXSkpIHtcbiAgICAgICAgICAgIHNlbGZba2V5c1tpXV0gPSBbXTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIExpc3RlbiB0byBhIGN1c3RvbSBldmVudCBhbmQgcmVtb3ZlIGl0IG9uY2UgZmlyZWQuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSAgIGV2ZW50IEV2ZW50IG5hbWUuXG4gICAgICogQHBhcmFtICB7RnVuY3Rpb259IGZuICAgIExpc3RlbmVyIHRvIGNhbGwuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSAgIGlkICAgIChvcHRpb25hbCkgT25seSBsaXN0ZW4gdG8gZXZlbnRzIGZvciB0aGlzIHNvdW5kLlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgb25jZTogZnVuY3Rpb24oZXZlbnQsIGZuLCBpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBTZXR1cCB0aGUgZXZlbnQgbGlzdGVuZXIuXG4gICAgICBzZWxmLm9uKGV2ZW50LCBmbiwgaWQsIDEpO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRW1pdCBhbGwgZXZlbnRzIG9mIGEgc3BlY2lmaWMgdHlwZSBhbmQgcGFzcyB0aGUgc291bmQgaWQuXG4gICAgICogQHBhcmFtICB7U3RyaW5nfSBldmVudCBFdmVudCBuYW1lLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaWQgICAgU291bmQgSUQuXG4gICAgICogQHBhcmFtICB7TnVtYmVyfSBtc2cgICBNZXNzYWdlIHRvIGdvIHdpdGggZXZlbnQuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBfZW1pdDogZnVuY3Rpb24oZXZlbnQsIGlkLCBtc2cpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBldmVudHMgPSBzZWxmWydfb24nICsgZXZlbnRdO1xuXG4gICAgICAvLyBMb29wIHRocm91Z2ggZXZlbnQgc3RvcmUgYW5kIGZpcmUgYWxsIGZ1bmN0aW9ucy5cbiAgICAgIGZvciAodmFyIGk9ZXZlbnRzLmxlbmd0aC0xOyBpPj0wOyBpLS0pIHtcbiAgICAgICAgaWYgKCFldmVudHNbaV0uaWQgfHwgZXZlbnRzW2ldLmlkID09PSBpZCB8fCBldmVudCA9PT0gJ2xvYWQnKSB7XG4gICAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbihmbikge1xuICAgICAgICAgICAgZm4uY2FsbCh0aGlzLCBpZCwgbXNnKTtcbiAgICAgICAgICB9LmJpbmQoc2VsZiwgZXZlbnRzW2ldLmZuKSwgMCk7XG5cbiAgICAgICAgICAvLyBJZiB0aGlzIGV2ZW50IHdhcyBzZXR1cCB3aXRoIGBvbmNlYCwgcmVtb3ZlIGl0LlxuICAgICAgICAgIGlmIChldmVudHNbaV0ub25jZSkge1xuICAgICAgICAgICAgc2VsZi5vZmYoZXZlbnQsIGV2ZW50c1tpXS5mbiwgZXZlbnRzW2ldLmlkKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFF1ZXVlIG9mIGFjdGlvbnMgaW5pdGlhdGVkIGJlZm9yZSB0aGUgc291bmQgaGFzIGxvYWRlZC5cbiAgICAgKiBUaGVzZSB3aWxsIGJlIGNhbGxlZCBpbiBzZXF1ZW5jZSwgd2l0aCB0aGUgbmV4dCBvbmx5IGZpcmluZ1xuICAgICAqIGFmdGVyIHRoZSBwcmV2aW91cyBoYXMgZmluaXNoZWQgZXhlY3V0aW5nIChldmVuIGlmIGFzeW5jIGxpa2UgcGxheSkuXG4gICAgICogQHJldHVybiB7SG93bH1cbiAgICAgKi9cbiAgICBfbG9hZFF1ZXVlOiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgaWYgKHNlbGYuX3F1ZXVlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgdmFyIHRhc2sgPSBzZWxmLl9xdWV1ZVswXTtcblxuICAgICAgICAvLyBkb24ndCBtb3ZlIG9udG8gdGhlIG5leHQgdGFzayB1bnRpbCB0aGlzIG9uZSBpcyBkb25lXG4gICAgICAgIHNlbGYub25jZSh0YXNrLmV2ZW50LCBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLl9xdWV1ZS5zaGlmdCgpO1xuICAgICAgICAgIHNlbGYuX2xvYWRRdWV1ZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0YXNrLmFjdGlvbigpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRmlyZWQgd2hlbiBwbGF5YmFjayBlbmRzIGF0IHRoZSBlbmQgb2YgdGhlIGR1cmF0aW9uLlxuICAgICAqIEBwYXJhbSAge1NvdW5kfSBzb3VuZCBUaGUgc291bmQgb2JqZWN0IHRvIHdvcmsgd2l0aC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIF9lbmRlZDogZnVuY3Rpb24oc291bmQpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBzcHJpdGUgPSBzb3VuZC5fc3ByaXRlO1xuXG4gICAgICAvLyBTaG91bGQgdGhpcyBzb3VuZCBsb29wP1xuICAgICAgdmFyIGxvb3AgPSAhIShzb3VuZC5fbG9vcCB8fCBzZWxmLl9zcHJpdGVbc3ByaXRlXVsyXSk7XG5cbiAgICAgIC8vIEZpcmUgdGhlIGVuZGVkIGV2ZW50LlxuICAgICAgc2VsZi5fZW1pdCgnZW5kJywgc291bmQuX2lkKTtcblxuICAgICAgLy8gUmVzdGFydCB0aGUgcGxheWJhY2sgZm9yIEhUTUw1IEF1ZGlvIGxvb3AuXG4gICAgICBpZiAoIXNlbGYuX3dlYkF1ZGlvICYmIGxvb3ApIHtcbiAgICAgICAgc2VsZi5zdG9wKHNvdW5kLl9pZCwgdHJ1ZSkucGxheShzb3VuZC5faWQpO1xuICAgICAgfVxuXG4gICAgICAvLyBSZXN0YXJ0IHRoaXMgdGltZXIgaWYgb24gYSBXZWIgQXVkaW8gbG9vcC5cbiAgICAgIGlmIChzZWxmLl93ZWJBdWRpbyAmJiBsb29wKSB7XG4gICAgICAgIHNlbGYuX2VtaXQoJ3BsYXknLCBzb3VuZC5faWQpO1xuICAgICAgICBzb3VuZC5fc2VlayA9IHNvdW5kLl9zdGFydCB8fCAwO1xuICAgICAgICBzb3VuZC5fcmF0ZVNlZWsgPSAwO1xuICAgICAgICBzb3VuZC5fcGxheVN0YXJ0ID0gSG93bGVyLmN0eC5jdXJyZW50VGltZTtcblxuICAgICAgICB2YXIgdGltZW91dCA9ICgoc291bmQuX3N0b3AgLSBzb3VuZC5fc3RhcnQpICogMTAwMCkgLyBNYXRoLmFicyhzb3VuZC5fcmF0ZSk7XG4gICAgICAgIHNlbGYuX2VuZFRpbWVyc1tzb3VuZC5faWRdID0gc2V0VGltZW91dChzZWxmLl9lbmRlZC5iaW5kKHNlbGYsIHNvdW5kKSwgdGltZW91dCk7XG4gICAgICB9XG5cbiAgICAgIC8vIE1hcmsgdGhlIG5vZGUgYXMgcGF1c2VkLlxuICAgICAgaWYgKHNlbGYuX3dlYkF1ZGlvICYmICFsb29wKSB7XG4gICAgICAgIHNvdW5kLl9wYXVzZWQgPSB0cnVlO1xuICAgICAgICBzb3VuZC5fZW5kZWQgPSB0cnVlO1xuICAgICAgICBzb3VuZC5fc2VlayA9IHNvdW5kLl9zdGFydCB8fCAwO1xuICAgICAgICBzb3VuZC5fcmF0ZVNlZWsgPSAwO1xuICAgICAgICBzZWxmLl9jbGVhclRpbWVyKHNvdW5kLl9pZCk7XG5cbiAgICAgICAgLy8gQ2xlYW4gdXAgdGhlIGJ1ZmZlciBzb3VyY2UuXG4gICAgICAgIHNlbGYuX2NsZWFuQnVmZmVyKHNvdW5kLl9ub2RlKTtcblxuICAgICAgICAvLyBBdHRlbXB0IHRvIGF1dG8tc3VzcGVuZCBBdWRpb0NvbnRleHQgaWYgbm8gc291bmRzIGFyZSBzdGlsbCBwbGF5aW5nLlxuICAgICAgICBIb3dsZXIuX2F1dG9TdXNwZW5kKCk7XG4gICAgICB9XG5cbiAgICAgIC8vIFdoZW4gdXNpbmcgYSBzcHJpdGUsIGVuZCB0aGUgdHJhY2suXG4gICAgICBpZiAoIXNlbGYuX3dlYkF1ZGlvICYmICFsb29wKSB7XG4gICAgICAgIHNlbGYuc3RvcChzb3VuZC5faWQpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ2xlYXIgdGhlIGVuZCB0aW1lciBmb3IgYSBzb3VuZCBwbGF5YmFjay5cbiAgICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGlkIFRoZSBzb3VuZCBJRC5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIF9jbGVhclRpbWVyOiBmdW5jdGlvbihpZCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoc2VsZi5fZW5kVGltZXJzW2lkXSkge1xuICAgICAgICBjbGVhclRpbWVvdXQoc2VsZi5fZW5kVGltZXJzW2lkXSk7XG4gICAgICAgIGRlbGV0ZSBzZWxmLl9lbmRUaW1lcnNbaWRdO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmV0dXJuIHRoZSBzb3VuZCBpZGVudGlmaWVkIGJ5IHRoaXMgSUQsIG9yIHJldHVybiBudWxsLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaWQgU291bmQgSURcbiAgICAgKiBAcmV0dXJuIHtPYmplY3R9ICAgIFNvdW5kIG9iamVjdCBvciBudWxsLlxuICAgICAqL1xuICAgIF9zb3VuZEJ5SWQ6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIExvb3AgdGhyb3VnaCBhbGwgc291bmRzIGFuZCBmaW5kIHRoZSBvbmUgd2l0aCB0aGlzIElELlxuICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGYuX3NvdW5kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoaWQgPT09IHNlbGYuX3NvdW5kc1tpXS5faWQpIHtcbiAgICAgICAgICByZXR1cm4gc2VsZi5fc291bmRzW2ldO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gYW4gaW5hY3RpdmUgc291bmQgZnJvbSB0aGUgcG9vbCBvciBjcmVhdGUgYSBuZXcgb25lLlxuICAgICAqIEByZXR1cm4ge1NvdW5kfSBTb3VuZCBwbGF5YmFjayBvYmplY3QuXG4gICAgICovXG4gICAgX2luYWN0aXZlU291bmQ6IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBzZWxmLl9kcmFpbigpO1xuXG4gICAgICAvLyBGaW5kIHRoZSBmaXJzdCBpbmFjdGl2ZSBub2RlIHRvIHJlY3ljbGUuXG4gICAgICBmb3IgKHZhciBpPTA7IGk8c2VsZi5fc291bmRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChzZWxmLl9zb3VuZHNbaV0uX2VuZGVkKSB7XG4gICAgICAgICAgcmV0dXJuIHNlbGYuX3NvdW5kc1tpXS5yZXNldCgpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIElmIG5vIGluYWN0aXZlIG5vZGUgd2FzIGZvdW5kLCBjcmVhdGUgYSBuZXcgb25lLlxuICAgICAgcmV0dXJuIG5ldyBTb3VuZChzZWxmKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogRHJhaW4gZXhjZXNzIGluYWN0aXZlIHNvdW5kcyBmcm9tIHRoZSBwb29sLlxuICAgICAqL1xuICAgIF9kcmFpbjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgbGltaXQgPSBzZWxmLl9wb29sO1xuICAgICAgdmFyIGNudCA9IDA7XG4gICAgICB2YXIgaSA9IDA7XG5cbiAgICAgIC8vIElmIHRoZXJlIGFyZSBsZXNzIHNvdW5kcyB0aGFuIHRoZSBtYXggcG9vbCBzaXplLCB3ZSBhcmUgZG9uZS5cbiAgICAgIGlmIChzZWxmLl9zb3VuZHMubGVuZ3RoIDwgbGltaXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBDb3VudCB0aGUgbnVtYmVyIG9mIGluYWN0aXZlIHNvdW5kcy5cbiAgICAgIGZvciAoaT0wOyBpPHNlbGYuX3NvdW5kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAoc2VsZi5fc291bmRzW2ldLl9lbmRlZCkge1xuICAgICAgICAgIGNudCsrO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFJlbW92ZSBleGNlc3MgaW5hY3RpdmUgc291bmRzLCBnb2luZyBpbiByZXZlcnNlIG9yZGVyLlxuICAgICAgZm9yIChpPXNlbGYuX3NvdW5kcy5sZW5ndGggLSAxOyBpPj0wOyBpLS0pIHtcbiAgICAgICAgaWYgKGNudCA8PSBsaW1pdCkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChzZWxmLl9zb3VuZHNbaV0uX2VuZGVkKSB7XG4gICAgICAgICAgLy8gRGlzY29ubmVjdCB0aGUgYXVkaW8gc291cmNlIHdoZW4gdXNpbmcgV2ViIEF1ZGlvLlxuICAgICAgICAgIGlmIChzZWxmLl93ZWJBdWRpbyAmJiBzZWxmLl9zb3VuZHNbaV0uX25vZGUpIHtcbiAgICAgICAgICAgIHNlbGYuX3NvdW5kc1tpXS5fbm9kZS5kaXNjb25uZWN0KDApO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIFJlbW92ZSBzb3VuZHMgdW50aWwgd2UgaGF2ZSB0aGUgcG9vbCBzaXplLlxuICAgICAgICAgIHNlbGYuX3NvdW5kcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgY250LS07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogR2V0IGFsbCBJRCdzIGZyb20gdGhlIHNvdW5kcyBwb29sLlxuICAgICAqIEBwYXJhbSAge051bWJlcn0gaWQgT25seSByZXR1cm4gb25lIElEIGlmIG9uZSBpcyBwYXNzZWQuXG4gICAgICogQHJldHVybiB7QXJyYXl9ICAgIEFycmF5IG9mIElEcy5cbiAgICAgKi9cbiAgICBfZ2V0U291bmRJZHM6IGZ1bmN0aW9uKGlkKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIGlmICh0eXBlb2YgaWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHZhciBpZHMgPSBbXTtcbiAgICAgICAgZm9yICh2YXIgaT0wOyBpPHNlbGYuX3NvdW5kcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGlkcy5wdXNoKHNlbGYuX3NvdW5kc1tpXS5faWQpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGlkcztcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVybiBbaWRdO1xuICAgICAgfVxuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBMb2FkIHRoZSBzb3VuZCBiYWNrIGludG8gdGhlIGJ1ZmZlciBzb3VyY2UuXG4gICAgICogQHBhcmFtICB7U291bmR9IHNvdW5kIFRoZSBzb3VuZCBvYmplY3QgdG8gd29yayB3aXRoLlxuICAgICAqIEByZXR1cm4ge0hvd2x9XG4gICAgICovXG4gICAgX3JlZnJlc2hCdWZmZXI6IGZ1bmN0aW9uKHNvdW5kKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIFNldHVwIHRoZSBidWZmZXIgc291cmNlIGZvciBwbGF5YmFjay5cbiAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZSA9IEhvd2xlci5jdHguY3JlYXRlQnVmZmVyU291cmNlKCk7XG4gICAgICBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UuYnVmZmVyID0gY2FjaGVbc2VsZi5fc3JjXTtcblxuICAgICAgLy8gQ29ubmVjdCB0byB0aGUgY29ycmVjdCBub2RlLlxuICAgICAgaWYgKHNvdW5kLl9wYW5uZXIpIHtcbiAgICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlLmNvbm5lY3Qoc291bmQuX3Bhbm5lcik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UuY29ubmVjdChzb3VuZC5fbm9kZSk7XG4gICAgICB9XG5cbiAgICAgIC8vIFNldHVwIGxvb3BpbmcgYW5kIHBsYXliYWNrIHJhdGUuXG4gICAgICBzb3VuZC5fbm9kZS5idWZmZXJTb3VyY2UubG9vcCA9IHNvdW5kLl9sb29wO1xuICAgICAgaWYgKHNvdW5kLl9sb29wKSB7XG4gICAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5sb29wU3RhcnQgPSBzb3VuZC5fc3RhcnQgfHwgMDtcbiAgICAgICAgc291bmQuX25vZGUuYnVmZmVyU291cmNlLmxvb3BFbmQgPSBzb3VuZC5fc3RvcDtcbiAgICAgIH1cbiAgICAgIHNvdW5kLl9ub2RlLmJ1ZmZlclNvdXJjZS5wbGF5YmFja1JhdGUudmFsdWUgPSBzb3VuZC5fcmF0ZTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfSxcblxuICAgIC8qKlxuICAgICAqIFByZXZlbnQgbWVtb3J5IGxlYWtzIGJ5IGNsZWFuaW5nIHVwIHRoZSBidWZmZXIgc291cmNlIGFmdGVyIHBsYXliYWNrLlxuICAgICAqIEBwYXJhbSAge09iamVjdH0gbm9kZSBTb3VuZCdzIGF1ZGlvIG5vZGUgY29udGFpbmluZyB0aGUgYnVmZmVyIHNvdXJjZS5cbiAgICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgICAqL1xuICAgIF9jbGVhbkJ1ZmZlcjogZnVuY3Rpb24obm9kZSkge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICBpZiAoc2VsZi5fc2NyYXRjaEJ1ZmZlcikge1xuICAgICAgICBub2RlLmJ1ZmZlclNvdXJjZS5vbmVuZGVkID0gbnVsbDtcbiAgICAgICAgbm9kZS5idWZmZXJTb3VyY2UuZGlzY29ubmVjdCgwKTtcbiAgICAgICAgdHJ5IHsgbm9kZS5idWZmZXJTb3VyY2UuYnVmZmVyID0gc2VsZi5fc2NyYXRjaEJ1ZmZlcjsgfSBjYXRjaChlKSB7fVxuICAgICAgfVxuICAgICAgbm9kZS5idWZmZXJTb3VyY2UgPSBudWxsO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG4gIH07XG5cbiAgLyoqIFNpbmdsZSBTb3VuZCBNZXRob2RzICoqL1xuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBTZXR1cCB0aGUgc291bmQgb2JqZWN0LCB3aGljaCBlYWNoIG5vZGUgYXR0YWNoZWQgdG8gYSBIb3dsIGdyb3VwIGlzIGNvbnRhaW5lZCBpbi5cbiAgICogQHBhcmFtIHtPYmplY3R9IGhvd2wgVGhlIEhvd2wgcGFyZW50IGdyb3VwLlxuICAgKi9cbiAgdmFyIFNvdW5kID0gZnVuY3Rpb24oaG93bCkge1xuICAgIHRoaXMuX3BhcmVudCA9IGhvd2w7XG4gICAgdGhpcy5pbml0KCk7XG4gIH07XG4gIFNvdW5kLnByb3RvdHlwZSA9IHtcbiAgICAvKipcbiAgICAgKiBJbml0aWFsaXplIGEgbmV3IFNvdW5kIG9iamVjdC5cbiAgICAgKiBAcmV0dXJuIHtTb3VuZH1cbiAgICAgKi9cbiAgICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBwYXJlbnQgPSBzZWxmLl9wYXJlbnQ7XG5cbiAgICAgIC8vIFNldHVwIHRoZSBkZWZhdWx0IHBhcmFtZXRlcnMuXG4gICAgICBzZWxmLl9tdXRlZCA9IHBhcmVudC5fbXV0ZWQ7XG4gICAgICBzZWxmLl9sb29wID0gcGFyZW50Ll9sb29wO1xuICAgICAgc2VsZi5fdm9sdW1lID0gcGFyZW50Ll92b2x1bWU7XG4gICAgICBzZWxmLl9tdXRlZCA9IHBhcmVudC5fbXV0ZWQ7XG4gICAgICBzZWxmLl9yYXRlID0gcGFyZW50Ll9yYXRlO1xuICAgICAgc2VsZi5fc2VlayA9IDA7XG4gICAgICBzZWxmLl9wYXVzZWQgPSB0cnVlO1xuICAgICAgc2VsZi5fZW5kZWQgPSB0cnVlO1xuICAgICAgc2VsZi5fc3ByaXRlID0gJ19fZGVmYXVsdCc7XG5cbiAgICAgIC8vIEdlbmVyYXRlIGEgdW5pcXVlIElEIGZvciB0aGlzIHNvdW5kLlxuICAgICAgc2VsZi5faWQgPSBNYXRoLnJvdW5kKERhdGUubm93KCkgKiBNYXRoLnJhbmRvbSgpKTtcblxuICAgICAgLy8gQWRkIGl0c2VsZiB0byB0aGUgcGFyZW50J3MgcG9vbC5cbiAgICAgIHBhcmVudC5fc291bmRzLnB1c2goc2VsZik7XG5cbiAgICAgIC8vIENyZWF0ZSB0aGUgbmV3IG5vZGUuXG4gICAgICBzZWxmLmNyZWF0ZSgpO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlIGFuZCBzZXR1cCBhIG5ldyBzb3VuZCBvYmplY3QsIHdoZXRoZXIgSFRNTDUgQXVkaW8gb3IgV2ViIEF1ZGlvLlxuICAgICAqIEByZXR1cm4ge1NvdW5kfVxuICAgICAqL1xuICAgIGNyZWF0ZTogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgcGFyZW50ID0gc2VsZi5fcGFyZW50O1xuICAgICAgdmFyIHZvbHVtZSA9IChIb3dsZXIuX211dGVkIHx8IHNlbGYuX211dGVkIHx8IHNlbGYuX3BhcmVudC5fbXV0ZWQpID8gMCA6IHNlbGYuX3ZvbHVtZTtcblxuICAgICAgaWYgKHBhcmVudC5fd2ViQXVkaW8pIHtcbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBnYWluIG5vZGUgZm9yIGNvbnRyb2xsaW5nIHZvbHVtZSAodGhlIHNvdXJjZSB3aWxsIGNvbm5lY3QgdG8gdGhpcykuXG4gICAgICAgIHNlbGYuX25vZGUgPSAodHlwZW9mIEhvd2xlci5jdHguY3JlYXRlR2FpbiA9PT0gJ3VuZGVmaW5lZCcpID8gSG93bGVyLmN0eC5jcmVhdGVHYWluTm9kZSgpIDogSG93bGVyLmN0eC5jcmVhdGVHYWluKCk7XG4gICAgICAgIHNlbGYuX25vZGUuZ2Fpbi5zZXRWYWx1ZUF0VGltZSh2b2x1bWUsIEhvd2xlci5jdHguY3VycmVudFRpbWUpO1xuICAgICAgICBzZWxmLl9ub2RlLnBhdXNlZCA9IHRydWU7XG4gICAgICAgIHNlbGYuX25vZGUuY29ubmVjdChIb3dsZXIubWFzdGVyR2Fpbik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBzZWxmLl9ub2RlID0gbmV3IEF1ZGlvKCk7XG5cbiAgICAgICAgLy8gTGlzdGVuIGZvciBlcnJvcnMgKGh0dHA6Ly9kZXYudzMub3JnL2h0bWw1L3NwZWMtYXV0aG9yLXZpZXcvc3BlYy5odG1sI21lZGlhZXJyb3IpLlxuICAgICAgICBzZWxmLl9lcnJvckZuID0gc2VsZi5fZXJyb3JMaXN0ZW5lci5iaW5kKHNlbGYpO1xuICAgICAgICBzZWxmLl9ub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgc2VsZi5fZXJyb3JGbiwgZmFsc2UpO1xuXG4gICAgICAgIC8vIExpc3RlbiBmb3IgJ2NhbnBsYXl0aHJvdWdoJyBldmVudCB0byBsZXQgdXMga25vdyB0aGUgc291bmQgaXMgcmVhZHkuXG4gICAgICAgIHNlbGYuX2xvYWRGbiA9IHNlbGYuX2xvYWRMaXN0ZW5lci5iaW5kKHNlbGYpO1xuICAgICAgICBzZWxmLl9ub2RlLmFkZEV2ZW50TGlzdGVuZXIoSG93bGVyLl9jYW5QbGF5RXZlbnQsIHNlbGYuX2xvYWRGbiwgZmFsc2UpO1xuXG4gICAgICAgIC8vIFNldHVwIHRoZSBuZXcgYXVkaW8gbm9kZS5cbiAgICAgICAgc2VsZi5fbm9kZS5zcmMgPSBwYXJlbnQuX3NyYztcbiAgICAgICAgc2VsZi5fbm9kZS5wcmVsb2FkID0gJ2F1dG8nO1xuICAgICAgICBzZWxmLl9ub2RlLnZvbHVtZSA9IHZvbHVtZSAqIEhvd2xlci52b2x1bWUoKTtcblxuICAgICAgICAvLyBCZWdpbiBsb2FkaW5nIHRoZSBzb3VyY2UuXG4gICAgICAgIHNlbGYuX25vZGUubG9hZCgpO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogUmVzZXQgdGhlIHBhcmFtZXRlcnMgb2YgdGhpcyBzb3VuZCB0byB0aGUgb3JpZ2luYWwgc3RhdGUgKGZvciByZWN5Y2xlKS5cbiAgICAgKiBAcmV0dXJuIHtTb3VuZH1cbiAgICAgKi9cbiAgICByZXNldDogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgcGFyZW50ID0gc2VsZi5fcGFyZW50O1xuXG4gICAgICAvLyBSZXNldCBhbGwgb2YgdGhlIHBhcmFtZXRlcnMgb2YgdGhpcyBzb3VuZC5cbiAgICAgIHNlbGYuX211dGVkID0gcGFyZW50Ll9tdXRlZDtcbiAgICAgIHNlbGYuX2xvb3AgPSBwYXJlbnQuX2xvb3A7XG4gICAgICBzZWxmLl92b2x1bWUgPSBwYXJlbnQuX3ZvbHVtZTtcbiAgICAgIHNlbGYuX211dGVkID0gcGFyZW50Ll9tdXRlZDtcbiAgICAgIHNlbGYuX3JhdGUgPSBwYXJlbnQuX3JhdGU7XG4gICAgICBzZWxmLl9zZWVrID0gMDtcbiAgICAgIHNlbGYuX3JhdGVTZWVrID0gMDtcbiAgICAgIHNlbGYuX3BhdXNlZCA9IHRydWU7XG4gICAgICBzZWxmLl9lbmRlZCA9IHRydWU7XG4gICAgICBzZWxmLl9zcHJpdGUgPSAnX19kZWZhdWx0JztcblxuICAgICAgLy8gR2VuZXJhdGUgYSBuZXcgSUQgc28gdGhhdCBpdCBpc24ndCBjb25mdXNlZCB3aXRoIHRoZSBwcmV2aW91cyBzb3VuZC5cbiAgICAgIHNlbGYuX2lkID0gTWF0aC5yb3VuZChEYXRlLm5vdygpICogTWF0aC5yYW5kb20oKSk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH0sXG5cbiAgICAvKipcbiAgICAgKiBIVE1MNSBBdWRpbyBlcnJvciBsaXN0ZW5lciBjYWxsYmFjay5cbiAgICAgKi9cbiAgICBfZXJyb3JMaXN0ZW5lcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAgIC8vIEZpcmUgYW4gZXJyb3IgZXZlbnQgYW5kIHBhc3MgYmFjayB0aGUgY29kZS5cbiAgICAgIHNlbGYuX3BhcmVudC5fZW1pdCgnbG9hZGVycm9yJywgc2VsZi5faWQsIHNlbGYuX25vZGUuZXJyb3IgPyBzZWxmLl9ub2RlLmVycm9yLmNvZGUgOiAwKTtcblxuICAgICAgLy8gQ2xlYXIgdGhlIGV2ZW50IGxpc3RlbmVyLlxuICAgICAgc2VsZi5fbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKCdlcnJvcicsIHNlbGYuX2Vycm9yTGlzdGVuZXIsIGZhbHNlKTtcbiAgICB9LFxuXG4gICAgLyoqXG4gICAgICogSFRNTDUgQXVkaW8gY2FucGxheXRocm91Z2ggbGlzdGVuZXIgY2FsbGJhY2suXG4gICAgICovXG4gICAgX2xvYWRMaXN0ZW5lcjogZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgcGFyZW50ID0gc2VsZi5fcGFyZW50O1xuXG4gICAgICAvLyBSb3VuZCB1cCB0aGUgZHVyYXRpb24gdG8gYWNjb3VudCBmb3IgdGhlIGxvd2VyIHByZWNpc2lvbiBpbiBIVE1MNSBBdWRpby5cbiAgICAgIHBhcmVudC5fZHVyYXRpb24gPSBNYXRoLmNlaWwoc2VsZi5fbm9kZS5kdXJhdGlvbiAqIDEwKSAvIDEwO1xuXG4gICAgICAvLyBTZXR1cCBhIHNwcml0ZSBpZiBub25lIGlzIGRlZmluZWQuXG4gICAgICBpZiAoT2JqZWN0LmtleXMocGFyZW50Ll9zcHJpdGUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICBwYXJlbnQuX3Nwcml0ZSA9IHtfX2RlZmF1bHQ6IFswLCBwYXJlbnQuX2R1cmF0aW9uICogMTAwMF19O1xuICAgICAgfVxuXG4gICAgICBpZiAocGFyZW50Ll9zdGF0ZSAhPT0gJ2xvYWRlZCcpIHtcbiAgICAgICAgcGFyZW50Ll9zdGF0ZSA9ICdsb2FkZWQnO1xuICAgICAgICBwYXJlbnQuX2VtaXQoJ2xvYWQnKTtcbiAgICAgICAgcGFyZW50Ll9sb2FkUXVldWUoKTtcbiAgICAgIH1cblxuICAgICAgLy8gQ2xlYXIgdGhlIGV2ZW50IGxpc3RlbmVyLlxuICAgICAgc2VsZi5fbm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKEhvd2xlci5fY2FuUGxheUV2ZW50LCBzZWxmLl9sb2FkRm4sIGZhbHNlKTtcbiAgICB9XG4gIH07XG5cbiAgLyoqIEhlbHBlciBNZXRob2RzICoqL1xuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIHZhciBjYWNoZSA9IHt9O1xuXG4gIC8qKlxuICAgKiBCdWZmZXIgYSBzb3VuZCBmcm9tIFVSTCwgRGF0YSBVUkkgb3IgY2FjaGUgYW5kIGRlY29kZSB0byBhdWRpbyBzb3VyY2UgKFdlYiBBdWRpbyBBUEkpLlxuICAgKiBAcGFyYW0gIHtIb3dsfSBzZWxmXG4gICAqL1xuICB2YXIgbG9hZEJ1ZmZlciA9IGZ1bmN0aW9uKHNlbGYpIHtcbiAgICB2YXIgdXJsID0gc2VsZi5fc3JjO1xuXG4gICAgLy8gQ2hlY2sgaWYgdGhlIGJ1ZmZlciBoYXMgYWxyZWFkeSBiZWVuIGNhY2hlZCBhbmQgdXNlIGl0IGluc3RlYWQuXG4gICAgaWYgKGNhY2hlW3VybF0pIHtcbiAgICAgIC8vIFNldCB0aGUgZHVyYXRpb24gZnJvbSB0aGUgY2FjaGUuXG4gICAgICBzZWxmLl9kdXJhdGlvbiA9IGNhY2hlW3VybF0uZHVyYXRpb247XG5cbiAgICAgIC8vIExvYWQgdGhlIHNvdW5kIGludG8gdGhpcyBIb3dsLlxuICAgICAgbG9hZFNvdW5kKHNlbGYpO1xuXG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKC9eZGF0YTpbXjtdKztiYXNlNjQsLy50ZXN0KHVybCkpIHtcbiAgICAgIC8vIERlY29kZSB0aGUgYmFzZTY0IGRhdGEgVVJJIHdpdGhvdXQgWEhSLCBzaW5jZSBzb21lIGJyb3dzZXJzIGRvbid0IHN1cHBvcnQgaXQuXG4gICAgICB2YXIgZGF0YSA9IGF0b2IodXJsLnNwbGl0KCcsJylbMV0pO1xuICAgICAgdmFyIGRhdGFWaWV3ID0gbmV3IFVpbnQ4QXJyYXkoZGF0YS5sZW5ndGgpO1xuICAgICAgZm9yICh2YXIgaT0wOyBpPGRhdGEubGVuZ3RoOyArK2kpIHtcbiAgICAgICAgZGF0YVZpZXdbaV0gPSBkYXRhLmNoYXJDb2RlQXQoaSk7XG4gICAgICB9XG5cbiAgICAgIGRlY29kZUF1ZGlvRGF0YShkYXRhVmlldy5idWZmZXIsIHNlbGYpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBMb2FkIHRoZSBidWZmZXIgZnJvbSB0aGUgVVJMLlxuICAgICAgdmFyIHhociA9IG5ldyBYTUxIdHRwUmVxdWVzdCgpO1xuICAgICAgeGhyLm9wZW4oJ0dFVCcsIHVybCwgdHJ1ZSk7XG4gICAgICB4aHIucmVzcG9uc2VUeXBlID0gJ2FycmF5YnVmZmVyJztcbiAgICAgIHhoci5vbmxvYWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgLy8gTWFrZSBzdXJlIHdlIGdldCBhIHN1Y2Nlc3NmdWwgcmVzcG9uc2UgYmFjay5cbiAgICAgICAgdmFyIGNvZGUgPSAoeGhyLnN0YXR1cyArICcnKVswXTtcbiAgICAgICAgaWYgKGNvZGUgIT09ICcwJyAmJiBjb2RlICE9PSAnMicgJiYgY29kZSAhPT0gJzMnKSB7XG4gICAgICAgICAgc2VsZi5fZW1pdCgnbG9hZGVycm9yJywgbnVsbCwgJ0ZhaWxlZCBsb2FkaW5nIGF1ZGlvIGZpbGUgd2l0aCBzdGF0dXM6ICcgKyB4aHIuc3RhdHVzICsgJy4nKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBkZWNvZGVBdWRpb0RhdGEoeGhyLnJlc3BvbnNlLCBzZWxmKTtcbiAgICAgIH07XG4gICAgICB4aHIub25lcnJvciA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAvLyBJZiB0aGVyZSBpcyBhbiBlcnJvciwgc3dpdGNoIHRvIEhUTUw1IEF1ZGlvLlxuICAgICAgICBpZiAoc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgICAgICBzZWxmLl9odG1sNSA9IHRydWU7XG4gICAgICAgICAgc2VsZi5fd2ViQXVkaW8gPSBmYWxzZTtcbiAgICAgICAgICBzZWxmLl9zb3VuZHMgPSBbXTtcbiAgICAgICAgICBkZWxldGUgY2FjaGVbdXJsXTtcbiAgICAgICAgICBzZWxmLmxvYWQoKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICAgIHNhZmVYaHJTZW5kKHhocik7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBTZW5kIHRoZSBYSFIgcmVxdWVzdCB3cmFwcGVkIGluIGEgdHJ5L2NhdGNoLlxuICAgKiBAcGFyYW0gIHtPYmplY3R9IHhociBYSFIgdG8gc2VuZC5cbiAgICovXG4gIHZhciBzYWZlWGhyU2VuZCA9IGZ1bmN0aW9uKHhocikge1xuICAgIHRyeSB7XG4gICAgICB4aHIuc2VuZCgpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIHhoci5vbmVycm9yKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBEZWNvZGUgYXVkaW8gZGF0YSBmcm9tIGFuIGFycmF5IGJ1ZmZlci5cbiAgICogQHBhcmFtICB7QXJyYXlCdWZmZXJ9IGFycmF5YnVmZmVyIFRoZSBhdWRpbyBkYXRhLlxuICAgKiBAcGFyYW0gIHtIb3dsfSAgICAgICAgc2VsZlxuICAgKi9cbiAgdmFyIGRlY29kZUF1ZGlvRGF0YSA9IGZ1bmN0aW9uKGFycmF5YnVmZmVyLCBzZWxmKSB7XG4gICAgLy8gRGVjb2RlIHRoZSBidWZmZXIgaW50byBhbiBhdWRpbyBzb3VyY2UuXG4gICAgSG93bGVyLmN0eC5kZWNvZGVBdWRpb0RhdGEoYXJyYXlidWZmZXIsIGZ1bmN0aW9uKGJ1ZmZlcikge1xuICAgICAgaWYgKGJ1ZmZlciAmJiBzZWxmLl9zb3VuZHMubGVuZ3RoID4gMCkge1xuICAgICAgICBjYWNoZVtzZWxmLl9zcmNdID0gYnVmZmVyO1xuICAgICAgICBsb2FkU291bmQoc2VsZiwgYnVmZmVyKTtcbiAgICAgIH1cbiAgICB9LCBmdW5jdGlvbigpIHtcbiAgICAgIHNlbGYuX2VtaXQoJ2xvYWRlcnJvcicsIG51bGwsICdEZWNvZGluZyBhdWRpbyBkYXRhIGZhaWxlZC4nKTtcbiAgICB9KTtcbiAgfTtcblxuICAvKipcbiAgICogU291bmQgaXMgbm93IGxvYWRlZCwgc28gZmluaXNoIHNldHRpbmcgZXZlcnl0aGluZyB1cCBhbmQgZmlyZSB0aGUgbG9hZGVkIGV2ZW50LlxuICAgKiBAcGFyYW0gIHtIb3dsfSBzZWxmXG4gICAqIEBwYXJhbSAge09iamVjdH0gYnVmZmVyIFRoZSBkZWNvZGVkIGJ1ZmZlciBzb3VuZCBzb3VyY2UuXG4gICAqL1xuICB2YXIgbG9hZFNvdW5kID0gZnVuY3Rpb24oc2VsZiwgYnVmZmVyKSB7XG4gICAgLy8gU2V0IHRoZSBkdXJhdGlvbi5cbiAgICBpZiAoYnVmZmVyICYmICFzZWxmLl9kdXJhdGlvbikge1xuICAgICAgc2VsZi5fZHVyYXRpb24gPSBidWZmZXIuZHVyYXRpb247XG4gICAgfVxuXG4gICAgLy8gU2V0dXAgYSBzcHJpdGUgaWYgbm9uZSBpcyBkZWZpbmVkLlxuICAgIGlmIChPYmplY3Qua2V5cyhzZWxmLl9zcHJpdGUpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgc2VsZi5fc3ByaXRlID0ge19fZGVmYXVsdDogWzAsIHNlbGYuX2R1cmF0aW9uICogMTAwMF19O1xuICAgIH1cblxuICAgIC8vIEZpcmUgdGhlIGxvYWRlZCBldmVudC5cbiAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnKSB7XG4gICAgICBzZWxmLl9zdGF0ZSA9ICdsb2FkZWQnO1xuICAgICAgc2VsZi5fZW1pdCgnbG9hZCcpO1xuICAgICAgc2VsZi5fbG9hZFF1ZXVlKCk7XG4gICAgfVxuICB9O1xuXG4gIC8qKlxuICAgKiBTZXR1cCB0aGUgYXVkaW8gY29udGV4dCB3aGVuIGF2YWlsYWJsZSwgb3Igc3dpdGNoIHRvIEhUTUw1IEF1ZGlvIG1vZGUuXG4gICAqL1xuICB2YXIgc2V0dXBBdWRpb0NvbnRleHQgPSBmdW5jdGlvbigpIHtcbiAgICAvLyBDaGVjayBpZiB3ZSBhcmUgdXNpbmcgV2ViIEF1ZGlvIGFuZCBzZXR1cCB0aGUgQXVkaW9Db250ZXh0IGlmIHdlIGFyZS5cbiAgICB0cnkge1xuICAgICAgaWYgKHR5cGVvZiBBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIEhvd2xlci5jdHggPSBuZXcgQXVkaW9Db250ZXh0KCk7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiB3ZWJraXRBdWRpb0NvbnRleHQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIEhvd2xlci5jdHggPSBuZXcgd2Via2l0QXVkaW9Db250ZXh0KCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBIb3dsZXIudXNpbmdXZWJBdWRpbyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH0gY2F0Y2goZSkge1xuICAgICAgSG93bGVyLnVzaW5nV2ViQXVkaW8gPSBmYWxzZTtcbiAgICB9XG5cbiAgICAvLyBDaGVjayBpZiBhIHdlYnZpZXcgaXMgYmVpbmcgdXNlZCBvbiBpT1M4IG9yIGVhcmxpZXIgKHJhdGhlciB0aGFuIHRoZSBicm93c2VyKS5cbiAgICAvLyBJZiBpdCBpcywgZGlzYWJsZSBXZWIgQXVkaW8gYXMgaXQgY2F1c2VzIGNyYXNoaW5nLlxuICAgIHZhciBpT1MgPSAoL2lQKGhvbmV8b2R8YWQpLy50ZXN0KEhvd2xlci5fbmF2aWdhdG9yICYmIEhvd2xlci5fbmF2aWdhdG9yLnBsYXRmb3JtKSk7XG4gICAgdmFyIGFwcFZlcnNpb24gPSBIb3dsZXIuX25hdmlnYXRvciAmJiBIb3dsZXIuX25hdmlnYXRvci5hcHBWZXJzaW9uLm1hdGNoKC9PUyAoXFxkKylfKFxcZCspXz8oXFxkKyk/Lyk7XG4gICAgdmFyIHZlcnNpb24gPSBhcHBWZXJzaW9uID8gcGFyc2VJbnQoYXBwVmVyc2lvblsxXSwgMTApIDogbnVsbDtcbiAgICBpZiAoaU9TICYmIHZlcnNpb24gJiYgdmVyc2lvbiA8IDkpIHtcbiAgICAgIHZhciBzYWZhcmkgPSAvc2FmYXJpLy50ZXN0KEhvd2xlci5fbmF2aWdhdG9yICYmIEhvd2xlci5fbmF2aWdhdG9yLnVzZXJBZ2VudC50b0xvd2VyQ2FzZSgpKTtcbiAgICAgIGlmIChIb3dsZXIuX25hdmlnYXRvciAmJiBIb3dsZXIuX25hdmlnYXRvci5zdGFuZGFsb25lICYmICFzYWZhcmkgfHwgSG93bGVyLl9uYXZpZ2F0b3IgJiYgIUhvd2xlci5fbmF2aWdhdG9yLnN0YW5kYWxvbmUgJiYgIXNhZmFyaSkge1xuICAgICAgICBIb3dsZXIudXNpbmdXZWJBdWRpbyA9IGZhbHNlO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENyZWF0ZSBhbmQgZXhwb3NlIHRoZSBtYXN0ZXIgR2Fpbk5vZGUgd2hlbiB1c2luZyBXZWIgQXVkaW8gKHVzZWZ1bCBmb3IgcGx1Z2lucyBvciBhZHZhbmNlZCB1c2FnZSkuXG4gICAgaWYgKEhvd2xlci51c2luZ1dlYkF1ZGlvKSB7XG4gICAgICBIb3dsZXIubWFzdGVyR2FpbiA9ICh0eXBlb2YgSG93bGVyLmN0eC5jcmVhdGVHYWluID09PSAndW5kZWZpbmVkJykgPyBIb3dsZXIuY3R4LmNyZWF0ZUdhaW5Ob2RlKCkgOiBIb3dsZXIuY3R4LmNyZWF0ZUdhaW4oKTtcbiAgICAgIEhvd2xlci5tYXN0ZXJHYWluLmdhaW4udmFsdWUgPSAxO1xuICAgICAgSG93bGVyLm1hc3RlckdhaW4uY29ubmVjdChIb3dsZXIuY3R4LmRlc3RpbmF0aW9uKTtcbiAgICB9XG5cbiAgICAvLyBSZS1ydW4gdGhlIHNldHVwIG9uIEhvd2xlci5cbiAgICBIb3dsZXIuX3NldHVwKCk7XG4gIH07XG5cbiAgLy8gQWRkIHN1cHBvcnQgZm9yIEFNRCAoQXN5bmNocm9ub3VzIE1vZHVsZSBEZWZpbml0aW9uKSBsaWJyYXJpZXMgc3VjaCBhcyByZXF1aXJlLmpzLlxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFtdLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIEhvd2xlcjogSG93bGVyLFxuICAgICAgICBIb3dsOiBIb3dsXG4gICAgICB9O1xuICAgIH0pO1xuICB9XG5cbiAgLy8gQWRkIHN1cHBvcnQgZm9yIENvbW1vbkpTIGxpYnJhcmllcyBzdWNoIGFzIGJyb3dzZXJpZnkuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBleHBvcnRzLkhvd2xlciA9IEhvd2xlcjtcbiAgICBleHBvcnRzLkhvd2wgPSBIb3dsO1xuICB9XG5cbiAgLy8gRGVmaW5lIGdsb2JhbGx5IGluIGNhc2UgQU1EIGlzIG5vdCBhdmFpbGFibGUgb3IgdW51c2VkLlxuICBpZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICB3aW5kb3cuSG93bGVyR2xvYmFsID0gSG93bGVyR2xvYmFsO1xuICAgIHdpbmRvdy5Ib3dsZXIgPSBIb3dsZXI7XG4gICAgd2luZG93Lkhvd2wgPSBIb3dsO1xuICAgIHdpbmRvdy5Tb3VuZCA9IFNvdW5kO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7IC8vIEFkZCB0byBnbG9iYWwgaW4gTm9kZS5qcyAoZm9yIHRlc3RpbmcsIGV0YykuXG4gICAgZ2xvYmFsLkhvd2xlckdsb2JhbCA9IEhvd2xlckdsb2JhbDtcbiAgICBnbG9iYWwuSG93bGVyID0gSG93bGVyO1xuICAgIGdsb2JhbC5Ib3dsID0gSG93bDtcbiAgICBnbG9iYWwuU291bmQgPSBTb3VuZDtcbiAgfVxufSkoKTtcblxuXG4vKiFcbiAqICBTcGF0aWFsIFBsdWdpbiAtIEFkZHMgc3VwcG9ydCBmb3Igc3RlcmVvIGFuZCAzRCBhdWRpbyB3aGVyZSBXZWIgQXVkaW8gaXMgc3VwcG9ydGVkLlxuICogIFxuICogIGhvd2xlci5qcyB2Mi4wLjJcbiAqICBob3dsZXJqcy5jb21cbiAqXG4gKiAgKGMpIDIwMTMtMjAxNiwgSmFtZXMgU2ltcHNvbiBvZiBHb2xkRmlyZSBTdHVkaW9zXG4gKiAgZ29sZGZpcmVzdHVkaW9zLmNvbVxuICpcbiAqICBNSVQgTGljZW5zZVxuICovXG5cbihmdW5jdGlvbigpIHtcblxuICAndXNlIHN0cmljdCc7XG5cbiAgLy8gU2V0dXAgZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBIb3dsZXJHbG9iYWwucHJvdG90eXBlLl9wb3MgPSBbMCwgMCwgMF07XG4gIEhvd2xlckdsb2JhbC5wcm90b3R5cGUuX29yaWVudGF0aW9uID0gWzAsIDAsIC0xLCAwLCAxLCAwXTtcbiAgXG4gIC8qKiBHbG9iYWwgTWV0aG9kcyAqKi9cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAvKipcbiAgICogSGVscGVyIG1ldGhvZCB0byB1cGRhdGUgdGhlIHN0ZXJlbyBwYW5uaW5nIHBvc2l0aW9uIG9mIGFsbCBjdXJyZW50IEhvd2xzLlxuICAgKiBGdXR1cmUgSG93bHMgd2lsbCBub3QgdXNlIHRoaXMgdmFsdWUgdW5sZXNzIGV4cGxpY2l0bHkgc2V0LlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHBhbiBBIHZhbHVlIG9mIC0xLjAgaXMgYWxsIHRoZSB3YXkgbGVmdCBhbmQgMS4wIGlzIGFsbCB0aGUgd2F5IHJpZ2h0LlxuICAgKiBAcmV0dXJuIHtIb3dsZXIvTnVtYmVyfSAgICAgU2VsZiBvciBjdXJyZW50IHN0ZXJlbyBwYW5uaW5nIHZhbHVlLlxuICAgKi9cbiAgSG93bGVyR2xvYmFsLnByb3RvdHlwZS5zdGVyZW8gPSBmdW5jdGlvbihwYW4pIHtcbiAgICB2YXIgc2VsZiA9IHRoaXM7XG5cbiAgICAvLyBTdG9wIHJpZ2h0IGhlcmUgaWYgbm90IHVzaW5nIFdlYiBBdWRpby5cbiAgICBpZiAoIXNlbGYuY3R4IHx8ICFzZWxmLmN0eC5saXN0ZW5lcikge1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgLy8gTG9vcCB0aHJvdWdoIGFsbCBIb3dscyBhbmQgdXBkYXRlIHRoZWlyIHN0ZXJlbyBwYW5uaW5nLlxuICAgIGZvciAodmFyIGk9c2VsZi5faG93bHMubGVuZ3RoLTE7IGk+PTA7IGktLSkge1xuICAgICAgc2VsZi5faG93bHNbaV0uc3RlcmVvKHBhbik7XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldC9zZXQgdGhlIHBvc2l0aW9uIG9mIHRoZSBsaXN0ZW5lciBpbiAzRCBjYXJ0ZXNpYW4gc3BhY2UuIFNvdW5kcyB1c2luZ1xuICAgKiAzRCBwb3NpdGlvbiB3aWxsIGJlIHJlbGF0aXZlIHRvIHRoZSBsaXN0ZW5lcidzIHBvc2l0aW9uLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHggVGhlIHgtcG9zaXRpb24gb2YgdGhlIGxpc3RlbmVyLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHkgVGhlIHktcG9zaXRpb24gb2YgdGhlIGxpc3RlbmVyLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHogVGhlIHotcG9zaXRpb24gb2YgdGhlIGxpc3RlbmVyLlxuICAgKiBAcmV0dXJuIHtIb3dsZXIvQXJyYXl9ICAgU2VsZiBvciBjdXJyZW50IGxpc3RlbmVyIHBvc2l0aW9uLlxuICAgKi9cbiAgSG93bGVyR2xvYmFsLnByb3RvdHlwZS5wb3MgPSBmdW5jdGlvbih4LCB5LCB6KSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gU3RvcCByaWdodCBoZXJlIGlmIG5vdCB1c2luZyBXZWIgQXVkaW8uXG4gICAgaWYgKCFzZWxmLmN0eCB8fCAhc2VsZi5jdHgubGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgZGVmYXVsdHMgZm9yIG9wdGlvbmFsICd5JyAmICd6Jy5cbiAgICB5ID0gKHR5cGVvZiB5ICE9PSAnbnVtYmVyJykgPyBzZWxmLl9wb3NbMV0gOiB5O1xuICAgIHogPSAodHlwZW9mIHogIT09ICdudW1iZXInKSA/IHNlbGYuX3Bvc1syXSA6IHo7XG5cbiAgICBpZiAodHlwZW9mIHggPT09ICdudW1iZXInKSB7XG4gICAgICBzZWxmLl9wb3MgPSBbeCwgeSwgel07XG4gICAgICBzZWxmLmN0eC5saXN0ZW5lci5zZXRQb3NpdGlvbihzZWxmLl9wb3NbMF0sIHNlbGYuX3Bvc1sxXSwgc2VsZi5fcG9zWzJdKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIHNlbGYuX3BvcztcbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICAvKipcbiAgICogR2V0L3NldCB0aGUgZGlyZWN0aW9uIHRoZSBsaXN0ZW5lciBpcyBwb2ludGluZyBpbiB0aGUgM0QgY2FydGVzaWFuIHNwYWNlLlxuICAgKiBBIGZyb250IGFuZCB1cCB2ZWN0b3IgbXVzdCBiZSBwcm92aWRlZC4gVGhlIGZyb250IGlzIHRoZSBkaXJlY3Rpb24gdGhlXG4gICAqIGZhY2Ugb2YgdGhlIGxpc3RlbmVyIGlzIHBvaW50aW5nLCBhbmQgdXAgaXMgdGhlIGRpcmVjdGlvbiB0aGUgdG9wIG9mIHRoZVxuICAgKiBsaXN0ZW5lciBpcyBwb2ludGluZy4gVGh1cywgdGhlc2UgdmFsdWVzIGFyZSBleHBlY3RlZCB0byBiZSBhdCByaWdodCBhbmdsZXNcbiAgICogZnJvbSBlYWNoIG90aGVyLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHggICBUaGUgeC1vcmllbnRhdGlvbiBvZiB0aGUgbGlzdGVuZXIuXG4gICAqIEBwYXJhbSAge051bWJlcn0geSAgIFRoZSB5LW9yaWVudGF0aW9uIG9mIHRoZSBsaXN0ZW5lci5cbiAgICogQHBhcmFtICB7TnVtYmVyfSB6ICAgVGhlIHotb3JpZW50YXRpb24gb2YgdGhlIGxpc3RlbmVyLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHhVcCBUaGUgeC1vcmllbnRhdGlvbiBvZiB0aGUgdG9wIG9mIHRoZSBsaXN0ZW5lci5cbiAgICogQHBhcmFtICB7TnVtYmVyfSB5VXAgVGhlIHktb3JpZW50YXRpb24gb2YgdGhlIHRvcCBvZiB0aGUgbGlzdGVuZXIuXG4gICAqIEBwYXJhbSAge051bWJlcn0gelVwIFRoZSB6LW9yaWVudGF0aW9uIG9mIHRoZSB0b3Agb2YgdGhlIGxpc3RlbmVyLlxuICAgKiBAcmV0dXJuIHtIb3dsZXIvQXJyYXl9ICAgICBSZXR1cm5zIHNlbGYgb3IgdGhlIGN1cnJlbnQgb3JpZW50YXRpb24gdmVjdG9ycy5cbiAgICovXG4gIEhvd2xlckdsb2JhbC5wcm90b3R5cGUub3JpZW50YXRpb24gPSBmdW5jdGlvbih4LCB5LCB6LCB4VXAsIHlVcCwgelVwKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gU3RvcCByaWdodCBoZXJlIGlmIG5vdCB1c2luZyBXZWIgQXVkaW8uXG4gICAgaWYgKCFzZWxmLmN0eCB8fCAhc2VsZi5jdHgubGlzdGVuZXIpIHtcbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIC8vIFNldCB0aGUgZGVmYXVsdHMgZm9yIG9wdGlvbmFsICd5JyAmICd6Jy5cbiAgICB2YXIgb3IgPSBzZWxmLl9vcmllbnRhdGlvbjtcbiAgICB5ID0gKHR5cGVvZiB5ICE9PSAnbnVtYmVyJykgPyBvclsxXSA6IHk7XG4gICAgeiA9ICh0eXBlb2YgeiAhPT0gJ251bWJlcicpID8gb3JbMl0gOiB6O1xuICAgIHhVcCA9ICh0eXBlb2YgeFVwICE9PSAnbnVtYmVyJykgPyBvclszXSA6IHhVcDtcbiAgICB5VXAgPSAodHlwZW9mIHlVcCAhPT0gJ251bWJlcicpID8gb3JbNF0gOiB5VXA7XG4gICAgelVwID0gKHR5cGVvZiB6VXAgIT09ICdudW1iZXInKSA/IG9yWzVdIDogelVwO1xuXG4gICAgaWYgKHR5cGVvZiB4ID09PSAnbnVtYmVyJykge1xuICAgICAgc2VsZi5fb3JpZW50YXRpb24gPSBbeCwgeSwgeiwgeFVwLCB5VXAsIHpVcF07XG4gICAgICBzZWxmLmN0eC5saXN0ZW5lci5zZXRPcmllbnRhdGlvbih4LCB5LCB6LCB4VXAsIHlVcCwgelVwKTtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG9yO1xuICAgIH1cblxuICAgIHJldHVybiBzZWxmO1xuICB9O1xuXG4gIC8qKiBHcm91cCBNZXRob2RzICoqL1xuICAvKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqL1xuXG4gIC8qKlxuICAgKiBBZGQgbmV3IHByb3BlcnRpZXMgdG8gdGhlIGNvcmUgaW5pdC5cbiAgICogQHBhcmFtICB7RnVuY3Rpb259IF9zdXBlciBDb3JlIGluaXQgbWV0aG9kLlxuICAgKiBAcmV0dXJuIHtIb3dsfVxuICAgKi9cbiAgSG93bC5wcm90b3R5cGUuaW5pdCA9IChmdW5jdGlvbihfc3VwZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24obykge1xuICAgICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgICAvLyBTZXR1cCB1c2VyLWRlZmluZWQgZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICAgICAgc2VsZi5fb3JpZW50YXRpb24gPSBvLm9yaWVudGF0aW9uIHx8IFsxLCAwLCAwXTtcbiAgICAgIHNlbGYuX3N0ZXJlbyA9IG8uc3RlcmVvIHx8IG51bGw7XG4gICAgICBzZWxmLl9wb3MgPSBvLnBvcyB8fCBudWxsO1xuICAgICAgc2VsZi5fcGFubmVyQXR0ciA9IHtcbiAgICAgICAgY29uZUlubmVyQW5nbGU6IHR5cGVvZiBvLmNvbmVJbm5lckFuZ2xlICE9PSAndW5kZWZpbmVkJyA/IG8uY29uZUlubmVyQW5nbGUgOiAzNjAsXG4gICAgICAgIGNvbmVPdXRlckFuZ2xlOiB0eXBlb2Ygby5jb25lT3V0ZXJBbmdsZSAhPT0gJ3VuZGVmaW5lZCcgPyBvLmNvbmVPdXRlckFuZ2xlIDogMzYwLFxuICAgICAgICBjb25lT3V0ZXJHYWluOiB0eXBlb2Ygby5jb25lT3V0ZXJHYWluICE9PSAndW5kZWZpbmVkJyA/IG8uY29uZU91dGVyR2FpbiA6IDAsXG4gICAgICAgIGRpc3RhbmNlTW9kZWw6IHR5cGVvZiBvLmRpc3RhbmNlTW9kZWwgIT09ICd1bmRlZmluZWQnID8gby5kaXN0YW5jZU1vZGVsIDogJ2ludmVyc2UnLFxuICAgICAgICBtYXhEaXN0YW5jZTogdHlwZW9mIG8ubWF4RGlzdGFuY2UgIT09ICd1bmRlZmluZWQnID8gby5tYXhEaXN0YW5jZSA6IDEwMDAwLFxuICAgICAgICBwYW5uaW5nTW9kZWw6IHR5cGVvZiBvLnBhbm5pbmdNb2RlbCAhPT0gJ3VuZGVmaW5lZCcgPyBvLnBhbm5pbmdNb2RlbCA6ICdIUlRGJyxcbiAgICAgICAgcmVmRGlzdGFuY2U6IHR5cGVvZiBvLnJlZkRpc3RhbmNlICE9PSAndW5kZWZpbmVkJyA/IG8ucmVmRGlzdGFuY2UgOiAxLFxuICAgICAgICByb2xsb2ZmRmFjdG9yOiB0eXBlb2Ygby5yb2xsb2ZmRmFjdG9yICE9PSAndW5kZWZpbmVkJyA/IG8ucm9sbG9mZkZhY3RvciA6IDFcbiAgICAgIH07XG5cbiAgICAgIC8vIFNldHVwIGV2ZW50IGxpc3RlbmVycy5cbiAgICAgIHNlbGYuX29uc3RlcmVvID0gby5vbnN0ZXJlbyA/IFt7Zm46IG8ub25zdGVyZW99XSA6IFtdO1xuICAgICAgc2VsZi5fb25wb3MgPSBvLm9ucG9zID8gW3tmbjogby5vbnBvc31dIDogW107XG4gICAgICBzZWxmLl9vbm9yaWVudGF0aW9uID0gby5vbm9yaWVudGF0aW9uID8gW3tmbjogby5vbm9yaWVudGF0aW9ufV0gOiBbXTtcblxuICAgICAgLy8gQ29tcGxldGUgaW5pdGlsaXphdGlvbiB3aXRoIGhvd2xlci5qcyBjb3JlJ3MgaW5pdCBmdW5jdGlvbi5cbiAgICAgIHJldHVybiBfc3VwZXIuY2FsbCh0aGlzLCBvKTtcbiAgICB9O1xuICB9KShIb3dsLnByb3RvdHlwZS5pbml0KTtcblxuICAvKipcbiAgICogR2V0L3NldCB0aGUgc3RlcmVvIHBhbm5pbmcgb2YgdGhlIGF1ZGlvIHNvdXJjZSBmb3IgdGhpcyBzb3VuZCBvciBhbGwgaW4gdGhlIGdyb3VwLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHBhbiAgQSB2YWx1ZSBvZiAtMS4wIGlzIGFsbCB0aGUgd2F5IGxlZnQgYW5kIDEuMCBpcyBhbGwgdGhlIHdheSByaWdodC5cbiAgICogQHBhcmFtICB7TnVtYmVyfSBpZCAob3B0aW9uYWwpIFRoZSBzb3VuZCBJRC4gSWYgbm9uZSBpcyBwYXNzZWQsIGFsbCBpbiBncm91cCB3aWxsIGJlIHVwZGF0ZWQuXG4gICAqIEByZXR1cm4ge0hvd2wvTnVtYmVyfSAgICBSZXR1cm5zIHNlbGYgb3IgdGhlIGN1cnJlbnQgc3RlcmVvIHBhbm5pbmcgdmFsdWUuXG4gICAqL1xuICBIb3dsLnByb3RvdHlwZS5zdGVyZW8gPSBmdW5jdGlvbihwYW4sIGlkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gU3RvcCByaWdodCBoZXJlIGlmIG5vdCB1c2luZyBXZWIgQXVkaW8uXG4gICAgaWYgKCFzZWxmLl93ZWJBdWRpbykge1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHNvdW5kIGhhc24ndCBsb2FkZWQsIGFkZCBpdCB0byB0aGUgbG9hZCBxdWV1ZSB0byBjaGFuZ2Ugc3RlcmVvIHBhbiB3aGVuIGNhcGFibGUuXG4gICAgaWYgKHNlbGYuX3N0YXRlICE9PSAnbG9hZGVkJykge1xuICAgICAgc2VsZi5fcXVldWUucHVzaCh7XG4gICAgICAgIGV2ZW50OiAnc3RlcmVvJyxcbiAgICAgICAgYWN0aW9uOiBmdW5jdGlvbigpIHtcbiAgICAgICAgICBzZWxmLnN0ZXJlbyhwYW4sIGlkKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIC8vIENoZWNrIGZvciBQYW5uZXJTdGVyZW9Ob2RlIHN1cHBvcnQgYW5kIGZhbGxiYWNrIHRvIFBhbm5lck5vZGUgaWYgaXQgZG9lc24ndCBleGlzdC5cbiAgICB2YXIgcGFubmVyVHlwZSA9ICh0eXBlb2YgSG93bGVyLmN0eC5jcmVhdGVTdGVyZW9QYW5uZXIgPT09ICd1bmRlZmluZWQnKSA/ICdzcGF0aWFsJyA6ICdzdGVyZW8nO1xuXG4gICAgLy8gU2V0dXAgdGhlIGdyb3VwJ3Mgc3RlcmVvIHBhbm5pbmcgaWYgbm8gSUQgaXMgcGFzc2VkLlxuICAgIGlmICh0eXBlb2YgaWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBSZXR1cm4gdGhlIGdyb3VwJ3Mgc3RlcmVvIHBhbm5pbmcgaWYgbm8gcGFyYW1ldGVycyBhcmUgcGFzc2VkLlxuICAgICAgaWYgKHR5cGVvZiBwYW4gPT09ICdudW1iZXInKSB7XG4gICAgICAgIHNlbGYuX3N0ZXJlbyA9IHBhbjtcbiAgICAgICAgc2VsZi5fcG9zID0gW3BhbiwgMCwgMF07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gc2VsZi5fc3RlcmVvO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoYW5nZSB0aGUgc3RyZW8gcGFubmluZyBvZiBvbmUgb3IgYWxsIHNvdW5kcyBpbiBncm91cC5cbiAgICB2YXIgaWRzID0gc2VsZi5fZ2V0U291bmRJZHMoaWQpO1xuICAgIGZvciAodmFyIGk9MDsgaTxpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIEdldCB0aGUgc291bmQuXG4gICAgICB2YXIgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWRzW2ldKTtcblxuICAgICAgaWYgKHNvdW5kKSB7XG4gICAgICAgIGlmICh0eXBlb2YgcGFuID09PSAnbnVtYmVyJykge1xuICAgICAgICAgIHNvdW5kLl9zdGVyZW8gPSBwYW47XG4gICAgICAgICAgc291bmQuX3BvcyA9IFtwYW4sIDAsIDBdO1xuXG4gICAgICAgICAgaWYgKHNvdW5kLl9ub2RlKSB7XG4gICAgICAgICAgICAvLyBJZiB3ZSBhcmUgZmFsbGluZyBiYWNrLCBtYWtlIHN1cmUgdGhlIHBhbm5pbmdNb2RlbCBpcyBlcXVhbHBvd2VyLlxuICAgICAgICAgICAgc291bmQuX3Bhbm5lckF0dHIucGFubmluZ01vZGVsID0gJ2VxdWFscG93ZXInO1xuXG4gICAgICAgICAgICAvLyBDaGVjayBpZiB0aGVyZSBpcyBhIHBhbm5lciBzZXR1cCBhbmQgY3JlYXRlIGEgbmV3IG9uZSBpZiBub3QuXG4gICAgICAgICAgICBpZiAoIXNvdW5kLl9wYW5uZXIgfHwgIXNvdW5kLl9wYW5uZXIucGFuKSB7XG4gICAgICAgICAgICAgIHNldHVwUGFubmVyKHNvdW5kLCBwYW5uZXJUeXBlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKHBhbm5lclR5cGUgPT09ICdzcGF0aWFsJykge1xuICAgICAgICAgICAgICBzb3VuZC5fcGFubmVyLnNldFBvc2l0aW9uKHBhbiwgMCwgMCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBzb3VuZC5fcGFubmVyLnBhbi52YWx1ZSA9IHBhbjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBzZWxmLl9lbWl0KCdzdGVyZW8nLCBzb3VuZC5faWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBzb3VuZC5fc3RlcmVvO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgLyoqXG4gICAqIEdldC9zZXQgdGhlIDNEIHNwYXRpYWwgcG9zaXRpb24gb2YgdGhlIGF1ZGlvIHNvdXJjZSBmb3IgdGhpcyBzb3VuZCBvclxuICAgKiBhbGwgaW4gdGhlIGdyb3VwLiBUaGUgbW9zdCBjb21tb24gdXNhZ2UgaXMgdG8gc2V0IHRoZSAneCcgcG9zaXRpb24gZm9yXG4gICAqIGxlZnQvcmlnaHQgcGFubmluZy4gU2V0dGluZyBhbnkgdmFsdWUgaGlnaGVyIHRoYW4gMS4wIHdpbGwgYmVnaW4gdG9cbiAgICogZGVjcmVhc2UgdGhlIHZvbHVtZSBvZiB0aGUgc291bmQgYXMgaXQgbW92ZXMgZnVydGhlciBhd2F5LlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHggIFRoZSB4LXBvc2l0aW9uIG9mIHRoZSBhdWRpbyBmcm9tIC0xMDAwLjAgdG8gMTAwMC4wLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHkgIFRoZSB5LXBvc2l0aW9uIG9mIHRoZSBhdWRpbyBmcm9tIC0xMDAwLjAgdG8gMTAwMC4wLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHogIFRoZSB6LXBvc2l0aW9uIG9mIHRoZSBhdWRpbyBmcm9tIC0xMDAwLjAgdG8gMTAwMC4wLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IGlkIChvcHRpb25hbCkgVGhlIHNvdW5kIElELiBJZiBub25lIGlzIHBhc3NlZCwgYWxsIGluIGdyb3VwIHdpbGwgYmUgdXBkYXRlZC5cbiAgICogQHJldHVybiB7SG93bC9BcnJheX0gICAgUmV0dXJucyBzZWxmIG9yIHRoZSBjdXJyZW50IDNEIHNwYXRpYWwgcG9zaXRpb246IFt4LCB5LCB6XS5cbiAgICovXG4gIEhvd2wucHJvdG90eXBlLnBvcyA9IGZ1bmN0aW9uKHgsIHksIHosIGlkKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuXG4gICAgLy8gU3RvcCByaWdodCBoZXJlIGlmIG5vdCB1c2luZyBXZWIgQXVkaW8uXG4gICAgaWYgKCFzZWxmLl93ZWJBdWRpbykge1xuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgLy8gSWYgdGhlIHNvdW5kIGhhc24ndCBsb2FkZWQsIGFkZCBpdCB0byB0aGUgbG9hZCBxdWV1ZSB0byBjaGFuZ2UgcG9zaXRpb24gd2hlbiBjYXBhYmxlLlxuICAgIGlmIChzZWxmLl9zdGF0ZSAhPT0gJ2xvYWRlZCcpIHtcbiAgICAgIHNlbGYuX3F1ZXVlLnB1c2goe1xuICAgICAgICBldmVudDogJ3BvcycsXG4gICAgICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5wb3MoeCwgeSwgeiwgaWQpO1xuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHNlbGY7XG4gICAgfVxuXG4gICAgLy8gU2V0IHRoZSBkZWZhdWx0cyBmb3Igb3B0aW9uYWwgJ3knICYgJ3onLlxuICAgIHkgPSAodHlwZW9mIHkgIT09ICdudW1iZXInKSA/IDAgOiB5O1xuICAgIHogPSAodHlwZW9mIHogIT09ICdudW1iZXInKSA/IC0wLjUgOiB6O1xuXG4gICAgLy8gU2V0dXAgdGhlIGdyb3VwJ3Mgc3BhdGlhbCBwb3NpdGlvbiBpZiBubyBJRCBpcyBwYXNzZWQuXG4gICAgaWYgKHR5cGVvZiBpZCA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIC8vIFJldHVybiB0aGUgZ3JvdXAncyBzcGF0aWFsIHBvc2l0aW9uIGlmIG5vIHBhcmFtZXRlcnMgYXJlIHBhc3NlZC5cbiAgICAgIGlmICh0eXBlb2YgeCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgc2VsZi5fcG9zID0gW3gsIHksIHpdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuX3BvcztcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBDaGFuZ2UgdGhlIHNwYXRpYWwgcG9zaXRpb24gb2Ygb25lIG9yIGFsbCBzb3VuZHMgaW4gZ3JvdXAuXG4gICAgdmFyIGlkcyA9IHNlbGYuX2dldFNvdW5kSWRzKGlkKTtcbiAgICBmb3IgKHZhciBpPTA7IGk8aWRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBHZXQgdGhlIHNvdW5kLlxuICAgICAgdmFyIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKGlkc1tpXSk7XG5cbiAgICAgIGlmIChzb3VuZCkge1xuICAgICAgICBpZiAodHlwZW9mIHggPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgc291bmQuX3BvcyA9IFt4LCB5LCB6XTtcblxuICAgICAgICAgIGlmIChzb3VuZC5fbm9kZSkge1xuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUgaXMgYSBwYW5uZXIgc2V0dXAgYW5kIGNyZWF0ZSBhIG5ldyBvbmUgaWYgbm90LlxuICAgICAgICAgICAgaWYgKCFzb3VuZC5fcGFubmVyIHx8IHNvdW5kLl9wYW5uZXIucGFuKSB7XG4gICAgICAgICAgICAgIHNldHVwUGFubmVyKHNvdW5kLCAnc3BhdGlhbCcpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzb3VuZC5fcGFubmVyLnNldFBvc2l0aW9uKHgsIHksIHopO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHNlbGYuX2VtaXQoJ3BvcycsIHNvdW5kLl9pZCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuIHNvdW5kLl9wb3M7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICAvKipcbiAgICogR2V0L3NldCB0aGUgZGlyZWN0aW9uIHRoZSBhdWRpbyBzb3VyY2UgaXMgcG9pbnRpbmcgaW4gdGhlIDNEIGNhcnRlc2lhbiBjb29yZGluYXRlXG4gICAqIHNwYWNlLiBEZXBlbmRpbmcgb24gaG93IGRpcmVjdGlvbiB0aGUgc291bmQgaXMsIGJhc2VkIG9uIHRoZSBgY29uZWAgYXR0cmlidXRlcyxcbiAgICogYSBzb3VuZCBwb2ludGluZyBhd2F5IGZyb20gdGhlIGxpc3RlbmVyIGNhbiBiZSBxdWlldCBvciBzaWxlbnQuXG4gICAqIEBwYXJhbSAge051bWJlcn0geCAgVGhlIHgtb3JpZW50YXRpb24gb2YgdGhlIHNvdXJjZS5cbiAgICogQHBhcmFtICB7TnVtYmVyfSB5ICBUaGUgeS1vcmllbnRhdGlvbiBvZiB0aGUgc291cmNlLlxuICAgKiBAcGFyYW0gIHtOdW1iZXJ9IHogIFRoZSB6LW9yaWVudGF0aW9uIG9mIHRoZSBzb3VyY2UuXG4gICAqIEBwYXJhbSAge051bWJlcn0gaWQgKG9wdGlvbmFsKSBUaGUgc291bmQgSUQuIElmIG5vbmUgaXMgcGFzc2VkLCBhbGwgaW4gZ3JvdXAgd2lsbCBiZSB1cGRhdGVkLlxuICAgKiBAcmV0dXJuIHtIb3dsL0FycmF5fSAgICBSZXR1cm5zIHNlbGYgb3IgdGhlIGN1cnJlbnQgM0Qgc3BhdGlhbCBvcmllbnRhdGlvbjogW3gsIHksIHpdLlxuICAgKi9cbiAgSG93bC5wcm90b3R5cGUub3JpZW50YXRpb24gPSBmdW5jdGlvbih4LCB5LCB6LCBpZCkge1xuICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgIC8vIFN0b3AgcmlnaHQgaGVyZSBpZiBub3QgdXNpbmcgV2ViIEF1ZGlvLlxuICAgIGlmICghc2VsZi5fd2ViQXVkaW8pIHtcbiAgICAgIHJldHVybiBzZWxmO1xuICAgIH1cblxuICAgIC8vIElmIHRoZSBzb3VuZCBoYXNuJ3QgbG9hZGVkLCBhZGQgaXQgdG8gdGhlIGxvYWQgcXVldWUgdG8gY2hhbmdlIG9yaWVudGF0aW9uIHdoZW4gY2FwYWJsZS5cbiAgICBpZiAoc2VsZi5fc3RhdGUgIT09ICdsb2FkZWQnKSB7XG4gICAgICBzZWxmLl9xdWV1ZS5wdXNoKHtcbiAgICAgICAgZXZlbnQ6ICdvcmllbnRhdGlvbicsXG4gICAgICAgIGFjdGlvbjogZnVuY3Rpb24oKSB7XG4gICAgICAgICAgc2VsZi5vcmllbnRhdGlvbih4LCB5LCB6LCBpZCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICAvLyBTZXQgdGhlIGRlZmF1bHRzIGZvciBvcHRpb25hbCAneScgJiAneicuXG4gICAgeSA9ICh0eXBlb2YgeSAhPT0gJ251bWJlcicpID8gc2VsZi5fb3JpZW50YXRpb25bMV0gOiB5O1xuICAgIHogPSAodHlwZW9mIHogIT09ICdudW1iZXInKSA/IHNlbGYuX29yaWVudGF0aW9uWzJdIDogejtcblxuICAgIC8vIFNldHVwIHRoZSBncm91cCdzIHNwYXRpYWwgb3JpZW50YXRpb24gaWYgbm8gSUQgaXMgcGFzc2VkLlxuICAgIGlmICh0eXBlb2YgaWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAvLyBSZXR1cm4gdGhlIGdyb3VwJ3Mgc3BhdGlhbCBvcmllbnRhdGlvbiBpZiBubyBwYXJhbWV0ZXJzIGFyZSBwYXNzZWQuXG4gICAgICBpZiAodHlwZW9mIHggPT09ICdudW1iZXInKSB7XG4gICAgICAgIHNlbGYuX29yaWVudGF0aW9uID0gW3gsIHksIHpdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHNlbGYuX29yaWVudGF0aW9uO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIENoYW5nZSB0aGUgc3BhdGlhbCBvcmllbnRhdGlvbiBvZiBvbmUgb3IgYWxsIHNvdW5kcyBpbiBncm91cC5cbiAgICB2YXIgaWRzID0gc2VsZi5fZ2V0U291bmRJZHMoaWQpO1xuICAgIGZvciAodmFyIGk9MDsgaTxpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIC8vIEdldCB0aGUgc291bmQuXG4gICAgICB2YXIgc291bmQgPSBzZWxmLl9zb3VuZEJ5SWQoaWRzW2ldKTtcblxuICAgICAgaWYgKHNvdW5kKSB7XG4gICAgICAgIGlmICh0eXBlb2YgeCA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBzb3VuZC5fb3JpZW50YXRpb24gPSBbeCwgeSwgel07XG5cbiAgICAgICAgICBpZiAoc291bmQuX25vZGUpIHtcbiAgICAgICAgICAgIC8vIENoZWNrIGlmIHRoZXJlIGlzIGEgcGFubmVyIHNldHVwIGFuZCBjcmVhdGUgYSBuZXcgb25lIGlmIG5vdC5cbiAgICAgICAgICAgIGlmICghc291bmQuX3Bhbm5lcikge1xuICAgICAgICAgICAgICAvLyBNYWtlIHN1cmUgd2UgaGF2ZSBhIHBvc2l0aW9uIHRvIHNldHVwIHRoZSBub2RlIHdpdGguXG4gICAgICAgICAgICAgIGlmICghc291bmQuX3Bvcykge1xuICAgICAgICAgICAgICAgIHNvdW5kLl9wb3MgPSBzZWxmLl9wb3MgfHwgWzAsIDAsIC0wLjVdO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgc2V0dXBQYW5uZXIoc291bmQsICdzcGF0aWFsJyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHNvdW5kLl9wYW5uZXIuc2V0T3JpZW50YXRpb24oeCwgeSwgeik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgc2VsZi5fZW1pdCgnb3JpZW50YXRpb24nLCBzb3VuZC5faWQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVybiBzb3VuZC5fb3JpZW50YXRpb247XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICAvKipcbiAgICogR2V0L3NldCB0aGUgcGFubmVyIG5vZGUncyBhdHRyaWJ1dGVzIGZvciBhIHNvdW5kIG9yIGdyb3VwIG9mIHNvdW5kcy5cbiAgICogVGhpcyBtZXRob2QgY2FuIG9wdGlvbmFsbCB0YWtlIDAsIDEgb3IgMiBhcmd1bWVudHMuXG4gICAqICAgcGFubmVyQXR0cigpIC0+IFJldHVybnMgdGhlIGdyb3VwJ3MgdmFsdWVzLlxuICAgKiAgIHBhbm5lckF0dHIoaWQpIC0+IFJldHVybnMgdGhlIHNvdW5kIGlkJ3MgdmFsdWVzLlxuICAgKiAgIHBhbm5lckF0dHIobykgLT4gU2V0J3MgdGhlIHZhbHVlcyBvZiBhbGwgc291bmRzIGluIHRoaXMgSG93bCBncm91cC5cbiAgICogICBwYW5uZXJBdHRyKG8sIGlkKSAtPiBTZXQncyB0aGUgdmFsdWVzIG9mIHBhc3NlZCBzb3VuZCBpZC5cbiAgICpcbiAgICogICBBdHRyaWJ1dGVzOlxuICAgKiAgICAgY29uZUlubmVyQW5nbGUgLSAoMzYwIGJ5IGRlZmF1bHQpIFRoZXJlIHdpbGwgYmUgbm8gdm9sdW1lIHJlZHVjdGlvbiBpbnNpZGUgdGhpcyBhbmdsZS5cbiAgICogICAgIGNvbmVPdXRlckFuZ2xlIC0gKDM2MCBieSBkZWZhdWx0KSBUaGUgdm9sdW1lIHdpbGwgYmUgcmVkdWNlZCB0byBhIGNvbnN0YW50IHZhbHVlIG9mXG4gICAqICAgICAgICAgICAgICAgICAgICAgIGBjb25lT3V0ZXJHYWluYCBvdXRzaWRlIHRoaXMgYW5nbGUuXG4gICAqICAgICBjb25lT3V0ZXJHYWluIC0gKDAgYnkgZGVmYXVsdCkgVGhlIGFtb3VudCBvZiB2b2x1bWUgcmVkdWN0aW9uIG91dHNpZGUgb2YgYGNvbmVPdXRlckFuZ2xlYC5cbiAgICogICAgIGRpc3RhbmNlTW9kZWwgLSAoJ2ludmVyc2UnIGJ5IGRlZmF1bHQpIERldGVybWluZXMgYWxnb3JpdGhtIHRvIHVzZSB0byByZWR1Y2Ugdm9sdW1lIGFzIGF1ZGlvIG1vdmVzXG4gICAqICAgICAgICAgICAgICAgICAgICAgIGF3YXkgZnJvbSBsaXN0ZW5lci4gQ2FuIGJlIGBsaW5lYXJgLCBgaW52ZXJzZWAgb3IgYGV4cG9uZW50aWFsYC5cbiAgICogICAgIG1heERpc3RhbmNlIC0gKDEwMDAwIGJ5IGRlZmF1bHQpIFZvbHVtZSB3b24ndCByZWR1Y2UgYmV0d2VlbiBzb3VyY2UvbGlzdGVuZXIgYmV5b25kIHRoaXMgZGlzdGFuY2UuXG4gICAqICAgICBwYW5uaW5nTW9kZWwgLSAoJ0hSVEYnIGJ5IGRlZmF1bHQpIERldGVybWluZXMgd2hpY2ggc3BhdGlhbGl6YXRpb24gYWxnb3JpdGhtIGlzIHVzZWQgdG8gcG9zaXRpb24gYXVkaW8uXG4gICAqICAgICAgICAgICAgICAgICAgICAgQ2FuIGJlIGBIUlRGYCBvciBgZXF1YWxwb3dlcmAuXG4gICAqICAgICByZWZEaXN0YW5jZSAtICgxIGJ5IGRlZmF1bHQpIEEgcmVmZXJlbmNlIGRpc3RhbmNlIGZvciByZWR1Y2luZyB2b2x1bWUgYXMgdGhlIHNvdXJjZVxuICAgKiAgICAgICAgICAgICAgICAgICAgbW92ZXMgYXdheSBmcm9tIHRoZSBsaXN0ZW5lci5cbiAgICogICAgIHJvbGxvZmZGYWN0b3IgLSAoMSBieSBkZWZhdWx0KSBIb3cgcXVpY2tseSB0aGUgdm9sdW1lIHJlZHVjZXMgYXMgc291cmNlIG1vdmVzIGZyb20gbGlzdGVuZXIuXG4gICAqIFxuICAgKiBAcmV0dXJuIHtIb3dsL09iamVjdH0gUmV0dXJucyBzZWxmIG9yIGN1cnJlbnQgcGFubmVyIGF0dHJpYnV0ZXMuXG4gICAqL1xuICBIb3dsLnByb3RvdHlwZS5wYW5uZXJBdHRyID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzO1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgIHZhciBvLCBpZCwgc291bmQ7XG5cbiAgICAvLyBTdG9wIHJpZ2h0IGhlcmUgaWYgbm90IHVzaW5nIFdlYiBBdWRpby5cbiAgICBpZiAoIXNlbGYuX3dlYkF1ZGlvKSB7XG4gICAgICByZXR1cm4gc2VsZjtcbiAgICB9XG5cbiAgICAvLyBEZXRlcm1pbmUgdGhlIHZhbHVlcyBiYXNlZCBvbiBhcmd1bWVudHMuXG4gICAgaWYgKGFyZ3MubGVuZ3RoID09PSAwKSB7XG4gICAgICAvLyBSZXR1cm4gdGhlIGdyb3VwJ3MgcGFubmVyIGF0dHJpYnV0ZSB2YWx1ZXMuXG4gICAgICByZXR1cm4gc2VsZi5fcGFubmVyQXR0cjtcbiAgICB9IGVsc2UgaWYgKGFyZ3MubGVuZ3RoID09PSAxKSB7XG4gICAgICBpZiAodHlwZW9mIGFyZ3NbMF0gPT09ICdvYmplY3QnKSB7XG4gICAgICAgIG8gPSBhcmdzWzBdO1xuXG4gICAgICAgIC8vIFNldCB0aGUgZ3JvdSdzIHBhbm5lciBhdHRyaWJ1dGUgdmFsdWVzLlxuICAgICAgICBpZiAodHlwZW9mIGlkID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHNlbGYuX3Bhbm5lckF0dHIgPSB7XG4gICAgICAgICAgICBjb25lSW5uZXJBbmdsZTogdHlwZW9mIG8uY29uZUlubmVyQW5nbGUgIT09ICd1bmRlZmluZWQnID8gby5jb25lSW5uZXJBbmdsZSA6IHNlbGYuX2NvbmVJbm5lckFuZ2xlLFxuICAgICAgICAgICAgY29uZU91dGVyQW5nbGU6IHR5cGVvZiBvLmNvbmVPdXRlckFuZ2xlICE9PSAndW5kZWZpbmVkJyA/IG8uY29uZU91dGVyQW5nbGUgOiBzZWxmLl9jb25lT3V0ZXJBbmdsZSxcbiAgICAgICAgICAgIGNvbmVPdXRlckdhaW46IHR5cGVvZiBvLmNvbmVPdXRlckdhaW4gIT09ICd1bmRlZmluZWQnID8gby5jb25lT3V0ZXJHYWluIDogc2VsZi5fY29uZU91dGVyR2FpbixcbiAgICAgICAgICAgIGRpc3RhbmNlTW9kZWw6IHR5cGVvZiBvLmRpc3RhbmNlTW9kZWwgIT09ICd1bmRlZmluZWQnID8gby5kaXN0YW5jZU1vZGVsIDogc2VsZi5fZGlzdGFuY2VNb2RlbCxcbiAgICAgICAgICAgIG1heERpc3RhbmNlOiB0eXBlb2Ygby5tYXhEaXN0YW5jZSAhPT0gJ3VuZGVmaW5lZCcgPyBvLm1heERpc3RhbmNlIDogc2VsZi5fbWF4RGlzdGFuY2UsXG4gICAgICAgICAgICBwYW5uaW5nTW9kZWw6IHR5cGVvZiBvLnBhbm5pbmdNb2RlbCAhPT0gJ3VuZGVmaW5lZCcgPyBvLnBhbm5pbmdNb2RlbCA6IHNlbGYuX3Bhbm5pbmdNb2RlbCxcbiAgICAgICAgICAgIHJlZkRpc3RhbmNlOiB0eXBlb2Ygby5yZWZEaXN0YW5jZSAhPT0gJ3VuZGVmaW5lZCcgPyBvLnJlZkRpc3RhbmNlIDogc2VsZi5fcmVmRGlzdGFuY2UsXG4gICAgICAgICAgICByb2xsb2ZmRmFjdG9yOiB0eXBlb2Ygby5yb2xsb2ZmRmFjdG9yICE9PSAndW5kZWZpbmVkJyA/IG8ucm9sbG9mZkZhY3RvciA6IHNlbGYuX3JvbGxvZmZGYWN0b3JcbiAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBSZXR1cm4gdGhpcyBzb3VuZCdzIHBhbm5lciBhdHRyaWJ1dGUgdmFsdWVzLlxuICAgICAgICBzb3VuZCA9IHNlbGYuX3NvdW5kQnlJZChwYXJzZUludChhcmdzWzBdLCAxMCkpO1xuICAgICAgICByZXR1cm4gc291bmQgPyBzb3VuZC5fcGFubmVyQXR0ciA6IHNlbGYuX3Bhbm5lckF0dHI7XG4gICAgICB9XG4gICAgfSBlbHNlIGlmIChhcmdzLmxlbmd0aCA9PT0gMikge1xuICAgICAgbyA9IGFyZ3NbMF07XG4gICAgICBpZCA9IHBhcnNlSW50KGFyZ3NbMV0sIDEwKTtcbiAgICB9XG5cbiAgICAvLyBVcGRhdGUgdGhlIHZhbHVlcyBvZiB0aGUgc3BlY2lmaWVkIHNvdW5kcy5cbiAgICB2YXIgaWRzID0gc2VsZi5fZ2V0U291bmRJZHMoaWQpO1xuICAgIGZvciAodmFyIGk9MDsgaTxpZHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIHNvdW5kID0gc2VsZi5fc291bmRCeUlkKGlkc1tpXSk7XG5cbiAgICAgIGlmIChzb3VuZCkge1xuICAgICAgICAvLyBNZXJnZSB0aGUgbmV3IHZhbHVlcyBpbnRvIHRoZSBzb3VuZC5cbiAgICAgICAgdmFyIHBhID0gc291bmQuX3Bhbm5lckF0dHI7XG4gICAgICAgIHBhID0ge1xuICAgICAgICAgIGNvbmVJbm5lckFuZ2xlOiB0eXBlb2Ygby5jb25lSW5uZXJBbmdsZSAhPT0gJ3VuZGVmaW5lZCcgPyBvLmNvbmVJbm5lckFuZ2xlIDogcGEuY29uZUlubmVyQW5nbGUsXG4gICAgICAgICAgY29uZU91dGVyQW5nbGU6IHR5cGVvZiBvLmNvbmVPdXRlckFuZ2xlICE9PSAndW5kZWZpbmVkJyA/IG8uY29uZU91dGVyQW5nbGUgOiBwYS5jb25lT3V0ZXJBbmdsZSxcbiAgICAgICAgICBjb25lT3V0ZXJHYWluOiB0eXBlb2Ygby5jb25lT3V0ZXJHYWluICE9PSAndW5kZWZpbmVkJyA/IG8uY29uZU91dGVyR2FpbiA6IHBhLmNvbmVPdXRlckdhaW4sXG4gICAgICAgICAgZGlzdGFuY2VNb2RlbDogdHlwZW9mIG8uZGlzdGFuY2VNb2RlbCAhPT0gJ3VuZGVmaW5lZCcgPyBvLmRpc3RhbmNlTW9kZWwgOiBwYS5kaXN0YW5jZU1vZGVsLFxuICAgICAgICAgIG1heERpc3RhbmNlOiB0eXBlb2Ygby5tYXhEaXN0YW5jZSAhPT0gJ3VuZGVmaW5lZCcgPyBvLm1heERpc3RhbmNlIDogcGEubWF4RGlzdGFuY2UsXG4gICAgICAgICAgcGFubmluZ01vZGVsOiB0eXBlb2Ygby5wYW5uaW5nTW9kZWwgIT09ICd1bmRlZmluZWQnID8gby5wYW5uaW5nTW9kZWwgOiBwYS5wYW5uaW5nTW9kZWwsXG4gICAgICAgICAgcmVmRGlzdGFuY2U6IHR5cGVvZiBvLnJlZkRpc3RhbmNlICE9PSAndW5kZWZpbmVkJyA/IG8ucmVmRGlzdGFuY2UgOiBwYS5yZWZEaXN0YW5jZSxcbiAgICAgICAgICByb2xsb2ZmRmFjdG9yOiB0eXBlb2Ygby5yb2xsb2ZmRmFjdG9yICE9PSAndW5kZWZpbmVkJyA/IG8ucm9sbG9mZkZhY3RvciA6IHBhLnJvbGxvZmZGYWN0b3JcbiAgICAgICAgfTtcblxuICAgICAgICAvLyBVcGRhdGUgdGhlIHBhbm5lciB2YWx1ZXMgb3IgY3JlYXRlIGEgbmV3IHBhbm5lciBpZiBub25lIGV4aXN0cy5cbiAgICAgICAgdmFyIHBhbm5lciA9IHNvdW5kLl9wYW5uZXI7XG4gICAgICAgIGlmIChwYW5uZXIpIHtcbiAgICAgICAgICBwYW5uZXIuY29uZUlubmVyQW5nbGUgPSBwYS5jb25lSW5uZXJBbmdsZTtcbiAgICAgICAgICBwYW5uZXIuY29uZU91dGVyQW5nbGUgPSBwYS5jb25lT3V0ZXJBbmdsZTtcbiAgICAgICAgICBwYW5uZXIuY29uZU91dGVyR2FpbiA9IHBhLmNvbmVPdXRlckdhaW47XG4gICAgICAgICAgcGFubmVyLmRpc3RhbmNlTW9kZWwgPSBwYS5kaXN0YW5jZU1vZGVsO1xuICAgICAgICAgIHBhbm5lci5tYXhEaXN0YW5jZSA9IHBhLm1heERpc3RhbmNlO1xuICAgICAgICAgIHBhbm5lci5wYW5uaW5nTW9kZWwgPSBwYS5wYW5uaW5nTW9kZWw7XG4gICAgICAgICAgcGFubmVyLnJlZkRpc3RhbmNlID0gcGEucmVmRGlzdGFuY2U7XG4gICAgICAgICAgcGFubmVyLnJvbGxvZmZGYWN0b3IgPSBwYS5yb2xsb2ZmRmFjdG9yO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIE1ha2Ugc3VyZSB3ZSBoYXZlIGEgcG9zaXRpb24gdG8gc2V0dXAgdGhlIG5vZGUgd2l0aC5cbiAgICAgICAgICBpZiAoIXNvdW5kLl9wb3MpIHtcbiAgICAgICAgICAgIHNvdW5kLl9wb3MgPSBzZWxmLl9wb3MgfHwgWzAsIDAsIC0wLjVdO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIC8vIENyZWF0ZSBhIG5ldyBwYW5uZXIgbm9kZS5cbiAgICAgICAgICBzZXR1cFBhbm5lcihzb3VuZCwgJ3NwYXRpYWwnKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBzZWxmO1xuICB9O1xuXG4gIC8qKiBTaW5nbGUgU291bmQgTWV0aG9kcyAqKi9cbiAgLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuICAvKipcbiAgICogQWRkIG5ldyBwcm9wZXJ0aWVzIHRvIHRoZSBjb3JlIFNvdW5kIGluaXQuXG4gICAqIEBwYXJhbSAge0Z1bmN0aW9ufSBfc3VwZXIgQ29yZSBTb3VuZCBpbml0IG1ldGhvZC5cbiAgICogQHJldHVybiB7U291bmR9XG4gICAqL1xuICBTb3VuZC5wcm90b3R5cGUuaW5pdCA9IChmdW5jdGlvbihfc3VwZXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICB2YXIgcGFyZW50ID0gc2VsZi5fcGFyZW50O1xuXG4gICAgICAvLyBTZXR1cCB1c2VyLWRlZmluZWQgZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICAgICAgc2VsZi5fb3JpZW50YXRpb24gPSBwYXJlbnQuX29yaWVudGF0aW9uO1xuICAgICAgc2VsZi5fc3RlcmVvID0gcGFyZW50Ll9zdGVyZW87XG4gICAgICBzZWxmLl9wb3MgPSBwYXJlbnQuX3BvcztcbiAgICAgIHNlbGYuX3Bhbm5lckF0dHIgPSBwYXJlbnQuX3Bhbm5lckF0dHI7XG5cbiAgICAgIC8vIENvbXBsZXRlIGluaXRpbGl6YXRpb24gd2l0aCBob3dsZXIuanMgY29yZSBTb3VuZCdzIGluaXQgZnVuY3Rpb24uXG4gICAgICBfc3VwZXIuY2FsbCh0aGlzKTtcblxuICAgICAgLy8gSWYgYSBzdGVyZW8gb3IgcG9zaXRpb24gd2FzIHNwZWNpZmllZCwgc2V0IGl0IHVwLlxuICAgICAgaWYgKHNlbGYuX3N0ZXJlbykge1xuICAgICAgICBwYXJlbnQuc3RlcmVvKHNlbGYuX3N0ZXJlbyk7XG4gICAgICB9IGVsc2UgaWYgKHNlbGYuX3Bvcykge1xuICAgICAgICBwYXJlbnQucG9zKHNlbGYuX3Bvc1swXSwgc2VsZi5fcG9zWzFdLCBzZWxmLl9wb3NbMl0sIHNlbGYuX2lkKTtcbiAgICAgIH1cbiAgICB9O1xuICB9KShTb3VuZC5wcm90b3R5cGUuaW5pdCk7XG5cbiAgLyoqXG4gICAqIE92ZXJyaWRlIHRoZSBTb3VuZC5yZXNldCBtZXRob2QgdG8gY2xlYW4gdXAgcHJvcGVydGllcyBmcm9tIHRoZSBzcGF0aWFsIHBsdWdpbi5cbiAgICogQHBhcmFtICB7RnVuY3Rpb259IF9zdXBlciBTb3VuZCByZXNldCBtZXRob2QuXG4gICAqIEByZXR1cm4ge1NvdW5kfVxuICAgKi9cbiAgU291bmQucHJvdG90eXBlLnJlc2V0ID0gKGZ1bmN0aW9uKF9zdXBlcikge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcztcbiAgICAgIHZhciBwYXJlbnQgPSBzZWxmLl9wYXJlbnQ7XG5cbiAgICAgIC8vIFJlc2V0IGFsbCBzcGF0aWFsIHBsdWdpbiBwcm9wZXJ0aWVzIG9uIHRoaXMgc291bmQuXG4gICAgICBzZWxmLl9vcmllbnRhdGlvbiA9IHBhcmVudC5fb3JpZW50YXRpb247XG4gICAgICBzZWxmLl9wb3MgPSBwYXJlbnQuX3BvcztcbiAgICAgIHNlbGYuX3Bhbm5lckF0dHIgPSBwYXJlbnQuX3Bhbm5lckF0dHI7XG5cbiAgICAgIC8vIENvbXBsZXRlIHJlc2V0dGluZyBvZiB0aGUgc291bmQuXG4gICAgICByZXR1cm4gX3N1cGVyLmNhbGwodGhpcyk7XG4gICAgfTtcbiAgfSkoU291bmQucHJvdG90eXBlLnJlc2V0KTtcblxuICAvKiogSGVscGVyIE1ldGhvZHMgKiovXG4gIC8qKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKiovXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBwYW5uZXIgbm9kZSBhbmQgc2F2ZSBpdCBvbiB0aGUgc291bmQuXG4gICAqIEBwYXJhbSAge1NvdW5kfSBzb3VuZCBTcGVjaWZpYyBzb3VuZCB0byBzZXR1cCBwYW5uaW5nIG9uLlxuICAgKiBAcGFyYW0ge1N0cmluZ30gdHlwZSBUeXBlIG9mIHBhbm5lciB0byBjcmVhdGU6ICdzdGVyZW8nIG9yICdzcGF0aWFsJy5cbiAgICovXG4gIHZhciBzZXR1cFBhbm5lciA9IGZ1bmN0aW9uKHNvdW5kLCB0eXBlKSB7XG4gICAgdHlwZSA9IHR5cGUgfHwgJ3NwYXRpYWwnO1xuXG4gICAgLy8gQ3JlYXRlIHRoZSBuZXcgcGFubmVyIG5vZGUuXG4gICAgaWYgKHR5cGUgPT09ICdzcGF0aWFsJykge1xuICAgICAgc291bmQuX3Bhbm5lciA9IEhvd2xlci5jdHguY3JlYXRlUGFubmVyKCk7XG4gICAgICBzb3VuZC5fcGFubmVyLmNvbmVJbm5lckFuZ2xlID0gc291bmQuX3Bhbm5lckF0dHIuY29uZUlubmVyQW5nbGU7XG4gICAgICBzb3VuZC5fcGFubmVyLmNvbmVPdXRlckFuZ2xlID0gc291bmQuX3Bhbm5lckF0dHIuY29uZU91dGVyQW5nbGU7XG4gICAgICBzb3VuZC5fcGFubmVyLmNvbmVPdXRlckdhaW4gPSBzb3VuZC5fcGFubmVyQXR0ci5jb25lT3V0ZXJHYWluO1xuICAgICAgc291bmQuX3Bhbm5lci5kaXN0YW5jZU1vZGVsID0gc291bmQuX3Bhbm5lckF0dHIuZGlzdGFuY2VNb2RlbDtcbiAgICAgIHNvdW5kLl9wYW5uZXIubWF4RGlzdGFuY2UgPSBzb3VuZC5fcGFubmVyQXR0ci5tYXhEaXN0YW5jZTtcbiAgICAgIHNvdW5kLl9wYW5uZXIucGFubmluZ01vZGVsID0gc291bmQuX3Bhbm5lckF0dHIucGFubmluZ01vZGVsO1xuICAgICAgc291bmQuX3Bhbm5lci5yZWZEaXN0YW5jZSA9IHNvdW5kLl9wYW5uZXJBdHRyLnJlZkRpc3RhbmNlO1xuICAgICAgc291bmQuX3Bhbm5lci5yb2xsb2ZmRmFjdG9yID0gc291bmQuX3Bhbm5lckF0dHIucm9sbG9mZkZhY3RvcjtcbiAgICAgIHNvdW5kLl9wYW5uZXIuc2V0UG9zaXRpb24oc291bmQuX3Bvc1swXSwgc291bmQuX3Bvc1sxXSwgc291bmQuX3Bvc1syXSk7XG4gICAgICBzb3VuZC5fcGFubmVyLnNldE9yaWVudGF0aW9uKHNvdW5kLl9vcmllbnRhdGlvblswXSwgc291bmQuX29yaWVudGF0aW9uWzFdLCBzb3VuZC5fb3JpZW50YXRpb25bMl0pO1xuICAgIH0gZWxzZSB7XG4gICAgICBzb3VuZC5fcGFubmVyID0gSG93bGVyLmN0eC5jcmVhdGVTdGVyZW9QYW5uZXIoKTtcbiAgICAgIHNvdW5kLl9wYW5uZXIucGFuLnZhbHVlID0gc291bmQuX3N0ZXJlbztcbiAgICB9XG5cbiAgICBzb3VuZC5fcGFubmVyLmNvbm5lY3Qoc291bmQuX25vZGUpO1xuXG4gICAgLy8gVXBkYXRlIHRoZSBjb25uZWN0aW9ucy5cbiAgICBpZiAoIXNvdW5kLl9wYXVzZWQpIHtcbiAgICAgIHNvdW5kLl9wYXJlbnQucGF1c2Uoc291bmQuX2lkLCB0cnVlKS5wbGF5KHNvdW5kLl9pZCk7XG4gICAgfVxuICB9O1xufSkoKTtcbiIsImNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJy4vLi4vLi4vY29uZmlnJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRDb2xvck5hbWUoY29sb3IpIHtcbiAgaWYgKGNvbG9yIGluIGNvbmZpZy5wYWxldHRlLmNvbG9yTmFtZXMpIHtcbiAgICByZXR1cm4gY29uZmlnLnBhbGV0dGUuY29sb3JOYW1lc1tjb2xvcl07XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cbiIsIihmdW5jdGlvbiAocm9vdCwgZmFjdG9yeSkge1xuXG5cdGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcblx0XHRkZWZpbmUoW10sIGZhY3RvcnkpO1xuXHR9XG5cdGVsc2UgaWYgKHR5cGVvZiBtb2R1bGUgIT09IFwidW5kZWZpbmVkXCIgJiYgbW9kdWxlLmV4cG9ydHMpIHtcblx0XHRtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoKTtcblx0fVxuXHRlbHNlIHtcblx0XHRyb290LlNoYXBlRGV0ZWN0b3IgPSBmYWN0b3J5KCk7XG5cdH1cbn0odGhpcywgZnVuY3Rpb24gKCkge1xuXG5cdHZhciBfbmJTYW1wbGVQb2ludHM7XG5cdHZhciBfc3F1YXJlU2l6ZSA9IDI1MDtcblx0dmFyIF9waGkgPSAwLjUgKiAoLTEuMCArIE1hdGguc3FydCg1LjApKTtcblx0dmFyIF9hbmdsZVJhbmdlID0gZGVnMlJhZCg0NS4wKTtcblx0dmFyIF9hbmdsZVByZWNpc2lvbiA9IGRlZzJSYWQoMi4wKTtcblx0dmFyIF9oYWxmRGlhZ29uYWwgPSBNYXRoLnNxcnQoX3NxdWFyZVNpemUgKiBfc3F1YXJlU2l6ZSArIF9zcXVhcmVTaXplICogX3NxdWFyZVNpemUpICogMC41O1xuXHR2YXIgX29yaWdpbiA9IHsgeDogMCwgeTogMCB9O1xuXG5cdGZ1bmN0aW9uIGRlZzJSYWQgKGQpIHtcblxuXHRcdHJldHVybiBkICogTWF0aC5QSSAvIDE4MC4wO1xuXHR9O1xuXG5cdGZ1bmN0aW9uIGdldERpc3RhbmNlIChhLCBiKSB7XG5cblx0XHR2YXIgZHggPSBiLnggLSBhLng7XG5cdFx0dmFyIGR5ID0gYi55IC0gYS55O1xuXG5cdFx0cmV0dXJuIE1hdGguc3FydChkeCAqIGR4ICsgZHkgKiBkeSk7XG5cdH07XG5cblx0ZnVuY3Rpb24gU3Ryb2tlIChwb2ludHMsIG5hbWUpIHtcblxuXHRcdHRoaXMucG9pbnRzID0gcG9pbnRzO1xuXHRcdHRoaXMubmFtZSA9IG5hbWU7XG5cdFx0dGhpcy5wcm9jZXNzU3Ryb2tlKCk7XG5cdH07XG5cblx0U3Ryb2tlLnByb3RvdHlwZS5wcm9jZXNzU3Ryb2tlID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0dGhpcy5wb2ludHMgPSB0aGlzLnJlc2FtcGxlKCk7XG5cdFx0dGhpcy5zZXRDZW50cm9pZCgpO1xuXHRcdHRoaXMucG9pbnRzID0gdGhpcy5yb3RhdGVCeSgtdGhpcy5pbmRpY2F0aXZlQW5nbGUoKSk7XG5cdFx0dGhpcy5wb2ludHMgPSB0aGlzLnNjYWxlVG9TcXVhcmUoKTtcblx0XHR0aGlzLnNldENlbnRyb2lkKCk7XG5cdFx0dGhpcy5wb2ludHMgPSB0aGlzLnRyYW5zbGF0ZVRvT3JpZ2luKCk7XG5cblx0XHRyZXR1cm4gdGhpcztcblx0fTtcblxuXHRTdHJva2UucHJvdG90eXBlLnJlc2FtcGxlID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIGxvY2FsRGlzdGFuY2UsIHE7XG5cdFx0dmFyIGludGVydmFsID0gdGhpcy5zdHJva2VMZW5ndGgoKSAvIChfbmJTYW1wbGVQb2ludHMgLSAxKTtcblx0XHR2YXIgZGlzdGFuY2UgPSAwLjA7XG5cdFx0dmFyIG5ld1BvaW50cyA9IFt0aGlzLnBvaW50c1swXV07XG5cblx0XHRmb3IgKHZhciBpID0gMTsgaSA8IHRoaXMucG9pbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRsb2NhbERpc3RhbmNlID0gZ2V0RGlzdGFuY2UodGhpcy5wb2ludHNbaSAtIDFdLCB0aGlzLnBvaW50c1tpXSk7XG5cblx0XHRcdGlmIChkaXN0YW5jZSArIGxvY2FsRGlzdGFuY2UgPj0gaW50ZXJ2YWwpIHtcblx0XHRcdFx0cSA9IHtcblx0XHRcdFx0XHR4OiB0aGlzLnBvaW50c1tpIC0gMV0ueCArICgoaW50ZXJ2YWwgLSBkaXN0YW5jZSkgLyBsb2NhbERpc3RhbmNlKSAqICh0aGlzLnBvaW50c1tpXS54IC0gdGhpcy5wb2ludHNbaSAtIDFdLngpLFxuXHRcdFx0XHRcdHk6IHRoaXMucG9pbnRzW2kgLSAxXS55ICsgKChpbnRlcnZhbCAtIGRpc3RhbmNlKSAvIGxvY2FsRGlzdGFuY2UpICogKHRoaXMucG9pbnRzW2ldLnkgLSB0aGlzLnBvaW50c1tpIC0gMV0ueSlcblx0XHRcdFx0fTtcblxuXHRcdFx0XHRuZXdQb2ludHMucHVzaChxKTtcblx0XHRcdFx0dGhpcy5wb2ludHMuc3BsaWNlKGksIDAsIHEpO1xuXHRcdFx0XHRkaXN0YW5jZSA9IDAuMDtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRkaXN0YW5jZSArPSBsb2NhbERpc3RhbmNlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGlmIChuZXdQb2ludHMubGVuZ3RoID09PSBfbmJTYW1wbGVQb2ludHMgLSAxKSB7XG5cdFx0XHRuZXdQb2ludHMucHVzaCh0aGlzLnBvaW50c1t0aGlzLnBvaW50cy5sZW5ndGggLSAxXSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ld1BvaW50cztcblx0fTtcblxuXHRTdHJva2UucHJvdG90eXBlLnJvdGF0ZUJ5ID0gZnVuY3Rpb24gKGFuZ2xlKSB7XG5cblx0XHR2YXIgcG9pbnQ7XG5cdFx0dmFyIGNvcyA9IE1hdGguY29zKGFuZ2xlKTtcblx0XHR2YXIgc2luID0gTWF0aC5zaW4oYW5nbGUpO1xuXHRcdHZhciBuZXdQb2ludHMgPSBbXTtcblxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5wb2ludHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdHBvaW50ID0gdGhpcy5wb2ludHNbaV07XG5cblx0XHRcdG5ld1BvaW50cy5wdXNoKHtcblx0XHRcdFx0eDogKHBvaW50LnggLSB0aGlzLmMueCkgKiBjb3MgLSAocG9pbnQueSAtIHRoaXMuYy55KSAqIHNpbiArIHRoaXMuYy54LFxuXHRcdFx0XHR5OiAocG9pbnQueCAtIHRoaXMuYy54KSAqIHNpbiArIChwb2ludC55IC0gdGhpcy5jLnkpICogY29zICsgdGhpcy5jLnlcblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBuZXdQb2ludHM7XG5cdH07XG5cblx0U3Ryb2tlLnByb3RvdHlwZS5zY2FsZVRvU3F1YXJlID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIHBvaW50O1xuXHRcdHZhciBuZXdQb2ludHMgPSBbXVxuXHRcdHZhciBib3ggPSB7XG5cdFx0XHRtaW5YOiArSW5maW5pdHksXG5cdFx0XHRtYXhYOiAtSW5maW5pdHksXG5cdFx0XHRtaW5ZOiArSW5maW5pdHksXG5cdFx0XHRtYXhZOiAtSW5maW5pdHlcblx0XHR9O1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBvaW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cG9pbnQgPSB0aGlzLnBvaW50c1tpXTtcblxuXHRcdFx0Ym94Lm1pblggPSBNYXRoLm1pbihib3gubWluWCwgcG9pbnQueCk7XG5cdFx0XHRib3gubWluWSA9IE1hdGgubWluKGJveC5taW5ZLCBwb2ludC55KTtcblx0XHRcdGJveC5tYXhYID0gTWF0aC5tYXgoYm94Lm1heFgsIHBvaW50LngpO1xuXHRcdFx0Ym94Lm1heFkgPSBNYXRoLm1heChib3gubWF4WSwgcG9pbnQueSk7XG5cdFx0fVxuXG5cdFx0Ym94LndpZHRoID0gYm94Lm1heFggLSBib3gubWluWDtcblx0XHRib3guaGVpZ2h0ID0gYm94Lm1heFkgLSBib3gubWluWTtcblxuXHRcdGZvciAoaSA9IDA7IGkgPCB0aGlzLnBvaW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cG9pbnQgPSB0aGlzLnBvaW50c1tpXTtcblxuXHRcdFx0bmV3UG9pbnRzLnB1c2goe1xuXHRcdFx0XHR4OiBwb2ludC54ICogKF9zcXVhcmVTaXplIC8gYm94LndpZHRoKSxcblx0XHRcdFx0eTogcG9pbnQueSAqIChfc3F1YXJlU2l6ZSAvIGJveC5oZWlnaHQpXG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHRyZXR1cm4gbmV3UG9pbnRzO1xuXHR9O1xuXG5cdFN0cm9rZS5wcm90b3R5cGUudHJhbnNsYXRlVG9PcmlnaW4gPSBmdW5jdGlvbiAocG9pbnRzKSB7XG5cblx0XHR2YXIgcG9pbnQ7XG5cdFx0dmFyIG5ld1BvaW50cyA9IFtdO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBvaW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0cG9pbnQgPSB0aGlzLnBvaW50c1tpXTtcblxuXHRcdFx0bmV3UG9pbnRzLnB1c2goe1xuXHRcdFx0XHR4OiBwb2ludC54ICsgX29yaWdpbi54IC0gdGhpcy5jLngsXG5cdFx0XHRcdHk6IHBvaW50LnkgKyBfb3JpZ2luLnkgLSB0aGlzLmMueVxuXHRcdFx0fSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIG5ld1BvaW50cztcblx0fTtcblxuXHRTdHJva2UucHJvdG90eXBlLnNldENlbnRyb2lkID0gZnVuY3Rpb24gKCkge1xuXG5cdFx0dmFyIHBvaW50O1xuXHRcdHRoaXMuYyA9IHtcblx0XHRcdHg6IDAuMCxcblx0XHRcdHk6IDAuMFxuXHRcdH07XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMucG9pbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRwb2ludCA9IHRoaXMucG9pbnRzW2ldO1xuXG5cdFx0XHR0aGlzLmMueCArPSBwb2ludC54O1xuXHRcdFx0dGhpcy5jLnkgKz0gcG9pbnQueTtcblx0XHR9XG5cblx0XHR0aGlzLmMueCAvPSB0aGlzLnBvaW50cy5sZW5ndGg7XG5cdFx0dGhpcy5jLnkgLz0gdGhpcy5wb2ludHMubGVuZ3RoO1xuXG5cdFx0cmV0dXJuIHRoaXM7XG5cdH07XG5cblx0U3Ryb2tlLnByb3RvdHlwZS5pbmRpY2F0aXZlQW5nbGUgPSBmdW5jdGlvbiAoKSB7XG5cblx0XHRyZXR1cm4gTWF0aC5hdGFuMih0aGlzLmMueSAtIHRoaXMucG9pbnRzWzBdLnksIHRoaXMuYy54IC0gdGhpcy5wb2ludHNbMF0ueCk7XG5cdH07XG5cblx0U3Ryb2tlLnByb3RvdHlwZS5zdHJva2VMZW5ndGggPSBmdW5jdGlvbiAoKSB7XG5cblx0XHR2YXIgZCA9IDAuMDtcblxuXHRcdGZvciAodmFyIGkgPSAxOyBpIDwgdGhpcy5wb2ludHMubGVuZ3RoOyBpKyspIHtcblx0XHRcdGQgKz0gZ2V0RGlzdGFuY2UodGhpcy5wb2ludHNbaSAtIDFdLCB0aGlzLnBvaW50c1tpXSk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIGQ7XG5cdH07XG5cblx0U3Ryb2tlLnByb3RvdHlwZS5kaXN0YW5jZUF0QmVzdEFuZ2xlID0gZnVuY3Rpb24gKHBhdHRlcm4pIHtcblxuXHRcdHZhciBhID0gLV9hbmdsZVJhbmdlO1xuXHRcdHZhciBiID0gX2FuZ2xlUmFuZ2U7XG5cdFx0dmFyIHgxID0gX3BoaSAqIGEgKyAoMS4wIC0gX3BoaSkgKiBiO1xuXHRcdHZhciBmMSA9IHRoaXMuZGlzdGFuY2VBdEFuZ2xlKHBhdHRlcm4sIHgxKTtcblx0XHR2YXIgeDIgPSAoMS4wIC0gX3BoaSkgKiBhICsgX3BoaSAqIGI7XG5cdFx0dmFyIGYyID0gdGhpcy5kaXN0YW5jZUF0QW5nbGUocGF0dGVybiwgeDIpO1xuXG5cdFx0d2hpbGUgKE1hdGguYWJzKGIgLSBhKSA+IF9hbmdsZVByZWNpc2lvbikge1xuXG5cdFx0XHRpZiAoZjEgPCBmMikge1xuXHRcdFx0XHRiID0geDI7XG5cdFx0XHRcdHgyID0geDE7XG5cdFx0XHRcdGYyID0gZjE7XG5cdFx0XHRcdHgxID0gX3BoaSAqIGEgKyAoMS4wIC0gX3BoaSkgKiBiO1xuXHRcdFx0XHRmMSA9IHRoaXMuZGlzdGFuY2VBdEFuZ2xlKHBhdHRlcm4sIHgxKTtcblx0XHRcdH1cblx0XHRcdGVsc2Uge1xuXHRcdFx0XHRhID0geDE7XG5cdFx0XHRcdHgxID0geDI7XG5cdFx0XHRcdGYxID0gZjI7XG5cdFx0XHRcdHgyID0gKDEuMCAtIF9waGkpICogYSArIF9waGkgKiBiO1xuXHRcdFx0XHRmMiA9IHRoaXMuZGlzdGFuY2VBdEFuZ2xlKHBhdHRlcm4sIHgyKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4gTWF0aC5taW4oZjEsIGYyKTtcblx0fTtcblxuXHRTdHJva2UucHJvdG90eXBlLmRpc3RhbmNlQXRBbmdsZSA9IGZ1bmN0aW9uIChwYXR0ZXJuLCBhbmdsZSkge1xuXG5cdFx0dmFyIHN0cm9rZVBvaW50cyA9IHRoaXMucm90YXRlQnkoYW5nbGUpO1xuXHRcdHZhciBwYXR0ZXJuUG9pbnRzID0gcGF0dGVybi5wb2ludHM7XG5cdFx0dmFyIGQgPSAwLjA7XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHN0cm9rZVBvaW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0ZCArPSBnZXREaXN0YW5jZShzdHJva2VQb2ludHNbaV0sIHBhdHRlcm5Qb2ludHNbaV0pO1xuXHRcdH1cblxuXHRcdHJldHVybiBkIC8gc3Ryb2tlUG9pbnRzLmxlbmd0aDtcblx0fTtcblxuXHRmdW5jdGlvbiBTaGFwZURldGVjdG9yIChwYXR0ZXJucywgb3B0aW9ucykge1xuXG5cdFx0b3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cdFx0dGhpcy50aHJlc2hvbGQgPSBvcHRpb25zLnRocmVzaG9sZCB8fCAwO1xuXHRcdF9uYlNhbXBsZVBvaW50cyA9IG9wdGlvbnMubmJTYW1wbGVQb2ludHMgfHwgNjQ7XG5cblx0XHR0aGlzLnBhdHRlcm5zID0gW107XG5cblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IHBhdHRlcm5zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR0aGlzLmxlYXJuKHBhdHRlcm5zW2ldLm5hbWUsIHBhdHRlcm5zW2ldLnBvaW50cyk7XG5cdFx0fVxuXHR9XG5cblx0U2hhcGVEZXRlY3Rvci5kZWZhdWx0U2hhcGVzID0gW1xuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDo0NywgeSA6NTUgfSwgeyB4OjE1NiwgeSA6NTUgfV0sXG5cdFx0XHRuYW1lOiBcImxpbmVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OjU3LCB5IDoxNTggfSwgeyB4OjE0OCwgeSA6NzUgfSwgeyB4OjIwNywgeSA6MjkgfV0sXG5cdFx0XHRuYW1lOiBcImxpbmVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OjIyLCB5IDozOCB9LCB7IHg6NjAsIHkgOjU1IH0sIHsgeDoxMTksIHkgOjg3IH0sIHsgeDoxODYsIHkgOjEyNSB9LCB7IHg6MjU5LCB5IDoxNTggfSwgeyB4OjI3MSwgeSA6MTYxIH0sIHsgeDoyNzcsIHkgOjE2NiB9LCB7IHg6Mjk1LCB5IDoxNzIgfV0sXG5cdFx0XHRuYW1lOiBcImxpbmVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OjE1NCwgeSA6NDIgfSwgeyB4OjE1NywgeSA6MTUwIH0sIHsgeDoxNjAsIHkgOjI0MCB9LCB7IHg6MTY4LCB5IDozMjUgfSwgeyB4OjE3MSwgeSA6MzM5IH1dLFxuXHRcdFx0bmFtZTogXCJsaW5lXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDo5LCB5IDo5NSB9LCB7IHg6MjMsIHkgOjY2IH0sIHsgeDo1NywgeSA6NDEgfSwgeyB4OjgzLCB5IDo0OCB9LCB7IHg6MTE2LCB5IDo4MSB9LCB7IHg6MTc0LCB5IDoxMDIgfSwgeyB4OjI1NiwgeSA6NDUgfSwgeyB4OjMxMiwgeSA6MTggfSwgeyB4OjM3MSwgeSA6NzQgfSwgeyB4OjM4MiwgeSA6OTggfSwgeyB4OjM4OCwgeSA6MTA4IH1dLFxuXHRcdFx0bmFtZTogXCJsaW5lXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDoxNTEsIHkgOjcgfSwgeyB4OjE0MSwgeSA6MTcgfSwgeyB4OjEyMSwgeSA6NTAgfSwgeyB4OjE0OSwgeSA6NjkgfSwgeyB4OjE3MCwgeSA6OTIgfSwgeyB4OjE5OCwgeSA6MTcyIH0sIHsgeDoxOTEsIHkgOjIzNyB9LCB7IHg6MTcwLCB5IDoyODcgfSwgeyB4OjE3MywgeSA6MzA2IH0sIHsgeDoyMjksIHkgOjM2MyB9LCB7IHg6MjU5LCB5IDozODggfV0sXG5cdFx0XHRuYW1lOiBcImxpbmVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OjcxLCB5IDoyNzkgfSwgeyB4OjIyMCwgeSA6Mjc5IH0sIHsgeDoyOTAsIHkgOjI3MyB9LCB7IHg6NDI0LCB5IDoyNjkgfSwgeyB4OjU5MywgeSA6MjY5IH0sIHsgeDo2ODksIHkgOjI2NCB9LCB7IHg6NzYzLCB5IDoyNDAgfSwgeyB4Ojg3MywgeSA6MjI4IH0sIHsgeDo5MDEsIHkgOjIzMSB9LCB7IHg6OTEyLCB5IDoyMzMgfSwgeyB4OjkxOCwgeSA6MjI3IH1dLFxuXHRcdFx0bmFtZTogXCJsaW5lXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDo1NjUsIHkgOjkxIH0sIHsgeDo1NjUsIHkgOjUwMSB9XSxcblx0XHRcdG5hbWU6IFwibGluZVwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwb2ludHM6IFt7IHg6MTMxLCB5IDo3OSB9LCB7IHg6MTMxLCB5IDozODMgfV0sXG5cdFx0XHRuYW1lOiBcImxpbmVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE1Ny42OTY4Nzg0MzMyMjc0OCwgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiAxOTIuNzQwNjI5MTk2MTY2OSwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDIyNy43ODQzNzk5NTkxMDYzNiwgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiAyNjIuODI4MTMwNzIyMDQ1OCwgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI5Ny44NzE4ODE0ODQ5ODUyNCwgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDMzMi45MTU2MzIyNDc5MjQ3LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiAzNjcuOTU5MzgzMDEwODY0MTQsIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDQwMy4wMDMxMzM3NzM4MDM1NCwgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3fV0sXG5cdFx0XHRuYW1lOiBcInRyaWFuZ2xlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI5Ny44NzE4ODE0ODQ5ODUyNCwgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDMzMi45MTU2MzIyNDc5MjQ3LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiAzNjcuOTU5MzgzMDEwODY0MTQsIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDQwMy4wMDMxMzM3NzM4MDM1NCwgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNTcuNjk2ODc4NDMzMjI3NDgsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogMTkyLjc0MDYyOTE5NjE2NjksIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiAyMjcuNzg0Mzc5OTU5MTA2MzYsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogMjYyLjgyODEzMDcyMjA0NTgsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3Nn1dLFxuXHRcdFx0bmFtZTogXCJ0cmlhbmdsZVwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwb2ludHM6ICBbeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzE1LjM5Mzc1Njg2NjQ1NDk2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTU3LjY5Njg3ODQzMzIyNzQ4LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDE5Mi43NDA2MjkxOTYxNjY5LCB5OiAzMTUuMzkzNzU2ODY2NDU0OTYgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMjI3Ljc4NDM3OTk1OTEwNjM2LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDI2Mi44MjgxMzA3MjIwNDU4LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjk3Ljg3MTg4MTQ4NDk4NTI0LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogMzMyLjkxNTYzMjI0NzkyNDcsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDM2Ny45NTkzODMwMTA4NjQxNCwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogNDAzLjAwMzEzMzc3MzgwMzU0LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3fV0sXG5cdFx0XHRuYW1lOiBcInRyaWFuZ2xlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQwMy4wMDMxMzM3NzM4MDM1NCwgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiAzNjcuOTU5MzgzMDEwODY0MSwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMzMyLjkxNTYzMjI0NzkyNDcsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogMjk3Ljg3MTg4MTQ4NDk4NTI0LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjYyLjgyODEzMDcyMjA0NTgsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiAyMjcuNzg0Mzc5OTU5MTA2MzYsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiAxOTIuNzQwNjI5MTk2MTY2OSwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogMTU3LjY5Njg3ODQzMzIyNzQ4LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3fV0sXG5cdFx0XHRuYW1lOiBcInRyaWFuZ2xlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiA0MDMuMDAzMTMzNzczODAzNTQsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogMzY3Ljk1OTM4MzAxMDg2NDEsIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDMzMi45MTU2MzIyNDc5MjQ3LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDI5Ny44NzE4ODE0ODQ5ODUyNCwgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI2Mi44MjgxMzA3MjIwNDU4LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogMjI3Ljc4NDM3OTk1OTEwNjM2LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMTkyLjc0MDYyOTE5NjE2NjksIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDE1Ny42OTY4Nzg0MzMyMjc0OCwgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzE1LjM5Mzc1Njg2NjQ1NDk2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3fV0sXG5cdFx0XHRuYW1lOiBcInRyaWFuZ2xlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI2Mi44MjgxMzA3MjIwNDU4LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogMjI3Ljc4NDM3OTk1OTEwNjM2LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMTkyLjc0MDYyOTE5NjE2NjksIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDE1Ny42OTY4Nzg0MzMyMjc0OCwgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzE1LjM5Mzc1Njg2NjQ1NDk2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiA0MDMuMDAzMTMzNzczODAzNTQsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogMzY3Ljk1OTM4MzAxMDg2NDEsIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDMzMi45MTU2MzIyNDc5MjQ3LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDI5Ny44NzE4ODE0ODQ5ODUyNCwgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2fV0sXG5cdFx0XHRuYW1lOiBcInRyaWFuZ2xlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzZ9XSxcblx0XHRcdG5hbWU6IFwic3F1YXJlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzE1LjM5Mzc1Njg2NjQ1NDk2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzZ9XSxcblx0XHRcdG5hbWU6IFwic3F1YXJlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogIFt7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzMTUuMzkzNzU2ODY2NDU0OTYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3fV0sXG5cdFx0XHRuYW1lOiBcInNxdWFyZVwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwb2ludHM6IFt7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3fV0sXG5cdFx0XHRuYW1lOiBcInNxdWFyZVwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwb2ludHM6ICBbeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDQyMC41MjUwMDkxNTUyNzMyN31dLFxuXHRcdFx0bmFtZTogXCJzcXVhcmVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiAgW3sgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzE1LjM5Mzc1Njg2NjQ1NDk2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyNDUuMzA2MjU1MzQwNTc2MDYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzMTUuMzkzNzU2ODY2NDU0OTYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyNDUuMzA2MjU1MzQwNTc2MDYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzMTUuMzkzNzU2ODY2NDU0OTYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjd9XSxcblx0XHRcdG5hbWU6IFwic3F1YXJlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMTc1LjIxODc1MzgxNDY5NzIgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2MyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzg1LjQ4MTI1ODM5MjMzMzggfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMTc1LjIxODc1MzgxNDY5NzIsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2MywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjQ1LjMwNjI1NTM0MDU3NjA2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzE1LjM5Mzc1Njg2NjQ1NDk2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzg1LjQ4MTI1ODM5MjMzMzgsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzE1LjM5Mzc1Njg2NjQ1NDk2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjQ1LjMwNjI1NTM0MDU3NjA2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzZ9XSxcblx0XHRcdG5hbWU6IFwic3F1YXJlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDE3NS4yMTg3NTM4MTQ2OTcyIH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjMgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDM4NS40ODEyNTgzOTIzMzM4IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDE3NS4yMTg3NTM4MTQ2OTcyLCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjMsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDM4NS40ODEyNTgzOTIzMzM4LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAzODUuNDgxMjU4MzkyMzMzOCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDMxNS4zOTM3NTY4NjY0NTQ5NiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI0NS4zMDYyNTUzNDA1NzYwNiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjEwLjI2MjUwNDU3NzYzNjYzIH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNzUuMjE4NzUzODE0Njk3MiB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzODUuNDgxMjU4MzkyMzMzOCwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDMxNS4zOTM3NTY4NjY0NTQ5NiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI0NS4zMDYyNTUzNDA1NzYwNiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYzLCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAxNzUuMjE4NzUzODE0Njk3MiwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzZ9XSxcblx0XHRcdG5hbWU6IFwic3F1YXJlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDQxOC4zOTU0MzU4ODczOTY1LCB5OiAzMDQuNjkxMTM5OTM3OTA5NjcgfSwgeyB4OiA0MTIuMDcxNDIyMDg5ODk0NDQsIHk6IDMyOC4yOTI2ODA3Mzc5NTM3MyB9LCB7IHg6IDQwMS43NDUxMTk3MjE4OTg5NiwgeTogMzUwLjQzNzUwNzYyOTM5NDM2IH0sIHsgeDogMzg3LjczMDI4ODI1NTUwMDM0LCB5OiAzNzAuNDUyNzYxMjUyOTU4MiB9LCB7IHg6IDM3MC40NTI3NjEyNTI5NTgyLCB5OiAzODcuNzMwMjg4MjU1NTAwMzQgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogNDAxLjc0NTExOTcyMTg5ODk2IH0sIHsgeDogMzI4LjI5MjY4MDczNzk1MzgsIHk6IDQxMi4wNzE0MjIwODk4OTQ0NCB9LCB7IHg6IDMwNC42OTExMzk5Mzc5MDk2NywgeTogNDE4LjM5NTQzNTg4NzM5NjUgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMjU2LjAwODg3MjI2OTEyMTQsIHk6IDQxOC4zOTU0MzU4ODczOTY1IH0sIHsgeDogMjMyLjQwNzMzMTQ2OTA3NzMsIHk6IDQxMi4wNzE0MjIwODk4OTQ0NCB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2NiwgeTogNDAxLjc0NTExOTcyMTg5ODk2IH0sIHsgeDogMTkwLjI0NzI1MDk1NDA3MjgsIHk6IDM4Ny43MzAyODgyNTU1MDAzNCB9LCB7IHg6IDE3Mi45Njk3MjM5NTE1MzA3LCB5OiAzNzAuNDUyNzYxMjUyOTU4MiB9LCB7IHg6IDE1OC45NTQ4OTI0ODUxMzIwNiwgeTogMzUwLjQzNzUwNzYyOTM5NDM2IH0sIHsgeDogMTQ4LjYyODU5MDExNzEzNjU4LCB5OiAzMjguMjkyNjgwNzM3OTUzOCB9LCB7IHg6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSwgeTogMzA0LjY5MTEzOTkzNzkwOTYgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMTQyLjMwNDU3NjMxOTYzNDU1LCB5OiAyNTYuMDA4ODcyMjY5MTIxMzUgfSwgeyB4OiAxNDguNjI4NTkwMTE3MTM2NTUsIHk6IDIzMi40MDczMzE0NjkwNzczIH0sIHsgeDogMTU4Ljk1NDg5MjQ4NTEzMjEsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2IH0sIHsgeDogMTcyLjk2OTcyMzk1MTUzMDY4LCB5OiAxOTAuMjQ3MjUwOTU0MDcyOCB9LCB7IHg6IDE5MC4yNDcyNTA5NTQwNzI3NywgeTogMTcyLjk2OTcyMzk1MTUzMDcgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NTgsIHk6IDE1OC45NTQ4OTI0ODUxMzIxMiB9LCB7IHg6IDIzMi40MDczMzE0NjkwNzcxOCwgeTogMTQ4LjYyODU5MDExNzEzNjU4IH0sIHsgeDogMjU2LjAwODg3MjI2OTEyMTM1LCB5OiAxNDIuMzA0NTc2MzE5NjM0NTUgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzA0LjY5MTEzOTkzNzkwOTYsIHk6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSB9LCB7IHg6IDMyOC4yOTI2ODA3Mzc5NTM3LCB5OiAxNDguNjI4NTkwMTE3MTM2NTMgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogMTU4Ljk1NDg5MjQ4NTEzMjEgfSwgeyB4OiAzNzAuNDUyNzYxMjUyOTU4MiwgeTogMTcyLjk2OTcyMzk1MTUzMDY4IH0sIHsgeDogMzg3LjczMDI4ODI1NTUwMDM0LCB5OiAxOTAuMjQ3MjUwOTU0MDcyNzQgfSwgeyB4OiA0MDEuNzQ1MTE5NzIxODk4OSwgeTogMjEwLjI2MjUwNDU3NzYzNjU4IH0sIHsgeDogNDEyLjA3MTQyMjA4OTg5NDQ0LCB5OiAyMzIuNDA3MzMxNDY5MDc3MyB9LCB7IHg6IDQxOC4zOTU0MzU4ODczOTY0NSwgeTogMjU2LjAwODg3MjI2OTEyMTI0IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyODAuMzUwMDA2MTAzNTE1NDV9XSxcblx0XHRcdG5hbWU6IFwiY2lyY2xlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDQxOC4zOTU0MzU4ODczOTY1LCB5OiAyNTYuMDA4ODcyMjY5MTIxMzUgfSwgeyB4OiA0MTIuMDcxNDIyMDg5ODk0NDQsIHk6IDIzMi40MDczMzE0NjkwNzczIH0sIHsgeDogNDAxLjc0NTExOTcyMTg5ODk2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjYgfSwgeyB4OiAzODcuNzMwMjg4MjU1NTAwMzQsIHk6IDE5MC4yNDcyNTA5NTQwNzI4IH0sIHsgeDogMzcwLjQ1Mjc2MTI1Mjk1ODIsIHk6IDE3Mi45Njk3MjM5NTE1MzA2OCB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiAxNTguOTU0ODkyNDg1MTMyMSB9LCB7IHg6IDMyOC4yOTI2ODA3Mzc5NTM4LCB5OiAxNDguNjI4NTkwMTE3MTM2NTggfSwgeyB4OiAzMDQuNjkxMTM5OTM3OTA5NjcsIHk6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyNTYuMDA4ODcyMjY5MTIxNCwgeTogMTQyLjMwNDU3NjMxOTYzNDU1IH0sIHsgeDogMjMyLjQwNzMzMTQ2OTA3NzMsIHk6IDE0OC42Mjg1OTAxMTcxMzY1NSB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2NiwgeTogMTU4Ljk1NDg5MjQ4NTEzMjA2IH0sIHsgeDogMTkwLjI0NzI1MDk1NDA3MjgsIHk6IDE3Mi45Njk3MjM5NTE1MzA2OCB9LCB7IHg6IDE3Mi45Njk3MjM5NTE1MzA3LCB5OiAxOTAuMjQ3MjUwOTU0MDcyNzcgfSwgeyB4OiAxNTguOTU0ODkyNDg1MTMyMDYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2NiB9LCB7IHg6IDE0OC42Mjg1OTAxMTcxMzY1OCwgeTogMjMyLjQwNzMzMTQ2OTA3NzIzIH0sIHsgeDogMTQyLjMwNDU3NjMxOTYzNDU1LCB5OiAyNTYuMDA4ODcyMjY5MTIxNCB9LCB7IHg6IDE0MC4xNzUwMDMwNTE3NTc3NiwgeTogMjgwLjM1MDAwNjEwMzUxNTUgfSwgeyB4OiAxNDIuMzA0NTc2MzE5NjM0NTUsIHk6IDMwNC42OTExMzk5Mzc5MDk2NyB9LCB7IHg6IDE0OC42Mjg1OTAxMTcxMzY1NSwgeTogMzI4LjI5MjY4MDczNzk1MzczIH0sIHsgeDogMTU4Ljk1NDg5MjQ4NTEzMjEsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogMTcyLjk2OTcyMzk1MTUzMDY4LCB5OiAzNzAuNDUyNzYxMjUyOTU4MiB9LCB7IHg6IDE5MC4yNDcyNTA5NTQwNzI3NywgeTogMzg3LjczMDI4ODI1NTUwMDM0IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjU4LCB5OiA0MDEuNzQ1MTE5NzIxODk4OSB9LCB7IHg6IDIzMi40MDczMzE0NjkwNzcxOCwgeTogNDEyLjA3MTQyMjA4OTg5NDQ0IH0sIHsgeDogMjU2LjAwODg3MjI2OTEyMTM1LCB5OiA0MTguMzk1NDM1ODg3Mzk2NSB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzMDQuNjkxMTM5OTM3OTA5NiwgeTogNDE4LjM5NTQzNTg4NzM5NjUgfSwgeyB4OiAzMjguMjkyNjgwNzM3OTUzNywgeTogNDEyLjA3MTQyMjA4OTg5NDUgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogNDAxLjc0NTExOTcyMTg5ODk2IH0sIHsgeDogMzcwLjQ1Mjc2MTI1Mjk1ODIsIHk6IDM4Ny43MzAyODgyNTU1MDAzNCB9LCB7IHg6IDM4Ny43MzAyODgyNTU1MDAzNCwgeTogMzcwLjQ1Mjc2MTI1Mjk1ODMgfSwgeyB4OiA0MDEuNzQ1MTE5NzIxODk4OSwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiA0MTIuMDcxNDIyMDg5ODk0NDQsIHk6IDMyOC4yOTI2ODA3Mzc5NTM3MyB9LCB7IHg6IDQxOC4zOTU0MzU4ODczOTY0NSwgeTogMzA0LjY5MTEzOTkzNzkwOTggfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI4MC4zNTAwMDYxMDM1MTU1N31dLFxuXHRcdFx0bmFtZTogXCJjaXJjbGVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogMTQyLjMwNDU3NjMxOTYzNDU1LCB5OiAyNTYuMDA4ODcyMjY5MTIxMzUgfSwgeyB4OiAxNDguNjI4NTkwMTE3MTM2NTUsIHk6IDIzMi40MDczMzE0NjkwNzczIH0sIHsgeDogMTU4Ljk1NDg5MjQ4NTEzMjA2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NjYgfSwgeyB4OiAxNzIuOTY5NzIzOTUxNTMwNjgsIHk6IDE5MC4yNDcyNTA5NTQwNzI4IH0sIHsgeDogMTkwLjI0NzI1MDk1NDA3MjgsIHk6IDE3Mi45Njk3MjM5NTE1MzA2OCB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2LCB5OiAxNTguOTU0ODkyNDg1MTMyMSB9LCB7IHg6IDIzMi40MDczMzE0NjkwNzcyNiwgeTogMTQ4LjYyODU5MDExNzEzNjU4IH0sIHsgeDogMjU2LjAwODg3MjI2OTEyMTM1LCB5OiAxNDIuMzA0NTc2MzE5NjM0NTUgfSwgeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogMTQwLjE3NTAwMzA1MTc1Nzc2IH0sIHsgeDogMzA0LjY5MTEzOTkzNzkwOTYsIHk6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSB9LCB7IHg6IDMyOC4yOTI2ODA3Mzc5NTM3MywgeTogMTQ4LjYyODU5MDExNzEzNjU1IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDM2LCB5OiAxNTguOTU0ODkyNDg1MTMyMDYgfSwgeyB4OiAzNzAuNDUyNzYxMjUyOTU4MiwgeTogMTcyLjk2OTcyMzk1MTUzMDY4IH0sIHsgeDogMzg3LjczMDI4ODI1NTUwMDM0LCB5OiAxOTAuMjQ3MjUwOTU0MDcyNzcgfSwgeyB4OiA0MDEuNzQ1MTE5NzIxODk4OTYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2NiB9LCB7IHg6IDQxMi4wNzE0MjIwODk4OTQ0NCwgeTogMjMyLjQwNzMzMTQ2OTA3NzIzIH0sIHsgeDogNDE4LjM5NTQzNTg4NzM5NjUsIHk6IDI1Ni4wMDg4NzIyNjkxMjE0IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDQxOC4zOTU0MzU4ODczOTY1LCB5OiAzMDQuNjkxMTM5OTM3OTA5NjcgfSwgeyB4OiA0MTIuMDcxNDIyMDg5ODk0NDQsIHk6IDMyOC4yOTI2ODA3Mzc5NTM3MyB9LCB7IHg6IDQwMS43NDUxMTk3MjE4OTg5NiwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiAzODcuNzMwMjg4MjU1NTAwMzQsIHk6IDM3MC40NTI3NjEyNTI5NTgyIH0sIHsgeDogMzcwLjQ1Mjc2MTI1Mjk1ODIsIHk6IDM4Ny43MzAyODgyNTU1MDAzNCB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MDEuNzQ1MTE5NzIxODk4OSB9LCB7IHg6IDMyOC4yOTI2ODA3Mzc5NTM4NCwgeTogNDEyLjA3MTQyMjA4OTg5NDQ0IH0sIHsgeDogMzA0LjY5MTEzOTkzNzkwOTY3LCB5OiA0MTguMzk1NDM1ODg3Mzk2NSB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAyNTYuMDA4ODcyMjY5MTIxNCwgeTogNDE4LjM5NTQzNTg4NzM5NjUgfSwgeyB4OiAyMzIuNDA3MzMxNDY5MDc3MzUsIHk6IDQxMi4wNzE0MjIwODk4OTQ1IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYsIHk6IDQwMS43NDUxMTk3MjE4OTg5NiB9LCB7IHg6IDE5MC4yNDcyNTA5NTQwNzI4LCB5OiAzODcuNzMwMjg4MjU1NTAwMzQgfSwgeyB4OiAxNzIuOTY5NzIzOTUxNTMwNywgeTogMzcwLjQ1Mjc2MTI1Mjk1ODMgfSwgeyB4OiAxNTguOTU0ODkyNDg1MTMyMTIsIHk6IDM1MC40Mzc1MDc2MjkzOTQ0IH0sIHsgeDogMTQ4LjYyODU5MDExNzEzNjU1LCB5OiAzMjguMjkyNjgwNzM3OTUzNzMgfSwgeyB4OiAxNDIuMzA0NTc2MzE5NjM0NTgsIHk6IDMwNC42OTExMzk5Mzc5MDk4IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyODAuMzUwMDA2MTAzNTE1NTd9XSxcblx0XHRcdG5hbWU6IFwiY2lyY2xlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSwgeTogMzA0LjY5MTEzOTkzNzkwOTY3IH0sIHsgeDogMTQ4LjYyODU5MDExNzEzNjU1LCB5OiAzMjguMjkyNjgwNzM3OTUzNzMgfSwgeyB4OiAxNTguOTU0ODkyNDg1MTMyMDYsIHk6IDM1MC40Mzc1MDc2MjkzOTQzNiB9LCB7IHg6IDE3Mi45Njk3MjM5NTE1MzA2OCwgeTogMzcwLjQ1Mjc2MTI1Mjk1ODIgfSwgeyB4OiAxOTAuMjQ3MjUwOTU0MDcyOCwgeTogMzg3LjczMDI4ODI1NTUwMDM0IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjYsIHk6IDQwMS43NDUxMTk3MjE4OTg5NiB9LCB7IHg6IDIzMi40MDczMzE0NjkwNzcyNiwgeTogNDEyLjA3MTQyMjA4OTg5NDQ0IH0sIHsgeDogMjU2LjAwODg3MjI2OTEyMTM1LCB5OiA0MTguMzk1NDM1ODg3Mzk2NSB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiA0MjAuNTI1MDA5MTU1MjczMjcgfSwgeyB4OiAzMDQuNjkxMTM5OTM3OTA5NiwgeTogNDE4LjM5NTQzNTg4NzM5NjUgfSwgeyB4OiAzMjguMjkyNjgwNzM3OTUzNzMsIHk6IDQxMi4wNzE0MjIwODk4OTQ0NCB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQzNiwgeTogNDAxLjc0NTExOTcyMTg5ODk2IH0sIHsgeDogMzcwLjQ1Mjc2MTI1Mjk1ODIsIHk6IDM4Ny43MzAyODgyNTU1MDAzNCB9LCB7IHg6IDM4Ny43MzAyODgyNTU1MDAzNCwgeTogMzcwLjQ1Mjc2MTI1Mjk1ODIgfSwgeyB4OiA0MDEuNzQ1MTE5NzIxODk4OTYsIHk6IDM1MC40Mzc1MDc2MjkzOTQzNiB9LCB7IHg6IDQxMi4wNzE0MjIwODk4OTQ0NCwgeTogMzI4LjI5MjY4MDczNzk1MzggfSwgeyB4OiA0MTguMzk1NDM1ODg3Mzk2NSwgeTogMzA0LjY5MTEzOTkzNzkwOTYgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogNDE4LjM5NTQzNTg4NzM5NjUsIHk6IDI1Ni4wMDg4NzIyNjkxMjEzNSB9LCB7IHg6IDQxMi4wNzE0MjIwODk4OTQ0NCwgeTogMjMyLjQwNzMzMTQ2OTA3NzMgfSwgeyB4OiA0MDEuNzQ1MTE5NzIxODk4OTYsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY2IH0sIHsgeDogMzg3LjczMDI4ODI1NTUwMDM0LCB5OiAxOTAuMjQ3MjUwOTU0MDcyOCB9LCB7IHg6IDM3MC40NTI3NjEyNTI5NTgyLCB5OiAxNzIuOTY5NzIzOTUxNTMwNyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiAxNTguOTU0ODkyNDg1MTMyMTIgfSwgeyB4OiAzMjguMjkyNjgwNzM3OTUzODQsIHk6IDE0OC42Mjg1OTAxMTcxMzY1OCB9LCB7IHg6IDMwNC42OTExMzk5Mzc5MDk2NywgeTogMTQyLjMwNDU3NjMxOTYzNDU1IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI1Ni4wMDg4NzIyNjkxMjE0LCB5OiAxNDIuMzA0NTc2MzE5NjM0NTUgfSwgeyB4OiAyMzIuNDA3MzMxNDY5MDc3MzUsIHk6IDE0OC42Mjg1OTAxMTcxMzY1MyB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2LCB5OiAxNTguOTU0ODkyNDg1MTMyMSB9LCB7IHg6IDE5MC4yNDcyNTA5NTQwNzI4LCB5OiAxNzIuOTY5NzIzOTUxNTMwNjggfSwgeyB4OiAxNzIuOTY5NzIzOTUxNTMwNywgeTogMTkwLjI0NzI1MDk1NDA3Mjc0IH0sIHsgeDogMTU4Ljk1NDg5MjQ4NTEzMjEyLCB5OiAyMTAuMjYyNTA0NTc3NjM2NTggfSwgeyB4OiAxNDguNjI4NTkwMTE3MTM2NTUsIHk6IDIzMi40MDczMzE0NjkwNzczIH0sIHsgeDogMTQyLjMwNDU3NjMxOTYzNDU4LCB5OiAyNTYuMDA4ODcyMjY5MTIxMjQgfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI4MC4zNTAwMDYxMDM1MTU0NX1dLFxuXHRcdFx0bmFtZTogXCJjaXJjbGVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbeyB4OiAyODAuMzUwMDA2MTAzNTE1NSwgeTogNDIwLjUyNTAwOTE1NTI3MzI3IH0sIHsgeDogMzA0LjY5MTEzOTkzNzkwOTYsIHk6IDQxOC4zOTU0MzU4ODczOTY1IH0sIHsgeDogMzI4LjI5MjY4MDczNzk1MzczLCB5OiA0MTIuMDcxNDIyMDg5ODk0NDQgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0MzYsIHk6IDQwMS43NDUxMTk3MjE4OTg5NiB9LCB7IHg6IDM3MC40NTI3NjEyNTI5NTgyLCB5OiAzODcuNzMwMjg4MjU1NTAwMzQgfSwgeyB4OiAzODcuNzMwMjg4MjU1NTAwMzQsIHk6IDM3MC40NTI3NjEyNTI5NTgyIH0sIHsgeDogNDAxLjc0NTExOTcyMTg5ODk2LCB5OiAzNTAuNDM3NTA3NjI5Mzk0MzYgfSwgeyB4OiA0MTIuMDcxNDIyMDg5ODk0NDQsIHk6IDMyOC4yOTI2ODA3Mzc5NTM4IH0sIHsgeDogNDE4LjM5NTQzNTg4NzM5NjUsIHk6IDMwNC42OTExMzk5Mzc5MDk2IH0sIHsgeDogNDIwLjUyNTAwOTE1NTI3MzI3LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDQxOC4zOTU0MzU4ODczOTY1LCB5OiAyNTYuMDA4ODcyMjY5MTIxMzUgfSwgeyB4OiA0MTIuMDcxNDIyMDg5ODk0NDQsIHk6IDIzMi40MDczMzE0NjkwNzczIH0sIHsgeDogNDAxLjc0NTExOTcyMTg5ODk2LCB5OiAyMTAuMjYyNTA0NTc3NjM2NiB9LCB7IHg6IDM4Ny43MzAyODgyNTU1MDAzNCwgeTogMTkwLjI0NzI1MDk1NDA3MjggfSwgeyB4OiAzNzAuNDUyNzYxMjUyOTU4MiwgeTogMTcyLjk2OTcyMzk1MTUzMDcgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0NCwgeTogMTU4Ljk1NDg5MjQ4NTEzMjEyIH0sIHsgeDogMzI4LjI5MjY4MDczNzk1Mzg0LCB5OiAxNDguNjI4NTkwMTE3MTM2NTggfSwgeyB4OiAzMDQuNjkxMTM5OTM3OTA5NjcsIHk6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAyNTYuMDA4ODcyMjY5MTIxNCwgeTogMTQyLjMwNDU3NjMxOTYzNDU1IH0sIHsgeDogMjMyLjQwNzMzMTQ2OTA3NzM1LCB5OiAxNDguNjI4NTkwMTE3MTM2NTMgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NiwgeTogMTU4Ljk1NDg5MjQ4NTEzMjEgfSwgeyB4OiAxOTAuMjQ3MjUwOTU0MDcyOCwgeTogMTcyLjk2OTcyMzk1MTUzMDY4IH0sIHsgeDogMTcyLjk2OTcyMzk1MTUzMDcsIHk6IDE5MC4yNDcyNTA5NTQwNzI3NCB9LCB7IHg6IDE1OC45NTQ4OTI0ODUxMzIxMiwgeTogMjEwLjI2MjUwNDU3NzYzNjU4IH0sIHsgeDogMTQ4LjYyODU5MDExNzEzNjU1LCB5OiAyMzIuNDA3MzMxNDY5MDc3MyB9LCB7IHg6IDE0Mi4zMDQ1NzYzMTk2MzQ1OCwgeTogMjU2LjAwODg3MjI2OTEyMTI0IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyODAuMzUwMDA2MTAzNTE1NDUgfSwgeyB4OiAxNDIuMzA0NTc2MzE5NjM0NTUsIHk6IDMwNC42OTExMzk5Mzc5MDk2IH0sIHsgeDogMTQ4LjYyODU5MDExNzEzNjU4LCB5OiAzMjguMjkyNjgwNzM3OTUzOCB9LCB7IHg6IDE1OC45NTQ4OTI0ODUxMzIsIHk6IDM1MC40Mzc1MDc2MjkzOTQzIH0sIHsgeDogMTcyLjk2OTcyMzk1MTUzMDY4LCB5OiAzNzAuNDUyNzYxMjUyOTU4MiB9LCB7IHg6IDE5MC4yNDcyNTA5NTQwNzI3NCwgeTogMzg3LjczMDI4ODI1NTUwMDMgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjYsIHk6IDQwMS43NDUxMTk3MjE4OTg5NiB9LCB7IHg6IDIzMi40MDczMzE0NjkwNzcxOCwgeTogNDEyLjA3MTQyMjA4OTg5NDQ0IH0sIHsgeDogMjU2LjAwODg3MjI2OTEyMTM1LCB5OiA0MTguMzk1NDM1ODg3Mzk2NSB9LCB7IHg6IDI4MC4zNTAwMDYxMDM1MTU0NSwgeTogNDIwLjUyNTAwOTE1NTI3MzI3fV0sXG5cdFx0XHRuYW1lOiBcImNpcmNsZVwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwb2ludHM6IFt7IHg6IDI4MC4zNTAwMDYxMDM1MTU1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzYgfSwgeyB4OiAzMDQuNjkxMTM5OTM3OTA5NiwgeTogMTQyLjMwNDU3NjMxOTYzNDU1IH0sIHsgeDogMzI4LjI5MjY4MDczNzk1MzczLCB5OiAxNDguNjI4NTkwMTE3MTM2NTUgfSwgeyB4OiAzNTAuNDM3NTA3NjI5Mzk0MzYsIHk6IDE1OC45NTQ4OTI0ODUxMzIwNiB9LCB7IHg6IDM3MC40NTI3NjEyNTI5NTgyLCB5OiAxNzIuOTY5NzIzOTUxNTMwNjggfSwgeyB4OiAzODcuNzMwMjg4MjU1NTAwMzQsIHk6IDE5MC4yNDcyNTA5NTQwNzI3NyB9LCB7IHg6IDQwMS43NDUxMTk3MjE4OTg5NiwgeTogMjEwLjI2MjUwNDU3NzYzNjY2IH0sIHsgeDogNDEyLjA3MTQyMjA4OTg5NDQ0LCB5OiAyMzIuNDA3MzMxNDY5MDc3MjMgfSwgeyB4OiA0MTguMzk1NDM1ODg3Mzk2NSwgeTogMjU2LjAwODg3MjI2OTEyMTQgfSwgeyB4OiA0MjAuNTI1MDA5MTU1MjczMjcsIHk6IDI4MC4zNTAwMDYxMDM1MTU1IH0sIHsgeDogNDE4LjM5NTQzNTg4NzM5NjUsIHk6IDMwNC42OTExMzk5Mzc5MDk2NyB9LCB7IHg6IDQxMi4wNzE0MjIwODk4OTQ0NCwgeTogMzI4LjI5MjY4MDczNzk1MzczIH0sIHsgeDogNDAxLjc0NTExOTcyMTg5ODk2LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDM4Ny43MzAyODgyNTU1MDAzNCwgeTogMzcwLjQ1Mjc2MTI1Mjk1ODIgfSwgeyB4OiAzNzAuNDUyNzYxMjUyOTU4MiwgeTogMzg3LjczMDI4ODI1NTUwMDM0IH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDQwMS43NDUxMTk3MjE4OTg5IH0sIHsgeDogMzI4LjI5MjY4MDczNzk1Mzg0LCB5OiA0MTIuMDcxNDIyMDg5ODk0NDQgfSwgeyB4OiAzMDQuNjkxMTM5OTM3OTA5NjcsIHk6IDQxOC4zOTU0MzU4ODczOTY1IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI1Ni4wMDg4NzIyNjkxMjE0LCB5OiA0MTguMzk1NDM1ODg3Mzk2NSB9LCB7IHg6IDIzMi40MDczMzE0NjkwNzczNSwgeTogNDEyLjA3MTQyMjA4OTg5NDUgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NiwgeTogNDAxLjc0NTExOTcyMTg5ODk2IH0sIHsgeDogMTkwLjI0NzI1MDk1NDA3MjgsIHk6IDM4Ny43MzAyODgyNTU1MDAzNCB9LCB7IHg6IDE3Mi45Njk3MjM5NTE1MzA3LCB5OiAzNzAuNDUyNzYxMjUyOTU4MyB9LCB7IHg6IDE1OC45NTQ4OTI0ODUxMzIxMiwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiAxNDguNjI4NTkwMTE3MTM2NTUsIHk6IDMyOC4yOTI2ODA3Mzc5NTM3MyB9LCB7IHg6IDE0Mi4zMDQ1NzYzMTk2MzQ1OCwgeTogMzA0LjY5MTEzOTkzNzkwOTggfSwgeyB4OiAxNDAuMTc1MDAzMDUxNzU3NzYsIHk6IDI4MC4zNTAwMDYxMDM1MTU1NyB9LCB7IHg6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSwgeTogMjU2LjAwODg3MjI2OTEyMTQgfSwgeyB4OiAxNDguNjI4NTkwMTE3MTM2NTgsIHk6IDIzMi40MDczMzE0NjkwNzcyMyB9LCB7IHg6IDE1OC45NTQ4OTI0ODUxMzIsIHk6IDIxMC4yNjI1MDQ1Nzc2MzY3MiB9LCB7IHg6IDE3Mi45Njk3MjM5NTE1MzA2OCwgeTogMTkwLjI0NzI1MDk1NDA3MjggfSwgeyB4OiAxOTAuMjQ3MjUwOTU0MDcyNzQsIHk6IDE3Mi45Njk3MjM5NTE1MzA3NCB9LCB7IHg6IDIxMC4yNjI1MDQ1Nzc2MzY2NiwgeTogMTU4Ljk1NDg5MjQ4NTEzMjA2IH0sIHsgeDogMjMyLjQwNzMzMTQ2OTA3NzE4LCB5OiAxNDguNjI4NTkwMTE3MTM2NiB9LCB7IHg6IDI1Ni4wMDg4NzIyNjkxMjEzNSwgeTogMTQyLjMwNDU3NjMxOTYzNDU1IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTQ1LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzZ9XSxcblx0XHRcdG5hbWU6IFwiY2lyY2xlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDI1Ni4wMDg4NzIyNjkxMjE0LCB5OiAxNDIuMzA0NTc2MzE5NjM0NTUgfSwgeyB4OiAyMzIuNDA3MzMxNDY5MDc3MywgeTogMTQ4LjYyODU5MDExNzEzNjU1IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjY2LCB5OiAxNTguOTU0ODkyNDg1MTMyMDYgfSwgeyB4OiAxOTAuMjQ3MjUwOTU0MDcyOCwgeTogMTcyLjk2OTcyMzk1MTUzMDY4IH0sIHsgeDogMTcyLjk2OTcyMzk1MTUzMDcsIHk6IDE5MC4yNDcyNTA5NTQwNzI3NyB9LCB7IHg6IDE1OC45NTQ4OTI0ODUxMzIwNiwgeTogMjEwLjI2MjUwNDU3NzYzNjY2IH0sIHsgeDogMTQ4LjYyODU5MDExNzEzNjU4LCB5OiAyMzIuNDA3MzMxNDY5MDc3MjMgfSwgeyB4OiAxNDIuMzA0NTc2MzE5NjM0NTUsIHk6IDI1Ni4wMDg4NzIyNjkxMjE0IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSwgeTogMzA0LjY5MTEzOTkzNzkwOTY3IH0sIHsgeDogMTQ4LjYyODU5MDExNzEzNjU1LCB5OiAzMjguMjkyNjgwNzM3OTUzNzMgfSwgeyB4OiAxNTguOTU0ODkyNDg1MTMyMSwgeTogMzUwLjQzNzUwNzYyOTM5NDQgfSwgeyB4OiAxNzIuOTY5NzIzOTUxNTMwNjgsIHk6IDM3MC40NTI3NjEyNTI5NTgyIH0sIHsgeDogMTkwLjI0NzI1MDk1NDA3Mjc3LCB5OiAzODcuNzMwMjg4MjU1NTAwMzQgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NTgsIHk6IDQwMS43NDUxMTk3MjE4OTg5IH0sIHsgeDogMjMyLjQwNzMzMTQ2OTA3NzE4LCB5OiA0MTIuMDcxNDIyMDg5ODk0NDQgfSwgeyB4OiAyNTYuMDA4ODcyMjY5MTIxMzUsIHk6IDQxOC4zOTU0MzU4ODczOTY1IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDMwNC42OTExMzk5Mzc5MDk2LCB5OiA0MTguMzk1NDM1ODg3Mzk2NSB9LCB7IHg6IDMyOC4yOTI2ODA3Mzc5NTM3LCB5OiA0MTIuMDcxNDIyMDg5ODk0NSB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQ0LCB5OiA0MDEuNzQ1MTE5NzIxODk4OTYgfSwgeyB4OiAzNzAuNDUyNzYxMjUyOTU4MiwgeTogMzg3LjczMDI4ODI1NTUwMDM0IH0sIHsgeDogMzg3LjczMDI4ODI1NTUwMDM0LCB5OiAzNzAuNDUyNzYxMjUyOTU4MyB9LCB7IHg6IDQwMS43NDUxMTk3MjE4OTg5LCB5OiAzNTAuNDM3NTA3NjI5Mzk0NCB9LCB7IHg6IDQxMi4wNzE0MjIwODk4OTQ0NCwgeTogMzI4LjI5MjY4MDczNzk1MzczIH0sIHsgeDogNDE4LjM5NTQzNTg4NzM5NjQ1LCB5OiAzMDQuNjkxMTM5OTM3OTA5OCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjgwLjM1MDAwNjEwMzUxNTU3IH0sIHsgeDogNDE4LjM5NTQzNTg4NzM5NjUsIHk6IDI1Ni4wMDg4NzIyNjkxMjE0IH0sIHsgeDogNDEyLjA3MTQyMjA4OTg5NDQ0LCB5OiAyMzIuNDA3MzMxNDY5MDc3MjMgfSwgeyB4OiA0MDEuNzQ1MTE5NzIxODk5LCB5OiAyMTAuMjYyNTA0NTc3NjM2NzIgfSwgeyB4OiAzODcuNzMwMjg4MjU1NTAwMzQsIHk6IDE5MC4yNDcyNTA5NTQwNzI4IH0sIHsgeDogMzcwLjQ1Mjc2MTI1Mjk1ODMsIHk6IDE3Mi45Njk3MjM5NTE1MzA3NCB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQzNiwgeTogMTU4Ljk1NDg5MjQ4NTEzMjA2IH0sIHsgeDogMzI4LjI5MjY4MDczNzk1Mzg0LCB5OiAxNDguNjI4NTkwMTE3MTM2NiB9LCB7IHg6IDMwNC42OTExMzk5Mzc5MDk2NywgeTogMTQyLjMwNDU3NjMxOTYzNDU1IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTU3LCB5OiAxNDAuMTc1MDAzMDUxNzU3NzZ9XSxcblx0XHRcdG5hbWU6IFwiY2lyY2xlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3sgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDQyMC41MjUwMDkxNTUyNzMyNyB9LCB7IHg6IDI1Ni4wMDg4NzIyNjkxMjE0LCB5OiA0MTguMzk1NDM1ODg3Mzk2NSB9LCB7IHg6IDIzMi40MDczMzE0NjkwNzczLCB5OiA0MTIuMDcxNDIyMDg5ODk0NDQgfSwgeyB4OiAyMTAuMjYyNTA0NTc3NjM2NjYsIHk6IDQwMS43NDUxMTk3MjE4OTg5NiB9LCB7IHg6IDE5MC4yNDcyNTA5NTQwNzI4LCB5OiAzODcuNzMwMjg4MjU1NTAwMzQgfSwgeyB4OiAxNzIuOTY5NzIzOTUxNTMwNywgeTogMzcwLjQ1Mjc2MTI1Mjk1ODIgfSwgeyB4OiAxNTguOTU0ODkyNDg1MTMyMDYsIHk6IDM1MC40Mzc1MDc2MjkzOTQzNiB9LCB7IHg6IDE0OC42Mjg1OTAxMTcxMzY1OCwgeTogMzI4LjI5MjY4MDczNzk1MzggfSwgeyB4OiAxNDIuMzA0NTc2MzE5NjM0NTUsIHk6IDMwNC42OTExMzk5Mzc5MDk2IH0sIHsgeDogMTQwLjE3NTAwMzA1MTc1Nzc2LCB5OiAyODAuMzUwMDA2MTAzNTE1NSB9LCB7IHg6IDE0Mi4zMDQ1NzYzMTk2MzQ1NSwgeTogMjU2LjAwODg3MjI2OTEyMTM1IH0sIHsgeDogMTQ4LjYyODU5MDExNzEzNjU1LCB5OiAyMzIuNDA3MzMxNDY5MDc3MyB9LCB7IHg6IDE1OC45NTQ4OTI0ODUxMzIxLCB5OiAyMTAuMjYyNTA0NTc3NjM2NiB9LCB7IHg6IDE3Mi45Njk3MjM5NTE1MzA2OCwgeTogMTkwLjI0NzI1MDk1NDA3MjggfSwgeyB4OiAxOTAuMjQ3MjUwOTU0MDcyNzcsIHk6IDE3Mi45Njk3MjM5NTE1MzA3IH0sIHsgeDogMjEwLjI2MjUwNDU3NzYzNjU4LCB5OiAxNTguOTU0ODkyNDg1MTMyMTIgfSwgeyB4OiAyMzIuNDA3MzMxNDY5MDc3MTgsIHk6IDE0OC42Mjg1OTAxMTcxMzY1OCB9LCB7IHg6IDI1Ni4wMDg4NzIyNjkxMjEzNSwgeTogMTQyLjMwNDU3NjMxOTYzNDU1IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTUsIHk6IDE0MC4xNzUwMDMwNTE3NTc3NiB9LCB7IHg6IDMwNC42OTExMzk5Mzc5MDk2LCB5OiAxNDIuMzA0NTc2MzE5NjM0NTUgfSwgeyB4OiAzMjguMjkyNjgwNzM3OTUzNywgeTogMTQ4LjYyODU5MDExNzEzNjUzIH0sIHsgeDogMzUwLjQzNzUwNzYyOTM5NDQsIHk6IDE1OC45NTQ4OTI0ODUxMzIxIH0sIHsgeDogMzcwLjQ1Mjc2MTI1Mjk1ODIsIHk6IDE3Mi45Njk3MjM5NTE1MzA2OCB9LCB7IHg6IDM4Ny43MzAyODgyNTU1MDAzNCwgeTogMTkwLjI0NzI1MDk1NDA3Mjc0IH0sIHsgeDogNDAxLjc0NTExOTcyMTg5ODksIHk6IDIxMC4yNjI1MDQ1Nzc2MzY1OCB9LCB7IHg6IDQxMi4wNzE0MjIwODk4OTQ0NCwgeTogMjMyLjQwNzMzMTQ2OTA3NzMgfSwgeyB4OiA0MTguMzk1NDM1ODg3Mzk2NDUsIHk6IDI1Ni4wMDg4NzIyNjkxMjEyNCB9LCB7IHg6IDQyMC41MjUwMDkxNTUyNzMyNywgeTogMjgwLjM1MDAwNjEwMzUxNTQ1IH0sIHsgeDogNDE4LjM5NTQzNTg4NzM5NjUsIHk6IDMwNC42OTExMzk5Mzc5MDk2IH0sIHsgeDogNDEyLjA3MTQyMjA4OTg5NDQ0LCB5OiAzMjguMjkyNjgwNzM3OTUzOCB9LCB7IHg6IDQwMS43NDUxMTk3MjE4OTksIHk6IDM1MC40Mzc1MDc2MjkzOTQzIH0sIHsgeDogMzg3LjczMDI4ODI1NTUwMDM0LCB5OiAzNzAuNDUyNzYxMjUyOTU4MiB9LCB7IHg6IDM3MC40NTI3NjEyNTI5NTgzLCB5OiAzODcuNzMwMjg4MjU1NTAwMyB9LCB7IHg6IDM1MC40Mzc1MDc2MjkzOTQzNiwgeTogNDAxLjc0NTExOTcyMTg5ODk2IH0sIHsgeDogMzI4LjI5MjY4MDczNzk1Mzg0LCB5OiA0MTIuMDcxNDIyMDg5ODk0NDQgfSwgeyB4OiAzMDQuNjkxMTM5OTM3OTA5NjcsIHk6IDQxOC4zOTU0MzU4ODczOTY1IH0sIHsgeDogMjgwLjM1MDAwNjEwMzUxNTU3LCB5OiA0MjAuNTI1MDA5MTU1MjczMjd9XSxcblx0XHRcdG5hbWU6IFwiY2lyY2xlXCJcblx0XHR9LFxuXHRcdHtcblx0XHRcdHBvaW50czogW3tcInhcIjoyOTAsXCJ5XCI6MjU2fSx7XCJ4XCI6Mjg1LFwieVwiOjI5MX0se1wieFwiOjMwMSxcInlcIjozNDd9LHtcInhcIjozNTksXCJ5XCI6MzY3fSx7XCJ4XCI6NDAyLFwieVwiOjM2N30se1wieFwiOjUxMSxcInlcIjozMDh9LHtcInhcIjo1NTksXCJ5XCI6MjQ2fSx7XCJ4XCI6NTYwLFwieVwiOjIyNX0se1wieFwiOjUxMyxcInlcIjoxOTR9LHtcInhcIjo0NzcsXCJ5XCI6MTg2fSx7XCJ4XCI6NDEwLjQ0Nzg2LFwieVwiOjE4NS41ODI0NX1dLFxuXHRcdFx0bmFtZTogXCJjaXJjbGVcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbe1wieFwiOjM0MixcInlcIjoxODd9LHtcInhcIjoyNzAsXCJ5XCI6MjY3fSx7XCJ4XCI6MjM0LFwieVwiOjM4MH0se1wieFwiOjIzNCxcInlcIjozOTh9LHtcInhcIjoyNzgsXCJ5XCI6NDQ1fSx7XCJ4XCI6Mzg2LFwieVwiOjQ2N30se1wieFwiOjQ1MixcInlcIjo0NTB9LHtcInhcIjo0NzksXCJ5XCI6NDI1fSx7XCJ4XCI6NDg5LFwieVwiOjI3Mn0se1wieFwiOjQ0NSxcInlcIjoxNzh9LHtcInhcIjozNTYsXCJ5XCI6MTcwfV0sXG5cdFx0XHRuYW1lOiBcImNpcmNsZVwiXG5cdFx0fSxcblx0XHQvLyB7XG5cdFx0Ly8gXHRwb2ludHM6IFt7XCJ4XCI6NTk3LFwieVwiOjU4fSx7XCJ4XCI6NTkwLFwieVwiOjExMX0se1wieFwiOjY0MixcInlcIjo3OH0se1wieFwiOjYzNixcInlcIjo2N30se1wieFwiOjYwMCxcInlcIjo1Mn0se1wieFwiOjU5NyxcInlcIjo1Mn1dLFxuXHRcdC8vIFx0bmFtZTogXCJjaXJjbGVcIlxuXHRcdC8vIH0sXG5cdFx0Ly8ge1xuXHRcdC8vIFx0cG9pbnRzOiBbe1wieFwiOjIyOCxcInlcIjo0NjR9LHtcInhcIjoxOTEsXCJ5XCI6NDY3fSx7XCJ4XCI6MTkwLFwieVwiOjUxOX0se1wieFwiOjIyNCxcInlcIjo1MjR9LHtcInhcIjoyNDgsXCJ5XCI6NTIzfSx7XCJ4XCI6MzE0LFwieVwiOjQ3N30se1wieFwiOjI5MSxcInlcIjo0NjB9LHtcInhcIjoyMjksXCJ5XCI6NDUyfSx7XCJ4XCI6MjA2LFwieVwiOjQ1Mn1dLFxuXHRcdC8vIFx0bmFtZTogXCJjaXJjbGVcIlxuXHRcdC8vIH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbe3g6MzgwLHk6MjAyfSx7eDo1MjkseToyNjV9LHt4OjU4MCx5OjMxM30se3g6NTcxLHk6MzY3fSx7eDo0OTIseTo0MDF9LHt4OjQ3Mix5OjMzNH0se3g6NDc4LHk6MzEzfSx7eDo1MjEseToyNDh9LHt4OjYxMSx5OjE3NH1dLFxuXHRcdFx0bmFtZTogXCJvdGhlclwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwb2ludHM6IFt7eDo1NTMseToyOTJ9LHt4OjU3OSx5OjI5N30se3g6NjA4LHk6Mjk3fSx7eDo2MDkseToyODZ9LHt4OjU4NSx5OjI2N30se3g6NTQwLHk6MjgyfSx7eDo1MjEseTozMTF9LHt4OjU0MCx5OjMyMX0se3g6NjExLHk6MzE5fSx7eDo2MjYseToyOTB9LHt4OjYyNSx5OjI1N30se3g6NTQ4LHk6MjI3fSx7eDo1MTYseToyMjh9LHt4OjQ5NSx5OjIzNn0se3g6NDUxLHk6Mjc2fSx7eDo0NDcseTozMjR9LHt4OjUwNix5OjQwMH0se3g6NTkzLHk6NDE2fSx7eDo2ODAseTozODV9XSxcblx0XHRcdG5hbWU6IFwib3RoZXJcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbe3g6NDIseTo4M30se3g6NzQseTo4NH0se3g6ODIseTo4NX0se3g6ODYseTo4Nn0se3g6NDQseTo3NH0se3g6NjMseTo4Mn0se3g6NTYseTo4OH0se3g6NDgseTo5NX0se3g6NTcseTo2M30se3g6NjUseTo1M30se3g6NjQseTo2OX0se3g6NTgseToxMDZ9XSxcblx0XHRcdG5hbWU6IFwib3RoZXJcIlxuXHRcdH0sXG5cdFx0e1xuXHRcdFx0cG9pbnRzOiBbe3g6MTM1LHk6NDkxfSx7eDoxMjQseTo0MjR9LHt4Ojk2LHk6NDE4fSx7eDo4OCx5OjQzNH0se3g6ODgseTo0Mzd9LHt4OjExMyx5OjQxM30se3g6MTE0LHk6Mzk1fSx7eDoxMDIseTozOTF9LHt4OjkwLHk6MzkwfSx7eDo3OCx5OjQwNX0se3g6NzAseTo0ODB9LHt4Ojg1LHk6NTAyfSx7eDo5Myx5OjUxMH1dLFxuXHRcdFx0bmFtZTogXCJvdGhlclwiXG5cdFx0fSxcblx0XHR7XG5cdFx0XHRwb2ludHM6IFt7eDogODEsIHk6IDIxOX0se3g6IDg0LCB5OiAyMTh9LHt4OiA4NiwgeTogMjIwfSx7eDogODgsIHk6IDIyMH0se3g6IDkwLCB5OiAyMjB9LHt4OiA5MiwgeTogMjE5fSx7eDogOTUsIHk6IDIyMH0se3g6IDk3LCB5OiAyMTl9LHt4OiA5OSwgeTogMjIwfSx7eDogMTAyLCB5OiAyMTh9LHt4OiAxMDUsIHk6IDIxN30se3g6IDEwNywgeTogMjE2fSx7eDogMTEwLCB5OiAyMTZ9LHt4OiAxMTMsIHk6IDIxNH0se3g6IDExNiwgeTogMjEyfSx7eDogMTE4LCB5OiAyMTB9LHt4OiAxMjEsIHk6IDIwOH0se3g6IDEyNCwgeTogMjA1fSx7eDogMTI2LCB5OiAyMDJ9LHt4OiAxMjksIHk6IDE5OX0se3g6IDEzMiwgeTogMTk2fSx7eDogMTM2LCB5OiAxOTF9LHt4OiAxMzksIHk6IDE4N30se3g6IDE0MiwgeTogMTgyfSx7eDogMTQ0LCB5OiAxNzl9LHt4OiAxNDYsIHk6IDE3NH0se3g6IDE0OCwgeTogMTcwfSx7eDogMTQ5LCB5OiAxNjh9LHt4OiAxNTEsIHk6IDE2Mn0se3g6IDE1MiwgeTogMTYwfSx7eDogMTUyLCB5OiAxNTd9LHt4OiAxNTIsIHk6IDE1NX0se3g6IDE1MiwgeTogMTUxfSx7eDogMTUyLCB5OiAxNDl9LHt4OiAxNTIsIHk6IDE0Nn0se3g6IDE0OSwgeTogMTQyfSx7eDogMTQ4LCB5OiAxMzl9LHt4OiAxNDUsIHk6IDEzN30se3g6IDE0MSwgeTogMTM1fSx7eDogMTM5LCB5OiAxMzV9LHt4OiAxMzQsIHk6IDEzNn0se3g6IDEzMCwgeTogMTQwfSx7eDogMTI4LCB5OiAxNDJ9LHt4OiAxMjYsIHk6IDE0NX0se3g6IDEyMiwgeTogMTUwfSx7eDogMTE5LCB5OiAxNTh9LHt4OiAxMTcsIHk6IDE2M30se3g6IDExNSwgeTogMTcwfSx7eDogMTE0LCB5OiAxNzV9LHt4OiAxMTcsIHk6IDE4NH0se3g6IDEyMCwgeTogMTkwfSx7eDogMTI1LCB5OiAxOTl9LHt4OiAxMjksIHk6IDIwM30se3g6IDEzMywgeTogMjA4fSx7eDogMTM4LCB5OiAyMTN9LHt4OiAxNDUsIHk6IDIxNX0se3g6IDE1NSwgeTogMjE4fSx7eDogMTY0LCB5OiAyMTl9LHt4OiAxNjYsIHk6IDIxOX0se3g6IDE3NywgeTogMjE5fSx7eDogMTgyLCB5OiAyMTh9LHt4OiAxOTIsIHk6IDIxNn0se3g6IDE5NiwgeTogMjEzfSx7eDogMTk5LCB5OiAyMTJ9LHt4OiAyMDEsIHk6IDIxMX1dLFxuXHRcdFx0bmFtZTogXCJvdGhlclwiXG5cdFx0fSxcblxuXG5cblxuXG5cdF07XG5cblx0U2hhcGVEZXRlY3Rvci5wcm90b3R5cGUuc3BvdCA9IGZ1bmN0aW9uIChwb2ludHMsIHBhdHRlcm5OYW1lKSB7XG5cblx0XHRpZiAocGF0dGVybk5hbWUgPT0gbnVsbCkge1xuXHRcdFx0cGF0dGVybk5hbWUgPSAnJztcblx0XHR9XG5cblx0XHR2YXIgZGlzdGFuY2UsIHBhdHRlcm4sIHNjb3JlO1xuXHRcdHZhciBzdHJva2UgPSBuZXcgU3Ryb2tlKHBvaW50cyk7XG5cdFx0dmFyIGJlc3REaXN0YW5jZSA9ICtJbmZpbml0eTtcblx0XHR2YXIgYmVzdFBhdHRlcm4gPSBudWxsO1xuXHRcdHZhciBiZXN0U2NvcmUgPSAwO1xuXG5cdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLnBhdHRlcm5zLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRwYXR0ZXJuID0gdGhpcy5wYXR0ZXJuc1tpXTtcblxuXHRcdFx0aWYgKHBhdHRlcm4ubmFtZS5pbmRleE9mKHBhdHRlcm5OYW1lKSA+IC0xKSB7XG5cdFx0XHRcdGRpc3RhbmNlID0gc3Ryb2tlLmRpc3RhbmNlQXRCZXN0QW5nbGUocGF0dGVybik7XG5cdFx0XHRcdHNjb3JlID0gMS4wIC0gZGlzdGFuY2UgLyBfaGFsZkRpYWdvbmFsO1xuXG5cdFx0XHRcdGlmIChkaXN0YW5jZSA8IGJlc3REaXN0YW5jZSAmJiBzY29yZSA+IHRoaXMudGhyZXNob2xkKSB7XG5cdFx0XHRcdFx0YmVzdERpc3RhbmNlID0gZGlzdGFuY2U7XG5cdFx0XHRcdFx0YmVzdFBhdHRlcm4gPSBwYXR0ZXJuLm5hbWU7XG5cdFx0XHRcdFx0YmVzdFNjb3JlID0gc2NvcmU7XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRyZXR1cm4geyBwYXR0ZXJuOiBiZXN0UGF0dGVybiwgc2NvcmU6IGJlc3RTY29yZSB9O1xuXHR9O1xuXG5cdFNoYXBlRGV0ZWN0b3IucHJvdG90eXBlLmxlYXJuID0gZnVuY3Rpb24gKG5hbWUsIHBvaW50cykge1xuXG5cdFx0cmV0dXJuIHRoaXMucGF0dGVybnMucHVzaChuZXcgU3Ryb2tlKHBvaW50cywgbmFtZSkpO1xuXHR9O1xuXG5cdHJldHVybiBTaGFwZURldGVjdG9yO1xufSkpO1xuIiwiY29uc3QgY29uZmlnID0gcmVxdWlyZSgnLi8uLi8uLi9jb25maWcnKTtcblxucmVxdWlyZSgnaGFtbWVyanMnKTtcbnJlcXVpcmUoJ2hvd2xlcicpO1xuXG5jb25zdCBTaGFwZURldGVjdG9yID0gcmVxdWlyZSgnLi9saWIvc2hhcGUtZGV0ZWN0b3InKTtcblxuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuY29uc3Qgc2hhcGUgPSByZXF1aXJlKCcuL3NoYXBlJyk7XG5jb25zdCBjb2xvciA9IHJlcXVpcmUoJy4vY29sb3InKTtcbmNvbnN0IHNvdW5kID0gcmVxdWlyZSgnLi9zb3VuZCcpO1xuXG53aW5kb3cua2FuID0gd2luZG93LmthbiB8fCB7XG4gIHBhbGV0dGU6IFtcIiMyMDE3MUNcIiwgXCIjMUUyQTQzXCIsIFwiIzI4Mzc3RFwiLCBcIiMzNTI3NDdcIiwgXCIjQ0EyRTI2XCIsIFwiIzlBMkExRlwiLCBcIiNEQTZDMjZcIiwgXCIjNDUzMTIxXCIsIFwiIzkxNkE0N1wiLCBcIiNEQUFEMjdcIiwgXCIjN0Y3RDMxXCIsXCIjMkI1RTJFXCJdLFxuICBwYWxldHRlTmFtZXM6IFtdLFxuICBjdXJyZW50Q29sb3I6ICcjMjAxNzFDJyxcbiAgbnVtUGF0aHM6IDEwLFxuICBwYXRoczogW10sXG59O1xuXG5wYXBlci5pbnN0YWxsKHdpbmRvdyk7XG5cbmZ1bmN0aW9uIGxvZyh0aGluZykge1xuICB1dGlsLmxvZyh0aGluZyk7XG59XG5cbiQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uKCkge1xuICBsZXQgTU9WRVMgPSBbXTsgLy8gc3RvcmUgZ2xvYmFsIG1vdmVzIGxpc3RcbiAgLy8gbW92ZXMgPSBbXG4gIC8vICAge1xuICAvLyAgICAgJ3R5cGUnOiAnY29sb3JDaGFuZ2UnLFxuICAvLyAgICAgJ29sZCc6ICcjMjAxNzFDJyxcbiAgLy8gICAgICduZXcnOiAnI0YyODVBNSdcbiAgLy8gICB9LFxuICAvLyAgIHtcbiAgLy8gICAgICd0eXBlJzogJ25ld1BhdGgnLFxuICAvLyAgICAgJ3JlZic6ICc/Pz8nIC8vIHV1aWQ/IGRvbSByZWZlcmVuY2U/XG4gIC8vICAgfSxcbiAgLy8gICB7XG4gIC8vICAgICAndHlwZSc6ICdwYXRoVHJhbnNmb3JtJyxcbiAgLy8gICAgICdyZWYnOiAnPz8/JywgLy8gdXVpZD8gZG9tIHJlZmVyZW5jZT9cbiAgLy8gICAgICdvbGQnOiAncm90YXRlKDkwZGVnKXNjYWxlKDEuNSknLCAvLyA/Pz9cbiAgLy8gICAgICduZXcnOiAncm90YXRlKDEyMGRlZylzY2FsZSgtMC41KScgLy8gPz8/XG4gIC8vICAgfSxcbiAgLy8gICAvLyBvdGhlcnM/XG4gIC8vIF1cblxuICBjb25zdCAkd2luZG93ID0gJCh3aW5kb3cpO1xuICBjb25zdCAkYm9keSA9ICQoJ2JvZHknKTtcbiAgY29uc3QgJGNhbnZhcyA9ICQoJ2NhbnZhcyNtYWluQ2FudmFzJyk7XG4gIGNvbnN0IHJ1bkFuaW1hdGlvbnMgPSBjb25maWcucnVuQW5pbWF0aW9ucztcbiAgY29uc3QgdHJhbnNwYXJlbnQgPSBuZXcgQ29sb3IoMCwgMCk7XG4gIGNvbnN0IHRocmVzaG9sZEFuZ2xlID0gdXRpbC5yYWQoY29uZmlnLnNoYXBlLmNvcm5lclRocmVzaG9sZERlZyk7XG4gIGNvbnN0IGRldGVjdG9yID0gbmV3IFNoYXBlRGV0ZWN0b3IoU2hhcGVEZXRlY3Rvci5kZWZhdWx0U2hhcGVzKTtcbiAgbGV0IGNvbXBvc2l0aW9uID0gW107XG4gIGxldCBjb21wb3NpdGlvbkludGVydmFsO1xuXG4gIGxldCB2aWV3V2lkdGgsIHZpZXdIZWlnaHQ7XG5cbiAgbGV0IHBsYXlpbmcgPSBmYWxzZTtcblxuICBmdW5jdGlvbiBxdWFudGl6ZVBvc2l0aW9uKHBvc2l0aW9uKSB7XG4gICAgcmV0dXJuIHNvdW5kLnF1YW50aXplUG9zaXRpb24ocG9zaXRpb24sIHZpZXdXaWR0aCk7XG4gIH1cblxuXG4gIGZ1bmN0aW9uIGhpdFRlc3RCb3VuZHMocG9pbnQpIHtcbiAgICByZXR1cm4gdXRpbC5oaXRUZXN0Qm91bmRzKHBvaW50LCBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLmNoaWxkcmVuKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGhpdFRlc3RHcm91cEJvdW5kcyhwb2ludCkge1xuICAgIGxldCBncm91cHMgPSBwYXBlci5wcm9qZWN0LmdldEl0ZW1zKHtcbiAgICAgIGNsYXNzTmFtZTogJ0dyb3VwJ1xuICAgIH0pO1xuICAgIHJldHVybiB1dGlsLmhpdFRlc3RCb3VuZHMocG9pbnQsIGdyb3Vwcyk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Vmlld1ZhcnMoKSB7XG4gICAgdmlld1dpZHRoID0gcGFwZXIudmlldy52aWV3U2l6ZS53aWR0aDtcbiAgICB2aWV3SGVpZ2h0ID0gcGFwZXIudmlldy52aWV3U2l6ZS5oZWlnaHQ7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q29udHJvbFBhbmVsKCkge1xuICAgIGluaXRDb2xvclBhbGV0dGUoKTtcbiAgICBpbml0Q2FudmFzRHJhdygpO1xuICAgIGluaXROZXcoKTtcbiAgICBpbml0VW5kbygpO1xuICAgIGluaXRQbGF5KCk7XG4gICAgaW5pdFRpcHMoKTtcbiAgICBpbml0U2hhcmUoKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGluaXRDb2xvclBhbGV0dGUoKSB7XG4gICAgY29uc3QgJHBhbGV0dGVXcmFwID0gJCgndWwucGFsZXR0ZS1jb2xvcnMnKTtcbiAgICBjb25zdCAkcGFsZXR0ZUNvbG9ycyA9ICRwYWxldHRlV3JhcC5maW5kKCdsaScpO1xuICAgIGNvbnN0IHBhbGV0dGVDb2xvclNpemUgPSAyMDtcbiAgICBjb25zdCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUgPSAzMDtcbiAgICBjb25zdCBwYWxldHRlU2VsZWN0ZWRDbGFzcyA9ICdwYWxldHRlLXNlbGVjdGVkJztcblxuICAgIC8vIGhvb2sgdXAgY2xpY2tcbiAgICAkcGFsZXR0ZUNvbG9ycy5vbignY2xpY2sgdGFwIHRvdWNoJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoISRib2R5Lmhhc0NsYXNzKHBsYXlpbmdDbGFzcykpIHtcbiAgICAgICAgbGV0ICRzdmcgPSAkKHRoaXMpLmZpbmQoJ3N2Zy5wYWxldHRlLWNvbG9yJyk7XG5cbiAgICAgICAgaWYgKCEkc3ZnLmhhc0NsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKSkge1xuICAgICAgICAgICQoJy4nICsgcGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAucmVtb3ZlQ2xhc3MocGFsZXR0ZVNlbGVjdGVkQ2xhc3MpXG4gICAgICAgICAgICAuYXR0cignd2lkdGgnLCBwYWxldHRlQ29sb3JTaXplKVxuICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHBhbGV0dGVDb2xvclNpemUpXG4gICAgICAgICAgICAuZmluZCgncmVjdCcpXG4gICAgICAgICAgICAuYXR0cigncngnLCAwKVxuICAgICAgICAgICAgLmF0dHIoJ3J5JywgMCk7XG5cbiAgICAgICAgICAkc3ZnLmFkZENsYXNzKHBhbGV0dGVTZWxlY3RlZENsYXNzKVxuICAgICAgICAgICAgLmF0dHIoJ3dpZHRoJywgcGFsZXR0ZVNlbGVjdGVkQ29sb3JTaXplKVxuICAgICAgICAgICAgLmF0dHIoJ2hlaWdodCcsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSlcbiAgICAgICAgICAgIC5maW5kKCdyZWN0JylcbiAgICAgICAgICAgIC5hdHRyKCdyeCcsIHBhbGV0dGVTZWxlY3RlZENvbG9yU2l6ZSAvIDIpXG4gICAgICAgICAgICAuYXR0cigncnknLCBwYWxldHRlU2VsZWN0ZWRDb2xvclNpemUgLyAyKVxuXG4gICAgICAgICAgd2luZG93Lmthbi5jdXJyZW50Q29sb3IgPSAkc3ZnLmZpbmQoJ3JlY3QnKS5hdHRyKCdmaWxsJyk7XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0Q2FudmFzRHJhdygpIHtcblxuICAgIHBhcGVyLnNldHVwKCRjYW52YXNbMF0pO1xuXG4gICAgbGV0IG1pZGRsZSwgYm91bmRzO1xuICAgIGxldCBzaXplcztcbiAgICAvLyBsZXQgcGF0aHMgPSBnZXRGcmVzaFBhdGhzKHdpbmRvdy5rYW4ubnVtUGF0aHMpO1xuICAgIGxldCB0b3VjaCA9IGZhbHNlO1xuICAgIGxldCBsYXN0Q2hpbGQ7XG4gICAgbGV0IHBhdGhEYXRhID0ge307XG4gICAgbGV0IHByZXZBbmdsZSwgcHJldlBvaW50O1xuXG4gICAgbGV0IHNpZGVzO1xuICAgIGxldCBzaWRlO1xuXG4gICAgbGV0IGNvcm5lcnM7XG5cbiAgICBjb25zdCBzb3VuZHMgPSBzb3VuZC5pbml0U2hhcGVTb3VuZHMoKTtcbiAgICBjb25zdCBiZWF0TGVuZ3RoID0gKDYwIC8gY29uZmlnLnNvdW5kLmJwbSk7XG4gICAgY29uc3QgbWVhc3VyZUxlbmd0aCA9IGJlYXRMZW5ndGggKiA0O1xuICAgIGNvbnN0IGNvbXBvc2l0aW9uTGVuZ3RoID0gbWVhc3VyZUxlbmd0aCAqIGNvbmZpZy5zb3VuZC5tZWFzdXJlcztcblxuICAgIGZ1bmN0aW9uIHBhblN0YXJ0KGV2ZW50KSB7XG4gICAgICAvLyBwYXBlci5wcm9qZWN0LmFjdGl2ZUxheWVyLnJlbW92ZUNoaWxkcmVuKCk7IC8vIFJFTU9WRVxuICAgICAgLy8gZHJhd0NpcmNsZSgpO1xuXG4gICAgICBzaXplcyA9IFtdO1xuICAgICAgcHJldkFuZ2xlID0gTWF0aC5hdGFuMihldmVudC52ZWxvY2l0eVksIGV2ZW50LnZlbG9jaXR5WCk7XG5cbiAgICAgIHN0b3BQbGF5aW5nKCk7XG4gICAgICBpZiAocGluY2hpbmcpIHJldHVybjtcbiAgICAgIGlmICghKGV2ZW50LmNoYW5nZWRQb2ludGVycyAmJiBldmVudC5jaGFuZ2VkUG9pbnRlcnMubGVuZ3RoID4gMCkpIHJldHVybjtcbiAgICAgIGlmIChldmVudC5jaGFuZ2VkUG9pbnRlcnMubGVuZ3RoID4gMSkge1xuICAgICAgICBsb2coJ2V2ZW50LmNoYW5nZWRQb2ludGVycyA+IDEnKTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcjtcbiAgICAgIGNvbnN0IHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KTtcblxuICAgICAgYm91bmRzID0gbmV3IFBhdGgoe1xuICAgICAgICBzdHJva2VDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIGZpbGxDb2xvcjogd2luZG93Lmthbi5jdXJyZW50Q29sb3IsXG4gICAgICAgIG5hbWU6ICdib3VuZHMnLFxuICAgICAgICB2aXNpYmxlOiBmYWxzZVxuICAgICAgfSk7XG5cbiAgICAgIG1pZGRsZSA9IG5ldyBQYXRoKHtcbiAgICAgICAgc3Ryb2tlQ29sb3I6IHdpbmRvdy5rYW4uY3VycmVudENvbG9yLFxuICAgICAgICBuYW1lOiAnbWlkZGxlJyxcbiAgICAgICAgc3Ryb2tlV2lkdGg6IDUsXG4gICAgICAgIHZpc2libGU6IHRydWUsXG4gICAgICAgIHN0cm9rZUNhcDogJ3JvdW5kJ1xuICAgICAgfSk7XG5cbiAgICAgIGJvdW5kcy5hZGQocG9pbnQpO1xuICAgICAgbWlkZGxlLmFkZChwb2ludCk7XG5cbiAgICAgIHByZXZQb2ludCA9IHBvaW50O1xuICAgICAgY29ybmVycyA9IFtwb2ludF07XG5cbiAgICAgIHNpZGVzID0gW107XG4gICAgICBzaWRlID0gW3BvaW50XTtcblxuICAgICAgcGF0aERhdGFbc2hhcGUuc3RyaW5naWZ5UG9pbnQocG9pbnQpXSA9IHtcbiAgICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgICBmaXJzdDogdHJ1ZVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCBtaW4gPSAxO1xuICAgIGNvbnN0IG1heCA9IDE1O1xuICAgIGNvbnN0IGFscGhhID0gMC4zO1xuICAgIGNvbnN0IG1lbW9yeSA9IDEwO1xuICAgIHZhciBjdW1EaXN0YW5jZSA9IDA7XG4gICAgbGV0IGN1bVNpemUsIGF2Z1NpemU7XG4gICAgZnVuY3Rpb24gcGFuTW92ZShldmVudCkge1xuICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuICAgICAgLy8gbG9nKGV2ZW50Lm92ZXJhbGxWZWxvY2l0eSk7XG4gICAgICAvLyBsZXQgdGhpc0Rpc3QgPSBwYXJzZUludChldmVudC5kaXN0YW5jZSk7XG4gICAgICAvLyBjdW1EaXN0YW5jZSArPSB0aGlzRGlzdDtcbiAgICAgIC8vXG4gICAgICAvLyBpZiAoY3VtRGlzdGFuY2UgPCAxMDApIHtcbiAgICAgIC8vICAgbG9nKCdpZ25vcmluZycpO1xuICAgICAgLy8gICByZXR1cm47XG4gICAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gICBjdW1EaXN0YW5jZSA9IDA7XG4gICAgICAvLyAgIGxvZygnbm90IGlnbm9yaW5nJyk7XG4gICAgICAvLyB9XG5cbiAgICAgIGNvbnN0IHBvaW50ZXIgPSBldmVudC5jZW50ZXI7XG4gICAgICBsZXQgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICAvLyBhbmdsZSA9IC0xICogZXZlbnQuYW5nbGU7IC8vIG1ha2UgdXAgcG9zaXRpdmUgcmF0aGVyIHRoYW4gbmVnYXRpdmVcbiAgICAgIC8vIGFuZ2xlID0gYW5nbGUgKz0gMTgwO1xuICAgICAgLy8gY29uc29sZS5sb2coZXZlbnQudmVsb2NpdHlYLCBldmVudC52ZWxvY2l0eVkpO1xuICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMihldmVudC52ZWxvY2l0eVksIGV2ZW50LnZlbG9jaXR5WCk7XG4gICAgICBsZXQgYW5nbGVEZWx0YSA9IHV0aWwuYW5nbGVEZWx0YShhbmdsZSwgcHJldkFuZ2xlKTtcbiAgICAgIHByZXZBbmdsZSA9IGFuZ2xlO1xuXG4gICAgICBpZiAoYW5nbGVEZWx0YSA+IHRocmVzaG9sZEFuZ2xlKSB7XG4gICAgICAgIGlmIChzaWRlLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAvLyBjb25zb2xlLmxvZygnY29ybmVyJyk7XG4gICAgICAgICAgbGV0IGNvcm5lclBvaW50ID0gcG9pbnQ7XG4gICAgICAgICAgLy8gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgICAvLyAgIGNlbnRlcjogY29ybmVyUG9pbnQsXG4gICAgICAgICAgLy8gICByYWRpdXM6IDE1LFxuICAgICAgICAgIC8vICAgc3Ryb2tlQ29sb3I6ICdibGFjaydcbiAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICBjb3JuZXJzLnB1c2goY29ybmVyUG9pbnQpO1xuICAgICAgICAgIHNpZGVzLnB1c2goc2lkZSk7XG4gICAgICAgICAgc2lkZSA9IFtdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBzaWRlLnB1c2gocG9pbnQpO1xuICAgICAgLy8gbGV0IGFuZ2xlRGVnID0gLTEgKiBldmVudC5hbmdsZTtcbiAgICAgIC8vIGlmIChhbmdsZURlZyA8IDApIGFuZ2xlRGVnICs9IDM2MDsgLy8gbm9ybWFsaXplIHRvIFswLCAzNjApXG4gICAgICAvLyBhbmdsZSA9IHV0aWwucmFkKGFuZ2xlRGVnKTtcbiAgICAgIC8vXG4gICAgICAvLyAvLyBsZXQgYW5nbGVEZWx0YSA9IE1hdGguYXRhbjIoTWF0aC5zaW4oYW5nbGUpLCBNYXRoLmNvcyhhbmdsZSkpIC0gTWF0aC5hdGFuMihNYXRoLnNpbihwcmV2QW5nbGUpLCBNYXRoLmNvcyhwcmV2QW5nbGUpKTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKGFuZ2xlLCBwcmV2QW5nbGUpO1xuICAgICAgLy8gLy8gY29uc29sZS5sb2coYW5nbGVEZWx0YSk7XG5cbiAgICAgIC8vIGNvbnNvbGUubG9nKGFuZ2xlKTtcblxuICAgICAgLy8gbGV0IGFuZ2xlRGVsdGEgPSBNYXRoLmFicyhwcmV2QW5nbGUgLSBhbmdsZSk7XG4gICAgICAvLyBpZiAoYW5nbGVEZWx0YSA+IDM2MCkgYW5nbGVEZWx0YSA9IGFuZ2xlRGVsdGEgLSAzNjA7XG4gICAgICAvLyBpZiAoYW5nbGVEZWx0YSA+IDkwKSB7XG4gICAgICAvLyAgIGNvbnNvbGUubG9nKGFuZ2xlLCBwcmV2QW5nbGUsIGFuZ2xlRGVsdGEpO1xuICAgICAgLy8gICBjb25zb2xlLmVycm9yKCdjb3JuZXIhJyk7XG4gICAgICAvLyB9IGVsc2Uge1xuICAgICAgLy8gICAvLyBjb25zb2xlLmxvZyhhbmdsZURlbHRhKTtcbiAgICAgIC8vIH1cblxuICAgICAgLy8gd2hpbGUgKHNpemVzLmxlbmd0aCA+IG1lbW9yeSkge1xuICAgICAgLy8gICBzaXplcy5zaGlmdCgpO1xuICAgICAgLy8gfVxuXG4gICAgICAvLyBsZXQgYm90dG9tWCwgYm90dG9tWSwgYm90dG9tLFxuICAgICAgLy8gICB0b3BYLCB0b3BZLCB0b3AsXG4gICAgICAvLyAgIHAwLCBwMSxcbiAgICAgIC8vICAgc3RlcCwgYW5nbGUsIGRpc3QsIHNpemU7XG5cbiAgICAgIC8vIGlmIChzaXplcy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyAgIC8vIG5vdCB0aGUgZmlyc3QgcG9pbnQsIHNvIHdlIGhhdmUgb3RoZXJzIHRvIGNvbXBhcmUgdG9cbiAgICAgIC8vICAgcDAgPSBwcmV2UG9pbnQ7XG4gICAgICAvLyAgIGRpc3QgPSB1dGlsLmRlbHRhKHBvaW50LCBwMCk7XG4gICAgICAvLyAgIHNpemUgPSBkaXN0ICogYWxwaGE7XG4gICAgICAvLyAgIC8vIGlmIChzaXplID49IG1heCkgc2l6ZSA9IG1heDtcbiAgICAgIC8vICAgc2l6ZSA9IE1hdGgubWF4KE1hdGgubWluKHNpemUsIG1heCksIG1pbik7IC8vIGNsYW1wIHNpemUgdG8gW21pbiwgbWF4XVxuICAgICAgLy8gICAvLyBzaXplID0gbWF4IC0gc2l6ZTtcbiAgICAgIC8vXG4gICAgICAvLyAgIGN1bVNpemUgPSAwO1xuICAgICAgLy8gICBmb3IgKGxldCBqID0gMDsgaiA8IHNpemVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAvLyAgICAgY3VtU2l6ZSArPSBzaXplc1tqXTtcbiAgICAgIC8vICAgfVxuICAgICAgLy8gICBhdmdTaXplID0gTWF0aC5yb3VuZCgoKGN1bVNpemUgLyBzaXplcy5sZW5ndGgpICsgc2l6ZSkgLyAyKTtcbiAgICAgIC8vICAgLy8gbG9nKGF2Z1NpemUpO1xuICAgICAgLy9cbiAgICAgIC8vICAgYW5nbGUgPSBNYXRoLmF0YW4yKHBvaW50LnkgLSBwMC55LCBwb2ludC54IC0gcDAueCk7IC8vIHJhZFxuICAgICAgLy9cbiAgICAgIC8vICAgLy8gUG9pbnQoYm90dG9tWCwgYm90dG9tWSkgaXMgYm90dG9tLCBQb2ludCh0b3BYLCB0b3BZKSBpcyB0b3BcbiAgICAgIC8vICAgYm90dG9tWCA9IHBvaW50LnggKyBNYXRoLmNvcyhhbmdsZSArIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgLy8gICBib3R0b21ZID0gcG9pbnQueSArIE1hdGguc2luKGFuZ2xlICsgTWF0aC5QSS8yKSAqIGF2Z1NpemU7XG4gICAgICAvLyAgIGJvdHRvbSA9IG5ldyBQb2ludChib3R0b21YLCBib3R0b21ZKTtcbiAgICAgIC8vXG4gICAgICAvLyAgIHRvcFggPSBwb2ludC54ICsgTWF0aC5jb3MoYW5nbGUgLSBNYXRoLlBJLzIpICogYXZnU2l6ZTtcbiAgICAgIC8vICAgdG9wWSA9IHBvaW50LnkgKyBNYXRoLnNpbihhbmdsZSAtIE1hdGguUEkvMikgKiBhdmdTaXplO1xuICAgICAgLy8gICB0b3AgPSBuZXcgUG9pbnQodG9wWCwgdG9wWSk7XG4gICAgICAvL1xuICAgICAgLy8gICAvLyBib3VuZHMuYWRkKHRvcCk7XG4gICAgICAvLyAgIC8vIGJvdW5kcy5pbnNlcnQoMCwgYm90dG9tKTtcbiAgICAgIC8vICAgLy8gYm91bmRzLnNtb290aCgpO1xuICAgICAgLy9cbiAgICAgIC8vICAgLy8gcGF0aERhdGFbc2hhcGUuc3RyaW5naWZ5UG9pbnQocG9pbnQpXSA9IHtcbiAgICAgIC8vICAgLy8gICBwb2ludDogcG9pbnQsXG4gICAgICAvLyAgIC8vICAgc3BlZWQ6IE1hdGguYWJzKGV2ZW50Lm92ZXJhbGxWZWxvY2l0eSlcbiAgICAgIC8vICAgLy8gfTtcbiAgICAgIC8vICAgLy8gaWYgKHNoYXBlLnN0cmluZ2lmeVBvaW50KHBvaW50KSBpbiBwYXRoRGF0YSkge1xuICAgICAgLy8gICAvLyAgIGxvZygnZHVwbGljYXRlIScpO1xuICAgICAgLy8gICAvLyB9IGVsc2Uge1xuICAgICAgLy8gICAvLyB9XG4gICAgICAvLyAgIC8vIG1pZGRsZS5zbW9vdGgoKTtcbiAgICAgIC8vIH0gZWxzZSB7XG4gICAgICAvLyAgIC8vIGRvbid0IGhhdmUgYW55dGhpbmcgdG8gY29tcGFyZSB0b1xuICAgICAgLy8gICBkaXN0ID0gMTtcbiAgICAgIC8vICAgYW5nbGUgPSAwO1xuICAgICAgLy9cbiAgICAgIC8vICAgc2l6ZSA9IGRpc3QgKiBhbHBoYTtcbiAgICAgIC8vICAgc2l6ZSA9IE1hdGgubWF4KE1hdGgubWluKHNpemUsIG1heCksIG1pbik7IC8vIGNsYW1wIHNpemUgdG8gW21pbiwgbWF4XVxuICAgICAgLy8gfVxuXG4gICAgICBwYXRoRGF0YVtzaGFwZS5zdHJpbmdpZnlQb2ludChwb2ludCldID0ge1xuICAgICAgICBwb2ludDogcG9pbnQsXG4gICAgICAgIHNwZWVkOiBNYXRoLmFicyhldmVudC5vdmVyYWxsVmVsb2NpdHkpLFxuICAgICAgICBhbmdsZTogYW5nbGVcbiAgICAgIH07XG4gICAgICBtaWRkbGUuYWRkKHBvaW50KTtcblxuICAgICAgcGFwZXIudmlldy5kcmF3KCk7XG5cbiAgICAgIHByZXZQb2ludCA9IHBvaW50O1xuICAgICAgLy8gc2l6ZXMucHVzaChzaXplKTtcbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwYW5FbmQoZXZlbnQpIHtcbiAgICAgIGlmIChwaW5jaGluZykgcmV0dXJuO1xuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyO1xuICAgICAgY29uc3QgcG9pbnQgPSBuZXcgUG9pbnQocG9pbnRlci54LCBwb2ludGVyLnkpO1xuXG4gICAgICBsZXQgZ3JvdXAgPSBuZXcgR3JvdXAoW2JvdW5kcywgbWlkZGxlXSk7XG4gICAgICBncm91cC5kYXRhLmNvbG9yID0gYm91bmRzLmZpbGxDb2xvcjtcbiAgICAgIGdyb3VwLmRhdGEudXBkYXRlID0gdHJ1ZTtcblxuICAgICAgYm91bmRzLmFkZChwb2ludCk7XG4gICAgICBib3VuZHMuY2xvc2VkID0gdHJ1ZTtcbiAgICAgIC8vIGJvdW5kcy5zaW1wbGlmeSgpO1xuXG4gICAgICBtaWRkbGUuYWRkKHBvaW50KTtcbiAgICAgIC8vIG1pZGRsZS5zaW1wbGlmeSgpO1xuXG4gICAgICBzaWRlLnB1c2gocG9pbnQpO1xuICAgICAgc2lkZXMucHVzaChzaWRlKTtcblxuICAgICAgcGF0aERhdGFbc2hhcGUuc3RyaW5naWZ5UG9pbnQocG9pbnQpXSA9IHtcbiAgICAgICAgcG9pbnQ6IHBvaW50LFxuICAgICAgICBsYXN0OiB0cnVlXG4gICAgICB9O1xuXG4gICAgICBjb3JuZXJzLnB1c2gocG9pbnQpO1xuXG4gICAgICBtaWRkbGUuc2ltcGxpZnkoKTtcblxuICAgICAgbGV0IHNoYXBlSlNPTiA9IG1pZGRsZS5leHBvcnRKU09OKCk7XG4gICAgICBsZXQgc2hhcGVEYXRhID0gc2hhcGUucHJvY2Vzc1NoYXBlRGF0YShzaGFwZUpTT04pO1xuICAgICAgY29uc29sZS5sb2coc2hhcGVEYXRhKTtcbiAgICAgIGxldCBzaGFwZVByZWRpY3Rpb24gPSBkZXRlY3Rvci5zcG90KHNoYXBlRGF0YSk7XG4gICAgICBsZXQgc2hhcGVQYXR0ZXJuO1xuICAgICAgaWYgKHNoYXBlUHJlZGljdGlvbi5zY29yZSA+IDAuNSkge1xuICAgICAgICBzaGFwZVBhdHRlcm4gPSBzaGFwZVByZWRpY3Rpb24ucGF0dGVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNoYXBlUGF0dGVybiA9IFwib3RoZXJcIjtcbiAgICAgIH1cblxuICAgICAgY29uc29sZS5sb2coJ3NoYXBlIGJlZm9yZScsIHNoYXBlUGF0dGVybiwgc2hhcGVQcmVkaWN0aW9uLnNjb3JlKTs7XG4gICAgICAvLyBtaWRkbGUucmVkdWNlKCk7XG4gICAgICBsZXQgW3RydWVkR3JvdXAsIHRydWVXYXNOZWNlc3NhcnldID0gdXRpbC50cnVlR3JvdXAoZ3JvdXAsIGNvcm5lcnMpO1xuICAgICAgZ3JvdXAucmVwbGFjZVdpdGgodHJ1ZWRHcm91cCk7XG4gICAgICBtaWRkbGUgPSBncm91cC5fbmFtZWRDaGlsZHJlbi5taWRkbGVbMF07XG4gICAgICBtaWRkbGUuc3Ryb2tlQ29sb3IgPSBncm91cC5zdHJva2VDb2xvcjtcbiAgICAgIC8vIG1pZGRsZS5zZWxlY3RlZCA9IHRydWU7XG5cbiAgICAgIC8vIGJvdW5kcy5mbGF0dGVuKDQpO1xuICAgICAgLy8gYm91bmRzLnNtb290aCgpO1xuXG4gICAgICAvLyBtaWRkbGUuZmxhdHRlbig0KTtcbiAgICAgIC8vIG1pZGRsZS5yZWR1Y2UoKTtcblxuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG4gICAgICBpZiAodHJ1ZVdhc05lY2Vzc2FyeSkge1xuICAgICAgICBsZXQgY29tcHV0ZWRDb3JuZXJzID0gc2hhcGUuZ2V0Q29tcHV0ZWRDb3JuZXJzKG1pZGRsZSk7XG4gICAgICAgIGxldCBjb21wdXRlZENvcm5lcnNQYXRoID0gbmV3IFBhdGgoY29tcHV0ZWRDb3JuZXJzKTtcbiAgICAgICAgY29tcHV0ZWRDb3JuZXJzUGF0aC52aXNpYmxlID0gZmFsc2U7XG4gICAgICAgIGxldCBjb21wdXRlZENvcm5lcnNQYXRoTGVuZ3RoID0gY29tcHV0ZWRDb3JuZXJzUGF0aC5sZW5ndGg7XG4gICAgICAgIGlmIChNYXRoLmFicyhjb21wdXRlZENvcm5lcnNQYXRoTGVuZ3RoIC0gbWlkZGxlLmxlbmd0aCkgLyBtaWRkbGUubGVuZ3RoIDw9IDAuMSkge1xuICAgICAgICAgIG1pZGRsZS5yZW1vdmVTZWdtZW50cygpO1xuICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGNvbXB1dGVkQ29ybmVycyk7XG4gICAgICAgICAgbWlkZGxlLnNlZ21lbnRzID0gY29tcHV0ZWRDb3JuZXJzO1xuICAgICAgICAgIC8vIG1pZGRsZS5yZWR1Y2UoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyBpZiAoWydjaXJjbGUnXS5pbmNsdWRlcyhzaGFwZVBhdHRlcm4pKSB7XG4gICAgICAvLyAgIG1pZGRsZS5zaW1wbGlmeSgpO1xuICAgICAgLy8gfVxuXG4gICAgICBsZXQgc3Ryb2tlcyA9IHNoYXBlLmdldFN0cm9rZXMobWlkZGxlLCBwYXRoRGF0YSk7XG4gICAgICBtaWRkbGUucmVwbGFjZVdpdGgoc3Ryb2tlcyk7XG5cbiAgICAgIC8vIG1pZGRsZS5yZWR1Y2UoKTtcblxuICAgICAgICAvLyBtaWRkbGUuc2VsZWN0ZWQgPSBmYWxzZTtcbiAgICAgICAgLy8gbWlkZGxlLnZpc2libGUgPSB0cnVlO1xuICAgICAgICAvLyBtaWRkbGUuc3Ryb2tlQ29sb3IgPSAncGluayc7XG4gICAgICAgIC8vIG1pZGRsZS5zdHJva2VXZWlnaHQgPSA1MDtcblxuXG4gICAgICAgIC8vIGxldCBtZXJnZWRDb3JuZXJzID0gY29ybmVycy5jb25jYXQoY29tcHV0ZWRDb3JuZXJzKTtcbiAgICAgICAgLy8gbGV0IGZvbyA9IG5ldyBQYXRoKG1lcmdlZENvcm5lcnMpO1xuICAgICAgICAvLyBmb28uc3Ryb2tlV2lkdGggPSA1O1xuICAgICAgICAvLyBmb28uc3Ryb2tlQ29sb3IgPSAnYmx1ZSc7XG4gICAgICAgIC8vIGxldCBjb3JuZXJzUGF0aCA9IG5ldyBQYXRoKHtcbiAgICAgICAgLy8gICBzdHJva2VXaWR0aDogNSxcbiAgICAgICAgLy8gICBzdHJva2VDb2xvcjogJ3JlZCdcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIC8vIEJhc2UuZWFjaChtZXJnZWRDb3JuZXJzLCAoY29ybmVyLCBpKSA9PiB7XG4gICAgICAgIC8vICAgY29ybmVyc1BhdGguYWRkKGNvcm5lcik7XG4gICAgICAgIC8vICAgLy8gaWYgKGkgPCAyKSB7XG4gICAgICAgIC8vICAgLy8gICBjb3JuZXJzUGF0aC5hZGQoY29ybmVyKTtcbiAgICAgICAgLy8gICAvLyB9IGVsc2Uge1xuICAgICAgICAvLyAgIC8vICAgbGV0IGNsb3Nlc3RQb2ludCA9IGNvcm5lcnNQYXRoLmdldE5lYXJlc3RQb2ludChjb3JuZXIpO1xuICAgICAgICAvLyAgIC8vICAgY29ybmVyc1BhdGguaW5zZXJ0KGNvcm5lciwgY2xvc2VzdFBvaW50LmluZGV4ICsgMSk7XG4gICAgICAgIC8vICAgLy8gfVxuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gbGV0IGNvcm5lcnNQYXRoID0gbmV3IFBhdGgoe1xuICAgICAgICAvLyAgIHN0cm9rZVdpZHRoOiA1LFxuICAgICAgICAvLyAgIHN0cm9rZUNvbG9yOiAncmVkJyxcbiAgICAgICAgLy8gICBzZWdtZW50czogY29ybmVyc1xuICAgICAgICAvLyB9KTtcbiAgICAgICAgLy8gbGV0IGNvbXB1dGVkQ29ybmVyc1BhdGggPSBuZXcgUGF0aCh7XG4gICAgICAgIC8vICAgc3Ryb2tlV2lkdGg6IDUsXG4gICAgICAgIC8vICAgc3Ryb2tlQ29sb3I6ICdibHVlJyxcbiAgICAgICAgLy8gICBzZWdtZW50czogY29tcHV0ZWRDb3JuZXJzLFxuICAgICAgICAvLyAgIGNsb3NlZDogdHJ1ZVxuICAgICAgICAvLyB9KTtcblxuICAgICAgICAvLyBsZXQgdGhyZXNob2xkRGlzdCA9IDAuMDUgKiBjb21wdXRlZENvcm5lcnNQYXRoLmxlbmd0aDtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gQmFzZS5lYWNoKGNvcm5lcnMsIChjb3JuZXIsIGkpID0+IHtcbiAgICAgICAgLy8gICBsZXQgaW50ZWdlclBvaW50ID0gc2hhcGUuZ2V0SW50ZWdlclBvaW50KGNvcm5lcik7XG4gICAgICAgIC8vICAgbGV0IGNsb3Nlc3RQb2ludCA9IGNvbXB1dGVkQ29ybmVyc1BhdGguZ2V0TmVhcmVzdFBvaW50KGNvcm5lcik7XG4gICAgICAgIC8vIH0pO1xuICAgICAgICAvLyBjb21wdXRlZENvcm5lcnMudmlzaWJsZSA9IGZhbHNlO1xuICAgICAgICAvLyBjb21wdXRlZENvcm5lcnNQYXRoLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgLy8gbGV0IG1lcmdlZENvcm5lcnNQYXRoID0gY29ybmVyc1BhdGgudW5pdGUoY29tcHV0ZWRDb3JuZXJzUGF0aCk7XG4gICAgICAgIC8vIG1lcmdlZENvcm5lcnNQYXRoLnN0cm9rZUNvbG9yID0gJ3B1cnBsZSc7XG4gICAgICAgIC8vIGNvcm5lcnNQYXRoLmZsYXR0ZW4oKTtcbiAgICAgIC8vIH1cblxuICAgICAgLy8gaWYgKHRydWVXYXNOZWNlc3NhcnkpIHtcbiAgICAgIC8vICAgbGV0IGlkZWFsR2VvbWV0cnkgPSBzaGFwZS5nZXRJZGVhbEdlb21ldHJ5KHBhdGhEYXRhLCBzaWRlcywgbWlkZGxlKTtcbiAgICAgIC8vICAgbG9nKGlkZWFsR2VvbWV0cnkpO1xuICAgICAgLy8gICBCYXNlLmVhY2goY29ybmVycywgKGNvcm5lciwgaSkgPT4ge1xuICAgICAgLy8gICAgIGlkZWFsR2VvbWV0cnkuYWRkKGNvcm5lcik7XG4gICAgICAvLyAgIH0pO1xuICAgICAgLy8gICBpZGVhbEdlb21ldHJ5LnJlZHVjZSgpO1xuICAgICAgLy9cbiAgICAgIC8vICAgaWRlYWxHZW9tZXRyeS5zdHJva2VDb2xvciA9ICdyZWQnO1xuICAgICAgLy8gfSBlbHNlIHtcbiAgICAgIC8vICAgbG9nKCdubyB0cnVlaW5nIG5lY2Vzc2FyeScpO1xuICAgICAgLy8gfVxuICAgICAgLy8gbWlkZGxlLnNtb290aCh7XG4gICAgICAvLyAgIHR5cGU6ICdnZW9tZXRyaWMnXG4gICAgICAvLyB9KTtcbiAgICAgIC8vIG1pZGRsZS5mbGF0dGVuKDEwKTtcbiAgICAgIC8vIG1pZGRsZS5zaW1wbGlmeSgpO1xuICAgICAgLy8gbWlkZGxlLmZsYXR0ZW4oMjApO1xuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG4gICAgICAvLyBtaWRkbGUuZmxhdHRlbigpO1xuICAgICAgLy8gbWlkZGxlLnNpbXBsaWZ5KCk7XG5cbiAgICAgIC8vIG1pZGRsZS5zZWxlY3RlZCA9IHRydWU7XG4gICAgICAvLyBsZXQgbWlkZGxlQ2xvbmUgPSBtaWRkbGUuY2xvbmUoKTtcbiAgICAgIC8vIG1pZGRsZUNsb25lLnZpc2libGUgPSB0cnVlO1xuICAgICAgLy8gbWlkZGxlQ2xvbmUuc3Ryb2tlQ29sb3IgPSAncGluayc7XG5cbiAgICAgIC8vIGNoZWNrIHNoYXBlXG4gICAgICBzaGFwZUpTT04gPSBtaWRkbGUuZXhwb3J0SlNPTigpO1xuICAgICAgc2hhcGVEYXRhID0gc2hhcGUucHJvY2Vzc1NoYXBlRGF0YShzaGFwZUpTT04pO1xuICAgICAgc2hhcGVQcmVkaWN0aW9uID0gZGV0ZWN0b3Iuc3BvdChzaGFwZURhdGEpO1xuICAgICAgaWYgKHNoYXBlUHJlZGljdGlvbi5zY29yZSA+IDAuNikge1xuICAgICAgICBzaGFwZVBhdHRlcm4gPSBzaGFwZVByZWRpY3Rpb24ucGF0dGVybjtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHNoYXBlUGF0dGVybiA9IFwib3RoZXJcIjtcbiAgICAgIH1cbiAgICAgIGNvbnN0IGNvbG9yTmFtZSA9IGNvbG9yLmdldENvbG9yTmFtZSh3aW5kb3cua2FuLmN1cnJlbnRDb2xvcik7XG5cbiAgICAgIC8vIGdldCBzaXplXG4gICAgICBjb25zdCBxdWFudGl6ZWRTb3VuZFN0YXJ0VGltZSA9IHNvdW5kLnF1YW50aXplTGVuZ3RoKGdyb3VwLmJvdW5kcy54IC8gdmlld1dpZHRoICogY29tcG9zaXRpb25MZW5ndGgpICogMTAwMDsgLy8gbXNcbiAgICAgIGNvbnN0IHF1YW50aXplZFNvdW5kRHVyYXRpb24gPSBzb3VuZC5xdWFudGl6ZUxlbmd0aChncm91cC5ib3VuZHMud2lkdGggLyB2aWV3V2lkdGggKiBjb21wb3NpdGlvbkxlbmd0aCkgKiAxMDAwOyAvLyBtc1xuXG4gICAgICAvLyBjb25zb2xlLmxvZyhjb25maWcuc2hhcGVzW3NoYXBlUGF0dGVybl0pO1xuICAgICAgLy8gY29uc29sZS5sb2coc291bmRzW3NoYXBlUGF0dGVybl0pO1xuICAgICAgY29uc3QgcGxheVNvdW5kcyA9IGZhbHNlO1xuICAgICAgbGV0IGNvbXBvc2l0aW9uT2JqID0ge307XG4gICAgICBjb21wb3NpdGlvbk9iai5zb3VuZCA9IHNvdW5kc1tzaGFwZVBhdHRlcm5dO1xuICAgICAgY29tcG9zaXRpb25PYmouc3RhcnRUaW1lID0gcXVhbnRpemVkU291bmRTdGFydFRpbWU7XG4gICAgICBjb21wb3NpdGlvbk9iai5kdXJhdGlvbiA9IHF1YW50aXplZFNvdW5kRHVyYXRpb247XG4gICAgICBjb21wb3NpdGlvbk9iai5ncm91cElkID0gZ3JvdXAuaWQ7XG4gICAgICBpZiAoY29uZmlnLnNoYXBlc1tzaGFwZVBhdHRlcm5dLnNwcml0ZSkge1xuICAgICAgICBjb21wb3NpdGlvbk9iai5zcHJpdGUgPSB0cnVlO1xuICAgICAgICBjb21wb3NpdGlvbk9iai5zcHJpdGVOYW1lID0gY29sb3JOYW1lO1xuXG4gICAgICAgIGlmIChwbGF5U291bmRzKSB7XG4gICAgICAgICAgc291bmRzW3NoYXBlUGF0dGVybl0ucGxheShjb2xvck5hbWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb21wb3NpdGlvbk9iai5zcHJpdGUgPSBmYWxzZTtcblxuICAgICAgICBpZiAocGxheVNvdW5kcykge1xuICAgICAgICAgIHNvdW5kc1tzaGFwZVBhdHRlcm5dLnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBjb21wb3NpdGlvbi5wdXNoKGNvbXBvc2l0aW9uT2JqKTtcblxuICAgICAgLy8gc2V0IHNvdW5kIHRvIGxvb3AgYWdhaW5cbiAgICAgIGNvbnNvbGUubG9nKGAke3NoYXBlUGF0dGVybn0tJHtjb2xvck5hbWV9YCk7XG5cbiAgICAgIGxldCBpbnRlcnNlY3Rpb25zID0gbWlkZGxlLmdldENyb3NzaW5ncygpO1xuICAgICAgaWYgKGludGVyc2VjdGlvbnMubGVuZ3RoID4gMCkge1xuICAgICAgICAvLyB3ZSBjcmVhdGUgYSBjb3B5IG9mIHRoZSBwYXRoIGJlY2F1c2UgcmVzb2x2ZUNyb3NzaW5ncygpIHNwbGl0cyBzb3VyY2UgcGF0aFxuICAgICAgICBsZXQgcGF0aENvcHkgPSBuZXcgUGF0aCgpO1xuICAgICAgICBwYXRoQ29weS5jb3B5Q29udGVudChtaWRkbGUpO1xuICAgICAgICBwYXRoQ29weS52aXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgbGV0IGRpdmlkZWRQYXRoID0gcGF0aENvcHkucmVzb2x2ZUNyb3NzaW5ncygpO1xuICAgICAgICBkaXZpZGVkUGF0aC52aXNpYmxlID0gZmFsc2U7XG5cblxuICAgICAgICBsZXQgZW5jbG9zZWRMb29wcyA9IHV0aWwuZmluZEludGVyaW9yQ3VydmVzKGRpdmlkZWRQYXRoKTtcblxuICAgICAgICBpZiAoZW5jbG9zZWRMb29wcykge1xuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZW5jbG9zZWRMb29wcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uY2xvc2VkID0gdHJ1ZTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uZmlsbENvbG9yID0gZ3JvdXAuc3Ryb2tlQ29sb3I7XG4gICAgICAgICAgICBlbmNsb3NlZExvb3BzW2ldLmRhdGEuaW50ZXJpb3IgPSB0cnVlO1xuICAgICAgICAgICAgZW5jbG9zZWRMb29wc1tpXS5kYXRhLnRyYW5zcGFyZW50ID0gZmFsc2U7XG4gICAgICAgICAgICAvLyBlbmNsb3NlZExvb3BzW2ldLmJsZW5kTW9kZSA9ICdtdWx0aXBseSc7XG4gICAgICAgICAgICBncm91cC5hZGRDaGlsZChlbmNsb3NlZExvb3BzW2ldKTtcbiAgICAgICAgICAgIGVuY2xvc2VkTG9vcHNbaV0uc2VuZFRvQmFjaygpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBwYXRoQ29weS5yZW1vdmUoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGlmIChtaWRkbGUuY2xvc2VkKSB7XG4gICAgICAgICAgbGV0IGVuY2xvc2VkTG9vcCA9IG1pZGRsZS5jbG9uZSgpO1xuICAgICAgICAgIGVuY2xvc2VkTG9vcC52aXNpYmxlID0gdHJ1ZTtcbiAgICAgICAgICBlbmNsb3NlZExvb3AuZmlsbENvbG9yID0gZ3JvdXAuc3Ryb2tlQ29sb3I7XG4gICAgICAgICAgZW5jbG9zZWRMb29wLmRhdGEuaW50ZXJpb3IgPSB0cnVlO1xuICAgICAgICAgIGVuY2xvc2VkTG9vcC5kYXRhLnRyYW5zcGFyZW50ID0gZmFsc2U7XG4gICAgICAgICAgZ3JvdXAuYWRkQ2hpbGQoZW5jbG9zZWRMb29wKTtcbiAgICAgICAgICBlbmNsb3NlZExvb3Auc2VuZFRvQmFjaygpO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIGdyb3VwLmRhdGEuY29sb3IgPSBib3VuZHMuZmlsbENvbG9yO1xuICAgICAgZ3JvdXAuZGF0YS5zY2FsZSA9IDE7IC8vIGluaXQgdmFyaWFibGUgdG8gdHJhY2sgc2NhbGUgY2hhbmdlc1xuICAgICAgZ3JvdXAuZGF0YS5yb3RhdGlvbiA9IDA7IC8vIGluaXQgdmFyaWFibGUgdG8gdHJhY2sgcm90YXRpb24gY2hhbmdlc1xuXG4gICAgICBsZXQgY2hpbGRyZW4gPSBncm91cC5nZXRJdGVtcyh7XG4gICAgICAgIG1hdGNoOiBmdW5jdGlvbihpdGVtKSB7XG4gICAgICAgICAgcmV0dXJuIGl0ZW0ubmFtZSAhPT0gJ21pZGRsZSdcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIGxvZygnLS0tLS0nKTtcbiAgICAgIC8vIGxvZyhncm91cCk7XG4gICAgICAvLyBsb2coY2hpbGRyZW4pO1xuICAgICAgLy8gZ3JvdXAuc2VsZWN0ZWQgPSB0cnVlO1xuICAgICAgbGV0IHVuaXRlZFBhdGggPSBuZXcgUGF0aCgpO1xuICAgICAgaWYgKGNoaWxkcmVuLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgbGV0IGFjY3VtdWxhdG9yID0gbmV3IFBhdGgoKTtcbiAgICAgICAgYWNjdW11bGF0b3IuY29weUNvbnRlbnQoY2hpbGRyZW5bMF0pO1xuICAgICAgICBhY2N1bXVsYXRvci52aXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPCBjaGlsZHJlbi5sZW5ndGg7IGkrKykge1xuICAgICAgICAgIGxldCBvdGhlclBhdGggPSBuZXcgUGF0aCgpO1xuICAgICAgICAgIG90aGVyUGF0aC5jb3B5Q29udGVudChjaGlsZHJlbltpXSk7XG4gICAgICAgICAgb3RoZXJQYXRoLnZpc2libGUgPSBmYWxzZTtcblxuICAgICAgICAgIHVuaXRlZFBhdGggPSBhY2N1bXVsYXRvci51bml0ZShvdGhlclBhdGgpO1xuICAgICAgICAgIG90aGVyUGF0aC5yZW1vdmUoKTtcbiAgICAgICAgICBhY2N1bXVsYXRvciA9IHVuaXRlZFBhdGg7XG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gY2hpbGRyZW5bMF0gaXMgdW5pdGVkIGdyb3VwXG4gICAgICAgIHVuaXRlZFBhdGguY29weUNvbnRlbnQoY2hpbGRyZW5bMF0pO1xuICAgICAgfVxuXG4gICAgICB1bml0ZWRQYXRoLnZpc2libGUgPSBmYWxzZTtcbiAgICAgIHVuaXRlZFBhdGguZGF0YS5uYW1lID0gJ21hc2snO1xuXG4gICAgICBncm91cC5hZGRDaGlsZCh1bml0ZWRQYXRoKTtcbiAgICAgIHVuaXRlZFBhdGguc2VuZFRvQmFjaygpO1xuXG4gICAgICAvLyBtaWRkbGUuc2VsZWN0ZWQgPSB0cnVlXG5cbiAgICAgIGxhc3RDaGlsZCA9IGdyb3VwO1xuXG4gICAgICBNT1ZFUy5wdXNoKHtcbiAgICAgICAgdHlwZTogJ25ld0dyb3VwJyxcbiAgICAgICAgaWQ6IGdyb3VwLmlkXG4gICAgICB9KTtcblxuICAgICAgaWYgKHJ1bkFuaW1hdGlvbnMpIHtcbiAgICAgICAgZ3JvdXAuYW5pbWF0ZShcbiAgICAgICAgICBbe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMC45XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgc2V0dGluZ3M6IHtcbiAgICAgICAgICAgICAgZHVyYXRpb246IDEwMCxcbiAgICAgICAgICAgICAgZWFzaW5nOiBcImVhc2VPdXRcIixcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LFxuICAgICAgICAgIHtcbiAgICAgICAgICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgICAgICAgc2NhbGU6IDEuMTFcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBzZXR0aW5nczoge1xuICAgICAgICAgICAgICBkdXJhdGlvbjogMTAwLFxuICAgICAgICAgICAgICBlYXNpbmc6IFwiZWFzZUluXCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfV1cbiAgICAgICAgKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZXQgcGluY2hpbmc7XG4gICAgbGV0IHBpbmNoZWRHcm91cCwgbGFzdFNjYWxlLCBsYXN0Um90YXRpb247XG4gICAgbGV0IG9yaWdpbmFsUG9zaXRpb24sIG9yaWdpbmFsUm90YXRpb24sIG9yaWdpbmFsU2NhbGU7XG5cbiAgICBmdW5jdGlvbiBwaW5jaFN0YXJ0KGV2ZW50KSB7XG4gICAgICBjb25zb2xlLmxvZygncGluY2hTdGFydCcsIGV2ZW50LmNlbnRlcik7XG4gICAgICBzdG9wUGxheWluZygpO1xuXG4gICAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykuc2V0KHtlbmFibGU6IGZhbHNlfSk7XG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyLFxuICAgICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KSxcbiAgICAgICAgICBoaXRSZXN1bHQgPSBoaXRUZXN0R3JvdXBCb3VuZHMocG9pbnQpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIHBpbmNoaW5nID0gdHJ1ZTtcbiAgICAgICAgLy8gcGluY2hlZEdyb3VwID0gaGl0UmVzdWx0Lml0ZW0ucGFyZW50O1xuICAgICAgICBwaW5jaGVkR3JvdXAgPSBoaXRSZXN1bHQ7XG4gICAgICAgIGxhc3RTY2FsZSA9IDE7XG4gICAgICAgIGxhc3RSb3RhdGlvbiA9IGV2ZW50LnJvdGF0aW9uO1xuXG4gICAgICAgIG9yaWdpbmFsUG9zaXRpb24gPSBwaW5jaGVkR3JvdXAucG9zaXRpb247XG4gICAgICAgIC8vIG9yaWdpbmFsUm90YXRpb24gPSBwaW5jaGVkR3JvdXAucm90YXRpb247XG4gICAgICAgIG9yaWdpbmFsUm90YXRpb24gPSBwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbjtcbiAgICAgICAgb3JpZ2luYWxTY2FsZSA9IHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlO1xuXG4gICAgICAgIGlmIChydW5BbmltYXRpb25zKSB7XG4gICAgICAgICAgcGluY2hlZEdyb3VwLmFuaW1hdGUoe1xuICAgICAgICAgICAgcHJvcGVydGllczoge1xuICAgICAgICAgICAgICBzY2FsZTogMS4yNVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldHRpbmdzOiB7XG4gICAgICAgICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgICAgICAgIGVhc2luZzogXCJlYXNlT3V0XCIsXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBpbmNoZWRHcm91cCA9IG51bGw7XG4gICAgICAgIGxvZygnaGl0IG5vIGl0ZW0nKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBmdW5jdGlvbiBwaW5jaE1vdmUoZXZlbnQpIHtcbiAgICAgIGxvZygncGluY2hNb3ZlJyk7XG4gICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgaWYgKCEhcGluY2hlZEdyb3VwKSB7XG4gICAgICAgIC8vIGxvZygncGluY2htb3ZlJywgZXZlbnQpO1xuICAgICAgICAvLyBsb2cocGluY2hlZEdyb3VwKTtcbiAgICAgICAgbGV0IGN1cnJlbnRTY2FsZSA9IGV2ZW50LnNjYWxlO1xuICAgICAgICBsZXQgc2NhbGVEZWx0YSA9IGN1cnJlbnRTY2FsZSAvIGxhc3RTY2FsZTtcbiAgICAgICAgLy8gbG9nKGxhc3RTY2FsZSwgY3VycmVudFNjYWxlLCBzY2FsZURlbHRhKTtcbiAgICAgICAgbGFzdFNjYWxlID0gY3VycmVudFNjYWxlO1xuXG4gICAgICAgIGxldCBjdXJyZW50Um90YXRpb24gPSBldmVudC5yb3RhdGlvbjtcbiAgICAgICAgbGV0IHJvdGF0aW9uRGVsdGEgPSBjdXJyZW50Um90YXRpb24gLSBsYXN0Um90YXRpb247XG4gICAgICAgIGxvZyhsYXN0Um90YXRpb24sIGN1cnJlbnRSb3RhdGlvbiwgcm90YXRpb25EZWx0YSk7XG4gICAgICAgIGxhc3RSb3RhdGlvbiA9IGN1cnJlbnRSb3RhdGlvbjtcblxuICAgICAgICAvLyBsb2coYHNjYWxpbmcgYnkgJHtzY2FsZURlbHRhfWApO1xuICAgICAgICAvLyBsb2coYHJvdGF0aW5nIGJ5ICR7cm90YXRpb25EZWx0YX1gKTtcblxuICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24gPSBldmVudC5jZW50ZXI7XG4gICAgICAgIHBpbmNoZWRHcm91cC5zY2FsZShzY2FsZURlbHRhKTtcbiAgICAgICAgcGluY2hlZEdyb3VwLnJvdGF0ZShyb3RhdGlvbkRlbHRhKTtcblxuICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS5zY2FsZSAqPSBzY2FsZURlbHRhO1xuICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS5yb3RhdGlvbiArPSByb3RhdGlvbkRlbHRhO1xuICAgICAgfVxuICAgIH1cblxuICAgIGxldCBsYXN0RXZlbnQ7XG4gICAgZnVuY3Rpb24gcGluY2hFbmQoZXZlbnQpIHtcbiAgICAgIC8vIHdhaXQgMjUwIG1zIHRvIHByZXZlbnQgbWlzdGFrZW4gcGFuIHJlYWRpbmdzXG4gICAgICBsYXN0RXZlbnQgPSBldmVudDtcbiAgICAgIGlmICghIXBpbmNoZWRHcm91cCkge1xuICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS51cGRhdGUgPSB0cnVlO1xuICAgICAgICBsZXQgbW92ZSA9IHtcbiAgICAgICAgICBpZDogcGluY2hlZEdyb3VwLmlkLFxuICAgICAgICAgIHR5cGU6ICd0cmFuc2Zvcm0nXG4gICAgICAgIH07XG4gICAgICAgIGlmIChwaW5jaGVkR3JvdXAucG9zaXRpb24gIT0gb3JpZ2luYWxQb3NpdGlvbikge1xuICAgICAgICAgIG1vdmUucG9zaXRpb24gPSBvcmlnaW5hbFBvc2l0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uICE9IG9yaWdpbmFsUm90YXRpb24pIHtcbiAgICAgICAgICBtb3ZlLnJvdGF0aW9uID0gb3JpZ2luYWxSb3RhdGlvbiAtIHBpbmNoZWRHcm91cC5kYXRhLnJvdGF0aW9uO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlICE9IG9yaWdpbmFsU2NhbGUpIHtcbiAgICAgICAgICBtb3ZlLnNjYWxlID0gb3JpZ2luYWxTY2FsZSAvIHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlO1xuICAgICAgICB9XG5cbiAgICAgICAgbG9nKCdmaW5hbCBzY2FsZScsIHBpbmNoZWRHcm91cC5kYXRhLnNjYWxlKTtcbiAgICAgICAgbG9nKG1vdmUpO1xuXG4gICAgICAgIE1PVkVTLnB1c2gobW92ZSk7XG5cbiAgICAgICAgaWYgKE1hdGguYWJzKGV2ZW50LnZlbG9jaXR5KSA+IDEpIHtcbiAgICAgICAgICAvLyBkaXNwb3NlIG9mIGdyb3VwIG9mZnNjcmVlblxuICAgICAgICAgIHRocm93UGluY2hlZEdyb3VwKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBpZiAocnVuQW5pbWF0aW9ucykge1xuICAgICAgICAvLyAgIHBpbmNoZWRHcm91cC5hbmltYXRlKHtcbiAgICAgICAgLy8gICAgIHByb3BlcnRpZXM6IHtcbiAgICAgICAgLy8gICAgICAgc2NhbGU6IDAuOFxuICAgICAgICAvLyAgICAgfSxcbiAgICAgICAgLy8gICAgIHNldHRpbmdzOiB7XG4gICAgICAgIC8vICAgICAgIGR1cmF0aW9uOiAxMDAsXG4gICAgICAgIC8vICAgICAgIGVhc2luZzogXCJlYXNlT3V0XCIsXG4gICAgICAgIC8vICAgICB9XG4gICAgICAgIC8vICAgfSk7XG4gICAgICAgIC8vIH1cbiAgICAgIH1cbiAgICAgIHBpbmNoaW5nID0gZmFsc2U7XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykuc2V0KHtlbmFibGU6IHRydWV9KTtcbiAgICAgIH0sIDI1MCk7XG4gICAgfVxuXG4gICAgY29uc3QgaGl0T3B0aW9ucyA9IHtcbiAgICAgIHNlZ21lbnRzOiBmYWxzZSxcbiAgICAgIHN0cm9rZTogdHJ1ZSxcbiAgICAgIGZpbGw6IHRydWUsXG4gICAgICB0b2xlcmFuY2U6IDVcbiAgICB9O1xuXG4gICAgZnVuY3Rpb24gc2luZ2xlVGFwKGV2ZW50KSB7XG4gICAgICBzdG9wUGxheWluZygpO1xuXG4gICAgICBjb25zdCBwb2ludGVyID0gZXZlbnQuY2VudGVyLFxuICAgICAgICAgIHBvaW50ID0gbmV3IFBvaW50KHBvaW50ZXIueCwgcG9pbnRlci55KSxcbiAgICAgICAgICBoaXRSZXN1bHQgPSBwYXBlci5wcm9qZWN0LmhpdFRlc3QocG9pbnQsIGhpdE9wdGlvbnMpO1xuXG4gICAgICBpZiAoaGl0UmVzdWx0KSB7XG4gICAgICAgIGxldCBpdGVtID0gaGl0UmVzdWx0Lml0ZW07XG4gICAgICAgIGl0ZW0uc2VsZWN0ZWQgPSAhaXRlbS5zZWxlY3RlZDtcbiAgICAgICAgbG9nKGl0ZW0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGZ1bmN0aW9uIGRvdWJsZVRhcChldmVudCkge1xuICAgICAgY29uc3QgcG9pbnRlciA9IGV2ZW50LmNlbnRlcixcbiAgICAgICAgICBwb2ludCA9IG5ldyBQb2ludChwb2ludGVyLngsIHBvaW50ZXIueSksXG4gICAgICAgICAgaGl0UmVzdWx0ID0gcGFwZXIucHJvamVjdC5oaXRUZXN0KHBvaW50LCBoaXRPcHRpb25zKTtcblxuICAgICAgaWYgKGhpdFJlc3VsdCkge1xuICAgICAgICBsZXQgaXRlbSA9IGhpdFJlc3VsdC5pdGVtO1xuICAgICAgICBsZXQgcGFyZW50ID0gaXRlbS5wYXJlbnQ7XG5cbiAgICAgICAgaWYgKGl0ZW0uZGF0YS5pbnRlcmlvcikge1xuICAgICAgICAgIGl0ZW0uZGF0YS50cmFuc3BhcmVudCA9ICFpdGVtLmRhdGEudHJhbnNwYXJlbnQ7XG5cbiAgICAgICAgICBpZiAoaXRlbS5kYXRhLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IHRyYW5zcGFyZW50O1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IHBhcmVudC5kYXRhLmNvbG9yO1xuICAgICAgICAgICAgaXRlbS5zdHJva2VDb2xvciA9IHBhcmVudC5kYXRhLmNvbG9yO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIE1PVkVTLnB1c2goe1xuICAgICAgICAgICAgdHlwZTogJ2ZpbGxDaGFuZ2UnLFxuICAgICAgICAgICAgaWQ6IGl0ZW0uaWQsXG4gICAgICAgICAgICBmaWxsOiBwYXJlbnQuZGF0YS5jb2xvcixcbiAgICAgICAgICAgIHRyYW5zcGFyZW50OiBpdGVtLmRhdGEudHJhbnNwYXJlbnRcbiAgICAgICAgICB9KTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBsb2coJ25vdCBpbnRlcmlvcicpXG4gICAgICAgIH1cblxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcGluY2hlZEdyb3VwID0gbnVsbDtcbiAgICAgICAgbG9nKCdoaXQgbm8gaXRlbScpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHZlbG9jaXR5TXVsdGlwbGllciA9IDI1O1xuICAgIGZ1bmN0aW9uIHRocm93UGluY2hlZEdyb3VwKCkge1xuICAgICAgbG9nKHBpbmNoZWRHcm91cC5wb3NpdGlvbik7XG4gICAgICBpZiAocGluY2hlZEdyb3VwLnBvc2l0aW9uLnggPD0gMCAtIHBpbmNoZWRHcm91cC5ib3VuZHMud2lkdGggfHxcbiAgICAgICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueCA+PSB2aWV3V2lkdGggKyBwaW5jaGVkR3JvdXAuYm91bmRzLndpZHRoIHx8XG4gICAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnkgPD0gMCAtIHBpbmNoZWRHcm91cC5ib3VuZHMuaGVpZ2h0IHx8XG4gICAgICAgICAgcGluY2hlZEdyb3VwLnBvc2l0aW9uLnkgPj0gdmlld0hlaWdodCArIHBpbmNoZWRHcm91cC5ib3VuZHMuaGVpZ2h0KSB7XG4gICAgICAgICAgICBwaW5jaGVkR3JvdXAuZGF0YS5vZmZTY3JlZW4gPSB0cnVlO1xuICAgICAgICAgICAgcGluY2hlZEdyb3VwLnZpc2libGUgPSBmYWxzZTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgcmVxdWVzdEFuaW1hdGlvbkZyYW1lKHRocm93UGluY2hlZEdyb3VwKTtcbiAgICAgIHBpbmNoZWRHcm91cC5wb3NpdGlvbi54ICs9IGxhc3RFdmVudC52ZWxvY2l0eVggKiB2ZWxvY2l0eU11bHRpcGxpZXI7XG4gICAgICBwaW5jaGVkR3JvdXAucG9zaXRpb24ueSArPSBsYXN0RXZlbnQudmVsb2NpdHlZICogdmVsb2NpdHlNdWx0aXBsaWVyO1xuICAgIH1cblxuICAgIHZhciBoYW1tZXJNYW5hZ2VyID0gbmV3IEhhbW1lci5NYW5hZ2VyKCRjYW52YXNbMF0pO1xuXG4gICAgaGFtbWVyTWFuYWdlci5hZGQobmV3IEhhbW1lci5UYXAoeyBldmVudDogJ2RvdWJsZXRhcCcsIHRhcHM6IDIgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuVGFwKHsgZXZlbnQ6ICdzaW5nbGV0YXAnIH0pKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmFkZChuZXcgSGFtbWVyLlBhbih7IGRpcmVjdGlvbjogSGFtbWVyLkRJUkVDVElPTl9BTEwgfSkpO1xuICAgIGhhbW1lck1hbmFnZXIuYWRkKG5ldyBIYW1tZXIuUGluY2goKSk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgnZG91YmxldGFwJykucmVjb2duaXplV2l0aCgnc2luZ2xldGFwJyk7XG4gICAgaGFtbWVyTWFuYWdlci5nZXQoJ3NpbmdsZXRhcCcpLnJlcXVpcmVGYWlsdXJlKCdkb3VibGV0YXAnKTtcbiAgICBoYW1tZXJNYW5hZ2VyLmdldCgncGFuJykucmVxdWlyZUZhaWx1cmUoJ3BpbmNoJyk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdzaW5nbGV0YXAnLCBzaW5nbGVUYXApO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ2RvdWJsZXRhcCcsIGRvdWJsZVRhcCk7XG5cbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5zdGFydCcsIHBhblN0YXJ0KTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwYW5tb3ZlJywgcGFuTW92ZSk7XG4gICAgaGFtbWVyTWFuYWdlci5vbigncGFuZW5kJywgcGFuRW5kKTtcblxuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoc3RhcnQnLCBwaW5jaFN0YXJ0KTtcbiAgICBoYW1tZXJNYW5hZ2VyLm9uKCdwaW5jaG1vdmUnLCBwaW5jaE1vdmUpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoZW5kJywgcGluY2hFbmQpO1xuICAgIGhhbW1lck1hbmFnZXIub24oJ3BpbmNoY2FuY2VsJywgZnVuY3Rpb24oKSB7IGhhbW1lck1hbmFnZXIuZ2V0KCdwYW4nKS5zZXQoe2VuYWJsZTogdHJ1ZX0pOyB9KTsgLy8gbWFrZSBzdXJlIGl0J3MgcmVlbmFibGVkXG4gIH1cblxuICBjb25zdCBwbGF5aW5nQ2xhc3MgPSAncGxheWluZyc7XG4gIGZ1bmN0aW9uIG5ld1ByZXNzZWQoKSB7XG4gICAgbG9nKCduZXcgcHJlc3NlZCcpO1xuICAgIGNvbXBvc2l0aW9uID0gW107XG4gICAgcGFwZXIucHJvamVjdC5hY3RpdmVMYXllci5yZW1vdmVDaGlsZHJlbigpO1xuICB9XG5cbiAgZnVuY3Rpb24gdW5kb1ByZXNzZWQoKSB7XG4gICAgbG9nKCd1bmRvIHByZXNzZWQnKTtcbiAgICBpZiAoIShNT1ZFUy5sZW5ndGggPiAwKSkge1xuICAgICAgbG9nKCdubyBtb3ZlcyB5ZXQnKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgbGFzdE1vdmUgPSBNT1ZFUy5wb3AoKTtcbiAgICBsZXQgaXRlbSA9IHByb2plY3QuZ2V0SXRlbSh7XG4gICAgICBpZDogbGFzdE1vdmUuaWRcbiAgICB9KTtcblxuICAgIGlmIChpdGVtKSB7XG4gICAgICBpdGVtLnZpc2libGUgPSB0cnVlOyAvLyBtYWtlIHN1cmVcbiAgICAgIHN3aXRjaChsYXN0TW92ZS50eXBlKSB7XG4gICAgICAgIGNhc2UgJ25ld0dyb3VwJzpcbiAgICAgICAgICBsb2coJ3JlbW92aW5nIGdyb3VwJyk7XG4gICAgICAgICAgaXRlbS5yZW1vdmUoKTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgY2FzZSAnZmlsbENoYW5nZSc6XG4gICAgICAgICAgaWYgKGxhc3RNb3ZlLnRyYW5zcGFyZW50KSB7XG4gICAgICAgICAgICBpdGVtLmZpbGxDb2xvciA9IGxhc3RNb3ZlLmZpbGw7XG4gICAgICAgICAgICBpdGVtLnN0cm9rZUNvbG9yID0gbGFzdE1vdmUuZmlsbDtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgaXRlbS5maWxsQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICAgIGl0ZW0uc3Ryb2tlQ29sb3IgPSB0cmFuc3BhcmVudDtcbiAgICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3RyYW5zZm9ybSc6XG4gICAgICAgICAgaWYgKCEhbGFzdE1vdmUucG9zaXRpb24pIHtcbiAgICAgICAgICAgIGl0ZW0ucG9zaXRpb24gPSBsYXN0TW92ZS5wb3NpdGlvblxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5yb3RhdGlvbikge1xuICAgICAgICAgICAgaXRlbS5yb3RhdGlvbiA9IGxhc3RNb3ZlLnJvdGF0aW9uO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoISFsYXN0TW92ZS5zY2FsZSkge1xuICAgICAgICAgICAgaXRlbS5zY2FsZShsYXN0TW92ZS5zY2FsZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgIGxvZygndW5rbm93biBjYXNlJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZygnY291bGQgbm90IGZpbmQgbWF0Y2hpbmcgaXRlbScpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHN0b3BQbGF5aW5nKG11dGUgPSBmYWxzZSkge1xuICAgIGlmICghIW11dGUpIHtcbiAgICAgIEhvd2xlci5tdXRlKHRydWUpO1xuICAgIH1cbiAgICAkYm9keS5yZW1vdmVDbGFzcyhwbGF5aW5nQ2xhc3MpO1xuXG4gICAgcGxheWluZyA9IGZhbHNlO1xuICAgIHNvdW5kLnN0b3BDb21wb3NpdGlvbihjb21wb3NpdGlvbkludGVydmFsKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHN0YXJ0UGxheWluZygpIHtcbiAgICAkYm9keS5hZGRDbGFzcyhwbGF5aW5nQ2xhc3MpO1xuICAgIEhvd2xlci5tdXRlKGZhbHNlKTtcbiAgICBwbGF5aW5nID0gdHJ1ZTtcbiAgICBjb21wb3NpdGlvbkludGVydmFsID0gc291bmQuc3RhcnRDb21wb3NpdGlvbihjb21wb3NpdGlvbik7XG4gIH1cblxuICBmdW5jdGlvbiBwbGF5UHJlc3NlZCgpIHtcbiAgICBsb2coJ3BsYXkgcHJlc3NlZCcpO1xuICAgIGlmIChwbGF5aW5nKSB7XG4gICAgICBzdG9wUGxheWluZyh0cnVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc3RhcnRQbGF5aW5nKCk7XG4gICAgfVxuICAgIGNvbnNvbGUubG9nKCdwbGF5IHByZXNzZWQnKTtcbiAgfVxuXG4gIGZ1bmN0aW9uIHRpcHNQcmVzc2VkKCkge1xuICAgIGxvZygndGlwcyBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiBzaGFyZVByZXNzZWQoKSB7XG4gICAgbG9nKCdzaGFyZSBwcmVzc2VkJyk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0TmV3KCkge1xuICAgICQoJy5tYWluLWNvbnRyb2xzIC5uZXcnKS5vbignY2xpY2sgdGFwIHRvdWNoJywgZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoISRib2R5Lmhhc0NsYXNzKHBsYXlpbmdDbGFzcykpIHtcbiAgICAgICAgbmV3UHJlc3NlZCgpO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFVuZG8oKSB7XG4gICAgJCgnLm1haW4tY29udHJvbHMgLnVuZG8nKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghJGJvZHkuaGFzQ2xhc3MocGxheWluZ0NsYXNzKSkge1xuICAgICAgICB1bmRvUHJlc3NlZCgpXG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0UGxheSgpIHtcbiAgICAkKCcubWFpbi1jb250cm9scyAucGxheS1zdG9wJykub24oJ2NsaWNrJywgcGxheVByZXNzZWQpO1xuICB9XG5cbiAgZnVuY3Rpb24gaW5pdFRpcHMoKSB7XG4gICAgJCgnLmF1eC1jb250cm9scyAudGlwcycpLm9uKCdjbGljaycsIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKCEkYm9keS5oYXNDbGFzcyhwbGF5aW5nQ2xhc3MpKSB7XG4gICAgICAgIHRpcHNQcmVzc2VkKCk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cblxuICBmdW5jdGlvbiBpbml0U2hhcmUoKSB7XG4gICAgJCgnLmF1eC1jb250cm9scyAuc2hhcmUnKS5vbignY2xpY2snLCBmdW5jdGlvbigpIHtcbiAgICAgIGlmICghJGJvZHkuaGFzQ2xhc3MocGxheWluZ0NsYXNzKSkge1xuICAgICAgICBzaGFyZVByZXNzZWQoKTtcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIGZ1bmN0aW9uIGRyYXdDaXJjbGUoKSB7XG4gICAgbGV0IGNpcmNsZSA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICBjZW50ZXI6IFs0MDAsIDQwMF0sXG4gICAgICByYWRpdXM6IDEwMCxcbiAgICAgIHN0cm9rZUNvbG9yOiAnZ3JlZW4nLFxuICAgICAgZmlsbENvbG9yOiAnZ3JlZW4nXG4gICAgfSk7XG4gICAgbGV0IGdyb3VwID0gbmV3IEdyb3VwKGNpcmNsZSk7XG4gIH1cblxuICBmdW5jdGlvbiBtYWluKCkge1xuICAgIGluaXRDb250cm9sUGFuZWwoKTtcbiAgICAvLyBkcmF3Q2lyY2xlKCk7XG4gICAgaW5pdFZpZXdWYXJzKCk7XG4gIH1cblxuICBtYWluKCk7XG59KTtcbiIsImNvbnN0IHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcbmNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJy4vLi4vLi4vY29uZmlnJyk7XG5cbmZ1bmN0aW9uIGxvZyguLi50aGluZykge1xuICB1dGlsLmxvZyguLi50aGluZyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTdHJva2VzKHBhdGgsIHBhdGhEYXRhKSB7XG4gIGxldCBwYXRoQ2xvbmUgPSBwYXRoLmNsb25lKCk7XG4gIGxldCBzdHJva2VzID0gbmV3IFBhdGgoKTtcbiAgQmFzZS5lYWNoKHBhdGhDbG9uZS5zZWdtZW50cywgKHNlZ21lbnQsIGkpID0+IHtcbiAgICBjb25zb2xlLmxvZyhzZWdtZW50KTtcbiAgICBsZXQgcG9pbnQgPSBzZWdtZW50LnBvaW50O1xuICAgIGxldCBwb2ludFN0ciA9IHN0cmluZ2lmeVBvaW50KHBvaW50KTtcbiAgICBsZXQgcG9pbnREYXRhO1xuICAgIGlmIChwb2ludFN0ciBpbiBwYXRoRGF0YSkge1xuICAgICAgcG9pbnREYXRhID0gcGF0aERhdGFbcG9pbnRTdHJdO1xuICAgIH0gZWxzZSB7XG4gICAgICBsZXQgbmVhcmVzdFBvaW50ID0gZ2V0Q2xvc2VzdFBvaW50RnJvbVBhdGhEYXRhKHBvaW50LCBwYXRoRGF0YSk7XG4gICAgICBwb2ludFN0ciA9IHN0cmluZ2lmeVBvaW50KG5lYXJlc3RQb2ludCk7XG4gICAgICBpZiAocG9pbnRTdHIgaW4gcGF0aERhdGEpIHtcbiAgICAgICAgcG9pbnREYXRhID0gcGF0aERhdGFbcG9pbnRTdHJdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbG9nKCdjb3VsZCBub3QgZmluZCBjbG9zZSBwb2ludCcpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwb2ludERhdGEpIHtcbiAgICAgIGNvbnNvbGUubG9nKHBvaW50RGF0YSk7XG4gICAgfVxuICB9KTtcbiAgcmV0dXJuIHBhdGhDbG9uZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldElkZWFsR2VvbWV0cnkocGF0aERhdGEsIHNpZGVzLCBzaW1wbGlmaWVkUGF0aCkge1xuICBjb25zdCB0aHJlc2hvbGREaXN0ID0gMC4wNSAqIHNpbXBsaWZpZWRQYXRoLmxlbmd0aDtcblxuICBsZXQgcmV0dXJuUGF0aCA9IG5ldyBQYXRoKHtcbiAgICBzdHJva2VXaWR0aDogNSxcbiAgICBzdHJva2VDb2xvcjogJ3BpbmsnXG4gIH0pO1xuXG4gIGxldCB0cnVlZFBhdGggPSBuZXcgUGF0aCh7XG4gICAgc3Ryb2tlV2lkdGg6IDUsXG4gICAgc3Ryb2tlQ29sb3I6ICdncmVlbidcbiAgfSk7XG5cbiAgLy8gbmV3IFBhdGguQ2lyY2xlKHtcbiAgLy8gICBjZW50ZXI6IHNpbXBsaWZpZWRQYXRoLmZpcnN0U2VnbWVudC5wb2ludCxcbiAgLy8gICByYWRpdXM6IDMsXG4gIC8vICAgZmlsbENvbG9yOiAnYmxhY2snXG4gIC8vIH0pO1xuXG4gIGxldCBmaXJzdFBvaW50ID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICBjZW50ZXI6IHNpbXBsaWZpZWRQYXRoLmZpcnN0U2VnbWVudC5wb2ludCxcbiAgICByYWRpdXM6IDEwLFxuICAgIHN0cm9rZUNvbG9yOiAnYmx1ZSdcbiAgfSk7XG5cbiAgbGV0IGxhc3RQb2ludCA9IG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgY2VudGVyOiBzaW1wbGlmaWVkUGF0aC5sYXN0U2VnbWVudC5wb2ludCxcbiAgICByYWRpdXM6IDEwLFxuICAgIHN0cm9rZUNvbG9yOiAncmVkJ1xuICB9KTtcblxuXG4gIGxldCBhbmdsZSwgcHJldkFuZ2xlLCBhbmdsZURlbHRhO1xuICBCYXNlLmVhY2goc2lkZXMsIChzaWRlLCBpKSA9PiB7XG4gICAgbGV0IGZpcnN0UG9pbnQgPSBzaWRlWzBdO1xuICAgIGxldCBsYXN0UG9pbnQgPSBzaWRlW3NpZGUubGVuZ3RoIC0gMV07XG5cbiAgICBhbmdsZSA9IE1hdGguYXRhbjIobGFzdFBvaW50LnkgLSBmaXJzdFBvaW50LnksIGxhc3RQb2ludC54IC0gZmlyc3RQb2ludC54KTtcblxuICAgIGlmICghIXByZXZBbmdsZSkge1xuICAgICAgYW5nbGVEZWx0YSA9IHV0aWwuYW5nbGVEZWx0YShhbmdsZSwgcHJldkFuZ2xlKTtcbiAgICAgIGNvbnNvbGUubG9nKGFuZ2xlRGVsdGEpO1xuICAgICAgcmV0dXJuUGF0aC5hZGQoZmlyc3RQb2ludCk7XG4gICAgICByZXR1cm5QYXRoLmFkZChsYXN0UG9pbnQpO1xuICAgIH1cblxuICAgIHByZXZBbmdsZSA9IGFuZ2xlO1xuICB9KTtcblxuICBCYXNlLmVhY2goc2ltcGxpZmllZFBhdGguc2VnbWVudHMsIChzZWdtZW50LCBpKSA9PiB7XG4gICAgbGV0IGludGVnZXJQb2ludCA9IGdldEludGVnZXJQb2ludChzZWdtZW50LnBvaW50KTtcbiAgICBsZXQgbmVhcmVzdFBvaW50ID0gcmV0dXJuUGF0aC5nZXROZWFyZXN0UG9pbnQoaW50ZWdlclBvaW50KTtcbiAgICAvLyBjb25zb2xlLmxvZyhpbnRlZ2VyUG9pbnQuZ2V0RGlzdGFuY2UobmVhcmVzdFBvaW50KSwgdGhyZXNob2xkRGlzdCk7XG4gICAgaWYgKGludGVnZXJQb2ludC5nZXREaXN0YW5jZShuZWFyZXN0UG9pbnQpIDw9IHRocmVzaG9sZERpc3QpIHtcbiAgICAgIHRydWVkUGF0aC5hZGQobmVhcmVzdFBvaW50KTtcbiAgICAgIG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgIGNlbnRlcjogbmVhcmVzdFBvaW50LFxuICAgICAgICByYWRpdXM6IDMsXG4gICAgICAgIGZpbGxDb2xvcjogJ2JsYWNrJ1xuICAgICAgfSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnNvbGUubG9nKCdvZmYgcGF0aCcpO1xuICAgICAgdHJ1ZWRQYXRoLmFkZChpbnRlZ2VyUG9pbnQpO1xuICAgICAgbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgICAgY2VudGVyOiBpbnRlZ2VyUG9pbnQsXG4gICAgICAgIHJhZGl1czogMyxcbiAgICAgICAgZmlsbENvbG9yOiAnZ3JlZW4nXG4gICAgICB9KTtcbiAgICB9XG4gIH0pO1xuXG4gIC8vIHRydWVkUGF0aC5hZGQoc2ltcGxpZmllZFBhdGgubGFzdFNlZ21lbnQucG9pbnQpO1xuICAvLyBuZXcgUGF0aC5DaXJjbGUoe1xuICAvLyAgIGNlbnRlcjogc2ltcGxpZmllZFBhdGgubGFzdFNlZ21lbnQucG9pbnQsXG4gIC8vICAgcmFkaXVzOiAzLFxuICAvLyAgIGZpbGxDb2xvcjogJ2JsYWNrJ1xuICAvLyB9KTtcblxuICBpZiAoc2ltcGxpZmllZFBhdGguY2xvc2VkKSB7XG4gICAgdHJ1ZWRQYXRoLmNsb3NlZCA9IHRydWU7XG4gIH1cblxuICAvLyBCYXNlLmVhY2godHJ1ZWRQYXRoLCAocG9pbnQsIGkpID0+IHtcbiAgLy8gICB0cnVlZFBhdGgucmVtb3ZlU2VnbWVudChpKTtcbiAgLy8gfSk7XG5cbiAgcmV0dXJuIHRydWVkUGF0aDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE9sZGdldElkZWFsR2VvbWV0cnkocGF0aERhdGEsIHBhdGgpIHtcbiAgY29uc3QgdGhyZXNob2xkQW5nbGUgPSBNYXRoLlBJIC8gMjtcbiAgY29uc3QgdGhyZXNob2xkRGlzdCA9IDAuMSAqIHBhdGgubGVuZ3RoO1xuICAvLyBsb2cocGF0aCk7XG5cbiAgbGV0IGNvdW50ID0gMDtcblxuICBsZXQgc2lkZXMgPSBbXTtcbiAgbGV0IHNpZGUgPSBbXTtcbiAgbGV0IHByZXY7XG4gIGxldCBwcmV2QW5nbGU7XG5cbiAgLy8gbG9nKCd0aHJlc2hvbGRBbmdsZScsIHRocmVzaG9sZEFuZ2xlKTtcblxuICBsZXQgcmV0dXJuUGF0aCA9IG5ldyBQYXRoKCk7XG5cbiAgQmFzZS5lYWNoKHBhdGguc2VnbWVudHMsIChzZWdtZW50LCBpKSA9PiB7XG4gICAgbGV0IGludGVnZXJQb2ludCA9IGdldEludGVnZXJQb2ludChzZWdtZW50LnBvaW50KTtcbiAgICBsZXQgcG9pbnRTdHIgPSBzdHJpbmdpZnlQb2ludChpbnRlZ2VyUG9pbnQpO1xuICAgIGxldCBwb2ludERhdGE7XG4gICAgaWYgKHBvaW50U3RyIGluIHBhdGhEYXRhKSB7XG4gICAgICBwb2ludERhdGEgPSBwYXRoRGF0YVtwb2ludFN0cl07XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBuZWFyZXN0UG9pbnQgPSBnZXRDbG9zZXN0UG9pbnRGcm9tUGF0aERhdGEocGF0aERhdGEsIGludGVnZXJQb2ludCk7XG4gICAgICBwb2ludFN0ciA9IHN0cmluZ2lmeVBvaW50KG5lYXJlc3RQb2ludCk7XG5cbiAgICAgIGlmIChwb2ludFN0ciBpbiBwYXRoRGF0YSkge1xuICAgICAgICBwb2ludERhdGEgPSBwYXRoRGF0YVtwb2ludFN0cl07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBsb2coJ2NvdWxkIG5vdCBmaW5kIGNsb3NlIHBvaW50Jyk7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHBvaW50RGF0YSkge1xuICAgICAgcmV0dXJuUGF0aC5hZGQoaW50ZWdlclBvaW50KTtcbiAgICAgIG5ldyBQYXRoLkNpcmNsZSh7XG4gICAgICAgIGNlbnRlcjogaW50ZWdlclBvaW50LFxuICAgICAgICByYWRpdXM6IDUsXG4gICAgICAgIHN0cm9rZUNvbG9yOiBuZXcgQ29sb3IoaSAvIHBhdGguc2VnbWVudHMubGVuZ3RoLCBpIC8gcGF0aC5zZWdtZW50cy5sZW5ndGgsIGkgLyBwYXRoLnNlZ21lbnRzLmxlbmd0aClcbiAgICAgIH0pO1xuICAgICAgbG9nKHBvaW50RGF0YS5wb2ludCk7XG4gICAgICBpZiAoIXByZXYpIHtcbiAgICAgICAgLy8gZmlyc3QgcG9pbnRcbiAgICAgICAgLy8gbG9nKCdwdXNoaW5nIGZpcnN0IHBvaW50IHRvIHNpZGUnKTtcbiAgICAgICAgc2lkZS5wdXNoKHBvaW50RGF0YSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBsZXQgYW5nbGVGb28gPSBpbnRlZ2VyUG9pbnQuZ2V0RGlyZWN0ZWRBbmdsZShwcmV2KTtcbiAgICAgICAgbGV0IGFuZ2xlID0gTWF0aC5hdGFuMihpbnRlZ2VyUG9pbnQueSwgaW50ZWdlclBvaW50LngpIC0gTWF0aC5hdGFuMihwcmV2LnksIHByZXYueCk7XG4gICAgICAgIGlmIChhbmdsZSA8IDApIGFuZ2xlICs9ICgyICogTWF0aC5QSSk7IC8vIG5vcm1hbGl6ZSB0byBbMCwgMs+AKVxuICAgICAgICAvLyBsb2coYW5nbGVGb28sIGFuZ2xlQmFyKTtcbiAgICAgICAgLy8gbGV0IGFuZ2xlID0gTWF0aC5hdGFuMihpbnRlZ2VyUG9pbnQueSAtIHByZXYueSwgaW50ZWdlclBvaW50LnggLSBwcmV2LngpO1xuICAgICAgICAvLyBsZXQgbGluZSA9IG5ldyBQYXRoLkxpbmUocHJldiwgaW50ZWdlclBvaW50KTtcbiAgICAgICAgLy8gbGluZS5zdHJva2VXaWR0aCA9IDU7XG4gICAgICAgIC8vIGxpbmUuc3Ryb2tlQ29sb3IgPSAncGluayc7XG4gICAgICAgIC8vIGxpbmUucm90YXRlKHV0aWwuZGVnKE1hdGguY29zKGFuZ2xlKSAqIE1hdGguUEkgKiAyKSk7XG4gICAgICAgIC8vIGxvZygnYW5nbGUnLCBhbmdsZSk7XG4gICAgICAgIGlmICh0eXBlb2YgcHJldkFuZ2xlID09PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIC8vIHNlY29uZCBwb2ludFxuICAgICAgICAgIHNpZGUucHVzaChwb2ludERhdGEpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgbGV0IGFuZ2xlRGlmZmVyZW5jZSA9IE1hdGgucG93KGFuZ2xlIC0gcHJldkFuZ2xlLCAyKTtcbiAgICAgICAgICBsb2coJ2FuZ2xlRGlmZmVyZW5jZScsIGFuZ2xlRGlmZmVyZW5jZSk7XG4gICAgICAgICAgaWYgKGFuZ2xlRGlmZmVyZW5jZSA8PSB0aHJlc2hvbGRBbmdsZSkge1xuICAgICAgICAgICAgLy8gc2FtZSBzaWRlXG4gICAgICAgICAgICAvLyBsb2coJ3B1c2hpbmcgcG9pbnQgdG8gc2FtZSBzaWRlJyk7XG4gICAgICAgICAgICBzaWRlLnB1c2gocG9pbnREYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gbmV3IHNpZGVcbiAgICAgICAgICAgIC8vIGxvZygnbmV3IHNpZGUnKTtcbiAgICAgICAgICAgIHNpZGVzLnB1c2goc2lkZSk7XG4gICAgICAgICAgICBzaWRlID0gW3BvaW50RGF0YV07XG5cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwcmV2QW5nbGUgPSBhbmdsZTtcbiAgICAgIH1cblxuICAgICAgcHJldiA9IGludGVnZXJQb2ludDtcbiAgICAgIGNvdW50Kys7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxvZygnbm8gZGF0YScpO1xuICAgIH1cbiAgfSk7XG5cbiAgLy8gbG9nKGNvdW50KTtcblxuICBzaWRlcy5wdXNoKHNpZGUpO1xuXG4gIHJldHVybiBzaWRlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEludGVnZXJQb2ludChwb2ludCkge1xuICByZXR1cm4gbmV3IFBvaW50KE1hdGguZmxvb3IocG9pbnQueCksIE1hdGguZmxvb3IocG9pbnQueSkpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RyaW5naWZ5UG9pbnQocG9pbnQpIHtcbiAgcmV0dXJuIGAke01hdGguZmxvb3IocG9pbnQueCl9LCR7TWF0aC5mbG9vcihwb2ludC55KX1gO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VQb2ludChwb2ludFN0cikge1xuICBsZXQgc3BsaXQgPSBwb2ludFN0ci5zcGxpdCgnLCcpLm1hcCgobnVtKSA9PiBNYXRoLmZsb29yKG51bSkpO1xuXG4gIGlmIChzcGxpdC5sZW5ndGggPj0gMikge1xuICAgIHJldHVybiBuZXcgUG9pbnQoc3BsaXRbMF0sIHNwbGl0WzFdKTtcbiAgfVxuXG4gIHJldHVybiBudWxsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0Q2xvc2VzdFBvaW50RnJvbVBhdGhEYXRhKHBvaW50LCBwYXRoRGF0YSkge1xuICBsZXQgbGVhc3REaXN0YW5jZSwgY2xvc2VzdFBvaW50O1xuXG4gIEJhc2UuZWFjaChwYXRoRGF0YSwgKGRhdHVtLCBpKSA9PiB7XG4gICAgbGV0IGRpc3RhbmNlID0gcG9pbnQuZ2V0RGlzdGFuY2UoZGF0dW0ucG9pbnQpO1xuICAgIGlmICghbGVhc3REaXN0YW5jZSB8fCBkaXN0YW5jZSA8IGxlYXN0RGlzdGFuY2UpIHtcbiAgICAgIGxlYXN0RGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICAgIGNsb3Nlc3RQb2ludCA9IGRhdHVtLnBvaW50O1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIGNsb3Nlc3RQb2ludCB8fCBwb2ludDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldENvbXB1dGVkQ29ybmVycyhwYXRoKSB7XG4gIGNvbnN0IHRocmVzaG9sZEFuZ2xlID0gdXRpbC5yYWQoY29uZmlnLnNoYXBlLmNvcm5lclRocmVzaG9sZERlZyk7XG4gIGNvbnN0IHRocmVzaG9sZERpc3RhbmNlID0gMC4xICogcGF0aC5sZW5ndGg7XG5cbiAgbGV0IGNvcm5lcnMgPSBbXTtcblxuICBpZiAocGF0aC5sZW5ndGggPiAwKSB7XG4gICAgbGV0IHBvaW50LCBwcmV2O1xuICAgIGxldCBhbmdsZSwgcHJldkFuZ2xlLCBhbmdsZURlbHRhO1xuXG4gICAgQmFzZS5lYWNoKHBhdGguc2VnbWVudHMsIChzZWdtZW50LCBpKSA9PiB7XG4gICAgICBsZXQgcG9pbnQgPSBnZXRJbnRlZ2VyUG9pbnQoc2VnbWVudC5wb2ludCk7XG4gICAgICBpZiAoISFwcmV2KSB7XG4gICAgICAgIGxldCBhbmdsZSA9IE1hdGguYXRhbjIocG9pbnQueSAtIHByZXYueSwgcG9pbnQueCAtIHByZXYueCk7XG4gICAgICAgIGlmIChhbmdsZSA8IDApIGFuZ2xlICs9ICgyICogTWF0aC5QSSk7IC8vIG5vcm1hbGl6ZSB0byBbMCwgMs+AKVxuICAgICAgICBpZiAoISFwcmV2QW5nbGUpIHtcbiAgICAgICAgICBhbmdsZURlbHRhID0gdXRpbC5hbmdsZURlbHRhKGFuZ2xlLCBwcmV2QW5nbGUpO1xuICAgICAgICAgIGlmIChhbmdsZURlbHRhID49IHRocmVzaG9sZEFuZ2xlKSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnY29ybmVyJyk7XG4gICAgICAgICAgICAvLyBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAgICAgLy8gICBjZW50ZXI6IHByZXYsXG4gICAgICAgICAgICAvLyAgIHJhZGl1czogMTAsXG4gICAgICAgICAgICAvLyAgIGZpbGxDb2xvcjogJ3BpbmsnXG4gICAgICAgICAgICAvLyB9KTtcbiAgICAgICAgICAgIGNvcm5lcnMucHVzaChwcmV2KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coYW5nbGVEZWx0YSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcHJldkFuZ2xlID0gYW5nbGU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBmaXJzdCBwb2ludFxuICAgICAgICBjb3JuZXJzLnB1c2gocG9pbnQpO1xuICAgICAgICAvLyBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAvLyAgIGNlbnRlcjogcG9pbnQsXG4gICAgICAgIC8vICAgcmFkaXVzOiAxMCxcbiAgICAgICAgLy8gICBmaWxsQ29sb3I6ICdwaW5rJ1xuICAgICAgICAvLyB9KVxuICAgICAgfVxuICAgICAgcHJldiA9IHBvaW50O1xuICAgIH0pO1xuXG4gICAgbGV0IGxhc3RTZWdtZW50UG9pbnQgPSBnZXRJbnRlZ2VyUG9pbnQocGF0aC5sYXN0U2VnbWVudC5wb2ludCk7XG4gICAgY29ybmVycy5wdXNoKGxhc3RTZWdtZW50UG9pbnQpO1xuXG4gICAgbGV0IHJldHVybkNvcm5lcnMgPSBbXTtcbiAgICBsZXQgc2tpcHBlZElkcyA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29ybmVycy5sZW5ndGg7IGkrKykge1xuICAgICAgbGV0IHBvaW50ID0gY29ybmVyc1tpXTtcblxuICAgICAgaWYgKGkgIT09IDApIHtcbiAgICAgICAgbGV0IGRpc3QgPSBwb2ludC5nZXREaXN0YW5jZShwcmV2KTtcbiAgICAgICAgbGV0IGNsb3Nlc3RQb2ludHMgPSBbXTtcbiAgICAgICAgd2hpbGUgKGRpc3QgPCB0aHJlc2hvbGREaXN0YW5jZSkge1xuICAgICAgICAgIGNsb3Nlc3RQb2ludHMucHVzaCh7XG4gICAgICAgICAgICBwb2ludDogcG9pbnQsXG4gICAgICAgICAgICBpbmRleDogaVxuICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgaWYgKGkgPCBjb3JuZXJzLmxlbmd0aCAtIDEpIHtcbiAgICAgICAgICAgIGkrKztcbiAgICAgICAgICAgIHByZXYgPSBwb2ludDtcbiAgICAgICAgICAgIHBvaW50ID0gY29ybmVyc1tpXTtcbiAgICAgICAgICAgIGRpc3QgPSBwb2ludC5nZXREaXN0YW5jZShwcmV2KTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChjbG9zZXN0UG9pbnRzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICBsZXQgW3N1bVgsIHN1bVldID0gWzAsIDBdO1xuXG4gICAgICAgICAgQmFzZS5lYWNoKGNsb3Nlc3RQb2ludHMsIChwb2ludE9iaikgPT4ge1xuICAgICAgICAgICAgc3VtWCArPSBwb2ludE9iai5wb2ludC54O1xuICAgICAgICAgICAgc3VtWSArPSBwb2ludE9iai5wb2ludC55O1xuICAgICAgICAgIH0pO1xuXG5cbiAgICAgICAgICBsZXQgW2F2Z1gsIGF2Z1ldID0gW3N1bVggLyBjbG9zZXN0UG9pbnRzLmxlbmd0aCwgc3VtWSAvIGNsb3Nlc3RQb2ludHMubGVuZ3RoXTtcbiAgICAgICAgICByZXR1cm5Db3JuZXJzLnB1c2gobmV3IFBvaW50KGF2Z1gsIGF2Z1kpKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuQ29ybmVycy5wdXNoKHBvaW50KTtcbiAgICAgIH1cblxuICAgICAgcHJldiA9IHBvaW50O1xuICAgIH1cblxuICAgIC8vIEJhc2UuZWFjaChjb3JuZXJzLCAoY29ybmVyLCBpKSA9PiB7XG4gICAgLy8gICBsZXQgcG9pbnQgPSBjb3JuZXI7XG4gICAgLy9cbiAgICAvLyAgIGlmIChpICE9PSAwKSB7XG4gICAgLy8gICAgIGxldCBkaXN0ID0gcG9pbnQuZ2V0RGlzdGFuY2UocHJldik7XG4gICAgLy8gICAgIGxldCBjbG9zZXN0UG9pbnRzID0gW107XG4gICAgLy8gICAgIGxldCBpbmRleCA9IGk7XG4gICAgLy8gICAgIHdoaWxlIChkaXN0IDwgdGhyZXNob2xkRGlzdGFuY2UpIHtcbiAgICAvLyAgICAgICBjbG9zZXN0UG9pbnRzLnB1c2goe1xuICAgIC8vICAgICAgICAgcG9pbnQ6IHBvaW50LFxuICAgIC8vICAgICAgICAgaW5kZXg6IGluZGV4XG4gICAgLy8gICAgICAgfSk7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgY29uc29sZS5sb2coZGlzdCwgdGhyZXNob2xkRGlzdGFuY2UpO1xuICAgIC8vICAgICB3aGlsZSAoZGlzdCA8IHRocmVzaG9sZERpc3RhbmNlKSB7XG4gICAgLy9cbiAgICAvLyAgICAgfVxuICAgIC8vICAgfSBlbHNlIHtcbiAgICAvLyAgICAgcmV0dXJuQ29ybmVycy5wdXNoKGNvcm5lcik7XG4gICAgLy8gICB9XG4gICAgLy9cbiAgICAvLyAgIHByZXYgPSBwb2ludDtcbiAgICAvLyB9KTtcbiAgICAvLyBuZXcgUGF0aC5DaXJjbGUoe1xuICAgIC8vICAgY2VudGVyOiBsYXN0U2VnbWVudFBvaW50LFxuICAgIC8vICAgcmFkaXVzOiAxMCxcbiAgICAvLyAgIGZpbGxDb2xvcjogJ3BpbmsnXG4gICAgLy8gfSk7XG4gIH1cblxuICByZXR1cm4gY29ybmVycztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHByb2Nlc3NTaGFwZURhdGEoanNvbikge1xuICBsZXQgcmV0dXJuU2hhcGUgPSBbXTtcbiAgbGV0IGpzb25PYmogPSBKU09OLnBhcnNlKGpzb24pWzFdOyAvLyB6ZXJvIGluZGV4IGlzIHN0cmluZ2lmaWVkIHR5cGUgKGUuZy4gXCJQYXRoXCIpXG5cbiAgaWYgKCdzZWdtZW50cycgaW4ganNvbk9iaikge1xuICAgIGxldCBzZWdtZW50cyA9IGpzb25PYmouc2VnbWVudHM7XG4gICAgQmFzZS5lYWNoKHNlZ21lbnRzLCAoc2VnbWVudCwgaSkgPT4ge1xuICAgICAgaWYgKHNlZ21lbnQubGVuZ3RoID09PSAzKSB7XG4gICAgICAgIGxldCBwb3NpdGlvbkluZm8gPSBzZWdtZW50WzBdOyAvLyBpbmRleGVzIDEgYW5kIDIgYXJlIHN1cGVyZmx1b3VzIG1hdHJpeCBkZXRhaWxzXG4gICAgICAgIHJldHVyblNoYXBlLnB1c2goe1xuICAgICAgICAgIHg6IHBvc2l0aW9uSW5mb1swXSxcbiAgICAgICAgICB5OiBwb3NpdGlvbkluZm9bMV1cbiAgICAgICAgfSlcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJldHVyblNoYXBlLnB1c2goe1xuICAgICAgICAgIHg6IHNlZ21lbnRbMF0sXG4gICAgICAgICAgeTogc2VnbWVudFsxXVxuICAgICAgICB9KTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH1cbiAgcmV0dXJuIHJldHVyblNoYXBlO1xufVxuIiwiY29uc3QgY29uZmlnID0gcmVxdWlyZSgnLi8uLi8uLi9jb25maWcnKTtcblxuZXhwb3J0IGZ1bmN0aW9uIGluaXRTaGFwZVNvdW5kcygpIHtcbiAgbGV0IHJldHVyblNvdW5kcyA9IHt9O1xuICBjb25zdCBleHRlbnNpb25zID0gWydvZ2cnLCAnbTRhJywgJ21wMycsICdhYzMnXTtcblxuICBCYXNlLmVhY2goY29uZmlnLnNoYXBlcywgKHNoYXBlLCBzaGFwZU5hbWUpID0+IHtcbiAgICAvLyBjb25zb2xlLmxvZyhzaGFwZSwgc2hhcGVOYW1lKTtcbiAgICBpZiAoc2hhcGUuc3ByaXRlKSB7XG4gICAgICBsZXQgc2hhcGVTb3VuZEpTT05QYXRoID0gYC4vYXVkaW8vc2hhcGVzLyR7c2hhcGVOYW1lfS8ke3NoYXBlTmFtZX0uanNvbmA7XG4gICAgICAkLmdldEpTT04oc2hhcGVTb3VuZEpTT05QYXRoLCAocmVzcCkgPT4ge1xuICAgICAgICBsZXQgc2hhcGVTb3VuZERhdGEgPSBmb3JtYXRTaGFwZVNvdW5kRGF0YShzaGFwZU5hbWUsIHJlc3ApO1xuICAgICAgICBsZXQgc291bmQgPSBuZXcgSG93bChzaGFwZVNvdW5kRGF0YSk7XG4gICAgICAgIHJldHVyblNvdW5kc1tzaGFwZU5hbWVdID0gc291bmQ7XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbGV0IHNvdW5kID0gbmV3IEhvd2woe1xuICAgICAgLy8gICBzcmM6IGV4dGVuc2lvbnMubWFwKChleHRlbnNpb24pID0+IGAuL2F1ZGlvL3NoYXBlcy8ke3NoYXBlLm5hbWV9LyR7c2hhcGUubmFtZX0uJHtleHRlbnNpb259YCksXG4gICAgICAvLyB9KTtcbiAgICAgIC8vIGNvbnNvbGUubG9nKHtcbiAgICAgIC8vICAgc3JjOiBleHRlbnNpb25zLm1hcCgoZXh0ZW5zaW9uKSA9PiBgLi9hdWRpby9zaGFwZXMvJHtzaGFwZS5uYW1lfS8ke3NoYXBlLm5hbWV9LiR7ZXh0ZW5zaW9ufWApLFxuICAgICAgLy8gfSkgTWF0aC5cbiAgICAgIGxldCBzb3VuZCA9IG5ldyBIb3dsKHtcbiAgICAgICAgc3JjOiBgLi9hdWRpby9zaGFwZXMvJHtzaGFwZU5hbWV9LyR7c2hhcGVOYW1lfS5tcDNgLFxuICAgICAgfSk7XG4gICAgICByZXR1cm5Tb3VuZHNbc2hhcGVOYW1lXSA9IHNvdW5kO1xuICAgIH1cbiAgfSk7XG5cbiAgcmV0dXJuIHJldHVyblNvdW5kcztcblxufVxuXG5leHBvcnQgZnVuY3Rpb24gZm9ybWF0U2hhcGVTb3VuZERhdGEoc2hhcGVOYW1lLCBkYXRhKSB7XG4gIGxldCByZXR1cm5EYXRhID0ge307XG5cbiAgcmV0dXJuRGF0YS5zcmMgPSBkYXRhLnVybHMubWFwKCh1cmwpID0+IGAuL2F1ZGlvL3NoYXBlcy8ke3NoYXBlTmFtZX0vJHt1cmx9YCk7XG4gIHJldHVybkRhdGEuc3ByaXRlID0gZGF0YS5zcHJpdGU7XG5cbiAgcmV0dXJuIHJldHVybkRhdGE7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBxdWFudGl6ZUxlbmd0aChkdXJhdGlvbikge1xuICBjb25zdCBzbWFsbGVzdER1cmF0aW9uID0gKDYwIC8gY29uZmlnLnNvdW5kLmJwbSk7XG4gIGNvbnN0IHJldHVybkR1cmF0aW9uID0gTWF0aC5mbG9vcihkdXJhdGlvbiAvIHNtYWxsZXN0RHVyYXRpb24pICogc21hbGxlc3REdXJhdGlvbjtcblxuICBpZiAocmV0dXJuRHVyYXRpb24gPiAwKSB7XG4gICAgcmV0dXJuIHJldHVybkR1cmF0aW9uO1xuICB9IGVsc2Uge1xuICAgIC8vIGFsd2F5cyByZXR1cm4gc29tZXRoaW5nIGdyZWF0ZXIgdGhhbiB6ZXJvXG4gICAgcmV0dXJuIHNtYWxsZXN0RHVyYXRpb247XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHF1YW50aXplUG9zaXRpb24ocG9zaXRpb24sIHZpZXdXaWR0aCkge1xuICBjb25zdCBzbWFsbGVzdEludGVydmFsID0gdmlld1dpZHRoIC8gKDQgKiBjb25maWcuc291bmQubWVhc3VyZXMpO1xuICByZXR1cm4gcmV0dXJuUG9zaXRpb24gPSBNYXRoLmZsb29yKHBvc2l0aW9uIC8gc21hbGxlc3RJbnRlcnZhbCkgKiBzbWFsbGVzdEludGVydmFsO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gc3RhcnRDb21wb3NpdGlvbihjb21wb3NpdGlvbikge1xuICBjb25zdCBiZWF0TGVuZ3RoID0gKDYwIC8gY29uZmlnLnNvdW5kLmJwbSkgKiAxMDAwO1xuICBjb25zdCBtZWFzdXJlTGVuZ3RoID0gYmVhdExlbmd0aCAqIDQ7XG4gIGNvbnN0IGNvbXBvc2l0aW9uTGVuZ3RoID0gbWVhc3VyZUxlbmd0aCAqIGNvbmZpZy5zb3VuZC5tZWFzdXJlcyAtIDI1MDsgLy8gYWRqdXN0IGZvciB0aW1lIHRvIHNldCB1cFxuXG4gIGZ1bmN0aW9uIHBsYXlDb21wb3NpdGlvbk9uY2UoKSB7XG4gICAgY29uc29sZS5sb2coJ3JlcGVhdCcpO1xuICAgIEJhc2UuZWFjaChjb21wb3NpdGlvbiwgKHNoYXBlLCBpKSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhzaGFwZSk7XG4gICAgICBpZiAoc2hhcGUuc3ByaXRlKSB7XG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBwbGF5aW5nIHNoYXBlICR7c2hhcGUuZ3JvdXBJZH1gKTtcbiAgICAgICAgICBzaGFwZS5zb3VuZC5sb29wKHRydWUpO1xuICAgICAgICAgIHNoYXBlLnNvdW5kLnBsYXkoc2hhcGUuc3ByaXRlTmFtZSk7XG4gICAgICAgIH0sIHNoYXBlLnN0YXJ0VGltZSk7XG5cbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coYHN0b3BwaW5nIHNoYXBlICR7c2hhcGUuZ3JvdXBJZH1gKTtcbiAgICAgICAgICBzaGFwZS5zb3VuZC5zdG9wKCk7XG4gICAgICAgIH0sIHNoYXBlLnN0YXJ0VGltZSArIHNoYXBlLmR1cmF0aW9uKVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgY29uc29sZS5sb2coYHBsYXlpbmcgc2hhcGUgJHtzaGFwZS5ncm91cElkfWApO1xuICAgICAgICAgIHNoYXBlLnNvdW5kLmxvb3AodHJ1ZSk7XG4gICAgICAgICAgc2hhcGUuc291bmQucGxheSgpO1xuICAgICAgICB9LCBzaGFwZS5zdGFydFRpbWUpO1xuXG4gICAgICAgIHNldFRpbWVvdXQoKCkgPT4ge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGBzdG9wcGluZyBzaGFwZSAke3NoYXBlLmdyb3VwSWR9YCk7XG4gICAgICAgICAgc2hhcGUuc291bmQuc3RvcCgpO1xuICAgICAgICB9LCBzaGFwZS5zdGFydFRpbWUgKyBzaGFwZS5kdXJhdGlvbilcbiAgICAgIH1cbiAgICB9KTtcbiAgfVxuXG4gIHBsYXlDb21wb3NpdGlvbk9uY2UoKTtcbiAgcmV0dXJuIHNldEludGVydmFsKHBsYXlDb21wb3NpdGlvbk9uY2UsIGNvbXBvc2l0aW9uTGVuZ3RoKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHN0b3BDb21wb3NpdGlvbihpbnRlcnZhbCkge1xuICBjbGVhckludGVydmFsKGludGVydmFsKTtcbn1cbiIsImNvbnN0IGNvbmZpZyA9IHJlcXVpcmUoJy4vLi4vLi4vY29uZmlnJyk7XG5cbmV4cG9ydCBmdW5jdGlvbiBsb2coLi4udGhpbmcpIHtcbiAgaWYgKGNvbmZpZy5sb2cpIHtcbiAgICBjb25zb2xlLmxvZyguLi50aGluZyk7XG4gIH1cbn1cblxuLy8gQ29udmVydHMgZnJvbSBkZWdyZWVzIHRvIHJhZGlhbnMuXG5leHBvcnQgZnVuY3Rpb24gcmFkKGRlZ3JlZXMpIHtcbiAgcmV0dXJuIGRlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwO1xufTtcblxuLy8gQ29udmVydHMgZnJvbSByYWRpYW5zIHRvIGRlZ3JlZXMuXG5leHBvcnQgZnVuY3Rpb24gZGVnKHJhZGlhbnMpIHtcbiAgcmV0dXJuIHJhZGlhbnMgKiAxODAgLyBNYXRoLlBJO1xufTtcblxuLy8gcmV0dXJucyBhYnNvbHV0ZSB2YWx1ZSBvZiB0aGUgZGVsdGEgb2YgdHdvIGFuZ2xlcyBpbiByYWRpYW5zXG5leHBvcnQgZnVuY3Rpb24gYW5nbGVEZWx0YSh4LCB5KSB7XG4gIHJldHVybiBNYXRoLmFicyhNYXRoLmF0YW4yKE1hdGguc2luKHkgLSB4KSwgTWF0aC5jb3MoeSAtIHgpKSk7O1xufVxuXG4vLyBkaXN0YW5jZSBiZXR3ZWVuIHR3byBwb2ludHNcbmV4cG9ydCBmdW5jdGlvbiBkZWx0YShwMSwgcDIpIHtcbiAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyhwMS54IC0gcDIueCwgMikgKyBNYXRoLnBvdyhwMS55IC0gcDIueSwgMikpOyAvLyBweXRoYWdvcmVhbiFcbn1cblxuLy8gcmV0dXJucyBhbiBhcnJheSBvZiB0aGUgaW50ZXJpb3IgY3VydmVzIG9mIGEgZ2l2ZW4gY29tcG91bmQgcGF0aFxuZXhwb3J0IGZ1bmN0aW9uIGZpbmRJbnRlcmlvckN1cnZlcyhwYXRoKSB7XG4gIGxldCBpbnRlcmlvckN1cnZlcyA9IFtdO1xuICBpZiAoIXBhdGggfHwgIXBhdGguY2hpbGRyZW4gfHwgIXBhdGguY2hpbGRyZW4ubGVuZ3RoKSByZXR1cm47XG5cbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBwYXRoLmNoaWxkcmVuLmxlbmd0aDsgaSsrKSB7XG4gICAgbGV0IGNoaWxkID0gcGF0aC5jaGlsZHJlbltpXTtcblxuICAgIGlmIChjaGlsZC5jbG9zZWQpe1xuICAgICAgaW50ZXJpb3JDdXJ2ZXMucHVzaChuZXcgUGF0aChjaGlsZC5zZWdtZW50cykpO1xuICAgIH1cbiAgfVxuXG4gIHBhdGgucmVtb3ZlKCk7XG4gIHJldHVybiBpbnRlcmlvckN1cnZlcztcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRydWVHcm91cChncm91cCwgY29ybmVycykge1xuICBsZXQgbWlkZGxlID0gZ3JvdXAuX25hbWVkQ2hpbGRyZW4ubWlkZGxlWzBdO1xuICBjb25zb2xlLmxvZygnbnVtIGNvcm5lcnMnLCBjb3JuZXJzLmxlbmd0aCk7XG5cbiAgbGV0IGludGVyc2VjdGlvbnMgPSBtaWRkbGUuZ2V0SW50ZXJzZWN0aW9ucygpO1xuICBsZXQgdHJ1ZU5lY2Vzc2FyeSA9IGZhbHNlO1xuXG4gIGxldCBtaWRkbGVDb3B5ID0gbWlkZGxlLmNsb25lKCk7XG4gIG1pZGRsZUNvcHkudmlzaWJsZSA9IGZhbHNlO1xuICAvLyBkZWJ1Z2dlcjtcblxuICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgLy8gc2VlIGlmIHdlIGNhbiB0cmltIHRoZSBwYXRoIHdoaWxlIG1haW50YWluaW5nIGludGVyc2VjdGlvbnNcbiAgICAvLyBsb2coJ2ludGVyc2VjdGlvbnMhJyk7XG4gICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICd5ZWxsb3cnO1xuICAgIFttaWRkbGVDb3B5LCB0cnVlTmVjZXNzYXJ5XSA9IHRyaW1QYXRoKG1pZGRsZUNvcHksIG1pZGRsZSk7XG4gICAgLy8gbWlkZGxlQ29weS5zdHJva2VDb2xvciA9ICdvcmFuZ2UnO1xuICB9IGVsc2Uge1xuICAgIC8vIGV4dGVuZCBmaXJzdCBhbmQgbGFzdCBzZWdtZW50IGJ5IHRocmVzaG9sZCwgc2VlIGlmIGludGVyc2VjdGlvblxuICAgIC8vIGxvZygnbm8gaW50ZXJzZWN0aW9ucywgZXh0ZW5kaW5nIGZpcnN0IScpO1xuICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAneWVsbG93JztcbiAgICBtaWRkbGVDb3B5ID0gZXh0ZW5kUGF0aChtaWRkbGVDb3B5KTtcbiAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ29yYW5nZSc7XG4gICAgbGV0IGludGVyc2VjdGlvbnMgPSBtaWRkbGVDb3B5LmdldEludGVyc2VjdGlvbnMoKTtcbiAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuICAgICAgW21pZGRsZUNvcHksIHRydWVOZWNlc3NhcnldID0gdHJpbVBhdGgobWlkZGxlQ29weSwgbWlkZGxlKTtcbiAgICAgIC8vIG1pZGRsZUNvcHkuc3Ryb2tlQ29sb3IgPSAnZ3JlZW4nO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ3JlZCc7XG4gICAgICBtaWRkbGVDb3B5ID0gcmVtb3ZlUGF0aEV4dGVuc2lvbnMobWlkZGxlQ29weSk7XG4gICAgICAvLyBtaWRkbGVDb3B5LnN0cm9rZUNvbG9yID0gJ2JsdWUnO1xuICAgIH1cbiAgfVxuXG4gIGNvbnNvbGUubG9nKCdvcmlnaW5hbCBsZW5ndGg6JywgbWlkZGxlLmxlbmd0aCk7XG4gIGNvbnNvbGUubG9nKCd0cnVlZCBsZW5ndGg6JywgbWlkZGxlQ29weS5sZW5ndGgpO1xuXG4gIG1pZGRsZUNvcHkubmFtZSA9ICdtaWRkbGUnOyAvLyBtYWtlIHN1cmVcbiAgbWlkZGxlQ29weS52aXNpYmxlID0gdHJ1ZTtcblxuICAvLyBncm91cC5hZGRDaGlsZChtaWRkbGVDb3B5KTtcbiAgLy8gZ3JvdXAuX25hbWVkQ2hpbGRyZW4ubWlkZGxlWzBdID0gbWlkZGxlQ29weTtcbiAgZ3JvdXAuX25hbWVkQ2hpbGRyZW4ubWlkZGxlWzBdLnJlcGxhY2VXaXRoKG1pZGRsZUNvcHkpO1xuXG5cbiAgcmV0dXJuIFtncm91cCwgdHJ1ZU5lY2Vzc2FyeV07XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBleHRlbmRQYXRoKHBhdGgpIHtcbiAgaWYgKHBhdGgubGVuZ3RoID4gMCkge1xuICAgIGNvbnN0IGxlbmd0aFRvbGVyYW5jZSA9IGNvbmZpZy5zaGFwZS50cmltbWluZ1RocmVzaG9sZCAqIHBhdGgubGVuZ3RoO1xuXG4gICAgbGV0IGZpcnN0U2VnbWVudCA9IHBhdGguZmlyc3RTZWdtZW50O1xuICAgIGxldCBuZXh0U2VnbWVudCA9IGZpcnN0U2VnbWVudC5uZXh0O1xuICAgIGxldCBzdGFydEFuZ2xlID0gTWF0aC5hdGFuMihuZXh0U2VnbWVudC5wb2ludC55IC0gZmlyc3RTZWdtZW50LnBvaW50LnksIG5leHRTZWdtZW50LnBvaW50LnggLSBmaXJzdFNlZ21lbnQucG9pbnQueCk7IC8vIHJhZFxuICAgIGxldCBpbnZlcnNlU3RhcnRBbmdsZSA9IHN0YXJ0QW5nbGUgKyBNYXRoLlBJO1xuICAgIGxldCBleHRlbmRlZFN0YXJ0UG9pbnQgPSBuZXcgUG9pbnQoZmlyc3RTZWdtZW50LnBvaW50LnggKyAoTWF0aC5jb3MoaW52ZXJzZVN0YXJ0QW5nbGUpICogbGVuZ3RoVG9sZXJhbmNlKSwgZmlyc3RTZWdtZW50LnBvaW50LnkgKyAoTWF0aC5zaW4oaW52ZXJzZVN0YXJ0QW5nbGUpICogbGVuZ3RoVG9sZXJhbmNlKSk7XG4gICAgcGF0aC5pbnNlcnQoMCwgZXh0ZW5kZWRTdGFydFBvaW50KTtcblxuICAgIGxldCBsYXN0U2VnbWVudCA9IHBhdGgubGFzdFNlZ21lbnQ7XG4gICAgbGV0IHBlblNlZ21lbnQgPSBsYXN0U2VnbWVudC5wcmV2aW91czsgLy8gcGVudWx0aW1hdGVcbiAgICBsZXQgZW5kQW5nbGUgPSBNYXRoLmF0YW4yKGxhc3RTZWdtZW50LnBvaW50LnkgLSBwZW5TZWdtZW50LnBvaW50LnksIGxhc3RTZWdtZW50LnBvaW50LnggLSBwZW5TZWdtZW50LnBvaW50LngpOyAvLyByYWRcbiAgICBsZXQgZXh0ZW5kZWRFbmRQb2ludCA9IG5ldyBQb2ludChsYXN0U2VnbWVudC5wb2ludC54ICsgKE1hdGguY29zKGVuZEFuZ2xlKSAqIGxlbmd0aFRvbGVyYW5jZSksIGxhc3RTZWdtZW50LnBvaW50LnkgKyAoTWF0aC5zaW4oZW5kQW5nbGUpICogbGVuZ3RoVG9sZXJhbmNlKSk7XG4gICAgcGF0aC5hZGQoZXh0ZW5kZWRFbmRQb2ludCk7XG4gIH1cbiAgcmV0dXJuIHBhdGg7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmltUGF0aChwYXRoLCBvcmlnaW5hbCkge1xuICAvLyBvcmlnaW5hbFBhdGguc3Ryb2tlQ29sb3IgPSAncGluayc7XG4gIHRyeSB7XG4gICAgbGV0IGludGVyc2VjdGlvbnMgPSBwYXRoLmdldEludGVyc2VjdGlvbnMoKTtcbiAgICBsZXQgZGl2aWRlZFBhdGggPSBwYXRoLnJlc29sdmVDcm9zc2luZ3MoKTtcblxuICAgIGlmIChpbnRlcnNlY3Rpb25zLmxlbmd0aCA+IDEpIHtcbiAgICAgIHJldHVybiBbb3JpZ2luYWwsIGZhbHNlXTsgLy8gbW9yZSB0aGFuIG9uZSBpbnRlcnNlY3Rpb24sIGRvbid0IHdvcnJ5IGFib3V0IHRyaW1taW5nXG4gICAgfVxuXG4gICAgY29uc3QgZXh0ZW5kaW5nVGhyZXNob2xkID0gY29uZmlnLnNoYXBlLmV4dGVuZGluZ1RocmVzaG9sZDtcbiAgICBjb25zdCB0b3RhbExlbmd0aCA9IHBhdGgubGVuZ3RoO1xuXG4gICAgLy8gd2Ugd2FudCB0byByZW1vdmUgYWxsIGNsb3NlZCBsb29wcyBmcm9tIHRoZSBwYXRoLCBzaW5jZSB0aGVzZSBhcmUgbmVjZXNzYXJpbHkgaW50ZXJpb3IgYW5kIG5vdCBmaXJzdCBvciBsYXN0XG4gICAgQmFzZS5lYWNoKGRpdmlkZWRQYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgIGlmIChjaGlsZC5jbG9zZWQpIHtcbiAgICAgICAgLy8gbG9nKCdzdWJ0cmFjdGluZyBjbG9zZWQgY2hpbGQnKTtcbiAgICAgICAgZGl2aWRlZFBhdGggPSBkaXZpZGVkUGF0aC5zdWJ0cmFjdChjaGlsZCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkaXZpZGVkUGF0aCA9IGRpdmlkZWRQYXRoLnVuaXRlKGNoaWxkKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIC8vIGxvZyhkaXZpZGVkUGF0aCk7XG5cbiAgICBpZiAoISFkaXZpZGVkUGF0aC5jaGlsZHJlbiAmJiBkaXZpZGVkUGF0aC5jaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICAvLyBkaXZpZGVkIHBhdGggaXMgYSBjb21wb3VuZCBwYXRoXG4gICAgICBsZXQgdW5pdGVkRGl2aWRlZFBhdGggPSBuZXcgUGF0aCgpO1xuICAgICAgLy8gdW5pdGVkRGl2aWRlZFBhdGguY29weUF0dHJpYnV0ZXMoZGl2aWRlZFBhdGgpO1xuICAgICAgLy8gbG9nKCdiZWZvcmUnLCB1bml0ZWREaXZpZGVkUGF0aCk7XG4gICAgICBCYXNlLmVhY2goZGl2aWRlZFBhdGguY2hpbGRyZW4sIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICBpZiAoIWNoaWxkLmNsb3NlZCkge1xuICAgICAgICAgIHVuaXRlZERpdmlkZWRQYXRoID0gdW5pdGVkRGl2aWRlZFBhdGgudW5pdGUoY2hpbGQpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICAgIGRpdmlkZWRQYXRoID0gdW5pdGVkRGl2aWRlZFBhdGg7XG4gICAgICAvLyBsb2coJ2FmdGVyJywgdW5pdGVkRGl2aWRlZFBhdGgpO1xuICAgICAgLy8gcmV0dXJuO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBsb2coJ2RpdmlkZWRQYXRoIGhhcyBvbmUgY2hpbGQnKTtcbiAgICB9XG5cbiAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAwKSB7XG4gICAgICAvLyB3ZSBoYXZlIHRvIGdldCB0aGUgbmVhcmVzdCBsb2NhdGlvbiBiZWNhdXNlIHRoZSBleGFjdCBpbnRlcnNlY3Rpb24gcG9pbnQgaGFzIGFscmVhZHkgYmVlbiByZW1vdmVkIGFzIGEgcGFydCBvZiByZXNvbHZlQ3Jvc3NpbmdzKClcbiAgICAgIGxldCBmaXJzdEludGVyc2VjdGlvbiA9IGRpdmlkZWRQYXRoLmdldE5lYXJlc3RMb2NhdGlvbihpbnRlcnNlY3Rpb25zWzBdLnBvaW50KTtcbiAgICAgIC8vIGxvZyhkaXZpZGVkUGF0aCk7XG4gICAgICBsZXQgcmVzdCA9IGRpdmlkZWRQYXRoLnNwbGl0QXQoZmlyc3RJbnRlcnNlY3Rpb24pOyAvLyBkaXZpZGVkUGF0aCBpcyBub3cgdGhlIGZpcnN0IHNlZ21lbnRcbiAgICAgIGxldCBmaXJzdFNlZ21lbnQgPSBkaXZpZGVkUGF0aDtcbiAgICAgIGxldCBsYXN0U2VnbWVudDtcblxuICAgICAgLy8gZmlyc3RTZWdtZW50LnN0cm9rZUNvbG9yID0gJ3BpbmsnO1xuXG4gICAgICAvLyBsZXQgY2lyY2xlT25lID0gbmV3IFBhdGguQ2lyY2xlKHtcbiAgICAgIC8vICAgY2VudGVyOiBmaXJzdEludGVyc2VjdGlvbi5wb2ludCxcbiAgICAgIC8vICAgcmFkaXVzOiA1LFxuICAgICAgLy8gICBzdHJva2VDb2xvcjogJ3JlZCdcbiAgICAgIC8vIH0pO1xuXG4gICAgICAvLyBsb2coaW50ZXJzZWN0aW9ucyk7XG4gICAgICBpZiAoaW50ZXJzZWN0aW9ucy5sZW5ndGggPiAxKSB7XG4gICAgICAgIC8vIGxvZygnZm9vJyk7XG4gICAgICAgIC8vIHJlc3QucmV2ZXJzZSgpOyAvLyBzdGFydCBmcm9tIGVuZFxuICAgICAgICBsZXQgbGFzdEludGVyc2VjdGlvbiA9IHJlc3QuZ2V0TmVhcmVzdExvY2F0aW9uKGludGVyc2VjdGlvbnNbaW50ZXJzZWN0aW9ucy5sZW5ndGggLSAxXS5wb2ludCk7XG4gICAgICAgIC8vIGxldCBjaXJjbGVUd28gPSBuZXcgUGF0aC5DaXJjbGUoe1xuICAgICAgICAvLyAgIGNlbnRlcjogbGFzdEludGVyc2VjdGlvbi5wb2ludCxcbiAgICAgICAgLy8gICByYWRpdXM6IDUsXG4gICAgICAgIC8vICAgc3Ryb2tlQ29sb3I6ICdncmVlbidcbiAgICAgICAgLy8gfSk7XG4gICAgICAgIGxhc3RTZWdtZW50ID0gcmVzdC5zcGxpdEF0KGxhc3RJbnRlcnNlY3Rpb24pOyAvLyByZXN0IGlzIG5vdyBldmVyeXRoaW5nIEJVVCB0aGUgZmlyc3QgYW5kIGxhc3Qgc2VnbWVudHNcbiAgICAgICAgaWYgKCFsYXN0U2VnbWVudCB8fCAhbGFzdFNlZ21lbnQubGVuZ3RoKSBsYXN0U2VnbWVudCA9IHJlc3Q7XG4gICAgICAgIHJlc3QucmV2ZXJzZSgpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGFzdFNlZ21lbnQgPSByZXN0O1xuICAgICAgfVxuXG4gICAgICBpZiAoISFmaXJzdFNlZ21lbnQgJiYgZmlyc3RTZWdtZW50Lmxlbmd0aCA8PSBleHRlbmRpbmdUaHJlc2hvbGQgKiB0b3RhbExlbmd0aCkge1xuICAgICAgICBwYXRoID0gcGF0aC5zdWJ0cmFjdChmaXJzdFNlZ21lbnQpO1xuICAgICAgICBpZiAocGF0aC5jbGFzc05hbWUgPT09ICdDb21wb3VuZFBhdGgnKSB7XG4gICAgICAgICAgQmFzZS5lYWNoKHBhdGguY2hpbGRyZW4sIChjaGlsZCwgaSkgPT4ge1xuICAgICAgICAgICAgaWYgKCFjaGlsZC5jbG9zZWQpIHtcbiAgICAgICAgICAgICAgY2hpbGQucmVtb3ZlKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgaWYgKCEhbGFzdFNlZ21lbnQgJiYgbGFzdFNlZ21lbnQubGVuZ3RoIDw9IGV4dGVuZGluZ1RocmVzaG9sZCAqIHRvdGFsTGVuZ3RoKSB7XG4gICAgICAgIHBhdGggPSBwYXRoLnN1YnRyYWN0KGxhc3RTZWdtZW50KTtcbiAgICAgICAgaWYgKHBhdGguY2xhc3NOYW1lID09PSAnQ29tcG91bmRQYXRoJykge1xuICAgICAgICAgIEJhc2UuZWFjaChwYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgICAgICAgIGlmICghY2hpbGQuY2xvc2VkKSB7XG4gICAgICAgICAgICAgIGNoaWxkLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdGhpcyBpcyBoYWNreSBidXQgSSdtIG5vdCBzdXJlIGhvdyB0byBnZXQgYXJvdW5kIGl0XG4gICAgLy8gc29tZXRpbWVzIHBhdGguc3VidHJhY3QoKSByZXR1cm5zIGEgY29tcG91bmQgcGF0aCwgd2l0aCBjaGlsZHJlbiBjb25zaXN0aW5nIG9mIHRoZSBjbG9zZWQgcGF0aCBJIHdhbnQgYW5kIGFub3RoZXIgZXh0cmFuZW91cyBjbG9zZWQgcGF0aFxuICAgIC8vIGl0IGFwcGVhcnMgdGhhdCB0aGUgY29ycmVjdCBwYXRoIGFsd2F5cyBoYXMgYSBoaWdoZXIgdmVyc2lvbiwgdGhvdWdoIEknbSBub3QgMTAwJSBzdXJlIHRoYXQgdGhpcyBpcyBhbHdheXMgdGhlIGNhc2VcblxuICAgIGlmIChwYXRoLmNsYXNzTmFtZSA9PT0gJ0NvbXBvdW5kUGF0aCcgJiYgcGF0aC5jaGlsZHJlbi5sZW5ndGggPiAwKSB7XG4gICAgICBpZiAocGF0aC5jaGlsZHJlbi5sZW5ndGggPiAxKSB7XG4gICAgICAgIGxldCBsYXJnZXN0Q2hpbGQ7XG4gICAgICAgIGxldCBsYXJnZXN0Q2hpbGRBcmVhID0gMDtcblxuICAgICAgICBCYXNlLmVhY2gocGF0aC5jaGlsZHJlbiwgKGNoaWxkLCBpKSA9PiB7XG4gICAgICAgICAgaWYgKGNoaWxkLmFyZWEgPiBsYXJnZXN0Q2hpbGRBcmVhKSB7XG4gICAgICAgICAgICBsYXJnZXN0Q2hpbGRBcmVhID0gY2hpbGQuYXJlYTtcbiAgICAgICAgICAgIGxhcmdlc3RDaGlsZCA9IGNoaWxkO1xuICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgaWYgKGxhcmdlc3RDaGlsZCkge1xuICAgICAgICAgIHBhdGggPSBsYXJnZXN0Q2hpbGQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcGF0aCA9IHBhdGguY2hpbGRyZW5bMF07XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHBhdGggPSBwYXRoLmNoaWxkcmVuWzBdO1xuICAgICAgfVxuICAgICAgLy8gbG9nKHBhdGgpO1xuICAgICAgLy8gbG9nKHBhdGgubGFzdENoaWxkKTtcbiAgICAgIC8vIHBhdGguZmlyc3RDaGlsZC5zdHJva2VDb2xvciA9ICdwaW5rJztcbiAgICAgIC8vIHBhdGgubGFzdENoaWxkLnN0cm9rZUNvbG9yID0gJ2dyZWVuJztcbiAgICAgIC8vIHBhdGggPSBwYXRoLmxhc3RDaGlsZDsgLy8gcmV0dXJuIGxhc3QgY2hpbGQ/XG4gICAgICAvLyBmaW5kIGhpZ2hlc3QgdmVyc2lvblxuICAgICAgLy9cbiAgICAgIC8vIGxvZyhyZWFsUGF0aFZlcnNpb24pO1xuICAgICAgLy9cbiAgICAgIC8vIEJhc2UuZWFjaChwYXRoLmNoaWxkcmVuLCAoY2hpbGQsIGkpID0+IHtcbiAgICAgIC8vICAgaWYgKGNoaWxkLnZlcnNpb24gPT0gcmVhbFBhdGhWZXJzaW9uKSB7XG4gICAgICAvLyAgICAgbG9nKCdyZXR1cm5pbmcgY2hpbGQnKTtcbiAgICAgIC8vICAgICByZXR1cm4gY2hpbGQ7XG4gICAgICAvLyAgIH1cbiAgICAgIC8vIH0pXG4gICAgfVxuICAgIGxvZygnb3JpZ2luYWwgbGVuZ3RoOicsIHRvdGFsTGVuZ3RoKTtcbiAgICBsb2coJ2VkaXRlZCBsZW5ndGg6JywgcGF0aC5sZW5ndGgpO1xuICAgIGlmIChNYXRoLmFicyhwYXRoLmxlbmd0aCAtIHRvdGFsTGVuZ3RoKSAvIHRvdGFsTGVuZ3RoIDw9IDAuMDEpIHtcbiAgICAgIGxvZygncmV0dXJuaW5nIG9yaWdpbmFsJyk7XG4gICAgICByZXR1cm4gW29yaWdpbmFsLCBmYWxzZV07XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBbcGF0aCwgdHJ1ZV07XG4gICAgfVxuICB9IGNhdGNoKGUpIHtcbiAgICBjb25zb2xlLmVycm9yKGUpO1xuICAgIHJldHVybiBbb3JpZ2luYWwsIGZhbHNlXTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gcmVtb3ZlUGF0aEV4dGVuc2lvbnMocGF0aCkge1xuICBwYXRoLnJlbW92ZVNlZ21lbnQoMCk7XG4gIHBhdGgucmVtb3ZlU2VnbWVudChwYXRoLnNlZ21lbnRzLmxlbmd0aCAtIDEpO1xuICByZXR1cm4gcGF0aDtcbn1cblxuLy8gZXhwb3J0IGZ1bmN0aW9uIHRydWVQYXRoKHBhdGgpIHtcbi8vICAgLy8gbG9nKGdyb3VwKTtcbi8vICAgLy8gaWYgKHBhdGggJiYgcGF0aC5jaGlsZHJlbiAmJiBwYXRoLmNoaWxkcmVuLmxlbmd0aCA+IDAgJiYgcGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pIHtcbi8vICAgLy8gICBsZXQgcGF0aENvcHkgPSBuZXcgUGF0aCgpO1xuLy8gICAvLyAgIGxvZyhwYXRoLl9uYW1lZENoaWxkcmVuWydtaWRkbGUnXSk7XG4vLyAgIC8vICAgcGF0aENvcHkuY29weUNvbnRlbnQocGF0aC5fbmFtZWRDaGlsZHJlblsnbWlkZGxlJ10pO1xuLy8gICAvLyAgIGxvZyhwYXRoQ29weSk7XG4vLyAgIC8vIH1cbi8vIH1cblxuZXhwb3J0IGZ1bmN0aW9uIGNoZWNrUG9wcygpIHtcbiAgbGV0IGdyb3VwcyA9IHBhcGVyLnByb2plY3QuZ2V0SXRlbXMoe1xuICAgIGNsYXNzTmFtZTogJ0dyb3VwJyxcbiAgICBtYXRjaDogZnVuY3Rpb24oZWwpIHtcbiAgICAgIHJldHVybiAoISFlbC5kYXRhICYmIGVsLmRhdGEudXBkYXRlKTtcbiAgICB9XG4gIH0pO1xufVxuXG4vLyBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2ZvcnVtLyMhdG9waWMvcGFwZXJqcy9VRDhMME1UeVJlUVxuZXhwb3J0IGZ1bmN0aW9uIG92ZXJsYXBzKHBhdGgsIG90aGVyKSB7XG4gIHJldHVybiAhKHBhdGguZ2V0SW50ZXJzZWN0aW9ucyhvdGhlcikubGVuZ3RoID09PSAwKTtcbn1cblxuLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIXRvcGljL3BhcGVyanMvVUQ4TDBNVHlSZVFcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZU9uZVBhdGgocGF0aCwgb3RoZXJzKSB7XG4gIGxldCBpLCBtZXJnZWQsIG90aGVyLCB1bmlvbiwgX2ksIF9sZW4sIF9yZWY7XG4gIGZvciAoaSA9IF9pID0gMCwgX2xlbiA9IG90aGVycy5sZW5ndGg7IF9pIDwgX2xlbjsgaSA9ICsrX2kpIHtcbiAgICBvdGhlciA9IG90aGVyc1tpXTtcbiAgICBpZiAob3ZlcmxhcHMocGF0aCwgb3RoZXIpKSB7XG4gICAgICB1bmlvbiA9IHBhdGgudW5pdGUob3RoZXIpO1xuICAgICAgbWVyZ2VkID0gbWVyZ2VPbmVQYXRoKHVuaW9uLCBvdGhlcnMuc2xpY2UoaSArIDEpKTtcbiAgICAgIHJldHVybiAoX3JlZiA9IG90aGVycy5zbGljZSgwLCBpKSkuY29uY2F0LmFwcGx5KF9yZWYsIG1lcmdlZCk7XG4gICAgfVxuICB9XG4gIHJldHVybiBvdGhlcnMuY29uY2F0KHBhdGgpO1xufTtcblxuLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIXRvcGljL3BhcGVyanMvVUQ4TDBNVHlSZVFcbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVBhdGhzKHBhdGhzKSB7XG4gIHZhciBwYXRoLCByZXN1bHQsIF9pLCBfbGVuO1xuICByZXN1bHQgPSBbXTtcbiAgZm9yIChfaSA9IDAsIF9sZW4gPSBwYXRocy5sZW5ndGg7IF9pIDwgX2xlbjsgX2krKykge1xuICAgIHBhdGggPSBwYXRoc1tfaV07XG4gICAgcmVzdWx0ID0gbWVyZ2VPbmVQYXRoKHBhdGgsIHJlc3VsdCk7XG4gIH1cbiAgcmV0dXJuIHJlc3VsdDtcbn07XG5cbmV4cG9ydCBmdW5jdGlvbiBoaXRUZXN0Qm91bmRzKHBvaW50LCBjaGlsZHJlbikge1xuICBpZiAoIXBvaW50KSByZXR1cm4gbnVsbDtcblxuICBmb3IgKGxldCBpID0gY2hpbGRyZW4ubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBsZXQgY2hpbGQgPSBjaGlsZHJlbltpXTtcbiAgICBsZXQgYm91bmRzID0gY2hpbGQuc3Ryb2tlQm91bmRzO1xuICAgIGlmIChwb2ludC5pc0luc2lkZShjaGlsZC5zdHJva2VCb3VuZHMpKSB7XG4gICAgICByZXR1cm4gY2hpbGQ7XG4gICAgfVxuICB9XG5cbiAgcmV0dXJuIG51bGw7XG59XG4iXX0=
