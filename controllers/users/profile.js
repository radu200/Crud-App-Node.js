
const db = require('../../config/database.js');

module.exports.getProfile = function (req, res, next) {

if(req.user.type === 'basic'){
    getUserBasicProfile (req,res,next);
} else if (req.user.type === 'pro'){
    getUserBasicProfile (req,res,next);
} else if (req.user.type === 'customer'){
    res.render('./account/customer/profile');
}else{
    res.redirect('/login');
 }
};


///user basic profile
 async function getUserBasicProfile (req, res,next){
    let userId = req.user.id;
    function awaitGetUsers(userId){
        return new Promise(function(resolve, reject){
            db.query("SELECT * FROM  users WHERE users.id = ?" ,[userId] ,function(err, result_user_card, fields) {
                if (err) {
                    console.log(err);
                    resolve([]);
                }
                resolve(result_user_card); 
            });
        });
    }
function awaitGetProducts(userId) {
        return new Promise(function(resolve, reject){
            db.query("SELECT * FROM products WHERE products.user_id = ? ", [userId], function(err, result_products, fields){
                if(err){
                    console.log(err);
                    resolve([]);
                }
                resolve(!err && result_products ? result_products : []); 
            });
        });
    }
    let users_result = await awaitGetUsers(userId); 
    let products_result = await awaitGetProducts(userId);
 
    res.render('./account/user-basic/profile', {
        "result": products_result,
        "resultCard": users_result[0]
    });

}



//profile edit
module.exports.getSettingsProfile = function(req, res, next) {

if(req.user.type === 'basic'){
    getProfileSettingsUser (req,res,next);
} else if (req.user.type === 'pro'){
    getProfileSettingsUser(req,res,next);
} else if (req.user.type === 'customer'){
    getProfileSettingCustomer(req,res,next)
}else{
    res.redirect('/login');
 }
  
};



//profile settings for userBasic and Pro
function getProfileSettingsUser (req,res,next){

    let userId = req.user.id;
    db.query("SELECT * FROM  users where id = ?" ,[userId] ,function(err, results, fields) {
        if (err) throw err;
        res.render('./account/user-basic/settings/edit-profile', {
            "results": results[0]
        });
    
    })
}

//profile settings for customer

function getProfileSettingCustomer (req,res,next){
    let userId = req.user.id;
    db.query("SELECT * FROM  users where id = ?" ,[userId] ,function(err, results, fields) {
        if (err) throw err;
        res.render('./account/customer/profileSettings', {
            "results": results[0]
        });
    
    })
}
//profile post
module.exports.postSettingsProfile = function(req, res, next) {
    if(req.user.type === 'basic'){
        postProfileSettingsUser (req,res,next);
    } else if (req.user.type === 'pro'){
        postProfileSettingsUser(req,res,next);
    } else if (req.user.type === 'customer'){
        postProfileSettingCustomer(req,res,next)
    }else{
        res.redirect('/login');
     }
}

//post profile settings for userbasic and pro
function postProfileSettingsUser(req,res,next){


let username = req.body.username;
let firstname = req.body.firstname;
let lastname = req.body.lastname;
let about = req.body.about;
let paypalAccount = req.body.paypalAccount
let stripeAccount = req.body.stripeAccount






if (req.file) {
    var userAvatar= req.file.filename;


} else {
    var userAvatar = false;
    
}
let errors = req.validationErrors();
if (errors) {
    res.render('./account/user-basic/settings/edit-profile', {
        errors: errors,
        username: username,
        first_name:firstname,
        last_name:lastname,
        about: about,
        paypal_account:paypalAccount,
        stripe_account:stripeAccount
    });
} else {
   let user = {
        username: username,
        first_name:firstname,
        last_name:lastname,
        about: about,
        paypal_account:paypalAccount,
        stripe_account:stripeAccount,

    
    };

    if(userAvatar){
        user .avatar = userAvatar;
    }
   
      let userId = req.user.id    
    db.query('UPDATE users SET ? WHERE id = ?',[user ,userId], function(err, results) {
        if (err) throw err;
            console.log(results.affectedRows + " record(s) updated");
                })
                req.flash('success_msg', {msg:'Profile updated'});
                res.redirect('back');
            }
        }



///profile settings for customer
function postProfileSettingCustomer(req,res,next){
    

let username = req.body.usernameCustomer;
console.log(username)
let firstname = req.body.firstnameCustomer;
let lastname = req.body.lastnameCustomer;


let errors = req.validationErrors();
if (errors) {
    res.render('./account/customer/profileSettings', {
        errors: errors,
        username: username,
        first_name:firstname,
        last_name:lastname,
        
      
    });
} else {
   let customer = {
        username: username,
        first_name:firstname,
        last_name:lastname,
    
    };
      let userId = req.user.id    
    db.query('UPDATE users SET ? WHERE id = ?',[customer ,userId], function(err, results) {
        if (err) throw err;
            console.log(results.affectedRows + " record(s) updated");
                })
                req.flash('success_msg', {msg:'Profile updated'});
                res.redirect('back');
            }
        }
    