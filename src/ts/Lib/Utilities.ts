export default class Utilities {
  /**
   * Logs a particular message to the console.
   * @param message Message to log.
   */
  public static Log(message: string): void {
    console.log((new Date()).toISOString() + "\n: " + message);
  }

  /**
   * Logs the start of a method in a scene.
   * @param sceneName Name of the scene.
   * @param method Method called within the scene.
   */
  public static LogSceneMethodEntry(sceneName: string, method: string): void {
    this.Log("Entered " + sceneName + " " + method + "()");
  }

  public static Range(start: number, end: number): number[] {
    return Array.from(Array(end - start + 1).keys()).map(x => x + start);
  }

  public static RandomDecimal(min: number, max: number): number {
    return Math.random() * (max - min) + min;
  }
}
