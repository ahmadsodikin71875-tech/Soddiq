const scoreEl = document.getElementById('score');
const baitLevelEl = document.getElementById('bait-level');
const energyEl = document.getElementById('energy');
const messageEl = document.getElementById('game-message');
const catchLog = document.getElementById('catch-log');
const fishListEl = document.getElementById('fish-list');
const btnStart = document.getElementById('btn-start');
const btnCast = document.getElementById('btn-cast');
const btnReel = document.getElementById('btn-reel');
const btnUpgrade = document.getElementById('btn-upgrade');

const fishTypes = [
  { name: 'Ikan Mas', chance: 0.4, value: 20, energy: 1 },
  { name: 'Ikan Lele', chance: 0.25, value: 35, energy: 1 },
  { name: 'Ikan Nila', chance: 0.18, value: 50, energy: 2 },
  { name: 'Ikan Tuna', chance: 0.1, value: 90, energy: 3 },
  { name: 'Ikan Hiu', chance: 0.05, value: 170, energy: 4 },
  { name: 'Harta Karun', chance: 0.02, value: 250, energy: 0 }
];

const gameState = {
  running: false,
  score: 0,
  baitLevel: 1,
  energy: 5,
  castInProgress: false,
  currentTarget: null
};

function renderFishList() {
  fishListEl.innerHTML = '';
  fishTypes.forEach((fish) => {
    const card = document.createElement('div');
    card.className = 'fish-card';
    card.innerHTML = `
      <h3>${fish.name}</h3>
      <p>Chance: ${Math.round(fish.chance * 100)}%</p>
      <p>Nilai: ${fish.value} poin</p>
      <p>Energi: ${fish.energy} ✦</p>
    `;
    fishListEl.appendChild(card);
  });
}

function updateStatus() {
  scoreEl.textContent = gameState.score;
  baitLevelEl.textContent = gameState.baitLevel;
  energyEl.textContent = gameState.energy;
}

function logMessage(text) {
  messageEl.textContent = text;
}

function addHistory(text) {
  const item = document.createElement('li');
  item.textContent = text;
  catchLog.prepend(item);
  if (catchLog.children.length > 10) {
    catchLog.removeChild(catchLog.lastChild);
  }
}

function getRandomFish() {
  const modifiedFish = fishTypes.map((fish) => ({
    ...fish,
    chance: fish.chance + gameState.baitLevel * 0.015
  }));
  const totalChance = modifiedFish.reduce((sum, fish) => sum + fish.chance, 0);
  let rand = Math.random() * totalChance;
  for (const fish of modifiedFish) {
    if (rand <= fish.chance) {
      return fish;
    }
    rand -= fish.chance;
  }
  return modifiedFish[modifiedFish.length - 1];
}

function startGame() {
  gameState.running = true;
  gameState.score = 0;
  gameState.baitLevel = 1;
  gameState.energy = 5;
  gameState.castInProgress = false;
  gameState.currentTarget = null;
  updateStatus();
  catchLog.innerHTML = '';
  logMessage('Permainan dimulai! Tekan Cast untuk memancing.');
  btnCast.disabled = false;
  btnReel.disabled = true;
  btnUpgrade.disabled = false;
}

function endGame(reason) {
  gameState.running = false;
  gameState.castInProgress = false;
  gameState.currentTarget = null;
  btnCast.disabled = true;
  btnReel.disabled = true;
  btnUpgrade.disabled = true;
  logMessage(reason + ' Tekan Mulai ulang untuk bermain lagi.');
}

function castLine() {
  if (!gameState.running || gameState.energy <= 0) {
    endGame('Energi habis!');
    return;
  }

  gameState.energy -= 1;
  gameState.castInProgress = true;
  gameState.currentTarget = getRandomFish();
  updateStatus();

  logMessage(`Kamu melempar pancing... Ada sesuatu yang menarik! ${gameState.currentTarget.name} tertarik.`);
  btnCast.disabled = true;
  btnReel.disabled = false;
}

function reelLine() {
  if (!gameState.running || !gameState.castInProgress) {
    logMessage('Belum ada umpan di air. Tekan Cast terlebih dahulu.');
    return;
  }

  const target = gameState.currentTarget;
  const catchChance = Math.min(0.92, 0.2 + target.chance + gameState.baitLevel * 0.06);
  const success = Math.random() < catchChance;

  if (success) {
    gameState.score += target.value;
    logMessage(`Berhasil! Kamu menangkap ${target.name} dan mendapat ${target.value} poin.`);
    addHistory(`Tangkap: ${target.name} (+${target.value} poin)`);
  } else {
    logMessage(`Sayang sekali! ${target.name} lepas dari kail.`);
    addHistory(`Gagal menangkap ${target.name}.`);
  }

  gameState.castInProgress = false;
  gameState.currentTarget = null;
  updateStatus();
  btnCast.disabled = gameState.energy <= 0;
  btnReel.disabled = true;

  if (gameState.energy <= 0) {
    endGame('Energi habis!');
  }
}

function upgradeBait() {
  const cost = gameState.baitLevel * 80;
  if (gameState.score < cost) {
    logMessage(`Butuh ${cost} poin untuk upgrade bait level ${gameState.baitLevel + 1}.`) ;
    return;
  }

  gameState.score -= cost;
  gameState.baitLevel += 1;
  gameState.energy += 1;
  updateStatus();
  logMessage(`Upgrade berhasil! Bait level sekarang ${gameState.baitLevel}. Energi +1.`);
  addHistory(`Upgrade bait ke level ${gameState.baitLevel}.`);
}

btnStart.addEventListener('click', startGame);
btnCast.addEventListener('click', castLine);
btnReel.addEventListener('click', reelLine);
btnUpgrade.addEventListener('click', upgradeBait);

renderFishList();
updateStatus();
logMessage('Tekan Mulai untuk memancing.');
