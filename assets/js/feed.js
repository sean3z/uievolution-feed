// unfortunately js on windows phone 8 ie10 is limited
var $parent = $('ul#content'), loading = false, ga = window.ga || function(){};

function initializeFeed(data) {
	$parent.empty();
	var items = data.item;
	if (typeof items != 'undefined' && items.length > 0) {
		for(var i = 0; i <= items.length-1; i++) {
			addItem(items[i]);
		};
	}

	$('#content a').bind('click', function(e) {
		e.preventDefault();
		console.log('hit');
		var site = $('body').attr('class');
		ga('send', 'pageview', {
			'page': fragmentURL(site, this.href),
			'title': this.text
		});
		fetchArticle(site, this.href, function() {
			$('#article, #content').toggle();
		});
		return false;
	});
}

function initializeArticle(data) {
	var data = data || {};
	if (typeof data.article != 'undefined') {
		var a = '<a href="/feed/" class="back">Back</a>&nbsp;|&nbsp;<a href="#" class="reload">Reload</a><br /><br />';
		$('#article').data('href', data.url).html(a + data.article + a);

		$('#article a.reload').bind('click', function (e) {
			e.preventDefault();
			fetchArticle($('body').attr('class'), $('#article').data('href'));
			return false;
		});

		$('#article a.back').bind('click', function (e) {
			e.preventDefault();
			$('#article, #content').toggle();
			return false;
		});
	}
}

function fragmentURL(site, url) {
	try {
		url = url.replace(new URL(url).origin, '');	
	} catch (e) {
		url = url.replace(/^.*\/\/[^\/]+/, '');
	}

	return '/'+ site + url;
}

function addItem(item) {
	$parent.append('<li><a href="'+ item.link +'">'+ shorten(item.title) +'</a><br /><span class="date">'+ item.pubDate +'</span></li>');
}

function shorten(title) {
	return (title.length > 50 ? title.substring(0, 49) +'&hellip;' : title)
}

function fetchFeed(site, callback) {
	var site = site || 'dotnet';
	if (loading) return;
	loading = true;
	$.ajax({
		url: 'api/feed.php',
		dataType: 'json',
		data: {site: site},
		success: function(data) {
			initializeFeed(data);
			if (typeof callback != 'undefined') callback();
			loading = false;
		},
		error: function (data) {
			loading = false;
		}
	});
}

function fetchArticle(site, url, callback) {
	var site = site || 'dotnet';
	if (loading) return;
	loading = true;
	$.ajax({
		url: 'api/article.php',
		dataType: 'json',
		data: {type: site, article: url},
		success: function(data) {
			initializeArticle(data);
			if (typeof callback != 'undefined') callback();
			loading = false;
		},
		error: function (data) {
			loading = false;
			window.location = this.href;
		}
	});
}

$(document).ready(function() {
	fetchFeed();

	$('.hamburger a').bind('click', function(e) {
		e.preventDefault();
		var $body = $('body'), site = $body.attr('class');
		site = (site == 'dotnet') ? 'pwtorch' : 'dotnet';
		ga('send', 'event', 'switchto', 'click', site)
		fetchFeed(site, function() {
			$body.removeClass('dotnet pwtorch').addClass(site);
			$('#content').show();
			$('#article').hide();
			$('.logo img').toggle();
		});
		return false;
	});
});

$(window).bind('popstate', function (event) {
	$('#article, #content').toggle();
});