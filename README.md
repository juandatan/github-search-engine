# github-search-engine
A search engine that searches GitHub repositories by keyword, that is sort-able by relevance and the repository's owner's number of followers, and filter-able by language.

## To run the program:
1. If not already installed, install the node packages `connect` and `serve-static` by running `npm install connect serve-static` in the terminal.
2. Start the server by navigating to the root directory and running `node server.js` in the terminal.
3. In a browser of your choice, navigate to http://localhost:8080/index.html.
4. Start searching!

## Design decisions
1. **Sorting and filtering**

Rather than simply return a list of found repositories in random order to the user, I implemented sorting and filtering functionalities so that the user can draw more insight about his/her search results. By enabling sorting, the user can view  the repositories which are most relevant to his/her search, or the repositories with owners who have the most number of followers, first. These repositories are more likely to contain content which the user is trying to find, and hence sorting will enable the user to end their search earlier. Filtering by language is also an important capability, as the user may have already started a project in a certain language, and may want to reference code in that particular language. Such a capability for filtering will allow the user to quickly find the repositories containing code written in his/her desired language, rather than have him/her step through each result to find them. 

2. **Considering GitHub's Search API rate limits**

To allow for sorting by number of followers, the number of followers for the owner of each repository found by the search has to be queried in a separate GET request. However, GitHub's Search API limits these queries to around 60 per minute. I decided to display only 20 search results for each search request, so that at least 3 queries can be made within a short span of time. This should not take away from the user's experience, because the search results returned by GitHub's Search API are sorted by relevance, and offering 20 of the most relevant repositories per search is an actionable selection for the user. This would then also allow the user to sort these repositories by their owner's number of followers, so that they may have easy access to the most popular programmers' repositories first.

To suggest further steps to increase the volume of search results returned, one may write a function that issues a GET request for the next 20 results for the same search after a certain time delay - say, one request per minute. This can be done using the `setInterval()` or `setTimeout()` function in Javascript. This way, as long as the user stays on the page (as he/she is browsing a found repository in another tab, for instance), the search results will supplemented periodically. The user can thereby have access to more search results as he/she continues to use the search engine, while avoiding having their requests be denied by GitHub for exceeding the rate limit.

Alternatively, one may re-program the page to only make a GET request for the found repository's owner's number of followers when the user clicks on the search result for more information. Now, unless the user clicks on 60 results within a minute (which is unlikely), the rate limit will not be exceeded, and the user can have access to more repository information. However, this will remove the sorting functionality of the search engine. I decided against this, because knowledge of which repositories have the most reputable owners will be valuable to the user, given that there is a higher probability for these repositories to contain robust, well-written code.

## Design process
1. Construct the URL for the GET request according to the keywords given in the search input box, and make the GET request to obtain the JSON object containing information about the search results.
2. Append each search result as a new row in the table of search results.
3. For each search result, append information about the repository's description, URL, number of followers, and language within the corresponding row of the table. To get the repository's owner's number of followers, make another GET request to the `followers_url` item (returned in the initial search request) and get the length of the returned JSON object.
4. Implement clicking functionality by changing the display property of the appended information to bring it out of hiding when a particular row is clicked.
5. Implement sorting by followers by comparing each result's number of followers.
6. Implement sorting by relevance by comparing each result's relevance score, as given by the `score` item given in the JSON object returned in the initial search request.
7. Implement filtering by language by emptying out the table's row elements, and re-appending those which have the desired language, as given by the `language` item given in the JSON object returned in the initial search request.
