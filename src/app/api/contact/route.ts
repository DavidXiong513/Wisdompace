import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit, rateLimitHeaders, RATE_LIMITS } from '@/lib/rate-limit';
import { ContactSchema } from '@/lib/validations/contact';
import { logHoneypotHit, getClientIp } from '@/lib/security-logger';

/* ─────────────────────────────────────
   表单字段中文映射
   ───────────────────────────────────── */
const FIELD_LABELS: Record<string, string> = {
  name: '你的称呼',
  identity: '你的身份',
  interest: '感兴趣的方向',
  company: '公司/组织',
  email: '联系邮箱',
  phone: '联系微信',
  budget: '预算范围',
  message: '你想说的',
};

/* ─────────────────────────────────────
   构建纯文本邮件正文
   ───────────────────────────────────── */
function buildEmailText(data: Record<string, string>): string {
  const lines: string[] = [
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  思考熊 · 新的咨询消息',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '',
  ];

  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const value = data[key]?.trim();
    if (value) {
      lines.push('  ' + label + '：' + value);
    }
  }

  lines.push(
    '',
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
    '  时间：' + new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' }),
    '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━'
  );

  return lines.join('\n');
}

/* ─────────────────────────────────────
   构建 HTML 邮件正文
   ───────────────────────────────────── */
function buildEmailHtml(data: Record<string, string>): string {
  const rows = Object.entries(FIELD_LABELS)
    .filter(([key]) => data[key]?.trim())
    .map(([key, label]) => {
      const value = data[key]!.trim().replace(/</g, '&lt;').replace(/>/g, '&gt;');
      return `<tr><td style="padding:6px 12px;font-weight:bold;color:#8B6AA0;white-space:nowrap;">${label}</td><td style="padding:6px 12px;">${value}</td></tr>`;
    })
    .join('\n');

  return `
<div style="max-width:560px;margin:0 auto;font-family:'Noto Sans SC',sans-serif;color:#333;">
  <div style="background:#8B6AA0;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;">
    <h2 style="margin:0;font-size:18px;">🧸 思考熊 · 新的咨询消息</h2>
  </div>
  <table style="width:100%;border-collapse:collapse;background:#faf8fc;">
    ${rows}
  </table>
  <div style="background:#f0ecf4;padding:10px 20px;border-radius:0 0 8px 8px;font-size:12px;color:#999;text-align:right;">
    ${new Date().toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
  </div>
</div>`;
}

/* ─────────────────────────────────────
   方式1: Resend (HTTP API, 推荐 Vercel 使用)
   ───────────────────────────────────── */
async function sendViaResend(payload: {
  apiKey: string;
  from: string;
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${payload.apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: payload.from,
      to: [payload.to],
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend API ${res.status}: ${body}`);
  }
}

/* ─────────────────────────────────────
   方式2: nodemailer SMTP (本地开发/自托管可用)
   ───────────────────────────────────── */
async function sendViaSmtp(payload: {
  to: string;
  host: string;
  port: number;
  user: string;
  pass: string;
  from: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  // 动态 import nodemailer，避免 Vercel 环境不必要的依赖加载
  const nodemailer = await import('nodemailer');

  const transporter = nodemailer.default.createTransport({
    host: payload.host,
    port: payload.port,
    secure: payload.port === 465,
    auth: {
      user: payload.user,
      pass: payload.pass,
    },
    // Vercel Serverless 超时 10s
    connectionTimeout: 8000,
    greetingTimeout: 5000,
    socketTimeout: 8000,
  });

  await transporter.sendMail({
    from: payload.from,
    to: payload.to,
    subject: payload.subject,
    text: payload.text,
    html: payload.html,
  });
}

/* ─────────────────────────────────────
   POST /api/contact
   ───────────────────────────────────── */
export async function POST(request: NextRequest) {
  // 1. 速率限制
  const rlResult = checkRateLimit(request, RATE_LIMITS.contact);
  if (!rlResult.success) {
    return NextResponse.json(
      { success: false, error: '请求过于频繁，请稍后再试' },
      { status: 429, headers: rateLimitHeaders(rlResult) }
    );
  }

  try {
    const raw = await request.json();

    // 2. Zod 输入验证
    const parsed = ContactSchema.safeParse(raw);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: '输入内容格式有误，请检查后重试' },
        { status: 400 }
      );
    }

    const data = parsed.data;

    // 3. Honeypot 检测 — 如果 website 字段有值，说明是机器人
    if (data.website && data.website.length > 0) {
      logHoneypotHit('/api/contact', getClientIp(request));
      // 静默返回成功（不告诉攻击者原因）
      return NextResponse.json({ success: true });
    }

    const mailTo = process.env.MAIL_TO || '1318952797@qq.com';
    const resendKey = process.env.RESEND_API_KEY;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const subject = '思考熊咨询 - ' + data.name.trim();
    const text = buildEmailText(data);
    const html = buildEmailHtml(data);

    // 优先使用 Resend（HTTP API，Vercel 兼容）
    if (resendKey) {
      const fromEmail = process.env.RESEND_FROM || 'Wisdompace <onboarding@resend.dev>';
      await sendViaResend({
        apiKey: resendKey,
        from: fromEmail,
        to: mailTo,
        subject,
        text,
        html,
      });
      return NextResponse.json(
        { success: true, provider: 'resend' },
        { headers: rateLimitHeaders(rlResult) }
      );
    }

    // 降级到 SMTP（本地开发 / 自托管）
    if (smtpUser && smtpPass) {
      const smtpHost = process.env.SMTP_HOST || 'smtp.qq.com';
      const smtpPort = Number(process.env.SMTP_PORT) || 465;
      await sendViaSmtp({
        to: mailTo,
        host: smtpHost,
        port: smtpPort,
        user: smtpUser,
        pass: smtpPass,
        from: smtpUser,
        subject,
        text,
        html,
      });
      return NextResponse.json(
        { success: true, provider: 'smtp' },
        { headers: rateLimitHeaders(rlResult) }
      );
    }

    return NextResponse.json({ success: false, error: '邮件服务未配置' }, { status: 500 });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error('邮件发送失败:', errMsg);
    // 生产环境不暴露内部错误细节
    const detail = process.env.NODE_ENV === 'production' ? undefined : errMsg;
    return NextResponse.json(
      {
        success: false,
        error: '邮件发送失败，请稍后重试或直接联系 1318952797@qq.com',
        detail,
      },
      { status: 500 }
    );
  }
}
