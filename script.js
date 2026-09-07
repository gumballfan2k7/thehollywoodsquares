const channel = new BroadcastChannel('hollywood_squares');

let currentTurn = 'X';
let activeSquareIndex = null;

// UI Elements
const turnDisplay = document.getElementById('tv-turn-display');
const squares = document.querySelectorAll('.square');
const overlay = document.getElementById('tv-overlay');
const questionText = document.getElementById('display-question');
const starAnsBox = document.getElementById('display-star-ans');
const starAnsText = document.getElementById('star-ans-text');
const actualAnsBox = document.getElementById('display-actual-ans');
const actualAnsText = document.getElementById('actual-ans-text');

function processCommand(data) {
    if (!data) return;

    switch (data.type) {
        case 'SET_TURN':
            currentTurn = data.turn;
            turnDisplay.textContent = `Player ${currentTurn}`;
            turnDisplay.className = currentTurn === 'X' ? 'text-x' : 'text-o';
            updateSquareGlow(); // Update active glow color immediately
            break;

        case 'SELECT_SQUARE':
            activeSquareIndex = data.index;
            updateSquareGlow();
            break;

        case 'UPDATE_TEXT':
            if (data.question !== undefined) questionText.textContent = data.question;
            if (data.starAns !== undefined) starAnsText.textContent = data.starAns;
            if (data.truthAns !== undefined) actualAnsText.textContent = data.truthAns;
            break;

        case 'TOGGLE_OVERLAY':
            if (data.show) overlay.classList.remove('hidden');
            else overlay.classList.add('hidden');
            break;

        case 'REVEAL_ELEMENT':
            if (data.element === 'question') questionText.classList.remove('hidden');
            if (data.element === 'star') starAnsBox.classList.remove('hidden');
            if (data.element === 'truth') actualAnsBox.classList.remove('hidden');
            break;

        case 'RESET_REVEALS':
            questionText.classList.add('hidden');
            starAnsBox.classList.add('hidden');
            actualAnsBox.classList.add('hidden');
            break;

        case 'MARK_SQUARE':
            if (data.index !== null) {
                const markDiv = document.querySelector(`#sq-${data.index} .mark`);
                markDiv.textContent = data.mark;
                markDiv.className = `mark ${data.mark}`;
            }
            break;
    }
}

function updateSquareGlow() {
    // Remove glow from all squares
    squares.forEach(sq => {
        sq.classList.remove('glow-x', 'glow-o');
    });

    // Add glowing class based on current turn color
    if (activeSquareIndex !== null) {
        const activeSquare = document.getElementById(`sq-${activeSquareIndex}`);
        if (activeSquare) {
            const glowClass = (currentTurn === 'X') ? 'glow-x' : 'glow-o';
            activeSquare.classList.add(glowClass);
        }
    }
}

// 1. Primary BroadcastChannel Listener
channel.onmessage = (event) => processCommand(event.data);

// 2. Storage Event Listener Backup
window.addEventListener('storage', (event) => {
    if (event.key === 'hs_command') {
        const data = JSON.parse(event.newValue);
        processCommand(data);
    }
});
