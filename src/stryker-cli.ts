import * as path from 'path';
import chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as child from 'child_process';
import NodeWrapper from './NodeWrapper';
import * as resolve from 'resolve';

const installCommands = {
  npm: 'npm install --save-dev @stryker-mutator/core',
  yarn: 'yarn add @stryker-mutator/core --dev'
};

export function run(): Promise<void> {
  try {
    return runLocalStryker();
  } catch (error) {
    if (error.toString().indexOf(`Cannot find module '@stryker-mutator/core'`) >= 0) {
      return promptInstallStryker().then(packageManager => {
        if (packageManager !== undefined) {
          installStryker(installCommands[packageManager]);
          runLocalStryker();
        }
      });
    } else {
      // Oops, other error
      return Promise.reject(error);
    }
  }
}

function runLocalStryker() {
  const stryker = localStryker();
  NodeWrapper.require(stryker);
  return Promise.resolve();
}

function localStryker() {
  const stryker = resolve.sync('@stryker-mutator/core/package.json', { basedir: NodeWrapper.cwd() });
  const dirname = path.dirname(stryker);
  return path.resolve(dirname, './bin/stryker');
}

function promptInstallStryker(): Promise<'npm' | 'yarn' | undefined> {
  NodeWrapper.log(chalk.yellow('Stryker is currently not installed.'));
  return inquirer.prompt([{
    choices: ['npm', 'yarn', 'no'],
    default: 'npm',
    message: 'Do you want to install Stryker locally?',
    name: 'install',
    type: 'list'
  }]).then((answers: inquirer.Answers) => {
    if (answers.install === 'no') {
      NodeWrapper.log(`Ok, I don't agree, but I understand. You can install Stryker manually using ${chalk.blue(installCommands.npm)}.`);
      return undefined;
    } else {
      return answers.install;
    }
  });
}

function installStryker(installCommand: string) {
  printStrykerASCII();
  executeInstallStrykerProcess(installCommand);
}

function printStrykerASCII() {
  const strykerASCII =
    '\n' +
    chalk.yellow('             |STRYKER|              ') + '\n' +
    chalk.yellow('       ~control the mutants~        ') + '\n' + '\n' +
    chalk.red('           ..####') + chalk.white('@') + chalk.red('####..            ') + '\n' +
    chalk.red('        .########') + chalk.white('@') + chalk.red('########.         ') + '\n' +
    chalk.red('      .#####################.       ') + '\n' +
    chalk.red('     #########') + chalk.yellow('#######') + chalk.red('#########      ') + '\n' +
    chalk.red('    #########') + chalk.yellow('##') + chalk.red('#####') + chalk.yellow('##') + chalk.red('#########     ') + '\n' +
    chalk.red('    #########') + chalk.yellow('##') + chalk.red('################     ') + '\n' +
    chalk.red('    ') + chalk.white('@@@') + chalk.red('#######') + chalk.yellow('#######') + chalk.red('#######') + chalk.white('@@@') + chalk.red('     ') + '\n' +
    chalk.red('    ################') + chalk.yellow('##') + chalk.red('#########     ') + '\n' +
    chalk.red('    #########') + chalk.yellow('##') + chalk.red('#####') + chalk.yellow('##') + chalk.red('#########     ') + '\n' +
    chalk.red('     #########') + chalk.yellow('#######') + chalk.red('#########      ') + '\n' +
    chalk.red(`      '######################'      `) + '\n' +
    chalk.red(`        '########`) + chalk.white('@') + chalk.red(`#########'        `) + '\n' +
    chalk.red(`           ''####`) + chalk.white('@') + chalk.red(`####''            `) + '\n';
  NodeWrapper.log(strykerASCII);
}

function executeInstallStrykerProcess(installCommand: string) {
  NodeWrapper.log(`${chalk.grey('Installing:')} ${installCommand}`);
  child.execSync(installCommand, { stdio: [0, 1, 2] });
  NodeWrapper.log(chalk.green('Stryker installation done.'));
}
