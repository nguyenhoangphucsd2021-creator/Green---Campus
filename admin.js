(() => {
  const cfg = window.GREEN_CAMPUS_CONFIG || {};
  const $ = id => document.getElementById(id);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const setMsg = (id, message, error=false) => { const el=$(id); if(!el)return; el.textContent=message; el.classList.toggle('error',error); };
  if (!cfg.supabaseUrl || !cfg.supabaseAnonKey || !window.supabase) {
    setMsg('setup-message','Chưa cấu hình Supabase. Điền supabaseUrl và supabaseAnonKey trong public-config.js, sau đó tải lại trang.',true);
    $('login-panel').classList.add('hidden'); return;
  }
  const db = window.supabase.createClient(cfg.supabaseUrl,cfg.supabaseAnonKey);
  const loginPanel=$('login-panel'), dashboard=$('dashboard'), manual=$('manual-panel'), importPanel=$('import-panel'), ecoAdminPanel=$('eco-admin-panel');

  async function loadQueue(){
    const host=$('queue'); host.innerHTML='<p class="muted">Đang tải nội dung…</p>';
    const {data,error}=await db.from('content_items').select('*').in('status',['pending_review','draft']).order('created_at',{ascending:false}).limit(100);
    if(error){host.textContent='Không thể tải hàng chờ. Kiểm tra chính sách RLS.';return;}
    if(!data?.length){host.innerHTML='<p class="muted">Chưa có nội dung chờ duyệt.</p>';return;}
    host.innerHTML=data.map(item=>`<article class="item" data-id="${esc(item.id)}"><div class="row"><span class="tag">${item.status==='pending_review'?'Chờ duyệt':'Bản nháp'}</span><span class="muted">${esc(item.source_name||'Nội dung nội bộ')}</span></div><h3>${esc(item.title)}</h3><p>${esc(item.excerpt||item.body||'')}</p>${item.source_url?`<p><a href="${esc(item.source_url)}" target="_blank" rel="noopener">Mở nguồn tham khảo ↗</a></p>`:''}<div class="row"><button data-action="publish">Duyệt & công khai</button><button class="danger" data-action="reject">Từ chối</button></div></article>`).join('');
  }
  async function loadAdminOverview(){
    const stats=$('admin-stats'), feedback=$('admin-feedback');
    try{const r=await fetch('/.netlify/functions/stats');const d=await r.json();stats.textContent=d.configured?`30 ngày — Lượt truy cập: ${d.visits} · Tra cứu: ${d.searches} · Tự báo cáo tái sử dụng: ${d.reuseActions}`:'Chưa cấu hình thống kê Supabase.';}catch(_){stats.textContent='Không tải được thống kê.';}
    const {data,error}=await db.from('feedback').select('kind,message,created_at').order('created_at',{ascending:false}).limit(5);
    if(error){feedback.textContent='Không tải được phản hồi.';return;}
    feedback.innerHTML=data?.length?data.map(x=>`<p><b>${esc(x.kind)}</b> · ${esc(x.message.slice(0,180))}</p>`).join(''):'Chưa có phản hồi.';
  }
  async function checkSession(){
    const {data:{session}}=await db.auth.getSession();
    if(!session){loginPanel.classList.remove('hidden');dashboard.classList.add('hidden');manual.classList.add('hidden');importPanel.classList.add('hidden');if(ecoAdminPanel)ecoAdminPanel.classList.add('hidden');return;}
    const {data:profile,error}=await db.from('profiles').select('role').eq('id',session.user.id).single();
    if(error||!profile||!['admin','editor'].includes(profile.role)){if(ecoAdminPanel)ecoAdminPanel.classList.add('hidden');await db.auth.signOut();setMsg('login-message','Tài khoản chưa được cấp quyền biên tập/quản trị.',true);return;}
    loginPanel.classList.add('hidden');dashboard.classList.remove('hidden');manual.classList.remove('hidden');importPanel.classList.remove('hidden');
    if(ecoAdminPanel)ecoAdminPanel.classList.toggle('hidden',profile.role!=='admin');
    await Promise.all([loadQueue(),loadAdminOverview()]);
    if(profile.role==='admin')await loadEcoAdmin();
  }
  $('login-form').addEventListener('submit',async e=>{e.preventDefault();setMsg('login-message','Đang xác thực…');const {error}=await db.auth.signInWithPassword({email:$('email').value,password:$('password').value});if(error){setMsg('login-message',error.message,true);return;}await checkSession();});
  $('logout').addEventListener('click',async()=>{await db.auth.signOut();await checkSession();});
  $('queue').addEventListener('click',async e=>{
    const btn=e.target.closest('button[data-action]');if(!btn)return;const card=btn.closest('[data-id]');const status=btn.dataset.action==='publish'?'published':'rejected';btn.disabled=true;
    const {error}=await db.from('content_items').update({status,reviewed_at:new Date().toISOString(),published_at:status==='published'?new Date().toISOString():null}).eq('id',card.dataset.id);
    if(error){setMsg('dashboard-message','Không thể cập nhật: '+error.message,true);btn.disabled=false;return;}
    setMsg('dashboard-message',status==='published'?'Đã công khai nội dung.':'Đã từ chối nội dung.');await loadQueue();
  });
  $('manual-form').addEventListener('submit',async e=>{e.preventDefault();const row={title:$('new-title').value.trim(),excerpt:$('new-excerpt').value.trim(),category:$('new-category').value,source_url:$('new-source').value.trim()||null,status:'draft'};const {error}=await db.from('content_items').insert(row);if(error){setMsg('dashboard-message','Không lưu được: '+error.message,true);return;}e.target.reset();setMsg('dashboard-message','Đã lưu bản nháp.');await loadQueue();});

  function parseCsv(text){
    const rows=[];let row=[],cell='',quoted=false;
    for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'&&quoted&&text[i+1]==='"'){cell+='"';i++;}else if(c==='"'){quoted=!quoted;}else if(c===','&&!quoted){row.push(cell);cell='';}else if((c==='\n'||c==='\r')&&!quoted){if(c==='\r'&&text[i+1]==='\n')i++;row.push(cell);if(row.some(v=>v.trim()))rows.push(row);row=[];cell='';}else cell+=c;}
    row.push(cell);if(row.some(v=>v.trim()))rows.push(row);if(!rows.length)return[];const headers=rows.shift().map(x=>x.trim().toLowerCase());return rows.map(r=>Object.fromEntries(headers.map((h,i)=>[h,(r[i]||'').trim()])));
  }
  $('bulk-import').addEventListener('click',async()=>{
    const file=$('bulk-file').files[0],msg=$('bulk-message');msg.classList.remove('error');
    if(!file){msg.textContent='Hãy chọn tệp CSV hoặc JSON.';return;}if(file.size>2*1024*1024){msg.textContent='Tệp vượt giới hạn 2 MB.';return;}
    try{const raw=await file.text();let rows=file.name.toLowerCase().endsWith('.json')?JSON.parse(raw):parseCsv(raw);if(!Array.isArray(rows))throw new Error('JSON cần là một mảng bản ghi.');if(!rows.length||rows.length>100)throw new Error('Số bản ghi phải từ 1 đến 100.');const allowed=['news','reuse','product','waste'];const records=rows.map(x=>({title:String(x.title||'').trim().slice(0,180),excerpt:String(x.excerpt||'').trim().slice(0,1200),category:allowed.includes(x.category)?x.category:'news',source_url:String(x.source_url||'').trim()||null,icon:String(x.icon||'🌱').slice(0,12),status:'draft'}));if(records.some(x=>!x.title||!x.excerpt))throw new Error('Mỗi bản ghi cần có title và excerpt.');const {error}=await db.from('content_items').insert(records);if(error)throw error;msg.textContent=`Đã nhập ${records.length} bản nháp. Hãy rà soát trong hàng chờ trước khi công khai.`;await loadQueue();}catch(e){msg.textContent='Không nhập được: '+e.message;msg.classList.add('error');}
  });

  // ECO CHALLENGE CLOUD: daily image missions and account score ledger.
  async function loadEcoAdmin(){
    const date=$('eco-task-date');if(date&&!date.value)date.value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);
    await Promise.all([loadEcoAccounts(),loadEcoTasks(),loadEcoPointsHistory()]);
  }
  async function loadEcoAccounts(){
    const sel=$('eco-points-user');if(!sel)return;sel.innerHTML='<option value="">Đang tải…</option>';
    const {data,error}=await db.from('profiles').select('id,display_name').order('display_name');
    if(error){sel.innerHTML='<option value="">Không tải được tài khoản</option>';setMsg('eco-points-message',error.message,true);return;}
    sel.innerHTML='<option value="">Chọn tài khoản</option>'+(data||[]).map(p=>`<option value="${esc(p.id)}">${esc(p.display_name||p.id)} · ${esc(p.id.slice(0,8))}</option>`).join('');
  }
  async function loadEcoPointsHistory(){
    const host=$('eco-points-history');if(!host)return;host.textContent='Đang tải…';
    const {data,error}=await db.from('eco_account_ledger').select('id,user_id,delta,reason,actor,created_at').order('created_at',{ascending:false}).limit(50);
    if(error){host.textContent='Không tải được lịch sử điểm: '+error.message;return;}
    const ids=[...new Set((data||[]).flatMap(x=>[x.user_id,x.actor]).filter(Boolean))];let names={};
    if(ids.length){const r=await db.from('profiles').select('id,display_name').in('id',ids);(r.data||[]).forEach(p=>names[p.id]=p.display_name||p.id.slice(0,8));}
    host.innerHTML=(data||[]).length?`<div style="overflow:auto"><table style="width:100%;border-collapse:collapse;font-size:12px"><thead><tr><th>Thời gian</th><th>Tài khoản</th><th>Điểm</th><th>Lý do</th><th>Người thực hiện</th></tr></thead><tbody>${data.map(x=>`<tr><td>${new Date(x.created_at).toLocaleString('vi-VN')}</td><td>${esc(names[x.user_id]||x.user_id.slice(0,8))}</td><td><b>${x.delta>0?'+':''}${x.delta}</b></td><td>${esc(x.reason)}</td><td>${esc(names[x.actor]||'Hệ thống')}</td></tr>`).join('')}</tbody></table></div>`:'Chưa có điều chỉnh điểm nào.';
  }
  async function loadEcoTasks(){
    const host=$('eco-task-list');if(!host)return;host.textContent='Đang tải…';
    const {data,error}=await db.from('eco_daily_tasks').select('*').order('created_at',{ascending:false}).limit(60);
    if(error){host.textContent='Chưa tải được danh sách. Hãy chạy supabase/eco-cloud-v2.sql. '+error.message;return;}
    host.innerHTML=(data||[]).length?(data||[]).map(t=>{const u=t.image_path?db.storage.from('eco-task-images').getPublicUrl(t.image_path).data.publicUrl:'';return `<article class="item" data-eco-task="${esc(t.id)}"><div class="row"><span class="tag">${t.is_published?'Đang hiển thị':'Đã ẩn'}</span><span class="muted">${esc(t.task_date)}</span></div><h3>${esc(t.title)}</h3><p>${esc(t.description)}</p>${u?`<img src="${esc(u)}" alt="Ảnh nhiệm vụ" style="max-width:220px;width:100%;border-radius:10px">`:''}<div class="row"><button class="secondary" data-eco-hide="${esc(t.id)}" ${!t.is_published?'disabled':''}>Ẩn nhiệm vụ</button></div></article>`}).join(''):'<p class="muted">Chưa có nhiệm vụ ảnh nào.</p>';
  }
  const taskForm=$('eco-task-form');
  if(taskForm)taskForm.addEventListener('submit',async e=>{
    e.preventDefault();const title=$('eco-task-title').value.trim(),description=$('eco-task-description').value.trim(),file=$('eco-task-image').files[0],date=$('eco-task-date').value,expiry=$('eco-task-expiry').value;
    if(!file||!date){setMsg('eco-task-message','Cần chọn ảnh và ngày hiển thị.',true);return;}
    if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){setMsg('eco-task-message','Ảnh phải là JPG, PNG hoặc WEBP và không quá 5 MB.',true);return;}
    setMsg('eco-task-message','Đang tải ảnh và đăng nhiệm vụ…');
    try{
      const {data:{user}}=await db.auth.getUser();if(!user)throw new Error('Phiên đăng nhập đã hết hạn.');
      const ext=file.type==='image/png'?'png':file.type==='image/webp'?'webp':'jpg',path=`${user.id}/${crypto.randomUUID()}.${ext}`;
      const up=await db.storage.from('eco-task-images').upload(path,file,{contentType:file.type,upsert:false});if(up.error)throw up.error;
      const row={title,description,image_path:path,task_date:date,expires_at:expiry?new Date(expiry).toISOString():null,is_published:true,created_by:user.id};
      const ins=await db.from('eco_daily_tasks').insert(row);if(ins.error){await db.storage.from('eco-task-images').remove([path]);throw ins.error;}
      taskForm.reset();$('eco-task-date').value=new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10);setMsg('eco-task-message','Đã đăng nhiệm vụ. Tất cả tài khoản đăng nhập sẽ nhìn thấy.');await loadEcoTasks();
    }catch(err){setMsg('eco-task-message','Không đăng được: '+err.message,true)}
  });
  const pointsForm=$('eco-points-form');
  if(pointsForm)pointsForm.addEventListener('submit',async e=>{
    e.preventDefault();const userId=$('eco-points-user').value,delta=Number($('eco-points-delta').value),reason=$('eco-points-reason').value.trim();
    if(!userId||!Number.isInteger(delta)||delta===0||Math.abs(delta)>100000||reason.length<2){setMsg('eco-points-message','Chọn tài khoản, nhập số điểm khác 0 và lý do hợp lệ.',true);return;}
    const {error}=await db.rpc('eco_admin_adjust_points',{p_user_id:userId,p_delta:delta,p_reason:reason});
    if(error){setMsg('eco-points-message','Không điều chỉnh được: '+error.message,true);return;}
    pointsForm.reset();setMsg('eco-points-message',`Đã ghi nhận ${delta>0?'+':''}${delta} điểm vào sổ điểm của tài khoản.`);await Promise.all([loadEcoAccounts(),loadEcoPointsHistory()]);
  });
  const taskList=$('eco-task-list');
  if(taskList)taskList.addEventListener('click',async e=>{const b=e.target.closest('[data-eco-hide]');if(!b)return;b.disabled=true;const {error}=await db.from('eco_daily_tasks').update({is_published:false}).eq('id',b.dataset.ecoHide);if(error){setMsg('dashboard-message','Không ẩn được nhiệm vụ: '+error.message,true);b.disabled=false;return;}await loadEcoTasks();});

  checkSession();
})();
