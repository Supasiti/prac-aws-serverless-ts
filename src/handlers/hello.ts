const buildResponseBody = (status: number, body: any, headers = {}) => {
  return {
    statusCode: status,
    headers,
    body,
  };
};

export const handler = async (event: AWSLambda.APIGatewayEvent) => {
  console.log(event);
  try {
    return buildResponseBody(200, 'hello world');
  } catch (err) {
    console.error(err);

    if (err instanceof Error) {
      return buildResponseBody(500, err?.message || 'Unknown server error');
    }
    return buildResponseBody(500, 'Unknown server error');
  }
};
