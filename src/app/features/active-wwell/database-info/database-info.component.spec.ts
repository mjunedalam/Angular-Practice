import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatabaseInfoComponent } from './database-info.component';
import { WellStore } from '@store/active-wwell/active-wwell.store';
import { createMockWellStore } from '../testing/mock-well-store';

describe('DatabaseInfoComponent', () => {
  let component: DatabaseInfoComponent;
  let fixture: ComponentFixture<DatabaseInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatabaseInfoComponent],
      providers: [
        { provide: WellStore, useValue: createMockWellStore() },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DatabaseInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
