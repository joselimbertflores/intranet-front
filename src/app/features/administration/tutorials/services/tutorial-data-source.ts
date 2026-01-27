import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { catchError, EMPTY, forkJoin, map, of, switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { TutorialResponse } from '../../interfaces';

interface TutorialProps {
  title: string;
  description: string;
  videos: VideoItem[];
  image?: ImageItem;
}

interface VideoItem {
  title: string;
  fileUrl: string;
  file?: File;
}

interface ImageItem {
  file?: File;
  fileUrl?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TutorialDataSource {
  private http = inject(HttpClient);
  private readonly URL = `${environment.baseUrl}/assistance`;

  findAll() {
    return this.http.get<{ tutorials: TutorialResponse[]; total: number }>(
      `${this.URL}`
    );
  }

  create(tutorial: TutorialProps) {
    console.log(tutorial);
    const { videos, image, ...props } = tutorial;

    return this.buildUploadTask(videos, image).pipe(
      switchMap(([image, ...videos]) => {
        console.log({ ...props, image, videos });
        return this.http.post(`${this.URL}`, {
          ...props,
          image,
          videos,
        });
      })
    );
  }

  update(id: string, tutorial: TutorialProps) {
    const { videos, image, ...props } = tutorial;
    return this.buildUploadTask(videos, image).pipe(
      switchMap(([image, ...videos]) => {
        return this.http.patch(`${this.URL}/${id}`, {
          ...props,
          image,
          videos,
        });
      })
    );
  }

  private buildUploadTask(items: VideoItem[], image?: ImageItem) {
    return forkJoin([
      image?.file
        ? this.uploadFile(image.file, 'image')
        : of(image?.fileUrl?.split('/').pop()),

      ...items.map(({ file, title, fileUrl }) => {
        if (!file) {
          return of({
            title,
            fileName: fileUrl.split('/').pop(),
          });
        }
        return this.uploadFile(file, 'video').pipe(
          map((fileName) => ({ title, fileName }))
        );
      }),
    ]);
  }

  private uploadFile(file: File, type: 'image' | 'video') {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<{ fileName: string }>(
        `${environment.baseUrl}/files/tutorial-${type}`,
        formData
      )
      .pipe(
        map(({ fileName }) => fileName),
        catchError(() => EMPTY)
      );
  }
}
