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

3/102024
checkbox forms in html return "on" not True


Trash?
router.post('/upload', (req, res) => {
    const folder = req.body.folder;
    const file = req.files.file;
    const originalFileName = file.name;

    const fileExtension = path.extname(originalFileName);
    const fileNameWithoutExtension = path.basename(originalFileName, fileExtension);

    const newName = req.body.newName || fileNameWithoutExtension;

    const uploadDir = path.join(__dirname, 'Public', 'uploads', folder);
    if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
    }

    const newFilePath = path.join(uploadDir, newName + fileExtension);

    file.mv(newFilePath, (err) => {
        if (err) {
            console.error(err);
            res.status(500).send('Internal Server Error');
        } else {
            fs.readdir(uploadDir, (err, files) => {
                if (err) {
                    console.error(err);
                    return res.status(500).send('Internal Server Error');
                }
                req.session.files = files;
                req.session.save(() => {
                    res.redirect('/admin');
                });
            });
        }
    });
});