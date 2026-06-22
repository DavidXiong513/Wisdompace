'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { exportAll, importData, downloadExport } from '@/knowpeople/services/exportService';
import { useToast } from '@/knowpeople/components/ui/Toast';

export default function SettingsPage() {
  const router = useRouter();
  const toast = useToast();
  const [exportPassword, setExportPassword] = useState('');
  const [importPassword, setImportPassword] = useState('');
  const [importMode, setImportMode] = useState<'merge' | 'overwrite'>('merge');
  const [importFile, setImportFile] = useState<string | null>(null);
  const [importFileName, setImportFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 消息自动消失
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  const handleExport = async () => {
    setLoading(true);
    setMessage(null);
    try {
      const data = await exportAll(exportPassword || undefined);
      downloadExport(data);
      toast.success('导出成功，文件已开始下载');
      setMessage({ type: 'success', text: '导出成功，文件已开始下载' });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`导出失败: ${msg}`);
      setMessage({ type: 'error', text: `导出失败: ${msg}` });
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 文件大小校验（最大 50MB）
    if (file.size > 50 * 1024 * 1024) {
      toast.error('文件过大，不能超过 50MB');
      setMessage({ type: 'error', text: '文件过大，不能超过 50MB' });
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = event => {
      setImportFile(event.target?.result as string);
      setImportFileName(file.name);
      setMessage(null);
    };
    reader.onerror = () => {
      toast.error('文件读取失败');
      setMessage({ type: 'error', text: '文件读取失败，请重试' });
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (!importFile) {
      toast.error('请先选择文件');
      return;
    }

    // 覆盖模式二次确认
    if (importMode === 'overwrite') {
      const confirmed = confirm(
        '警告：覆盖模式将永久删除现有全部数据！\n\n' +
          '此操作不可撤销，建议先导出备份。\n\n' +
          '确定继续？'
      );
      if (!confirmed) return;
    }

    setLoading(true);
    setMessage(null);
    try {
      const result = await importData(importFile, importPassword || undefined, importMode);
      if (result.success) {
        const msg = `导入成功！导入 ${result.importedPersons} 个人物，${result.importedEvents} 条观察记录`;
        toast.success('导入成功');
        setMessage({ type: 'success', text: msg });
        setImportFile(null);
        setImportFileName('');
        setImportPassword('');
        if (fileInputRef.current) fileInputRef.current.value = '';
        // 刷新当前路由数据
        router.refresh();
      } else {
        const msg = `导入完成，但有 ${result.errors.length} 个错误: ${result.errors.slice(0, 3).join('; ')}`;
        toast.error('导入有部分错误');
        setMessage({ type: 'error', text: msg });
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      toast.error(`导入失败: ${msg}`);
      setMessage({ type: 'error', text: `导入失败: ${msg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#faf8f5]">
      <div className="mx-auto max-w-md px-4 pt-5 pb-16 sm:px-5 sm:pt-8 sm:pb-20">
        <header className="mb-4 sm:mb-6">
          <h1 className="bg-gradient-to-r from-[#7c5cfc] to-[#5b8def] bg-clip-text text-[1.65rem] font-bold tracking-tight text-transparent">
            设置
          </h1>
          <p className="mt-0.5 text-xs text-[#9c958c]">数据管理与应用配置</p>
        </header>

        {/* Data Export */}
        <div className="mb-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:mb-4 sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0ebff] text-lg">
              {'\u{1F4E4}'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2d2a26]">数据导出</h2>
              <p className="text-[0.7rem] text-[#9c958c]">备份所有数据到本地文件</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">
                导出密码 <span className="font-normal text-[#b5afa6]">（可选，留空则不加密）</span>
              </label>
              <input
                type="password"
                value={exportPassword}
                onChange={e => setExportPassword(e.target.value)}
                placeholder="设置密码以加密导出文件"
                className="w-full rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none placeholder:text-[#c4bdb5] focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
              />
            </div>
            <button
              onClick={handleExport}
              disabled={loading}
              className="w-full rounded-xl bg-[#7c5cfc] py-3 font-semibold text-white shadow-lg shadow-purple-200 transition-all hover:bg-[#6b4ce0] active:scale-[0.98] disabled:opacity-40"
            >
              {loading ? '处理中...' : '导出数据'}
            </button>
          </div>
        </div>

        {/* Data Import */}
        <div className="mb-3 rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:mb-4 sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-lg">
              {'\u{1F4E5}'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2d2a26]">数据导入</h2>
              <p className="text-[0.7rem] text-[#9c958c]">从备份文件恢复数据</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">导入模式</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setImportMode('merge')}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                    importMode === 'merge'
                      ? 'border-[#7c5cfc] bg-[#7c5cfc] text-white'
                      : 'border-[#edeae5] bg-white text-[#6b6560] hover:border-[#d5d0c8]'
                  }`}
                >
                  合并
                </button>
                <button
                  onClick={() => setImportMode('overwrite')}
                  className={`flex-1 rounded-xl border py-2.5 text-sm font-medium transition-all ${
                    importMode === 'overwrite'
                      ? 'border-rose-500 bg-rose-500 text-white'
                      : 'border-[#edeae5] bg-white text-[#6b6560] hover:border-[#d5d0c8]'
                  }`}
                >
                  覆盖
                </button>
              </div>
              <p
                className={`mt-1.5 text-[0.7rem] ${importMode === 'overwrite' ? 'font-medium text-rose-500' : 'text-[#b5afa6]'}`}
              >
                {importMode === 'merge'
                  ? '合并：保留现有数据，相同代号的人物会被更新'
                  : '覆盖：清空所有现有数据，完全替换（不可撤销！）'}
              </p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">
                导入密码{' '}
                <span className="font-normal text-[#b5afa6]">（如导出时加密则需填写）</span>
              </label>
              <input
                type="password"
                value={importPassword}
                onChange={e => setImportPassword(e.target.value)}
                placeholder="如导出文件加密请填写密码"
                className="w-full rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-[#2d2a26] transition outline-none placeholder:text-[#c4bdb5] focus:border-[#7c5cfc] focus:ring-[3px] focus:ring-[#f0ebff]"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[#6b6560]">选择文件</label>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileSelect}
                className="w-full rounded-xl border border-[#edeae5] bg-[#faf8f5] px-4 py-3 text-sm text-[#2d2a26] transition file:mr-4 file:rounded-lg file:border-0 file:bg-[#7c5cfc] file:px-3 file:py-1.5 file:font-medium file:text-white hover:file:bg-[#6b4ce0]"
              />
              {importFileName && (
                <p className="mt-1.5 text-[0.7rem] text-emerald-600">已选择: {importFileName}</p>
              )}
            </div>

            <button
              onClick={handleImport}
              disabled={loading || !importFile}
              className="w-full rounded-xl bg-emerald-500 py-3 font-semibold text-white shadow-lg shadow-emerald-200 transition-all hover:bg-emerald-600 active:scale-[0.98] disabled:opacity-40"
            >
              {loading ? '处理中...' : '导入数据'}
            </button>
          </div>
        </div>

        {/* About */}
        <div className="rounded-2xl border border-white/60 bg-white/80 p-4 shadow-[0_2px_12px_rgba(0,0,0,0.05)] backdrop-blur-sm sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#f5f2ed] text-lg">
              {'\u{1F441}\uFE0F'}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#2d2a26]">关于</h2>
              <p className="text-[0.7rem] text-[#9c958c]">慧眼识人 v0.1.0</p>
            </div>
          </div>
          <div className="space-y-2.5 text-sm text-[#6b6560]">
            <p>你的私人社交洞察笔记</p>
            <div className="space-y-2 border-t border-[#f7f5f2] pt-3">
              <div className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7c5cfc"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <span className="text-[0.8rem]">所有数据本地存储，不上传任何服务器</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7c5cfc"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <span className="text-[0.8rem]">支持 AES 加密导出，保护隐私</span>
              </div>
              <div className="flex items-center gap-2">
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7c5cfc"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <span className="text-[0.8rem]">建议使用代号而非真名，保护双方</span>
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-4 rounded-xl p-4 text-sm font-medium ${
              message.type === 'success'
                ? 'border border-emerald-100 bg-emerald-50 text-emerald-700'
                : 'border border-rose-100 bg-rose-50 text-rose-700'
            }`}
          >
            {message.text}
          </div>
        )}
      </div>
    </main>
  );
}
