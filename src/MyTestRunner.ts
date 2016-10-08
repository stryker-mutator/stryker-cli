import { TestRunner, RunnerOptions, RunOptions, RunResult, TestResult, RunState, TestState } from 'stryker-api/test_runner';
import { EventEmitter } from 'events';

/**
 * Represents a test runner
 * 
 * The 
 */
export default class MyTestRunner extends EventEmitter implements TestRunner {

  constructor(options: RunnerOptions) {
    super();
  }

  /**
    * Optional. When implemented, will be called before runs are done on this test runner.
    * @returns A promise if stuff is initialized asyncronously, runs will not start until the promise is resolved.
    * Otherwise void
    */
  init(): Promise<any> | void {

  }

  /**
   * Executes a test run.
   * @param options The options for this test run.
   * @returns A promise to eventually complete the test run and deliver a RunResult.
   */
  run(options: RunOptions): Promise<RunResult> {
    const oneTestResult: TestResult = {
      /**
      * The full human readable name of the test
      */
      name: '',
      /**
       * The state of the test
       */
      state: TestState.Success,
      /**
       * Optional: any error messages
       */
      // errorMessages: string[];

      /**
       * Optional: the time it took
       */
      timeSpentMs: 15,
      /**
       * Optional: the coverage result.
       */
      // coverage?: CoverageCollection;
    };

    return Promise.resolve({
      /**
          * The individual test results.
          */
      tests: [oneTestResult],
      /**
       * If `state` is `error`, this collection should contain the error messages
       */
      errorMessages: ['Error, test runner not implemented'],
      /**
       * The state of the run
       */
      state: RunState.Complete
    });
  }

  /**
   * Optional. When implemented, will be called before the test runner's process is killed.
   * @returns A promise if stuff is destroyed asyncronously, the runners process will not end until the promise is resolved.
   * Otherwise void
   */
  dispose?(): Promise<any> | void {

  }
}