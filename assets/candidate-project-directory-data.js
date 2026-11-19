(() => {
'use strict';
const countries=["Afghanistan","Albania","Algeria","Andorra","Angola","Antigua and Barbuda","Argentina","Armenia","Australia","Austria","Azerbaijan","Bahamas","Bahrain","Bangladesh","Barbados","Belgium","Belize","Benin","Bhutan","Bolivia","Bosnia and Herzegovina","Botswana","Brazil","Brunei","Bulgaria","Burkina Faso","Burundi","Cambodia","Cameroon","Canada","Cape Verde","Central African Republic","Chad","Chile","China","Colombia","Comoros","Costa Rica","Croatia","Cuba","Cyprus","Czechia","Denmark","Djibouti","Dominica","Dominican Republic","Ecuador","Egypt","El Salvador","Estonia","Eswatini","Ethiopia","Fiji","Finland","France","Gabon","Gambia","Georgia","Germany","Ghana","Greece","Grenada","Guatemala","Guinea","Guyana","Haiti","Honduras","Hungary","Iceland","India","Indonesia","Iran","Iraq","Ireland","Israel","Italy","Jamaica","Japan","Jordan","Kazakhstan","Kenya","Kuwait","Kyrgyzstan","Laos","Latvia","Lebanon","Lesotho","Liberia","Libya","Liechtenstein","Lithuania","Luxembourg","Madagascar","Malawi","Malaysia","Maldives","Mali","Malta","Mauritania","Mauritius","Mexico","Moldova","Monaco","Mongolia","Montenegro","Morocco","Mozambique","Myanmar","Namibia","Nepal","Netherlands","New Zealand","Nicaragua","Niger","Nigeria","North Macedonia","Norway","Oman","Pakistan","Panama","Papua New Guinea","Paraguay","Peru","Philippines","Poland","Portugal","Qatar","Romania","Rwanda","Saudi Arabia","Senegal","Serbia","Seychelles","Sierra Leone","Singapore","Slovakia","Slovenia","Somalia","South Africa","South Korea","Spain","Sri Lanka","Sudan","Sweden","Switzerland","Taiwan","Tanzania","Thailand","Togo","Trinidad and Tobago","Tunisia","Turkey","Uganda","Ukraine","United Arab Emirates","United Kingdom","United States","Uruguay","Uzbekistan","Venezuela","Vietnam","Zambia","Zimbabwe"];
const flags=['🇦🇫','🇦🇱','🇩🇿','🇦🇩','🇦🇴','🇦🇬','🇦🇷','🇦🇲','🇦🇺','🇦🇹','🇦🇿','🇧🇸','🇧🇭','🇧🇩','🇧🇧','🇧🇪','🇧🇿','🇧🇯','🇧🇹','🇧🇴','🇧🇦','🇧🇼','🇧🇷','🇧🇳','🇧🇬','🇧🇫','🇧🇮','🇰🇭','🇨🇲','🇨🇦','🇨🇻','🇨🇫','🇹🇩','🇨🇱','🇨🇳','🇨🇴','🇰🇲','🇨🇷','🇭🇷','🇨🇺','🇨🇾','🇨🇿','🇩🇰','🇩🇯','🇩🇲','🇩🇴','🇪🇨','🇪🇬','🇸🇻','🇪🇪','🇸🇿','🇪🇹','🇫🇯','🇫🇮','🇫🇷','🇬🇦','🇬🇲','🇬🇪','🇩🇪','🇬🇭','🇬🇷','🇬🇩','🇬🇹','🇬🇳','🇬🇾','🇭🇹','🇭🇳','🇭🇺','🇮🇸','🇮🇳','🇮🇩','🇮🇷','🇮🇶','🇮🇪','🇮🇱','🇮🇹','🇯🇲','🇯🇵','🇯🇴','🇰🇿','🇰🇪','🇰🇼','🇰🇬','🇱🇦','🇱🇻','🇱🇧','🇱🇸','🇱🇷','🇱🇾','🇱🇮','🇱🇹','🇱🇺','🇲🇬','🇲🇼','🇲🇾','🇲🇻','🇲🇱','🇲🇹','🇲🇷','🇲🇺','🇲🇽','🇲🇩','🇲🇨','🇲🇳','🇲🇪','🇲🇦','🇲🇿','🇲🇲','🇳🇦','🇳🇵','🇳🇱','🇳🇿','🇳🇮','🇳🇪','🇳🇬','🇲🇰','🇳🇴','🇴🇲','🇵🇰','🇵🇦','🇵🇬','🇵🇾','🇵🇪','🇵🇭','🇵🇱','🇵🇹','🇶🇦','🇷🇴','🇷🇼','🇸🇦','🇸🇳','🇷🇸','🇸🇨','🇸🇱','🇸🇬','🇸🇰','🇸🇮','🇸🇴','🇿🇦','🇰🇷','🇪🇸','🇱🇰','🇸🇩','🇸🇪','🇨🇭','🇹🇼','🇹🇿','🇹🇭','🇹🇬','🇹🇹','🇹🇳','🇹🇷','🇺🇬','🇺🇦','🇦🇪','🇬🇧','🇺🇸','🇺🇾','🇺🇿','🇻🇪','🇻🇳','🇿🇲','🇿🇼'];

const industries=['Artificial Intelligence and Machine Learning','Enterprise Software','Banking and Financial Services','Healthcare and Pharmaceuticals','Cybersecurity','Engineering and Manufacturing','Telecommunications','Energy and Infrastructure','Consulting and Professional Services','Human Resources','Education and EdTech','Logistics and Supply Chain','Retail and Consumer Goods','Media and Entertainment','Legal Services','Real Estate','Insurance','Aerospace and Aviation','Automotive','Public Sector','Agriculture and Food Systems','Hospitality and Tourism','Climate and Sustainability','Biotechnology','E-commerce','Fintech','Construction','Data and Analytics','Nonprofit and Development','Mining and Natural Resources'];
const services=['Private Career Representation','Professional Positioning Intelligence (PPI)','Professional and Vocational Profile Assessment','Career Strategy and Target-Company Research','Executive Resume and CV Development','ATS Keyword Research and Optimization','LinkedIn Profile Optimization','Executive Biography Development','Leadership Summary Development','Executive Leadership Portfolio','Career Documentation and Professional Branding','Portfolio and Professional Website Development','Direct Professional Outreach','Reverse Recruiting','Interview Preparation and Coaching','Career Coaching'];

// The directory starts with 1,200 editable profile spaces. No candidate identities,
// engagements, amounts, reviews or ratings are fabricated. Replace each blank field
// with verified, approved records before publishing candidate-specific information.
// Country allocation is a market-planning split: 90% international markets and 10% Africa.
const africanMarkets=new Set(['Algeria','Angola','Benin','Botswana','Burkina Faso','Burundi','Cameroon','Cape Verde','Central African Republic','Chad','Comoros','Djibouti','Egypt','Eswatini','Ethiopia','Gabon','Gambia','Ghana','Guinea','Kenya','Lesotho','Liberia','Libya','Madagascar','Malawi','Mali','Mauritania','Mauritius','Morocco','Mozambique','Namibia','Niger','Nigeria','Rwanda','Senegal','Seychelles','Sierra Leone','Somalia','South Africa','Sudan','Tanzania','Togo','Tunisia','Uganda','Zambia','Zimbabwe']);
const marketRecords=countries.map((name,index)=>({name,flag:flags[index]}));
const africanPool=marketRecords.filter(item=>africanMarkets.has(item.name));
const internationalPool=marketRecords.filter(item=>!africanMarkets.has(item.name));
let africanIndex=0,internationalIndex=0;
const profiles=Array.from({length:1200},(_,index)=>{
 const africanMarket=(index+1)%10===0;
 const pool=africanMarket?africanPool:internationalPool;
 const market=pool[africanMarket?africanIndex++%pool.length:internationalIndex++%pool.length];
 return {
  id:'profile-'+String(index+1).padStart(4,'0'),
  name:'',
  country:market.name,
  flag:market.flag,
  portrait:'',
  jobTitle:'',
  project:'',
  date:'',
  amount:'',
  industry:'',
  service:'',
  location:'',
  engagement:'',
  rating:'',
  review:''
 };
});
window.KOV_CANDIDATE_PROJECTS={profiles,countries,industries,services};
})();
