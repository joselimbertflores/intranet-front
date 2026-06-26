import { HttpClient, HttpParams } from '@angular/common/http';
import { toSignal } from '@angular/core/rxjs-interop';
import { inject, Injectable } from '@angular/core';

import { forkJoin, Observable, of, switchMap, tap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { FileUploadService, UploadResult } from '../../../../shared';
import {
  DocumentTypeWithSubTypesResponse,
  SectionTreeNodeResponse,
  DocumentManageResponse,
} from '../interfaces';
import { TreeNode } from 'primeng/api';

interface CreateDocumentBatchDto {
  organizationalUnitId: string;
  documentTypeId: number;
  documentSubtypeId?: number | null;
  year?: number | null;
  files: File[];
  documents: DocumentRecord[];
}

interface DocumentRecord {
  title: string;
}

interface UpdateDocumentDto {
  organizationalUnitId?: string | null;
  documentTypeId?: number | null;
  documentSubtypeId?: number | null;
  year?: number | null;
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
}

@Injectable({
  providedIn: 'root',
})
export class DocumentDataSource {
  private readonly http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/api/documents`;
  private readonly fileUploadService = inject(FileUploadService);

  organizationUnitsTree = toSignal(this.getOrganizationTree(), {
    initialValue: [],
  });
  documentTypes = toSignal(this.getDocumentTypes(), { initialValue: [] });

  findAll(filterParams: GetDocumentsParams) {
    const params = new HttpParams({
      fromObject: this.removeEmptyParams(filterParams),
    });
    return this.http
      .get<{
        documents: DocumentManageResponse[];
        total: number;
      }>(this.URL, { params })
      .pipe(tap((resp) => console.log(resp)));
  }

  create(data: CreateDocumentBatchDto) {
    const { documents, files, year, ...rest } = data;
    return forkJoin(
      files.map((file) => this.fileUploadService.upload(file, 'documents')),
    ).pipe(
      switchMap((uploadedFiles) => {
        const documentsToCreate = uploadedFiles.map((uploadedFile, index) => ({
          fileId: uploadedFile.id,
          title: documents[index].title.trim(),
        }));

        return this.http.post<DocumentManageResponse[]>(`${this.URL}/batch`, {
          ...rest,
          ...(year && { year }),
          documents: documentsToCreate,
        });
      }),
    );
  }

  update(id: string, data: UpdateDocumentDto) {
    const { file, ...props } = data;
    const uploadTask$: Observable<UploadResult | null> = file
      ? this.fileUploadService.upload(file, 'documents')
      : of(null);
    return uploadTask$.pipe(
      switchMap((uploadedFile) => {
        return this.http.patch<DocumentManageResponse>(`${this.URL}/${id}`, {
          ...props,
          ...(uploadedFile && { fileId: uploadedFile.id }),
        });
      }),
    );
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

  private toTreeNode(nodes: SectionTreeNodeResponse[]): TreeNode[] {
    return nodes.map((node) => ({
      key: node.id,
      label: node.name.toUpperCase(),
      data: node.id,
      children: node.children ? this.toTreeNode(node.children) : [],
    }));
  }
}
