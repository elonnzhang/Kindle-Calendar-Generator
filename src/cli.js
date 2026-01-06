#!/usr/bin/env node

import { Command } from 'commander';
import { generateCalendarEpub } from './lib/epubGenerator.js';
import fs from 'fs';
import path from 'path';

const program = new Command();

program
  .name('kindle-calendar')
  .description('Generate Kindle calendar EPUB books')
  .version('1.0.0');

program
  .option('-y, --year <year>', 'Calendar year', new Date().getFullYear().toString())
  .option('-m, --month <month>', 'Calendar month (1-12)', null)
  .option('-o, --output <directory>', 'Output directory', 'output')
  .option('-w, --width <width>', 'Image width in pixels', '1072')
  .option('-h, --height <height>', 'Image height in pixels', '1448')
  .option('--all', 'Generate all 12 months');

program.parse();

const options = program.opts();
const year = parseInt(options.year);
const width = parseInt(options.width);
const height = parseInt(options.height);
const outputDir = options.output;

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function generateMonth(year, month) {
  const filename = `calendar_${year}_${month.toString().padStart(2, '0')}.epub`;
  const outputPath = path.join(outputDir, filename);

  console.log(`Generating calendar for ${year}-${month.toString().padStart(2, '0')}...`);

  try {
    await generateCalendarEpub(year, month, width, height, outputPath);
    console.log(`✓ Saved to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error(`✗ Error generating ${year}-${month}: ${error.message}`);
    throw error;
  }
}

async function main() {
  try {
    if (options.all) {
      console.log(`Generating calendars for all months of ${year}...\n`);
      const promises = [];

      for (let month = 1; month <= 12; month++) {
        promises.push(generateMonth(year, month));
      }

      await Promise.all(promises);
      console.log(`\n✓ Generated 12 calendar books for ${year}`);
    } else {
      const month = options.month ? parseInt(options.month) : new Date().getMonth() + 1;

      if (month < 1 || month > 12) {
        console.error('Error: Month must be between 1 and 12');
        process.exit(1);
      }

      await generateMonth(year, month);
    }

    console.log('\nDone! Transfer the EPUB files to your Kindle to use them.');
  } catch (error) {
    console.error('\nError:', error.message);
    process.exit(1);
  }
}

main();
