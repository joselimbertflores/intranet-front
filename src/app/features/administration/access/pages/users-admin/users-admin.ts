import {
  ChangeDetectionStrategy,
  Component,
  computed,
  debounced,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleAlert,
  lucideEllipsisVertical,
  lucidePencil,
  lucideRefreshCw,
  lucideSearch,
  lucideUserPlus,
} from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmTableImports } from '@spartan-ng/helm/table';

import { AuthDataSource } from '../../../../../core/auth/auth-data-source';
import {
  PermissionAction,
  Resource,
} from '../../../../../core/auth/auth.types';
import { PaginationControls } from '../../../../../shared';
import {
  UserEditor,
  UserEditorContext,
  UserImporter,
} from '../../dialogs';
import { UserResponse } from '../../interfaces';
import { UserApi } from '../../services';

interface UserSearchModel {
  term: string;
}

@Component({
  selector: 'app-users-admin',
  imports: [
    FormField,
    HlmBadge,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmInputGroupImports,
    HlmSkeleton,
    HlmTableImports,
    NgIcon,
    PaginationControls,
  ],
  providers: [
    provideIcons({
      lucideCircleAlert,
      lucideEllipsisVertical,
      lucidePencil,
      lucideRefreshCw,
      lucideSearch,
      lucideUserPlus,
    }),
  ],
  templateUrl: './users-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class UsersAdmin {
  private readonly authDataSource = inject(AuthDataSource);
  private readonly dialogService = inject(HlmDialogService);
  private readonly userApi = inject(UserApi);

  readonly pageSize = signal(10);
  readonly currentPage = signal(1);
  readonly pageSizeOptions = [10, 25, 50];
  readonly offset = computed(() => this.pageSize() * (this.currentPage() - 1));

  readonly searchModel = signal<UserSearchModel>({ term: '' });
  readonly searchForm = form(this.searchModel);
  readonly debouncedSearchModel = debounced(this.searchModel, 300);

  readonly userResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.pageSize(),
      term: this.debouncedSearchModel.value().term.trim(),
    }),
    stream: ({ params }) => this.userApi.findAll(params),
  });

  readonly dataSource = linkedSignal(
    () => this.userResource.value()?.users ?? [],
  );
  readonly dataSize = linkedSignal(
    () => this.userResource.value()?.total ?? 0,
  );
  readonly isListLoading = computed(
    () =>
      this.debouncedSearchModel.isLoading() || this.userResource.isLoading(),
  );
  readonly hasSearchTerm = computed(
    () => this.debouncedSearchModel.value().term.trim().length > 0,
  );
  readonly canImportUsers = computed(() =>
    this.authDataSource.can(Resource.USERS, PermissionAction.CREATE),
  );
  readonly canUpdateUsers = computed(() =>
    this.authDataSource.can(Resource.USERS, PermissionAction.UPDATE),
  );

  onSearchChange(): void {
    this.currentPage.set(1);
  }

  reloadUsers(): void {
    this.userResource.reload();
  }

  openUserDialog(trigger: HTMLElement, user: UserResponse): void {
    const context: UserEditorContext = { user };
    const dialogRef = this.dialogService.open<
      UserResponse,
      UserEditorContext
    >(UserEditor, {
      showCloseButton: false,
      disableClose: true,
      autoFocus: false,
      restoreFocus: trigger,
      contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[600px]',
      context,
    });

    dialogRef.closed$.subscribe((result) => {
      if (result) this.upsertItem(result);
    });
  }

  openImportUserDialog(trigger: HTMLElement): void {
    const dialogRef = this.dialogService.open<UserResponse>(UserImporter, {
      showCloseButton: false,
      disableClose: true,
      autoFocus: false,
      restoreFocus: trigger,
      contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[700px]',
    });

    dialogRef.closed$.subscribe((result) => {
      if (result) this.upsertItem(result);
    });
  }

  private upsertItem(newItem: UserResponse): void {
    const exists = this.dataSource().some(({ id }) => id === newItem.id);
    if (exists) {
      this.dataSource.update((values) =>
        values.map((item) => (item.id === newItem.id ? newItem : item)),
      );
      return;
    }

    this.dataSource.update((values) =>
      [newItem, ...values].slice(0, this.pageSize()),
    );
    this.dataSize.update((total) => total + 1);
  }
}
