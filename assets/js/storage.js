// ==================== Storage Module ====================
// 本地存储管理系统

const Storage = {
    STORAGE_KEY: 'mywisdompace',
    
    // 安全配置
    SECURITY_CONFIG: {
        allowedThemes: ['warm', 'dark', 'light'],
        allowedFontSizes: ['small', 'medium', 'large'],
        allowedLanguages: ['zh-CN', 'zh-TW', 'en'],
        maxChapterIdLength: 50,
        maxSectionIdLength: 100,
        maxToolIdLength: 50
    },
    
    data: {
        readingProgress: {},
        toolStates: {},
        userPreferences: {
            theme: 'warm',
            fontSize: 'medium',
            language: 'zh-CN'
        }
    },
    
    // ==================== 安全验证函数 ====================
    
    /**
     * 验证字符串格式（仅允许字母、数字、连字符、下划线）
     */
    isValidId(str, maxLength) {
        if (!str || typeof str !== 'string') return false;
        if (str.length > maxLength) return false;
        return /^[a-zA-Z0-9_-]+$/.test(str);
    },
    
    /**
     * 验证时间戳
     */
    isValidTimestamp(ts) {
        if (typeof ts !== 'number') return false;
        // 时间戳必须在合理范围内（2000年-2100年）
        const minTs = new Date('2000-01-01').getTime();
        const maxTs = new Date('2100-01-01').getTime();
        return ts >= minTs && ts <= maxTs;
    },
    
    /**
     * 验证并清洗导入的数据
     */
    validateImportData(data) {
        const errors = [];
        const sanitized = {
            readingProgress: {},
            toolStates: {},
            userPreferences: { ...this.data.userPreferences }
        };
        
        if (!data || typeof data !== 'object' || Array.isArray(data)) {
            return { valid: false, sanitized, errors: ['数据格式无效'] };
        }
        
        // 验证 readingProgress
        if (data.readingProgress && typeof data.readingProgress === 'object') {
            for (const [chapterId, progress] of Object.entries(data.readingProgress)) {
                // 验证 chapterId
                if (!this.isValidId(chapterId, this.SECURITY_CONFIG.maxChapterIdLength)) {
                    errors.push(`无效的章节ID: ${chapterId}`);
                    continue;
                }
                
                // 验证 progress 对象
                if (progress && typeof progress === 'object') {
                    const { sectionId, timestamp } = progress;
                    
                    if (this.isValidId(sectionId, this.SECURITY_CONFIG.maxSectionIdLength) &&
                        this.isValidTimestamp(timestamp)) {
                        sanitized.readingProgress[chapterId] = {
                            sectionId: sectionId,
                            timestamp: timestamp
                        };
                    } else {
                        errors.push(`章节 ${chapterId} 的进度数据无效`);
                    }
                }
            }
        }
        
        // 验证 userPreferences
        if (data.userPreferences && typeof data.userPreferences === 'object') {
            const prefs = data.userPreferences;
            
            // 主题 - 白名单验证
            if (prefs.theme && this.SECURITY_CONFIG.allowedThemes.includes(prefs.theme)) {
                sanitized.userPreferences.theme = prefs.theme;
            } else if (prefs.theme) {
                errors.push('主题设置无效，已重置为默认值');
            }
            
            // 字体大小 - 白名单验证
            if (prefs.fontSize && this.SECURITY_CONFIG.allowedFontSizes.includes(prefs.fontSize)) {
                sanitized.userPreferences.fontSize = prefs.fontSize;
            } else if (prefs.fontSize) {
                errors.push('字体大小设置无效，已重置为默认值');
            }
            
            // 语言 - 白名单验证
            if (prefs.language && this.SECURITY_CONFIG.allowedLanguages.includes(prefs.language)) {
                sanitized.userPreferences.language = prefs.language;
            } else if (prefs.language) {
                errors.push('语言设置无效，已重置为默认值');
            }
        }
        
        // 工具状态不允许导入（安全考虑）
        if (data.toolStates) {
            errors.push('工具状态不支持导入，已跳过');
        }
        
        return {
            valid: errors.length === 0,
            sanitized,
            errors
        };
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
    
    // Import Data - 导入数据（安全加固版）
    importData(file) {
        return new Promise((resolve, reject) => {
            // 验证文件类型
            if (!file || !file.name) {
                reject(new Error('无效的文件'));
                return;
            }
            
            // 仅允许JSON文件
            if (!file.name.endsWith('.json')) {
                reject(new Error('仅支持JSON文件格式'));
                return;
            }
            
            // 文件大小限制 (1MB)
            if (file.size > 1024 * 1024) {
                reject(new Error('文件大小不能超过1MB'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    
                    // 使用安全验证函数
                    const validation = this.validateImportData(imported);
                    
                    if (validation.errors.length > 0) {
                        console.warn('Import warnings:', validation.errors);
                    }
                    
                    // 使用清洗后的数据
                    this.data = {
                        ...this.data,
                        readingProgress: {
                            ...this.data.readingProgress,
                            ...validation.sanitized.readingProgress
                        },
                        userPreferences: {
                            ...this.data.userPreferences,
                            ...validation.sanitized.userPreferences
                        }
                    };
                    
                    this.save();
                    resolve({
                        success: true,
                        warnings: validation.errors,
                        message: validation.errors.length > 0 
                            ? `数据导入完成，但有 ${validation.errors.length} 个警告。部分内容已被跳过。`
                            : '数据导入成功！'
                    });
                } catch (error) {
                    console.error('JSON parsing error:', error);
                    reject(new Error('JSON解析失败，文件可能已损坏'));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };
            
            reader.readAsText(file);
        });
    },

    // Force Import Data - 强制导入数据（降级方案，仅用于紧急情况）
    forceImportData(file) {
        return new Promise((resolve, reject) => {
            // 记录强制导入操作
            console.warn('FORCE IMPORT: Bypassing validation. This may be unsafe!');
            
            if (!file || !file.name) {
                reject(new Error('无效的文件'));
                return;
            }
            
            if (!file.name.endsWith('.json')) {
                reject(new Error('仅支持JSON文件格式'));
                return;
            }
            
            if (file.size > 5 * 1024 * 1024) { // 5MB 极限
                reject(new Error('文件过大，无法处理'));
                return;
            }
            
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    
                    // 直接合并，但保留基本结构
                    this.data = {
                        readingProgress: imported.readingProgress || this.data.readingProgress,
                        toolStates: imported.toolStates || this.data.toolStates,
                        userPreferences: imported.userPreferences || this.data.userPreferences
                    };
                    
                    this.save();
                    resolve({
                        success: true,
                        message: '强制导入成功！请检查数据是否完整。'
                    });
                } catch (error) {
                    console.error('Force import failed:', error);
                    reject(new Error('强制导入失败：' + error.message));
                }
            };
            
            reader.onerror = () => {
                reject(new Error('文件读取失败'));
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
