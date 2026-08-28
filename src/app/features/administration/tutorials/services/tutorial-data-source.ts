import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../../../environments/environment';
import { FileUploadService } from '../../../../shared';
import {
  TutorialBlockCreatePayload,
  TutorialBlockReorderPayload,
  TutorialBlockReorderResponse,
  TutorialBlockResponse,
  TutorialBlockUpdatePayload,
  TutorialCreatePayload,
  TutorialDetailResponse,
  TutorialGeneralUpdatePayload,
  TutorialListParams,
  TutorialListResponse,
  TutorialPublicationPayload,
} from '../interfaces';

@Injectable({ providedIn: 'root' })
export class TutorialDataSource {
  private readonly http = inject(HttpClient);
  private readonly fileUploadService = inject(FileUploadService);
  private readonly url = `${environment.baseUrl}/api/tutorials`;

  findAll({ limit, offset, term }: TutorialListParams) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<TutorialListResponse>(this.url, { params });
  }

  getOne(id: string) {
    return this.http.get<TutorialDetailResponse>(`${this.url}/${id}`);
  }

  create(payload: TutorialCreatePayload) {
    return this.http.post<TutorialDetailResponse>(this.url, payload);
  }

  update(id: string, payload: TutorialGeneralUpdatePayload) {
    return this.http.patch<TutorialDetailResponse>(`${this.url}/${id}`, payload);
  }

  updatePublication(id: string, payload: TutorialPublicationPayload) {
    return this.http.patch<TutorialDetailResponse>(`${this.url}/${id}`, payload);
  }

  remove(id: string) {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  createBlock(tutorialId: string, payload: TutorialBlockCreatePayload) {
    return this.http.post<TutorialBlockResponse>(
      `${this.url}/${tutorialId}/block`,
      payload,
    );
  }

  updateBlock(blockId: string, payload: TutorialBlockUpdatePayload) {
    return this.http.patch<TutorialBlockResponse>(
      `${this.url}/block/${blockId}`,
      payload,
    );
  }

  removeBlock(blockId: string) {
    return this.http.delete<void>(`${this.url}/block/${blockId}`);
  }

  updateBlockOrder(
    tutorialId: string,
    payload: TutorialBlockReorderPayload,
  ) {
    return this.http.put<TutorialBlockReorderResponse>(
      `${this.url}/${tutorialId}/blocks/order`,
      payload,
    );
  }

  uploadTutorialFile(file: File) {
    return this.fileUploadService.upload(file, 'tutorials');
  }

  uploadCover(file: File) {
    return this.fileUploadService.uploadTutorialCover(file);
  }
}
