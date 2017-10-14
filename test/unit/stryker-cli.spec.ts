import * as path from 'path';
import { expect } from 'chai';
import * as chalk from 'chalk';
import * as sinon from 'sinon';
import * as inquirer from 'inquirer';
import * as resolve from 'resolve';
import * as child from 'child_process';
import NodeWrapper from '../../src/NodeWrapper';
import { run } from '../../src/stryker-cli';

describe('stryker-cli', () => {
  let sandbox: sinon.SinonSandbox;

  let stubs: {
    prompt: sinon.SinonStub;
    execSync: sinon.SinonStub;
    require: sinon.SinonStub;
    resolve: sinon.SinonStub;
    log: sinon.SinonStub;
    error: sinon.SinonStub;
    cwd: sinon.SinonStub;
  };

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    stubs = {
      prompt: sandbox.stub(inquirer, 'prompt'),
      execSync: sandbox.stub(child, 'execSync'),
      require: sandbox.stub(NodeWrapper, 'require'),
      resolve: sandbox.stub(resolve, 'sync'),
      log: sandbox.stub(NodeWrapper, 'log'),
      error: sandbox.stub(),
      cwd: sandbox.stub(NodeWrapper, 'cwd')
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should pass commands through to local stryker', async () => {
    stubs.resolve.returns(path.resolve('path/to/local/stryker'));
    stubs.cwd.returns('/path/to/cwd');
    await run();
    expect(stubs.resolve).calledWith('stryker', { basedir: '/path/to/cwd' });
    expect(stubs.require).calledWith(path.resolve('path/to/bin/stryker'));
  });

  it('should prompt to install stryker if local stryker is not found', async () => {
    stubs.resolve.throws(new Error(`Error: Cannot find module 'stryker'`));
    stubs.prompt.resolves({});
    await run();
    expect(stubs.prompt).calledWith([{
      type: 'confirm',
      name: 'install',
      message: 'Do you want to install Stryker locally? (npm install --save-dev stryker stryker-api)',
      default: true
    }]);
  });

  it('should require local stryker after installing', async () => {
    stubs.resolve
      .onFirstCall().throws(new Error(`Error: Cannot find module 'stryker'`))
      .onSecondCall().returns(path.resolve('path/to/local/stryker'));
    stubs.prompt.resolves({ install: true });
    await run();
    expect(stubs.resolve).calledTwice;
    expect(stubs.require).calledWith(path.resolve('path/to/bin/stryker'));
  });

  it('should install stryker locally if the user wants it', async () => {
    stubs.resolve
      .onFirstCall().throws(new Error(`Error: Cannot find module 'stryker'`))
      .onSecondCall().returns(path.resolve('path/to/local/stryker'));
    stubs.prompt.resolves({ install: true });
    await run();
    expect(stubs.execSync).calledWith('npm install --save-dev stryker stryker-api', { stdio: [0, 1, 2] });
  });

  it('should not install stryker if the user didn\'t want it', async () => {
    stubs.resolve.throws(new Error(`Error: Cannot find module 'stryker'`));
    stubs.prompt.resolves({ install: false });
    await run();
    expect(stubs.execSync).not.called;
    expect(stubs.log).calledWith(`Ok, I don't agree, but I understand. You can install Stryker manually ` +
      `using ${chalk.blue('npm install --save-dev stryker stryker-api')}.`);
  });

  it('should pass all other errors', () => {
    stubs.resolve.returns('path/to/local/stryker');
    stubs.require.throws(new Error(`Error: Cannot find module 'FooBar'`));
    return expect(run()).rejectedWith(`Error: Cannot find module 'FooBar'`);
  });
  
  it('should not prompt again when failing a second time (with any error)', async() => {
    stubs.resolve.throws(new Error(`Error: Cannot find module 'stryker'`));
    stubs.prompt.resolves({ install: true });
    await expect(run()).to.eventually.rejectedWith(`Error: Cannot find module 'stryker'`);
    expect(stubs.resolve).calledTwice; // to verify that there actually was a second time
    expect(stubs.prompt).calledOnce; // the actual check
    expect(stubs.execSync).calledOnce; 
  });

});