import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';


import { PortalService } from '../../services/portal.service';
import {
  DocumentListComponent,
  FilterDocumentsComponent,
} from '../../components';
import { DocumentResponse } from '../../../infrastructure';

@Component({
  selector: 'app-document-repository',
  imports: [DocumentListComponent, FilterDocumentsComponent],
  templateUrl: './document-repository.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DocumentRepositoryComponent {
  private portalService = inject(PortalService);

  dataSize = signal(0);
  limit = signal(10);
  index = signal(0);
  offset = computed(() => this.limit() * this.index());
  dataSource = signal<DocumentResponse[]>([]);

  constructor() {}

  ngOnInit() {
    this.getData();
  }

  getData(filterParams?: object): void {
    this.portalService
      .filterDocuments({
        limit: this.limit(),
        offset: this.offset(),
        ...filterParams,
      })
      .subscribe(({ documents, total }) => {
        console.log(documents);
        this.dataSource.set(documents);
        this.dataSize.set(total);
      });
  }

  downloadDocument(doc: DocumentResponse) {
    this.portalService
      .dowloadDocument(doc.id, doc.fileName, doc.originalName)
      .subscribe(({ newCount }) => {
        if (!newCount) return;
        this.dataSource.update((values) => {
          const index = values.findIndex((item) => item.id === doc.id);
          if (index !== -1) {
            values[index].downloadCount = newCount;
          }
          return [...values];
        });
      });
  }

  resetFilter() {
    this.index.set(0);
    this.getData();
  }

  changePage(event: { index: number; limit: number }) {
    this.limit.set(event.limit);
    this.index.set(event.index);
    this.getData();
  }
}
