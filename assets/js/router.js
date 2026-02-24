// ==================== Router Module ====================
// SPA路由系统 - 混合模式实现

const Router = {
    currentPage: null,
    pageHistory: [],
    scrollHandler: null,
    intersectionObservers: [],

    // ==================== 安全工具函数 ====================
    
    /**
     * HTML实体转义 - 防止XSS攻击
     */
    escapeHtml(str) {
        if (!str || typeof str !== 'string') return '';
        const htmlEscapes = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '/': '&#x2F;',
            '`': '&#x60;',
            '=': '&#x3D;'
        };
        return str.replace(/[&<>"'`=/]/g, char => htmlEscapes[char] || char);
    },

    /**
     * 移除危险的HTML内容
     */
    sanitizeHtml(html) {
        if (!html || typeof html !== 'string') return '';
        // 移除script标签
        html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
        // 移除事件处理器
        html = html.replace(/\s*on\w+\s*=\s*(["'])[^"']*\1/gi, '');
        html = html.replace(/\s*on\w+\s*=[^\s>]+/gi, '');
        // 移除javascript:协议
        html = html.replace(/javascript:/gi, '');
        // 移除data:协议（除了安全的图片）
        html = html.replace(/data:(?!image\/)/gi, '');
        // 移除vbscript:协议
        html = html.replace(/vbscript:/gi, '');
        return html;
    },

    /**
     * 验证URL是否安全（仅允许同源相对路径）
     */
    validateUrl(url) {
        if (!url || typeof url !== 'string') return false;
        // 仅允许相对路径
        if (url.startsWith('/') && !url.startsWith('//')) {
            // 禁止路径遍历
            if (url.includes('..')) return false;
            // 禁止危险协议
            if (/javascript:|data:|vbscript:/i.test(url)) return false;
            return true;
        }
        // 允许同源绝对路径
        if (url.startsWith(window.location.origin)) {
            return true;
        }
        // 允许简单文件名（如 index.html, chapter-1.html）
        if (/^[a-zA-Z0-9_-]+\.html$/.test(url)) {
            return true;
        }
        return false;
    },

    /**
     * 验证脚本源是否安全
     */
    validateScriptSrc(src) {
        if (!src || typeof src !== 'string') return false;
        // 仅允许同源相对路径的JS文件
        const allowedPaths = ['/assets/js/', './assets/js/', 'assets/js/'];
        const isAllowedPath = allowedPaths.some(path => src.startsWith(path));
        if (!isAllowedPath) return false;
        // 禁止路径遍历
        if (src.includes('..')) return false;
        // 必须是.js文件
        if (!src.endsWith('.js')) return false;
        return true;
    },

    /**
     * 验证样式表源是否安全
     */
    validateStyleSrc(href) {
        if (!href || typeof href !== 'string') return false;
        // 仅允许同源相对路径的CSS文件
        const allowedPaths = ['/assets/css/', './assets/css/', 'assets/css/'];
        const isAllowedPath = allowedPaths.some(path => href.startsWith(path));
        if (!isAllowedPath) return false;
        // 禁止路径遍历
        if (href.includes('..')) return false;
        // 必须是.css文件
        if (!href.endsWith('.css')) return false;
        return true;
    },

    /**
     * 显示用户友好的错误提示
     */
    showUserError(message, technicalDetails = '') {
        // 在控制台记录技术细节
        if (technicalDetails) {
            console.error('Security Error:', technicalDetails);
        }
        
        // 显示用户友好的消息
        console.warn('User Notice:', message);
        
        // 开发环境：显示详细信息
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.info('Technical Details:', technicalDetails);
        }
    },
    
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
        
        // 安全验证: 检查URL是否合法
        if (!this.validateUrl(href)) {
            this.showUserError(
                '抱歉，该链接不安全，无法访问。如有疑问请联系管理员。',
                `Invalid URL blocked: ${href}`
            );
            return;
        }
        
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
        
        // 安全处理: 清洗HTML内容防止XSS
        const sanitizedHtml = this.sanitizeHtml(newBody.innerHTML);
        currentBody.innerHTML = sanitizedHtml;
        
        // 安全处理: 转义标题
        document.title = this.escapeHtml(newDoc.title);
        
        // 安全处理: 仅加载已验证的样式表
        const newStyles = newDoc.querySelectorAll('link[rel="stylesheet"]');
        newStyles.forEach(styleLink => {
            const href = styleLink.getAttribute('href');
            // 验证样式表源
            if (!this.validateStyleSrc(href)) {
                console.warn('Security: Blocked stylesheet from untrusted source:', href);
                return;
            }
            const existingLink = document.querySelector(`link[href="${CSS.escape(href)}"], link[href*="${CSS.escape(href)}"]`);
            if (!existingLink) {
                const safeLink = document.createElement('link');
                safeLink.rel = 'stylesheet';
                safeLink.href = href;
                document.head.appendChild(safeLink);
            }
        });
        
        // 安全处理: 仅加载已验证的脚本
        const newScripts = newDoc.querySelectorAll('script[src]');
        newScripts.forEach(scriptTag => {
            const src = scriptTag.getAttribute('src');
            // 验证脚本源 - 仅允许同源脚本
            if (!this.validateScriptSrc(src)) {
                console.warn('Security: Blocked script from untrusted source:', src);
                return;
            }
            const existingScript = document.querySelector(`script[src="${CSS.escape(src)}"], script[src*="${CSS.escape(src)}"]`);
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
