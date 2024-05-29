import express from 'express';
import { createMessage ,getChatForUser,getMessagesForChat,getAllChatsForUser} from '../controller/messageController.js';

const router = express.Router();

// Route to create a new message
router.post('/create', createMessage);
router.get('/chat/:chatId', getMessagesForChat);
router.get('/getChat/:tokenId/:user2',getChatForUser);
router.get('/getAllChats/:tokenId',getAllChatsForUser)

// Export the router
export default router;
