import { inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { computed } from '@angular/core';
import { EmailRequest } from 'src/app/shared/models/email/email-request.model';
import { EmailService } from '@services/email/email.service';

interface EmailState {
  status: 'idle' | 'sending' | 'sent' | 'failed';
  error: string | null;
}

const initialState: EmailState = {
  status: 'idle',
  error: null
};

export const EmailStore = signalStore(
  withState(initialState),
  withComputed((store) => ({
    isSending: computed(() => store.status() === 'sending'),
    isSent: computed(() => store.status() === 'sent'),
    hasFailed: computed(() => store.status() === 'failed'),
    isIdle: computed(() => store.status() === 'idle'),
  })),
  withMethods((store, emailService = inject(EmailService)) => ({
    sendEmail(request: EmailRequest) {
      patchState(store, { status: 'sending', error: null });
      emailService.sendEmail(request).
        subscribe({
          next: (statusCode) => {
            if (statusCode === 200) {
              patchState(store, { status: 'sent' });
            } else {
              patchState(store, { status: 'failed', error: 'Unexpected response from server' });
            }
          },
          error: () => {
            patchState(store, { status: 'failed', error: 'Failed to send email' });
          }
        });
    }
  }))
);
