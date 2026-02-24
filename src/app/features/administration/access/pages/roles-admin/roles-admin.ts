import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { TableModule, TablePageEvent } from 'primeng/table';
import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';

import { SearchInput } from '../../../../../shared';
import { RoleDataSource } from '../../services';
import { RoleResponse } from '../../interfaces';
import { RoleEditor } from '../../dialogs';

@Component({
  selector: 'app-roles-admin',
  imports: [ButtonModule, TableModule, SearchInput],
  templateUrl: './roles-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RolesAdmin {
  private dialogService = inject(DialogService);
  private roleDataSource = inject(RoleDataSource);

  limit = signal(10);
  offset = signal(0);
  searchTerm = signal('');
  roleResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.limit(),
      term: this.searchTerm(),
    }),
    stream: ({ params }) =>
      this.roleDataSource.findAll({
        limit: params.limit,
        offset: params.offset,
        term: params.term,
      }),
  });

  dataSource = linkedSignal(() => {
    if (!this.roleResource.hasValue()) return [];
    return this.roleResource.value().roles;
  });

  dataSize = linkedSignal(() => {
    if (!this.roleResource.hasValue()) return 0;
    return this.roleResource.value().total;
  });

  openRoleDialog(role?: RoleResponse) {
    const dialogRef = this.dialogService.open(RoleEditor, {
      header: role ? 'Editar rol' : 'Crear rol',
      modal: true,
      draggable: false,
      closeOnEscape: true,
      closable: true,
      width: '30vw',
      data: role,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    dialogRef?.onClose.subscribe((result?: RoleResponse) => {
      if (!result) return;
      this.updateItemDataSource(result);
    });
  }

  searchRoles(term: string) {
    this.offset.set(0);
    this.searchTerm.set(term);
  }

  changePage(event: TablePageEvent) {
    this.limit.set(event.rows);
    this.offset.set(event.first);
  }

  private updateItemDataSource(item: RoleResponse): void {
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
