import * as db from "../fake-db";
import { Request, Response } from 'express';
import passport from 'passport';

export const getUserByEmailAndPassword = async (email: string, password: string) => {
  const user = db.getUserByUsername(email);
  if (!user) {
    throw new Error('User not found');
  }
  if (user.password !== password) {
    throw new Error('Invalid password');
  }
  return user;
};

export const loginUser = (req: Request, res: Response, next: Function) => {
  passport.authenticate('local', (err: Error, user: any, info: any) => {
    if (err) {
      return next(err);
    }
    if (!user) {
      return res.status(401).render('login', { error: 'Invalid email or password' });
    }
    req.logIn(user, (err: Error) => {
      if (err) {
        return next(err);
      }
      return res.redirect('/posts');
    });
  })(req, res, next);
};

export const getUserById = async (id: number) => {
  const user = db.getUser(id);
  if (user) {
    return user;
  }
  return null;
};
