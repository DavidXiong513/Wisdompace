#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
发送咨询表单邮件到 QQ 邮箱
由 Next.js API Route 通过环境变量调用，彻底避免管道编码问题
"""
import os
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
        send_email(
            os.environ["MAIL_TO"],
            os.environ["SMTP_USER"],
            os.environ["SMTP_PASS"],
            os.environ["MAIL_SUBJECT"],
            os.environ["MAIL_BODY"],
        )
        print(json.dumps({"success": True}))
    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        sys.exit(1)
