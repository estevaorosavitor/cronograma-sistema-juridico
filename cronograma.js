/* ============================================================
   Dados do cronograma + lógica compartilhada (cliente e admin)
   ------------------------------------------------------------
   Para EDITAR fases/tarefas: altere o array PHASES abaixo.
   O PROGRESSO (status) não fica aqui — fica no data.json.
   ============================================================ */

const PHASES = [
  { id:"f0", nm:"Discovery, planejamento e prototipação", wk:"Sem 1–4", meta:"Requisitos, modelagem e protótipo",
    tasks:[
      "Levantamento de requisitos e regras de negócio",
      "Modelagem do banco multiempresa e arquitetura",
      "Prototipação da interface (Figma) e validação de uso",
      "Definição de escopo e plano de execução das fases",
      {t:"Homologação Banco do Brasil e credenciais de tribunais", flag:"paralelo"},
      {t:"Marco: escopo, modelagem e protótipo aprovados", milestone:true},
    ]},
  { id:"f1", nm:"Fundação, arquitetura e infraestrutura", wk:"Sem 5–9", meta:"Base técnica, segurança e DevOps",
    tasks:[
      "Estruturação do projeto, ambiente e containers",
      "Autenticação, controle de acesso por perfil e multiempresa",
      "Entrega contínua, servidor, HTTPS, logs e backup",
      "Sistema de componentes e padrão visual da interface",
      {t:"Marco: acesso e cadastro de usuários e empresas", milestone:true},
    ]},
  { id:"f2", nm:"Frente operacional e integração com tribunais", wk:"Sem 10–18", meta:"Núcleo da operação jurídica",
    tasks:[
      "Processos, clientes, tarefas, prazos, audiências e protocolos",
      "Painel operacional em tempo real (checklist, anexos, histórico)",
      "Integração WhatsApp (distribuição, aceite, contraproposta)",
      "Integração tribunais (eProc, PJe, ESAJ, Projudi, TRT)",
      {t:"Marco: operação + WhatsApp + tribunais", milestone:true},
    ]},
  { id:"f3", nm:"Frente financeira / ERP e Banco do Brasil", wk:"Sem 19–26", meta:"Gestão financeira e conciliação",
    tasks:[
      "Contas a pagar/receber, fluxo de caixa, previsões e inadimplência",
      "Ficha financeira, contratos, comissões, repasses e resultado",
      "Boletos e arquivos CNAB (remessa e retorno)",
      "Integração Banco do Brasil e conciliação automática",
      "Painel financeiro com indicadores e projeções",
      {t:"Marco: ERP + boletos + conciliação bancária", milestone:true},
    ]},
  { id:"f4", nm:"GED / gestão documental", wk:"Sem 27–30", meta:"Documentos, OCR e busca",
    tasks:[
      "Upload, pastas, renomeação, movimentação e versionamento",
      "OCR (CPF, CNPJ, processo e conteúdo integral)",
      "Busca inteligente, lixeira e alerta de duplicidade",
      "Integração Google Drive e redundância",
      {t:"Marco: documentos com OCR e busca", milestone:true},
    ]},
  { id:"f5", nm:"Administração, BI e auditoria", wk:"Sem 31–33", meta:"Indicadores, relatórios e auditoria",
    tasks:[
      "Painel de gestão com indicadores e alertas",
      "Relatórios diários/semanais/mensais, ranking e filtros",
      "Trilha de auditoria de acessos, alterações e aprovações",
      "Permissões detalhadas por perfil e por ação",
      {t:"Marco: BI, relatórios e auditoria — versão web completa", milestone:true},
    ]},
  { id:"f6", nm:"Aplicativo mobile", wk:"Sem 34–38", meta:"App iOS e Android",
    tasks:[
      "App iOS/Android consumindo a mesma API",
      "Tarefas, prazos, financeiro, documentos e aprovações",
      "Notificações, tempo real e comunicação interna",
      "Publicação nas lojas (App Store e Google Play)",
      {t:"Marco: aplicativo publicado", milestone:true},
    ]},
  { id:"f7", nm:"QA, homologação e implantação", wk:"Sem 39–43", meta:"Qualidade e entrada em produção",
    tasks:[
      "Testes automatizados, segurança e desempenho",
      "Testes de carga e estabilidade",
      "Documentação técnica, manual e treinamento",
      "Homologação final e entrada em produção",
      {t:"Marco: plataforma homologada e em produção", milestone:true},
    ]},
];

const STATUS_LABEL = ["Pendente","Em andamento","Concluída"];
const ICON_CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6L9 17l-5-5"/></svg>';
const ICON_CHEV = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
const R = 21, CIRC = 2*Math.PI*R;

function taskId(pi,ti){ return PHASES[pi].id+"_"+ti; }
function taskObj(t){ return typeof t==="string" ? {t} : t; }
function getS(status,id){ return status[id] || 0; }

/* Monta a timeline no container. status = objeto {id: 0|1|2}.
   opts = { editable:bool, onChange:fn }  */
