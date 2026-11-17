const sourceWorldCities = (typeof window !== 'undefined' && window.kovWorldCities) ? window.kovWorldCities : (typeof require === 'function' ? require('./world-cities.js').worldCities : []);

const countryDirectory = [
  {
    "country": "Afghanistan",
    "region": "Asia",
    "divisions": [
      "Badakhshān",
      "Bādghīs",
      "Baghlān",
      "Balkh",
      "Bāmyān",
      "Dāykundī",
      "Farāh",
      "Fāryāb"
    ],
    "cities": [
      "Kabul",
      "Kandahār",
      "Mazār-e Sharīf",
      "Herāt",
      "Jalālābād",
      "Kunduz",
      "Pul-e Khumrī"
    ],
    "iso2": "AF",
    "iso3": "AFG",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Albania",
    "region": "Europe",
    "divisions": [
      "Berat",
      "Dibër",
      "Durrës",
      "Elbasan",
      "Fier",
      "Gjirokastër",
      "Korçë",
      "Kukës"
    ],
    "cities": [
      "Tirana",
      "Durrës",
      "Vlorë",
      "Shkodër",
      "Elbasan",
      "Kamëz",
      "Fier"
    ],
    "iso2": "AL",
    "iso3": "ALB",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Algeria",
    "region": "Africa",
    "divisions": [
      "Adrar",
      "Aïn Defla",
      "Aïn Temouchent",
      "Alger",
      "Annaba",
      "Batna",
      "Béchar",
      "Bejaïa"
    ],
    "cities": [
      "Algiers",
      "Oran",
      "Blida",
      "Constantine",
      "El Hadjar",
      "Batna",
      "Sétif"
    ],
    "iso2": "DZ",
    "iso3": "DZA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Andorra",
    "region": "Europe",
    "divisions": [
      "Andorra la Vella",
      "Canillo",
      "Encamp",
      "Escaldes-Engordany",
      "La Massana",
      "Sant Julià de Lòria"
    ],
    "cities": [
      "Andorra la Vella",
      "Sant Pere",
      "Escaldes-Engordany",
      "Encamp",
      "La Massana",
      "Sant Julià de Lòria",
      "Canillo"
    ],
    "iso2": "AD",
    "iso3": "AND",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Angola",
    "region": "Africa",
    "divisions": [
      "Bengo",
      "Benguela",
      "Bié",
      "Cabinda",
      "Cuando Cubango",
      "Cuanza-Norte",
      "Cuanza-Sul",
      "Cunene"
    ],
    "cities": [
      "Luanda",
      "Cacuaco",
      "Lubango",
      "Viana",
      "Huambo",
      "Cazenga",
      "Cabinda"
    ],
    "iso2": "AO",
    "iso3": "AGO",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Antigua and Barbuda",
    "region": "North America",
    "divisions": [
      "Saint John"
    ],
    "cities": [
      "Saint John’s"
    ],
    "iso2": "AG",
    "iso3": "ATG",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Argentina",
    "region": "South America",
    "divisions": [
      "Buenos Aires",
      "Buenos Aires, Ciudad Autónoma de",
      "Catamarca",
      "Chaco",
      "Chubut",
      "Córdoba",
      "Corrientes",
      "Entre Ríos"
    ],
    "cities": [
      "Buenos Aires",
      "Córdoba",
      "Rosario",
      "La Plata",
      "Salta",
      "Mar del Plata",
      "San Miguel de Tucumán"
    ],
    "iso2": "AR",
    "iso3": "ARG",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Armenia",
    "region": "Asia",
    "divisions": [
      "Aragatsotn",
      "Ararat",
      "Armavir",
      "Geghark’unik’",
      "Kotayk’",
      "Lorri",
      "Shirak",
      "Syunik’"
    ],
    "cities": [
      "Yerevan",
      "Gyumri",
      "Vanadzor",
      "Hrazdan",
      "Ejmiatsin",
      "Abovyan",
      "Armavir"
    ],
    "iso2": "AM",
    "iso3": "ARM",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Australia",
    "region": "Oceania",
    "divisions": [
      "Australian Capital Territory",
      "New South Wales",
      "Northern Territory",
      "Queensland",
      "South Australia",
      "Tasmania",
      "Victoria",
      "Western Australia"
    ],
    "cities": [
      "Sydney",
      "Melbourne",
      "Brisbane",
      "Perth",
      "Adelaide",
      "Gold Coast",
      "Canberra"
    ],
    "iso2": "AU",
    "iso3": "AUS",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Austria",
    "region": "Europe",
    "divisions": [
      "Burgenland",
      "Kärnten",
      "Niederösterreich",
      "Oberösterreich",
      "Salzburg",
      "Steiermark",
      "Tirol",
      "Vorarlberg"
    ],
    "cities": [
      "Vienna",
      "Graz",
      "Linz",
      "Lochau",
      "Salzburg",
      "Innsbruck",
      "Klagenfurt"
    ],
    "iso2": "AT",
    "iso3": "AUT",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Azerbaijan",
    "region": "Asia",
    "divisions": [
      "Abşeron",
      "Ağcabədi",
      "Ağdam",
      "Ağdaş",
      "Ağstafa",
      "Ağsu",
      "Astara",
      "Babək"
    ],
    "cities": [
      "Baku",
      "Sumqayıt",
      "Gəncə",
      "Kərki",
      "Mingəçevir",
      "Xırdalan",
      "Keşlə"
    ],
    "iso2": "AZ",
    "iso3": "AZE",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Bahamas",
    "region": "North America",
    "divisions": [
      "West Grand Bahama",
      "North Abaco",
      "New Providence",
      "Bimini",
      "Cat Island",
      "Exuma",
      "Long Island",
      "Grand Bahama"
    ],
    "cities": [
      "Nassau",
      "Lucaya",
      "Freeport City",
      "West End",
      "Cooper’s Town",
      "Marsh Harbour",
      "George Town"
    ],
    "iso2": "BS",
    "iso3": "BHS",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Bahrain",
    "region": "Middle East",
    "divisions": [
      "Al ‘Āşimah",
      "Al Janūbīyah",
      "Al Muḩarraq",
      "Ash Shamālīyah"
    ],
    "cities": [
      "Manama",
      "Al Muḩarraq",
      "Madīnat Ḩamad",
      "Sitrah",
      "Jidd Ḩafş",
      "Madīnat ‘Īsá",
      "Al Hamalah"
    ],
    "iso2": "BH",
    "iso3": "BHR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Bangladesh",
    "region": "Asia",
    "divisions": [
      "Barishal",
      "Chattogram",
      "Dhaka",
      "Khulna",
      "Mymensingh",
      "Rājshāhi",
      "Rangpur",
      "Sylhet"
    ],
    "cities": [
      "Dhaka",
      "Chattogram",
      "Gāzipura",
      "Nārāyanganj",
      "Khulna",
      "Sylhet",
      "Comilla"
    ],
    "iso2": "BD",
    "iso3": "BGD",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Barbados",
    "region": "North America",
    "divisions": [
      "Christ Church",
      "Saint Lucy",
      "Saint Michael"
    ],
    "cities": [
      "Bridgetown",
      "Chancery Lane",
      "Cave Hill"
    ],
    "iso2": "BB",
    "iso3": "BRB",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Belarus",
    "region": "Europe",
    "divisions": [
      "Brestskaya Voblasts’",
      "Homyel’skaya Voblasts’",
      "Hrodzyenskaya Voblasts’",
      "Mahilyowskaya Voblasts’",
      "Minsk",
      "Vitsyebskaya Voblasts’"
    ],
    "cities": [
      "Minsk",
      "Homyel’",
      "Hrodna",
      "Vitsyebsk",
      "Mahilyow",
      "Brest",
      "Babruysk"
    ],
    "iso2": "BY",
    "iso3": "BLR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Belgium",
    "region": "Europe",
    "divisions": [
      "Brussels-Capital Region",
      "Flanders",
      "Wallonia"
    ],
    "cities": [
      "Brussels",
      "Antwerp",
      "Gent",
      "Charleroi",
      "Liège",
      "Schaarbeek",
      "Anderlecht"
    ],
    "iso2": "BE",
    "iso3": "BEL",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Belize",
    "region": "North America",
    "divisions": [
      "Belize",
      "Cayo",
      "Corozal",
      "Orange Walk",
      "Stann Creek",
      "Toledo"
    ],
    "cities": [
      "Belize City",
      "San Ignacio",
      "Belmopan",
      "San Pedro",
      "Orange Walk",
      "Dangriga",
      "Corozal"
    ],
    "iso2": "BZ",
    "iso3": "BLZ",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Benin",
    "region": "Africa",
    "divisions": [
      "Alibori",
      "Atacora",
      "Atlantique",
      "Borgou",
      "Collines",
      "Couffo",
      "Donga",
      "Littoral"
    ],
    "cities": [
      "Banikoara",
      "Cotonou",
      "Abomey-Calavi",
      "Godomè",
      "Djougou",
      "Porto-Novo",
      "Tchaourou"
    ],
    "iso2": "BJ",
    "iso3": "BEN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Bhutan",
    "region": "Asia",
    "divisions": [
      "Bumthang",
      "Chhukha",
      "Dagana",
      "Gasa",
      "Haa",
      "Lhuentse",
      "Mongar",
      "Paro"
    ],
    "cities": [
      "Thimphu",
      "Phuntsholing",
      "Geylegphug",
      "Samdrup Jongkhar",
      "Wangdue Phodrang",
      "Punakha",
      "Jakar"
    ],
    "iso2": "BT",
    "iso3": "BTN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Bolivia",
    "region": "South America",
    "divisions": [
      "Chuquisaca",
      "Cochabamba",
      "El Beni",
      "La Paz",
      "Oruro",
      "Pando",
      "Potosí",
      "Santa Cruz"
    ],
    "cities": [
      "La Paz",
      "Santa Cruz de la Sierra",
      "El Alto",
      "Cochabamba",
      "Sucre",
      "Oruro",
      "Tarija"
    ],
    "iso2": "BO",
    "iso3": "BOL",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Bosnia and Herzegovina",
    "region": "Europe",
    "divisions": [
      "Bosnia and Herzegovina, Federation of",
      "Brcko District",
      "Srpska, Republika"
    ],
    "cities": [
      "Sarajevo",
      "Banja Luka",
      "Stara Gora",
      "Tuzla",
      "Zenica",
      "Ilidža",
      "Mostar"
    ],
    "iso2": "BA",
    "iso3": "BIH",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Botswana",
    "region": "Africa",
    "divisions": [
      "Central",
      "Chobe",
      "Francistown",
      "Gaborone",
      "Ghanzi",
      "Kgalagadi",
      "Kgatleng",
      "Kweneng"
    ],
    "cities": [
      "Gaborone",
      "Francistown",
      "Mogoditshane",
      "Maun",
      "Molepolole",
      "Tlokweng",
      "Selibe Phikwe"
    ],
    "iso2": "BW",
    "iso3": "BWA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Brazil",
    "region": "South America",
    "divisions": [
      "Acre",
      "Alagoas",
      "Amapá",
      "Amazonas",
      "Bahia",
      "Ceará",
      "Distrito Federal",
      "Espírito Santo"
    ],
    "cities": [
      "São Paulo",
      "Rio de Janeiro",
      "Belo Horizonte",
      "Fortaleza",
      "Brasília",
      "Teresina",
      "Salvador"
    ],
    "iso2": "BR",
    "iso3": "BRA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Brunei",
    "region": "Asia",
    "divisions": [
      "Belait",
      "Brunei dan Muara",
      "Temburong",
      "Tutong"
    ],
    "cities": [
      "Bandar Seri Begawan",
      "Seria",
      "Tutong",
      "Kampong Tunah Jambu",
      "Kuala Belait",
      "Bangar"
    ],
    "iso2": "BN",
    "iso3": "BRN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Bulgaria",
    "region": "Europe",
    "divisions": [
      "Blagoevgrad",
      "Burgas",
      "Dobrich",
      "Gabrovo",
      "Haskovo",
      "Kardzhali",
      "Kyustendil",
      "Lovech"
    ],
    "cities": [
      "Sofia",
      "Plovdiv",
      "Varna",
      "Burgas",
      "Stara Zagora",
      "Ruse",
      "Sliven"
    ],
    "iso2": "BG",
    "iso3": "BGR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Burkina Faso",
    "region": "Africa",
    "divisions": [
      "Boucle du Mouhoun",
      "Cascades",
      "Centre",
      "Centre-Est",
      "Centre-Nord",
      "Centre-Ouest",
      "Centre-Sud",
      "Est"
    ],
    "cities": [
      "Ouagadougou",
      "Bobo-Dioulasso",
      "Koudougou",
      "Ouahigouya",
      "Kaya",
      "Banfora",
      "Pouytenga"
    ],
    "iso2": "BF",
    "iso3": "BFA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Burundi",
    "region": "Africa",
    "divisions": [
      "Bubanza",
      "Bujumbura Mairie",
      "Bujumbura Rural",
      "Cankuzo",
      "Cibitoke",
      "Gitega",
      "Karuzi",
      "Kayanza"
    ],
    "cities": [
      "Bujumbura",
      "Gitega",
      "Ruyigi",
      "Ngozi",
      "Rumonge",
      "Zanandore",
      "Cibitoke"
    ],
    "iso2": "BI",
    "iso3": "BDI",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Cabo Verde",
    "region": "Africa",
    "divisions": [
      "Boa Vista",
      "Brava",
      "Maio",
      "Mosteiros",
      "Porto Novo",
      "Praia",
      "Ribeira Brava",
      "Ribeira Grande"
    ],
    "cities": [
      "Praia",
      "Mindelo",
      "Lazareto",
      "Tarrafal",
      "Santa Maria",
      "São Filipe",
      "Porto Novo"
    ],
    "iso2": "CV",
    "iso3": "CPV",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Cambodia",
    "region": "Asia",
    "divisions": [
      "Banteay Meanchey",
      "Battambang",
      "Kampong Cham",
      "Kampong Chhnang",
      "Kampong Speu",
      "Kampong Thom",
      "Kampot",
      "Kandal"
    ],
    "cities": [
      "Phnom Penh",
      "Siem Reap",
      "Battambang",
      "Kampong Cham",
      "Sisophon",
      "Paoy Paet",
      "Kampong Trach"
    ],
    "iso2": "KH",
    "iso3": "KHM",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Cameroon",
    "region": "Africa",
    "divisions": [
      "Adamaoua",
      "Centre",
      "Est",
      "Extrême-Nord",
      "Littoral",
      "Nord",
      "North-West",
      "Ouest"
    ],
    "cities": [
      "Douala",
      "Yaoundé",
      "Bamenda",
      "Garoua",
      "Bafoussam",
      "Guider",
      "Maroua"
    ],
    "iso2": "CM",
    "iso3": "CMR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Canada",
    "region": "North America",
    "divisions": [
      "Alberta",
      "British Columbia",
      "Manitoba",
      "New Brunswick",
      "Newfoundland and Labrador",
      "Northwest Territories",
      "Nova Scotia",
      "Nunavut"
    ],
    "cities": [
      "Toronto",
      "Montréal",
      "Vancouver",
      "Calgary",
      "Edmonton",
      "Ottawa",
      "Winnipeg"
    ],
    "iso2": "CA",
    "iso3": "CAN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Central African Republic",
    "region": "Africa",
    "divisions": [
      "Bamingui-Bangoran",
      "Bangui",
      "Basse-Kotto",
      "Haut-Mbomou",
      "Haute-Kotto",
      "Kémo",
      "Lobaye",
      "Mambéré-Kadéï"
    ],
    "cities": [
      "Bangui",
      "Mambéré",
      "Bimbo",
      "Berbérati",
      "Carnot",
      "Bambari",
      "Bouar"
    ],
    "iso2": "CF",
    "iso3": "CAF",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Chad",
    "region": "Africa",
    "divisions": [
      "Barh-El-Gazel",
      "Batha",
      "Borkou",
      "Chari-Baguirmi",
      "Ennedi-Est",
      "Ennedi-Ouest",
      "Guéra",
      "Hadjer-Lamis"
    ],
    "cities": [
      "N’Djamena",
      "Moundou",
      "Sarh",
      "Yao",
      "Léré",
      "Abéché",
      "Goundi"
    ],
    "iso2": "TD",
    "iso3": "TCD",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Chile",
    "region": "South America",
    "divisions": [
      "Antofagasta",
      "Araucanía",
      "Arica y Parinacota",
      "Atacama",
      "Aysén",
      "Biobío",
      "Coquimbo",
      "Libertador General Bernardo O’Higgins"
    ],
    "cities": [
      "Santiago",
      "Casablanca",
      "Rocas de Santo Domingo",
      "Valparaíso",
      "Concepción",
      "Puente Alto",
      "Maipú"
    ],
    "iso2": "CL",
    "iso3": "CHL",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "China",
    "region": "Asia",
    "divisions": [
      "Anhui",
      "Beijing",
      "Chongqing",
      "Fujian",
      "Gansu",
      "Guangdong",
      "Guangxi",
      "Guizhou"
    ],
    "cities": [
      "Guangzhou",
      "Shanghai",
      "Chongqing",
      "Beijing",
      "Chengdu",
      "Shenzhen",
      "Tianjin"
    ],
    "iso2": "CN",
    "iso3": "CHN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Colombia",
    "region": "South America",
    "divisions": [
      "Amazonas",
      "Antioquia",
      "Arauca",
      "Atlántico",
      "Bogotá",
      "Bolívar",
      "Boyacá",
      "Caldas"
    ],
    "cities": [
      "Bogotá",
      "Cali",
      "Medellín",
      "Barranquilla",
      "Cartagena",
      "Bucaramanga",
      "Palermo"
    ],
    "iso2": "CO",
    "iso3": "COL",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Comoros",
    "region": "Africa",
    "divisions": [
      "Anjouan",
      "Grande Comore",
      "Mohéli"
    ],
    "cities": [
      "Moroni",
      "Mutsamudu",
      "Mandza",
      "Fomboni",
      "Domoni",
      "Tsimbeo",
      "Ongoujou"
    ],
    "iso2": "KM",
    "iso3": "COM",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Costa Rica",
    "region": "North America",
    "divisions": [
      "Alajuela",
      "Cartago",
      "Guanacaste",
      "Heredia",
      "Limón",
      "Puntarenas",
      "San José"
    ],
    "cities": [
      "San José",
      "San Marcos",
      "San Ramón",
      "Puntarenas",
      "Santa Cruz",
      "Puerto Limón",
      "Sarapiquí"
    ],
    "iso2": "CR",
    "iso3": "CRI",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Côte d'Ivoire",
    "region": "Africa",
    "divisions": [
      "Abidjan",
      "Bas-Sassandra",
      "Comoé",
      "Denguélé",
      "Gôh-Djiboua",
      "Lacs",
      "Lagunes",
      "Montagnes"
    ],
    "cities": [
      "Abidjan",
      "Yopougon",
      "Abobo",
      "Bouaké",
      "Cocody",
      "Port-Bouët",
      "Korhogo"
    ],
    "iso2": "CI",
    "iso3": "CIV",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Croatia",
    "region": "Europe",
    "divisions": [
      "Bjelovarsko-Bilogorska Županija",
      "Brodsko-Posavska Županija",
      "Dubrovačko-Neretvanska Županija",
      "Istarska Županija",
      "Karlovačka Županija",
      "Koprivničko-Križevačka Županija",
      "Krapinsko-Zagorska Županija",
      "Ličko-Senjska Županija"
    ],
    "cities": [
      "Zagreb",
      "Split",
      "Rijeka",
      "Osijek",
      "Zadar",
      "Sesvete",
      "Pula"
    ],
    "iso2": "HR",
    "iso3": "HRV",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Cuba",
    "region": "North America",
    "divisions": [
      "Artemisa",
      "Camagüey",
      "Ciego de Ávila",
      "Cienfuegos",
      "Granma",
      "Guantánamo",
      "Holguín",
      "Isla de la Juventud"
    ],
    "cities": [
      "Havana",
      "Santiago de Cuba",
      "Camagüey",
      "Holguín",
      "Santa Clara",
      "Carlos Manuel de Céspedes",
      "Guantánamo"
    ],
    "iso2": "CU",
    "iso3": "CUB",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Cyprus",
    "region": "Europe",
    "divisions": [
      "Ammóchostos",
      "Kerýneia",
      "Lárnaka",
      "Lefkosía",
      "Lemesós",
      "Páfos"
    ],
    "cities": [
      "Nicosia",
      "Limassol",
      "Paphos",
      "Famagusta",
      "Kyrenia",
      "Mórfou",
      "Káto Polemídia"
    ],
    "iso2": "CY",
    "iso3": "CYP",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Czechia",
    "region": "Europe",
    "divisions": [
      "Jihočeský Kraj",
      "Jihomoravský Kraj",
      "Karlovarský Kraj",
      "Královéhradecký Kraj",
      "Liberecký Kraj",
      "Moravskoslezský Kraj",
      "Olomoucký Kraj",
      "Pardubický Kraj"
    ],
    "cities": [
      "Prague",
      "Brno",
      "Ostrava",
      "Plzeň",
      "Liberec",
      "Olomouc",
      "České Budějovice"
    ],
    "iso2": "CZ",
    "iso3": "CZE",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Democratic Republic of the Congo",
    "region": "Africa",
    "divisions": [
      "Bas-Uélé",
      "Équateur",
      "Haut-Katanga",
      "Haut-Lomami",
      "Haut-Uélé",
      "Ituri",
      "Kasaï",
      "Kasaï Central"
    ],
    "cities": [
      "Kinshasa",
      "Mbuji-Mayi",
      "Lubumbashi",
      "Katako-Kombe",
      "Kananga",
      "Ndjili",
      "Bukavu"
    ],
    "iso2": "CD",
    "iso3": "COD",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Denmark",
    "region": "Europe",
    "divisions": [
      "Hovedstaden",
      "Midtjylland",
      "Nordjylland",
      "Sjælland",
      "Syddanmark"
    ],
    "cities": [
      "Copenhagen",
      "Aarhus",
      "Odense",
      "Aalborg",
      "Esbjerg",
      "Randers",
      "Horsens"
    ],
    "iso2": "DK",
    "iso3": "DNK",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Djibouti",
    "region": "Africa",
    "divisions": [
      "Ali Sabieh",
      "Arta",
      "Dikhil",
      "Djibouti",
      "Obock",
      "Tadjourah"
    ],
    "cities": [
      "Djibouti",
      "Ali Sabieh",
      "Dikhil",
      "Obock",
      "Tadjourah",
      "Arta"
    ],
    "iso2": "DJ",
    "iso3": "DJI",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Dominica",
    "region": "North America",
    "divisions": [
      "Saint George"
    ],
    "cities": [
      "Roseau"
    ],
    "iso2": "DM",
    "iso3": "DMA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Dominican Republic",
    "region": "North America",
    "divisions": [
      "Cibao Nordeste",
      "Cibao Noroeste",
      "Cibao Norte",
      "Cibao Sur",
      "El Valle",
      "Enriquillo",
      "Higuamo",
      "Ozama"
    ],
    "cities": [
      "Santiago",
      "Santo Domingo",
      "Santo Domingo Este",
      "Puerto Plata",
      "La Victoria",
      "San Cristóbal",
      "Los Alcarrizos"
    ],
    "iso2": "DO",
    "iso3": "DOM",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Ecuador",
    "region": "South America",
    "divisions": [
      "Azuay",
      "Bolívar",
      "Cañar",
      "Carchi",
      "Chimborazo",
      "Cotopaxi",
      "Ecuador (general)",
      "El Oro"
    ],
    "cities": [
      "Guayaquil",
      "Quito",
      "Cuenca",
      "Santo Domingo de los Colorados",
      "Eloy Alfaro",
      "Machala",
      "Manta"
    ],
    "iso2": "EC",
    "iso3": "ECU",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Egypt",
    "region": "Africa",
    "divisions": [
      "Ad Daqahlīyah",
      "Al Baḩr al Aḩmar",
      "Al Buḩayrah",
      "Al Fayyūm",
      "Al Gharbīyah",
      "Al Iskandarīyah",
      "Al Ismā‘īlīyah",
      "Al Jīzah"
    ],
    "cities": [
      "Cairo",
      "Alexandria",
      "Giza",
      "Shubrā al Khaymah",
      "Port Said",
      "Suez",
      "Sinnūris"
    ],
    "iso2": "EG",
    "iso3": "EGY",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "El Salvador",
    "region": "North America",
    "divisions": [
      "Ahuachapán",
      "Cabañas",
      "Chalatenango",
      "Cuscatlán",
      "La Libertad",
      "La Paz",
      "La Unión",
      "Morazán"
    ],
    "cities": [
      "San Salvador",
      "Soyapango",
      "Santa Ana",
      "San Miguel",
      "Apopa",
      "Tonacatepeque",
      "Ilopango"
    ],
    "iso2": "SV",
    "iso3": "SLV",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Equatorial Guinea",
    "region": "Africa",
    "divisions": [
      "Annobón",
      "Bioko Norte",
      "Bioko Sur",
      "Centro Sur",
      "Kié-Ntem",
      "Litoral",
      "Wele-Nzas"
    ],
    "cities": [
      "Malabo",
      "Bata",
      "Sevilla de Niefang",
      "Ebebiyín",
      "Santiago de Baney",
      "Añisoc",
      "Bengonbeyene"
    ],
    "iso2": "GQ",
    "iso3": "GNQ",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Eritrea",
    "region": "Africa",
    "divisions": [
      "‘Anseba",
      "Debub",
      "Debubawi K’eyyĭḥ Baḥri",
      "Eritrea (general)",
      "Gash-Barka",
      "Ma’ĭkel",
      "Semienawi K’eyyĭḥ Baḥri"
    ],
    "cities": [
      "Asmara",
      "Keren",
      "Gwelej",
      "Assab",
      "Massawa",
      "Mendefera",
      "Dbarwa"
    ],
    "iso2": "ER",
    "iso3": "ERI",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Estonia",
    "region": "Europe",
    "divisions": [
      "Haapsalu",
      "Hiiumaa",
      "Jõgeva",
      "Jõhvi",
      "Keila",
      "Kohtla-Järve",
      "Maardu",
      "Narva"
    ],
    "cities": [
      "Tallinn",
      "Tartu",
      "Narva",
      "Pärnu",
      "Kohtla-Järve",
      "Viljandi",
      "Maardu"
    ],
    "iso2": "EE",
    "iso3": "EST",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Eswatini",
    "region": "Africa",
    "divisions": [
      "Hhohho",
      "Lubombo",
      "Manzini",
      "Shiselweni"
    ],
    "cities": [
      "Lobamba",
      "Manzini",
      "Mbabane",
      "Nhlangano",
      "Siteki",
      "Piggs Peak",
      "Lavumisa"
    ],
    "iso2": "SZ",
    "iso3": "SWZ",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Ethiopia",
    "region": "Africa",
    "divisions": [
      "Ādīs Ābeba",
      "Āfar",
      "Āmara",
      "Bīnshangul Gumuz",
      "Dirē Dawa",
      "Gambēla Hizboch",
      "Hārerī Hizb",
      "Oromīya"
    ],
    "cities": [
      "Addis Ababa",
      "Sodo",
      "Warder",
      "Debre Birhan",
      "Shashemenē",
      "Nazrēt",
      "Gonder"
    ],
    "iso2": "ET",
    "iso3": "ETH",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Fiji",
    "region": "Oceania",
    "divisions": [
      "Ba",
      "Macuata",
      "Nadroga and Navosa",
      "Naitasiri",
      "Rewa",
      "Tailevu"
    ],
    "cities": [
      "Suva",
      "Nadi",
      "Nausori",
      "Lautoka",
      "Labasa",
      "Lami",
      "Nakasi"
    ],
    "iso2": "FJ",
    "iso3": "FJI",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Finland",
    "region": "Europe",
    "divisions": [
      "Åland",
      "Etelä-Karjala",
      "Etelä-Pohjanmaa",
      "Etelä-Savo",
      "Kainuu",
      "Kanta-Häme",
      "Keski-Pohjanmaa",
      "Keski-Suomi"
    ],
    "cities": [
      "Helsinki",
      "Tampere",
      "Espoo",
      "Vantaa",
      "Turku",
      "Oulu",
      "Kuopio"
    ],
    "iso2": "FI",
    "iso3": "FIN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "France",
    "region": "Europe",
    "divisions": [
      "Auvergne-Rhône-Alpes",
      "Bourgogne-Franche-Comté",
      "Bretagne",
      "Centre-Val de Loire",
      "Corsica",
      "Grand Est",
      "Hauts-de-France",
      "Île-de-France"
    ],
    "cities": [
      "Paris",
      "Lyon",
      "Marseille",
      "Toulouse",
      "Lille",
      "Bordeaux",
      "Nice"
    ],
    "iso2": "FR",
    "iso3": "FRA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Gabon",
    "region": "Africa",
    "divisions": [
      "Estuaire",
      "Haut-Ogooué",
      "Moyen-Ogooué",
      "Ngounié",
      "Nyanga",
      "Ogooué-Ivindo",
      "Ogooué-Lolo",
      "Ogooué-Maritime"
    ],
    "cities": [
      "Libreville",
      "Port-Gentil",
      "Franceville",
      "Owendo",
      "Oyem",
      "Ntoum",
      "Moanda"
    ],
    "iso2": "GA",
    "iso3": "GAB",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Gambia",
    "region": "Africa",
    "divisions": [
      "Banjul",
      "Kanifing",
      "North Bank",
      "West Coast",
      "Lower River",
      "Upper River",
      "Central River"
    ],
    "cities": [
      "Banjul",
      "Serekunda",
      "Kanifing",
      "Kerewan",
      "Brikama",
      "Bakau",
      "Sukuta"
    ],
    "iso2": "GM",
    "iso3": "GMB",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Georgia",
    "region": "Asia",
    "divisions": [
      "Abkhazia",
      "Ajaria",
      "Guria",
      "Imereti",
      "K’akheti",
      "Kvemo Kartli",
      "Mtskheta Mtianeti",
      "Rach’a-Lechkhumi da Kvemo Svaneti"
    ],
    "cities": [
      "Tbilisi",
      "Batumi",
      "Kutaisi",
      "Rustavi",
      "Sokhumi",
      "Gori",
      "Poti"
    ],
    "iso2": "GE",
    "iso3": "GEO",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Germany",
    "region": "Europe",
    "divisions": [
      "Baden-Württemberg",
      "Bavaria",
      "Berlin",
      "Brandenburg",
      "Bremen",
      "Hamburg",
      "Hesse",
      "Lower Saxony"
    ],
    "cities": [
      "Berlin",
      "Cologne",
      "Stuttgart",
      "Munich",
      "Hamburg",
      "Frankfurt",
      "Düsseldorf"
    ],
    "iso2": "DE",
    "iso3": "DEU",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Ghana",
    "region": "Africa",
    "divisions": [
      "Ahafo",
      "Ashanti",
      "Bono",
      "Bono East",
      "Central",
      "Eastern",
      "Greater Accra",
      "North East"
    ],
    "cities": [
      "Kumasi",
      "Boankra",
      "Akrofuom",
      "Accra",
      "Tamale",
      "Ashaiman",
      "Cape Coast"
    ],
    "iso2": "GH",
    "iso3": "GHA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Greece",
    "region": "Europe",
    "divisions": [
      "Anatolikí Makedonía kai Thráki",
      "Attikí",
      "Dytikí Elláda",
      "Dytikí Makedonía",
      "Ionía Nísia",
      "Ípeiros",
      "Kentrikí Makedonía",
      "Kríti"
    ],
    "cities": [
      "Athens",
      "Thessaloníki",
      "Piraeus",
      "Irákleio",
      "Pátra",
      "Lárisa",
      "Peristéri"
    ],
    "iso2": "GR",
    "iso3": "GRC",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Grenada",
    "region": "North America",
    "divisions": [
      "Saint David",
      "Saint George"
    ],
    "cities": [
      "Saint George’s",
      "Saint David’s"
    ],
    "iso2": "GD",
    "iso3": "GRD",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Guatemala",
    "region": "North America",
    "divisions": [
      "Alta Verapaz",
      "Baja Verapaz",
      "Chimaltenango",
      "Chiquimula",
      "El Progreso",
      "Escuintla",
      "Guatemala",
      "Huehuetenango"
    ],
    "cities": [
      "Guatemala City",
      "Mixco",
      "Villa Nueva",
      "Cobán",
      "Quetzaltenango",
      "Jalapa",
      "Jutiapa"
    ],
    "iso2": "GT",
    "iso3": "GTM",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Guinea",
    "region": "Africa",
    "divisions": [
      "Boké",
      "Conakry",
      "Faranah",
      "Kankan",
      "Kindia",
      "Labé",
      "Mamou",
      "N’Zérékoré"
    ],
    "cities": [
      "Conakry",
      "Siguiri",
      "Mamou",
      "N’Zérékoré",
      "Guéckédou",
      "Kamsar",
      "Kankan"
    ],
    "iso2": "GN",
    "iso3": "GIN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Guinea-Bissau",
    "region": "Africa",
    "divisions": [
      "Bafatá",
      "Biombo",
      "Bissau",
      "Bolama/Bijagós",
      "Cacheu",
      "Gabú",
      "Oio",
      "Quinara"
    ],
    "cities": [
      "Bissau",
      "Farim",
      "Contuboel",
      "Gabú",
      "Quinhámel",
      "Bambadinca",
      "Bafatá"
    ],
    "iso2": "GW",
    "iso3": "GNB",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Guyana",
    "region": "South America",
    "divisions": [
      "Barima-Waini",
      "Cuyuni-Mazaruni",
      "Demerara-Mahaica",
      "East Berbice-Corentyne",
      "Essequibo Islands-West Demerara",
      "Mahaica-Berbice",
      "Pomeroon-Supenaam",
      "Potaro-Siparuni"
    ],
    "cities": [
      "Georgetown",
      "Linden",
      "New Amsterdam",
      "Anna Regina",
      "Princetown",
      "Bartica",
      "Lethem"
    ],
    "iso2": "GY",
    "iso3": "GUY",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Haiti",
    "region": "North America",
    "divisions": [
      "Artibonite",
      "Centre",
      "Grand’Anse",
      "Nippes",
      "Nord",
      "Nord-Est",
      "Nord-Ouest",
      "Ouest"
    ],
    "cities": [
      "Port-au-Prince",
      "Carrefour",
      "Pétion-Ville",
      "Gonaïves",
      "Cap-Haïtien",
      "Delmas",
      "Saint-Marc"
    ],
    "iso2": "HT",
    "iso3": "HTI",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Honduras",
    "region": "North America",
    "divisions": [
      "Atlántida",
      "Choluteca",
      "Colón",
      "Comayagua",
      "Copán",
      "Cortés",
      "El Paraíso",
      "Francisco Morazán"
    ],
    "cities": [
      "Tegucigalpa",
      "Comayagüela",
      "San Pedro Sula",
      "Choloma",
      "La Ceiba",
      "Villanueva",
      "El Progreso"
    ],
    "iso2": "HN",
    "iso3": "HND",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Hungary",
    "region": "Europe",
    "divisions": [
      "Bács-Kiskun",
      "Baranya",
      "Békés",
      "Békéscsaba",
      "Borsod-Abaúj-Zemplén",
      "Budapest",
      "Csongrád-Csanád",
      "Debrecen"
    ],
    "cities": [
      "Budapest",
      "Debrecen",
      "Miskolc",
      "Székesfehérvár",
      "Pécs",
      "Győr",
      "Szeged"
    ],
    "iso2": "HU",
    "iso3": "HUN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Iceland",
    "region": "Europe",
    "divisions": [
      "Akureyri",
      "Borgarbyggð",
      "Garðabær",
      "Hafnarfjörður",
      "Ísafjarðarbær",
      "Kópavogur",
      "Múlaþing",
      "Reykjanesbær"
    ],
    "cities": [
      "Reykjavík",
      "Kópavogur",
      "Hafnarfjörður",
      "Keflavík",
      "Garðabær",
      "Akureyri",
      "Selfoss"
    ],
    "iso2": "IS",
    "iso3": "ISL",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "India",
    "region": "Asia",
    "divisions": [
      "Andaman and Nicobar Islands",
      "Andhra Pradesh",
      "Arunāchal Pradesh",
      "Assam",
      "Bihār",
      "Chandīgarh",
      "Chhattīsgarh",
      "Dādra and Nagar Haveli and Damān and Diu"
    ],
    "cities": [
      "Mumbai",
      "Kolkāta",
      "Delhi",
      "Chennai",
      "Bangalore",
      "Ahmedabad",
      "Pune"
    ],
    "iso2": "IN",
    "iso3": "IND",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Indonesia",
    "region": "Asia",
    "divisions": [
      "Aceh",
      "Bali",
      "Banten",
      "Bengkulu",
      "Gorontalo",
      "Jakarta",
      "Jambi",
      "Jawa Barat"
    ],
    "cities": [
      "Jakarta",
      "Bandung",
      "Surabaya",
      "Medan",
      "Lembok",
      "Bekasi",
      "Depok"
    ],
    "iso2": "ID",
    "iso3": "IDN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Iran",
    "region": "Middle East",
    "divisions": [
      "Alborz",
      "Ardabīl",
      "Āz̄arbāyjān-e Gharbī",
      "Āz̄arbāyjān-e Sharqī",
      "Būshehr",
      "Chahār Maḩāl va Bakhtīārī",
      "Eşfahān",
      "Fārs"
    ],
    "cities": [
      "Tehran",
      "Mashhad",
      "Eşfahān",
      "Karaj",
      "Shīrāz",
      "Tabrīz",
      "Ahvāz"
    ],
    "iso2": "IR",
    "iso3": "IRN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Iraq",
    "region": "Middle East",
    "divisions": [
      "Al Anbār",
      "Al Başrah",
      "Al Muthanná",
      "Al Qādisīyah",
      "An Najaf",
      "Arbīl",
      "As Sulaymānīyah",
      "Bābil"
    ],
    "cities": [
      "Baghdad",
      "Mosul",
      "Al Başrah",
      "Kirkuk",
      "As Sulaymānīyah",
      "Ar Ramādī",
      "Erbil"
    ],
    "iso2": "IQ",
    "iso3": "IRQ",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Ireland",
    "region": "Europe",
    "divisions": [
      "Carlow",
      "Cavan",
      "Clare",
      "Cork",
      "Donegal",
      "Dublin",
      "Dún Laoghaire-Rathdown",
      "Fingal"
    ],
    "cities": [
      "Dublin",
      "Finglas",
      "Cork",
      "Galway",
      "Tallaght",
      "Limerick",
      "Lucan"
    ],
    "iso2": "IE",
    "iso3": "IRL",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Israel",
    "region": "Middle East",
    "divisions": [
      "Central",
      "Haifa",
      "Jerusalem",
      "Northern",
      "Southern",
      "Tel Aviv"
    ],
    "cities": [
      "Tel Aviv",
      "Jerusalem",
      "Haifa",
      "Rishon LeZion",
      "Petah Tikva",
      "Ashdod",
      "Netanya"
    ],
    "iso2": "IL",
    "iso3": "ISR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Italy",
    "region": "Europe",
    "divisions": [
      "Abruzzo",
      "Basilicata",
      "Calabria",
      "Campania",
      "Emilia-Romagna",
      "Friuli Venezia Giulia",
      "Lazio",
      "Liguria"
    ],
    "cities": [
      "Rome",
      "Milan",
      "Naples",
      "Turin",
      "Palermo",
      "Genoa",
      "Bologna"
    ],
    "iso2": "IT",
    "iso3": "ITA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Jamaica",
    "region": "North America",
    "divisions": [
      "Clarendon",
      "Hanover",
      "Manchester",
      "Portland",
      "Saint Andrew",
      "Saint Ann",
      "Saint Catherine",
      "Saint Elizabeth"
    ],
    "cities": [
      "Kingston",
      "Portmore",
      "Spanish Town",
      "Montego Bay",
      "Lucky Hill",
      "Half Way Tree",
      "May Pen"
    ],
    "iso2": "JM",
    "iso3": "JAM",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Japan",
    "region": "Asia",
    "divisions": [
      "Aichi",
      "Akita",
      "Aomori",
      "Chiba",
      "Ehime",
      "Fukui",
      "Fukuoka",
      "Fukushima"
    ],
    "cities": [
      "Tokyo",
      "Ōsaka",
      "Nagoya",
      "Yokohama",
      "Fukuoka",
      "Sapporo",
      "Imaichi"
    ],
    "iso2": "JP",
    "iso3": "JPN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Jordan",
    "region": "Middle East",
    "divisions": [
      "‘Ajlūn",
      "Al ‘Aqabah",
      "Al ‘Āşimah",
      "Al Balqā’",
      "Al Karak",
      "Al Mafraq",
      "Aţ Ţafīlah",
      "Az Zarqā’"
    ],
    "cities": [
      "Amman",
      "Irbid",
      "Az Zarqā’",
      "Ar Ruşayfah",
      "Ar Ramthā",
      "Al Juwayyidah",
      "Saḩāb"
    ],
    "iso2": "JO",
    "iso3": "JOR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Kazakhstan",
    "region": "Asia",
    "divisions": [
      "Abay",
      "Almaty",
      "Aqmola",
      "Aqtöbe",
      "Atyraū",
      "East Kazakhstan",
      "Mangghystaū",
      "North Kazakhstan"
    ],
    "cities": [
      "Almaty",
      "Shymkent",
      "Astana",
      "Qaraghandy",
      "Taraz",
      "Aqtöbe",
      "Semey"
    ],
    "iso2": "KZ",
    "iso3": "KAZ",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Kenya",
    "region": "Africa",
    "divisions": [
      "Baringo",
      "Bomet",
      "Bungoma",
      "Busia",
      "Elgeyo/Marakwet",
      "Embu",
      "Garissa",
      "Homa Bay"
    ],
    "cities": [
      "Nairobi",
      "Kimunyu",
      "Kagira",
      "Banane",
      "Mombasa",
      "Murang’a",
      "Nakuru"
    ],
    "iso2": "KE",
    "iso3": "KEN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Kiribati",
    "region": "Oceania",
    "divisions": [
      "Administrative division"
    ],
    "cities": [
      "Tarawa",
      "Betio"
    ],
    "iso2": "KI",
    "iso3": "KIR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Kosovo",
    "region": "Europe",
    "divisions": [
      "Deçan",
      "Dragash",
      "Ferizaj",
      "Fushë Kosovë",
      "Gjakovë",
      "Gjilan",
      "Gllogovc",
      "Graçanicë"
    ],
    "cities": [
      "Pristina",
      "Prizren",
      "Mitrovicë",
      "Suharekë",
      "Gjilan",
      "Ferizaj",
      "Gllogovc"
    ],
    "iso2": "XK",
    "iso3": "XKX",
    "identifierSource": "GeoNames countryInfo.txt",
    "sourceCodeAliases": [
      {
        "scheme": "SimpleMaps World Cities iso3",
        "code": "XKS",
        "status": "source-specific user-assigned code; GeoNames uses XKX"
      }
    ]
  },
  {
    "country": "Kuwait",
    "region": "Middle East",
    "divisions": [
      "Al ‘Āşimah",
      "Al Aḩmadī",
      "Al Jahrā’"
    ],
    "cities": [
      "Kuwait City",
      "Al Jahrā’",
      "Abū Ḩulayfah",
      "Al Aḩmadī",
      "Ar Riqqah",
      "Al Wafrah"
    ],
    "iso2": "KW",
    "iso3": "KWT",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Kyrgyzstan",
    "region": "Asia",
    "divisions": [
      "Batken",
      "Bishkek",
      "Chüy",
      "Jalal-Abad",
      "Naryn",
      "Osh",
      "Talas",
      "Ysyk-Köl"
    ],
    "cities": [
      "Bishkek",
      "Osh",
      "Jalal-Abad",
      "Karakol",
      "Balykchy",
      "Tokmok",
      "Özgön"
    ],
    "iso2": "KG",
    "iso3": "KGZ",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Laos",
    "region": "Asia",
    "divisions": [
      "Attapu",
      "Bokèo",
      "Bolikhamxai",
      "Champasak",
      "Houaphan",
      "Khammouan",
      "Louangnamtha",
      "Louangphabang"
    ],
    "cities": [
      "Vientiane",
      "Xiangkhoang",
      "Savannakhet",
      "Pakxé",
      "Salavan",
      "Xai",
      "Xaignabouli"
    ],
    "iso2": "LA",
    "iso3": "LAO",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Latvia",
    "region": "Europe",
    "divisions": [
      "Ādaži",
      "Aizkraukle",
      "Alūksne",
      "Balvi",
      "Bauska",
      "Cēsis",
      "Daugavpils",
      "Dobele"
    ],
    "cities": [
      "Riga",
      "Liepāja",
      "Daugavpils",
      "Jelgava",
      "Jūrmala",
      "Ventspils",
      "Rēzekne"
    ],
    "iso2": "LV",
    "iso3": "LVA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Lebanon",
    "region": "Middle East",
    "divisions": [
      "Aakkâr",
      "Baalbek-Hermel",
      "Béqaa",
      "Beyrouth",
      "Liban-Nord",
      "Liban-Sud",
      "Mont-Liban",
      "Nabatîyé"
    ],
    "cities": [
      "Beirut",
      "Tripoli",
      "Sidon",
      "Borj Hammoud",
      "El Minié",
      "Joünié",
      "Zahlé"
    ],
    "iso2": "LB",
    "iso3": "LBN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Lesotho",
    "region": "Africa",
    "divisions": [
      "Berea",
      "Leribe",
      "Mafeteng",
      "Maseru",
      "Mohale’s Hoek",
      "Mokhotlong",
      "Qacha’s Nek",
      "Quthing"
    ],
    "cities": [
      "Maseru",
      "Teyateyaneng",
      "Mafeteng",
      "Leribe",
      "Maputsoe",
      "Mazenod",
      "Ratau"
    ],
    "iso2": "LS",
    "iso3": "LSO",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Liberia",
    "region": "Africa",
    "divisions": [
      "Bomi",
      "Bong",
      "Gbarpolu",
      "Grand Bassa",
      "Grand Cape Mount",
      "Grand Gedeh",
      "Grand Kru",
      "Lofa"
    ],
    "cities": [
      "Monrovia",
      "Paynesville",
      "Yeebo Town",
      "New Kru Town",
      "Upper Buchanan",
      "Sanniquellie",
      "Ganta"
    ],
    "iso2": "LR",
    "iso3": "LBR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Libya",
    "region": "Africa",
    "divisions": [
      "Al Buţnān",
      "Al Jabal al Akhḑar",
      "Al Jabal al Gharbī",
      "Al Jafārah",
      "Al Jufrah",
      "Al Kufrah",
      "Al Marj",
      "Al Marqab"
    ],
    "cities": [
      "Tripoli",
      "Benghazi",
      "Ajdābiyā",
      "Mişrātah",
      "Al Bayḑā’",
      "Al Khums",
      "Az Zāwīyah"
    ],
    "iso2": "LY",
    "iso3": "LBY",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Liechtenstein",
    "region": "Europe",
    "divisions": [
      "Balzers",
      "Eschen",
      "Gamprin",
      "Mauren",
      "Planken",
      "Ruggell",
      "Schaan",
      "Schellenberg"
    ],
    "cities": [
      "Schaan",
      "Vaduz",
      "Triesen",
      "Balzers",
      "Eschen",
      "Mauren",
      "Triesenberg"
    ],
    "iso2": "LI",
    "iso3": "LIE",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Lithuania",
    "region": "Europe",
    "divisions": [
      "Akmenė",
      "Alytaus Miestas",
      "Alytus",
      "Anykščiai",
      "Birštonas",
      "Biržai",
      "Druskininkai",
      "Elektrénai"
    ],
    "cities": [
      "Vilnius",
      "Kaunas",
      "Klaipėda",
      "Panevėžys",
      "Šiauliai",
      "Alytus",
      "Gvazdikai"
    ],
    "iso2": "LT",
    "iso3": "LTU",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Luxembourg",
    "region": "Europe",
    "divisions": [
      "Capellen",
      "Clervaux",
      "Diekirch",
      "Echternach",
      "Esch-sur-Alzette",
      "Grevenmacher",
      "Luxembourg",
      "Mersch"
    ],
    "cities": [
      "Luxembourg",
      "Esch-sur-Alzette",
      "Dudelange",
      "Pétange",
      "Differdange",
      "Bettembourg",
      "Mamer"
    ],
    "iso2": "LU",
    "iso3": "LUX",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Madagascar",
    "region": "Africa",
    "divisions": [
      "Antananarivo",
      "Antsiranana",
      "Fianarantsoa",
      "Mahajanga",
      "Toamasina",
      "Toliara"
    ],
    "cities": [
      "Antananarivo",
      "Betsiboka",
      "Antsirabe",
      "Toamasina",
      "Fianarantsoa",
      "Toliara",
      "Mahajanga"
    ],
    "iso2": "MG",
    "iso3": "MDG",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Malawi",
    "region": "Africa",
    "divisions": [
      "Balaka",
      "Blantyre",
      "Chikwawa",
      "Chiradzulu",
      "Chitipa",
      "Dedza",
      "Dowa",
      "Karonga"
    ],
    "cities": [
      "Lilongwe",
      "Blantyre",
      "Mzuzu",
      "Zomba",
      "Kasungu",
      "Mangochi",
      "Karonga"
    ],
    "iso2": "MW",
    "iso3": "MWI",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Malaysia",
    "region": "Asia",
    "divisions": [
      "Johor",
      "Kedah",
      "Kelantan",
      "Kuala Lumpur",
      "Labuan",
      "Melaka",
      "Negeri Sembilan",
      "Pahang"
    ],
    "cities": [
      "Kuala Lumpur",
      "Ipoh",
      "Taman Ria",
      "Seberang Jaya",
      "Johor Bahru",
      "George Town",
      "Klang"
    ],
    "iso2": "MY",
    "iso3": "MYS",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Maldives",
    "region": "Asia",
    "divisions": [
      "Addu",
      "Ariatholhu Dhekunuburi",
      "Ariatholhu Uthuruburi",
      "Faadhippolhu",
      "Felidheatholhu",
      "Fuvammulah",
      "Hahdhunmathi",
      "Huvadhuatholhu Dhekunuburi"
    ],
    "cities": [
      "Male",
      "Hithadhoo",
      "Foammulah",
      "Thinadhoo",
      "Viligili",
      "Kulhudhuffushi",
      "Naifaru"
    ],
    "iso2": "MV",
    "iso3": "MDV",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Mali",
    "region": "Africa",
    "divisions": [
      "Bamako",
      "Gao",
      "Kayes",
      "Kidal",
      "Koulikoro",
      "Mopti",
      "Ségou",
      "Sikasso"
    ],
    "cities": [
      "Bamako",
      "Balandougou",
      "Zégoua",
      "Koutiala",
      "Sikasso",
      "Ségou",
      "Kayes"
    ],
    "iso2": "ML",
    "iso3": "MLI",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Malta",
    "region": "Europe",
    "divisions": [
      "Attard",
      "Birgu",
      "Birkirkara",
      "Birżebbuġa",
      "Dingli",
      "Fgura",
      "Fontana",
      "Għajnsielem"
    ],
    "cities": [
      "Valletta",
      "Saint Paul’s Bay",
      "Mosta",
      "Birkirkara",
      "Sliema",
      "Qormi",
      "Żabbar"
    ],
    "iso2": "MT",
    "iso3": "MLT",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Marshall Islands",
    "region": "Oceania",
    "divisions": [
      "Majuro"
    ],
    "cities": [
      "Majuro"
    ],
    "iso2": "MH",
    "iso3": "MHL",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Mauritania",
    "region": "Africa",
    "divisions": [
      "Adrar",
      "Assaba",
      "Brakna",
      "Dakhlet Nouadhibou",
      "Gorgol",
      "Guidimaka",
      "Hodh ech Chargui",
      "Hodh el Gharbi"
    ],
    "cities": [
      "Nouakchott",
      "Arafat",
      "Dar Naim",
      "Nouadhibou",
      "Zouerate",
      "Ksar",
      "Kiffa"
    ],
    "iso2": "MR",
    "iso3": "MRT",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Mauritius",
    "region": "Africa",
    "divisions": [
      "Black River",
      "Flacq",
      "Grand Port",
      "Moka",
      "Pamplemousses",
      "Plaines Wilhems",
      "Port Louis",
      "Rivière du Rempart"
    ],
    "cities": [
      "Midlands",
      "Port Louis",
      "Quatre Bornes",
      "Curepipe",
      "Triolet",
      "Quartier Militaire",
      "Goodlands"
    ],
    "iso2": "MU",
    "iso3": "MUS",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Mexico",
    "region": "North America",
    "divisions": [
      "Aguascalientes",
      "Baja California",
      "Baja California Sur",
      "Campeche",
      "Chiapas",
      "Chihuahua",
      "Ciudad de México",
      "Coahuila"
    ],
    "cities": [
      "Mexico City",
      "Monterrey",
      "Guadalajara",
      "San Luis Potosí",
      "Toluca",
      "Tijuana",
      "Ecatepec"
    ],
    "iso2": "MX",
    "iso3": "MEX",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Micronesia",
    "region": "Oceania",
    "divisions": [
      "Chuuk",
      "Pohnpei",
      "Yap",
      "Kosrae"
    ],
    "cities": [
      "Weno",
      "Palikir",
      "Kolonia",
      "Colonia",
      "Tofol",
      "Lelu",
      "Madolenihmw"
    ],
    "iso2": "FM",
    "iso3": "FSM",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Moldova",
    "region": "Europe",
    "divisions": [
      "Anenii Noi",
      "Bălţi",
      "Basarabeasca",
      "Bender",
      "Briceni",
      "Cahul",
      "Călăraşi",
      "Cantemir"
    ],
    "cities": [
      "Chisinau",
      "Tiraspol",
      "Bălţi",
      "Bender",
      "Rîbniţa",
      "Ungheni",
      "Cahul"
    ],
    "iso2": "MD",
    "iso3": "MDA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Monaco",
    "region": "Europe",
    "divisions": [
      "Administrative division"
    ],
    "cities": [
      "Monaco"
    ],
    "iso2": "MC",
    "iso3": "MCO",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Mongolia",
    "region": "Asia",
    "divisions": [
      "Arhangay",
      "Bayan-Ölgiy",
      "Bayanhongor",
      "Bulgan",
      "Darhan-Uul",
      "Dornod",
      "Dornogovĭ",
      "Dundgovĭ"
    ],
    "cities": [
      "Ulaanbaatar",
      "Mörön",
      "Erdenet",
      "Darhan",
      "Nalayh",
      "Ölgiy",
      "Choybalsan"
    ],
    "iso2": "MN",
    "iso3": "MNG",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Montenegro",
    "region": "Europe",
    "divisions": [
      "Andrijevica",
      "Bar",
      "Berane",
      "Bijelo Polje",
      "Budva",
      "Cetinje",
      "Danilovgrad",
      "Gusinje"
    ],
    "cities": [
      "Podgorica",
      "Nikšić",
      "Herceg Novi",
      "Budva",
      "Pljevlja",
      "Bar",
      "Rožaje"
    ],
    "iso2": "ME",
    "iso3": "MNE",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Morocco",
    "region": "Africa",
    "divisions": [
      "Béni Mellal-Khénifra",
      "Casablanca-Settat",
      "Dakhla-Oued Ed-Dahab",
      "Drâa-Tafilalet",
      "Fès-Meknès",
      "Guelmim-Oued Noun",
      "Laâyoune-Sakia El Hamra",
      "Marrakech-Safi"
    ],
    "cities": [
      "Casablanca",
      "Tangier",
      "Fès",
      "Marrakech",
      "Sale",
      "Meknès",
      "Rabat"
    ],
    "iso2": "MA",
    "iso3": "MAR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Mozambique",
    "region": "Africa",
    "divisions": [
      "Cabo Delgado",
      "Gaza",
      "Inhambane",
      "Manica",
      "Maputo",
      "Nampula",
      "Niassa",
      "Sofala"
    ],
    "cities": [
      "Maputo",
      "Matola",
      "Nampula",
      "Beira",
      "Quelimane",
      "Chimoio",
      "Cidade de Nacala"
    ],
    "iso2": "MZ",
    "iso3": "MOZ",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Myanmar",
    "region": "Asia",
    "divisions": [
      "Ayeyarwady",
      "Bago",
      "Chin State",
      "Kachin State",
      "Kayah State",
      "Kayin State",
      "Magway",
      "Mandalay"
    ],
    "cities": [
      "Rangoon",
      "Mandalay",
      "Nay Pyi Taw",
      "Kyaukse",
      "Hpa-An",
      "Pathein",
      "Bago"
    ],
    "iso2": "MM",
    "iso3": "MMR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Namibia",
    "region": "Africa",
    "divisions": [
      "Erongo",
      "Hardap",
      "Kavango East",
      "Kavango West",
      "Khomas",
      "Kunene",
      "Ohangwena",
      "Omaheke"
    ],
    "cities": [
      "Windhoek",
      "Rundu",
      "Walvisbaai",
      "Swakopmund",
      "Oshakati",
      "Otjiwarongo",
      "Katima Mulilo"
    ],
    "iso2": "NA",
    "iso3": "NAM",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Nauru",
    "region": "Oceania",
    "divisions": [
      "Yaren"
    ],
    "cities": [
      "Yaren"
    ],
    "iso2": "NR",
    "iso3": "NRU",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Nepal",
    "region": "Asia",
    "divisions": [
      "Bāgmatī",
      "Gaṇḍakī",
      "Karṇālī",
      "Lumbinī",
      "Madhesh",
      "Province Number One",
      "Sudūrpashchim"
    ],
    "cities": [
      "Kathmandu",
      "Pathlaiyā",
      "Bardi̇̄bās",
      "Bharatpur",
      "Pokhara",
      "Birāṭnagar",
      "Buḍhānilkanṭha"
    ],
    "iso2": "NP",
    "iso3": "NPL",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Netherlands",
    "region": "Europe",
    "divisions": [
      "Drenthe",
      "Flevoland",
      "Fryslân",
      "Gelderland",
      "Groningen",
      "Limburg",
      "Noord-Brabant",
      "Noord-Holland"
    ],
    "cities": [
      "Amsterdam",
      "Rotterdam",
      "The Hague",
      "Utrecht",
      "Maastricht",
      "Harssens",
      "Eindhoven"
    ],
    "iso2": "NL",
    "iso3": "NLD",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "New Zealand",
    "region": "Oceania",
    "divisions": [
      "Auckland",
      "Bay of Plenty",
      "Canterbury",
      "Chatham Islands",
      "Gisborne",
      "Hawke’s Bay",
      "Manawatu-Wanganui",
      "Marlborough"
    ],
    "cities": [
      "Auckland",
      "Christchurch",
      "Wellington",
      "Northcote",
      "Hamilton",
      "Tauranga",
      "Dunedin"
    ],
    "iso2": "NZ",
    "iso3": "NZL",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Nicaragua",
    "region": "North America",
    "divisions": [
      "Boaco",
      "Carazo",
      "Chinandega",
      "Chontales",
      "Costa Caribe Norte",
      "Costa Caribe Sur",
      "Estelí",
      "Granada"
    ],
    "cities": [
      "Managua",
      "León",
      "Tipitapa",
      "Masaya",
      "Ciudad Sandino",
      "Chinandega",
      "Matagalpa"
    ],
    "iso2": "NI",
    "iso3": "NIC",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Niger",
    "region": "Africa",
    "divisions": [
      "Agadez",
      "Diffa",
      "Dosso",
      "Maradi",
      "Niamey",
      "Tahoua",
      "Tillabéri",
      "Zinder"
    ],
    "cities": [
      "Niamey",
      "Maradi",
      "Zinder",
      "Tahoua",
      "Agadez",
      "Arlit",
      "Birnin Konni"
    ],
    "iso2": "NE",
    "iso3": "NER",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Nigeria",
    "region": "Africa",
    "divisions": [
      "Abia",
      "Adamawa",
      "Akwa Ibom",
      "Anambra",
      "Bauchi",
      "Bayelsa",
      "Benue",
      "Borno"
    ],
    "cities": [
      "Lagos",
      "Kano",
      "Ibadan",
      "Abuja",
      "Awka",
      "Port Harcourt",
      "Benin City"
    ],
    "iso2": "NG",
    "iso3": "NGA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "North Korea",
    "region": "Asia",
    "divisions": [
      "Chagang",
      "Hambuk",
      "Hamnam",
      "Hwangbuk",
      "Hwangnam",
      "Kangwŏn",
      "Namp’o",
      "P’yŏngbuk"
    ],
    "cities": [
      "Pyongyang",
      "Hamhŭng",
      "Nampo",
      "Ch’ŏngjin",
      "Sunch’ŏn",
      "Wŏnsan",
      "Sinŭiju"
    ],
    "iso2": "KP",
    "iso3": "PRK",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "North Macedonia",
    "region": "Europe",
    "divisions": [
      "Aračinovo",
      "Berovo",
      "Bitola",
      "Bogdanci",
      "Bogovinje",
      "Bosilovo",
      "Centar Župa",
      "Čučer-Sandevo"
    ],
    "cities": [
      "Skopje",
      "Kumanovo",
      "Bitola",
      "Prilep",
      "Tetovo",
      "Štip",
      "Veles"
    ],
    "iso2": "MK",
    "iso3": "MKD",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Norway",
    "region": "Europe",
    "divisions": [
      "Agder",
      "Innlandet",
      "Møre og Romsdal",
      "Nordland",
      "Oslo",
      "Rogaland",
      "Troms og Finnmark",
      "Trøndelag"
    ],
    "cities": [
      "Oslo",
      "Bergen",
      "Stavanger",
      "Sandnes",
      "Trondheim",
      "Kristiansand",
      "Sandvika"
    ],
    "iso2": "NO",
    "iso3": "NOR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Oman",
    "region": "Middle East",
    "divisions": [
      "Ad Dākhilīyah",
      "Al Buraymī",
      "Al Wusţá",
      "Az̧ Z̧āhirah",
      "Janūb al Bāţinah",
      "Janūb ash Sharqīyah",
      "Masqaţ",
      "Musandam"
    ],
    "cities": [
      "Masqaţ",
      "Muscat",
      "Bawshar",
      "Şalālah",
      "Maţraḩ",
      "Şuḩār",
      "As Suwayq"
    ],
    "iso2": "OM",
    "iso3": "OMN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Pakistan",
    "region": "Asia",
    "divisions": [
      "Azad Kashmir",
      "Balochistan",
      "Gilgit-Baltistan",
      "Islamabad",
      "Khyber Pakhtunkhwa",
      "Punjab",
      "Sindh"
    ],
    "cities": [
      "Karachi",
      "Lahore",
      "Faisalabad",
      "Rawalpindi",
      "Gujranwala",
      "Peshawar",
      "Multan"
    ],
    "iso2": "PK",
    "iso3": "PAK",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Palau",
    "region": "Oceania",
    "divisions": [
      "Koror",
      "Melekeok"
    ],
    "cities": [
      "Koror",
      "Melekeok",
      "Ngerulmud"
    ],
    "iso2": "PW",
    "iso3": "PLW",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Palestine",
    "region": "Asia",
    "divisions": [
      "Jenin",
      "Tubas",
      "Tulkarm",
      "Nablus",
      "Qalqiliya",
      "Salfit",
      "Ramallah and al-Bireh",
      "Jerusalem",
      "Jericho and the Jordan Valley",
      "Bethlehem",
      "Hebron",
      "North Gaza",
      "Gaza",
      "Deir al-Balah",
      "Khan Yunis",
      "Rafah"
    ],
    "cities": [
      "Gaza City",
      "Khan Yunis",
      "Rafah",
      "Nablus",
      "Hebron",
      "Ramallah",
      "Bethlehem"
    ],
    "iso2": "PS",
    "iso3": "PSE",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Panama",
    "region": "North America",
    "divisions": [
      "Bocas del Toro",
      "Chiriquí",
      "Coclé",
      "Colón",
      "Darién",
      "Guna Yala",
      "Herrera",
      "Los Santos"
    ],
    "cities": [
      "Panama City",
      "San Miguelito",
      "Colón",
      "Tocumen",
      "David",
      "La Chorrera",
      "Balboa Heights"
    ],
    "iso2": "PA",
    "iso3": "PAN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Papua New Guinea",
    "region": "Oceania",
    "divisions": [
      "Bougainville",
      "Central",
      "Chimbu",
      "East New Britain",
      "East Sepik",
      "Eastern Highlands",
      "Enga",
      "Gulf"
    ],
    "cities": [
      "Alotau",
      "Port Moresby",
      "Lae",
      "Popondetta",
      "Mendi",
      "Arawa",
      "Mount Hagen"
    ],
    "iso2": "PG",
    "iso3": "PNG",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Paraguay",
    "region": "South America",
    "divisions": [
      "Alto Paraguay",
      "Alto Paraná",
      "Amambay",
      "Asunción",
      "Boquerón",
      "Caaguazú",
      "Caazapá",
      "Canindeyú"
    ],
    "cities": [
      "Asunción",
      "Ciudad del Este",
      "San José Obrero",
      "Luque",
      "Capiatá",
      "San Lorenzo",
      "Coronel Oviedo"
    ],
    "iso2": "PY",
    "iso3": "PRY",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Peru",
    "region": "South America",
    "divisions": [
      "Amazonas",
      "Ancash",
      "Apurímac",
      "Arequipa",
      "Ayacucho",
      "Cajamarca",
      "Callao",
      "Cusco"
    ],
    "cities": [
      "Lima",
      "Trujillo",
      "Arequipa",
      "Callao",
      "Chiclayo",
      "Piura",
      "Cusco"
    ],
    "iso2": "PE",
    "iso3": "PER",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Philippines",
    "region": "Asia",
    "divisions": [
      "Abra",
      "Agusan del Norte",
      "Agusan del Sur",
      "Aklan",
      "Albay",
      "Angeles",
      "Antique",
      "Apayao"
    ],
    "cities": [
      "Manila",
      "Quezon City",
      "Zamboanga City",
      "Caloocan City",
      "Taguig City",
      "Canagatan",
      "Davao"
    ],
    "iso2": "PH",
    "iso3": "PHL",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Poland",
    "region": "Europe",
    "divisions": [
      "Dolnośląskie",
      "Kujawsko-Pomorskie",
      "Łódzkie",
      "Lubelskie",
      "Lubuskie",
      "Małopolskie",
      "Mazowieckie",
      "Opolskie"
    ],
    "cities": [
      "Zabrze",
      "Świętochłowice",
      "Sosnowiec",
      "Radzionków Nowy",
      "Pyskowice",
      "Ruda Śląska",
      "Orzesze"
    ],
    "iso2": "PL",
    "iso3": "POL",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Portugal",
    "region": "Europe",
    "divisions": [
      "Aveiro",
      "Azores",
      "Beja",
      "Braga",
      "Bragança",
      "Castelo Branco",
      "Coimbra",
      "Évora"
    ],
    "cities": [
      "Porto",
      "Lisbon",
      "Aves",
      "Sintra",
      "Vila Nova de Gaia",
      "Cascais",
      "Loures"
    ],
    "iso2": "PT",
    "iso3": "PRT",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Qatar",
    "region": "Middle East",
    "divisions": [
      "Ad Dawḩah",
      "Al Khawr wa adh Dhakhīrah",
      "Al Wakrah",
      "Ar Rayyān",
      "Ash Shamāl",
      "Ash Shīḩānīyah",
      "Az̧ Z̧a‘āyin",
      "Umm Şalāl"
    ],
    "cities": [
      "Doha",
      "Ar Rayyān",
      "Laqţah",
      "Ash Shīḩānīyah",
      "Al Wakrah",
      "Umm Qurūn",
      "Al Khawr"
    ],
    "iso2": "QA",
    "iso3": "QAT",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Republic of the Congo",
    "region": "Africa",
    "divisions": [
      "Bouenza",
      "Brazzaville",
      "Cuvette",
      "Cuvette-Ouest",
      "Kouilou",
      "Lékoumou",
      "Likouala",
      "Niari"
    ],
    "cities": [
      "Brazzaville",
      "Pointe-Noire",
      "Tchibota",
      "Dolisie",
      "Kayes",
      "Oyo",
      "Bétou"
    ],
    "iso2": "CG",
    "iso3": "COG",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Romania",
    "region": "Europe",
    "divisions": [
      "Alba",
      "Arad",
      "Argeş",
      "Bacău",
      "Bihor",
      "Bistriţa-Năsăud",
      "Botoşani",
      "Brăila"
    ],
    "cities": [
      "Bucharest",
      "Cluj-Napoca",
      "Iaşi",
      "Constanţa",
      "Timişoara",
      "Braşov",
      "Craiova"
    ],
    "iso2": "RO",
    "iso3": "ROU",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Russia",
    "region": "Europe/Asia",
    "divisions": [
      "Adygeya",
      "Altay",
      "Amurskaya Oblast’",
      "Arkhangel’skaya Oblast’",
      "Astrakhanskaya Oblast’",
      "Bashkortostan",
      "Belgorodskaya Oblast’",
      "Bryanskaya Oblast’"
    ],
    "cities": [
      "Moscow",
      "Saint Petersburg",
      "Novosibirsk",
      "Yekaterinburg",
      "Kazan",
      "Nizhniy Novgorod",
      "Chelyabinsk"
    ],
    "iso2": "RU",
    "iso3": "RUS",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Rwanda",
    "region": "Africa",
    "divisions": [
      "Eastern Province",
      "Kigali",
      "Northern Province",
      "Southern Province",
      "Western Province"
    ],
    "cities": [
      "Kigali",
      "Muhanga",
      "Ruhengeri",
      "Gitarama",
      "Nyamata",
      "Gisenyi",
      "Nyundo"
    ],
    "iso2": "RW",
    "iso3": "RWA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Saint Kitts and Nevis",
    "region": "North America",
    "divisions": [
      "Saint George Basseterre"
    ],
    "cities": [
      "Basseterre"
    ],
    "iso2": "KN",
    "iso3": "KNA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Saint Lucia",
    "region": "North America",
    "divisions": [
      "Castries",
      "Gros-Islet",
      "Micoud",
      "Vieux-Fort"
    ],
    "cities": [
      "Gros Islet",
      "Castries",
      "Micoud",
      "Vieux Fort",
      "Bisee"
    ],
    "iso2": "LC",
    "iso3": "LCA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Saint Vincent and the Grenadines",
    "region": "North America",
    "divisions": [
      "Saint George"
    ],
    "cities": [
      "Kingstown",
      "Calliaqua"
    ],
    "iso2": "VC",
    "iso3": "VCT",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Samoa",
    "region": "Oceania",
    "divisions": [
      "A‘ana",
      "Atua",
      "Fa‘asaleleaga",
      "Gaga‘emauga",
      "Gagaifomauga",
      "Palauli",
      "Satupa‘itea",
      "Tuamasaga"
    ],
    "cities": [
      "Apia",
      "Afega",
      "Safotu",
      "Leulumoega",
      "Asau",
      "Lufilufi",
      "Vailoa"
    ],
    "iso2": "WS",
    "iso3": "WSM",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "San Marino",
    "region": "Europe",
    "divisions": [
      "Acquaviva",
      "Borgo Maggiore",
      "Chiesanuova",
      "Domagnano",
      "Faetano",
      "Fiorentino",
      "Montegiardino",
      "Serravalle"
    ],
    "cities": [
      "Serravalle",
      "Borgo Maggiore",
      "San Marino",
      "Domagnano",
      "Fiorentino",
      "Acquaviva",
      "Faetano"
    ],
    "iso2": "SM",
    "iso3": "SMR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Sao Tome and Principe",
    "region": "Africa",
    "divisions": [
      "Água Grande",
      "Cantagalo",
      "Caué",
      "Lembá",
      "Lobata",
      "Mé-Zóchi",
      "Príncipe"
    ],
    "cities": [
      "São Tomé",
      "Neves",
      "Santana",
      "São João dos Angolares",
      "Trindade",
      "Guadalupe",
      "Santo António"
    ],
    "iso2": "ST",
    "iso3": "STP",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Saudi Arabia",
    "region": "Middle East",
    "divisions": [
      "‘Asīr",
      "Al Bāḩah",
      "Al Ḩudūd ash Shamālīyah",
      "Al Jawf",
      "Al Madīnah al Munawwarah",
      "Al Qaşīm",
      "Ar Riyāḑ",
      "Ash Sharqīyah"
    ],
    "cities": [
      "Riyadh",
      "Jeddah",
      "Mecca",
      "Ad Dammām",
      "Medina",
      "Khamīs Mushayţ",
      "Tabūk"
    ],
    "iso2": "SA",
    "iso3": "SAU",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Senegal",
    "region": "Africa",
    "divisions": [
      "Dakar",
      "Diourbel",
      "Fatick",
      "Kaffrine",
      "Kaolack",
      "Kédougou",
      "Kolda",
      "Louga"
    ],
    "cities": [
      "Dakar",
      "Pikine",
      "Touba",
      "Thiès",
      "Guédiawaye",
      "Rufisque",
      "Mbour"
    ],
    "iso2": "SN",
    "iso3": "SEN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Serbia",
    "region": "Europe",
    "divisions": [
      "Å umadijski",
      "Beograd",
      "Borski",
      "Branicevski",
      "Jablanicki",
      "JuÅ¾no-Backi",
      "JuÅ¾no-Banatski",
      "Kolubarski"
    ],
    "cities": [
      "Belgrade",
      "Novi Sad",
      "Niš",
      "Zemun",
      "Kragujevac",
      "Subotica",
      "Šabac"
    ],
    "iso2": "RS",
    "iso3": "SRB",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Seychelles",
    "region": "Africa",
    "divisions": [
      "Mont Buxton"
    ],
    "cities": [
      "Victoria"
    ],
    "iso2": "SC",
    "iso3": "SYC",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Sierra Leone",
    "region": "Africa",
    "divisions": [
      "Eastern",
      "North Western",
      "Northern",
      "Southern",
      "Western Area"
    ],
    "cities": [
      "Freetown",
      "Bo",
      "Kenema",
      "Koidu",
      "Makeni",
      "Koidu-Bulma",
      "Port Loko"
    ],
    "iso2": "SL",
    "iso3": "SLE",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Singapore",
    "region": "Asia",
    "divisions": [],
    "cities": [
      "Singapore",
      "Bedok New Town",
      "Woodlands New Town",
      "Jurong West",
      "Yishun New Town",
      "Punggol",
      "Choa Chu Kang New Town"
    ],
    "iso2": "SG",
    "iso3": "SGP",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Slovakia",
    "region": "Europe",
    "divisions": [
      "Banská Bystrica",
      "Bratislava",
      "Košice",
      "Nitra",
      "Prešov",
      "Trenčin",
      "Trnava",
      "Žilina"
    ],
    "cities": [
      "Bratislava",
      "Košice",
      "Petržalka",
      "Prešov",
      "Žilina",
      "Nitra",
      "Banská Bystrica"
    ],
    "iso2": "SK",
    "iso3": "SVK",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Slovenia",
    "region": "Europe",
    "divisions": [
      "Ajdovščina",
      "Ankaran",
      "Apače",
      "Beltinci",
      "Benedikt",
      "Bistrica ob Sotli",
      "Bled",
      "Bloke"
    ],
    "cities": [
      "Ljubljana",
      "Maribor",
      "Kranj",
      "Celje",
      "Koper",
      "Velenje",
      "Novo Mesto"
    ],
    "iso2": "SI",
    "iso3": "SVN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Solomon Islands",
    "region": "Oceania",
    "divisions": [
      "Central",
      "Choiseul",
      "Honiara",
      "Isabel",
      "Makira and Ulawa",
      "Malaita",
      "Rennell and Bellona",
      "Temotu"
    ],
    "cities": [
      "Honiara",
      "Gizo",
      "Auki",
      "Kirakira",
      "Buala",
      "Tulagi",
      "Tigoa"
    ],
    "iso2": "SB",
    "iso3": "SLB",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Somalia",
    "region": "Africa",
    "divisions": [
      "Awdal",
      "Bakool",
      "Banaadir",
      "Bari",
      "Bay",
      "Galguduud",
      "Gedo",
      "Hiiraan"
    ],
    "cities": [
      "Mogadishu",
      "Hargeysa",
      "Baidoa",
      "Boosaaso",
      "Baardheere",
      "Jawhar",
      "Gaalkacyo"
    ],
    "iso2": "SO",
    "iso3": "SOM",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "South Africa",
    "region": "Africa",
    "divisions": [
      "Eastern Cape",
      "Free State",
      "Gauteng",
      "KwaZulu-Natal",
      "Limpopo",
      "Mpumalanga",
      "North West",
      "Northern Cape"
    ],
    "cities": [
      "Johannesburg",
      "Soweto",
      "Gqeberha",
      "Katlehong",
      "Pretoria",
      "Pietermaritzburg",
      "Durban"
    ],
    "iso2": "ZA",
    "iso3": "ZAF",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "South Korea",
    "region": "Asia",
    "divisions": [
      "Busan",
      "Chungbuk",
      "Chungnam",
      "Daegu",
      "Daejeon",
      "Gangwon",
      "Gyeongbuk",
      "Gyeonggi"
    ],
    "cities": [
      "Seoul",
      "Busan",
      "Incheon",
      "Daegu",
      "Gwangju",
      "Daejeon",
      "Suwon"
    ],
    "iso2": "KR",
    "iso3": "KOR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "South Sudan",
    "region": "Africa",
    "divisions": [
      "Central Equatoria",
      "Eastern Equatoria",
      "Jonglei",
      "Lakes",
      "Northern Bahr el Ghazal",
      "Unity",
      "Upper Nile",
      "Warrap"
    ],
    "cities": [
      "Juba",
      "Wau",
      "Bor",
      "Kajo Kaji",
      "Yei",
      "Magwe",
      "Malakal"
    ],
    "iso2": "SS",
    "iso3": "SSD",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Spain",
    "region": "Europe",
    "divisions": [
      "Andalusia",
      "Aragon",
      "Asturias",
      "Balearic Islands",
      "Basque Country",
      "Canary Islands",
      "Cantabria",
      "Castille-La Mancha"
    ],
    "cities": [
      "Madrid",
      "Barcelona",
      "Valencia",
      "Sevilla",
      "Málaga",
      "Bilbao",
      "Zaragoza"
    ],
    "iso2": "ES",
    "iso3": "ESP",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Sri Lanka",
    "region": "Asia",
    "divisions": [
      "Central",
      "Eastern",
      "North Central",
      "North Western",
      "Northern",
      "Sabaragamuwa",
      "Southern",
      "Uva"
    ],
    "cities": [
      "Colombo",
      "Kesbewa",
      "Mount Lavinia",
      "Maharagama",
      "Gampaha",
      "Moratuwa",
      "Ratnapura"
    ],
    "iso2": "LK",
    "iso3": "LKA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Sudan",
    "region": "Africa",
    "divisions": [
      "Blue Nile",
      "Central Darfur",
      "East Darfur",
      "Gedaref",
      "Gezira",
      "Kassala",
      "Khartoum",
      "North Darfur"
    ],
    "cities": [
      "Khartoum",
      "Omdurman",
      "Khartoum North",
      "Port Sudan",
      "El Obeid",
      "Kassala",
      "Kūstī"
    ],
    "iso2": "SD",
    "iso3": "SDN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Suriname",
    "region": "South America",
    "divisions": [
      "Brokopondo",
      "Commewijne",
      "Coronie",
      "Marowijne",
      "Nickerie",
      "Para",
      "Paramaribo",
      "Saramacca"
    ],
    "cities": [
      "Paramaribo",
      "Cottica",
      "Koewarasan",
      "Lelydorp",
      "Nieuw Nickerie",
      "Meerzorg",
      "Moengo"
    ],
    "iso2": "SR",
    "iso3": "SUR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Sweden",
    "region": "Europe",
    "divisions": [
      "Blekinge",
      "Dalarna",
      "Gävleborg",
      "Gotland",
      "Halland",
      "Jämtland",
      "Jönköping",
      "Kalmar"
    ],
    "cities": [
      "Stockholm",
      "Gothenburg",
      "Malmö",
      "Uppsala",
      "Norrköping",
      "Västerås",
      "Örebro"
    ],
    "iso2": "SE",
    "iso3": "SWE",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Switzerland",
    "region": "Europe",
    "divisions": [
      "Aargau",
      "Appenzell Ausserrhoden",
      "Appenzell Innerrhoden",
      "Basel-Landschaft",
      "Basel-Stadt",
      "Bern",
      "Fribourg",
      "Genève"
    ],
    "cities": [
      "Zürich",
      "Geneva",
      "Basel",
      "Lausanne",
      "Bern",
      "Winterthur",
      "Lucerne"
    ],
    "iso2": "CH",
    "iso3": "CHE",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Syria",
    "region": "Middle East",
    "divisions": [
      "Al Ḩasakah",
      "Al Lādhiqīyah",
      "Al Qunayţirah",
      "Ar Raqqah",
      "As Suwaydā’",
      "Dar‘ā",
      "Dayr az Zawr",
      "Dimashq"
    ],
    "cities": [
      "Damascus",
      "Aleppo",
      "Homs",
      "Latakia",
      "Ḩamāh",
      "Ţarţūs",
      "Dūmā"
    ],
    "iso2": "SY",
    "iso3": "SYR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Taiwan",
    "region": "Asia",
    "divisions": [
      "Changhua",
      "Chiayi",
      "Hsinchu",
      "Hualien",
      "Kaohsiung",
      "Keelung",
      "Kinmen",
      "Lienchiang"
    ],
    "cities": [
      "Taoyuan District",
      "Taichung",
      "Kaohsiung",
      "Taipei",
      "Tainan",
      "Hsinchu",
      "Keelung"
    ],
    "iso2": "TW",
    "iso3": "TWN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Tajikistan",
    "region": "Asia",
    "divisions": [
      "Dushanbe",
      "Khatlon",
      "Kŭhistoni Badakhshon",
      "Nohiyahoi Tobei Jumhurí",
      "Sughd"
    ],
    "cities": [
      "Dushanbe",
      "Khŭjand",
      "Konibodom",
      "Bokhtar",
      "Kŭlob",
      "Istaravshan",
      "Tursunzoda"
    ],
    "iso2": "TJ",
    "iso3": "TJK",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Tanzania",
    "region": "Africa",
    "divisions": [
      "Arusha",
      "Coast",
      "Dar es Salaam",
      "Dodoma",
      "Geita",
      "Iringa",
      "Kagera",
      "Katavi"
    ],
    "cities": [
      "Dar es Salaam",
      "Mwanza",
      "Ubungo",
      "Mbeya",
      "Morogoro",
      "Arusha",
      "Uvinza"
    ],
    "iso2": "TZ",
    "iso3": "TZA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Thailand",
    "region": "Asia",
    "divisions": [
      "Amnat Charoen",
      "Ang Thong",
      "Bueng Kan",
      "Buri Ram",
      "Chachoengsao",
      "Chai Nat",
      "Chaiyaphum",
      "Chanthaburi"
    ],
    "cities": [
      "Bangkok",
      "Chiang Mai",
      "Nakhon Ratchasima",
      "Khon Kaen",
      "Hat Yai",
      "Phatthaya",
      "Chon Buri"
    ],
    "iso2": "TH",
    "iso3": "THA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Timor-Leste",
    "region": "Asia",
    "divisions": [
      "Aileu",
      "Ainaro",
      "Baucau",
      "Bobonaro",
      "Díli",
      "Ermera",
      "Kovalima",
      "Lautém"
    ],
    "cities": [
      "Dili",
      "Maliana",
      "Baucau",
      "Lospalos",
      "Manatuto",
      "Pante Macassar",
      "Gleno"
    ],
    "iso2": "TL",
    "iso3": "TLS",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Togo",
    "region": "Africa",
    "divisions": [
      "Centrale",
      "Kara",
      "Maritime",
      "Plateaux",
      "Savanes"
    ],
    "cities": [
      "Lomé",
      "Dapaong",
      "Sokodé",
      "Atakpamé",
      "Kpalimé",
      "Tsévié",
      "Anié"
    ],
    "iso2": "TG",
    "iso3": "TGO",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Tonga",
    "region": "Oceania",
    "divisions": [
      "Tongatapu",
      "Vava‘u"
    ],
    "cities": [
      "Nuku‘alofa",
      "Neiafu"
    ],
    "iso2": "TO",
    "iso3": "TON",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Trinidad and Tobago",
    "region": "North America",
    "divisions": [
      "Arima",
      "Chaguanas",
      "Couva/Tabaquite/Talparo",
      "Diego Martin",
      "Mayaro/Rio Claro",
      "Penal/Debe",
      "Point Fortin",
      "Port of Spain"
    ],
    "cities": [
      "Chaguanas",
      "Port of Spain",
      "San Fernando",
      "Arima",
      "Couva",
      "Point Fortin",
      "Princes Town"
    ],
    "iso2": "TT",
    "iso3": "TTO",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Tunisia",
    "region": "Africa",
    "divisions": [
      "Béja",
      "Ben Arous",
      "Bizerte",
      "Gabès",
      "Gafsa",
      "Jendouba",
      "Kairouan",
      "Kasserine"
    ],
    "cities": [
      "Tunis",
      "Sfax",
      "Sousse",
      "Kairouan",
      "Métouia",
      "Kebili",
      "Sukrah"
    ],
    "iso2": "TN",
    "iso3": "TUN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Türkiye",
    "region": "Europe/Asia",
    "divisions": [
      "İstanbul",
      "Ankara",
      "Kocaeli",
      "Adana",
      "Van",
      "Denizli",
      "Bursa",
      "Batman"
    ],
    "cities": [
      "Istanbul",
      "Esenyurt",
      "Çankaya",
      "Küçükçekmece",
      "Bağcılar",
      "Pendik",
      "Umraniye"
    ],
    "iso2": "TR",
    "iso3": "TUR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Turkmenistan",
    "region": "Asia",
    "divisions": [
      "Ahal",
      "Aşgabat",
      "Balkan",
      "Daşoguz",
      "Lebap",
      "Mary"
    ],
    "cities": [
      "Ashgabat",
      "Türkmenabat",
      "Daşoguz",
      "Balkanabat",
      "Mary",
      "Bayramaly",
      "Serdar"
    ],
    "iso2": "TM",
    "iso3": "TKM",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Tuvalu",
    "region": "Oceania",
    "divisions": [
      "Funafuti"
    ],
    "cities": [
      "Funafuti"
    ],
    "iso2": "TV",
    "iso3": "TUV",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Uganda",
    "region": "Africa",
    "divisions": [
      "Abim",
      "Adjumani",
      "Agago",
      "Alebtong",
      "Amolatar",
      "Amudat",
      "Amuria",
      "Amuru"
    ],
    "cities": [
      "Kampala",
      "Nansana",
      "Mbale",
      "Arua",
      "Kamwenge",
      "Kyengera",
      "Mukono"
    ],
    "iso2": "UG",
    "iso3": "UGA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Ukraine",
    "region": "Europe",
    "divisions": [
      "Cherkaska Oblast",
      "Chernihivska Oblast",
      "Chernivetska Oblast",
      "Dnipropetrovska Oblast",
      "Donetska Oblast",
      "Ivano-Frankivska Oblast",
      "Kharkivska Oblast",
      "Khersonska Oblast"
    ],
    "cities": [
      "Kyiv",
      "Kharkiv",
      "Odesa",
      "Dnipro",
      "Donetsk",
      "Lviv",
      "Zaporizhzhia"
    ],
    "iso2": "UA",
    "iso3": "UKR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "United Arab Emirates",
    "region": "Middle East",
    "divisions": [
      "‘Ajmān",
      "Abū Z̧aby",
      "Al Fujayrah",
      "Ash Shāriqah",
      "Dubayy",
      "Ra’s al Khaymah",
      "Umm al Qaywayn"
    ],
    "cities": [
      "Dubai",
      "Abu Dhabi",
      "Sharjah",
      "Al ‘Ayn",
      "‘Ajmān",
      "Ra’s al Khaymah",
      "Al Fujayrah"
    ],
    "iso2": "AE",
    "iso3": "ARE",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "United Kingdom",
    "region": "Europe",
    "divisions": [
      "Aberdeen City",
      "Aberdeenshire",
      "Angus",
      "Antrim and Newtownabbey",
      "Ards and North Down",
      "Argyll and Bute",
      "Armagh City, Banbridge and Craigavon",
      "Barking and Dagenham"
    ],
    "cities": [
      "London",
      "Birmingham",
      "Portsmouth",
      "Southampton",
      "Bristol",
      "Glasgow",
      "Manchester"
    ],
    "iso2": "GB",
    "iso3": "GBR",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "United States",
    "region": "North America",
    "divisions": [
      "Alabama",
      "Alaska",
      "Arizona",
      "Arkansas",
      "California",
      "Colorado",
      "Connecticut",
      "Delaware"
    ],
    "cities": [
      "New York",
      "Los Angeles",
      "Chicago",
      "Miami",
      "Houston",
      "Dallas",
      "Philadelphia"
    ],
    "iso2": "US",
    "iso3": "USA",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Uruguay",
    "region": "South America",
    "divisions": [
      "Artigas",
      "Canelones",
      "Cerro Largo",
      "Colonia",
      "Durazno",
      "Flores",
      "Florida",
      "Lavalleja"
    ],
    "cities": [
      "Montevideo",
      "Maldonado",
      "Salto",
      "Ciudad de la Costa",
      "Rivera",
      "Paysandú",
      "Las Piedras"
    ],
    "iso2": "UY",
    "iso3": "URY",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Uzbekistan",
    "region": "Asia",
    "divisions": [
      "Andijon",
      "Buxoro",
      "Farg‘ona",
      "Jizzax",
      "Namangan",
      "Navoiy",
      "Qashqadaryo",
      "Qoraqalpog‘iston"
    ],
    "cities": [
      "Tashkent",
      "Namangan",
      "Andijon",
      "Samarkand",
      "Nukus",
      "Farg‘ona",
      "Bukhara"
    ],
    "iso2": "UZ",
    "iso3": "UZB",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Vanuatu",
    "region": "Oceania",
    "divisions": [
      "Malampa",
      "Penama",
      "Sanma",
      "Shefa",
      "Tafea",
      "Torba"
    ],
    "cities": [
      "Port-Vila",
      "Luganville",
      "Isangel",
      "Sola",
      "Lakatoro",
      "Saratamata"
    ],
    "iso2": "VU",
    "iso3": "VUT",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Vatican City",
    "region": "Europe",
    "divisions": [],
    "cities": [
      "Vatican City"
    ],
    "iso2": "VA",
    "iso3": "VAT",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Venezuela",
    "region": "South America",
    "divisions": [
      "Amazonas",
      "Anzoátegui",
      "Apure",
      "Aragua",
      "Barinas",
      "Bolívar",
      "Carabobo",
      "Cojedes"
    ],
    "cities": [
      "Caracas",
      "Valencia",
      "Maracaibo",
      "Maracay",
      "Barquisimeto",
      "Maturín",
      "Ciudad Guayana"
    ],
    "iso2": "VE",
    "iso3": "VEN",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Vietnam",
    "region": "Asia",
    "divisions": [
      "An Giang",
      "Bà Rịa-Vũng Tàu",
      "Bắc Giang",
      "Bắc Kạn",
      "Bạc Liêu",
      "Bắc Ninh",
      "Bến Tre",
      "Bình Định"
    ],
    "cities": [
      "Ho Chi Minh City",
      "Ninh Bình",
      "Hanoi",
      "Biên Hòa",
      "Huế",
      "Thủ Đức",
      "Haiphong"
    ],
    "iso2": "VN",
    "iso3": "VNM",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Yemen",
    "region": "Middle East",
    "divisions": [
      "‘Adan",
      "‘Amrān",
      "Abyan",
      "Aḑ Ḑāli‘",
      "Al Bayḑā’",
      "Al Ḩudaydah",
      "Al Jawf",
      "Al Mahrah"
    ],
    "cities": [
      "Sanaa",
      "Aden",
      "Al Ḩudaydah",
      "Ta‘izz",
      "Ibb",
      "Dhamār",
      "Al Mukallā"
    ],
    "iso2": "YE",
    "iso3": "YEM",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Zambia",
    "region": "Africa",
    "divisions": [
      "Central",
      "Copperbelt",
      "Eastern",
      "Luapula",
      "Lusaka",
      "Muchinga",
      "North-Western",
      "Northern"
    ],
    "cities": [
      "Lusaka",
      "Kitwe",
      "Ndola",
      "Kabwe",
      "Chingola",
      "Mufulira",
      "Livingstone"
    ],
    "iso2": "ZM",
    "iso3": "ZMB",
    "identifierSource": "GeoNames countryInfo.txt"
  },
  {
    "country": "Zimbabwe",
    "region": "Africa",
    "divisions": [
      "Bulawayo",
      "Harare",
      "Manicaland",
      "Mashonaland Central",
      "Mashonaland East",
      "Mashonaland West",
      "Masvingo",
      "Matabeleland North"
    ],
    "cities": [
      "Nyabira",
      "Harare",
      "Bulawayo",
      "Chitungwiza",
      "Mount Darwin",
      "Mutare",
      "Gweru"
    ],
    "iso2": "ZW",
    "iso3": "ZWE",
    "identifierSource": "GeoNames countryInfo.txt"
  }
];

