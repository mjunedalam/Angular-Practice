import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { RouterTestingModule } from '@angular/router/testing';
import { LoaderService } from '@shared/components/global-loader/loader.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

const loaderServiceMock = {
  isLoading: jest.fn(() => false),
  isLoginLoading: jest.fn(() => false),
  progress: jest.fn(() => 0),
  message: jest.fn(() => ''),
};

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;

  beforeEach(async () => {
    jest.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule, NoopAnimationsModule],
      providers: [
        { provide: LoaderService, useValue: loaderServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });
});
