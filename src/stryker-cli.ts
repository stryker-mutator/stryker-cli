import * as path from 'path';
import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as child from 'child_process';
import RequireWrapper from './RequireWrapper';

export function run(log = console.log): Promise<void> {
  try {
    return runLocalStryker();
  }
  catch (error) {
    if (error.toString().indexOf(`Cannot find module 'stryker'`) >= 0) {
      return promptInstallStryker(log).then(shouldInstall => {
        if (shouldInstall) {
          installStryker(log);
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
  const strykerCli = localStrykerCli();
  RequireWrapper.require(strykerCli);
  return Promise.resolve();
}

function localStrykerCli() {
  const dirname = path.dirname(RequireWrapper.resolve('stryker'));
  return path.resolve(dirname, '../bin/stryker');
}

function promptInstallStryker(log: (message: string) => void): Promise<boolean> {
  log(chalk.yellow('Stryker is currently not installed.'));
  return inquirer.prompt([{
    type: 'confirm',
    name: 'install',
    message: 'Do you want to install Stryker locally? (npm install --save-dev stryker stryker-cli)',
    choices: ['Yes, of course!', 'Nope, not today.'],
    default: 'Yes, of course!'
  }]).then((answers: inquirer.Answers) => {
    if (answers['install'] === 'Yes, of course!') {
      return true;
    } else {
      log(`Ok, I don't agree, but I understand. You can install Stryker manually using ${chalk.blue('npm install stryker stryker-api --save-dev')}.`);
      return false;
    }
  });
}

function installStryker(log: (message: string) => void) {
  printStrykerASCII(log);
  executeInstallStrykerProcess(log);
}

function printStrykerASCII(log: (message: string) => void) {
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
  log(strykerASCII);
}

function executeInstallStrykerProcess(log: (message: string) => void) {
  child.execSync('npm install --save-dev stryker stryker-api', { stdio: [0, 1, 2] });
  log(chalk.green('Stryker installation done.'));
}
