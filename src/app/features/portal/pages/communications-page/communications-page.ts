import { DatePipe } from '@angular/common';
import {
  afterRenderEffect,
  Component,
  computed,
  ElementRef,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, ParamMap, Params, Router } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { PaginatorModule, PaginatorState } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';

import { SearchInput } from '../../../../shared';
import { PublicSectionHeader } from '../../components';
import { PortalCommunicationResponse } from '../../interfaces';
import { PortalCommunicationDataSource } from '../../services';

@Component({
  selector: 'app-communications-page',
  imports: [
    DatePipe,
    FormsModule,
    ButtonModule,
    PaginatorModule,
    SelectModule,
    SkeletonModule,
    SearchInput,
    PublicSectionHeader,
  ],
  templateUrl: './communications-page.html',
  styles: `
    :host ::ng-deep .p-paginator {
      flex-wrap: wrap;
      border-radius: var(--p-border-radius-lg);
      background: transparent;
    }

    @media (max-width: 639px) {
      :host ::ng-deep .p-paginator-current {
        width: 100%;
        order: -1;
        justify-content: center;
      }
    }
  `,
})
export default class CommunicationsPage {

  private communicationDataSource = inject(PortalCommunicationDataSource);

  private resultsTop = viewChild<ElementRef<HTMLElement>>('resultsTop');
  private pendingScrollToResults = false;

  readonly types = this.communicationDataSource.types;
  readonly skeletonItems = Array.from({ length: 6 }, (_, index) => index);

  readonly term = signal('');
  readonly selectedTypeId = signal<number | null>(null);
  readonly limit = signal(10);
  readonly offset = signal(0);

  readonly communicationResource = rxResource({
    params: () => ({
      limit: this.limit(),
      offset: this.offset(),
      term: this.term(),
      typeId: this.selectedTypeId(),
    }),
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

  constructor() {
    afterRenderEffect(() => {
      if (this.communicationResource.isLoading()) return;

      if (!this.pendingScrollToResults) return;

      this.resultsTop()?.nativeElement.scrollIntoView({
        block: 'start',
        behavior: 'smooth',
      });
      this.pendingScrollToResults = false;
    });
  }

  search(term: string): void {
    this.offset.set(0);
    this.term.set(term);
  }

  changePage(event: PaginatorState): void {
    this.limit.set(event.rows ?? 10);
    this.offset.set(event.first ?? 0);
  }
}
