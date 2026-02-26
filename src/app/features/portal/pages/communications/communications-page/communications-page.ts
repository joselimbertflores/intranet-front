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

interface TempLoadedData {
  items: PortalCommunicationResponse[];
  total: number;
}
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

  readonly pageSize = 6;
  dataSource = signal<PortalCommunicationResponse[]>([]);
  dataSize = signal(0);
  isLoading = signal<boolean>(false);
  hasMore = computed(() => this.dataSource().length < this.dataSize());

  term = signal('');
  type = signal<number | null>(null);
  restoreScroll = signal(false);

  private unfilteredBackup: TempLoadedData | null = null;

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
    // TRANSICIÓN: sin filtros → con filtros
    // “Hasta ahora NO había filtros y ahora SÍ se va a aplicar uno”, evita tocar nuevamente la data ya guardada antes de filtrar
    if (!this.isFiltering() && term) {
      this.unfilteredBackup = {
        items: [...this.dataSource()],
        total: this.dataSize(),
      };
    }
    this.term.set(term);
    if (term) {
      this.resetAndFetch();
    } else {
      this.restoreOrReload();
    }
  }

  filterByType(id: number | null) {
    // TRANSICIÓN: sin filtros → con filtros
    if (!this.isFiltering() && id !== null) {
      this.unfilteredBackup = {
        items: [...this.dataSource()],
        total: this.dataSize(),
      };
    }

    this.type.set(id);

    if (id !== null) {
      this.resetAndFetch();
    } else {
      this.restoreOrReload();
    }
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

  loadInitial() {
    this.dataSource.set([]);
    this.fetchMore();
  }

  applyFilter(term?: string, typeId?: number | null) {
    // 👉 si antes NO había filtros, guardamos el estado actual
    if (!this.isFiltering && (term || typeId !== null)) {
      // Evitamos actualizar data cuando ya se filtra, se conservan los primeros datos
      this.unfilteredBackup = {
        items: [...this.dataSource()],
        total: this.dataSize(),
      };
    }

    this.term.set(term ?? '');
    this.type.set(typeId ?? null);

    // reiniciamos el listado filtrado
    this.dataSource.set([]);
    this.dataSize.set(0);
    this.fetchMore();
  }

  clearFilters() {
    this.term.set('');
    this.type.set(null);

    if (this.unfilteredBackup) {
      // 👉 restauramos exactamente lo que había antes
      this.dataSource.set(this.unfilteredBackup.items);
      this.dataSize.set(this.unfilteredBackup.total);
      this.unfilteredBackup = null; // one-shot
      return;
    }

    // fallback (por seguridad)
    this.dataSource.set([]);
    this.dataSize.set(0);
    this.fetchMore();
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

  restoreOrReload() {
    if (this.unfilteredBackup) {
      this.dataSource.set(this.unfilteredBackup.items);
      this.dataSize.set(this.unfilteredBackup.total);
      this.unfilteredBackup = null;
    } else {
      this.resetAndFetch();
    }
  }
}
