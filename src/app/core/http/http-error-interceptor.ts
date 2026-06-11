import {
  HttpErrorResponse,
  type HttpInterceptorFn,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService, ToastMessageOptions } from 'primeng/api';
import { catchError, throwError } from 'rxjs';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error) => {
      if (!(error instanceof HttpErrorResponse)) {
        return throwError(() => error);
      }

      const detail = getErrorMessage(error);

      const messageConfig: ToastMessageOptions = (() => {
        switch (error.status) {
          case 0:
            return {
              severity: 'error',
              summary: 'Sin conexión',
              detail: 'No se pudo conectar con el servidor.',
            };

          case 400:
            return {
              severity: 'warn',
              summary: 'Solicitud incorrecta',
              detail,
            };

          case 401:
            return {
              severity: 'warn',
              summary: 'Sesión no válida',
              detail: 'Debe iniciar sesión nuevamente.',
            };

          case 403:
            return {
              severity: 'warn',
              summary: 'Acceso denegado',
              detail: 'No tiene los permisos requeridos.',
            };

          case 404:
            return {
              severity: 'warn',
              summary: 'No encontrado',
              detail: 'El recurso solicitado no existe.',
            };

          case 409:
            return {
              severity: 'warn',
              summary: 'Conflicto',
              detail,
            };

          case 422:
            return {
              severity: 'warn',
              summary: 'Datos inválidos',
              detail,
            };

          case 500:
            return {
              severity: 'error',
              summary: 'Error interno',
              detail: 'No se pudo procesar la solicitud.',
            };

          default:
            return {
              severity: 'error',
              summary: 'Error inesperado',
              detail: detail || 'Ocurrió un error al procesar la solicitud.',
            };
        }
      })();

      messageService.add({
        ...messageConfig,
        life: 3000,
      });

      return throwError(() => error);
    }),
  );
};

function getErrorMessage(error: HttpErrorResponse): string {
  const responseError = error.error;

  if (!responseError) {
    return 'Ocurrió un error al procesar la solicitud.';
  }

  if (typeof responseError === 'string') {
    return responseError;
  }

  if (Array.isArray(responseError.message)) {
    return responseError.message.join('\n');
  }

  if (typeof responseError.message === 'string') {
    return responseError.message;
  }

  if (typeof responseError.error === 'string') {
    return responseError.error;
  }

  return 'Ocurrió un error al procesar la solicitud.';
}
