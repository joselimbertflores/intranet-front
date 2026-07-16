import { linkedSignal, Component, inject, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';


import { firstValueFrom } from 'rxjs';

import { CalendarEventResponse } from '../../../calendar/interfaces';
import { CalendarDataSource } from '../../../calendar/services';
import { CommunicationAdminDataSource } from '../../services';
import { CommunicationResponse } from '../../interfaces';
import { CalendarEditor } from '../../../calendar/dialogs';
import { SearchInput } from '../../../../../shared';
import { CommunicationEditor } from '../../dialogs';

@Component({
  selector: 'app-communications-admin',
  imports: [
    CommonModule,
    
    SearchInput,
  ],
  templateUrl: './communications-admin.html',

})
export default class CommunicationsAdmin {
  // private dialogService = inject(DialogService);
  private communicationServce = inject(CommunicationAdminDataSource);
  private calendarDataSource = inject(CalendarDataSource);

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

  // menuItems: MenuItem[] = [];

  onSearch(term: string) {
    this.offset.set(0);
    this.term.set(term);
  }

  chagePage(event:any) {
    this.limit.set(event.rows);
    this.offset.set(event.first);
  }

  openMenu(row: CommunicationResponse) {
    // this.menuItems = [
    //   {
    //     label: 'Opciones',
    //     items: [
    //       {
    //         label: 'Editar',
    //         icon: 'ui-icon ui-icon-pencil',
    //         command: () => this.openCommunicationDialog(row),
    //       },
    //       {
    //         label: row.eventId ? 'Editar evento' : 'Crear evento',
    //         icon: 'ui-icon ui-icon-calendar',
    //         command: async () => {
    //           if (row.eventId) {
    //             const event = await firstValueFrom(
    //               this.calendarDataSource.getOne(row.eventId),
    //             );
    //             this.openEventDialog(row, event);
    //             return;
    //           } else {
    //             this.openEventDialog(row);
    //           }
    //         },
    //       },
    //     ],
    //   },
    // ];
  }

  openCommunicationDialog(item?: CommunicationResponse) {
    // const dialogRef = this.dialogService.open(CommunicationEditor, {
    //   header: item ? 'Editar comunicado' : 'Crear comunicado',
    //   modal: true,
    //   draggable: false,
    //   closeOnEscape: true,
    //   closable: true,
    //   width: '40vw',
    //   data: item,
    //   styleClass: 'app-action-dialog',
    //   breakpoints: {
    //     '960px': '75vw',
    //     '640px': '90vw',
    //   },
    // });
    // dialogRef?.onClose.subscribe((result?: CommunicationResponse) => {
    //   if (!result) return;
    //   this.upsertItem(result);
    // });
  }

  openEventDialog(
    fromCommunication: CommunicationResponse,
    currentEvent?: CalendarEventResponse,
  ) {
    // const dialogRef = this.dialogService.open(CalendarEditor, {
    //   header: currentEvent ? 'Editar evento' : 'Crear evento',
    //   modal: true,
    //   draggable: false,
    //   closeOnEscape: true,
    //   closable: true,
    //   width: '40vw',
    //   data: currentEvent,
    //   breakpoints: {
    //     '960px': '75vw',
    //     '640px': '90vw',
    //   },
    //    styleClass: 'app-action-dialog',
    // });
    // dialogRef?.onClose.subscribe((result?: CalendarEventResponse) => {
    //   if (result && !currentEvent) {
    //     this.upsertItem({ ...fromCommunication, eventId: result.id });
    //   }
    // });
  }

  private upsertItem(item: CommunicationResponse): void {
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
