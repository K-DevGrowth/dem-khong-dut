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
        header: 'GIẤY NHẮN CỦA ALICE',
        body: '“Steve, em mua sẵn cháo để trong tủ lạnh, anh nhớ hâm lại ăn tối nha.”',
        note: 'Lạ thật... sao mép tờ giấy nhắn này lại ố vàng và quăn góc như đã để ở đây rất lâu rồi?',
        backHeader: 'MẶT SAU TỜ GIẤY NHẮN',
        backBody: 'Góc dưới có dòng mực mờ đã phai màu: “14/11 · Mua lúc 23:40”.',
        voice: 'Giấy nhắn của Alice: Steve, em mua sẵn cháo để trong tủ lạnh, anh nhớ hâm lại ăn tối nha.'
      };
    }
    if (loopNum <= 3) {
      return {
        theme: 'wet',
        header: 'GIẤY NHẮN NHÒE NƯỚC · 14/11',
        body: '“Trời mưa to quá Steve, em đứng ngoài cửa lâu rồi. Đừng khóa cửa ngủ quên nhé.”',
        note: 'Nét mực loang ra vì nước mưa lạnh. Chờ đã... không phải kẻ lạ gõ cửa sao?',
        backHeader: 'MẶT SAU NHÒE NƯỚC',
        backBody: 'Vết nước mưa thấm xuyên từ mặt trước. Có vài nét gạch vội như ai đó định viết gì rồi dừng lại.',
        voice: 'Giấy nhắn nhòe nước của Alice: Trời mưa to quá Steve, em đứng ngoài cửa lâu rồi. Đừng khóa cửa ngủ quên nhé.'
      };
    }
    const kitchenClue = loopNum === 5 && clues ? clues.kitchen : null;
    return {
      theme: 'scrawl',
      header: 'TỜ GIẤY NHẮN QUẦY BẾP',
      body: '“Mình không hề ngủ quên. Lúc đó mình nghe rõ tiếng gõ cửa của Alice — nhưng vì giận dỗi, mình đã cố tình chốt khóa và bật Im lặng.”',
      note: 'Nét chữ nguệch ngoạc của chính Steve, hằn sâu xuống mặt giấy.',
      backHeader: kitchenClue ? `MẶT SAU · MẢNH MÃ MÀU ${kitchenClue.name.toUpperCase()}` : 'MẶT SAU TỜ GIẤY',
      backClue: kitchenClue,
      backBody: kitchenClue
        ? `Một con số viết đậm bằng mực màu ${kitchenClue.name}. Hãy ghép theo thứ tự 4 màu vẽ trên tường phòng khách.`
        : 'Mặt sau chỉ còn vết hằn đầu bút bi ấn mạnh xuyên qua giấy.',
      voice: 'Mặt sau tờ giấy nhắn: Mình không hề ngủ quên. Lúc đó mình nghe rõ tiếng gõ cửa của Alice, nhưng mình đã cố tình chốt khóa và bật Im lặng.'
    };
  }

  if (kind === 'fridge_note') {
    const fridgeClue = loopNum === 5 && clues ? clues.fridge : null;
    return {
      theme: 'frost',
      header: 'MẨU GIẤY ĐÓNG BĂNG · 02:14',
      body: '“Đừng giả vờ chờ nữa, Steve.”',
      note: 'Nằm cứng đờ cạnh hộp cháo đã mốc xanh. Đêm 14/11 đã qua từ nhiều tuần trước.',
      backHeader: fridgeClue ? `MẶT SAU · MẢNH MÃ MÀU ${fridgeClue.name.toUpperCase()}` : 'MẶT SAU MẨU GIẤY',
      backClue: fridgeClue,
      backBody: fridgeClue
        ? `Dưới lớp sương đá mặt sau hiện rõ chữ số viết bằng mực màu ${fridgeClue.name}.`
        : 'Mặt sau đóng một lớp băng mỏng lạnh buốt tay.',
      voice: 'Mẩu giấy đóng băng trong tủ lạnh: Đừng giả vờ chờ nữa, Steve.'
    };
  }

  // Option A: Unreliable Narrator progression (Loop 1 -> Loop 5)
  if (loopNum === 1) {
    return {
      theme: 'calendar',
      header: 'GHI CHÚ BÀN LÀM VIỆC · 02:14',
      body: '“Hẻm tối và mưa lớn lắm. Nếu nửa đêm có tiếng gõ cửa lạ, khoan hãy mở — kiểm tra kỹ chốt khóa trước đã.”',
      note: 'Mình viết dòng này lúc nào nhỉ? Nhưng tiếng gõ ngoài cửa chính vẫn đang vang lên... Ra kiểm tra cửa chính xem sao.',
      backHeader: 'MẶT SAU TỜ LỊCH',
      backBody: 'Một góc lịch cũ in mờ dòng chữ “Tháng 11”. Phần ngày bị ai đó xé nham nhở.',
      voice: 'Ghi chú trên bàn làm việc: Hẻm tối và mưa lớn lắm. Nếu nửa đêm có tiếng gõ cửa lạ, khoan hãy mở, kiểm tra kỹ chốt khóa trước đã.'
    };
  }
  if (loopNum === 2) {
    return {
      theme: 'sticky',
      header: '23:40 · HÓA ĐƠN QUÁN ĐÊM (14/11)',
      body: '2 phần cháo nóng mang về.\n\n“Steve, trời mưa rồi, em ghé mua cháo về cho anh ăn tối.” — Alice',
      note: 'Khoan đã... Hóa đơn ghi 14/11, nhưng hộp cháo trong tủ lạnh đã lạnh ngắt và mốc xanh từ lâu! Hôm nay thật sự là ngày mấy?',
      backHeader: 'MẶT SAU HÓA ĐƠN',
      backBody: 'Vết dầu loang và dấu gấp nhàu nát — tờ hóa đơn này đã bị cất trong túi áo rất lâu.',
      voice: 'Hóa đơn quán đêm ngày 14 tháng 11 lúc 23 giờ 40: Hai phần cháo nóng mang về. Khoan đã, nếu mới mua tối nay, sao hộp cháo trong tủ lạnh đã mốc xanh?'
    };
  }
  if (loopNum === 3) {
    return {
      theme: 'report',
      header: '02:08 · NHẬT KÝ CUỘC GỌI & TỜ LỊCH XÉ DỞ',
      body: '02:05 — Cuộc gọi nhỡ: Alice\n02:06 — Cuộc gọi nhỡ: Alice\n02:07 — Cuộc gọi nhỡ: Alice\n02:08 — Cuộc gọi nhỡ: Alice (Chế độ Im lặng)\n\n[Lịch bàn bị gạch chéo suốt 3 tuần kể từ 14/11]',
      note: 'Không phải kẻ lạ... Đêm 14/11 đã trôi qua 3 tuần rồi! Người gọi 4 cuộc liên tiếp trong mưa là Alice — còn máy mình lại bật Im lặng.',
      backHeader: 'MẶT SAU NHẬT KÝ',
      backBody: 'Dòng chữ gạch lặp đi lặp lại bằng bút đỏ: “Đừng nghe máy. Đừng mở cửa. Đừng nhìn đồng hồ.”',
      voice: '02 giờ 08, nhật ký cuộc gọi nhỡ: Bốn cuộc gọi liên tiếp từ Alice khi điện thoại đang bật Im lặng. Tờ lịch bàn đã bị gạch chéo suốt ba tuần kể từ ngày 14 tháng 11.'
    };
  }
  if (loopNum === 4) {
    return {
      theme: 'wet',
      header: '02:09 · TIN NHẮN THOẠI CỦA ALICE',
      body: '“Steve... anh bảo cứ gọi mà... Em đứng gõ cửa mãi mà không thấy anh ra, điện thoại cũng không bắt máy... Chắc anh ngủ say rồi hả. Không sao đâu, em tự đi qua đầu hẻm được. Chuyện lúc tối, mai mình nói tiếp nha. Anh ngủ ngon.”',
      note: 'Tiếng gõ cửa đáng sợ mà mình cố khóa lại suốt bấy lâu nay... hóa ra chính là Alice đứng ngoài trời mưa cầu cứu.',
      backHeader: 'MẶT SAU BẢN CHÉP',
      backBody: '“Đêm 14/11 · 02:09 — Thời lượng: 00:34 · Chưa từng bấm nghe trọn vẹn.”',
      voice: '02 giờ 09, tin nhắn thoại của Alice: Steve, em đứng gõ cửa mãi không thấy anh ra. Không sao đâu, em tự đi qua đầu hẻm được. Chuyện lúc tối, mai mình nói tiếp nha. Anh ngủ ngon.'
    };
  }
  return {
    theme: 'certificate',
    header: 'GIẤY BÁO TỬ · ALICE',
    subHeader: '14 THÁNG 11 · 02:14 SÁNG',
    body: 'Alice đã không qua khỏi sau vụ tai nạn ngay đầu con hẻm tối trong đêm mưa 14/11 — chỉ 5 phút sau khi rời khỏi bậc cửa căn nhà này.',
    note: 'Chốt cửa chưa từng khóa từ bên ngoài... Nỗi ám ảnh chính là ký ức mình đang cố nhốt lại. Ngoài kia trời sắp sáng rồi.',
    backHeader: 'MẶT SAU HỒ SƠ',
    backBody: '“Không có kẻ lạ nào ngoài cửa cả. Mở chốt khóa và bước ra khỏi đêm 14/11.”',
    voice: 'Giấy báo tử của Alice, ngày 14 tháng 11 lúc 02 giờ 14 sáng: Alice đã không qua khỏi sau vụ tai nạn ngay đầu con hẻm. Chốt cửa chưa từng khóa từ bên ngoài.'
  };
}
