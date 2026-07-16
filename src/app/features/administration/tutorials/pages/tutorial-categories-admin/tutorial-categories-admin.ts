import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  computed,
  inject,
} from '@angular/core';

// import { ConfirmDialogModule } from '@app/shared/ui-compat';
// import { DialogService } from '@app/shared/ui-compat';
// import { InputTextModule } from '@app/shared/ui-compat';
// import { IconFieldModule } from '@app/shared/ui-compat';
// import { InputIconModule } from '@app/shared/ui-compat';
// import { ConfirmationService } from '@app/shared/ui-compat';
// import { ButtonModule } from '@app/shared/ui-compat';
// import { TableModule } from '@app/shared/ui-compat';

import { AuthDataSource } from '../../../../../core/auth/auth-data-source';
import {
  PermissionAction,
  Resource,
} from '../../../../../core/auth/auth.types';
import { TutorialCategoryDataSource } from '../../services';
import { TutorialCategoryResponse } from '../../interfaces';
import { TutorialCategoryEditor } from '../../dialogs';

@Component({
  selector: 'app-tutorial-categories-admin',
  imports: [],
  templateUrl: './tutorial-categories-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialCategoriesAdmin {
  // private dialogService = inject(DialogService);
  private tutorialCategoryDataSource = inject(TutorialCategoryDataSource);
  // private confirmationService = inject(ConfirmationService);
  private authDataSource = inject(AuthDataSource);

  dataSource = linkedSignal(() => this.tutorialCategoryDataSource.categories());
  canCreate = computed(() =>
    this.authDataSource.can(Resource.TUTORIALS, PermissionAction.CREATE),
  );
  canUpdate = computed(() =>
    this.authDataSource.can(Resource.TUTORIALS, PermissionAction.UPDATE),
  );
  canDelete = computed(() =>
    this.authDataSource.can(Resource.TUTORIALS, PermissionAction.DELETE),
  );

  openEditorDialog(item?: TutorialCategoryResponse) {
    // const dialogRef = this.dialogService.open(TutorialCategoryEditor, {
    //   header: item ? 'Editar categoria tutorial' : 'Crear categoria tutorial',
    //   draggable: false,
    //   closable: true,
    //   width: '30vw',
    //   data: item,
    //   breakpoints: {
    //     '960px': '60vw',
    //     '640px': '90vw',
    //   },
    // });
    // dialogRef?.onClose.subscribe((result?: TutorialCategoryResponse) => {
    //   if (!result) return;
    //   this.upsertItem(result);
    // });
  }

  remove(item: TutorialCategoryResponse) {
    // this.confirmationService.confirm({
    //   message: `¿Esta seguro que desea eliminar la categoria "${item.name}"?`,
    //   header: 'Eliminar categoria',
    //   rejectButtonProps: {
    //     label: 'Cancelar',
    //     severity: 'secondary',
    //     outlined: true,
    //   },
    //   acceptButtonProps: {
    //     label: 'Aceptar',
    //   },
    //   accept: () => {
    //     this.tutorialCategoryDataSource.remove(item.id).subscribe(({ ok }) => {
    //       if (ok) {
    //         this.dataSource.update((values) =>
    //           values.filter(({ id }) => id !== item.id),
    //         );
    //       }
    //     });
    //   },
    // });
  }

  private upsertItem(item: TutorialCategoryResponse): void {
    const index = this.dataSource().findIndex(({ id }) => item.id === id);
    if (index === -1) {
      this.dataSource.update((values) => [item, ...values]);
    } else {
      this.dataSource.update((values) => {
        values[index] = item;
        return [...values];
      });
    }
  }
}
