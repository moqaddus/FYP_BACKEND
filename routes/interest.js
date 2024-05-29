import express from 'express';
import {
  getAllInterests,   //works
  updateUserInterests,
  addUserInterest,  //works
  deleteUserInterest,
  getAllUserInterests,
  getUserInterestById,
  getAllInterestsExceptUser, //works
  getUserInterestNames,
  getAllinterest //works
} from '../controller/interestsController.js';

const router = express.Router();

// Update user interests
router.patch('/update', updateUserInterests);

// Add user interest
router.post('/add/:userID', addUserInterest );

// Delete user interest
router.delete('/delete', deleteUserInterest);

// Get all user interests
router.get('/getAll/:userID', getAllUserInterests);
router.get('/getAll',getAllInterests); ////may 3
router.get('/getOneUser/:userId',getUserInterestNames);  // may 3
router.get('/notUserInterest/:userID', getAllInterestsExceptUser); // i have made may 3

// Get user interest by ID
router.get('/get/:userID/:interestID', getUserInterestById);

//get all Interests my endpoint
//Get all Interets from Interests Table
router.get('/get',getAllinterest);

export default router;
