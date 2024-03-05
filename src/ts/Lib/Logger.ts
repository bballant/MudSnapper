export default class Logger {
    static isDebugMode = true;

    static log(...messages: any[]) {
        if (this.isDebugMode) {
            console.log(...messages);
        }
    }

    static warn(...messages: any[]) {
        if (this.isDebugMode) {
            console.warn(...messages);
        }
    }

    static error(...messages: any[]) {
        console.error(...messages);
    }
}
