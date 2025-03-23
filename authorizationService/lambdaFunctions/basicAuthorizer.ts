const generatePolicy = (
  principalId: string,
  resource: string,
  effect: 'Allow' | 'Deny' = 'Allow'
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
  };
};

export const handler = async (event: any) => {
  console.log('Event:', JSON.stringify(event));

  console.log(`authorizationToken: ${event.authorizationToken}`)

  return generatePolicy('testUser', event.methodArn);

  if (!event.authorizationToken) {
    return {
      statusCode: 401,
      body: 'Unauthorized: Missing Authorization header',
    };
  }

  try {
    const authorizationHeader = event.authorizationHeader;

    const base64Credentials = authorizationHeader.split(' ')[1];
    const decodedCredentials = Buffer.from(base64Credentials, 'base64').toString('utf-8');

    const [username, password] = decodedCredentials.split('=');

    console.log('Username:', username);
    console.log('Password:', password);

    const storedPassword = process.env[username];

    if (!storedPassword || storedPassword !== password) {
      console.log('Invalid credentials');
      return {
        statusCode: 403,
        body: 'Forbidden: Invalid credentials',
      };
    }

    console.log('Successfully authorized');

    return generatePolicy(username, event.methodArn);

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 403,
      body: 'Forbidden: Invalid token',
    };
  }
};

function generatePolicyOLD (principalId: string | null, effect: string, resource: string, statusCode?: number) {
  const authResponse: any = {
    principalId: principalId || 'user'
  };

  if (effect && resource) {
    const policyDocument = {
      Version: '2012-10-17',
      Statement: [{
        Action: 'execute-api:Invoke',
        Effect: effect,
        Resource: resource
      }]
    };
    authResponse.policyDocument = policyDocument;
  }

  if (statusCode) {
    authResponse.context = {
      statusCode
    };
  }

  console.log('Auth Response: ', JSON.stringify(authResponse));
  return authResponse;
};
