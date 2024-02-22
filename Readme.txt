<% finishedWebPages.forEach(webPage => { %>
    <li><a href="<%= webPage.route %>"><%= webPage.name %></a></li>
    <% }); %>