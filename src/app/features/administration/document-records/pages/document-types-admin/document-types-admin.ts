import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';

import { DialogService } from 'primeng/dynamicdialog';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { AuthDataSource } from '../../../../../core/auth/auth-data-source';
import {
  PermissionAction,
  Resource,
} from '../../../../../core/auth/auth.types';
import { DocumentTypeWithSubTypesResponse } from '../../interfaces';
import { DocumentTypeDataSource } from '../../services';
import { DocumentTypeEditor } from '../../dialogs';
import { rxResource } from '@angular/core/rxjs-interop';

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
  private docTypeApi = inject(DocumentTypeDataSource);
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
    stream: ({ params }) => this.docTypeApi.findAll(params.limit, params.offset, params.term),
  });

  dataSource = linkedSignal(() => {
    if (!this.docTypeResource.hasValue()) return [];
    return this.docTypeResource.value().data;
  });

  dataSize = linkedSignal(() => {
    if (!this.docTypeResource.hasValue()) return 0;
    return this.docTypeResource.value().total;
  });

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
