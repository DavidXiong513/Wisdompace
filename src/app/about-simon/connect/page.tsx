'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import AboutHero from '@/components/about-simon/AboutHero';
import ScrollToTopButton from '@/components/about-simon/ScrollToTopButton';

const SOCIAL_LINKS = [
  { platform: '微信公众号', id: '借假修真的思考熊', icon: '📝', href: 'https://mp.weixin.qq.com/' },
  {
    platform: '微信视频号',
    id: '借假修真的思考熊',
    icon: '🎬',
    href: 'https://channels.weixin.qq.com/',
  },
  {
    platform: '小红书',
    id: '借假修真的思考熊',
    icon: '📕',
    href: 'https://www.xiaohongshu.com/user/',
  },
  {
    platform: '在行',
    id: '生涯规划咨询',
    icon: '🎓',
    href: 'https://www.zaih.com/falcon/mentors/2bxahqla7fk',
  },
];

const FORM_FIELDS = [
  {
    name: 'name',
    label: '你的称呼',
    placeholder: '怎么称呼你？',
    placeholderEn: 'How should I address you?',
    labelEn: 'Your Name',
    type: 'text',
    required: true,
  },
  {
    name: 'identity',
    label: '你的身份',
    placeholder: '企业HR / 职场人 / 创业者 / 学生 / 其他',
    placeholderEn: 'HR / Professional / Entrepreneur / Student / Other',
    labelEn: 'Your Role',
    type: 'text',
    required: true,
  },
  {
    name: 'interest',
    label: '感兴趣的方向',
    placeholder: '组织变革 / 生涯规划 / MBTI测评 / 内容合作 / 其他',
    placeholderEn: 'Org Change / Career / MBTI / Content / Other',
    labelEn: 'Area of Interest',
    type: 'text',
    required: true,
  },
  {
    name: 'company',
    label: '公司/组织',
    placeholder: '所在公司或组织（选填）',
    placeholderEn: 'Company or Organization (optional)',
    labelEn: 'Company',
    type: 'text',
    required: false,
  },
  {
    name: 'email',
    label: '联系邮箱',
    placeholder: '方便我回复你的邮箱（选填）',
    placeholderEn: 'Your email for reply (optional)',
    labelEn: 'Email',
    type: 'email',
    required: false,
  },
  {
    name: 'phone',
    label: '联系微信',
    placeholder: '你的微信号，方便我联系你',
    placeholderEn: 'Your WeChat ID',
    labelEn: 'WeChat',
    type: 'text',
    required: true,
  },
  {
    name: 'budget',
    label: '预算范围',
    placeholder: '对咨询服务的大致预算',
    placeholderEn: 'Approximate budget for consulting',
    labelEn: 'Budget',
    type: 'text',
    required: true,
  },
  {
    name: 'message',
    label: '你想说的',
    placeholder: '简单描述你的需求或想法，我会尽快回复',
    placeholderEn: 'Briefly describe your needs, I will reply soon',
    labelEn: 'Your Message',
    type: 'textarea',
    required: true,
  },
];

