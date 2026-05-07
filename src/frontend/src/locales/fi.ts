export const fiTranslations = {
  nav: {
    recipes: 'Reseptit',
    dashboard: 'Käyttäjäprofiili',
    signup: 'Rekisteröidy',
    login: 'Kirjaudu sisään',
    logout: 'Kirjaudu ulos',
    admin: 'Admin',
  },
  notification: {
    signupSuccess: 'Tili luotu',
    loginSuccess: 'Kirjauduttu sisään',
    logoutSuccess: 'Kirjauduttu ulos',
    createRecipeSuccess: 'Resepti luotu',
    recipeDeleteSuccess: 'Resepti poistettu',
    editRecipeSuccess: 'Resepti päivitetty',
    updateUserSuccess: 'Käyttäjäprofiili päivitetty',
  },
  info: {
    name: 'Ei näy muille käyttäjille',
    username: 'Muille näkyvä tunnisteesi alustalla',
    email: 'Rekisteröintisähköpostisi',
    roles: 'Laajennetut roolit mahdollistavat enemmän toimintoja',
    insufficientPermissions: 'Riittämättömät käyttöoikeudet',
  },
  recipeDetail: {
    author: 'Tekijä',
    prep: 'Valmisteluaika (min)',
    servings: 'Annosta',
    cuisine: 'Ruokakulttuuri',
    likes: 'Tykkäykset',
    calories: 'Kalorit (kcal)',
    protein: 'Proteiini (g)',
    carbs: 'Hiilihydraatit (g)',
    fat: 'Rasva (g)',
    editRecipe: 'Muokkaa reseptiä',
    submit: 'Poista resepti',
    submitPending: 'Reseptiä poistetaan...',
  },
  dashboard: {
    name: 'Koko nimi',
    username: 'Käyttäjätunnus',
    email: 'Sähköposti',
    createdAt: 'Luotu',
    updatedAt: 'Päivitetty',
    roles: 'Roolit',
    createRecipe: 'Luo resepti',
    editUser: 'Muokkaa profiilia',
  },
  adminPanel: {
    header: 'Ylläpitäjän paneeli',
    users: 'Käyttäjätietokanta',
    recipes: 'Reseptitietokanta',
    edit: 'Muokkaa',
    delete: 'Poista',
  },
  footer: {
    privacy: 'Tietosuojakäytäntö',
    terms: 'Käyttöehdot',
  },
  privacyPolicy: {
    intro: `RISE-palvelussa luottamuksesi on meille tärkeää.
      Tämä tietosuojakäytäntö selittää, mitä tietoja keräämme käyttäessäsi reseptien jakamisalustaa, miten käytämme niitä ja mitkä oikeudet sinulla on yleisen tietosuoja-asetuksen (GDPR) ja muiden soveltuvien lakien mukaisesti.`,

    section1_title: '1. Keitä olemme',
    section1_text: `RISE on reseptien jakamisalusta, joka on kehitetty osana ft_transcendence-projektia 42-koulussa.
      Rekisterinpitäjänä toimii RISE-tiimi.`,

    section2_title: '2. Mitä keräämme',
    section2_text: `Tilitiedot: nimi, sähköpostiosoite ja suolattu, hajautettu salasana.
      Luomasi sisältö: reseptit, kuvat, kommentit ja arviot, jotka julkaiset alustalla.
      Tekniset tiedot: IP-osoite, selain ja laitteen tiedot, jotka kerätään automaattisesti.
      Evästeet: katso kohta 6.`,

    section3_title: '3. Miten käytämme tietojasi',
    section3_text: `Palvelun tarjoamiseksi ja mahdollistaaksemme kirjautumisesi, reseptien luomisen ja tallentamisen, kommenttien ja arvostelujen julkaisemisen sekä muiden käyttäjien seuraamisen.
      Väärinkäytösten, petosten ja tietoturvan estämiseen.
      Yhteydenpitoon tilisi tai tärkeiden muutosten osalta.`,

    section4_title: '4. Oikeusperuste (GDPR artikla 6)',
    section4_text: `Sopimuksen täytäntöönpano: tilinhallinta ja sisällön tallennus.
      Oikeutettu etu: tietoturvan valvonta ja tuotteen analytiikka.
      Suostumus: ei-välttämättömät evästeet ja valinnainen viestintä.
      Lakisääteinen velvoite: jos laki sitä edellyttää.`,

    section5_title: '5. Tietojen jakaminen',
    section5_text: `Emme myy henkilötietojasi. Jaamme niitä vain:
      - palveluntarjoajien kanssa (hosting, sähköpostipalvelut), joita sitovat tietojenkäsittelysopimukset.
      - viranomaisten kanssa, jos laki sitä vaatii.`,

    section6_title: '6. Evästeet',
    section6_text: `Käytämme välttämättömiä evästeitä istunnon hallintaan ja tietoturvaan.`,

    section7_title: '7. Oikeutesi',
    section7_text: `GDPR:n mukaan sinulla on oikeus:
      - pääsy omiin henkilötietoihisi.
      - pyytää virheellisten tietojen korjaamista.
      - pyytää tietojen poistamista ("oikeus tulla unohdetuksi").
      - saada tietosi siirrettävässä muodossa.
      - vastustaa käsittelyä, joka perustuu oikeutettuun etuun.
      - peruuttaa suostumus suostumukseen perustuvasta käsittelystä.
      - tehdä valitus valvontaviranomaiselle.`,

    section8_title: '8. Tietojen säilytys',
    section8_text: `Säilytämme tilitietoja niin kauan kuin tilisi on aktiivinen.`,

    section9_title: '9. Tietoturva',
    section9_text: `Salasanat on hajautettu ja suolattu.
      Kaikki liikenne kulkee HTTPS-yhteyden kautta.
      Noudatamme alan parhaita käytäntöjä tallennuksessa, pääsynhallinnassa ja häiriötilanteiden hallinnassa.`,

    section10_title: '10. Lapset',
    section10_text: `RISE ei ole tarkoitettu alle 13-vuotiaille käyttäjille.`,

    section11_title: '11. Muutokset tähän käytäntöön',
    section11_text: `Voimme päivittää tätä käytäntöä ajoittain.`,
  },
  termsService: {
    intro: `Tervetuloa RISE-palveluun.
      Käyttämällä reseptien jakamiseen tarkoitettua alustaamme hyväksyt nämä käyttöehdot ("ehdot").
      Lue ehdot huolellisesti.`,

    section1_title: '1. Ehtojen hyväksyminen',
    section1_text: `Luomalla tilin tai käyttämällä RISE-palvelua hyväksyt nämä ehdot sekä tietosuojakäytäntömme.
      Jos et hyväksy ehtoja, älä käytä palvelua.`,

    section2_title: '2. Käyttöoikeus',
    section2_text: `Sinun on oltava vähintään 13-vuotias käyttääksesi RISE-palvelua.
      Jos olet alle 18-vuotias, vanhempasi tai huoltajasi tulee hyväksyä nämä ehdot puolestasi.`,

    section3_title: '3. Tilisi',
    section3_text: `Anna rekisteröityessäsi oikeat ja ajantasaiset tiedot.
      Pidä salasanasi luottamuksellisena ja turvallisena.
      Olet vastuussa kaikesta tililläsi tapahtuvasta toiminnasta.`,

    section4_title: '4. Sisältösi',
    section4_text: `Säilytät omistusoikeuden lataamiisi resepteihin, kuviin ja kommentteihin.
      Antamalla sisältöä myönnät meille maailmanlaajuisen, ei-yksinomaisen ja rojaltivapaan lisenssin näyttää, tallentaa ja jakaa sisältöä palvelussa.

      Et saa julkaista sisältöä, joka:
      - rikkoo lakia tai kolmansien osapuolten oikeuksia.
      - sisältää vihapuhetta tai häirintää.
      - vääristää ainesosia tai jättää ilmoittamatta allergeeneja.
      - edistää vaarallisia ruoan käsittelytapoja.`,

    section5_title: '5. Sallittu käyttö',
    section5_text: `Käyttäjät EIVÄT saa:
      - kerätä tai kopioida sisältöä laajamittaisesti ilman lupaa.
      - yrittää murtaa palvelun tai muiden käyttäjien turvallisuutta.
      - tehdä vääriä ilmoituksia tai väärinkäyttää moderointia.
      - esiintyä toisena henkilönä tai organisaationa.
      - lähettää roskapostia tai haittaohjelmia.
      - käänteismallintaa tai häiritä palvelun toimintaa.`,

    section6_title: '6. Immateriaalioikeudet',
    section6_text: `RISE-nimi, logo, käyttöliittymä ja lähdekoodi kuuluvat RISE-tiimille.
      Niitä ei saa kopioida tai käyttää ilman kirjallista lupaa.
      Yhteisön reseptit kuuluvat niiden tekijöille.`,

    section7_title: '7. Tilin päättäminen',
    section7_text: `Voimme jäädyttää tai sulkea tilejä, jotka rikkovat näitä ehtoja.
      Voit poistaa tilisi milloin tahansa asetuksista, jolloin tietosi poistetaan tietosuojakäytäntömme mukaisesti.`,

    section8_title: '8. Vastuuvapauslauseke',
    section8_text: `Reseptit tarjoavat käyttäjät sellaisenaan.
      RISE ei tarkista ravintoarvoja, allergeeneja tai turvallisuustietoja.`,

    section9_title: '9. Vastuunrajoitus',
    section9_text: `Sovellettavan lain sallimissa rajoissa RISE ei ole vastuussa epäsuorista tai välillisistä vahingoista.`,

    section10_title: '10. Ehtojen muutokset',
    section10_text: `Voimme päivittää näitä ehtoja.
      Palvelun jatkokäyttö tarkoittaa muutosten hyväksymistä.`,

    section11_title: '11. Sovellettava laki',
    section11_text: `Näihin ehtoihin sovelletaan Suomen lakia.
      Riidat ratkaistaan Suomen tuomioistuimissa.`,
  },
  login: {
    header: 'Kirjaudu sisään',
    email: 'Sähköposti',
    emailPlace: 'Syötä sähköpostiosoite',
    password: 'Salasana',
    passwordPlace: 'Syötä salasana',
    submit: 'Jatka',
    submitPending: 'Kirjaudutaan sisään...',
  },
  signup: {
    header: 'Rekisteröidy',
    name: 'Koko nimi',
    namePlace: 'Syötä etu- ja sukunimesi',
    username: 'Käyttäjätunnus / Alias',
    usernamePlace: 'Syötä käyttäjätunnuksesi / aliaksesi',
    email: 'Sähköposti',
    emailPlace: 'Syötä sähköpostiosoitteesi',
    password: 'Salasana',
    passwordPlace: 'Syötä salasana',
    rePassword: 'Vahvista salasana',
    rePasswordPlace: 'Syötä salasana uudelleen',
    submit: 'Jatka',
    submitPending: 'Rekisteröintiä käsitellään...',
  },
  createRecipe: {
    header: 'Luo resepti',
    title: 'Reseptin nimi',
    titlePlace: 'Syötä reseptin nimi',
    description: 'Lyhyt kuvaus',
    descriptionPlace: 'Syötä lyhyt kuvaus',
    prep: 'Valmistusaika (min)',
    prepPlace: 'Syötä valmistusaika minuutteina',
    servings: 'Annokset',
    servingsPlace: 'Syötä annosten määrä',
    cuisine: 'Ruokakulttuuri',
    cuisinePlace: 'Syötä ruokakulttuuri',
    calories: 'Kalorit (kcal)',
    caloriesPlace: 'Syötä kalorit (kcal)',
    protein: 'Proteiini (g)',
    proteinPlace: 'Syötä proteiinin määrä grammoina',
    carbs: 'Hiilihydraatit (g)',
    carbsPlace: 'Syötä hiilihydraattien määrä grammoina',
    fat: 'Rasva (g)',
    fatPlace: 'Syötä rasvan määrä grammoina',
    yes: 'Kyllä',
    no: 'Ei',
    uploadImage: 'Lataa kuva',
    submit: 'Lähetä',
    submitPending: 'Lähetetään reseptiä...',
  },
  editUser: {
    header: 'Muokkaa profiilia',
    uploadAvatar: 'Lataa profiilikuva',
    submit: 'Lähetä',
    submitPending: 'Profiilia päivitetään...',
  },
  editRecipe: {
    header: 'Muokkaa reseptiä',
    submit: 'Lähetä',
    submitPending: 'Reseptiä päivitetään...',
  },
  difficulty: {
    type: 'Vaikeusaste',
    type_easy: 'Helppo',
    type_medium: 'Keskitaso',
    type_hard: 'Haastava',
  },
  meal: {
    type: 'Ateriatyyppi',
    type_breakfast: 'Aamiainen',
    type_lunch: 'Lounas',
    type_dinner: 'Päivällinen',
    type_snack: 'Välipala',
  },
  loginValidation: {
    emailRequired: 'Sähköposti on pakollinen',
    invalidEmail: 'Virheellinen sähköpostiosoite',
    passwordLen: 'Salasanan on oltava vähintään 8 merkkiä pitkä',
  },
  signupValidation: {
    nameRequired: 'Nimi on pakollinen',
    usernameRequired: 'Käyttäjätunnus / Alias on pakollinen',
    emailRequired: 'Sähköposti on pakollinen',
    invalidEmail: 'Virheellinen sähköpostiosoite',
    passwordLen: 'Salasanan on oltava vähintään 8 merkkiä pitkä',
    passwordConfirm: 'Vahvista salasanasi',
    passwordMatch: 'Salasanat eivät täsmää',
  },
  recValidation: {
    recipeNameRequired: 'Reseptin nimi on pakollinen',
    descriptionRequired: 'Kuvaus on pakollinen',
    prepTime: 'Valmistusaika',
    servings: 'Annokset',
    cuisineRequired: 'Ruokakulttuuri on pakollinen',
    calories: 'Kalorit',
    protein: 'Proteiini',
    carbs: 'Hiilihydraatit',
    fat: 'Rasva',
    selectDifficulty: 'Valitse vaikeustaso',
    selectMealType: 'Valitse ateriatyyppi',
    fieldRequired: '{{field}} on pakollinen',
    numRequired: '{{field}} täytyy olla numero',
    numMin: '{{field}} täytyy olla vähintään {{value}}',
    imageRequired: 'Kuva vaaditaan',
  },
  common: {
    bannerTitle: 'Reseptejä, joita varten kannattaa herätä',
    loading: 'Ladataan...',
    welcome: 'Tervetuloa',
    rightsReserved: 'RISE. Kaikki oikeudet pidätetään.',
    noFile: 'Tiedostoa ei valittu',
  },
  error: {
    error: 'Virhe:',
    input: 'Virheellinen syöte',
    userNotFound: 'Käyttäjää ei löytynyt',
    usersNotFound: 'Käyttäjiä ei löytynyt',
    accessDenied: 'Pääsy estetty',
    recipeNotFound: 'Reseptiä ei löytynyt',
    recipesNotFound: 'Reseptejä ei löytynyt',
    genericError: 'Tapahtui virhe, yritä myöhemmin uudelleen',
    invalidResponse: 'Virheellinen tietokannan vastaus',
    badRequest: 'Virheellinen pyyntö, tarkista syötteesi',
    unauthorized: 'Sinulla ei ole oikeuksia suorittaa tätä toimintoa',
    notFound: 'Haettua resurssia ei löydy',
    conflict: 'Käyttäjänimi tai sähköpostiosoite on jo käytössä',
    rateLimit: 'Liian monta pyyntöä — nopeusrajoitus ylitetty',
    serverError: 'Sisäinen palvelinvirhe, yritä myöhemmin uudelleen',
    authError:
      'Rekisteröinti onnistui, mutta automaattinen kirjautuminen epäonnistui, kirjaudu sisään manuaalisesti',
  },
};
