
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { QuickAccessResponse } from '../../../../../administration/content-settings/interfaces';

@Component({
  selector: 'quick-access-section',
  imports: [],
  template: `
    <section
      class="py-20 bg-gradient-to-b from-primary-50 via-white to-surface-50 
         animate-enter fade-in-20 slide-in-from-b-10 animate-duration-700"
    >
      <div class="max-w-6xl mx-auto px-6 text-center">
        <h2 class="text-xl md:text-4xl font-semibold text-surface-900 mb-3">
          Accesos Directos
        </h2>
        <p class="text-surface-600 mb-12 max-w-2xl mx-auto text-sm sm:text-xl">
          Accede fácilmente a los principales sistemas y servicios
          institucionales
        </p>

        <div
          class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-8 place-items-center"
        >
          @for (access of quickAccess(); track $index) {
          <!-- <a
            [href]="access.redirectUrl"
            target="_blank"
            rel="noopener noreferrer"
            class="group relative bg-surface-50 rounded-2xl shadow-md
               p-4 sm:p-6 flex flex-col items-center justify-between
               transition-all duration-300 hover:shadow-lg hover:-translate-y-1
               border border-surface-300 hover:border-primary-400
               h-36 sm:h-44 w-full
               animate-enter fade-in-20 zoom-in-90 animate-duration-1000"
          >
            <div
              class="w-18 h-18 rounded-xl bg-surface-100 flex items-center justify-center mb-2
                 group-hover:bg-primary-50 transition-colors"
            >
              <img
                [src]="access.iconUrl"
                [alt]="access.name"
                class="w-12 h-12 object-contain"
                loading="lazy"
              />
            </div>

            <span
              class="font-semibold text-surface-700 group-hover:text-primary-700 
                 transition-colors text-center text-sm sm:text-base md:text-lg 
                 leading-snug line-clamp-2 break-words"
              [title]="access.name"
            >
              {{ access.name }}
            </span>
          </a> -->
          }
        </div>
      </div>
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickAccessSectionComponent {
  quickAccess = input<QuickAccessResponse[]>();
}
