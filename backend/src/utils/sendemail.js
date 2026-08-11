import nodemailer from "nodemailer"

const sendEmail = async ({ to, subject, html }) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })

    const info = await transporter.sendMail({
      from: `"BillSplit" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    })

    console.log("Email sent:", info.messageId)
    return info

  } catch (error) {
    console.error("Email failed:", error.message)
    throw new Error("Email could not be sent")
  }
}

export default sendEmail