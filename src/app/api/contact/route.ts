import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

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
   通过 nodemailer 发送邮件
   ───────────────────────────────────── */
async function sendMail(payload: {
  to: string;
  host: string;
  port: number;
  user: string;
  pass: string;
  subject: string;
  body: string;
}): Promise<void> {
  const transporter = nodemailer.createTransport({
    host: payload.host,
    port: payload.port,
    secure: payload.port === 465, // 465 = SSL, 587 = STARTTLS
    auth: {
      user: payload.user,
      pass: payload.pass,
    },
  });

  await transporter.sendMail({
    from: payload.user,
    to: payload.to,
    subject: payload.subject,
    text: payload.body,
  });
}

/* ─────────────────────────────────────
   POST /api/contact
   ───────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // 验证必填字段
    const required = ['name', 'identity', 'interest', 'phone', 'budget', 'message'];
    const missing = required.filter(key => !data[key]?.trim());
    if (missing.length > 0) {
      return NextResponse.json(
        { error: '缺少必填字段: ' + missing.map(k => FIELD_LABELS[k] || k).join('、') },
        { status: 400 }
      );
    }

    const mailTo = process.env.MAIL_TO || '1318952797@qq.com';
    const smtpHost = process.env.SMTP_HOST || 'smtp.qq.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json({ error: 'SMTP 环境变量未配置' }, { status: 500 });
    }

    await sendMail({
      to: mailTo,
      host: smtpHost,
      port: smtpPort,
      user: smtpUser,
      pass: smtpPass,
      subject: '思考熊咨询 - ' + (data.name?.trim() || '新消息'),
      body: buildEmailText(data),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const errCode =
      error instanceof Error && 'code' in error ? (error as NodeJS.ErrnoException).code : '';
    console.error('邮件发送失败:', errMsg, errCode);
    return NextResponse.json(
      {
        error: '邮件发送失败，请稍后重试或直接联系 1318952797@qq.com',
        detail: errMsg,
        code: errCode,
      },
      { status: 500 }
    );
  }
}
