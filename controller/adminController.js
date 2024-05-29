import adminSchema from '../models/platformAdmin.js';
import contactUs from '../models/contactUs.js'
import Interest from '../models/interest.js';

export const getAllComplaints = async (req, res,next) => {
  try {
    const suggestions = await contactUs.find();
    res.status(200).json(suggestions); // Setting response status to 200 for success
  } catch (error) {
    res.status(500).json({ message: error.message }); // Setting response status to 500 for server error
  }
};

export const deleteSuggestion = async (req, res,next) => {
  try {
    const { id } = req.params; // Assuming you pass the ID of the suggestion in the URL params

    // Check if the suggestion exists
    const existingSuggestion = await contactUs.findById(id);
    if (!existingSuggestion) {
      return res.status(404).json({ message: 'Suggestion not found' });
    }

    // Delete the suggestion
    await contactUs.findByIdAndDelete(id);

    res.status(200).json({ message: 'Suggestion deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message }); // Setting response status to 500 for server error
  }
};

export const addInterest = async (req, res,next) => {
  try {
    // Get the interest from the request body
    let { interest } = req.body;
    console.log(interest);
    // Check if interest is provided
    if (!interest) {
      return res.status(400).json({ message: "Interest is required" });
    }

    // Transform the interest string as per the requirements
    interest = interest
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join('');

    // Check if the interest already exists in the database
    const existingInterest = await Interest.findOne({ Name: interest });
    if (existingInterest) {
      return res.status(400).json({ message: "Interest already exists" });
    }

    // Create a new interest object
    const newInterest = new Interest({ Name: interest });

    // Save the new interest to the database
    await newInterest.save();

    // Respond with the newly created interest
    return res.status(201).json({ interest: newInterest });
  } catch (error) {
    // Handle any errors that occur
    return res.status(500).json({ message: error.message });
  }
};
