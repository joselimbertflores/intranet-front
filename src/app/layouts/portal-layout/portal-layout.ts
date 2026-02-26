import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterModule } from '@angular/router';

import { PortalFooter, PortalNavbar } from './components';

@Component({
  selector: 'app-portal-layout',
  imports: [RouterModule, PortalNavbar, PortalFooter],
  templateUrl: './portal-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class PortalLayout {}
