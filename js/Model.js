import { Event } from './Event.js';

export class Model {
	constructor() {
		this.player = {
			locationId: 4,
		};
		this.zombies = [];
		this.timerId = null;
		this.counter = 0;
		this.record = localStorage.getItem('record') || 0;
		this.gameLevel = 1;
		this.delay = 1000;
		this.isGrenadeReady = true;

		this.createZombiesEvent = new Event();
		this.changePlayerLocationEvent = new Event();
		this.gameOverEvent = new Event();
		this.changeGameInfoEvent = new Event();
		this.changeGrenadeLocationEvent = new Event();
		this.preparingGrenadeEvent = new Event();
	}

	setGameInfo() {
		this.changeGameInfoEvent.fire(this.counter, this.gameLevel, this.record);
	}

	incrementCounter() {
		this.counter += 1;

		if (this.counter % 100 === 0) {
			this.gameLevel += 1;

			this.delay = this.delay - this.delay * 0.1;
			clearInterval(this.timerId);
			this.timerId = setInterval(() => this.createZombies(), this.delay);
		}

		if (this.counter > this.record) {
			this.record = this.counter;
			localStorage.setItem('record', this.record);
		}
	}

	changePlayerLocation(direction) {
		const curLocationId = this.player.locationId;

		if (direction === 'left' && curLocationId > 1) {
			this.player.locationId -= 1;
		} else if (direction === 'right' && curLocationId < 7) {
			this.player.locationId += 1;
		}

		this.changePlayerLocationEvent.fire(this.player.locationId);
	}

	getRandomInt(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	}

	createZombies() {
		const zombieAmount = this.getRandomInt(2, 5);
		const set = new Set();

		if (this.zombies.length !== 0) {
			this.zombies = this.zombies.map((zombie) => {
				zombie.id -= 7;
				return zombie;
			});
		}

		for (let i = 1; i <= zombieAmount; i++) {
			let zombieLocationId = this.getRandomInt(99, 105);

			while (set.has(zombieLocationId)) {
				zombieLocationId = this.getRandomInt(99, 105);
			}

			this.zombies.push({ id: zombieLocationId });
			set.add(zombieLocationId);
		}

		this.createZombiesEvent.fire(this.zombies);

		if (this.isGameOver()) {
			this.gameOverEvent.fire();
			clearInterval(this.timerId);
			return;
		}
	}

	startGame() {
		this.createZombies();
		this.timerId = setInterval(() => this.createZombies(), this.delay);
	}

	isGameOver() {
		const stubbornZombies = this.zombies.filter((zombie) => zombie.id >= 1 && zombie.id <= 7);

		if (stubbornZombies.length !== 0) {
			return true;
		}

		return false;
	}

	searchZombie() {
		let shellLocation = this.player.locationId;
		let foundZombie = null;

		while (!foundZombie && shellLocation <= 105) {
			shellLocation += 7;
			foundZombie = this.zombies.find((zombie) => zombie.id === shellLocation);
		}

		return {
			foundZombie,
			shellLocation,
		};
	}

	shoot() {
		const foundZombie = this.searchZombie().foundZombie;
		const bulletLocation = this.searchZombie().shellLocation;
		const shootResult = {
			killedZombies: [],
			shellLocation: bulletLocation,
		};

		if (bulletLocation > 105) {
			this.createZombies();
			this.createZombiesEvent.fire(this.zombies, shootResult);
			return;
		}

		if (foundZombie) {
			this.incrementCounter();
			this.changeGameInfoEvent.fire(this.counter, this.gameLevel, this.record);
			this.zombies = this.zombies.filter((zombie) => zombie !== foundZombie);
		}

		shootResult.killedZombies.push(foundZombie);

		this.createZombiesEvent.fire(this.zombies, shootResult);
	}

	async throwGrenade() {
		if (this.isGrenadeReady) {
			this.prepareGrenade();

			const playerLocation = this.player.locationId;
			const killedZombies = [];
			const shootResult = {};
			let grenadeLocation = playerLocation;
			let foundZombie = null;
			let border = 0;

			if (this.player.locationId === 1 || this.player.locationId === 7) {
				border = 2;
			}

			if (this.player.locationId === 2 || this.player.locationId === 6) {
				border = 1;
			}

			while (!foundZombie && grenadeLocation <= 105) {
				let promise = new Promise((resolve) => {
					setTimeout(() => {
						grenadeLocation += 7;
						this.changeGrenadeLocationEvent.fire(grenadeLocation);
						resolve();
					}, 100);
				});

				await promise;

				foundZombie = this.zombies.find((zombie) => zombie.id === grenadeLocation);
			}

			if (grenadeLocation > 105) {
				this.createZombies();
			}

			if (foundZombie) {
				let affectedAreaId;

				if (playerLocation === 1 || playerLocation === 2) {
					affectedAreaId = foundZombie.id + 12 + border;
				} else {
					affectedAreaId = foundZombie.id + 12;
				}

				for (let i = 1; i <= 5; i++) {
					let killedZombie = affectedAreaId;

					for (let j = 1; j <= 5 - border; j++) {
						this.zombies.forEach((zombie) => {
							if (zombie.id === killedZombie) {
								killedZombies.push(zombie);
								this.incrementCounter();
							}
						});
						killedZombie += 1;
					}

					affectedAreaId -= 7;
				}

				this.changeGameInfoEvent.fire(this.counter, this.gameLevel, this.record);
				this.zombies = this.zombies.filter((zombie) => {
					if (killedZombies.includes(zombie)) {
						return false;
					}

					return true;
				});
			}

			shootResult.killedZombies = killedZombies;
			shootResult.shellLocation = grenadeLocation;
			this.createZombiesEvent.fire(this.zombies, shootResult);
			this.changeGrenadeLocationEvent.fire(null);
		}
	}

	prepareGrenade() {
		const preparationTime = 10000;
		let timeLeft = preparationTime / 1000;

		this.isGrenadeReady = false;

		const timer = setInterval(() => {
			this.preparingGrenadeEvent.fire(timeLeft);

			if (this.isGameOver()) {
				clearInterval(timer);
			}

			if (timeLeft === 0) {
				clearInterval(timer);
				this.isGrenadeReady = true;
			} else {
				timeLeft -= 1;
			}
		}, 1000);
	}
}
