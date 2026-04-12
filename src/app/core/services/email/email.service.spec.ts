import { TestBed } from '@angular/core/testing';

import { EmailService } from './email.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';

describe('EmailService', () => {
  let service: EmailService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        EmailService,
        {
          provide: ExternalConfigService,
          useValue: {
            settings: {
              emailServiceUrl: 'https://example.test',
            },
          },
        },
      ]
    });
    service = TestBed.inject(EmailService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
