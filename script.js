// Sample Questions Database (Question, True Answer, Bluff Answer)
const questionsDB = [
    {
        q: "What color is a polar bear's skin under its fur?",
        trueAns: "Black",
        bluffAns: "Pink"
    },
    {
        q: "Which planet in our solar system spins backwards?",
        trueAns: "Venus",
        bluffAns: "Mars"
    },
    {
        q: "How many hearts does an octopus have?",
        trueAns: "Three",
        bluffAns: "One"
    },
    {
        q: "In what country was Hawaiian pizza invented?",
        trueAns: "Canada",
        bluffAns: "Hawaii"
    }
];

let boardState = Array(9).fill(null);
let currentPlayer = 'X';
let activeSquareIndex = null;
let currentQuestion = null;
let isStarTellingTruth = false;

const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

// UI Elements
const squares = document.querySelectorAll('.square');
const modal = document.getElementById('question-modal');
const questionText = document.getElementById('question-text');
const starResponse = document.getElementById('star-response');
const currentPlayerDisplay = document.getElementById('current-player');
const gameStatus = document.getElementById('game-status');

// Handle Square Click
squares.forEach(square => {
    square.addEventListener('click', () => {
        const index = square.getAttribute('data-index');
        
        // Don't click occupied squares
        if (boardState[index] !== null) return;

        activeSquareIndex = index;
        openQuestionModal();
    });
});

function openQuestionModal() {
    // Pick random question
    currentQuestion = questionsDB[Math.floor(Math.random() * questionsDB.length)];
    
    // Decide randomly if the star tells the truth or bluffs (50/50)
    isStarTellingTruth = Math.random() < 0.5;
    const response = isStarTellingTruth ? currentQuestion.trueAns : currentQuestion.bluffAns;

    questionText.textContent = currentQuestion.q;
    starResponse.textContent = response;
    modal.classList.remove('hidden');
}

// Player choices
document.getElementById('agree-btn').addEventListener('click', () => handlePlayerChoice(true));
document.getElementById('disagree-btn').addEventListener('click', () => handlePlayerChoice(false));

function handlePlayerChoice(playerAgreed) {
    modal.classList.add('hidden');

    // Was the player correct?
    // Player wins if: (Agreed & Star told truth) OR (Disagreed & Star bluffed)
    const playerIsCorrect = (playerAgreed === isStarTellingTruth);
    const opponent = currentPlayer === 'X' ? 'O' : 'X';

    let squareOwner = null;

    if (playerIsCorrect) {
        squareOwner = currentPlayer;
    } else {
        // According to official rules: Opponent gets square UNLESS it causes opponent to win 3-in-a-row.
        if (wouldCauseWin(opponent, activeSquareIndex)) {
            alert(`Player ${currentPlayer} was wrong, but ${opponent} cannot win on a wrong answer! Square remains unclaimed.`);
            switchTurn();
            return;
        } else {
            squareOwner = opponent;
        }
    }

    claimSquare(activeSquareIndex, squareOwner);

    if (checkWin(squareOwner)) {
        gameStatus.textContent = `🎉 PLAYER ${squareOwner} WINS THE GAME! 🎉`;
        disableBoard();
    } else if (boardState.every(cell => cell !== null)) {
        gameStatus.textContent = "It's a Tie!";
    } else {
        switchTurn();
    }
}

function claimSquare(index, owner) {
    boardState[index] = owner;
    const markDiv = squares[index].querySelector('.mark');
    markDiv.textContent = owner;
    markDiv.classList.add(owner);
}

function switchTurn() {
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
    currentPlayerDisplay.textContent = `Player ${currentPlayer}`;
    currentPlayerDisplay.className = `player-${currentPlayer.toLowerCase()}`;
}

function checkWin(player) {
    return winningCombos.some(combo => {
        return combo.every(index => boardState[index] === player);
    });
}

function wouldCauseWin(player, newIndex) {
    const tempBoard = [...boardState];
    tempBoard[newIndex] = player;
    return winningCombos.some(combo => combo.every(i => tempBoard[i] === player));
}

function disableBoard() {
    squares.forEach(sq => sq.style.pointerEvents = 'none');
}
