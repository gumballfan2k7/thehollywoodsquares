// Open communication channel with Host panel
const channel = new BroadcastChannel('hollywood_squares');

// UI Elements
const squares = document.querySelectorAll('.square');
const overlay = document.getElementById('tv-overlay');
const questionText = document.getElementById('display-question');
const starAnsBox = document.getElementById('display-star-ans');
const starAnsText = document.getElementById('star-ans-text');
const actualAnsBox = document.getElementById('display-actual-ans');
const actualAnsText = document.getElementById('actual-ans-text');

// Listen for commands from host.html
channel.onmessage = (event) => {
    const data = event.data;

    switch (data.type) {
        case 'SELECT_SQUARE':
            squares.forEach(sq => sq.classList.remove('glowing'));
            if (data.index !== null) {
                document.getElementById(`sq-${data.index}`).classList.add('glowing');
            }
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
            const markDiv = document.querySelector(`#sq-${data.index} .mark`);
            markDiv.textContent = data.mark;
            markDiv.className = `mark ${data.mark}`;
            break;
    }
};
