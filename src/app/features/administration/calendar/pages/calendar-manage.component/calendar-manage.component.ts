import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { FullCalendarModule } from '@fullcalendar/angular';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { CalendarEditor } from '../../dialogs';

@Component({
  selector: 'app-calendar-manage.component',
  imports: [ButtonModule, TableModule, FullCalendarModule],
  templateUrl: './calendar-manage.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CalendarManageComponent {
  private dialogService = inject(DialogService);

  openCreateDialog() {
    const dialogRef = this.dialogService.open(CalendarEditor, {
      header: 'Crear evento',
      closable: true,
      width: '40vw',
      breakpoints: {
        '640px': '90vw',
      },
    });
    dialogRef?.onClose.subscribe((result) => {
      if (!result) return;
      // this.dataSize.update((values) => (values += 1));
      // this.dataSource.update((values) => [result, ...values]);
    });
  }
}
