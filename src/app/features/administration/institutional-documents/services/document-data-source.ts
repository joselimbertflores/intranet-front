import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, map, Observable, of, switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import {
  FileUploadService,
  UploadedFileResponse,
  UploadResult,
} from '../../../../shared';
import {
  DocumentManageResponse,
  DocumentSubtypeResponse,
  DocumentTypeResponse,
  DocumentTypeWithSubTypesResponse,
  SectionTreeNodeResponse,
} from '../interfaces';
import { toSignal } from '@angular/core/rxjs-interop';
import { TreeNode } from 'primeng/api';

interface CreateDocumentProps {
  sectionId: number;
  typeId: number;
  subtypeId: number;
  date: Date;
  documents: DocumentRecord[];
  files: File[];
}

interface UpdateDocumentProps {
  date: Date;
  title: string;
  file: File;
}

interface DocumentRecord {
  title: string;
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
  private readonly http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/documents`;
  private readonly fileUploadService = inject(FileUploadService);

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
      files.map((file) => this.fileUploadService.upload(file, 'documents')),
    ).pipe(
      switchMap((uploadedFiles) => {
        const documentsToCreate = uploadedFiles.map((uploadedFile, index) => ({
          fileId: uploadedFile.fileId,
          title: documents[index].title ?? uploadedFile.originalName,
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
    const { file, date, title } = data;
    const uploadTask$: Observable<UploadResult | null> = file
      ? this.fileUploadService.upload(file, 'documents')
      : of(null);
    return uploadTask$.pipe(
      switchMap((uploadedFile) => {
        return this.http.patch<DocumentManageResponse>(`${this.URL}/${id}`, {
          title: title ?? uploadedFile?.originalName,

          ...uploadedFile,
          fiscalYear: date.getFullYear(),
        });
      }),
    );
  }

  getTreeSections() {
    return this.http
      .get<SectionTreeNodeResponse[]>(`${this.URL}/sections/tree`)
      .pipe(map((resp) => this.toTreeNode(resp)));
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
