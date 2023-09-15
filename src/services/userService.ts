import * as userDaoMod from '../dynamodb/userDao';

type GetUserByIDDeps = {
  userDao: typeof userDaoMod;
};

export async function getUserByID(userID: number, deps?: GetUserByIDDeps) {
  const { userDao = userDaoMod } = deps || {};

  return await userDao.getUser(userID);
}