export default function ConnectPage() {
  const { t, i18n } = useTranslation();
  const isEn = !(i18n.language || 'zh-CN').startsWith('zh');
  const jt = (k: string, fb: string) => (isEn ? (t(k) === k ? fb : t(k)) : fb);

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      const jsonData: Record<string, string> = {};
      formData.forEach((value, key) => {
        jsonData[key] = value.toString();
      });
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jsonData),
      });
      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Submission failed');
      }
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Network error, please try again');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AboutHero
        label="Connect"
        title={jt('aboutPageData.connect.heroTitle', '来聊聊吧')}
        description={jt(
          'aboutPageData.connect.heroSub',
          '无论是组织变革、生涯规划，还是只想聊聊——我都在这里'
        )}
        subtext={jt('aboutPageData.connect.heroText', '')}
      />
      <section className="as-section">
        <div className="as-container">
          <div className="mx-auto max-w-2xl">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {FORM_FIELDS.map(f => (
                  <div key={f.name}>
                    <label
                      htmlFor={f.name}
                      className="mb-1.5 block text-sm font-medium text-[var(--as-primary-700)]"
                    >
                      {isEn ? f.labelEn : f.label}
                      {f.required && <span className="ml-1 text-[var(--as-accent)]">*</span>}
                    </label>
                    {f.type === 'textarea' ? (
                      <textarea
                        id={f.name}
                        name={f.name}
                        rows={4}
                        required={f.required}
                        placeholder={isEn ? f.placeholderEn : f.placeholder}
                        className="w-full rounded-lg border border-[var(--as-gray-200)] bg-white px-4 py-2.5 text-sm text-[var(--as-gray-800)] transition placeholder:text-[var(--as-gray-400)] focus:border-[var(--as-primary-400)] focus:ring-2 focus:ring-[var(--as-primary-100)] focus:outline-none"
                      />
                    ) : (
                      <input
                        id={f.name}
                        name={f.name}
                        type={f.type}
                        required={f.required}
                        placeholder={isEn ? f.placeholderEn : f.placeholder}
                        className="w-full rounded-lg border border-[var(--as-gray-200)] bg-white px-4 py-2.5 text-sm text-[var(--as-gray-800)] transition placeholder:text-[var(--as-gray-400)] focus:border-[var(--as-primary-400)] focus:ring-2 focus:ring-[var(--as-primary-100)] focus:outline-none"
                      />
                    )}
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-[var(--as-primary-600)] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--as-primary-700)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading
                    ? isEn
                      ? 'Sending...'
                      : '发送中...'
                    : isEn
                      ? 'Send Message'
                      : '发送消息'}
                </button>
                {error && <p className="text-center text-sm text-red-500">{error}</p>}
                <p className="text-center text-xs text-[var(--as-gray-400)]">
                  🔒{' '}
                  {isEn
                    ? 'Your information is used only for replies and will not be shared.'
                    : '你的信息仅用于沟通回复，不会用于其他用途'}
                </p>
              </form>
            ) : (
              <div className="py-12 text-center">
                <span className="text-6xl">✉️</span>
                <h2 className="as-serif mt-4 text-2xl font-bold text-[var(--as-primary-700)]">
                  {isEn ? 'Thank You' : '感谢你的留言'}
                </h2>
                <p className="mt-3 text-[var(--as-gray-600)]">
                  {isEn
                    ? 'I will read every message carefully and reply as soon as possible.'
                    : '我会认真阅读每一条消息，并尽快回复你。'}
                </p>
                <p className="mt-2 text-sm text-[var(--as-gray-500)]">
                  {isEn
                    ? 'Usually within 1-2 business days. For urgent matters, please mark "URGENT".'
                    : '通常1-2个工作日内回复，急事请备注「紧急」。'}
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 rounded-md border border-[var(--as-gray-200)] px-4 py-2 text-sm text-[var(--as-gray-600)] transition hover:bg-[var(--as-gray-50)]"
                >
                  {isEn ? 'Send Another' : '再发一条'}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>
      <section className="as-section-alt">
        <div className="as-container">
          <div className="mb-8 text-center">
            <h2 className="as-serif text-2xl font-bold text-[var(--as-primary-700)]">
              {isEn ? 'Also find me on' : '也可以在这些地方找到我'}
            </h2>
          </div>
          <div className="mx-auto grid max-w-xl grid-cols-2 gap-3 sm:grid-cols-4">
            {SOCIAL_LINKS.map(s => (
              <a
                key={s.platform}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center rounded-xl border border-[var(--as-gray-100)] bg-white p-4 text-center transition hover:border-[var(--as-primary-300)] hover:shadow-md sm:p-6"
              >
                <span className="text-3xl sm:text-4xl">{s.icon}</span>
                <p className="mt-2 text-xs font-semibold text-[var(--as-primary-700)] sm:text-sm">
                  {s.platform}
                </p>
                <p className="mt-1 text-[10px] text-[var(--as-gray-500)] sm:text-xs">{s.id}</p>
              </a>
            ))}
          </div>
        </div>
      </section>
      <section className="as-section">
        <div className="as-container text-center">
          <p className="as-serif text-2xl font-bold text-[var(--as-primary-600)]">
            「
            {isEn
              ? 'A lifelong organizer for organizations and individuals'
              : '做组织与个体的终身整理者'}
            」
          </p>
          <p className="mt-3 text-sm text-[var(--as-gray-500)]">
            {isEn ? 'Simon Xiong · Practice truth through every role' : '借假修真的思考熊'}
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/about-simon"
              scroll={false}
              className="text-sm text-[var(--as-primary-500)] transition hover:text-[var(--as-primary-700)]"
            >
              ← {isEn ? 'Back to About' : '回到首页'}
            </Link>
            <span className="text-[var(--as-gray-300)]">|</span>
            <Link
              href="/"
              scroll={false}
              className="text-sm text-[var(--as-gray-500)] transition hover:text-[var(--as-primary-600)]"
            >
              {isEn ? 'A Life Organized →' : '一生的整理 →'}
            </Link>
          </div>
        </div>
      </section>
      <ScrollToTopButton />
    </div>
  );
}
