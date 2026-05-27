import { josanzListFieldWidthClass } from './list-template-row-layout';

describe('josanzListFieldWidthClass', () => {
  it('uses client list widths for three columns', () => {
    expect(josanzListFieldWidthClass(0, 3)).toBe('josanz-list-template-row__field--w160');
    expect(josanzListFieldWidthClass(1, 3)).toBe('josanz-list-template-row__field--w220');
    expect(josanzListFieldWidthClass(2, 3)).toBe('josanz-list-template-row__field--grow');
  });

  it('uses default widths for four columns', () => {
    expect(josanzListFieldWidthClass(0, 4)).toBe('josanz-list-template-row__field--w220');
    expect(josanzListFieldWidthClass(1, 4)).toBe('josanz-list-template-row__field--w160');
    expect(josanzListFieldWidthClass(2, 4)).toBe('josanz-list-template-row__field--w160');
    expect(josanzListFieldWidthClass(3, 4)).toBe('josanz-list-template-row__field--grow');
  });
});
