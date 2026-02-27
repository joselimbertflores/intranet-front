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
      class="group relative h-full flex flex-col rounded-xl border border-surface-200 bg-surface-0 
         hover:shadow-lg hover:border-primary-400 transition-all duration-300 ease-in-out cursor-pointer"
    >
      <a
        (click)="open()"
        class="flex flex-col grow p-3 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-xl"
      >
        <div
          class="relative mb-4 overflow-hidden rounded-lg bg-surface-100 aspect-video shrink-0"
        >
          @if (data().previewImageUrl) {
            <img
              [ngSrc]="data().previewImageUrl!"
              fill
              priority
              class="object-cover transition-transform duration-500 group-hover:scale-105"
              alt="Document preview"
            />
            <div
              class="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors"
            ></div>
          } @else {
            <div class="flex flex-col items-center justify-center h-full gap-2">
              <i class="pi pi-file-pdf text-4xl text-surface-300"></i>
              <span
                class="text-[10px] font-medium text-surface-400 uppercase tracking-wider"
                >Sin Vista Previa</span
              >
            </div>
          }

          <div class="absolute top-2 left-2">
            <p-tag
              [value]="data().type"
              [rounded]="true"
              severity="secondary"
              class="opacity-90 shadow-sm"
              [style]="{ 'font-size': '10px', padding: '2px 8px' }"
            />
          </div>
        </div>

        <div class="flex flex-col grow px-1">
          <h3
            class="text-sm font-bold leading-tight mb-2 line-clamp-2 text-surface-900 group-hover:text-primary-600 transition-colors"
            [title]="data().reference"
          >
            {{ data().reference }}
          </h3>

          <div
            class="mt-auto flex items-center justify-between border-t border-surface-100 pt-3"
          >
            <span
              class="text-[11px] font-medium text-surface-500 flex items-center gap-1"
            >
              <i class="pi pi-calendar text-[10px]"></i>
              {{ data().createdAt | date: 'mediumDate' }}
            </span>
            <i
              class="pi pi-arrow-right text-xs text-surface-300 group-hover:text-primary-500 group-hover:translate-x-1 transition-all"
            ></i>
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
