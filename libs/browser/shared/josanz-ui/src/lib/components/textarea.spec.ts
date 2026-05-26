import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TextareaComponent } from './textarea';

describe('TextareaComponent', () => {
  let fixture: ComponentFixture<TextareaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TextareaComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TextareaComponent);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should emit value on input', () => {
    const emitted: string[] = [];
    fixture.componentInstance.valueChange.subscribe((v) => emitted.push(v));
    fixture.componentInstance.writeValue('hola');
    fixture.detectChanges();
    expect(fixture.componentInstance.value).toBe('hola');
  });
});
