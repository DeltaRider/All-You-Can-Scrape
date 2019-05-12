$(document).on("click", "#scrape", function(){
    var flag = $(this).attr("flag");
    if (flag == "on"){
        $.ajax({
            method: 'GET',
            url: '/scrape'
        }).then(function(){
            $("#loader").append(`
                <div id="overlay">
                    <img src="/assets/images/loading.gif" alt="Loading" />
                </div>
            `)
            console.log("scraped")
        })
        $.ajax({
            method: 'GET',
            url: '/infoscrape'
        }).then(function(){
            console.log("secondscraped")
            setTimeout(populate, 5000)
        })
        $(this).attr("flag", "off");
    } else {
        alert("Refresh page to scrape again.")
    }
});


function populate(){
    $.ajax({
        method: 'GET',
        url: '/restaurants'
    }).then(function(res){
        
        for (i=0; i<res.length; i++){
            insideFirstFor(i, res[i]);
        }
    })

    function insideFirstFor(i, ob){
        var keys = Object.keys(ob);
        var id = ob._id;
        var cuisine = ob.cuisine;
        var cuisineArr = cuisine.split("Cuisine");
        var neighbor = ob.neighborhood;
        var neighborArr = neighbor.split("Neighborhood");
        var phone = ob.phone
        var phoneArr = phone.split("Phone");
        var noise = ob.noise;
        var noiseArr = noise.split("fa ");
        var address = ob.address;
        var addressArr = address.split("Address");
        var hours = ob.hours;
        var hoursArr = hours.split("Hours");
        var price = ob.price;
        var priceArr = price.split("Price");
        var website = ob.website;
        var websiteArr = website.split("Website");
        var seats = ob.seats;
        var seatsArr = seats.split("Seats");
        var parking = ob.parking;
        var parkingArr = parking.split("Parking");
        var specialties = ob.specialties;
        var specialtiesArr = specialties.split("Specialties");
        var comm = ob.comment;
        var pic
        if (noiseArr[1] == "fa-bell"){
            pic = "./assets/images/bell.png";
        } if (noiseArr[1] == "fa-bomb"){
            pic = "./assets/images/bomb.png";
        };
        

        $('.data').append(`<div class="restaurant" id="${ob.title}" data="${ob._id}" flag="off">
                <img src="${ob.pic}">
                <img src="${ob.pic2}premium_landscape.jpg">
                <img src="${ob.pic3}premium_landscape.jpg">
                <p class="name">${ob.title}</p>
                <p class="info">${ob.info}</p>
                <div class="infobox hidden" id="${ob._id}">
                    <div class="section" id="cuisine"><span>Cuisine</span><br>${cuisineArr[1]}</div>
                    <div class="section" id="neighborhood"><span>Neighborhood</span><br>${neighborArr[1]}</div>
                    <div class="section" id="phone"><span>Phone</span><br><a href="${ob.telLink}">${phoneArr[1]}</a></div>
                    <div class="section" id="noise"><span>Noise</span><br><img src="${pic}"></div>
                    <div class="section" id="address"><span>Address</span><br><a href="${ob.mapLink}">${addressArr[1]}</a></div>
                    <div class="section" id="hours"><span>Hours</span><br>${hoursArr[1]}</div>
                    <div class="section" id="price"><span>Main Course Price</span><br>${priceArr[1]}</div>
                    <div class="section" id="website"><span>Website</span><br><a href="${ob.webLink}">${websiteArr[1]}</a></div>
                    <div class="section" id="seats"><span>Seats</span><br>${seatsArr[1]}</div>
                    <div class="section" id="parking"><span>Parking</span><br>${parkingArr[1]}</div>
                    <div class="section" id="specialties"><span>Specialties</span><br>${specialtiesArr[1]}</div>
                </div>
            </div>
            <form class="submit_comment" data-article-id="${ob._id}">
                <input id="input" type="text" name="comment" placeholder="Review ${ob.title}" required>
                <button id="comment">Add Comment</button>
            </form>
            <div id="comments"></div>
        `);
        
        
        

            if (keys.includes('comment')){
                console.log('line 109', 'comm', comm);
                console.log('line 110', 'comm.length', comm.length);
                for (i=0; i < comm.length; i++){
                    addCommentToPage(id, i, comm);
                }
            }

    }

    function addCommentToPage(id, i, comm){
        $(`.submit_comment[data-article-id="${id}"]`).next().append(`<p class="comments" data="${i}"><span class="num">${i + 1}</span><span class="comm">${comm[i]}</span></p>`)
    }

    $(document).ajaxStart(function(){
        $("#loader").css("display", "block");
    });
    $(document).ajaxComplete(function(){
        $("#loader").css("display", "none");
        $("body").css("background-color", "#E6FBFF");
    });
};

$(document).on("click", ".restaurant", function(){
    var flag = $(this).attr('flag');
    if (flag == "off"){
        $(this).attr("flag", "on");
        $(this).children(".infobox").removeClass("hidden");
    } if (flag == "on"){
        $(this).children(".infobox").addClass("hidden");
        $(this).attr("flag", "off");
    }
}).on("mouseover", ".restaurant", function(){
    $(this).attr("style", "box-shadow: 0px 0px 10px #99EEFF;")
}).on("mouseleave", ".restaurant", function(){
    $(this).attr("style", "")
});


$(document).on("submit", ".submit_comment", function(e){
    e.preventDefault()
    var iddd = $(this).attr("data-article-id");
    console.log(iddd);
    console.log($(this).serialize())
    $.ajax({
        method: 'PUT',
        url: `/comments/${$(this).attr("data-article-id")}`,
        data: $(this).serialize()
    }).then( function(res) {
        var commentsArr = res.comment;
        var num = commentsArr.length;
        console.log(iddd);
        $(`.submit_comment[data-article-id="${iddd}"]`).next().append(`
            <div class="ezdel"><span class="comments" data="${num-1}"><span class="num">${num}</span><span class="comm">${res.comment[num-1]}</span></span><button class="del">x</button><br></div>
        `);
        $(document).find('input:text').val('');
    })
})

$(document).on("click", ".del", function(e){
    e.preventDefault()
    var id = $(this).parent().parent().prev().attr("data-article-id");
    console.log(id);
    var comm = $(this).prev().children(".comm").text();
    console.log(comm);
    var del = $(this).parent();
    console.log(del);
    $.ajax({
        method: 'DELETE',
        url: `/delete/${id}/${comm}`,
        data: $(this).serialize()
    }).then( function() {
        $(document).find(del).remove();
    })
})