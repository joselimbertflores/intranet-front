import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { map, of, forkJoin, switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import {
  LandingNoticeResponse,
  LandingNoticeToSave,
  FeaturedBannerResponse,
  QuickAccessBatchItem,
  QuickAccessResponse,
  HeroSlideResponse,
} from '../interfaces';
import { FileUploadService } from '../../../../shared';

interface HeroSlideToSave {
  id?: number | null;
  title: string;
  description: string | null;
  linkLabel: string | null;
  linkUrl: string | null;
  imageId: string | null;
  isActive?: boolean;
  file?: File | null;
}

interface FeaturedBannerToSave {
  id?: number | null;
  title: string;
  description: string | null;
  linkLabel: string | null;
  linkUrl: string | null;
  imageId: string | null;
  isActive?: boolean;
  file?: File | null;
}

interface PaginationParams {
  limit?: number;
  offset?: number;
  term?: string;
}

@Injectable({
  providedIn: 'root',
})
export class ContentSettingsDataSource {
  private http = inject(HttpClient);
  private fileUploadService = inject(FileUploadService);

  private readonly HERO_SLIDES_URL = `${environment.baseUrl}/api/content`;
  private readonly QUICK_ACCESS_URL = `${this.HERO_SLIDES_URL}/quick-accesses`;
  private readonly FEATURED_BANNERS_URL = `${this.HERO_SLIDES_URL}/featured-banners`;
  private readonly LANDING_NOTICES_URL = `${this.HERO_SLIDES_URL}/landing-notices`;

  getQuickAccess() {
    return this.http.get<QuickAccessResponse[]>(this.QUICK_ACCESS_URL);
  }

  saveQuickAccessItems(items: QuickAccessBatchItem[], deletedIds: number[]) {
    return this.http.put<QuickAccessResponse[]>(
      `${this.QUICK_ACCESS_URL}/batch`,
      {
        items,
        ...(deletedIds.length > 0 && { deletedIds }),
      },
    );
  }

  removeQuickAccess(id: number) {
    return this.http.delete(`${this.QUICK_ACCESS_URL}/${id}`);
  }

  getHeroSlides() {
    return this.http.get<HeroSlideResponse[]>(
      `${this.HERO_SLIDES_URL}/hero-slides`,
    );
  }

  saveHeroSlides(items: HeroSlideToSave[], deletedIds: number[]) {
    const uploads$ = items.map(({ file, ...props }) =>
      file
        ? this.fileUploadService.upload(file, 'hero-slides').pipe(
            map(({ id }) => ({
              ...props,
              imageId: id,
            })),
          )
        : of(props),
    );
    return forkJoin(uploads$).pipe(
      switchMap((payloadItems) => {
        return this.http.post<HeroSlideResponse[]>(
          `${this.HERO_SLIDES_URL}/hero-slides/batch`,
          {
            items: payloadItems,
            ...(deletedIds.length > 0 && { deletedIds }),
          },
        );
      }),
    );
  }

  removeBanner(id: number) {
    return this.http.delete(`${this.HERO_SLIDES_URL}/hero-slides/${id}`);
  }

  getFeaturedBanners() {
    return this.http.get<FeaturedBannerResponse[]>(this.FEATURED_BANNERS_URL);
  }

  saveFeaturedBanners(items: FeaturedBannerToSave[], deletedIds: number[]) {
    const uploads$ = items.map(({ file, ...banner }) =>
      file
        ? this.fileUploadService
            .upload(file, 'featured-banners')
            .pipe(map(({ id }) => ({ ...banner, imageId: id })))
        : of(banner),
    );

    return forkJoin(uploads$).pipe(
      switchMap((payloadItems) =>
        this.http.put<FeaturedBannerResponse[]>(
          `${this.FEATURED_BANNERS_URL}/batch`,
          {
            items: payloadItems,
            ...(deletedIds.length > 0 && { deletedIds }),
          },
        ),
      ),
    );
  }

  removeFeaturedBanner(id: number) {
    return this.http.delete(`${this.FEATURED_BANNERS_URL}/${id}`);
  }

  getLandingNotices({ limit = 10, offset = 0, term }: PaginationParams) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{ notices: LandingNoticeResponse[]; total: number }>(
      this.LANDING_NOTICES_URL,
      { params },
    );
  }

  createLandingNotice(notice: LandingNoticeToSave, file?: File) {
    return this.withLandingNoticeImage(notice, file).pipe(
      switchMap((payload) =>
        this.http.post<LandingNoticeResponse>(
          this.LANDING_NOTICES_URL,
          payload,
        ),
      ),
    );
  }

  updateLandingNotice(id: string, notice: LandingNoticeToSave, file?: File) {
    return this.withLandingNoticeImage(notice, file).pipe(
      switchMap((payload) =>
        this.http.patch<LandingNoticeResponse>(
          `${this.LANDING_NOTICES_URL}/${id}`,
          payload,
        ),
      ),
    );
  }

  removeLandingNotice(id: string) {
    return this.http.delete(`${this.LANDING_NOTICES_URL}/${id}`);
  }

  private withLandingNoticeImage(notice: LandingNoticeToSave, file?: File) {
    if (!file) return of(notice);
    return this.fileUploadService
      .upload(file, 'landing-notices')
      .pipe(map(({ id: imageId }) => ({ ...notice, imageId })));
  }
}
