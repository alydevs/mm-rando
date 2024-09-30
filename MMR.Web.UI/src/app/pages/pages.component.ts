import { Component } from '@angular/core';
import { MENU_ITEMS } from './pages-menu';

@Component({
  selector: 'mmr-ngx-pages',
  template: `
    <mmr-gui-layout>
      <router-outlet></router-outlet>
    </mmr-gui-layout>
  `,
})
export class PagesComponent {
  menu = MENU_ITEMS;
}
