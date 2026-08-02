import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  debounced,
  effect,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideEllipsisVertical,
  lucideFolderCog,
  lucideListTree,
  lucidePencil,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideTrash2,
} from '@ng-icons/lucide';
import { HlmAlertDialog, HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { firstValueFrom } from 'rxjs';

import { AuthDataSource } from '../../../../../core/auth/auth-data-source';
import { PermissionAction, Resource } from '../../../../../core/auth/auth.types';
import { PaginationControls } from '../../../../../shared';
import { TutorialEditor, TutorialEditorContext } from '../../dialogs';
import { tutorialHttpErrorMessage } from '../../helpers';
import { TutorialDetailResponse, TutorialResponse } from '../../interfaces';
import { TutorialDataSource } from '../../services';

const PAGE_SIZES = [10, 25, 50] as const;

@Component({
  selector: 'app-tutorials-admin',
  imports: [
    DatePipe,
    FormsModule,
    HlmAlertDialogImports,
    HlmBadge,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmInputGroupImports,
    HlmSkeleton,
    HlmSpinner,
    HlmTableImports,
    NgIcon,
    PaginationControls,
    RouterLink,
  ],
  providers: [
    provideIcons({
      lucideEllipsisVertical,
      lucideFolderCog,
      lucideListTree,
      lucidePencil,
      lucidePlus,
      lucideRefreshCw,
      lucideSearch,
      lucideTrash2,
    }),
  ],
  templateUrl: './tutorials-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialsAdmin {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dataSourceService = inject(TutorialDataSource);
  private readonly authDataSource = inject(AuthDataSource);
  private readonly dialogService = inject(HlmDialogService);

  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });

  readonly pageSizeOptions = [...PAGE_SIZES];
  readonly listState = computed(() => {
    const params = this.queryParamMap();
    const requestedLimit = Number(params.get('limit'));
    const requestedOffset = Number(params.get('offset'));
    const limit = PAGE_SIZES.includes(requestedLimit as (typeof PAGE_SIZES)[number])
      ? requestedLimit
      : 10;
    const offset =
      Number.isInteger(requestedOffset) && requestedOffset >= 0
        ? requestedOffset
        : 0;
    return { term: params.get('term')?.trim() ?? '', limit, offset };
  });

  readonly searchTerm = linkedSignal(() => this.listState().term);
  readonly debouncedSearchTerm = debounced(this.searchTerm, 300);
  readonly currentPage = computed(
    () => Math.floor(this.listState().offset / this.listState().limit) + 1,
  );

  readonly tutorialsResource = rxResource({
    params: () => this.listState(),
    stream: ({ params }) => this.dataSourceService.findAll(params),
  });
  readonly tutorials = linkedSignal(
    () => this.tutorialsResource.value()?.tutorials ?? [],
  );
  readonly total = linkedSignal(() => this.tutorialsResource.value()?.total ?? 0);
  readonly isListLoading = computed(
    () => this.debouncedSearchTerm.isLoading() || this.tutorialsResource.isLoading(),
  );

  readonly pendingDelete = signal<TutorialResponse | null>(null);
  readonly deleteError = signal<string | null>(null);
  readonly deleting = signal(false);

  readonly canCreate = computed(() =>
    this.authDataSource.can(Resource.TUTORIALS, PermissionAction.CREATE),
  );
  readonly canUpdate = computed(() =>
    this.authDataSource.can(Resource.TUTORIALS, PermissionAction.UPDATE),
  );
  readonly canDelete = computed(() =>
    this.authDataSource.can(Resource.TUTORIALS, PermissionAction.DELETE),
  );

  constructor() {
    effect(() => {
      const params = this.queryParamMap();
      const state = this.listState();
      if (
        params.get('limit') !== String(state.limit) ||
        params.get('offset') !== String(state.offset)
      ) {
        this.updateQuery({ limit: state.limit, offset: state.offset });
      }
    });

    effect(() => {
      const term = this.debouncedSearchTerm.value().trim();
      if (term === this.listState().term) return;
      this.updateQuery({
        term: term || null,
        limit: this.listState().limit,
        offset: 0,
      });
    });
  }

  changePage(page: number): void {
    const limit = this.listState().limit;
    this.updateQuery({ offset: (page - 1) * limit });
  }

  changePageSize(limit: number): void {
    this.updateQuery({ limit, offset: 0 });
  }

  openTutorialDialog(tutorial?: TutorialResponse): void {
    const dialogRef = this.dialogService.open<
      TutorialDetailResponse,
      TutorialEditorContext
    >(TutorialEditor, {
      showCloseButton: false,
      autoFocus: 'input',
      contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-lg',
      context: { tutorial },
    });

    dialogRef.closed$.subscribe((result) => {
      if (!result) return;
      if (!tutorial) {
        void this.router.navigate([
          '/administration/tutorials',
          result.id,
          'edit',
        ]);
        return;
      }
      this.tutorials.update((items) =>
        items.map((item) => (item.id === result.id ? result : item)),
      );
    });
  }

  prepareDelete(tutorial: TutorialResponse): void {
    this.deleteError.set(null);
    this.pendingDelete.set(tutorial);
  }

  async confirmRemove(dialog: HlmAlertDialog): Promise<void> {
    const tutorial = this.pendingDelete();
    if (!tutorial || this.deleting()) return;

    this.deleting.set(true);
    this.deleteError.set(null);
    try {
      await firstValueFrom(this.dataSourceService.remove(tutorial.id));
      this.tutorials.update((items) => items.filter(({ id }) => id !== tutorial.id));
      const newTotal = Math.max(0, this.total() - 1);
      this.total.set(newTotal);
      dialog.close();

      const maxOffset = Math.max(0, Math.floor(Math.max(0, newTotal - 1) / this.listState().limit) * this.listState().limit);
      if (this.listState().offset > maxOffset) {
        this.updateQuery({ offset: maxOffset });
      } else if (this.tutorials().length === 0 && newTotal > 0) {
        this.tutorialsResource.reload();
      }
    } catch (error) {
      this.deleteError.set(
        tutorialHttpErrorMessage(error, 'No se pudo eliminar el tutorial'),
      );
    } finally {
      this.deleting.set(false);
    }
  }

  resetDeleteState(): void {
    this.pendingDelete.set(null);
    this.deleteError.set(null);
  }

  private updateQuery(queryParams: Record<string, string | number | null>): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
      queryParamsHandling: 'merge',
      replaceUrl: true,
      scroll: 'manual',
    });
  }
}
