import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TreeDirectoryNode } from '../../interfaces';

@Component({
  selector: 'directory-node',
  imports: [],
  template: `
    <div class="mb-2">
      <div
        (click)="toggle()"
        [class.cursor-pointer]="node().children.length"
        class="flex items-center gap-3 rounded-lg border border-surface-300 bg-surface-0 p-2 md:p-4"
      >
        <div class="w-5 flex justify-center">
          @if (node().children.length) {
            <i
              style="font-size: 11px;"
              class="pi text-surface-400"
              [class.pi-chevron-right]="!node().expanded"
              [class.pi-chevron-down]="node().expanded"
            ></i>
          } @else {
            <i style="font-size: 11px;" class="pi pi-minus text-surface-200">
            </i>
          }
        </div>

        <div
          class="flex flex-1 flex-col md:flex-row md:items-center md:justify-between gap-1 md:gap-4"
        >
          <div class="text-xs md:text-base font-medium text-surface-900">
            {{ node().name }}
          </div>

          <div class="flex flex-wrap gap-4 text-xs md:text-sm text-surface-600">
            @if (node().internalPhone) {
              <span class="flex items-center gap-2">
                <i style="font-size: 11px;" class="pi pi-phone"></i>
                <span class="uppercase text-[10px] opacity-60">Int</span>
                <span class="font-mono">{{ node().internalPhone }}</span>
              </span>
            }

            @if (node().landlinePhone) {
              <span class="flex items-center gap-2">
                <i style="font-size: 11px;" class="pi pi-phone"></i>
                <span class="font-mono">{{ node().landlinePhone }}</span>
              </span>
            }
          </div>
        </div>
      </div>

      @if (node().expanded && node().children.length) {
        <div
          animate.enter="animate-accordion-down"
          animate.leave="animate-accordion-up"
          class="grid"
        >
          <div class="overflow-hidden">
            <div class="ml-2 mt-2 space-y-2 border-l-2 border-surface-100 pl-2">
              @for (child of node().children; track child.id) {
                <directory-node [node]="child" />
              }
            </div>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    .animate-accordion-down {
      animation: accordionDown 300ms ease-in-out forwards;
    }
    .animate-accordion-up {
      animation: accordionUp 300ms ease-in-out forwards;
    }

    @keyframes accordionDown {
      0% {
        grid-template-rows: 0fr;
      }
      100% {
        grid-template-rows: 1fr;
      }
    }

    @keyframes accordionUp {
      0% {
        grid-template-rows: 1fr;
      }
      100% {
        grid-template-rows: 0fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DirectoryNode {
  node = input.required<TreeDirectoryNode>();

  toggle() {
    this.node().expanded = !this.node().expanded;
  }
}
