export const csTranslations = {
  nav: {
    recipes: 'Recepty',
    dashboard: 'Profil',
    friends: 'Přátelé',
    signup: 'Registrovat se',
    login: 'Přihlásit se',
    logout: 'Odhlásit se',
    admin: 'Administrátor',
  },
  notification: {
    signupSuccess: 'Účet vytvořen',
    loginSuccess: 'Přihlášení bylo úspěšné',
    logoutSuccess: 'Odhlášení bylo úspěšné',
    createRecipeSuccess: 'Recept byl úspěšně vytvořen',
    recipeDeleteSuccess: 'Recept byl úspěšně smazán',
    userDeleteSuccess: 'Uživatel byl úspěšně smazán',
    editRecipeSuccess: 'Recept byl úspěšně upraven',
    updateUserSuccess: 'Profil uživatele byl aktualizován',
  },
  info: {
    name: 'Ostatní uživatelé nevidí vaše celé jméno',
    username: 'Jak vás ostatní mohou na platformě rozpoznat',
    email: 'Váš registrační e-mail',
    roles: 'Pokročilé role umožňují více funkcí',
    insufficientPermissions: 'Nedostatečná oprávnění',
  },
  recipeDetail: {
    description: 'Postup přípravy',
    author: 'Autor',
    prep: 'Doba přípravy (min)',
    servings: 'Porce',
    cuisine: 'Typ kuchyně',
    likes: 'Líbí se',
    calories: 'Kalorie (kcal)',
    protein: 'Bílkoviny (g)',
    carbs: 'Sacharidy (g)',
    fat: 'Tuky (g)',
    editRecipe: 'Upravit recept',
    submit: 'Smazat recept',
  },
  dashboard: {
    name: 'Celé jméno',
    username: 'Uživatelské jméno',
    email: 'E-mail',
    createdAt: 'Vytvořeno',
    updatedAt: 'Aktualizováno',
    roles: 'Role',
    createRecipe: 'Vytvořit recept',
    editUser: 'Upravit profil',
    submit: 'Smazat profil',
    addFriend: 'Přidat přítele',
    noResults: 'Žádné výsledky...',
  },
  roles: {
    user: 'uživatel',
    chef: 'kuchař',
    moderator: 'moderátor',
    admin: 'správce',
  },
  friends: {
    header: 'Přátelé',
  },
  adminPanel: {
    header: 'Administrátorský panel',
    users: 'Databáze uživatelů',
    recipes: 'Databáze receptů',
    edit: 'Upravit',
    delete: 'Smazat',
    sortFullName: 'A-Z: Celé jméno',
    sortUsername: 'A-Z: Přezdívka',
  },
  footer: {
    privacy: 'Zásady ochrany osobních údajů',
    terms: 'Podmínky služby',
  },
  privacyPolicy: {
    intro: `V RISE je vaše důvěra důležitá.
      Tyto zásady ochrany osobních údajů vysvětlují, jaké informace shromažďujeme při používání naší platformy pro sdílení receptů, jak je používáme a jaká práva máte podle obecného nařízení o ochraně osobních údajů (GDPR) a dalších platných právních předpisů.`,

    section1_title: '1. Kdo jsme',
    section1_text: `RISE je platforma pro sdílení receptů vyvinutá v rámci projektu ft_transcendence na škole 42.
      Správcem údajů je tým RISE.`,

    section2_title: '2. Jaké údaje shromažďujeme',
    section2_text: `Údaje o účtu: jméno, e-mailová adresa a heslo s jednosměrným hashováním a solí.
      Obsah, který vytváříte: recepty, fotografie, komentáře a hodnocení, která publikujete na platformě.
      Technické údaje: IP adresa, typ prohlížeče a informace o zařízení shromažďované automaticky.
      Cookies: viz část 6 níže.`,

    section3_title: '3. Jak vaše údaje používáme',
    section3_text: `K provozu služby a umožnění přihlášení, vytváření a ukládání receptů, zveřejňování komentářů a recenzí a sledování ostatních uživatelů.
      K prevenci zneužití, podvodů a zajištění bezpečnosti platformy.
      Ke komunikaci s vámi ohledně vašeho účtu nebo důležitých změn.`,

    section4_title: '4. Právní základ (GDPR článek 6)',
    section4_text: `Plnění smlouvy: správa účtu a ukládání obsahu.
      Oprávněný zájem: bezpečnostní monitoring a analytika produktu.
      Souhlas: nepovinné cookies a volitelná komunikace.
      Právní povinnost: pokud to vyžaduje zákon.`,

    section5_title: '5. Sdílení vašich údajů',
    section5_text: `Vaše osobní údaje neprodáváme. Sdílíme je pouze s:
      - poskytovateli služeb (hosting, e-mailové služby) vázanými smlouvami o zpracování údajů.
      - úřady, pokud to vyžaduje zákon.`,

    section6_title: '6. Cookies',
    section6_text: `Používáme nezbytné cookies pro správu relací a zabezpečení.`,

    section7_title: '7. Vaše práva',
    section7_text: `Podle GDPR máte právo:
      - přístup k osobním údajům, které o vás uchováváme.
      - požádat o opravu nepřesných nebo neúplných údajů.
      - požádat o výmaz údajů („právo být zapomenut“).
      - získat své údaje v přenosném formátu.
      - vznést námitku proti zpracování na základě oprávněného zájmu.
      - odvolat souhlas se zpracováním založeným na souhlasu.
      - podat stížnost u vašeho dozorového úřadu.`,

    section8_title: '8. Doba uchovávání údajů',
    section8_text: `Údaje o účtu uchováváme po dobu, kdy je váš účet aktivní.`,

    section9_title: '9. Bezpečnost',
    section9_text: `Hesla jsou hashována a solena.
      Veškerý provoz je přenášen přes HTTPS.
      Dodržujeme osvědčené postupy pro ukládání, řízení přístupu a reakci na incidenty.`,

    section10_title: '10. Děti',
    section10_text: `RISE není určeno pro uživatele mladší 13 let.`,

    section11_title: '11. Změny těchto zásad',
    section11_text: `Tyto zásady můžeme čas od času aktualizovat.`,
  },
  termsService: {
    intro: `Vítejte v RISE.
      Používáním naší platformy pro sdílení receptů souhlasíte s těmito obchodními podmínkami ("podmínky").
      Přečtěte si je prosím pečlivě.`,

    section1_title: '1. Přijetí podmínek',
    section1_text: `Vytvořením účtu nebo používáním služby RISE souhlasíte s těmito podmínkami a zásadami ochrany osobních údajů.
      Pokud nesouhlasíte, službu nepoužívejte.`,

    section2_title: '2. Oprávnění k použití',
    section2_text: `Pro používání RISE musíte být starší 13 let.
      Pokud je vám méně než 18 let, musí podmínky schválit váš rodič nebo zákonný zástupce.`,

    section3_title: '3. Váš účet',
    section3_text: `Při registraci uveďte pravdivé a aktuální údaje.
      Udržujte své heslo v tajnosti.
      Nesete odpovědnost za veškerou aktivitu na vašem účtu.`,

    section4_title: '4. Váš obsah',
    section4_text: `Zůstáváte vlastníkem obsahu, který nahráváte.
      Poskytnutím obsahu nám udělujete celosvětovou, nevýhradní a bezplatnou licenci jej zobrazovat a distribuovat v rámci služby.

      Nesmíte zveřejňovat obsah, který:
      - porušuje zákony nebo práva třetích stran.
      - obsahuje nenávistný nebo obtěžující obsah.
      - uvádí nepravdivé informace o ingrediencích nebo alergenech.
      - podporuje nebezpečné postupy při přípravě jídla.`,

    section5_title: '5. Povolené použití',
    section5_text: `Uživatelé NESMÍ:
      - hromadně kopírovat obsah bez povolení.
      - narušovat bezpečnost služby nebo účtů.
      - zneužívat moderaci nebo podávat falešná hlášení.
      - vydávat se za jinou osobu nebo organizaci.
      - rozesílat spam nebo malware.
      - zpětně analyzovat nebo narušovat službu.`,

    section6_title: '6. Duševní vlastnictví',
    section6_text: `Název RISE, logo, design a kód patří týmu RISE.
      Nesmí být kopírovány bez povolení.
      Recepty patří jejich autorům.`,

    section7_title: '7. Ukončení účtu',
    section7_text: `Účty můžeme pozastavit nebo zrušit při porušení podmínek.
      Účet můžete kdykoli smazat v nastavení.`,

    section8_title: '8. Odpovědnost',
    section8_text: `Recepty poskytují uživatelé.
      RISE nezaručuje přesnost informací o výživě nebo alergenech.`,

    section9_title: '9. Omezení odpovědnosti',
    section9_text: `V maximálním rozsahu povoleném zákonem nenese RISE odpovědnost za nepřímé škody.`,

    section10_title: '10. Změny podmínek',
    section10_text: `Podmínky můžeme aktualizovat.
      Další používání znamená souhlas se změnami.`,

    section11_title: '11. Rozhodné právo',
    section11_text: `Tyto podmínky se řídí právem Finska.
      Spory budou řešeny příslušnými soudy ve Finsku.`,
  },
  login: {
    header: 'Přihlášení',
    email: 'E-mail',
    emailPlace: 'Zadejte svůj e-mail',
    password: 'Heslo',
    passwordPlace: 'Zadejte své heslo',
    submit: 'Pokračovat',
  },
  signup: {
    header: 'Registrovat se',
    name: 'Celé jméno',
    namePlace: 'Zadejte své celé jméno',
    username: 'Uživatelské jméno / Přezdívka',
    usernamePlace: 'Zadejte své uživatelské jméno / přezdívku',
    email: 'E-mail',
    emailPlace: 'Zadejte svůj e-mail',
    password: 'Heslo',
    passwordPlace: 'Zadejte své heslo',
    rePassword: 'Potvrďte heslo',
    rePasswordPlace: 'Zadejte své heslo znovu',
    submit: 'Pokračovat',
  },
  createRecipe: {
    header: 'Vytvořit recept',
    title: 'Název receptu',
    titlePlace: 'Zadejte název receptu',
    description: 'Postup přípravy',
    descriptionPlace: 'Krok 1 ...\nKrok 2 ...\nKrok 3 ...',
    prep: 'Příprava (min)',
    prepPlace: 'Zadejte dobu přípravy v minutách',
    servings: 'Porce',
    servingsPlace: 'Zadejte počet porcí',
    difficultyPlace: 'Vyberte obtížnost',
    cuisine: 'Typ kuchyně',
    cuisinePlace: 'Zadejte typ kuchyně',
    mealTypePlace: 'Vyberte typ jídla',
    calories: 'Kalorie (kcal)',
    caloriesPlace: 'Zadejte množství kalorií v kcal',
    protein: 'Bílkoviny (g)',
    proteinPlace: 'Zadejte množství bílkovin v gramech',
    carbs: 'Sacharidy (g)',
    carbsPlace: 'Zadejte množství sacharidů v gramech',
    fat: 'Tuky (g)',
    fatPlace: 'Zadejte množství tuků v gramech',
    yes: 'Ano',
    no: 'Ne',
    uploadImage: 'Nahrát obrázek',
    submit: 'Odeslat',
  },
  editUser: {
    header: 'Upravit profil',
    uploadAvatar: 'Nahrát avatar',
    submit: 'Odeslat',
  },
  editRecipe: {
    header: 'Upravit recept',
    submit: 'Odeslat',
  },
  difficulty: {
    type: 'Obtížnost',
    type_easy: 'Snadné',
    type_medium: 'Střední',
    type_hard: 'Těžké',
  },
  meal: {
    type: 'Typ jídla',
    type_breakfast: 'Snídaně',
    type_lunch: 'Oběd',
    type_dinner: 'Večeře',
    type_snack: 'Svačina',
    type_dessert: 'Dezert',
  },
  loginValidation: {
    emailRequired: 'E-mail je povinný',
    invalidEmail: 'Neplatný e-mail',
    passwordLen: 'Heslo musí mít alespoň 8 znaků',
  },
  signupValidation: {
    nameRequired: 'Celé jméno je povinné',
    usernameRequired: 'Uživatelské jméno / Přezdívka je povinné',
    emailRequired: 'E-mail je povinný',
    invalidEmail: 'Neplatný e-mail',
    passwordLen: 'Heslo musí mít alespoň 8 znaků',
    passwordConfirm: 'Prosím potvrďte své heslo',
    passwordMatch: 'Hesla se neshodují',
  },
  recValidation: {
    recipeNameRequired: 'Název receptu je povinný',
    descriptionRequired: 'Popis je povinný',
    prepTime: 'Doba přípravy',
    servings: 'Porce',
    cuisineRequired: 'Typ kuchyně je povinný',
    calories: 'Kalorie',
    protein: 'Bílkoviny',
    carbs: 'Sacharidy',
    fat: 'Tuky',
    selectDifficulty: 'Vyberte obtížnost',
    selectMealType: 'Vyberte typ jídla',
    fieldRequired: '{{field}} je povinné',
    numRequired: '{{field}} musí být číslo',
    numMin: '{{field}} musí být alespoň {{value}}',
    imageRequired: 'Obrázek je povinný',
  },
  common: {
    bannerTitle: 'Recepty, které stojí za probuzení',
    all: 'Vše',
    loading: 'Načítání...',
    welcome: 'Vítejte',
    rightsReserved: 'RISE. Všechna práva vyhrazena.',
    noFile: 'Žádný soubor nebyl vybrán',
    filters: 'Filtry',
    searchRecipe: 'Hledat recepty...',
    sortBy: 'Seřadit podle',
    newest: 'Nejnovější první',
    oldest: 'Nejstarší první',
    loadMore: 'Další recepty...',
  },
  error: {
    error: 'Chyba:',
    input: 'Neplatný vstup',
    userNotFound: 'Uživatel nenalezen',
    usersNotFound: 'Uživatelé nenalezeni',
    accessDenied: 'Přístup odepřen',
    recipeNotFound: 'Recept nenalezen',
    recipesNotFound: 'Nebyly nalezeny žádné recepty',
    genericError: 'Došlo k chybě, zkuste to prosím později',
    invalidResponse: 'Neplatná odpověď databáze',
    badRequest: 'Chybný požadavek, zkontrolujte, zda jsou data správná',
    unauthorized: 'Nemáte oprávnění k provedení této akce',
    notFound: 'Požadovaný zdroj nebyl nalezen',
    conflict: 'Duplicitní uživatelské jméno nebo e-mail',
    rateLimit: 'Příliš mnoho požadavků — překročen limit rychlosti',
    serverError: 'Došlo k interní chybě serveru, zkuste to prosím později',
    authError: 'Registrace byla úspěšná, ale automatické přihlášení selhalo',
    invalidFileType: 'Neplatný typ souboru',
    fileTooLarge: 'Soubor je příliš velký',
    forbidden: 'Chybí potřebná oprávnění.',
  },
};
