import nodemailer from 'nodemailer';
import hbs from 'nodemailer-express-handlebars';
import { ENV_VARS, HttpsError } from '../utils';

export default class MailService {
  private readonly transporter: nodemailer.Transporter;
  private readonly handlebarsOptions: any;

  private readonly USERNAME: string;
  private readonly PASSWORD: string;

  constructor() {
    this.USERNAME = ENV_VARS.MAIL_USERNAME;
    this.PASSWORD = ENV_VARS.MAIL_PASSWORD;

    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.USERNAME,
        pass: this.PASSWORD,
      },
    });

    this.handlebarsOptions = {
      viewEngine: {
        partialsDir: 'src/views',
        defaultLayout: false,
      },
      viewPath: 'src/views',
    };

    this.transporter.use('compile', hbs(this.handlebarsOptions));
  }

  public async sendMail({ to, subject, context }: { to: string; subject: string; context: any }): Promise<void> {
    const mailOptions = {
      from: this.USERNAME,
      template: 'email',
      to,
      subject,
      context: {
        url: context.url!,
        code: context.code!,
      },
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error: any) {
      throw new HttpsError('failed-precondition', `Error sending email: ${error.message}`);
    }
  }
}
