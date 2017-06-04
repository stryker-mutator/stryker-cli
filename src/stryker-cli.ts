import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as child from 'child_process';
import * as resolver from 'resolve';

function run() {
  findPathToProgram('stryker').then(function (pathToProgram: string) {
    // Run npm program
    require(pathToProgram);
  }).catch(function (err) {
    // Ask to automaticly install Stryker
    promptInstallStryker();
  });
}

function findPathToProgram(program: string): Promise<string> {
  return new Promise((resolve, reject) => {
    resolver(program, { basedir: process.cwd() }, (err, pathToNpmModule: string) => {
      if (err) {
        reject(err); return;
      }

      let pathToProgram = path.resolve(path.dirname(pathToNpmModule), '../bin/stryker');
      if (fs.existsSync(pathToProgram)) {
        resolve(pathToProgram);
      } else {
        reject('Cannot run stryker'); return;
      } 
    });
  });
}

function promptInstallStryker() {
  console.log(chalk.yellow('Stryker is currently not installed.'));
  inquirer.prompt([{
    type: 'confirm',
    name: 'install',
    message: 'Do you want to automatically install Stryker?',
    default: 'true'
  }]).then((answers) => {
    if (answers['install']) {
      installStryker();
    } else {
      console.log('I understand. You can install Stryker manually using `npm install stryker`.');
    }
  });
}

function installStryker() {
  printStrykerASCII();
  child.execSync('npm i --save-dev stryker stryker-api', { stdio: [0, 1, 2] });
  console.log(chalk.green('Stryker installation done.'));
  child.execSync('stryker init', { stdio: [0, 1, 2] });
  console.log(`Get started by using ${chalk.blue('`stryker --help`')}.`);
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
  console.log(strykerASCII);
}

run();