// ==================== Animations Module ====================
// 动画效果系统

const Animations = {
    glitchInterval: null,
    digitalRainCanvas: null,
    digitalRainCtx: null,
    rainDrops: [],
    
    init() {
        this.initGlitchEffect();
        this.initDigitalRain();
        this.initScrollAnimations();
        this.initNavbarScroll();
    },
    
    // Glitch Effect - 故障艺术效果
    initGlitchEffect() {
        const glitchElements = document.querySelectorAll('.glitch-title');
        
        glitchElements.forEach(element => {
            this.triggerGlitch(element);
            setInterval(() => {
                this.triggerGlitch(element);
            }, this.getRandomInterval(5000, 10000));
        });
    },
    
    triggerGlitch(element) {
        const originalText = element.textContent;
        const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?/~`';
        let iterations = 0;
        const maxIterations = 10;
        
        const glitchInterval = setInterval(() => {
            element.textContent = originalText
                .split('')
                .map((char, index) => {
                    if (index < iterations) {
                        return char;
                    }
                    return chars[Math.floor(Math.random() * chars.length)];
                })
                .join('');
            
            if (iterations >= originalText.length) {
                clearInterval(glitchInterval);
                element.textContent = originalText;
            }
            
            iterations += 1;
        }, 50);
    },
    
    getRandomInterval(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    
    // Digital Rain - 数字雨效果
    initDigitalRain() {
        this.digitalRainCanvas = document.getElementById('digital-rain');
        if (!this.digitalRainCanvas) return;
        
        this.digitalRainCtx = this.digitalRainCanvas.getContext('2d');
        
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        this.initRainDrops();
        this.animateDigitalRain();
        
        this.initMouseFollow();
    },
    
    resizeCanvas() {
        this.digitalRainCanvas.width = window.innerWidth;
        this.digitalRainCanvas.height = window.innerHeight;
    },
    
    initRainDrops() {
        const columns = Math.floor(this.digitalRainCanvas.width / 20);
        this.rainDrops = Array(columns).fill(1);
    },
    
    animateDigitalRain() {
        const ctx = this.digitalRainCtx;
        const canvas = this.digitalRainCanvas;
        const drops = this.rainDrops;
        
        ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = 'rgba(0, 240, 255, 0.5)';
        ctx.font = '15px monospace';
        
        drops.forEach((drop, i) => {
            const text = String.fromCharCode(0x30A0 + Math.random() * 96);
            ctx.fillText(text, i * 20, drop * 20);
            
            if (drop * 20 > canvas.height && Math.random() > 0.975) {
                drops[i] = 0;
            }
            drops[i]++;
        });
        
        requestAnimationFrame(() => this.animateDigitalRain());
    },
    
    initMouseFollow() {
        const canvas = this.digitalRainCanvas;
        
        canvas.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            this.createMouseDrop(x, y);
        });
    },
    
    createMouseDrop(x, y) {
        const ctx = this.digitalRainCtx;
        const char = String.fromCharCode(0x30A0 + Math.random() * 96);
        
        ctx.fillStyle = 'rgba(189, 0, 255, 0.8)';
        ctx.font = '20px monospace';
        ctx.fillText(char, x, y);
    },
    
    // Scroll Animations - 滚动动画
    initScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('fade-in-up');
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        document.querySelectorAll('.subchapter, .card, .tool-section').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            observer.observe(el);
        });
        
        document.querySelectorAll('.chapter-card').forEach((el, index) => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
            observer.observe(el);
        });
    },
    
    // Navbar Scroll Effect - 导航栏滚动效果
    initNavbarScroll() {
        const navbar = document.querySelector('nav');
        if (!navbar) return;
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
        });
        
        this.updateActiveNavLink();
    },
    
    updateActiveNavLink() {
        window.addEventListener('scroll', () => {
            const sections = document.querySelectorAll('section[id], .subchapter[id]');
            const navItems = document.querySelectorAll('.nav-item');
            
            let current = '';
            
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 150;
                const sectionHeight = section.clientHeight;
                
                if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                    current = section.getAttribute('id');
                }
            });
            
            navItems.forEach(item => {
                item.classList.remove('active');
                const href = item.getAttribute('href') || item.getAttribute('data-href');
                if (href && href.slice(1) === current) {
                    item.classList.add('active');
                }
            });
        });
    },
    
    // Staggered Animation - 交错动画
    staggerAnimate(elements, delay = 100) {
        elements.forEach((el, index) => {
            setTimeout(() => {
                el.classList.add('fade-in-up');
            }, index * delay);
        });
    },
    
    // Neon Pulse - 霓虹脉冲
    neonPulse(element, duration = 2000) {
        element.style.animation = `neon-glow ${duration}ms ease-in-out infinite`;
    },
    
    // Stop Glitch - 停止故障效果
    stopGlitch() {
        if (this.glitchInterval) {
            clearInterval(this.glitchInterval);
        }
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Animations.init();
});
