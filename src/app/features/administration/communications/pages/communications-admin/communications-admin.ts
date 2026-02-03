import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

import { TableModule, TablePageEvent } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
import { TextareaModule } from 'primeng/textarea';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { CommunicationManageDataSource } from '../../services';
import { SearchInputComponent } from '../../../../../shared';
import { CommunicationManageResponse } from '../../interfaces';
import { CommunicationEditor } from '../../dialogs';

@Component({
  selector: 'app-communications-admin',
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    TextareaModule,
    SearchInputComponent,
    TagModule,
  ],
  templateUrl: './communications-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CommunicationsAdmin {
  private dialogService = inject(DialogService);
  private communicationServce = inject(CommunicationManageDataSource);

  limit = signal(10);
  offset = signal(0);
  term = signal('');
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
    this.offset.set(0);
    this.term.set(term);
  }

  chagePage(event: TablePageEvent) {
    this.limit.set(event.rows);
    this.offset.set(event.first);
  }

  openCommunicationDialog(item?: CommunicationManageResponse) {
    const dialogRef = this.dialogService.open(CommunicationEditor, {
      header: item ? 'Editar comunicado' : 'Crear comunicado',
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
    dialogRef?.onClose.subscribe((result?: CommunicationManageResponse) => {
      if (!result) return;
      this.updateItemDataSource(result);
    });
  }

  private updateItemDataSource(item: CommunicationManageResponse): void {
    const index = this.dataSource().findIndex(({ id }) => item.id === id);
    if (index === -1) {
      this.dataSource.update((values) => [item, ...values]);
      this.dataSize.update((value) => (value += 1));
    } else {
      this.dataSource.update((values) => {
        values[index] = item;
        return [...values];
      });
    }
  }
}
