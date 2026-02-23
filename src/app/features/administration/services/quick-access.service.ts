import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, switchMap, forkJoin, EMPTY, map, of } from 'rxjs';

import { environment } from '../../../../environments/environment';
import { FileUploadService } from '../../../shared';
import { BannerResponse, QuickAccessResponse } from '../content-settings/interfaces';

interface QuickAccessItem {
  name: string;
  url: string;
  order: number;
  icon: string | null;
  file?: File;
}

@Injectable({
  providedIn: 'root',
})
export class QuickAccessService {
  private http = inject(HttpClient);

  private fileUploadService = inject(FileUploadService);

  private readonly URL = `${environment.baseUrl}/quick-access`;

  findAll() {
    return this.http.get<QuickAccessResponse[]>(this.URL);
  }

  syncItems(items: QuickAccessItem[]) {
    const existingItems = items
      .filter(
        (item) =>
          item.file === undefined &&
          item.icon !== null &&
          !item.icon.startsWith('blob:')
      )
      .map(({ icon, ...props }) => ({
        icon: icon?.split('/').pop(), // * extrack fileName from build url,
        ...props,
      }));

    console.log(existingItems);
    return this.buildUploadTask(items).pipe(
      map((newItems) => [...existingItems, ...newItems]),
      switchMap((allSItems) => {
        return this.http.put<BannerResponse[]>(this.URL, {
          items: allSItems,
        });
      })
    );
  }

  private buildUploadTask(items: QuickAccessItem[]) {
    const itemsToUpload = items
      .filter((item) => item.file !== undefined)
      .map(({ file, ...props }) => ({
        file: file as File,
        ...props,
      }));

    return itemsToUpload.length > 0
      ? forkJoin(
          itemsToUpload.map((itemToUpload) =>
            this.fileUploadService
              .uploadFile(itemToUpload.file, 'quick-access')
              .pipe(
                map(({ fileName }) => ({
                  icon: fileName,
                  order: itemToUpload.order,
                  name: itemToUpload.name,
                  url: itemToUpload.url,
                })),
                catchError(() => EMPTY)
              )
          )
        )
      : of([]);
  }
}
