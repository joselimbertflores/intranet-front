import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';

import { switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { FormCalendarProps } from '../../calendar/interfaces';
import { CommunicationManageResponse } from '../interfaces';
import { FileUploadService } from '../../../../shared';

interface GetCommunicationsParams {
  term?: string;
  limit: number;
  offset: number;
}

export interface CreateCommunicationProps {
  reference: string;
  code: string;
  typeId: number;
  calendarEvent?: FormCalendarProps;
}

@Injectable({
  providedIn: 'root',
})
export class CommunicationManageDataSource {
  private fileUploadService = inject(FileUploadService);
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/communications`;

  types = toSignal(this.getTypes(), { initialValue: [] });

  constructor() {}

  findAll({ term, ...props }: GetCommunicationsParams) {
    const params = new HttpParams({
      fromObject: { ...props, ...(term && { term }) },
    });
    return this.http.get<{
      communications: CommunicationManageResponse[];
      total: number;
    }>(this.URL, {
      params,
    });
  }

  create(form: CreateCommunicationProps, pdf: File) {
    const { calendarEvent, ...props } = form;
    return this.fileUploadService.uploadPdfThumbnail(pdf, 'communication').pipe(
      switchMap(({ fileName, originalName, previewFileName }) =>
        this.http.post(`${this.URL}`, {
          ...props,
          fileName,
          originalName,
          previewFileName,
          calendarEvent: this.buildCalendarEventDto(calendarEvent),
        }),
      ),
    );
  }

  update(
    id: string,
    form: Partial<CreateCommunicationProps>,
    file: File | null,
  ) {
    const { calendarEvent, ...props } = form;
    return file
      ? this.fileUploadService.uploadPdfThumbnail(file, 'communication').pipe(
          switchMap(({ fileName, previewFileName, originalName }) =>
            this.http.patch(`${this.URL}/${id}`, {
              ...props,
              fileName,
              originalName,
              previewFileName,
              calendarEvent: this.buildCalendarEventDto(calendarEvent),
            }),
          ),
        )
      : this.http.patch<CommunicationManageResponse>(`${this.URL}/${id}`, {
          ...props,
          calendarEvent: this.buildCalendarEventDto(calendarEvent),
        });
  }

  getTypes() {
    return this.http.get<any[]>(`${this.URL}/types`);
  }

  private buildCalendarEventDto(data: FormCalendarProps | undefined) {
    if (!data) return null;
    const { recurrence, ...props } = data;
    return {
      ...props,
      recurrence: recurrence?.frequency ? recurrence : null,
    };
  }
}
