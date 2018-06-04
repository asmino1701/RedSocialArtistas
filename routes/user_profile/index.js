const User = require("../../database_models/user_model");
const UserStatus = require("../../database_models/user_statuses_model");
const shortid = require('shortid');
const fs = require('fs');

exports.register = function(plugin,options,next){
	plugin.route([
		{
			method: "GET",
			path: "/user_profile",
			config: {
				auth: "simple-cookie-strategy",
				handler: function(request,reply){
					User.findOne({"email": request.auth.credentials.user}, function(err,user){	
						reply.view("user_profile",{name: user.name,
											   location: user.user_profile[0].location,
											   description:  user.user_profile[0].description,
											   interests:  user.user_profile[0].interests,
											   profile_pic:  user.user_profile[0].profile_pic,
											   friend_requests: user.friend_requests,
											   user_friends: user.friends,
											   member_id: request.auth.credentials.member_id
						});
					});
				}
			}
		},
		{
			method: "POST",
			path: "/user_profile/edit",
			config: {
				auth: "simple-cookie-strategy",
				handler: function(request,reply){
					User.findOne({"email": request.auth.credentials.user}, function(err,user){
						user.name = request.payload.name
						user.user_profile[0].location = request.payload.location
						user.user_profile[0].description = request.payload.description
						user.user_profile[0].interests = request.payload.interests
						user.user_profile[0].languages = request.payload.languages
						user.save(function(err){
							if(err){
								reply("Error al actualizar la información del perfil").code(400);
							} else{
								reply("Perfil actualizado correctamente");
							}
						});
					});
				}
			}
		},
		{
			method: "POST",
			path: "/profile_pic/upload",
			config: {
				auth: "simple-cookie-strategy",
				handler: function(request,reply){
					var user_profile_image = "user_" + request.auth.credentials.member_id + "_" + shortid.generate() + "." + request.payload.image_type;
					fs.writeFile("user_profile_images/" + user_profile_image ,new Buffer(request.payload.image_data,"base64"), function(err){
						if(!err){
							User.findOne({"email": request.auth.credentials.user}, function(err,user){
								user.user_profile[0].profile_pic = user_profile_image
								user.save(function(err){
									if(err){
										reply(err);
									}else{
										UserStatus.update({"user_email": request.auth.credentials.user},{"profile_pic": user_profile_image}, { multi: true},function(err,result){
											console.log("result",result);
											reply(user_profile_image);
										});
									}
								});
							});
						}
					});
				}
			}
		},
		{
			method: "GET",
			path: "/user_profile/{member_id}",
			config: {
				auth: "simple-cookie-strategy",
				handler: function(request,reply){				
					User.find({"email": request.auth.credentials.user},function(err,user){
						var all_user_friends = user[0].friends
						var request_profile_member_id = request.params.member_id
						all_user_friends.forEach(function(friend){
							if(friend.member_id === request_profile_member_id){
								User.findOne({"member_id": friend.member_id}, function(err,user){
										reply.view("user_profile_visit",{ name: user.name,
																	location: user.user_profile[0].location,
																	description:  user.user_profile[0].description,
																	interests:  user.user_profile[0].interests,
																	profile_pic:  user.user_profile[0].profile_pic,
																	user_friends: null


										});
								});
							} 
						});	
					});
	
				}
			}
		}

	])
	next();
}

exports.register.attributes = {
	pkg: require('./package.json')
};