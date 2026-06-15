import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
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

  it('should disable submit until both fields are filled', () => {
    const toggleButton: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-toggle');
    toggleButton.click();
    fixture.detectChanges();

    const loginForm = (component as unknown as { loginForm: LoginComponent['loginForm'] }).loginForm;
    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-submit');
    expect(submitButton.disabled).toBe(true);

    loginForm.controls.username.setValue('jane.doe');
    fixture.detectChanges();
    expect(submitButton.disabled).toBe(true);

    loginForm.controls.password.setValue('secret');
    fixture.detectChanges();
    expect(submitButton.disabled).toBe(false);
  });

  it('should call login when the form is valid', () => {
    const toggleButton: HTMLButtonElement = fixture.nativeElement.querySelector('.btn-toggle');
    toggleButton.click();
    fixture.detectChanges();

    const loginForm = (component as unknown as { loginForm: LoginComponent['loginForm'] }).loginForm;
    loginForm.setValue({ username: 'jane.doe', password: 'secret' });
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit');

    expect(authStoreMock.login).toHaveBeenCalledTimes(1);
  });
});
