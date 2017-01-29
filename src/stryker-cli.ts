import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';
import * as inquirer from 'inquirer';
import * as child from 'child_process';

const NODE_MODULES_DIRNAME = 'node_modules';
const STRYKER_DIRNAME = 'stryker';
const BIN_DIRNAME = 'bin';
const STRYKER_FILENAME = 'stryker';

function start() {
  const workingDirectory = process.cwd();
  const strykerPathFromNode = path.resolve(workingDirectory, NODE_MODULES_DIRNAME, STRYKER_DIRNAME, BIN_DIRNAME, STRYKER_FILENAME);
  const strykerPathFromBuild = path.resolve(workingDirectory, BIN_DIRNAME, STRYKER_FILENAME);

  if (fileExists(strykerPathFromNode)) {
    require(strykerPathFromNode);
  } else if (fileExists(strykerPathFromBuild)) {
    require(strykerPathFromBuild);
  } else {
    promptInstallStryker();
  }
}

function fileExists(filePath: string) {
  try {
    return fs.statSync(filePath).isFile();
  } catch (error) {
    return false;
  }
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
  child.execSync('npm i --save-dev stryker stryker-api', {stdio: [0, 1, 2]});
  console.log(chalk.green('Stryker installation done.'));
  console.log(`Get started by using ${chalk.blue('`stryker --help`')}.`);
}

function printStrykerASCII() {
  const strykerASCII = 
  '\n' + 
  chalk.yellow('             |STRYKER|              ') + '\n' + 
  chalk.yellow('       ~control the mutants~        ') + '\n' + '\n' + 
  chalk.red('           ..####') + chalk.white('@')  +  chalk.red('####..            ') + '\n' + 
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

start();