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
      if (error instanceof HttpErrorResponse) {
        let messageConfig: ToastMessageOptions = {};
        switch (error.status) {
          case 400:
            messageConfig = {
              severity: 'warn',
              summary: 'Solictud incorrecta',
              detail:
                typeof error.error['message'] === 'string'
                  ? error.error['message']
                  : 'No se pudo realizar la solicitud.',
            };
            break;
          case 500:
            messageConfig = {
              severity: 'error',
              summary: 'Ha ocurrido un error interno',
              detail: 'No se pudo procesar la solicitud.',
            };
            break;

          case 403:
            messageConfig = {
              severity: 'info',
              summary: 'Acceso denegado',
              detail: 'No tiene los permisos requeridos.',
            };
            break;

          default:
            break;
        }
        messageService.add({ ...messageConfig, life: 3000 });
      }
      return throwError(() => error);
    })
  );
};
