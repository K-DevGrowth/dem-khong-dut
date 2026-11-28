export const TOTAL_LOOPS = 5;

export const LOOP_ANOMALY_REQ = { 1: 2, 2: 2, 3: 3, 4: 3, 5: 3 };

export const TIMELINE_STEPS = [
  { loop: 1, time: '02:14', short: 'Tiếng gõ ngoài cửa' },
  { loop: 2, time: '23:40?', short: 'Hộp cháo lạnh mốc' },
  { loop: 3, time: '14/11', short: 'Lịch trôi nhiều tuần' },
  { loop: 4, time: '02:08', short: 'Người đứng ngoài mưa' },
  { loop: 5, time: '02:14', short: 'Chốt khóa bên trong' }
];

export const MORAL_CHOICES = {
  1: {
    kicker: 'Trước cửa chính · 02:14',
    title: 'Tiếng gõ sau cánh cửa',
    prompt: 'Ba nhịp gõ trầm đục vang lên giữa màn mưa. Bàn tay bạn dừng lại trên chốt khóa đồng lạnh buốt.',
    a: {
      id: 'open',
      label: 'Tháo chốt, hé cửa nhìn ra ngoài',
      sub: 'Mở một khe nhỏ để xem ai đang đứng ngoài hành lang mưa.',
      chip: 'V1: Hé cửa nhìn',
      journal: 'Cuối Vòng 1: Bạn tháo chốt hé cửa nhìn ra. Ngoài hành lang chỉ còn màn mưa lạnh và một vệt nước loang sâu vào trong nhà.',
      reactSpeaker: 'Steve · Ngưỡng cửa',
      reactText: 'Cánh cửa vừa hé ra, gió mưa tạt thẳng vào mặt... Ngoài kia trống trơn, nhưng bóng dáng vừa khuất sao lại quen đến thế?'
    },
    b: {
      id: 'lock',
      label: 'Gạt chặt chốt khóa thêm một nấc',
      sub: 'Giữ kín cánh cửa, không mở cho ai vào lúc nửa đêm.',
      chip: 'V1: Chốt khóa chặt',
      journal: 'Cuối Vòng 1: Bạn gạt chặt chốt khóa. Tiếng gõ ngoài cửa dội mạnh thêm một nhịp rồi tắt lịm trong tiếng mưa.',
      reactSpeaker: 'Steve · Sau cánh cửa',
      reactText: 'Khóa chặt rồi... Nửa đêm thế này, tốt nhất cứ đóng kín cửa.'
    }
  },
  2: {
    kicker: 'Phòng khách · 02:14',
    title: 'Tờ hóa đơn 23:40',
    prompt: 'Hóa đơn ghi 2 phần cháo nóng lúc 23:40 ngày 14/11, nhưng hộp cháo trong tủ lạnh đã lạnh ngắt và mốc xanh. Trên tay bạn vẫn còn que diêm.',
    a: {
      id: 'keep',
      label: 'Gấp tờ hóa đơn cất vào túi áo',
      sub: 'Mang theo tờ giấy này dù mốc thời gian trên đó chẳng ăn khớp chút nào.',
      chip: 'V2: Giữ hóa đơn',
      journal: 'Cuối Vòng 2: Bạn gấp tờ hóa đơn ngày 14/11 cất vào túi áo. Nếu cháo đã mốc xanh, đêm 14/11 đã trôi qua từ rất lâu rồi.',
      reactSpeaker: 'Steve · Phòng khách',
      reactText: 'Mình giữ lại tờ giấy này... Có điều gì đó ở ngày 14/11 mà mình đã quên mất.'
    },
    b: {
      id: 'burn',
      label: 'Châm lửa đốt tờ hóa đơn',
      sub: 'Bỏ qua mảnh giấy cũ đó để đầu óc đỡ rối bời thêm.',
      chip: 'V2: Đốt hóa đơn',
      journal: 'Cuối Vòng 2: Bạn châm lửa đốt tờ hóa đơn. Mùi giấy cháy quyện với khói diêm làm căn nhà càng thêm ngột ngạt.',
      reactSpeaker: 'Steve · Khói giấy cháy',
      reactText: 'Chắc chỉ là tờ giấy cũ sót lại thôi... Đốt đi cho nhẹ đầu.'
    }
  },
  3: {
    kicker: 'Bàn phòng khách · 02:08',
    title: '4 cuộc gọi nhỡ từ Alice',
    prompt: 'Tờ lịch đã trôi qua nhiều tuần kể từ 14/11. Màn hình điện thoại sáng đỏ với 4 cuộc gọi nhỡ lúc 02:08 của Alice, còn điện thoại bàn ngoài kia lại sắp reo.',
    a: {
      id: 'answer',
      label: 'Tắt chế độ Im lặng, cầm máy chờ nghe',
      sub: 'Để âm lượng mở trở lại giữa căn phòng tĩnh lặng.',
      chip: 'V3: Tắt Im lặng',
      journal: 'Cuối Vòng 3: Bạn gạt tắt chế độ Im lặng trên điện thoại. Màn hình vẫn hiện 4 cuộc gọi nhỡ của Alice từ đêm 14/11.',
      reactSpeaker: 'Steve · Cầm điện thoại',
      reactText: 'Mình tắt Im lặng rồi, Alice... Làm ơn gọi lại đi.'
    },
    b: {
      id: 'poweroff',
      label: 'Tắt nguồn điện thoại, úp mặt xuống bàn',
      sub: 'Đặt chiếc máy trở lại mặt bàn gỗ để màn hình đỏ tắt hẳn.',
      chip: 'V3: Tắt nguồn máy',
      journal: 'Cuối Vòng 3: Bạn nhấn giữ nút nguồn tắt lịm màn hình đỏ và úp điện thoại xuống mặt bàn gỗ.',
      reactSpeaker: 'Steve · Trong bóng tối',
      reactText: 'Đừng sáng nữa... Mình không muốn nhìn thấy bốn dòng chữ đỏ đó nữa.'
    }
  },
  4: {
    kicker: 'Ngưỡng cửa chính · 02:09',
    title: 'Người đứng ngoài mưa',
    prompt: 'Tiếng gõ cửa suốt từ đầu không phải kẻ lạ. Sau cánh cửa gỗ là màn mưa đêm 14/11 — và bóng đen lẩn khuất trong căn nhà đang dừng lại ngay trước mặt bạn.',
    a: {
      id: 'face',
      label: 'Bước sát cửa, gọi tên Alice và mở chốt',
      sub: 'Đặt tay lên tay nắm cửa thêm một lần nữa.',
      chip: 'V4: Mở chốt gọi tên',
      journal: 'Cuối Vòng 4: Bạn bước sát cửa chính, gọi tên Alice và tháo chốt. Bóng đen lặng lẽ lùi vào màn mưa.',
      reactSpeaker: 'Steve · Trước cửa chính',
      reactText: 'Alice... Anh mở cửa đây. Lần này anh không khóa cửa nữa.'
    },
    b: {
      id: 'hide',
      label: 'Lùi vào bóng tối, bịt chặt hai tai',
      sub: 'Quay lưng lại cánh cửa để tiếng gõ không vọng vào nữa.',
      chip: 'V4: Lùi lại bịt tai',
      journal: 'Cuối Vòng 4: Bạn lùi vào góc tối bịt chặt hai tai. Tiếng gõ cửa biến thành tiếng cào gỗ dữ dội khắp căn nhà.',
      reactSpeaker: 'Steve · Run rẩy',
      reactText: 'Mình ngủ quên thôi mà... Đừng gõ nữa!'
    }
  }
};

