/**
 * Browser-compatible EPUB generator using JSZip
 * Note: Requires JSZip library
 */

import { generateCalendarSVG } from './calendarUtils';

/**
 * Generate EPUB file in browser
 */
export async function generateEpubInBrowser(year, month, width, height) {
  // Dynamically import JSZip
  const JSZip = (await import('https://cdn.jsdelivr.net/npm/jszip@3.10.1/+esm')).default;

  const calendarSVG = generateCalendarSVG(year, month, width, height);

  const zip = new JSZip();

  // Add mimetype (uncompressed)
  zip.file('mimetype', 'application/epub+zip', { compression: 'STORE' });

  // META-INF/container.xml
  const container = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;
  zip.file('META-INF/container.xml', container);

  // OEBPS/content.opf
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
  zip.file('OEBPS/content.opf', contentOpf);

  // OEBPS/cover.svg
  zip.file('OEBPS/cover.svg', calendarSVG);

  // OEBPS/cover.xhtml
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
  zip.file('OEBPS/cover.xhtml', coverXhtml);

  // OEBPS/page1.xhtml
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
  zip.file('OEBPS/page1.xhtml', page1Xhtml);

  // OEBPS/toc.ncx
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
  zip.file('OEBPS/toc.ncx', tocNcx);

  // Generate blob
  const blob = await zip.generateAsync({ type: 'blob' });
  return blob;
}

/**
 * Download EPUB file
 */
export async function downloadEpub(year, month, width, height) {
  const blob = await generateEpubInBrowser(year, month, width, height);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `calendar_${year}_${month.toString().padStart(2, '0')}.epub`;
  document.body.appendChild(a);
  a.click();
  URL.revokeObjectURL(url);
  document.body.removeChild(a);
}
