import 'phaser';
import Preloader from "./Scenes/Preloader";
import Utilities from "./Lib/Utilities";
import MainGame from "./Scenes/MainGame";
import EmbedConsole from './Lib/EmbedConsole';
import { CodeJar } from 'codejar';
import { State, gimmeSomeStates, runScriptToStates } from './Lib/Logo';

const scaleSize = 560;
const gameSize = 420;

// Global variable declaration
declare global {
  interface Window {
    states: State[];
    currState: State;
  }
}

export { }; // This line is necessary to treat this file as a module

const gameConfig: Phaser.Types.Core.GameConfig = {
  width: gameSize,
  height: gameSize,
  type: Phaser.AUTO,
  parent: "content",
  title: "Starter Project for Phaser 3 with Visual Studio Code, TypeScript, and NodeJS"
};

export default class Game extends Phaser.Game {
  constructor(config: Phaser.Types.Core.GameConfig) {
    Utilities.LogSceneMethodEntry("Game", "constructor");

    super(config);

    this.scene.add(Preloader.Name, Preloader);
    this.scene.add(MainGame.Name, MainGame);
    this.scene.start(Preloader.Name);
  }
}

/**
 * Workaround for inability to scale in Phaser 3.
 * From http://www.emanueleferonato.com/2018/02/16/how-to-scale-your-html5-games-if-your-framework-does-not-feature-a-scale-manager-or-if-you-do-not-use-any-framework/
 */
function resizeFn(width: number, height: number): () => void {
  return function () {
    const canvas = document.querySelector("canvas");
    const wratio = width / height;
    const ratio = Number(gameConfig.width) / Number(gameConfig.height);
    if (wratio < ratio) {
      canvas.style.width = width + "px";
      canvas.style.height = (width / ratio) + "px";
    } else {
      canvas.style.width = (height * ratio) + "px";
      canvas.style.height = height + "px";
    }
  }
}

window.onload = (): void => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const game = new Game(gameConfig);
  // Make the game to scale to fill the entire page, but keep the game ratio.
  const resize = resizeFn(scaleSize, scaleSize);
  resize();
  window.addEventListener("resize", resize, true);

  const highlight = (editor: HTMLElement) => {
    let code = editor.textContent
    code = code.replace('foo', '<span style="color: red">foo</span>')
    editor.innerHTML = code
  }

  CodeJar(document.querySelector("#editor"), highlight);
  window.currState = {
    loc: {x: 0, y: 0},
    rot: 0,
    pen: undefined
  }

  //const cool = new EmbedConsole('console');
  const cool = EmbedConsole.customInit('console', (command) => {
      const states = runScriptToStates(window.currState, command);
      window.states = states.map((state) => {
        state.loc = { x: state.loc.x, y: 40 - state.loc.y };
        state.rot = -1 * state.rot;
        return state;
      });
    return command;
  })

  cool.add({
    input: "",
    output: "<b>Welcome to MUDSNAPPER!</b><br/>type ':help' for \"help\" (Muhuhahaha!)",
    klass: 'log-event',
    javascript: false
  });
};
