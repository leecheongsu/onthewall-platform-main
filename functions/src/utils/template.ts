import {readAndModifyHTML, readModifyHTMLforNoti, sendMail} from "./mail";
import * as path from "path";

export async function sendTemplate(email: string, projectUrl: string, projectTitle: string, templateType: "user" | "exhibition", signPath: string) {
    try {
        const invitationLink = path.resolve(__dirname, '../template/invite.html');
        let linkUrl: string;
        let replaceValue: string;

        if (templateType === "user") {
            linkUrl = `https://onthewall.io${signPath}?email=${encodeURIComponent(email)}`;
            // linkUrl = `https://mal.onthewall.io${signPath}?email=${encodeURIComponent(email)}`;
            replaceValue = `
                <div id="content">
                    You have been invited to join <strong>${projectTitle}</strong> as a new member.<br/>
                    Please click the button below to sign up.<br/><br/>
                    <div style="text-align: center;">
                        <a href="${linkUrl}" style="padding: 15px 30px; font-size: 18px; background-color: #115DE6; text-decoration: none; border-radius: 5px; text-align: center; display: block; width: auto; margin: 0 auto; border: 1px solid transparent; color: #ffffff;" id="invitationLink">Click here to Sign up</a>
                    </div>
                </div>
            `;
        } else if (templateType === "exhibition") {
            linkUrl = `https://onthewall.io${projectUrl}/invitation`;
            // linkUrl = `https://mal.onthewall.io${projectUrl}/invitation`;
            replaceValue = `
                <div id="content">
                    You have been invited to join our <strong>${projectTitle}</strong>'s Exhibition.<br/>
                    Please click the button below to enter the exhibition.<br/><br/>
                    <div style="text-align: center;">
                        <a href="${linkUrl}" style="padding: 15px 30px; font-size: 18px; background-color: #115DE6; text-decoration: none; border-radius: 5px; text-align: center; display: block; width: auto; margin: 0 auto; border: 1px solid transparent; color: #ffffff;" id="invitationLink">Click here to Enter</a>
                    </div>
                </div>
            `;
        } else {
            throw new Error("Invalid template type");
        }

        const searchValue = '<div id="content">content</div>';
        const htmlForEmail = await readAndModifyHTML(invitationLink, linkUrl, searchValue, replaceValue);
        await sendMail(email, `Welcome to ${projectTitle}`, htmlForEmail, []);
    } catch (error) {
        console.error(`Error sending invitation email to ${email}: `, error);
        throw error;
    }
}

export async function sendTemplateForFindPw(name: string, email: string, newPassword: string) {
    try {

        const template = path.resolve(__dirname, '../template/invite.html');

        const subject = `[OnTheWall-Cloud] Hello, ${name} Get your New Password`

        const searchValue = '<div id="content">content</div>';
        const replaceValue = `
                <div id="content">
                    Please log in using the following temporary password. <br /> 
                    We recommend changing your password afterwards for security reasons.
                    <br /><br /><br />
                    <div style="text-align: center;">
                        <strong style="font-size: 18px;">${newPassword}</strong>
                    </div>
                </div>
            `;

        const htmlForEmail = await readAndModifyHTML(template, "", searchValue, replaceValue);

        await sendMail(email, subject, htmlForEmail, [])
    } catch (e) {
        console.error(`Error sending Find Pw email to ${email}: `, e)
        throw e;
    }
}

export async function sendTemplateForJoin(name: string, email: string) {
    try {
        const title = `${name} Congratulations on signing up for OnTheWall-Cloud!`;
        const content = `
                <div id="content">
                    <strong>Welcome to OnTheWall-Cloud!</strong> 
                    <br/>
                    We are thrilled to have you on board. 
                    <br/><br/>
                    To complete your registration and start exploring the amazing features we offer.
                    <br/><br/>
                    If you have any questions or need assistance, feel free to reach out to our support team.
                    <br/><br/>
                    Thank you for joining us, and we look forward to seeing what you'll create with OnTheWall-Cloud!
                    <br/><br/>
                </div>`;


        const notiTemplate = path.resolve(__dirname, '../template/noti.html');
        const htmlForEmail = await readModifyHTMLforNoti(notiTemplate, title, content);
        await sendMail(email, title, htmlForEmail, []);
    } catch (e) {
        console.error(`Error Sending Join Email to ${email}: `, e)
    }
}


