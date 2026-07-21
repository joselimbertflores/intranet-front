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
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucidePencil,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideTrash2,
} from '@ng-icons/lucide';
import { HlmAlertDialogImports } from '@spartan-ng/helm/alert-dialog';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';

import { LandingNoticeEditor } from '../../dialogs';
import { LandingNoticeResponse } from '../../interfaces';
import { ContentSettingsDataSource } from '../../services';
import { tap } from 'rxjs';

@Component({
  selector: 'app-landing-notices-admin',
  imports: [
    CommonModule,
    HlmAlertDialogImports,
    HlmBadge,
    HlmButton,
    HlmInputGroupImports,
    HlmSpinner,
    HlmTableImports,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucidePencil,
      lucidePlus,
      lucideRefreshCw,
      lucideSearch,
      lucideTrash2,
    }),
  ],
  templateUrl: './landing-notices-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class LandingNoticesAdmin {
  private readonly contentDataSource = inject(ContentSettingsDataSource);
  private readonly dialogService = inject(HlmDialogService);

  readonly searchTerm = signal('');
  readonly noticesResource = rxResource({
    stream: () =>
      this.contentDataSource
        .getLandingNotices()
        .pipe(tap((resp) => console.log(resp))),
  });
  readonly dataSource = linkedSignal(
    () => this.noticesResource.value()?.notices ?? [],
  );
  readonly dataSize = linkedSignal(
    () => this.noticesResource.value()?.total ?? 0,
  );

  readonly filteredNotices = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase();
    if (!term) return this.dataSource();

    return this.dataSource().filter(({ title }) =>
      title.toLocaleLowerCase().includes(term),
    );
  });

  onSearch(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  openEditor(notice?: LandingNoticeResponse): void {
    const dialogRef = this.dialogService.open<LandingNoticeResponse>(
      LandingNoticeEditor,
      {
        showCloseButton: false,
        disableClose: true,
        contentClass: 'w-[calc(100vw-2rem)] !max-w-[800px]',
        context: { notice },
      },
    );

    dialogRef.closed$.subscribe((result) => {
      if (result) this.upsertItem(result);
    });
  }

  confirmRemove(notice: LandingNoticeResponse): void {
    this.contentDataSource.removeLandingNotice(notice.id).subscribe(() => {
      this.dataSource.update((items) =>
        items.filter(({ id }) => id !== notice.id),
      );
      this.dataSize.update((value) => Math.max(0, value - 1));
    });
  }

  reload(): void {
    this.noticesResource.reload();
  }

  private upsertItem(item: LandingNoticeResponse): void {
    const index = this.dataSource().findIndex(({ id }) => item.id === id);

    if (index === -1) {
      this.dataSource.update((values) => [item, ...values]);
      this.dataSize.update((value) => value + 1);
      return;
    }

    this.dataSource.update((values) =>
      values.map((value) => (value.id === item.id ? item : value)),
    );
  }
}
