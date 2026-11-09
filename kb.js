/* KHO KIẾN THỨC: trang chi tiết ngay trong trang. Nội dung hướng dẫn do Green Campus biên soạn;
   ảnh thực tế lấy trực tiếp từ Wikimedia Commons, kiến thức chuyên sâu từ Wikipedia (miễn phí, không cần khóa). */
(() => {
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const nz = s => String(s || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').toLowerCase();
const WP = 'https://vi.wikipedia.org/w/api.php', CM = 'https://commons.wikimedia.org/w/api.php';
const GG = q => 'https://www.google.com/search?q=' + encodeURIComponent(q), GI = q => 'https://www.google.com/search?tbm=isch&q=' + encodeURIComponent(q);
const cache = new Map();
const api = (base, p) => { const k = base + JSON.stringify(p); if (cache.has(k)) return cache.get(k); const u = new URL(base); u.search = new URLSearchParams({ format:'json', origin:'*', ...p }); const pr = fetch(u).then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); }); cache.set(k, pr); pr.catch(() => cache.delete(k)); return pr; };
const pages = d => Object.values(d.query?.pages || {}).sort((a, b) => (a.index || 0) - (b.index || 0));
const wsearch = async (q, n = 6) => pages(await api(WP, { action:'query', generator:'search', gsrsearch:q, gsrnamespace:'0', gsrlimit:n, prop:'extracts|pageimages', exintro:'1', explaintext:'1', exlimit:'max', exsentences:'3', piprop:'thumbnail', pithumbsize:'240' }));
const article = async id => pages(await api(WP, { action:'query', pageids:id, prop:'extracts|pageimages', explaintext:'1', exsectionformat:'plain', piprop:'thumbnail', pithumbsize:'900' }))[0];
const photos = async (q, n = 4) => pages(await api(CM, { action:'query', generator:'search', gsrsearch:q + ' filetype:bitmap', gsrnamespace:'6', gsrlimit:'14', prop:'imageinfo', iiprop:'url|extmetadata', iiurlwidth:'720', iiextmetadatafilter:'LicenseShortName' }))
  .map(p => p.imageinfo?.[0]).filter(i => i && /\.jpe?g/i.test(i.thumburl || '')).slice(0, n).map(i => ({ src:i.thumburl, page:i.descriptionurl, lic:i.extmetadata?.LicenseShortName?.value || '' }));

