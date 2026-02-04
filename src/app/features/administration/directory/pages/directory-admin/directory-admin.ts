import {
  ChangeDetectionStrategy,
  Component,
  computed,
  signal,
} from '@angular/core';
import {
  DirectoryContact,
  DirectoryDataSource,
  DirectorySection,
} from '../services';
import { TreeNode } from 'primeng/api';
import { finalize } from 'rxjs';
import { InputNumber, InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { SelectModule } from 'primeng/select';
import { TreeModule } from 'primeng/tree';
import { CheckboxModule } from 'primeng/checkbox';
@Component({
  selector: 'app-directory-admin',
  imports: [
    InputNumber,
    TreeModule,

    TableModule,

    DialogModule,

    ButtonModule,

    InputTextModule,

    InputNumberModule,

    SelectModule,

    CheckboxModule,

    FormsModule,

  ],
  templateUrl: './directory-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class DirectoryAdmin {
  // data
  sections = signal<DirectorySection[]>([]);
  contacts = signal<DirectoryContact[]>([]);
  loadingSections = signal(false);
  loadingContacts = signal(false);

  // selection
  selectedSection = signal<DirectorySection | null>(null);

  // dialogs
  sectionDialogOpen = signal(false);
  contactDialogOpen = signal(false);

  // forms (simple local state)
  sectionForm = signal<{
    id?: string;
    name: string;
    parentId: string | null;
    order: number;
    isActive: boolean;
  }>({
    name: '',
    parentId: null,
    order: 0,
    isActive: true,
  });

  contactForm = signal<{
    id?: string;
    sectionId: string;
    title: string;
    internalPhone: string | null;
    externalPhone: string | null;
    order: number;
    isActive: boolean;
  }>({
    sectionId: '',
    title: '',
    internalPhone: null,
    externalPhone: null,
    order: 0,
    isActive: true,
  });

  constructor(private api: DirectoryDataSource) {
    this.loadSections();
  }

  // ---------- Loaders ----------
  loadSections() {
    this.loadingSections.set(true);
    this.api
      .getSections()
      .pipe(finalize(() => this.loadingSections.set(false)))
      .subscribe({
        next: (data) => {
          console.log(data);
          // normaliza parentId si no viene
          const normalized = data.map((s) => ({
            ...s,
            parentId: (s as any).parentId ?? (s.parent ? s.parent.id : null),
          }));
          this.sections.set(normalized);
        },
      });
  }

  loadContacts(sectionId: string) {
    this.loadingContacts.set(true);
    this.api
      .getContactsBySection(sectionId)
      .pipe(finalize(() => this.loadingContacts.set(false)))
      .subscribe({
        next: (data) => this.contacts.set(data),
      });
  }

  // ---------- Tree ----------
  treeNodes = computed<TreeNode[]>(() => {
    const items = this.sections()
      .slice()
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const map = new Map<string, TreeNode>();

    for (const s of items) {
      map.set(s.id, {
        key: s.id,
        label: s.name,
        data: s,
        children: [],
        expanded: true,
        styleClass: s.isActive ? '' : 'opacity-60',
      });
    }

    const roots: TreeNode[] = [];
    for (const s of items) {
      const node = map.get(s.id)!;
      if (s.parentId) {
        const parent = map.get(s.parentId);
        (parent?.children ?? roots).push(node);
      } else {
        roots.push(node);
      }
    }

    // asegura orden por children
    const sortRec = (nodes: TreeNode[]) => {
      nodes.sort((a, b) => (a.data?.order ?? 0) - (b.data?.order ?? 0));
      nodes.forEach((n) => sortRec(n.children ?? []));
    };
    sortRec(roots);

    return roots;
  });

  onSelectSection(node: TreeNode) {
    const section: DirectorySection = node.data;
    this.selectedSection.set(section);
    this.loadContacts(section.id);
  }

  // ---------- Section actions ----------
  openCreateSection() {
    this.sectionForm.set({
      name: '',
      parentId: this.selectedSection()?.id ?? null,
      order: 0,
      isActive: true,
    });
    this.sectionDialogOpen.set(true);
  }

  openEditSection() {
    const s = this.selectedSection();
    if (!s) return;
    this.sectionForm.set({
      id: s.id,
      name: s.name,
      parentId: s.parentId ?? null,
      order: s.order ?? 0,
      isActive: s.isActive,
    });
    this.sectionDialogOpen.set(true);
  }

  saveSection() {
    const f = this.sectionForm();
    const dto = {
      name: f.name.trim(),
      parentId: f.parentId ?? undefined,
      order: f.order,
    };

    if (!dto.name) return;

    if (!f.id) {
      this.api.createSection(dto).subscribe({
        next: () => {
          this.sectionDialogOpen.set(false);
          this.loadSections();
        },
      });
    } else {
      this.api
        .updateSection(f.id, {
          name: dto.name,
          parentId: f.parentId,
          order: f.order,
          isActive: f.isActive,
        })
        .subscribe({
          next: () => {
            this.sectionDialogOpen.set(false);
            this.loadSections();
          },
        });
    }
  }

  toggleSectionActive() {
    const s = this.selectedSection();
    if (!s) return;
    this.api.updateSection(s.id, { isActive: !s.isActive }).subscribe({
      next: (updated) => {
        this.selectedSection.set({ ...s, isActive: updated.isActive });
        this.loadSections();
      },
    });
  }

  // ---------- Contact actions ----------
  openCreateContact() {
    const s = this.selectedSection();
    if (!s) return;

    this.contactForm.set({
      sectionId: s.id,
      title: '',
      internalPhone: null,
      externalPhone: null,
      order: 0,
      isActive: true,
    });
    this.contactDialogOpen.set(true);
  }

  openEditContact(c: DirectoryContact) {
    this.contactForm.set({
      id: c.id,
      sectionId: c.sectionId,
      title: c.title,
      internalPhone: c.internalPhone ?? null,
      externalPhone: c.externalPhone ?? null,
      order: c.order ?? 0,
      isActive: c.isActive,
    });
    this.contactDialogOpen.set(true);
  }

  saveContact() {
    const f = this.contactForm();
    const title = f.title.trim();

    // regla: al menos uno de los teléfonos
    const hasInternal = !!(f.internalPhone && f.internalPhone.trim());
    const hasExternal = !!(f.externalPhone && f.externalPhone.trim());
    if (!title || (!hasInternal && !hasExternal)) return;

    const dto = {
      sectionId: f.sectionId,
      title,
      internalPhone: hasInternal ? f.internalPhone!.trim() : null,
      externalPhone: hasExternal ? f.externalPhone!.trim() : null,
      order: f.order,
    };

    if (!f.id) {
      this.api.createContact(dto).subscribe({
        next: () => {
          this.contactDialogOpen.set(false);
          this.loadContacts(f.sectionId);
        },
      });
    } else {
      this.api
        .updateContact(f.id, {
          title: dto.title,
          internalPhone: dto.internalPhone,
          externalPhone: dto.externalPhone,
          order: dto.order,
          isActive: f.isActive,
        })
        .subscribe({
          next: () => {
            this.contactDialogOpen.set(false);
            this.loadContacts(f.sectionId);
          },
        });
    }
  }

  toggleContactActive(c: DirectoryContact) {
    this.api.updateContact(c.id, { isActive: !c.isActive }).subscribe({
      next: () => this.loadContacts(c.sectionId),
    });
  }
}
