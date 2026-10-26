"""SMTP local (Mailpit) ou provedor externo; tokens nunca entram em logs."""

import smtplib
from email.message import EmailMessage

from backend.app.core import settings


def send_verification(email, token):
    if settings.dev_email_tokens and settings.environment == "development":
        return token
    message = EmailMessage()
    message["From"], message["To"] = settings.email_from, email
    message["Subject"] = "Verifique seu cadastro no GeoVision"
    message.set_content(
        f"Use este código na tela Conta do GeoVision: {token}\nExpira em 1 hora. Se não solicitou, ignore."
    )
    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as smtp:
        if settings.smtp_starttls:
            smtp.starttls()
        if settings.smtp_user:
            smtp.login(settings.smtp_user, settings.smtp_password)
        smtp.send_message(message)
    return None
