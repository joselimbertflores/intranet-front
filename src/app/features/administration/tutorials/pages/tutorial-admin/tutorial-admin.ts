import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  inject,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { TutorialDataSource } from '../../services';
import { TutorialEditor } from '../../dialogs';

@Component({
  selector: 'app-tutorial-admin',
  imports: [TableModule, ButtonModule],
  templateUrl: './tutorial-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialAdmin {
  private dialogService = inject(DialogService);
  private tutorialData = inject(TutorialDataSource);

  dataResource = rxResource({
    stream: () => this.tutorialData.findAll(),
    defaultValue: { tutorials: [], total: 0 },
  });

  dataSize = linkedSignal(() => this.dataResource.value().total);
  dataSource = linkedSignal(() => this.dataResource.value().tutorials);

  openCreateDialog() {
    const dialogRef = this.dialogService.open(TutorialEditor, {
      header: 'Crear tutorial',
      modal: true,
      width: '35vw',
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    dialogRef?.onClose.subscribe((result) => {
      if (!result) return;
      this.dataSize.update((values) => (values += 1));
      this.dataSource.update((values) => [result, ...values]);
    });
  }

  openUpdateDialog(item: any) {
    const dialogRef = this.dialogService.open(TutorialEditor, {
      header: 'Editar tutorial',
      modal: true,
      width: '35vw',
      data: item,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    dialogRef?.onClose.subscribe((result) => {
      if (!result) return;
      const index = this.dataSource().findIndex(({ id }) => result.id === id);
      if (index !== -1) {
        this.dataSource.update((values) => {
          values[index] = result;
          return [...values];
        });
      }
    });
  }
}
