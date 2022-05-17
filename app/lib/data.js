/** Library for storing and editing data */

// Dependecies

const fs = require('fs');
const path = require('path');
const helpers = require('./helpers');
// Container for the module to be exported
const lib = {};

// Base Directory of the data folder
lib.baseDir = path.join(__dirname, '/../data');
lib.create = (dir, file, data, callback) => {
 // Open the file for writing
 fs.open(`${lib.baseDir}/${dir}/${file}.json`, 'wx', (err, fileDescriptor) => {
  if (!err && fileDescriptor) {
   // Convert data to String
   const stringData = JSON.stringify(data);

   // write to file and close it
   fs.writeFile(fileDescriptor, stringData, (err) => {
    if (!err) {
     fs.close(fileDescriptor, (err) => {
      if (!err) {
       callback(false);
      } else {
       callback('Error closing new file');
      }
     });
    } else {
     callback('Error Writing to new file');
    }
   });
  } else {
   callback('Could not Create it may already exist');
  }
 });
};

lib.read = (dir, file, callback) => {
 fs.readFile(`${lib.baseDir}/${dir}/${file}.json`, 'utf-8', (err, data) => {
  if (!err && data) {
   const parsedObject = helpers.parseJsonToObject(data);
   callback(false, parsedObject);
  } else {
   callback(err, data);
  }
 });
};
lib.update = (dir, file, data, callback) => {
 fs.open(`${lib.baseDir}/${dir}/${file}.json`, 'r+', (err, fileDescriptor) => {
  if (!err && fileDescriptor) {
   var stringData = JSON.stringify(data);

   //Truncate the file
   fs.ftruncate(fileDescriptor, (err) => {
    if (!err) {
     fs.writeFile(fileDescriptor, stringData, function (err) {
      if (!err) {
       fs.close(fileDescriptor, (err) => {
        if (!err) {
         callback(false);
        } else {
         callback('Error closing the file');
        }
       });
      } else {
       callback('Error writing into existing file');
      }
     });
     // Write to the file and close it
    } else {
     callback('Error trucating file');
    }
   });
  } else {
   callback('Could not open the file for updating, it may not exist yet ');
  }
 });
};

lib.delete = (dir, file, callback) => {
 fs.unlink(`${lib.baseDir}/${dir}/${file}.json`, (err) => {
  if (!err) {
   callback(false);
  } else {
   callback('There was an error deleting the file');
  }
 });
};
module.exports = lib;
