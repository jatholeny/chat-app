/**
 * Created by allenbklj on 9/9/15.
 */
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var passportLocalMongoose = require('passport-local-mongoose');
console.log();
var User = new Schema({});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User',User);
