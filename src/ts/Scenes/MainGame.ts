import Utilities from "../Lib/Utilities";
import { Cell, CellType } from "../Lib/Types";
import { State, gimmeSomeStates } from "../Lib/Logo";

export default class MainGame extends Phaser.Scene {
  public static Name = "MainGame";

  private tileSize = 10;

  private gameBoard: Cell[][] = [];
  private heroSprite: Phaser.GameObjects.Sprite;
  private stepTimer = 0;

  private randomCellType(): CellType {
    const greenery: CellType[] = [
      // more of a chance of getting grass
      'grass', 'grass', 'grass', 'grass', 'grass',
      'grass', 'grass', 'grass', 'grass', 'grass',
      'lightgrass', 'lightgrass', 'lightgrass', 'lightgrass',
      'lightgrass', 'lightgrass',
      'bush', 'bush', 'bush',
      'tree', 'grove',
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

  private drawMudForState(state: State): void {
    const heroX = (state.loc.x * this.tileSize) + (this.tileSize / 2);
    const heroY = (state.loc.y * this.tileSize) + (this.tileSize / 2);
    this.add.image(heroX, heroY, "full", (32 * 32) + 2);
    //this.add.image(heroX, heroY, "full", 712);
  }

  private drawHeroForState(state: State): void {
    const heroX = (state.loc.x * this.tileSize) + (this.tileSize / 2);
    const heroY = (state.loc.y * this.tileSize) + (this.tileSize / 2);
    this.heroSprite.x = heroX;
    this.heroSprite.y = heroY;
    this.heroSprite.angle = state.rot;
    this.heroSprite.setDepth(1);
  }

  private handleStep(): void {
    const states = window.states.reverse();
    if (!states || states.length == 0) return;
    const state = states.pop();
    if (state) {
      this.drawMudForState(state);
      this.drawHeroForState(state);
    }
    window.states = states.reverse();
  }

  public update(time: number, delta: number): void {
    if (this.stepTimer > 100) {
      this.handleStep();
      this.stepTimer = 0;
    } else {
      this.stepTimer = this.stepTimer + delta
    }
  }

  public create(): void {
    Utilities.LogSceneMethodEntry("MainGame", "create");
    //this.cursors = this.input.keyboard.createCursorKeys();
    this.gameBoard = this.initGameBoard();
    window.states = [];
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
            this.add.image(xOff, yOff, "full", 7 * 32 - 3);
            //this.add.image(xOff, yOff, "full", 125);
            break;
          case 'lightgrass':
            this.add.image(xOff, yOff, "full", 4 * 32 - 3);
            //this.add.image(xOff, yOff, "full", 126);
            break;
          case 'bush':
            this.add.image(xOff, yOff, "full", 16 * 32 - 4);
            //this.add.image(xOff, yOff, "full", 122);
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
      const heroX = Math.floor(pointer.x / this.tileSize - 1 / 2);
      const heroY = Math.floor(pointer.y / this.tileSize - 1 / 2);
      window.states.push({
        loc: { x: heroX, y: heroY },
        rot: 0,
        pen: 'brown'
      })
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
      window.states = gimmeSomeStates().map((state) => {
        state.loc = { x: state.loc.x, y: this.gameBoard[state.loc.x].length - state.loc.y };
        state.rot = -1 * state.rot;
        return state;
      });
    }
  }
}