/* ---------- Nội dung biên soạn ---------- */
const T = {
 pet:{t:'Chai nhựa PET',ic:'🧴',tag:'TÁI CHẾ · NHỰA SỐ 1',q:'Polyethylene terephthalate',im:'PET plastic bottles',rel:['mã nhận dạng nhựa','ô nhiễm nhựa','bình nước tái sử dụng'],
  lead:'PET là loại nhựa trong, nhẹ dùng làm chai nước suối và nước ngọt. Đây là một trong những loại nhựa dễ tái chế nhất, miễn là chai sạch và được tách riêng.',
  steps:['Uống hết, đổ sạch nước còn lại trong chai.','Tráng nhanh bằng nước sạch, không cần rửa kỹ bằng xà phòng.','Tháo nhãn nếu dễ bóc; vặn lại nắp hay để riêng tùy hướng dẫn của điểm thu gom.','Ép dẹt chai để giảm thể tích rồi vặn nắp lại.','Bỏ vào thùng hoặc túi rác tái chế, giữ khô.'],
  avoid:['Để chai còn nước ngọt hoặc dầu: làm bẩn cả mẻ tái chế.','Bỏ chai từng đựng hóa chất hay thuốc trừ sâu vào rác tái chế (đó là chất thải nguy hại).','Đốt hoặc chôn chai nhựa.'],
  facts:['Ký hiệu tam giác tái chế số 1 thường in dưới đáy chai PET.','Sau tái chế, nhựa PET có thể thành sợi polyester cho áo, thảm hoặc bao bì, tùy công nghệ.','Cách giảm rác hiệu quả nhất vẫn là mang theo bình nước cá nhân.']},
 paper:{t:'Giấy và bìa carton',ic:'📦',tag:'TÁI CHẾ · GIẤY',q:'Tái chế giấy',im:'cardboard paper recycling',rel:['kinh tế tuần hoàn','giấy tái chế'],
  lead:'Giấy và carton sạch, khô là nguồn nguyên liệu tái chế quan trọng. Sợi giấy tái chế được nhiều lần nhưng ngắn dần sau mỗi lần.',
  steps:['Gom giấy sạch, khô: vở cũ, báo, hộp carton.','Tháo băng keo và ghim lớn nếu dễ gỡ.','Dẹt thùng carton, gấp gọn để tiết kiệm chỗ.','Buộc hoặc cho vào túi riêng, tránh ẩm mốc.'],
  avoid:['Giấy dính dầu mỡ, thức ăn (hộp bánh bẩn, giấy ăn đã dùng).','Giấy ướt, mốc.','Giấy có thông tin cá nhân mà chưa xé/hủy.'],
  facts:['Sợi giấy thường tái chế được khoảng 5–7 lần rồi quá ngắn để dùng tiếp.','Dùng giấy tái chế giúp giảm lượng gỗ nguyên liệu cần khai thác.']},
 metal:{t:'Lon nhôm, vỏ kim loại',ic:'🥫',tag:'TÁI CHẾ · KIM LOẠI',q:'Tái chế nhôm',im:'aluminium cans recycling',rel:['bô-xít','phế liệu kim loại'],
  lead:'Nhôm và thép là kim loại có giá trị, tái chế được nhiều lần mà gần như không mất tính chất.',
  steps:['Uống hết, đổ sạch nước còn trong lon.','Tráng nhanh, để ráo.','Ép dẹt lon nhôm nếu có thể; ép miệng hộp thiếc có cạnh sắc cho an toàn.','Bỏ vào nhóm kim loại hoặc thùng tái chế theo hướng dẫn.'],
  avoid:['Bình gas, bình xịt còn áp suất, sơn: đây là chất thải nguy hại.','Để lon còn đồ uống thừa.','Cắt hoặc đập tạo cạnh nhọn không bọc.'],
  facts:['Tái chế nhôm tiết kiệm khoảng 95% năng lượng so với sản xuất nhôm từ quặng bô-xít.','Một chiếc lon nhôm có thể quay lại thành lon mới nhiều lần.']},
 glass:{t:'Chai lọ thủy tinh',ic:'🍾',tag:'TÁI CHẾ · THỦY TINH',q:'Tái chế thủy tinh',im:'glass bottles recycling',rel:['tái sử dụng chai lọ','kinh tế tuần hoàn'],
  lead:'Thủy tinh tái chế được nhiều lần mà không giảm chất lượng, nhưng mảnh vỡ rất nguy hiểm cho người thu gom.',
  steps:['Đổ sạch, tráng nhanh.','Tháo nắp kim loại hoặc nhựa.','Nếu còn nguyên vẹn, ưu tiên tái sử dụng làm lọ đựng.','Mảnh vỡ: gói kín trong giấy dày hoặc hộp carton, ghi "thủy tinh vỡ".'],
  avoid:['Bỏ chung gương, kính cửa sổ, bóng đèn, gốm sứ: nhiệt độ nóng chảy khác nhau làm hỏng mẻ tái chế.','Bỏ mảnh vỡ trần vào túi.'],
  facts:['Thủy tinh vụn nấu chảy ở nhiệt độ thấp hơn nguyên liệu thô nên tiết kiệm năng lượng.','Chai thủy tinh thường được tách theo màu (trong, xanh, nâu).']},
 organic:{t:'Rác thực phẩm, hữu cơ',ic:'🥬',tag:'HỮU CƠ · Ủ PHÂN',q:'Phân compost',im:'composting food waste',rel:['ủ phân compost','khí mê-tan','giun quế'],
  lead:'Rác hữu cơ chiếm phần lớn rác sinh hoạt. Chôn lấp lẫn với rác khác sinh khí mê-tan, một khí nhà kính mạnh; tách riêng để ủ thành phân là cách giảm tác động.',
  steps:['Chuẩn bị thùng riêng, lót giấy hoặc túi phân hủy.','Cho vỏ rau củ, bã cà phê, vỏ trứng, lá khô.','Để ráo nước; hạn chế thịt, dầu mỡ nhiều nếu ủ tại nhà (mùi, côn trùng).','Giữ độ ẩm vừa phải như miếng bọt biển vắt, đảo trộn định kỳ.','Sau vài tuần đến vài tháng thu được phân cho cây.'],
  avoid:['Trộn túi nilon, nhựa vào rác hữu cơ.','Cho nhiều dầu mỡ hoặc xương lớn vào thùng ủ tại nhà.'],
  facts:['Ủ phân có oxy tạo ít mê-tan hơn chôn lấp thiếu oxy.','Bã cà phê và vỏ trứng thường dùng tốt trong ủ phân.']},
 residual:{t:'Rác còn lại',ic:'🗑️',tag:'RÁC CÒN LẠI',q:'Chất thải rắn sinh hoạt',im:'landfill waste',rel:['nhựa dùng một lần','bãi chôn lấp'],
  lead:'Là phần chưa có phương án tái chế phù hợp: túi nilon bẩn, hộp xốp dính thức ăn, khăn giấy đã dùng. Mục tiêu là giảm từ nguồn để phần này ngày càng nhỏ.',
  steps:['Giảm: từ chối túi, ống hút, ly dùng một lần.','Dùng lại: túi, hộp, bình cá nhân.','Gói gọn vào túi kín rồi bỏ vào thùng "rác còn lại".','Không trộn với rác tái chế để tránh làm bẩn cả thùng.'],
  avoid:['Đốt rác ngoài trời, thải khói độc.','Bỏ pin, bóng đèn vào nhóm này.'],
  facts:['Phần lớn rác nhóm này bị chôn lấp hoặc xử lý, nên "giảm từ đầu" quan trọng hơn "xử lý cuối".','Túi nilon mỏng có thể mất từ hàng chục đến hàng trăm năm để phân hủy, tùy loại.']},
 battery:{t:'Pin đã qua sử dụng',ic:'🔋',tag:'NGUY HẠI · PIN',q:'Tái chế pin',im:'used batteries recycling',rel:['pin lithium-ion','kim loại nặng'],
  lead:'Pin chứa kim loại nặng hoặc hóa chất; pin lithium có thể cháy nếu bị đâm thủng hay nén. Cần thu gom riêng.',
  steps:['Gom pin cũ vào hộp hoặc túi riêng, nơi khô mát.','Dán băng keo lên hai đầu cực của pin lithium hoặc pin vuông để tránh chạm nhau.','Mang đến điểm thu gom pin ở địa phương, trường học hoặc cửa hàng điện máy có nhận.','Không tháo rời, không đốt.'],
  avoid:['Bỏ vào rác sinh hoạt.','Đập, đâm hoặc để gần nguồn nhiệt.'],
  facts:['Pin lithium hỏng có thể gây cháy.','Tái chế pin giúp thu hồi các kim loại như đồng, ni-ken, coban.']},
 lamp:{t:'Bóng đèn huỳnh quang',ic:'💡',tag:'NGUY HẠI · BÓNG ĐÈN',q:'Đèn huỳnh quang',im:'fluorescent lamp recycling',rel:['thủy ngân','đèn LED'],
  lead:'Bóng huỳnh quang chứa một lượng nhỏ thủy ngân, cần thu gom riêng và xử lý cẩn thận nếu vỡ.',
  steps:['Ngắt điện, đợi bóng nguội rồi mới tháo.','Cất vào hộp ban đầu hoặc bọc giấy dày.','Đưa đến điểm thu gom chất thải nguy hại hoặc nơi bán bóng đèn có nhận lại.','Nếu vỡ: mở cửa thông gió, không dùng máy hút bụi, đeo găng, gom mảnh bằng giấy cứng vào túi kín.'],
  avoid:['Đập vỡ để giảm thể tích.','Bỏ chung rác thường.'],facts:['Đèn LED không chứa thủy ngân và tiết kiệm điện hơn.']},
 hazard:{t:'Chất thải cần lưu ý',ic:'⚠️',tag:'NGUY HẠI',q:'Chất thải nguy hại',im:'hazardous waste',rel:['pin lithium-ion','rác thải điện tử','thủy ngân'],
  lead:'Gồm pin, bóng đèn, thuốc hết hạn, hóa chất, mực in, đồ điện tử hỏng. Lẫn vào rác thường, chúng có thể gây hại cho sức khỏe và môi trường.',
  steps:['Nhận biết biểu tượng cảnh báo trên bao bì.','Giữ nguyên bao bì, đậy kín.','Cất nơi khô mát, xa tầm tay trẻ nhỏ.','Liên hệ đơn vị thu gom chất thải nguy hại hoặc điểm thu gom của địa phương.'],
  avoid:['Đổ xuống cống, chôn hoặc đốt.','Trộn các loại hóa chất với nhau.'],facts:['Quy định thu gom khác nhau theo địa phương, hãy hỏi đơn vị thu gom nơi bạn ở.']},
 recycle:{t:'Rác có khả năng tái chế',ic:'♻️',tag:'TÁI CHẾ',q:'Tái chế',im:'recycling sorting',rel:['kinh tế tuần hoàn','mã nhận dạng nhựa'],
  lead:'Giấy, bìa, kim loại, nhựa và thủy tinh sạch, khô là nhóm tái chế phổ biến.',
  steps:['Làm rỗng vật chứa.','Tráng nhanh bằng nước.','Để ráo.','Tách theo chất liệu.','Bỏ vào thùng tái chế.'],avoid:['Đồ dính nhiều thức ăn hay dầu mỡ.','Vật liệu nhiều lớp khó tách.'],facts:['Quy tắc "sạch – khô – tách riêng" giúp tăng tỉ lệ tái chế thành công.']},
 pot:{t:'Chậu cây từ chai nhựa',ic:'🪴',tag:'Ý TƯỞNG TÁI SỬ DỤNG',meta:'20–30 phút · gần như 0 đồng · có người lớn hỗ trợ khi cắt',q:'Làm vườn trong chai nhựa',im:'plastic bottle planter',rel:['trồng rau trong nhà','vườn đứng'],
  lead:'Biến chai nhựa thành chậu trồng rau thơm hoặc sen đá, vừa giảm rác vừa có góc xanh trong lớp học.',
  mat:['Chai PET 1,5–2 lít đã rửa sạch','Kéo hoặc dao rọc (người lớn thao tác)','Giấy nhám hoặc băng keo làm nhẵn mép cắt','Đất trồng và hạt hoặc cây nhỏ','Đinh hoặc mũi khoan nhỏ làm lỗ thoát nước'],
  steps:['Rửa sạch chai, bóc nhãn.','Đánh dấu và cắt cách đáy khoảng 12–15 cm.','Mài hoặc dán băng keo mép cắt cho nhẵn.','Tạo 4–5 lỗ thoát nước ở đáy.','Lót ít sỏi nhỏ rồi cho đất vào.','Gieo hạt hoặc trồng cây, tưới vừa phải.','Đặt nơi có ánh sáng và tưới đều.'],
  tips:['Treo chai nằm ngang bằng dây để làm vườn đứng.','Dán giấy hay vải bên ngoài để che nắng cho rễ.'],safety:'Cạnh cắt rất sắc. Không dùng chai từng đựng hóa chất.'},
 can:{t:'Bình tưới cây nhỏ',ic:'🚿',tag:'Ý TƯỞNG TÁI SỬ DỤNG',meta:'10 phút · gần như 0 đồng',q:'Tưới cây',im:'DIY plastic bottle watering can',rel:['tưới tiết kiệm nước'],
  lead:'Chai nhựa cũ thành bình tưới mini, tưới nhẹ không làm bật gốc cây con.',mat:['Chai nhựa 1–2 lít','Đinh hoặc kim nhỏ','Nắp chai'],
  steps:['Rửa sạch chai, giữ lại nắp.','Dùng đinh đục 6–10 lỗ nhỏ trên nắp (người lớn thao tác).','Đổ nước, vặn chặt nắp.','Bóp nhẹ thân chai để nước phun ra.','Rửa lại định kỳ để lỗ không bị tắc.'],tips:['Dùng nước rửa rau để tưới cây.'],safety:'Đục nắp trên bàn lót, có người lớn hỗ trợ.'},
 box:{t:'Hộp, kệ, khung từ bìa carton',ic:'📦',tag:'Ý TƯỞNG TÁI SỬ DỤNG',meta:'30–60 phút · gần như 0 đồng',q:'Thủ công từ giấy bìa',im:'cardboard organizer craft',rel:['giấy tái chế','kinh tế tuần hoàn'],
  lead:'Carton sạch và khô có thể thành hộp lưu trữ, kệ mini hoặc khung ảnh, gọn và đủ bền cho vật nhẹ.',mat:['Thùng carton sạch, khô','Kéo hoặc dao rọc, thước','Keo dán hoặc băng keo giấy','Giấy màu hoặc vải để bọc (tùy chọn)'],
  steps:['Đo và cắt các tấm theo kích thước cần.','Dán 2–3 lớp ở đáy và các cạnh chịu lực.','Gấp, dán thành hộp hoặc kệ rồi để keo khô.','Bọc giấy màu hoặc vải, viết nhãn.','Thử chịu tải nhẹ trước khi dùng.'],tips:['Xếp lớp sóng carton vuông góc nhau để cứng hơn.'],safety:'Dùng dao rọc có người lớn. Không để carton ẩm vì dễ mốc.'},
 note:{t:'Sổ tay giấy một mặt',ic:'📒',tag:'Ý TƯỞNG TÁI SỬ DỤNG',meta:'30 phút · gần như 0 đồng',q:'Giấy tái chế',im:'notebook handmade recycled paper',rel:['giấy tái chế'],
  lead:'Gom giấy còn một mặt trắng đóng thành sổ ghi chú hoặc giấy nháp, tiết kiệm giấy mới.',mat:['Giấy còn một mặt trắng','Bìa carton','Kéo, thước','Kim chỉ, dây hoặc kẹp bướm'],
  steps:['Chọn giấy sạch, bỏ giấy có thông tin cá nhân.','Cắt đồng kích thước A5 hoặc A6.','Xếp mặt trắng cùng một chiều.','Cắt bìa carton lớn hơn tập giấy một chút.','Đục lỗ rồi khâu hoặc kẹp gáy.','Trang trí bìa theo ý thích.'],tips:['Dùng làm giấy nháp hoặc sổ ghi chú nội bộ.'],safety:'Hủy giấy có thông tin cá nhân trước khi tái sử dụng.'},
 lamp2:{t:'Đèn và đồ trang trí từ lọ thủy tinh',ic:'🏮',tag:'Ý TƯỞNG TÁI SỬ DỤNG',meta:'30 phút · chi phí thấp',q:'Thủy tinh',im:'glass jar lantern',rel:['tái chế thủy tinh'],
  lead:'Lọ thủy tinh nguyên vẹn thành đèn trang trí hoặc lọ cắm hoa.',mat:['Lọ thủy tinh nguyên vẹn đã rửa sạch','Dây đèn LED chạy pin hoặc nến LED','Giấy màu, ren, dây thừng','Keo thủ công'],
  steps:['Ngâm nước ấm, bóc nhãn và lau khô.','Trang trí bên ngoài bằng giấy hoặc dây.','Cho dây đèn LED pin vào lọ.','Đóng nắp chừa khe cho dây.','Đặt nơi ổn định, xa mép bàn.'],tips:['Có thể thành lọ cắm hoa hoặc đựng bút.'],safety:'Không tự đấu nối điện lưới; chỉ dùng đèn LED chạy pin; không dùng nến thật gần giấy, vải.'},
 tote:{t:'Túi vải dùng nhiều lần',ic:'👜',tag:'Ý TƯỞNG TÁI SỬ DỤNG',meta:'15–20 phút · không cần may',q:'Túi vải',im:'tote bag made from old t-shirt',rel:['túi nilon','nhựa dùng một lần'],
  lead:'Biến áo thun cũ thành túi đi chợ bền chắc, không cần máy may.',mat:['Áo thun cũ','Kéo','Phấn hoặc bút để đánh dấu'],
  steps:['Cắt bỏ tay áo và phần cổ áo.','Cắt phần gấu áo thành các tua dài 8–10 cm.','Buộc từng cặp tua kề nhau bằng nút thắt chặt.','Buộc thêm hàng thứ hai lệch hàng để bít kín khe hở.','Thử độ chắc trước khi đựng đồ nặng.'],tips:['Giặt định kỳ, dùng lâu năm.'],safety:'Túi vải chỉ có lợi hơn túi nhựa khi được dùng lại thật nhiều lần.'},
 gift:{t:'Bộ quà tặng xanh',ic:'🎁',tag:'Ý TƯỞNG TÁI SỬ DỤNG',meta:'45 phút',q:'Quà tặng thân thiện môi trường',im:'eco friendly gift set',rel:['lối sống xanh'],
  lead:'Gói quà bằng vật liệu tái sử dụng, vừa ý nghĩa vừa không tạo thêm rác.',mat:['Sổ tay, túi vải, chậu cây mini tự làm','Giấy báo hoặc vải để gói','Dây gai hoặc dây vải','Giấy tái sử dụng để viết thiệp'],
  steps:['Chọn thông điệp muốn gửi.','Chuẩn bị 2–3 món tự làm hoặc tái sử dụng.','Gói bằng giấy báo hoặc vải, buộc dây gai.','Viết thiệp tay trên giấy tái sử dụng.'],tips:['Gói theo kiểu furoshiki bằng một mảnh vải.'],safety:'Chỉ tặng đồ đã làm sạch và chắc chắn.'},
 source:{t:'Phân loại rác tại nguồn',ic:'🌍',tag:'KIẾN THỨC',q:'Phân loại rác tại nguồn',im:'waste sorting bins',rel:['kinh tế tuần hoàn','rác thải điện tử'],
  lead:'Phân loại ngay tại nơi rác phát sinh giúp rác tái chế sạch hơn, giảm chi phí thu gom và giảm lượng rác chôn lấp.',steps:['Chuẩn bị 3–4 thùng có nhãn màu rõ ràng.','Đặt thùng gần nơi phát sinh rác.','Tập thói quen hỏi: tái chế, hữu cơ hay rác còn lại?','Nhắc nhau và kiểm tra thùng hằng tuần.'],avoid:['Đặt một thùng chung cho mọi loại rác.'],facts:['Phân loại càng gần nguồn, rác càng ít bị nhiễm bẩn.']},
 circular:{t:'Kinh tế tuần hoàn',ic:'🔄',tag:'CHUYÊN ĐỀ',q:'Kinh tế tuần hoàn',im:'circular economy',rel:['tái chế','tái sử dụng'],
  lead:'Thay vì khai thác – sản xuất – thải bỏ, kinh tế tuần hoàn kéo dài vòng đời sản phẩm bằng thiết kế bền, sửa chữa, tái sử dụng và tái chế.',steps:['Mua ít, mua bền.','Sửa trước khi bỏ.','Trao đổi hoặc quyên góp đồ cũ.','Tái chế phần còn lại.'],facts:['Thứ tự ưu tiên: giảm → tái sử dụng → tái chế.']},
 plastic:{t:'Nhựa dùng một lần và lựa chọn thay thế',ic:'🥤',tag:'MÔI TRƯỜNG',q:'Ô nhiễm nhựa',im:'plastic pollution',rel:['vi nhựa','túi nilon'],
  lead:'Nhựa dùng một lần dễ rò rỉ ra môi trường và phân rã thành vi nhựa. Cách tốt nhất là giảm từ đầu bằng vật dụng dùng lại.',steps:['Mang bình nước, túi vải, hộp cơm.','Từ chối ống hút và túi không cần thiết.','Chọn sản phẩm ít bao bì.','Phân loại nhựa sạch để tái chế.'],facts:['Vi nhựa là hạt nhựa nhỏ hơn 5 mm.']},
 ewaste:{t:'Rác thải điện tử',ic:'🔌',tag:'AN TOÀN',q:'Rác thải điện tử',im:'electronic waste recycling',rel:['pin lithium-ion','thủy ngân'],
  lead:'Thiết bị điện tử và pin chứa cả kim loại quý lẫn chất độc hại, nên cần thu gom và tái chế qua đơn vị có chuyên môn.',steps:['Xóa dữ liệu trên thiết bị cũ.','Còn dùng được: tặng hoặc bán lại.','Hỏng: mang đến điểm thu gom rác điện tử.','Không tự tháo pin hay đốt.'],avoid:['Bỏ vào rác sinh hoạt.'],facts:['Thiết bị điện tử chứa đồng và các kim loại quý có thể thu hồi.']}
};
const W = [[/pin\b/, 'battery'], [/bong den|huynh quang/, 'lamp'], [/con lai|nilon|xop|khan giay/, 'residual'], [/chai nhua|\bpet\b/, 'pet'], [/giay|carton|bia/, 'paper'], [/lon nhom|kim loai/, 'metal'], [/thuy tinh/, 'glass'], [/huu co|thuc pham|vo rau|ca phe|tui tra/, 'organic'], [/tai che/, 'recycle'], [/luu y|nguy hai/, 'hazard']];
const R = [[/binh tuoi/, 'can'], [/chau cay/, 'pot'], [/so tay/, 'note'], [/qua tang/, 'gift'], [/\bden\b|trang tri|thu cong/, 'lamp2'], [/tui/, 'tote'], [/hop|\bke\b|khung|ong cam|carton|giay cung/, 'box']];
const N = [[/nguon/, 'source'], [/tuan hoan/, 'circular'], [/nhua/, 'plastic'], [/dien tu|\bpin\b/, 'ewaste'], [/u rac|huu co/, 'organic']];
function pickTopic(type, title, desc, ic) {
  const k = nz(title), tab = type === 'reuse' || type === 'product' ? R : type === 'news' ? N : W, hit = tab.find(([re]) => re.test(k));
  if (hit) return T[hit[1]];
  return { t: title, ic, tag: { reuse:'Ý TƯỞNG', product:'Ý TƯỞNG SẢN PHẨM', news:'KIẾN THỨC' }[type] || 'THÔNG TIN', lead: desc, q: title, im: title };
}

