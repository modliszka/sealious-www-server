module.exports = function(www_server, dispatcher, dependencies){

    url = "/api/v1/users";

    www_server.route({
        method: "GET",
        path: url,
        handler: function(request, reply){
            var context = www_server.get_context(request);
            dispatcher.users.get_all_users(context)
            .then(function(users){ // wywołanie metody z dispatchera webowego
                reply(users);
            })
        }
        // hanlder GET ma zwrócić dane użytkowników w obiekcie JSONowym
    });

    www_server.route({
        method: "GET",
        path: url + "/{user_id}",
        handler: function(request, reply){
            var context = www_server.get_context(request);
            dispatcher.users.get_user_data(context, request.params.user_id)
                .then(function(user_data){ // wywołanie metody z dispatchera webowego
                    reply(user_data);
                })
                .catch(function(error){
                    reply(error);
                })

            }
        // hanlder GET ma zwrócić dane konkretnego użytkownika w obiekcie JSONowym
    });


    www_server.route({
        method: "POST",
        path: url,
        handler: function(request, reply){
            var context = www_server.get_context(request);
            Sealious.Dispatcher.users.create_user(context, request.payload.username, request.payload.password)
            .then(function(response){
                reply().redirect("/login.html#registered");
            })
            .catch(function(error){
                reply(error);
            })          
        }
        // handler POST ma stworzyć usera o podanej nazwie i haśle
    });

    www_server.route({
        method: "PUT",
        path: url+"/{user_id}",
        handler: function(request, reply){
            var context = www_server.get_context(request);
            dispatcher.users.update_user_data(context, request.params.user_id, request.payload)
            .then(function(response){
                reply();
            })
        }
    });

    www_server.route({
        method: "DELETE",
        path: url+"/{user_id}",
        handler: function(request, reply){
            var context = www_server.get_context(request);
            dispatcher.users.delete_user(context, request.params.user_id)
            .then(function(user_data){
                reply(user_data);
            })
            .catch(function(error){
                reply(error);
            })
        }
    })

    www_server.route({
        method: "GET",
        path: url+"/me",
        handler: function(request, reply){
            var context = www_server.get_context(request);
            var user_id = context.get("user_id");
            if(user_id===false){
                reply(new Sealious.Errors.UnauthorizedRequest("You need to log in first."));
            }else{
                reply().redirect(url+"/"+user_id);
            }
        }
    });

    www_server.route({
        method: "POST",
        path: "/login",
        handler: function(request, reply) {
            var context = www_server.get_context(request);
            Sealious.Dispatcher.users.password_match(context, request.payload.username, request.payload.password)
            .then(function(user_id){
                var session_id = www_server.new_session(user_id);
                if(request.payload.redirect_success){
                    reply().state('SealiousSession', session_id).redirect(request.payload.redirect_success);
                }else{
                    reply("http_session: Logged in!").state('SealiousSession', session_id);
                }
            })
            .catch(function(error){
                reply(error);
            })
        }
    });

    www_server.route({
        method: "POST",
        path: "/logout",
        handler: function(request, reply) {
            var context = www_server.get_context(request);
            www_server.kill_session(request.state.SealiousSession);
            reply().redirect("/login.html");
        }
    });

    www_server.route({
        method: "GET",
        path: "/api/v1/make_coffee",
        handler: function(request, reply) {
            Sealious.Logger.transports.console.level = "lazyseal";
            Sealious.Logger.lazyseal("Trying to make coffee...");
            Sealious.Logger.lazyseal("Oops, I'm a teapot.");
            Sealious.Logger.transports.console.level = "info";
            reply().code(418);
        }
    });

}
/*
    www_server.route({
        method: "POST",
        path: "/api/v1/files",
        config: {
            payload: {
                maxBytes: 209715200,
                output: 'stream',
                parse: true
            },
            handler: function(request, reply) {
                var files = request.payload["files"];

                if (!files[0]) {
                    files = [files];
                }
                
                var files_less = [];
                for(var i in files){
                    files_less.push({
                        filename: files[i].hapi.filename,
                        buffer: files[i]["_data"]
                    });
                }

                var files_data = {
                    files: files_less, 
                    owner: www_server.get_user_id(request.state.SealiousSession)
                };

                var files_response = dispatcher.files.save_file(files_data);
                //var files2_response = dispatcher.files.save_file(files_data, "./upload"); //custom path
                reply(files_response);
            }
        }
    });

    www_server.route({
        method: "GET",
        path: "/api/v1/files",
        config: {
            handler: function(request, reply) {
                var owner = www_server.get_user_id(request.state.SealiousSession)

                var files_list = dispatcher.files.get_list(owner);
                reply(files_list);
            }
        }
    });

    www_server.route({
        method: "PUT",
        path: "/api/v1/files/{filename}",
        config: {
            handler: function(request, reply) {
                var new_name = request.payload.new_name;
                var state = dispatcher.files.change_name(request.params.filename, new_name);
                reply();
            }
        }
    });
*/