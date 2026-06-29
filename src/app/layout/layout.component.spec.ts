import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';

import { LayoutComponent } from './layout.component';
import { AuthStore } from 'src/app/features/auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';

describe('LayoutComponent', () => {
  let component: LayoutComponent;
  let fixture: ComponentFixture<LayoutComponent>;
  const routerEvents$ = new Subject<unknown>();
  const routerMock = {
    url: '/main/home',
    events: routerEvents$,
    navigate: jest.fn(),
  };
  const authStoreMock = {
    user: jest.fn(() => ({ groups: ['GWD_admin'] })),
    userEmail: jest.fn(() => 'jane.doe@aramco.com'),
    lastLogin: jest.fn(() => null),
    displayUsername: jest.fn(() => 'jane.doe'),
    logout: jest.fn(),
  };
  const rbacStoreMock = {
    roleDefinitions: jest.fn(() => []),
    hasPermission: jest.fn(() => true),
  };
  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LayoutComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthStore, useValue: authStoreMock },
        { provide: RbacStore, useValue: rbacStoreMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
