import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { LoginComponent } from './login.component';
import { AuthStore } from 'src/app/features/auth/store/auth.store';
import { LoaderService } from '@shared/components/global-loader/loader.service';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  const authStoreMock = {
    login: jest.fn(),
    isLoading: jest.fn(() => false),
    error: jest.fn(() => null),
    isAuthenticated: jest.fn(() => false),
    isTokenExpired: jest.fn(() => false),
  };
  const routerMock = {
    navigate: jest.fn(),
  };
  const activatedRouteMock = {
    snapshot: {
      queryParamMap: {
        get: jest.fn(() => null),
      },
    },
  };
  const loaderServiceMock = {
    completeBoot: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        {
          provide: AuthStore,
          useValue: authStoreMock,
        },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: activatedRouteMock },
        { provide: LoaderService, useValue: loaderServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call login when the SSO button is clicked', () => {
    const ssoButton: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-sso');
    ssoButton.click();
    fixture.detectChanges();

    expect(authStoreMock.login).toHaveBeenCalledTimes(1);
  });
});
