import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLangSubject: BehaviorSubject<string>;
  public currentLang$: Observable<string>;

  constructor(private translate: TranslateService) {
    // Get saved language or default to 'es'
    const savedLang = localStorage.getItem('app-language') || 'es';
    
    // Initialize translate service
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang('es');
    this.translate.use(savedLang);

    // Initialize BehaviorSubject
    this.currentLangSubject = new BehaviorSubject<string>(savedLang);
    this.currentLang$ = this.currentLangSubject.asObservable();
  }

  /**
   * Get current language
   */
  getCurrentLang(): string {
    return this.currentLangSubject.value;
  }

  /**
   * Set language and persist to localStorage
   */
  setLang(lang: string): void {
    if (lang === this.currentLangSubject.value) {
      return;
    }
    
    this.translate.use(lang);
    localStorage.setItem('app-language', lang);
    this.currentLangSubject.next(lang);
  }

  /**
   * Toggle between es and en
   */
  toggleLang(): void {
    const newLang = this.currentLangSubject.value === 'es' ? 'en' : 'es';
    this.setLang(newLang);
  }

  /**
   * Get instant translation
   */
  instant(key: string): string {
    return this.translate.instant(key);
  }
}
