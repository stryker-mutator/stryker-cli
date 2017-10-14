
/**
 * Wrapper around hard to mock node functionality for testability
 */ 
export default class NodeWrapper {

  static require(id: string) {
    require(id);
  }

  static cwd() {
    return process.cwd();
  }

  static log(message: string) {
    return console.log(message);
  }
}