import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable, of, switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { FileUploadService, UploadResult } from '../../../../shared';
import {
  DocumentTypeWithSubTypesResponse,
  SectionTreeNodeResponse,
  DocumentResponse,
  DocumentValidityStatus,
} from '../interfaces';

export interface CreateDocumentBatchItemDto {
  fileId: string;
  title: string;
}

export interface CreateDocumentBatchDto {
  organizationalUnitId?: string | null;
  documentTypeId: number;
  documentSubtypeId?: number;
  year?: number;
  validityStatus: DocumentValidityStatus;
  documents: CreateDocumentBatchItemDto[];
}

interface UpdateDocumentDto {
  organizationalUnitId?: string | null;
  documentTypeId?: number | null;
  documentSubtypeId?: number | null;
  year?: number | null;
  status?: string | null;
  validityStatus?: DocumentValidityStatus;
  file?: File | null;
  title?: string | null;
}

interface GetDocumentsParams {
  limit?: number | null;
  offset?: number | null;
  term?: string | null;
  organizationalUnitId?: string | null;
  documentTypeId?: number | null;
  documentSubtypeId?: number | null;
  year?: number | null;
  status?: string | null;
  validityStatus?: DocumentValidityStatus | null;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentDataSource {
  private readonly http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/api/documents`;
  private readonly fileUploadService = inject(FileUploadService);

  findAll(filterParams: GetDocumentsParams) {
    const params = new HttpParams({
      fromObject: this.removeEmptyParams(filterParams),
    });
    return this.http.get<{
      documents: DocumentResponse[];
      total: number;
    }>(this.URL, { params });
  }

  uploadDocumentFile(file: File) {
    return this.fileUploadService.upload(file, 'documents');
  }

  createBatch(data: CreateDocumentBatchDto) {
    return this.http.post<DocumentResponse[]>(`${this.URL}/batch`, data);
  }

  update(id: string, data: UpdateDocumentDto) {
    const { file, ...props } = data;
    const uploadTask$: Observable<UploadResult | null> = file
      ? this.fileUploadService.upload(file, 'documents')
      : of(null);
    return uploadTask$.pipe(
      switchMap((uploadedFile) => {
        return this.http.patch<DocumentResponse>(`${this.URL}/${id}`, {
          ...props,
          ...(uploadedFile && { fileId: uploadedFile.id }),
        });
      }),
    );
  }

  removeDocument(id: string) {
    return this.http.delete(`${this.URL}/${id}`);
  }

  getOrganizationTree() {
    return this.http.get<SectionTreeNodeResponse[]>(
      `${this.URL}/organizational-units/tree`,
    );
  }

  getDocumentTypes() {
    return this.http.get<DocumentTypeWithSubTypesResponse[]>(
      `${this.URL}/types`,
    );
  }

  private removeEmptyParams(obj: object) {
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([_, v]) => v !== null && v !== undefined && v !== '',
      ),
    );
  }
}
