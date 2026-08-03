import { NgOptimizedImage } from '@angular/common';
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
    NgOptimizedImage,
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
        class="max-h-[calc(100dvh-2rem)] overflow-hidden sm:max-w-3xl"
      >
        <hlm-dialog-header>
          <h2 hlmDialogTitle class="text-xl font-bold">Avisos institucionales</h2>
          <p hlmDialogDescription>
            Información vigente publicada para el personal municipal.
          </p>
        </hlm-dialog-header>

        <hlm-carousel
          #noticeCarousel
          class="min-h-0"
          [options]="carouselOptions()"
        >
          <hlm-carousel-content class="-ml-0">
            @for (notice of items(); track notice.id) {
              <hlm-carousel-item class="pl-0">
                <article class="max-h-[65dvh] overflow-y-auto px-1 pb-1">
                  <h3
                    class="max-w-[28ch] text-balance text-2xl leading-tight font-extrabold tracking-[-0.02em] text-[var(--landing-forest)]"
                  >
                    {{ notice.title }}
                  </h3>

                  @if (notice.imageUrl) {
                    <div
                      class="relative mt-5 aspect-[16/9] overflow-hidden rounded-xl bg-muted"
                    >
                      @if (failedImages().has(notice.id)) {
                        <div class="grid h-full place-items-center text-5xl text-muted-foreground" aria-hidden="true">
                          <ng-icon name="lucideImageOff" />
                        </div>
                      } @else if (validUrl(notice.imageLinkUrl); as linkUrl) {
                        <a
                          [href]="linkUrl"
                          target="_blank"
                          rel="noopener noreferrer"
                          class="absolute inset-0"
                          [attr.aria-label]="'Abrir enlace de ' + notice.title"
                        >
                          <img
                            [ngSrc]="notice.imageUrl"
                            fill
                            sizes="(max-width: 768px) 100vw, 768px"
                            class="object-contain"
                            [alt]="notice.title"
                            (error)="markImageAsFailed(notice.id)"
                          />
                        </a>
                      } @else {
                        <img
                          [ngSrc]="notice.imageUrl"
                          fill
                          sizes="(max-width: 768px) 100vw, 768px"
                          class="object-contain"
                          alt=""
                          (error)="markImageAsFailed(notice.id)"
                        />
                      }
                    </div>
                  }

                  @if (notice.contentHtml) {
                    <div
                      class="prose prose-slate mt-5 max-w-none wrap-break-word"
                      [innerHTML]="notice.contentHtml"
                    ></div>
                  }
                </article>
              </hlm-carousel-item>
            }
          </hlm-carousel-content>

          @if (hasMultipleItems()) {
            <div class="mt-4 flex items-center justify-between border-t pt-4">
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

  markImageAsFailed(id: string): void {
    this.failedImages.update((failed) => new Set(failed).add(id));
  }
}
