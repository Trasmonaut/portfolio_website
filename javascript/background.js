
const canvas = document.getElementById('canvas1');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

console.log(ctx);

ctx.fillStyle = '#f2ecfe';
ctx.strokeStyle = 'white';


class Particle {
    constructor(effect) {
        this.effect = effect;

        this.radius = 2;
        this.imageSize = this.radius * 6;
        this.halfImageSize = this.imageSize * 0.5;
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);

        this.vx = Math.random() * 0.8 - 0.5;
        this.vy = Math.random() * 0.8 - 0.5;
        this.pushX = 0;
        this.pushY = 0;
        this.friction = 0.96;
        this.image = document.getElementById('particle_image');
    }

    draw(context) {
        context.drawImage(this.image, this.x - this.halfImageSize, this.y - this.halfImageSize, this.imageSize, this.imageSize);
    }

    update() {
        if (this.effect.mouse.pressed) {
            const dx = this.x - this.effect.mouse.x;
            const dy = this.y - this.effect.mouse.y;
            const distance = Math.hypot(dx, dy);
            const force = (this.effect.mouse.radius / distance);
            if (distance < this.effect.mouse.radius) {
                const angle = Math.atan2(dy, dx);
                this.pushX += Math.cos(angle) * force;
                this.pushY += Math.sin(angle) * force;
            }
        }
        this.x += (this.pushX *= this.friction) + this.vx;
        this.y += (this.pushY *= this.friction) + this.vy;
        if (this.x < this.radius) {
            this.x = this.radius;
            this.vx *= -1;
        }
        else if (this.x > this.effect.width - this.radius) {
            this.x = this.effect.width - this.radius;
            this.vx *= -1;
        }
        if (this.y < this.radius) {
            this.y = this.radius;
            this.vy *= -1;
        }
        else if (this.y > this.effect.height - this.radius) {
            this.y = this.effect.height - this.radius;
            this.vy *= -1;
        }

    }
    reset() {
        this.x = this.radius + Math.random() * (this.effect.width - this.radius * 2);
        this.y = this.radius + Math.random() * (this.effect.height - this.radius * 2);
    }
}

class Effect {
    constructor(canvas, context) {

        this.canvas = canvas;
        this.context = context;

        this.width = this.canvas.width;

        this.height = this.canvas.height;

        this.particles = [];

        this.particleDensity = 0.000075;

        this.numberOfParticles = Math.floor(this.width * this.height * this.particleDensity)
        if (this.numberOfParticles > 300) {
            this.numberOfParticles = 300

        }

        this.createParticles();

        this.mouse = {
            x: 0,
            y: 0,
            pressed: true,
            radius: 50
        };

        window.addEventListener('resize', e => {
            this.resize(e.target.window.innerWidth, e.target.window.innerHeight);
        });
        window.addEventListener('mousemove', e => {
            this.mouse.x = e.x;
            this.mouse.y = e.y;

        });
        window.addEventListener('mousedown', e => {
            this.mouse.radius = 250;
            this.mouse.x = e.x;
            this.mouse.y = e.y;
        });
        window.addEventListener('mouseup', e => {
            this.mouse.radius = 70;
        });

    }

    createParticles() {
        for (let i = 0; i < this.numberOfParticles; i++) {
            this.particles.push(new Particle(this));
        }
    }

    handleParticles(context) {
        this.connectParticles(context);
        this.particles.forEach(particle => {
            particle.draw(context);
            particle.update();
        });
    }
    connectParticles(context) {
        const maxDistance = 150;
        for (let a = 0; a < this.particles.length; a++) {
            for (let b = a; b < this.particles.length; b++) {
                const dx = this.particles[a].x - this.particles[b].x;
                const dy = this.particles[a].y - this.particles[b].y;
                const distance = Math.hypot(dx, dy);
                if (distance < maxDistance) {
                    context.save();
                    const opacity = 1 - (distance / maxDistance);
                    context.globalAlpha = opacity;
                    context.beginPath();
                    context.moveTo(this.particles[a].x, this.particles[a].y);
                    context.lineTo(this.particles[b].x, this.particles[b].y);
                    context.stroke();
                    context.restore();
                }
            }
        }
    }
    resize(width, height) {
        this.canvas.width = width;
        this.canvas.height = height;
        this.width = width;
        this.height = height;
        this.context.fillStyle = '#f2ecfe';
        this.context.strokeStyle = 'white';
        this.numberOfParticles = Math.floor(this.width * this.height * this.particleDensity);

        // Limit the number of particles if needed
        if (this.numberOfParticles > 300) {
            this.numberOfParticles = 300;
        }
        this.particles = [];
        this.createParticles();
        this.particles.forEach(particle => {
            particle.reset();
        });
    }
}

const effect = new Effect(canvas, ctx);

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    effect.handleParticles(ctx);

    requestAnimationFrame(animate);
}

animate();