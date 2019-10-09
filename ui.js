const SLOTS = 10;
const ROUNDS = 4;

const AUGUSTINER = 'Augustiner';
const ROTHAUS = 'Rothaus';
const ERDINGER = 'Erdinger';
const TYSKIE = 'Tyskie';
const FLENSBURGER = 'Flensburger';
const GOSSER = 'Gösser';
const ALKOHOL_FREI = 'Alkoholfrei';
const WHITE_WINE = 'White Wine';

const DRINKS = {
  [AUGUSTINER]: { name: AUGUSTINER, img: './img/augustiner.png', background: '#4f2d06' },
  [ROTHAUS]: { name: ROTHAUS, img: './img/rothaus.png', background: '#ee1a2d' },
  [ERDINGER]: { name: ERDINGER, img: './img/erdinger.png', background: '#cbc2a6' },
  [TYSKIE]: { name: TYSKIE, img: './img/tyskie.jpeg', background: '#fff' },
  [FLENSBURGER]: { name: FLENSBURGER, img: './img/flensburger.png', background: '#c2400c' },
  [GOSSER]: { name: GOSSER, img: './img/gosser.png', background: '#03832c' },
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

function animateAddToFridge(e, el, callback) {
  const ghost = el.parentNode.cloneNode(true);
  ghost.className = 'ghost choose-drink';
  document.body.appendChild(ghost);
  ghost.style.top = `${window.pageYOffset + e.clientY - ghost.offsetHeight/2}px`;
  ghost.style.left = `${e.clientX - ghost.offsetWidth/2}px`;
  setTimeout(() => {
    const fridge = document.getElementById('fridge');
    const fridgeRect = fridge.getBoundingClientRect();
    ghost.style.top = `${fridgeRect.top + fridgeRect.height/2}px`;
    ghost.style.left = `${fridgeRect.left + fridgeRect.width/2}px`;
    ghost.style.transform = 'scale(1.5)';
    ghost.style.opacity = '0.5';
    ghost.style.willChange = 'transform, opacity, top, left';
    setTimeout(() => {
      callback();
      document.body.removeChild(ghost);
    }, 500);
  }, 100);
}

function start() {
  const options = DRINKS;
  let selection;
  let game;
  const backToSelection = document.getElementById('back-to-selection');

  document.addEventListener('click', e => {
    const parent = e.target.parentNode;
    if (parent && parent.className && parent.className.includes('choose-view')) {
      e.preventDefault();
      const hash = e.target.hash;
      if (!hash) return;
      let name = hash.substr(1);
      const element = document.querySelector(`[name="${name}"`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  });

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

  function onScore({ score, advice, rawScore }) {
    backToSelection.style.display = 'none';
    window.scrollTo(0, 0);
    if (rawScore === 100) {
      onFinish({ score, rawScore });
      return;
    }

    const screen = showScreen('score');

    const scoreEl = screen.querySelector('.score-number');
    scoreEl.innerText = score;

    const adviceList = document.getElementById('advice');
    adviceList.innerHTML = '';
    const chooseNextButton = document.getElementById('choose-next');
    advice.forEach(advice => {
      const line = document.createElement('li');
      line.innerText = advice;
      adviceList.appendChild(line);
    });
    chooseNextButton.innerText = `Next Round (${(game.currentRound)}/${ROUNDS})`;
    if (!chooseNextButton.ready) {
      chooseNextButton.ready = true;
      chooseNextButton.addEventListener('click', () => {
        onChoose();
      });
    }
  }

  function onFinish({ score, rawScore }) {
    const screen = showScreen('finish');

    const scoreEl = screen.querySelector('.score-number');
    scoreEl.innerText = score;

    const playAgainButton = document.getElementById('play-again');
    if (!playAgainButton.ready) {
      playAgainButton.ready = true;
      playAgainButton.addEventListener('click', () => {
        startGame();
      });
    }

    const imgContainer = document.getElementById('finish-img');
    imgContainer.innerHTML = '';
    const img = document.createElement('img');
    if (rawScore === 100) {
      img.src = './img/happy.gif';
    } else if (rawScore < 70) {
      img.src = './img/neutral.gif';
    } else {
      img.src = './img/sad.gif';
    }
    
    img.alt = 'Congratulations!';
    imgContainer.appendChild(img);
  }

  function onChoose() {
    const screen = showScreen('choose');
    backToSelection.style.display = 'block';
    const submitButton = document.createElement('button');
    submitButton.className = 'submit main-submit';
    submitButton.disabled = true;

    const resetButton = document.createElement('button');
    resetButton.innerText = 'Reset Fridge';
    resetButton.className = 'submit';
    resetButton.addEventListener('click', () => {
      selection = [];
      onSelectionChange();
    });
    const reset = document.getElementById('reset');
    reset.innerHTML = '';
    reset.appendChild(resetButton);
    const requisite = document.createElement('div');
    requisite.className = 'requisite';

    let busy = false;
    const selectDrink = drink => e => {
      if (busy) return;
      e.preventDefault();
      busy = true;
      if (selection.length < SLOTS) {
        animateAddToFridge(e, e.target, () => {
          selection.push(drink);
          onSelectionChange();
          busy = false;
        });
      } else {
        busy = false;
      }
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
      requisite.innerText = `Fridge Capacity: ${selection.length}/${SLOTS}`;
    };

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

    const submit = document.createElement('div');
    submit.className = 'columns';
    submit.appendChild(requisite);
    const submitButtonWrap = document.createElement('div');
    submitButtonWrap.appendChild(submitButton);
    submit.appendChild(submitButtonWrap);

    const title = document.createElement('h2');
    title.innerHTML = `Choose drinks! (Round&nbsp;${game.currentRound}/${ROUNDS})`;
    const viewFridgeContainer = document.createElement('div');
    viewFridgeContainer.className = 'choose-view';
    const viewFridge = document.createElement('a');
    viewFridge.innerText = 'To Fridge';
    viewFridge.href = '#fridge-view';
    viewFridgeContainer.appendChild(viewFridge);
    const selectionAnchor = document.createElement('a');
    selectionAnchor.name = 'selection';
    screen.appendChild(selectionAnchor);
    screen.appendChild(title);
    screen.appendChild(viewFridgeContainer);
    screen.appendChild(drinkSelection);
    screen.appendChild(submit);

    onSelectionChange();
  }

  startGame();
}

start();
