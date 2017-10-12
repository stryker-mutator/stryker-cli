import * as path from 'path';
import { expect } from 'chai';
import * as chalk from 'chalk';
import * as sinon from 'sinon';
import * as inquirer from 'inquirer';
import * as child from 'child_process';
import RequireWrapper from '../../src/RequireWrapper';
import { run } from '../../src/stryker-cli';

const yes = 'Yes, of course!';
const no = 'Nope, not today.';

describe('stryker-cli', () => {
  let sandbox: sinon.SinonSandbox;

  let stubs: {
    prompt: sinon.SinonStub;
    execSync: sinon.SinonStub;
    require: sinon.SinonStub;
    resolve: sinon.SinonStub;
    log: sinon.SinonStub;
    error: sinon.SinonStub;
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    stubs = {
      prompt: sandbox.stub(inquirer, 'prompt'),
      execSync: sandbox.stub(child, 'execSync'),
      require: sandbox.stub(RequireWrapper, 'require'),
      resolve: sandbox.stub(RequireWrapper, 'resolve'),
      log: sandbox.stub(),
      error: sandbox.stub()
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should pass commands through to local stryker', async () => {
    stubs.resolve.returns(path.resolve('path/to/local/stryker'));
    await run(stubs.log);
    expect(stubs.require).calledWith(path.resolve('path/to/bin/stryker'));
  });

  it('should prompt to install stryker if local stryker is not found', async () => {
    stubs.resolve.throws(new Error(`Error: Cannot find module 'stryker'`));
    stubs.prompt.resolves({});
    await run(stubs.log);
    expect(stubs.prompt).calledWith([{
      type: 'confirm',
      name: 'install',
      message: 'Do you want to install Stryker locally? (npm install --save-dev stryker stryker-cli)',
      choices: [yes, no],
      default: yes
    }]);
  });

  it('should require local stryker after installing', async () => {
    stubs.resolve
      .onFirstCall().throws(new Error(`Error: Cannot find module 'stryker'`))
      .onSecondCall().returns(path.resolve('path/to/local/stryker'));
    stubs.prompt.resolves({ install: yes });
    await run(stubs.log);
    expect(stubs.resolve).calledTwice;
    expect(stubs.require).calledWith(path.resolve('path/to/bin/stryker'));
  });

  it('should install stryker locally if the user wants it', async () => {
    stubs.resolve
      .onFirstCall().throws(new Error(`Error: Cannot find module 'stryker'`))
      .onSecondCall().returns(path.resolve('path/to/local/stryker'));
    stubs.prompt.resolves({ install: yes });
    await run(stubs.log);
    expect(stubs.execSync).calledWith('npm install --save-dev stryker stryker-api', { stdio: [0, 1, 2] });
  });

  it('should not install stryker if the user didn\'t want it', async () => {
    stubs.resolve.throws(new Error(`Error: Cannot find module 'stryker'`));
    stubs.prompt.resolves({ install: no });
    await run(stubs.log);
    expect(stubs.execSync).not.called;
    expect(stubs.log).calledWith(`Ok, I don't agree, but I understand. You can install Stryker manually ` +
      `using ${chalk.blue('npm install stryker stryker-api --save-dev')}.`);
  });

  it('should pass all other errors', () => {
    stubs.resolve.returns('path/to/local/stryker');
    stubs.require.throws(new Error(`Error: Cannot find module 'FooBar'`));
    return expect(run(stubs.log)).rejectedWith(`Error: Cannot find module 'FooBar'`);
  });

  it('should not prompt again when failing a second time (with any error)', () => {
    stubs.resolve.throws(new Error(`Error: Cannot find module 'stryker'`));
    stubs.prompt.resolves({ install: yes });
    return expect(run(stubs.log)).to.eventually.rejectedWith(`Error: Cannot find module 'stryker'`);
  });

});