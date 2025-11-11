import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { I18nService } from '../../services/i18n.service';

@Component({
  selector: 'app-selector-idioma',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './selector-idioma.component.html',
  styleUrls: ['./selector-idioma.component.css']
})
export class SelectorIdiomaComponent {
  currentLang$;

  constructor(private i18nService: I18nService) {
    this.currentLang$ = this.i18nService.currentLang$;
  }

  setLanguage(lang: string): void {
    this.i18nService.setLang(lang);
  }
}
