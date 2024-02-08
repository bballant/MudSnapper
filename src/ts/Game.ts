import 'phaser';
import Boot from "./Scenes/Boot";
import Preloader from "./Scenes/Preloader";
import MainMenu from "./Scenes/MainMenu";
import SplashScreen from "./Scenes/SplashScreen";
import Utilities from "./Utilities";
import MainGame from "./Scenes/MainGame";
import MainSettings from "./Scenes/MainSettings";
import EmbedConsole from './EmbedConsole';
import { Hero } from './Scenes/Types'
import { CodeJar } from 'codejar';

const scaleSize = 560;
const gameSize = 420;

type CoolGuy = {
  name: string,
  job: string
}

// Global variable declaration
declare global {
  interface Window {
    myGlobalVar: CoolGuy;
    hero: Hero;
    commands: string[];
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

    this.scene.add(Boot.Name, Boot);
    this.scene.add(Preloader.Name, Preloader);
    this.scene.add(SplashScreen.Name, SplashScreen);
    this.scene.add(MainMenu.Name, MainMenu);
    this.scene.add(MainGame.Name, MainGame);
    this.scene.add(MainSettings.Name, MainSettings);
    this.scene.start(Boot.Name);
  }
}

/**
 * Workaround for inability to scale in Phaser 3.
 * From http://www.emanueleferonato.com/2018/02/16/how-to-scale-your-html5-games-if-your-framework-does-not-feature-a-scale-manager-or-if-you-do-not-use-any-framework/
 */
function resizeFn(width: number, height: number): () => void {
  return function () {
    const canvas = document.querySelector("canvas");
    //const width = window.innerWidth;
    //const height = window.innerHeight;
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
  // Uncomment the following two lines if you want the game to scale to fill the entire page, but keep the game ratio.
  const resize = resizeFn(scaleSize, scaleSize);
  resize();
  window.addEventListener("resize", resize, true);

  const highlight = (editor: HTMLElement) => {
    let code = editor.textContent
    code = code.replace('foo', '<span style="color: red">foo</span>')
    editor.innerHTML = code
  }

  const jar = CodeJar(document.querySelector("#editor"), highlight);

  const cool = new EmbedConsole('console');
  cool.add({
    input: "",
    output: "<b>Welcome to MUDSNAPPER!</b><br/>type 'help' for \"help\" (muhuhahaha!)",
    klass: 'log-event',
    javascript: false
  });

  /*
  const coolGuy: CoolGuy = { name: "Brian", job: "Messin'" }
  window.myGlobalVar = coolGuy

  cool.add({
    input: "",
    output: JSON.stringify(window.myGlobalVar)
  })
  */
};
