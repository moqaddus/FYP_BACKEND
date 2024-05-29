import jwt from 'jsonwebtoken';

const authenticateUser = (req, res, next) => {
  // Get the token from the request header or other suitable location
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access. Token not provided.' });
  }

  // Extract the token without 'Bearer ' prefix
  const token = authHeader.split(' ')[1];

  jwt.verify(token, 'your_secret_key_here', (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized access. Invalid token.' });
    }


    req.user = decodedToken;
    console.log(decodedToken);
    next();
  });
};

export { authenticateUser };