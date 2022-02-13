import { Event } from './Event.js';

export class View {
	constructor() {
		this.buttonContainer = document.querySelector('.btn-container');
		this.containerRight = document.querySelector('.container-right');
		this.grid = this.createElement('div', 'grid');
		this.player = this.createElement('div', 'player');
		this.startButton = this.createElement('button', 'start-button');
		this.restartButton = document.querySelector('.gameover__button');
		this.gameOverContainer = document.querySelector('.gameover-container');
		this.counter = document.querySelector('.game-info__counter');
		this.gameLevel = document.querySelector('.game-info__level');
		this.record = document.querySelector('.game-info__record');
		this.grenadeIndicator = this.createElement('div', 'grenade-indicator');
		this.grenadeLoader = this.createElement('div', 'grenade-loader');
		this.audio = {
			startGame: '../assets/audio/start-game.mp3',
			shot: '../assets/audio/shot.mp3',
			grenade: '../assets/audio/grenade.mp3',
		};

		this.startZombieInvasionEvent = new Event();
		this.movePlayerEvent = new Event();
		this.shootingEvent = new Event();
		this.throwGrenadeEvent = new Event();
		this.restartGameEvent = new Event();

		for (let i = 105; i >= 1; i--) {
			const cell = this.createElement('div', 'cell');
			cell.id = i;

			if (i === 4) {
				cell.classList.add('player-container');
				cell.append(this.player);
			}

			this.grid.append(cell);
		}

		this.buttonContainer.append(this.startButton);
		this.grenadeIndicator.append(this.grenadeLoader);

		this.containerRight.append(this.grid);
		this.containerRight.append(this.grenadeIndicator);
	}

	createElement(tag, className) {
		const element = document.createElement(tag);

		if (className) {
			element.classList.add(className);
		}

		return element;
	}

	changeGameInfo(counter, gameLevel, record) {
		this.counter.textContent = counter;
		this.gameLevel.textContent = gameLevel;
		this.record.textContent = record;
	}

	movePlayer(locationId) {
		const currentLocation = document.querySelector('.player-container');
		const newLocation = document.getElementById(locationId);

		currentLocation.classList.remove('player-container');
		newLocation.classList.add('player-container');
		newLocation.append(this.player);
	}

	displayZombies(zombies, shootResult) {
		if (shootResult) {
			if (shootResult.killedZombies.length !== 0) {
				shootResult.killedZombies.forEach((killedZombie) => {
					const targetZombie = document.getElementById(killedZombie.id);

					targetZombie.style.backgroundColor = '#FAFAD2';

					setTimeout(() => {
						targetZombie.style.backgroundColor = '#000';
					}, 0);
				});

				if (shootResult.killedZombies.length > 1) {
					this.playAudio('grenade');
				}
			} else {
				const column = [];
				let shellLocation = shootResult.shellLocation;

				while (shellLocation >= 1) {
					shellLocation -= 7;
					const cell = document.getElementById(shellLocation);

					if (cell) {
						column.push(cell);
					}
				}

				column.forEach((cell) => {
					cell.style.backgroundColor = 'red';

					setTimeout(() => {
						cell.style.backgroundColor = '#000';
					}, 0);
				});
			}
		}

		const existingZombiesLocations = document.querySelectorAll('.zombie-container');

		for (let existingZombieLocation of existingZombiesLocations) {
			const currentZombie = existingZombieLocation.querySelector('.zombie');

			existingZombieLocation.removeChild(currentZombie);
			existingZombieLocation.classList.remove('zombie-container');
		}

		zombies.forEach((zombie) => {
			const zombieElem = this.createElement('div', 'zombie');
			const zombieContainer = document.getElementById(zombie.id);

			zombieContainer.classList.add('zombie-container');
			zombieContainer.append(zombieElem);
		});
	}

	moveGrenade(grenadeLocation) {
		const currentGrenadeLocation = document.querySelector('.grenade-container');
		const newGrenadeLocation = document.getElementById(grenadeLocation);
		let grenade = document.querySelector('.grenade');

		if (currentGrenadeLocation === null) {
			grenade = this.createElement('div', 'grenade');
		} else {
			currentGrenadeLocation.removeChild(grenade);
			currentGrenadeLocation.classList.remove('grenade-container');
		}

		if (newGrenadeLocation) {
			newGrenadeLocation.classList.add('grenade-container');
			newGrenadeLocation.append(grenade);
		}
	}

	playAudio = (type, func, event) => {
		const src = this.audio[type];
		const audio = new Audio(src);

		if (func) {
			audio.addEventListener('ended', () => {
				func.call(event);
			});
		}

		audio.play();
	};

	startButtonHandler = () => {
		this.playAudio('startGame', this.startZombieInvasionEvent.fire, this.startZombieInvasionEvent);

		this.startButton.disabled = true;
	};

	restartButtonHandler = () => {
		this.buttonContainer.innerHTML = '';
		this.containerRight.innerHTML = '';
		this.restartGameEvent.fire();
		this.gameOverContainer.style.display = 'none';
		this.playAudio('startGame', this.startZombieInvasionEvent.fire, this.startZombieInvasionEvent);
	};

	setButtonsHandlers() {
		this.startButton.addEventListener('click', this.startButtonHandler);
		this.restartButton.addEventListener('click', this.restartButtonHandler);
	}

	movePlayerHandler = (event) => {
		event.preventDefault();

		let direction;

		if (event.code === 'ArrowLeft') {
			direction = 'left';
		} else if (event.code === 'ArrowRight') {
			direction = 'right';
		} else {
			return false;
		}

		this.movePlayerEvent.fire(direction);
	};

	shootingHandler = (event) => {
		if (event.code === 'Space') {
			this.playAudio('shot');
			this.shootingEvent.fire();
		}
	};

	throwGrenadeHandler = (event) => {
		if (event.code === 'KeyF') {
			this.throwGrenadeEvent.fire();
		}
	};

	setHandlers() {
		document.addEventListener('keyup', this.movePlayerHandler);
		document.addEventListener('keyup', this.shootingHandler);
		document.addEventListener('keyup', this.throwGrenadeHandler);
	}

	deleteHandlers() {
		document.removeEventListener('keyup', this.movePlayerHandler);
		document.removeEventListener('keyup', this.shootingHandler);
		document.removeEventListener('keyup', this.throwGrenadeHandler);
	}

	gameOver() {
		this.gameOverContainer.style.display = 'block';

		this.deleteHandlers();
	}

	showLoader(timeLeft) {
		if (timeLeft === 0) {
			this.grenadeLoader.style.display = 'none';
			return;
		}

		this.grenadeLoader.style.display = 'flex';
		this.grenadeLoader.textContent = timeLeft;
	}
}
