
import {
  trigger,
  style,
  transition,
  animate
} from '@angular/animations';

export const fadeInOut = trigger('fadeInOut', [
  transition(':enter', [
    style({ opacity: 0 }),
    animate('300ms ease-in', style({ opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-out', style({ opacity: 0 }))
  ])
]);

export const slideUp = trigger('slideUp', [
  transition(':enter', [
    style({ transform: 'translateY(20px)', opacity: 0 }),
    animate('300ms ease-out', style({ transform: 'translateY(0)', opacity: 1 }))
  ]),
  transition(':leave', [
    animate('200ms ease-in', style({ transform: 'translateY(-20px)', opacity: 0 }))
  ])
]);

export const notificationAnimation = trigger('notificationAnimation', [
  transition(':enter', [
    style({ 
      transform: 'translateX(400px)', 
      opacity: 0 
    }),
    animate('300ms cubic-bezier(0.68, -0.55, 0.265, 1.55)', 
      style({ 
        transform: 'translateX(0)', 
        opacity: 1 
      })
    )
  ]),
  transition(':leave', [
    animate('200ms ease-in', 
      style({ 
        transform: 'translateX(400px)', 
        opacity: 0 
      })
    )
  ])
]);