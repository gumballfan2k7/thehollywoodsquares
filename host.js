const channel = new BroadcastChannel('hollywood_squares');

let currentTurn = 'X';
let activeSquareIndex = null;

function sendCommand(data) {
    // Send via BroadcastChannel
    channel.postMessage(data);
    // Backup send via localStorage
    data._timestamp = Date.now();
    localStorage.setItem('hs_command', JSON.stringify(data));
}

function setTurn(turn) {
    currentTurn = turn;
    
    // UI Button state updates
    document.getElementById('btn-turn-x').classList.toggle('btn-active', turn === 'X');
    document.getElementById('btn-turn-o').classList.toggle('btn-active', turn === 'O');

    sendCommand({ type: 'SET_TURN', turn: turn });
}

function selectSquare(index) {
    activeSquareIndex = index;
    sendCommand({ type: 'SELECT_SQUARE', index: index });
}

function clearGlow() {
    activeSquareIndex = null;
    sendCommand({ type: 'SELECT_SQUARE', index: null });
}

function sendTextData() {
    const question = document.getElementById('input-q').value;
    const starAns = document.getElementById('input-star').value;
    const truthAns = document.getElementById('input-truth').value;

    sendCommand({
        type: 'UPDATE_TEXT',
        question: question,
        starAns: starAns,
        truthAns: truthAns
    });
}

function toggleOverlay(show) {
    sendTextData();
    sendCommand({ type: 'TOGGLE_OVERLAY', show: show });
}

function revealElement(elem) {
    sendTextData();
    sendCommand({ type: 'REVEAL_ELEMENT', element: elem });
}

function resetReveals() {
    sendCommand({ type: 'RESET_REVEALS' });
}

function markSquare(symbol) {
    if (activeSquareIndex === null) {
        alert("Please select a square first!");
        return;
    }
    sendCommand({
        type: 'MARK_SQUARE',
        index: activeSquareIndex,
        mark: symbol
    });
}
