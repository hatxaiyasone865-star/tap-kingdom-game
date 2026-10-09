const scoreEl = document.getElementById('score');
const levelTextEl = document.getElementById('levelText');
const tapPowerEl = document.getElementById('tapPower');
const autoPowerEl = document.getElementById('autoPower');
const comboValueEl = document.getElementById('comboValue');
const tapButton = document.getElementById('tapButton');
const toastEl = document.getElementById('toast');

const state = {
  score: 0,
  tapPower: 1,
  autoPower: 0,
  combo: 1,
  level: 1,
  tapCost: 20,
  autoCost: 50,
  burstCost: 120,
  timer: null,
};

function showToast(message) {
  toastEl.textContent = message;
  toastEl.classList.add('show');
  clearTimeout(showToast.timeout);
  showToast.timeout = setTimeout(() => {
    toastEl.classList.remove('show');
  }, 800);
}

function getLevelFromScore(score) {
  return Math.max(1, 1 + Math.floor(score / 100));
}

function render() {
  scoreEl.textContent = Math.floor(state.score);
  tapPowerEl.textContent = state.tapPower;
  autoPowerEl.textContent = state.autoPower;
  comboValueEl.textContent = `x${state.combo}`;
  levelTextEl.textContent = `Lv.${state.level}`;

  document.getElementById('tapCost').textContent = state.tapCost;
  document.getElementById('autoCost').textContent = state.autoCost;
  document.getElementById('burstCost').textContent = state.burstCost;

  const buttons = document.querySelectorAll('.shop-item button');
  buttons[0].disabled = state.score < state.tapCost;
  buttons[1].disabled = state.score < state.autoCost;
  buttons[2].disabled = state.score < state.burstCost;
}

function spawnFloatingGain(amount, x, y) {
  const bubble = document.createElement('div');
  bubble.className = 'floating-score';
  bubble.textContent = `+${amount}`;
  bubble.style.left = `${x}px`;
  bubble.style.top = `${y}px`;
  document.querySelector('.game-shell').appendChild(bubble);

  setTimeout(() => bubble.remove(), 900);
}

function awardScore(amount, x, y) {
  state.score += amount;
  state.level = getLevelFromScore(state.score);
  render();

  if (typeof x === 'number' && typeof y === 'number') {
    spawnFloatingGain(amount, x, y);
  }
}

function handleTap(event) {
  const rect = tapButton.getBoundingClientRect();
  const x = event.clientX - rect.left + rect.width / 2;
  const y = event.clientY - rect.top + rect.height / 2;

  const value = state.tapPower * state.combo;
  awardScore(value, x, y);
}

tapButton.addEventListener('pointerdown', handleTap);

function buyTap() {
  if (state.score < state.tapCost) {
    showToast('Not enough coins!');
    return;
  }

  state.score -= state.tapCost;
  state.tapPower += 1;
  state.tapCost = Math.ceil(state.tapCost * 1.6);
  state.combo = Math.min(10, state.combo + 1);
  render();
}

function buyAuto() {
  if (state.score < state.autoCost) {
    showToast('Not enough coins!');
    return;
  }

  state.score -= state.autoCost;
  state.autoPower += 1;
  state.autoCost = Math.ceil(state.autoCost * 1.7);
  render();
}

function buyBurst() {
  if (state.score < state.burstCost) {
    showToast('Not enough coins!');
    return;
  }

  state.score -= state.burstCost;
  state.tapPower += 5;
  state.combo = Math.min(20, state.combo + 2);
  state.burstCost = Math.ceil(state.burstCost * 2);
  render();
}

function setupShop() {
  document.querySelector('[data-upgrade="tap"] button').addEventListener('click', buyTap);
  document.querySelector('[data-upgrade="auto"] button').addEventListener('click', buyAuto);
  document.querySelector('[data-upgrade="burst"] button').addEventListener('click', buyBurst);
}

function autoTick() {
  if (state.autoPower > 0) {
    const passive = state.autoPower * 2;
    awardScore(passive, undefined, undefined);
  }
}

setupShop();
render();
state.timer = setInterval(autoTick, 1000);
