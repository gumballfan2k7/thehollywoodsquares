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
const choiceBox = document.getElementById('display-choice');
const choiceText = document.getElementById('choice-text');
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

        case 'UPDATE_NAMES':
            data.names.forEach((name, idx) => {
                const nameDiv = document.querySelector(`#sq-${idx} .star-name`);
                if (nameDiv) nameDiv.textContent = name;
            });
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
            overlay.classList.remove('hidden');
            starAnsBox.classList.remove('hidden');
            animateStarText(data.starAns || "");
            break;

        case 'REVEAL_CHOICE':
            overlay.classList.remove('hidden');
            choiceBox.classList.remove('hidden', 'choice-agree', 'choice-disagree');
            void choiceBox.offsetWidth; // Reflow for animation
            if (data.choice === 'AGREE') {
                choiceText.textContent = 'PLAYER CHOSE: AGREE';
                choiceBox.classList.add('choice-agree');
            } else if (data.choice === 'DISAGREE') {
                choiceText.textContent = 'PLAYER CHOSE: DISAGREE';
                choiceBox.classList.add('choice-disagree');
            }
            break;

        case 'REVEAL_TRUTH':
            overlay.classList.remove('hidden');
            actualAnsBox.classList.remove('hidden');
            break;

        case 'HIDE_ALL_TEXTS':
            overlay.classList.add('hidden');
            questionText.classList.add('hidden');
            starAnsBox.classList.add('hidden');
            choiceBox.classList.add('hidden');
            actualAnsBox.classList.add('hidden');
            clearInterval(starTypewriterInterval);
            starAnsText.textContent = '';
            break;

        case 'MARK_SQUARE':
            if (data.index !== null) {
                const markDiv = document.querySelector(`#sq-${data.index} .mark`);
                const nameDiv = document.querySelector(`#sq-${data.index} .star-name`);
                
                markDiv.textContent = data.mark;
                markDiv.className = `mark ${data.mark}`;

                // Hide name if X or O is placed. Show name if it's cleared.
                if (data.mark === 'X' || data.mark === 'O') {
                    nameDiv.classList.add('hidden');
                } else {
                    nameDiv.classList.remove('hidden');
                }
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
                
                // Show names again
                const nameDiv = sq.querySelector('.star-name');
                if (nameDiv) nameDiv.classList.remove('hidden');
            });
            activeSquareIndex = null;
            break;
    }
}

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
    }, 45);
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
