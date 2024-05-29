import jwt from 'jsonwebtoken';

const authenticatePlatfromUser = (req, res, next) => {
  // Get the token from the request header or other suitable location
  const authHeader = req.headers.authorization;

  console.log(authHeader);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized access. Token not provided.' });
  }

  // Extract the token without 'Bearer ' prefix
  const token = authHeader.split(' ')[1];

  jwt.verify(token, 'your_secret_key_here', (err, decodedToken) => {
    if (err) {
      return res.status(401).json({ error: 'Unauthorized access. Invalid token.' });
    }

    if (decodedToken.type !== 'PlatformUser') {
      return res.status(403).json({ error: 'Access forbidden. Organization Admin role required.' });
    }

    req.user = decodedToken;
    next();
  });
};

export { authenticatePlatfromUser };