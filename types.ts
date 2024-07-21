export type TUser = {
  id: number;
  uname: string;
  password: string;
};

export type TUsers = {
  [key: number]: TUser;
};

export type TPost = {
  id: number;
  title: string;
  link: string;
  description: string;
  creator: number; 
  subgroup: string;
  timestamp: number;
  votes: number; 
  userVotes: Map<number, number>; 
};

export type TEnrichedPost = TPost & {
  creatorDetails: TUser;
};

export type TPosts = {
  [key: number]: TPost;
};

export type TComment = {
  id: number;
  post_id: number;
  creator: number; 
  description: string;
  timestamp: number;
};

export type TComments = {
  [key: number]: TComment;
};

export type TVote = {
  user_id: number;
  post_id: number;
  value: number;
};

export type TVotes = TVote[];
