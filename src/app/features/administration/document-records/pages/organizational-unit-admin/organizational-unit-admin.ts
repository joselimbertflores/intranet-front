import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { computed } from '@angular/core';



import { SectionTreeNodeResponse } from '../../interfaces';
import { OrganizationalUnitEditor } from '../../dialogs';
import { OrganizationalUnitDatasource } from '../../services';

@Component({
  selector: 'app-organizational-unit-admin',
  imports: [
    CommonModule,
    
  ],
  changeDetection: ChangeDetectionStrategy.Eager,
  templateUrl: './organizational-unit-admin.html',
})
export default class OrganizationalUnitAdmin {
  // private dialogService = inject(DialogService);
  private orgUnitApi = inject(OrganizationalUnitDatasource);

  treeSections = computed(() =>
    this.orgUnitApi.sections().map((section) => this.toTreeNode(section)),
  );

  private expandedKeys = new Set<string>();

  openSectionDialog(item?:any)  {
    // const ref = this.dialogService.open(OrganizationalUnitEditor, {
    //   header: item
    //     ? 'Editar unidad organizacional'
    //     : 'Crear unidad organizacional',
    //   modal: true,
    //   draggable: false,
    //   closeOnEscape: true,
    //   closable: true,
    //   width: '35vw',
    //   data: item?.node
    //     ? { section: item.node.data, parent: item.node.parent?.data }
    //     : {},
    //   breakpoints: {
    //     '960px': '75vw',
    //     '640px': '90vw',
    //   },
    // });
    // ref?.onClose.subscribe((result) => {
    //   if (!result) return;
    //   this.orgUnitApi.loadTree();
    // });
  }

  addChild(item: SectionTreeNodeResponse) {
    // const ref = this.dialogService.open(OrganizationalUnitEditor, {
    //   header: 'Crear unidad organizacional',
    //   modal: true,
    //   draggable: false,
    //   closeOnEscape: true,
    //   closable: true,
    //   width: '35vw',
    //   data: {
    //     parent: item,
    //   },
    //   breakpoints: {
    //     '960px': '75vw',
    //     '640px': '90vw',
    //   },
    // });
    // ref?.onClose.subscribe((result) => {
    //   if (!result) return;
    //   this.orgUnitApi.loadTree();
    // });
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
  ): any{
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
