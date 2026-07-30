import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  debounced,
  inject,
  linkedSignal,
  signal,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, FormField } from '@angular/forms/signals';
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

import {
  PermissionAction,
  Resource,
} from '../../../../../core/auth/auth.types';
import { AuthDataSource } from '../../../../../core/auth/auth-data-source';
import { PaginationControls } from '../../../../../shared';
import {
  CalendarEventEditor,
  CalendarEventEditorContext,
} from '../../dialogs';
import {
  CalendarEventResponse,
  RecurrenceFrequency,
} from '../../interfaces';
import { CalendarDataSource } from '../../services';

interface CalendarSearchModel {
  term: string;
}

@Component({
  selector: 'app-calendar-admin',
  imports: [
    DatePipe,
    FormField,
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
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CalendarAdmin {
  private readonly calendarDataSource = inject(CalendarDataSource);
  private readonly authDataSource = inject(AuthDataSource);
  private readonly dialogService = inject(HlmDialogService);

  readonly pageSize = signal(10);
  readonly currentPage = signal(1);
  readonly pageSizeOptions = [10, 25, 50];
  readonly offset = computed(() => this.pageSize() * (this.currentPage() - 1));

  readonly searchModel = signal<CalendarSearchModel>({ term: '' });
  readonly searchForm = form(this.searchModel);
  readonly debouncedSearchModel = debounced(this.searchModel, 300);

  readonly canCreate = computed(() =>
    this.authDataSource.can(Resource.CALENDAR, PermissionAction.CREATE),
  );
  readonly canUpdate = computed(() =>
    this.authDataSource.can(Resource.CALENDAR, PermissionAction.UPDATE),
  );
  readonly canDelete = computed(() =>
    this.authDataSource.can(Resource.CALENDAR, PermissionAction.DELETE),
  );
  readonly hasRowActions = computed(
    () => this.canUpdate() || this.canDelete(),
  );

  readonly eventResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.pageSize(),
      term: this.debouncedSearchModel.value().term.trim(),
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
      this.debouncedSearchModel.isLoading() ||
      this.eventResource.isLoading(),
  );
  readonly hasSearchTerm = computed(
    () => this.debouncedSearchModel.value().term.trim().length > 0,
  );

  readonly eventPendingDelete = signal<CalendarEventResponse | null>(null);
  private readonly deleteFocusTarget = signal<HTMLElement | null>(null);

  private readonly recurrenceNames: Readonly<
    Record<RecurrenceFrequency, string>
  > = {
    DAILY: 'Diaria',
    WEEKLY: 'Semanal',
    MONTHLY: 'Mensual',
    YEARLY: 'Anual',
  };

  onSearchChange(): void {
    this.currentPage.set(1);
  }

  reloadEvents(): void {
    this.eventResource.reload();
  }

  openEventDialog(
    event?: CalendarEventResponse,
    focusTarget?: HTMLElement,
  ): void {
    const context: CalendarEventEditorContext = { event };
    const dialogRef = this.dialogService.open<
      CalendarEventResponse,
      CalendarEventEditorContext
    >(CalendarEventEditor, {
      showCloseButton: false,
      disableClose: true,
      autoFocus: false,
      restoreFocus: focusTarget ?? true,
      contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[760px]',
      context,
    });

    dialogRef.closed$.subscribe((result) => {
      if (result) this.upsertItem(result);
    });
  }

  selectEventForDeletion(
    event: CalendarEventResponse,
    focusTarget: HTMLElement,
  ): void {
    this.eventPendingDelete.set(event);
    this.deleteFocusTarget.set(focusTarget);
  }

  confirmRemove(deleteDialog: HlmAlertDialog): void {
    const event = this.eventPendingDelete();
    if (!event) return;

    this.calendarDataSource.remove(event.id).subscribe(() => {
      this.removeItem(event.id);
      deleteDialog.close();
    });
  }

  onDeleteDialogClosed(): void {
    const focusTarget = this.deleteFocusTarget();
    this.eventPendingDelete.set(null);
    this.deleteFocusTarget.set(null);
    queueMicrotask(() => {
      if (focusTarget?.isConnected) {
        focusTarget.focus();
        return;
      }
      document.getElementById('calendar-admin-search')?.focus();
    });
  }

  recurrenceLabel(event: CalendarEventResponse): string {
    const recurrence = event.recurrenceConfig;
    if (!recurrence) return 'No';

    const frequency = this.recurrenceNames[recurrence.frequency];
    return recurrence.interval === 1
      ? frequency
      : `${frequency}, cada ${recurrence.interval}`;
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
