import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { ScrollTopModule } from 'primeng/scrolltop';

import { PortalFooter, PortalNavbar } from './components';

@Component({
  selector: 'app-portal-layout',
  imports: [RouterModule, ScrollTopModule, PortalNavbar, PortalFooter],
  templateUrl: './portal-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PortalLayout {}
