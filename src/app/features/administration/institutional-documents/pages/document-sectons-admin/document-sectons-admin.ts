import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { DocumentSectionWithTypesResponse } from '../../interfaces';
import { DocumentSectionDataSource } from '../../services';
import { DocumentSectionEditor } from '../../../dialogs';

@Component({
  selector: 'app-document-sectons-admin',
  imports: [CommonModule, ButtonModule, TableModule, TagModule],
  templateUrl: './document-sectons-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export default class DocumentSectonsAdmin {
  private dialogService = inject(DialogService);
  private sectionService = inject(DocumentSectionDataSource);

  dataSource = this.sectionService.dataSource;

  openDocumentSectionDialog(item?: DocumentSectionWithTypesResponse) {
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
