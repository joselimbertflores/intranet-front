import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowRight,
  lucideImageOff,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCheckbox } from '@spartan-ng/helm/checkbox';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import { HlmLabel } from '@spartan-ng/helm/label';
import type { BrnDialogState } from '@spartan-ng/brain/dialog';
import { timer } from 'rxjs';
import { register } from 'swiper/element/bundle';
import type { SwiperContainer } from 'swiper/element';
import type { Swiper } from 'swiper/types';

import { InstitutionalLogo } from '../../../../../../shared/components/institutional-logo/institutional-logo';
import { LandingNotice } from '../../../../models';

const DISMISSED_LANDING_NOTICES_STORAGE_KEY =
  'intranet:dismissed-landing-notices';

register();

@Component({
  selector: 'landing-notices-dialog',
  imports: [
    HlmButtonImports,
    HlmCheckbox,
    HlmDialogImports,
    HlmLabel,
    InstitutionalLogo,
    NgIcon,
    NgTemplateOutlet,
  ],
  providers: [
    provideIcons({ lucideArrowLeft, lucideArrowRight, lucideImageOff }),
  ],
  template: `
    <hlm-dialog
      [state]="dialogState()"
      (stateChanged)="onDialogStateChanged($event)"
    >
      <hlm-dialog-content
        *hlmDialogPortal
        class="mx-0 flex max-h-[90dvh] w-[92vw] max-w-[92vw] min-w-0 flex-col overflow-hidden data-closed:zoom-out-[0.98] data-closed:duration-150 data-open:zoom-in-[0.98] data-open:duration-200 motion-reduce:animate-none sm:max-w-[52rem]"
      >
        <hlm-dialog-header
          class="min-w-0 shrink-0 flex-row items-center gap-3 pe-10"
        >
          <institutional-logo class="size-10 rounded-full bg-primary" />
          <h2
            hlmDialogTitle
            class="wrap-break-word text-xl font-bold tracking-[-0.02em] text-primary"
          >
            Avisos
          </h2>
        </hlm-dialog-header>

        <ng-template #noticeContent let-notice>
          <article
            class="max-h-[calc(90dvh-16rem)] w-full min-w-0 overflow-x-hidden overflow-y-auto px-1 pb-1"
          >
            <h3
              class="w-full min-w-0 max-w-[28ch] wrap-break-word text-balance text-2xl leading-tight font-bold tracking-[-0.02em] text-primary"
            >
              {{ notice.title }}
            </h3>

            @if (notice.imageUrl) {
              @if (hasImageFailed(notice)) {
                <div
                  class="mt-5 flex w-fit max-w-full items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
                  role="status"
                >
                  <ng-icon
                    name="lucideImageOff"
                    size="1rem"
                    aria-hidden="true"
                  />
                  <span>No se pudo cargar la imagen</span>
                </div>
              } @else {
                <div
                  class="mt-5 flex w-full min-w-0 max-w-full items-center justify-center overflow-hidden bg-muted/30 px-3 sm:px-4"
                >
                  @if (validUrl(notice.imageLinkUrl); as linkUrl) {
                    <a
                      [href]="linkUrl"
                      target="_blank"
                      rel="noopener noreferrer"
                      class="flex w-full min-w-0 max-w-full items-center justify-center"
                      [attr.aria-label]="'Abrir enlace de ' + notice.title"
                    >
                      <img
                        [src]="notice.imageUrl"
                        loading="lazy"
                        decoding="async"
                        class="block h-auto max-h-[min(56dvh,42rem)] w-auto max-w-full object-contain"
                        [alt]="'Imagen del aviso: ' + notice.title"
                        (error)="markImageAsFailed(notice)"
                      />
                    </a>
                  } @else {
                    <img
                      [src]="notice.imageUrl"
                      loading="lazy"
                      decoding="async"
                      class="block h-auto max-h-[min(56dvh,42rem)] w-auto max-w-full object-contain"
                      [alt]="'Imagen del aviso: ' + notice.title"
                      (error)="markImageAsFailed(notice)"
                    />
                  }
                </div>
              }
            }

            @if (notice.contentHtml) {
              <div
                class="prose mt-5 w-full min-w-0 max-w-full wrap-anywhere overflow-x-hidden [&_*]:max-w-full [&_img]:h-auto [&_pre]:whitespace-pre-wrap [&_table]:w-full [&_table]:table-fixed"
                [innerHTML]="notice.contentHtml"
              ></div>
            }
          </article>
        </ng-template>

        @if (hasMultipleItems()) {
          <div class="min-h-0 w-full min-w-0">
            <swiper-container
              #noticeSwiper
              class="block min-h-0 w-full min-w-0"
              aria-label="Carrusel de avisos"
              [autoHeight]="true"
              [loop]="true"
              [speed]="450"
              [autoplay]="autoplayOptions"
              [a11y]="a11yOptions"
              (swiperslidechange)="onSlideChange($event)"
            >
              @for (notice of visibleItems(); track notice.id) {
                <swiper-slide>
                  <ng-container
                    [ngTemplateOutlet]="noticeContent"
                    [ngTemplateOutletContext]="{ $implicit: notice }"
                  />
                </swiper-slide>
              }
            </swiper-container>
          </div>
        } @else if (visibleItems()[0]; as notice) {
          <ng-container
            [ngTemplateOutlet]="noticeContent"
            [ngTemplateOutletContext]="{ $implicit: notice }"
          />
        }

        <hlm-dialog-footer
          class="shrink-0 flex-row flex-wrap items-center justify-between gap-3 sm:justify-between"
        >
          <div class="flex min-w-0 items-center gap-2">
            <hlm-checkbox
              inputId="dismiss-landing-notices"
              [checked]="doNotShowAgain()"
              (checkedChange)="doNotShowAgain.set($event)"
            />
            <label
              hlmLabel
              for="dismiss-landing-notices"
              class="font-normal text-muted-foreground"
            >
              No volver a mostrar estos avisos
            </label>
          </div>

          @if (hasMultipleItems()) {
            <div class="ms-auto flex shrink-0 items-center gap-2">
              <p
                class="text-sm font-medium whitespace-nowrap text-muted-foreground"
              >
                Aviso {{ activeNoticeIndex() + 1 }} de
                {{ visibleItems().length }}
              </p>
              <button
                hlmBtn
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Mostrar aviso anterior"
                (click)="showPreviousNotice()"
              >
                <ng-icon
                  name="lucideArrowLeft"
                  class="pointer-events-none"
                  aria-hidden="true"
                />
              </button>
              <button
                hlmBtn
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Mostrar aviso siguiente"
                (click)="showNextNotice()"
              >
                <ng-icon
                  name="lucideArrowRight"
                  class="pointer-events-none"
                  aria-hidden="true"
                />
              </button>
            </div>
          }
        </hlm-dialog-footer>
      </hlm-dialog-content>
    </hlm-dialog>
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingNoticesDialog {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);
  private readonly noticeSwiper =
    viewChild<ElementRef<SwiperContainer>>('noticeSwiper');

  readonly items = input.required<LandingNotice[]>();
  readonly dialogState = signal<BrnDialogState>('closed');
  readonly doNotShowAgain = signal(false);
  private readonly dismissedNoticeIds = signal<ReadonlySet<string>>(
    new Set(),
  );
  readonly visibleItems = computed(() => {
    const dismissedNoticeIds = this.dismissedNoticeIds();
    return this.items().filter(
      (notice) => !dismissedNoticeIds.has(notice.id),
    );
  });
  readonly failedImages = signal<ReadonlySet<string>>(new Set());
  readonly hasMultipleItems = computed(() => this.visibleItems().length > 1);
  readonly activeNoticeIndex = signal(0);
  readonly autoplayOptions = {
    delay: 6000,
    disableOnInteraction: false,
    pauseOnMouseEnter: true,
  } as const;
  readonly a11yOptions = {
    enabled: true,
    containerMessage: 'Carrusel de avisos',
    prevSlideMessage: 'Aviso anterior',
    nextSlideMessage: 'Aviso siguiente',
  } as const;

  private shownNoticeIds: readonly string[] = [];

  constructor() {
    afterNextRender(() => {
      const view = this.document.defaultView;
      if (!view) return;

      this.dismissedNoticeIds.set(this.readDismissedNoticeIds(view));
      const visibleItems = this.visibleItems();
      if (!visibleItems.length) return;

      this.shownNoticeIds = visibleItems.map(({ id }) => id);
      timer(400)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe(() => this.dialogState.set('open'));
    });
  }

  onDialogStateChanged(state: BrnDialogState): void {
    const wasOpen = this.dialogState() === 'open';
    this.dialogState.set(state);

    if (wasOpen && state === 'closed' && this.doNotShowAgain()) {
      this.dismissShownNotices();
    }
  }

  onSlideChange(event: Event): void {
    const [swiper] = (event as CustomEvent<[Swiper]>).detail;
    this.activeNoticeIndex.set(swiper.realIndex);
  }

  showPreviousNotice(): void {
    this.noticeSwiper()?.nativeElement.swiper.slidePrev();
  }

  showNextNotice(): void {
    this.noticeSwiper()?.nativeElement.swiper.slideNext();
  }

  validUrl(url: string | null): string | null {
    if (!url) return null;
    return url.startsWith('/') || /^https?:\/\//i.test(url) ? url : null;
  }

  hasImageFailed(notice: LandingNotice): boolean {
    const imageKey = this.imageKey(notice);
    return imageKey ? this.failedImages().has(imageKey) : false;
  }

  markImageAsFailed(notice: LandingNotice): void {
    const imageKey = this.imageKey(notice);
    if (!imageKey) return;

    this.failedImages.update((failed) => new Set(failed).add(imageKey));
  }

  private imageKey(notice: LandingNotice): string | null {
    const imageUrl = notice.imageUrl?.trim();
    return imageUrl ? `${notice.id}:${imageUrl}` : null;
  }

  private dismissShownNotices(): void {
    const view = this.document.defaultView;
    if (!view) return;

    const dismissedNoticeIds = this.readDismissedNoticeIds(view);
    for (const id of this.shownNoticeIds) dismissedNoticeIds.add(id);

    try {
      view.localStorage.setItem(
        DISMISSED_LANDING_NOTICES_STORAGE_KEY,
        JSON.stringify([...dismissedNoticeIds]),
      );
      this.dismissedNoticeIds.set(dismissedNoticeIds);
    } catch {
      // Closing the dialog still works when browser storage is unavailable.
    }
  }

  private readDismissedNoticeIds(view: Window): Set<string> {
    try {
      const storedValue = view.localStorage.getItem(
        DISMISSED_LANDING_NOTICES_STORAGE_KEY,
      );
      if (!storedValue) return new Set();

      const parsedValue: unknown = JSON.parse(storedValue);
      if (!Array.isArray(parsedValue)) return new Set();

      return new Set(
        parsedValue.filter((id): id is string => typeof id === 'string'),
      );
    } catch {
      return new Set();
    }
  }
}
