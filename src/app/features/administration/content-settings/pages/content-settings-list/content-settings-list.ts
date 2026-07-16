import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
} from '@angular/core';


import { AuthDataSource } from '../../../../../core/auth/auth-data-source';
import {
  PermissionAction,
  Resource,
} from '../../../../../core/auth/auth.types';
import {
  BannerEditor,
  FeaturedBannerEditor,
  QuickAccessEditor,
} from '../../dialogs';

@Component({
  selector: 'app-content-settings-list',
  templateUrl: './content-settings-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class ContentSettingsList {
  // private dialogService = inject(DialogService);
  private authDataSource = inject(AuthDataSource);

  canUpdate = computed(() =>
    this.authDataSource.can(Resource.CONTENT, PermissionAction.UPDATE),
  );

  showHeroSectionDialog(): void {
    // this.dialogService.open(BannerEditor, {
    //   header: 'Configuración banner',
    //   modal: true,
    //   closable: true,
    //   draggable: false,
    //   maximizable: true,
    //   width: '70vw',
    //   breakpoints: {
    //     '960px': '75vw',
    //     '640px': '90vw',
    //   },
    // });
  }

  showQuickAccessDialog(): void {
    // this.dialogService.open(QuickAccessEditor, {
    //   header: 'Configuración accesos directos',
    //   modal: true,
    //   closable: true,
    //   draggable: false,
    //   width: '60vw',
    //   breakpoints: {
    //     '960px': '75vw',
    //     '640px': '90vw',
    //   },
    // });
  }

  showFeaturedBannersDialog(): void {
    // this.dialogService.open(FeaturedBannerEditor, {
    //   header: 'Configuración de banners destacados',
    //   modal: true,
    //   closable: true,
    //   draggable: false,
    //   maximizable: true,
    //   width: '72vw',
    //   breakpoints: { '960px': '82vw', '640px': '94vw' },
    // });
  }
}
