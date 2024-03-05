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

function doAdminCommand(codeJarJar: any, command: string): string {
  let result = command;
  const tokens = command.trim().split(/\s+/);
  console.log(tokens)
  switch (tokens[0]) {
    case ":help": {
      if (!tokens[1]) {
        result =
          `Thanks for asking. I don't know what you were expecting.
Type in a MudSnapper command to make MudSnapper do something.
Type ':help commands' for a list of commands.
Type ':help readme' to open up the README and learn what in tarnation this thing is.
Type ':run' to run the MudSnapper script from the editor above.`
      }
      else if (tokens[1] === 'commands') {
        result =
          `Buckle up:
* :help [commands|readme] - You are here.
* :run - Run script above.
* :example - Load example.
* :clear - Free your mud.
* jump x y - Jump baby, jump!
* color [ooze|candy|julius|blood|boring|none]
* forward/back n
* left/right degrees - Turn baby, turn!`
      }
      else if (tokens[1] === 'readme') {
        result = `Please go to https://github.com/bballant/MudSnapper/README.md`
      }
      else  {
        throw new Error(`The command '${command}' is unknown to me.`)
      }
      break;
    }
    case ":run": {
      let theScript = codeJarJar.toString();
      const states = runScriptToStates(window.currState, theScript);
      window.states = states.map((state) => {
        state.loc = { x: state.loc.x, y: 40 - state.loc.y };
        state.rot = -1 * state.rot;
        return state;
      });
      break;
    }
    case ":example2": {
      let theCode =
      `jump 20 10
color ooze
right 10
forward 15
back 15
color candy
right 10
forward 15
back 15
color blood
right 10
forward 15
back 15
color julius
right 10
forward 15
back 15
color ooze
right 10
forward 15
back 15
color candy
right 10
forward 15
back 15
color blood
right 10
forward 15
back 15
color julius
right 10
forward 15
back 15
color ooze
right 10
forward 15
back 15
color candy
right 10
forward 15
back 15
color blood
right 10
forward 15
back 15
color julius
right 10
forward 15
back 15
color ooze
right 10
forward 15
back 15
color candy
right 10
forward 15
back 15
color blood
right 10
forward 15
back 15
color julius
right 10
forward 15
back 15
`
      codeJarJar.updateCode(theCode)
      break;
    }
    case ":example": {
      let theCode =
        `jump 20 20
color boring
forward 2
left 90
color ooze
forward 3
left 90
color candy
forward 5
left 90
color blood
forward 8
left 90
color boring
forward 14
left 90
color ooze
forward 22
left 90
color boring
forward 14
left 90
color blood
forward 8
left 90
color candy
forward 5
left 90
color ooze
forward 3
left 90
color boring
forward 2
      `
      codeJarJar.updateCode(theCode)
      break;
    }
    default:
      throw new Error(`The command '${command}' is unknown to me.`)
  }
  return result;
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

  let jar = CodeJar(document.querySelector("#editor"), highlight);

  window.currState = {
    loc: { x: 0, y: 0 },
    rot: 0,
    pen: undefined
  }

  //const cool = new EmbedConsole('console');
  const cool = EmbedConsole.customInit('console', (c, command) => {
    let output = command;

    if (command.startsWith(":clear")) {
      window.states = [{
        loc: { x: -20, y: -20 }, // put it off the screen
        rot: 0,
        pen: 'clear'
      }];
    } else if (command.startsWith(":")) {
      output = doAdminCommand(jar, command);
    } else {
      const states = runScriptToStates(window.currState, command);
      window.states = states.map((state) => {
        state.loc = { x: state.loc.x, y: 40 - state.loc.y };
        state.rot = -1 * state.rot;
        return state;
      });
    }

    c.add({
      input: command,
      output: output,
      klass: 'mud-command',
      javascript: false
    });

    return output;
  })

  cool.add({
    input: "",
    output: "<b>Welcome to MUDSNAPPER!</b><br/>type ':help' for \"help\" (Muhuhahaha!)",
    klass: 'log-event',
    javascript: false
  });
};
