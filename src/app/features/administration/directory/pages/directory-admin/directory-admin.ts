import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs';

import { ConfirmationService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogService } from 'primeng/dynamicdialog';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { TooltipModule } from 'primeng/tooltip';

import { AuthDataSource } from '../../../../../core/auth/auth-data-source';
import { PermissionAction, Resource } from '../../../../../core/auth/auth.types';
import { SearchInput } from '../../../../../shared';
import { DirectoryEditor, DirectorySiteEditor } from '../../dialogs';
import { DirectoryEntryResponse, DirectorySite } from '../../interfaces';
import { DirectoryDataSource } from '../services';

@Component({
  selector: 'app-directory-admin',
  imports: [
    FormsModule,
    ButtonModule,
    ConfirmDialogModule,
    SelectModule,
    TableModule,
    TagModule,
    TooltipModule,
    SearchInput,
  ],
  templateUrl: './directory-admin.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [DialogService, ConfirmationService],
})
export default class DirectoryAdmin implements OnInit {
  private readonly dialogService = inject(DialogService);
  private readonly dataSource = inject(DirectoryDataSource);
  private readonly confirmationService = inject(ConfirmationService);
  private readonly authDataSource = inject(AuthDataSource);

  readonly entries = signal<DirectoryEntryResponse[]>([]);
  readonly sites = signal<DirectorySite[]>([]);
  readonly term = signal('');
  readonly selectedSiteId = signal<number | null>(null);
  readonly isLoading = signal(false);

  readonly canCreate = computed(() =>
    this.authDataSource.can(Resource.DIRECTORY, PermissionAction.CREATE),
  );
  readonly canUpdate = computed(() =>
    this.authDataSource.can(Resource.DIRECTORY, PermissionAction.UPDATE),
  );
  readonly canDelete = computed(() =>
    this.authDataSource.can(Resource.DIRECTORY, PermissionAction.DELETE),
  );
  readonly hasRowActions = computed(() => this.canUpdate() || this.canDelete());

  ngOnInit(): void {
    this.loadSites();
    this.loadEntries();
  }

  search(term: string): void {
    this.term.set(term);
    this.loadEntries();
  }

  filterSite(siteId: number | null): void {
    this.selectedSiteId.set(siteId);
    this.loadEntries();
  }

  openDirectoryDialog(directory?: DirectoryEntryResponse): void {
    const ref = this.dialogService.open(DirectoryEditor, {
      header: directory ? 'Editar destino telefónico' : 'Agregar destino telefónico',
      modal: true,
      draggable: false,
      closeOnEscape: true,
      closable: true,
      width: '46rem',
      data: { directory },
      breakpoints: { '960px': '78vw', '640px': '94vw' },
    });
    ref?.onClose.subscribe((result?: DirectoryEntryResponse) => {
      if (result) this.loadEntries();
    });
  }

  openSiteDialog(site?: DirectorySite): void {
    const ref = this.dialogService.open(DirectorySiteEditor, {
      header: site ? 'Editar sede' : 'Agregar sede',
      modal: true,
      draggable: false,
      closeOnEscape: true,
      closable: true,
      width: '28rem',
      data: site,
      breakpoints: { '640px': '94vw' },
    });
    ref?.onClose.subscribe((result?: DirectorySite) => {
      if (!result) return;
      this.loadSites();
      this.loadEntries();
    });
  }

  removeEntry(entry: DirectoryEntryResponse): void {
    this.confirmationService.confirm({
      message: `¿Eliminar el destino de ${entry.areaName}?`,
      header: 'Eliminar destino',
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
      accept: () => this.dataSource.remove(entry.id).subscribe(() => this.loadEntries()),
    });
  }

  removeSite(site: DirectorySite): void {
    this.confirmationService.confirm({
      message: 'Los destinos asociados conservarán sus teléfonos, pero quedarán sin sede.',
      header: `Eliminar ${site.name}`,
      rejectButtonProps: { label: 'Cancelar', severity: 'secondary', outlined: true },
      acceptButtonProps: { label: 'Eliminar', severity: 'danger' },
      accept: () =>
        this.dataSource.removeSite(site.id).subscribe(() => {
          if (this.selectedSiteId() === site.id) this.selectedSiteId.set(null);
          this.loadSites();
          this.loadEntries();
        }),
    });
  }

  private loadEntries(): void {
    this.isLoading.set(true);
    this.dataSource
      .findAll(this.term(), this.selectedSiteId())
      .pipe(finalize(() => this.isLoading.set(false)))
      .subscribe((entries) => this.entries.set(entries));
  }

  private loadSites(): void {
    this.dataSource.findSites().subscribe((sites) => this.sites.set(sites));
  }
}
