case 'REVEAL_CHOICE':
            // 1. Force the main overlay container to be visible
            overlay.classList.remove('hidden');
            
            // 2. Clear old classes cleanly
            choiceBox.classList.remove('hidden');
            choiceBox.classList.remove('choice-agree');
            choiceBox.classList.remove('choice-disagree');

            // 3. Force DOM reflow so pop-in animation plays every time
            void choiceBox.offsetWidth;

            // 4. Apply text and matching color class
            if (data.choice === 'AGREE') {
                choiceText.textContent = 'PLAYER CHOSE: AGREE';
                choiceBox.classList.add('choice-agree');
            } else if (data.choice === 'DISAGREE') {
                choiceText.textContent = 'PLAYER CHOSE: DISAGREE';
                choiceBox.classList.add('choice-disagree');
            }
            break;
