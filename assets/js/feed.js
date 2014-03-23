(function ($) {
	function Feed(data) {
		this.data = data || {};
		this.parent = $('ul#content');

		this.__construct = function(data) {
			if (typeof data != 'undefined') {
				this.initializeFeed(data);
			}
		};

		this.addItem = function(item) {
			this.parent.append('<li><a href="'+ item.link +'">'+ item.title +'</a></li>');
		};

		this.initializeFeed = function(data) {
			var items = data.item;
			if (typeof items != 'undefined' && items.length > 0) {
				for(item in items) {
					// console.log('item', items[item]);
					this.addItem(items[item]);
				}
			}
		};

		this.__construct(data);
	}


	$(document).ready(function() {
		$.ajax({
			url: 'http://pwfantasy.com/feed/api/feed.php',
			dataType: 'json',
			success: Feed
		});
	});
})($);