function buildTimeline(container, status, opts){
  opts = opts || {};
  container.innerHTML = PHASES.map((p,pi)=>{
    const tasksHtml = p.tasks.map((raw,ti)=>{
      const t = taskObj(raw); const id = taskId(pi,ti); const s = getS(status,id);
      const flag = t.milestone ? '<span class="mflag">▸ marco</span>'
                 : t.flag ? `<span class="mflag" style="color:var(--amber);background:var(--amber-d)">⚑ ${t.flag}</span>` : '';
      return `<div class="task${t.milestone?' milestone':''}" data-s="${s}" data-id="${id}">
        <div class="tdot">${ICON_CHECK}</div>
        <div class="tbody"><div class="ttext">${t.t}${flag}</div>
        <div class="tstatus">${STATUS_LABEL[s]}</div></div></div>`;
    }).join("");
    return `<div class="phase" data-pi="${pi}">
      <div class="node" data-pi="${pi}">
        <svg width="48" height="48" viewBox="0 0 48 48">
          <circle class="track" cx="24" cy="24" r="${R}" fill="none" stroke-width="3"/>
          <circle class="arc" cx="24" cy="24" r="${R}" fill="none" stroke-width="3" stroke-linecap="round"
            stroke-dasharray="${CIRC}" stroke-dashoffset="${CIRC}"/>
        </svg>
        <div class="center">${pi<8?pi:'+'}</div>
      </div>
      <div class="pcard" data-pi="${pi}">
        <div class="phead">
          <div class="ptitle"><div class="nm">${p.nm} <span class="wk">${p.wk}</span></div>
          <div class="meta">${p.meta}</div></div>
          <div class="pcount" data-pcount="${pi}"></div>
          <div class="chev">${ICON_CHEV}</div>
        </div>
        <div class="tasks">${tasksHtml}</div>
      </div>
    </div>`;
  }).join("");

  // colapsar fase (disponível para os dois modos)
  container.querySelectorAll(".phead").forEach(h=>{
    h.addEventListener("click",()=> h.closest(".pcard").classList.toggle("collapsed"));
  });

  if(opts.editable){
    container.querySelectorAll(".task").forEach(el=>{
      el.addEventListener("click",()=>{
        const id = el.dataset.id;
        const nv = (parseInt(el.dataset.s)+1)%3;
        el.dataset.s = nv; if(nv===0) delete status[id]; else status[id]=nv;
        el.querySelector(".tstatus").textContent = STATUS_LABEL[nv];
        refreshUI(status); opts.onChange && opts.onChange();
      });
    });
    container.querySelectorAll(".node").forEach(n=>{
      n.addEventListener("click",()=>{
        const pi = +n.dataset.pi;
        const allDone = PHASES[pi].tasks.every((_,ti)=>getS(status,taskId(pi,ti))===2);
        PHASES[pi].tasks.forEach((_,ti)=>{ const id=taskId(pi,ti); if(allDone) delete status[id]; else status[id]=2; });
        container.querySelectorAll(`.pcard[data-pi="${pi}"] .task`).forEach(el=>{
          const v = allDone?0:2; el.dataset.s=v; el.querySelector(".tstatus").textContent=STATUS_LABEL[v];
        });
        refreshUI(status); opts.onChange && opts.onChange();
      });
    });
  } else {
    container.classList.add("readonly");
  }
  refreshUI(status);
}

/* Atualiza anéis, contadores e cabeçalho a partir do status */
function refreshUI(status){
  let done=0, prog=0, total=0;
  PHASES.forEach((p,pi)=>{
    let pd=0, pt=p.tasks.length;
    p.tasks.forEach((_,ti)=>{ const s=getS(status,taskId(pi,ti)); total++; if(s===2){done++;pd++;} else if(s===1) prog++; });
    const pct = pt? pd/pt : 0;
    const node = document.querySelector(`.node[data-pi="${pi}"]`);
    if(!node) return;
    node.querySelector(".arc").style.strokeDashoffset = CIRC*(1-pct);
    const full = pd===pt && pt>0;
    node.classList.toggle("done", full);
    node.classList.toggle("active", pd>0 && !full);
    node.querySelector(".center").innerHTML = full ? ICON_CHECK : (pi<8?pi:'+');
    document.querySelector(`.phase[data-pi="${pi}"]`).classList.toggle("done", full);
    const c = document.querySelector(`[data-pcount="${pi}"]`); if(c) c.innerHTML = `<b>${pd}</b>/${pt}`;
  });
  const pct = total? Math.round(done/total*100):0;
  const set=(id,v)=>{ const e=document.getElementById(id); if(e) e.textContent=v; };
  set("pctNum",pct); set("stDone",done); set("stProg",prog); set("stTotal",total);
  const bf=document.getElementById("barFill"); if(bf) bf.style.width=pct+"%";
}

/* Filtros (compartilhado) */
let curFilter="all";
function setupFilters(){
  document.querySelectorAll(".fbtn").forEach(b=>{
    b.addEventListener("click",()=>{
      document.querySelectorAll(".fbtn").forEach(x=>x.classList.remove("active"));
      b.classList.add("active"); curFilter=b.dataset.f; applyFilter();
    });
  });
}
function applyFilter(){
  document.querySelectorAll(".task").forEach(el=>{
    el.classList.toggle("hidden", !(curFilter==="all" || el.dataset.s===curFilter));
  });
  document.querySelectorAll(".phase").forEach(ph=>{
    if(curFilter==="all"){ ph.style.display=""; return; }
    const any=[...ph.querySelectorAll(".task")].some(t=>!t.classList.contains("hidden"));
    ph.style.display = any ? "" : "none";
  });
}

/* Toast */
let _toastT;
function toast(msg){
  const t=document.getElementById("toast"); if(!t) return;
  document.getElementById("toastMsg").textContent=msg;
  t.classList.add("show"); clearTimeout(_toastT);
  _toastT=setTimeout(()=>t.classList.remove("show"),2200);
}

function fmtDate(iso){
  if(!iso) return "—";
  const d=new Date(iso); if(isNaN(d)) return "—";
  return d.toLocaleString("pt-BR",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
}
