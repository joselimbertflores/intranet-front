import { FormsModule } from '@angular/forms';
import {
  Component,
  computed,
  debounced,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { DatePipe } from '@angular/common';
import {
  lucideMoreHorizontal,
  lucideRefreshCw,
  lucidePencil,
  lucideSearch,
  lucideTrash2,
  lucidePlus,
} from '@ng-icons/lucide';
import {
  HlmAlertDialog,
  HlmAlertDialogImports,
} from '@spartan-ng/helm/alert-dialog';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';

import { PaginationControls } from '../../../../../shared';
import { ContentSettingsDataSource } from '../../services';
import { LandingNoticeResponse } from '../../interfaces';
import { LandingNoticeEditor } from '../../dialogs';

@Component({
  selector: 'app-landing-notices-admin',
  imports: [
    FormsModule,
    DatePipe,
    HlmBadge,
    HlmDropdownMenuImports,
    HlmAlertDialogImports,
    HlmInputGroupImports,
    PaginationControls,
    HlmButtonImports,
    HlmTableImports,
    HlmSpinner,
    NgIcon,
  ],
  providers: [
    provideIcons({
      lucidePencil,
      lucidePlus,
      lucideRefreshCw,
      lucideSearch,
      lucideTrash2,
      lucideMoreHorizontal,
    }),
  ],
  templateUrl: './landing-notices-admin.html',
})
export default class LandingNoticesAdmin {
  private readonly contentDataSource = inject(ContentSettingsDataSource);
  private readonly dialogService = inject(HlmDialogService);

  readonly pageSize = signal(10);
  readonly currentPage = signal(1);
  readonly offset = computed(() => this.pageSize() * (this.currentPage() - 1));
  readonly searchTerm = signal('');
  readonly debouncedSearchTerm = debounced(this.searchTerm, 300);
  readonly noticeToDelete = signal<LandingNoticeResponse | null>(null);

  readonly noticesResource = rxResource({
    params: () => ({
      limit: this.pageSize(),
      offset: this.offset(),
      term: this.debouncedSearchTerm.value().trim(),
    }),
    stream: ({ params }) => this.contentDataSource.getLandingNotices(params),
  });
  readonly dataSource = linkedSignal(
    () => this.noticesResource.value()?.notices ?? [],
  );
  readonly dataSize = linkedSignal(
    () => this.noticesResource.value()?.total ?? 0,
  );

  onSearch(term: string): void {
    this.currentPage.set(1);
    this.searchTerm.set(term);
  }

  openEditor(notice?: LandingNoticeResponse): void {
    const dialogRef = this.dialogService.open<LandingNoticeResponse>(
      LandingNoticeEditor,
      {
        showCloseButton: false,
        disableClose: true,
        contentClass: 'w-[calc(100vw-2rem)] !max-w-[700px]',
        context: { notice },
      },
    );

    dialogRef.closed$.subscribe((result) => {
      if (result) this.upsertItem(result);
    });
  }

  confirmRemove(deleteDialog: HlmAlertDialog): void {
    const notice = this.noticeToDelete();
    if (!notice) return;

    this.contentDataSource.removeLandingNotice(notice.id).subscribe(() => {
      this.removeItem(notice.id);
      this.noticeToDelete.set(null);
      deleteDialog.close();
    });
  }

  private upsertItem(newItem: LandingNoticeResponse) {
    const exists = this.dataSource().some((item) => item.id === newItem.id);
    if (exists) {
      this.dataSource.update((values) =>
        values.map((item) => (item.id === newItem.id ? newItem : item)),
      );
      return;
    }
    this.dataSource.update((values) =>
      [newItem, ...values].slice(0, this.pageSize()),
    );
    this.dataSize.update((total) => (total += 1));
  }

  private removeItem(id: string) {
    this.dataSource.update((values) => values.filter((item) => id !== item.id));

    const total = Math.max(0, this.dataSize() - 1);
    this.dataSize.set(total);

    const lastPage = Math.max(1, Math.ceil(total / this.pageSize()));

    if (this.currentPage() > lastPage) {
      this.currentPage.set(lastPage);
      return;
    }

    if (this.dataSource().length === 0 && total > 0) {
      this.noticesResource.reload();
    }
  }
}
