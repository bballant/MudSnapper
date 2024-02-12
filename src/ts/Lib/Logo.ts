// #!/usr/bin/env tsx

export type Command =
    'forward' |
    'back' |
    'left' |
    'right' |
    'repeat'

const COMMANDS: Command[] = [
    'forward', 'back', 'left', 'right', 'repeat'
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

export type Color = 'red' | 'yellow' | 'brown' | 'none'

export type State = {
    loc: Point,
    rot: number,
    pen: Color
}

function parseScript(scriptStr: string): Script | undefined {
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

function printBoard(board: number[][]) {
    console.log([...board].reverse().map(row => row.map(cell => cell ? '■' : '□').join(' ')).join('\n'));
}

function drawLine(board: number[][], start: Point, end: Point): number[][] {
    let x0 = start.x;
    let y0 = start.y;
    const x1 = end.x;
    const y1 = end.y;

    const dx = Math.abs(x1 - x0);
    const dy = Math.abs(y1 - y0);
    const sx = (x0 < x1) ? 1 : -1;
    const sy = (y0 < y1) ? 1 : -1;
    let err = dx - dy;

    while (true) {
        // Set the value for the point on the line
        if (x0 >= 0 && x0 < board.length && y0 >= 0 && y0 < board[0].length) {
            board[y0][x0] = 1;
        }

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

    return board;
}

function getEndpoint(start: Point, degrees: number, distance: number): Point {
    const radians = degrees * (Math.PI / 180);

    const end: Point = {
        x: start.x + Math.round(distance * Math.cos(radians)),
        y: start.y + Math.round(distance * Math.sin(radians))
    };

    return end;
}

function drawLineFrom(board: number[][], start: Point, degrees: number, distance: number): number[][] {
    const radians = degrees * (Math.PI / 180);

    const end: Point = {
        x: start.x + Math.round(distance * Math.cos(radians)),
        y: start.y + Math.round(distance * Math.sin(radians))
    };

    return drawLine(board, start, end);
}

function oneNumParam(call: CommandCall): number {
    const ret = parseInt(call.params[0]);
    if (call.params.length != 1 || Number.isNaN(ret)) {
        throw Error(`Couldn't parse parameter for command ${call.command} ${call.params}`);
    }
    return ret;
}

function runScript(board: number[][], start: Point, script: Script): number[][] {
    let degrees = 0;
    let begin = start;
    for (let i = 0; i < script.length; i++) {
        switch (script[i].command) {
            case ('forward'):
                const end = getEndpoint(begin, degrees, oneNumParam(script[i]));
                board = drawLine(board, begin, end);
                begin = end;
                break;
            case ('back'):
                const end2 = getEndpoint(begin, degrees, -1 * oneNumParam(script[i]));
                board = drawLine(board, begin, end2);
                begin = end2;
                break;
            case ('left'):
                degrees = degrees + oneNumParam(script[i])
                break;
            case ('right'):
                degrees = degrees - oneNumParam(script[i])
                break;
        }
    }
    return board;
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
    while (true) {
        ret.push({x: x0, y: y0});

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


function fillStatesForLine(currState: State, start: Point, end: Point): State[] {
    let ret: State[] = [];
    return [];
}

function scriptToStates(start: Point, script: Script): State[] {
    let currState: State = {
        loc: start,
        rot: 0,
        pen: 'brown'
    }
    let states: State[] = []
    for (let i = 0; i < script.length; i++) {
        const cmd = script[i].command;
        switch (cmd) {
            case ('forward'):
            case ('back'):
                const mult = cmd == 'back' ? -1 : 1;
                const end = getEndpoint(currState.loc, currState.rot, mult * oneNumParam(script[i]));
                const points = getPointsForLine(currState.loc, end);
                for (let p of points) {
                    currState.loc = p;
                    states.push({
                        loc: currState.loc,
                        rot: currState.rot,
                        pen: currState.pen
                    })
                }
                break;
            case ('left'):
            case ('right'):
                const mult1 = cmd == 'right' ? -1 : 1;
                currState.rot = currState.rot + mult1 * oneNumParam(script[i])
                states.push({
                    loc: currState.loc,
                    rot: currState.rot,
                    pen: currState.pen
                })
                break;
        }
    }
    return states;
}

const script =
    parseScript(`
        left 90
        forward 5
        left 30
        forward 10
        back 10 
        right 20
        forward 10
        back 10 
        right 20
        forward 10
        back 10 
        right 20
        forward 10
        back 10 
    `);

export function gimmeSomeStates(): State[] {
    return scriptToStates({x: 5, y: 5}, script);
}

/*
if (script) {
    console.log(script);
    let leBoard = newBoard(20);
    let start = { x: 10, y: 0 };
    leBoard = runScript(leBoard, start, script);
    printBoard(leBoard);
    console.log(scriptToStates(start, script));
}
*/