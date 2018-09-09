// ==========================================================
// This part of the code deals with responding to user actions.
// ==========================================================

var uiCallbacks = {};

// This is the handler that gets attached to most DOM elements.
// Delegation through UI callbacks allows us to react differently
// depending on game-state.
function invokeUICallback(object, type, event) {
    var cb = uiCallbacks[type];
    if (cb) {
        playSound(audioClick);
        cb(object);
    }
    if (event.target.href && event.target.href != "#")
        return 1;

    event.stopPropagation();
    return 0;
}

function buttonMenu(title, buttonIdPrefix, buttonLabels, additionalProperties) {
    var buttons = map(buttonLabels, function(label, index) {
        var id = buttonIdPrefix + (buttonLabels.length-1-index);
        return elem('a', {i: id, c: 'rt', href: '#', s: 'font-size: 90%'}, label);
    }).join("");
    var properties = {c: 'sc ds', s: 'padding-right: 0.5em'};
    forEachProperty(additionalProperties, function(value, name) {
        properties[name] = value;
    });
    return div(properties, title + buttons);
}