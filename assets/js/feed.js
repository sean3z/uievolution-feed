// unfortunately js on windows phone 8 ie10 is limited
var $parent = $('ul#feed'), articles = [], _loading = false, ga = window.ga || function(){};

function initializeFeed(data) {
	$parent.empty();
	articles = [];
	var items = data.item || [];
	if (typeof items != 'undefined' && items.length > 0) {
		for(var i = 0; i <= items.length-1; i++) {
			var item = items[i];
			$parent.append('<li><a href="'+ item.link +'" data-article="'+ i +'">'+ item.title +'</a><br /><span class="date">'+ item.pubDate +'</span></li>');
			articles.push(item);
		};
	}

	$('#feed a').bind('click', function(e) {
		e.preventDefault();

		if (this.href == $('#article').data('href')) {
			$('#article, #feed').toggle();
			return;
		}

		var site = $('body').attr('class');
		ga('send', 'pageview', {
			'page': fragmentURL(site, this.href),
			'title': this.text
		});

		initializeArticle(site, this.href, $(this).data('article'));

		return false;
	});
}

function loading(state) {
	if (state) {
		$('#hamburger').addClass('loading');
	} else {
		$('#hamburger').removeClass('loading');
	}
	_loading = state;
}

function initializeArticle(site, href, articleId) {
	var data = articles[articleId];
	if (typeof data != 'undefined') {
		window.scrollTo(0,0);
		//var a = '<a href="/feed/" class="back">Back</a>&nbsp;|&nbsp;<a href="#" class="reload">Reload</a><br /><br />';
		var a = '<a href="/feed/" class="back">Back</a><br /><br />';
		$('#article').data('href', data.link).html(a + data.description +'<br /><br />'+ a);

		$('#article').find('img').width('auto');

		$('#article a.reload').bind('click', function (e) {
			e.preventDefault();
			$('#article').html('');
			//fetchArticle($('body').attr('class'), $('#article').data('href'));
			return false;
		});

		$('#article a.back').bind('click', function (e) {
			e.preventDefault();
			$('#article, #feed').toggle();
			return false;
		});
	}

	$('#article, #feed').toggle();
}

function fragmentURL(site, url) {
	try {
		url = url.replace(new URL(url).origin, '');	
	} catch (e) {
		url = url.replace(/^.*\/\/[^\/]+/, '');
	}

	return '/'+ site + url;
}

function fetchFeed(site, callback) {
	var site = site || 'dotnet';
	if (_loading) return;
	loading(true);
	$.ajax({
		url: 'api/feed.php',
		dataType: 'json',
		data: {site: site},
		success: function(data) {
			initializeFeed(data);
			if (typeof callback != 'undefined') callback();
			loading(false);
		},
		error: function (data) {
			loading(false);
		}
	});
}

function breakpoint() {
	var w = $(window).width(),
		breakpoint = 'small';

	if (w >= 400) {
		breakpoint = 'x-large';
	} else if (w >= 380) {
		breakpoint = 'large';
	} else if (w >= 360) {
		breakpoint = 'medium';
	}

	$('html').addClass(breakpoint);
}

$(document).ready(function() {
	breakpoint();
	fetchFeed();

	$('#hamburger').bind('click', function(e) {
		e.preventDefault();
		var $body = $('body'), site = $body.attr('class');
		site = (site == 'dotnet') ? 'pwtorch' : 'dotnet';
		ga('send', 'event', 'switchto', 'click', site)
		fetchFeed(site, function() {
			$body.removeClass('dotnet pwtorch').addClass(site);
			$('#feed').show();
			$('#article').hide();
		});
		return false;
	});
});
