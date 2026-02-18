import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  inject,
} from '@angular/core';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { TutorialCategoryDataSource } from '../../services';
import { TutorialCategoryEditor } from '../../dialogs';
import { TutorialCategoryResponse } from '../../interfaces';

@Component({
  selector: 'app-tutorial-category-admin',
  imports: [TableModule, ButtonModule, ConfirmDialogModule],
  templateUrl: './tutorial-category-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export default class TutorialCategoryAdmin {
  private dialogService = inject(DialogService);
  private tutorialCategoryDataSource = inject(TutorialCategoryDataSource);
  private confirmationService = inject(ConfirmationService);

  dataSource = linkedSignal(() => this.tutorialCategoryDataSource.categories());

  openEditorDialog(item?: TutorialCategoryResponse) {
    const dialogRef = this.dialogService.open(TutorialCategoryEditor, {
      header: item ? 'Editar categoria tutorial' : 'Crear categoria tutorial',
      draggable: false,
      closable: true,
      width: '30vw',
      data: item,
      breakpoints: {
        '960px': '60vw',
        '640px': '90vw',
      },
    });

    dialogRef?.onClose.subscribe((result?: TutorialCategoryResponse) => {
      if (!result) return;
      this.upsertItem(result);
    });
  }

  remove(item: TutorialCategoryResponse) {
    this.confirmationService.confirm({
      message: `¿Esta seguro que desea eliminar la categoria "${item.name}"?`,
      header: 'Eliminar categoria',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
      },
      accept: () => {
        this.tutorialCategoryDataSource.remove(item.id).subscribe(({ ok }) => {
          if (ok) {
            this.dataSource.update((values) =>
              values.filter(({ id }) => id !== item.id),
            );
          }
        });
      },
    });
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
