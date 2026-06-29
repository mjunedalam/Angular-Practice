import { TestBed } from '@angular/core/testing';

import { EmailService } from '@services/email/email.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ExternalConfigService } from 'src/app/shared/services/external-config.service';
import { EMAIL_SUBJECT, EMAIL_TEMPLATE_NAME } from 'src/app/shared/models/config/email.config';

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

  it('builds an email request addressed to the current user email', () => {
    const request = service.buildEmailRequest([], 'map-image-data', 'junedalam@aramco.com', undefined, '2024-01-15');

    expect(request).toEqual({
      subject: EMAIL_SUBJECT,
      from: 'junedalam@aramco.com',
      to: ['junedalam@aramco.com'],
      cc: ['junedalam@aramco.com'],
      bcc: ['junedalam@aramco.com'],
      replyTo: '',
      templateName: EMAIL_TEMPLATE_NAME,
      generatePdf: false,
      templateData: {
        morningReport: [],
        mapImageData: 'map-image-data',
        waterWellTestResults: undefined,
        mrReportDate: 'Monday 15 January 2024',
      },
    });
  });
});
