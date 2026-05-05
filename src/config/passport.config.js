import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import User from "../models/user.model.js";

const SECRET = "secretJWT";

const initializePassport = () => {
  passport.use(
    "jwt",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: SECRET,
      },
      async (jwt_payload, done) => {
        try {
          const user = await User.findById(jwt_payload.id);

          if (!user) {
            return done(null, false);
          }

          return done(null, user);
        } catch (error) {
          return done(error, false);
        }
      },
    ),
  );
};

export default initializePassport;
