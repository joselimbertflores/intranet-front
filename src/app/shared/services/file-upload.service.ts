import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';

type FileGroup =
  | 'hero-section'
  | 'document'
  | 'quick-access'
  | 'communication'
  | 'tutorial';
type MediaType = 'image' | 'audio' | 'video' | 'document';
export interface UploadedFile {
  fileName: string;
  originalName: string;
  type: MediaType;
  sizeBytes: number;
}

export interface UploadedPdfThumbnail {
  fileName: string;
  originalName: string;
  previewName: string | null;
}

export interface UploadedFileResponse {
  fileName: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

@Injectable({
  providedIn: 'root',
})
export class FileUploadService {
  constructor() {}
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/files`;

  getFile(url: string) {
    return this.http.get(url, { responseType: 'blob' });
  }

  uploadFile(file: File, group: FileGroup) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadedFile>(`${this.URL}/${group}`, formData);
  }

  newUploadFile(file: File, group: FileGroup) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadedFileResponse>(
      `${this.URL}/${group}`,
      formData,
    );
  }

  uploadPdfThumbnail(file: File, group: FileGroup) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadedPdfThumbnail>(
      `${this.URL}/${group}`,
      formData,
    );
  }

  uploadVideoWithThumbnail(file: File, group: FileGroup) {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<UploadedPdfThumbnail>(
      `${this.URL}/${group}`,
      formData,
    );
  }

  downloadFile(url: string, name?: string) {
    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = name || 'unknown';
        link.click();
        window.URL.revokeObjectURL(downloadUrl);
      },
    });
  }
}
