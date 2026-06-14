import aiosmtplib
from email.message import EmailMessage
from typing import List
from config.settings import settings


class EmailService:
    async def send_email_async(
        self,
        to_emails: List[str],
        subject: str,
        body: str,
        is_html: bool = False
    ):
        message = EmailMessage()
        message["From"] = "noreply@free-videos.com"
        message["To"] = ", ".join(to_emails)
        message["Subject"] = subject
        
        if is_html:
            message.set_content(body, subtype="html")
        else:
            message.set_content(body)
        
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            use_tls=settings.SMTP_USE_TLS
        )
