import UserComplaint from "../models/contactUs.js";
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';


sgMail.setApiKey('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');


const transporter = nodemailer.createTransport({
  // Configure your email service provider here
  service: 'SendGrid',
  auth: {
    user: 'apikey', // Your email address
    pass: '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', // Your email password
  },
});



export const addComplaint = async (req, res, next) => {
  try {
    const { name, email, complaint } = req.body;
    const newComplaint = new UserComplaint({ name, email, complaint });
    await newComplaint.save();

    await transporter.sendMail({
      from: 'rafimoqaddus@gmail.com', // Your email address
      to: email,
      subject: 'Suggestion Submission Confirmation',
      text: `Hello ${name},\n\nYour Suggestion has been successfully submitted. We will reach out to you soon.\n\nThank you.`,
    });

    res.status(201).json({ message: 'Complaint submitted successfully' });
  } catch (error) {
    console.error('Error submitting complaint:', error);
    res.status(500).json({ message: 'Server error' });
  }


}