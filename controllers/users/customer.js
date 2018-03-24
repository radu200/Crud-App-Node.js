const express = require('express');
const db = require('../../config/database.js');
const expressValidator = require('express-validator');
const bcrypt = require('bcrypt');
const passport = require('passport');
const saltRounds = 10;
const LocalStrategy = require('passport-local').Strategy;
const crypto = require('crypto');
const nodemailer = require('nodemailer');


//signup login
module.exports.getSignupCustomer = function (req, res, next) {
    res.render('./account/customer/customer_signup');
};

module.exports.postSignupCustomer = function (req, res, next) {

    const email = req.body.email;
    const username = req.body.username;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;


    //validation
    req.checkBody('email', 'Email is not valid').isEmail();
    req.checkBody('username', 'Username  is required').notEmpty();
    // req.checkBody('lastname', 'Last Name required').notEmpty();
    req.checkBody('password', 'Password must be between 6-100 characters long.').len(1, 100);
    req.checkBody('confirmpassword', 'Passwords do not match').equals(req.body.password);



    const errors = req.validationErrors();

    if (errors) {
        req.flash('error_msg', errors);
        return res.redirect('/customer/signup')
    }

    db.query("SELECT * FROM users WHERE email = ?", [email], function (err, rows) {
        if (err) throw err
        if (rows.length) {
            req.flash('error_msg', {
                msg: 'This email is already taken.'
            });
            res.redirect('/customer/signup')
        } else {

            // create the user
            bcrypt.hash(password, saltRounds, function (err, hash) {
                crypto.randomBytes(16, function (err, buffer) {
                    let token = buffer.toString('hex');
                    // console.log('token',token)
                 
                    db.query('INSERT INTO users (password,email,username, type, user_status, email_confirmation_token) VALUES (?,?,?,?,?,?)', [hash, email, username, 'customer', 'unverified', token], function (error, result) {
                        if (error) throw error
         
                        db.query('SELECT id , type, username FROM users WHERE email = ? ', [email], function (err, results, fileds) {
                            if (error) throw error
                   
                        });
                    });
                    ///send email with token
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: process.env.GMAIL_USER,
                            pass: process.env.GMAIL_PASSWORD
                        }
                    });

                    const mailOptions = {
                        to: email,
                        from: 'Company ecomerce',
                        subject: 'Account Verification ',
                        text: `You are receiving this email because you (or someone else) registed on our webite.\n\n
                         Please click on the following link, or copy and  paste this into your browser to complete the process:\n\n 
                         http://${req.headers.host}/account/verify/${token}\n\n
                         This link will be valid for only 1 hour.\n\n
                         If you did not request this, please ignore this email or report this action.\n`,

                    };

                    transporter.sendMail(mailOptions, (err) => {
                        if (err) {
                            req.flash('error_msg', errors);

                            return res.redirect('/forgot');
                        }
                    });

                }); //crypto ends
                req.flash('warning_msg', {
                    msg: " Thank you for registering on our website. We sent you an email with futher details to confirm your account"
                });
                res.redirect('/login')
            }); //bcrypt ends

        }
    });
};



module.exports.getVerifyEmail = function (req, res, next) {
    let token = req.params.token
    db.query('SELECT * FROM users where email_confirmation_token = ?', [token], function (err, rows) {
        if (err) {
            console.log(err)
        } else if (rows.length) {
            // let verified = 'verified';
            db.query('UPDATE users SET user_status = ? WHERE email_confirmation_token = ?', ['verified', token], function (err, rows) {
               if (err) throw err
            })  
            req.login(rows[0],function(err){
                req.flash('success_msg', {
                    msg: "Success! Your account has been verified"
                });
                res.redirect('/profile')
            });
        }
        
        else {
            req.flash('error_msg', {
                msg: "Oops! Sorry we wasn't able to verify your account, please Contact Us"
            });
            res.redirect('/login')
        }

    })

}
// res.render('./account/login');