function normalizeGeoLabel(value) {
  return value.normalize('NFKD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase().trim();
}

function renderCountryDirectory() {
  const target = document.getElementById('country-directory');
  if (!target) return;
  const introduction = target.previousElementSibling;
  if (introduction?.tagName === 'P') {
    introduction.textContent = 'The division lists use GeoNames first-level administrative records. Search the preserved source city records below; city-to-division relationships without an exact source match are identified for reconciliation.';
  }

  const adminDirectory = window.kovGeoNamesAdmin1;
  const divisionsByIso2 = new Map(adminDirectory.countries.map((country) => [
    country.iso2,
    new Map(country.divisions.flatMap((division) => [
      [normalizeGeoLabel(division.name), division.name],
      [normalizeGeoLabel(division.asciiName), division.name],
    ])),
  ]));
  const countryByIso2 = new Map(adminDirectory.countries.map((country) => [country.iso2, country]));
  const cityCountByIso2 = new Map();
  const cityCountryLabels = new Set();
  let unresolvedCityRelations = 0;

  for (const city of sourceWorldCities) {
    cityCountryLabels.add(city.country);
    cityCountByIso2.set(city.iso2, (cityCountByIso2.get(city.iso2) || 0) + 1);
    const divisionNames = divisionsByIso2.get(city.iso2);
    if (!city.admin_name || !divisionNames?.has(normalizeGeoLabel(city.admin_name))) {
      unresolvedCityRelations += 1;
    }
  }

  const citySearchSection = document.createElement('section');
  citySearchSection.className = 'country-city-search';

  const cityLabel = document.createElement('label');
  cityLabel.htmlFor = 'world-city-search';
  cityLabel.textContent = 'Find a city in the source directory';

  const citySearch = document.createElement('input');
  citySearch.id = 'world-city-search';
  citySearch.type = 'search';
  citySearch.autocomplete = 'off';
  citySearch.placeholder = 'Search city, country, or division';
  citySearch.setAttribute('aria-controls', 'world-city-results');

  const cityCount = document.createElement('p');
  cityCount.id = 'world-city-count';
  cityCount.setAttribute('aria-live', 'polite');
  cityCount.textContent = `${sourceWorldCities.length.toLocaleString()} source city records across ${cityCountryLabels.size.toLocaleString()} source country labels. ${unresolvedCityRelations.toLocaleString()} city-to-division relationships need further reconciliation against GeoNames.`;

  const cityResults = document.createElement('ul');
  cityResults.id = 'world-city-results';
  cityResults.setAttribute('aria-live', 'polite');
  const divisionCitation = document.createElement('p');
  divisionCitation.append(
    document.createTextNode(`First-level division reference: GeoNames, accessed ${adminDirectory.metadata.accessed}. `)
  );
  const divisionSourceLink = document.createElement('a');
  divisionSourceLink.href = adminDirectory.metadata.divisionSource;
  divisionSourceLink.rel = 'noopener noreferrer';
  divisionSourceLink.textContent = 'GeoNames admin1CodesASCII';
  const countrySourceLink = document.createElement('a');
  countrySourceLink.href = adminDirectory.metadata.countrySource;
  countrySourceLink.rel = 'noopener noreferrer';
  countrySourceLink.textContent = 'GeoNames countryInfo';
  divisionCitation.append(divisionSourceLink, document.createTextNode(' and '), countrySourceLink, document.createTextNode('.'));
  citySearchSection.append(cityLabel, citySearch, cityCount, cityResults, divisionCitation);
  target.before(citySearchSection);

  citySearch.addEventListener('input', () => {
    const query = citySearch.value.trim().toLocaleLowerCase();
    cityResults.replaceChildren();
    if (!query) {
      cityCount.textContent = `${sourceWorldCities.length.toLocaleString()} source city records across ${cityCountryLabels.size.toLocaleString()} source country labels. ${unresolvedCityRelations.toLocaleString()} city-to-division relationships need further reconciliation against GeoNames.`;
      return;
    }

    const matches = [];
    let totalMatches = 0;
    for (const city of sourceWorldCities) {
      const country = countryByIso2.get(city.iso2);
      const division = city.admin_name
        ? divisionsByIso2.get(city.iso2)?.get(normalizeGeoLabel(city.admin_name))
        : '';
      const searchable = `${city.city} ${city.city_ascii} ${city.country} ${city.admin_name} ${division || ''} ${country?.geoNamesCountryName || ''}`.toLocaleLowerCase();
      if (!searchable.includes(query)) continue;
      totalMatches += 1;
      if (matches.length < 50) matches.push({ city, division, country });
    }

    for (const { city, division, country } of matches) {
      const item = document.createElement('li');
      const cityName = document.createElement('strong');
      cityName.textContent = city.city;
      const sourceCountry = city.country;
      const sourceDivision = city.admin_name || 'Not specified in the source record';
      const verifiedDivision = division || 'No exact GeoNames division-label match';
      const countryMatch = country ? `; ISO2 ${city.iso2}` : `; ISO2 ${city.iso2} is outside the 195-country directory`;
      const details = document.createElement('span');
      details.textContent = ` — Source country: ${sourceCountry}${countryMatch}; source division label: ${sourceDivision}; GeoNames division: ${verifiedDivision}`;
      item.append(cityName, details);
      cityResults.append(item);
    }

    cityCount.textContent = `${totalMatches.toLocaleString()} matching source records; showing ${matches.length.toLocaleString()} at most.`;
    if (matches.length === 0) {
      const item = document.createElement('li');
      item.textContent = 'No matching source city records.';
      cityResults.append(item);
    }
  });

  const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);
  const cards = countryDirectory.map((entry) => {
    const sourceCountry = adminDirectory.countries.find((country) => country.country === entry.country);
    const divisions = sourceCountry?.divisions || [];
    const divisionList = divisions.length
      ? `<details><summary>View all ${divisions.length.toLocaleString()} GeoNames divisions</summary><p>${divisions.map((division) => escapeHtml(division.name)).join(', ')}</p></details>`
      : '<p>No GeoNames first-level division records are available for this country.</p>';
    const cityCount = sourceCountry ? cityCountByIso2.get(sourceCountry.iso2) || 0 : 0;
    return `
      <article class="country-directory-card">
        <p class="country-directory-meta">${escapeHtml(entry.region)}</p>
        <h3>${escapeHtml(entry.country)}</h3>
        <p><strong>First-level divisions:</strong> ${divisions.length.toLocaleString()} GeoNames records</p>
        ${divisionList}
        <p><strong>Source city records:</strong> ${cityCount.toLocaleString()}</p>
        <p><strong>Representative cities:</strong> ${entry.cities.map(escapeHtml).join(', ')}</p>
      </article>
    `;
  }).join('');
  target.innerHTML = `<div class="country-directory-grid">${cards}</div>`;
}

if (typeof window !== 'undefined') {
  window.kovCountryDirectory = countryDirectory;
  const target = document.getElementById('country-directory');
  if (target) {
    if (window.kovGeoNamesAdmin1) {
      renderCountryDirectory();
    } else {
      const adminScript = document.createElement('script');
      adminScript.src = 'assets/geonames-admin1.js';
      adminScript.addEventListener('load', renderCountryDirectory, { once: true });
      adminScript.addEventListener('error', () => {
        target.textContent = 'The GeoNames first-level division reference failed to load.';
      }, { once: true });
      document.head.append(adminScript);
    }
  }
}

if (typeof module !== 'undefined') {
  module.exports = { countryDirectory, worldCities: sourceWorldCities };
}
