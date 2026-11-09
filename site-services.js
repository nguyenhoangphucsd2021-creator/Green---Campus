(() => {
  const $ = (id) => document.getElementById(id);
  const safeText = (v) => String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const track = (eventName, payload={}) => {
    const allowed = ['page_view','catalog_search','image_classify','reuse_open','product_open','news_open','assistant_question','reuse_report'];
    if (!allowed.includes(eventName)) return;
    fetch('/.netlify/functions/track', {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({eventName,payload})}).catch(()=>{});
  };
  track('page_view', {path: location.pathname});
  let searchTimer;
  const search = $('waste-search');
  if (search) search.addEventListener('input', () => { clearTimeout(searchTimer); if(search.value.trim().length>=2) searchTimer=setTimeout(()=>track('catalog_search',{queryLength:Math.min(search.value.trim().length,80)}),700); });
  document.addEventListener('click', e => {
    const card=e.target.closest('[data-detail]'); if(!card)return;
    const type=card.dataset.detail;
    if(type==='reuse')track('reuse_open'); else if(type==='product')track('product_open'); else if(type==='news')track('news_open');
  });
  const imageButton=$('analyze-image'); if(imageButton) imageButton.addEventListener('click',()=>track('image_classify'));

  const reuseForm=$('reuse-report-form');
  if(reuseForm) reuseForm.addEventListener('submit', async e=>{
    e.preventDefault();const status=$('reuse-report-status');status.textContent='Đang ghi nhận…';status.classList.remove('error');
    try{const res=await fetch('/.netlify/functions/track',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({eventName:'reuse_report',payload:{kind:$('reuse-report-type').value}})});const d=await res.json();if(!res.ok)throw new Error(d.error||'Chưa ghi nhận được.');status.textContent='Cảm ơn bạn. Hoạt động đã được tự báo cáo.';reuseForm.reset();loadStats();}
    catch(err){status.textContent=err.message+' Hãy thử lại sau.';status.classList.add('error');}
  });

  const feedbackForm=$('feedback-form');
  if(feedbackForm) feedbackForm.addEventListener('submit', async e=>{
    e.preventDefault(); const status=$('feedback-status'); const message=$('feedback-message').value.trim();
    if($('feedback-website').value) return;
    status.textContent='Đang gửi phản hồi…'; status.classList.remove('error');
    try { const res=await fetch('/.netlify/functions/feedback',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({kind:$('feedback-kind').value,message,website:$('feedback-website').value})}); const data=await res.json(); if(!res.ok)throw new Error(data.error||'Chưa gửi được phản hồi.'); status.textContent='Cảm ơn bạn. Phản hồi đã được ghi nhận.'; feedbackForm.reset(); }
    catch(err){status.textContent=err.message+' Hãy thử lại sau khi hệ thống được cấu hình.';status.classList.add('error');}
  });


  /* ---- Chế độ miễn phí (mặc định): không gọi AI trả phí; trả lời từ cơ sở dữ liệu của trang ---- */
  const FREE=()=>true; /* Không dùng AI: tra cứu trong dữ liệu của trang + Google */
  const norm=t=>String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
  const STOP=new Set('bo dau la gi the nao co duoc khong nen cua va cho toi minh nhu de vao thi hay cu o bo vao dau nao sao xu ly loai gi la'.split(' '));
  const EXTRA=[["Vỏ trứng", "trung vo trung ga vit", "Hữu cơ", "🥚", "Thuộc rác thực phẩm; để chung với rác hữu cơ, không cần rửa kỹ."], ["Cơm, thức ăn thừa", "com thuc an thua rau canh", "Hữu cơ", "🍚", "Để vào túi hoặc thùng rác thực phẩm, để ráo nước; không trộn với bao bì."], ["Lá cây, cành nhỏ, cỏ cắt", "la cay canh co hoa", "Hữu cơ", "🍃", "Có thể ủ phân hữu cơ hoặc để riêng theo hướng dẫn thu gom rác xanh."], ["Xương cá, xương gà, vỏ tôm", "xuong vo tom cua so", "Hữu cơ", "🦴", "Thuộc rác thực phẩm; xương cứng và vỏ cua sò thường không ủ được tại nhà, hãy theo hướng dẫn địa phương."], ["Chai lọ nhựa (nước suối, dầu gội)", "chai lo nhua nuoc suoi dau goi sua tam", "Tái chế", "🧴", "Làm rỗng, tráng sơ, tháo nắp, ép gọn và để ráo."], ["Hộp sữa giấy", "hop sua giay tetra pak", "Tái chế", "🥛", "Làm sạch, để ráo và ép dẹt; một số nơi chỉ nhận khi có chương trình thu gom riêng."], ["Báo, sách vở cũ", "bao sach vo giay cu photo", "Tái chế", "📰", "Giữ khô, bó gọn. Sách vở còn dùng được nên quyên góp hoặc tái sử dụng trước."], ["Quần áo, giày dép cũ còn dùng", "quan ao giay dep cu", "Tái chế", "👕", "Ưu tiên tái sử dụng: quyên góp hoặc trao đổi; đồ rách nát hỏng nặng mới bỏ vào rác còn lại."], ["Hộp nhựa đựng thực phẩm sạch", "hop nhua dung com thuc pham", "Tái chế", "🍱", "Rửa sạch, để ráo; hộp dính nhiều dầu mỡ khó tái chế."], ["Ly giấy, ly nhựa uống nước", "ly giay ly nhua tra sua coc lop phu", "Còn lại", "🥤", "Ly giấy thường có lớp phủ nhựa nên khó tái chế; đổ hết nước đá và hạn chế dùng một lần, nên mang bình riêng."], ["Ống hút, muỗng nhựa dùng một lần", "ong hut muong nia dia nhua", "Còn lại", "🥄", "Khó tái chế; nên từ chối dùng và chuyển sang vật dụng dùng lại."], ["Hộp xốp dính thức ăn", "hop xop", "Còn lại", "📦", "Xốp bẩn khó tái chế; hạn chế sử dụng, nên dùng hộp dùng lại."], ["Bao bì snack, gói cà phê", "bao bi snack banh keo goi", "Còn lại", "🍿", "Bao bì nhiều lớp khó tái chế; giảm mua đồ gói nhỏ lẻ."], ["Tã giấy, băng vệ sinh, khẩu trang", "ta giay bang ve sinh khau trang", "Còn lại", "😷", "Bỏ vào túi kín rồi cho vào rác còn lại; không bỏ chung với rác tái chế."], ["Gốm sứ, thủy tinh vỡ, gương vỡ", "gom su chen bat vo guong mat kinh", "Còn lại", "🍽️", "Bọc kỹ mảnh vỡ và ghi chú \"vật sắc nhọn\" để người thu gom an toàn."], ["Dầu ăn đã qua sử dụng", "dau an chien ran", "Còn lại", "🛢️", "Không đổ xuống cống. Để nguội, thấm vào giấy hoặc đựng chai kín và hỏi nơi tiếp nhận tại địa phương."], ["Thuốc hết hạn", "thuoc hap thuoc vien tay y", "Nguy hại", "💊", "Không vứt bừa bãi hay đổ xuống cống; mang đến hiệu thuốc hoặc điểm thu gom thuốc hết hạn nếu có."], ["Hộp mực in, mực in", "hop muc in muc may in cartridge", "Nguy hại", "🖨️", "Thu gom riêng, không tự mở hoặc đổ mực; liên hệ nơi bán hoặc đơn vị thu gom."], ["Nhiệt kế thủy ngân", "nhiet ke thuy ngan", "Nguy hại", "🌡️", "Nếu vỡ, không tự xử lý: mở cửa thông gió, không dùng máy hút bụi, liên hệ đơn vị có thẩm quyền."], ["Điện thoại, sạc, đồ điện tử hỏng", "dien thoai sac cap tai nghe laptop dien tu", "Nguy hại", "📱", "Rác điện tử: không bỏ chung rác sinh hoạt, không tự tháo pin; đưa đến điểm thu gom rác điện tử."], ["Bình xịt, sơn, hóa chất", "binh xit son hoa chat tay rua thuoc tru sau", "Nguy hại", "🧪", "Giữ nguyên bao bì, đậy kín, không đổ xuống cống; liên hệ đơn vị thu gom chất thải nguy hại."], ["Đồ dùng, đồ chơi cũ còn dùng được", "do cu do choi", "Tái chế", "♻️", "Ưu tiên tái sử dụng, sửa chữa, tặng hoặc trao đổi trước khi bỏ."]].map(([name,alias,label,icon,desc])=>({name,alias,label,icon,desc}));
  function localAnswer(q){
    const words=[...new Set(norm(q).split(/[^a-z0-9]+/).filter(w=>w.length>1&&!STOP.has(w)))],items=[...(typeof wasteItems!=='undefined'?wasteItems:[]),...EXTRA];
    const rows=items.map(it=>{const n=new Set(norm(it.name+' '+(it.alias||'')).split(/[^a-z0-9]+/)),d=new Set(norm(it.desc+' '+it.label).split(/[^a-z0-9]+/));let nm=0,all=0;words.forEach(w=>{if(n.has(w)){nm++;all++}else if(d.has(w))all++});return{it,nm,all,sc:nm*3+all}}).filter(r=>r.all>0).sort((a,b)=>b.sc-a.sc);
    const fmt=r=>`${r.it.icon||'•'} ${r.it.name} → nhóm ${r.it.label}.\n${r.it.desc}`,exact=rows.filter(r=>r.all===words.length&&r.nm>0).slice(0,3);
    if(words.length&&exact.length)return exact.map(fmt).join('\n\n');
    const near=rows.filter(r=>r.nm>0&&r.nm/words.length>=.6).slice(0,1);
    if(near.length)return 'Chưa có mục khớp hoàn toàn. Mục gần nhất, hãy kiểm tra lại:\n\n'+near.map(fmt).join('\n\n');
    return 'Chưa tìm thấy trong cơ sở dữ liệu của trang. Hãy gõ ngắn gọn tên vật dụng (ví dụ: "chai nhựa", "pin cũ", "vỏ rau củ") hoặc dùng ô tìm kiếm ở đầu trang.';
  }
  window.gcLocal=localAnswer;
  const freeImg=(a,msg)=>{a.hidden=false;a.innerHTML=`<p>${msg}</p><input id="free-q" placeholder="Ví dụ: chai nhựa, pin, vỏ trứng" style="width:100%;padding:10px;margin:8px 0"/><div id="free-r" style="white-space:pre-line"></div><p><button type="button" id="free-kb" class="button button-primary" data-kb-q="">Xem ảnh thực tế & kiến thức ↗</button> <a id="free-g" class="button button-outline" href="https://www.google.com/search?q=" target="_blank" rel="noopener">Tìm tên vật dụng trên Google ↗</a> <a class="button button-outline" href="https://lens.google.com/" target="_blank" rel="noopener">Google Lens ↗</a> <small>Với Google Lens, hãy tải đúng ảnh này lên.</small></p>`;a.querySelector('#free-q').addEventListener('input',ev=>{const v=ev.target.value.trim();a.querySelector('#free-r').textContent=v?localAnswer(v):'';a.querySelector('#free-kb').dataset.kbQ=v;a.querySelector('#free-g').href='https://www.google.com/search?q='+encodeURIComponent(v+' thuộc loại rác nào')})};
  document.addEventListener('click',e=>{
    if(!FREE()||!e.target.closest('#analyze-image'))return;
    e.stopImmediatePropagation();e.preventDefault();
    freeImg($('analysis-result'),'Hãy nhìn ảnh và gõ tên vật dụng để xem hướng dẫn phân loại, hoặc tra bằng Google:');
  },true);
  const assistantForm=$('assistant-form');
  if(assistantForm) assistantForm.addEventListener('submit', async e=>{
    e.preventDefault(); const q=$('assistant-question').value.trim(), host=$('assistant-answer'), button=$('assistant-submit'); if(!q)return;
    button.disabled=true;button.textContent='Đang xử lý…';host.textContent='Đang tra cứu…';track('assistant_question',{questionLength:Math.min(q.length,1200)});
    try { if(FREE()){const ans=localAnswer(q);host.textContent=ans+'\n\nLưu ý: trả lời lấy từ cơ sở dữ liệu của trang, chỉ mang tính tham khảo; hãy xem hướng dẫn tại địa phương.';const su=(window.GREEN_CAMPUS_CONFIG||{}).sheetUrl;if(su&&ans.startsWith('Chưa tìm thấy')){const b=document.createElement('button');b.className='button button-outline';b.textContent='Gửi câu hỏi cho ban quản trị';b.onclick=()=>{fetch(su,{method:'POST',mode:'no-cors',headers:{'Content-Type':'text/plain'},body:JSON.stringify({action:'question',q})}).catch(()=>{});b.replaceWith('Đã gửi, cảm ơn bạn!')};host.append(document.createElement('br'),b)}return} }
    catch(err){host.textContent='Không thể tra cứu lúc này. Hãy dùng nút Hỏi Google.';}
    finally{button.disabled=false;button.textContent='Tra cứu ↗';}
  });

  async function loadStats(){try{const r=await fetch('/.netlify/functions/stats');if(!r.ok)return;const d=await r.json();if(!d.configured)return; if($('stat-visits'))$('stat-visits').textContent=Number(d.visits||0).toLocaleString('vi-VN');if($('stat-searches'))$('stat-searches').textContent=Number(d.searches||0).toLocaleString('vi-VN');if($('stat-reuse'))$('stat-reuse').textContent=Number(d.reuseActions||0).toLocaleString('vi-VN');}catch(_){}}
  loadStats();
})();
