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
import { CardModule } from 'primeng/card';
import { register } from 'swiper/element/bundle';
import { PortalDataSource } from '../../services';

register();

@Component({
  selector: 'landing-page',
  imports: [CommonModule, RouterModule, CardModule, CarouselModule],
  templateUrl: './landing-page.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LandingPageComponent {
  private portalDataSource = inject(PortalDataSource);

  data = this.portalDataSource.portalData;

  autoplayConfig = {
    delay: 8000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  };

  responsiveOptions = [
    {
      breakpoint: '1024px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '768px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '560px',
      numVisible: 1,
      numScroll: 1,
    },
  ];
}
