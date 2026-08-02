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
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
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
import { RoleEditor, RoleEditorContext } from '../../dialogs';
import { RoleResponse } from '../../interfaces';
import { RoleApi } from '../../services';

interface RoleSearchModel {
  term: string;
}

@Component({
  selector: 'app-roles-admin',
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
      lucidePlus,
      lucideRefreshCw,
      lucideSearch,
    }),
  ],
  templateUrl: './roles-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class RolesAdmin {
  private readonly authDataSource = inject(AuthDataSource);
  private readonly dialogService = inject(HlmDialogService);
  private readonly roleApi = inject(RoleApi);

  readonly pageSize = signal(10);
  readonly currentPage = signal(1);
  readonly pageSizeOptions = [10, 25, 50];
  readonly offset = computed(() => this.pageSize() * (this.currentPage() - 1));

  readonly searchModel = signal<RoleSearchModel>({ term: '' });
  readonly searchForm = form(this.searchModel);
  readonly debouncedSearchModel = debounced(this.searchModel, 300);

  readonly roleResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.pageSize(),
      term: this.debouncedSearchModel.value().term.trim(),
    }),
    stream: ({ params }) => this.roleApi.findAll(params),
  });

  readonly dataSource = linkedSignal(
    () => this.roleResource.value()?.roles ?? [],
  );
  readonly dataSize = linkedSignal(
    () => this.roleResource.value()?.total ?? 0,
  );
  readonly isListLoading = computed(
    () =>
      this.debouncedSearchModel.isLoading() || this.roleResource.isLoading(),
  );
  readonly hasSearchTerm = computed(
    () => this.debouncedSearchModel.value().term.trim().length > 0,
  );
  readonly canCreateRoles = computed(() =>
    this.authDataSource.can(Resource.ROLES, PermissionAction.CREATE),
  );
  readonly canUpdateRoles = computed(() =>
    this.authDataSource.can(Resource.ROLES, PermissionAction.UPDATE),
  );

  onSearchChange(): void {
    this.currentPage.set(1);
  }

  reloadRoles(): void {
    this.roleResource.reload();
  }

  openRoleDialog(trigger: HTMLElement, role?: RoleResponse): void {
    const context: RoleEditorContext = { role };
    const dialogRef = this.dialogService.open<RoleResponse, RoleEditorContext>(
      RoleEditor,
      {
        showCloseButton: false,
        disableClose: true,
        autoFocus: false,
        restoreFocus: trigger,
        contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[760px]',
        context,
      },
    );

    dialogRef.closed$.subscribe((result) => {
      if (result) this.upsertItem(result);
    });
  }

  private upsertItem(newItem: RoleResponse): void {
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
