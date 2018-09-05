/**
 * Wrapper around hard to mock node functionality for testability
 */
export default class NodeWrapper {

  public static require(id: string) {
    require(id);
  }

  public static cwd() {
    return process.cwd();
  }

  public static log(message: string) {
    return console.log(message);
  }
}
