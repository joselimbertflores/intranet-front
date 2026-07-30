import { inject, Injectable } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpClient, HttpParams } from '@angular/common/http';

import { Observable, of, switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { FileUploadService, UploadResult } from '../../../../shared';
import {
  CommunicationResponse,
  CommunicationTypeResponse,
} from '../interfaces';

interface GetCommunicationsParams {
  term?: string;
  limit: number;
  offset: number;
}

export interface SaveCommunicationDto {
  reference: string;
  code: string;
  isActive: boolean;
  typeId: number;
}

@Injectable({
  providedIn: 'root',
})
export class CommunicationAdminDataSource {
  private fileUploadService = inject(FileUploadService);
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/api/communications`;

  types = toSignal(this.getTypes(), { initialValue: [] });

  findAll({ term, ...props }: GetCommunicationsParams) {
    const params = new HttpParams({
      fromObject: { ...props, ...(term && { term }) },
    });
    return this.http.get<{
      communications: CommunicationResponse[];
      total: number;
    }>(this.URL, {
      params,
    });
  }

  create(data: SaveCommunicationDto, pdf: File) {
    return this.fileUploadService.upload(pdf, 'communications').pipe(
      switchMap(({ id: fileId }) =>
        this.http.post<CommunicationResponse>(`${this.URL}`, {
          ...data,
          fileId,
        }),
      ),
    );
  }

  update(id: string, data: SaveCommunicationDto, file: File | null) {
    const fileUploadObservable: Observable<null | UploadResult> = file
      ? this.fileUploadService.upload(file, 'communications')
      : of(null);
    return fileUploadObservable.pipe(
      switchMap((uploadResult) =>
        this.http.patch<CommunicationResponse>(`${this.URL}/${id}`, {
          ...data,
          ...(uploadResult && { fileId: uploadResult.id }),
        }),
      ),
    );
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.URL}/${id}`);
  }

  private getTypes() {
    return this.http.get<CommunicationTypeResponse[]>(`${this.URL}/types`);
  }
}
