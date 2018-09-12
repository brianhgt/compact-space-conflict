var unitDivsById = {};

// === The possible move types
var MOVE_ARMY = 1, BUILD_ACTION = 2, END_TURN = 3;

// === Player properties
var PLAYER_TEMPLATES = [
    {i:0, n: 'Amber', l: '#fd8', d:'#960', h: '#fd8', hd:'#a80'},
    {i:1, n: 'Crimson', l: '#f88', d:'#722', h: '#faa', hd:'#944'},
    {i:2, n: 'Lavender', l: '#d9d', d:'#537', h: '#faf', hd:'#759'},
    {i:3, n: 'Emerald', l: '#9d9', d:'#262', h: '#bfb', hd:'#484'}
];

var defaultSetup = {
    p: [PLAYER_HUMAN, PLAYER_AI, PLAYER_AI, PLAYER_OFF],
    l: AI_NICE,
    s: true,
    tc: 12,
    tt: {}
};

var gameSetup = defaultSetup;

// === Constants for setup screen
var PLAYER_OFF = 0, PLAYER_HUMAN = 1, PLAYER_AI = 2;

var UNLIMITED_TURNS = 1000000, TURN_COUNTS = [9, 12, 15, UNLIMITED_TURNS];

// == Application "states"
var APP_SETUP_SCREEN = 0, APP_INGAME = 1;


// === Game Setup

function runSetupScreen() {
    // we're in setup now
    appState = APP_SETUP_SCREEN;

    // generate initial setup and game state
    var game;
    regenerateMap();

    // prepare UI
    prepareSetupUI();
    updateConfigButtons();

    //TODO change from skip
    prepareMainScreen(game);
}

function regenerateMap() {
    //TODO
}

function prepareSetupUI() {
    //TODO
}

function updateConfigButtons() {
    //TODO
}

function prepareMainScreen(gameState) {
    // we're in setup now
    appState = APP_INGAME;

    prepareIngameUI(gameState);

}

// Prepares the whole sidebar on the left for gameplay use.
function prepareIngameUI(gameState) {
    // turn counter
    var html = div({i: 'm-turn-info', c: 'sc'});

    // player box area
    html += div({i: 'm-players', c: 'sc un'}, map(gameState.p, function(player) {
        var pid = player.i;
        return div({
            i: 'pl' + pid,
            c: 'pl',
            style: 'background: ' + player.d
        }, player.n +
            div({c: 'ad', i: 'pr' + pid}) +
            div({c: 'ad', i: 'pc' + pid})
        );
    }).join(''));

    // info box
    html += div({c: 'sc un ds', i: 'in'});

    // set it all
    $('d').innerHTML = html;

    // show stat box and undo button
    map(['mv', 'und', 'end'], show);
}

function makeInitialState(setup) {
    var players = [];
    map(setup.p, function(playerController, playerIndex) {
        if (playerController == PLAYER_OFF) return;
        var player = deepCopy(PLAYER_TEMPLATES[playerIndex], 1);

        // set up as AI/human
        player.u = (playerController == PLAYER_HUMAN) ? uiPickMove : aiPickMove;
        // pick a random personality if we're AI
        if (playerController == PLAYER_AI) {
            player.p = deepCopy(AI_PERSONALITIES[rint(0, AI_PERSONALITIES.length)], 2);
        }

        player.i = players.length;
        players.push(player);
    });

    var regions = generateMap(players.length);
    var gameState = {
        p: players,
        r: regions,
        o: {}, t: {}, s: {}, c: {}, l: {},
        m: {t: 1, p: 0, m: MOVE_ARMY, l: movesPerTurn}
    };
}

function generateMap(playerCount) {
    //TODO
}