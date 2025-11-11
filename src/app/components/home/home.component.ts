import { Component } from '@angular/core';
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
export class HomeComponent {
  profileImage = 'images/Alberto.jpeg';

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
