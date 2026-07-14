import { DatePipe } from '@angular/common';
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  viewChild,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { map } from 'rxjs';

import { SearchInput, WindowScrollStore } from '../../../../../shared';
import { PublicSectionHeader } from '../../../components';
import { PortalCommunicationResponse } from '../../../interfaces';
import { PortalCommunicationDataSource } from '../../../services';

type CommunicationTableRow = PortalCommunicationResponse & {
  isSkeleton?: boolean;
};

@Component({
  selector: 'app-communications-page',
  imports: [
    DatePipe,
    FormsModule,
    ButtonModule,
    SelectModule,
    SkeletonModule,
    TableModule,
    TagModule,
    SearchInput,
    PublicSectionHeader,
  ],
  templateUrl: './communications-page.html',
  styleUrl: './communications-page.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationsPage {
  private readonly DEFAULT_LIMIT = 12;
  private readonly DEFAULT_OFFSET = 0;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private communicationDataSource = inject(PortalCommunicationDataSource);
  private scrollStore = inject(WindowScrollStore);

  private tableTop = viewChild<ElementRef<HTMLElement>>('tableTop');
  private pendingScrollToTable = false;
  private scrollRestored = false;
  private readonly scrollKey = this.router.url.split('?')[0];

  readonly types = this.communicationDataSource.types;
  readonly skeletonRows: CommunicationTableRow[] = Array.from(
    { length: 6 },
    (_, index) => ({
      id: `communication-skeleton-${index}`,
      reference: '',
      type: '',
      createdAt: '',
      code: '',
      isSkeleton: true,
    }),
  );

  readonly queryParams = toSignal(
    this.route.queryParamMap.pipe(map((params) => this.mapQueryParams(params))),
    { initialValue: this.mapQueryParams(this.route.snapshot.queryParamMap) },
  );

  readonly term = computed(() => this.queryParams().term ?? '');
  readonly type = computed(() => this.queryParams().type);
  readonly limit = computed(() => this.queryParams().limit);
  readonly offset = computed(() => this.queryParams().offset);

  readonly communicationResource = rxResource({
    params: () => this.queryParams(),
    stream: ({ params }) => this.communicationDataSource.getData(params),
  });

  readonly communications = computed<PortalCommunicationResponse[]>(() => {
    if (!this.communicationResource.hasValue()) return [];
    return this.communicationResource.value().communications;
  });

  readonly dataSize = computed(() => {
    if (!this.communicationResource.hasValue()) return 0;
    return this.communicationResource.value().total;
  });

  readonly tableRows = computed<CommunicationTableRow[]>(() =>
    this.communicationResource.isLoading()
      ? this.skeletonRows
      : this.communications(),
  );

  readonly isFiltering = computed(
    () => Boolean(this.term()) || this.type() !== null,
  );

  constructor() {
    afterRenderEffect(() => {
      if (this.communicationResource.isLoading()) return;

      if (!this.scrollRestored) {
        this.scrollStore.restoreScroll(this.scrollKey);
        this.scrollRestored = true;
      }

      if (!this.pendingScrollToTable) return;

      this.tableTop()?.nativeElement.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      });
      this.pendingScrollToTable = false;
    });
  }

  search(term: string): void {
    this.setQueryParams({
      term: this.normalizeTerm(term),
      offset: this.DEFAULT_OFFSET,
    });
  }

  filterByType(type: number | null): void {
    this.setQueryParams({
      type: type ?? null,
      offset: this.DEFAULT_OFFSET,
    });
  }

  changePage(event: TablePageEvent): void {
    this.setQueryParams(
      {
        limit: event.rows,
        offset: event.first,
      },
      { scrollToTable: true },
    );
  }

  openDetail(item: PortalCommunicationResponse): void {
    this.router.navigate(['/communications', item.id]);
  }

  private setQueryParams(
    params: Params,
    options: { scrollToTable?: boolean } = {},
  ): void {
    if (options.scrollToTable) {
      this.pendingScrollToTable = true;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      replaceUrl: true,
      scroll: 'manual',
      queryParams: params,
    });
  }

  private mapQueryParams(params: ParamMap) {
    return {
      term: this.normalizeTerm(params.get('term')),
      type: this.parseType(params.get('type')),
      limit: this.parseLimit(params.get('limit')),
      offset: this.parseOffset(params.get('offset')),
    };
  }

  private normalizeTerm(value: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private parseType(value: string | null): number | null {
    if (!value) return null;
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
  }

  private parseLimit(value: string | null): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 && parsed <= 100
      ? parsed
      : this.DEFAULT_LIMIT;
  }

  private parseOffset(value: string | null): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed >= 0
      ? parsed
      : this.DEFAULT_OFFSET;
  }
}
