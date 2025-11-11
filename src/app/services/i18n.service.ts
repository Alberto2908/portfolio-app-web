import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private currentLangSubject: BehaviorSubject<string>;
  public currentLang$: Observable<string>;

  private translations = {
    es: {
      footer: {
        copy: '© {{year}} Alberto Cabello Lasheras — Desarrollador Full Stack',
        back_to_top: 'Volver arriba',
        links: {
          experiencia: 'Experiencia',
          formacion: 'Formación',
          habilidades: 'Habilidades',
          contacto: 'Contacto'
        }
      },
      home: {
        intro: 'Soy',
        name: 'Alberto Cabello Lasheras',
        description: 'desarrollador Full Stack con experiencia en el diseño y desarrollo de aplicaciones web y móviles utilizando TypeScript (Angular) y Java (Spring Boot). Domino bases de datos relacionales (MySQL) y no relacionales (MongoDB), garantizando un código sólido y despliegues eficientes. Aporto un enfoque creativo gracias a mi experiencia en modelado 3D y entornos interactivos. Me caracterizo por mi proactividad en el trabajo en equipo, mi capacidad para coordinar grupos bajo presión y por destacar en comunicación, responsabilidad y rápida adaptación a nuevas tecnologías.',
        cta_button: 'Ver Portfolio'
      },
      topbar: {
        change_password: 'Cambiar contraseña',
        logout: 'Cerrar sesión'
      },
      breadcrumb: {
        home: 'Inicio',
        portfolio: 'Portfolio',
        habilidades_admin: 'Administrar Habilidades',
        experiencias_admin: 'Administrar Experiencias',
        formaciones_admin: 'Administrar Formaciones',
        cambiar_contrasena: 'Cambiar Contraseña'
      },
      habilidades: {
        title: 'Habilidades',
        categories: {
          frontend: 'Frontend',
          backend: 'Backend',
          tools: 'Herramientas',
          database: 'Base de Datos'
        }
      },
      formacion: {
        title: 'Formación'
      },
      experiencia: {
        title: 'Experiencia'
      },
      contact: {
        title: 'Contacta conmigo',
        form_email_label: 'Email',
        form_email_placeholder: 'tu.email@ejemplo.com',
        form_subject_label: 'Asunto',
        form_subject_placeholder: 'Asunto del mensaje',
        form_message_label: 'Mensaje',
        form_message_placeholder: 'Escribe tu mensaje aquí...',
        submit_button: 'Enviar mensaje',
        email: 'Email',
        phone: 'Teléfono',
        location: 'Ubicación',
        cv: 'Currículum',
        download_cv: 'Descargar CV',
        social_networks: 'Redes sociales'
      },
      months: {
        enero: 'Enero',
        febrero: 'Febrero',
        marzo: 'Marzo',
        abril: 'Abril',
        mayo: 'Mayo',
        junio: 'Junio',
        julio: 'Julio',
        agosto: 'Agosto',
        septiembre: 'Septiembre',
        octubre: 'Octubre',
        noviembre: 'Noviembre',
        diciembre: 'Diciembre'
      }
    },
    en: {
      footer: {
        copy: '© {{year}} Alberto Cabello Lasheras — Full Stack Developer',
        back_to_top: 'Back to top',
        links: {
          experiencia: 'Experience',
          formacion: 'Education',
          habilidades: 'Skills',
          contacto: 'Contact'
        }
      },
      home: {
        intro: 'I am',
        name: 'Alberto Cabello Lasheras',
        description: 'a Full Stack developer with experience in designing and developing web and mobile applications using TypeScript (Angular) and Java (Spring Boot). I master relational (MySQL) and non-relational (MongoDB) databases, ensuring solid code and efficient deployments. I bring a creative approach thanks to my experience in 3D modeling and interactive environments. I am characterized by my proactivity in teamwork, my ability to coordinate groups under pressure, and for excelling in communication, responsibility, and rapid adaptation to new technologies.',
        cta_button: 'View Portfolio'
      },
      topbar: {
        change_password: 'Change password',
        logout: 'Logout'
      },
      breadcrumb: {
        home: 'Home',
        portfolio: 'Portfolio',
        habilidades_admin: 'Manage Skills',
        experiencias_admin: 'Manage Experience',
        formaciones_admin: 'Manage Education',
        cambiar_contrasena: 'Change Password'
      },
      habilidades: {
        title: 'Skills',
        categories: {
          frontend: 'Frontend',
          backend: 'Backend',
          tools: 'Tools',
          database: 'Database'
        }
      },
      formacion: {
        title: 'Education'
      },
      experiencia: {
        title: 'Experience'
      },
      contact: {
        title: 'Contact me',
        form_email_label: 'Email',
        form_email_placeholder: 'your.email@example.com',
        form_subject_label: 'Subject',
        form_subject_placeholder: 'Message subject',
        form_message_label: 'Message',
        form_message_placeholder: 'Write your message here...',
        submit_button: 'Send message',
        email: 'Email',
        phone: 'Phone',
        location: 'Location',
        cv: 'Resume',
        download_cv: 'Download CV',
        social_networks: 'Social networks'
      },
      months: {
        enero: 'January',
        febrero: 'February',
        marzo: 'March',
        abril: 'April',
        mayo: 'May',
        junio: 'June',
        julio: 'July',
        agosto: 'August',
        septiembre: 'September',
        octubre: 'October',
        noviembre: 'November',
        diciembre: 'December'
      }
    }
  };

  constructor(private translate: TranslateService) {
    // Get saved language or default to 'es'
    const savedLang = localStorage.getItem('app-language') || 'es';
    
    // Initialize translate service with immediate effect
    this.translate.addLangs(['es', 'en']);
    this.translate.setDefaultLang('es');
    
    // Force translations synchronously and immediately
    this.translate.setTranslation('es', this.translations.es, true);
    this.translate.setTranslation('en', this.translations.en, true);
    
    // Force the current language immediately (synchronous)
    (this.translate as any)._currentLang = savedLang;
    (this.translate as any)._translationRequests = {};
    
    // Initialize BehaviorSubject
    this.currentLangSubject = new BehaviorSubject<string>(savedLang);
    this.currentLang$ = this.currentLangSubject.asObservable();
    
    // Force immediate use without async operations
    this.translate.use(savedLang);
  }

  private ensureTranslationsReady(lang: string): void {
    const maxRetries = 10;
    let retries = 0;
    
    const checkAndRetry = () => {
      const testTranslation = this.translate.instant('footer.copy');
      if (testTranslation === 'footer.copy' && retries < maxRetries) {
        retries++;
        // Force translations again
        this.translate.setTranslation('es', this.translations.es, true);
        this.translate.setTranslation('en', this.translations.en, true);
        this.translate.use(lang);
        setTimeout(checkAndRetry, 10);
      }
    };
    
    setTimeout(checkAndRetry, 0);
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
    
    // Ensure translations are set before using
    this.translate.setTranslation('es', this.translations.es, true);
    this.translate.setTranslation('en', this.translations.en, true);
    
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
