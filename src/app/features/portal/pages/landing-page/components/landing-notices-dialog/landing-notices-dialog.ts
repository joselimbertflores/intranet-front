import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideArrowLeft,
  lucideArrowRight,
  lucideImageOff,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCarouselImports } from '@spartan-ng/helm/carousel';
import { HlmDialogImports } from '@spartan-ng/helm/dialog';
import type { BrnDialogState } from '@spartan-ng/brain/dialog';

import { LandingNotice } from '../../../../models';

@Component({
  selector: 'landing-notices-dialog',
  imports: [
    HlmButtonImports,
    HlmCarouselImports,
    HlmDialogImports,
    NgIcon,
  ],
  providers: [
    provideIcons({ lucideArrowLeft, lucideArrowRight, lucideImageOff }),
  ],
  template: `
    <hlm-dialog
      [state]="dialogState()"
      (stateChanged)="dialogState.set($event)"
    >
      <hlm-dialog-content
        *hlmDialogPortal
        class="flex max-h-[calc(100dvh-2rem)] min-w-0 flex-col overflow-hidden sm:max-w-3xl"
      >
        <hlm-dialog-header class="min-w-0 shrink-0">
          <h2 hlmDialogTitle class="font-display wrap-break-word text-xl tracking-[-0.02em] text-primary">Avisos institucionales</h2>
          <p hlmDialogDescription class="text-muted-foreground">
            Información vigente publicada para el personal municipal.
          </p>
        </hlm-dialog-header>

        <hlm-carousel
          #noticeCarousel
          class="min-h-0 w-full min-w-0 [&>div:first-child]:min-w-0 [&>div:first-child]:overflow-x-clip [&>div:first-child]:overflow-y-visible"
          [options]="carouselOptions()"
        >
          <hlm-carousel-content class="ml-0 w-full min-w-0">
            @for (notice of items(); track notice.id) {
              <hlm-carousel-item class="w-full min-w-0 shrink-0 basis-full pl-0">
                <article class="max-h-[65dvh] w-full min-w-0 overflow-x-hidden overflow-y-auto px-1 pb-1">
                  <h3
                    class="font-display w-full min-w-0 max-w-[28ch] wrap-break-word text-balance text-2xl leading-tight tracking-[-0.02em] text-primary"
                  >
                    {{ notice.title }}
                  </h3>

                  @if (notice.imageUrl) {
                    @if (hasImageFailed(notice)) {
                      <div
                        class="mt-5 flex w-fit max-w-full items-center gap-2 rounded-lg border border-border bg-muted px-3 py-2 text-sm text-muted-foreground"
                        role="status"
                      >
                        <ng-icon name="lucideImageOff" size="1rem" aria-hidden="true" />
                        <span>No se pudo cargar la imagen</span>
                      </div>
                    } @else {
                      <div
                        class="mt-5 flex w-full min-w-0 max-w-full justify-center overflow-hidden rounded-xl bg-muted"
                      >
                        @if (validUrl(notice.imageLinkUrl); as linkUrl) {
                          <a
                            [href]="linkUrl"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="block w-full min-w-0 max-w-full"
                            [attr.aria-label]="'Abrir enlace de ' + notice.title"
                          >
                            <img
                              [src]="notice.imageUrl"
                              loading="lazy"
                              decoding="async"
                              class="block max-h-[55dvh] w-full max-w-full object-contain"
                              [alt]="'Imagen del aviso: ' + notice.title"
                              (error)="markImageAsFailed(notice)"
                            />
                          </a>
                        } @else {
                          <img
                            [src]="notice.imageUrl"
                            loading="lazy"
                            decoding="async"
                            class="block max-h-[55dvh] w-full max-w-full object-contain"
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
              </hlm-carousel-item>
            }
          </hlm-carousel-content>

          @if (hasMultipleItems()) {
            <div class="mt-4 flex min-w-0 shrink-0 items-center justify-between border-t border-border pt-4">
              <p class="text-sm font-medium text-muted-foreground">
                Aviso {{ noticeCarousel.currentSlide() + 1 }} de {{ items().length }}
              </p>
              <div class="flex gap-2">
                <button
                  hlmBtn
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Mostrar aviso anterior"
                  (click)="noticeCarousel.scrollPrev()"
                >
                  <ng-icon name="lucideArrowLeft" />
                </button>
                <button
                  hlmBtn
                  type="button"
                  variant="outline"
                  size="icon-sm"
                  aria-label="Mostrar aviso siguiente"
                  (click)="noticeCarousel.scrollNext()"
                >
                  <ng-icon name="lucideArrowRight" />
                </button>
              </div>
            </div>
          }
        </hlm-carousel>
      </hlm-dialog-content>
    </hlm-dialog>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingNoticesDialog {
  private readonly destroyRef = inject(DestroyRef);

  readonly items = input.required<LandingNotice[]>();
  readonly dialogState = signal<BrnDialogState>('closed');
  readonly failedImages = signal<ReadonlySet<string>>(new Set());
  readonly hasMultipleItems = computed(() => this.items().length > 1);
  readonly carouselOptions = computed(() => ({
    loop: this.hasMultipleItems(),
    align: 'start' as const,
  }));

  constructor() {
    afterNextRender(() => {
      const timeoutId = window.setTimeout(() => {
        if (this.items().length) this.dialogState.set('open');
      }, 450);

      this.destroyRef.onDestroy(() => window.clearTimeout(timeoutId));
    });
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
}
