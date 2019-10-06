const SLOTS = 10;
const ROUNDS = 4;

const q = s => document.querySelectorAll(s);

function setStyle(el, style) {
  el.style = {};
  Object.keys(style).forEach(s => el.style[s] = style[s]);
}

function getStyle(options, drink) {
  const color = options.indexOf(drink)*360/options.length;
  const style = {
    backgroundColor: `hsl(${color}, 60%, 40%)`,
  };
  return style;
}

function showScreen(id) {
  q('.screen').forEach(s => s.style.display = 'none');
  const screen = document.getElementById(id);
  screen.style.display = 'block';
  return screen;
}

function start() {
  const options = [
    'Augustiner', 'Ty',
    'White Wine', 'Red Wine',
    'Cider', 'Alkoholfrei',
  ];
  let selection;
  let game;

  function startGame() {
    selection = [];
    game = new Game({
      slots: SLOTS,
      rounds: ROUNDS,
      options,
      onScore,
      onChoose,
      onFinish,
    });
  }

  function onScore({ score, advice }) {
    const screen = showScreen('score');

    const scoreEl = screen.querySelector('.score-number');
    scoreEl.innerText = score;

    const adviceList = document.getElementById('advice');
    const chooseNextButton = document.getElementById('choose-next');
    advice.forEach(advice => {
      const line = document.createElement('li');
      line.innerText = advice;
      adviceList.appendChild(line);
    });
    chooseNextButton.addEventListener('click', () => {
      onChoose();
    });
  }

  function onFinish({ score }) {
    const screen = showScreen('finish');

    const scoreEl = screen.querySelector('.score-number');
    scoreEl.innerText = score;

    const playAgainButton = document.getElementById('play-again');
    playAgainButton.addEventListener('click', () => {
      startGame();
    });
  }

  function onChoose() {
    const screen = showScreen('choose');
    const undoButton = document.createElement('button');
    undoButton.disabled = true;
    const submitButton = document.createElement('button');
    submitButton.disabled = true;

    const selectDrink = drink => e => {
      e.preventDefault();
      if (selection.length < SLOTS) selection.push(drink);
      onSelectionChange();
    };

    const undoDrink = e => {
      e.preventDefault();
      if (selection.length) selection.pop();
      onSelectionChange();
    };

    const onSelectionChange = () => {
      undoButton.disabled = !selection.length;
      submitButton.disabled = selection.length < SLOTS;
      const fridge = document.getElementById('fridge');
      fridge.innerHTML = '';
      const drinks = selection.map((drink, i) => {
        const el = document.createElement('div');
        el.className = 'drink';
        setStyle(el, getStyle(options, drink));
        el.innerText = drink;
        const deleteButton = document.createElement('button');
        deleteButton.innerText = 'x';
        deleteButton.className = 'delete';
        deleteButton.addEventListener('click', () => {
          selection.splice(i, 1);
          onSelectionChange();
        });
        el.appendChild(deleteButton);
        return el;
      });
      drinks.forEach(drink => fridge.appendChild(drink));
    };

    onSelectionChange();

    screen.innerHTML = '';
    const drinkButtons = options.map(opt => {
      const button = document.createElement('button');
      button.innerText = opt;
      button.addEventListener('click', selectDrink(opt));
      setStyle(button, getStyle(options, opt));
      const buttonWrap = document.createElement('div');
      buttonWrap.appendChild(button);
      return buttonWrap;
    });
    const drinkSelection = document.createElement('div');
    drinkSelection.className = 'columns drink-selection';
    drinkButtons.forEach(opt => drinkSelection.appendChild(opt));

    const actions = document.createElement('div');
    actions.className = 'columns actions';

    undoButton.innerText = 'Undo';
    undoButton.addEventListener('click', undoDrink);

    submitButton.innerText = 'Submit';
    submitButton.addEventListener('click', () => {
      const choices = {};
      selection.forEach(d => {
        if (!choices[d]) choices[d] = 0;
        choices[d] += 1;
      });
      game.finishRound(choices);
    });

    const undoButtonWrap = document.createElement('div');
    undoButtonWrap.appendChild(undoButton);
    const submitButtonWrap =  document.createElement('div');
    submitButtonWrap.appendChild(submitButton);

    actions.appendChild(undoButtonWrap);
    actions.appendChild(submitButtonWrap);

    screen.appendChild(drinkSelection);
    screen.appendChild(actions);
  }

  startGame();
}

start();
