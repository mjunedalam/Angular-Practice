import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { HasPermissionDirective } from './has-permission.directive';
import { RbacStore } from '@store/rbac/rbac.store';

@Component({
  standalone: true,
  imports: [HasPermissionDirective],
  template: `<span *appHasPermission="'active-wwell'">visible</span>`,
})
class TestHostComponent {}

function createFixture(hasPermission: boolean): ComponentFixture<TestHostComponent> {
  const rbacStoreMock = {
    hasPermission: jest.fn(() => hasPermission),
    isLoaded: jest.fn(() => true),
  };

  TestBed.configureTestingModule({
    imports: [TestHostComponent],
    providers: [{ provide: RbacStore, useValue: rbacStoreMock }],
  });

  const fixture = TestBed.createComponent(TestHostComponent);
  fixture.detectChanges();
  return fixture;
}

describe('HasPermissionDirective', () => {
  afterEach(() => TestBed.resetTestingModule());

  it('renders element when permission is granted', () => {
    const fixture = createFixture(true);
    const span = fixture.debugElement.query(By.css('span'));
    expect(span).toBeTruthy();
    expect(span.nativeElement.textContent.trim()).toBe('visible');
    fixture.destroy();
  });

  it('hides element when permission is denied', () => {
    const fixture = createFixture(false);
    const span = fixture.debugElement.query(By.css('span'));
    expect(span).toBeNull();
    fixture.destroy();
  });
});
