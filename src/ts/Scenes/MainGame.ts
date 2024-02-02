import Utilities from "../Utilities";
import { CellType } from "./Types";

export default class MainGame extends Phaser.Scene {
  /**
   * Unique name of the scene.
   */
  public static Name = "MainGame";

  private tileSize = 10;

  private gameBoard: CellType[][] = [];

  private range(start : number, end : number) : number[] {
    return Array.from(Array(end - start + 1).keys()).map(x => x + start);
  }

  private randomCellType() : CellType {
    const greenery: CellType[] = [
      // more of a chance of getting grass
      'grass', 'grass','grass','grass','grass',
      'grass', 'grass','grass','grass','grass',
      'lightgrass', 'lightgrass',
      'lightgrass', 'lightgrass',
      'tree', 'lightgrass', 'grove', 'bush'
    ];
    const idx = Math.floor(Math.random() * greenery.length);
    return greenery[idx];
  }

  private initGameBoard(): CellType[][] {

    const gridWidth = this.cameras.main.width / this.tileSize;
    const gridHeight = this.cameras.main.height / this.tileSize;

    let board: CellType[][] = [];
    for (let x = 0; x < gridWidth; x = x + 1) {
      for (let y = 0; y < gridHeight; y = y + 1) {
        if (board[x] == undefined) board[x] = [];
        if (x == 0 || x == gridWidth - 1) {
          board[x][y] = 'v-wall';
        } else if (y == 0 || y == gridHeight - 1) {
          board[x][y] = 'h-wall';
        } else {
          board[x][y] = this.randomCellType();
        }
      }
    }

    console.log("cool");
    console.log(board);

    return board;
  }

//  private randomGreenery() : number {
//    const greenery = [402].concat(
//        this.range(121, 123),
//        this.range(124, 126))
//    const idx = Math.floor(Math.random() * greenery.length)
//    return greenery[idx];
//  }

  public preload() : void {
    // Preload as needed.
  }

  public create() : void {
    Utilities.LogSceneMethodEntry("MainGame", "create");
    this.gameBoard = this.initGameBoard();
    console.log(this.gameBoard);

    for (let x = 0; x < this.gameBoard.length; x = x + 1) {
      for (let y = 0; y < this.gameBoard[x].length; y = y + 1) {
        // since image origin is in middle, offset placement
        const xOff = (x * this.tileSize) + (this.tileSize / 2)
        const yOff = (y * this.tileSize) + (this.tileSize / 2)
        const tileType = this.gameBoard[x][y]
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

  }
}
