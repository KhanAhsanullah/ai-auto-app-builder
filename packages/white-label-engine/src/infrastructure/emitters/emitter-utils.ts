import type { NormalizedBrandAssets } from '../../types.js';

const FONT_FAMILY_NAMES = {
  heading: 'BrandHeading',
  body: 'BrandBody',
} as const;

/** Map a file format to a MIME type for link/type attributes. */
export function mimeTypeForFormat(format: string, category: 'image' | 'font'): string {
  if (category === 'font') {
    switch (format) {
      case 'woff2':
        return 'font/woff2';
      case 'woff':
        return 'font/woff';
      case 'ttf':
        return 'font/ttf';
      case 'otf':
        return 'font/otf';
      default:
        return 'application/octet-stream';
    }
  }

  switch (format) {
    case 'svg':
      return 'image/svg+xml';
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    case 'ico':
      return 'image/x-icon';
    default:
      return 'application/octet-stream';
  }
}

/** Build @font-face CSS referencing brand font asset URLs. */
export function buildFontFaceCss(fonts: NormalizedBrandAssets['fonts']): string | undefined {
  if (!fonts) {
    return undefined;
  }

  const rules: string[] = [];

  if (fonts.heading) {
    rules.push(renderFontFaceRule(FONT_FAMILY_NAMES.heading, fonts.heading));
  }

  if (fonts.body) {
    rules.push(renderFontFaceRule(FONT_FAMILY_NAMES.body, fonts.body));
  }

  return rules.length > 0 ? rules.join('\n') : undefined;
}

function renderFontFaceRule(
  familyName: string,
  font: NonNullable<NonNullable<NormalizedBrandAssets['fonts']>['heading']>,
): string {
  const descriptors = [
    `@font-face {`,
    `  font-family: '${familyName}';`,
    `  src: url('${font.url}') format('${font.format}');`,
    `  font-display: swap;`,
  ];

  if (font.weight !== undefined) {
    descriptors.push(`  font-weight: ${font.weight};`);
  }

  if (font.style !== undefined) {
    descriptors.push(`  font-style: ${font.style};`);
  }

  descriptors.push('}');

  return descriptors.join('\n');
}
