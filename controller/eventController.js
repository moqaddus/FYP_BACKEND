import Event from "../models/event.js";
import Interest from "../models/interest.js";
import PlatformAdmin from "../models/platformAdmin.js";
import Organization from "../models/organization.js";
import { cloudinary } from "../utils/cloudinary.js";
import Media from "../models/media.js";
import userScheme from "../models/user.js";
import PlatformUser from "../models/platformUser.js";
import Attendee from "../models/attendee.js";

export const addEvent = async (req, res) => {
  try {
    console.log("Function started");
    console.log(req.body);

    const {
      Name,
      Description,
      EventDate,
      StartTime,
      EndTime,
      Location,
      TotalTickets,
      TicketPrice,
      EventTag,
      Status,
    } = req.body;

    // Convert date and time strings to JavaScript Date objects
    const parsedEventDate = new Date(EventDate);

    console.log("Parsed request body");

    const { id: UserID } = req.user;

    // Find the organization associated with the user ID
    const organization = await Organization.findOne({ ID: UserID });

    if (!organization) {
      return res
        .status(404)
        .json({ message: "Organization not found for the user" });
    }

    const existingEvent = await Event.findOne({ Name });

    if (existingEvent) {
      return res
        .status(400)
        .json({ message: "An event with this name already exists" });
    }

    let eventTagId = null;

    if (EventTag) {
      // Find or create the interest based on the EventTag
      let interest = await Interest.findOne({ Name: EventTag });

      if (!interest) {
        interest = new Interest({ Name: EventTag });
        await interest.save();
      }

      eventTagId = interest._id;
    }

    console.log("Fields being saved in event:");
    console.log({
      Name,
      Description,
      EventDate,
      StartTime,
      EndTime,
      Location,
      TotalTickets,
      TicketPrice,
      EventTag: eventTagId, // Use eventTagId instead of EventTag
      Status,
      Organization: organization._id,
    });

    // Create a new event with the interest ID in EventTag
    const event = new Event({
      Name,
      Description,
      EventDate,
      StartTime,
      EndTime,
      Location,
      TotalTickets,
      TicketPrice,
      EventTag: eventTagId,
      Status,
      Organization: organization._id,
    });

    await event.save();

    // Update the organization's OrganizationEvents array with the new event ID
    organization.OrganizationEvents.push(event._id);
    await organization.save();

    res.status(201).json({ event });
    console.log("Function finished successfully");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// export const updateEvent = async (req, res) => {
//   try {
//     const { id } = req.params; // Event ID

//     // Destructure the fields from the request body
//     const {
//       Name,
//       Description,
//       EventDate,
//       StartTime,
//       EndTime,
//       Location,
//       Status
//       // Add other fields as required
//     } = req.body;

//     // Find the event by ID
//     const event = await Event.findById(id);

//     if (!event) {
//       return res.status(404).json({ message: 'Event not found' });
//     }

//     // Update event fields if provided
//     if (Name) {
//       event.Name = Name;
//     }
//     if (Description) {
//       event.Description = Description;
//     }
//     if (EventDate) {
//       event.EventDate = EventDate;
//     }
//     if (StartTime) {
//       event.StartTime = StartTime;
//     }
//     if (EndTime) {
//       event.EndTime = EndTime;
//     }
//     if (Location) {
//       event.Location = Location;
//     }
//     if (Status) {
//       event.Status = Status;
//     }
//     // Add other field updates as needed

//     // Save the updated event details
//     await event.save();

//     res.status(200).json({ event });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };

export const updateEvent = async (req, res) => {
  try {
    console.log("Update function started");

    const { eventId } = req.params; // Extract event ID from request parameters

    // Extract fields that can be updated from the request body
    const { Description, Location, EventDate, StartTime, EndTime } = req.body;

    // Create an object with the fields to be updated
    const updatedFields = {};

    // Check if each field is provided in the request body, if yes, add it to the updatedFields object
    if (Description) {
      updatedFields.Description = Description;
    }
    if (Location) {
      updatedFields.Location = Location;
    }
    if (EventDate) {
      updatedFields.EventDate = EventDate;
    }
    if (StartTime) {
      updatedFields.StartTime = StartTime;
    }
    if (EndTime) {
      updatedFields.EndTime = EndTime;
    }

    // Find the event by ID and update the specified fields
    const updatedEvent = await Event.findByIdAndUpdate(
      eventId,
      { $set: updatedFields },
      { new: true } // To return the updated event
    );

    if (!updatedEvent) {
      return res.status(404).json({ message: "Event not found" });
    }

    console.log("Update function finished successfully");
    res.status(200).json({ event: updatedEvent });
  } catch (error) {
    console.error("Error in update function:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllOrganizationEvents = async (req, res) => {
  try {
    //const { id } = req.params; // Organization ID

    const { id: UserID } = req.user;

    const organization_1 = await Organization.findOne({ ID: UserID });
    console.log(organization_1);
    if (!organization_1) {
      return res
        .status(404)
        .json({ message: "Organization not found for the user" });
    }

    const iid = organization_1._id;

    // Find the organization by ID
    // const organization = await Organization.findById(iid);

    // if (!organization) {
    //   return res.status(404).json({ message: 'Organization not found' });
    // }

    // Find all events associated with the organization
    const events = await Event.find({ Organization: iid });

    // Count of events for the organization
    const eventCount = events.length;

    res.status(200).json({ events, eventCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getSingleEvent = async (req, res) => {
  console.log("Function getSingleEvent is called"); // Temporary logging

  try {
    const { eventId } = req.params;
    const { id: userId } = req.user;

    // Find the organization by user ID
    let organization = await Organization.findOne({ ID: userId });

    // If organization not found, try to find using OrganizationEvents
    if (!organization) {
      const organizationsFromEvents = await Organization.findOne({
        OrganizationEvents: eventId,
      });
      if (!organizationsFromEvents) {
        return res
          .status(404)
          .json({ message: "Organization not found for the user" });
      }
      // Update organization with found organization using OrganizationEvents
      organization = organizationsFromEvents;
    }

    // Fetch associated user to get username
    const user = await userScheme.findOne({ _id: organization.ID });
    const organizationName = user.Username;

    // Log organization ID and event ID for debugging
    console.log("Organization ID:", organization._id);
    console.log("Event ID:", eventId);

    // Find the event by ID associated with the organization
    const event = await Event.findOne({ _id: eventId });

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found for the organization" });
    }

    // Check if event.Date exists before formatting
    const formattedDate = event.Date
      ? event.Date.toISOString().substring(0, 10)
      : null;

    // Update the event object with the formatted date
    const updatedEvent = { ...event.toObject(), Date: formattedDate };

    // Print event details for debugging
    console.log("Event:", updatedEvent);

    // Return event details along with organization name
    res.status(200).json({ event: updatedEvent, organizationName });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteOrganizationEvent = async (req, res) => {
  try {
    const { eventId } = req.params;

    const { id: UserID } = req.user;

    const organization = await Organization.findOne({ ID: UserID });
    console.log(organization);
    if (!organization) {
      return res
        .status(404)
        .json({ message: "Organization not found for the user" });
    }

    const orgId = organization._id;

    // Find the event by ID associated with the organization
    const event = await Event.findOne({ _id: eventId, Organization: orgId });

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found for the organization" });
    }

    // Remove the event ID from OrganizationEvents array in the organization
    organization.OrganizationEvents = organization.OrganizationEvents.filter(
      (eventId) => eventId.toString() !== event._id.toString()
    );

    // Save the updated organization with removed event ID
    await organization.save();

    // Delete the event from Event collection
    await Event.deleteOne({ _id: eventId });

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadMediaImgs = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files uploaded",
      });
    }

    const { eventId } = req.params; // Assuming the event ID is passed as a parameter

    // Iterate through each uploaded file
    for (const file of req.files) {
      // Upload the file to Cloudinary
      cloudinary.uploader.upload(file.path, async (err, result) => {
        if (err) {
          console.log(err);
          return res.status(500).json({
            success: false,
            message: "Error uploading image",
          });
        }

        // Create a new media object for the uploaded image
        const newMedia = new Media({
          Type: "Picture", // Assuming all uploaded files are pictures
          BeforeAfter: "Before", // Assuming there's a specific value for this field
          URL: result.url,
          Event: eventId, // Assigning the event ID
        });

        // Save the new media object to the database
        await newMedia.save();
      });
    }

    res.status(200).json({
      success: true,
      message: "Images uploaded successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

const extractPublicId = (imageUrl) => {
  const parts = imageUrl.split("/");
  const fileName = parts.pop();
  const publicId = fileName.split(".")[0];
  return publicId;
};

//get Image
export const getImage = async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Query the Media collection for images associated with the event ID
    const eventImages = await Media.find({ Event: eventId, Type: "Picture" });

    // Extract URLs from the retrieved images
    const imageUrls = eventImages.map((image) => image.URL);

    // Return the image URLs as a response
    res.status(200).json({
      success: true,
      images: imageUrls,
    });
  } catch (error) {
    console.error("Error fetching event images:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// export const getAllUsersOfEvent = async (req, res) => {
//   try {
//     const { eventId } = req.params;
//     console.log(eventId);

//     // Find attendees for the given event ID
//     const attendees = await Attendee.find({ EventID: eventId });

//     console.log(attendees);

//     const userNames = [];
//     // Loop through attendees and find the User for each PlatformUser
//     for (const attendee of attendees) {
//       const platformUser = await PlatformUser.findById(attendee.UserID);
//       const user = await User.findById(platformUser.UserID);
//       userNames.push(user.Name);
//     }

//     res.status(200).json(userNames);
//   } catch (error) {
//     console.error("Error fetching attendees:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// export const getAllUsersOfEvent = async (req, res) => {
//   console.log("Function called");
//   try {
//     const { eventId } = req.params;

//     // Find attendees for the given event ID
//     const attendees = await Attendee.find({ EventID: eventId });

//     attendees.forEach((attendee) => {
//       console.log(attendee.UserID);
//     });

//     const userNames = [];
//     // Loop through attendees and find the User for each PlatformUser
//     for (const attendee of attendees) {
//       const platformUser = await PlatformUser.findById(attendee.UserID);
//       console.log(platformUser);
//       const user = await userScheme.findById(platformUser.ID);
//       console.log(user);
//       userNames.push(user.Name);
//     }

//     res.status(200).json(userNames);
//   } catch (error) {
//     console.error("Error fetching attendees:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

export const getAllUsersOfEvent = async (req, res) => {
  
  try {
    const { eventId } = req.params;

    // Find attendees for the given event ID
    const attendees = await Attendee.find({ EventID: eventId });

    const usersInfo = [];
    // Loop through attendees and find the User for each PlatformUser
    for (const attendee of attendees) {
      const platformUser = await PlatformUser.findById(attendee.UserID);
      if (platformUser) {
        const user = await userScheme.findById(platformUser.ID);
        if (user) {
          usersInfo.push({
            id: platformUser.ID,
            name: user.Name,
            imagePath: platformUser.ImagePath,
            userName:user.Username
          });
        }
      }
    }

    res.status(200).json(usersInfo);
  } catch (error) {
    console.error("Error fetching attendees:", error);
    res.status(500).json({ message: "Server error" });
  }
};
