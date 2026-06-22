import {
  repairTruncatedSvgArcCommands,
  sanitizeSvgPathsInHtml,
} from './sanitize-export-svg';

describe('sanitizeSvgPathsInHtml', () => {
  it('repairs truncated heroicon arc commands in path d attributes', () => {
    const broken =
      '<svg><path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 0 01-2-2V5a2 0 012-2z"/></svg>';
    const fixed = sanitizeSvgPathsInHtml(broken);
    expect(fixed).toContain('H7a2 2 0 01-2-2');
    expect(fixed).toContain('V5a2 2 0 012-2');
  });

  it('leaves valid paths unchanged', () => {
    const valid = '<path d="M5 13l4 4L19 7"/>';
    expect(sanitizeSvgPathsInHtml(valid)).toBe(valid);
  });
});

describe('repairTruncatedSvgArcCommands', () => {
  it('fixes lowercase arc shorthand', () => {
    expect(repairTruncatedSvgArcCommands('H7a2 0 01-2-2')).toBe(
      'H7a2 2 0 01-2-2',
    );
  });
});
