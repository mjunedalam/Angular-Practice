import { TestBed } from '@angular/core/testing';
import { AuthStore } from './auth.store';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { JwtService } from 'src/app/core/services/jwt/jwt.service';
import { LoaderService } from '@shared/components/global-loader/loader.service';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { RbacStore } from '@store/rbac/rbac.store';

const jwtServiceMock = { decode: jest.fn(() => ({})), isExpired: jest.fn(() => false) };
const loaderServiceMock = { startLogin: jest.fn(), stop: jest.fn(), isLoading: jest.fn(() => false), isLoginLoading: jest.fn(() => false), progress: jest.fn(() => 0), message: jest.fn(() => '') };
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
});
