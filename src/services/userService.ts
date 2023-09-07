type User = {
  name: string;
  email: string;
  balance: number;
};

const database: Record<string, User> = {
  1: {
    name: 'Bob',
    email: 'bob.builder@email.com',
    balance: 1000.0,
  },
  2: {
    name: 'Alice',
    email: 'alice.wonderland@email.com',
    balance: 2034.53,
  },
};

export const getUserByID = async (userID: string) => database[userID];
