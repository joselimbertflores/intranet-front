import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';

import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';

import { LandingNoticeEditor } from '../../dialogs';
import { LandingNoticeResponse } from '../../interfaces';
import { ContentSettingsDataSource } from '../../services';
import { SearchInput } from '../../../../../shared';

@Component({
  selector: 'app-landing-notices-admin',
  imports: [
    CommonModule,
    ButtonModule,
    ConfirmDialogModule,
    SearchInput,
    TableModule,
    TagModule,
  ],
  templateUrl: './landing-notices-admin.html',
  providers: [ConfirmationService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LandingNoticesAdmin {
  private readonly dialogService = inject(DialogService);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly contentDataSource = inject(ContentSettingsDataSource);

  searchTerm = signal('');
  limit = signal(10);
  offset = signal(0);
  readonly noticesResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.limit(),
      term: this.searchTerm(),
    }),
    stream: () => this.contentDataSource.getLandingNotices(),
  });
  dataSource = linkedSignal(() => this.noticesResource.value()?.notices ?? []);
  dataSize = linkedSignal(() => this.noticesResource.value()?.total ?? 0);

  filteredNotices = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase();
    if (!term) return this.dataSource();

    return this.dataSource().filter(({ title }) =>
      title.toLocaleLowerCase().includes(term),
    );
  });

  onSearch(term: string): void {
    this.searchTerm.set(term);
  }

  openEditor(notice?: LandingNoticeResponse): void {
    const dialogRef = this.dialogService.open(LandingNoticeEditor, {
      header: notice ? 'Editar aviso emergente' : 'Crear aviso emergente',
      modal: true,
      closable: true,
      closeOnEscape: true,
      draggable: false,
      width: 'min(92vw, 820px)',
      data: notice,
      styleClass: 'app-action-dialog',
    });
    dialogRef?.onClose.subscribe((result?: LandingNoticeResponse) => {
      if (result) this.upsertItem(result);
    });
  }

  confirmRemove(notice: LandingNoticeResponse): void {
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
        this.contentDataSource.removeLandingNotice(notice.id).subscribe(() => {
          this.dataSource.update((items) =>
            items.filter(({ id }) => id !== notice.id),
          );
          this.dataSize.update((value) => (value -= 1));
          if (this.dataSource().length === 0 && this.dataSize() > 0) {
            this.noticesResource.reload();
          }
        });
      },
    });
  }

  private upsertItem(item: LandingNoticeResponse): void {
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
