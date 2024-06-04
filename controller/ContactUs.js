import UserComplaint from "../models/contactUs.js";
import nodemailer from 'nodemailer';
import sgMail from '@sendgrid/mail';
import { API_KEY } from "../config/index.js";


sgMail.setApiKey(API_KEY);


const transporter = nodemailer.createTransport({
  // Configure your email service provider here
  service: 'SendGrid',
  auth: {
    user: 'apikey', // Your email address
    pass: API_KEY, // Your email password
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