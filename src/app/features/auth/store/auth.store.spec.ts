import { TestBed } from '@angular/core/testing';
import { AuthStore } from './auth.store';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JwtService } from 'src/app/core/services/jwt/jwt.service';
import { LoaderService } from '@shared/components/global-loader/loader.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { RbacStore } from '@store/rbac/rbac.store';

const jwtServiceMock = { decode: jest.fn(() => ({})), isExpired: jest.fn(() => false) };
const loaderServiceMock = { startLogin: jest.fn(), stop: jest.fn(), fail: jest.fn(), completeLogin: jest.fn(), isLoading: jest.fn(() => false), isLoginLoading: jest.fn(() => false), progress: jest.fn(() => 0), message: jest.fn(() => '') };
const externalConfigMock = { settings: { tokenUrl: '/api/token', portalUrl: '' } };
const rbacStoreMock = { setPermissions: jest.fn(), hasPermission: jest.fn(() => false) };

describe('AuthStore', () => {
  let store: InstanceType<typeof AuthStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
      providers: [
        AuthStore,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: LoaderService, useValue: loaderServiceMock },
        { provide: ExternalConfigService, useValue: externalConfigMock },
        { provide: RbacStore, useValue: rbacStoreMock },
      ],
    });
    store = TestBed.inject(AuthStore);
  });

  it('should not be authenticated initially', () => {
    expect(store.isAuthenticated()).toBe(false);
  });

  it('token should be null initially', () => {
    expect(store.token()).toBeNull();
  });

  it('isLoading should be false initially', () => {
    expect(store.isLoading()).toBe(false);
  });

  it('surfaces the backend\'s own message when login fails', () => {
    const httpMock = TestBed.inject(HttpTestingController);

    void store.login();

    const req = httpMock.expectOne(externalConfigMock.settings.tokenUrl);
    req.flush('{"message":"Invalid SSO ticket"}', {
      status: 401,
      statusText: 'Unauthorized',
    });

    expect(store.error()).toBe('Invalid SSO ticket');
    expect(loaderServiceMock.fail).toHaveBeenCalled();

    httpMock.verify();
  });

  it('surfaces a plain-text (non-JSON) backend body verbatim, e.g. an Oracle stored-proc error', () => {
    const httpMock = TestBed.inject(HttpTestingController);
    const oraError = 'ORA-20001: Your oracle account is LOCKED. Please use identityiq to fix the account issue.\n'
      + 'ORA-06512: at "ESURS.ESURS_TOKEN_PKG", line 57\n'
      + 'ORA-06512: at line 1';

    void store.login();

    const req = httpMock.expectOne(externalConfigMock.settings.tokenUrl);
    req.flush(oraError, { status: 403, statusText: 'Forbidden' });

    expect(store.error()).toBe(oraError);

    httpMock.verify();
  });

  it('falls back to the transport-level description when the backend body is empty', () => {
    const httpMock = TestBed.inject(HttpTestingController);

    void store.login();

    const req = httpMock.expectOne(externalConfigMock.settings.tokenUrl);
    req.flush('', { status: 500, statusText: 'Server Error' });

    expect(store.error()).toContain('500');

    httpMock.verify();
  });
});
