import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WellNameChipsComponent } from './well-name-chips.component';
import { WellStore } from '@store/active-wwell/active-wwell.store';
import { signal } from '@angular/core';

interface WellChip {
  wellName: string;
  epANum: number;
}

describe('WellNameChipsComponent', () => {
  let component: WellNameChipsComponent;
  let fixture: ComponentFixture<WellNameChipsComponent>;
  let mockStore: {
    wellNamesPage: ReturnType<typeof signal<number>>;
    totalPages: ReturnType<typeof signal<number>>;
    hasPrevPage: ReturnType<typeof signal<boolean>>;
    hasNextPage: ReturnType<typeof signal<boolean>>;
    pagedWellNames: ReturnType<typeof signal<WellChip[]>>;
    selectedEpANum: ReturnType<typeof signal<number | null>>;
    isDetailsLoading: ReturnType<typeof signal<boolean>>;
    selectedDate: jest.Mock;
    selectWell: jest.Mock;
    setSelectedDate: jest.Mock;
    nextPage: jest.Mock;
    prevPage: jest.Mock;
  };

  beforeEach(async () => {
    mockStore = {
      wellNamesPage: signal(0),
      totalPages: signal(2),
      hasPrevPage: signal(false),
      hasNextPage: signal(true),
      pagedWellNames: signal([
        { wellName: 'Well 1', epANum: 1 },
        { wellName: 'Well 2', epANum: 2 }
      ]),
      selectedEpANum: signal(1),
      isDetailsLoading: signal(false),
      selectedDate: jest.fn().mockReturnValue(new Date('2026-04-11T00:00:00.000Z')),
      selectWell: jest.fn(),
      setSelectedDate: jest.fn(),
      nextPage: jest.fn(),
      prevPage: jest.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [WellNameChipsComponent],
      providers: [
        { provide: WellStore, useValue: mockStore }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(WellNameChipsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render well name chips', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const chips = compiled.querySelectorAll('.chip:not(.chip--nav)');
    expect(chips.length).toBe(2);
    expect(chips[0].textContent).toContain('Well 1');
    expect(chips[1].textContent).toContain('Well 2');
  });

  it('should highlight the selected well', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const activeChip = compiled.querySelector('.chip--active');
    expect(activeChip?.textContent).toContain('Well 1');
  });

  it('should call selectWell when a chip is clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const chips = compiled.querySelectorAll('.chip:not(.chip--nav)');
    (chips[1] as HTMLElement).click();
    expect(mockStore.selectWell).toHaveBeenCalledWith({
      epANum: 2,
      date: '2026-04-11',
    });
  });

  it('should show the next page button and call nextPage when clicked', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const nextBtn = compiled.querySelector('button[aria-label="Next wells"]') as HTMLElement;
    expect(nextBtn).toBeTruthy();
    nextBtn.click();
    expect(mockStore.nextPage).toHaveBeenCalled();
  });

  it('should show the previous page button when hasPrevPage is true', () => {
    mockStore.hasPrevPage.set(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const prevBtn = compiled.querySelector('button[aria-label="Previous wells"]');
    expect(prevBtn).toBeTruthy();
  });

  it('should display the correct page label', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const label = compiled.querySelector('.chip-strip__page-indicator');
    expect(label?.textContent).toBe('1 / 2');
  });

  it('should show loading bar when store is loading well details', () => {
    mockStore.isDetailsLoading.set(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    const loadingBar = compiled.querySelector('.well-loading-bar, mat-progress-bar');
    expect(loadingBar).toBeTruthy();
  });
});
