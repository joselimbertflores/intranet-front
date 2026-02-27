import {
  ChangeDetectionStrategy,
  afterRenderEffect,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

import { WindowScrollStore, SearchInput } from '../../../../../shared';
import { PortalCommunicationDataSource } from '../../../services';
import { PortalCommunicationResponse } from '../../../interfaces';
import { CommunicationCard } from '../../../components';

@Component({
  selector: 'app-communications-page',
  imports: [
    SelectModule,
    ButtonModule,
    FormsModule,
    SearchInput,
    CommunicationCard,
  ],
  templateUrl: './communications-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationsPage implements OnInit {
  private router = inject(Router);
  private comunicationDataSource = inject(PortalCommunicationDataSource);
  private scrollStore = inject(WindowScrollStore);

  readonly types = this.comunicationDataSource.types;

  readonly pageSize = 12;
  dataSource = signal<PortalCommunicationResponse[]>([]);
  dataSize = signal(0);
  isLoading = signal<boolean>(false);
  hasMore = computed(() => this.dataSource().length < this.dataSize());

  term = signal('');
  type = signal<number | null>(null);
  restoreScroll = signal(false);

  private readonly scrollKey = this.router.url;

  constructor() {
    afterRenderEffect(() => {
      if (this.restoreScroll()) {
        this.scrollStore.restoreScroll(this.scrollKey);
      }
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  search(term: string) {
    this.term.set(term);
    this.resetAndFetch();
  }

  filterByType(id: number | null) {
    this.type.set(id);
    this.resetAndFetch();
  }

  openDetail(item: PortalCommunicationResponse) {
    this.comunicationDataSource.saveSnapshot({
      items: this.dataSource(),
      total: this.dataSize(),
      filters: {
        term: this.term(),
        typeId: this.type(),
      },
    });
    this.router.navigate(['/communications', item.id]);
  }

  loadInitialData(): void {
    const snapshot = this.comunicationDataSource.consumeSnapshot();

    if (!snapshot) {
      this.dataSource.set([]);
      this.dataSize.set(0);
      this.fetchMore();
      return;
    }

    const { items, total, filters } = snapshot;

    this.dataSource.set(items);
    this.dataSize.set(total);

    this.term.set(filters.term ?? '');
    this.type.set(filters.typeId ?? null);

    this.restoreScroll.set(true);
  }

  fetchMore(): void {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.comunicationDataSource
      .getData({
        limit: this.pageSize,
        offset: this.dataSource().length,
        type: this.type(),
        term: this.term(),
      })
      .subscribe(({ communications, total }) => {
        this.dataSource.update((v) => [...v, ...communications]);
        this.dataSize.set(total);
        this.isLoading.set(false);
      });
  }

  isFiltering(): boolean {
    return !!this.term() || this.type() !== null;
  }

  resetAndFetch() {
    this.dataSource.set([]);
    this.dataSize.set(0);
    this.fetchMore();
  }
}
