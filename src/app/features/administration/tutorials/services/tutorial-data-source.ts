import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { Observable, of, switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { FileUploadService, UploadResult } from '../../../../shared';
import { TutorialCategoryResponse, TutorialResponse } from '../interfaces';

interface PaginatioParams {
  term: string;
  limit: number;
  offset: number;
}

@Injectable({
  providedIn: 'root',
})
export class TutorialDataSource {
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/tutorials`;
  private fileUploadService = inject(FileUploadService);

  findAll({ limit, offset, term }: PaginatioParams) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{ tutorials: TutorialResponse[]; total: number }>(
      `${this.URL}`,
      { params },
    );
  }

  create(dto: object) {
    return this.http.post(`${this.URL}`, dto);
  }

  update(id: string, dto: object) {
    return this.http.patch(`${this.URL}/${id}`, dto);
  }

  getCategories() {
    return this.http.get<TutorialCategoryResponse[]>(`${this.URL}/categories`);
  }

  getOne(id: string) {
    return this.http.get<TutorialResponse>(`${this.URL}/${id}`);
  }

  createBlock(tutorialId: string, dto: object, file: File | null) {
    const task: Observable<UploadResult | null> = file
      ? this.fileUploadService.upload(file, 'tutorials')
      : of(null);
    return task.pipe(
      switchMap((result) =>
        this.http.post(`${this.URL}/${tutorialId}/block`, {
          ...dto,
          ...(result && { fileId: result.fileId }),
        }),
      ),
    );
  }

  updateBlock(blockId: string, dto: object, file: File | null) {
    const task: Observable<UploadResult | null> = file
      ? this.fileUploadService.upload(file, 'tutorials')
      : of(null);
    return task.pipe(
      switchMap((result) =>
        this.http.patch(`${this.URL}/block/${blockId}`, {
          ...dto,
          ...(result && { fileId: result.fileId }),
        }),
      ),
    );
  }

  updateBlockOrder(tutorialId: string, items: { id: string; order: number }[]) {
    return this.http.put<{ ok: true; message: string }>(
      `${this.URL}/${tutorialId}/blocks/order`,
      { items },
    );
  }
}
