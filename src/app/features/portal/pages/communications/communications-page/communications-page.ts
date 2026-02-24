import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { SelectModule } from 'primeng/select';
import { ButtonModule } from 'primeng/button';

import { PortalCommunicationDataSource } from '../../../services';
import { CommunicationCard } from '../../../components';
import { ScrollStateService, SearchInput } from '../../../../../shared';

@Component({
  selector: 'app-communications-page',
  imports: [
    FormsModule,
    SelectModule,
    ButtonModule,
    SearchInput,
    CommunicationCard,
  ],
  templateUrl: './communications-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationsPage {
  private destroyRef = inject(DestroyRef);
  private comunicationDataSource = inject(PortalCommunicationDataSource);
  private scrollStateService = inject(ScrollStateService);

  limit = signal(10);
  index = signal(0);
  offset = computed(() => this.limit() * this.index());
  searchTerm = signal('');
  type = signal<number | null>(null);

  types = this.comunicationDataSource.types;

  dataSource = computed(() => this.resource.value()?.communications ?? []);
  dataSize = computed(() => this.resource.value()?.total ?? 0);
  hasMore = computed(() => this.dataSource().length < this.dataSize());

  resource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.limit(),
      term: this.searchTerm(),
      type: this.type(),
    }),
    stream: ({ params }) =>
      this.comunicationDataSource.findAll({
        limit: params.limit,
        offset: params.offset,
        term: params.term,
        typeId: params.type,
      }),
  });

  constructor() {
    this.destroyRef.onDestroy(() => {
      console.log(window.scrollY);
      this.scrollStateService.savePosition('communications');
    });
  }

  search(term: string) {
    this.index.set(0);
    this.searchTerm.set(term);
  }

  loadMore() {
    this.index.update((index) => index + 1);
  }
}
