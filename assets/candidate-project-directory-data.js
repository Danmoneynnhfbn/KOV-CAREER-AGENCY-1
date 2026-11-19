(() => {
'use strict';
const countries=["Afghanistan","Albania","Algeria","Andorra","Angola","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Costa Rica","Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominican Republic","Ecuador","Egypt","El Salvador","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Guatemala","Guinea","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Macedonia","Norway","Oman","Pakistan","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Rwanda","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Taiwan","Tanzania","Thailand","Togo","Trinidad and Tobago","Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Zambia","Zimbabwe"]; 
const flagMap={"Afghanistan":"🇦🇫","Albania":"🇦🇱","Algeria":"🇩🇿","Andorra":"🇦🇩","Angola":"🇦🇴","Argentina":"🇦🇷","Armenia":"🇦🇲","Australia":"🇦🇺","Austria":"🇦🇹","Azerbaijan":"🇦🇿","Bahamas":"🇧🇸","Bahrain":"🇧🇭","Bangladesh":"🇧🇩","Barbados":"🇧🇧","Belgium":"🇧🇪","Belize":"🇧🇿","Benin":"🇧🇯","Bhutan":"🇧🇹","Bolivia":"🇧🇴","Bosnia and Herzegovina":"🇧🇦","Botswana":"🇧🇼","Brazil":"🇧🇷","Brunei":"🇧🇳","Bulgaria":"🇧🇬","Burkina Faso":"🇧🇫","Burundi":"🇧🇮","Cambodia":"🇰🇭","Cameroon":"🇨🇲","Canada":"🇨🇦","Cape Verde":"🇨🇻","Central African Republic":"🇨🇫","Chad":"🇹🇩","Chile":"🇨🇱","China":"🇨🇳","Colombia":"🇨🇴","Comoros":"🇰🇲","Costa Rica":"🇨🇷","Croatia":"🇭🇷","Cuba":"🇨🇺","Cyprus":"🇨🇾","Czechia":"🇨🇿","Denmark":"🇩🇰","Djibouti":"🇩🇯","Dominican Republic":"🇩🇴","Ecuador":"🇪🇨","Egypt":"🇪🇬","El Salvador":"🇸🇻","Estonia":"🇪🇪","Eswatini":"🇸🇿","Ethiopia":"🇪🇹","Fiji":"🇫🇯","Finland":"🇫🇮","France":"🇫🇷","Gabon":"🇬🇦","Gambia":"🇬🇲","Georgia":"🇬🇪","Germany":"🇩🇪","Ghana":"🇬🇭","Greece":"🇬🇷","Guatemala":"🇬🇹","Guinea":"🇬🇳","Guyana":"🇬🇾","Haiti":"🇭🇹","Honduras":"🇭🇳","Hungary":"🇭🇺","Iceland":"🇮🇸","India":"🇮🇳","Indonesia":"🇮🇩","Iran":"🇮🇷","Iraq":"🇮🇶","Ireland":"🇮🇪","Israel":"🇮🇱","Italy":"🇮🇹","Jamaica":"🇯🇲","Japan":"🇯🇵","Jordan":"🇯🇴","Kazakhstan":"🇰🇿","Kenya":"🇰🇪","Kuwait":"🇰🇼","Kyrgyzstan":"🇰🇬","Laos":"🇱🇦","Latvia":"🇱🇻","Lebanon":"🇱🇧","Lesotho":"🇱🇸","Liberia":"🇱🇷","Libya":"🇱🇾","Lithuania":"🇱🇹","Luxembourg":"🇱🇺","Madagascar":"🇲🇬","Malawi":"🇲🇼","Malaysia":"🇲🇾","Maldives":"🇲🇻","Mali":"🇲🇱","Malta":"🇲🇹","Mauritania":"🇲🇷","Mauritius":"🇲🇺","Mexico":"🇲🇽","Moldova":"🇲🇩","Monaco":"🇲🇨","Mongolia":"🇲🇳","Montenegro":"🇲🇪","Morocco":"🇲🇦","Mozambique":"🇲🇿","Myanmar":"🇲🇲","Namibia":"🇳🇦","Nepal":"🇳🇵","Netherlands":"🇳🇱","New Zealand":"🇳🇿","Nicaragua":"🇳🇮","Niger":"🇳🇪","Nigeria":"🇳🇬","North Macedonia":"🇲🇰","Norway":"🇳🇴","Oman":"🇴🇲","Pakistan":"🇵🇰","Panama":"🇵🇦","Papua New Guinea":"🇵🇬","Paraguay":"🇵🇾","Peru":"🇵🇪","Philippines":"🇵🇭","Poland":"🇵🇱","Portugal":"🇵🇹","Qatar":"🇶🇦","Romania":"🇷🇴","Rwanda":"🇷🇼","Saudi Arabia":"🇸🇦","Senegal":"🇸🇳","Serbia":"🇷🇸","Seychelles":"🇸🇨","Sierra Leone":"🇸🇱","Singapore":"🇸🇬","Slovakia":"🇸🇰","Slovenia":"🇸🇮","Somalia":"🇸🇴","South Africa":"🇿🇦","South Korea":"🇰🇷","Spain":"🇪🇸","Sri Lanka":"🇱🇰","Sudan":"🇸🇩","Sweden":"🇸🇪","Switzerland":"🇨🇭","Taiwan":"🇹🇼","Tanzania":"🇹🇿","Thailand":"🇹🇭","Togo":"🇹🇬","Trinidad and Tobago":"🇹🇹","Tunisia":"🇹🇳","Turkey":"🇹🇷","Uganda":"🇺🇬","Ukraine":"🇺🇦","United Arab Emirates":"🇦🇪","United Kingdom":"🇬🇧","United States":"🇺🇸","Uruguay":"🇺🇾","Uzbekistan":"🇺🇿","Venezuela":"🇻🇪","Vietnam":"🇻🇳","Zambia":"🇿🇲","Zimbabwe":"🇿🇼"};
const industries=['Artificial Intelligence and Machine Learning','Enterprise Software','Banking and Financial Services','Healthcare and Pharmaceuticals','Cybersecurity','Engineering and Manufacturing','Telecommunications','Energy and Infrastructure','Consulting and Professional Services','Human Resources','Education and EdTech','Logistics and Supply Chain','Retail and Consumer Goods','Media and Entertainment','Legal Services','Real Estate','Insurance','Aerospace and Aviation','Automotive','Public Sector','Agriculture and Food Systems','Hospitality and Tourism','Climate and Sustainability','Biotechnology','E-commerce','Fintech','Construction','Data and Analytics','Nonprofit and Development','Mining and Natural Resources'];
const services=['Private Career Representation','Professional Positioning Intelligence (PPI)','Professional and Vocational Profile Assessment','Career Strategy and Target-Company Research','Executive Resume and CV Development','ATS Keyword Research and Optimization','LinkedIn Profile Optimization','Executive Biography Development','Leadership Summary Development','Executive Leadership Portfolio','Career Documentation and Professional Branding','Portfolio and Professional Website Development','Direct Professional Outreach','Reverse Recruiting','Interview Preparation and Coaching','Career Coaching'];
const roles=['Chief Product Officer','VP of Product','Chief Technology Officer','VP of Engineering','Chief Information Security Officer','Chief Data Officer','Chief AI Officer','Chief People Officer','VP of Human Resources','Director of Product Management','Head of Data Science','Director of Cybersecurity','VP of Operations','Chief Financial Officer','Director of Strategy','Head of Talent Acquisition','VP of Marketing','Director of Business Development','Head of Enterprise Architecture','Program Director'];
const projects=['Executive Career Positioning','Enterprise AI Platform Strategy','Digital Transformation Roadmap','Cybersecurity Leadership Assessment','Global Product Operating Model','Data Governance Programme','Leadership Portfolio Development','Technology Organisation Design','Talent Strategy and Workforce Planning','Executive Brand and Market Positioning','Cloud Modernisation Programme','Fintech Product Expansion','Healthcare Technology Transformation','Supply Chain Optimisation','Sustainable Infrastructure Strategy'];
const projectDetails=['Defined strategic priorities, leadership narrative and a target-market plan for a complex professional brief.','Mapped business objectives, delivery milestones, stakeholder needs and measurable success criteria.','Prepared a structured transformation roadmap covering operating model, governance and implementation priorities.','Developed a role-aligned assessment framework, executive positioning materials and a practical action plan.','Outlined product strategy, cross-functional responsibilities, delivery stages and performance measures.','Organised data, governance and reporting requirements into a phased programme plan.','Created a leadership portfolio structure with achievement themes, evidence points and communication guidance.','Reviewed organisational priorities and documented a practical approach to capability and team design.'];
const engagements=['Fixed-scope project','Advisory engagement','Executive positioning engagement','Career strategy engagement','Leadership assessment','Project-based consulting','Monthly advisory'];
const cities={
'United States':['New York','Austin','Boston','Chicago','Seattle','San Francisco','Atlanta','Denver'],'United Kingdom':['London','Manchester','Birmingham','Edinburgh','Bristol'],'Canada':['Toronto','Vancouver','Montreal','Ottawa','Calgary'],'Australia':['Sydney','Melbourne','Brisbane','Perth'],'India':['Mumbai','Bengaluru','New Delhi','Hyderabad','Pune'],'Nigeria':['Lagos','Abuja','Port Harcourt','Ibadan'],'Ghana':['Accra','Kumasi','Tema'],'Kenya':['Nairobi','Mombasa','Kisumu'],'South Africa':['Johannesburg','Cape Town','Durban','Pretoria'],'Egypt':['Cairo','Alexandria','Giza'],'Morocco':['Casablanca','Rabat','Marrakesh'],'Rwanda':['Kigali'],'Senegal':['Dakar'],'Tanzania':['Dar es Salaam','Dodoma'],'Tunisia':['Tunis','Sfax'],'Uganda':['Kampala'],'Germany':['Berlin','Munich','Frankfurt','Hamburg'],'France':['Paris','Lyon','Marseille'],'Japan':['Tokyo','Osaka','Kyoto'],'Singapore':['Singapore'],'United Arab Emirates':['Dubai','Abu Dhabi'],'Saudi Arabia':['Riyadh','Jeddah','Dammam'],'Brazil':['São Paulo','Rio de Janeiro','Brasília'],'Mexico':['Mexico City','Monterrey','Guadalajara'],'Netherlands':['Amsterdam','Rotterdam','Utrecht'],'Ireland':['Dublin','Cork'],'Spain':['Madrid','Barcelona','Valencia'],'Switzerland':['Zurich','Geneva','Basel'],'China':['Shanghai','Beijing','Shenzhen'],'South Korea':['Seoul','Busan'],'New Zealand':['Auckland','Wellington','Christchurch']
};
const firstNames={
'Nigeria':['Amina','Chinedu','Tomiwa','Ngozi','Ifeoma','Oluwaseun','Emeka','Zainab','Chiamaka','Adeola','Kelechi','Fatima','Tunde','Nneka'],
'Ghana':['Ama','Kwame','Akosua','Kofi','Abena','Yaw','Esi','Kojo','Adwoa','Kwabena'],
'Kenya':['Wanjiku','Achieng','Kamau','Otieno','Njeri','Mwangi','Amina','Kiptoo','Wambui','Barasa'],
'South Africa':['Thabo','Naledi','Lerato','Sipho','Zanele','Kagiso','Nomsa','Lungile','Ayanda','Bongani'],
'Egypt':['Mariam','Omar','Nour','Youssef','Salma','Karim','Layla','Ahmed','Farah','Amr'],
'Morocco':['Yasmine','Youssef','Salma','Amine','Imane','Mehdi','Nadia','Hamza','Khadija','Rachid'],
'India':['Aarav','Ananya','Ishaan','Priya','Rohan','Aditi','Vihaan','Meera','Arjun','Kavya'],
'Japan':['Haruto','Yui','Ren','Aoi','Sota','Hina','Yuto','Sakura','Kaito','Mio'],
'China':['Wei','Jing','Hao','Mei','Chen','Xinyi','Ming','Yue','Jun','Lina'],
'France':['Camille','Lucas','Manon','Gabriel','Inès','Hugo','Chloé','Louis'],
'Germany':['Lena','Leon','Mia','Felix','Hannah','Jonas','Emilia','Paul'],
'United Kingdom':['Oliver','Amelia','George','Isla','Harry','Freya','Arthur','Olivia'],
'United States':['Jordan','Taylor','Morgan','Avery','Cameron','Riley','Casey','Drew'],
'Brazil':['Mariana','Gabriel','Beatriz','Lucas','Rafael','Camila','Thiago','Isabela'],
'Mexico':['Santiago','Valentina','Mateo','Camila','Diego','Ximena','Sebastián','Lucía'],
'Spain':['Lucía','Hugo','Martina','Mateo','Sofía','Pablo','Alba','Daniel'],
'Saudi Arabia':['Noura','Faisal','Reem','Khalid','Layan','Abdulrahman','Sara','Omar'],
'United Arab Emirates':['Mariam','Rashid','Aisha','Khalifa','Noora','Saeed','Latifa','Omar']
};
const surnames={
'Nigeria':['Adeyemi','Okafor','Adebayo','Eze','Balogun','Nwosu','Abiola','Ibrahim','Ogunleye','Onyeka'],
'Ghana':['Mensah','Owusu','Boateng','Asare','Osei','Appiah','Agyeman','Darko'],
'Kenya':['Mwangi','Otieno','Wanjala','Kipchoge','Njoroge','Omondi','Kamau','Chebet'],
'South Africa':['Nkosi','Dlamini','Mokoena','Naidoo','Botha','Ndlovu','Mahlangu','Mthembu'],
'Egypt':['Hassan','Mahmoud','Ibrahim','Mostafa','Fathy','Khalil','Youssef','Sayed'],
'Morocco':['Alaoui','Bennani','El Amrani','Idrissi','Tazi','Berrada','Lahlou','Fassi'],
'India':['Sharma','Patel','Iyer','Reddy','Mehta','Kapoor','Nair','Desai'],
'Japan':['Sato','Suzuki','Takahashi','Tanaka','Watanabe','Ito','Yamamoto','Nakamura'],
'China':['Wang','Li','Zhang','Liu','Chen','Yang','Huang','Zhao'],
'France':['Martin','Bernard','Dubois','Thomas','Robert','Richard','Petit','Durand'],
'Germany':['Müller','Schmidt','Schneider','Fischer','Weber','Meyer','Wagner','Becker'],
'United Kingdom':['Smith','Jones','Taylor','Brown','Wilson','Davies','Evans','Thomas'],
'United States':['Johnson','Williams','Brown','Miller','Davis','Wilson','Anderson','Thomas'],
'Brazil':['Silva','Santos','Oliveira','Souza','Costa','Pereira','Rodrigues','Almeida'],
'Mexico':['Hernández','García','Martínez','López','González','Pérez','Sánchez','Ramírez'],
'Spain':['García','Rodríguez','Martínez','López','Sánchez','Pérez','Gómez','Fernández'],
'Saudi Arabia':['Alharbi','Alqahtani','Alghamdi','Alotaibi','Alzahrani','Almutairi','Alshehri','Alshammari'],
'United Arab Emirates':['Almansoori','Almazrouei','Alnuaimi','Alshamsi','Alketbi','Alfalasi','Almehairi','Alkaabi']
};
Object.assign(firstNames,{
 'Italy':['Giulia','Leonardo','Sofia','Matteo','Aurora','Lorenzo','Chiara','Alessandro'],
 'Portugal':['João','Inês','Miguel','Leonor','Matilde','Tiago','Beatriz','Diogo'],
 'Greece':['Nikos','Eleni','Giorgos','Maria','Dimitris','Sofia','Kostas','Anastasia'],
 'Serbia':['Nikola','Milica','Luka','Jovana','Stefan','Ana','Marko','Teodora'],
 'Sweden':['Astrid','Erik','Freja','Lars','Linnea','Oscar','Ella','Viktor'],
 'Turkey':['Deniz','Zeynep','Emir','Elif','Ece','Arda','Mert','Leyla'],
 'Indonesia':['Putri','Budi','Siti','Rizky','Dewi','Aditya','Ayu','Dimas'],
 'Philippines':['Maria','Jose','Angelo','Andrea','Miguel','Sofia','Juan','Gabriela'],
 'Ethiopia':['Hana','Dawit','Selam','Abebe','Mekdes','Yonas','Meron','Samuel'],
 'Vietnam':['Linh','Minh','Anh','Huy','Lan','Mai','Quang','Thao'],
 'Thailand':['Narin','Kanya','Anong','Somchai','Pim','Chai','Mali','Suriya'],
 'Korea':['Min-jun','Seo-yeon','Ji-ho','Ha-eun','Do-yun','Ji-eun','Seo-jun','Soo-ah']
});
Object.assign(surnames,{
 'Italy':['Rossi','Russo','Ferrari','Esposito','Romano','Ricci','Conti','Marino'],
 'Portugal':['Silva','Santos','Costa','Pereira','Rodrigues','Oliveira','Ferreira','Carvalho'],
 'Greece':['Papadopoulos','Pappas','Nikolaidis','Georgiou','Antoniou','Vasilis','Ioannou','Dimitriou'],
 'Serbia':['Jovanović','Petrović','Nikolić','Marković','Đorđević','Stojanović','Ilić','Pavlović'],
 'Sweden':['Andersson','Johansson','Karlsson','Nilsson','Eriksson','Larsson','Olsson','Persson'],
 'Turkey':['Yılmaz','Kaya','Demir','Şahin','Çelik','Yıldız','Aydın','Özdemir'],
 'Indonesia':['Wijaya','Santoso','Setiawan','Putra','Sari','Pratama','Hidayat','Saputra'],
 'Philippines':['Santos','Reyes','Cruz','Garcia','Mendoza','Bautista','Ramos','Flores'],
 'Ethiopia':['Bekele','Alemu','Tesfaye','Kebede','Tadesse','Desta','Girma','Mekonnen'],
 'Vietnam':['Nguyen','Tran','Le','Pham','Hoang','Phan','Vu','Dang'],
 'Thailand':['Saelim','Srisai','Chaiyaporn','Wong','Boonmee','Kittisak','Rattanakosin','Sriphan'],
 'Korea':['Kim','Lee','Park','Choi','Jung','Kang','Cho','Yoon']
});
const countryNameStyle={
 'Afghanistan':'Turkey','Albania':'Serbia','Algeria':'Morocco','Andorra':'Spain','Argentina':'Mexico','Armenia':'Turkey','Austria':'Germany','Azerbaijan':'Turkey','Bahamas':'United States','Bahrain':'Saudi Arabia','Bangladesh':'India','Barbados':'United States','Belgium':'France','Belize':'Mexico','Benin':'Ghana','Bhutan':'India','Bolivia':'Mexico','Bosnia and Herzegovina':'Serbia','Botswana':'South Africa','Brazil':'Brazil','Brunei':'Indonesia','Bulgaria':'Serbia','Burkina Faso':'Ghana','Burundi':'Kenya','Cambodia':'Thailand','Cameroon':'Nigeria','Canada':'United Kingdom','Cape Verde':'Portugal','Central African Republic':'Ghana','Chad':'Egypt','Chile':'Mexico','China':'China','Colombia':'Mexico','Comoros':'Kenya','Costa Rica':'Mexico','Croatia':'Serbia','Cuba':'Spain','Cyprus':'Greece','Czechia':'Germany','Denmark':'Sweden','Djibouti':'Ethiopia','Dominican Republic':'Spain','Ecuador':'Mexico','El Salvador':'Mexico','Estonia':'Sweden','Eswatini':'South Africa','Ethiopia':'Ethiopia','Fiji':'Australia','Finland':'Sweden','Gabon':'Nigeria','Gambia':'Ghana','Georgia':'Turkey','Guatemala':'Mexico','Guinea':'Ghana','Guyana':'United States','Haiti':'France','Honduras':'Mexico','Hungary':'Germany','Iceland':'Sweden','India':'India','Indonesia':'Indonesia','Iran':'Turkey','Iraq':'Saudi Arabia','Ireland':'United Kingdom','Israel':'Saudi Arabia','Italy':'Italy','Jamaica':'United States','Japan':'Japan','Jordan':'Saudi Arabia','Kazakhstan':'Turkey','Kenya':'Kenya','Kuwait':'Saudi Arabia','Kyrgyzstan':'Turkey','Laos':'Thailand','Latvia':'Sweden','Lebanon':'Saudi Arabia','Lesotho':'South Africa','Liberia':'Ghana','Libya':'Egypt','Lithuania':'Sweden','Luxembourg':'France','Madagascar':'South Africa','Malawi':'Kenya','Malaysia':'Indonesia','Maldives':'India','Mali':'Ghana','Malta':'Italy','Mauritania':'Morocco','Mauritius':'South Africa','Mexico':'Mexico','Moldova':'Serbia','Monaco':'France','Mongolia':'China','Montenegro':'Serbia','Morocco':'Morocco','Mozambique':'South Africa','Myanmar':'Thailand','Namibia':'South Africa','Nepal':'India','Netherlands':'Germany','New Zealand':'Australia','Nicaragua':'Mexico','Niger':'Ghana','Nigeria':'Nigeria','North Macedonia':'Serbia','Norway':'Sweden','Oman':'Saudi Arabia','Pakistan':'India','Panama':'Mexico','Papua New Guinea':'Australia','Paraguay':'Mexico','Peru':'Mexico','Philippines':'Philippines','Poland':'Serbia','Portugal':'Portugal','Qatar':'Saudi Arabia','Romania':'Serbia','Rwanda':'Kenya','Saudi Arabia':'Saudi Arabia','Senegal':'Ghana','Serbia':'Serbia','Seychelles':'South Africa','Sierra Leone':'Ghana','Singapore':'Indonesia','Slovakia':'Serbia','Slovenia':'Serbia','Somalia':'Ethiopia','South Africa':'South Africa','South Korea':'Korea','Spain':'Spain','Sri Lanka':'India','Sudan':'Egypt','Sweden':'Sweden','Switzerland':'Germany','Taiwan':'China','Tanzania':'Kenya','Thailand':'Thailand','Togo':'Ghana','Trinidad and Tobago':'United States','Tunisia':'Morocco','Turkey':'Turkey','Uganda':'Kenya','Ukraine':'Serbia','United Arab Emirates':'United Arab Emirates','United Kingdom':'United Kingdom','United States':'United States','Uruguay':'Mexico','Uzbekistan':'Turkey','Venezuela':'Mexico','Vietnam':'Vietnam','Zambia':'South Africa','Zimbabwe':'South Africa'
};
const fallbackFirst=['Alex','Samira','Noah','Leila','Milan','Amara','Elena','Dario','Maya','Elias','Nina','Adam'];
const middleNames=['Ari','Noor','Kai','Rene','Mina','Lee','Ira','Sami','Jo','Emil','Rae','Tariq','Luca'];
const fallbackLast=['Morgan','Kovac','Silva','Rahman','Petrov','Costa','Haddad','Novak','Garcia','Bennett','Kim','Mendes'];
const allAfrican=new Set(['Algeria','Angola','Benin','Botswana','Burkina Faso','Burundi','Cameroon','Cape Verde','Central African Republic','Chad','Comoros','Djibouti','Egypt','Eswatini','Ethiopia','Gabon','Gambia','Ghana','Guinea','Kenya','Lesotho','Liberia','Libya','Madagascar','Malawi','Mali','Mauritania','Mauritius','Morocco','Mozambique','Namibia','Niger','Nigeria','Rwanda','Senegal','Seychelles','Sierra Leone','Somalia','South Africa','Sudan','Tanzania','Togo','Tunisia','Uganda','Zambia','Zimbabwe']);
const africanMarkets=new Set(['Egypt','Ethiopia','Ghana','Kenya','Morocco','Nigeria','Rwanda','Senegal','South Africa','Tanzania','Tunisia','Uganda']);
const international=countries.filter(c=>!allAfrican.has(c)),african=[...africanMarkets];
const seenNames=new Set();
const profiles=Array.from({length:1200},(_,i)=>{
 const useAfrica=(i+1)%10===0, pool=useAfrica?african:international, country=pool[(useAfrica?Math.floor(i/10):Math.floor(i/10))%pool.length];
 const style=countryNameStyle[country]||'United States';
 const fn=firstNames[country]||firstNames[style]||fallbackFirst, sn=surnames[country]||surnames[style]||fallbackLast, n=i+1;
 const first=fn[(n*3+Math.floor(n/7))%fn.length],middle=middleNames[n%middleNames.length],last=sn[(n*5+Math.floor(n/11))%sn.length];
 let displayName=first+' '+middle+' '+last,repair=0;
 while(seenNames.has(displayName)){displayName=first+' '+middle+' '+middleNames[(n+repair*5+7)%middleNames.length]+' '+last;repair++;}
 seenNames.add(displayName);
 const cityList=cities[country]||['Capital City','Central Business District','Metro Area'];
 const industry=industries[(n*7)%industries.length], role=roles[(n*11)%roles.length], project=projects[(n*13)%projects.length];
 return {id:'profile-'+String(n).padStart(4,'0'),name:displayName,country,flag:flagMap[country]||'🌍',portrait:'',jobTitle:role,project,projectDetails:projectDetails[(n*3)%projectDetails.length],date:'2025-'+String((n%12)+1).padStart(2,'0')+'-'+String((n%27)+1).padStart(2,'0'),amount:[2500,4500,7500,12000,18000,25000,35000,50000][n%8],industry,service:services[(n*5)%services.length],location:cityList[n%cityList.length]+', '+country,engagement:engagements[(n*3)%engagements.length],rating:'',review:''};
});
window.KOV_CANDIDATE_PROJECTS={profiles,countries:[...international,...african],industries,services,fictional:true};
})();