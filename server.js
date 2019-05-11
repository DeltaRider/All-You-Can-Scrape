// Dependencies
var express = require("express");
var methodOverride = require('method-override');
var mongojs = require("mongojs");
var bodyParser = require('body-parser');
var axios = require("axios");
var cheerio = require("cheerio");

var PORT = process.env.PORT || 3000;
var app = express();

app.use(bodyParser());
app.use(express.static('public'));
app.use(methodOverride('_method'));

// Database configuration
var databaseUrl = process.env.MONGODB_URI || "platescraper_db";
var collections = ["scrapedData"];

// Hook mongojs config to db variable
var db = mongojs(databaseUrl , collections);

// Log any mongojs errors to console
db.on("error", function(error) {
  console.log("Database Error:", error);
});



// Routes
app.get("/restaurants", function(req, res) {
    db.scrapedData.find({}, function(error, restaurants) {
    if (error) {
        console.log(error);
    }
    else {
        var myObj = restaurants;
        res.json(myObj);
    }
    });
});

// Scrape data from one site and place it into the mongodb db
app.get("/scrape", function(req, res) {
    // Make a request via axios for the news section of `ycombinator`
    axios.get("https://projects.sfchronicle.com/2018/top-100-restaurants/").then(function(response) {
    // Load the html body from axios into cheerio
    var $ = cheerio.load(response.data);
    // For each element with a "title" class
    $("div.name").each(function(i, element) {
        // Save the text and href of each link enclosed in the current element
        var title = $(element).children("a").children(".rname").text();
        var link = $(element).children("a").attr("href");
        var info = $(element).siblings(".info").text();
        var vitals = $(element).siblings(".vitals").text();
        var pic = $(element).siblings("a").children(".image-wrapper").children("img").attr("data-src");

        // If this found element had both a title and a link
        if (title && link) {
            
            db.scrapedData.find({title: title}, function(err, data){

                if (data.length == 0 ){
                // Insert the data in the scrapedData db
                    db.scrapedData.insert({
                        title: title,
                        link: `https://projects.sfchronicle.com`+ link,
                        info: info,
                        vitals: vitals,
                        pic: pic,
                    },
                    function(err, inserted) {
                        if (err) {
                        // Log the error if one is encountered during the query
                        console.log(err);
                        }
                        else {
                        // Otherwise, log the inserted data
                        console.log(inserted);
                        }
                    });  
                }
            });
        
        }else {
            console.log(title, link, 'line 76')
        }
    });
    });

    // Send a "Scrape Complete" message to the browser
    res.json("Scrape Complete");
});





app.get("/infoscrape", function(req, res) {
    db.scrapedData.find({},function(err, results){
        var listArr = results.map(function(result){
            return result.link
        });
        for(i=0; i<listArr.length; i++){
            axios.get(listArr[i]).then(function(response){
                var $ = cheerio.load(response.data);
                $("div.article").each(function(i, element){
                    var title = $(element).siblings("p").text();
                    var pic1 = $(element).siblings(".carousel").children().children(".swiper-slide").children("img").eq(0).attr("data-noload-src");
                    var pic2 = $(element).siblings(".carousel").children().children(".swiper-slide").children("img").eq(1).attr("data-noload-src");
                    var pic3 = $(element).siblings(".carousel").children().children(".swiper-slide").children("img").eq(2).attr("data-noload-src");
                    var article = $(element).children("p").text();
                    var cuisine = $(element).siblings(".wrap").children(".infobox").children("div").eq(0).text();
                    var neighborhood = $(element).siblings(".wrap").children(".infobox").children("div").eq(1).text();
                    var phone = $(element).siblings(".wrap").children(".infobox").children("div").eq(2).text();
                    var telLink = $(element).siblings(".wrap").children(".infobox").children("div").eq(2).children("a").attr("href");
                    var noise = $(element).siblings(".wrap").children(".infobox").children("div").eq(3).children("i").attr("class");
                    var address = $(element).siblings(".wrap").children(".infobox").children("div").eq(4).text();
                    var mapLink = $(element).siblings(".wrap").children(".infobox").children("div").eq(4).children("a").attr("href");
                    var hours = $(element).siblings(".wrap").children(".infobox").children("div").eq(5).text();
                    var price = $(element).siblings(".wrap").children(".infobox").children("div").eq(6).text();
                    var website = $(element).siblings(".wrap").children(".infobox").children("div").eq(7).text();
                    var webLink = $(element).siblings(".wrap").children(".infobox").children("div").eq(7).children("a").attr("href");
                    var seats = $(element).siblings(".wrap").children(".infobox").children("div").eq(8).text();
                    var parking = $(element).siblings(".wrap").children(".infobox").children("div").eq(9).text();
                    var specialties = $(element).siblings(".wrap").children(".infobox").children("div").eq(10).text();

                    // console.log(title);
                    // console.log(pic1);
                    // console.log(pic2);
                    // console.log(pic3);
                    // console.log(article);
                    // console.log(cuisine);
                    // console.log(neighborhood);
                    // console.log(phone);
                    // console.log(telLink);
                    // console.log(noise);
                    // console.log(address);
                    // console.log(mapLink);
                    // console.log(hours);
                    // console.log(price);
                    // console.log(website);
                    // console.log(webLink);
                    // console.log(seats);
                    // console.log(parking);
                    // console.log(specialties);
                    
                    db.scrapedData.update(
                        { "title" : title },
                        { $set: { "pic1" : pic1, "pic2" : pic2, "pic3" : pic3, "article" : article, "cuisine" : cuisine, "neighborhood" : neighborhood, "phone" : phone, "telLink" : telLink, "noise" : noise, "address" : address, "mapLink" : mapLink, "hours" : hours, "price" : price, "website" : website, "webLink" : webLink, "seats" : seats, "parking" : parking, "specialties" : specialties} }
                    );
                });
            });
        };
    });

    res.send('ok')
});



app.get("/doc/:id", function(req, res) {
    db.scrapedData.findOne({
        _id: mongojs.ObjectId(req.params.id)
    }, function(err, doc) {
        res.json(doc)
    })
});


//comment
app.put("/comments/:id", function(req, res) {
    db.scrapedData.update(
        {"_id" : mongojs.ObjectId(req.params.id) },
        { $push : {"comment" : req.body.comment} },
        function (err, commentAdd) {
            db.scrapedData.findOne({
                _id: mongojs.ObjectId(req.params.id)
            }, function(err, doc) {
                res.json(doc)
            })
        });
});

db.students.update(
    { first_name: 'AA' },
    { $set:
       {
         "cours_reussis.0.name_school": 'ENSA'
       }
    }
 )



/*  
curl -X DELETE http://localhost:3000/songs/5cc288d471a416daebc0d4d6/
*/
app.delete("/delete/:id/:comment", function(req, res) {
db.scrapedData.update(
    {"_id" : mongojs.ObjectId(req.params.id) },
    { $pull : {"comment" : req.params.comment} },
    function(error, removed) {
        if (error) {
        res.send(error);
        }else {
        res.json(removed);
    }
});
});

// Listen on port 3001
app.listen(PORT, function() {
console.log('🌎 ==> Now listening on PORT %s! Visit http://localhost:%s in your browser!', PORT, PORT);
});
