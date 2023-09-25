import { GetCommand, GetCommandOutput } from '@aws-sdk/lib-dynamodb';
import { log } from '../common/logger';
import { getDocumentClient } from './docClient';
import { TABLE_NAME, stripPrivateFields, toGetUserKey } from './util';
import type { User } from '../models/types';

export async function getUser(userID: number): Promise<User | undefined> {
  log.info({ userID }, 'getUser: params');

  const params = {
    Key: toGetUserKey(userID),
    TableName: TABLE_NAME,
  };

  const response: GetCommandOutput = await getDocumentClient().send(
    new GetCommand(params),
  );
  log.info(response, 'getUser: response from db');

  const { Item } = response;
  if (!Item) return Item;

  return stripPrivateFields<User>(Item);
}
