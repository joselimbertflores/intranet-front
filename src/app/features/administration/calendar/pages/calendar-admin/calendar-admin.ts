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
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';

import { SearchInputComponent } from '../../../../../shared';
import { CalendarEventResponse } from '../../interfaces';
import { CalendarDataSource } from '../../services';
import { CalendarEditor } from '../../dialogs';

@Component({
  selector: 'app-calendar-admin',
  imports: [
    CommonModule,
    ConfirmDialogModule,
    ButtonModule,
    TableModule,
    TagModule,
    MenuModule,
    SearchInputComponent,
  ],
  templateUrl: './calendar-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export default class CalendarAdmin {
  private dialogService = inject(DialogService);
  private calendarDataSource = inject(CalendarDataSource);
  private confirmationService = inject(ConfirmationService);

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

  menuItems: MenuItem[] = [];

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

  openMenu(row: CalendarEventResponse, event: Event) {
    this.menuItems = [
      {
        label: 'Opciones',
        items: [
          {
            label: 'Editar',
            icon: 'pi pi-pencil',
            command: () => this.openEventDialog(row),
          },
          {
            label: 'Eliminar',
            icon: 'pi pi-calendar',
            command: () => this.remove(row.id, event),
          },
        ],
      },
    ];
  }

  onSearch(term: string) {
    this.offset.set(0);
    this.term.set(term);
  }

  chagePage(event: TablePageEvent) {
    this.limit.set(event.rows);
    this.offset.set(event.first);
  }

  private remove(id: string, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: '¿Esta seguro que desea eliminar este evento?',
      header: 'Eliminar evento',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
      },
      accept: () => {
        this.calendarDataSource.remove(id).subscribe(() => {
          this.dataSize.update((value) => (value -= 1));
          this.dataSource.update((values) => {
            const index = values.findIndex((item) => item.id === id);
            values.splice(index, 1);
            return [...values];
          });
        });
      },
    });
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
