// unfortunately js on windows phone 8 ie10 is limited
var $parent = $('ul#content');

function initializeFeed(data) {
	var items = data.item;
	if (typeof items != 'undefined' && items.length > 0) {
		for(var i = 0; i <= items.length-1; i++) {
			addItem(items[i]);
		};
	}
}

function addItem(item) {
	$parent.append('<li><a href="'+ item.link +'">'+ shorten(item.title) +'</a><br /><span class="date">'+ item.pubDate +'</span></li>');
}

function shorten(title) {
	return (title.length > 50 ? title.substring(0, 49) +'&hellip;' : title)
}

function fetchFeed() {
	$.ajax({
		url: 'http://pwfantasy.com/feed/api/feed.php',
		dataType: 'json',
		success: initializeFeed
	});
}

$(document).ready(function() {
	fetchFeed();
});