/* ---------- Giao diện ---------- */
const root = document.createElement('div');
root.className = 'kb'; root.id = 'kb'; root.setAttribute('role', 'dialog'); root.setAttribute('aria-modal', 'true'); root.setAttribute('aria-hidden', 'true');
root.innerHTML = '<div class="kb-panel"><div class="kb-bar"><button type="button" id="kb-back">← Quay lại</button><button type="button" id="kb-x" aria-label="Đóng">×</button></div><div id="kb-body"></div></div>';
document.body.appendChild(root);
const $ = s => root.querySelector(s); let stack = [], token = 0;
const ol = a => `<ol class="kb-steps">${a.map(x => `<li>${esc(x)}</li>`).join('')}</ol>`, ul = (a, c = '') => `<ul class="kb-list ${c}">${a.map(x => `<li>${esc(x)}</li>`).join('')}</ul>`;
const gal = ph => `<img class="kb-main" id="kb-main" src="${esc(ph[0].src)}" alt="Ảnh thực tế" onerror="this.style.display='none'"><p class="kb-cap" id="kb-cap">Ảnh: <a href="${esc(ph[0].page)}" target="_blank" rel="noopener">Wikimedia</a> ${esc(ph[0].lic)}</p>${ph.length > 1 ? `<div class="kb-thumbs">${ph.map((p, i) => `<button type="button" data-ph="${i}"><img src="${esc(p.src)}" alt="" loading="lazy" onerror="this.parentNode.remove()"></button>`).join('')}</div>` : ''}`;
function topicHTML(t) {
  return `<div class="kb-gal" id="kb-gal"><div class="kb-ph">${esc(t.ic || '🌿')}<small>Đang tải ảnh thực tế…</small></div></div>
<div class="kb-head"><span class="kb-tag">${esc(t.tag || '')}</span><h2>${esc(t.t)}</h2>${t.meta ? `<p class="kb-meta">⏱ ${esc(t.meta)}</p>` : ''}<p class="kb-lead">${esc(t.lead || '')}</p></div>
${t.local ? `<h3>📋 Hướng dẫn trong dữ liệu của trang</h3><p class="kb-pre">${esc(t.local)}</p>` : ''}
${t.mat ? `<h3>🧰 Chuẩn bị</h3>${ul(t.mat)}` : ''}${t.steps ? `<h3>🪜 Làm từng bước</h3>${ol(t.steps)}` : ''}
${t.tips || t.avoid ? `<div class="kb-two">${t.tips ? `<div><h3>✅ Mẹo hay</h3>${ul(t.tips, 'ok')}</div>` : ''}${t.avoid ? `<div><h3>⚠️ Cần tránh</h3>${ul(t.avoid, 'no')}</div>` : ''}</div>` : ''}
${t.safety ? `<p class="kb-safe">🛡 <b>An toàn:</b> ${esc(t.safety)}</p>` : ''}${t.facts ? `<h3>💡 Biết thêm</h3>${ul(t.facts)}` : ''}
<h3>📚 Kiến thức chuyên sâu (Wikipedia)</h3><div id="kb-wiki" class="kb-load">Đang tải…</div>
${t.rel ? `<h3>🔗 Tra cứu liên quan</h3><div class="kb-chips">${t.rel.map(r => `<button type="button" data-kb-q="${esc(r)}">${esc(r)}</button>`).join('')}</div>` : ''}
<div id="kb-rel"></div><p class="kb-foot">Chưa đủ thông tin? <a href="${GG(t.q || t.t)}" target="_blank" rel="noopener">Tìm trên Google ↗</a> · <a href="${GI(t.q || t.t)}" target="_blank" rel="noopener">Google Hình ảnh ↗</a></p>`;
}
const card = p => `<button type="button" class="kb-card" data-kb-id="${p.pageid}">${p.thumbnail ? `<img src="${esc(p.thumbnail.source)}" alt="" loading="lazy" onerror="this.remove()">` : '<i>📄</i>'}<span><b>${esc(p.title)}</b><small>${esc((p.extract || '').slice(0, 110))}…</small></span></button>`;
const offline = (t) => `Không tải được dữ liệu trực tuyến (cần kết nối Internet tới Wikipedia/Wikimedia). Nội dung biên soạn ở trên vẫn dùng được; bạn có thể <a href="${GG(t)}" target="_blank" rel="noopener">tìm trên Google ↗</a>.`;
async function fillTopic(t, tk) {
  const g = $('#kb-gal'), w = $('#kb-wiki'), r = $('#kb-rel');
  const [ph0, rs] = await Promise.all([photos(t.im || t.q || t.t).catch(() => []), wsearch(t.q || t.t, 6).catch(() => null)]);
  if (tk !== token) return;
  let ph = ph0; if (!ph.length && rs) ph = rs.filter(p => p.thumbnail).slice(0, 4).map(p => ({ src: p.thumbnail.source, page: 'https://vi.wikipedia.org/?curid=' + p.pageid, lic: 'Wikipedia' }));
  g.innerHTML = ph.length ? gal(ph) : `<div class="kb-ph">${esc(t.ic || '🌿')}<small>${rs ? 'Chưa có ảnh phù hợp' : 'Không tải được ảnh'} · <a href="${GI(t.q || t.t)}" target="_blank" rel="noopener">Google Hình ảnh ↗</a></small></div>`;
  g._ph = ph;
  if (!rs) { w.innerHTML = offline(t.q || t.t); return; }
  if (!rs.length) { w.textContent = 'Chưa có bài Wikipedia phù hợp.'; return; }
  const top = rs[0]; w.classList.remove('kb-load');
  w.innerHTML = `<h4>${esc(top.title)}</h4><p>${esc(top.extract || '')}</p><button type="button" class="kb-btn" data-kb-id="${top.pageid}">Đọc tiếp ngay tại đây ↗</button> <a href="https://vi.wikipedia.org/?curid=${top.pageid}" target="_blank" rel="noopener">Mở bài gốc ↗</a>`;
  if (rs.length > 1) r.innerHTML = `<h3>🧭 Bài viết liên quan</h3><div class="kb-cards">${rs.slice(1).map(card).join('')}</div>`;
}
async function fillArticle(id, tk) {
  const a = $('#kb-art'), g = $('#kb-gal'), r = $('#kb-rel');
  let art; try { art = await article(id); } catch { a.innerHTML = offline('Wikipedia'); return; }
  if (tk !== token || !art) return;
  $('#kb-title').textContent = art.title;
  g.innerHTML = art.thumbnail ? gal([{ src: art.thumbnail.source, page: 'https://vi.wikipedia.org/?curid=' + id, lic: 'Wikipedia' }]) : '<div class="kb-ph">📄</div>';
  let txt = (art.extract || '').slice(0, 5200); if ((art.extract || '').length > 5200) txt = txt.slice(0, txt.lastIndexOf('\n') > 2500 ? txt.lastIndexOf('\n') : 5200);
  a.classList.remove('kb-load');
  a.innerHTML = txt.split(/\n+/).filter(Boolean).map(l => l.length < 60 && !/[.:;,]$/.test(l) ? `<h4>${esc(l)}</h4>` : `<p>${esc(l)}</p>`).join('') + `<p class="kb-cap">Nguồn: Wikipedia (CC BY-SA). <a href="https://vi.wikipedia.org/?curid=${id}" target="_blank" rel="noopener">Đọc bài đầy đủ ↗</a></p>`;
  try { const rs = (await wsearch(art.title, 7)).filter(p => String(p.pageid) !== String(id)); if (tk === token && rs.length) r.innerHTML = `<h3>🧭 Bài viết liên quan</h3><div class="kb-cards">${rs.slice(0, 6).map(card).join('')}</div>`; } catch {}
}
function show(v) {
  const tk = ++token, b = $('#kb-body'); $('#kb-back').style.visibility = stack.length > 1 ? 'visible' : 'hidden'; root.querySelector('.kb-panel').scrollTop = 0;
  if (v.type === 'topic') { b.innerHTML = topicHTML(v.t); fillTopic(v.t, tk); }
  else b.innerHTML = `<div class="kb-gal" id="kb-gal"><div class="kb-ph">📄<small>Đang tải…</small></div></div><div class="kb-head"><span class="kb-tag">WIKIPEDIA · ĐỌC TẠI ĐÂY</span><h2 id="kb-title">${esc(v.title || '')}</h2></div><div id="kb-art" class="kb-load">Đang tải bài viết…</div><div id="kb-rel"></div><p class="kb-foot"><a href="${GG(v.title || '')}" target="_blank" rel="noopener">Tìm trên Google ↗</a></p>`, fillArticle(v.id, tk);
}
function go(v, reset) { if (reset) stack = []; stack.push(v); root.classList.add('open'); root.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; show(v); }
const close = () => { root.classList.remove('open'); root.setAttribute('aria-hidden', 'true'); document.body.style.overflow = ''; token++; };
const queryTopic = q => { const l = window.gcLocal ? window.gcLocal(q) : ''; return { t: q, ic: '🔎', tag: 'TRA CỨU', lead: `Ảnh thực tế và kiến thức liên quan đến “${q}”.`, q, im: q, local: /^Chưa/.test(l) ? '' : l }; };
window.gcKB = { openQuery: q => go({ type: 'topic', t: queryTopic(q) }, true), openWiki: (id, title) => go({ type: 'wiki', id, title }, true) };

