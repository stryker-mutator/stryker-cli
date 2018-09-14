import * as path from 'path';
import chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as child from 'child_process';
import NodeWrapper from './NodeWrapper';
import * as resolve from 'resolve';

const installCommands: any = {
  npm: {
    angular: 'npm install --save-dev stryker stryker-karma-runner stryker-typescript @angular-devkit/build-angular @angular/cli @angular/compiler-cli @angular/language-service @types/jasmine @types/jasminewd2 @types/node codelyzer jasmine-core jasmine-spec-reporter karma karma-chrome-launcher karma-coverage-istanbul-reporter karma-jasmine karma-jasmine-html-reporter protractor ts-node tslint typescript',
    clear: 'npm install --save-dev stryker stryker-api',
  },
  yarn: {
    angular: 'yarn add stryker stryker-karma-runner stryker-typescript @angular-devkit/build-angular @angular/cli @angular/compiler-cli @angular/language-service @types/jasmine @types/jasminewd2 @types/node codelyzer jasmine-core jasmine-spec-reporter karma karma-chrome-launcher karma-coverage-istanbul-reporter karma-jasmine karma-jasmine-html-reporter protractor ts-node tslint typescript --dev',
    clear: 'yarn add stryker stryker-api --dev'
  }
};

export function run(): Promise<void> {
  try {
    return runLocalStryker();
  } catch (error) {
    if (error.toString().indexOf(`Cannot find module 'stryker'`) >= 0) {
      return promptInstallStryker().then(packageManager => {
        if (packageManager !== undefined) {
          promptInstallPackage().then(selectedPackage => {
            installStryker(installCommands[packageManager][selectedPackage]);
            runLocalStryker();
          });
        }
      });
    } else {
      // Oops, other error
      return Promise.reject(error);
    }
  }
}

function runLocalStryker(): Promise<void> {
  const stryker = localStryker();
  NodeWrapper.require(stryker);
  return Promise.resolve();
}

function localStryker() {
  const stryker = resolve.sync('stryker', { basedir: NodeWrapper.cwd() });
  const dirname = path.dirname(stryker);
  return path.resolve(dirname, '../bin/stryker');
}

function promptInstallStryker(): Promise<'npm' | 'yarn'> {
  NodeWrapper.log(chalk.yellow('Stryker is currently not installed.'));
  return inquirer.prompt([{
    choices: ['npm', 'yarn'],
    default: 'npm',
    message: 'Select package manager You want to use?',
    name: 'install',
    type: 'list'
  }]).then((answers: inquirer.Answers) => {
    return answers.install;
  });
}

function promptInstallPackage(): Promise<string> {
  return inquirer.prompt([{
    choices: ['angular', 'clear'],
    default: 'clear',
    message: 'Select setup you want to use:',
    name: 'setup',
    type: 'list'
  }]).then((answers: inquirer.Answers) => {
    return answers.setup;
  });
}

function installStryker(installCommand: string): void {
  printStrykerASCII();
  executeInstallStrykerProcess(installCommand);
}

function printStrykerASCII(): void {
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

function executeInstallStrykerProcess(installCommand: string): void {
  NodeWrapper.log(`${chalk.grey('Installing:')} ${installCommand}`);
  child.execSync(installCommand, { stdio: [0, 1, 2] });
  NodeWrapper.log(chalk.green('Stryker installation done.'));
}
