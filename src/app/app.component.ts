import { Component, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { SelectorIdiomaComponent } from './components/selector-idioma/selector-idioma.component';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: number;
  phase: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BreadcrumbComponent, SelectorIdiomaComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements AfterViewInit {
  title = 'app-web';
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private particles: Particle[] = [];

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d')!;

    // Canvas sizing
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Initialize particles
    const numParticles = 960; // doubled from 480
    for (let i = 0; i < numParticles; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: 0,
        vy: 0,
        size: 2 + Math.random() * 4,
        color: Math.random(),
        phase: Math.random() * Math.PI * 2
      });
    }

    let mouseX = canvas.width / 2;
    let mouseY = canvas.height / 2;
    let lastMouseMove = Date.now();
    let isMouseMoving = false;

    // Mouse tracking - use window instead of canvas to capture all mouse movement
    window.addEventListener('mousemove', (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      lastMouseMove = Date.now();
      isMouseMoving = true;
    });
    
    // Also track touch events for mobile
    window.addEventListener('touchmove', (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouseX = e.touches[0].clientX;
        mouseY = e.touches[0].clientY;
        lastMouseMove = Date.now();
        isMouseMoving = true;
      }
    });

    // Resize handler
    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    });

    // Color palette
    const colors = [
      { r: 38, g: 26, b: 204 },    // azul/violeta
      { r: 250, g: 77, b: 230 },   // rosa/magenta
      { r: 140, g: 64, b: 217 },   // morado
      { r: 255, g: 255, b: 255 }   // blanco
    ];

    // Animation loop
    let time = 0;
    const animate = () => {
      time += 0.016;
      
      // Check if mouse is idle (no movement for 300ms)
      const now = Date.now();
      if (now - lastMouseMove > 300) {
        isMouseMoving = false;
      }
      
      // Strong fade to black for minimal trails
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Update and draw particles
      this.particles.forEach((p: Particle, i: number) => {
        // Physics: attraction to mouse
        const dx = mouseX - p.x;
        const dy = mouseY - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Repulsion from other particles to prevent clustering
        this.particles.forEach((other: Particle, j: number) => {
          if (i !== j) {
            const odx = p.x - other.x;
            const ody = p.y - other.y;
            const odist = Math.sqrt(odx * odx + ody * ody);

            if (odist < 40 && odist > 0) {
              const repelForce = (40 - odist) * 0.008;
              p.vx += (odx / odist) * repelForce;
              p.vy += (ody / odist) * repelForce;
            }
          }
        });

        // Behavior depends on mouse movement
        if (isMouseMoving) {
          // Attraction to mouse with minimum distance
          if (dist > 30) {
            const force = Math.min(dist * 0.0015, 0.8);
            p.vx += (dx / dist) * force;
            p.vy += (dy / dist) * force;
          }
          
          // Add some random drift for organic movement
          p.vx += (Math.random() - 0.5) * 0.15;
          p.vy += (Math.random() - 0.5) * 0.15;
        } else {
          // Mouse is idle: spread out across the screen
          // Calculate center of screen
          const centerX = canvas.width / 2;
          const centerY = canvas.height / 2;
          
          // Calculate ideal position for this particle (distributed across screen)
          const gridSize = Math.ceil(Math.sqrt(this.particles.length));
          const gridX = (i % gridSize) / gridSize;
          const gridY = Math.floor(i / gridSize) / gridSize;
          
          // Add some variation to avoid perfect grid
          const targetX = gridX * canvas.width * 0.9 + canvas.width * 0.05 + Math.sin(time * 0.3 + i) * 30;
          const targetY = gridY * canvas.height * 0.9 + canvas.height * 0.05 + Math.cos(time * 0.25 + i) * 30;
          
          // Gentle pull toward ideal position
          const tdx = targetX - p.x;
          const tdy = targetY - p.y;
          const tdist = Math.sqrt(tdx * tdx + tdy * tdy);
          
          if (tdist > 10) {
            p.vx += (tdx / tdist) * 0.08;
            p.vy += (tdy / tdist) * 0.08;
          }
          
          // Organic floating motion
          p.vx += Math.sin(time * 2 + i * 0.3) * 0.06;
          p.vy += Math.cos(time * 1.5 + i * 0.4) * 0.06;
          
          // Random flutter
          p.vx += (Math.random() - 0.5) * 0.1;
          p.vy += (Math.random() - 0.5) * 0.1;
        }

        // Damping (less damping for faster movement)
        p.vx *= 0.95;
        p.vy *= 0.95;

        // Update position
        p.x += p.vx;
        p.y += p.vy;

        // Boundaries with elastic bounce
        const margin = 50; // Distance from edge to start repelling
        
        // Left edge
        if (p.x < margin) {
          const force = (margin - p.x) / margin;
          p.vx += force * 0.5;
          if (p.x < 0) { p.x = 0; p.vx *= -0.8; }
        }
        
        // Right edge
        if (p.x > canvas.width - margin) {
          const force = (p.x - (canvas.width - margin)) / margin;
          p.vx -= force * 0.5;
          if (p.x > canvas.width) { p.x = canvas.width; p.vx *= -0.8; }
        }
        
        // Top edge
        if (p.y < margin) {
          const force = (margin - p.y) / margin;
          p.vy += force * 0.5;
          if (p.y < 0) { p.y = 0; p.vy *= -0.8; }
        }
        
        // Bottom edge
        if (p.y > canvas.height - margin) {
          const force = (p.y - (canvas.height - margin)) / margin;
          p.vy -= force * 0.5;
          if (p.y > canvas.height) { p.y = canvas.height; p.vy *= -0.8; }
        }

        // Animate phase for pulsing
        p.phase += 0.02;
        const pulse = 0.8 + Math.sin(p.phase) * 0.2;

        // Get color
        const colorIndex = Math.floor(p.color * colors.length);
        const color = colors[colorIndex];

        // Draw particle with glow
        const size = p.size * pulse;

        // Outer glow - interpolate to black instead of transparent to avoid gray buildup
        const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2);
        gradient.addColorStop(0, `rgb(${color.r}, ${color.g}, ${color.b})`);
        gradient.addColorStop(0.6, `rgb(${Math.floor(color.r * 0.3)}, ${Math.floor(color.g * 0.3)}, ${Math.floor(color.b * 0.3)})`);
        gradient.addColorStop(1, `rgb(0, 0, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Core particle - brighter
        ctx.fillStyle = `rgb(${Math.min(255, color.r + 30)}, ${Math.min(255, color.g + 30)}, ${Math.min(255, color.b + 30)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      requestAnimationFrame(animate);
    };

    animate();

  }
}
