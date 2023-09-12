import { User } from '../models/types';

const database: Record<string, User> = {
  1: {
    name: 'Bob',
    email: 'bob.builder@email.com',
    balance: 1000.0,
    userID: 1,
  },
  2: {
    name: 'Alice',
    email: 'alice.wonderland@email.com',
    balance: 2034.53,
    userID: 2,
  },
};

export const getUserByID = async (userID: string) => database[userID];
