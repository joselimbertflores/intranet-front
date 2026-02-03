import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TableModule, TablePageEvent } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { CalendarEventResponse } from '../../interfaces';
import { CalendarDataSource } from '../../services';
import { CalendarEditor } from '../../dialogs';
import { SearchInputComponent } from '../../../../../shared';

@Component({
  selector: 'app-calendar-admin',
  imports: [
    CommonModule,
    ButtonModule,
    TableModule,
    TagModule,
    SearchInputComponent,
  ],
  templateUrl: './calendar-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CalendarAdmin {
  private dialogService = inject(DialogService);
  private calendarDataSource = inject(CalendarDataSource);

  limit = signal(10);
  term = signal('');
  offset = signal(0);
  resource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.limit(),
      term: this.term(),
    }),
    stream: ({ params }) =>
      this.calendarDataSource.findAll(params.limit, params.offset, params.term),
  });

  dataSource = linkedSignal(() => {
    if (!this.resource.hasValue()) return [];
    return this.resource.value().events;
  });

  dataSize = linkedSignal(() => {
    if (!this.resource.hasValue()) return 0;
    return this.resource.value().total;
  });

  openEventDialog(item?: CalendarEventResponse) {
    const dialogRef = this.dialogService.open(CalendarEditor, {
      header: item ? 'Editar evento' : 'Crear evento',
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
    dialogRef?.onClose.subscribe((result?: CalendarEventResponse) => {
      if (!result) return;
      this.updateItemDataSource(result);
    });
  }

  onSearch(term: string) {
    this.offset.set(0);
    this.term.set(term);
  }

  chagePage(event: TablePageEvent) {
    this.limit.set(event.rows);
    this.offset.set(event.first);
  }

  private updateItemDataSource(item: CalendarEventResponse): void {
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
