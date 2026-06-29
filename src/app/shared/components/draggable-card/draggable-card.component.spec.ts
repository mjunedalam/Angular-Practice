import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DraggableCardComponent } from './draggable-card.component';

describe('DraggableCardComponent', () => {
  let component: DraggableCardComponent;
  let fixture: ComponentFixture<DraggableCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DraggableCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DraggableCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('starts with dragging and resizing false', () => {
    expect((component as unknown as { dragging: () => boolean }).dragging()).toBe(false);
    expect((component as unknown as { resizing: () => boolean }).resizing()).toBe(false);
  });

  it('startDrag sets dragging to true', () => {
    const event = new MouseEvent('mousedown', { clientX: 0, clientY: 0 });
    jest.spyOn(event, 'preventDefault');
    component.startDrag(event);
    expect((component as unknown as { dragging: () => boolean }).dragging()).toBe(true);
    window.dispatchEvent(new MouseEvent('mouseup'));
  });

  it('startResize sets resizing to true', () => {
    const event = new MouseEvent('mousedown', { clientX: 0, clientY: 0 });
    jest.spyOn(event, 'preventDefault');
    jest.spyOn(event, 'stopPropagation');
    component.startResize(event, 'se');
    expect((component as unknown as { resizing: () => boolean }).resizing()).toBe(true);
    window.dispatchEvent(new MouseEvent('mouseup'));
  });
});
