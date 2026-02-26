import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
  afterRenderEffect,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

import { WindowScrollStore, SearchInput } from '../../../../../shared';
import { PortalCommunicationDataSource } from '../../../services';
import { CommunicationCard } from '../../../components';
import { PortalCommunicationResponse } from '../../../interfaces';

@Component({
  selector: 'app-communications-page',
  imports: [
    FormsModule,
    SelectModule,
    ButtonModule,
    CommunicationCard,
    SearchInput,
  ],
  templateUrl: './communications-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationsPage implements OnInit {
  private router = inject(Router);
  private comunicationDataSource = inject(PortalCommunicationDataSource);
  private scrollStore = inject(WindowScrollStore);

  index = signal(0);
  offset = computed(() => this.index() * 6);
  searchTerm = signal('');
  selectedType = signal<number | null>(null);

  types = this.comunicationDataSource.types;
  dataSource = signal<PortalCommunicationResponse[]>([]);
  dataSize = signal(0);
  hasMore = computed(() => this.dataSource().length < this.dataSize());

  isLoading = signal<boolean>(false);
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

  loadMore() {
    this.index.update((value) => (value += 1));
    this.getData();
  }

  search(term: string) {
    this.index.set(0);
    this.searchTerm.set(term);
  }

  openDetail(item: PortalCommunicationResponse) {
    this.comunicationDataSource.saveSnapshot({
      items: this.dataSource(),
      total: this.dataSize(),
      filters: {
        term: this.searchTerm(),
        typeId: this.selectedType(),
      },
    });
    this.router.navigate(['/communications', item.id]);
  }

  getData() {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.comunicationDataSource
      .getData({
        offset: this.offset(),
      })
      .subscribe(({ communications, total }) => {
        this.dataSource.update((values) => [...values, ...communications]);
        this.dataSize.set(total);
        this.isLoading.set(false);
      });
  }

  private loadInitialData(): void {
    const snapshot = this.comunicationDataSource.consumeSnapshot();

    if (!snapshot) return this.getData();

    this.dataSource.set(snapshot.items);
    this.dataSize.set(snapshot.total);
    this.restoreScroll.set(true);
  }
}
