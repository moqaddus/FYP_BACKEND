import express from 'express';
import {
  createMedia,
  updateMedia,
  getAllMedia,
  deleteMedia,
  getMediaById, // Added the new function
} from '../controller/mediaController.js';

const router = express.Router();

// Create Media
router.post('/create', createMedia);

// Update Media
router.patch('/update/:id', updateMedia);

// Get All Media
router.get('/getAll', getAllMedia);

// Get Media by ID
router.get('/getById/:id', getMediaById);

// Delete Media
router.delete('/delete/:id', deleteMedia);

export default router;
