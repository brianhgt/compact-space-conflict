
// ==========================================================
// Helper functions used for brevity or convenience.
// ==========================================================

var sin = Math.sin; 
var cos = Math.cos;
var floor = Math.floor;
var ceil = Math.ceil;
	
var wnd = window;
var doc = document;

var div = elem.bind(0,'div');


// Returns a random number between low (inclusive) and high (exclusive).
function rint(low,high) {
	return floor(low+Math.random()*(high-low));
}

// Returns an array of integers from low (inclusive) to high (exclusive).
function range(low,high) {
	var r = [];
	for (var i = low; i < high; i++)
		r.push(i);
	return r;
}

// Identity function (useful as a default for callback accepting functions like min).
function identity(x) { return x; }

// Creates a deep copy of an object, handling nested objects and arrays. Depth controls how deep
// the copy goes - the number of nesting levels that should be replicated.
function deepCopy(obj, depth) {
    if ((!depth) || (typeof obj != 'object')) return obj;

    var copy = (obj.length !== undefined) ? [] : {};
    forEachProperty(obj, function(value, key) {
        copy[key] = deepCopy(value, depth-1);
    });
    return copy;
}

// Clamps a number - if it's lower than low or higher than high, it's brought into range.
function clamp(number, low, high) {
    return (number < low) ? low : ((number > high) ? high : number);
}

// Returns the current timestamp.
function now() {
    return Date.now();
}

// Treats a given text as a template, replacing 'X' with the second parameter.
function template(text, replacement) {
    return text.replace(/X/g, replacement);
}

// ==========================================================
// Loop constructs
// ==========================================================

// Same as array.map, but can be called on non-arrays (and minifies better).
function map(seq,fn) {
	return [].slice.call(seq).map(fn);
}

// Iterates over all properties of an object, and calls the callback with (value, propertyName).
function forEachProperty(obj,fn) {
	for (var property in obj)
		fn(obj[property], property);
}

// Iterates over a rectangle (x1,y1)-(x2,y2), and calls fn with (x,y) of each integer point.
function for2d(x1,y1,x2,y2,fn) {
	map(range(x1,x2), function(x) {
		map(range(y1,y2), fn.bind(0,x));
	});
}

// ==========================================================
// Working with the DOM
// ==========================================================

// Returns the element bearing the given ID.
function $(id) {
    return doc.querySelector('#' + id);
}

// Return HTML (string) for a new element with the given tag name, attributes, and inner HTML.
// Some attributes can be shorthanded (see map).
function elem(tag,attrs,contents) {
	var shorthanded = {
		c: 'class',
		s: 'style',
		i: 'id'
	};
	var html = '<' + tag + ' ';
	for (var attributeName in attrs) {
		html += (shorthanded[attributeName] || attributeName) + "='" + attrs[attributeName] + "'";
	}
	html += '>' + (contents || '') + '</' + tag + '>';

	return html;
}

// Appends new HTML to a container with the designated ID, and returns the resulting DOM node.
function append(containerId, newHTML) {
    var container = $(containerId);
    container.insertAdjacentHTML('beforeend', newHTML);
    return container.lastChild;
}

// Sets the 'transform' CSS property to a given value (also setting prefixed versions).
function setTransform(elem, value) {
    elem.style.transform = value;
    elem.style['-webkit-transform'] = value;
}

// Adds a handler that will be called when a DOM element is clicked or tapped (touch events).
function onClickOrTap(elem, fn) {
    elem.onclick = fn;
    elem.addEventListener('touchstart', function(event) {
        event.preventDefault();
        return fn(event);
    });
}

// Shows or hides an element with the given ID, depending on the second parameter.
function showOrHide(elementId, visible) {
    $(elementId).style.display = visible ? 'block' : 'none';
}

function hide(elementId) { showOrHide(elementId, 0); }
function show(elementId) { showOrHide(elementId, 1); }

function toggleClass(element, className, on) {
    if (typeof element == 'string')
        element = $(element);
    element.classList[on ? 'add' : 'remove'](className);
}

// ==========================================================
// Working on sequences
// ==========================================================

// Takes a sequence, and returns the smallest element according to a given key function.
// If no key is given, the elements themselves are compared.
function min(seq, keyFn) {
	keyFn = keyFn || identity;
	var smallestValue = keyFn(seq[0]), smallestElement;
	map(seq, function(e) {
		if (keyFn(e) <= smallestValue) {
			smallestElement = e;
			smallestValue = keyFn(e);
		}
	});
	return smallestElement;
}

// Returns the biggest element of a sequence, see 'min'.
function max(seq, keyFn) {
    keyFn = keyFn || identity;
    return min(seq, function(elem) { return -keyFn(elem); })
}

// Returns the sum of a sequences, optionally taking a function that maps elements to numbers.
function sum(seq, keyFn) {
    var total = 0;
    map(seq, function(elem){
        total += keyFn(elem);
    });
    return total;
}

// Checks whether a sequence contains a given element.
function contains(seq, elem) {
    return seq && (seq.indexOf(elem) >= 0);
}

// Takes an array, and returns another array containing the result of applying a function
// on all possible pairs of elements.
function pairwise(array, fn) {
	var result = [];
	map(array, function(elem1, index) {
		map(array.slice(index+1), function(elem2) {
			result.push(fn(elem1, elem2));
		});
	});
	return result;
}

// Shuffles a sequence (in place) and returns it.
function shuffle(seq) {
    map(seq, function(_, index) {
        var otherIndex = rint(index, seq.length);
        var t = seq[otherIndex];
        seq[otherIndex] = seq[index];
        seq[index] = t;
    });
    return seq;
}
