import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { DocSectionManageResponse } from '../../interfaces';
import { DocumentSectionDataSource } from '../../services';
import { DocumentSectionEditor } from '../../dialogs';

@Component({
  selector: 'app-document-sections-admin',
  imports: [
    TagModule,
    ButtonModule,
    TableModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './document-sections-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export default class DocumentSectionsAdmin {
  private dialogService = inject(DialogService);
  private sectionService = inject(DocumentSectionDataSource);

  dataSource = this.sectionService.dataSource;

  openDocumentSectionDialog(item?: DocSectionManageResponse) {
    this.dialogService.open(DocumentSectionEditor, {
      header: item ? 'Editar seccion documento' : 'Crear seccion documento',
      modal: true,
      draggable: false,
      closeOnEscape: true,
      closable: true,
      width: '35vw',
      data: item,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
  }
}
