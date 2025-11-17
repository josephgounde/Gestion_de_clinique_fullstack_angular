import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AsyncPipe, NgForOf, NgIf } from '@angular/common';
import { Notification, NotificationsService } from '../services/notifications.service';
import { trigger, style, animate, transition, keyframes, query, stagger } from '@angular/animations';


@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, NgForOf, NgIf, AsyncPipe],
  templateUrl: './notifications.component.html',
   animations: [
    trigger('slideFade', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-20px)' }),
        animate('200ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('150ms ease-in', style({ opacity: 0, transform: 'translateY(-20px)' }))
      ])
    ]),
    trigger('notificationAnimation', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateX(50px)' }),
          stagger('100ms', [
            animate('300ms ease-out', keyframes([
              style({ opacity: 0, transform: 'translateX(50px)', offset: 0 }),
              style({ opacity: 1, transform: 'translateX(-5px)', offset: 0.7 }),
              style({ opacity: 1, transform: 'translateX(0)', offset: 1.0 })
            ]))
          ])
        ], { optional: true })
      ])
    ])
     ]
})
export class NotificationsComponent {
  showNotifications = false;        // Indique si le panneau de notifications est affiché
  notifications: Notification[] = []; // Liste des notifications reçues

  constructor(public notificationsService: NotificationsService) {
    // On s'abonne au flux de notifications pour mettre à jour la liste en temps réel
    this.notificationsService.notifications$.subscribe(list => {
      this.notifications = list;
    });
  }

  /** 🔄 Ouvre ou ferme le panneau de notifications */
  toggleNotifications(): void {
    this.showNotifications = !this.showNotifications;
  }

  /** ✅ Marque toutes les notifications comme lues */
  markAllAsRead(): void {
    this.notificationsService.markAllAsRead();
  }

  /** 🎨 Renvoie l'icône selon le type de notification */
  getNotificationIcon(notif: Notification): string {
    switch (notif.type) {
      case 'info': return 'fas fa-info-circle';
      case 'warning': return 'fas fa-exclamation-triangle';
      case 'success': return 'fas fa-check-circle';
      case 'error': return 'fas fa-times-circle';
      default: return 'fas fa-bell';
    }
  }

  /** 🎨 Renvoie la couleur selon le type de notification */
  getNotificationColor(notif: Notification): string {
    switch (notif.type) {
      case 'info': return '#3B82F6';     // bleu
      case 'warning': return '#F59E0B';  // orange
      case 'success': return '#10B981';  // vert
      case 'error': return '#EF4444';    // rouge
      default: return '#6B7280';         // gris
    }
  }

  /** 🎨 Renvoie la couleur de fond selon le type de notification */
  getNotificationColorBg(notif: Notification): string {
    switch (notif.type) {
      case 'info': return '#3B82F6';     // bleu
      case 'warning': return '#F59E0B';  // orange
      case 'success': return '#10B981';  // vert
      case 'error': return '#EF4444';    // rouge
      default: return '#6B7280';         // gris
    }
  }

  /** ✅ Marque une notification comme lue */
  markAsRead(id: number): void {
    this.notificationsService.markAsRead(id);
  }

  /** 🗑️ Supprime une notification */
  deleteNotification(id: number): void {
    this.notificationsService.deleteNotification(id);
  }

  /** 🗑️ Supprime toutes les notifications */
  deleteAllNotifications(): void {
    this.notificationsService.deleteAllNotifications();
  }

  /** 🖱️ Écoute le clic sur le document pour fermer le panneau si on clique en dehors */
  @HostListener('document:click', ['$event'])
  onClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;

    // Si le clic n'est pas sur le bouton ni sur la div des notifications, on ferme
    const clickedInsideButton = target.closest('button');
    const clickedInsidePanel = target.closest('.notifications-panel'); // On met la classe dans le HTML

    if (!clickedInsideButton && !clickedInsidePanel) {
      this.showNotifications = false;
    }
  }
}
