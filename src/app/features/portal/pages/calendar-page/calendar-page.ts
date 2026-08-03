import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  linkedSignal,
  signal,
  untracked,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, ParamMap, Params, Router, RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideCalendarDays,
  lucideChevronLeft,
  lucideChevronRight,
  lucideCircleAlert,
  lucideClock3,
  lucideExternalLink,
  lucideFileText,
  lucideRefreshCw,
  lucideRepeat2,
} from '@ng-icons/lucide';
import type { BrnDialogState } from '@spartan-ng/brain/dialog';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmSkeletonImports } from '@spartan-ng/helm/skeleton';
import { HlmSpinner } from '@spartan-ng/helm/spinner';
import { HlmToggleGroupImports } from '@spartan-ng/helm/toggle-group';

import { UiBreakpointObserver } from '../../../../shared/services/ui-breakpoint-observer';
import { PublicPageHeader } from '../../components';
import { PortalCalendarResponse } from '../../interfaces';
import { PortalCalendarDataSource } from '../../services';

type CalendarView = 'month' | 'agenda';

interface CalendarQueryState {
  month: string;
  view: CalendarView | null;
}

interface CalendarRange {
  monthStart: Date;
  monthEnd: Date;
  gridStart: Date;
  gridEnd: Date;
  startIso: string;
  endIso: string;
}

interface CalendarDay {
  date: Date;
  key: string;
  dayNumber: number;
  inMonth: boolean;
  isToday: boolean;
  events: PortalCalendarResponse[];
}

interface AgendaGroup {
  key: string;
  label: string;
  events: PortalCalendarResponse[];
}

const WEEK_DAY_NAMES = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
const EVENT_COLORS = 5;

