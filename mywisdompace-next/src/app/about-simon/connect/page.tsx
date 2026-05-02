"use client";

import Link from "next/link";
import { useState } from "react";
import AboutHero from "@/components/about-simon/AboutHero";
import ScrollToTopButton from "@/components/about-simon/ScrollToTopButton";

/* ─────────────────────────────────────
   数据：社交矩阵
   ───────────────────────────────────── */
const SOCIAL_LINKS = [
  { platform: "微信公众号", id: "借假修真的思考熊", icon: "📝", href: "https://mp.weixin.qq.com/" },
  { platform: "微信视频号", id: "借假修真的思考熊", icon: "🎬", href: "https://channels.weixin.qq.com/" },
  { platform: "小红书", id: "借假修真的思考熊", icon: "📕", href: "https://www.xiaohongshu.com/user/" },
  { platform: "在行", id: "生涯规划咨询", icon: "🎓", href: "https://www.zaih.com/falcon/mentors/2bxahqla7fk" },
];

/* ─────────────────────────────────────
   数据：表单字段
   ───────────────────────────────────── */
const FORM_FIELDS = [
  { name: "name", label: "你的称呼", placeholder: "怎么称呼你？", type: "text", required: true },
  { name: "identity", label: "你的身份", placeholder: "企业HR / 职场人 / 创业者 / 学生 / 其他", type: "text", required: true },
  { name: "interest", label: "感兴趣的方向", placeholder: "组织变革 / 生涯规划 / MBTI测评 / 内容合作 / 其他", type: "text", required: true },
  { name: "company", label: "公司/组织", placeholder: "所在公司或组织（选填）", type: "text", required: false },
  { name: "email", label: "联系邮箱", placeholder: "方便我回复你的邮箱（选填）", type: "email", required: false },
  { name: "phone", label: "联系微信", placeholder: "你的微信号，方便我联系你", type: "text", required: true },
  { name: "budget", label: "预算范围", placeholder: "对咨询服务的大致预算", type: "text", required: true },
  { name: "message", label: "你想说的", placeholder: "简单描述你的需求或想法，我会尽快回复", type: "textarea", required: true },
];

/* ─────────────────────────────────────
   Page 5: 联系连接
   ───────────────────────────────────── */
export default function ConnectPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const form = e.currentTarget;
      // 改用 JSON 发送，避免 FormData 的编码问题
      const formData = new FormData(form);
      const jsonData: Record<string, string> = {};
      formData.forEach((value, key) => {
        jsonData[key] = value.toString();
      });

      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(jsonData),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "提交失败，请稍后重试");
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络异常，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <AboutHero
        label="Connect"
        title="来聊聊吧"
        description="无论是组织变革、生涯规划，还是只想聊聊——我都在这里"
      />

      {/* 联系表单 */}
      <section className="as-section">
        <div className="as-container">
          <div className="mx-auto max-w-2xl">
            {!submitted ? (
              <form onSubmit={handleSubmit} className="space-y-5">
                {FORM_FIELDS.map((field) => (
                  <div key={field.name}>
                    <label
                      htmlFor={field.name}
                      className="mb-1.5 block text-sm font-medium text-[var(--as-primary-700)]"
                    >
                      {field.label}
                      {field.required && (
                        <span className="ml-1 text-[var(--as-accent)]">*</span>
                      )}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        id={field.name}
                        name={field.name}
                        rows={4}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="w-full rounded-lg border border-[var(--as-gray-200)] bg-white px-4 py-2.5 text-sm text-[var(--as-gray-800)] placeholder:text-[var(--as-gray-400)] transition focus:border-[var(--as-primary-400)] focus:outline-none focus:ring-2 focus:ring-[var(--as-primary-100)]"
                      />
                    ) : (
                      <input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        required={field.required}
                        placeholder={field.placeholder}
                        className="w-full rounded-lg border border-[var(--as-gray-200)] bg-white px-4 py-2.5 text-sm text-[var(--as-gray-800)] placeholder:text-[var(--as-gray-400)] transition focus:border-[var(--as-primary-400)] focus:outline-none focus:ring-2 focus:ring-[var(--as-primary-100)]"
                      />
                    )}
                  </div>
                ))}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-lg bg-[var(--as-primary-600)] py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[var(--as-primary-700)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "发送中..." : "发送消息"}
                </button>

                {error && (
                  <p className="text-center text-sm text-red-500">{error}</p>
                )}

                <p className="text-center text-xs text-[var(--as-gray-400)]">
                  🔒 你的信息仅用于沟通回复，不会用于其他用途
                </p>
              </form>
            ) : (
              <div className="py-12 text-center">
                <span className="text-6xl">✉️</span>
                <h2 className="as-serif mt-4 text-2xl font-bold text-[var(--as-primary-700)]">
                  感谢你的留言
                </h2>
                <p className="mt-3 text-[var(--as-gray-600)]">
                  我会认真阅读每一条消息，并尽快回复你。
                </p>
                <p className="mt-2 text-sm text-[var(--as-gray-500)]">
                  通常1-2个工作日内回复，急事请备注「紧急」。
                </p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="mt-6 rounded-md border border-[var(--as-gray-200)] px-4 py-2 text-sm text-[var(--as-gray-600)] transition hover:bg-[var(--as-gray-50)]"
                >
                  再发一条
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 社交矩阵 */}
      <section className="as-section-alt">
        <div className="as-container">
          <div className="mb-8 text-center">
            <h2 className="as-serif text-2xl font-bold text-[var(--as-primary-700)]">
              也可以在这些地方找到我
            </h2>
          </div>

          <div className="mx-auto grid max-w-xl gap-4 sm:grid-cols-4">
            {SOCIAL_LINKS.map((s) => {
              const inner = (
                <>
                  <span className="text-4xl">{s.icon}</span>
                  <p className="mt-2 text-sm font-semibold text-[var(--as-primary-700)]">
                    {s.platform}
                  </p>
                  <p className="mt-1 text-xs text-[var(--as-gray-500)]">
                    {s.id}
                  </p>
                </>
              );
              return s.href ? (
                <a
                  key={s.platform}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center rounded-xl border border-[var(--as-gray-100)] bg-white p-6 text-center transition hover:border-[var(--as-primary-300)] hover:shadow-md"
                >
                  {inner}
                </a>
              ) : (
                <div
                  key={s.platform}
                  className="flex flex-col items-center rounded-xl border border-[var(--as-gray-100)] bg-white p-6 text-center"
                >
                  {inner}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 品牌签名 */}
      <section className="as-section">
        <div className="as-container text-center">
          <p className="as-serif text-2xl font-bold text-[var(--as-primary-600)]">
            「做组织与个体的终身整理者」
          </p>
          <p className="mt-3 text-sm text-[var(--as-gray-500)]">
            借假修真的思考熊
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Link
              href="/about-simon"
              scroll={false}
              className="text-sm text-[var(--as-primary-500)] transition hover:text-[var(--as-primary-700)]"
            >
              ← 回到首页
            </Link>
            <span className="text-[var(--as-gray-300)]">|</span>
            <Link
              href="/"
              scroll={false}
              className="text-sm text-[var(--as-gray-500)] transition hover:text-[var(--as-primary-600)]"
            >
              一生的整理 →
            </Link>
          </div>
        </div>
      </section>

      <ScrollToTopButton />
    </div>
  );
}
