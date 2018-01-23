'use strict';

const AWS = require('aws-sdk');

var async = require('async');
var ddb = new AWS.DynamoDB.DocumentClient({region: 'us-west-2'});
// var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});


function createErrorResponse(code, message) {
    var response = {
        'statusCode': code,
        'headers' : {'Access-Control-Allow-Origin' : '*'},
        'body' : JSON.stringify({'code': code, 'messsage' : message}, null, 2)
    };

    return response;
}

function createSuccessResponse(result) {
    var response = {
        'statusCode': 200,
        'headers' : {'Access-Control-Allow-Origin' : '*'},
        'body' : JSON.stringify(result, null, 2)
    };

    return response;
}


function writeToDynamoDB(params, next) {
    console.log("attempt to write to dynamoDB");
    console.log(JSON.stringify("params: ", params));

    ddb.batchWriteItem(params, function(err, data) {
        if (err) next(err);
        else next(null, data);
    });
}


module.exports.putServiceLogInToDynamoDB = function(event, context, callback) {
  const timestamp = new Date().getTime();
  const data = JSON.parse(event.body);

  const params = {
    TableName: process.env.DYNAMODB_TABLE,
    Item: {
      systemName: data.systemName,
      timeStamp: timestamp,
    },
  };

  ddb.put(params, function(error) {
    // handle potential errors
    if (error) {
      console.error(error);
      callback(null, createErrorResponse(500, error));
      return;
    }

  callback(null, createSuccessResponse(200, { who: 'si-service-connector', message: 'put ok'}));

  // Use this code if you don't use the http event with the LAMBDA-PROXY integration
  // callback(null, { message: 'Go Serverless v1.0! Your function executed successfully!', event });
})
}
