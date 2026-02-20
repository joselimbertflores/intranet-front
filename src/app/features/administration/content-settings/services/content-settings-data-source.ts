import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { map, of, forkJoin, switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import {
  HeroSlideResponse,
  HeroSlidesToUpload,
  QuickAccessResponse,
  QuickAccessToUpload,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class ContentSettingsDataSource {
  private http = inject(HttpClient);

  private readonly HERO_SLIDES_URL = `${environment.baseUrl}/hero-slide`;
  private readonly QUICK_ACCESS_URL = `${environment.baseUrl}/quick-access`;

  getHeroSlides() {
    return this.http.get<HeroSlideResponse[]>(this.HERO_SLIDES_URL);
  }

  getQuickAccess() {
    return this.http.get<QuickAccessResponse[]>(this.QUICK_ACCESS_URL);
  }

  getCurrentSlides() {
    return this.http.get<HeroSlideResponse[]>(this.QUICK_ACCESS_URL).pipe(
      map((resp) =>
        resp.map(({ imageUrl: image, title, description, redirecttUrl }) => ({
          image,
          title,
          description,
          redirecttUrl,
        })),
      ),
    );
  }

  replaceSlides(items: HeroSlidesToUpload[]) {
    // const uploadTasks = items.map((item) => {
    //   const { url, file, ...props } = item;
    //   if (!file) {
    //     return of({
    //       title: props.title,
    //       description: props.description,
    //       redirectUrl: props.redirectUrl,
    //       image: url.split('/').pop(),
    //     });
    //   }
    //   return this.fileUploadService.uploadFile(file, 'hero-section').pipe(
    //     map(({ fileName }) => ({
    //       title: props.title,
    //       description: props.description,
    //       redirectUrl: props.redirectUrl,
    //       image: fileName,
    //     })),
    //   );
    // });
    return forkJoin([]).pipe(
      switchMap((slides) => {
        console.log(slides);
        return this.http.put(this.HERO_SLIDES_URL, { slides });
      }),
    );
  }

  replaceQuickAccessItems(dto: object[]) {
    return this.http.put(this.QUICK_ACCESS_URL, { items: dto });
  }
}
