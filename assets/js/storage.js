// ==================== Storage Module ====================
// 本地存储管理系统

const Storage = {
    STORAGE_KEY: 'mywisdompace',
    
    data: {
        readingProgress: {},
        toolStates: {},
        userPreferences: {
            theme: 'warm',
            fontSize: 'medium',
            language: 'zh-CN'
        }
    },
    
    init() {
        this.load();
        this.autoSave();
    },
    
    save() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
            return true;
        } catch (error) {
            console.error('Failed to save data:', error);
            return false;
        }
    },
    
    load() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                const parsed = JSON.parse(stored);
                this.data = { ...this.data, ...parsed };
            }
        } catch (error) {
            console.error('Failed to load data:', error);
        }
    },
    
    clear() {
        try {
            localStorage.removeItem(this.STORAGE_KEY);
            this.data = {
                readingProgress: {},
                toolStates: {},
                userPreferences: {
                    theme: 'warm',
                    fontSize: 'medium',
                    language: 'zh-CN'
                }
            };
            return true;
        } catch (error) {
            console.error('Failed to clear data:', error);
            return false;
        }
    },
    
    autoSave() {
        window.addEventListener('beforeunload', () => {
            this.save();
        });
    },
    
    // Reading Progress - 阅读进度
    saveReadingProgress(chapterId, sectionId) {
        if (!this.data.readingProgress[chapterId]) {
            this.data.readingProgress[chapterId] = {};
        }
        this.data.readingProgress[chapterId] = {
            sectionId,
            timestamp: Date.now()
        };
        this.save();
    },
    
    getReadingProgress(chapterId) {
        return this.data.readingProgress[chapterId] || null;
    },
    
    clearReadingProgress(chapterId) {
        if (chapterId) {
            delete this.data.readingProgress[chapterId];
        } else {
            this.data.readingProgress = {};
        }
        this.save();
    },
    
    // Tool States - 工具状态
    saveToolState(toolId, state) {
        this.data.toolStates[toolId] = {
            ...state,
            timestamp: Date.now()
        };
        this.save();
    },
    
    getToolState(toolId) {
        return this.data.toolStates[toolId] || null;
    },
    
    clearToolState(toolId) {
        if (toolId) {
            delete this.data.toolStates[toolId];
        } else {
            this.data.toolStates = {};
        }
        this.save();
    },
    
    // User Preferences - 用户偏好
    savePreference(key, value) {
        this.data.userPreferences[key] = value;
        this.save();
    },
    
    getPreference(key) {
        return this.data.userPreferences[key];
    },
    
    getAllPreferences() {
        return this.data.userPreferences;
    },
    
    // Export Data - 导出数据
    exportData() {
        const dataStr = JSON.stringify(this.data, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportName = 'mywisdompace_backup_' + new Date().toISOString().split('T')[0] + '.json';
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();
    },
    
    // Import Data - 导入数据
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    this.data = { ...this.data, ...imported };
                    this.save();
                    resolve(true);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('Failed to read file'));
            };
            
            reader.readAsText(file);
        });
    },
    
    // Get Storage Size - 获取存储大小
    getStorageSize() {
        let total = 0;
        for (let key in localStorage) {
            if (localStorage.hasOwnProperty(key)) {
                total += localStorage[key].length;
            }
        }
        return total;
    },
    
    // Format Size - 格式化大小
    formatSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Storage.init();
});
