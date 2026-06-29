import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResizeDividerComponent } from './resize-divider.component';

describe('ResizeDividerComponent', () => {
  let component: ResizeDividerComponent;
  let fixture: ComponentFixture<ResizeDividerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResizeDividerComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ResizeDividerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts with dragging false', () => {
    expect((component as unknown as { dragging: () => boolean }).dragging()).toBe(false);
  });

  it('onMouseDown sets dragging to true', () => {
    const event = new MouseEvent('mousedown', { clientX: 100 });
    jest.spyOn(event, 'preventDefault');
    component.onMouseDown(event);
    expect((component as unknown as { dragging: () => boolean }).dragging()).toBe(true);
    window.dispatchEvent(new MouseEvent('mouseup'));
  });
});
