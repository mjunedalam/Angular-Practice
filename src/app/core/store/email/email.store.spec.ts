import { TestBed } from '@angular/core/testing';
import { EmailStore } from './email.store';
import { EmailService } from '@services/email/email.service';
import { of } from 'rxjs';

const emailServiceMock = {
  sendEmail: jest.fn(() => of(200)),
};

describe('EmailStore', () => {
  let store: InstanceType<typeof EmailStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        EmailStore,
        { provide: EmailService, useValue: emailServiceMock },
      ],
    });
    store = TestBed.inject(EmailStore);
  });

  it('should have idle status initially', () => {
    expect(store.status()).toBe('idle');
    expect(store.error()).toBeNull();
  });

  it('isIdle should be true initially', () => {
    expect(store.isIdle()).toBe(true);
    expect(store.isSending()).toBe(false);
    expect(store.isSent()).toBe(false);
    expect(store.hasFailed()).toBe(false);
  });
});
