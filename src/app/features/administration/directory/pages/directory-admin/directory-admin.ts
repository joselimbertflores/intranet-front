import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';

import {
  TreeTableModule,
  TreeTableNodeExpandEvent,
  TreeTableNodeCollapseEvent,
} from 'primeng/treetable';
import {
  ConfirmationService,
  MenuItem,
  TreeNode,
  TreeTableNode,
} from 'primeng/api';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { FloatLabelModule } from 'primeng/floatlabel';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { MenuModule } from 'primeng/menu';

import { TreeDirectoryResponse } from '../../interfaces';
import { DirectoryDataSource } from '../services';
import { DirectoryEditor } from '../../dialogs';
@Component({
  selector: 'app-directory-admin',
  imports: [
    TableModule,
    DialogModule,
    ButtonModule,
    ConfirmDialogModule,
    FloatLabelModule,
    IconFieldModule,
    InputIconModule,
    TreeTableModule,
    InputTextModule,
    MenuModule,
  ],
  templateUrl: './directory-admin.html',
  styles: `
    :host ::ng-deep .p-treetable-table {
      table-layout: fixed;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService, ConfirmationService],
})
export default class DirectoryAdmin implements OnInit {
  private dialogService = inject(DialogService);
  private directoryDataSource = inject(DirectoryDataSource);
  private confirmationService = inject(ConfirmationService);

  treeDirectory = signal<TreeDirectoryResponse[]>([]);
  expandedKeys = new Set<string>();
  nodes = computed(() => {
    return this.treeDirectory().map((item) => this.toTreeNode(item));
  });

  menuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.getTreeDirectory();
  }

  openDirectoryDialog(item?: TreeDirectoryResponse, expand?: boolean) {
    const ref = this.dialogService.open(DirectoryEditor, {
      header: item ? 'Editar directorio' : 'Crear directorio',
      modal: true,
      draggable: false,
      closeOnEscape: true,
      closable: true,
      width: '35vw',
      data: {
        directory: item,
      },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    ref?.onClose.subscribe((result?: TreeDirectoryResponse) => {
      if (!result) return;
      if (expand) this.expandedKeys.add(result.id.toString());
      this.getTreeDirectory();
    });
  }

  addChildDirectory(row: TreeTableNode<TreeDirectoryResponse>) {
    const ref = this.dialogService.open(DirectoryEditor, {
      header: 'Crear subdirectorio',
      modal: true,
      draggable: false,
      closeOnEscape: true,
      closable: true,
      width: '35vw',
      data: {
        ...(row.node?.data && {
          parent: { id: row.node.data.id, name: row.node.data.name },
        }),
      },
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
    ref?.onClose.subscribe((result?: TreeDirectoryResponse) => {
      if (!result) return;
      if (row.node?.key) this.expandedKeys.add(row.node.key);
      this.getTreeDirectory();
    });
  }

  remove(item: TreeDirectoryResponse, event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Todos los elementos dentro del directorio seran borrados.',
      header: 'Eliminar directorio',
      rejectButtonProps: {
        label: 'Cancelar',
        severity: 'secondary',
        outlined: true,
      },
      acceptButtonProps: {
        label: 'Aceptar',
      },
      accept: () => {
        this.directoryDataSource.remove(item.id).subscribe(() => {
          this.getTreeDirectory();
        });
      },
    });
  }

  openMenu(row: TreeTableNode<TreeDirectoryResponse>, event: Event) {
    this.menuItems = [
      {
        label: 'Opciones',
        items: [
          {
            label: 'Editar',
            icon: 'pi pi-pencil',
            command: () =>
              this.openDirectoryDialog(row.node?.data, row.node?.expanded),
          },
          {
            label: 'Eliminar',
            icon: 'pi pi-trash',
            command: () => {
              if (row.node?.data) this.remove(row.node?.data, event);
            },
          },
          {
            label: 'Agregar subdirectorio',
            icon: 'pi pi-plus',
            command: () => this.addChildDirectory(row),
          },
        ],
      },
    ];
  }

  onExpand(event: TreeTableNodeExpandEvent) {
    if (event.node.key) {
      this.expandedKeys.add(event.node.key);
    }
  }

  onCollapse(event: TreeTableNodeCollapseEvent) {
    if (event.node.key) {
      this.expandedKeys.delete(event.node.key);
    }
  }

  private getTreeDirectory() {
    this.directoryDataSource.getTreeDirectory().subscribe((resp) => {
      this.treeDirectory.set(resp);
    });
  }

  private toTreeNode(
    node: TreeDirectoryResponse,
  ): TreeNode<TreeDirectoryResponse> {
    return {
      key: node.id.toString(),
      data: node,
      expanded: this.expandedKeys.has(node.id.toString()),
      children: node.children?.map((child) => this.toTreeNode(child)) ?? [],
    };
  }
}
