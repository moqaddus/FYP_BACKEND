import dotenv from 'dotenv';
const result = dotenv.config();

const PORT=process.env.PORT;
const CONN_STRING=process.env.CONN_STRING;
const STRIPE_SECRET_KEY=process.env.STRIPE_SECRET_KEY;
const FrontEnd=process.env.FrontEnd;


export { PORT, CONN_STRING,STRIPE_SECRET_KEY ,FrontEnd};