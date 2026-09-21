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
    hasPermission: jest.fn(() => true),
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

  it('should keep the nav items in their original order', () => {
    const labels = Array.from<HTMLElement>(fixture.nativeElement.querySelectorAll('.sidenav__label'))
      .map((el) => el.textContent?.trim());

    expect(labels).toEqual([
      'Home',
      'Requests',
      'WLDA Approvals',
      'Land Affairs Approvals',
      'Integrated Requirements',
      'Active Water Well',
      'Report',
      'Presentation',
    ]);
  });

  it('should mark only the active route as the current page', () => {
    fixture.componentRef.setInput('activeRoute', 'requests');
    fixture.detectChanges();

    const active: HTMLElement[] = Array.from(fixture.nativeElement.querySelectorAll('.sidenav__btn--active'));

    expect(active).toHaveLength(1);
    expect(active[0].textContent).toContain('Requests');
    expect(active[0].getAttribute('aria-current')).toBe('page');
  });

  it('should render the highlight element the mono shell glides behind the active item', () => {
    expect(fixture.nativeElement.querySelector('.sidenav__hl')).toBeTruthy();
  });

  it('should measure the active item into the highlight variables and switch the glide on', () => {
    jest.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => {
      callback(0);
      return 0;
    });

    fixture.componentRef.setInput('activeRoute', 'requests');
    fixture.detectChanges();

    const list: HTMLElement = fixture.nativeElement.querySelector('.sidenav__list');
    expect(list.style.getPropertyValue('--hl-h')).toBe('0px'); // jsdom has no layout, so every measure is 0
    expect(fixture.nativeElement.querySelector('.sidenav')?.classList).toContain('sidenav--glide');
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });
});
