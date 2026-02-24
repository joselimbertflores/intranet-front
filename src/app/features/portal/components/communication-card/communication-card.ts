import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PortalCommunicationResponse } from '../../interfaces';

@Component({
  selector: 'communication-card',
  imports: [CommonModule],
  template: `
    <article
      (click)="open()"
      class="cursor-pointer rounded-xl border border-surface-200 bg-surface-0
         p-4 hover:shadow-sm transition"
    >
      <!-- Cover -->
      @if (data().previewImageUrl) {
        <img
          [src]="data().previewImageUrl"
          alt=""
          class="mb-3 h-40 w-full object-cover rounded-lg"
        />
      }

      <!-- Meta -->
      <div class="flex items-center gap-2 text-xs text-surface-500 mb-1">
        <span>{{ data().type }}</span>
        <span>•</span>
        <span>{{ data().createdAt | date }}</span>
      </div>

      <!-- Title -->
      <h3 class="font-semibold text-sm md:text-base leading-snug mb-1">
        {{ data().reference }}
      </h3>

      <!-- Excerpt -->
      <!-- @if (data().excerpt) {
        <p class="text-sm text-surface-600 line-clamp-3">
          {{ data().excerpt }}
        </p>
      } -->
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationCard {
  data = input.required<PortalCommunicationResponse>();

  open() {}
}
