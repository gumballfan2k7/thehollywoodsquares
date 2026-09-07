const channel = new BroadcastChannel('hollywood_squares');

let currentTurn = 'X';
let activeSquareIndex = null;
let boardState = Array(9).fill('');
let parsedQuestions = [];

const winningCombos = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
    [0, 4, 8], [2, 4, 6]             // Diagonals
];

function sendCommand(data) {
    channel.postMessage(data);
    data._timestamp = Date.now();
    localStorage.setItem('hs_command', JSON.stringify(data));
}

function setTurn(turn) {
    currentTurn = turn;
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

/* --- Excel Processing --- */
function handleExcelUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        
        parsedQuestions = XLSX.utils.sheet_to_json(worksheet);
        populateQuestionDropdown();
    };
    reader.readAsArrayBuffer(file);
}

function populateQuestionDropdown() {
    const select = document.getElementById('question-select');
    select.innerHTML = '<option value="">-- Select a Question --</option>';

    parsedQuestions.forEach((item, index) => {
        const qText = item["Question"] || item["question"] || `Question ${index + 1}`;
        const option = document.createElement('option');
        option.value = index;
        option.textContent = `${index + 1}. ${qText.substring(0, 45)}...`;
        select.appendChild(option);
    });
}

function loadSelectedQuestion() {
    const select = document.getElementById('question-select');
    const index = select.value;
    if (index === "") return;

    const q = parsedQuestions[index];
    document.getElementById('input-q').value = q["Question"] || q["question"] || "";
    document.getElementById('input-truth').value = q["Actual Answer"] || q["actual answer"] || q["True Answer"] || "";
    
    // Clear star answer box so host can type live what the celebrity says
    document.getElementById('input-star').value = "";

    sendTextData();
}

function sendTextData() {
    sendCommand({
        type: 'UPDATE_TEXT',
        question: document.getElementById('input-q').value,
        truthAns: document.getElementById('input-truth').value
    });
}

/* --- Screen Reveal Functions --- */
function showQuestion() {
    sendTextData();
    sendCommand({ type: 'SHOW_QUESTION' });
}

function revealStar() {
    const starAns = document.getElementById('input-star').value;
    sendCommand({ 
        type: 'REVEAL_STAR',
        starAns: starAns
    });
}

function revealTruth() {
    sendTextData();
    sendCommand({ type: 'REVEAL_TRUTH' });
}

function hideAllTexts() {
    sendCommand({ type: 'HIDE_ALL_TEXTS' });
}

/* --- Mark & Game State --- */
function markSquare(symbol) {
    if (activeSquareIndex === null) {
        alert("Please select a square first!");
        return;
    }

    boardState[activeSquareIndex] = symbol;

    sendCommand({
        type: 'MARK_SQUARE',
        index: activeSquareIndex,
        mark: symbol
    });

    checkWinningLine();
}

function checkWinningLine() {
    let winCombo = null;

    for (let combo of winningCombos) {
        const [a, b, c] = combo;
        if (boardState[a] && boardState[a] === boardState[b] && boardState[a] === boardState[c]) {
            winCombo = combo;
            break;
        }
    }

    if (winCombo) {
        sendCommand({ type: 'WIN_LINE', combo: winCombo });
    } else {
        sendCommand({ type: 'CLEAR_WIN_LINE' });
    }
}

function resetBoard() {
    if (confirm("Reset the entire board?")) {
        boardState = Array(9).fill('');
        activeSquareIndex = null;
        sendCommand({ type: 'RESET_BOARD' });
    }
}
