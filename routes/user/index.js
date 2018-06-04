const User = require("../../database_models/user_model");




module.exports.register = function(server, options, next){
    server.route([
        {
          method: "POST",
          path: "/sign_up",
          handler: function(request, reply)  {
            User.findOne({"email": request.payload.email}, function(err,existing_user){
                if(existing_user){
                    reply("Este correo ya existe. Intente de nuevo con otro correo").code(400);
                } else{
                    var user = new User({"email": request.payload.email, "name": request.payload.name, "password": request.payload.password, "user_profile": {}});
                    user.save(function(err, saved_user_record){
                        if(err){
                            reply("Error en el registro").code(400);
                        } else{
                            reply("Registrado correctamente");
                        }
                    });
                }
            });
          }
        },
        {
            method: "POST",
            path: "/login",
            handler: function(request,reply){
                console.log("request_payload", request.payload);
                User.findOne({"email":request.payload.email,"password":request.payload.password}, function(err, valid_user){
                    if(valid_user){
                        request.cookieAuth.set({"user":valid_user.email, "member_id": valid_user.member_id, "name": valid_user.name});
                        reply();
                    }else{
                        reply().code(400);
                    }
                })
            }
        },
        {
            method: "POST",
            path: "/logout",
            handler: function(request,reply){
                request.cookieAuth.clear();
                 reply();
            }
        }
    ]);

    next();
};

module.exports.register.attributes = {
    pkg: require("./package.json")
};