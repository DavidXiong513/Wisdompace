// ==================== Tools Placeholder Module ====================
// 工具预留逻辑

const ToolsPlaceholder = {
    tools: {
        'role-pie-chart': {
            name: '人生角色饼图',
            icon: '🎯',
            status: 'developing',
            description: '帮助你梳理生活中的各种角色分配'
        },
        'identity-portrait': {
            name: '身份画像',
            icon: '👤',
            status: 'developing',
            description: '绘制你的身份画像，深入了解自己'
        },
        'tag-selector': {
            name: '标签选择器',
            icon: '🏷️',
            status: 'developing',
            description: '选择并管理你的身份标签'
        },
        'role-stripper': {
            name: '角色剥离器',
            icon: '🎭',
            status: 'developing',
            description: '剥离社会角色，看见真实的自己'
        },
        'life-finder': {
            name: '生活趣味发现器',
            icon: '✨',
            status: 'developing',
            description: '发现生活中的趣味与意义'
        },
        'choice-maker': {
            name: '主动选择练习',
            icon: '⚖️',
            status: 'developing',
            description: '练习主动选择，而非被动接受'
        },
        'responsibility-list': {
            name: '责任清单',
            icon: '📋',
            status: 'developing',
            description: '整理你的责任与承诺'
        },
        'choice-rights': {
            name: '选择权思考',
            icon: '🔑',
            status: 'developing',
            description: '思考你的选择权与安排'
        },
        'goodbye-list': {
            name: '告别清单',
            icon: '🌅',
            status: 'developing',
            description: '准备你的告别清单'
        }
    },
    
    init() {
        this.renderPlaceholders();
        this.bindEvents();
    },
    
    renderPlaceholders() {
        const toolPlaceholders = document.querySelectorAll('.tool-placeholder');
        
        toolPlaceholders.forEach(placeholder => {
            const toolId = placeholder.getAttribute('data-tool-id');
            const tool = this.tools[toolId];
            
            if (tool) {
                this.renderToolPlaceholder(placeholder, tool);
            }
        });
    },
    
    renderToolPlaceholder(container, tool) {
        container.innerHTML = `
            <div class="tool-header">
                <div class="tool-title">
                    <span class="tool-icon">${tool.icon}</span>
                    <span>${tool.name}</span>
                </div>
                <span class="tool-status ${tool.status}">
                    ${this.getStatusText(tool.status)}
                </span>
            </div>
            <div class="tool-preview">
                <div class="tool-coming-soon">
                    <span>✨</span>
                    <p>${tool.description}</p>
                    <p class="tool-status-text">该工具正在开发中，敬请期待</p>
                </div>
            </div>
            <div class="tool-actions">
                <button class="btn btn-tool btn-tool-expand" disabled>
                    展开工具
                </button>
                <button class="btn btn-tool btn-tool-learn">
                    了解更多
                </button>
            </div>
        `;
    },
    
    getStatusText(status) {
        const statusMap = {
            'developing': '开发中...',
            'ready': '可用',
            'maintenance': '维护中'
        };
        return statusMap[status] || status;
    },
    
    bindEvents() {
        document.querySelectorAll('.btn-tool-expand').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleExpand(e));
        });
        
        document.querySelectorAll('.btn-tool-learn').forEach(btn => {
            btn.addEventListener('click', (e) => this.handleLearnMore(e));
        });
    },
    
    handleExpand(e) {
        const btn = e.currentTarget;
        const toolSection = btn.closest('.tool-section');
        const toolId = toolSection.querySelector('.tool-placeholder').getAttribute('data-tool-id');
        
        if (this.tools[toolId].status === 'ready') {
            this.expandTool(toolSection, toolId);
        }
    },
    
    expandTool(section, toolId) {
        section.classList.add('expanded');
        section.querySelector('.tool-preview').innerHTML = `
            <div class="tool-content">
                <p>工具内容加载中...</p>
            </div>
        `;
        
        const state = Storage.getToolState(toolId);
        this.loadToolContent(toolId, state);
    },
    
    loadToolContent(toolId, state) {
        console.log('Loading tool content for:', toolId, 'with state:', state);
    },
    
    handleLearnMore(e) {
        const btn = e.currentTarget;
        const toolSection = btn.closest('.tool-section');
        const toolId = toolSection.querySelector('.tool-placeholder').getAttribute('data-tool-id');
        
        const tool = this.tools[toolId];
        alert(`${tool.name}\n\n${tool.description}\n\n该工具即将上线，敬请期待！`);
    },
    
    // Update Tool Status - 更新工具状态
    updateToolStatus(toolId, status) {
        if (this.tools[toolId]) {
            this.tools[toolId].status = status;
            this.renderPlaceholders();
            return true;
        }
        return false;
    },
    
    // Add New Tool - 添加新工具
    addTool(toolId, toolData) {
        this.tools[toolId] = {
            name: toolData.name,
            icon: toolData.icon,
            status: toolData.status || 'developing',
            description: toolData.description
        };
        this.renderPlaceholders();
    },
    
    // Get Tool Info - 获取工具信息
    getToolInfo(toolId) {
        return this.tools[toolId] || null;
    },
    
    // Check if Tool Ready - 检查工具是否可用
    isToolReady(toolId) {
        const tool = this.tools[toolId];
        return tool && tool.status === 'ready';
    },
    
    // Save Tool Data - 保存工具数据
    saveToolData(toolId, data) {
        Storage.saveToolState(toolId, data);
    },
    
    // Load Tool Data - 加载工具数据
    loadToolData(toolId) {
        return Storage.getToolState(toolId);
    }
};

document.addEventListener('DOMContentLoaded', () => {
    ToolsPlaceholder.init();
});
