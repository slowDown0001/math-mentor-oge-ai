import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

import p5 from 'p5';

const Test = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Simple console log to check if effect runs
    console.log('Initializing p5.js particle system...');
    
    // Check if p5 is available
    if (typeof p5 === 'undefined') {
      console.error('p5.js library is not loaded');
      return;
    }

    // Particle class for mathematical symbols
    class Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      opacity: number;
      symbol: string;
      rotation: number;
      rotationSpeed: number;

      constructor(p: any) {
        this.x = p.random(p.width);
        this.y = p.random(p.height);
        this.vx = p.random(-0.5, 0.5);
        this.vy = p.random(-0.5, 0.5);
        this.size = p.random(2, 4);
        this.opacity = p.random(0.3, 0.7); // Made more visible
        this.symbol = p.random(['∑', '∫', 'π', '∞', '√', 'Δ', 'θ', 'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'λ', 'μ', 'ξ', 'ρ', 'σ', 'τ', 'φ', 'χ', 'ψ', 'ω']);
        this.rotation = 0;
        this.rotationSpeed = p.random(-0.02, 0.02);
      }
      
      update(p: any) {
        this.x += this.vx;
        this.y += this.vy;
        this.rotation += this.rotationSpeed;
        
        // Wrap around edges
        if (this.x < -50) this.x = p.width + 50;
        if (this.x > p.width + 50) this.x = -50;
        if (this.y < -50) this.y = p.height + 50;
        if (this.y > p.height + 50) this.y = -50;
      }
      
      display(p: any) {
        p.push();
        p.translate(this.x, this.y);
        p.rotate(this.rotation);
        p.fill(245, 158, 11, this.opacity * 255);
        p.noStroke();
        p.textAlign(p.CENTER, p.CENTER);
        p.textSize(this.size * 12); // Made bigger
        p.text(this.symbol, 0, 0);
        p.pop();
      }
    }

    // Connect nearby particles with lines
    function connectParticles(p: any, particles: Particle[]) {
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const distance = p.dist(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
          
          if (distance < 120) {
            const opacity = p.map(distance, 0, 120, 0.4, 0);
            p.stroke(245, 158, 11, opacity * 255);
            p.strokeWeight(2);
            p.line(particles[i].x, particles[i].y, particles[j].x, particles[j].y);
          }
        }
      }
    }

    // P5.js particle system for mathematical symbols background
    const sketch = (p: any) => {
      let particles: Particle[] = [];
      
      p.setup = function() {
        console.log('p5.js setup running...');
        // Create canvas that covers the full window
        let canvas = p.createCanvas(p.windowWidth, p.windowHeight);
        canvas.parent(document.body); // Attach to body instead
        canvas.style('position', 'fixed');
        canvas.style('top', '0');
        canvas.style('left', '0');
        canvas.style('z-index', '-1');
        canvas.style('pointer-events', 'none');
        
        // Create particles with mathematical symbols
        for (let i = 0; i < 80; i++) { // More particles
          particles.push(new Particle(p));
        }
        
        console.log(`Created ${particles.length} particles`);
      };
      
      p.draw = function() {
        p.clear(); // Transparent background
        
        // Update and display particles
        particles.forEach(particle => {
          particle.update(p);
          particle.display(p);
        });
        
        // Connect nearby particles with lines
        connectParticles(p, particles);
      };
      
      p.windowResized = function() {
        p.resizeCanvas(p.windowWidth, p.windowHeight);
      };
    };

    try {
      const myP5 = new p5(sketch);
      console.log('p5.js instance created successfully');

      return () => {
        console.log('Cleaning up p5.js instance');
        myP5.remove();
      };
    } catch (error) {
      console.error('Error creating p5.js instance:', error);
    }
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Navigation */}
      <nav className="relative z-10 p-6">
        <Button 
          onClick={() => navigate('/')}
          variant="outline"
          className="mb-4"
        >
          ← Back to Home
        </Button>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-6">
        <div className="text-center space-y-8 max-w-4xl">
          {/* Hero Section */}
          <div className="space-y-6">
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent animate-fade-in">
              Test Page
            </h1>
            
            <p className="text-xl md:text-2xl text-muted-foreground animate-fade-in delay-200">
              Featuring beautiful floating mathematical symbols
            </p>
          </div>

          {/* Interactive Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <div className="bg-card/80 backdrop-blur-md p-6 rounded-2xl border shadow-lg hover-scale animate-fade-in delay-300">
              <div className="text-4xl mb-4">∫</div>
              <h3 className="text-xl font-semibold mb-2">Calculus</h3>
              <p className="text-muted-foreground">Explore the beauty of derivatives and integrals</p>
            </div>
            
            <div className="bg-card/80 backdrop-blur-md p-6 rounded-2xl border shadow-lg hover-scale animate-fade-in delay-400">
              <div className="text-4xl mb-4">π</div>
              <h3 className="text-xl font-semibold mb-2">Geometry</h3>
              <p className="text-muted-foreground">Discover the mysteries of circles and spheres</p>
            </div>
            
            <div className="bg-card/80 backdrop-blur-md p-6 rounded-2xl border shadow-lg hover-scale animate-fade-in delay-500">
              <div className="text-4xl mb-4">∞</div>
              <h3 className="text-xl font-semibold mb-2">Infinity</h3>
              <p className="text-muted-foreground">Contemplate the endless possibilities</p>
            </div>
          </div>

          {/* Interactive Buttons */}
          <div className="flex flex-wrap justify-center gap-4 mt-12">
            <Button 
              size="lg" 
              className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 animate-fade-in delay-600"
            >
              Explore Mathematics
            </Button>
            
            <Button 
              size="lg" 
              variant="outline"
              className="animate-fade-in delay-700"
            >
              Learn More
            </Button>
          </div>

          {/* Floating Math Symbols */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="floating-symbol absolute top-20 left-10 text-primary/30 animate-pulse">Σ</div>
            <div className="floating-symbol absolute top-40 right-20 text-secondary/30 animate-pulse delay-1000">∆</div>
            <div className="floating-symbol absolute bottom-32 left-20 text-accent/30 animate-pulse delay-2000">θ</div>
            <div className="floating-symbol absolute bottom-20 right-10 text-primary/30 animate-pulse delay-3000">ψ</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Test;