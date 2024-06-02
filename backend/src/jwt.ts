import jsonwebtoken from "jsonwebtoken";

import dotenv from "dotenv";

if (process.env.NODE_ENV === "development") {
  dotenv.config();
}

export const generateAccessToken = (username: string) => {
  return jsonwebtoken.sign({ username }, process.env.TOKEN_SECRET as string, {
    expiresIn: 900,
  });
};

export const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.headers["authorization"];

  if (token == null) return res.sendStatus(401);

  jsonwebtoken.verify(
    token,
    process.env.TOKEN_SECRET as string,
    (err: any, user: any) => {
      console.log(err);

      if (err) return res.sendStatus(403);

      req.user = user;

      next();
    }
  );
};
