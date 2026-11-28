export const TOTAL_LOOPS = 5;

export const LOOP_ANOMALY_REQ = { 1: 2, 2: 2, 3: 3, 4: 3, 5: 3 };

export const TIMELINE_STEPS = [
  { loop: 1, time: '02:14', short: 'Ba nhịp gõ' },
  { loop: 2, time: '12/11', short: 'Ổ khóa mới' },
  { loop: 3, time: '02:08', short: 'Cuộc gọi 113' },
  { loop: 4, time: '02:09', short: 'Băng ghi âm' },
  { loop: 5, time: '02:14', short: 'Số 14' }
];

export const MORAL_CHOICES = {
  1: {
    kicker: 'Cửa chính · 02:14',
    title: 'Ba nhịp gõ',
    prompt: 'Gỗ cửa rung nhẹ. Tay bạn đang đặt trên chốt đồng lạnh ngắt.',
    a: {
      id: 'peek',
      label: 'Tháo chốt, hé khe cửa',
      sub: 'Nhìn ra hành lang mưa.',
      chip: 'V1: Hé cửa',
      journal: '02:14 — Hé cửa chính. Hành lang trống. Một vệt nước loang sát bậc thềm.',
      reactSpeaker: 'Ngưỡng cửa',
      reactText: 'Trống trơn. Chỉ có mưa... và tiếng còi rất xa.'
    },
    b: {
      id: 'bolt',
      label: 'Gạt chặt chốt trên',
      sub: 'Khóa kín lại.',
      chip: 'V1: Gạt chốt',
      journal: '02:14 — Gạt chặt chốt trên. Tiếng gõ thêm một nhịp rồi im.',
      reactSpeaker: 'Sau cửa',
      reactText: 'Khóa rồi. Im đi.'
    }
  },
  2: {
    kicker: 'Phòng khách · 12/11',
    title: 'Hóa đơn thợ khóa',
    prompt: 'Chỉ giao 2 chìa: Alice & David. Túi áo bạn không có chìa cửa chính.',
    a: {
      id: 'keep_receipt',
      label: 'Gấp lại, cất vào túi áo',
      sub: 'Giữ tờ hóa đơn.',
      chip: 'V2: Giữ hóa đơn',
      journal: '12/11 — Hóa đơn thay khóa (2 chìa: Alice & David). Đã giữ lại.',
      reactSpeaker: 'Phòng khách',
      reactText: 'David... tên ai?'
    },
    b: {
      id: 'burn_receipt',
      label: 'Châm diêm đốt tờ giấy',
      sub: 'Đốt ngay tại chỗ.',
      chip: 'V2: Đốt hóa đơn',
      journal: '12/11 — Đốt tờ hóa đơn thay khóa. Giấy cháy hết, mùi ẩm vẫn còn.',
      reactSpeaker: 'Khói giấy',
      reactText: 'Giấy chủ cũ thôi. Đốt đi.'
    }
  },
  3: {
    kicker: 'Phòng khách · 02:08',
    title: 'Cuộc gọi đi · 113',
    prompt: 'Màn hình đỏ: 113 — 02:08 — 00:31. Tin nhắn viết dở vẫn nhấp nháy.',
    a: {
      id: 'keep_on',
      label: 'Để nguyên màn hình sáng',
      sub: 'Không chạm vào nút nguồn.',
      chip: 'V3: Giữ máy mở',
      journal: '02:08 — Điện thoại gọi đi 113 (31 giây). Để nguyên màn hình sáng.',
      reactSpeaker: 'Bàn gỗ',
      reactText: '02:08... “hắn đang ở trong—”'
    },
    b: {
      id: 'turn_off',
      label: 'Tắt nguồn, úp máy xuống bàn',
      sub: 'Ngắt màn hình đỏ.',
      chip: 'V3: Tắt máy',
      journal: '02:08 — Tắt nguồn điện thoại, úp mặt xuống bàn.',
      reactSpeaker: 'Trong tối',
      reactText: 'Nhầm máy. Tắt đi.'
    }
  },
  4: {
    kicker: 'Cửa chính · 02:09',
    title: 'Ánh đèn ngoài khe cửa',
    prompt: 'Đèn xanh–đỏ chớp qua khe gỗ. Sau lưng có tiếng thở lạnh sát gáy.',
    a: {
      id: 'admit',
      label: 'Đặt tay lên chốt, mở cửa',
      sub: 'Không lùi nữa.',
      chip: 'V4: Mở chốt',
      journal: '02:09 — Băng 113 kết thúc. Đặt tay lên chốt cửa chính.',
      reactSpeaker: 'Cửa chính',
      reactText: 'Chốt cửa... mở ra.'
    },
    b: {
      id: 'deny',
      label: 'Lùi vào hành lang, giữ chốt',
      sub: 'Đóng chặt cửa.',
      chip: 'V4: Giữ chốt',
      journal: '02:09 — Lùi lại vào hành lang tối. Tiếng gõ mạnh hơn.',
      reactSpeaker: 'Hành lang',
      reactText: 'Nhà mình mà... đừng vào!'
    }
  }
};

