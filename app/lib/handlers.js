// Dependencies

const _data = require('./data');
const helpers = require('./helpers');
/** Request Handlers* */
const handlers = {};
handlers.sample = (data, callback) => {
  // callback a http Status code and a payload Object
  callback(406, { name: 'sample Handler' });
};

handlers.notFound = (data, callback) => {
  return callback(404, { name: 'Not Found ' });
};

handlers.users = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.includes(data.method)) {
    handlers._users[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._users = {};
// Users - get
// RequiredData : phone
// Optional : none
// @TODO only allow authenticated user to access their Object, Don't let them access any one else
handlers._users.get = (data, callback) => {
  const phoneNumber =
    typeof data.queryStringObject.phoneNumber === 'string' &&
    data.queryStringObject.phoneNumber.trim().length === 10
      ? data.queryStringObject.phoneNumber.trim()
      : false;
  if (phoneNumber) {
    _data.read('users', phoneNumber, (err, data) => {
      if (!err && data) {
        //Remove password from the user response Object
        delete data.password;
        callback(200, data);
      } else {
        callback(404);
      }
    });
  } else {
    callback(400, { Error: 'Missing query String' });
  }
};
// Users - post
// Required data : firstname,lastname, phone, password, tosAgreement
// Optional data : none

handlers._users.post = (data, callback) => {
  // Check if all our required field are filled Out
  const firstName =
    typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const phoneNumber =
    typeof data.payload.phoneNumber === 'string' && data.payload.phoneNumber.trim().length === 10
      ? data.payload.phoneNumber.trim()
      : false;
  const password =
    typeof data.payload.password === 'string' && data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  const tosAgreement =
    typeof data.payload.tosAgreement === 'boolean' && data.payload.tosAgreement === true ? true : false;
  if (firstName && lastName && phoneNumber && password && tosAgreement) {
    _data.read('users', phoneNumber, (err, data) => {
      if (err) {
        const hashedPassword = helpers.hash(password);

        //Create User Object
        if (hashedPassword) {
          const userObject = {
            firstName,
            lastName,
            phoneNumber,
            password: hashedPassword,
            tosAgreement: true,
          };

          _data.create('users', phoneNumber, userObject, (err, data) => {
            if (!err) {
              callback(200, { message: 'Succesfully Created User' });
            } else {
              console.log(err);
              callback(500, { Error: 'Could not create the new user' });
            }
          });
        } else {
          callback(500, { Error: 'There was an Error Encrypting the password' });
        }
      } else {
        callback(400, { Error: 'A user with that phoneNumber already exist' });
      }
    });

    //Store the user Data

    // A Check to know if user with that phoneNumber doesn't exist
  } else {
    callback(400, { Error: 'kindly Provide the Required fields' });
  }
};

// Users - update
handlers._users.put = (data, callback) => {
  const phoneNumber =
    typeof data.payload.phoneNumber === 'string' && data.payload.phoneNumber.trim().length === 10
      ? data.payload.phoneNumber.trim()
      : false;
  const firstName =
    typeof data.payload.firstName === 'string' && data.payload.firstName.trim().length > 0
      ? data.payload.firstName.trim()
      : false;
  const lastName =
    typeof data.payload.lastName === 'string' && data.payload.lastName.trim().length > 0
      ? data.payload.lastName.trim()
      : false;
  const password =
    typeof data.payload.password === 'string' && data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;

  if (phoneNumber) {
    if (firstName || lastName || email) {
      _data.read('users', phoneNumber, (err, userDataObj) => {
        if (!err && userDataObj) {
          if (firstName) {
            userDataObj.firstName = firstName;
          }
          if (lastName) {
            userDataObj.lastName = lastName;
          }
          if (password) {
            userDataObj.password = helpers.hash(password);
          }
          _data.update('users', phoneNumber, userDataObj, (err) => {
            if (!err) {
              callback(200, { message: 'Successfully Updated User' });
            } else {
              callback(400, { Error: "There Specified user doesn't exist" });
            }
          });
        } else {
          callback(400, ['Missing field to update']);
        }
      });
    }
  } else {
    callback(400, { Error: 'Missing Required field' });
  }
};

// Users - delete
handlers._users.delete = (data, callback) => {
  const phoneNumber =
    typeof data.queryStringObject.phoneNumber === 'string' &&
    data.queryStringObject.phoneNumber.trim().length === 10
      ? data.queryStringObject.phoneNumber.trim()
      : false;

  if (phoneNumber) {
    _data.read('users', phoneNumber, (err, data) => {
      if (!err && data) {
        _data.delete('users', phoneNumber, (err) => {
          if (!err) {
            callback(200, { message: 'Successfully Deleted user' });
          } else {
            callback(400, { Error: "Couldn'/t delete the specified user" });
          }
        });
      } else {
        callback(400, { Error: 'Could not find the specified user' });
      }
    });
  } else {
    callback(400, { Érror: 'Mssing required field' });
  }
};

//Tokens

// Containers for all tokens
handlers._tokens = {};
// Tokens  - post
// Required field  password,phoneNumber

handlers.tokens = (data, callback) => {
  const acceptableMethods = ['post', 'get', 'put', 'delete'];
  if (acceptableMethods.includes(data.method)) {
    handlers._tokens[data.method](data, callback);
  } else {
    callback(405);
  }
};

handlers._tokens.post = (data, callback) => {
  const phoneNumber =
    typeof data.payload.phoneNumber === 'string' && data.payload.phoneNumber.trim().length === 10
      ? data.payload.phoneNumber.trim()
      : false;
  const password =
    typeof data.payload.password === 'string' && data.payload.password.trim().length > 0
      ? data.payload.password.trim()
      : false;
  if (phoneNumber && password) {
    // Checks the user with the provided phoneNumber
    _data.read('users', phoneNumber, (err, userData) => {
      if (!err && userData) {
        const hashedPassword = helpers.hash(password);
        if (hashedPassword === userData.password) {
          // If valid Create a new token with random name set Expiration time to 1hr
          const tokenId = helpers.createRandomString(20);
          const expiresIn = Date.now() + 1000 * 60 * 60;
          const tokenObj = {
            tokenId,
            expiresIn,
            phoneNumber,
          };
          // Store the token
          _data.create('tokens', tokenId, tokenObj, (err) => {
            if (!err) {
              callback(200, tokenObj);
            } else {
              callback(500, { Error: "Couldn'/t  create token" });
            }
          });
        } else {
          callback(400, { Error: "password doesn'/t match the specified user" });
        }
      } else {
        callback(400, { Error: 'Missing d required field' });
      }
    });
  } else {
    callback(400, { Error: 'Missing  required field' });
  }
};
// Tokens -get
// Required Field : id
// optional data : none
handlers._tokens.get = (data, callback) => {
  const id =
    typeof data.queryStringObject.id === 'string' && data.queryStringObject.id.trim().length === 20
      ? data.queryStringObject.id.trim()
      : false;
  if (id) {
    // get User based on the id
    _data.read('tokens', id, (err, tokenData) => {
      if (!err && tokenData) {
        callback(200, tokenData);
      } else {
        callback(404, { Error: 'The user with that specified id is not found' });
      }
    });
  } else {
    callback(400, { Error: 'Missing Required field' });
  }
};
handlers._tokens.puts = (data, callback) => {};
handlers._tokens.delete = (data, callback) => {};

module.exports = handlers;
