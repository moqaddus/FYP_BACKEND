// import  express  from "express";
// import { addEvent,updateEvent,getAllOrganizationEvents,getSingleEvent,deleteOrganizationEvent ,uploadMediaImgs} from "../controller/eventController.js";
// import { authenticateOrgAdmin } from "../middleware/verifyOrgtokens.js";
// import {upload} from "../middleware/multer.js";

// const router=express.Router();

// router.post('/Register',authenticateOrgAdmin,addEvent)//all type of user register
// router.patch('/Update/:id',authenticateOrgAdmin,updateEvent)
// router.get('/GetAllOrganizationEvents',authenticateOrgAdmin,getAllOrganizationEvents)
// router.get('/GetSingleEvent/:eventId',authenticateOrgAdmin,getSingleEvent)
// router.delete('/Delete/:eventId',authenticateOrgAdmin,deleteOrganizationEvent)
// router.post('/uploadMedia', upload.array('images', 5), uploadMediaImgs);

// export default router;

import express from "express";
import {
  addEvent,
  updateEvent,
  getAllOrganizationEvents,
  getSingleEvent,
  deleteOrganizationEvent,
  uploadMediaImgs,
  getImage,
} from "../controller/eventController.js";
import { getAllUsersOfEvent } from "../controller/eventController.js";

import { authenticateOrgAdmin } from "../middleware/verifyOrgtokens.js";
import { authenticateUser } from "../middleware/commonUser.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.post("/Register", authenticateOrgAdmin, addEvent); //all type of user register
router.patch("/Update/:eventId", authenticateOrgAdmin, updateEvent);
router.get(
  "/GetAllOrganizationEvents",
  authenticateOrgAdmin,
  getAllOrganizationEvents
);
//router.get('/GetSingleEvent/:eventId',authenticateOrgAdmin,getSingleEvent)
router.get("/GetSingleEvent/:eventId", authenticateUser, getSingleEvent);

router.delete(
  "/Delete/:eventId",
  authenticateOrgAdmin,
  deleteOrganizationEvent
);
router.post(
  "/uploadMedia/:eventId",
  upload.array("images", 5),
  uploadMediaImgs
);
//get Image
router.get("/getImage/:eventId", getImage);

router.get("/get/:eventId", getAllUsersOfEvent);

export default router;
