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

import { TableModule, TablePageEvent } from 'primeng/table';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';

import { AuthDataSource } from '../../../../../core/auth/auth-data-source';
import {
  PermissionAction,
  Resource,
} from '../../../../../core/auth/auth.types';
import { CalendarDataSource } from '../../../calendar/services';
import { CommunicationAdminDataSource } from '../../services';
import { SearchInput } from '../../../../../shared';
import { CommunicationAdminResponse } from '../../interfaces';
import { CalendarEditor } from '../../../calendar/dialogs';
import { CommunicationEditor } from '../../dialogs';

@Component({
  selector: 'app-communications-admin',
  imports: [
    CommonModule,
    ConfirmDialogModule,
    ButtonModule,
    TableModule,
    MenuModule,
    TagModule,
    SearchInput,
  ],
  templateUrl: './communications-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export default class CommunicationsAdmin {
  private dialogService = inject(DialogService);
  private communicationServce = inject(CommunicationAdminDataSource);
  private calendarDataSource = inject(CalendarDataSource);
  private confirmationService = inject(ConfirmationService);
  private authDataSource = inject(AuthDataSource);

  limit = signal(10);
  offset = signal(0);
  term = signal('');
  canCreate = computed(() =>
    this.authDataSource.can(Resource.COMMUNICATIONS, PermissionAction.CREATE),
  );
  canUpdate = computed(() =>
    this.authDataSource.can(Resource.COMMUNICATIONS, PermissionAction.UPDATE),
  );
  canCreateCalendar = computed(() =>
    this.authDataSource.can(Resource.CALENDAR, PermissionAction.CREATE),
  );
  canUpdateCalendar = computed(() =>
    this.authDataSource.can(Resource.CALENDAR, PermissionAction.UPDATE),
  );
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

  isLoading = this.communicationResource.isLoading;

  menuItems: MenuItem[] = [];

  onSearch(term: string) {
    this.offset.set(0);
    this.term.set(term);
  }

  chagePage(event: TablePageEvent) {
    this.limit.set(event.rows);
    this.offset.set(event.first);
  }

  openCommunicationDialog(item?: CommunicationAdminResponse) {
    const dialogRef = this.dialogService.open(CommunicationEditor, {
      header: item ? 'Editar comunicado' : 'Crear comunicado',
      modal: true,
      draggable: false,
      closeOnEscape: true,
      closable: true,
      width: '40vw',
      data: item,
      styleClass: 'app-action-dialog',
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    dialogRef?.onClose.subscribe((result?: CommunicationAdminResponse) => {
      if (!result) return;
      this.upsertItem(result);
    });
  }

  opendEventDialog(item: CommunicationAdminResponse) {
    const eventData = {
      id: item.eventId,
      title: item.reference,
      description: `Actividad programada en atención al Comunicado ${item.code}`,
      communicationId: item.id,
      loadEntity: true,
    };
    const dialogRef = this.dialogService.open(CalendarEditor, {
      header: item.eventId ? 'Editar evento' : 'Crear evento',
      modal: true,
      draggable: false,
      closeOnEscape: true,
      closable: true,
      width: '40vw',
      data: eventData,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    dialogRef?.onClose.subscribe((result?: { id: string }) => {
      if (!result) return;
      this.updateItem(item.id, { eventId: result.id });
    });
  }

  openMenu(row: CommunicationAdminResponse, event: Event) {
    const items: MenuItem[] = [];

    if (this.canUpdate()) {
      items.push(
        {
          label: 'Editar',
          icon: 'pi pi-pencil',
          command: () => this.openCommunicationDialog(row),
        },
        {
          label: row.isActive ? 'Desactivar' : 'Activar',
          icon: 'pi pi-trash',
          command: () => this.toogleCommunication(row.id, row.isActive, event),
        },
      );
    }

    if (row.eventId ? this.canUpdateCalendar() : this.canCreateCalendar()) {
      items.push({
        label: 'Configurar evento',
        icon: 'pi pi-calendar',
        command: () => this.opendEventDialog(row),
      });
    }

    this.menuItems = [
      {
        label: 'Opciones',
        items,
      },
    ];
  }

  hasRowActions(row: CommunicationAdminResponse): boolean {
    return (
      this.canUpdate() ||
      (row.eventId ? this.canUpdateCalendar() : this.canCreateCalendar())
    );
  }

  private toogleCommunication(id: string, isActive: boolean, event: Event) {
    const { header, message } = !isActive
      ? {
          header: '¿Desea activar este comunicado?',
          message: 'Su evento asociado volverá a mostrarse en el calendario.',
        }
      : {
          header: '¿Desea desactivar este comunicado?',
          message: 'Su evento asociado dejará de mostrarse en el calendario.',
        };
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: message,
      header: header,
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
      },
      accept: () => {
        this.calendarDataSource
          .toggleCommunication(id, !isActive)
          .subscribe(() => {
            this.updateItem(id, { isActive: !isActive });
          });
      },
    });
  }

  private upsertItem(item: CommunicationAdminResponse): void {
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

  private updateItem(id: string, update: Partial<CommunicationAdminResponse>) {
    const index = this.dataSource().findIndex((item) => item.id === id);
    if (index !== -1) {
      this.dataSource.update((values) => {
        values[index] = {
          ...values[index],
          ...update,
        };
        return [...values];
      });
    }
  }
}
