const channel = new BroadcastChannel('hollywood_squares');

let currentTurn = 'X';
let activeSquareIndex = null;
let starTypewriterInterval = null;

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
            updateSquareGlow();
            break;

        case 'SELECT_SQUARE':
            activeSquareIndex = data.index;
            updateSquareGlow();
            break;

        case 'UPDATE_TEXT':
            if (data.question !== undefined) questionText.textContent = data.question;
            if (data.truthAns !== undefined) actualAnsText.textContent = data.truthAns;
            break;

        case 'SHOW_QUESTION':
            overlay.classList.remove('hidden');
            questionText.classList.remove('hidden');
            break;

        case 'REVEAL_STAR':
            starAnsBox.classList.remove('hidden');
            // Typewriter effect on TV screen
            animateStarText(data.starAns || "");
            break;

        case 'REVEAL_TRUTH':
            actualAnsBox.classList.remove('hidden');
            break;

        case 'HIDE_ALL_TEXTS':
            overlay.classList.add('hidden');
            questionText.classList.add('hidden');
            starAnsBox.classList.add('hidden');
            actualAnsBox.classList.add('hidden');
            clearInterval(starTypewriterInterval);
            starAnsText.textContent = '';
            break;

        case 'MARK_SQUARE':
            if (data.index !== null) {
                const markDiv = document.querySelector(`#sq-${data.index} .mark`);
                markDiv.textContent = data.mark;
                markDiv.className = `mark ${data.mark}`;
            }
            break;

        case 'WIN_LINE':
            squares.forEach(sq => sq.classList.remove('winning-line'));
            if (data.combo) {
                data.combo.forEach(idx => {
                    document.getElementById(`sq-${idx}`).classList.add('winning-line');
                });
            }
            break;

        case 'CLEAR_WIN_LINE':
            squares.forEach(sq => sq.classList.remove('winning-line'));
            break;

        case 'RESET_BOARD':
            squares.forEach(sq => {
                sq.classList.remove('glow-x', 'glow-o', 'winning-line');
                const markDiv = sq.querySelector('.mark');
                markDiv.textContent = '';
                markDiv.className = 'mark';
            });
            activeSquareIndex = null;
            break;
    }
}

// Typewriter Animation for Star's Answer
function animateStarText(text) {
    clearInterval(starTypewriterInterval);
    starAnsText.textContent = '';
    let i = 0;

    starTypewriterInterval = setInterval(() => {
        if (i < text.length) {
            starAnsText.textContent += text.charAt(i);
            i++;
        } else {
            clearInterval(starTypewriterInterval);
        }
    }, 45); // Adjust typing speed in ms
}

function updateSquareGlow() {
    squares.forEach(sq => sq.classList.remove('glow-x', 'glow-o'));

    if (activeSquareIndex !== null) {
        const activeSquare = document.getElementById(`sq-${activeSquareIndex}`);
        if (activeSquare) {
            const glowClass = (currentTurn === 'X') ? 'glow-x' : 'glow-o';
            activeSquare.classList.add(glowClass);
        }
    }
}

channel.onmessage = (event) => processCommand(event.data);

window.addEventListener('storage', (event) => {
    if (event.key === 'hs_command') {
        processCommand(JSON.parse(event.newValue));
    }
});
