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

    // TODO: do a proper validation
    if (!userID) {
      throw ValidationError('missing userID');
    }
    // this may throw an error
    const params = parseInt(userID, 10);

    const user = await userService.getUserByID(params);
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
