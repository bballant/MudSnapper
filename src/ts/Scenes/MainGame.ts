import Utilities from "../Utilities";

export default class MainGame extends Phaser.Scene {
	/**
	 * Unique name of the scene.
	 */
	public static Name = "MainGame";

	private tileSize = 16;

	private range(start: number, end: number): number[] {
		return Array.from(Array(end - start + 1).keys()).map(x => x + start);
	}

	private randomGreenery(): number {
		const greenery = [25].concat(
			this.range(5, 7),
			this.range(50, 52))
		//const idx = x % greenery.length;
		const idx = Math.floor(Math.random() * greenery.length)
		return greenery[idx];
	}

	public preload(): void {
		// Preload as needed.
	}

	public create(): void {
		Utilities.LogSceneMethodEntry("MainGame", "create");

		//this.add.image(this.cameras.main.centerX, this.cameras.main.centerY, "Phaser-Logo-Small");
		for (let x = 0; x < this.cameras.main.width; x = x + this.tileSize) {
			for (let y = 0; y < this.cameras.main.height; y = y + this.tileSize) {
				// since image origin is in middle, offset placement
				const xOff = x + (this.tileSize / 2)
				const yOff = y + (this.tileSize / 2)
				this.add.image(xOff, yOff, "full", this.randomGreenery());
			}
		}

	}
}
