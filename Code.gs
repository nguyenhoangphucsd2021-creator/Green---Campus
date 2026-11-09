/** WARNING: DEMO ONLY. This public Apps Script endpoint has no caller authentication.
 * Anyone who knows its URL can spoof usernames/scores and submit activities.
 * Never use it for official scoring, personal data, or production authorization.
 * Green Campus – Eco Challenge: backend miễn phí bằng Google Sheets (không cần máy chủ).
 *  Dán toàn bộ vào Extensions > Apps Script của một Google Sheet mới, rồi Deploy > Web app. */
const DAY = 864e5, HEAD = {
  HoatDong: ['id','user','loai','mo_ta','noi_dung','anh_minh_chung','nghi_trung','Trạng thái','Điểm','Nhận xét','thời gian'],
  BXH: ['user','diem_online','cap_nhat'], CauHoi: ['thoi_gian','cau_hoi','tra_loi'],
  CauHinh: ['status','acc_ms','since_ms','days','act_paused']};
function tab(n) {
  const ss = SpreadsheetApp.getActive(); let s = ss.getSheetByName(n);
  if (!s) { s = ss.insertSheet(n); s.appendRow(HEAD[n]);
    if (n === 'CauHinh') s.appendRow(['idle', 0, 0, 7, false]);
    if (n === 'HoatDong') s.getRange('H2:H2000').setDataValidation(SpreadsheetApp.newDataValidation().requireValueInList(['Chờ duyệt','Đã duyệt','Từ chối','Thu hồi']).build()); }
  return s;
}
const rows = n => tab(n).getDataRange().getValues().slice(1);
const out = o => ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
function season() {
  const r = tab('CauHinh').getRange('A2:E2'), v = r.getValues()[0];
  let [status, acc, since, days, ap] = v; acc = +acc || 0; since = +since || 0; days = +days || 7;
  if (status === 'running' && acc + Date.now() - since >= days * DAY) { status = 'ended'; acc = days * DAY; r.setValues([[status, acc, since, days, ap]]); }
  return { status, acc, since, days, actPaused: ap === true || ap === 'TRUE' };
}
function setSeason(fn) {
  const s = season(), r = tab('CauHinh').getRange('A2:E2'), now = Date.now();
  const el = s.acc + (s.status === 'running' ? now - s.since : 0), n = fn(s, now, el);
  r.setValues([[n.status, n.acc, n.since, s.days, s.actPaused]]);
}
const startSeason  = () => setSeason((s, now) => ({ status: 'running', acc: 0, since: now }));
const pauseSeason  = () => setSeason((s, now, el) => ({ status: 'paused', acc: el, since: 0 }));
const resumeSeason = () => setSeason((s, now) => ({ status: 'running', acc: s.acc, since: now }));
const endSeason    = () => setSeason((s, now, el) => ({ status: 'ended', acc: Math.min(el, s.days * DAY), since: 0 }));
function onOpen() {
  SpreadsheetApp.getUi().createMenu('Eco Challenge').addItem('Bắt đầu mùa giải (xóa đồng hồ)', 'startSeason')
    .addItem('Tạm dừng', 'pauseSeason').addItem('Tiếp tục', 'resumeSeason').addItem('Kết thúc & chốt điểm', 'endSeason').addToUi();
  Object.keys(HEAD).forEach(tab);
}
function doGet(e) {
  const a = (e.parameter || {}).action;
  if (a === 'season') return out(season());
  if (a === 'mine') return out({ rows: rows('HoatDong').filter(r => r[1] === e.parameter.user).map(r => ({ id: r[0], status: r[7] || 'Chờ duyệt', points: r[8], note: r[9] })) });
  if (a === 'board') {
    const m = {}; const get = u => m[u] || (m[u] = { name: u, on: 0, pr: 0 });
    rows('BXH').forEach(r => { if (r[0]) get(r[0]).on = +r[1] || 0; });
    rows('HoatDong').forEach(r => { if (r[7] === 'Đã duyệt') get(r[1]).pr += +r[8] || 0; });
    return out({ rows: Object.values(m) });
  }
  return out({ ok: true });
}
function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const d = JSON.parse(e.postData.contents), now = new Date();
    if (d.action === 'activity') {
      const s = tab('HoatDong'); if (rows('HoatDong').some(r => r[0] === d.id)) return out({ ok: true });
      const folder = DriveApp.getFoldersByName('GreenCampus-MinhChung'); const f = folder.hasNext() ? folder.next() : DriveApp.createFolder('GreenCampus-MinhChung');
      const urls = (d.imgs || []).slice(0, 3).map((x, i) => f.createFile(Utilities.newBlob(Utilities.base64Decode(String(x).split(',')[1]), 'image/jpeg', d.id + '-' + i + '.jpg')).getUrl());
      s.appendRow([d.id, d.user, String(d.type).slice(0, 80), String(d.desc).slice(0, 1000), String(d.where || '').slice(0, 200), urls.join('\n'), d.dup ? 'CÓ' : '', 'Chờ duyệt', '', '', now]);
    } else if (d.action === 'score') {
      const s = tab('BXH'), i = rows('BXH').findIndex(r => r[0] === d.user);
      if (i >= 0) s.getRange(i + 2, 2, 1, 2).setValues([[+d.online || 0, now]]); else s.appendRow([d.user, +d.online || 0, now]);
    } else if (d.action === 'question') tab('CauHoi').appendRow([now, String(d.q).slice(0, 500), '']);
    return out({ ok: true });
  } finally { lock.releaseLock(); }
}
