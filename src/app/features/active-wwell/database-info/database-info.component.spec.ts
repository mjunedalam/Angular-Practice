import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DatabaseInfoComponent } from './database-info.component';

describe('DatabaseInfoComponent', () => {
  let component: DatabaseInfoComponent;
  let fixture: ComponentFixture<DatabaseInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DatabaseInfoComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(DatabaseInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
