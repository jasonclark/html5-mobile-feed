// the init() function gets invoked immediately to replace all links to be handled by AJAX requests
!function init() {

  const mainElement = document.querySelector("main");

  convertLinks();

  // converts navigation links to be handled by JS
  function convertLinks(documentRoot) {
    if (!documentRoot) documentRoot = document;

    // get all navigation links
    const links = documentRoot.querySelectorAll("header nav ul li a");
    //const links = documentRoot.querySelectorAll("a");

    // hack to convert the NodeList to an Array... JavaScript :(
    Array.prototype.slice.call(links)
      .filter(link => // remove all links that aren't local. We are only interested in relative links.
        link.getAttribute("href").indexOf("http") !== 0)
      .forEach(link => {
        const title = link.innerHTML;

        link.addEventListener("click", e => {

          // make sure that Cmd- or Ctrl-Click still opens the link in a new tab
          if (e.metaKey || e.ctrlKey) return;

          // make sure that the browser doesn't actually follow the link
          e.preventDefault();

          goToPage(link.getAttribute("href"), title);
        });
      });

  }

  // setup the history change event listener to handle when the user clicks the back button.
  window.onpopstate = event => {
    const href = event.state.href;
    loadPage(href);
  };

  // sets the proper history state, and calls loadPage() with the 'href'
  function goToPage(href, title) {
    history.pushState({
      href
    }, title, href);
    loadPage(href);
  }

  // loads the page from href and replaces the #main content with it.
  function loadPage(href) {
    console.log(`Loading page ${href}`);

    mainElement.setAttribute("aria-busy", "true");

    // firing off a standard AJAX request
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = () => {
      if (xmlhttp.readyState == 4) {
        if (xmlhttp.status == 200) {
          setTimeout(() => {
            finishedLoading(xmlhttp.response);
          });

        } else {
          alert("something else other than 200 was returned");
        }
      }
    }
    
    xmlhttp.open("GET", href, true);
    // tells the browser to retrieve the response as a HTML document
    xmlhttp.responseType = "document";
    xmlhttp.send();
  }

  function finishedLoading(responseHtml) {
    mainElement.setAttribute("aria-busy", "false");
    // extract the #main div from the response, and update our current div.
    mainElement.innerHTML = responseHtml.querySelector("main").innerHTML;
    // make sure that all links in the newly loaded main div are converted.
    convertLinks(mainElement);
  }

}();
