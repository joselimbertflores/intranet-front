import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideExternalLink, lucideImage } from '@ng-icons/lucide';

import { QuickAccess } from '../../models';

@Component({
  selector: 'portal-quick-access-card',
  imports: [NgIcon],
  providers: [provideIcons({ lucideExternalLink, lucideImage })],
  host: { class: 'block h-full' },
  styleUrl: './quick-access-card.css',
  template: `
    <a
      class="quick-access-surface relative flex h-full min-w-0 flex-col overflow-hidden rounded-2xl border px-3 pt-7 pb-5 text-center no-underline sm:px-5 sm:pt-8 sm:pb-6"
      [class.min-h-48]="!showDescription() || !item().description"
      [class.min-h-64]="showDescription() && item().description"
      [href]="item().url"
      target="_blank"
      rel="noopener noreferrer"
      [style.--quick-access-color]="item().backgroundColor"
      [attr.aria-label]="'Abrir ' + item().title + ' en una nueva pestaña'"
    >
      <ng-icon
        name="lucideExternalLink"
        size="0.875rem"
        class="quick-access-external-indicator absolute top-4 right-4 text-muted-foreground"
        aria-hidden="true"
      />

      <span
        class="quick-access-logo flex h-18 w-full items-center justify-center px-2 sm:h-24 sm:px-3"
        aria-hidden="true"
      >
        @if (item().imageUrl) {
          <img
            class="size-full object-contain"
            [src]="item().imageUrl"
            alt=""
            loading="lazy"
            decoding="async"
          />
        } @else {
          <ng-icon
            name="lucideImage"
            size="3rem"
            class="text-muted-foreground"
          />
        }
      </span>

      <span class="mt-5 flex min-w-0 flex-1 flex-col items-center">
        <span
          class="line-clamp-2 wrap-break-word text-base leading-6 font-semibold"
        >
          {{ item().title }}
        </span>

        @if (showDescription() && item().description) {
          <span
            class="mt-2 line-clamp-3 max-w-sm wrap-break-word text-sm leading-5 text-muted-foreground"
          >
            {{ item().description }}
          </span>
        }
      </span>
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickAccessCard {
  readonly item = input.required<QuickAccess>();
  readonly showDescription = input(true);
}
