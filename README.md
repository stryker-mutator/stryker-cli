[![Build Status](https://travis-ci.org/stryker-mutator/stryker-cli.svg?branch=master)](https://travis-ci.org/stryker-mutator/stryker-cli)
[![Gitter](https://badges.gitter.im/stryker-mutator/stryker.svg)](https://gitter.im/stryker-mutator/stryker?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

![Stryker](https://github.com/stryker-mutator/stryker/raw/master/stryker-80x80.png)

# Stryker Command-Line Interface
This is the command-line interface (CLI) for [Stryker](https://stryker-mutator.github.io), the JavaScript mutation testing framework.

If you plan on using Stryker in more projects, the Stryker-CLI is the easiest way to install, configure and run Stryker for your project.

# Installation
The Stryker-CLI can be easily installed using NPM.

```
$ npm install -g stryker-cli
```

# Usage 
The Stryker-CLI works by passing received commands to your local Stryker installation. If you don't have Stryker installed yet, the Stryker-CLI will help you with your Stryker installation. This method allows us to provide additional commands with updates of Stryker itself.

For example, you can kick off mutation testing using:

```
$ stryker run
```

Please execute the Styker-CLI commands from your project's root directory.

# More
To list all of the functionality available through the Stryker-CLI, please execute the `help` command.

```
$ stryker --help
```