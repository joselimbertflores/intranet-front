import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  inject,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import type { SwiperOptions } from 'swiper/types';

import { CarouselModule } from 'primeng/carousel';
import { register } from 'swiper/element/bundle';
import { PortalDataSource } from '../../services';

register();

@Component({
  selector: 'landing-page',
  imports: [CommonModule, RouterModule, CarouselModule],
  templateUrl: './landing-page.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LandingPageComponent {
  private readonly portalDataSource = inject(PortalDataSource);

  readonly data = this.portalDataSource.portalData;

  readonly autoplayConfig = {
    delay: 8000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  };

  readonly bannerBreakpoints: SwiperOptions['breakpoints'] = {
    768: {
      slidesPerView: 1,
      spaceBetween: 24,
    },
    1024: {
      slidesPerView: 1.15,
      spaceBetween: 28,
    },
    1280: {
      slidesPerView: 1.2,
      spaceBetween: 32,
    },
  };

  readonly responsiveOptions = [
    {
      breakpoint: '1280px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '960px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '640px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  communicationPreview(item: {
    previewImageUrl?: string | null;
    previewUrl?: string | null;
  }) {
    return item.previewImageUrl ?? item.previewUrl ?? null;
  }

  usesRouterLink(
    url: string | null | undefined,
    linkType?: string | null,
    openInNewTab = false,
  ) {
    return !!url && !openInNewTab && !this.isExternalLink(url, linkType);
  }

  private isExternalLink(url: string, linkType?: string | null) {
    if (linkType) {
      return linkType === 'EXTERNAL';
    }

    return /^(https?:|mailto:|tel:)/i.test(url);
  }
}
