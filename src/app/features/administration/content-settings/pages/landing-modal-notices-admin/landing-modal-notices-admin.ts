import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  linkedSignal,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { LandingModalNoticeResponse } from '../../interfaces';
import { ContentSettingsDataSource } from '../../services';
import { LandingModalNoticeEditor } from '../../dialogs';
import { SearchInput } from '../../../../../shared';

@Component({
  selector: 'app-landing-modal-notices-admin',
  imports: [
    CommonModule,
    ButtonModule,
    ConfirmDialogModule,
    SearchInput,
    TableModule,
    TagModule,
  ],
  templateUrl: './landing-modal-notices-admin.html',
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LandingModalNoticesAdmin {
  private readonly dialogService = inject(DialogService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly contentDataSource = inject(ContentSettingsDataSource);

  limit = signal(10);
  index = signal(0);
  offset = computed(() => this.limit() * this.index());
  readonly searchTerm = signal('');

  noticesResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.limit(),
      term: this.searchTerm(),
    }),
    stream: ({ params }) =>
      this.contentDataSource.getLandingModalNotices(
        params.limit,
        params.offset,
        params.term,
      ),
  });

  dataSource = linkedSignal(() => {
    if (!this.noticesResource.hasValue()) return [];
    return this.noticesResource.value().notices;
  });

  dataSize = linkedSignal(() => {
    if (!this.noticesResource.hasValue()) return 0;
    return this.noticesResource.value().total;
  });

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  openEditor(notice?: LandingModalNoticeResponse): void {
    const dialogRef = this.dialogService.open(LandingModalNoticeEditor, {
      header: notice ? 'Editar aviso emergente' : 'Crear aviso emergente',
      modal: true,
      closable: true,
      closeOnEscape: true,
      draggable: false,
      width: 'min(92vw, 820px)',
      data: notice,
    });
    dialogRef?.onClose.subscribe((result?: LandingModalNoticeResponse) => {
      if (result) this.updateItemDataSource(result);
    });
  }

  confirmRemove(notice: LandingModalNoticeResponse): void {
    this.confirmationService.confirm({
      header: 'Eliminar aviso emergente',
      message: `¿Está seguro de eliminar “${notice.title}”?`,
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
      accept: () => {
        // this.contentDataSource
        //   .removeLandingModalNotice(notice.id)
        //   .subscribe(() =>
        //     this.notices.update((items) =>
        //       items.filter(({ id }) => id !== notice.id),
        //     ),
        //   );
      },
    });
  }

  private updateItemDataSource(item: LandingModalNoticeResponse): void {
    const index = this.dataSource().findIndex(({ id }) => item.id === id);
    if (index === -1) {
      this.dataSource.update((values) => [item, ...values]);
      this.dataSize.update((value) => (value += 1));
    } else {
      this.dataSource.update((values) => {
        values[index] = item;
        return [...values];
      });
    }
  }
}
