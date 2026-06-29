import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OperationSummaryComponent } from './operation-summary.component';
import { ActiveWwellStore } from '../store/active-wwell.store';
import { ActiveWwellUiStore } from '../active-wwell-ui.store';
import { RbacStore } from '@store/rbac/rbac.store';
import { ActiveWwellFormService } from '../active-wwell-form.service';
import { ReactiveFormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

const activeWwellStoreMock = {
  operationSummary: jest.fn(() => null),
};

function createFixture(hasPermission: boolean): ComponentFixture<OperationSummaryComponent> {
  const rbacStoreMock = {
    hasPermission: jest.fn(() => hasPermission),
    isLoaded: jest.fn(() => true),
  };
  TestBed.configureTestingModule({
    imports: [OperationSummaryComponent, ReactiveFormsModule, HttpClientTestingModule],
    providers: [
      { provide: ActiveWwellStore, useValue: activeWwellStoreMock },
      { provide: RbacStore, useValue: rbacStoreMock },
      ActiveWwellUiStore,
      ActiveWwellFormService,
    ],
  });
  const fixture = TestBed.createComponent(OperationSummaryComponent);
  fixture.detectChanges();
  return fixture;
}

describe('OperationSummaryComponent', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('should create', () => {
    const fixture = createFixture(false);
    expect(fixture.componentInstance).toBeTruthy();
    fixture.destroy();
  });

  it('canUpdate is false when rbac denies permission', () => {
    const fixture = createFixture(false);
    expect((fixture.componentInstance as unknown as { canUpdate: () => boolean }).canUpdate()).toBe(false);
    fixture.destroy();
  });

  it('canUpdate is true when rbac grants permission', () => {
    const fixture = createFixture(true);
    expect((fixture.componentInstance as unknown as { canUpdate: () => boolean }).canUpdate()).toBe(true);
    fixture.destroy();
  });
});
