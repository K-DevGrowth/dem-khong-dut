export function wrapCanvasText(ctx, text, x, y, maxWidth, lineHeight) {
  const paragraphs = text.split('\n');
  let curY = y;
  for (let p = 0; p < paragraphs.length; p++) {
    const para = paragraphs[p];
    if (!para.trim()) {
      curY += lineHeight * 0.65;
      continue;
    }
    const words = para.split(' ');
    let line = '';
    for (let n = 0; n < words.length; n++) {
      const testLine = line ? `${line} ${words[n]}` : words[n];
      if (ctx.measureText(testLine).width > maxWidth && line) {
        ctx.fillText(line, x, curY);
        line = words[n];
        curY += lineHeight;
      } else {
        line = testLine;
      }
    }
    if (line) {
      ctx.fillText(line, x, curY);
      curY += lineHeight;
    }
  }
  return curY;
}

export function getHeldPaperContent(kind, loopNum, state = null) {
  const clues = state && state.puzzleClues ? state.puzzleClues : null;

  if (kind === 'kitchen_note') {
    if (loopNum === 1) {
      return {
        theme: 'sticky',
        header: 'GIẤY NHẮN · QUẦY BẾP',
        body: 'David,\nCơm để ngăn mát. Về trễ nhớ chốt cửa sau.\n— A.',
        note: 'Mép giấy ố vàng. Mực hơi nhòe.',
        backHeader: 'MẶT SAU',
        backBody: 'Bút chì ghi vội góc dưới:\n“Thợ khóa: 09xx... — sáng 12/11”',
        voice: 'David, cơm để ngăn mát. Về trễ nhớ chốt cửa sau.'
      };
    }
    if (loopNum <= 3) {
      return {
        theme: 'wet',
        header: 'MẨU GIẤY ƯỚT · 13/11',
        body: 'David ơi,\nAnh đi công tác đừng lo. Nhưng 2 đêm nay lại có bóng đứng ngoài cửa sổ phòng khách... nhìn thẳng vào.\n— Alice',
        note: 'Ướt lạnh. Góc phải bị xé mất.',
        backHeader: 'MẶT SAU',
        backBody: 'Gạch đè nhiều nét:\n“Cửa sau ~~đã khóa~~ hở chốt.”',
        voice: '13 tháng 11. Hai đêm nay lại có bóng đứng ngoài cửa sổ phòng khách.'
      };
    }
    const kitchenClue = loopNum === 5 && clues ? clues.kitchen : null;
    return {
      theme: 'scrawl',
      header: 'GIẤY VÒ NÁT',
      body: 'Khóa cửa chính.\nTắt đèn.\nNgồi im trong phòng ngủ.\nNgoài kia gõ kệ ngoài kia.\nĐừng trả lời.',
      note: 'Bút bi ấn rách mặt giấy.',
      backHeader: kitchenClue ? `MẶT SAU · MÀU ${kitchenClue.name.toUpperCase()}` : 'MẶT SAU',
      backClue: kitchenClue,
      backBody: kitchenClue
        ? `Chữ số mực ${kitchenClue.name}. Ghép theo thứ tự 4 màu trên tường.`
        : 'Vết mực hằn xuyên sang mặt sau.',
      voice: 'Khóa cửa chính. Tắt đèn. Ngồi im. Đừng trả lời.'
    };
  }

  if (kind === 'fridge_note') {
    const fridgeClue = loopNum === 5 && clues ? clues.fridge : null;
    return {
      theme: 'frost',
      header: '02:14',
      body: 'KHÔNG CÓ CHÌA KHÓA.',
      note: 'Đóng đá cạnh hộp cơm ngày 14/11.',
      backHeader: fridgeClue ? `MẶT SAU · MÀU ${fridgeClue.name.toUpperCase()}` : 'MẶT SAU',
      backClue: fridgeClue,
      backBody: fridgeClue
        ? `Số mực ${fridgeClue.name} dưới lớp băng mỏng.`
        : 'Phủ lớp đá mỏng.',
      voice: 'Không có chìa khóa.'
    };
  }

  if (loopNum === 1) {
    return {
      theme: 'calendar',
      header: 'MẨU GIẤY XÉ · BÀN LÀM VIỆC',
      body: 'Hẻm tối. Mưa to.\nNửa đêm có tiếng gõ — kiểm tra chốt trước.\nĐừng mở.',
      note: 'Nét chữ khác hẳn tờ giấy ngoài bếp.',
      backHeader: 'MẶT SAU (HÓA ĐƠN CŨ)',
      backBody: 'Hóa đơn điện lực in mờ:\nChủ hộ: DAVID TRAN\nĐịa chỉ: Số 14, hẻm cuối.',
      voice: 'Nửa đêm có tiếng gõ, kiểm tra chốt trước. Đừng mở.'
    };
  }
  if (loopNum === 2) {
    return {
      theme: 'sticky',
      header: 'PHIẾU SỬA KHÓA · 12/11',
      body: 'Đ/c: Số 14 (Alice)\nHạng mục: Thay ổ cửa chính + chốt cửa sau.\nBàn giao: 02 chìa (Alice / David).\nGhi chú: Khách báo có người theo dõi ngoài cửa sổ.',
      note: 'Mực ướt ở góc dưới.',
      backHeader: 'MẶT SAU',
      backBody: 'Dấu đỏ đóng mờ:\n“ĐÃ THU TIỀN — KHÔNG CẮT THÊM CHÌA”.',
      voice: 'Phiếu sửa khóa 12 tháng 11. Bàn giao hai chìa cho Alice và David.'
    };
  }
  if (loopNum === 3) {
    return {
      theme: 'report',
      header: 'LỊCH THÁNG 11 (RÁCH NỬA)',
      body: '12/11 — Thay khóa\n13/11 — David công tác (4 ngày)\n14/11 — [KHOANH ĐỎ] 02:08 · 113\n\n15/11 → 05/12: [GẠCH CHÉO DÀY ĐẶC]',
      note: 'Bút đỏ đè nhiều lần lên ô 14/11.',
      backHeader: 'MẶT SAU',
      backBody: 'Viết lặp kín trang:\n“Đừng soi gương.\nĐừng mở cửa.\nĐừng soi gương.”',
      voice: '13 tháng 11, David công tác 4 ngày. 14 tháng 11, 02 giờ 08, 113.'
    };
  }
  if (loopNum === 4) {
    return {
      theme: 'wet',
      header: 'TRÍCH BĂNG 113 · 14/11',
      body: '[02:08:11] TĐ: 113 xin nghe.\n[02:08:15] Alice: Số 14... nhanh lên... cửa sau mở rồi...\n[02:08:29] Alice: Hắn không ở ngoài cửa sổ nữa... hắn trong phòng ngủ—\n[02:08:42] [TIẾNG CHỐT CỬA · MẤT TÍN HIỆU]',
      note: 'Phần dưới bị thấm nước, mờ mất 2 dòng.',
      backHeader: 'MẶT SAU · NHẬT KÝ CA TRỰC',
      backBody: '02:14 — Tổ tuần tra tới số 14.\nGõ cửa chính 3 lần.\nTrong nhà tắt đèn. Chốt cài chặt.',
      voice: '02 giờ 08. Hắn không ở ngoài cửa sổ nữa. Hắn trong phòng ngủ.'
    };
  }
  return {
    theme: 'certificate',
    header: 'BIÊN BẢN HIỆN TRƯỜNG · SỐ 14',
    subHeader: '14/11 · 02:14',
    body: 'Tin báo 113 lúc 02:08. Tuần tra tiếp cận 02:14.\nCửa chính chốt trong, ghế gỗ chèn tay nắm.\nKhi phá chốt: không có chủ hộ D. Tran.\n01 nam giới không giấy tờ ngồi im cạnh giường, khai mình là chủ nhà.',
    note: 'Góc phải đóng dấu: LƯU HỒ SƠ.',
    backHeader: 'MẶT SAU',
    backBody: 'Nét bút chì mờ:\n“02:14 · Cửa mở rồi.”',
    voice: 'Biên bản số 14, 02 giờ 14. Không có chủ hộ D. Tran. Một nam giới không giấy tờ ngồi cạnh giường.'
  };
}