/* ---------- Gắn vào trang ---------- */
const SEL = '.waste-card,.content-card,.product-card,.guide-card';
function openCard(c) {
  const type = c.dataset.detail || (c.classList.contains('guide-card') ? 'guide' : 'waste'), q = s => (c.querySelector(s) || {}).textContent || '';
  go({ type: 'topic', t: pickTopic(type, q('h3,.waste-info b,.product-info b'), q('p'), q('.waste-visual,.content-visual,.product-visual,.guide-symbol').trim() || '🌿') }, true);
}
document.addEventListener('click', e => {
  const c = e.target.closest(SEL); if (c && !root.contains(c)) { e.preventDefault(); e.stopImmediatePropagation(); openCard(c); return; }
  const q = e.target.closest('[data-kb-q]'); if (q) { e.preventDefault(); e.stopImmediatePropagation(); if (!q.dataset.kbQ.trim()) return; go({ type: 'topic', t: queryTopic(q.dataset.kbQ) }, !root.contains(q)); return; }
  const w = e.target.closest('[data-kb-id]'); if (w) { e.preventDefault(); e.stopImmediatePropagation(); go({ type: 'wiki', id: w.dataset.kbId, title: (w.querySelector('b') || w.closest('article') || w).textContent.slice(0, 80) }, !root.contains(w)); return; }
  const a = e.target.closest('#web-search-results a[href*="curid="]'); if (a) { e.preventDefault(); const id = new URL(a.href).searchParams.get('curid'); go({ type: 'wiki', id, title: (a.closest('article').querySelector('b') || {}).textContent || '' }, true); return; }
  const ph = e.target.closest('[data-ph]'); if (ph && root.contains(ph)) { const p = $('#kb-gal')._ph?.[ph.dataset.ph]; if (p) { $('#kb-main').src = p.src; $('#kb-main').style.display = ''; $('#kb-cap').innerHTML = `Ảnh: <a href="${esc(p.page)}" target="_blank" rel="noopener">Wikimedia</a> ${esc(p.lic)}`; } return; }
  if (e.target.closest('#kb-x') || e.target === root) close();
  if (e.target.closest('#kb-back')) { stack.pop(); show(stack[stack.length - 1]); }
}, true);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && root.classList.contains('open')) close();
  if ((e.key === 'Enter' || e.key === ' ') && e.target.matches && e.target.matches(SEL)) { e.preventDefault(); e.stopImmediatePropagation(); openCard(e.target); }
}, true);
})();
