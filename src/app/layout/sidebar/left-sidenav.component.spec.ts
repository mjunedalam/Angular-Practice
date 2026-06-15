import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeftSidenavComponent } from './left-sidenav.component';
import { AuthStore } from '../../features/auth/store/auth.store';
import { RbacStore } from '@store/rbac/rbac.store';

describe('LeftSidenavComponent', () => {
  let component: LeftSidenavComponent;
  let fixture: ComponentFixture<LeftSidenavComponent>;
  const authStoreMock = {
    user: jest.fn(() => ({ groups: ['GWD_admin'] })),
  };
  const rbacStoreMock = {
    canAccessRoute: jest.fn(() => true),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LeftSidenavComponent],
      providers: [
        { provide: AuthStore, useValue: authStoreMock },
        { provide: RbacStore, useValue: rbacStoreMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(LeftSidenavComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
