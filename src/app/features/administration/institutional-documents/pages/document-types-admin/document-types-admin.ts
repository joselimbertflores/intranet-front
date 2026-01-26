import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';

import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { DocumentTypeDataSource } from '../../services';
import { DocumentTypeEditor } from '../../dialogs';

@Component({
  selector: 'app-document-types-admin',
  imports: [TableModule, ButtonModule, TagModule],
  templateUrl: './document-types-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DocumentTypesAdmin {
  private sectionService = inject(DocumentTypeDataSource);
  private dialogService = inject(DialogService);

  dataSource = this.sectionService.dataSource;

  // private dialogService = inject(DialogService);
  // private clientDataSource = inject(UserDataSource);

  // roleResource = rxResource({
  //   params: () => ({
  //     offset: this.offset(),
  //     limit: this.limit(),
  //     term: this.searchTerm(),
  //   }),
  //   stream: ({ params }) =>
  //     this.clientDataSource.findAll(params.limit, params.offset, params.term),
  // });

  // dataSource = linkedSignal(() => {
  //   if (!this.roleResource.hasValue()) return [];
  //   return this.roleResource.value().users;
  // });

  // dataSize = linkedSignal(() => {
  //   if (!this.roleResource.hasValue()) return 0;
  //   return this.roleResource.value().total;
  // });

  openDocumentTypeDialog(item?: any) {
    const dialogRef = this.dialogService.open(DocumentTypeEditor, {
      header: item ? 'Editar tipo documento' : 'Crear tipo documento',
      modal: true,
      draggable: false,
      closeOnEscape: true,
      closable: true,
      width: '40vw',
      data: item,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    dialogRef?.onClose.subscribe((result?: any) => {
      if (!result) return;
      this.updateItemDataSource(result);
    });
  }

  private updateItemDataSource(item: any): void {
    // const index = this.dataSource().findIndex(({ id }) => item.id === id);
    // if (index === -1) {
    //   this.dataSource.update((values) => [item, ...values]);
    //   this.dataSize.update((value) => (value += 1));
    // } else {
    //   this.dataSource.update((values) => {
    //     values[index] = item;
    //     return [...values];
    //   });
    // }
  }
}
