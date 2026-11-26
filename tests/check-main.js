// Проверка главной kp_ru.js на заглушке Lampa и поддельных ответах Кинопоиска
const fs=require('fs');const code=fs.readFileSync(process.argv[2],'utf8');
const urls=[];
function any(){return new Proxy(function(){},{get:(t,k)=>k==='then'?undefined:any(),apply:()=>any(),construct:()=>any()})}
const film=(id,c)=>({kinopoiskId:id,nameRu:'Ф'+id,year:2026,type:'FILM',countries:[{country:c}],genres:[]});
const Lampa=new Proxy({
  Reguest:function(){return{timeout(){},clear(){},silent(u,ok){urls.push(u.replace(/^.*tech\//,'').replace(/^.*\/3\//,'tmdb:'));setTimeout(()=>{
    if(u.includes('themoviedb'))return ok({total_pages:3,results:[{id:1,name:'T1',poster_path:'/a.jpg'},{id:2,name:'T2',poster_path:null},{id:3,title:'T3',poster_path:'/c.jpg'}]});
    if(u.includes('filters'))return ok({genres:[{id:1,genre:'драма'}],countries:[{id:34,country:'Россия'},{id:1,country:'США'},{id:5,country:'Великобритания'},{id:13,country:'Корея Южная'},{id:8,country:'Франция'}]});
    const m=u.match(/countries=(\d+)/);const base=m?+m[1]*100:900;ok({total:3,totalPages:2,items:[film(base+1,'x'),film(base+2,'x'),film(base+3,'x')]});},1)}}},
  TMDB:{api:u=>'https://api.themoviedb.org/3/'+u,key:()=>'K'},
  Status:function(n){this.n=n;this.d={};this.append=(k,v)=>{this.d[k]=v;if(--this.n===0)this.onComplite(this.d)};this.error=()=>{if(--this.n===0)this.onComplite(this.d)}},
  Search:{added:[],addSource(s){this.added.push(s.title)}},
  Storage:{get:(k,d)=>k==='plugins'?[{url:'https://nb557.github.io/plugins/online_mod.js',status:1}]:d,set(){},field:()=>'KP',cache:(k,l,d)=>d},
  Utils:{addUrlComponent:(u,p)=>u+(u.includes('?')?'&':'?')+p,hash:s=>s},
  Api:{sources:{tmdb:{discovery:()=>({search:(p,cb)=>setTimeout(()=>cb([{type:'movie',results:[{id:11,title:'Ф3401',original_title:'Ф3401',release_date:'2026-01-01',source:'tmdb'},{id:12,title:'Беглецы',original_title:'Беглецы',release_date:'2026-02-02',source:'tmdb'}]},{type:'tv',results:[{id:13,name:'Сериал',first_air_date:'2025-01-01',source:'tmdb'}]},{type:'person',results:[{id:14,name:'Актёр'}]}]),5)})},IMDB:{discovery:()=>({search:(p,cb)=>{throw new Error('сбой IMDb')}})}},partNext:(parts,limit,ok,empty)=>{let i=0;(function next(){if(i>=parts.length)return;parts[i++](r=>{ok(r);next()})})()}},
  Favorite:{continues:t=>t==='tv'?[{id:7,title:'Сериал',source:'KP'}]:[]},
  Lang:{translate:k=>k,add(){}},Arrays:{extend:Object.assign,shuffle:a=>a},
  Params:{select(){},values:{}},Listener:{follow(){}},Noty:{show:console.log},
},{get:(t,k)=>k in t?t[k]:any()});
const loaded=[];global.document={querySelector:()=>null,createElement:()=>({}),head:{appendChild:e=>loaded.push(e.src)}};
global.window={appready:true,Lampa,location:{origin:'http://lampa.mx'}};global.Lampa=Lampa;global.atob=s=>Buffer.from(s,'base64').toString('binary');
new Function('window','Lampa',code)(global.window,Lampa);
const KP=Lampa.Api.sources.KP;if(!KP)throw new Error('источник KP не зарегистрирован');
const titles=[];
KP.main({},r=>titles.push(r.title+' ['+r.results.length+'] '+(r.url||'')),e=>console.log('ERR',e));
setTimeout(()=>{console.log(titles.join('\n'));console.log('подгружены:',loaded.join(' '));
  KP.list({url:'kpru_foreign:FILM:1,5,13,8',page:2},r=>{console.log('ещё зарубежные:',r.results.map(e=>e.id).join(','),'page',r.page,'more',r.more);
  console.log('tmdb:',urls.filter(u=>u.startsWith('tmdb:')).join('\n'));KP.discovery().search({query:encodeURIComponent('Ф')},rows=>console.log('поиск «Везде»:',rows.map(r=>r.type+':'+r.results.map(e=>(e.title||e.name)+'/'+e.source).join(',')).join(' | '),'вкладки:',Lampa.Search.added.join(',')));
  console.log('запросы:',urls.filter(u=>!u.includes('filters')).length)},()=>console.log('list ERR'));},300);
