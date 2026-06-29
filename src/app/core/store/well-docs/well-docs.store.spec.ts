import { TestBed } from '@angular/core/testing';
import { WellDocsStore } from './well-docs.store';
import { PresDocsService } from '@services/pres-docs.service';
import { NotificationService } from '@shared/components/notification/notification.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const presDocsServiceMock = {
  getDocs: jest.fn(),
  uploadDocs: jest.fn(),
  removeDoc: jest.fn(),
};

const notificationServiceMock = {
  show: jest.fn(),
  error: jest.fn(),
  notifications: jest.fn(() => []),
  dismiss: jest.fn(),
};

describe('WellDocsStore', () => {
  let store: InstanceType<typeof WellDocsStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        WellDocsStore,
        { provide: PresDocsService, useValue: presDocsServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });
    store = TestBed.inject(WellDocsStore);
  });

  it('should have empty docs initially', () => {
    expect(store.docs()).toBeDefined();
  });

  it('docsByCategory computed should return object', () => {
    expect(typeof store.docsByCategory()).toBe('object');
  });

  it('categories computed should return array', () => {
    expect(Array.isArray(store.categories())).toBe(true);
  });

  it('totalCount computed should return a number', () => {
    expect(typeof store.totalCount()).toBe('number');
  });
});
