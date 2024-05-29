import  express  from "express";
import {register,login,getAllUsers} from '../controller/authController.js';
//import { authenticateUser } from "../middleware/verifytoken.js";
import { authenticatePlatfromUser } from "../middleware/verifyPlatformUser.js";
//import {addNewOrg} from '../controller/orgController.js';
import { authenticateUser } from "../middleware/commonUser.js";
import { updateUser,deleteUser,getOneUser,uploadProfileImg ,
    getEventsByUserInterest,getUserOrganizationsEvents,
    updateUserOrganizations,getUsertype, getOrganizationForUser,
    followOrganization,unfollowOrganization,getFollowersOfUser} from "../controller/userController.js";
import {upload} from "../middleware/multer.js";

import {v4 as uuidv4 } from 'uuid';
uuidv4();

const router=express.Router();

///THESE ARE BEING USED FOR PLATFORM_USER.
router.post('/register',register)//all type of user register.
router.post('/login',login)//all type of user login.
router.get('/users',getAllUsers)
router.patch('/update/user',authenticatePlatfromUser,updateUser)//update platform user
router.delete('/delete/user',authenticatePlatfromUser,deleteUser)//delete platform user 
router.get('/profile/user',authenticatePlatfromUser,getOneUser) //get one platform user
//router.post('/register/user',authenticatePlatfromUser,addNewUser)//register Platform user //NOT USED
router.post('/uploadImg',authenticatePlatfromUser,upload.single('image'),uploadProfileImg);
//for getting Events for User based on his iterests
router.get('/getAllEvents',authenticatePlatfromUser,getEventsByUserInterest)
//for follow organization
router.post('/follow/Organization/:orgId',authenticatePlatfromUser,updateUserOrganizations);
//for getting events and names of organizations which user in following
router.get('/getEvents/OrganizationFollowed',authenticatePlatfromUser,getUserOrganizationsEvents)
//for getting type of any user
router.get('/getType',authenticateUser,getUsertype);

router.get('/profile/org/:orgId',authenticatePlatfromUser,getOrganizationForUser);
// to follow organization
router.post('/followOrg/:orgId/:userId',authenticatePlatfromUser,followOrganization);
// to unfollow organization
router.delete('/unFollowOrg/:orgId/:userId',authenticatePlatfromUser,unfollowOrganization);
// get user follower
router.get('/followersOfUser/:userId',authenticatePlatfromUser,getFollowersOfUser)
export default router;


