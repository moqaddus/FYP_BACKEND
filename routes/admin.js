import express from 'express';
import {
 getAllComplaints, deleteSuggestion, addInterest
} from '../controller/adminController.js';
import { authenticatePlatfromAdmin} from "../middleware/verifyPlatformAdmin.js";

const router = express.Router();

router.get('/getSuggestions',getAllComplaints);
router.delete('/deleteSuggestion/:id',authenticatePlatfromAdmin,deleteSuggestion);
router.post('/addInterest',addInterest);
export default router;
