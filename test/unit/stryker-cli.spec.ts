import * as path from 'path';
import { expect } from 'chai';
import chalk from 'chalk';
import * as sinon from 'sinon';
import * as inquirer from 'inquirer';
import * as resolve from 'resolve';
import * as child from 'child_process';
import NodeWrapper from '../../src/NodeWrapper';
import { run } from '../../src/stryker-cli';

describe('stryker-cli', () => {
  const basedir = '/apps/myapp';
  const strykerPackageJsonPath = 'apps/myapp/node_modules/@stryker-mutator/core/package.json';
  const strykerBinPath = 'apps/myapp/node_modules/@stryker-mutator/core/bin/stryker';
  const errorMessageModuleNotLoaded = `Error: Cannot find module '@stryker-mutator/core'`;

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
    sandbox = sinon.createSandbox();
    stubs = {
      cwd: sandbox.stub(NodeWrapper, 'cwd'),
      error: sandbox.stub(),
      execSync: sandbox.stub(child, 'execSync'),
      log: sandbox.stub(NodeWrapper, 'log'),
      prompt: sandbox.stub(inquirer, 'prompt'),
      require: sandbox.stub(NodeWrapper, 'require'),
      resolve: sandbox.stub(resolve, 'sync')
    };
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should pass commands through to local stryker', async () => {
    stubs.resolve.returns(path.resolve(strykerPackageJsonPath));
    stubs.cwd.returns(basedir);
    await run();
    expect(stubs.resolve).calledWith('@stryker-mutator/core/package.json', { basedir });
    expect(stubs.require).calledWith(path.resolve(strykerBinPath));
  });

  it('should prompt to install stryker if local stryker is not found', async () => {
    stubs.resolve.throws(new Error(errorMessageModuleNotLoaded));
    stubs.prompt.resolves({});
    await run();
    expect(stubs.prompt).calledWith([{
      choices: ['npm', 'yarn', 'no'],
      default: 'npm',
      message: 'Do you want to install Stryker locally?',
      name: 'install',
      type: 'list'
    }]);
  });

  it('should require local stryker after installing', async () => {
    stubs.resolve
      .onFirstCall().throws(new Error(errorMessageModuleNotLoaded))
      .onSecondCall().returns(path.resolve(strykerPackageJsonPath));
    stubs.prompt.resolves({ install: true });
    await run();
    expect(stubs.resolve).calledTwice;
    expect(stubs.require).calledWith(path.resolve(strykerBinPath));
  });

  it('should install stryker locally using npm if the user wants it', async () => {
    stubs.resolve
      .onFirstCall().throws(new Error(errorMessageModuleNotLoaded))
      .onSecondCall().returns(path.resolve(strykerPackageJsonPath));
    stubs.prompt.resolves({ install: 'npm' });
    await run();
    expect(stubs.execSync).calledWith('npm install --save-dev @stryker-mutator/core', { stdio: [0, 1, 2] });
  });

  it('should install stryker locally using yarn if the user wants it', async () => {
    stubs.resolve
      .onFirstCall().throws(new Error(errorMessageModuleNotLoaded))
      .onSecondCall().returns(path.resolve(strykerPackageJsonPath));
    stubs.prompt.resolves({ install: 'yarn' });
    await run();
    expect(stubs.execSync).calledWith('yarn add @stryker-mutator/core --dev', { stdio: [0, 1, 2] });
  });

  it('should not install stryker if the user didn\'t want it', async () => {
    stubs.resolve.throws(new Error(errorMessageModuleNotLoaded));
    stubs.prompt.resolves({ install: 'no' });
    await run();
    expect(stubs.execSync).not.called;
    expect(stubs.log).calledWith(`Ok, I don't agree, but I understand. You can install Stryker manually ` +
      `using ${chalk.blue('npm install --save-dev @stryker-mutator/core')}.`);
  });

  it('should pass all other errors', () => {
    stubs.resolve.returns(strykerPackageJsonPath);
    stubs.require.throws(new Error(`Error: Cannot find module 'FooBar'`));
    return expect(run()).rejectedWith(`Error: Cannot find module 'FooBar'`);
  });

  it('should not prompt again when failing a second time (with any error)', async () => {
    stubs.resolve.throws(new Error(errorMessageModuleNotLoaded));
    stubs.prompt.resolves({ install: true });
    await expect(run()).to.eventually.rejectedWith(errorMessageModuleNotLoaded);
    expect(stubs.resolve).calledTwice; // to verify that there actually was a second time
    expect(stubs.prompt).calledOnce; // the actual check
    expect(stubs.execSync).calledOnce;
  });

});
