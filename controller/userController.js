import PlatfromUser from '../models/platformUser.js'
import bcrypt from 'bcryptjs';
import InterestSchema from '../models/interest.js'
import userSchema from '../models/user.js'
import {cloudinary} from "../utils/cloudinary.js";
import Interests from '../models/interest.js';
import Organization from '../models/organization.js';
import Event from '../models/event.js';
import User from '../models/user.js'
import Attendee from '../models/attendee.js';

let interestIds;


export const getOrganizationForUser = async (req, res, next) => {
  try {
    let foundUser;
    const { orgId } = req.params;
    //const orgObjectId = mongoose.Types.ObjectId(orgId);
    // console.log("In hererererer");

    foundUser = await userSchema.findOne({_id:orgId});
    console.log(foundUser)
    if (!foundUser) {
      console.log('User not found');
      return res.status(404).json({ message: 'User not found' });
      
    }

    const foundOrg = await Organization.findOne({  ID:orgId});
    // console.log(foundOrg);
    if (!foundOrg) {
      return res.status(404).json({ message: 'Organization not found' });
    }

    const newOrg = {
      _id: foundUser._id,
      Name: foundUser.Name,
      Username: foundUser.Username,
      Email: foundUser.Email,
      Description: foundOrg.Description,
      ImagePath: foundOrg.ImagePath
    };

    res.status(200).json({ organization: newOrg });
    // console.log(newOrg)
  } catch (error) {
    console.error("Error in getOrganization:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}

// no use
export const addNewUser=async(req,res,next)=>{
  try {
    const {id:ID}=req.user;
  //let Interests=[]
  const {Bio,Interests}=req.body;
  if(Interests)
  {
    interestIds = await Promise.all(Interests.map(async (interestName) => {
      // Try to find the interest by name
      const interest = await InterestSchema.findOne({ Name: interestName });

      // If found, return the ID; otherwise, you might want to handle this case
      return interest ? interest._id : null;
    }));
  }

  const User=new PlatfromUser({ID,Interests:interestIds,Bio})
  User.save();
  res.status(201).json({user:User})
}
   catch (error) {
    console.log(error);
    
  }
}
// Ali added it may 4
export const updateUser = async (req, res, next) => {
  const { id: _id } = req.user;
  const foundUser = await userSchema.findOne({ _id });

  if (foundUser) {
      const { Name, Bio } = req.body;

      if (Name) {
          await userSchema.updateOne({ _id: _id }, { Name });
      }

      if (Bio) {
          await PlatfromUser.updateOne({ ID: _id }, { Bio });
      }

      return res.status(201).json({ message: 'User updated successfully' });
  } else {
      return res.status(404).json({ message: 'User not found' });
  }
};


//Will get id of platform user
export const getOneUser=async(req,res,next)=>{

  const {id:_id}=req.user;
  const foundUser=await userSchema.findOne({_id});
  if(foundUser)
  {
    const foundOne=await PlatfromUser.findOne({ID:_id});
    //const newUser=({...foundOne,Name:foundUser.Name,Username:foundUser.Username,Email:foundUser.Email})
    // i have changed may 4 removed interest from here next line
    const newUser=({Name:foundUser.Name,Username:foundUser.Username,Email:foundUser.Email,Bio:foundOne.Bio,ImagePath:foundOne.ImagePath})
    res.status(200).json({user:newUser})

  }
  else{
    return res.status(200).json({message:'User Not found'})
  }
}

//we will get platForm user id to be deleted in params
export const deleteUser=async(req,res,next)=>{

  try {
    const {id:_id}=req.user;
    const foundUser=await userSchema.findOne({_id});
    if(!foundUser)
    {
       return res.status(200).json({message:'User Not found'})
    }
  else
  {
    try {
      await PlatfromUser.deleteOne({ID:_id})
      try {
        await userSchema.deleteOne({_id})
        return res.status(201).json({message:'Successfully Deleted'})
      } catch (error) {
        return res.status(409).json({message:'Unable to delete Corresponding User obj'})
      }
    } catch (error) {
      return res.status(409).json({message:'Unable to delete Platform User'})
    }
    
  }
  } catch (error) {
    
  }
}

export const uploadProfileImg = async (req, res) => {
  try {
    console.log(req.file)
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }
    const { id:ID } = req.user;
    const user =await userSchema.findById(ID);
    if (!user || user.type !== 'PlatformUser') {
      return res.status(403).json({ message: 'Unauthorized: User is not an Platform User' });
    }
    const existingUser = await PlatfromUser.findOne({ ID: user._id });
    if (existingUser.ImagePath) {
      const publicId = extractPublicId(existingUser.ImagePath);
      const foundImg = await cloudinary.api.resource(publicId);
      await cloudinary.uploader.destroy(foundImg.public_id);
    }

    cloudinary.uploader.upload(req.file.path, async (err, result)=> {
      if (err) {
        // console.log(err);
        return res.status(500).json({
          success: false,
          message:err.message
          // message: "Error uploading image"
        });
      }
      
      existingUser.ImagePath=result.url;
      
      await existingUser.save();
      
      res.status(200).json({
        success: true,
        message: "Image uploaded successfully",
        data: result
      });
    });
  } catch (error) {
    console.error(error);
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

// export const getEventsByUserInterest = async (req, res) => {
//   try {
//     const userID = req.user.id; // Assuming the user ID is stored in the req.user object after authentication
//     const userType = req.user.type; // Extract the user type from the JWT token

//     console.log(userID)
//     console.log(userType)
//     // Find the platform user with the given user ID
//     const platformUser = await PlatfromUser.findOne({ ID: userID }).populate('Interests');

//     if (!platformUser) {
//       return res.status(404).json({ message: 'Platform User not found' });
//     }

//     // Extract platform user interests
//     const userInterests = platformUser.Interests.map(interest => interest._id);

//     const events = await Event.aggregate([
//       {
//         $match: { EventTag: { $in: userInterests } }
//       },
//       {
//         $lookup: {
//           from: 'organizations', // Assuming the organization collection name is 'organizations'
//           localField: 'Organization',
//           foreignField: '_id',
//           as: 'organization'
//         }
//       },
//       {
//         $lookup: {
//           from: 'users', // Assuming the user collection name is 'users'
//           localField: 'organization.ID', // Assuming the user ID is stored in the 'ID' field of the organization
//           foreignField: '_id',
//           as: 'user'
//         }
//       },
//       {
//         $addFields: {
//           'organization.Username': { $arrayElemAt: ['$user.Username', 0] }
          
//         }
//       },
//       {
//         $project: {
//           _id: 1,
//           Name: 1,
//           'organization.Name': 1, // Assuming the organization has a 'Name' field
//           'organization.Username': 1 // Assuming the user has a 'Username' field
//         }
//       }
//     ]);

//     res.status(200).json({ type: userType, events });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// };


export const getEventsByUserInterest = async (req, res) => {
  try {
    const userID = req.user.id; // Assuming the user ID is stored in the req.user object after authentication
    const userType = req.user.type; // Extract the user type from the JWT token

    console.log(userID);
    console.log(userType);
    // Find the platform user with the given user ID
    const platformUser = await PlatfromUser.findOne({ ID: userID }).populate(
      "Interests"
    );

    if (!platformUser) {
      return res.status(404).json({ message: "Platform User not found" });
    }

    // Extract platform user interests
    const userInterests = platformUser.Interests.map(
      (interest) => interest._id
    );

    const events = await Event.aggregate([
      {
        $match: { EventTag: { $in: userInterests } },
      },
      {
        $lookup: {
          from: "organizations", // Assuming the organization collection name is 'organizations'
          localField: "Organization",
          foreignField: "_id",
          as: "organization",
        },
      },
      {
        $unwind: "$organization", // Unwind the organization array
      },
      {
        $project: {
          _id: 1,
          Name: 1,
          "organization.Username": 1, // Assuming the organization has a 'Username' field
          "organization.ImagePath": 1, // Adding ImagePath to the projection
        },
      },
    ]);

    // Format the response according to the specified format
    const formattedEvents = events.map((event) => ({
      _id: event._id,
      Name: event.Name,
      organization: [{ Username: event.organization.Username }],
      imagePath: event.organization.ImagePath,
    }));

    res.status(200).json({ type: userType, events: formattedEvents });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};




export const updateUserOrganizations = async (req, res, next) => {
  try {
    const { id: userId } = req.user; // Get user ID from token
    const { orgId } = req.params; // Get organization ID from request parameters

    // Find the user in userSchema
    const foundUser = await userSchema.findOne({ _id: userId });
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Find the corresponding user in platformUser
    const foundPlatformUser = await PlatfromUser.findOne({ ID: userId });
    if (!foundPlatformUser) {
      return res.status(404).json({ message: "PlatformUser not found" });
    }

    // Append organization ID to OrganizationsFollowed array
    foundPlatformUser.OrganizationsFollowed.push(orgId);

    // Save the updated platformUser
    await foundPlatformUser.save();

    // Respond with the updated user
    res.status(200).json({ message: "Organization added successfully", user: foundPlatformUser });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};





// export const getUserOrganizationsEvents = async (req, res, next) => {
//   try {
//     const { id: userId, type: userType } = req.user; // Get user ID and type from token

//     // Find the user in platformUser
//     const user = await PlatfromUser.findOne({ ID: userId });

    
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Retrieve events for each organization followed by the user
//     const events = [];
//     for (const organization of user.OrganizationsFollowed) {
//      // const orgId = organization.ID;
     

//       // Find the organization in the Organization model
//       const org = await Organization.findOne({ID:organization});
//       if (!org) {
//         continue; // Skip if organization not found
//       }

//       // Get the username associated with the organization's ID
//       const orgUser = await userSchema.findById(organization);
      
//       const organizationName = orgUser ? orgUser.Username : "Unknown";

//       // Find events associated with the organization
//       const orgEvents = await Event.find({ Organization:org._id });

//       // Transform events data to match the structure of events returned by getEventsByUserInterest
//       const eventData = orgEvents.map(event => ({
//         _id: event._id,
//         Name: event.Name,
//         organization: [{ Username: organizationName }],
//         imagePath:org.ImagePath
//       }));

//       // Add the organization's events to the response
//       events.push(...eventData);
//     }

//     // Respond with the list of events associated with organizations followed by the user
//     res.status(200).json({ type: userType, events });
//   } catch (error) {
//     next(error); // Pass the error to the error handling middleware
//   }
// };


export const getUserOrganizationsEvents = async (req, res, next) => {
  try {
    const { id: userId, type: userType } = req.user; // Get user ID and type from token

    // Find the user in platformUser
    const user = await PlatfromUser.findOne({ ID: userId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Retrieve events for each organization followed by the user
    const events = [];
    for (const organization of user.OrganizationsFollowed) {
      // const orgId = organization.ID;

      // Find the organization in the Organization model
      const org = await Organization.findOne({ ID: organization });
      if (!org) {
        continue; // Skip if organization not found
      }

      // Get the username associated with the organization's ID
      const orgUser = await userSchema.findById(organization);
      const organizationName = orgUser ? orgUser.Name : "Unknown";

      // Find events associated with the organization
      const orgEvents = await Event.find({ Organization: org._id });

      // Transform events data to match the structure of events returned by getEventsByUserInterest
      const eventData = orgEvents.map((event) => ({
        _id: event._id,
        Name: event.Name,
        organization: [{ Username: organizationName }],
        imagePath: org.ImagePath,
      }));

      // Add the organization's events to the response
      events.push(...eventData);
    }

    console.log(events);
    // Respond with the list of events associated with organizations followed by the user
    res.status(200).json({ type: userType, events });
  } catch (error) {
    next(error); // Pass the error to the error handling middleware
  }
};

export const getUsertype = async (req, res, next) => {
  try {
    // Access the decoded token from the request object
    const userType = req.user.type;

    res.status(200).json({ type: userType });
  } catch (error) {
    next(error);
  }
};

export const followOrganization = async (req, res, next) => {
  try {
    const { orgId,userId} = req.params;
    // Check if the user exists
    const foundUser = await PlatfromUser.findOne({ID:userId});
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the organization exists
    const foundOrganization = await Organization.findOne({ID:orgId});
    if (!foundOrganization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Check if the user is already following the organization
    if (foundUser.OrganizationsFollowed.includes(orgId)) {
      return res.status(400).json({ message: "User already follows this organization" });
    }

    // Add the organization to the user's followed organizations list and vice versa
    foundOrganization.UserFollowers.push(userId);
    await foundOrganization.save();
    foundUser.OrganizationsFollowed.push(orgId);
    await foundUser.save();

    res.status(200).json({ message: "Organization followed successfully" });
  } catch (error) {
    console.error("Error following organization:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const unfollowOrganization = async (req, res, next) => {
  try {
    const { orgId, userId} = req.params;

    // Check if the user exists
    const foundUser = await PlatfromUser.findOne({ID:userId});
    if (!foundUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if the organization exists
    const foundOrganization = await Organization.findOne({ID:orgId});
    if (!foundOrganization) {
      return res.status(404).json({ message: "Organization not found" });
    }

    // Check if the user is already following the organization
    const organizationIndex = foundUser.OrganizationsFollowed.indexOf(orgId);
    if (organizationIndex === -1) {
      return res.status(400).json({ message: "User is not following this organization" });
    }
    
    const userIndex = foundOrganization.UserFollowers.indexOf(userId);
    if (userIndex === -1) {
      return res.status(400).json({ message: "Organization has no such follower" });
    }
    //Remove the organization from the user's followed organizations list
    foundUser.OrganizationsFollowed.splice(organizationIndex, 1);
    await foundUser.save();
    foundOrganization.UserFollowers.splice(userIndex, 1);
    await foundOrganization.save();

    res.status(200).json({ message: "Organization unfollowed successfully" });
  } catch (error) {
    console.error("Error unfollowing organization:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFollowersOfUser = async (req, res) => {
  const userId = req.params.userId;

  try {
    const platformUser = await PlatfromUser.findOne({ ID: userId });

    if (!platformUser) {
      return res.status(404).json({ message: 'Platform user not found' });
    }

    const followedOrganizations = [];

    for (const organizationId of platformUser.OrganizationsFollowed) {
      const organization = await Organization.findOne({ID:organizationId});
      if (organization) {
        const user = await User.findById(organization.ID, 'Name');
        if (user) {
          followedOrganizations.push({ id: organization.ID, name: user.Name ,imagePath:organization.ImagePath});
        }
      }
    }
    res.json({ organizations: followedOrganizations });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


export const getEventsOfAttendees = async (req, res,next) => {
  const attendeeId = req.params.attendeeId;
  console.log(attendeeId);

  try {
    const currentDate = new Date().toISOString().split('T')[0]; // Get the current date in YYYY-MM-DD format
    const user=await PlatfromUser.findOne({ID:attendeeId});
    if(!user)
      {
        return res.status(404).json({ message: 'No user found.' });
      }
    // Find attendees with unchecked-in events
    const attendeeRecords = await Attendee.find({
      UserID: user._id,
      CheckedIn: false,
    }).populate({
      path: 'EventID',
      select: 'Name Organization EventDate',
      match: { EventDate: { $lt: currentDate } }, // Only fetch events where the EventDate is less than current date
      populate: {
        path: 'Organization',
        select: 'ImagePath',
      },
    });

    if (!attendeeRecords || attendeeRecords.length === 0) {
      return res.status(404).json({ message: 'No events found for review' });
    }
    // Filter and map the results
    const events = attendeeRecords.map(record => ({
      eventId: record.EventID._id,
      eventName: record.EventID.Name,
      attendeeId: record._id,
      organizationImagePath: record.EventID.Organization ? record.EventID.Organization.ImagePath : null,
    }));


    res.json({ events });
  } catch (error) {
    console.error('Error fetching events for review:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};