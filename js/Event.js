export class Event {
	constructor() {
		this.listeners = [];
	}

	subscribe(listener) {
		this.listeners.push(listener);
	}

	fire(...args) {
		this.listeners.forEach((listener) => {
			listener(...args);
		});
	}
}
