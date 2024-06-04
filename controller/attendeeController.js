import Attendee from "../models/attendee.js";
import Event from "../models/event.js";
import PlatformUser from "../models/platformUser.js";
import userSchema from "../models/user.js";
import nodemailer from "nodemailer";
import sgMail from "@sendgrid/mail";
import User from "../models/user.js";
import mongoose from "mongoose";
import { API_KEY } from "../config/index.js";


sgMail.setApiKey(API_KEY);

const transporter = nodemailer.createTransport({
  // Configure your email service provider here
  service: "SendGrid",
  auth: {
    user: "apikey", // Your email address
    pass: API_KEY, // Your email password
  },
});

export const sendTicketCode = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const { ticketId } = req.params;
    // const UserID=userId
    // const attendeeId=ticketId;

    const userExists = await userSchema.findOne({ _id: userId });
    if (!userExists) {
      return res.status(400).json({ error: "User not found" });
    }
    console.log("User Found");
    const email = userExists.Email;
    const name = userExists.Name;

    const event = await Event.findOne({ _id: ticketId });
    console.log("Event Valid");

    const attendee = await Attendee.findOne({
      UserID: userId,
      EventID: ticketId,
    });
    if (!attendee) {
      return res.status(400).json({ error: "User not found" });
    }

    const ticketCode = attendee.TicketCode;

    await transporter.sendMail({
      from: "rafimoqaddus@gmail.com", // Your email address
      to: email,
      subject: "Ticket Code for the Event",
      text: `Hello ${name},\n\nYour Ticket Code for the event ${event.Name} is ${ticketCode}.\n\nThank you.`,
    });

    res.status(201).json({ message: "Complaint submitted successfully" });
  } catch (error) {
    console.error("Error submitting complaint:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createTicketAndAttendee = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { tokenId } = req.params;
    //const UserID = tokenId;
    const EventID = eventId;

    //console.log("User id:",tokenId);

    // Check if the provided Event ID exists
    const eventExists = await Event.findOne({ _id: EventID });
    if (!eventExists) {
      console.log("EVENT NOT FOUND!!!!");
      return res.status(400).json({ error: "Event not found" });
    }

    // Check if the provided User ID exists
    //console.log("Event valid")
    const userExists = await PlatformUser.findOne({ ID: tokenId });
    if (!userExists) {
      return res.status(400).json({ error: "User not found" });
    }

    //console.log("User valid");
    const existingAttendee = await Attendee.findOne({
      UserID: userExists._id,
      EventID,
    });
    if (existingAttendee) {
      return res
        .status(400)
        .json({ error: "Attendee already exists for this user and event" });
    }

    let ticketstotal = eventExists.TotalTickets;
    if (ticketstotal < 1) {
      return res.status(400).json({ error: "Unsufficient Tickets" });
    }
    let ticketsold = eventExists.SoldTickets;

    if (ticketstotal === ticketsold) {
      return res.status(400).json({ error: "All tickets are sold" });
    }

    await Event.findByIdAndUpdate(
      EventID,
      { $set: { SoldTickets: ticketsold + 1 } },
      { new: true }
    );
    let ticketCode = ticketsold + 100001;

    const UserID = userExists._id;
    // Create a new attendee associated with the ticket
    const attendee = new Attendee({
      UserID,
      EventID,
      TicketCode: ticketCode,
      CheckedIn: false,
      Rating: null,
      Review: null,
    });
    await attendee.save();

    // Respond with the created ticket and attendee
    console.log("Successfully updated count");
    res.status(201).json({ attendee });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const getAttendeesForEvent = async (req, res) => {
  try {
    const eventID = req.params.eventId;

    const eventExists = await Event.findById(eventID);

    if (!eventExists) {
      return res.status(404).json({ error: "Event not found" });
    }

    // Retrieve all messages for the specified chat
    const attendees = await Attendee.find({ EventID: eventID });

    res.status(200).json(attendees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const postReviewAndRating = async (req, res) => {
  try {
    // Check if the provided Attendee ID exists
    const attendeeId = req.params.attendeeId;
    //const {id:attendeeId}=req.params
    const attendeeExists = await Attendee.findById(attendeeId);
    if (!attendeeExists) {
      return res.status(400).json({ error: "Attendee not found" });
    }
    if (attendeeExists.CheckedIn === true) {
      return res
        .status(400)
        .json({ error: "Attendee has already posted the rating" });
    }
    const { rating, review } = req.body;
    // Update the attendee with the provided rating and review
    await Attendee.findByIdAndUpdate(
      attendeeId,
      { $set: { CheckedIn: true, Rating: rating, Review: review } },
      { new: true }
    );

    res.status(200).json({ message: "Review and rating posted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};




//To find if a user has buy ticket already or not
export const getIfUserIsAttendee = async (req, res, next) => {
  try {
    // Extract user ID from the token
    const userId = req.user.id; // Assuming the token middleware attaches the user info to req.user
    console.log(userId);
    // Find the PlatformUser using the extracted user ID
    const platformUser = await PlatformUser.findOne({ ID: userId });
    if (!platformUser) {
      return res.status(404).json({ message: "PlatformUser not found" });
    }
    console.log(platformUser._id);
    // Get the eventId from the route parameters
    const { eventId } = req.params;

    // Check if the PlatformUser ID is present in the Attendee model for the given eventId
    const attendee = await Attendee.findOne({
      EventID: new mongoose.Types.ObjectId(eventId), // Correct field name
      UserID: platformUser._id, // Correct field name
    });

    // Respond with the 'buy' variable
    const buy = !!attendee; // true if attendee is found, false otherwise
    console.log(buy);
    res.status(200).json({ buy });
  } catch (error) {
    next(error);
  }
};

// export const reviewAndRatingOfEvent=async (req, res) => {
//     try {
//       const eventId = req.params.eventId;
  
//       // Find the event name
//       const event = await Event.findById(eventId);
//       if (!event) {
//         return res.status(404).json({ error: 'Event not found' });
//       }
//       const eventName = event.Name;
  
//       // Find reviews and ratings for the event
//       const reviewsAndRatings = await Attendee.find(
//         { EventID: eventId, Rating: { $exists: true }, Review: { $exists: true } },
//         'Rating Review -_id'
//       );
//       console.log(reviewsAndRatings + eventName);
//       res.json({ eventName, reviewsAndRatings });
//     } catch (error) {
//       console.error('Error fetching reviews and ratings:', error);
//       res.status(500).json({ error: 'Internal Server Error' });
//     }
//   };

export const reviewAndRatingOfEvent = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Find the event name
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ error: 'Event not found' });
    }
    const eventName = event.Name;

    // Find reviews and ratings for the event, considering only checked-in attendees
    const reviewsAndRatings = await Attendee.find(
      {
        EventID: eventId,
        Rating: { $exists: true },
        Review: { $exists: true },
        CheckedIn: true, // Filter for checked-in attendees
      },
      'Rating Review -_id' // Projection to include relevant fields, exclude ID
    );

    res.json({ eventName, reviewsAndRatings });
  } catch (error) {
    console.error('Error fetching reviews and ratings:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getAverageRating=async (req, res) => {
  try {
    const { eventId } = req.params;

    // Retrieve all attendees for the specified event from the database
    const attendees = await Attendee.find({ EventID: eventId });

    if (!attendees || attendees.length === 0) {
      return res.status(404).json({ error: 'No attendees found for the event' });
    }

    // Calculate total rating and count of ratings
    let totalRating = 0;
    let ratingCount = 0;
    attendees.forEach(attendee => {
      if (attendee.Rating !== undefined && attendee.Rating !== null) {
        totalRating += attendee.Rating;
        ratingCount++;
      }
    });

    // Calculate average rating
    const averageRating = ratingCount > 0 ? totalRating / ratingCount : 0;

    // Send response with average rating
    res.status(200).json({ averageRating });
  } catch (error) {
    console.error('Error calculating average rating:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};