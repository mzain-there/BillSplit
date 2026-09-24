import nodemailer from "nodemailer"

const sendEmail = async ({ to, subject, html }) => {
  try {
    const pass = process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, "") : ""

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass,
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    const info = await transporter.sendMail({
      from: `"BillSplit" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })

    console.log(`Email sent successfully to ${to}. MessageId: ${info.messageId}`)
    return info

  } catch (error) {
    console.error(`Email sending failed for ${to}:`, error.message)
    throw new Error(error.message || "Email could not be sent")
  }
}

export default sendEmail