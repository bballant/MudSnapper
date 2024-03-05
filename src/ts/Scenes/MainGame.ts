import Utilities from "../Lib/Utilities";
import { Cell, CellType } from "../Lib/Types";
import { State, Color, gimmeSomeStates } from "../Lib/Logo";

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
    if (!state.pen || state.pen === 'none') {
      // no pen set or pen set to 'none'
      return;
    }

    // this might be really bad!
    if (state.pen === 'clear') {
      this.create();
      return;
    }

    // returns a new scale for the mud image
    // based on the rotation
    function scaleForAngle(angle: number): number {
      // Normalize angle to be within 0 to 360 degrees
      let normalizedAngle = angle % 360;
      if (normalizedAngle < 0) {
        normalizedAngle += 360;
      }
      // Calculate the nearest multiple of 45 degrees
      const nearest45 = Math.round(normalizedAngle / 45) * 45;
      // Calculate the difference to the nearest multiple of 45 degrees
      const diff = Math.abs(normalizedAngle - nearest45);
      // Scale the difference to be within the range [0, 22.5],
      // which is half the distance between multiples of 45 degrees
      const scaledDiff = diff > 22.5 ? 45 - diff : diff;
      // Map the scaled difference to the range [1, 1.45],
      // where 0 difference results in 1 and 22.5 results in 1.45
      const value = 1 + (0.45 * (22.5 - scaledDiff) / 22.5);
      return value;
    }
 
    const mudColors = new Map<Color, number>([
      ['ooze',   (32 * 30) + 9],
      ['julius',  (32 * 32) + 6],
      ['candy', (32 * 30) + 7],
      ['blood',  (32 * 34) + 9],
      ['boring', (32 * 30) + 1]
    ]);

    const heroX = (state.loc.x * this.tileSize) + (this.tileSize / 2);
    const heroY = (state.loc.y * this.tileSize) + (this.tileSize / 2);
    const image = this.add.image(heroX, heroY, "full", mudColors.get(state.pen));
    image.scaleY = Utilities.RandomDecimal(0.5, 0.8);
    const xScale = scaleForAngle(state.rot)
    image.scaleX = Utilities.RandomDecimal(xScale - 0.2, xScale);
    image.angle = Utilities.RandomDecimal(state.rot - 7, state.rot + 7);
  }

  private drawHeroForState(state: State): void {
    const heroX = (state.loc.x * this.tileSize) + (this.tileSize / 2);
    const heroY = (state.loc.y * this.tileSize) + (this.tileSize / 2);
    this.heroSprite.setScale(1.5);
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
        pen: 'ooze'
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
