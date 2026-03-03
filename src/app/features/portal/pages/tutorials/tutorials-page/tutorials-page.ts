import {
  ChangeDetectionStrategy,
  afterRenderEffect,
  Component,
  inject,
  OnInit,
  signal,
  computed,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

import { SearchInput, WindowScrollStore } from '../../../../../shared';
import { PortalTutorialDataSource } from '../../../services';
import { PortalTutorialResponse } from '../../../interfaces';

@Component({
  selector: 'app-tutorials-page',
  imports: [
    FormsModule,
    CommonModule,
    RouterModule,
    InputTextModule,
    PaginatorModule,
    SelectModule,
    ButtonModule,
    TagModule,
    SearchInput,
  ],
  templateUrl: './tutorials-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialsPage implements OnInit {
  private router = inject(Router);
  private windowScrollStore = inject(WindowScrollStore);
  private portalTutorialDataSource = inject(PortalTutorialDataSource);

  dataSource = signal<PortalTutorialResponse[]>([]);
  dataSize = signal(0);
  isLoading = signal(false);
  categories = this.portalTutorialDataSource.categories;
  hasMore = computed(() => this.dataSource().length < this.dataSize());

  term = signal('');
  category = signal<number | null>(null);

  private restoreScroll = signal(false);
  private readonly pageSize = 12;
  private readonly scrollKey = this.router.url;

  constructor() {
    afterRenderEffect(() => {
      if (this.restoreScroll()) {
        this.windowScrollStore.restoreScroll(this.scrollKey);
      }
    });
  }

  ngOnInit(): void {
    this.loadInitialData();
  }

  fetchMore(): void {
    if (this.isLoading()) return;
    this.isLoading.set(true);
    this.portalTutorialDataSource
      .getData({
        limit: this.pageSize,
        offset: this.dataSource().length,
        category: this.category(),
        term: this.term(),
      })
      .subscribe(({ tutorials, total }) => {
        this.dataSource.update((v) => [...v, ...tutorials]);
        this.dataSize.set(total);
        this.isLoading.set(false);
      });
  }

  openDetail(item: PortalTutorialResponse) {
    this.portalTutorialDataSource.saveSnapshot({
      items: this.dataSource(),
      total: this.dataSize(),
      filters: {
        term: this.term(),
        category: this.category(),
      },
    });
    this.router.navigate(['/tutorials', item.slug]);
  }

  loadInitialData(): void {
    const snapshot = this.portalTutorialDataSource.consumeSnapshot();

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
    this.category.set(filters.category ?? null);

    this.restoreScroll.set(true);
  }

  search(term: string) {
    this.term.set(term);
    this.resetAndFetch();
  }

  filterByCategory(id: number | null) {
    this.category.set(id);
    this.resetAndFetch();
  }

  resetAndFetch() {
    this.dataSource.set([]);
    this.dataSize.set(0);
    this.fetchMore();
  }
}
