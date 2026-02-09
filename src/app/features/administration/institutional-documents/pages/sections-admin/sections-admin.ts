import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { computed } from '@angular/core';

import { TreeNode, TreeTableNode } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TreeTableModule } from 'primeng/treetable';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { SectionTreeNodeResponse } from '../../interfaces';
import { DocumentSectionEditor } from '../../dialogs';
import { SectionDataSource } from '../../services';

@Component({
  selector: 'app-sections-admin',
  imports: [
    CommonModule,
    TagModule,
    ButtonModule,
    InputTextModule,
    IconFieldModule,
    InputIconModule,
    TreeTableModule,
    FloatLabelModule,
  ],
  templateUrl: './sections-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService],
})
export default class SectionsAdmin {
  private dialogService = inject(DialogService);
  private sectionService = inject(SectionDataSource);

  sections = this.sectionService.sections;
  treeSections = computed(() => {
    const nodes = this.sections().map((section) => this.toTreeNode(section));
    this.restoreExpanded(nodes);
    return nodes;
  });
  expandedKeys = new Set<string>();

  openSectionDialog(item?: TreeTableNode) {
    const ref = this.dialogService.open(DocumentSectionEditor, {
      header: item ? 'Editar seccion' : 'Crear seccion',
      modal: true,
      draggable: false,
      closeOnEscape: true,
      closable: true,
      width: '35vw',
      data: item?.node
        ? { section: item.node.data, parent: item.node.parent?.data }
        : {},
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    ref?.onClose.subscribe((result) => {
      if (!result) return;
      this.sectionService.getTreeSections();
    });
  }

  addChild(item: SectionTreeNodeResponse) {
    const ref = this.dialogService.open(DocumentSectionEditor, {
      header: 'Crear seccion',
      modal: true,
      draggable: false,
      closeOnEscape: true,
      closable: true,
      width: '35vw',
      data: {
        parent: item,
      },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    ref?.onClose.subscribe((result) => {
      if (!result) return;
      this.sectionService.getTreeSections();
    });
  }

  onExpand(event: any) {
    this.expandedKeys.add(event.node.key);
  }

  onCollapse(event: any) {
    this.expandedKeys.delete(event.node.key);
  }

  private toTreeNode(
    node: SectionTreeNodeResponse,
  ): TreeNode<SectionTreeNodeResponse> {
    return {
      key: node.id,
      label: node.name,
      data: node,
      children: node.children?.length
        ? node.children.map((child) => this.toTreeNode(child))
        : [],
    };
  }

  private restoreExpanded(nodes: TreeNode[]) {
    for (const node of nodes) {
      if (this.expandedKeys.has(node.key!)) {
        node.expanded = true;
      }
      if (node.children?.length) {
        this.restoreExpanded(node.children);
      }
    }
  }
}
