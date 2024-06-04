import User from '../models/user.js';
import Interest from '../models/interest.js';
import PlatformUser from '../models/platformUser.js';


// i have added 
export const getAllInterests=async (req,res)=>{
  try{
    const allInterests = await Interest.find();
    return res.status(200).json({interest:allInterests})
  }
  catch(error)
  {
    return res.status(500).json({message:error.message});
  }
};

export const getAllUserInterests = async (req, res) => {
  try {
    const { userID } = req.params;

    if (!userID) {
      return res.status(400).json({ message: 'UserID is required for fetching user interests' });
    }

    // Check if the user exists
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ interests: user.Interests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
 // i have made may 3
 export const getAllInterestsExceptUser = async (req, res) => {
  try {
    const { userID } = req.params;

    if (!userID) {
      return res.status(400).json({ message: 'UserID is required for fetching user interests' });
    }

    // Check if the user exists
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get platform user data including interests
    const platformUser = await PlatformUser.findOne({ ID: userID }).populate('Interests');

    // Get all interests from the database
    const allInterests = await Interest.find();

    // Extract user's interests from platform user data
    // const userInterests = platformUser ? platformUser.Interests.map(interest => interest._id) : [];
    const userInterests = platformUser?.Interests?.map(interest => interest._id) || [];

    // Filter out user's interests from all interests
    // const otherInterests = allInterests.filter(interest => !userInterests.includes(interest._id));
    // Filter out user's interests from all interests
   const otherInterests = allInterests.filter(interest => !userInterests.some(userInterest => userInterest.equals(interest._id)));

    res.status(200).json({ interests: otherInterests });
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};


export const updateUserInterests = async (req, res) => {
  try {
    const {
         userID,
         interests,
         newInterests } = req.body;

    if (!userID) {
      return res.status(400).json({ message: 'UserID is required for updating user interests' });
    }

    // Check if the user exists
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Assuming interests are valid since they are hardcoded
    if (interests && Array.isArray(interests)) {
      user.Interests = interests;
    }

    // If new interests are provided, add them
    if (newInterests && Array.isArray(newInterests)) {
      // Filter out new interests that the user already has
      const uniqueNewInterests = newInterests.filter(newInterest => !user.Interests.includes(newInterest));

      // Add the unique new interests to the user's interests
      user.Interests = [...user.Interests, ...uniqueNewInterests];

      // Add the user to the new interests' users
      for (const newInterestID of uniqueNewInterests) {
        const newInterest = await Interest.findById(newInterestID);
        if (newInterest) {
          newInterest.Users.push(userID);
          await newInterest.save();
        }
      }
    }

    await user.save();

    res.status(200).json({ message: 'User interests updated successfully', interests: user.Interests });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// i made it may 4 
// export const getUserInterestNames = async (req, res) => {
//   try {
//     const { userId } = req.params;
//     if (!userId) {
//       return res.status(400).json({ message: 'userId is required' });
//     }

//     // Find the user by ID
//     const userCommon=await User.findById(userId);
//     if(!userCommon)
//     {
//       return res.status(404).json({ message: `User with username ${username} not found` });
//     }
//     const user = await PlatformUser.findOne({ ID:userCommon._id });

//     if (!user) {
//       return res.status(404).json({ message: 'User not found' });
//     }

//     // Retrieve interests for the user
//     const userInterests = await Interest.find({ _id: { $in: user.Interests } });

//     // Extract interest names
//     const interestNames = userInterests.map(interest => interest.Name);
//     res.status(200).json({ interestNames });
//   } catch (error) {
//     res.status(500).json({ error: error.message });
    
//   }
// };

export const getUserInterestNames = async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: 'userId is required' });
    }

    // Find the user by ID
    const userCommon = await User.findById(userId);
    if (!userCommon) {
      return res.status(404).json({ message: `User with userId ${userId} not found` });
    }
    
    const user = await PlatformUser.findOne({ ID: userCommon._id });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Retrieve interests for the user
    const userInterests = await Interest.find({ _id: { $in: user.Interests } });

    // Extract interest names and _id
    const interestDetails = userInterests.map(interest => ({
      _id: interest._id,
      Name: interest.Name
    }));
    
    res.status(200).json({ interests: interestDetails });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


//   i made it may 3
export const addUserInterest = async (req, res) => {
  try {
    const { userID ,interestID  } = req.body;
    
    if (!userID || !interestID) {
      return res.status(400).json({ message: 'userID and interestID are required' });
    }

    const user = await PlatformUser.findOne({ ID: userID });
     // Check if the interest exists
     const interest = await Interest.findById(interestID);

    if (!user || !interest) {
      return res.status(404).json({ message: 'User or Interest not found' });
    }
    
    user.Interests = user.Interests || [];
    if (user.Interests.includes(interestID)) {
      return res.status(400).json({ message: 'User already has this interest' });
    }

    // Add the interest to the user's interests
    user.Interests.push(interestID);
    await user.save();

    res.status(200).json({ message: 'Interest added successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
export const deleteUserInterest = async (req, res) => {
  try {
    const { userId, interestId } = req.params;
    if (!userId || !interestId) {
      return res.status(400).json({ message: 'userID and interestID are required' });
    }

    const user = await PlatformUser.findOne({ ID: userId });
    // Check if the user and interest exist
    const interest = await Interest.findById(interestId);

    if (!user || !interest) {
      return res.status(404).json({ message: 'User or Interest not found' });
    }
    

    const interestIndex = user.Interests.indexOf(interestId);
    if (interestIndex === -1) {
      return res.status(400).json({ message: "User has no such interest" });
    }
    user.Interests.splice(interestIndex, 1);
    await user.save();

    res.status(200).json({ message: 'Interest removed successfully', user });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};



export const getUserInterestById = async (req, res) => {
  try {
    const { userID, interestID } = req.params;

    if (!userID || !interestID) {
      return res.status(400).json({ message: 'UserID and InterestID are required for fetching user interest by ID' });
    }

    // Check if the user exists
    const user = await User.findById(userID);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if the user has the specified interest
    if (!user.Interests.includes(interestID)) {
      return res.status(400).json({ message: 'User does not have this interest' });
    }

    // Fetch the interest details
    const interest = await Interest.findById(interestID);

    if (!interest) {
      return res.status(404).json({ message: 'Interest not found' });
    }

    res.status(200).json({ interest });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


export const getAllinterest = async (req, res) => {
  try {
    const interests = await Interest.find();
    res.status(200).json(interests);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};