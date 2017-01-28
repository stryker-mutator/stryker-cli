import * as fs from 'fs';
import * as path from 'path';
import * as chalk from 'chalk';

const NODE_MODULES_DIRNAME = 'node_modules';
const STRYKER_DIRNAME = 'stryker';
const BIN_DIRNAME = 'bin';
const STRYKER_FILENAME = 'stryker';

function fileExists(filePath: string) {
    try {
        return fs.statSync(filePath).isFile();
    } catch (error) {
        return false;
    }
}

function strykerNotFound() {
    console.error(chalk.red.bold('Cannot find Stryker!\nPlease install Stryker using "npm install stryker".'));
    process.exit(1);
}

const baseDir = process.cwd();
const strykerPathFromNode = path.resolve(baseDir, NODE_MODULES_DIRNAME, STRYKER_DIRNAME, BIN_DIRNAME, STRYKER_FILENAME);
const strykerPathFromBuild = path.resolve(baseDir, BIN_DIRNAME, STRYKER_FILENAME);

try {
    if (fileExists(strykerPathFromNode)) {
        require(strykerPathFromNode);
    } else if (fileExists(strykerPathFromBuild)) {
        require(strykerPathFromBuild);
    } else {
        strykerNotFound();
    }
} catch (error) {
    strykerNotFound();
} 