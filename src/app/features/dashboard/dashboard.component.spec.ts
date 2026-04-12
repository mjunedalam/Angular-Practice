import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { DashboardComponent } from './dashboard.component';
import { AuthStore } from 'src/app/core/store/auth/auth.store';
import { ThemeStore } from 'src/app/core/store/theme/theme.store';

describe('DashboardComponent', () => {
  let component: DashboardComponent;
  let fixture: ComponentFixture<DashboardComponent>;
  const routerEvents$ = new Subject<unknown>();
  const routerMock = {
    events: routerEvents$,
    navigate: jest.fn(),
  };
  const authStoreMock = {
    displayUsername: jest.fn(() => 'jane.doe'),
    logout: jest.fn(),
  };
  const themeStoreMock = {
    toggle: jest.fn(),
    isDark: jest.fn(() => true),
    isLight: jest.fn(() => false),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthStore, useValue: authStoreMock },
        { provide: ThemeStore, useValue: themeStoreMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
