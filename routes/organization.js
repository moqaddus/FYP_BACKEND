import express from "express";
import {
  addOrganization,
  updateOrganization,
  getOrganization,
  uploadProfileImg,
  getAllOrganizations,
  getOrganizationEvents,
  getOneUserforOrg,
  getUserforOrganization,
  checkUserFollowOrganization,
  getFollowersOfOrganization
} from "../controller/orgController.js";
import { addUser } from "../controller/simpleUser.js";
import { authenticateOrgAdmin } from "../middleware/verifyOrgtokens.js";
import { authenticatePlatfromUser } from "../middleware/verifyPlatformUser.js";
import { upload } from "../middleware/multer.js";

const router = express.Router();

router.post("/Register", authenticateOrgAdmin, addOrganization); //all type of user register
router.patch("/update/org", authenticateOrgAdmin, updateOrganization); // aLI CHANGED IT MAY 4
//router.patch('/Update/:id',authenticateOrgAdmin,updateOrganization)
router.get("/profile/org", authenticateOrgAdmin, getOrganization);
router.post("/simpleUser", addUser);
router.post(
  "/uploadImg",
  authenticateOrgAdmin,
  upload.single("image"),
  uploadProfileImg
);
//get particluar organization events
router.get("/getEvents", authenticateOrgAdmin, getOrganizationEvents);
router.get("/getAllOrgs", authenticatePlatfromUser, getAllOrganizations);
//router for getting One User for Organization
router.get("/getOneUser/:userId", authenticateOrgAdmin, getOneUserforOrg);
// to get user for organization
router.get('/profile/user/:userId',authenticateOrgAdmin,getUserforOrganization);
// to check organization is followed by user or not
router.get('/isUserFollowOrg/:orgId/:userId',checkUserFollowOrganization);
// organization followers get
router.get('/followersOfOrganization/:orgId',authenticateOrgAdmin,getFollowersOfOrganization)

export default router;
