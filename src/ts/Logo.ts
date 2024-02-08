type Command =
    'forward' |
    'back' |
    'left' |
    'right' |
    'repeat'

const commands: Command[] = [
    'forward', 'back', 'left', 'right', 'repeat'
]

type CommandLine = {
    command: Command
    params: string[] | CommandLine[]
} | undefined

type Script = CommandLine[];

function startsWithCommand(commandStr: string): Command | undefined {
    for (const command of commands) {
        if (commandStr.startsWith(command)) {
            return command;
        }
    }
    return undefined;
}

function lineToCommandLine(line: string): CommandLine {

    return undefined
}

function scriptToScript(scriptStr: string): Script {
    return scriptStr.split(/\r?\n/).map(lineToCommandLine);
}
