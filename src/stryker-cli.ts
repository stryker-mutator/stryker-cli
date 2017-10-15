import * as path from 'path';
import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as child from 'child_process';
import NodeWrapper from './NodeWrapper';
import * as resolve from 'resolve';

const installCommand = 'npm install --save-dev stryker stryker-api';

export function run(): Promise<void> {
  try {
    return runLocalStryker();
  }
  catch (error) {
    if (error.toString().indexOf(`Cannot find module 'stryker'`) >= 0) {
      return promptInstallStryker().then(shouldInstall => {
        if (shouldInstall) {
          installStryker();
          runLocalStryker();
        }
      });
    }
    else {
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
  const stryker = resolve.sync('stryker', { basedir: NodeWrapper.cwd() });
  const dirname = path.dirname(stryker);
  return path.resolve(dirname, '../bin/stryker');
}

function promptInstallStryker(): Promise<boolean> {
  NodeWrapper.log(chalk.yellow('Stryker is currently not installed.'));
  return inquirer.prompt([{
    type: 'confirm',
    name: 'install',
    message: `Do you want to install Stryker locally? (${installCommand})`,
    default: true
  }]).then((answers: inquirer.Answers) => {
    if (answers['install']) {
      return true;
    } else {
      NodeWrapper.log(`Ok, I don't agree, but I understand. You can install Stryker manually using ${chalk.blue(installCommand)}.`);
      return false;
    }
  });
}

function installStryker() {
  printStrykerASCII();
  executeInstallStrykerProcess();
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

function executeInstallStrykerProcess() {
  child.execSync(installCommand, { stdio: [0, 1, 2] });
  NodeWrapper.log(chalk.green('Stryker installation done.'));
}