export const LOOP_STORY = {
  1: {
    clockSub: 'Vòng 1/5 · 02:14 · Tiếng gõ ngoài cửa',
    objective: 'Kiểm tra 2 dấu vết trong nhà & tìm chìa khóa phòng làm việc',
    wakeSpeaker: 'Steve · 02:14',
    wakeText: '02:14 rồi mà Alice vẫn chưa về phòng... Ngoài cửa chính vừa có tiếng gõ rất khẽ. Bấm [F] quẹt diêm, kiểm tra 2 chỗ lạ trong nhà và tìm chìa khóa phòng làm việc xem sao.',
    clueTitle: 'Tờ lịch bàn (Ghi chú khuya)',
    clueSpeaker: 'Mẩu giấy trên bàn',
    clueText: '“Trời mưa khuya lắm rồi. Nếu có tiếng gõ cửa lúc nửa đêm, đừng vội mở — kiểm tra kỹ chốt khóa trước đã.”',
    journal: 'Vòng 1 (02:14): Căn nhà vắng lặng khác thường. Steve nghĩ Alice chỉ ra ngoài mua đồ ăn khuya và cảnh giác với tiếng gõ cửa ngoài hành lang.',
    doorLockedText: 'Chốt cửa vẫn đang cài. Kiểm tra đủ 2 dấu vết trong nhà và xem giấy trên bàn làm việc trước.'
  },
  2: {
    clockSub: 'Vòng 2/5 · Mất điện · Mùi ẩm mốc',
    objective: 'Vào Nhà bếp bật Cầu dao điện & kiểm tra Tủ lạnh đang hở sáng',
    wakeSpeaker: 'Steve · Trong bóng tối',
    wakeText: 'Cầu dao vừa sập tối om... Dưới khe cửa chính có nước mưa thấm vào, còn phía Nhà bếp bên trái đang hắt ra ánh đèn tủ lạnh mờ xanh và chấm đèn đỏ của hộp cầu dao.',
    clueTitle: 'Hóa đơn quán đêm 23:40',
    clueSpeaker: 'Hóa đơn trên bàn làm việc',
    clueText: '“14/11 · 23:40 · 2 phần cháo nóng.” — Khoan đã, nếu mới mua tối nay, tại sao hộp cháo trong tủ lạnh lại lạnh ngắt và đóng váng mốc như để cả tuần rồi?',
    journal: 'Vòng 2: Hóa đơn ghi 23:40 ngày 14/11 với 2 phần cháo nóng, nhưng hộp cháo trong tủ lạnh đã mốc xanh. Thời gian trong căn nhà này có gì đó không khớp.',
    doorLockedText: 'Tay nắm cửa lạnh buốt. Hãy bật cầu dao trong Nhà bếp, kiểm tra tủ lạnh và đọc tờ hóa đơn trên bàn làm việc.'
  },
  3: {
    clockSub: 'Vòng 3/5 · Phòng tắm mờ sương · 02:08',
    objective: 'Khóa vòi nước & soi gương phòng tắm → kiểm tra màn hình điện thoại ngoài phòng khách',
    wakeSpeaker: 'Steve · Trước gương phòng tắm',
    wakeText: 'Khoan đã... sao mình lại đứng trong phòng tắm thế này? Vòi nước đang xả ầm ầm, hơi nước phủ kín mặt gương — và cửa phòng tắm phía sau như bị kẹt chặt rồi!',
    clueTitle: 'Nhật ký cuộc gọi 02:08 & Tờ lịch xé dở',
    clueSpeaker: 'Hồ sơ trên bàn làm việc',
    clueText: '“14/11 · 02:08 — 4 cuộc gọi nhỡ liên tiếp từ Alice (Máy bật Im lặng).” Tờ lịch bàn bị gạch chéo suốt 3 tuần... Không thể nào, chẳng phải mới tối nay sao?',
    journal: 'Vòng 3 (02:08): Steve tỉnh dậy trong phòng tắm mờ sương, rồi phát hiện tờ lịch đã trôi qua 3 tuần kể từ 14/11 và 4 cuộc gọi nhỡ từ Alice khi máy bật Im lặng.',
    doorLockedText: 'Cửa chính chưa thể mở. Hãy kiểm tra điện thoại sáng đỏ ngoài phòng khách rồi vào phòng làm việc.'
  },
  4: {
    clockSub: 'Vòng 4/5 · Màn hình nhiễu hạt · 02:09',
    objective: 'Nghe điện thoại bàn đang réo & tắt màn hình TV nhiễu hạt để mở lối vào phòng làm việc',
    wakeSpeaker: 'Steve · Giữa phòng khách',
    wakeText: 'Tiếng nhiễu TV chói tai quá... Điện thoại bàn cũng đang réo liên hồi. Cửa phòng làm việc phía bên phải bị kẹt cứng — phải tắt chiếc TV và nhấc máy nghe trước đã.',
    clueTitle: 'Bản chép tin nhắn thoại 02:09',
    clueSpeaker: 'Tin nhắn thoại của Alice',
    clueText: '“02:09 — Steve... em gõ cửa mãi không thấy anh ra, điện thoại cũng không bắt máy... Không sao đâu, em tự đi bộ ra đầu hẻm nhé. Chuyện lúc tối, mai mình nói tiếp.”',
    journal: 'Vòng 4 (02:09): Không có kẻ lạ nào cả. Tiếng gõ cửa đáng sợ suốt từ đầu chính là Alice đứng dưới mưa cầu cứu — trước khi cô ấy quay lưng bước vào con hẻm tối.',
    doorLockedText: 'Chưa thể rời đi. Hãy nghe điện thoại bàn, tắt màn hình TV nhiễu rồi đọc bản chép tin nhắn thoại trên bàn làm việc.'
  },
  5: {
    clockSub: 'Vòng 5/5 · 02:14 · Đối diện chốt khóa',
    objective: 'Xem thứ tự 4 màu trên tường & tìm 4 số màu (lật giấy bếp, tủ lạnh, tủ áo, gương tắm) → mở hộp hồ sơ',
    wakeSpeaker: 'Steve · 02:14',
    wakeText: 'Ngoài cửa sổ ánh đèn xanh–đỏ của xe cấp cứu đang chớp liên hồi... Bó hoa cúc trắng đã nằm dưới khung ảnh vỡ. Đã đến lúc mở hộp hồ sơ trên bàn làm việc và đối diện đêm 14/11.',
    clueTitle: 'Giấy báo tử của Alice (02:14)',
    clueSpeaker: 'Sự thật không thể chối bỏ',
    clueText: '“02:14 sáng 14/11 — Alice đã không qua khỏi sau vụ tai nạn ngay đầu con hẻm mưa lớn.” Chốt khóa chưa từng cài từ bên ngoài — chính mình đã tự nhốt mình trong căn nhà này.',
    journal: 'Vòng 5 (02:14): Steve mở hộp hồ sơ, đọc giấy báo tử của Alice và đối diện với Bóng Đen tội lỗi của chính mình trước cánh cửa dẫn ra bình minh.',
    doorLockedText: 'Cần kiểm tra đủ 3 dấu vết cuối và giải khóa mã 4 số trên bàn làm việc trước khi mở cửa chính.'
  },
  anomalyClock: {
    1: { speaker: 'Đồng hồ đầu giường', text: 'Mặt LED cứ giật giữa 02:13 và 02:14. Chắc đồng hồ sắp hết pin rồi...' },
    2: { speaker: 'Đồng hồ đầu giường', text: 'Cả nhà cúp điện tối om, vậy mà mặt số 02:14 vẫn sáng đỏ rực một cách phi lý.' },
    3: { speaker: 'Đồng hồ chạy ngược', text: 'Đồng hồ đang chạy ngược từng phút một — như thể chính căn nhà đang cố quay lại trước lúc 02:08.' },
    4: { speaker: 'Đồng hồ báo lỗi', text: 'Màn hình nhấp nháy giữa “ERR!” và “02:14” — đúng thời khắc chiếc điện thoại bàn réo lên.' },
    5: { speaker: 'Đồng hồ đầu giường · Gợi ý mã', text: 'Bốn chữ số 02:14 sáng rõ trong ánh đèn cấp cứu — cũng là mật mã hộp hồ sơ trong phòng làm việc.' }
  },
  anomalyChair: {
    1: { speaker: 'Ghế ăn bị xô lệch', text: 'Một chiếc ghế ăn bị đẩy lùi vội vã... Chắc lúc tối mình đứng dậy vội quá nên quên đẩy vào.' },
    2: { speaker: 'Ghế ăn dịch chuyển', text: 'Chiếc ghế tự dịch sát cửa phòng ngủ, như có ai đang đứng ngoài hành lang chờ được mở cửa.' },
    3: { speaker: 'Ghế trước TV nhiễu', text: 'Chiếc ghế xoay thẳng về phía màn hình TV nhiễu hạt, mặt ghế phủ một lớp bụi mỏng như đã nhiều tuần không ai ngồi.' },
    4: { speaker: 'Ghế chắn trước cửa', text: 'Chiếc ghế bị kê chặn ngay sau Cửa chính — giống hệt cách Steve đã cố ngăn không cho ai bước vào đêm đó.' },
    5: { speaker: 'Ghế đổ giữa phòng', text: 'Chiếc ghế nằm đổ nghiêng sang một bên, mở lối thẳng ra cánh cửa chính.' }
  },
  anomalyPortrait: {
    1: { speaker: 'Khung ảnh Steve & Alice', text: 'Bức ảnh chụp chung của hai đứa bị treo nghiêng hẳn sang một bên. Gió lùa qua cửa sổ chăng?' },
    2: { speaker: 'Khung ảnh bị cào xước', text: 'Gương mặt trong bức ảnh có những vết cào mờ... nhưng vết cào lại nằm ở phía bên trong mặt kính.' },
    3: { speaker: 'Khung ảnh treo ngược', text: 'Bức ảnh bị lật ngược 180 độ! Lớp bụi dày đóng trên viền khung chứng tỏ chẳng ai lau dọn nhà suốt nhiều tuần.' },
    4: { speaker: 'Khung ảnh rơi vỡ', text: 'Khung ảnh đôi rơi vỡ tan trên sàn, mặt kính nứt cắt ngang giữa Steve và Alice.' },
    5: { speaker: 'Khung ảnh vỡ & Hoa trắng', text: 'Bó hoa cúc trắng lặng lẽ nằm bên khung ảnh vỡ. Đằng sau mặt gỗ hằn vết khắc “14/11”.' }
  },
  anomalyScrawl: {
    2: { speaker: 'Chữ đỏ trên tường', text: 'Trên tường vữa ẩm hiện dòng chữ mờ: “LẠNH QUÁ... sao anh không mở?”' },
    3: { speaker: 'Chữ đỏ trên tường', text: 'Dòng chữ hằn sâu hơn: “02:08 · IM LẶNG — 4 cuộc gọi không ai nghe”.' },
    4: { speaker: 'Chữ đỏ trên tường', text: 'Nét chữ cào rách lớp sơn: “CHỐT KHÓA Ở BÊN TRONG — anh đâu có ngủ quên...”' },
    5: { speaker: 'Chữ đỏ trên tường', text: 'Dòng chữ cuối cùng: “14/11 · 02:14 — mở cửa ra đi, Steve.”' }
  },
  brokenMug: {
    1: { speaker: 'Chiếc cốc vỡ trên sàn', text: 'Mảnh sứ vỡ vương vãi... Kỳ lạ, nước trà quanh đó đã khô cong thành vệt ố nâu từ lâu chứ không phải mới đổ.' },
    2: { speaker: 'Mảnh cốc vỡ khô cong', text: 'Mình cứ nghĩ cốc mới vỡ tối nay, nhưng vết trà đã đóng cặn cứng ngắt. Cuộc cãi vã đó xảy ra từ bao giờ rồi?' }
  },
  rainPuddle: {
    2: { speaker: 'Vũng nước mưa dưới khe cửa', text: 'Nước mưa thấm tràn qua khe cửa chính... Bên ngoài thật sự có ai đó vừa đứng rất lâu dưới mưa.' },
    3: { speaker: 'Vũng nước mưa lạnh buốt', text: 'Dấu giày ướt dừng ngay trước bậc cửa rồi quay ngược trở ra phía con hẻm tối...' }
  },
  windowPass: {
    speaker: 'Ngoài cửa sổ',
    text: 'Vừa có một bóng người ôm áo khoác lướt ngang qua màn mưa ngoài cửa sổ... Là kẻ lạ hay ai?'
  },
  wardrobe1: {
    speaker: 'Tủ quần áo',
    text: 'Áo khoác dày của Alice vẫn treo ở đây... Trời mưa lạnh thế này mà cô ấy lại quên mang áo khoác sao?'
  },
  wardrobe2: {
    speaker: 'Tủ quần áo trống trơn',
    text: 'Chiếc áo khoác biến mất rồi, chỉ còn mùi nước mưa lạnh ngắt phả ra khi cánh tủ sập mạnh!'
  },
  wardrobe3: {
    speaker: 'Vách tủ quần áo',
    text: 'Bên trong vách gỗ hằn vết móng tay cào nguệch ngoạc: “ALICE · 14/11 · 02:14”.'
  },
  mirror1: {
    speaker: 'Gương phòng ngủ',
    text: 'Mắt mình thâm quầng rã rời như đã thức trắng cả tháng trời... Đằng sau vai thoáng thấy một bóng đen đứng im.'
  },
  mirror2: {
    speaker: 'Gương phòng ngủ nứt toác',
    text: 'Mặt gương tự nứt toác! Bóng người trong gương không phải kẻ lạ — mà là chính Steve đang đứng quay lưng với cánh cửa.'
  },
  portraitFall: {
    speaker: 'Tiếng kính vỡ',
    text: 'Khung ảnh chụp chung trên tường phòng khách vừa rơi thẳng xuống sàn vỡ tan!'
  },
  atticStep: {
    speaker: 'Trên trần nhà',
    text: 'Tiếng bước chân đi đi lại lại chậm rãi, đều đặn như ai đó đang sốt ruột chờ được mở cửa.'
  },
  foxOutside: {
    speaker: 'Ngoài con hẻm',
    text: 'Tiếng gió rít và âm thanh khô khốc vọng về từ phía đầu hẻm tối mịt...'
  },
  phoneCall: {
    speaker: 'Điện thoại bàn · Tiếng nhiễu',
    text: '“...Steve... sao anh không mở cửa... em lạnh quá... mưa to lắm rồi... làm ơn...” *tút... tút...*'
  },
  loop3Chase: {
    speaker: 'Steve · Đối diện',
    text: 'Bóng Đen đó không phải quái vật... Nó là tiếng gõ cửa mình đã khóa ngoài đêm 14/11. Mở cửa ra đi!'
  },
  loop3Echo: {
    speaker: 'Tiếng gõ & lời thì thầm',
    text: '“Steve... anh định tự nhốt mình sau cánh cửa đêm 14/11 này đến bao giờ nữa?”'
  },
  kitchenFaucet1: {
    speaker: 'Vòi nước nhà bếp',
    text: 'Vòi nước nhỏ giọt tí tách bên cạnh hai chiếc cốc đã phủ bụi mỏng trong bồn rửa.'
  },
  kitchenFaucet2: {
    speaker: 'Vòi nước tự mở!',
    text: 'Dòng nước lạnh buốt chảy tràn bồn rửa, ồn ào như cơn mưa xối xả ngoài đầu hẻm đêm đó.'
  },
  fridge1: {
    speaker: 'Tủ lạnh hở sáng',
    text: 'Trong tủ lạnh có hai hộp cháo. Mình cứ nghĩ Alice mới mua về... nhưng sờ vào đã lạnh ngắt, mép hộp bắt đầu đóng váng mốc!'
  },
  fridge2: {
    speaker: 'Tủ lạnh lạnh mốc',
    text: 'Hộp cháo đã mốc xanh đóng đá từ nhiều tuần trước! Không thể nào là tối nay được...'
  },
  fridge3: {
    speaker: 'Mẩu giấy đóng băng',
    text: 'Trên khay đá chỉ còn mẩu giấy nhàu nát cứng đờ: “Đừng giả vờ chờ nữa, Steve.”'
  },
  kitchenNote1: {
    title: 'Giấy nhắn trên quầy bếp',
    speaker: 'Giấy nhắn của Alice',
    text: '“Steve, em mua cháo để trong tủ lạnh, anh nhớ hâm lại ăn nha.” — Nhưng góc giấy đã ố vàng và quăn mép.',
    journal: 'Nhà bếp (Vòng 1): Tờ giấy nhắn của Alice trông bình thường, chỉ lạ là mép giấy đã ố vàng như để từ nhiều tuần trước.'
  },
  kitchenNote2: {
    title: 'Giấy nhắn nhòe nước mưa',
    speaker: 'Giấy nhắn trên quầy bếp',
    text: '“Trời mưa to quá, em đứng trước cửa hơi lâu rồi. Đừng khóa cửa ngủ quên nhé Steve.”',
    journal: 'Nhà bếp (Vòng 2–3): Mực trên tờ giấy nhắn nhòe nước mưa lạnh, nhắc về việc cửa bị khóa từ bên trong.'
  },
  kitchenNote3: {
    title: 'Mặt sau tờ giấy nhắn của Steve',
    speaker: 'Nét chữ nguệch ngoạc của Steve',
    text: '“Mình không hề ngủ quên. Lúc đó mình còn thức, nghe rõ tiếng gõ cửa của Alice — nhưng mình vẫn cố tình chốt khóa.”',
    journal: 'Nhà bếp (Vòng 4–5): Mặt sau tờ giấy phơi bày sự thật mà Steve đã tự lừa mình suốt nhiều tuần.'
  },
  bathFaucet1: {
    speaker: 'Vòi nước phòng tắm',
    text: 'Vòi rửa mặt rỉ từng giọt chậm rãi trong căn phòng lát gạch lạnh buốt.'
  },
  bathFaucet2: {
    speaker: 'Vòi nước tự chảy!',
    text: 'Hơi nước bốc mờ phủ kín mặt gương phòng tắm phía trên...'
  },
  bathMirror1: {
    speaker: 'Gương phòng tắm',
    text: 'Mặt gương phủ lớp hơi sương mỏng. Trông mình tiều tụy như người đã nhốt mình trong nhà nhiều tuần liền.'
  },
  bathMirror2: {
    speaker: 'Gương phòng tắm mờ sương!',
    text: 'Trên lớp hơi nước hiện rõ dòng số “02:14” như có ngón tay lạnh cóng vừa viết từ phía bên kia!'
  },
  bathMirror3: {
    speaker: 'Gương phòng tắm nứt dọc',
    text: 'Mặt kính nứt toác cùng dòng chữ: “NGƯỜI NGOÀI CỬA LÀ ALICE — ĐỪNG TRỐN NỮA”.'
  },
  endingKicker: '05:48 Sáng · Ngày 15 Tháng 11',
  endingTitle: 'Bình Minh 15/11',
  endingBody: 'Steve mở khóa bước qua cánh cửa chính vào ánh nắng sớm. Alice thật sự không còn nữa, nhưng lần này Steve đã ngừng tự lừa dối mình để đối diện sự thật và bước tiếp.'
};
