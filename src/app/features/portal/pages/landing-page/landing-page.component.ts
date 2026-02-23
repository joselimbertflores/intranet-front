import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  CUSTOM_ELEMENTS_SCHEMA,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewChild,
} from '@angular/core';
import { RouterModule } from '@angular/router';
import type { SwiperOptions } from 'swiper/types';

import { CarouselModule } from 'primeng/carousel';
import { CardModule } from 'primeng/card';
import { register } from 'swiper/element/bundle';

 register();

type SwiperContainerElement = HTMLElement & {
  initialize: () => void;
};

interface QuickAccessItem {
  title: string;
  icon: string;
  route: string;
}

interface AnnouncementBanner {
  title: string;
  detail: string;
}

interface FeaturedCommunication {
  title: string;
  publicationDate: string;
  route: string;
}

interface DownloadedDocument {
  title: string;
  downloadCount: string;
  icon: string;
}

@Component({
  selector: 'landing-page',
  imports: [CommonModule, RouterModule, CardModule, CarouselModule],
  templateUrl: './landing-page.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  styles: `
    :host {
      display: block;
    }

    .announcement-swiper {
      --swiper-navigation-size: 1.05rem;
      --swiper-navigation-color: color-mix(
        in srgb,
        var(--p-surface-0) 92%,
        transparent
      );
      --swiper-pagination-color: var(--p-primary-300);
      --swiper-pagination-bullet-inactive-color: color-mix(
        in srgb,
        var(--p-surface-0) 60%,
        transparent
      );
      --swiper-pagination-bullet-inactive-opacity: 0.8;
    }

    :host ::ng-deep .quick-access-card .p-card-body,
    :host ::ng-deep .communication-card .p-card-body {
      padding: 0;
    }

    :host ::ng-deep .quick-access-card .p-card-content,
    :host ::ng-deep .communication-card .p-card-content {
      padding: 0;
    }

    :host ::ng-deep .featured-communications-carousel .p-carousel-content {
      padding-inline: 0.25rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LandingPageComponent implements AfterViewInit {
  @ViewChild('announcementSwiper')
  private announcementSwiper?: ElementRef<SwiperContainerElement>;

  readonly quickAccessItems: QuickAccessItem[] = [
    {
      title: 'Documentos',
      icon: 'pi pi-file',
      route: '/documents',
    },
    {
      title: 'Comunicados',
      icon: 'pi pi-megaphone',
      route: '/communications',
    },
    {
      title: 'Directorio Institucional',
      icon: 'pi pi-sitemap',
      route: '/directory',
    },
    {
      title: 'Calendario de Eventos',
      icon: 'pi pi-calendar',
      route: '/calendar',
    },
    {
      title: 'Tutoriales',
      icon: 'pi pi-book',
      route: '/tutorials',
    },
  ];

  readonly announcementBanners: AnnouncementBanner[] = [
    {
      title: 'Actualizacion del sistema de documentos - Septiembre 2026',
      detail: 'Se habilitaron nuevos filtros y mejoras de rendimiento para consultas internas.',
    },
    {
      title: 'Nueva normativa institucional disponible',
      detail: 'La normativa ya se encuentra publicada y disponible para descarga en la seccion de documentos.',
    },
    {
      title: 'Mantenimiento programado - Domingo 10:00 AM',
      detail: 'Durante la ventana de mantenimiento algunos servicios podrian presentar disponibilidad intermitente.',
    },
  ];

  readonly featuredCommunications: FeaturedCommunication[] = [
    {
      title: 'Circular Administrativa 012/2026',
      publicationDate: '12 Sep 2026',
      route: '/communications',
    },
    {
      title: 'Comunicado Oficial - Horarios Especiales',
      publicationDate: '07 Sep 2026',
      route: '/communications',
    },
    {
      title: 'Resolucion Interna 004/2026',
      publicationDate: '03 Sep 2026',
      route: '/communications',
    },
    {
      title: 'Aviso Institucional - Seguridad Informatica',
      publicationDate: '30 Ago 2026',
      route: '/communications',
    },
  ];

  readonly mostDownloadedDocuments: DownloadedDocument[] = [
    {
      title: 'Reglamento Interno de Personal',
      downloadCount: '1,245 descargas',
      icon: 'pi pi-file',
    },
    {
      title: 'Manual de Procedimientos 2026',
      downloadCount: '980 descargas',
      icon: 'pi pi-file',
    },
    {
      title: 'Calendario Institucional 2026',
      downloadCount: '870 descargas',
      icon: 'pi pi-calendar',
    },
    {
      title: 'Politica de Seguridad de la Informacion',
      downloadCount: '640 descargas',
      icon: 'pi pi-shield',
    },
  ];

  readonly communicationsResponsiveOptions = [
    {
      breakpoint: '1279px',
      numVisible: 3,
      numScroll: 1,
    },
    {
      breakpoint: '959px',
      numVisible: 2,
      numScroll: 1,
    },
    {
      breakpoint: '639px',
      numVisible: 1,
      numScroll: 1,
    },
  ];

  ngAfterViewInit(): void {
    const element = this.announcementSwiper?.nativeElement;

    if (!element) {
      return;
    }

    const swiperConfig: SwiperOptions = {
      slidesPerView: 1,
      spaceBetween: 16,
      loop: true,
      speed: 650,
      navigation: true,
      pagination: { clickable: true },
      autoplay: {
        delay: 5500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      },
      a11y: {
        enabled: true,
      },
    };

    Object.assign(element, swiperConfig);
    element.initialize();
  }
}
