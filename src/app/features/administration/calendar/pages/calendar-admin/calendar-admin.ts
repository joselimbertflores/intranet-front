import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

import {
  PermissionAction,
  Resource,
} from '../../../../../core/auth/auth.types';
import { AuthDataSource } from '../../../../../core/auth/auth-data-source';
import { CalendarEventResponse } from '../../interfaces';
import { SearchInput } from '../../../../../shared';
import { CalendarDataSource } from '../../services';
import { CalendarEditor } from '../../dialogs';

@Component({
  selector: 'app-calendar-admin',
  imports: [CommonModule, SearchInput],
  templateUrl: './calendar-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CalendarAdmin {
  // private dialogService = inject(DialogService);
  private calendarDataSource = inject(CalendarDataSource);
  // private confirmationService = inject(ConfirmationService);
  private authDataSource = inject(AuthDataSource);

  limit = signal(10);
  term = signal('');
  offset = signal(0);
  canCreate = computed(() =>
    this.authDataSource.can(Resource.CALENDAR, PermissionAction.CREATE),
  );
  canUpdate = computed(() =>
    this.authDataSource.can(Resource.CALENDAR, PermissionAction.UPDATE),
  );
  canDelete = computed(() =>
    this.authDataSource.can(Resource.CALENDAR, PermissionAction.DELETE),
  );
  hasRowActions = computed(() => this.canUpdate() || this.canDelete());
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

  menuItems: any[] = [];

  openEventDialog(item?: CalendarEventResponse) {
    // const dialogRef = this.dialogService.open(CalendarEditor, {
    //   header: item ? 'Editar evento' : 'Crear evento',
    //   modal: true,
    //   draggable: false,
    //   closeOnEscape: true,
    //   closable: true,
    //   width: '40vw',
    //   data: item,
    //   breakpoints: {
    //     '960px': '75vw',
    //     '640px': '90vw',
    //   },
    //   styleClass: 'app-action-dialog',
    // });
    // dialogRef?.onClose.subscribe((result?: CalendarEventResponse) => {
    //   if (!result) return;
    //   this.updateItemDataSource(result);
    // });
  }

  openMenu(row: CalendarEventResponse, event: Event) {
    const items: any[] = [];

    if (this.canUpdate()) {
      items.push({
        label: 'Editar',
        icon: 'ui-icon ui-icon-pencil',
        command: () => this.openEventDialog(row),
      });
    }

    if (this.canDelete()) {
      items.push({
        label: 'Eliminar',
        icon: 'ui-icon ui-icon-calendar',
        command: () => this.remove(row.id, event),
      });
    }

    this.menuItems = [
      {
        label: 'Opciones',
        items,
      },
    ];
  }

  onSearch(term: string) {
    this.offset.set(0);
    this.term.set(term);
  }

  chagePage(event: any) {
    this.limit.set(event.rows);
    this.offset.set(event.first);
  }

  private remove(id: string, event: Event) {
    // this.confirmationService.confirm({
    //   target: event.target as EventTarget,
    //   message: '¿Esta seguro que desea eliminar este evento?',
    //   header: 'Eliminar evento',
    //   rejectButtonProps: {
    //     label: 'Cancelar',
    //     severity: 'secondary',
    //     outlined: true,
    //   },
    //   acceptButtonProps: {
    //     label: 'Aceptar',
    //   },
    //   accept: () => {
    //     this.calendarDataSource.remove(id).subscribe(() => {
    //       this.dataSize.update((value) => (value -= 1));
    //       this.dataSource.update((values) => {
    //         const index = values.findIndex((item) => item.id === id);
    //         values.splice(index, 1);
    //         return [...values];
    //       });
    //     });
    //   },
    // });
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
