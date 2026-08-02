import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, linkedSignal, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideEllipsisVertical,
  lucidePencil,
  lucidePlus,
  lucideTrash2,
} from '@ng-icons/lucide';
import { HlmAlertDialog, HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmSkeleton } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { firstValueFrom } from 'rxjs';

import { AuthDataSource } from '../../../../../core/auth/auth-data-source';
import { PermissionAction, Resource } from '../../../../../core/auth/auth.types';
import { TutorialCategoryEditor } from '../../dialogs';
import { tutorialHttpErrorMessage } from '../../helpers';
import { TutorialCategoryResponse } from '../../interfaces';
import { TutorialCategoryDataSource } from '../../services';

@Component({
  selector: 'app-tutorial-categories-admin',
  imports: [
    HlmAlertDialogImports,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmSkeleton,
    HlmSpinner,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucideArrowLeft,
      lucideEllipsisVertical,
      lucidePencil,
      lucidePlus,
      lucideTrash2,
    }),
  ],
  templateUrl: './tutorial-categories-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialCategoriesAdmin {
  private readonly dataSource = inject(TutorialCategoryDataSource);
  private readonly dialogService = inject(HlmDialogService);
  private readonly authDataSource = inject(AuthDataSource);
  private readonly location = inject(Location);
  private readonly router = inject(Router);
  private readonly hasPreviousNavigation = Boolean(
    this.router.currentNavigation()?.previousNavigation ??
      this.router.lastSuccessfulNavigation()?.previousNavigation,
  );

  readonly categoriesResource = rxResource({ stream: () => this.dataSource.findAll() });
  readonly categories = linkedSignal(() => this.categoriesResource.value() ?? []);
  readonly pendingDelete = signal<TutorialCategoryResponse | null>(null);
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

  goBack(): void {
    if (this.hasPreviousNavigation) {
      this.location.back();
      return;
    }
    void this.router.navigate(['/administration/tutorials']);
  }

  openEditor(category?: TutorialCategoryResponse): void {
    const ref = this.dialogService.open<TutorialCategoryResponse>(
      TutorialCategoryEditor,
      {
        showCloseButton: false,
        autoFocus: 'input',
        contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-md',
        context: { category },
      },
    );
    ref.closed$.subscribe((result) => {
      if (!result) return;
      const exists = this.categories().some(({ id }) => id === result.id);
      this.categories.update((items) =>
        exists
          ? items.map((item) => (item.id === result.id ? result : item))
          : [result, ...items],
      );
    });
  }

  prepareDelete(category: TutorialCategoryResponse): void {
    this.pendingDelete.set(category);
    this.deleteError.set(null);
  }

  async confirmRemove(dialog: HlmAlertDialog): Promise<void> {
    const category = this.pendingDelete();
    if (!category || this.deleting()) return;
    this.deleting.set(true);
    this.deleteError.set(null);
    try {
      await firstValueFrom(this.dataSource.remove(category.id));
      this.categories.update((items) => items.filter(({ id }) => id !== category.id));
      dialog.close();
    } catch (error) {
      this.deleteError.set(
        tutorialHttpErrorMessage(error, 'No se pudo eliminar la categoría'),
      );
    } finally {
      this.deleting.set(false);
    }
  }

  resetDelete(): void {
    this.pendingDelete.set(null);
    this.deleteError.set(null);
  }
}
