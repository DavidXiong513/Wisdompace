#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
发送咨询表单邮件到 QQ 邮箱
由 Next.js API Route 调用
用法: python send_mail.py <to_email> <smtp_user> <smtp_pass> <subject> <body>
"""
import sys
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
    if len(sys.argv) != 6:
        print("Usage: send_mail.py <to> <user> <pass> <subject> <body>", file=sys.stderr)
        sys.exit(1)

    _, to_email, smtp_user, smtp_pass, subject, body = sys.argv
    send_email(to_email, smtp_user, smtp_pass, subject, body)
    print("OK")
