//import { routes } from './app.routes';
import { Component } from '@angular/core';
import { SidebarComponent } from "./sidebar/sidebar/sidebar.component";
//import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { NavigationEnd, Router } from '@angular/router';
import { RouterModule, RouterOutlet } from '@angular/router';

import { CommonModule } from '@angular/common';
import { FooterComponent } from "./components/app-footer/footer.component";
import { AppHeaderComponent } from "./components/app-header/app-header.component";


@Component({
  standalone: true,
  imports: [RouterOutlet, RouterModule, CommonModule, SidebarComponent, FooterComponent, AppHeaderComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'gestion_de_clinique';
    showSidebar: boolean = true;

  constructor(private router: Router) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        // Afficher la sidebar sauf sur la page de connexion
        this.showSidebar = !['/', '/login'].includes(this.router.url);
      }
    });
  }
}