export const LOOP_STORY = {
  1: {
    clockSub: 'Vòng 1/5 · 02:14',
    objective: 'Kiểm tra 2 chỗ lạ trong nhà & tìm chìa phòng làm việc',
    wakeSpeaker: '02:14',
    wakeText: 'Ba nhịp gõ ngoài cửa chính. Bấm [F] quẹt diêm.',
    clueTitle: 'Mẩu giấy bàn làm việc',
    clueSpeaker: 'Trên bàn',
    clueText: '“Nửa đêm có tiếng gõ — kiểm tra chốt. Đừng trả lời.”',
    journal: 'Vòng 1 (02:14): Ba nhịp gõ cửa chính. Mẩu giấy bàn làm việc nhắc kiểm tra chốt.',
    doorLockedText: 'Chốt còn cài. Xem 2 dấu vết và mẩu giấy phòng làm việc trước.'
  },
  2: {
    clockSub: 'Vòng 2/5 · Mất điện',
    objective: 'Vào Nhà bếp bật Cầu dao & kiểm tra Tủ lạnh hở sáng',
    wakeSpeaker: 'Cúp điện',
    wakeText: 'Cầu dao sập. Phía bếp có ánh sáng tủ lạnh hở.',
    clueTitle: 'Hóa đơn sửa khóa · 12/11',
    clueSpeaker: 'Hóa đơn',
    clueText: '“12/11 · Thay khóa số 14 — Alice. Giao 2 chìa.”',
    journal: 'Vòng 2 (12/11): Hóa đơn thay khóa số 14. Chỉ giao 2 chìa: Alice & David.',
    doorLockedText: 'Cửa lạnh ngắt. Bật cầu dao trong bếp, xem tủ lạnh và bàn làm việc.'
  },
  3: {
    clockSub: 'Vòng 3/5 · 02:08',
    objective: 'Khóa vòi nước & soi gương tắm → xem điện thoại phòng khách',
    wakeSpeaker: 'Phòng tắm',
    wakeText: 'Vòi nước đang xả. Cửa sau lưng bị kẹt.',
    clueTitle: 'Lịch tháng 11 (xé dở)',
    clueSpeaker: 'Tờ lịch',
    clueText: '“13/11: David đi công tác 4 ngày. 14/11: 02:08 — 113.”',
    journal: 'Vòng 3 (02:08): Lịch ghi David đi công tác từ 13/11. Điện thoại gọi 113 lúc 02:08.',
    doorLockedText: 'Cửa chưa mở. Xem điện thoại phòng khách rồi vào phòng làm việc.'
  },
  4: {
    clockSub: 'Vòng 4/5 · 02:09',
    objective: 'Nghe điện thoại bàn & tắt TV nhiễu để vào phòng làm việc',
    wakeSpeaker: 'Phòng khách',
    wakeText: 'TV nhiễu trắng. Điện thoại bàn đang réo.',
    clueTitle: 'Băng chép 113 · 02:08',
    clueSpeaker: 'Bản chép',
    clueText: '“[02:08:29] Alice: Hắn không ở ngoài nữa... trong phòng ngủ—”',
    journal: 'Vòng 4 (02:09): Băng 113 ghi tín hiệu ngắt lúc 02:08:42. Tuần tra tới lúc 02:14.',
    doorLockedText: 'Nghe điện thoại bàn, tắt TV rồi xem bản chép phòng làm việc.'
  },
  5: {
    clockSub: 'Vòng 5/5 · 02:14',
    objective: 'Xem thứ tự 4 màu trên tường & tìm 4 số (lật giấy bếp, tủ lạnh, tủ áo, gương tắm)',
    wakeSpeaker: '02:14',
    wakeText: 'Đèn xanh–đỏ chớp ngoài kính. Mở hộp hồ sơ.',
    clueTitle: 'Biên bản · Số 14 · 02:14',
    clueSpeaker: 'Biên bản',
    clueText: '“02:14 · Cửa chốt trong. Người ngồi bên giường không phải D. Tran.”',
    journal: 'Vòng 5 (02:14): Biên bản số 14 — Cửa chốt từ bên trong. Không có chủ hộ D. Tran.',
    doorLockedText: 'Tìm đủ 4 số màu và mở hộp hồ sơ trên bàn làm việc trước.'
  },
  anomalyClock: {
    1: { speaker: 'Đồng hồ', text: '02:13... giật sang 02:14. Đứng im.' },
    2: { speaker: 'Đồng hồ', text: 'Mất điện rồi. Mặt số vẫn đỏ 02:14.' },
    3: { speaker: 'Đồng hồ', text: 'Số đang chạy ngược về 02:08.' },
    4: { speaker: 'Đồng hồ', text: 'Nhấp nháy: “ERR!” — “02:14”.' },
    5: { speaker: 'Đồng hồ', text: '02:14. Đèn xanh–đỏ hắt qua rèm.' }
  },
  anomalyChair: {
    1: { speaker: 'Ghế ăn', text: 'Xô lệch. Như ai vừa bật dậy.' },
    2: { speaker: 'Ghế ăn', text: 'Kê sát hành lang, quay thẳng vào phòng ngủ.' },
    3: { speaker: 'Ghế gỗ', text: 'Đóng lớp bụi mỏng. Lâu rồi không ai ngồi.' },
    4: { speaker: 'Ghế gỗ', text: 'Chèn ngược dưới tay nắm cửa chính.' },
    5: { speaker: 'Ghế đổ', text: 'Đổ ngang sàn. Lối ra đã trống.' }
  },
  anomalyPortrait: {
    1: { speaker: 'Khung ảnh', text: 'Ảnh hai người. Treo lệch hẳn sang trái.' },
    2: { speaker: 'Khung ảnh', text: 'Mặt người đàn ông bị cào nát. Từ bên trong kính.' },
    3: { speaker: 'Khung ảnh', text: 'Treo ngược. Sau khung ghi: “Alice & David · 2024”.' },
    4: { speaker: 'Kính vỡ', text: 'Vỡ tan trên sàn. Còn nguyên mặt Alice.' },
    5: { speaker: 'Hoa trắng', text: 'Bó hoa trắng nằm cạnh mảnh kính.' }
  },
  anomalyScrawl: {
    2: { speaker: 'Tường', text: '“KHÔNG PHẢI NHÀ ANH”' },
    3: { speaker: 'Tường', text: '“02:08 — 113 — ĐANG Ở TRONG”' },
    4: { speaker: 'Tường', text: '“NHÌN GƯƠNG ĐI”' },
    5: { speaker: '4 vòng màu', text: 'Bốn chấm màu vẽ vội trên tường.' }
  },
  brokenMug: {
    1: { speaker: 'Cốc vỡ', text: 'Vết trà đã khô cứng thành cặn.' },
    2: { speaker: 'Cốc vỡ', text: 'Không phải mới vỡ tối nay.' }
  },
  rainPuddle: {
    2: { speaker: 'Sàn ướt', text: 'Dấu giày bùn đi vào. Không có dấu đi ra.' },
    3: { speaker: 'Sàn ướt', text: 'Vệt bùn từ cửa sau dừng ngay phòng ngủ.' }
  },
  windowPass: {
    speaker: 'Cửa sổ',
    text: 'Bóng ai đó sát mặt kính... biến mất rồi.'
  },
  wardrobe1: {
    speaker: 'Tủ áo',
    text: 'Áo khoác quá rộng. Mác cổ: “D. Tran”.'
  },
  wardrobe2: {
    speaker: 'Tủ áo',
    text: 'Áo biến mất. Cánh tủ tự sập!'
  },
  wardrobe3: {
    speaker: 'Vách tủ',
    text: 'Vết móng cào sâu: “ALICE · 14/11 · 02:14”.'
  },
  mirror1: {
    speaker: 'Gương',
    text: 'Kính mờ. Sau lưng... không giống phòng mình.'
  },
  mirror2: {
    speaker: 'Gương nứt',
    text: 'Kính nứt dọc. Mặt trong gương... không phải ảnh kia.'
  },
  portraitFall: {
    speaker: 'Phòng khách',
    text: 'Tiếng kính vỡ ngoài phòng khách.'
  },
  atticStep: {
    speaker: 'Trần nhà',
    text: 'Tiếng bước chân chậm phía trên.'
  },
  foxOutside: {
    speaker: 'Ngoài hẻm',
    text: 'Gió rít khô khốc đầu hẻm.'
  },
  phoneCall: {
    speaker: '113 · 02:08',
    text: '“...số 14... cửa sau mở rồi... hắn đang ở trong—” *tút...*'
  },
  loop3Chase: {
    speaker: '02:14',
    text: 'Chốt bung rồi. Chạy ra cửa chính!'
  },
  loop3Echo: {
    speaker: 'Sau gáy',
    text: '“Anh là ai?”'
  },
  kitchenFaucet1: {
    speaker: 'Vòi bếp',
    text: 'Nước nhỏ giọt vào hai cốc đóng bụi.'
  },
  kitchenFaucet2: {
    speaker: 'Vòi bếp',
    text: 'Nước tự xả ào ào.'
  },
  fridge1: {
    speaker: 'Tủ lạnh',
    text: 'Hai hộp cơm mốc xanh. Tem ngày: 14/11.'
  },
  fridge2: {
    speaker: 'Tủ lạnh',
    text: 'Lạnh ngắt. Hạn dùng đã quá ba tuần.'
  },
  fridge3: {
    speaker: 'Khay đá',
    text: 'Mẩu giấy cứng đờ dính lớp băng.'
  },
  kitchenNote1: {
    title: 'Giấy nhắn bếp',
    speaker: 'Quầy bếp',
    text: '“David — cơm trong tủ. Nhớ chốt cửa sau.”',
    journal: 'Bếp (V1): Giấy nhắn gửi “David”.'
  },
  kitchenNote2: {
    title: 'Giấy nhòe nước · 13/11',
    speaker: 'Quầy bếp',
    text: '“David... hai đêm nay có người đứng ngoài cửa sổ...”',
    journal: 'Bếp (V2–3): Giấy 13/11, ký tên Alice. Nhắc bóng người ngoài cửa sổ.'
  },
  kitchenNote3: {
    title: 'Giấy vò nát',
    speaker: 'Quầy bếp',
    text: '“Chốt cửa. Tắt đèn. Ngồi im. Đừng trả lời.”',
    journal: 'Bếp (V4–5): Tờ giấy vò nát, nét chữ ấn rách giấy.'
  },
  bathFaucet1: {
    speaker: 'Vòi tắm',
    text: 'Giọt nước rỉ đều. Lạnh buốt.'
  },
  bathFaucet2: {
    speaker: 'Vòi tắm',
    text: 'Hơi nước phủ trắng mặt gương.'
  },
  bathMirror1: {
    speaker: 'Gương tắm',
    text: 'Mờ đặc. Một bóng người đứng sau.'
  },
  bathMirror2: {
    speaker: 'Gương tắm',
    text: 'Ngón tay vạch trên hơi nước: “02:14”.'
  },
  bathMirror3: {
    speaker: 'Gương nứt',
    text: '“ĐÂY KHÔNG PHẢI NHÀ ANH · ANH LÀ AI?”'
  },
  endingKicker: '15/11 · 05:48',
  endingTitle: 'Số 14',
  endingBody: 'Cửa chính mở. Mưa tạt vào mặt.'
};
