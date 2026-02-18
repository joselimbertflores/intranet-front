import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';

import { TutorialDataSource } from '../../services';
import { TutorialEditor } from '../../dialogs';
import { TutorialResponse } from '../../../interfaces';
import { SearchInputComponent } from '../../../../../shared';
import { RouterLink } from "@angular/router";

@Component({
  selector: 'app-tutorial-admin',
  imports: [TableModule, ButtonModule, SearchInputComponent, RouterLink],
  templateUrl: './tutorial-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialAdmin {
  private dialogService = inject(DialogService);
  private tutorialData = inject(TutorialDataSource);

  limit = signal(10);
  offset = signal(0);
  term = signal('');
  dataResource = rxResource({
    params: () => ({
      limit: this.limit(),
      offset: this.offset(),
      term: this.term(),
    }),
    stream: ({ params }) => this.tutorialData.findAll(params),
  });

  dataSource = linkedSignal(() =>
    this.dataResource.hasValue() ? this.dataResource.value().tutorials : [],
  );
  dataSize = linkedSignal(() =>
    this.dataResource.hasValue() ? this.dataResource.value().total : 0,
  );

  onSearch(term: string) {
    this.offset.set(0);
    this.term.set(term);
  }

  openEditorDialog(item?: TutorialResponse) {
    const dialogRef = this.dialogService.open(TutorialEditor, {
      header: item ? 'Editar tutorial' : 'Crear tutorial',
      draggable: false,
      closable: true,
      width: '30vw',
      data: item,
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });

    dialogRef?.onClose.subscribe((result?: TutorialResponse) => {
      if (!result) return;
      this.upsertItem(result);
    });
  }

  private upsertItem(item: TutorialResponse): void {
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
