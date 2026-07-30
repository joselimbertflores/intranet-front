import {
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
  lucideCalendarCog,
  lucideCalendarPlus,
  lucideCalendarX,
  lucideCircleAlert,
  lucideEllipsisVertical,
  lucideExternalLink,
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

import { CommunicationAdminDataSource } from '../../services';
import { PaginationControls } from '../../../../../shared';
import { CommunicationResponse } from '../../interfaces';
import { CommunicationEditor } from '../../dialogs';
import {
  CalendarEventEditor,
  CalendarEventEditorContext,
} from '../../../calendar/dialogs';
import { CalendarEventResponse } from '../../../calendar/interfaces';
import { CalendarDataSource } from '../../../calendar/services';

interface CommunicationSearchModel {
  term: string;
}

@Component({
  selector: 'app-communications-admin',
  imports: [
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
      lucideCalendarCog,
      lucideCalendarPlus,
      lucideCalendarX,
      lucideEllipsisVertical,
      lucideExternalLink,
      lucidePencil,
      lucidePlus,
      lucideRefreshCw,
      lucideSearch,
      lucideTrash2,
    }),
  ],
  templateUrl: './communications-admin.html',
})
export default class CommunicationsAdmin {
  private readonly communicationDataSource = inject(
    CommunicationAdminDataSource,
  );
  private readonly dialogService = inject(HlmDialogService);
  private readonly calendarDataSource = inject(CalendarDataSource);

  readonly pageSize = signal(10);
  readonly currentPage = signal(1);
  readonly pageSizeOptions = [10, 25, 50];
  readonly offset = computed(() => this.pageSize() * (this.currentPage() - 1));

  readonly searchModel = signal<CommunicationSearchModel>({ term: '' });
  readonly searchForm = form(this.searchModel);
  readonly debouncedSearchModel = debounced(this.searchModel, 300);

  readonly communicationResource = rxResource({
    params: () => ({
      offset: this.offset(),
      limit: this.pageSize(),
      term: this.debouncedSearchModel.value().term.trim(),
    }),
    stream: ({ params }) => this.communicationDataSource.findAll(params),
  });

  readonly dataSource = linkedSignal(
    () => this.communicationResource.value()?.communications ?? [],
  );
  readonly dataSize = linkedSignal(
    () => this.communicationResource.value()?.total ?? 0,
  );
  readonly isListLoading = computed(
    () =>
      this.debouncedSearchModel.isLoading() ||
      this.communicationResource.isLoading(),
  );
  readonly hasSearchTerm = computed(
    () => this.debouncedSearchModel.value().term.trim().length > 0,
  );

  readonly communicationPendingDelete = signal<CommunicationResponse | null>(
    null,
  );
  onSearchChange(): void {
    this.currentPage.set(1);
  }

  reloadCommunications(): void {
    this.communicationResource.reload();
  }

  openEditor(communication?: CommunicationResponse): void {
    const dialogRef = this.dialogService.open<CommunicationResponse>(
      CommunicationEditor,
      {
        showCloseButton: false,
        disableClose: true,
        contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[700px]',
        context: { communication },
      },
    );

    dialogRef.closed$.subscribe((result) => {
      if (result) {
        this.upsertItem({
          ...result,
          ...(communication?.eventId && {
            eventId: result.eventId ?? communication.eventId,
          }),
        });
      }
    });
  }

  openCalendarEditor(
    communication: CommunicationResponse,
    focusTarget: HTMLElement,
  ): void {
    if (!communication.eventId) {
      this.showCalendarEditor(communication, focusTarget);
      return;
    }

    this.calendarDataSource.getOne(communication.eventId).subscribe((event) => {
      this.showCalendarEditor(communication, focusTarget, event);
    });
  }

  confirmRemove(deleteDialog: HlmAlertDialog): void {
    const communication = this.communicationPendingDelete();
    if (!communication) return;

    this.communicationDataSource.remove(communication.id).subscribe(() => {
      this.removeItem(communication.id);
      deleteDialog.close();
    });
  }

  confirmRemoveWithEvent(deleteDialog: HlmAlertDialog): void {
    const communication = this.communicationPendingDelete();
    if (!communication?.eventId) return;

    this.calendarDataSource
      .removeWithCommunication(communication.eventId)
      .subscribe(() => {
        this.removeItem(communication.id);
        deleteDialog.close();
      });
  }

  selectCommunicationForDeletion(communication: CommunicationResponse): void {
    this.communicationPendingDelete.set(communication);
  }

  onDeleteDialogClosed(): void {
    this.communicationPendingDelete.set(null);
  }

  private upsertItem(newItem: CommunicationResponse): void {
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

  private showCalendarEditor(
    communication: CommunicationResponse,
    focusTarget: HTMLElement,
    event?: CalendarEventResponse,
  ): void {
    const context: CalendarEventEditorContext = {
      event,
      communicationId: communication.id,
      ...(!event && {
        initialValues: {
          title: communication.reference,
          description: `CITE: ${communication.code}`,
          startDate: communication.createdAt,
        },
      }),
    };

    const dialogRef = this.dialogService.open<
      CalendarEventResponse,
      CalendarEventEditorContext
    >(CalendarEventEditor, {
      showCloseButton: false,
      disableClose: true,
      autoFocus: false,
      restoreFocus: focusTarget,
      contentClass: 'w-[calc(100vw-2rem)] sm:!max-w-[760px]',
      context,
    });

    dialogRef.closed$.subscribe((result) => {
      if (!result || event) return;

      this.dataSource.update((values) =>
        values.map((item) =>
          item.id === communication.id ? { ...item, eventId: result.id } : item,
        ),
      );
    });
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
      this.communicationResource.reload();
    }
  }
}
