import {
  ChangeDetectionStrategy,
  Component,
  computed,
  CUSTOM_ELEMENTS_SCHEMA,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';

import { register } from 'swiper/element/bundle';

import { LandingNotice } from '../../../../models';

register();

@Component({
  selector: 'landing-notices',
  imports: [],
  template: `
    <app-ui-dialog
      header="Avisos"
      [(visible)]="visible"
      [modal]="true"
      [closable]="true"
      [closeOnEscape]="true"
      [draggable]="false"
      [maximizable]="false"
      [dismissableMask]="true"
      [focusOnShow]="false"
      [style]="{ width: '45rem' }"
      [breakpoints]="{ '960px': '92vw', '640px': '96vw' }"
      [contentStyle]="{ 'padding-left': '2px', 'padding-right': '2px' }"
    >
      <swiper-container
        slides-per-view="1"
        auto-height="true"
        keyboard="true"
        [a11y]="{ enabled: true, scrollOnFocus: false }"
        [navigation]="hasMultipleItems()"
        [pagination]="hasMultipleItems()"
        [loop]="hasMultipleItems()"
      >
        @for (notice of items(); track notice.id) {
          @let hideTitle = !!notice.imageUrl && !notice.contentHtml;
          <swiper-slide>
            <article class="min-w-0 px-1 pb-10">
              @if (!hideTitle) {
                <h2
                  class="text-balance text-2xl font-semibold leading-tight text-surface-900"
                >
                  {{ notice.title }}
                </h2>
              } @else {
                <h2 class="sr-only">{{ notice.title }}</h2>
              }
              @if (notice.imageUrl) {
                <div
                  class="flex justify-center overflow-hidden rounded-xl border border-surface-200 bg-surface-50"
                  [class.mt-5]="!hideTitle"
                  [class.mt-2]="hideTitle"
                >
                  @if (notice.imageLinkUrl; as url) {
                    <a
                      class="inline-flex max-w-full cursor-pointer"
                      [href]="url"
                      target="_blank"
                      rel="noopener noreferrer"
                      [attr.aria-label]="'Abrir enlace de ' + notice.title"
                    >
                      <img
                        [src]="notice.imageUrl"
                        [alt]="notice.imageAlt || notice.title"
                        class="block max-h-[420px] max-w-full h-auto w-auto object-contain"
                      />
                    </a>
                  } @else {
                    <img
                      [src]="notice.imageUrl"
                      [alt]="notice.imageAlt || ''"
                      class="block max-h-[420px] max-w-full h-auto w-auto object-contain"
                    />
                  }
                </div>
              }

              @if (notice.contentHtml) {
                <div
                  class="prose prose-slate mt-5 max-w-none wrap-break-word text-surface-700"
                  [innerHTML]="notice.contentHtml"
                ></div>
              }
            </article>
          </swiper-slide>
        }
      </swiper-container>
    </app-ui-dialog>
  `,
  styles: `
    swiper-container {
      --swiper-navigation-color: var(--p-primary-500);
      --swiper-pagination-color: var(--p-primary-500);
      --swiper-navigation-size: 24px;
    }

    swiper-slide {
      box-sizing: border-box;
      padding-left: 40px;
      padding-right: 40px;
    }

    @media (max-width: 767px) {
      swiper-container {
        --swiper-navigation-size: 20px;
      }

      swiper-slide {
        padding-left: 30px;
        padding-right: 30px;
      }
    }
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingNotices implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly items = input.required<LandingNotice[]>();

  readonly visible = signal(false);
  readonly hasMultipleItems = computed(() => this.items().length > 1);

  constructor() {}

  ngOnInit(): void {
    const timeoutId = window.setTimeout(() => {
      this.visible.set(true);
    }, 400);

    this.destroyRef.onDestroy(() => {
      window.clearTimeout(timeoutId);
    });
  }
}
