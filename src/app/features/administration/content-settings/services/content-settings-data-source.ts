import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { map, of, forkJoin, switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import { BannerResponse, QuickAccessResponse } from '../interfaces';
import { FileUploadService } from '../../../../shared';

interface BannersToUpload extends BannerResponse {
  file?: File;
}

@Injectable({
  providedIn: 'root',
})
export class ContentSettingsDataSource {
  private http = inject(HttpClient);
  private fileUploadService = inject(FileUploadService);

  private readonly HERO_SLIDES_URL = `${environment.baseUrl}/banner`;
  private readonly QUICK_ACCESS_URL = `${environment.baseUrl}/quick-access`;

  getQuickAccess() {
    return this.http.get<QuickAccessResponse[]>(this.QUICK_ACCESS_URL);
  }
  replaceQuickAccessItems(dto: object[]) {
    return this.http.put(this.QUICK_ACCESS_URL, { items: dto });
  }

  getBanners() {
    return this.http.get<BannerResponse[]>(this.HERO_SLIDES_URL);
  }

  replaceBanners(items: BannersToUpload[]) {
    const uploads$ = items.map(({ file, ...props }) =>
      file
        ? this.fileUploadService.upload(file, 'banners').pipe(
            map(({ fileId }) => ({
              ...props,
              imageId: fileId,
            })),
          )
        : of(props),
    );
    return forkJoin(uploads$).pipe(
      switchMap((items) => {
        return this.http.put(this.HERO_SLIDES_URL, { items });
      }),
    );
  }

  removeBanner(id: number) {
    return this.http.delete(`${this.HERO_SLIDES_URL}/${id}`);
  }
}
