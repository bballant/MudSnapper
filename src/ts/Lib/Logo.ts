#!/usr/bin/env tsx
import Logger from "./Logger"

console.log(Logger);

export type Command =
    'forward' |
    'back' |
    'left' |
    'right' |
    'color' |
    'repeat'

const COMMANDS: Command[] = [
    'forward', 'back', 'left', 'right', 'repeat', 'color'
]

export type CommandCall = {
    command: Command
    params: string[]
    subscript: Script | undefined
}

export type Script = CommandCall[];

export type Point = {
    x: number,
    y: number
}

export type Color = 'ooze' | 'candy' | 'julius' | 'blood' | 'boring'

const COLORS: Color[] = [
    'ooze', 'candy', 'julius', 'blood', 'boring'
]

export type State = {
    loc: Point,
    rot: number,
    pen: Color | undefined
}

export function parseScript(scriptStr: string): Script | undefined {
    const tokens = scriptStr.trim().split(/\s+/);
    const callAcc: CommandCall[] = [];
    let currCommand: Command | undefined;
    let params: string[] = [];
    let idx = 0;
    for (const t of tokens) {
        // begining of command list
        if (!currCommand) {
            if (COMMANDS.includes(t as Command)) {
                currCommand = t as Command;
            } else {
                // we expected a command but didn't find one
                throw Error(`We expected a command but found ${t}`)
            }
        }
        // at the next command or at the end of the command list
        else if (COMMANDS.includes(t as Command) || idx == tokens.length - 1) {
            // last thing in the tokens is not a command, it's a param
            if (idx == tokens.length - 1 && !COMMANDS.includes(t as Command)) {
                params.push(t);
            }
            callAcc.push({
                command: currCommand,
                params: params,
                subscript: undefined
            });
            currCommand = t as Command;
            params = [];
        } else {
            params.push(t)
        }
        idx = idx + 1
    }
    return callAcc
}

function newBoard(size: number): number[][] {
    const cool: number[][] = [];
    for (let x = 0; x < size; x++) {
        cool.push([]);
        for (let y = 0; y < size; y++) {
            cool[x].push(0);
        }
    }
    return cool;
}

// It has to rotate the board to print it
// so that origin is bottom left
function printBoard(board: number[][]) {
    let x = 0;
    if (!board[x]) return;
    let y = board[x].length - 1
    while (y >= 0) {
        let acc = ""
        x = 0
        while (x < board.length) {
            const cell = board[x][y]
            acc += (cell ? '■ ' : '□ ');
            x++;
        }
        Logger.log(acc);
        y--;
    }
}

function getEndpoint(start: Point, degrees: number, distance: number): Point {
    const radians = degrees * (Math.PI / 180);

    const end: Point = {
        x: start.x + Math.round(distance * Math.cos(radians)),
        y: start.y + Math.round(distance * Math.sin(radians))
    };

    return end;
}

function oneNumParam(call: CommandCall): number {
    const ret = parseInt(call.params[0]);
    if (call.params.length != 1 || Number.isNaN(ret)) {
        throw Error(`Couldn't parse parameter for command ${call.command} ${call.params}`);
    }
    return ret;
}

function colorParam(call: CommandCall): Color {
    const color = call.params[0]
    if (!color || !COLORS.includes(color as Color)) {
        throw Error(`Couldn't parse parameter for command ${call.command} ${call.params}`);
    }
    return color as Color;
}

function getPointsForLine(start: Point, end: Point): Point[] {
    let x0 = start.x;
    let y0 = start.y;
    const x1 = end.x;
    const y1 = end.y;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    const ret: Point[] = [];
    // eslint-disable-next-line no-constant-condition
    while (true) {
        ret.push({ x: x0, y: y0 });

        if (x0 === x1 && y0 === y1) break;

        const e2 = 2 * err;
        if (e2 > -dy) {
            err -= dy;
            x0 += sx;
        }
        if (e2 < dx) {
            err += dx;
            y0 += sy;
        }
    }

    return ret;
}

function scriptToStatesFrom(currState: State, script: Script): State[] {
    const states: State[] = []
    for (let i = 0; i < script.length; i++) {
        const cmd = script[i].command;
        switch (cmd) {
            case ('forward'):
            case ('back'): {
                const mult = cmd == 'back' ? -1 : 1;
                const end = getEndpoint(currState.loc, currState.rot, mult * oneNumParam(script[i]));
                const points = getPointsForLine(currState.loc, end);
                for (const p of points) {
                    currState.loc = p;
                    states.push({
                        loc: currState.loc,
                        rot: currState.rot,
                        pen: currState.pen
                    })
                }
                break;
            }
            case ('left'):
            case ('right'): {
                const mult1 = cmd == 'right' ? -1 : 1;
                currState.rot = currState.rot + mult1 * oneNumParam(script[i])
                states.push({
                    loc: currState.loc,
                    rot: currState.rot,
                    pen: currState.pen
                })
                break;
            }
            case ('color'): {
                currState.pen = colorParam(script[i])
                states.push({
                    loc: currState.loc,
                    rot: currState.rot,
                    pen: currState.pen
                })
                break;
            }
        }
    }
    return states;
}

function scriptToStates(start: Point, script: Script): State[] {
    const currState: State = {
        loc: start,
        rot: 0,
        pen: 'boring'
    }
    return scriptToStatesFrom(currState, script);
}

export function runScriptToStates(currState: State, scriptStr: string): State[] {
    const script = parseScript(scriptStr);
    return scriptToStatesFrom(currState, script);
}

function runScript(board: number[][], start: Point, script: Script): number[][] {
    const states = scriptToStates(start, script);
    // copy of input array
    const bd: number[][] = board.map(row => [...row]);
    for (const state of states) {
        if (bd.length > state.loc.x && bd[state.loc.x].length > state.loc.y) {
            bd[state.loc.x][state.loc.y] = 1
        }
    }
    return bd;
}

export function runScriptInConsole(board: number[][], script) {
    Logger.log(script);
    const start = { x: 10, y: 0 };
    const leBoard = runScript(board, start, script);
    printBoard(leBoard);
    Logger.log(scriptToStates(start, script));
}

const script =
    parseScript(`
        left 90
        forward 8
        left 30
        forward 12
        back 12
        right 20
        forward 13
        back 13
        right 20
        forward 11
        back 11
        right 20
        forward 13
        back 13
        left 30
        back 8
    `);

export function gimmeSomeStates(): State[] {
    return scriptToStates({ x: 20, y: 5 }, script);
}

//export function runTheScriptInConsole() {
Logger.log(script);
let leBoard = newBoard(40);
const start = { x: 20, y: 0 };
leBoard = runScript(leBoard, start, script);
printBoard(leBoard);
//Logger.log(scriptToStates(start, script));
//console.log(leBoard);
//}

/*
TODO:
* mudlang
*  rename
*  implement 'color'
*  implement 'repeat'
* on fe:
*  fix scrollbars
*  console interaction
*  editor interaction
*/
