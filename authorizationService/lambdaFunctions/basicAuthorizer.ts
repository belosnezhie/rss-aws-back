import 'dotenv/config';

const generatePolicy = (
  principalId: string,
  resource: string,
  effect: 'Allow' | 'Deny' = 'Allow',
  message: string,
) => {
  return {
    principalId,
    policyDocument: {
      Version: '2012-10-17',
      Statement: [
        {
          Action: 'execute-api:Invoke',
          Effect: effect,
          Resource: resource,
        },
      ],
    },
    context: {
      message,
    },
  };
};

export const handler = async (event: any) => {
  console.log('Event:', JSON.stringify(event));

  console.log(`authorizationToken: ${event.authorizationToken}`)

  if (!event.authorizationToken) {
    console.log('Missing Authorization header');
    return generatePolicy('', event.methodArn, 'Deny', 'Unauthorized: Missing Authorization header')
  }

  try {
    const authorizationHeader = event.authorizationToken;

    const decodedCredentials = Buffer.from(authorizationHeader, 'base64').toString('utf-8');

    const credentials = decodedCredentials.split(':');
    const username = credentials[0];
    const password = credentials[1];

    if (!username || !password) {
      console.log('Missing username or password');
      return generatePolicy(username, event.methodArn, 'Deny', 'Invalid credentials');
    }

    console.log('Username:', username);
    console.log('Password:', password);

    const storedPassword = process.env[username];

    console.log(`Stored password: ${storedPassword}`)

    if (!storedPassword || storedPassword !== password) {
      console.log('Invalid credentials');
      return generatePolicy(username, event.methodArn, 'Deny', 'Invalid credentials');
    }

    console.log('Successfully authorized');
    return generatePolicy(username, event.methodArn, 'Allow' ,'Successfully authorized');
  } catch (error) {
    console.error('Error:', error);
    return generatePolicy('', event.methodArn, 'Deny', 'Internal server error');
  }
};
