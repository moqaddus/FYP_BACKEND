import  express  from "express";
import { addComplaint } from "../controller/ContactUs.js";
const router = express.Router();


router.post('/complaints',addComplaint)

export default router;