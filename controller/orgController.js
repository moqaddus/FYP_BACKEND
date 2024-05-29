import orgSchema from "../models/organization.js";
import Event from "../models/event.js";
import userSchema from "../models/user.js";
import { cloudinary } from "../utils/cloudinary.js";
import { response } from "express";
import PlatformUser from "../models/platformUser.js";

//may 15


export const getUserforOrganization = async (req, res, next) => {
  try {
    let foundUser;
    const { userId } = req.params;
    //const orgObjectId = mongoose.Types.ObjectId(orgId);
    // console.log("In hererererer");

    foundUser = await userSchema.findOne({_id:userId});
    console.log(foundUser)
    if (!foundUser) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
      
    }

    const foundPlatformUser = await PlatformUser.findOne({  ID:userId});
    console.log(foundPlatformUser);
    if (!foundPlatformUser) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const newUser = {
      _id: foundUser._id,
      Name: foundUser.Name,
      Username: foundUser.Username,
      Email: foundUser.Email,
      Bio: foundPlatformUser.Bio,
      ImagePath: foundPlatformUser.ImagePath
    };

    res.status(200).json({ user: newUser});
    console.log(newUser)
  } catch (error) {
    console.error("Error in getUser:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

export const getAllOrganizations = async (req, res) => {
  try {
    // Fetch all organizations
    const organizations = await orgSchema.find();

    // Fetch user details for each organization
    const organizationsWithUsers = await Promise.all(
      organizations.map(async (org) => {
        const user = await userSchema.findById({ _id: org.ID });
        return {
          _id: user._id,
          Name: user ? user.Username : "Unknown", // Use Username if user exists, otherwise default to 'Unknown'
          Email: user ? user.Email : "", // Use Email if user exists, otherwise empty string
          ImagePath: org.ImagePath, // Include organization image path
          // Include other organization fields here if needed
        };
      })
    );

    res.json(organizationsWithUsers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


export const uploadProfileImg = async (req, res) => {
  try {
    console.log("Incoming request...");
    console.log("Request file:", req.file);
    
    if (!req.file) {
      console.log("No file uploaded");
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    
    const { id: ID } = req.user;
    console.log("User ID:", ID);

    const user = await userSchema.findById(ID);
    console.log("User:", user);

    if (!user || user.type !== 'OrgAdmin') {
      console.log("Unauthorized access: User is not an OrgAdmin");
      return res.status(403).json({ message: 'Unauthorized: User is not an OrgAdmin' });
    }

    const existingUser = await orgSchema.findOne({ ID: user._id });
    console.log("Existing User:", existingUser);

    if (existingUser.ImagePath) {
      const publicId = extractPublicId(existingUser.ImagePath);
      console.log("Public ID:", publicId);
      
      const foundImg = await cloudinary.api.resource(publicId);
      console.log("Found Image:", foundImg);
      
      await cloudinary.uploader.destroy(foundImg.public_id);
      console.log("Previous image deleted");
    }

    cloudinary.uploader.upload(req.file.path, async (err, result) => {
      if (err) {
        console.error("Error uploading image:", err);
        return res.status(500).json({
          success: false,
          message: err.message
        });
      }

      console.log("Image uploaded successfully:", result.url);
      existingUser.ImagePath = result.url;
      console.log("Updated user:", existingUser);

      await existingUser.save();
      console.log("User saved with updated image path");

      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: result
      });
    });
  } catch (error) {
    console.error("Internal server error:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

const extractPublicId = (imageUrl) => {
  const parts = imageUrl.split('/');
  const fileName = parts.pop();
  const publicId = fileName.split('.')[0];
 
  return publicId;
};



export const addOrganization = async (req, res) => {
  try {
    //const { ID, Status, Description } = req.body; // Assuming events contain names of events

    const { Status, Description } = req.body;

    //Now i am taking this ID from token in which i have stored id of user
    const { id: ID } = req.user;

    // Find the user by ID provided in the request
    const user = await userSchema.findById(ID);

    if (!user || user.type !== "OrgAdmin") {
      return res
        .status(403)
        .json({ message: "Unauthorized: User is not an OrgAdmin" });
    }
    const existingOrganization = await orgSchema.findOne({ ID: user._id });

    if (existingOrganization) {
      return res
        .status(400)
        .json({ message: "User has already created an organization" });
    }
    // Array to store event IDs associated with the organization
    let eventIds = [];

    // Create a new organization object
    const organization = new orgSchema({
      ID: ID, // Reference to the User document
      Status: Status,
      Description: Description,
    });

    // Save the organization to the database
    await organization.save();

    res.status(201).json({ organization });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



// ali added it may 4

export const updateOrganization = async (req, res, next) => {
  const { id: _id } = req.user;
  const foundUser = await userSchema.findOne({ _id });

  if (foundUser) {
    const { Name, Description } = req.body;

    if (Name) {
      await userSchema.updateOne({ _id: _id }, { Name });
    }

    if (Description) {
      await orgSchema.updateOne({ ID: _id }, { Description });
    }

    return res
      .status(201)
      .json({ message: "Organiztion updated successfully" });
  } else {
    return res.status(404).json({ message: "Organizartion not found" });
  }
};


// may 4
export const getOrganization = async (req, res, next) => {
  try {
    const { id: _id } = req.user;

    // Assuming userSchema is for users and orgSchema is for organizations
    const foundUser = await userSchema.findOne({ _id });
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const foundOrg = await orgSchema.findOne({ ID: _id });
    if (!foundOrg) {
      return res.status(404).json({ message: "Organization not found" });
    }

    const newOrg = {
      _id: foundUser._id,
      Name: foundUser.Name,
      Username: foundUser.Username,
      Email: foundUser.Email,
      Description: foundOrg.Description,
      ImagePath: foundOrg.ImagePath,
    };

    res.status(200).json({ organization: newOrg });
    console.log(newOrg);
  } catch (error) {
    console.error("Error in getOrganization:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getOrganizationEvents = async (req, res) => {
  try {
    const userID = req.user.id; // Assuming you have middleware to extract userID from token and attach it to req.user
    const userType = req.user.type; // Extract the user type from the JWT token

    // Find organization ID using userID
    const organization = await orgSchema.findOne({ ID: userID });
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Find all events associated with the organization
    const events = await Event.find({ Organization: organization._id });

    // Transform events data to match the structure of events returned by getEventsByUserInterest
    const eventData = events.map((event) => ({
      _id: event._id,
      Name: event.Name,
      organization: [{ Username: req.user.username }],
      imagePath:organization.ImagePath // Assuming req.user.username contains the organization username
    }));

    res.json({ type: userType, events: eventData });
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//get User for Organization

export const getOneUserforOrg = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const foundOne = await PlatformUser.findById(userId);

    if (!foundOne) {
      return res.status(404).json({ message: "PlatformUser not found" });
    }

    const foundUser = await userSchema.findOne({ _id: foundOne.ID });

    if (foundUser) {
      const newUser = {
        Name: foundUser.Name,
        Username: foundUser.Username,
        Email: foundUser.Email,
        Bio: foundOne.Bio,
        ImagePath: foundOne.ImagePath,
      };
      res.status(200).json({ user: newUser });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkUserFollowOrganization = async (req, res, next) => {
  try {
    const {orgId,userId } = req.params;
    console.log(orgId+'   '+userId);

    // Check if the user exists
    const foundUser = await PlatformUser.findOne({ID:userId});
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the organization exists
    const foundOrganization = await orgSchema.findOne({ID:orgId});
    if (!foundOrganization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Check if the user is following the organization
    const isFollowing = foundUser.OrganizationsFollowed.includes(orgId);
    
    res.status(200).json({ isFollowing });
  } catch (error) {
    console.error("Error checking user's organization follow:", error);
    res.status(500).json({ message: "Server error" });
  }
};