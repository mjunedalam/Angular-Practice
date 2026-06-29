import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';

import { HomeComponent } from './home.component';
import { AuthStore } from '../auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  const routerMock = {
    navigate: jest.fn(),
  };
  const authStoreMock = {
    user: jest.fn(() => ({ groups: ['GWD_admin'] })),
  };
  const rbacStoreMock = {
    hasPermission: jest.fn(() => true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [HomeComponent],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: AuthStore, useValue: authStoreMock },
        { provide: RbacStore, useValue: rbacStoreMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
