#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
发送咨询表单邮件到 QQ 邮箱
由 Next.js API Route 通过 stdin 调用
用法: echo '{"to":"...","user":"...","pass":"...","subject":"...","body":"..."}' | python send_mail.py
"""
import sys
import json
import smtplib
from email.mime.text import MIMEText
from email.header import Header


def send_email(to_email: str, smtp_user: str, smtp_pass: str, subject: str, body: str) -> None:
    msg = MIMEText(body, "plain", "utf-8")
    msg["Subject"] = Header(subject, "utf-8")
    msg["From"] = smtp_user
    msg["To"] = to_email

    with smtplib.SMTP_SSL("smtp.qq.com", 465) as server:
        server.login(smtp_user, smtp_pass)
        server.sendmail(smtp_user, [to_email], msg.as_string())


if __name__ == "__main__":
    try:
        # 必须用 buffer 读取原始字节再 decode('utf-8')
        # 避免 Windows 上用 GBK 解码导致中文乱码
        raw = sys.stdin.buffer.read().decode("utf-8")
        payload = json.loads(raw)
        send_email(
            payload["to"],
            payload["user"],
            payload["pass"],
            payload["subject"],
            payload["body"],
        )
        print(json.dumps({"success": True}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)
