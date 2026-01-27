import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { DialogService, DynamicDialogModule } from 'primeng/dynamicdialog';


import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';

import { HeroSlideEditor, QuickAccessEditor } from '../../dialogs';

@Component({
  selector: 'app-content-settings-list',
  templateUrl: './content-settings-list.html',
  imports: [ButtonModule, ChipModule, DynamicDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContentSettingsList {
  private dialogService = inject(DialogService);

  showHeroSectionDialog(): void {
    this.dialogService.open(HeroSlideEditor, {
      header: 'Configuración banner',
      modal: true,
      width: '60vw',
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
  }

  showQuickAccessDialog(): void {
    this.dialogService.open(QuickAccessEditor, {
      header: 'Configuración accesos',
      modal: true,
      width: '40vw',
      breakpoints: {
        '960px': '75vw',
        '640px': '90vw',
      },
    });
  }
}
