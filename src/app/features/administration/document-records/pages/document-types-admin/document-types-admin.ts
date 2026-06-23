import { linkedSignal, Component, inject, signal } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { DocumentTypeWithSubTypesResponse } from '../../interfaces';
import { DocumentTypeDatasource } from '../../services';
import { SearchInput } from '../../../../../shared';
import { DocumentTypeEditor } from '../../dialogs';

@Component({
  selector: 'app-document-types-admin',
  imports: [
    TagModule,
    TableModule,
    ButtonModule,
    SearchInput,
  ],
  templateUrl: './document-types-admin.html',
})
export default class DocumentTypesAdmin {
  private docTypeDataSource = inject(DocumentTypeDatasource);
  private dialogService = inject(DialogService);

  limit = signal(10);
  offset = signal(0);
  searchTerm = signal('');

  docTypeResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.limit(),
      term: this.searchTerm(),
    }),
    stream: ({ params }) =>
      this.docTypeDataSource.findAll(params.limit, params.offset, params.term),
  });

  constructor() {
    this.listenRemoveSubtypeEvent();
  }

  dataSource = linkedSignal(() => {
    if (!this.docTypeResource.hasValue()) return [];
    return this.docTypeResource.value().data;
  });

  dataSize = linkedSignal(() => {
    if (!this.docTypeResource.hasValue()) return 0;
    return this.docTypeResource.value().total;
  });

  openDocumentTypeDialog(item?: DocumentTypeWithSubTypesResponse) {
    const ref = this.dialogService.open(DocumentTypeEditor, {
      header: item ? 'Editar tipo documento' : 'Crear tipo documento',
      closeOnEscape: true,
      draggable: false,
      closable: true,
      width: '40vw',
      data: item,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    ref?.onClose.subscribe((result?: DocumentTypeWithSubTypesResponse) => {
      if (!result) return;
      this.upsertItem(result);
    });
  }

  search(term: string) {
    this.searchTerm.set(term);
    this.offset.set(0);
  }

  private upsertItem(newItem: DocumentTypeWithSubTypesResponse) {
    const index = this.dataSource().findIndex((item) => item.id === newItem.id);
    if (index !== -1) {
      this.dataSource.update((values) => {
        values[index] = newItem;
        return [...values];
      });
    } else {
      this.dataSource.update((values) => [newItem, ...values]);
      this.dataSize.update((value) => (value += 1));
    }
  }

  private listenRemoveSubtypeEvent(): void {
    this.docTypeDataSource.subtypeRemoved$
      .pipe(takeUntilDestroyed())
      .subscribe(({ typeId, subtypeId }) => {
        this.dataSource.update((types) =>
          types.map((type) =>
            type.id === typeId
              ? {
                  ...type,
                  subtypes: type.subtypes.filter(({ id }) => id !== subtypeId),
                }
              : type,
          ),
        );
      });
  }
}
