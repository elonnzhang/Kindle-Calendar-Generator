/**
 * EPUB book generator for Kindle calendar books.
 * Creates EPUB files with calendar images as covers.
 */

import { generateCalendarSVG } from './calendarGenerator.js';
import archiver from 'archiver';
import { Readable } from 'stream';
import fs from 'fs';

/**
 * Generate EPUB file with calendar cover
 * @param {number} year
 * @param {number} month
 * @param {number} width
 * @param {number} height
 * @param {string} outputPath
 * @returns {Promise<void>}
 */
export async function generateCalendarEpub(year, month, width, height, outputPath) {
  const calendarSVG = generateCalendarSVG(year, month, width, height);

  // Create EPUB structure
  const container = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">kindle-calendar-${year}-${month.toString().padStart(2, '0')}</dc:identifier>
    <dc:title>${year}年${month}月 日历</dc:title>
    <dc:language>zh</dc:language>
    <dc:creator>Kindle Calendar Generator</dc:creator>
    <meta name="cover" content="cover-image"/>
  </metadata>
  <manifest>
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
    <item id="cover-image" href="cover.svg" media-type="image/svg+xml" properties="cover-image"/>
    <item id="page1" href="page1.xhtml" media-type="application/xhtml+xml"/>
    <item id="ncx" href="toc.ncx" media-type="application/x-dtbncx+xml"/>
  </manifest>
  <spine toc="ncx">
    <itemref idref="cover" linear="no"/>
    <itemref idref="page1"/>
  </spine>
  <guide>
    <reference type="cover" title="封面" href="cover.xhtml"/>
  </guide>
</package>`;

  const coverXhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>封面</title>
  <style type="text/css">
    body { margin: 0; padding: 0; text-align: center; }
    img { max-width: 100%; max-height: 100%; }
  </style>
</head>
<body>
  <img src="cover.svg" alt="Calendar Cover"/>
</body>
</html>`;

  const page1Xhtml = `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE html>
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <title>${year}年${month}月</title>
</head>
<body>
  <h1>${year}年${month}月</h1>
  <p>这是一本 Kindle 日历电子书。</p>
  <p>待机时将显示封面上的日历。</p>
</body>
</html>`;

  const tocNcx = `<?xml version="1.0" encoding="UTF-8"?>
<ncx xmlns="http://www.daisy.org/z3986/2005/ncx/" version="2005-1">
  <head>
    <meta name="dtb:uid" content="kindle-calendar-${year}-${month.toString().padStart(2, '0')}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${year}年${month}月 日历</text>
  </docTitle>
  <navMap>
    <navPoint id="navPoint-1" playOrder="1">
      <navLabel>
        <text>日历</text>
      </navLabel>
      <content src="page1.xhtml"/>
    </navPoint>
  </navMap>
</ncx>`;

  // Create ZIP archive (EPUB is a ZIP file)
  return new Promise((resolve, reject) => {
    const output = fs.createWriteStream(outputPath);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    output.on('close', resolve);
    archive.on('error', reject);

    archive.pipe(output);

    // Add mimetype (must be first, uncompressed)
    archive.append('application/epub+zip', {
      name: 'mimetype',
      store: true
    });

    // Add META-INF
    archive.append(container, { name: 'META-INF/container.xml' });

    // Add OEBPS content
    archive.append(contentOpf, { name: 'OEBPS/content.opf' });
    archive.append(calendarSVG, { name: 'OEBPS/cover.svg' });
    archive.append(coverXhtml, { name: 'OEBPS/cover.xhtml' });
    archive.append(page1Xhtml, { name: 'OEBPS/page1.xhtml' });
    archive.append(tocNcx, { name: 'OEBPS/toc.ncx' });

    archive.finalize();
  });
}
