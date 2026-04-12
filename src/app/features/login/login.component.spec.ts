import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';

import { LoginComponent } from './login.component';
import { AuthStore } from 'src/app/core/store/auth/auth.store';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  const authStoreMock = {
    login: jest.fn(),
    isLoading: jest.fn(() => false),
    error: jest.fn(() => null),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        {
          provide: AuthStore,
          useValue: authStoreMock,
        },
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
    const loginForm = (component as unknown as { loginForm: LoginComponent['loginForm'] }).loginForm;
    const submitButton: HTMLButtonElement = fixture.nativeElement.querySelector('.login__submit');
    expect(submitButton.disabled).toBe(true);

    loginForm.controls.username.setValue('jane.doe');
    fixture.detectChanges();
    expect(submitButton.disabled).toBe(true);

    loginForm.controls.password.setValue('secret');
    fixture.detectChanges();
    expect(submitButton.disabled).toBe(false);
  });

  it('should call login when the form is valid', () => {
    const loginForm = (component as unknown as { loginForm: LoginComponent['loginForm'] }).loginForm;
    loginForm.setValue({ username: 'jane.doe', password: 'secret' });
    fixture.detectChanges();

    const form = fixture.debugElement.query(By.css('form'));
    form.triggerEventHandler('ngSubmit');

    expect(authStoreMock.login).toHaveBeenCalledWith({
      username: 'jane.doe',
      password: 'secret',
    });
  });
});
