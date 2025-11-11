import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, NzCardModule, NzAvatarModule, NzButtonModule, FooterComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  profileImage = 'images/Alberto.jpeg';

  ngOnInit(): void {
    // Block scroll on home page
    document.body.classList.add('home-no-scroll');
  }

  ngOnDestroy(): void {
    // Restore scroll when leaving home page
    document.body.classList.remove('home-no-scroll');
  }

  onImageError(event: any) {
    console.error('Error loading image:', this.profileImage);
    console.log('Trying alternative paths...');
    
    // Try different paths
    const alternatives = [
      '/images/Alberto.jpeg',
      'assets/images/Alberto.jpeg',
      '/assets/images/Alberto.jpeg',
      '../../../assets/images/Alberto.jpeg'
    ];
    
    const currentIndex = alternatives.indexOf(this.profileImage);
    if (currentIndex < alternatives.length - 1) {
      this.profileImage = alternatives[currentIndex + 1];
      console.log('Trying:', this.profileImage);
    } else {
      console.error('All image paths failed');
      // Set a placeholder or default image
      event.target.style.display = 'none';
    }
  }
}
