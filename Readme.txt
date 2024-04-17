<% finishedWebPages.forEach(webPage => { %>
    <li><a href="<%= webPage.route %>"><%= webPage.name %></a></li>
    <% }); %>

Quill is programma, kas atļauj manikulēt ar tekstu. Es izvēlējos Quill, jo tā bija vienīgā programmu, ko varēja implamentēt projektā ļoti ātri.

Es limitēšu admina iespēju pievienot sadaļas, jo tagadējā skolas mājaslapā pārāk daudz sadaļas ar mazs saturu.
    2 lapas ar maināmu saturu(Uzņemšana, Sākums),
    2 lapu kopas, kur var pielikt lapas (Par skolu, Mācības),
    1 lapa, kur var pielikt datus   (Ziņas)

Satīru kodu un nomainu div ar lielu js un css uz mazāku variantu. <dialog> elements ir labs variants, lai izveidotu pop up logus admin panelim.

https://github.com/bufferhead-code/nightowl
Ātrs veids kā pievienot darkmode (2/26/2024)
    @media (prefers-color-scheme: dark) {
    body{
        filter: invert(95%) hue-rotate(180deg);
    }
}

Middlewares 
    get(), set(), post(), delete()

2/27/2024
    Saskaros vēlreiz ar objektu massīvu nolasīšanau ciklā. Tā problēma radās pirmsākumos, bet tikka apieta.

Tried to make own website html builder, but didnt work. Choose a good salutation using CMS GrapeJS

3/10/2024
checkbox forms in html return "on" not True

4/7/2024
Multer doesnt check file type, but trust client sent extension. Should fix in future to make server safe from viruses.

4/11/2024
Dont use "checkboxes" as function name.

4/12/2024
Put in wepage name only 1 word without symbols

4/15/2024
".skip(20)" helps in mongoose skip files
".limit(20)" right now takes from server 20 blogs.

4/17/2024
cache info everytime when admin updates stuff and on server start