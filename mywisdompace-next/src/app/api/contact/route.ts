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
   构建 HTML 格式邮件正文（确保中文编码正确）
   ───────────────────────────────────── */
function buildEmailHtml(data: Record<string, string>): string {
  const rows = Object.entries(FIELD_LABELS)
    .map(([key, label]) => {
      const value = data[key]?.trim();
      if (!value) return "";
      return `<tr>
        <td style="padding: 4px 12px 4px 0; white-space: nowrap; vertical-align: top; color: #8D6E63; font-size: 13px;">${label}</td>
        <td style="padding: 4px 0; color: #2C1810; font-size: 13px;">${value.replace(/\n/g, "<br>")}</td>
      </tr>`;
    })
    .filter(Boolean)
    .join("\n");

  const time = new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" });

  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#F5F0EB;font-family:'PingFang SC','Microsoft YaHei',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0EB;padding:20px;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;box-shadow:0 2px 8px rgba(0,0,0,0.06);overflow:hidden;">
          <tr>
            <td style="background:#8B4513;padding:20px 24px;">
              <h1 style="margin:0;font-size:18px;font-weight:600;color:#fff;">思考熊 · 新的咨询消息</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 24px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                ${rows}
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 24px;border-top:1px solid #E8DED5;font-size:12px;color:#A1887F;">
              收到时间：${time}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
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
      subject: "思考熊咨询 - " + (data.name?.trim() || "新消息"),
      html: buildEmailHtml(data),
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
