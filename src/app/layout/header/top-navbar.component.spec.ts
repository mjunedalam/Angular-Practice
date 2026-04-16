import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

import { TopNavbarComponent } from './top-navbar.component';
import { AuthStore } from 'src/app/features/auth/store/auth.store';

describe('TopNavbarComponent', () => {
  let component: TopNavbarComponent;
  let fixture: ComponentFixture<TopNavbarComponent>;
  const authStoreMock = {
    displayUsername: jest.fn(() => 'jane.doe'),
    logout: jest.fn(),
  };
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopNavbarComponent, NoopAnimationsModule],
      providers: [
        { provide: AuthStore, useValue: authStoreMock },
      ],
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopNavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the logged in username', () => {
    const username = fixture.nativeElement.querySelector('.top-navbar__user-name');
    expect(username?.textContent?.trim()).toBe('jane.doe');
  });

  it('should call logout from the dropdown menu', () => {
    const trigger: HTMLButtonElement = fixture.nativeElement.querySelector('.top-navbar__menu-trigger');
    trigger.click();
    fixture.detectChanges();

    const logoutButton: HTMLButtonElement | null = fixture.nativeElement.querySelector('.top-navbar__logout-btn');
    expect(logoutButton).toBeTruthy();
    logoutButton!.click();

    expect(authStoreMock.logout).toHaveBeenCalledTimes(1);
  });
});
