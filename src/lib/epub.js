import { zipSync, strToU8 } from 'fflate';

const pad = (month) => month.toString().padStart(2, '0');

// _V for a portrait cover, _H for a landscape one.
export const epubFilename = (year, month, orientation = 'portrait') =>
  `calendar_${year}_${pad(month)}_${orientation === 'landscape' ? 'H' : 'V'}.epub`;

// coverPng is the cover as PNG bytes. Amazon's Kindle pipeline accepts
// JPEG, PNG, GIF, and TIFF covers, and drops an SVG cover.
// The landscape book gets its own title and identifier, so both
// orientations of one month can sit in the same Kindle library.
export function buildCalendarEpub(year, month, coverPng, orientation = 'portrait') {
  const landscape = orientation === 'landscape';
  const uid = `kindle-calendar-${year}-${pad(month)}${landscape ? '-h' : ''}`;
  const title = `${year}年${month}月 日历${landscape ? '（横屏）' : ''}`;

  const container = `<?xml version="1.0"?>
<container version="1.0" xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
  <rootfiles>
    <rootfile full-path="OEBPS/content.opf" media-type="application/oebps-package+xml"/>
  </rootfiles>
</container>`;

  const contentOpf = `<?xml version="1.0" encoding="UTF-8"?>
<package xmlns="http://www.idpf.org/2007/opf" version="3.0" unique-identifier="uid">
  <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
    <dc:identifier id="uid">${uid}</dc:identifier>
    <dc:title>${title}</dc:title>
    <dc:language>zh</dc:language>
    <dc:creator>Kindle Calendar Generator</dc:creator>
    <meta name="cover" content="cover-image"/>
  </metadata>
  <manifest>
    <item id="cover" href="cover.xhtml" media-type="application/xhtml+xml"/>
    <item id="cover-image" href="cover.png" media-type="image/png" properties="cover-image"/>
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
  <img src="cover.png" alt="Calendar Cover"/>
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
    <meta name="dtb:uid" content="${uid}"/>
    <meta name="dtb:depth" content="1"/>
    <meta name="dtb:totalPageCount" content="0"/>
    <meta name="dtb:maxPageNumber" content="0"/>
  </head>
  <docTitle>
    <text>${title}</text>
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

  return zipSync(
    {
      mimetype: [strToU8('application/epub+zip'), { level: 0 }],
      'META-INF/container.xml': strToU8(container),
      'OEBPS/content.opf': strToU8(contentOpf),
      'OEBPS/cover.png': [coverPng, { level: 0 }],
      'OEBPS/cover.xhtml': strToU8(coverXhtml),
      'OEBPS/page1.xhtml': strToU8(page1Xhtml),
      'OEBPS/toc.ncx': strToU8(tocNcx),
    },
    { level: 9 },
  );
}
