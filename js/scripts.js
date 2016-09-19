//Google Map
var map;
// markers
var markers = [];
var restaurantsList = [];

//firebase 
var config = {
    apiKey: "AIzaSyCBnCsbkbalaMmYSUS5K6cOWq_vhW7ppDU",
    authDomain: "cool-rad-hip-map.firebaseapp.com",
    databaseURL: "https://cool-rad-hip-map.firebaseio.com",
    storageBucket: "cool-rad-hip-map.appspot.com",
};
firebase.initializeApp(config);
var db = firebase.database();
var user;

//vue
var vm;
//Vue.config.debug = true;

//jquery ready function
$(function(){
    var styles = [];
    var options = {
        center: {lat: 40.712943, lng: -74.012881}, //NYC coordinates
        zoom: 11,
        styles: styles
    };
    // get DOM node in which map will be instantiated
    var canvas = $("#map-canvas").get(0);

    // instantiate map
    map = new google.maps.Map(canvas, options);
    
    //make the map appear inside a bootstrap column
    $(window).resize(function () {
        var h = $(window).height(),
            offsetTop = 60; // Calculate the top offset
    
        $('#map-canvas').css('height', (h - offsetTop));
    }).resize();
    
    //send the search query to get data from foursquare
    $("#form-search").submit(function(evt) {
        evt.preventDefault();
        var query = $("#form-search input[name=query]").val();
        restaurants(query);
    });
    
    //register
    $("#registerModal").submit(function(evt){
        evt.preventDefault();
        var email = $("#registerModal input[name=username]").val() + "@unknown.com";
        var password = $("#registerModal input[name=password]").val();
        var credential = firebase.auth.EmailAuthProvider.credential(email, password);
        firebase.auth().currentUser.link(credential)
        .then(function(result) {
            //success
            console.log(result);
            $("#registerModal .modal-footer").empty();
            $("<div></div>")
                .addClass("alert alert-success text-center")
                .attr("role", "alert")
                .text("Congrats! You've claimed " + $("#registerModal input[name=username]").val() + " as your username.")
                .appendTo("#registerModal .modal-footer");
            vm.anon = false;
            setTimeout(function(){
                $("form[name='form-register']").trigger("reset");
                $("#registerModal .modal-footer").empty();
                $("#registerModal").modal('hide');
            }, 3000);
        }, function(error) {
            // Handle Errors here.
            var errorCode = error.code;
            var errorMessage = error.message;
            console.log(errorCode);
            console.log(errorMessage);
            if (errorCode == "auth/email-already-in-use") {
                $("#registerModal .modal-footer").empty();
                $("<div></div>")
                    .addClass("alert alert-danger text-center")
                    .attr("role", "alert")
                    .text("Sorry. That username is already in use. Please choose another.")
                    .appendTo("#registerModal .modal-footer");
            }
            
        });
        
    });
    
    //login
    $("#loginModal").submit(function(evt){
        evt.preventDefault();
        var username = $("#loginModal input[name=username]").val();
        var email = username + "@unknown.com";
        var password = $("#loginModal input[name=password]").val();
        firebase.auth().signInWithEmailAndPassword(email, password)
            .then(function(data){
                console.log(data);
                $("#loginModal .modal-footer").empty();
                $("<div></div>")
                    .addClass("alert alert-success text-center")
                    .attr("role", "alert")
                    .text("Congrats! You're logged in as " + username + ".")
                    .appendTo("#loginModal .modal-footer");
                setTimeout(function(){
                    $("form[name='form-login']").trigger("reset");
                    $("#loginModal .modal-footer").empty();
                    $("#loginModal").modal('hide');
                }, 3000);
            }, function(error){
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode);
                console.log(errorMessage); 
                $("#loginModal .modal-footer").empty();
                $("<div></div>")
                    .addClass("alert alert-danger text-center")
                    .attr("role", "alert")
                    .text("Sorry. Username or password is incorrect. Try again.")
                    .appendTo("#loginModal .modal-footer");
            });
    });
    
    //logout
    $("#logout").click(function(){
         firebase.auth().signOut();
    });
    
    //login anonymously
    firebase.auth().onAuthStateChanged(function(userid) {
        if (userid) {
            // User is signed in.
            var isAnonymous = userid.isAnonymous;
            vm.anon = isAnonymous;
            user = userid.uid;
            console.log(user);
            
            vm.$bindAsArray("list", db.ref("users/" + user + "/list/"));
            // ...
        } else {
            // User is signed out.
            // ... then log back in anonymously
            firebase.auth().signInAnonymously().catch(function(error) {
                // Handle Errors here.
                var errorCode = error.code;
                var errorMessage = error.message;
                console.log(errorCode);
                console.log(errorMessage);
            });
        }
        // ...
    });
    
    firebase.auth().signInAnonymously().catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        console.log(errorCode);
        console.log(errorMessage);
    });
    
    vueStart();
    
    //material design
    $.material.init();
    
    
});



