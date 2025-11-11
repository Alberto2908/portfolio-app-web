import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, NzIconModule, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear = new Date().getFullYear();
  @Input() showBackToTop = true;
  @Input() showShortcuts = true;

  scrollTop(): void {
    try {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      window.scrollTo(0, 0);
    }
  }

  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      const yOffset = -100; // Offset for fixed header/breadcrumb
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      try {
        window.scrollTo({ top: y, behavior: 'smooth' });
      } catch {
        window.scrollTo(0, y);
      }
    }
  }
}
