$( document ).ready(function() {
	$("#artist-input").submit(function(){
		$("#album-content").html("");
		var artist = $("#artist-input-text").val();
		query(artist);
    	return false;
	});
});


//query("The Beatles");


function query(artistName) {
	var wikipediaDomain = "https://en.wikipedia.org";
	getWikiPageHtml(
		artistName, 
		function(data) {
			var titlesAndLinks = getAlbumLinks(data);

			if (titlesAndLinks === undefined || titlesAndLinks.length == 0) {
				$("#album-content").append("We couldn't find any albums for this artist ***long sigh***.");
				return;
			}

			var reviewTables = [];
			titlesAndLinks.forEach(function(titleAndLink) {
				getWikiPageHtml(
					titleAndLink.link, 
					function(data) {
						var content = getWikiContent(data);
						var tableHtml = $(content).find("#mw-content-text > div > table.wikitable.floatright")[0];
						if (tableHtml === undefined) {
							console.log("No reviews found for:" + titleAndLink.title);
							return;
						}

						console.log("table:" + tableHtml);

						$(tableHtml).removeAttr("style");
						$(tableHtml).removeAttr("class");
						$(tableHtml).find("*").removeAttr("style");
						$(tableHtml).find("*").removeAttr("class");
						$(tableHtml).find("a").contents().unwrap();
						$(tableHtml).find("sup").remove();
						var stars = $(tableHtml).find("span[role=img]").toArray();
						stars.forEach(function(starsHtml) {
							$(starsHtml).replaceWith("<span>" + $(starsHtml).attr("title") + "</span>")
						});

						var titleAndTable = {
							"title" : titleAndLink.title,
							"tableHtml" : tableHtml
						};
						reviewTables.push(titleAndTable);

						render(titleAndTable);
						console.log(reviewTables);	
					},
					function(data) {
						$("#album-content").append("<p>We were able to find an article for this, but are you sure there are albums?</p>");
					}
				);
			});
		},
		function(data) {
			$("#album-content").append("<p>Hey guy, are you sure this artist exists?</p>");
		}
	);
}

function render(titleAndTable) {
	$("#album-content").append("<h2>" + titleAndTable.title + "</h2>")
	$("#album-content").append(titleAndTable.tableHtml);
}

function getWikiContent(rawWikiHtml) {
	var domNodes = $.parseHTML(rawWikiHtml);
	var content = "";
	domNodes.forEach(function(node) {
		if (node.id === "content") {
			content = node;
		}
	});
	return content;
}

function getAlbumLinks(artistPageHtml) {
	var wikipediaDomain = "https://en.wikipedia.org";
	var content = getWikiContent(artistPageHtml);
	var discogSection = $(content).find("#Discography").parent().nextAll("ul")[0];
	var links = $(discogSection).find("a").toArray();
	var titleLinkPairs = [];
	links.forEach( function(link) {
		var href = $(link).attr("href");
		var lastSlashIndex = href.lastIndexOf("\/");
		var localLink = href.substring(lastSlashIndex + 1, href.length);
		console.log(localLink);
		var titleLink = {
			"link"  : localLink,
			"title" : $(link).text()
		};
		titleLinkPairs.push(titleLink);	
	});

	console.log(titleLinkPairs);

	return titleLinkPairs;
}

function getWikiPageHtml(pageTitle, successCallback, failureCallback) {
	var formattedTitle = pageTitle.replace(/\s/g, '_');
	var wikipediaDomain = "https://en.wikipedia.org";
	var path = wikipediaDomain + "/wiki/" + formattedTitle;
	$.ajax(path, {
		success: function(data, status, xhr) {
			successCallback(data);
		},
		error: function(data) {
			console.log("Failed");
			failureCallback(data);
		},
		dataType: 'jsonp'
	});
}