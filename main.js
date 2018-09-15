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
    l: 1,
    s: true,
    tc: 12,
    tt: {}
};

var gameSetup = defaultSetup;
var appState = 0;

// === Constants for setup screen
var PLAYER_OFF = 0, PLAYER_HUMAN = 1, PLAYER_AI = 2;

var UNLIMITED_TURNS = 1000000, TURN_COUNTS = [9, 12, 15, UNLIMITED_TURNS];

// == Application "states"
var APP_SETUP_SCREEN = 0, APP_INGAME = 1;

////
////
//Game Setup
runSetupScreen();

function runSetupScreen() {
    // we're in setup now
    appState = APP_SETUP_SCREEN;

    // generate initial setup and game state
    var game = deepCopy(defaultSetup, 2);
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

    game = makeInitialState(gameState);
    prepareIngameUI(game);
    updateIngameUI(game);
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
    $('m-players').innerHTML = html;

    // show stat box and undo button
    //TODO uncomment
    map(['menu'], show);
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

    return gameState;
}

/**
 * Updates all the UI elements from the gameState
 *
 * @param  {[type]} gameState
 *
 * @return {[type]}
 */
function updateIngameUI(gameState) {
    var moveState = gameState.m;
    var decisionState = gameState.d;
    var buildingMode = decisionState && (decisionState.t == BUILD_ACTION);
    var movingArmy = decisionState && decisionState.s;

    var active = activePlayer(gameState);

    // turn counter/building name
    if (buildingMode) {
        var info = templeInfo(gameState, decisionState.w);
        $('m-turn-info').innerHTML = div({}, info.n) + div({c: 'ds'}, info.d);
    } else {
        $('m-turn-info').innerHTML = 'Turn <b>' + gameState.m.t + '</b>' + ((gameSetup.tc != UNLIMITED_TURNS) ? ' / ' + gameSetup.tc : '');
    }

    // player data
    map(gameState.p, function(player, index) {
        //$('pl' + index).className = (index == moveState.p) ? 'pl' : 'pi'; // active or not?
        var regions = regionCount(gameState, player);
        var gameWinner = gameState.e;

        if (regions) {
            $('pr' + index).innerHTML = regionCount(gameState, player) + '&#9733;'; // region count
            if (gameWinner) {
                $('pc' + index).innerHTML = (gameWinner == player) ? '&#9819;' : '';
            } else {
                $('pc' + index).innerHTML = gameState.c[player.i] + '&#9775;'; // cash on hand
            }
        } else {
            $('pr' + index).innerHTML = '&#9760;'; // skull and crossbones, you're dead
            $('pc' + index).innerHTML = '';
        }
    });

    // move info
    var info;
    if (active.u == uiPickMove) {
        if (buildingMode) {
            if (owner(gameState, decisionState.r) == active)
                info = elem('p', {}, 'Choose an upgrade to build.');
            else
                info = '';
        } else if (movingArmy) {
            info = elem('p', {}, 'Click on this region again to choose how many to move.') +
                elem('p', {}, 'Click on a target region to move the army.');

        } else {

            info = elem('p', {}, 'Click on a region to move or attack with its army.') +
                elem('p', {}, 'Click on a temple to buy soldiers or upgrades with &#9775;.');
        }
    } else {
        info = elem('p', {}, active.n + ' is taking her turn.');
    }
    $('in').innerHTML = info;
    $('in').style.background = active.d;

    // active player stats
    $('m-players').style.display =  buildingMode ? 'none' : 'block';
    $('m-player-info').innerHTML = moveState.l + elem('span', {s: 'font-size: 80%'}, '&#10138;');
    $('ft').innerHTML = gameState.c[active.i] +  elem('span', {s: 'font-size: 80%'}, '&#9775;');

    // buttons
    updateButtons(decisionState && decisionState.b);

    // undo
    $('und').innerHTML = undoEnabled(gameState) ? "&#x21b6;" : "";
}

function generateMap(playerCount) {
    //TODO
    return [
        {i: 0, p: [0,0], d:[]},
        {i: 1, p: [0,1], d:[]},
        {i: 2, p: [1,0], d:[]},
        {i: 3, p: [0,2], d:[]}
    ];
}

function uiPickMove() {
    //TODO
}

function aiPickMove() {
    //TODO
}

function movesPerTurn() {
    //TODO
}

////
////
//  Helper Functions

function regionHasActiveArmy(state, player, region) {
    return (state.m.l > 0) && (owner(state, region) == player) && soldierCount(state, region) && (!contains(state.m.z, region));
}

function regionCount(state, player) {
    var total = 0;
    map(state.r, function(region) {
        if (owner(state, region) == player)
            total++;
    });
    return total;
}

function activePlayer(state) {
    return state.p[state.m.p];
}

function owner(state, region) {
    return state.o[region.i];
}

function cash(state, player) {
    return state.c[player.i];
}