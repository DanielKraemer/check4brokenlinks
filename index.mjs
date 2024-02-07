#! /usr/bin/env node
// eslint-disable-next-line import/no-unresolved
import { LinkChecker, LinkState } from 'linkinator';
import chalk from 'chalk';
import dotenv from 'dotenv';

dotenv.config();

if (
  !process.env.LINKINATOR_PATHS
  || !process.env.LINKINATOR_SKIP
  || process.env.LINKINATOR_PATHS.trim() === ''
  || process.env.LINKINATOR_SKIP.trim() === ''
) throw new Error('You have to set the properties LINKINATOR_PATHS and LINKINATOR_SKIP within your local .env file!');

const linkCheckerOptions = {
  path: JSON.parse(process.env.LINKINATOR_PATHS),
  recurse: true,
  linksToSkip: JSON.parse(process.env.LINKINATOR_SKIP),
  markdown: (process.env.LINKINATOR_SCAN_MARKDOWN && process.env.LINKINATOR_SCAN_MARKDOWN === 'true'),
  concurrency: 25,
  timeout: 10000,
};

const chalkOrange = chalk.hex('#ED7014');

const LOGGER_MAP = {
  OK: '✅',
  BROKEN: '❗',
  WARNING: '⚠️',
  SKIPPED: '⏩',
};

const checker = new LinkChecker();

const internalUrls = (process.env.LINKINATOR_INTERNAL_URLS
  && process.env.LINKINATOR_INTERNAL_URLS.trim() !== '') ? JSON.parse(process.env.LINKINATOR_INTERNAL_URLS) : [];

async function checkAllLinks() {
// Log the results for each link.
  checker.on('link', (link) => {
    if (link.state === LinkState.BROKEN) {
      let showBrokenLinkWithWarning = false;
      if (process.env.LINKINATOR_DIFFERENT_STATE_FOR_BROKEN_INTERNAL_URLS === 'true') {
        internalUrls.forEach((internalUrl) => {
          if (link.url.match(new RegExp(internalUrl, 'gim'))) showBrokenLinkWithWarning = true;
        });
      }

      if (showBrokenLinkWithWarning) {
        process.stdout.write(`${LOGGER_MAP.WARNING}  ${link.url} - Status: ${link.status} - Found at: ${link.parent}\n`);
      } else {
        process.stdout.write(`${LOGGER_MAP[link.state]} ${link.url} - Status: ${link.status} - Found at: ${link.parent}\n`);
      }
    }
  });

  const checkResult = await checker.check(linkCheckerOptions);

  process.stdout.write('\n');
  process.stdout.write(chalk.blue(`🧑‍🔬 Scanned ${checkResult.links.length} links\n`));

  const skippedLinksCount = checkResult.links.filter((x) => x.state === LinkState.SKIPPED).length;
  if (skippedLinksCount > 0) process.stdout.write(chalk.yellow(`⏩ Skipped ${skippedLinksCount} links\n`));

  const brokenLinks = checkResult.links.filter((x) => x.state === LinkState.BROKEN);
  const brokenLinksCount = brokenLinks.length;
  if (brokenLinksCount > 0) {
    process.stdout.write(chalkOrange(`❗ Found ${brokenLinksCount} broken links\n`));
    if (process.env.LINKINATOR_DIFFERENT_STATE_FOR_BROKEN_INTERNAL_URLS
      && process.env.LINKINATOR_DIFFERENT_STATE_FOR_BROKEN_INTERNAL_URLS !== 'true') process.exit(1);
  }

  let internalBrokenLinksCount = 0;

  internalUrls.forEach((internalUrl) => {
    internalBrokenLinksCount += brokenLinks.filter(
      (x) => x.url.match(new RegExp(internalUrl, 'gim')),
    ).length;
  });

  if (internalBrokenLinksCount > 0
    && process.env.LINKINATOR_DIFFERENT_STATE_FOR_BROKEN_INTERNAL_URLS
    && process.env.LINKINATOR_DIFFERENT_STATE_FOR_BROKEN_INTERNAL_URLS === 'true'
  ) {
    process.stdout.write(chalk.red(`💀 Found ${internalBrokenLinksCount} KILLING (maybe internal) broken links of total count broken links\n`));
    process.exit(1);
  }
}

checkAllLinks();