function restaurants(input) {
    var sw = map.getBounds().getSouthWest().toJSON();
    var ne = map.getBounds().getNorthEast().toJSON();
    var parameters = {
        client_id: "WGWS12ZMNIMCPUEBTOTMSZGZZKRQKI2P121UPO1SQKGA1WGD",
        client_secret: "PA0PRRAC2HZEUGKJBMYI1E41U4DEJR1RYFWIUZVVFDQIH4Q0",
        v: "20160830",
        intent: "browse",
        sw: sw.lat + "," + sw.lng,
        ne: ne.lat + "," + ne.lng,
        query: input,
        limit: 10,
        categoryId: "4d4b7105d754a06374d81259"
        
    };
    $.getJSON("https://api.foursquare.com/v2/venues/search", parameters)
    .done(function(data, textStatus, jqXHR){
        //remove markers
        markers.forEach(function(i){
            i.setMap(null);
        });
        markers = [];
        //remove restaurants
        restaurantsList = [];
        //add restaurants
        restaurantsList = data.response.venues;
        //add marker to markers
        data.response.venues.forEach(function(i, index){
            var position = new google.maps.LatLng(i.location.lat,i.location.lng);
            var image = i.categories[0].icon.prefix + "bg_32" + i.categories[0].icon.suffix;
            var name = i.name;
            var marker = new google.maps.Marker({
                position: position,
                icon: image,
                title: name,
                index: index
            });
            marker.addListener('click', function(){
                health(restaurantsList[index]);
                checkins(restaurantsList[index]);
                reserve(restaurantsList[index]);
                rating(restaurantsList[index]);
                info(restaurantsList[index]);
            });
            markers.push(marker);
        });
        //display markers
        markers.forEach(function(i){
            i.setMap(map);
        });
    })
    .fail(function(jqXHR, textStatus, errorThrown) {

         // log error to browser's console
         console.log(errorThrown.toString());
     });
}

function health(rest){
    if(rest.contact.phone == undefined){
        $("#grade").text("No Grade. Can't find it.");
        //change panel color
        $("#grade").parent().parent().removeClass().addClass("panel panel-primary");
    }
    else{
        var parameters = {
            "$$app_token": "chsAufQrOVULSDNTQxr7jqgeU",
            "phone": rest.contact.phone,
            "$select": "dba,grade,grade_date",
            "$order": "grade_date DESC",
            "$where": "grade IS NOT NULL",
            "$limit": 50
        };
        $.getJSON("https://data.cityofnewyork.us/resource/9w7m-hzhe.json", parameters)
        .done(function(data, textStatus, jqXHR){
            if(data.length == 0){
                $("#grade").text("No Grade at all.");
                //change panel color
                $("#grade").parent().parent().removeClass().addClass("panel panel-primary");
            }
            else{
                $("#grade").text(data[0].grade);
                //change panel color
                if (data[0].grade == "A"){
                    $("#grade").parent().parent().removeClass().addClass("panel panel-success");
                } else if (data[0].grade == "B") {
                    $("#grade").parent().parent().removeClass().addClass("panel panel-warning");
                } else if (data[0].grade == "C") {
                    $("#grade").parent().parent().removeClass().addClass("panel panel-danger");
                } else {
                    $("#grade").parent().parent().removeClass().addClass("panel panel-primary");
                }
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
    
             // log error to browser's console
             console.log(errorThrown.toString());
        });
    }
}

function checkins(rest) {
    $("#checkins").text(rest.stats.checkinsCount);
}

function reserve(rest){
    if(rest.location.address == undefined){
        $("#reserve").text("Can't reserve because no address.");
        //change panel color
        $("#reserve").parent().parent().removeClass().addClass("panel panel-primary");
    }
    else{
        var parameters = {
            address: rest.location.address
        };
        $.getJSON("https://opentable.herokuapp.com/api/restaurants", parameters)
        .done(function(data, textStatus, jqXHR){
            console.log(data);
            if(data.total_entries == 0){
                $("#reserve").text("No Reservations.");
                $("#reserve").parent().parent().removeClass().addClass("panel panel-info");
                
            }
            else{
                $("#reserve").html($("<a></a>")
                .attr("href", data.restaurants[0].reserve_url)
                .attr("target", "_blank")
                .text("Click here to reserve."));
                $("#reserve").parent().parent().removeClass().addClass("panel panel-success");
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
    
             // log error to browser's console
             console.log(errorThrown.toString());
        });
    }
    
}

function rating(rest){
    var url = "https://api.foursquare.com/v2/venues/" + rest.id + "/";
    var parameters = {
            client_id: "WGWS12ZMNIMCPUEBTOTMSZGZZKRQKI2P121UPO1SQKGA1WGD",
            client_secret: "PA0PRRAC2HZEUGKJBMYI1E41U4DEJR1RYFWIUZVVFDQIH4Q0",
            v: "20160830"
        };
        $.getJSON(url, parameters)
        .done(function(data, textStatus, jqXHR){
            console.log(data);
            if (data.response.venue.rating == undefined){
                $("#rating").text("No rating available.");
                $("#rating").parent().parent().removeClass().addClass("panel panel-primary");
                $("#rating").parent().siblings(".panel-heading").removeAttr("style");
            }
            else {
                $("#rating").text(data.response.venue.rating);
                $("#rating").parent().siblings(".panel-heading").attr("style", "background-color: #" + data.response.venue.ratingColor);
            }
        })
        .fail(function(jqXHR, textStatus, errorThrown) {
    
             // log error to browser's console
             console.log(errorThrown.toString());
        });
    
}

function info(rest){
    $("#info").empty();
    var content = rest.name + "<br>" + rest.location.address + "<br>" + rest.location.formattedAddress[1];
    $("#info").html(content);
    
    if($("#addButton").attr("disabled")!=undefined){
        $("#addButton").attr("disabled", false);
    }
    $("#addButton").off("click");
    $("#addButton").click(function(){
        vm.add(rest.name);
    });
}

function vueStart(){
    vm = new Vue({
        el: '#fav',
        data: {
            anon: true
        },
        firebase: {
            list: db.ref("users/" + user + "/list/")
        },
        methods: {
            remove: function (key) {
                db.ref("users/" + user + "/list/").child(key).remove();
            },
            add: function(name) {
                db.ref("users/" + user + "/list/").push(name);
            }
        }
    });
    console.log(user);
}