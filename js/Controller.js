import { Model } from './Model.js';
import { View } from './View.js';

export class Controller {
	constructor() {
		this.model = new Model();
		this.view = new View();

		this.view.setButtonsHandlers();
		this.init();
	}

	init() {
		this.view.startZombieInvasionEvent.subscribe(() => this.run());
		this.view.movePlayerEvent.subscribe((direction) => this.model.changePlayerLocation(direction));
		this.view.shootingEvent.subscribe(() => this.model.shoot());
		this.view.throwGrenadeEvent.subscribe(() => this.model.throwGrenade());
		this.view.restartGameEvent.subscribe(() => this.restartGame());

		this.model.createZombiesEvent.subscribe((zombies, shootResult) => {
			this.view.displayZombies(zombies, shootResult);
		});
		this.model.changePlayerLocationEvent.subscribe((location) => {
			this.view.movePlayer(location);
		});
		this.model.gameOverEvent.subscribe(() => {
			this.view.gameOver();
		});
		this.model.changeGameInfoEvent.subscribe((counter, gameLevel, record) => {
			this.view.changeGameInfo(counter, gameLevel, record);
		});
		this.model.setGameInfo();
		this.model.changeGrenadeLocationEvent.subscribe((grenadeLocation) => {
			this.view.moveGrenade(grenadeLocation);
		});
		this.model.preparingGrenadeEvent.subscribe((timeLeft) => {
			this.view.showLoader(timeLeft);
		});
	}

	run() {
		this.model.startGame();
		this.view.setHandlers();
	}

	restartGame() {
		this.model = new Model();
		this.view = new View();

		this.init();
	}
}
