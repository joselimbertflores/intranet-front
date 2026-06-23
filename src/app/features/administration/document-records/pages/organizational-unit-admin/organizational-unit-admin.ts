import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { computed } from '@angular/core';

import { TreeNode, TreeTableNode } from 'primeng/api';
import { DialogService } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { TreeTableModule } from 'primeng/treetable';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';

import { SectionTreeNodeResponse } from '../../interfaces';
import { OrganizationalUnitEditor } from '../../dialogs';
import { OrganizationalUnitDatasource } from '../../services';

@Component({
  selector: 'app-organizational-unit-admin',
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
  templateUrl: './organizational-unit-admin.html',
})
export default class OrganizationalUnitAdmin {
  private dialogService = inject(DialogService);
  private orgUnitApi = inject(OrganizationalUnitDatasource);

  treeSections = computed(() =>
    this.orgUnitApi.sections().map((section) => this.toTreeNode(section)),
  );

  private expandedKeys = new Set<string>();

  openSectionDialog(item?: TreeTableNode<SectionTreeNodeResponse>) {
    const ref = this.dialogService.open(OrganizationalUnitEditor, {
      header: item
        ? 'Editar unidad organizacional'
        : 'Crear unidad organizacional',
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
      this.orgUnitApi.loadTree();
    });
  }

  addChild(item: SectionTreeNodeResponse) {
    const ref = this.dialogService.open(OrganizationalUnitEditor, {
      header: 'Crear unidad organizacional',
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
      this.orgUnitApi.loadTree();
    });
  }

  onExpand(nodeKey: string | undefined) {
    if (nodeKey) {
      this.expandedKeys.add(nodeKey);
    }
  }

  onCollapse(nodeKey: string | undefined) {
    if (nodeKey) {
      this.expandedKeys.delete(nodeKey);
    }
  }

  private toTreeNode(
    node: SectionTreeNodeResponse,
  ): TreeNode<SectionTreeNodeResponse> {
    return {
      key: node.id,
      label: node.name,
      data: node,
      expanded: this.expandedKeys.has(node.id),
      children: node.children?.length
        ? node.children.map((child) => this.toTreeNode(child))
        : [],
    };
  }
}
