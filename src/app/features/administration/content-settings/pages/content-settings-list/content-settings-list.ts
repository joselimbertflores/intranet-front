import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';

import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';

import { BannerEditor, QuickAccessEditor } from '../../dialogs';

@Component({
  selector: 'app-content-settings-list',
  templateUrl: './content-settings-list.html',
  imports: [ButtonModule, ChipModule, DynamicDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContentSettingsList {
  private dialogService = inject(DialogService);

  showHeroSectionDialog(): void {
    this.dialogService.open(BannerEditor, {
      header: 'Configuración banner',
      modal: true,
      closable: true,
      draggable: false,
      maximizable: true,
      width: '70vw',
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
  }

  showQuickAccessDialog(): void {
    this.dialogService.open(QuickAccessEditor, {
      header: 'Configuración accesos directos',
      modal: true,
      closable: true,
      draggable: false,
      width: '70vw',
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
  }
}
