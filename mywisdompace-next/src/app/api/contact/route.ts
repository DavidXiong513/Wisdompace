import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

/* ─────────────────────────────────────
   表单字段中文映射（用于邮件正文）
   ───────────────────────────────────── */
const FIELD_LABELS: Record<string, string> = {
  name: "你的称呼",
  identity: "你的身份",
  interest: "感兴趣的方向",
  company: "公司/组织",
  email: "联系邮箱",
  phone: "联系电话",
  budget: "预算范围",
  message: "你想说的",
};

/* ─────────────────────────────────────
   QQ 邮箱 SMTP 传输器
   ───────────────────────────────────── */
function createTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP 环境变量未配置");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // 465 用 SSL，587 用 TLS
    auth: { user, pass },
  });
}

/* ─────────────────────────────────────
   构建格式化邮件正文
   ───────────────────────────────────── */
function buildEmailBody(data: Record<string, string>): string {
  const lines: string[] = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "  思考熊 · 新的咨询消息",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
  ];

  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const value = data[key]?.trim();
    if (value) {
      lines.push(`  ${label}：${value}`);
    }
  }

  lines.push(
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    `  时间：${new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" })}`,
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  );

  return lines.join("\n");
}

/* ─────────────────────────────────────
   POST /api/contact
   ───────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    const data: Record<string, string> = {};
    const formData = await request.formData();
    formData.forEach((value, key) => {
      data[key] = value.toString();
    });

    // 验证必填字段
    const required = ["name", "identity", "interest", "email", "message"];
    const missing = required.filter((key) => !data[key]?.trim());
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `缺少必填字段: ${missing.map((k) => FIELD_LABELS[k] || k).join("、")}` },
        { status: 400 }
      );
    }

    // 发送邮件
    const transporter = createTransporter();
    const mailTo = process.env.MAIL_TO || "1318952797@qq.com";

    await transporter.sendMail({
      from: `"思考熊咨询表单" <${process.env.SMTP_USER}>`,
      to: mailTo,
      subject: `💬 新的咨询消息 - 来自 ${data.name?.trim() || "匿名"}`,
      text: buildEmailBody(data),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("邮件发送失败:", error);
    return NextResponse.json(
      { error: "邮件发送失败，请稍后重试或直接联系 1318952797@qq.com" },
      { status: 500 }
    );
  }
}
