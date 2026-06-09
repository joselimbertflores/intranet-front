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
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { MenuItem } from 'primeng/api';

import { SearchInput } from '../../../../../shared';
import { UserResponse } from '../../interfaces';
import { UserApi } from '../../services';
import { UserEditor } from '../../dialogs';

@Component({
  selector: 'app-users-admin',
  imports: [CommonModule, ButtonModule, TableModule, TagModule, SearchInput],
  templateUrl: './users-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UsersAdmin {
  private dialogService = inject(DialogService);
  private userApi = inject(UserApi);

  limit = signal(10);
  offset = signal(0);
  searchTerm = signal('');

  userResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.limit(),
      term: this.searchTerm(),
    }),
    stream: ({ params }) =>
      this.userApi.findAll(params.limit, params.offset, params.term),
  });

  dataSource = linkedSignal(() => {
    if (!this.userResource.hasValue()) return [];
    return this.userResource.value().users;
  });

  dataSize = linkedSignal(() => {
    if (!this.userResource.hasValue()) return 0;
    return this.userResource.value().total;
  });

  menuOptions = signal<MenuItem[]>([]);

  openUserDialog(user?: UserResponse) {
    const dialogRef = this.dialogService.open(UserEditor, {
      header: user ? 'Editar usuario' : 'Crear usuario',
      modal: true,
      draggable: false,
      closeOnEscape: true,
      closable: true,
      width: '40vw',
      data: user,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    dialogRef?.onClose.subscribe((result?: UserResponse) => {
      if (!result) return;
      this.updateItemDataSource(result);
    });
  }

  search(term: string) {
    this.offset.set(0);
    this.searchTerm.set(term);
  }

  changePage(event: TablePageEvent) {
    this.limit.set(event.rows);
    this.offset.set(event.first);
  }

  private updateItemDataSource(item: UserResponse): void {
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
