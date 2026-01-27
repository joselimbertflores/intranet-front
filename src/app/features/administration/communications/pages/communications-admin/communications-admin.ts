import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { rxResource } from '@angular/core/rxjs-interop';
import { DialogService } from 'primeng/dynamicdialog';
import { TextareaModule } from 'primeng/textarea';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { CommunicationManageDataSource } from '../../services';
import { SearchInputComponent } from '../../../../../shared';
import { CommunicationEditor } from '../../dialogs';

@Component({
  selector: 'app-communications-admin',
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    TextareaModule,
    SearchInputComponent,
  ],
  templateUrl: './communications-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationsAdmin {
  private dialogService = inject(DialogService);
  private communicationServce = inject(CommunicationManageDataSource);

  limit = signal(10);
  index = signal(0);
  term = signal('');
  offset = computed(() => this.index() * this.limit());
  communicationResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.limit(),
      term: this.term(),
    }),
    stream: ({ params }) => this.communicationServce.findAll(params),
  });

  dataSource = linkedSignal(() => {
    if (!this.communicationResource.hasValue()) return [];
    return this.communicationResource.value().communications;
  });

  dataSize = linkedSignal(() => {
    if (!this.communicationResource.hasValue()) return 0;
    return this.communicationResource.value().total;
  });

  onSearch(term: string) {
    this.term.set(term);
  }

  openCreateDialog() {
    const dialogRef = this.dialogService.open(CommunicationEditor, {
      header: 'Crear comunicado',
      modal: true,
      width: '40vw',
      breakpoints: {
        '640px': '90vw',
      },
    });
    dialogRef?.onClose.subscribe((result) => {
      if (!result) return;
      this.dataSize.update((values) => (values += 1));
      this.dataSource.update((values) => [result, ...values]);
    });
  }

  openUpdateDialog(item: any) {
    const dialogRef = this.dialogService.open(CommunicationEditor, {
      header: 'Editar comunicado',
      modal: true,
      width: '45vw',
      data: item,
      breakpoints: {
        '640px': '90vw',
      },
    });
    dialogRef?.onClose.subscribe((result) => {
      if (!result) return;
      const index = this.dataSource().findIndex(({ id }) => result.id === id);
      if (index !== -1) {
        this.dataSource.update((values) => {
          values[index] = result;
          return [...values];
        });
      }
    });
  }
}
