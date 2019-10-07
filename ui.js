const SLOTS = 10;
const ROUNDS = 4;

const AUGUSTINER = 'Augustiner';
const ROTHAUS = 'Rothaus';
const ERDINGER = 'Erdinger';
const TYSKIE = 'Tyskie';
const FLENSBURGER = 'Flensburger';
const ALKOHOL_FREI = 'Alkoholfrei';
const WHITE_WINE = 'White Wine';

const DRINKS = {
  [AUGUSTINER]: { name: AUGUSTINER, img: './img/augustiner.png', background: '#4f2d06' },
  [ROTHAUS]: { name: ROTHAUS, img: './img/rothaus.png', background: '#ee1a2d' },
  [ERDINGER]: { name: ERDINGER, img: './img/erdinger.png', background: '#cbc2a6' },
  [TYSKIE]: { name: TYSKIE, img: './img/tyskie.jpeg', background: '#fff' },
  [FLENSBURGER]: { name: FLENSBURGER, img: './img/flensburger.png', background: '#c2400c' },
  [ALKOHOL_FREI]: { name: ALKOHOL_FREI, img: './img/krombacher0.png', background: '#333' },
  [WHITE_WINE]: { name: WHITE_WINE, img: './img/wine.png', background: '#a8d' },
};

const q = s => document.querySelectorAll(s);

function setStyle(el, style) {
  el.style = {};
  Object.keys(style).forEach(s => el.style[s] = style[s]);
}

function getStyle(option) {
  const style = {
    backgroundColor: option.background,
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
  const options = DRINKS;
  let selection;
  let game;

  function startGame() {
    selection = [];
    game = new Game({
      slots: SLOTS,
      rounds: ROUNDS,
      options: Object.keys(DRINKS).map(drink => DRINKS[drink].name),
      onScore,
      onChoose,
      onFinish,
    });
    game.start();
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
    chooseNextButton.innerText = `Next Round (${(game.currentRound)}/${ROUNDS})`;
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
    const submitButton = document.createElement('button');
    submitButton.className = 'submit';
    submitButton.disabled = true;

    const selectDrink = drink => e => {
      e.preventDefault();
      if (selection.length < SLOTS) selection.push(drink);
      onSelectionChange();
    };

    const onSelectionChange = () => {
      submitButton.disabled = selection.length < SLOTS;
      const fridge = document.getElementById('fridge');
      fridge.innerHTML = '';
      const drinks = selection.map((drink, i) => {
        const option = options[drink];
        const el = document.createElement('div');
        el.className = 'drink';
        setStyle(el, getStyle(option));
        if (option.showTitleInButton) {
          el.innerText = option.name;
        }
        if (option.img) {
          const img = document.createElement('img');
          img.src = option.img;
          img.className = 'drink-icon';
          el.prepend(img);
        }
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '&times;';
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
    const drinkButtons = Object.keys(options).map(optKey => {
      const option = options[optKey];
      const button = document.createElement('button');
      button.className = 'choose-drink';
      button.addEventListener('click', selectDrink(option.name));
      setStyle(button, getStyle(option));
      if (option.showTitleInButton) {
        button.innerText = option.name;
      }
      if (option.img) {
        const img = document.createElement('img');
        img.src = option.img;
        img.className = 'drink-icon';
        button.prepend(img);
      }
      const buttonWrap = document.createElement('div');
      buttonWrap.appendChild(button);
      return buttonWrap;
    });
    const drinkSelection = document.createElement('div');
    drinkSelection.className = 'columns drink-selection';
    drinkButtons.forEach(opt => drinkSelection.appendChild(opt));

    submitButton.innerText = 'Submit';
    submitButton.addEventListener('click', () => {
      const choices = {};
      selection.forEach(d => {
        if (!choices[d]) choices[d] = 0;
        choices[d] += 1;
      });
      game.finishRound(choices);
    });

    const title = document.createElement('h2');
    title.innerText = `Choose drinks! (Round ${game.currentRound}/${ROUNDS})`;
    screen.appendChild(title);
    screen.appendChild(drinkSelection);
    screen.appendChild(submitButton);
  }

  startGame();
}

start();
