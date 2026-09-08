const channel = new BroadcastChannel('hollywood_squares');

channel.onmessage = function (event) {
    const data = event.data;

    if (data.type === 'UPDATE_STAR_NAMES') {
        data.names.forEach((name, index) => {
            const squareEl = document.getElementById(`square-${index}`);
            if (!squareEl) return;

            let nameEl = squareEl.querySelector('.star-name-display');
            if (!nameEl) {
                nameEl = document.createElement('div');
                nameEl.className = 'star-name-display';
                squareEl.appendChild(nameEl);
            }

            nameEl.textContent = name;

            // Handle initial visibility
            if (data.revealed[index]) {
                nameEl.classList.remove('hidden');
            } else {
                nameEl.classList.add('hidden');
            }
        });
    }

    if (data.type === 'MARK_SQUARE') {
        const index = data.index;
        const mark = data.mark;
        const squareEl = document.getElementById(`square-${index}`);
        if (!squareEl) return;

        let nameEl = squareEl.querySelector('.star-name-display');
        let markEl = squareEl.querySelector('.square-mark-display');

        if (!markEl) {
            markEl = document.createElement('div');
            markEl.className = 'square-mark-display';
            squareEl.appendChild(markEl);
        }

        if (mark !== '') {
            // Mark placed: Zoom out name, Zoom in mark
            if (nameEl) nameEl.classList.add('zoomed-out');
            markEl.textContent = mark;
            markEl.className = `square-mark-display mark-${mark.toLowerCase()} zoomed-in`;
        } else {
            // Mark cleared: Zoom out mark, Bring back name
            markEl.classList.remove('zoomed-in');
            if (nameEl) nameEl.classList.remove('zoomed-out');
        }
    }
};
