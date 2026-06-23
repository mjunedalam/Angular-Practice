import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { RbacStore } from './rbac.store';

// In production this is prefixed with dailyOperationServiceUrl from external-config.json.
// Tests pass the full URL directly to loadPermissions, so any string works here.
const PERMISSIONS_URL = 'http://localhost:8080/daily-operations/api/v1/rbac/permissions';

// ─── Mock API responses (what the backend returns for each JWT scenario) ─────
//
// Each constant below corresponds to a MOCK_TOKENS scenario in
// src/testing/mock-tokens.ts — the backend reads the JWT groups claim and
// merges permissions server-side before returning this shape.

/** GWD_admin only — full access */
const ADMIN_ONLY_PERMISSIONS = {
  'home':           ['read'],
  'morning-report': ['read', 'email'],
  'presentations':  ['read'],
  'active-wwell':   ['read', 'update', 'delete'],
};

/** GWD_member or GWD_client only — read everywhere, nothing else */
const READ_ONLY_PERMISSIONS = {
  'home':           ['read'],
  'morning-report': ['read'],
  'presentations':  ['read'],
  'active-wwell':   ['read'],
};

/** GWD_member + GWD_admin — admin actions are unioned in */
const MEMBER_AND_ADMIN_PERMISSIONS = {
  'home':           ['read'],
  'morning-report': ['read', 'email'],
  'presentations':  ['read'],
  'active-wwell':   ['read', 'update', 'delete'],
};

/** GWD_member + unknown role — unknown role is ignored, member perms remain */
const MIXED_KNOWN_AND_UNKNOWN_PERMISSIONS = READ_ONLY_PERMISSIONS;

/** UNKNOWN_ROLE / NO_GROUPS — backend finds no matching roles, returns {} */
const EMPTY_PERMISSIONS = {};

function successResponse(data: Record<string, string[]>) {
  return { statusCode: 200, error: false, message: 'Success', data };
}

