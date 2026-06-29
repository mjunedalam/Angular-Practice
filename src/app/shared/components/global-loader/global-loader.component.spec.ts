import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlobalLoaderComponent } from './global-loader.component';
import { LoaderService } from './loader.service';

describe('GlobalLoaderComponent', () => {
  let component: GlobalLoaderComponent;
  let fixture: ComponentFixture<GlobalLoaderComponent>;

  const loaderServiceMock = {
    isLoading: jest.fn(() => false),
    isLoginLoading: jest.fn(() => false),
    progress: jest.fn(() => 0),
    message: jest.fn(() => ''),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlobalLoaderComponent],
      providers: [{ provide: LoaderService, useValue: loaderServiceMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(GlobalLoaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => fixture.destroy());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('barGradient returns a linear-gradient string', () => {
    loaderServiceMock.progress.mockReturnValue(50);
    fixture.detectChanges();
    const gradient = (component as unknown as { barGradient: () => string }).barGradient();
    expect(gradient).toContain('linear-gradient');
  });
});
