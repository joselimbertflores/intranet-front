import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';
import { Router, RouterModule } from '@angular/router';

import {
  HeroSlideResponse,
  QuickAccessResponse,
} from '../../../administration/content-settings/interfaces';
import { HomePortalDataResponse } from '../../interfaces';
import { PortalService } from '../../services';

interface FrequentView {
  title: string;
  description: string;
  icon: string;
  queryParams: {
    term?: string;
    typeId?: number;
    subtypeId?: number;
    sectionId?: number;
  };
}

interface LandingCommunication {
  id: string | number;
  reference?: string;
  title?: string;
  code?: string;
  previewUrl?: string;
  publicationDate?: string;
  createdAt?: string;
  description?: string;
  summary?: string;
  type?: {
    name?: string;
  };
}

interface LandingDocument {
  id: string | number;
  displayName: string;
  section?: {
    name?: string;
  };
  type?: {
    name?: string;
  };
  fiscalYear?: number;
  downloadCount?: number;
}

@Component({
  selector: 'landing-page',
  imports: [CommonModule, RouterModule],
  templateUrl: './landing-page.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LandingPageComponent {
  private router = inject(Router);
  private portalService = inject(PortalService);

  readonly isLoading = this.portalService.isPortalLoading;

  readonly portalData = computed<HomePortalDataResponse | undefined>(
    () => this.portalService.portalData(),
  );

  readonly highlights = computed(() =>
    [...(this.portalData()?.slides ?? [])]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .slice(0, 6),
  );

  readonly quickAccess = computed(() =>
    [...(this.portalData()?.quickAccess ?? [])]
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .slice(0, 12),
  );

  readonly communications = computed<LandingCommunication[]>(() =>
    (this.portalData()?.communications ?? []).slice(0, 8),
  );

  readonly featuredDocuments = computed<LandingDocument[]>(() =>
    [...((this.portalData()?.documents ?? []) as LandingDocument[])]
      .sort((a, b) => (b.downloadCount ?? 0) - (a.downloadCount ?? 0))
      .slice(0, 8),
  );

  readonly frequentViews: FrequentView[] = [
    {
      title: 'Normativa y Reglamentos',
      description: 'Ordenanzas, resoluciones y marcos normativos vigentes.',
      icon: 'pi pi-book',
      queryParams: { term: 'normativa' },
    },
    {
      title: 'Formularios Institucionales',
      description: 'Formatos administrativos de uso frecuente.',
      icon: 'pi pi-file-edit',
      queryParams: { term: 'formulario' },
    },
    {
      title: 'Manuales y Procedimientos',
      description: 'Protocolos internos y guías operativas.',
      icon: 'pi pi-briefcase',
      queryParams: { term: 'manual' },
    },
    {
      title: 'Presupuesto y Planificación',
      description: 'Documentación presupuestaria y de gestión institucional.',
      icon: 'pi pi-chart-bar',
      queryParams: { term: 'presupuesto' },
    },
  ];

  hasHighlightLink(item: HeroSlideResponse): boolean {
    return !!this.getHighlightLink(item);
  }

  openHighlight(item: HeroSlideResponse): void {
    const link = this.getHighlightLink(item);
    if (!link) return;
    this.navigateByLink(link);
  }

  openQuickAccess(item: QuickAccessResponse): void {
    // if (!item.redirectUrl) return;
    // this.navigateByLink(item.redirectUrl);
  }

  highlightTitle(item: HeroSlideResponse): string {
    return item.title?.trim() || 'Aviso institucional';
  }

  highlightDescription(item: HeroSlideResponse): string {
    return (
      item.description?.trim() ||
      'Información relevante para el funcionamiento institucional.'
    );
  }

  quickAccessDescription(item: QuickAccessResponse): string {
    return `Ingreso al sistema institucional ${item.name}.`;
  }

  communicationTitle(item: LandingCommunication): string {
    return (
      item.reference?.trim() ||
      item.title?.trim() ||
      'Comunicado institucional'
    );
  }

  communicationDescription(item: LandingCommunication): string {
    return (
      item.description?.trim() ||
      item.summary?.trim() ||
      'Publicación oficial disponible para consulta interna.'
    );
  }

  documentTitle(item: LandingDocument): string {
    return item.displayName?.trim() || 'Documento institucional';
  }

  documentCategory(item: LandingDocument): string {
    if (item.section?.name && item.type?.name) {
      return `${item.section.name} | ${item.type.name}`;
    }
    return item.section?.name || item.type?.name || 'Documento oficial';
  }

  documentQuery(item: LandingDocument): { term: string } {
    return { term: item.displayName || '' };
  }

  private getHighlightLink(item: HeroSlideResponse): string | null {
    const link = (
      item as HeroSlideResponse & { redirectUrl?: string; redirecttUrl?: string }
    ).redirectUrl
      ? (item as HeroSlideResponse & { redirectUrl: string }).redirectUrl
      : item.redirecttUrl;

    return link?.trim() || null;
  }

  private navigateByLink(link: string): void {
    if (/^https?:\/\//i.test(link)) {
      window.open(link, '_blank', 'noopener,noreferrer');
      return;
    }
    const normalizedLink = link.startsWith('/') ? link : `/${link}`;
    this.router.navigateByUrl(normalizedLink);
  }
}
