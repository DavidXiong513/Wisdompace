// ==================== Router Module ====================
// SPA路由系统 - 混合模式实现

const Router = {
    currentPage: null,
    pageHistory: [],
    scrollHandler: null,
    intersectionObservers: [],
    
    init() {
        this.bindLinks();
        this.handlePopState();
        this.loadCurrentPage();
        this.initMobileMenu();
        this.initChapterNavigation();
    },
    
    bindLinks() {
        document.querySelectorAll('a[data-spa]').forEach(link => {
            link.addEventListener('click', (e) => this.handleClick(e));
        });
    },
    
    handleClick(e) {
        e.preventDefault();
        const href = e.currentTarget.getAttribute('href');
        
        if (href === window.location.pathname) {
            return;
        }
        
        this.navigateTo(href);
    },
    
    handlePopState() {
        window.addEventListener('popstate', (e) => {
            if (e.state) {
                this.loadPage(e.state.url, false);
            }
        });
    },
    
    async navigateTo(url) {
        if (this.currentPage === url) return;
        
        await this.fadeOut();
        await this.showLoading();
        await this.loadPage(url, true);
        await this.hideLoading();
        await this.fadeIn();
    },
    
    fadeOut() {
        return new Promise(resolve => {
            document.body.classList.add('fade-out');
            setTimeout(() => {
                document.body.style.opacity = '0';
                resolve();
            }, 300);
        });
    },
    
    fadeIn() {
        return new Promise(resolve => {
            document.body.style.opacity = '1';
            setTimeout(() => {
                document.body.classList.remove('fade-out');
                resolve();
            }, 300);
        });
    },
    
    showLoading() {
        return new Promise(resolve => {
            const loading = document.querySelector('.loading-screen');
            if (loading) {
                loading.classList.add('active');
            }
            setTimeout(resolve, 100);
        });
    },
    
    hideLoading() {
        return new Promise(resolve => {
            const loading = document.querySelector('.loading-screen');
            if (loading) {
                loading.classList.remove('active');
            }
            setTimeout(resolve, 100);
        });
    },
    
    async loadPage(url, updateHistory = true) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const html = await response.text();
            const parser = new DOMParser();
            const newDoc = parser.parseFromString(html, 'text/html');
            
            this.replaceContent(newDoc);
            
            if (updateHistory) {
                this.pageHistory.push(this.currentPage);
                window.history.pushState({ url }, '', url);
            }
            
            this.currentPage = url;
            
            this.reinitializeScripts();
            this.scrollToTop();
            
        } catch (error) {
            console.error('Failed to load page:', error);
            window.location.href = url;
        }
    },
    
    replaceContent(newDoc) {
        const currentBody = document.body;
        const newBody = newDoc.body;
        
        currentBody.innerHTML = newBody.innerHTML;
        
        document.title = newDoc.title;
        
        const newStyles = newDoc.querySelectorAll('link[rel="stylesheet"]');
        newStyles.forEach(styleLink => {
            const href = styleLink.getAttribute('href');
            const existingLink = document.querySelector(`link[href="${href}"], link[href*="${href}"]`);
            if (!existingLink) {
                document.head.appendChild(styleLink);
            }
        });
        
        const newScripts = newDoc.querySelectorAll('script[src]');
        newScripts.forEach(scriptTag => {
            const src = scriptTag.getAttribute('src');
            const existingScript = document.querySelector(`script[src="${src}"], script[src*="${src}"]`);
            if (!existingScript) {
                const newScript = document.createElement('script');
                newScript.src = src;
                document.body.appendChild(newScript);
            }
        });
    },
    
    reinitializeScripts() {
        this.bindLinks();
        
        if (typeof Animations !== 'undefined') {
            Animations.init();
        }
        
        if (typeof Storage !== 'undefined') {
            Storage.init();
        }
        
        if (typeof ToolsPlaceholder !== 'undefined') {
            ToolsPlaceholder.init();
        }
        
        this.initMobileMenu();
        this.initChapterNavigation();
    },
    
    initMobileMenu() {
        const navToggle = document.getElementById('nav-toggle');
        const navMenu = document.getElementById('nav-menu');

        if (navToggle && navMenu) {
            navToggle.onclick = null;
            navToggle.addEventListener('click', () => {
                navMenu.classList.toggle('active');
                navToggle.classList.toggle('active');
            });

            const navItems = navMenu.querySelectorAll('.nav-item');
            navItems.forEach(link => {
                link.onclick = null;
                link.addEventListener('click', () => {
                    navMenu.classList.remove('active');
                    navToggle.classList.remove('active');
                });
            });
        }
    },
    
    initChapterNavigation() {
        const chapterNavItems = document.querySelectorAll('.chapter-nav-item');
        if (chapterNavItems.length > 0) {
            chapterNavItems.forEach(item => {
                item.onclick = null;
                item.addEventListener('click', () => {
                    const sectionId = item.getAttribute('data-section');
                    const section = document.getElementById(sectionId);
                    
                    if (section) {
                        chapterNavItems.forEach(i => i.classList.remove('active'));
                        item.classList.add('active');
                        
                        const navbarHeight = 70;
                        const sectionNavHeight = 60;
                        const offsetTop = section.offsetTop - navbarHeight - sectionNavHeight - 20;
                        
                        window.scrollTo({
                            top: offsetTop,
                            behavior: 'smooth'
                        });
                    }
                });
            });

            if (this.scrollHandler) {
                window.removeEventListener('scroll', this.scrollHandler);
            }
            
            this.scrollHandler = () => {
                const sections = document.querySelectorAll('.subchapter, .summary-section');
                const navItems = document.querySelectorAll('.chapter-nav-item');
                
                let current = '';
                const navbarHeight = 70;
                const sectionNavHeight = 60;
                const offset = navbarHeight + sectionNavHeight + 100;
                
                sections.forEach(section => {
                    const sectionTop = section.offsetTop - offset;
                    const sectionHeight = section.clientHeight;
                    
                    if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                        current = section.getAttribute('id');
                    }
                });

                navItems.forEach(item => {
                    const sectionId = item.getAttribute('data-section');
                    if (sectionId === current) {
                        item.classList.add('active');
                    } else {
                        item.classList.remove('active');
                    }
                });
            };
            
            window.addEventListener('scroll', this.scrollHandler);

            this.intersectionObservers.forEach(observer => {
                observer.disconnect();
            });
            this.intersectionObservers = [];

            const sections = document.querySelectorAll('.subchapter, .summary-section');
            sections.forEach(section => {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const sectionId = entry.target.getAttribute('id');
                            const currentChapter = window.location.pathname.replace(/\/$/, '').split('/').pop();
                            if (typeof Storage !== 'undefined') {
                                Storage.saveReadingProgress(currentChapter, sectionId);
                            }
                        }
                    });
                }, { threshold: 0.5 });
                
                observer.observe(section);
                this.intersectionObservers.push(observer);
            });
        }
    },
    
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    },
    
    loadCurrentPage() {
        this.currentPage = window.location.pathname;
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Router.init();
});
