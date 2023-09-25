import {
  DynamoDBDocumentClient,
  GetCommand,
  GetCommandOutput,
} from '@aws-sdk/lib-dynamodb';
import { log } from '../common/logger';
import { getDocumentClient } from './docClient';
import { TABLE_NAME, stripPrivateFields, toGetUserKey } from './util';
import type { User } from '../models/types';

type GetUserDeps = {
  dbClient: DynamoDBDocumentClient;
};

export async function getUser(
  userID: number,
  _deps?: GetUserDeps,
): Promise<User | undefined> {
  log.info({ userID }, 'getUser: params');

  // istanbul ignore next
  const { dbClient = getDocumentClient() } = _deps || {};

  const params = {
    Key: toGetUserKey(userID),
    TableName: TABLE_NAME,
  };

  const response: GetCommandOutput = await dbClient.send(
    new GetCommand(params),
  );
  log.info(response, 'getUser: response from db');

  const { Item } = response;
  if (!Item) return Item;

  return stripPrivateFields<User>(Item);
}
