import {
  ChangeDetectionStrategy,
  Component,
  input,
  output,
} from '@angular/core';

export interface NavItem {
  id: string;
  label: string;
  icon: string;          // SVG path data
  badge?: string | number;
  active?: boolean;
}

@Component({
  selector: 'app-left-sidenav',
  standalone: true,
  templateUrl: './left-sidenav.component.html',
  styleUrl: './left-sidenav.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LeftSidenavComponent {
  readonly collapsed    = input<boolean>(false);
  readonly activeRoute  = input<string>('home');
  readonly navItemClick = output<string>();

  readonly navItems: NavItem[] = [
    {
      id: 'home',
      label: 'Home',
      icon: 'M3 12L12 3l9 9M5 10v10a1 1 0 001 1h4v-5h4v5h4a1 1 0 001-1V10',
      active: true,
    },
    {
      id: 'morning-report',
      label: 'Reports',
      icon: 'M9 17v-2m3 2v-4m3 4v-6M5 20h14a2 2 0 002-2V8l-5-5H5a2 2 0 00-2 2v13a2 2 0 002 2z',
    },
    {
      id: 'maps',
      label: 'Maps',
      icon: 'M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 9m0 8V9m0 0L9 7',
    },
    {
      id: 'presentations',
      label: 'Presentations',
      icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z',
    },
    
  ];

  protected onItemClick(id: string): void {
    this.navItemClick.emit(id);
  }
}
