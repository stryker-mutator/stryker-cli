
/**
 * Wrapper around `require` for testability
 */
export default class RequireWrapper {

  static resolve(id: string) {
    return require.resolve(id);
  }

  static require(id: string) {
    require(id);
  }
}