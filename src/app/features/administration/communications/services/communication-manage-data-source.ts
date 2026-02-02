import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, switchMap, tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { FileUploadService } from '../../../../shared';

interface GetCommunicationsParams {
  term?: string;
  limit: number;
  offset: number;
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

  getTypes() {
    return this.http.get<any[]>(`${this.URL}/types`);
  }

  create(form: object, pdf: File) {
    return this.fileUploadService.uploadPdfThumbnail(pdf, 'communication').pipe(
      tap((resp) => console.log(resp)),
      switchMap(({ fileName, originalName, thumbnailFileName }) =>
        this.http.post(`${this.URL}`, {
          ...form,
          fileName,
          thumbnailFileName,
          originalName,
        }),
      ),
    );
  }

  update(id: string, form: object, file?: File | null): Observable<any> {
    return file
      ? this.fileUploadService.uploadPdfThumbnail(file, 'communication').pipe(
          switchMap(({ fileName, thumbnailFileName, originalName }) =>
            this.http.patch(`${this.URL}/${id}`, {
              ...form,
              fileName,
              thumbnailFileName,
              originalName,
            }),
          ),
        )
      : this.http.patch(`${this.URL}/${id}`, form);
  }

  findAll({ term, ...props }: GetCommunicationsParams) {
    const params = new HttpParams({
      fromObject: { ...props, ...(term && { term }) },
    });
    return this.http.get<{ communications: any[]; total: number }>(this.URL, {
      params,
    });
  }
}
