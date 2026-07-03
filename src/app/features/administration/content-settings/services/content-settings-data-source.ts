import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { map, of, forkJoin, switchMap } from 'rxjs';

import { environment } from '../../../../../environments/environment';
import {
  LandingModalNoticeResponse,
  LandingModalNoticeToSave,
  FeaturedBannerResponse,
  FeaturedBannerToSave,
  QuickAccessBatchItem,
  QuickAccessResponse,
  HeroSlideResponse,
} from '../interfaces';
import { FileUploadService } from '../../../../shared';

interface HeroSlideToSave {
  id?: number;
  title: string;
  description?: string | null;
  linkLabel?: string | null;
  linkUrl?: string | null;
  imageFileId?: string;
  isActive: boolean;
  file?: File;
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
  private readonly LANDING_MODAL_NOTICES_URL = `${this.HERO_SLIDES_URL}/landing-modal-notices`;

  getQuickAccess() {
    return this.http.get<QuickAccessResponse[]>(this.QUICK_ACCESS_URL);
  }
  replaceQuickAccessItems(items: QuickAccessBatchItem[]) {
    return this.http.put<QuickAccessResponse[]>(
      `${this.QUICK_ACCESS_URL}/batch`,
      {
        items,
      },
    );
  }

  removeQuickAccess(id: number) {
    return this.http.delete(`${this.QUICK_ACCESS_URL}/${id}`);
  }

  getBanners() {
    return this.http.get<HeroSlideResponse[]>(
      `${this.HERO_SLIDES_URL}/hero-slides`,
    );
  }

  saveHeroSections(items: HeroSlideToSave[]) {
    const uploads$ = items.map(({ file, ...props }) =>
      file
        ? this.fileUploadService.upload(file, 'hero-slides').pipe(
            map(({ id: imageFileId }) => ({
              ...props,
              imageFileId,
            })),
          )
        : of(props),
    );
    return forkJoin(uploads$).pipe(
      switchMap((items) => {
        return this.http.put(`${this.HERO_SLIDES_URL}/hero-slides/batch`, {
          items,
        });
      }),
    );
  }

  removeBanner(id: number) {
    return this.http.delete(`${this.HERO_SLIDES_URL}/hero-slides/${id}`);
  }

  getFeaturedBanners() {
    return this.http.get<FeaturedBannerResponse[]>(this.FEATURED_BANNERS_URL);
  }

  saveFeaturedBanners(items: FeaturedBannerToSave[]) {
    const uploads$ = items.map(({ file, ...banner }) =>
      file
        ? this.fileUploadService
            .upload(file, 'featured-banners')
            .pipe(map(({ id: imageFileId }) => ({ ...banner, imageFileId })))
        : of(banner),
    );

    return forkJoin(uploads$).pipe(
      switchMap((uploadedItems) =>
        this.http.put<FeaturedBannerResponse[]>(
          `${this.FEATURED_BANNERS_URL}/batch`,
          { items: uploadedItems },
        ),
      ),
    );
  }

  removeFeaturedBanner(id: number) {
    return this.http.delete(`${this.FEATURED_BANNERS_URL}/${id}`);
  }

  getLandingModalNotices(limit: number, offset: number, term?: string) {
    const params = new HttpParams({
      fromObject: { limit, offset, ...(term && { term }) },
    });
    return this.http.get<{
      notices: LandingModalNoticeResponse[];
      total: number;
    }>(this.LANDING_MODAL_NOTICES_URL, { params });
  }

  createLandingModalNotice(notice: LandingModalNoticeToSave, file?: File) {
    return this.withLandingModalNoticeImage(notice, file).pipe(
      switchMap((payload) =>
        this.http.post<LandingModalNoticeResponse>(
          this.LANDING_MODAL_NOTICES_URL,
          payload,
        ),
      ),
    );
  }

  updateLandingModalNotice(
    id: string,
    notice: LandingModalNoticeToSave,
    file?: File,
  ) {
    return this.withLandingModalNoticeImage(notice, file).pipe(
      switchMap((payload) =>
        this.http.patch<LandingModalNoticeResponse>(
          `${this.LANDING_MODAL_NOTICES_URL}/${id}`,
          payload,
        ),
      ),
    );
  }

  removeLandingModalNotice(id: string) {
    return this.http.delete(`${this.LANDING_MODAL_NOTICES_URL}/${id}`);
  }

  private withLandingModalNoticeImage(
    notice: LandingModalNoticeToSave,
    file?: File,
  ) {
    if (!file) return of(notice);
    return this.fileUploadService
      .upload(file, 'landing-modal-notices')
      .pipe(map(({ id: imageId }) => ({ ...notice, imageId })));
  }
}
