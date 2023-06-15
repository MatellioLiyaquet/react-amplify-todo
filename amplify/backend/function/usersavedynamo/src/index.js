/* Amplify Params - DO NOT EDIT
	API_REACTAMPLIFYTODO_GRAPHQLAPIIDOUTPUT
	API_REACTAMPLIFYTODO_USERSTABLE_ARN
	API_REACTAMPLIFYTODO_USERSTABLE_NAME
	ENV
	REGION
Amplify Params - DO NOT EDIT */

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */

var aws = require("aws-sdk");
var ddb = new aws.DynamoDB();

exports.handler = async (event, context) => {
  let date = new Date();

  //   if (event.request.userAttributes.sub) {
  if (event.userName) {
    let params = {
      Item: {
        id: { S: event.userName },
        __typename: { S: "Users" },
        // name: { S: event.request.userAttributes.name },
        email: { S: event.request.userAttributes.email },
        createdAt: { S: date.toISOString() },
        updatedAt: { S: date.toISOString() },
      },
      TableName: process.env.API_REACTAMPLIFYTODO_USERSTABLE_NAME,
    };

    // Call DynamoDB
    try {
      await ddb.putItem(params).promise();
      console.log("Success");
    } catch (err) {
      console.log("Error", err);
    }

    console.log("Success: Everything executed correctly");
    context.done(null, event);
  } else {
    // Nothing to do, the user's email ID is unknown
    console.log("Error: Nothing was written to DynamoDB");
    context.done(null, event);
  }
};

export function adminAddUserToGroup({ userPoolId, username, groupName }) {
  const params = {
    GroupName: groupName,
    UserPoolId: userPoolId,
    Username: username,
  };

  const cognitoIdp = new aws.CognitoIdentityServiceProvider();
  return cognitoIdp.adminAddUserToGroup(params).promise();
}
