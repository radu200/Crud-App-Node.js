const LocalStrategy = require('passport-local').Strategy;
const mysql = require('mysql');
const bcrypt = require('bcrypt');
const db = require('./database');
const saltRounds = 10;


module.exports = function (passport) {
    passport.serializeUser(function (user, done) {
        console.log('seriliaze', user)
        done(null, user);
    });

    passport.deserializeUser(function (user, done) {
        console.log('deseriliza', user)
        done(null, user);

    });


    passport.use('local-login', new LocalStrategy({
        passReqToCallback: true
    }, function (req, username, password, done) {
            //validation login
 

    
        db.query('SELECT id, password,type,username, user_status ,membership_aproved_date,membership FROM users WHERE email = ?', [username], function (error, results, fileds) {
            if (error) {
                done(error)
            }
            //check if email is correct
            else if (!results.length) {
                return done(null, false, req.flash('error_msg', {
                    msg: 'Your email or password is incorrect. Please try again. '
                }));

            } else if (results[0].user_status === 'unverified') {
                return done(null, false, req.flash('error_msg', {
                    msg: 'You have not verified your account'
                }));

            }
                else if(results[0].membership === 'unapproved' && results[0].type === 'pro'){
                    return done(null, false, req.flash('error_msg', {
                        msg: 'Your membership is not valid'
                    }));
                }
             else {
                const hash = results[0].password
                //check if password is correct 
                bcrypt.compare(password, hash, function (error, response) {
                    if (response === true && results[0].user_status === 'verified') {
                        //all went fine, user is found
                        return done(null, results[0]);
                    } else {
                        return done(null, false, req.flash('error_msg', {
                            msg: 'Your email or password is incorrect. Please try again '
                        }));

                    }
                })
            }
        });
    }));
    
}