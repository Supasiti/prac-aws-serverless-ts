import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { getDocumentClient } from './docClient';
import { getUser } from './userDao';
import { log } from '../common/logger';
import { mockUser } from '../testData/mockUser';

let client: DynamoDBDocumentClient;

describe('userDao', () => {
  let logSpy: jest.SpyInstance;

  beforeAll((done) => {
    const options = {
      endpoint: process.env.MOCK_DYNAMODB_ENDPOINT,
      sslEnabled: false,
      region: 'local',
      accessKeyId: 'DUMMYIDEXAMPLE',
      secretAccessKey: 'DUMMYEXAMPLEKEY',
    };
    client = getDocumentClient(options);
    logSpy = jest.spyOn(log, 'info').mockImplementation(() => undefined);
    done();
  });

  afterAll(() => {
    client.destroy();
    logSpy.mockRestore();
  });

  describe('getUser', () => {
    test("should return undefined if it doesn't exist", async () => {
      const mockDbClient = {
        send: jest.fn().mockResolvedValue({}),
      } as any;
      const user = await getUser(4000, { dbClient: mockDbClient });

      expect(user).toBeUndefined();
    });

    test('should return user from a userID', async () => {
      const mockDbClient = {
        send: jest.fn().mockResolvedValue({ Item: mockUser() }),
      } as any;
      const user = await getUser(1, { dbClient: mockDbClient });

      expect(user).toStrictEqual(mockUser());
    });
  });
});
