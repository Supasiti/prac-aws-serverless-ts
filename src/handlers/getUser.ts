import { log } from '../common/logger';
import { DataNotFoundError, ValidationError } from '../common/error';
import { error, success } from '../common/jsonResponse';
import * as userDaoMod from '../dao/userDao';

type HandlerDeps = {
  userDao: typeof userDaoMod;
};

export const handler = async (
  event: AWSLambda.APIGatewayEvent,
  _ctx: Partial<AWSLambda.Context>,
  deps?: HandlerDeps,
) => {
  log.info(event, 'getUser Event');
  const { userDao = userDaoMod } = deps || {};

  try {
    // eslint-disable-next-line
    const { userID } = event.pathParameters || {};

    const params = validateRequest(userID);

    const user = await userDao.getUser(params);
    if (!user) {
      throw DataNotFoundError('no user found');
    }

    log.info(user, 'getUser response data');
    return success({ data: user });
  } catch (err) {
    log.error(err);
    return error(err as Error);
  }
};

function validateRequest(params?: string): number {
  if (!params) {
    throw ValidationError('missing userID');
  }

  const result = parseInt(params, 10);
  if (Number.isNaN(result)) {
    throw ValidationError('userID must be an integer');
  }
  return result;
}
