import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, of, switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { FileUploadService, UploadResult } from '../../../../shared';
import { CommunicationAdminResponse } from '../interfaces';

interface GetCommunicationsParams {
  term?: string;
  limit: number;
  offset: number;
}

@Injectable({
  providedIn: 'root',
})
export class CommunicationAdminDataSource {
  private fileUploadService = inject(FileUploadService);
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/communications`;

  types = toSignal(this.getTypes(), { initialValue: [] });

  findAll({ term, ...props }: GetCommunicationsParams) {
    const params = new HttpParams({
      fromObject: { ...props, ...(term && { term }) },
    });
    return this.http.get<{
      communications: CommunicationAdminResponse[];
      total: number;
    }>(this.URL, {
      params,
    });
  }

  create(data: object, pdf: File) {
    return this.fileUploadService
      .uploadPdfForGeneratePreview(pdf, 'communication')
      .pipe(
        switchMap(({ fileId }) =>
          this.http.post(`${this.URL}`, {
            ...data,
            fileId,
          }),
        ),
      );
  }

  update(id: string, data: object, file: File | null) {
    const fileUploadObserbable: Observable<null | UploadResult> = file
      ? this.fileUploadService.uploadPdfForGeneratePreview(
          file,
          'communication',
        )
      : of(null);
    return fileUploadObserbable.pipe(
      switchMap((result) =>
        this.http.patch(`${this.URL}/${id}`, {
          ...data,
          ...(result && { fileId: result.fileId }),
        }),
      ),
    );
  }

  private getTypes() {
    return this.http.get<any[]>(`${this.URL}/types`);
  }
}
