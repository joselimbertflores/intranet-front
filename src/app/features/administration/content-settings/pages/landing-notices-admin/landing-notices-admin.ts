import { FormsModule } from '@angular/forms';
import { Component, computed, debounced, inject, signal } from '@angular/core';
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
import { HlmNumberedPagination } from '@spartan-ng/helm/pagination';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { NgIcon, provideIcons } from '@ng-icons/core';

import { LandingNoticeEditor } from '../../dialogs';
import { LandingNoticeResponse } from '../../interfaces';
import { ContentSettingsDataSource } from '../../services';
import {
  HlmSelect,
  HlmSelectTrigger,
  HlmSelectValue,
  HlmSelectContent,
  HlmSelectItem,
} from '@spartan-ng/helm/select';

@Component({
  selector: 'app-landing-notices-admin',
  imports: [
    FormsModule,
    DatePipe,
    HlmAlertDialogImports,
    HlmBadge,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmInputGroupImports,
    HlmNumberedPagination,
    HlmSpinner,
    HlmTableImports,
    NgIcon,
    HlmSelect,
    HlmSelectTrigger,
    HlmSelectValue,
    HlmSelectContent,
    HlmSelectItem,
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
  readonly dataSource = computed(
    () => this.noticesResource.value()?.notices ?? [],
  );
  readonly dataSize = computed(() => this.noticesResource.value()?.total ?? 0);

  onSearch(term: string): void {
    this.currentPage.set(1);
    this.searchTerm.set(term);
  }

  onPageSizeChange(pageSize: number | undefined | null): void {
    const lastPage = Math.max(1, Math.ceil(this.dataSize() / (pageSize ?? 10)));
    this.currentPage.update((page) => Math.min(page, lastPage));
    this.pageSize.set(pageSize ?? 10);
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
      if (result) this.noticesResource.reload();
    });
  }

  confirmRemove(deleteDialog: HlmAlertDialog): void {
    const notice = this.noticeToDelete();
    if (!notice) return;

    this.contentDataSource.removeLandingNotice(notice.id).subscribe(() => {
      const lastPage = Math.max(
        1,
        Math.ceil((this.dataSize() - 1) / this.pageSize()),
      );

      if (this.currentPage() > lastPage) {
        this.currentPage.set(lastPage);
      } else {
        this.noticesResource.reload();
      }

      this.noticeToDelete.set(null);
      deleteDialog.close();
    });
  }

  reload(): void {
    this.noticesResource.reload();
  }

  readonly totalPages = computed(() =>
    Math.max(1, Math.ceil(this.dataSize() / this.pageSize())),
  );

  readonly firstItem = computed(() => {
    if (this.dataSize() === 0) return 0;

    return (this.currentPage() - 1) * this.pageSize() + 1;
  });

  readonly lastItem = computed(() =>
    Math.min(this.currentPage() * this.pageSize(), this.dataSize()),
  );

  previousPage(): void {
    if (this.currentPage() <= 1) return;

    this.currentPage.update((page) => page - 1);
  }

  nextPage(): void {
    if (this.currentPage() >= this.totalPages()) return;

    this.currentPage.update((page) => page + 1);
  }
}
