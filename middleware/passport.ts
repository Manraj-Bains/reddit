import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { getUserByEmailAndPassword, getUserById } from "../controller/userController";

// TODO: Passport Types
const localLogin = new LocalStrategy(
  {
    usernameField: "uname",
    passwordField: "password",
  },
  async (uname, password, done) => {
    try {
      const user = await getUserByEmailAndPassword(uname, password);
      if (!user) {
        return done(null, false, { message: "Your login details are not valid. Please try again." });
      }
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
);

// TODO: Passport Types
passport.serializeUser(function (user: any, done: any) {
  done(null, user.id);
});

// TODO: Passport Types
passport.deserializeUser(async function (id: any, done: any) {
  try {
    const user = await getUserById(id);
    if (user) {
      done(null, user);
    } else {
      done({ message: "User not found" }, null);
    }
  } catch (error) {
    done(error, null);
  }
});

passport.use(localLogin);

export default passport;
