var interests = ['Favorites','Snowboarding', 'Dogs', 'Biking', 'Pinball']
var favorites = []
var faveActive = false

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function shuffle(array) {
 	var currentIndex = array.length, temporaryValue, randomIndex;

	while (0 !== currentIndex) {
    	// Pick a remaining element...
	    randomIndex = Math.floor(Math.random() * currentIndex);
	    currentIndex -= 1;

	    // And swap it with the current element.
	    temporaryValue = array[currentIndex];
	    array[currentIndex] = array[randomIndex];
	    array[randomIndex] = temporaryValue;
  	}

  	var arr = []
  	for(var i = 0; i<10; i++){
  		arr[i] = array[i]
  	}

	return arr;
}

function buildGifButton(interest){
	var newRow = $('<div class="row">')
	var x =$('<i class="far fa-times-circle float-right rm">')

	if(interest === 'Favorites'){
		var button = $('<button class="btn btn-dark favorites">')
		// x.removeClass('rm').css('color', '#343A40')
		button.text(interest)
	}else{
		var button = $('<button class="btn btn-dark btn-gif">')
		button.text(interest).append(x)
	}

	newRow.append(button)
	$('#buttons').append(newRow)
}

function buildFilterButton(){
	var safe = $('<button class="btn btn-success mr-1 my-1 filter active" data-toggle="button" aria-pressed="true" id="sfw">')
	var nsfw = $('<button class="btn btn-danger mr-1  my-1 filter" data-toggle="button" aria-pressed="false" id="nsfw">')

	safe.text('SFW')
	nsfw.text('NSFW')

	$('#filters').append(safe).append(nsfw)
}

function buildCard(response){
	var results = response.data
	results = shuffle(results)

	var newRow = $('<div class="row">')

	results.forEach(function(element){
		var card = $('<div class="card my-2 mr-1">')
		var cardBody = $('<div class="card-body px-0 py-0">')
		var cardHeading = $('<div class="card-header">')
		var gif = $('<img class="card-img-top gif">')
		var notLike = $('<i class="far fa-thumbs-up float-right mt-1"></i>')

		cardHeading.text('Rating: ' + element.rating)

		gif.attr('src', element.images.fixed_height_still.url)
		gif.attr('animated', element.images.fixed_height.url)
		gif.attr('still', element.images.fixed_height_still.url)
		gif.attr('state', "still")
		gif.attr('rating', element.rating)

		notLike.attr('state', 'not-liked')

		card.append(cardHeading.append(notLike)).append(cardBody.append(gif))
		newRow.append(card)
	})

	return newRow
}

function buildFavoriteCard(array){
	var newRow = $('<div class="row">')

	array.forEach(function(element){
		var card = $('<div class="card my-2 mr-1">')
		var cardBody = $('<div class="card-body px-0 py-0">')
		var cardHeading = $('<div class="card-header">')
		var gif = $('<img class="card-img-top gif">')
		var favorite = $('<i class="fas fa-thumbs-up float-right mt-1"></i>')

		cardHeading.text('Rating: ' + element[0])

		gif.attr('src', element[2])
		gif.attr('still',element[2])
		gif.attr('animated', element[1])
		gif.attr('state', 'still')
		gif.attr('rating', element[0])

		favorite.attr('state', 'liked')

		card.append(cardHeading.append(favorite)).append(cardBody.append(gif))
		console.log(card)

		newRow.append(card)
	})

	return newRow
}
function getLikedData(object){
	var gif = $(object).parent().siblings('.card-body').children('.gif')

	var rating = gif.attr('rating')
	var animated = gif.attr('animated')
	var still = gif.attr('still')
	return [rating, animated, still]
}

function addToFavorites(array){
	favorites.push(array)
	localStorage.faves = JSON.stringify(favorites)
}

function removeFromFavorites(array){
	var index = favorites.indexOf(array)
	favorites.splice(index,1)
	localStorage.faves = JSON.stringify(favorites)
}

$(document).ready(function(){
	// console.log(localStorage.items, typeof localStorage.items, JSON.parse(localStorage.items))
	if(localStorage.items && localStorage.items != '["Favorites"]'){
		interests = JSON.parse(localStorage.items)
	}

	if(localStorage.items && localStorage.faves != '[]'){
		favorites = JSON.parse(localStorage.faves)
	}

	$('#new-interest').val('New Tag')

	var rating = '&rating=pg-13'
	
	interests.forEach(function(element) {
		buildGifButton(element)
	})

	buildFilterButton()

	$(document.body).on("click", ".filter", function(event){
		event.preventDefault()
		if($(this).text() === 'SFW'){
			rating = '&rating=pg-13'
			$(this).attr('aria-pressed','true').addClass('active')
			$('#nsfw').attr('aria-pressed','false').removeClass('active')
		}else{
			rating = '&rating=r'
			$(this).attr('aria-pressed','true').addClass('active')
			$('#sfw').attr('aria-pressed','false').removeClass('active')
		}
	})

	$(document.body).on("click", ".favorites", function() {
		faveActive = true
		$('#gifs').empty()
		newRow = buildFavoriteCard(JSON.parse(localStorage.faves))
      	$('#gifs').prepend(newRow)
	})

	$(document.body).on("click", ".btn-gif", function() {
		var curInterest = $(this).text()

		var queryURL = "https://api.giphy.com/v1/gifs/search?q=" + curInterest + rating + "&api_key=dc6zaTOxFJmzC";
    	
		$.ajax({
        	url: queryURL,
        	method: "GET"
      	}).then(function(response) {
      		newRow = buildCard(response)
      		$('#gifs').prepend(newRow)
      	})
    })

	$(document.body).on("click", "#new-interest", function(event) {
		$('#new-interest').val('')
	})

	$(document.body).on("click", "#run-search", function(event) {
		event.preventDefault()
		
		var interest = $('#new-interest').val().trim()
		interest = capitalizeFirstLetter(interest.toLowerCase())

		if(interests.indexOf(interest)<0){
			interests.push(interest)
			buildGifButton(interest)

			localStorage.items = JSON.stringify(interests)
			console.log(localStorage.items)
		}

		$('#new-interest').val("")
	})

    $(document.body).on("click", ".gif", function() {
    	if($(this).attr('state') === "still"){
    		$(this).attr('src', $(this).attr('animated'))
    		$(this).attr('state', 'animated')
    	}else{
    		$(this).attr('src', $(this).attr('still'))
    		$(this).attr('state', 'still')
    	}
    })

    $(document.body).on("click", ".fa-thumbs-up", function() {
    	if($(this).attr('state') === 'not-liked'){
    		var like = $('<i class="fas fa-thumbs-up float-right mt-1"></i>')
    		like.attr('state', 'liked')
    		$(this).parent().append(like)

    		var meta = getLikedData(this)
    		addToFavorites(meta)

    		$(this).remove()
    	}else{
     		var notLike = $('<i class="far fa-thumbs-up float-right mt-1"></i>')
    		notLike.attr('state', 'not-liked')
    		$(this).parent().append(notLike)

    		var meta = getLikedData(this)
    		removeFromFavorites(meta)

    		if(faveActive){
    			$(this).parent().parent().remove()
    		}
    		$(this).remove()   		
    	}
    })

    $(document.body).on("click", ".rm", function() {
    	var p = $(this).parent()
    	var gp = $(this).parent().parent()

    	var interest = p.text()

    	var index = interests.indexOf(interest)
    	console.log(interest, index, interests)
    	interests.splice(index, 1)

    	localStorage.items = JSON.stringify(interests)

    	gp.remove()

    })
})