describe('RbacStore', () => {
  let store: InstanceType<typeof RbacStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    store    = TestBed.inject(RbacStore);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  // ─── helpers ─────────────────────────────────────────────────────────────

  async function loadWith(data: Record<string, string[]>) {
    const p = store.loadPermissions(PERMISSIONS_URL);
    httpMock.expectOne(PERMISSIONS_URL).flush(successResponse(data));
    await p;
  }

  // ─── initial state ────────────────────────────────────────────────────────

  it('starts with empty permissions and isLoaded=false', () => {
    expect(store.isLoaded()).toBe(false);
    expect(store.userPermissions()).toEqual({});
    expect(store.error()).toBeNull();
  });

  it('returns false for any permission before the endpoint responds', () => {
    expect(store.hasPermission('active-wwell', 'read')).toBe(false);
    expect(store.hasPermission('home', 'read')).toBe(false);
  });

  // ─── loadPermissions — HTTP success ──────────────────────────────────────

  describe('loadPermissions — HTTP success', () => {
    it('stores permissions and sets isLoaded=true', async () => {
      await loadWith(ADMIN_ONLY_PERMISSIONS);
      expect(store.isLoaded()).toBe(true);
      expect(store.userPermissions()).toEqual(ADMIN_ONLY_PERMISSIONS);
      expect(store.error()).toBeNull();
    });

    it('clears a previous error on successful reload', async () => {
      const p = store.loadPermissions(PERMISSIONS_URL);
      httpMock.expectOne(PERMISSIONS_URL).flush(null, { status: 500, statusText: 'Error' });
      await p;
      expect(store.error()).not.toBeNull();

      await loadWith(ADMIN_ONLY_PERMISSIONS);
      expect(store.error()).toBeNull();
    });
  });

  // ─── loadPermissions — HTTP failure ──────────────────────────────────────

  describe('loadPermissions — HTTP failure', () => {
    it('sets error and keeps permissions empty on network error', async () => {
      const p = store.loadPermissions(PERMISSIONS_URL);
      httpMock.expectOne(PERMISSIONS_URL).flush(null, { status: 401, statusText: 'Unauthorized' });
      await p;

      expect(store.isLoaded()).toBe(true);
      expect(store.userPermissions()).toEqual({});
      expect(store.error()).not.toBeNull();
    });

    it('sets error message when backend returns error:true', async () => {
      const p = store.loadPermissions(PERMISSIONS_URL);
      httpMock.expectOne(PERMISSIONS_URL).flush({
        statusCode: 403,
        error: true,
        message: 'Access denied',
        data: null,
      });
      await p;

      expect(store.isLoaded()).toBe(true);
      expect(store.userPermissions()).toEqual({});
      expect(store.error()).toBe('Access denied');
    });
  });

  // ─── JWT scenario: ADMIN_ONLY ─────────────────────────────────────────────

  describe('JWT: GWD_admin only', () => {
    beforeEach(async () => loadWith(ADMIN_ONLY_PERMISSIONS));

    it('can read all routes', () => {
      expect(store.hasPermission('home',           'read')).toBe(true);
      expect(store.hasPermission('morning-report', 'read')).toBe(true);
      expect(store.hasPermission('presentations',  'read')).toBe(true);
      expect(store.hasPermission('active-wwell',   'read')).toBe(true);
    });

    it('can update and delete active-wwell', () => {
      expect(store.hasPermission('active-wwell', 'update')).toBe(true);
      expect(store.hasPermission('active-wwell', 'delete')).toBe(true);
    });

    it('can send email from morning-report', () => {
      expect(store.hasPermission('morning-report', 'email')).toBe(true);
    });

    it('cannot email active-wwell', () => {
      expect(store.hasPermission('active-wwell', 'email')).toBe(false);
    });

    it('cannot update morning-report', () => {
      expect(store.hasPermission('morning-report', 'update')).toBe(false);
    });
  });

  // ─── JWT scenario: MEMBER_ONLY / CLIENT_ONLY ──────────────────────────────

  describe('JWT: GWD_member or GWD_client (read-only)', () => {
    beforeEach(async () => loadWith(READ_ONLY_PERMISSIONS));

    it('can read all routes', () => {
      expect(store.hasPermission('active-wwell',   'read')).toBe(true);
      expect(store.hasPermission('morning-report', 'read')).toBe(true);
      expect(store.hasPermission('home',           'read')).toBe(true);
      expect(store.hasPermission('presentations',  'read')).toBe(true);
    });

    it('cannot update or delete active-wwell', () => {
      expect(store.hasPermission('active-wwell', 'update')).toBe(false);
      expect(store.hasPermission('active-wwell', 'delete')).toBe(false);
    });

    it('cannot send email from morning-report', () => {
      expect(store.hasPermission('morning-report', 'email')).toBe(false);
    });
  });

  // ─── JWT scenario: MEMBER_AND_ADMIN ──────────────────────────────────────

  describe('JWT: GWD_member + GWD_admin (merged permissions)', () => {
    beforeEach(async () => loadWith(MEMBER_AND_ADMIN_PERMISSIONS));

    it('retains admin-level actions after union', () => {
      expect(store.hasPermission('active-wwell',   'update')).toBe(true);
      expect(store.hasPermission('active-wwell',   'delete')).toBe(true);
      expect(store.hasPermission('morning-report', 'email')).toBe(true);
    });

    it('can still read all routes', () => {
      expect(store.hasPermission('home',           'read')).toBe(true);
      expect(store.hasPermission('morning-report', 'read')).toBe(true);
      expect(store.hasPermission('presentations',  'read')).toBe(true);
      expect(store.hasPermission('active-wwell',   'read')).toBe(true);
    });
  });

  // ─── JWT scenario: MIXED_KNOWN_AND_UNKNOWN ────────────────────────────────

  describe('JWT: known role + unknown role', () => {
    beforeEach(async () => loadWith(MIXED_KNOWN_AND_UNKNOWN_PERMISSIONS));

    it('applies only the known role permissions', () => {
      expect(store.hasPermission('home', 'read')).toBe(true);
    });

    it('does not grant elevated access from the unknown role', () => {
      expect(store.hasPermission('active-wwell', 'update')).toBe(false);
      expect(store.hasPermission('morning-report', 'email')).toBe(false);
    });
  });

  // ─── JWT scenario: UNKNOWN_ROLE / NO_GROUPS ───────────────────────────────

  describe('JWT: unknown roles or no groups', () => {
    beforeEach(async () => loadWith(EMPTY_PERMISSIONS));

    it('grants no permissions when backend returns empty map', () => {
      expect(store.hasPermission('home',           'read')).toBe(false);
      expect(store.hasPermission('active-wwell',   'read')).toBe(false);
      expect(store.hasPermission('morning-report', 'email')).toBe(false);
    });

    it('sets isLoaded=true even with zero permissions', () => {
      expect(store.isLoaded()).toBe(true);
    });
  });

  // ─── hasPermission — edge cases ───────────────────────────────────────────

  describe('hasPermission — edge cases', () => {
    beforeEach(async () => loadWith(ADMIN_ONLY_PERMISSIONS));

    it('returns false for empty string routeId', () => {
      expect(store.hasPermission('', 'read')).toBe(false);
    });

    it('returns false for unknown action on a known route', () => {
      expect(store.hasPermission('home', 'delete')).toBe(false);
    });

    it('returns false for unknown route', () => {
      expect(store.hasPermission('non-existent', 'read')).toBe(false);
    });
  });
});
