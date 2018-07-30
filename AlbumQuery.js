query("The Beatles");


function query(artistName) {
	getWikiPageHtml(
		artistName, 
		function(data) {
			var links = getAlbumLinks(data);

			console.log(links);
			//var pageHtml = $(data);
			//console.log(pageHtml);
			/*var titles = getDiscogPageAlbumTitles(data);
			titles.forEach(function(title) {
				getWikiPageHtml(title, function(data) {
					console.log("results for " + title);
					var content = data.query.pages[0].revisions[0].content;
					console.log(content);
				}, 
				function(data) {

				});
			});*/
		},
		function(data) {
			// Try getting regular artist page albums
		}
	);
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
	console.log(artistPageHtml);
	var content = getWikiContent(data);
	var discogSection = $(content).find("#Discography").parent().nextAll("ul")[0];
	var links = $(discogSection).find("a");
	var titleLinkPairs = [];
	links.forEach(function(link) {
		var titleLink = {
			"link"  : wikipediaDomain + $(link).attr("href"),
			"title" : $(link).text()
		};
		titleLinkPairs.push(titleLink);
	});

	return titleLinkPairs;
}

function getDiscogPageAlbumTitles(discogPageHtml) {
	var content = getWikiContent(discogPageHtml);
	var markdownLinesWithLinks = content.match(/.*row.*\[\[.*\]\].*/g);
	console.log(content);
	var titles = [];
	markdownLinesWithLinks.forEach(function(line) {
		var startPos = line.indexOf("[[") + 2;
		var endPos = line.indexOf("]]");
		var link = line.substring(startPos, endPos);
		var cleanedUpLink;
		if (link.indexOf('\|') !== -1) {
			cleanedUpLink = link.substring(0, link.indexOf('\|'));
		} else {
			cleanedUpLink = link;
		}
		titles.push(cleanedUpLink);
	});
	return titles;
}

function getWikiPageHtml(pageTitle, successCallback, failureCallback) {
	var formattedTitle = pageTitle.replace(/\s/g, '_');
	var wikipediaDomain = "https://en.wikipedia.org";
	var path = wikipediaDomain + "/wiki/" + formattedTitle;
	$.ajax(path, {
		success: function(data, status, xhr) {
			if (status === "success") {
				successCallback(data);
			} else {
				failureCallback(data);
			}
		}
	});
}