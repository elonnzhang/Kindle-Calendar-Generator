#!/usr/bin/env node

import { Command, InvalidArgumentError } from 'commander';
import { initWasm, Resvg } from '@resvg/resvg-wasm';
import { generateCalendarSVG } from './lib/calendarGenerator.js';
import { buildCalendarEpub, epubFilename } from './lib/epub.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const intIn = (min, max) => (value) => {
  const n = Number(value);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new InvalidArgumentError(`Must be a whole number from ${min} to ${max}.`);
  }
  return n;
};

const now = new Date();

const program = new Command()
  .name('kindle-calendar')
  .description('Generate Kindle calendar EPUB books')
  .version('1.0.0')
  .option('-y, --year <year>', 'Calendar year', intIn(1, 9999), now.getFullYear())
  .option('-m, --month <month>', 'Calendar month (1-12)', intIn(1, 12), now.getMonth() + 1)
  .option('-o, --output <directory>', 'Output directory', 'output')
  .option('-w, --width <width>', 'Image width in pixels', intIn(1, 10000), 1072)
  .option('-h, --height <height>', 'Image height in pixels', intIn(1, 10000), 1448)
  .option('--all', 'Generate all 12 months')
  .parse();

const { year, month, width, height, output: outputDir, all } = program.opts();

fs.mkdirSync(outputDir, { recursive: true });
await initWasm(fs.readFileSync(fileURLToPath(import.meta.resolve('@resvg/resvg-wasm/index_bg.wasm'))));

const coverPng = (month) => new Resvg(generateCalendarSVG(year, month, width, height)).render().asPng();

async function generateMonth(month) {
  const outputPath = path.join(outputDir, epubFilename(year, month));
  console.log(`Generating calendar for ${year}-${month.toString().padStart(2, '0')}...`);
  await fs.promises.writeFile(outputPath, buildCalendarEpub(year, month, coverPng(month)));
  console.log(`✓ Saved to: ${outputPath}`);
}

try {
  if (all) {
    console.log(`Generating calendars for all months of ${year}...\n`);
    await Promise.all(Array.from({ length: 12 }, (_, i) => generateMonth(i + 1)));
    console.log(`\n✓ Generated 12 calendar books for ${year}`);
  } else {
    await generateMonth(month);
  }
  console.log('\nDone! Transfer the EPUB files to your Kindle to use them.');
} catch (error) {
  console.error('\nError:', error.message);
  process.exit(1);
}
