# Check4BrokenLinks

## Purpose

This package is build for checking all links a website refers to (also including images, mailto- and tel-links), also within all subdirectories.

You could also check markdown directories for links.

For link checking, the npm package [linkinator](https://www.npmjs.com/package/linkinator) is used.

The output is styled using some [emojis](https://emojipedia.org/) and [chalk](https://www.npmjs.com/package/chalk) for colored command line outputs

## Installation

Currently only to be installed using the [GitHub](https://github.com) link and not via [npmjs.com](https://npmjs.com)!

## Configuraton for usage

Currently you can the paths to be scanned or to be skipped by linkinator, and if you're scanning markdown files or not.

Also you can set internal urls and if you want to have different style for the output if the broken url seems to be an internal or an external link.

To configure them for usage, copy the params from our [.env.example](./.env.example) to the .env file of your project.

## Run within your project

After installation and configuration you can simply start it using the npx command `npx  check4brokenlinks`
