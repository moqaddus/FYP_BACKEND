import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import { dbConnect } from "./database/index.js";

import { PORT,FrontEnd} from "./config/index.js";

import userRoutes from "./routes/user.js";
import orgRoutes from "./routes/organization.js";
import eventRoutes from "./routes/event.js";
import attendeeRoutes from "./routes/attendee.js";
import messageRoutes from "./routes/message.js";
import contactUs from "./routes/contactUs.js";
import interestRoutes from "./routes/interest.js";
import payment from "./routes/payment.js";
import admin from "./routes/admin.js"

//import fileUpload from 'express-fileupload';

const corsOptions = {
  origin: "*",
  methods: "*",
  allowedHeaders: "*",
};

const app = express();
// app.use(cors({ origin: FrontEnd}));
app.use(cors(corsOptions));

// const app = express();
// app.use(cors({ origin: FrontEnd}));

dbConnect();
app.use(bodyParser.json());
// app.use(fileUpload({
//   useTempFiles:true
// }))

app.use("/user", userRoutes);
app.use("/Organization", orgRoutes);
app.use("/Events", eventRoutes);
app.use("/attendees", attendeeRoutes);
app.use("/interest", interestRoutes); // change on may 3 added
app.use("/messages", messageRoutes);
app.use("/contactUs", contactUs);
app.use("/payment", payment);
app.use("/admin",admin);

app.listen(PORT, () => console.log(`SERVER RUNNING NOW...${PORT}`));
