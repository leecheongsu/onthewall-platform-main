import {AttachmentLike} from "nodemailer/lib/mailer";

class MailForm {
  to: Array<string>;
  cc?: Array<string>;
  subject?: string;
  text?: string;
  html?: any;
  attachments?: AttachmentLike[];

  constructor(
    to: Array<string>,
    cc: Array<string> = [],
    subject = "",
    text = "",
    html: any = "",
    attachments: AttachmentLike[] = []
  ) {
    if (to.length === 0) {
      throw new Error("메일 수신자가 없습니다.");
    }
    this.to = to;
    this.cc = cc;
    this.subject = subject;
    this.text = text;
    this.html = html;
    this.attachments = attachments;
  }

  static Builder = class {
    private to: Array<string> = [];
    private cc: Array<string> = [];
    private subject = "";
    private text = "";
    private html = "";
    private attachments: AttachmentLike[] = [];

    addTo(to: Array<string>): this {
      this.to.push(...to);
      return this;
    }

    addCc(cc: Array<string>): this {
      this.cc.push(...cc);
      return this;
    }

    setSubject(subject: string): this {
      this.subject = subject;
      return this;
    }

    setText(text: string): this {
      this.text = text;
      return this;
    }

    setHtml(html: string | any): this {
      this.html = html;
      return this;
    }

    addAttachments(attachments: AttachmentLike[]): this {
      this.attachments.push(...attachments);
      return this;
    }

    build(): MailForm {
      return new MailForm(
        this.to,
        this.cc,
        this.subject,
        this.text,
        this.html,
        this.attachments
      );
    }
  };
}

export default MailForm;
