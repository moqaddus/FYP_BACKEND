import express from "express";
import {
  createTicketAndAttendee,
  getAttendeesForEvent,
  postReviewAndRating,
  sendTicketCode,
  getIfUserIsAttendee,
} from "../controller/attendeeController.js"; // Adjust the path accordingly
import { authenticatePlatfromUser } from "../middleware/verifyPlatformUser.js";

const router = express.Router();

// Route to get all attendees for a specific event
router.post("/create/:eventId/:tokenId", createTicketAndAttendee);
router.post("/sendTicket/:userId/:ticketId", sendTicketCode);
router.get("/event/:eventId", getAttendeesForEvent);
router.post("/post-review/:attendeeId", postReviewAndRating);
//router.get("/get/:eventId", getAllUsersOfEvent);
// Export the router
router.get(
  "/getifAttendee/:eventId",
  authenticatePlatfromUser,
  getIfUserIsAttendee
);

export default router;
