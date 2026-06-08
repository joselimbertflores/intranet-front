import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';

import { DialogService } from 'primeng/dynamicdialog';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { AuthDataSource } from '../../../../../core/auth/auth-data-source';
import { PermissionAction, Resource } from '../../../../../core/auth/auth.types';
import { SearchInput } from '../../../../../shared';
import { TutorialDataSource } from '../../services';
import { TutorialDetailResponse } from '../../interfaces';
import { TutorialEditor } from '../../dialogs';

@Component({
  selector: 'app-tutorials-admin',
  imports: [
    RouterModule,
    TableModule,
    ButtonModule,
    TagModule,
    SearchInput,
  ],
  templateUrl: './tutorials-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class TutorialsAdmin {
  private dialogService = inject(DialogService);
  private tutorialData = inject(TutorialDataSource);
  private authDataSource = inject(AuthDataSource);

  limit = signal(10);
  offset = signal(0);
  term = signal('');
  canCreate = computed(() =>
    this.authDataSource.can(Resource.TUTORIALS, PermissionAction.CREATE),
  );
  canUpdate = computed(() =>
    this.authDataSource.can(Resource.TUTORIALS, PermissionAction.UPDATE),
  );
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

  openEditorDialog(item?: TutorialDetailResponse) {
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

    dialogRef?.onClose.subscribe((result?: TutorialDetailResponse) => {
      if (!result) return;
      this.upsertItem(result);
    });
  }

  private upsertItem(item: TutorialDetailResponse): void {
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
