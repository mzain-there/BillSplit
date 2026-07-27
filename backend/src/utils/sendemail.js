import * as Brevo from "@getbrevo/brevo"

const sendEmail = async ({ to, subject, html }) => {
  try {
    const apiInstance = new Brevo.TransactionalEmailsApi()

    apiInstance.authentications["apiKey"].apiKey =
      process.env.BREVO_API_KEY

    const sendSmtpEmail = {
      sender: { name: "BillSplit", email: process.env.EMAIL_USER },
      to: [{ email: to }],
      subject,
      htmlContent: html,
    }

    const data = await apiInstance.sendTransacEmail(sendSmtpEmail)
    console.log("Email sent successfully")
    return data

  } catch (error) {
    console.error("Email sending failed:", error)
    throw new Error("Email could not be sent")
  }
}

export default sendEmail