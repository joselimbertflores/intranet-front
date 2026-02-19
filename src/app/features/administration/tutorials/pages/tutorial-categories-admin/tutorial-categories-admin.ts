import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  inject,
} from '@angular/core';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { TutorialCategoryDataSource } from '../../services';
import { TutorialCategoryResponse } from '../../interfaces';
import { TutorialCategoryEditor } from '../../dialogs';

@Component({
  selector: 'app-tutorial-categories-admin',
  imports: [
    TableModule,
    ButtonModule,
    ConfirmDialogModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
  ],
  templateUrl: './tutorial-categories-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ConfirmationService],
})
export default class TutorialCategoriesAdmin {
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
