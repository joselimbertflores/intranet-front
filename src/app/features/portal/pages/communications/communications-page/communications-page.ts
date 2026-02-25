import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  OnInit,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
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
  private comunicationDataSource = inject(PortalCommunicationDataSource);
  private scrollStore = inject(WindowScrollStore);

  limit = signal(10);
  index = signal(0);
  offset = computed(() => this.limit() * this.index());
  searchTerm = signal('');
  type = signal<number | null>(null);

  types = this.comunicationDataSource.types;

  // dataSource = computed(() => this.resource.value()?.communications ?? []);
  // dataSize = computed(() => this.resource.value()?.total ?? 0);
  dataSize = signal(0);
  hasMore = computed(() => this.communications().length < this.dataSize());

  // resource = rxResource({
  //   params: () => ({
  //     offset: this.offset(),
  //     limit: this.limit(),
  //     term: this.searchTerm(),
  //     type: this.type(),
  //   }),
  //   stream: ({ params }) =>
  //     this.comunicationDataSource.loadMore({
  //       limit: params.limit,
  //       offset: params.offset,
  //       term: params.term,
  //       typeId: params.type,
  //     }),
  // });
  communications = signal<PortalCommunicationResponse[]>([]);

  isLoading = signal<boolean>(true);

  private readonly scrollKey = inject(Router).url;

  constructor() {
    // afterRenderEffect(() => {
    //   if (this.resource.status() === 'resolved') {
    //     this.scrollStore.restoreScroll(this.scrollKey);
    //   }
    // });
  }

  ngOnInit(): void {
    this.getData();
  }

  loadMore() {
    this.index.update((value) => (value += 1));
    this.getData();
  }

  search(term: string) {
    this.index.set(0);
    this.searchTerm.set(term);
  }

  getData() {
    this.isLoading.set(true);
    this.comunicationDataSource
      .loadMore({
        offset: this.offset(),
      })
      .subscribe(({ communications, total }) => {
        this.dataSize.set(total);
        this.communications.update((values) => [...values, ...communications]);
        this.isLoading.set(false);
      });
  }
}
