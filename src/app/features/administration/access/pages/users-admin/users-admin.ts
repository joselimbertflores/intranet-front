import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';

// import { TableModule, TablePageEvent } from '@app/shared/ui-compat';
// import { DialogService } from '@app/shared/ui-compat';
// import { ButtonModule } from '@app/shared/ui-compat';
// import { TagModule } from '@app/shared/ui-compat';
// import { MenuItem } from '@app/shared/ui-compat';

import { UserEditor, UserImporter } from '../../dialogs';
import { SearchInput } from '../../../../../shared';
import { UserResponse } from '../../interfaces';
import { UserApi } from '../../services';

@Component({
  selector: 'app-users-admin',
  imports: [CommonModule, SearchInput],
  templateUrl: './users-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UsersAdmin {
  // private dialogService = inject(DialogService);
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

  menuOptions = signal<any[]>([]);

  openUserDialog(user?: UserResponse) {
    // const dialogRef = this.dialogService.open(UserEditor, {
    //   header: user ? 'Editar usuario' : 'Crear usuario',
    //   modal: true,
    //   draggable: false,
    //   closeOnEscape: true,
    //   closable: true,
    //   width: '30vw',
    //   data: user,
    //   breakpoints: {
    //     '960px': '75vw',
    //     '640px': '90vw',
    //   },
    // });
    // dialogRef?.onClose.subscribe((result?: UserResponse) => {
    //   if (!result) return;
    //   this.upsertItem(result);
    // });
  }

  openImportUserDialog() {
    // const dialogRef = this.dialogService.open(UserImporter, {
    //   header: 'Importar usuario',
    //   modal: true,
    //   draggable: false,
    //   closeOnEscape: true,
    //   closable: true,
    //   width: '30vw',
    //   breakpoints: {
    //     '960px': '75vw',
    //     '640px': '90vw',
    //   },
    // });
    // dialogRef?.onClose.subscribe((result?: UserResponse) => {
    //   if (!result) return;
    //   this.upsertItem(result);
    // });
  }

  search(term: string) {
    this.offset.set(0);
    this.searchTerm.set(term);
  }

  changePage(event: any) {
    this.limit.set(event.rows);
    this.offset.set(event.first);
  }

  private upsertItem(item: UserResponse): void {
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
