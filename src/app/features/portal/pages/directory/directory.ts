import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { finalize } from 'rxjs';
import { PortalDataSource, PortalDirectoryDataSource } from '../../services';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SkeletonModule } from 'primeng/skeleton';
import { TableModule } from 'primeng/table';
import { TooltipModule } from 'primeng/tooltip';
import { AccordionModule } from 'primeng/accordion';
import { DirectorySection } from '../../components/directory-section/directory-section';
import { CommonModule } from '@angular/common';
import { TreeNode } from 'primeng/api';
import { TreeModule } from 'primeng/tree';
import { TreeTableModule } from 'primeng/treetable';
import { TreeDirectoryResponse } from '../../../administration/directory/interfaces';
import { CustomTreeTable } from '../../components/custom-tree-table/custom-tree-table';
// public-directory.models.ts
export interface PublicDirectoryContact {
  id: string;
  title: string;
  internalPhone?: string | null;
  externalPhone?: string | null;
  order: number;
}

export interface PublicDirectorySection {
  id: string;
  name: string;
  order: number;
  contacts: PublicDirectoryContact[];
  children: PublicDirectorySection[];
}

type FlatRow = {
  sectionPath: string; // "Secretaría > Dirección > Unidad"
  sectionId: string;
  sectionName: string;
  contact: PublicDirectoryContact;
};

@Component({
  selector: 'app-directory',
  imports: [
    CommonModule,
    InputTextModule,

    ButtonModule,

    TableModule,

    AccordionModule,

    TooltipModule,

    SkeletonModule,

    FormsModule,

    HttpClientModule,
    DirectorySection,
    TreeModule,
    TreeTableModule,
    CustomTreeTable,
  ],
  templateUrl: './directory.html',
  styles: [
    `
      /* Necesario para que el justify-between funcione en p-tree */
      :host ::ng-deep .p-treenode-content {
        width: 100%;
      }
      :host ::ng-deep .p-treenode-label {
        width: 100%;
      }
    `,
  ],

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class Directory {
  loading = signal(false);
  // nodes = signal<TreeNode[]>([]);

  treeDirectory = inject(PortalDirectoryDataSource).directory;

  nodes = computed(() => {
    return this.treeDirectory().map((item) => this.toTreeNode(item));
  });

  constructor() {
    // this.load();
  }

  load() {
    this.loading.set(true);
    // this.api.getDirectoryTree().subscribe({
    //   next: (tree) => {
    //     // this.nodes.set(this.sectionsToNodes(tree));
    //     this.loading.set(false);
    //   },
    //   error: () => this.loading.set(false),
    // });
  }

  private sectionsToNodes(sections: PublicDirectorySection[]): TreeNode[] {
    return (sections ?? []).map((s) => ({
      key: s.id,
      label: s.name,
      data: { type: 'section', section: s },
      expanded: true,
      children: [
        // contactos como nodos hoja
        ...(s.contacts ?? []).map((c) => ({
          key: c.id,
          label: c.title,
          leaf: true,
          data: { type: 'contact', contact: c },
        })),
        // hijos recursivos
        ...this.sectionsToNodes(s.children ?? []),
      ],
    }));
  }

  async copy(value?: string | null) {
    if (!value) return;
    await navigator.clipboard.writeText(value);
  }

  expandAll() {
    const updatedFiles = this.nodes().map((node) =>
      this.expandRecursive(node, true),
    );
    // this.nodes.set(updatedFiles);
  }

  collapseAll() {
    const updatedFiles = this.nodes().map((node) =>
      this.expandRecursive(node, false),
    );
    // this.nodes.set(updatedFiles);
  }

  private expandRecursive(node: TreeNode, isExpand: boolean): TreeNode {
    return {
      ...node,
      expanded: isExpand,
      children: node.children
        ? node.children.map((child) => this.expandRecursive(child, isExpand))
        : node.children,
    };
  }

  private toTreeNode(
    node: TreeDirectoryResponse,
  ): TreeNode<TreeDirectoryResponse> {
    return {
      key: node.id.toString(),
      data: node,
      children: node.children?.map((child) => this.toTreeNode(child)) ?? [],
    };
  }
}
