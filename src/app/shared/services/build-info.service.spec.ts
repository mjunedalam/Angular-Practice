import { TestBed } from '@angular/core/testing';
import { BuildInfoService } from './build-info.service';

describe('BuildInfoService', () => {
  let service: BuildInfoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [BuildInfoService] });
    service = TestBed.inject(BuildInfoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('info should have a commitHash', () => {
    expect(typeof service.info.commitHash).toBe('string');
  });

  it('shortHash should be at most 7 characters', () => {
    expect(service.shortHash.length).toBeLessThanOrEqual(7);
  });
});
