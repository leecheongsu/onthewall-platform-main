import * as fs from "fs";
import * as nodemailer from 'nodemailer';
import MailForm from "../common/form/mail";

export async function readAndModifyHTML(htmlPath: string, invitationLink: string, searchValue: string, replaceValue: string) {
    return new Promise((resolve, reject) => {
        fs.readFile(htmlPath, 'utf8', (err, data) => {
            if (err) {
                reject(err);
                return;
            }
            const modifiedContent = data.replace(searchValue, replaceValue)
            resolve(modifiedContent);
        });
    });
}

export async function readModifyHTMLforNoti(htmlPath: string, title: string, content: string) {
    return new Promise((resolve, reject) => {
        fs.readFile(htmlPath, 'utf8', (err, data) => {
            if(err) {
                reject(err)
                return;
            }

            const searchTitle = '<title>title</title>';
            const searchContent = '<div id="content">content</div>'

            const modifiedTitle = data.replace(searchTitle, title);
            const modifiedContent = modifiedTitle.replace(searchContent, content);

            resolve(modifiedContent);
        })
    })
}


export async function sendMail(to: string | string[], subject: string, html: any, attachments: any) {
    try {
        const builder = new MailForm.Builder();
        const form = builder
            .addTo(Array.isArray(to) ? to : [to])
            .setSubject(subject)
            .setHtml(html)
            .addAttachments(Array.isArray(attachments) ? attachments : [attachments])
            .build();

        const transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: process.env.MAIL_SECURE === 'true' || false,
            auth: {
                user: process.env.APP_USER,
                pass: process.env.APP_PASS
            },
        });

        const options: nodemailer.SendMailOptions = {
            from: process.env.APP_USER,
            to: form.to,
            subject: form.subject,
            html: form.html,
            attachments: form.attachments && form.attachments.length > 0 ? form.attachments : undefined,
        };

        transporter.sendMail(options, (err, info) => {
            if (err) {
                console.error("Sending Mail Error: ", err);
            } else {
                console.log("Sent: ", info.response, form.to);
            }
        });
    } catch (e) {
        console.error('Send Mail : ', e);
    }
}
