let url;
let resultCount = 1;
let currDisplay = {};
let repoMap = {};
let languages = new Set();
let currSort = "Relevance";

function searchCallback(xmlHttp) {
  displaySearchResults(JSON.parse(xmlHttp.responseText));
}

function getSearchResults(url, callback){
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      callback(xmlHttp);
    } 
//    else {
//      console.error(xmlHttp.statusText);
//    }

  };
  xmlHttp.open("GET", url, true);
  xmlHttp.send(null);
}

function updateSearchResults(language) {
  
  console.log(language);

  currDisplay = {};
  
  if (language == "All") {
    currDisplay = repoMap;
  } else {
    for (id of Object.keys(repoMap)) {
      if (repoMap[id].language == language) {
        currDisplay[id] = repoMap[id];
      } 

    }
  }
    
  sortRepos(currDisplay, currSort);
  
}

function sortRepos(repoMap, type) {
  
  $("#search-results").empty();
  resultCount = 1;
  
  let repoArray = $.map(repoMap, function(value) {
    return [value];
  });
  if (type == "Relevance") {
    repoArray.sort(function(a, b) {
      return b.relevance - a.relevance;
    })
  } else if (type == "Followers") {
    repoArray.sort(function(a, b) {
      return b.followers - a.followers;
    })
  }
  
  console.log(repoArray);
  
  $("#search-results").empty();
  resultCount = 1;
  for (let i = 0; i < repoArray.length; i++) {
    $("#search-results").append("<tr><td id=\"" + repoArray[i].id + "\">" + resultCount.toString() + "</td><td class=\"" + repoArray[i].id + "\" id=\"" + repoArray[i].id + "\">" + repoArray[i].full_name + "</td></tr>");
    appendInfo(repoArray[i].id);
    resultCount++;
  }
}

function followersCallback(id, xmlHttp) {
  
  repoMap[id].followers = xmlHttp.responseText.length;
  appendInfo(id); 
  
  console.log(xmlHttp.getAllResponseHeaders());
}

// NOW HERE
function getFollowers(id, url, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function () {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
      followersCallback(id, xmlHttp);
    } 
//    else {
//      console.error(xmlHttp.statusText);
//    }

  };
  xmlHttp.open("GET", url, true);
  xmlHttp.send(null);
}

function appendInfo(id) {
  $("." + id).append("<br><div class=\"" + id.toString() + "-info hidden\"></div>");
  const $cell = $("." + id.toString() + "-info");
  $cell.append("<div class=\"col-xs-12\" id=\"" + id.toString() + "\"><b id=\"" + id.toString() + "\">Description</b>: " + repoMap[id].description + "</div>");
  $cell.append("<div class=\"col-xs-12\" id=\"" + id.toString() + "\"><b id=\"" + id.toString() + "\">URL</b>: <a href=\"" + repoMap[id].url + "\">" + repoMap[id].url + "</a></div>");
  $cell.append("<div class=\"col-xs-6\" id=\"" + id.toString() + "\"><b id=\"" + id.toString() + "\">Language</b>: " + repoMap[id].language + "</div>");
  $cell.append("<div class=\"col-xs-6\" id=\"" + id.toString() + "\"><b id=\"" + id.toString() + "\">Followers</b>: " + repoMap[id].followers.toString() + "</div>");
}

function displaySearchResults(results) {
  console.log(results);
  
//  lastPage = Math.ceil(results.total_count / 100)
//  if (lastPage > 10) {
//    lastPage = 10;
//  }
  
  if ($("#results-panel").is(":hidden")) {
    $("#results-panel").toggleClass("hidden");  
  }
  
  for (result of results.items) { 
      
    $("#search-results").append("<tr><td id=\"" + result.id + "\">" + resultCount.toString() + "</td><td class=\"" + result.id + "\" id=\"" + result.id + "\">" + result.full_name + "</td></tr>");
    
    getFollowers(result.id, result.owner.followers_url, followersCallback);
    
    repoMap[result.id] = {
      id: result.id,
      full_name: result.full_name,
      language: result.language,
      url: result.html_url,
      description: result.description,
      relevance: result.score
    }
    
    languages.add(result.language);
    resultCount++;
  }
  
  currDisplay = repoMap;
  
  for (language of languages) {
    $(".language").append("<option value=\"" + language + "\">" + language + "</option>");
  }
    
}

$(document).ready(function() {
  
  $("#search").submit(event => {
    
    event.preventDefault();
    
    if ($("#search-query").val() != "") {
      resultCount = 1;
      $("#search-results").empty();

      repoMap = {};

      let keywords = $("#search-query").val().trim().split(/ +/);

      url = "https://api.github.com/search/repositories?q=";
      for (let i = 0; i < keywords.length; i++) {
        url += keywords[i];
        if (i != keywords.length - 1) {
          url += "+";
        } 
      }

      url += "&page=1&per_page=6";
      getSearchResults(url, searchCallback);
    
    }
    
  });
  
  $("div.panel-body table").on("click", function(event) {
    let id = $(event.target).attr("id");
    const $clicked = $("." + id + "-info");

    $("div.panel-body div").each(function () {
      if($(this).is(":visible")){
        $(this).toggleClass("hidden");
      }
    });
    
    $clicked.toggleClass("hidden");
    
  });
  
  $(".language").change(function () {
    updateSearchResults($(this).val());
  });
  
  $(".sort").click(function(event) {
    let newSort = $(event.target).find("input").val();
    if (newSort != currSort) {
      sortRepos(currDisplay, newSort);
      currSort = newSort;
    }
  });
  
});

function getNewURL(newPage) {
  let newURL = url.slice(0, url.length - currPage.toString().length);
  newURL += newPage.toString();
  return newURL;
}