@Component({
  selector: 'app-calendar-page',
  imports: [
    HlmBadgeImports,
    HlmButtonImports,
    HlmDialogImports,
    HlmSkeletonImports,
    HlmSpinner,
    HlmToggleGroupImports,
    NgIcon,
    PublicPageHeader,
    RouterLink,
  ],
  providers: [
    provideIcons({
      lucideCalendarDays,
      lucideChevronLeft,
      lucideChevronRight,
      lucideCircleAlert,
      lucideClock3,
      lucideExternalLink,
      lucideFileText,
      lucideRefreshCw,
      lucideRepeat2,
    }),
  ],
  templateUrl: './calendar-page.html',
  styles: `
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
    }

    .calendar-day {
      min-height: 8.5rem;
    }

    .calendar-event {
      --event-surface: var(--portal-mint);
      border-color: color-mix(in oklch, var(--primary) 28%, var(--border));
      background: var(--event-surface);
      color: var(--foreground);
    }

    .calendar-event[data-event-color='1'] { --event-surface: var(--portal-sky); }
    .calendar-event[data-event-color='2'] { --event-surface: var(--portal-amber); }
    .calendar-event[data-event-color='3'] { --event-surface: var(--portal-violet); }
    .calendar-event[data-event-color='4'] { --event-surface: var(--portal-rose); }

    @media (max-width: 767px) {
      .calendar-day { min-height: 5.5rem; }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class CalendarPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly calendarDataSource = inject(PortalCalendarDataSource);
  private readonly breakpointObserver = inject(UiBreakpointObserver);
  private readonly queryParamMap = toSignal(this.route.queryParamMap, {
    initialValue: this.route.snapshot.queryParamMap,
  });
  private readonly today = this.startOfDay(new Date());
  private readonly currentMonth = this.monthKey(this.today);

  readonly weekDayNames = WEEK_DAY_NAMES;
  readonly skeletonDays = Array.from({ length: 35 });
  readonly queryState = computed(() =>
    this.parseQueryState(this.queryParamMap()),
  );
  readonly effectiveView = linkedSignal<CalendarView>(() =>
    this.queryState().view ??
    (this.breakpointObserver.isMobile() ? 'agenda' : 'month'),
  );
  readonly visibleMonth = computed(() =>
    this.dateFromMonthKey(this.queryState().month),
  );
  readonly monthTitle = computed(() =>
    new Intl.DateTimeFormat('es-BO', {
      month: 'long',
      year: 'numeric',
    }).format(this.visibleMonth()),
  );
  readonly calendarRange = computed(() =>
    this.buildCalendarRange(this.visibleMonth()),
  );

  readonly eventsResource = rxResource({
    params: () => ({
      start: this.calendarRange().startIso,
      end: this.calendarRange().endIso,
    }),
    stream: ({ params }) =>
      this.calendarDataSource.getEvents(params.start, params.end),
  });
  readonly events = signal<PortalCalendarResponse[]>([]);
  private readonly hasLoadedOnce = signal(false);
  readonly days = computed(() => this.buildCalendarDays());
  readonly agendaGroups = computed(() => this.buildAgendaGroups());
  readonly isInitialLoading = computed(
    () => this.eventsResource.isLoading() && !this.hasLoadedOnce(),
  );
  readonly isUpdating = computed(
    () => this.eventsResource.isLoading() && this.hasLoadedOnce(),
  );

  readonly selectedEvent = signal<PortalCalendarResponse | null>(null);
  readonly dialogState = signal<BrnDialogState>('closed');

  constructor() {
    effect(() => {
      const value = this.eventsResource.value();
      if (value) {
        untracked(() => {
          this.events.set(value);
          this.hasLoadedOnce.set(true);
        });
      }
    });

    effect(() => {
      const paramMap = this.queryParamMap();
      const state = this.queryState();
      const params = this.toQueryParams(state);
      if (this.queryParamsMatch(paramMap, params)) return;
      untracked(() => this.navigateToState(state, true));
    });
  }

  previousMonth(): void {
    this.moveMonth(-1);
  }

  nextMonth(): void {
    this.moveMonth(1);
  }

  goToToday(): void {
    this.navigateToState(
      { ...this.queryState(), month: this.currentMonth },
      false,
    );
  }

  changeView(
    value: CalendarView | CalendarView[] | null | undefined,
  ): void {
    if (!value || Array.isArray(value) || value === this.effectiveView()) return;
    const view = value;
    this.effectiveView.set(view);
    const responsiveDefault: CalendarView = this.breakpointObserver.isMobile()
      ? 'agenda'
      : 'month';
    this.navigateToState(
      {
        ...this.queryState(),
        view: view === responsiveDefault ? null : view,
      },
      true,
    );
  }

  showAgenda(): void {
    this.changeView('agenda');
  }

  openEvent(event: PortalCalendarResponse): void {
    this.selectedEvent.set(event);
    this.dialogState.set('open');
  }

  closeDialog(): void {
    this.dialogState.set('closed');
  }

  onDialogStateChanged(state: BrnDialogState): void {
    this.dialogState.set(state);
    if (state === 'closed') this.selectedEvent.set(null);
  }

  eventColor(event: PortalCalendarResponse): number {
    const key = event.communication?.type ?? 'Evento institucional';
    let hash = 0;
    for (const character of key) {
      hash = (hash * 31 + character.codePointAt(0)!) >>> 0;
    }
    return hash % EVENT_COLORS;
  }

  eventTime(event: PortalCalendarResponse): string {
    if (event.allDay) return 'Todo el día';
    return new Intl.DateTimeFormat('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date(event.start));
  }

  eventDateLabel(event: PortalCalendarResponse): string {
    const start = new Date(event.start);
    const end = event.end ? new Date(event.end) : null;
    const dateFormatter = new Intl.DateTimeFormat('es-BO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
    const timeFormatter = new Intl.DateTimeFormat('es-BO', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });

    if (event.allDay) {
      const inclusiveEnd = end
        ? new Date(Math.max(start.getTime(), end.getTime() - 1))
        : start;
      if (this.dateKey(start) === this.dateKey(inclusiveEnd)) {
        return `${dateFormatter.format(start)} · Todo el día`;
      }
      return `${dateFormatter.format(start)} – ${dateFormatter.format(inclusiveEnd)} · Todo el día`;
    }

    if (!end) {
      return `${dateFormatter.format(start)} · ${timeFormatter.format(start)}`;
    }
    if (this.dateKey(start) === this.dateKey(end)) {
      return `${dateFormatter.format(start)} · ${timeFormatter.format(start)}–${timeFormatter.format(end)}`;
    }
    return `${dateFormatter.format(start)}, ${timeFormatter.format(start)} – ${dateFormatter.format(end)}, ${timeFormatter.format(end)}`;
  }

  private moveMonth(amount: number): void {
    const current = this.visibleMonth();
    const next = new Date(current.getFullYear(), current.getMonth() + amount, 1);
    this.navigateToState(
      { ...this.queryState(), month: this.monthKey(next) },
      false,
    );
  }

  private buildCalendarRange(month: Date): CalendarRange {
    const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
    const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 1);
    const gridStart = new Date(monthStart);
    const mondayOffset = (monthStart.getDay() + 6) % 7;
    gridStart.setDate(gridStart.getDate() - mondayOffset);

    const gridEnd = new Date(monthEnd);
    const daysToMonday = (8 - monthEnd.getDay()) % 7;
    gridEnd.setDate(gridEnd.getDate() + daysToMonday);

    return {
      monthStart,
      monthEnd,
      gridStart,
      gridEnd,
      startIso: gridStart.toISOString(),
      endIso: gridEnd.toISOString(),
    };
  }

  private buildCalendarDays(): CalendarDay[] {
    const range = this.calendarRange();
    const days: CalendarDay[] = [];

    for (
      let date = new Date(range.gridStart);
      date < range.gridEnd;
      date = this.addDays(date, 1)
    ) {
      const dayStart = new Date(date);
      const dayEnd = this.addDays(dayStart, 1);
      days.push({
        date: dayStart,
        key: this.dateKey(dayStart),
        dayNumber: dayStart.getDate(),
        inMonth:
          dayStart >= range.monthStart && dayStart < range.monthEnd,
        isToday: this.dateKey(dayStart) === this.dateKey(this.today),
        events: this.events().filter((event) =>
          this.eventOverlaps(event, dayStart, dayEnd),
        ),
      });
    }
    return days;
  }

  private buildAgendaGroups(): AgendaGroup[] {
    const range = this.calendarRange();
    const groups = new Map<string, PortalCalendarResponse[]>();
    const visibleEvents = this.events()
      .filter((event) =>
        this.eventOverlaps(event, range.monthStart, range.monthEnd),
      )
      .sort(
        (left, right) =>
          new Date(left.start).getTime() - new Date(right.start).getTime(),
      );

    for (const event of visibleEvents) {
      const eventStart = new Date(event.start);
      const groupDate =
        eventStart < range.monthStart ? range.monthStart : eventStart;
      const key = this.dateKey(groupDate);
      groups.set(key, [...(groups.get(key) ?? []), event]);
    }

    return [...groups.entries()].map(([key, events]) => ({
      key,
      label: new Intl.DateTimeFormat('es-BO', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
      }).format(this.dateFromKey(key)),
      events,
    }));
  }

  private eventOverlaps(
    event: PortalCalendarResponse,
    rangeStart: Date,
    rangeEnd: Date,
  ): boolean {
    const start = new Date(event.start);
    const end = event.end ? new Date(event.end) : new Date(start.getTime() + 1);
    return start < rangeEnd && end > rangeStart;
  }

  private parseQueryState(paramMap: ParamMap): CalendarQueryState {
    const requestedMonth = paramMap.get('month');
    const month =
      requestedMonth && this.isValidMonthKey(requestedMonth)
        ? requestedMonth
        : this.currentMonth;
    const requestedView = paramMap.get('view');
    const view: CalendarView | null =
      requestedView === 'month' || requestedView === 'agenda'
        ? requestedView
        : null;
    return { month, view };
  }

  private toQueryParams(state: CalendarQueryState): Params {
    const params: Params = {};
    if (state.month !== this.currentMonth) params['month'] = state.month;
    if (state.view) params['view'] = state.view;
    return params;
  }

  private queryParamsMatch(paramMap: ParamMap, params: Params): boolean {
    const currentKeys = paramMap.keys.filter(
      (key) => paramMap.get(key) !== null && paramMap.get(key) !== '',
    );
    const nextKeys = Object.keys(params);
    return (
      currentKeys.length === nextKeys.length &&
      nextKeys.every((key) => paramMap.get(key) === String(params[key]))
    );
  }

  private navigateToState(state: CalendarQueryState, replaceUrl: boolean): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: this.toQueryParams(state),
      replaceUrl,
      scroll: 'manual',
    });
  }

  private isValidMonthKey(value: string): boolean {
    const match = /^(\d{4})-(\d{2})$/.exec(value);
    if (!match) return false;
    const year = Number(match[1]);
    const month = Number(match[2]);
    return year >= 1900 && year <= 2200 && month >= 1 && month <= 12;
  }

  private monthKey(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }

  private dateKey(date: Date): string {
    return `${this.monthKey(date)}-${String(date.getDate()).padStart(2, '0')}`;
  }

  private dateFromMonthKey(key: string): Date {
    const [year, month] = key.split('-').map(Number);
    return new Date(year, month - 1, 1);
  }

  private dateFromKey(key: string): Date {
    const [year, month, day] = key.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private startOfDay(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  private addDays(date: Date, amount: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount);
  }
}
