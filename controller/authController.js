import userSchema from "../models/user.js";
import OrgSchema from "../models/organization.js";
import PlatformAdmin from "../models/platformAdmin.js";
import PlatfromUser from "../models/platformUser.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
//const bcrypt=require('bcryptjs');
import { v4 as uuidv4 } from "uuid";
uuidv4();

export const register = async (req, res, next) => {
  try {
    const { Name, Username, Email, Password, type } = req.body;

    // Check if email is already registered
    const emailInUse = await userSchema.exists({ Email });
    if (emailInUse) {
      return res
        .status(401)
        .json({ message: "Already registered with this email" });
    }

    // Check if username is already in use
    const usernameInUse = await userSchema.exists({ Username });
    if (usernameInUse) {
      return res.status(401).json({ message: "Username not available" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(Password, 10);

    // Create user
    const user = new userSchema({
      ID: uuidv4(),
      Name: Name,
      Username: Username,
      Email: Email,
      Password: hashedPassword,
      type: type,
    });
    await user.save();
    // Create user specific schema based on type
    if (type === "OrgAdmin") {
      const User = new OrgSchema({
        ID: user._id,
        Description:
          `🎉 Welcome ! 🎉   We curate unforgettable` +
          `experiences that leave lasting impressions. With a passion for creativity and a dedication to excellence, ` +
          `we craft events that are as unique as they are memorable.`,
      });
      await User.save();
    } else if (type === "PlatformAdmin") {
      const User = new PlatformAdmin({ ID: user._id });
      await User.save();
    } else if (type === "PlatformUser") {
      // Example path
      const User = new PlatfromUser({
        ID: user._id,
        Bio:
          "👋 Hello, World! I'm on a mission to explore, experience, and" +
          "embrace the magic of life's adventures – one event at a time! ",
      });
      await User.save();
    } else {
      return res.status(401).json({ message: "Wrong type" });
    }

    // Generate JWT token
    //changed 8th may
    //const token = jwt.sign({ id: user._id, type: user.type }, 'your_secret_key_here');

    // Send success response
    res.status(201).json({ message: "User Added Successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const login = async (req, res, next) => {
  const { Email, Password } = req.body;
  try {
    const foundUser = await userSchema.findOne({ Email: Email });
    //console.log('password:', password);
    //console.log('foundUser.password:', foundUser.password);
    if (!foundUser) {
      res.status(401).json({ message: "Invalid email" });
    } else {
      const match = await bcrypt.compare(Password, foundUser.Password);
      if (!match) {
        res.status(401).json({ message: "Wrong password" });
      } else {
        //access token for that login
        try {
          //const token=foundUser.createJWT();
          //res.cookie('access_token', token, { httpOnly: true });
          const token = jwt.sign(
            {
              id: foundUser._id,
              type: foundUser.type,
              username: foundUser.Username,
            },
            "your_secret_key_here"
          );
          res
            .status(200)
            .json({
              message: "Welcome ",
              token,
              type: foundUser.type,
              username: foundUser.Username,
            });

          // res.status(200).json({foundUser})
        } catch (error) {
          console.log(error);
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

//NOT USING IT(Wrong).
//Not checked till now
export const getOneUser = async (req, res, next) => {
  let finalFoundUser;
  try {
    const { id: _id } = req.user;
    const foundUser = await userSchema.findOne({ _id });
    if (!foundUser) {
      return res.status(200).json({ message: "User Not found" });
    } else {
      if (foundUser.type == "OrgAdmin") {
        const orgAdmin = await OrgSchema.findOne({ ID: _id });
        const finalFoundUser = {
          ...orgAdmin,
          Name: foundUser.Name,
          Username: foundUser.Username,
          Email: foundUser.Email,
        };
        //finalFoundUser={Username,Email, ...orgAdmin}
        return res.status(200).json({ finalFoundUser });
      } else if (foundUser.type == "PlatformAdmin") {
        const platformAdmin = await PlatformAdmin.findOne({ ID: _id });
        const finalFoundUser = {
          ...platformAdmin,
          Name: foundUser.Name,
          Username: foundUser.Username,
          Email: foundUser.Email,
        };
        return res.status(200).json({ finalFoundUser });
        //finalFoundUser={...foundUser,...platformAdmin}
      } else {
        const platformUser = await PlatfromUser.findOne({ ID: _id });
        //finalFoundUser={...foundUser,...platformUser}
        const finalFoundUser = {
          ...platformUser,
          Name: foundUser.Name,
          Username: foundUser.Username,
          Email: foundUser.Email,
        };
        return res.status(200).json({ finalFoundUser });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(409).json(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  const users = await userSchema.find({});
  return res.status(200).json(users);
};

export const updateCommonUser = async (req, res, next) => {
  try {
    const { id: _id } = req.user;
    const foundUser = await userSchema.findOne({ _id });
    if (foundUser) {
      const { Password, Username } = req.body;
      if (Password) {
        const hashedPassword = await bcrypt.hash(Password, 10);
        req.body.Password = hashedPassword;
      }
      await userSchema.updateOne({ _id }, req.body);

      if (foundUser.type == "OrgAdmin") {
        const foundOrg = await OrgSchema.findOne({ ID: _id });

        await OrgSchema.updateOne({ _id: foundOrg._id }, req.body);
      } else if (foundUser.type == "PlatformUser") {
        const found = await PlatfromUser.findOne({ ID: _id });
        await PlatfromUser.updateOne({ _id: found._id }, req.body);
      }
      return res.status(200).json("User Update Successfully!!");
    } else {
      return res.status(404).json("User to be updated not found");
    }
  } catch (error) {}
};
