import {
  assembleDocumentBodyHtml,
  exportCoverConfigToHtml,
} from './document-export-html';

describe('document-export-html', () => {
  it('uses A4 dimensions for cover instead of 100vh', () => {
    const html = exportCoverConfigToHtml({
      enabled: true,
      title: 'Test',
      subtitle: '',
      author: '',
      date: '',
      logoUrl: '',
      backgroundType: 'solid',
      backgroundColor: '#7a0000',
      gradientFrom: '#420000',
      gradientTo: '#7a0000',
      backgroundImageUrl: '',
      textColor: '#fff',
      showDivider: false,
      showDate: false,
      showAuthor: false,
      layout: 'centered',
    });

    expect(html).toContain('210mm');
    expect(html).toContain('297mm');
    expect(html).not.toContain('100vh');
  });

  it('assembles cover before content', () => {
    const body = assembleDocumentBodyHtml('<p>Body</p>', {
      coverConfig: {
        enabled: true,
        title: 'Cover',
        subtitle: '',
        author: '',
        date: '',
        logoUrl: '',
        backgroundType: 'solid',
        backgroundColor: '#000',
        gradientFrom: '#000',
        gradientTo: '#000',
        backgroundImageUrl: '',
        textColor: '#fff',
        showDivider: false,
        showDate: false,
        showAuthor: false,
        layout: 'centered',
      },
      coverPanelEnabled: true,
    });

    expect(body.indexOf('pdf-cover')).toBeLessThan(body.indexOf('<p>Body</p>'));
  });
});
