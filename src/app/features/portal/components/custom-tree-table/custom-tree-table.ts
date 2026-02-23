import {
  ChangeDetectionStrategy,
  Component,
  input,
  signal,
} from '@angular/core';
import { TreeDirectoryResponse } from '../../../administration/directory/interfaces';
import { TreeNode } from 'primeng/api';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'custom-tree-table',
  imports: [CommonModule],
  template: `
    <!-- tree-item.component.html -->
    <div class="border-l-2 border-gray-200 ml-4 my-2">
      <div
        class="flex flex-col md:flex-row md:items-center justify-between p-3 bg-white hover:bg-gray-50 rounded-r-lg shadow-sm border border-gray-100"
      >
        <!-- Info Principal -->
        <div class="flex items-center gap-3">
          <button
            *ngIf="node().children.length"
            (click)="open()"
            class="p-1 hover:bg-gray-200 rounded"
          >
            <i
              [class]="
                expanded() ? 'pi pi-chevron-down' : 'pi pi-chevron-right'
              "
            ></i>
          </button>
          <span class="font-semibold text-gray-800">{{ node().name }}</span>
        </div>

        <!-- Números (En móvil se apilan, en desktop van alineados) -->
        <div class="flex gap-4 mt-2 md:mt-0 text-sm text-gray-600 ml-8 md:ml-0">
          <div class="flex flex-col md:flex-row md:gap-2">
            <span
              class="text-xs font-bold md:hidden text-blue-500 uppercase tracking-tighter"
              >Int:</span
            >
            <span>{{ node().internalPhone }}</span>
          </div>
          <div
            class="flex flex-col md:flex-row md:gap-2 border-l pl-4 md:border-none md:pl-0"
          >
            <span
              class="text-xs font-bold md:hidden text-green-500 uppercase tracking-tighter"
              >Ext:</span
            >
            <span>{{ node().internalPhone }}</span>
          </div>
        </div>
      </div>

      <!-- Renderizado recursivo de hijos -->
      <div *ngIf="expanded() && node().children">
        <custom-tree-table
          *ngFor="let child of node().children"
          [node]="child"
        ></custom-tree-table>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomTreeTable {
  node = input.required<TreeDirectoryResponse>();

  expanded = signal(false);

  open() {
    this.expanded.update((value) => !value);
  }
}
