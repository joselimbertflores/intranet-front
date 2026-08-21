import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';

import {
  QUICK_ACCESS_ICONS,
  resolveQuickAccessIcon,
} from '../../../../shared/constants/quick-access-icons';
import { QuickAccess } from '../../models';

@Component({
  selector: 'portal-quick-access-card',
  imports: [NgIcon],
  providers: [provideIcons(QUICK_ACCESS_ICONS)],
  host: { class: 'block h-full' },
  template: `
    <a
      class="quick-access-surface flex h-full min-h-44 min-w-0 flex-col rounded-xl border p-5 no-underline outline-none"
      [href]="item().url"
      target="_blank"
      rel="noopener noreferrer"
      [style.--quick-access-color]="item().backgroundColor"
      [attr.aria-label]="
        'Abrir ' + item().title + ' en una nueva pestaña'
      "
    >
      <span class="flex items-start justify-between gap-4">
        <span
          class="quick-access-icon-surface grid size-12 place-items-center rounded-xl border"
          aria-hidden="true"
        >
          <ng-icon [name]="resolveIcon(item().iconKey)" size="1.5rem" />
        </span>

        <ng-icon
          name="lucideExternalLink"
          size="1rem"
          class="text-muted-foreground"
          aria-hidden="true"
        />
      </span>

      <span
        class="mt-4 line-clamp-2 wrap-break-word text-base leading-6 font-bold text-foreground"
      >
        {{ item().title }}
      </span>

      @if (item().description) {
        <span
          class="mt-1.5 line-clamp-3 wrap-break-word text-sm leading-5 text-muted-foreground"
        >
          {{ item().description }}
        </span>
      }
    </a>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickAccessCard {
  readonly item = input.required<QuickAccess>();
  readonly resolveIcon = resolveQuickAccessIcon;
}
