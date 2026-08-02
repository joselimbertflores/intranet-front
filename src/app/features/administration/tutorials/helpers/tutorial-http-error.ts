import { HttpErrorResponse } from '@angular/common/http';

export function tutorialHttpErrorMessage(
  error: unknown,
  fallback: string,
): string {
  if (!(error instanceof HttpErrorResponse)) return fallback;

  const response = error.error as
    | { message?: string | string[]; error?: string }
    | string
    | null;

  if (typeof response === 'string' && response.trim()) return response;
  if (!response || typeof response !== 'object') return fallback;
  if (Array.isArray(response.message)) return response.message.join(' ');
  if (typeof response.message === 'string' && response.message.trim()) {
    return response.message;
  }
  if (typeof response.error === 'string' && response.error.trim()) {
    return response.error;
  }
  return fallback;
}
