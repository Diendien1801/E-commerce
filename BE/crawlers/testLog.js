const { addLog, getLogs, clearLogs } = require("../utils/log");
function testlog(crawlerStatus) {
  const fakeLogs = [
    "Cập nhật: DZUNG - DZANCA DZANVU (LIVE IN HOZO) - ĐĨA CD | 450000₫ | Ấn Bản Có Chữ Ký",
    "Cập nhật: CÁ HỒI HOANG - CHÚNG TA ĐỀU MUỐN MỘT THỨ (PAPER PACKAGING) - ĐĨA CD | 0₫ | Ấn Bản Có Chữ Ký",
    "Cập nhật: CÁ HỒI HOANG - TÚI FX - OFFICIAL MERCH | 0₫ | Ấn Bản Có Chữ Ký",
    'Cập nhật: CÁ HỒI HOANG - ÁO THUN "FX" TRẮNG (WHITE) - OFFICIAL MERCH | 0₫ | Ấn Bản Có Chữ Ký',
    "Cập nhật: CÁ HỒI HOANG - VA BUNDLE (+ TẶNG KHẨU TRANG VA) - OFFICIAL MERCH | 0₫ | Ấn Bản Có Chữ Ký",
    'Cập nhật: CÁ HỒI HOANG - ÁO THUN "CÁ HỒI HOANG" - OFFICIAL MERCH | 0₫ | Ấn Bản Có Chữ Ký',
    'Cập nhật: CÁ HỒI HOANG - ÁO THUN "NGÀY ẤY VÀ SAU NÀY" - OFFICIAL MERCH | 0₫ | Ấn Bản Có Chữ Ký',
    "Cập nhật: CÁ HỒI HOANG - NGÀY ẤY VÀ SAU NÀY (∨∧) - ĐĨA CD | 0₫ | Ấn Bản Có Chữ Ký",
    "Cập nhật: CÁ HỒI HOANG - HIỆU ỨNG TRỐN CHẠY F(X) - ĐĨA CD [RESTOCKED] | 0₫ | Ấn Bản Có Chữ Ký",
    'Cập nhật: ISAAC - PHOTOBOOK 2019 "NGÀY KHÔNG EM" (CÓ CHỮ KÝ + ĐĨA CD) | 350000₫ | Ấn Bản Có Chữ Ký',
    "Cập nhật: KAYC - THE ONE (PHYSICAL BONUS TRACK VERSION) - ĐĨA CD | 300000₫ | CD + DVD",
    "Cập nhật: LÂN NHÃ - NHIÊN - ĐĨA CD | 300000₫ | CD + DVD",
    "Cập nhật: HIEUTHUHAI - AI CŨNG PHẢI BẮT ĐẦU TỪ ĐÂU ĐÓ (STANDARD VER.) - ĐĨA CD | 0₫ | CD + DVD",
    'Cập nhật: VY THAO DUONG NGUYEN - "MỘT MÌNH" - ĐĨA CD | 250000₫ | CD + DVD',
    "Cập nhật: AMEE - DREAMEE (REISSUED ON BABY PINK VINYL LP) - ĐĨA THAN | 1200000₫ | CD + DVD",
    "Cập nhật: AMEE - DREAMEE (REISSUED) - BĂNG CASSETTE | 350000₫ | CD + DVD",
    "Cập nhật: LÂN NHÃ - NHÃ (DIGIPAK) - ĐĨA CD | 300000₫ | CD + DVD",
    "Cập nhật: ĐỖ HOÀNG DƯƠNG - NIÊN LUÂN - ĐĨA CD | 300000₫ | CD + DVD",
    "Cập nhật: MÈOW LẠC - SUGAR RUSH (THE 2ND ALBUM) - ĐĨA CD | 300000₫ | CD + DVD",
    "Cập nhật: GIÁNG SON - SING MY SOL - ĐĨA CD | 350000₫ | CD + DVD",
    "Cập nhật: PHẠM QUỲNH ANH - LỜI HỒI ĐÁP 2008 (E.P) - ĐĨA CD | 250000₫ | CD + DVD",
    "Cập nhật: PHẠM HOÀI NAM - TRỊNH JAZZ - ĐĨA CD | 300000₫ | CD + DVD",
    "Cập nhật: HIEUTHUHAI - AI CŨNG PHẢI BẮT ĐẦU TỪ ĐÂU ĐÓ (LIMITED BOXSET) - ĐĨA CD | 0₫ | CD + DVD",
    "Cập nhật: VĂN MAI HƯƠNG X HỨA KIM TUYỀN - MINH TINH (STANDARD) - ĐĨA CD | 300000₫ | CD + DVD",
    "Cập nhật: VĂN MAI HƯƠNG - MINH TINH (LIMITED BOXSET) - ĐĨA CD | 0₫ | CD + DVD",
    "Cập nhật: THIỀU BẢO TRÂM - CHẮC ANH CÓ NỖI KHỔ TÂM (SINGLE) - ĐĨA CD | 180000₫ | CD + DVD",
    "Cập nhật: VĂN MAI HƯƠNG - MƯA THÁNG SÁU (FT. GREY D &TRUNG QUÂN) (SINGLE) - ĐĨA CD | 0₫ | CD + DVD",
    "Cập nhật: BẢO ANH - KHÔNG BIẾT NÊN VUI HAY BUỒN (E.P) - ĐĨA CD | 250000₫ | CD + DVD",
    "Cập nhật: BÁC SĨ MẬP HỒNG - BOKEH (NHOÈ) - ĐĨA CD | 200000₫ | CD + DVD",
    "Cập nhật: DZUNG - DZANCA DZANVU (LIVE IN HOZO) - ĐĨA CD | 450000₫ | CD + DVD",
    "Cập nhật: CÁ HỒI HOANG - CHÚNG TA ĐỀU MUỐN MỘT THỨ (PAPER PACKAGING) - ĐĨA CD | 0₫ | CD + DVD",
    "Cập nhật: HÃNG ĐĨA THỜI ĐẠI - KHUNG TRƯNG BÀY CD (CD MUSIC FRAME) - OFFICIAL MERCH | 0₫ | CD + DVD",
    "Cập nhật: HÃNG ĐĨA THỜI ĐẠI - DÂY ĐEO HÃNG ĐĨA THỜI ĐẠI LANYARD - OFFICIAL MERCH | 80000₫ | CD + DVD",
    "Cập nhật: LÂN NHÃ - NHÃ - ĐĨA THAN 45 VÒNG (BLACK VINYL) - ĐĨA THAN | 1050000₫ | CD + DVD",
    "Cập nhật: THIỀU BẢO TRÂM - 'AFTER YOU' LIMITED PHOTOBOOK) - ĐĨA CD | 500000₫ | CD + DVD",
    "Cập nhật: THIỀU BẢO TRÂM - 'AFTER YOU' (MINI BOXSET) - ĐĨA CD | 280000₫ | CD + DVD",
    "Cập nhật: TRANG - CHỈ CÓ THỂ LÀ ANH - ĐĨA CD | 350000₫ | CD + DVD",
    "Cập nhật: HỨA KIM TUYỀN - COLOURS (THE FIRST ALBUM) - ĐĨA CD | 200000₫ | CD + DVD",
    "Cập nhật: PHÙNG KHÁNH LINH - THE EARLY RECORDINGS - ĐĨA CD | 220000₫ | CD + DVD",
    "Cập nhật: CÁ HỒI HOANG - TÚI FX - OFFICIAL MERCH | 0₫ | CD + DVD",
    "Cập nhật: LÊ CÁT TRỌNG LÝ - CÓ DỪNG ĐƯỢC KHÔNG (TIMES EXCLUSIVE) - ĐĨA CD | 280000₫ | CD + DVD",
    "Cập nhật: LÊ CÁT TRỌNG LÝ - CÂY LẶNG GIÓ NGỪNG (TIMES EXCLUSIVE) - ĐĨA CD | 280000₫ | CD + DVD",
    'Cập nhật: CÁ HỒI HOANG - ÁO THUN "FX" ĐEN (BLACK) - OFFICIAL MERCH | 0₫ | CD + DVD',
    "Cập nhật: PHÙNG KHÁNH LINH - YESTERYEAR (SUPER DELUXE) - ĐĨA CD | 300000₫ | CD + DVD",
    "Cập nhật: LÂN NHÃ - NHÃ (LIMITED GOLDEN CASSETTE TAPE) - BĂNG CASSETTE | 0₫ | CD + DVD",
    "Cập nhật: BỨC TƯỜNG - CON ĐƯỜNG KHÔNG TÊN (1-YEAR ANNIVERSARY BLACK VINYL) - ĐĨA THAN | 1050000₫ | CD + DVD",
    "Cập nhật: CÁ HỒI HOANG - VA BUNDLE (+ TẶNG KHẨU TRANG VA) - OFFICIAL MERCH | 0₫ | CD + DVD",
    "Cập nhật: CÁ HỒI HOANG - MŨ BUCKET VA - OFFICIAL MERCH | 0₫ | CD + DVD",
    "Cập nhật: CÁ HỒI HOANG - DÂY ĐEO VA X 250 LANYARD - OFFICIAL MERCH | 0₫ | CD + DVD",
    'Cập nhật: CÁ HỒI HOANG - ÁO THUN "CÁ HỒI HOANG" - OFFICIAL MERCH | 0₫ | CD + DVD',
    "Cập nhật: PHÙNG KHÁNH LINH - YESTERYEAR - BUNDLE #16 | 0₫ | CD + DVD",
    "Cập nhật: PHÙNG KHÁNH LINH - YESTERYEAR - BUNDLE #15 | 0₫ | CD + DVD",
    "Cập nhật: PHÙNG KHÁNH LINH - YESTERYEAR - BUNDLE #14 | 0₫ | CD + DVD",
    "Cập nhật: PHÙNG KHÁNH LINH - YESTERYEAR (LIMITED DARK GREEN VINYL) - ĐĨA THAN | 0₫ | CD + DVD",
    "Cập nhật: PHÙNG KHÁNH LINH - YESTERYEAR (LIMITED ORANGE CASSETTE TAPE) - BĂNG CASSETTE | 0₫ | CD + DVD",
    "Cập nhật: NGUYÊN HÀ - CHẠY TRỜI SAO KHỎI NẮNG (TIMES EXCLUSIVE) - ĐĨA CD | 300000₫ | CD + DVD",
    "Cập nhật: CÁ HỒI HOANG - NGÀY ẤY VÀ SAU NÀY (∨∧) - ĐĨA CD | 0₫ | CD + DVD",
    "Cập nhật: LÊ CÁT TRỌNG LÝ - HAI NGƯỜI CHẲNG THẤY NHAU (TIMES EXCLUSIVE) - ĐĨA CD | 280000₫ | CD + DVD",
    "Cập nhật: LÊ CÁT TRỌNG LÝ - ĐỪNG MUA NHIỀU NHÀ HƠN MÌNH CẦN (TIMES EXCLUSIVE) - ĐĨA CD | 280000₫ | CD + DVD",
    "Cập nhật: DZUNG - DZANCA - ĐĨA CD | 400000₫ | CD + DVD",
    "✅ Cập nhật: THÁI ĐINH - BÀI HÁT SỐ 8 (STANDARD) - ĐĨA CD | 250000₫ | CD + DVD",
    "✅ Cập nhật: THÁI ĐINH - BÀI HÁT SỐ 8 (LIMITED) - ĐĨA CD | 300000₫ | CD + DVD",
  ];
  let i = 0;
  function nextLog() {
    if (!crawlerStatus.isRunning || i >= fakeLogs.length) return;
    addLog("info", fakeLogs[i], "product");
    i++;
    setTimeout(nextLog, 3000 + Math.random() * 1000); // 3-4s mỗi log
  }
  nextLog();
  // Số liệu giả
  global.crawlerStatus = {
    isRunning: false,
    startTime: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    endTime: new Date().toISOString(),
    progress: 100,
    currentCategory: "",
    totalProducts: 50,
    processedProducts: 50,
    errors: [],
  };
}

module.exports = { testlog };