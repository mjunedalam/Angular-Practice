import { TestBed } from '@angular/core/testing';

import { LoaderService } from '@shared/components/global-loader/loader.service';

describe('LoaderService', () => {
  let service: LoaderService;
  let completeBootLoader: jest.Mock;
  let setBootProgress: jest.Mock;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LoaderService);
    completeBootLoader = jest.fn();
    setBootProgress = jest.fn();
    window.__agwaBootLoader = {
      complete: completeBootLoader,
      setProgress: setBootProgress,
    };
  });

  afterEach(() => {
    delete window.__agwaBootLoader;
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('completes the boot loader as soon as the app shell is ready', () => {
    service.registerBootTask('arcgis-map');

    service.markAppShellReady();

    expect(setBootProgress).toHaveBeenNthCalledWith(1, 56);
    expect(setBootProgress).toHaveBeenNthCalledWith(2, 96);
    expect(setBootProgress).toHaveBeenNthCalledWith(3, 100);
    expect(completeBootLoader).toHaveBeenCalledTimes(1);
  });

  it('does not complete the boot loader before the app shell is ready', () => {
    service.registerBootTask('arcgis-map');

    service.resolveBootTask('arcgis-map');

    expect(setBootProgress).toHaveBeenNthCalledWith(1, 56);
    expect(setBootProgress).toHaveBeenNthCalledWith(2, 72);
    expect(completeBootLoader).not.toHaveBeenCalled();
  });
});
