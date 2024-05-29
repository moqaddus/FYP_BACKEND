// messageController.js
import Message from '../models/message.js';
import Chat from '../models/chat.js';
import User from '../models/user.js';
import PlatfromUser from '../models/platformUser.js';
import organization from '../models/organization.js';

// // Controller function to create a new message
// export const createMessage = async (req, res) => {
//   try {
//     const {Message: messageText, Sender, Receiver } = req.body;

//     // Validate that Sender and Receiver exist in the User collection
//     const senderUser = await User.findById(Sender);
//     const receiverUser = await User.findById(Receiver);

//     if (!senderUser || !receiverUser) {
//       return res.status(400).json({ error: 'Sender or Receiver not found' });
//     }

//     // Check if a chat already exists between the two users
//     const existingChat = await Chat.findOne({
//       $or: [
//         { $and: [{ User1: Sender }, { User2: Receiver }] },
//         { $and: [{ User1: Receiver }, { User2: Sender }] },
//       ],
//     });

//     let chatId;

//     // If a chat doesn't exist, create a new chat
//     if (!existingChat) {
//       const newChat = new Chat({
//        // ID, // Add your logic to generate a unique ID
//         User1: Sender,
//         User2: Receiver,
//       });
//       const savedChat = await newChat.save();
//       chatId = savedChat._id;
//     } else {
//       chatId = existingChat._id;
//     }

//     // Create a new message using the chat ID
//     const newMessage = new Message({
//       //ID,
//       Message: messageText,
//       Sender,
//       Receiver,
//       ChatID: chatId,
//     });

//     await newMessage.save();

//     res.status(201).json(newMessage);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal Server Error' });
//   }
// };

export const getChatForUser=async (req, res) => {
  try {
    const {tokenId} = req.params;
    const {user2}=req.params;
    const userId=tokenId;
    const receiverId=user2;

    // Find all chats where User1 or User2 is the given userId
   // let chat = await Chat.findOne({ $or: [{ User1: userId }, { User2: userId }] });
   let chat = await Chat.findOne({
      $or: [
        { $and: [{ User1: userId }, { User2: receiverId }] },
        { $and: [{ User1: receiverId }, { User2: userId }] },
      ],
    });

    console.log("Inside functions");

    if(!chat)
      {
        chat = new Chat({
          //User1: mongoose.Types.ObjectId(Sender),
          //User2: mongoose.Types.ObjectId(Receiver),
          User1:userId,
          User2:receiverId
        });
        const savedChat = await chat.save();
      }

      const messages = await Message.find({ ChatID: chat._id }).populate('Sender');
      const reciever=await User.findOne({_id:receiverId});
      let recieverInfo;
      if(reciever.type==="PlatformUser")
        {
          recieverInfo=await PlatfromUser.findOne({ID:receiverId});
        }
      else if(reciever.type==="OrgAdmin")
        {
          recieverInfo=await organization.findOne({ID:receiverId});
        }
      console.log(reciever)

      const sender=await User.findOne({_id:userId});
      let senderInfo;
      if(sender.type==="PlatformUser")
        {
          senderInfo=await PlatfromUser.findOne({ID:userId});
        }
      else if(sender.type==="OrgAdmin")
        {
          senderInfo=await organization.findOne({ID:userId});
        }
      
      const recieverImagePath = recieverInfo.ImagePath ? recieverInfo.ImagePath : 'https://via.placeholder.com/300';
      const senderImagePath = senderInfo.ImagePath ? senderInfo.ImagePath : 'https://via.placeholder.com/300';


      console.log(recieverImagePath)
      const newChat = {
        chatId:chat._id,
        messages:messages,
        userName: reciever.Username,
        recieverImage:recieverImagePath,
        senderImage:senderImagePath,


        
      };

      console.log(newChat)





    res.json({chat:newChat});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
}


export const createMessage = async (req, res) => {
  try {
    const {message,chatId,Sender } = req.body;

   

    // Check if a chat already exists between the two users
    // const existingChat = await Chat.findOne({
    //   $or: [
    //     { $and: [{ User1: Sender }, { User2: Receiver }] },
    //     { $and: [{ User1: Receiver }, { User2: Sender }] },
    //   ],
    // });

    
    // Create a new message using the chat ID
    const newMessage = new Message({
      Message: message,
      Sender,
      ChatID: chatId,
    });

    await newMessage.save();

    res.status(201).json(newMessage);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getMessagesForChat = async (req, res) => {
    try {
      const chatId = req.params.chatId;
  
      const chatExists = await Chat.findById(chatId);
  
      if (!chatExists) {
        return res.status(404).json({ error: 'Chat not found' });
      }
  
      // Retrieve all messages for the specified chat
      const messages = await Message.find({ ChatID: chatId });
  
      res.status(200).json(messages);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };

 
  export const getAllChatsForUser = async (req, res) => {
    try {
      const { tokenId:userId } = req.params;
  
      let chats = await Chat.find({
        $or: [{ User1: userId }, { User2: userId }],
      });
  
      // Array to store modified chats with user information
      let modifiedChats = [];
  
      // Iterate over each chat to populate user information
      for (let chat of chats) {
        // Determine the other user's ID
        const otherUserId = chat.User1.toString() === userId ? chat.User2 : chat.User1;
  
        // Find the user information for the other user
        const otherUser = await User.findById(otherUserId);
        console.log(otherUser);

        let otherUserInfo;
        if(otherUser.type==="PlatformUser")
          {
            otherUserInfo=await PlatfromUser.findOne({ID:otherUserId});
          }
        else if(otherUser.type==="OrgAdmin")
          {
            otherUserInfo=await organization.findOne({ID:otherUserId});
          }
 
  
        // Add the chat with user information to the modifiedChats array
        modifiedChats.push({
          
            _id: otherUser._id,
            name: otherUser.Username,
            userImage:otherUserInfo.ImagePath,
           
        });
      }
      console.log(modifiedChats)
      res.status(200).json({ chats: modifiedChats });
    } catch (error) {
      console.error('Error fetching chats:', error);
      res.status(500).json({ message: 'Server error' });
    }
  };

