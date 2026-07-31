import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  debounced,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCircleAlert,
  lucideEllipsisVertical,
  lucidePencil,
  lucidePlus,
  lucideRefreshCw,
  lucideSearch,
  lucideTrash2,
} from '@ng-icons/lucide';
import {
  HlmAlertDialog,
  HlmAlertDialogImports,
} from '@spartan-ng/helm/alert-dialog';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogService } from '@spartan-ng/helm/dialog';
import { HlmDropdownMenuImports } from '@spartan-ng/helm/dropdown-menu';
import { HlmInputGroupImports } from '@spartan-ng/helm/input-group';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';

import { PaginationControls } from '../../../../../shared';
import { CalendarEventEditor, CalendarEventEditorContext } from '../../dialogs';
import { CalendarEventResponse } from '../../interfaces';
import { CalendarDataSource } from '../../services';

@Component({
  selector: 'app-calendar-admin',
  imports: [
    DatePipe,
    FormsModule,
    HlmAlertDialogImports,
    HlmBadge,
    HlmButtonImports,
    HlmDropdownMenuImports,
    HlmInputGroupImports,
    HlmSpinner,
    HlmTableImports,
    HlmTooltipImports,
    NgIcon,
    PaginationControls,
  ],
  providers: [
    provideIcons({
      lucideCircleAlert,
      lucideEllipsisVertical,
      lucidePencil,
      lucidePlus,
      lucideRefreshCw,
      lucideSearch,
      lucideTrash2,
    }),
  ],
  templateUrl: './calendar-admin.html',
})
export default class CalendarAdmin {
  private readonly calendarDataSource = inject(CalendarDataSource);
  private readonly dialogService = inject(HlmDialogService);

  readonly pageSize = signal(10);
  readonly currentPage = signal(1);
  readonly pageSizeOptions = [10, 25, 50];
  readonly offset = computed(() => this.pageSize() * (this.currentPage() - 1));

  readonly searchTerm = signal('');
  readonly debouncedSearchModel = debounced(this.searchTerm, 300);

  readonly eventResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.pageSize(),
      term: this.debouncedSearchModel.value().trim(),
    }),
    stream: ({ params }) => this.calendarDataSource.findAll(params),
  });

  readonly dataSource = linkedSignal(
    () => this.eventResource.value()?.events ?? [],
  );
  readonly dataSize = linkedSignal(
    () => this.eventResource.value()?.total ?? 0,
  );
  readonly isListLoading = computed(
    () =>
      this.debouncedSearchModel.isLoading() || this.eventResource.isLoading(),
  );
  readonly hasSearchTerm = computed(
    () => this.debouncedSearchModel.value().trim().length > 0,
  );

  readonly eventPendingDelete = signal<CalendarEventResponse | null>(null);

  onSearchChange(): void {
    this.currentPage.set(1);
  }

  reloadEvents(): void {
    this.eventResource.reload();
  }

  openEventDialog(event?: CalendarEventResponse): void {
    const context: CalendarEventEditorContext = { event };
    const dialogRef = this.dialogService.open<
      CalendarEventResponse,
      CalendarEventEditorContext
    >(CalendarEventEditor, {
      showCloseButton: false,
      disableClose: true,
      autoFocus: false,
      contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[760px]',
      context,
    });

    dialogRef.closed$.subscribe((result) => {
      if (result) this.upsertItem(result);
    });
  }

  selectEventForDeletion(event: CalendarEventResponse): void {
    this.eventPendingDelete.set(event);
  }

  onDeleteDialogClosed(): void {
    this.eventPendingDelete.set(null);
  }

  confirmRemove(deleteDialog: HlmAlertDialog): void {
    const event = this.eventPendingDelete();
    if (!event) return;

    this.calendarDataSource.remove(event.id).subscribe(() => {
      this.removeItem(event.id);
      deleteDialog.close();
    });
  }

  private upsertItem(newItem: CalendarEventResponse): void {
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
    this.dataSize.update((total) => total + 1);
  }

  private removeItem(id: string): void {
    this.dataSource.update((values) => values.filter((item) => item.id !== id));

    const total = Math.max(0, this.dataSize() - 1);
    this.dataSize.set(total);

    const lastPage = Math.max(1, Math.ceil(total / this.pageSize()));
    if (this.currentPage() > lastPage) {
      this.currentPage.set(lastPage);
      return;
    }

    if (this.dataSource().length === 0 && total > 0) {
      this.eventResource.reload();
    }
  }
}
