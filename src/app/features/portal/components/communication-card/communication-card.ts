import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { RouterModule } from '@angular/router';

import { TagModule } from 'primeng/tag';

import { PortalCommunicationResponse } from '../../interfaces';

@Component({
  selector: 'communication-card',
  imports: [CommonModule, TagModule, RouterModule, NgOptimizedImage],
  template: `
    <article
      class="group h-full flex flex-col rounded-xl border border-surface-300 bg-surface-0 hover:bg-surface-50 transition"
    >
      <a
        (click)="open()"
        class="flex flex-col grow p-4 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-200"
      >
        @if (data().previewImageUrl) {
          <div class="mb-3 h-36 w-full relative shrink-0">
            <img
              [ngSrc]="data().previewImageUrl!"
              fill
              priority
              class="object-cover rounded-lg"
              alt="Communication preview"
            />
          </div>
        } @else {
          <div
            class="mb-3 h-36 flex items-center justify-center bg-surface-50 rounded-lg shrink-0"
          >
            <i class="pi pi-file text-2xl text-surface-300"></i>
          </div>
        }

        <div class="flex flex-col grow">
          <div class="mb-2">
            <span
              class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-primary-50 text-primary-700"
            >
              {{ data().type }}
            </span>
          </div>

          <h3
            class="text-sm font-semibold leading-snug mb-3 line-clamp-2 md:line-clamp-3 text-surface-900"
          >
            {{ data().reference }}
          </h3>

          <div class="mt-auto text-xs text-surface-500">
            {{ data().createdAt | date: 'longDate' }}
          </div>
        </div>
      </a>
    </article>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CommunicationCard {
  data = input.required<PortalCommunicationResponse>();

  onOpen = output<void>();

  open() {
    this.onOpen.emit();
  }
}
