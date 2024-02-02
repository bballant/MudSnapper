import Utilities from "../Utilities";
import { Cell, CellType, Hero } from "./Types";

export default class MainGame extends Phaser.Scene {
  /**
   * Unique name of the scene.
   */
  public static Name = "MainGame";

  private tileSize = 10;

  private gameBoard: Cell[][] = [];
  private hero: Hero = { x: 0, y: 0 };
  private heroSprite: Phaser.GameObjects.Sprite;
  private stepTimer = 0;
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  private range(start: number, end: number): number[] {
    return Array.from(Array(end - start + 1).keys()).map(x => x + start);
  }

  private randomCellType(): CellType {
    const greenery: CellType[] = [
      // more of a chance of getting grass
      'grass', 'grass', 'grass', 'grass', 'grass',
      'grass', 'grass', 'grass', 'grass', 'grass',
      'lightgrass', 'lightgrass',
      'lightgrass', 'lightgrass',
      'tree', 'lightgrass', 'grove', 'bush'
    ];
    const idx = Math.floor(Math.random() * greenery.length);
    return greenery[idx];
  }

  private initGameBoard(): Cell[][] {
    const gridWidth = this.cameras.main.width / this.tileSize;
    const gridHeight = this.cameras.main.height / this.tileSize;
    const board: Cell[][] = [];
    for (let x = 0; x < gridWidth; x = x + 1) {
      for (let y = 0; y < gridHeight; y = y + 1) {
        if (board[x] == undefined) board[x] = [];
        if (x == 0 || x == gridWidth - 1) {
          board[x][y] = { typ: 'v-wall', item: undefined }
        } else if (y == 0 || y == gridHeight - 1) {
          board[x][y] = { typ: 'h-wall', item: undefined };
        } else {
          board[x][y] = { typ: this.randomCellType(), item: undefined };
        }
      }
    }
    return board;
  }

  public preload(): void {
    // Preload as needed.
  }

  private handleCommand(command: string): void {
    if (command.startsWith('step')) {
      window.hero.x = window.hero.x + 1
    } else if (command.startsWith('drop')) {
      window.hero.y = window.hero.y + 1
    } else if (command.startsWith('back')) {
      window.hero.x = window.hero.x - 1
    } else if (command.startsWith('up')) {
      window.hero.y = window.hero.y - 1
    }
  }

  private drawMud(): void {
    const theHero = window.hero
    const heroX = (theHero.x * this.tileSize) + (this.tileSize / 2);
    const heroY = (theHero.y * this.tileSize) + (this.tileSize / 2);
    this.add.image(heroX, heroY, "full", 160);
  }

  private handleCommands(): void {
    const commands = window.commands.reverse();
    if (!commands || commands.length == 0) return;
    const command = commands.pop();
    if (command) {
      this.drawMud();
      this.handleCommand(command);
    }
    window.commands = commands.reverse();
  }

  public update(time: number, delta: number): void {
    this.hero = window.hero;
    if (this.stepTimer > 200) {
      this.handleCommands();
      this.stepTimer = 0;
    } else {
      this.stepTimer = this.stepTimer + delta
    }
    const heroX = (this.hero.x * this.tileSize) + (this.tileSize / 2);
    const heroY = (this.hero.y * this.tileSize) + (this.tileSize / 2);
    this.heroSprite.x = heroX;
    this.heroSprite.y = heroY;
    this.heroSprite.setDepth(1);
  }
  public create(): void {
    Utilities.LogSceneMethodEntry("MainGame", "create");
    this.cursors = this.input.keyboard.createCursorKeys();
    this.gameBoard = this.initGameBoard();
    window.hero = { x: 0, y: 0 };
    window.commands = [];
    this.hero = window.hero;
    for (let x = 0; x < this.gameBoard.length; x = x + 1) {
      for (let y = 0; y < this.gameBoard[x].length; y = y + 1) {
        // since image origin is in middle, offset placement
        const xOff = (x * this.tileSize) + (this.tileSize / 2)
        const yOff = (y * this.tileSize) + (this.tileSize / 2)
        const tileType = this.gameBoard[x][y].typ
        switch (tileType) {
          case 'h-wall':
            this.add.image(xOff, yOff, "full", 204);
            break;
          case 'v-wall':
            this.add.image(xOff, yOff, "full", 204);
            break;
          case 'tree':
            this.add.image(xOff, yOff, "full", 30);
            break;
          case 'grove':
            this.add.image(xOff, yOff, "full", 25);
            break;
          case 'grass':
            this.add.image(xOff, yOff, "full", 125);
            break;
          case 'lightgrass':
            this.add.image(xOff, yOff, "full", 126);
            break;
          case 'bush':
            this.add.image(xOff, yOff, "full", 122);
            break;
          default:
            this.add.image(xOff, yOff, "full", 125);
        }
      }
    }

    this.heroSprite = this.add.sprite(0, 0, "full", 402);
    this.input.on('pointerdown', this.handlePointerDown, this);
  }

  private handlePointerDown(pointer: Phaser.Input.Pointer): void {
    if (pointer.leftButtonDown()) {
      window.hero.x = Math.floor(pointer.x / this.tileSize - 1 / 2);
      window.hero.y = Math.floor(pointer.y / this.tileSize - 1 / 2);
    }
    if (pointer.middleButtonDown()) {
      const steps: string[] = [];
      for (let i = 0; i < 20; i++) {
        steps.push("step")
      }
      for (let i = 0; i < 20; i++) {
        steps.push("up")
      }
      for (let i = 0; i < 20; i++) {
        steps.push("back")
      }
      for (let i = 0; i < 20; i++) {
        steps.push("drop")
      }
      window.commands = steps;
    }
  }
}
