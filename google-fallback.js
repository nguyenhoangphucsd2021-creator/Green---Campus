/* Tra cứu bằng Google: lấy nội dung người dùng đã nhập trên trang, mở kết quả trên Google (không cần khóa API, miễn phí). */
(() => {
  const G = q => 'https://www.google.com/search?q=' + encodeURIComponent(q);
  const $ = id => document.getElementById(id);
  const link = (q, text, kq) => `<p class="g-more"><button type="button" class="button button-primary" data-kb-q="${(kq || q).replace(/"/g, '&quot;')}">Xem ảnh thực tế & kiến thức ↗</button> <a class="button button-outline" href="${G(q)}" target="_blank" rel="noopener">${text} ↗</a></p>`;
  function addButton(formId, inputId, label, suffix) {
    const f = $(formId), i = $(inputId); if (!f || !i) return;
    const b = document.createElement('button'); b.type = 'button'; b.className = 'button button-outline'; b.textContent = label;
    b.onclick = () => { const q = i.value.trim(); if (q) window.open(G(q + suffix), '_blank', 'noopener'); else i.focus(); };
    f.appendChild(b);
  }
  function watch(hostId, inputId, suffix) {
    const h = $(hostId); if (!h) return;
    new MutationObserver(() => {
      if (h.querySelector('.g-more') || !h.textContent.trim() || /Đang/.test(h.textContent)) return;
      const q = ($(inputId).value || '').trim(); if (q) h.insertAdjacentHTML('beforeend', link(q + suffix, 'Xem kết quả trên Google', q));
    }).observe(h, { childList: true, characterData: true, subtree: true });
  }
  addButton('web-search-form', 'web-search-input', 'Tìm trên Google', '');
  addButton('assistant-form', 'assistant-question', 'Hỏi Google', ' phân loại xử lý rác');
  watch('web-search-results', 'web-search-input', '');
  watch('assistant-answer', 'assistant-question', ' phân loại xử lý rác');
})();
