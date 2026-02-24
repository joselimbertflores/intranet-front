import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { TreeNode } from 'primeng/api';

import { TreeDirectoryResponse } from '../../../administration/directory/interfaces';
import { PortalDirectoryDataSource } from '../../services';
import { SearchInputComponent } from '../../../../shared';
import { TreeDirectoryNode } from '../../interfaces';
import { DirectoryNode } from '../../components';

@Component({
  selector: 'app-directory-page',
  imports: [CommonModule, DirectoryNode, SearchInputComponent],
  templateUrl: './directory-page.html',

  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DirectoryPage {
  private data = inject(PortalDirectoryDataSource).directory;
  private nodes = computed(() => this.mapToViewModel(this.data()));

  filteredTree = computed(() => this.filterTree(this.nodes(), this.term()));
  term = signal<string>('');

  constructor() {}

  onSearch(term: string): void {
    this.term.set(term);
  }

  filterTree(nodes: TreeDirectoryNode[], term: string): TreeDirectoryNode[] {
    if (!term.trim()) return nodes;

    const lowerTerm = term.toLowerCase();

    return nodes
      .map((node) => {
        const matches =
          node.name.toLowerCase().includes(lowerTerm) ||
          node.internalPhone?.includes(term) ||
          node.landlinePhone?.includes(term);

        const filteredChildren = node.children
          ? this.filterTree(node.children, term)
          : [];

        if (matches || filteredChildren.length) {
          return {
            ...node,
            expanded: true,
            children: filteredChildren,
          };
        }
        return null;
      })
      .filter(Boolean) as TreeDirectoryNode[];
  }

  mapToViewModel(nodes: TreeDirectoryResponse[]): TreeDirectoryNode[] {
    return nodes.map((node) => ({
      ...node,
      expanded: false,
      children: this.mapToViewModel(node.children),
    }));
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
