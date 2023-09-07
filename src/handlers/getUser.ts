import { log } from '../common/logger';
import { DataNotFoundError, ValidationError } from '../common/error';
import { error, success } from '../common/jsonResponse';
import * as userServiceMod from '../services/userService';

type HandlerDeps = {
  userService: typeof userServiceMod;
};

export const handler = async (
  event: AWSLambda.APIGatewayEvent,
  _ctx: Partial<AWSLambda.Context>,
  deps?: HandlerDeps,
) => {
  log.info(event, 'getUser Event');
  const { userService = userServiceMod } = deps || {};

  try {
    // eslint-disable-next-line
    const { userID } = event.pathParameters || {};
    if (!userID) {
      throw ValidationError('missing userID');
    }

    const user = await userService.getUserByID(userID);
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
