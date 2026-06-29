import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  let service: NotificationService;

  beforeEach(() => {
    jest.useFakeTimers();
    service = new NotificationService();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts with no notifications', () => {
    expect(service.notifications()).toHaveLength(0);
  });

  it('show() adds a notification', () => {
    service.show('Hello', 'info');
    expect(service.notifications()).toHaveLength(1);
    expect(service.notifications()[0].message).toBe('Hello');
    expect(service.notifications()[0].type).toBe('info');
  });

  it('dismiss() removes notification by id', () => {
    service.show('Test');
    const id = service.notifications()[0].id;
    service.dismiss(id);
    expect(service.notifications()).toHaveLength(0);
  });

  it('auto-dismisses after duration', () => {
    service.show('Auto dismiss', 'info', { durationMs: 2000 });
    expect(service.notifications()).toHaveLength(1);
    jest.advanceTimersByTime(2001);
    expect(service.notifications()).toHaveLength(0);
  });

  it('error() adds error notification', () => {
    service.error('Something broke');
    expect(service.notifications()[0].type).toBe('error');
  });

  it('setDefaultDuration enforces minimum of 1000', () => {
    service.setDefaultDuration(50);
    expect(service.defaultDurationMs()).toBe(1000);
  });
});
