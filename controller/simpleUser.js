import User from '../models/user.js';

export const addUser = async (req, res) => {
  try {
    const { Email, Username, Password, type } = req.body;

    // Check if the email or username already exists in the database
    const existingUser = await User.findOne({ $or: [{ Email }, { Username }] });

    if (existingUser) {
      return res.status(400).json({ error: 'Email or Username already exists' });
    }

    const newUser = new User({
      Email,
      Username,
      Password,
      type
    });

    const savedUser = await newUser.save();

    res.status(201).json(savedUser);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
