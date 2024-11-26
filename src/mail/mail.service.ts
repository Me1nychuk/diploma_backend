import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { handleError } from 'libs/common/src/helpers/handleError';
import axios from 'axios';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {}
  private async sendMail(
    recipient: { email: string; name: string },
    subject: string,
    content: string,
  ): Promise<void> {
    try {
      const emailData = {
        sender: {
          email: this.configService.get<string>('MAIL_FROM'),
          name: 'NUWM - DEPARTMENT OF COMPUTER ENGINEERING',
        },
        to: [{ email: recipient.email, name: recipient?.name || 'User' }],
        subject: subject,
        htmlContent:
          content +
          ' ' +
          `<p style="color: gray"> З повагою адміністрація сайту</p> 
          <p style="color: gray"> NUWM - DEPARTMENT OF COMPUTER ENGINEERING</p>
          <p style="color: gray">Не відповідайте на це повідомлення</p>`,
      };

      const response = await axios.post(
        this.configService.get<string>('MAIL_URL'),
        emailData,
        {
          headers: {
            'Content-Type': 'application/json',
            'api-key': this.configService.get<string>('MAIL_API'),
          },
        },
      );

      if (response.status !== 201) {
        throw new Error('Failed to send email');
      }
    } catch (error) {
      handleError(error, 'Error sending mail');
    }
  }

  async resetPassword(email: string, name: string, link: string) {
    try {
      await this.sendMail(
        { email, name },
        'Reset Password',
        `<h2>Вітаємо <b><i>${name}</i></b></h2> <p>Ми отримали запит на зміну пароля</p> <p>Якщо ви хочете змінити пароль,перейдіть за посиланням - <a href="${link}">-> ПОСИЛАННЯ <-</a></p> <br /> <br /> <p> Якщо ви не зробили запит на зміну пароля, зв'яжіться з адміністрацією сайту</p>`,
      );
    } catch (error) {
      handleError(error, 'Error sending test mail');
    }
  }
  async verify(email: string, name: string, link: string) {
    try {
      await this.sendMail(
        { email, name },
        'Verify Email',
        `<h2>Вітаємо <b><i>${name}</i></b></h2>  <p>Для того щоб підтвердити свою електронну адресу,перейдіть за посиланням нижче</p> <a href="${link}">-> ПОСИЛАННЯ <-</a> <br /> <br /> `,
      );
    } catch (error) {
      handleError(error, 'Error sending test mail');
    }
  }
  async notification(
    email: string,
    name: string,
    subject: string,
    content: string,
  ) {
    try {
      await this.sendMail({ email, name }, subject, content);
    } catch (error) {
      handleError(error, 'Error sending notification mail');
    }
  }
}
