import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, Observable, of, switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { FileUploadService, UploadedFileResponse } from '../../../../shared';
import {
  DocumentManageResponse,
  DocumentSubtypeResponse,
  DocumentTypeResponse,
} from '../interfaces';
import { toSignal } from '@angular/core/rxjs-interop';

interface CreateDocumentProps {
  sectionId: number;
  typeId: number;
  subtypeId: number;
  date: Date;
  documents: DocumentTest[];
  files: File[];
}

interface UpdateDocumentProps {
  date: Date;
  displayName: string;
  status: string;
  file: File;
}

interface DocumentTest {
  displayName: string;
}

interface GetDocumentsParams {
  limit?: number;
  offset?: number;
  term?: string;
  sectionId?: number;
  typeId?: number;
  subtypeId?: number;
  date?: Date;
}

@Injectable({
  providedIn: 'root',
})
export class DocumentDataSource {
  private readonly URL = `${environment.baseUrl}/documents`;

  private fileUploadService = inject(FileUploadService);

  private http = inject(HttpClient);

  sections = toSignal(this.http.get<any[]>(`${this.URL}/sections`), {
    initialValue: [],
  });

  constructor() {}

  findAll({ date, ...props }: GetDocumentsParams) {
    const params = new HttpParams({
      fromObject: this.removeEmptyParams({
        ...props,
        fiscalYear: date?.getFullYear(),
      }),
    });
    return this.http.get<{
      documents: DocumentManageResponse[];
      total: number;
    }>(this.URL, { params });
  }

  create(data: CreateDocumentProps) {
    const { documents, files, date, ...rest } = data;
    return forkJoin(
      files.map((file) =>
        this.fileUploadService.newUploadFile(file, 'document'),
      ),
    ).pipe(
      switchMap((uploadedFiles) => {
        const documentsToCreate = uploadedFiles.map((uploadedFile, index) => ({
          displayName: documents[index].displayName,
          ...uploadedFile,
        }));
        return this.http.post<DocumentManageResponse[]>(this.URL, {
          ...rest,
          fiscalYear: date.getFullYear(),
          documents: documentsToCreate,
        });
      }),
    );
  }

  update(id: string, data: UpdateDocumentProps) {
    const { file, date, ...form } = data;
    const uploadT$: Observable<UploadedFileResponse | null> = file
      ? this.fileUploadService.newUploadFile(file, 'document')
      : of(null);
    return uploadT$.pipe(
      switchMap((uploadedFile) => {
        return this.http.patch<DocumentManageResponse>(`${this.URL}/${id}`, {
          ...form,
          ...uploadedFile,
          fiscalYear: date.getFullYear(),
        });
      }),
    );
  }

  getTypesBySection(id: number) {
    return this.http.get<DocumentTypeResponse[]>(`${this.URL}/types/${id}`);
  }

  getSubtypesByType(id: number) {
    return this.http.get<DocumentSubtypeResponse[]>(
      `${this.URL}/subtypes/${id}`,
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
