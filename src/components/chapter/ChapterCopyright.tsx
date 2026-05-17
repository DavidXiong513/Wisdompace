'use client';

import { useTranslation } from 'react-i18next';

export default function ChapterCopyright() {
  const { t, i18n } = useTranslation();
  const isChinese = (i18n.language || 'zh-CN').startsWith('zh');
  return (
    <p className="text-xs tracking-wider text-[#6A6256]">
      {isChinese
        ? '内容来源：《一生的整理》V1.0版 · 全网同名：借假修真的思考熊'
        : t('chapter.copyright')}
    </p>
  );
}
