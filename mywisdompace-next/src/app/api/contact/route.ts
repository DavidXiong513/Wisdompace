import { NextRequest, NextResponse } from "next/server";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import os from "os";

/* ─────────────────────────────────────
   表单字段中文映射
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
   构建纯文本邮件正文
   ───────────────────────────────────── */
function buildEmailText(data: Record<string, string>): string {
  const lines: string[] = [
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "  思考熊 · 新的咨询消息",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "",
  ];

  for (const [key, label] of Object.entries(FIELD_LABELS)) {
    const value = data[key]?.trim();
    if (value) {
      lines.push("  " + label + "：" + value);
    }
  }

  lines.push(
    "",
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━",
    "  时间：" + new Date().toLocaleString("zh-CN", { timeZone: "Asia/Shanghai" }),
    "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
  );

  return lines.join("\n");
}

/* ─────────────────────────────────────
   调用 Python 脚本发送邮件（通过临时文件传中文）
   ───────────────────────────────────── */
function sendMailViaPython(payload: {
  to: string;
  user: string;
  pass: string;
  subject: string;
  body: string;
}): Promise<void> {
  return new Promise((resolve, reject) => {
    // 写临时文件（UTF-8，零编码损失）
    const tmpFile = path.join(os.tmpdir(), "contact-" + Date.now() + ".json");
    fs.writeFileSync(tmpFile, JSON.stringify(payload), "utf-8");

    const scriptPath = path.join(process.cwd(), "scripts", "send_mail.py");
    const py = spawn("python3", [scriptPath, tmpFile], {
      env: { ...process.env, PYTHONIOENCODING: "utf-8" },
    });

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (d) => {
      stdout += d.toString();
    });
    py.stderr.on("data", (d) => {
      stderr += d.toString();
    });

    py.on("close", (code) => {
      if (code === 0) {
        try {
          const result = JSON.parse(stdout.trim());
          if (result.success) {
            resolve();
          } else {
            reject(new Error(result.error || "Unknown error"));
          }
        } catch {
          reject(new Error("Invalid JSON from Python: " + stdout));
        }
      } else {
        reject(new Error(stderr || "Python script exited with code " + code));
      }
    });

    py.on("error", (err) => reject(err));
  });
}

/* ─────────────────────────────────────
   POST /api/contact
   ───────────────────────────────────── */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    // 验证必填字段
    const required = ["name", "identity", "interest", "email", "message"];
    const missing = required.filter((key) => !data[key]?.trim());
    if (missing.length > 0) {
      return NextResponse.json(
        { error: "缺少必填字段: " + missing.map((k) => FIELD_LABELS[k] || k).join("、") },
        { status: 400 }
      );
    }

    const mailTo = process.env.MAIL_TO || "1318952797@qq.com";
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    if (!smtpUser || !smtpPass) {
      return NextResponse.json(
        { error: "SMTP 环境变量未配置" },
        { status: 500 }
      );
    }

    await sendMailViaPython({
      to: mailTo,
      user: smtpUser,
      pass: smtpPass,
      subject: "思考熊咨询 - " + (data.name?.trim() || "新消息"),
      body: buildEmailText(data),
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
