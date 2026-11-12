/** 인증 코드 메일 발송 (구 account 서비스의 mailsender 이전) */
import { type Mail, createTransport } from 'nodemailer';
import { env } from '../../config/env';

let transporter: Mail | undefined;

function getTransporter(): Mail {
  if (!env.mail.sender || !env.mail.secret) {
    throw new Error('메일 발송 계정(SENDER_EMAIL, SENDER_SECRET)이 설정되지 않았습니다.');
  }
  transporter ??= createTransport({
    service: 'Gmail',
    auth: { user: env.mail.sender, pass: env.mail.secret },
  });
  return transporter;
}

export function isMailConfigured(): boolean {
  return Boolean(env.mail.sender && env.mail.secret);
}

/** 수신자는 호출하는 쪽에서 단일 주소로 검증한 값이어야 합니다. */
export async function sendVerificationMail(receiver: string, code: string): Promise<void> {
  await getTransporter().sendMail({
    from: env.mail.sender,
    to: receiver,
    subject: '[두기고] 이메일 인증 코드',
    html: mailTemplate('두기고 인증코드', '다음은 이메일 인증을 위한 코드입니다', code),
    text: `안녕하세요! 인증 코드는 다음과 같습니다: ${code}`,
  });
}

function mailTemplate(subject: string, description: string, code: string): string {
  return `
<table style="font-family: Arial, sans-serif; width: 100%; max-width: 320px; border-radius: 10px; background-color: #e0f7f5; margin: 0 auto; overflow: hidden; border-collapse: collapse;">
  <tr>
    <td style="padding: 10px; position: relative;">
      <table style="margin: 0; padding: 0; display: inline-table;">
        <tr>
          <td style="width: 12px; height: 12px; background-color: #ff5f56; border-radius: 50%;"></td>
          <td style="width: 12px; height: 12px; background-color: #ffbd2e; border-radius: 50%; margin-left: 5px;"></td>
          <td style="width: 12px; height: 12px; background-color: #27c93f; border-radius: 50%; margin-left: 5px;"></td>
        </tr>
      </table>
    </td>
  </tr>
  <tr>
    <td style="background-color: #4caf50; color: white; text-align: center; padding: 15px; font-size: 18px; font-weight: bold;">
      ${subject}
    </td>
  </tr>
  <tr>
    <td style="background-color: white; text-align: center; padding: 20px; color: black; font-size: 14px;">
      <p style="margin: 0 0 10px;">${description}</p>
      <p style="font-size: 24px; font-weight: bold; color: #4caf50; margin: 0;">${code}</p>
    </td>
  </tr>
</table>`;
}
