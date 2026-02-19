import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { DocumentTypeWithSubTypesResponse } from '../../interfaces';
import { DocumentTypeDataSource } from '../../services';
import { DocumentTypeEditor } from '../../dialogs';

@Component({
  selector: 'app-document-types-admin',
  imports: [
    TagModule,
    TableModule,
    ButtonModule,
    IconFieldModule,
    InputIconModule,
    InputTextModule,
  ],
  templateUrl: './document-types-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DocumentTypesAdmin {
  private sectionService = inject(DocumentTypeDataSource);
  private dialogService = inject(DialogService);

  dataSource = this.sectionService.dataSource;

  openDocumentTypeDialog(item?: DocumentTypeWithSubTypesResponse) {
    this.dialogService.open(DocumentTypeEditor, {
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
  }
}
