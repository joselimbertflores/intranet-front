import {
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import { CarouselModule } from 'primeng/carousel';
import { DialogModule } from 'primeng/dialog';

import { LandingModalNotice } from '../../../../models';
import { JsonPipe } from '@angular/common';

const SESSION_DISMISS_KEY = 'landing-modal-notices-dismissed';
const IMAGE_LINK_URL_REGEX = /^(https?:\/\/[^\s]+|\/(?!\/)[^\s]*)$/i;

@Component({
  selector: 'landing-modal-notices',
  imports: [CarouselModule, DialogModule, JsonPipe],
  template: `
    <p-dialog
      styleClass="landing-notice-dialog"
      header="Avisos emergentes"
      [visible]="visible()"
      (visibleChange)="onVisibleChange($event)"
      [modal]="true"
      [closable]="true"
      [closeOnEscape]="true"
      [draggable]="false"
      [maximizable]="false"
      [dismissableMask]="true"
      [style]="{ width: 'min(94vw, 820px)' }"
      [contentStyle]="{ 'max-height': 'min(78vh, 760px)', overflow: 'auto' }"
    >
      <p-carousel
        [value]="items()"
        [numVisible]="1"
        [numScroll]="1"
        [circular]="false"
        [showNavigators]="hasMultipleItems()"
        [showIndicators]="hasMultipleItems()"
      >
        <ng-template pTemplate="item" let-notice let-index="index">
          <article class="min-w-0 px-1 pb-2">
            @if (hasMultipleItems()) {
              <p class="mb-3 text-right text-xs font-medium text-surface-500">
                {{ index + 1 }} de {{ items().length }}
              </p>
            }

            <h2
              class="text-balance text-2xl font-semibold leading-tight text-surface-900"
            >
              {{ notice.title }}
            </h2>

            @if (notice.imageUrl) {
              <div
                class="mt-5 overflow-hidden rounded-xl border border-surface-200 bg-surface-50"
              >
                @if (validUrl(notice.imageLinkUrl); as url) {
                  <button
                    type="button"
                    class="block w-full cursor-pointer"
                    (click)="openImageLink(url)"
                  >
                    <img
                      [src]="notice.imageUrl"
                      [alt]="notice.imageAlt || ''"
                      class="max-h-[420px] w-full object-contain"
                    />
                  </button>
                } @else {
                  <img
                    [src]="notice.imageUrl"
                    [alt]="notice.imageAlt || ''"
                    class="max-h-[420px] w-full object-contain"
                  />
                }
              </div>
            }

            @if (notice.contentHtml) {
              <div
                class="notice-rich-text prose prose-slate mt-5 max-w-none min-w-0 whitespace-normal break-words text-surface-700"
                [innerHTML]="notice.contentHtml"
              ></div>
            }
          </article>
        </ng-template>
      </p-carousel>
    </p-dialog>
  `,
})
export class LandingModalNotices {
  private readonly router = inject(Router);

  readonly items = input.required<LandingModalNotice[]>();
  readonly visible = signal(false);
  readonly hasMultipleItems = computed(() => this.items().length > 1);

  constructor() {
    effect(() => {
      // if (this.items().length && !this.wasDismissed()) this.visible.set(true);
      this.visible.set(true);
    });
  }

  ngOnInit(): void {
    console.log('LandingModalNotices items:', this.items());
  }

  onVisibleChange(visible: boolean): void {
    this.visible.set(visible);
    if (!visible) this.rememberDismissal();
  }

  dismiss(): void {
    this.visible.set(false);
    this.rememberDismissal();
  }

  openImageLink(url: string): void {
    this.dismiss();
    if (url.startsWith('/')) {
      void this.router.navigateByUrl(url);
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }

  validUrl(url: string | null): string | null {
    if (!url) return null;
    return IMAGE_LINK_URL_REGEX.test(url) ? url : null;
  }

  private wasDismissed(): boolean {
    try {
      return sessionStorage.getItem(SESSION_DISMISS_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private rememberDismissal(): void {
    try {
      sessionStorage.setItem(SESSION_DISMISS_KEY, 'true');
    } catch {
      // The dialog remains closable when browser storage is unavailable.
    }
  }
}
