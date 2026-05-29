/**
 * Health Tips Data Store
 * Dữ liệu mẹo sức khỏe hardcode bằng tiếng Việt.
 * Cấu trúc tương thích với HealthMetric và HealthProfile trong Prisma schema.
 */

export const categoryNames = {
  sleep: "Giấc ngủ",
  heart: "Tim mạch",
  nutrition: "Dinh dưỡng",
  exercise: "Vận động",
  stress: "Căng thẳng",
  general: "Tổng quát",
};

export const healthTips = [
  // ===== SLEEP =====
  {
    id: "tip_001",
    title: "Ngủ đủ 7-8 tiếng mỗi đêm",
    content:
      "Người trưởng thành (18-64 tuổi) cần ngủ 7-9 tiếng/đêm, người trên 65 tuổi cần 7-8 tiếng. Thiếu ngủ mãn tính (dưới 6 tiếng) làm tăng 48% nguy cơ bệnh tim mạch và 36% nguy cơ ung thư đại trực tràng. Hãy đi ngủ và thức dậy cùng giờ mỗi ngày, kể cả cuối tuần.",
    category: "sleep",
    tags: ["sleep_duration"],
    source: "National Sleep Foundation",
    relatedMetrics: ["sleep_duration", "stress_level"],
  },
  {
    id: "tip_002",
    title: "Tránh sử dụng điện thoại trước khi ngủ",
    content:
      "Ánh sáng xanh (bước sóng 450-495nm) từ màn hình ức chế sản xuất melatonin lên đến 50%. Tắt thiết bị ít nhất 60 phút trước giờ ngủ. Nếu bắt buộc dùng, bật chế độ Night Shift/lọc ánh sáng xanh và giảm độ sáng xuống dưới 50%.",
    category: "sleep",
    tags: ["sleep_duration"],
    source: "Harvard Health Publishing",
    relatedMetrics: ["sleep_duration"],
  },
  {
    id: "tip_003",
    title: "Tạo môi trường ngủ tối và yên tĩnh",
    content:
      "Nhiệt độ phòng ngủ lý tưởng là 18-22°C. Độ ồn nên dưới 30 dB (tương đương tiếng thì thầm). Sử dụng rèm cản sáng để giữ phòng tối hoàn toàn — chỉ 8 lux ánh sáng (bằng đèn ngủ nhỏ) cũng đủ làm giảm sản xuất melatonin 50%.",
    category: "sleep",
    tags: ["sleep_duration", "stress_level"],
    source: "Mayo Clinic",
    relatedMetrics: ["sleep_duration", "stress_level"],
  },
  {
    id: "tip_004",
    title: "Không uống caffeine sau 14h chiều",
    content:
      "Caffeine có thời gian bán hủy 5-6 giờ — một ly cà phê 200mg lúc 16h vẫn còn 100mg trong cơ thể lúc 22h. Giới hạn caffeine dưới 400mg/ngày (khoảng 4 ly cà phê 240ml). Người nhạy cảm nên dừng caffeine sau 12h trưa.",
    category: "sleep",
    tags: ["sleep_duration", "heart_rate"],
    source: "Sleep Foundation",
    relatedMetrics: ["sleep_duration", "heart_rate"],
  },
  {
    id: "tip_005",
    title: "Tập thói quen thư giãn trước giờ ngủ",
    content:
      "Dành 30-60 phút cho routine thư giãn: tắm nước ấm (40-42°C trong 10-15 phút giúp hạ nhiệt cơ thể sau đó, kích thích buồn ngủ), đọc sách giấy, hoặc nghe nhạc nhẹ dưới 60 BPM. Tránh xem tin tức hoặc mạng xã hội gây kích thích não.",
    category: "sleep",
    tags: ["sleep_duration", "stress_level"],
    source: "American Academy of Sleep Medicine",
    relatedMetrics: ["sleep_duration", "stress_level"],
  },
  {
    id: "tip_006",
    title: "Hạn chế ngủ trưa quá 30 phút",
    content:
      "Giấc ngủ trưa 10-20 phút (power nap) giúp tăng 34% hiệu suất làm việc và cải thiện tỉnh táo. Ngủ trưa quá 30 phút gây sleep inertia (mệt mỏi sau khi thức dậy) và ảnh hưởng giấc ngủ đêm. Không ngủ trưa sau 15h.",
    category: "sleep",
    tags: ["sleep_duration"],
    source: "NASA Sleep Research",
    relatedMetrics: ["sleep_duration", "stress_level"],
  },
  {
    id: "tip_007",
    title: "Tránh ăn nặng trước giờ ngủ 3 tiếng",
    content:
      "Ăn bữa tối lớn trong vòng 3 giờ trước khi ngủ làm tăng nguy cơ trào ngược dạ dày 2-3 lần và giảm chất lượng giấc ngủ. Nếu đói, ăn nhẹ dưới 200 calo: 1 quả chuối, 1 ly sữa ấm, hoặc một nắm hạnh nhân (23 hạt ≈ 160 calo).",
    category: "sleep",
    tags: ["sleep_duration"],
    source: "American Journal of Gastroenterology",
    relatedMetrics: ["sleep_duration"],
  },
  {
    id: "tip_008",
    title: "Tiếp xúc ánh sáng mặt trời buổi sáng",
    content:
      "Tiếp xúc 15-30 phút ánh sáng tự nhiên trong vòng 1 giờ sau khi thức dậy giúp điều chỉnh nhịp sinh học, tăng serotonin và cải thiện giấc ngủ đêm. Ánh sáng buổi sáng (10.000 lux) hiệu quả gấp 10 lần ánh sáng trong nhà (500 lux).",
    category: "sleep",
    tags: ["sleep_duration", "stress_level"],
    source: "Circadian Rhythm Research",
    relatedMetrics: ["sleep_duration", "stress_level"],
  },
  {
    id: "tip_009",
    title: "Không uống rượu bia trước giờ ngủ",
    content:
      "Dù rượu giúp bạn ngủ nhanh hơn, nó phá vỡ giấc ngủ REM (giai đoạn phục hồi não) trong nửa sau của đêm. Chỉ 1-2 ly rượu vang (150ml/ly) trước ngủ 4 giờ cũng giảm 24% chất lượng giấc ngủ. Dừng uống ít nhất 4 giờ trước khi ngủ.",
    category: "sleep",
    tags: ["sleep_duration", "heart_rate"],
    source: "Sleep Medicine Reviews",
    relatedMetrics: ["sleep_duration", "heart_rate"],
  },
  {
    id: "tip_010",
    title: "Chọn tư thế ngủ phù hợp",
    content:
      "Ngủ nghiêng trái giảm trào ngược dạ dày và tốt cho tuần hoàn. Ngủ ngửa tốt cho cột sống nhưng tăng ngáy. Dùng gối cao 10-15cm cho người ngủ nghiêng, 8-12cm cho người ngủ ngửa. Tránh ngủ sấp vì gây áp lực lên cổ và lưng.",
    category: "sleep",
    tags: ["sleep_duration"],
    source: "Mayo Clinic",
    relatedMetrics: ["sleep_duration"],
  },
  {
    id: "tip_011",
    title: "Theo dõi chu kỳ giấc ngủ",
    content:
      "Mỗi chu kỳ ngủ kéo dài 90 phút gồm 4 giai đoạn: N1 (chuyển tiếp), N2 (ngủ nhẹ), N3 (ngủ sâu), REM (mơ). Đặt báo thức theo bội số 90 phút (6h, 7.5h, 9h) để thức dậy cuối chu kỳ, tránh cảm giác mệt mỏi. Cần 4-6 chu kỳ/đêm.",
    category: "sleep",
    tags: ["sleep_duration", "hrv"],
    source: "National Sleep Foundation",
    relatedMetrics: ["sleep_duration", "heart_rate"],
  },
  {
    id: "tip_012",
    title: "Giữ phòng ngủ chỉ dành cho ngủ",
    content:
      "Não liên kết môi trường với hoạt động — làm việc, xem TV trên giường khiến não khó chuyển sang chế độ ngủ. Chỉ sử dụng giường để ngủ và quan hệ. Nếu không ngủ được sau 20 phút, rời giường làm việc nhẹ nhàng rồi quay lại khi buồn ngủ.",
    category: "sleep",
    tags: ["sleep_duration", "stress_level"],
    source: "Cognitive Behavioral Therapy for Insomnia",
    relatedMetrics: ["sleep_duration", "stress_level"],
  },

  // ===== HEART =====
  {
    id: "tip_013",
    title: "Theo dõi nhịp tim nghỉ ngơi thường xuyên",
    content:
      "Nhịp tim nghỉ ngơi (RHR) bình thường: 60-100 nhịp/phút. Vận động viên có thể 40-60 nhịp/phút. RHR tăng đột ngột 5-10 nhịp có thể báo hiệu stress, thiếu ngủ hoặc bệnh lý. Đo RHR vào buổi sáng ngay sau khi thức dậy, trước khi rời giường, liên tục 7 ngày để có baseline chính xác.",
    category: "heart",
    tags: ["heart_rate", "hrv"],
    source: "American Heart Association",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_014",
    title: "Giữ chỉ số SpO2 trên 95%",
    content:
      "SpO2 bình thường: 95-100%. Dưới 95% cần theo dõi, dưới 90% cần cấp cứu. Ở độ cao trên 2.500m, SpO2 có thể giảm xuống 90-95% là bình thường. Đo SpO2 khi nghỉ ngơi, ngón tay ấm, không sơn móng tay. Nếu SpO2 dưới 94% kèm khó thở, đến cơ sở y tế ngay.",
    category: "heart",
    tags: ["spo2", "heart_rate"],
    source: "WHO",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_015",
    title: "Chú ý biến thiên nhịp tim (HRV)",
    content:
      "HRV đo khoảng cách giữa các nhịp tim (ms). HRV cao (>50ms RMSSD) cho thấy hệ thần kinh tự chủ linh hoạt. HRV thấp liên quan đến stress, thiếu ngủ, viêm nhiễm. Cải thiện HRV bằng: tập thể dục đều đặn, ngủ đủ 7-8h, hít thở sâu 5 phút/ngày, giảm rượu bia.",
    category: "heart",
    tags: ["hrv", "heart_rate"],
    source: "Harvard Health Publishing",
    relatedMetrics: ["heart_rate", "sleep_duration"],
  },
  {
    id: "tip_016",
    title: "Kiểm soát huyết áp hàng ngày",
    content:
      "Huyết áp tối ưu: dưới 120/80 mmHg. Tiền tăng huyết áp: 120-139/80-89. Tăng huyết áp giai đoạn 1: 140-159/90-99. Đo huyết áp 2 lần/ngày (sáng trước ăn, tối trước ngủ), nghỉ 5 phút trước khi đo, ngồi thẳng lưng, tay đặt ngang tim. Ghi lại kết quả liên tục 7 ngày.",
    category: "heart",
    tags: ["heart_rate"],
    source: "American Heart Association",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_017",
    title: "Nhận biết dấu hiệu đột quỵ FAST",
    content:
      "F (Face): Mặt xệ một bên khi cười. A (Arms): Một tay yếu/rủ khi giơ cả hai tay. S (Speech): Nói ngọng, khó nói. T (Time): Gọi cấp cứu 115 ngay lập tức. Thời gian vàng điều trị đột quỵ là 4.5 giờ đầu. Mỗi phút chậm trễ, 1.9 triệu tế bào não chết.",
    category: "heart",
    tags: ["heart_rate", "spo2"],
    source: "American Stroke Association",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_018",
    title: "Giảm cholesterol xấu LDL",
    content:
      "LDL tối ưu: dưới 100 mg/dL. Nguy cơ cao: trên 160 mg/dL. Giảm LDL bằng: ăn 25-30g chất xơ/ngày (yến mạch, đậu, rau), tập aerobic 150 phút/tuần, giảm chất béo bão hòa dưới 7% tổng calo, ăn 2 phần cá béo/tuần (cá hồi, cá thu).",
    category: "heart",
    tags: ["heart_rate", "steps"],
    source: "National Heart, Lung, and Blood Institute",
    relatedMetrics: ["heart_rate", "steps"],
  },
  {
    id: "tip_019",
    title: "Giữ nhịp tim trong vùng an toàn khi tập",
    content:
      "Nhịp tim tối đa ước tính = 220 - tuổi. Vùng đốt mỡ: 60-70% nhịp tim tối đa. Vùng cardio: 70-80%. Vùng cường độ cao: 80-90%. Ví dụ: người 30 tuổi có nhịp tim tối đa 190, vùng cardio là 133-152 nhịp/phút. Không nên vượt 90% nhịp tim tối đa kéo dài.",
    category: "heart",
    tags: ["heart_rate", "steps"],
    source: "American College of Sports Medicine",
    relatedMetrics: ["heart_rate", "steps"],
  },
  {
    id: "tip_020",
    title: "Bỏ thuốc lá để bảo vệ tim mạch",
    content:
      "Hút thuốc tăng 2-4 lần nguy cơ bệnh tim mạch. Sau 20 phút bỏ thuốc: nhịp tim trở về bình thường. Sau 1 năm: nguy cơ bệnh tim giảm 50%. Sau 15 năm: nguy cơ ngang người không hút. Nicotine làm tăng nhịp tim 10-20 nhịp/phút và co mạch máu.",
    category: "heart",
    tags: ["heart_rate", "spo2"],
    source: "WHO",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_021",
    title: "Kiểm tra nhịp tim bất thường",
    content:
      "Rung nhĩ (AFib) ảnh hưởng 2-4% dân số, tăng 5 lần nguy cơ đột quỵ. Dấu hiệu: tim đập không đều, hồi hộp, chóng mặt, khó thở. Tự kiểm tra: đặt 2 ngón tay lên cổ tay, đếm nhịp trong 30 giây x2. Nếu nhịp không đều hoặc >100 nhịp/phút khi nghỉ, đi khám ngay.",
    category: "heart",
    tags: ["heart_rate", "hrv"],
    source: "European Society of Cardiology",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_022",
    title: "Omega-3 bảo vệ tim mạch",
    content:
      "Ăn 2-3 phần cá béo/tuần (mỗi phần 100-150g) cung cấp đủ EPA và DHA. Cá hồi, cá thu, cá mòi, cá trích giàu omega-3 nhất. Nếu không ăn cá, bổ sung 1-2g dầu cá/ngày. Omega-3 giảm triglyceride 15-30%, giảm viêm và ổn định nhịp tim.",
    category: "heart",
    tags: ["heart_rate"],
    source: "American Heart Association",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_023",
    title: "Hạn chế natri để kiểm soát huyết áp",
    content:
      "Khuyến nghị: dưới 2.300mg natri/ngày (khoảng 1 thìa cà phê muối). Lý tưởng: 1.500mg/ngày cho người tăng huyết áp. Giảm 1.000mg natri/ngày hạ huyết áp 5-6 mmHg. Thực phẩm chế biến sẵn chứa 70% lượng natri tiêu thụ — đọc nhãn dinh dưỡng trước khi mua.",
    category: "heart",
    tags: ["heart_rate"],
    source: "American Heart Association",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_024",
    title: "Tầm soát bệnh tim mạch định kỳ",
    content:
      "Từ 20 tuổi: kiểm tra huyết áp, cholesterol mỗi 4-6 năm. Từ 40 tuổi: kiểm tra hàng năm kèm đường huyết, ECG. Từ 50 tuổi: xem xét CT calcium score nếu có yếu tố nguy cơ. Yếu tố nguy cơ: tiền sử gia đình, hút thuốc, tiểu đường, béo phì, ít vận động.",
    category: "heart",
    tags: ["heart_rate", "spo2"],
    source: "American College of Cardiology",
    relatedMetrics: ["heart_rate"],
  },

  // ===== NUTRITION =====
  {
    id: "tip_025",
    title: "Uống đủ nước theo cân nặng",
    content:
      "Công thức: cân nặng (kg) × 30-35ml = lượng nước cần/ngày. Người 60kg cần 1.8-2.1 lít, người 80kg cần 2.4-2.8 lít. Tăng thêm 500-1000ml khi tập thể dục, thời tiết nóng, hoặc sốt. Nước tiểu màu vàng nhạt = đủ nước. Vàng đậm = thiếu nước. Uống 200-250ml mỗi lần, chia đều trong ngày.",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "European Food Safety Authority",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_026",
    title: "Ăn đủ 5-9 phần rau quả mỗi ngày",
    content:
      "1 phần = 80g rau/quả tươi hoặc 30g rau/quả khô. Mục tiêu: 400g rau quả/ngày (WHO). Mỗi phần rau quả thêm giảm 5% nguy cơ tử vong. Ưu tiên rau lá xanh đậm (cải bó xôi, cải xoăn), quả mọng (việt quất, dâu tây), và rau họ cải (bông cải xanh, bắp cải).",
    category: "nutrition",
    tags: ["heart_rate", "steps"],
    source: "WHO",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_027",
    title: "Giới hạn đường tự do dưới 25g/ngày",
    content:
      "WHO khuyến nghị đường tự do dưới 10% tổng năng lượng (50g/ngày với chế độ 2000 calo), lý tưởng dưới 5% (25g ≈ 6 thìa cà phê). 1 lon nước ngọt 330ml chứa 35-40g đường. Đường ẩn có trong: nước sốt (15g/100ml), sữa chua trái cây (12g/hộp), bánh mì trắng.",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "WHO",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_028",
    title: "Bổ sung đủ protein theo cân nặng",
    content:
      "Người ít vận động: 0.8g protein/kg/ngày. Người tập thể dục: 1.2-1.6g/kg/ngày. Người tập gym nặng: 1.6-2.2g/kg/ngày. Người 70kg ít vận động cần 56g protein/ngày (≈ 200g ức gà + 2 quả trứng + 1 ly sữa). Chia đều 20-30g protein mỗi bữa để tối ưu hấp thu.",
    category: "nutrition",
    tags: ["steps"],
    source: "International Society of Sports Nutrition",
    relatedMetrics: ["steps"],
  },
  {
    id: "tip_029",
    title: "Ăn đủ chất xơ 25-30g mỗi ngày",
    content:
      "Chất xơ giảm 30% nguy cơ bệnh tim, ổn định đường huyết và hỗ trợ tiêu hóa. Nguồn giàu chất xơ: yến mạch (4g/100g), đậu đen (8g/100g), bơ (7g/quả), hạt chia (34g/100g). Tăng chất xơ từ từ 5g/tuần để tránh đầy hơi. Uống thêm nước khi tăng chất xơ.",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "American Dietetic Association",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_030",
    title: "Bổ sung vitamin D đầy đủ",
    content:
      "Nhu cầu: 600-800 IU/ngày (người trưởng thành), 1000-2000 IU nếu thiếu hụt. 80% người Việt thiếu vitamin D. Nguồn: phơi nắng 15-20 phút/ngày (10h-15h), cá hồi (600 IU/100g), trứng (44 IU/quả), sữa tăng cường (100 IU/ly). Kiểm tra nồng độ 25(OH)D máu — mức tối ưu: 30-50 ng/mL.",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "Endocrine Society",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_031",
    title: "Ăn sáng đầy đủ dinh dưỡng",
    content:
      "Bữa sáng nên chiếm 25-30% tổng calo ngày (500-600 calo với chế độ 2000 calo). Kết hợp: protein (trứng, sữa), carb phức (yến mạch, bánh mì nguyên cám), chất béo tốt (bơ, hạt), và rau quả. Bỏ bữa sáng tăng 21% nguy cơ tiểu đường type 2 và 27% nguy cơ bệnh tim.",
    category: "nutrition",
    tags: ["heart_rate", "steps"],
    source: "Journal of the American College of Cardiology",
    relatedMetrics: ["heart_rate", "steps"],
  },
  {
    id: "tip_032",
    title: "Chọn chất béo tốt thay chất béo xấu",
    content:
      "Chất béo nên chiếm 25-35% tổng calo. Chất béo tốt (không bão hòa): dầu ô liu, bơ, hạt, cá béo. Chất béo xấu (bão hòa): dưới 10% tổng calo — hạn chế mỡ động vật, bơ, phô mai. Chất béo trans: 0g — tránh hoàn toàn thực phẩm chiên công nghiệp, margarine cứng.",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "American Heart Association",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_033",
    title: "Bổ sung sắt đúng cách",
    content:
      "Nhu cầu sắt: nam 8mg/ngày, nữ tiền mãn kinh 18mg/ngày, phụ nữ mang thai 27mg/ngày. Sắt heme (thịt đỏ, gan) hấp thu 15-35%. Sắt non-heme (rau, đậu) hấp thu 2-20% — ăn kèm vitamin C tăng hấp thu 3-6 lần. Không uống sắt cùng trà/cà phê (giảm hấp thu 60%).",
    category: "nutrition",
    tags: ["heart_rate", "spo2"],
    source: "National Institutes of Health",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_034",
    title: "Kiểm soát khẩu phần ăn",
    content:
      "Dùng đĩa 23cm, chia: 1/2 rau quả, 1/4 protein, 1/4 tinh bột. 1 phần cơm = 1 nắm tay (150g nấu chín ≈ 200 calo). 1 phần thịt = lòng bàn tay (100g). Ăn chậm 20 phút/bữa — não cần 20 phút để nhận tín hiệu no. Dùng bát nhỏ hơn giảm 30% lượng ăn.",
    category: "nutrition",
    tags: ["steps"],
    source: "Harvard T.H. Chan School of Public Health",
    relatedMetrics: ["steps"],
  },
  {
    id: "tip_035",
    title: "Bổ sung canxi cho xương chắc khỏe",
    content:
      "Nhu cầu canxi: 1000mg/ngày (19-50 tuổi), 1200mg/ngày (trên 50 tuổi). 1 ly sữa 240ml = 300mg canxi. Nguồn khác: phô mai (200mg/30g), đậu phụ (350mg/100g), cải bó xôi (99mg/100g), cá mòi cả xương (325mg/100g). Cần vitamin D để hấp thu canxi hiệu quả.",
    category: "nutrition",
    tags: ["steps"],
    source: "National Osteoporosis Foundation",
    relatedMetrics: ["steps"],
  },
  {
    id: "tip_036",
    title: "Hạn chế thực phẩm chế biến sẵn",
    content:
      "Thực phẩm siêu chế biến (ultra-processed) chiếm 50-60% calo ở nhiều nước và tăng 29% nguy cơ tử vong sớm. Bao gồm: mì gói, xúc xích, nước ngọt, snack đóng gói, thức ăn nhanh. Thay bằng: nấu ăn tại nhà, chọn nguyên liệu tươi, đọc nhãn — tránh sản phẩm có >5 thành phần lạ.",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "BMJ Research",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_037",
    title: "Ăn đủ kali để cân bằng natri",
    content:
      "Nhu cầu kali: 2.600mg/ngày (nữ), 3.400mg/ngày (nam). Kali giúp hạ huyết áp bằng cách đào thải natri qua thận. Nguồn giàu kali: chuối (422mg/quả), khoai lang (541mg/củ), rau bina (558mg/100g nấu), đậu trắng (1.004mg/100g). Tỷ lệ natri:kali lý tưởng là 1:2.",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "American Heart Association",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_038",
    title: "Probiotics cho đường ruột khỏe mạnh",
    content:
      "Hệ vi sinh đường ruột chứa 100 nghìn tỷ vi khuẩn, ảnh hưởng miễn dịch, tâm trạng và cân nặng. Bổ sung probiotics qua: sữa chua (1-2 hộp/ngày), kimchi, dưa cải muối, kombucha, miso. Prebiotics (thức ăn cho vi khuẩn tốt): tỏi, hành, chuối xanh, yến mạch, măng tây.",
    category: "nutrition",
    tags: ["heart_rate", "stress_level"],
    source: "World Gastroenterology Organisation",
    relatedMetrics: ["heart_rate", "stress_level"],
  },
  {
    id: "tip_039",
    title: "Magnesium — khoáng chất thường bị thiếu",
    content:
      "Nhu cầu: 310-320mg/ngày (nữ), 400-420mg/ngày (nam). 50% người không đủ magnesium. Thiếu magnesium gây chuột rút, mất ngủ, lo âu, nhịp tim bất thường. Nguồn: hạt bí (150mg/30g), socola đen 70% (65mg/30g), hạnh nhân (80mg/30g), rau bina (78mg/100g nấu).",
    category: "nutrition",
    tags: ["heart_rate", "sleep_duration", "stress_level"],
    source: "National Institutes of Health",
    relatedMetrics: ["heart_rate", "sleep_duration", "stress_level"],
  },
  {
    id: "tip_040",
    title: "Không bỏ bữa để giảm cân",
    content:
      "Bỏ bữa làm giảm trao đổi chất 15-20%, tăng hormone ghrelin (đói) và giảm leptin (no), dẫn đến ăn quá nhiều bữa sau. Giảm cân an toàn: giảm 500 calo/ngày so với TDEE (tổng năng lượng tiêu hao), mất 0.5kg/tuần. Ăn 3 bữa chính + 1-2 bữa phụ, mỗi bữa phụ 100-200 calo.",
    category: "nutrition",
    tags: ["steps", "heart_rate"],
    source: "Academy of Nutrition and Dietetics",
    relatedMetrics: ["steps", "heart_rate"],
  },

  // ===== EXERCISE =====
  {
    id: "tip_041",
    title: "Đi bộ ít nhất 7.000-10.000 bước mỗi ngày",
    content:
      "Nghiên cứu cho thấy 7.000 bước/ngày giảm 50-70% nguy cơ tử vong sớm. 10.000 bước ≈ 7-8km ≈ đốt 300-400 calo. Bắt đầu từ mức hiện tại, tăng 500-1.000 bước/tuần. Mỗi 1.000 bước thêm giảm 15% nguy cơ tử vong. Dùng đồng hồ/điện thoại theo dõi bước chân hàng ngày.",
    category: "exercise",
    tags: ["steps", "heart_rate"],
    source: "JAMA Internal Medicine",
    relatedMetrics: ["steps", "heart_rate"],
  },
  {
    id: "tip_042",
    title: "Tập aerobic 150-300 phút/tuần cường độ vừa",
    content:
      "Cường độ vừa: đi bộ nhanh 5-6 km/h, đạp xe 15-20 km/h, bơi nhẹ, nhảy aerobic. Kiểm tra: còn nói chuyện được nhưng không hát được. Nhịp tim 50-70% nhịp tim tối đa. Chia thành 30-60 phút/ngày, 5 ngày/tuần. Hoặc 75-150 phút cường độ cao (chạy bộ, HIIT).",
    category: "exercise",
    tags: ["steps", "heart_rate", "hrv"],
    source: "WHO Physical Activity Guidelines 2020",
    relatedMetrics: ["steps", "heart_rate"],
  },
  {
    id: "tip_043",
    title: "Khởi động kỹ 5-10 phút trước khi tập",
    content:
      "Khởi động tăng nhiệt độ cơ 1-2°C, tăng lưu lượng máu đến cơ 70%, giảm 50% nguy cơ chấn thương. Quy trình: 3-5 phút cardio nhẹ (đi bộ nhanh, nhảy tại chỗ) + 5 phút dynamic stretching (xoay khớp, lunge walk, arm circles). Không kéo giãn tĩnh khi cơ chưa nóng.",
    category: "exercise",
    tags: ["heart_rate", "steps"],
    source: "American College of Sports Medicine",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_044",
    title: "Tập sức mạnh 2-3 lần/tuần",
    content:
      "Tập sức mạnh (resistance training) tăng khối cơ, tăng trao đổi chất cơ bản 7-8%, giảm mỡ nội tạng, và tăng mật độ xương 1-3%/năm. Tập 8-10 bài tập cho các nhóm cơ lớn, mỗi bài 2-3 set × 8-12 reps. Nghỉ 48 giờ giữa các buổi tập cùng nhóm cơ.",
    category: "exercise",
    tags: ["steps", "heart_rate"],
    source: "American College of Sports Medicine",
    relatedMetrics: ["steps", "heart_rate"],
  },
  {
    id: "tip_045",
    title: "Giãn cơ sau tập 10-15 phút",
    content:
      "Giãn cơ tĩnh (static stretching) sau tập giúp giảm đau cơ 20-30%, tăng linh hoạt khớp, và đẩy nhanh phục hồi. Giữ mỗi tư thế 15-30 giây, không nảy. Tập trung vào các nhóm cơ vừa tập. Kết hợp foam rolling 5-10 phút giảm đau cơ thêm 50%.",
    category: "exercise",
    tags: ["heart_rate", "steps"],
    source: "National Strength and Conditioning Association",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_046",
    title: "Tập HIIT để tối ưu thời gian",
    content:
      "HIIT (High-Intensity Interval Training): xen kẽ 20-30 giây cường độ cao (90-95% nhịp tim tối đa) với 60-90 giây nghỉ/nhẹ. Tổng 15-25 phút. Đốt calo nhiều hơn cardio đều 25-30% nhờ hiệu ứng EPOC (đốt calo thêm 6-15 giờ sau tập). Chỉ tập 2-3 lần/tuần, nghỉ ít nhất 48 giờ.",
    category: "exercise",
    tags: ["heart_rate", "steps", "hrv"],
    source: "British Journal of Sports Medicine",
    relatedMetrics: ["heart_rate", "steps"],
  },
  {
    id: "tip_047",
    title: "Đứng dậy mỗi 30-60 phút khi ngồi lâu",
    content:
      "Ngồi liên tục trên 8 giờ/ngày tăng 59% nguy cơ tử vong sớm. Đứng dậy đi lại 2-3 phút mỗi 30 phút giảm đường huyết sau ăn 24% và huyết áp 11%. Đặt nhắc nhở trên đồng hồ/điện thoại. Bài tập tại chỗ: đứng lên ngồi xuống 10 lần, đi bộ tại chỗ, kéo giãn cổ vai.",
    category: "exercise",
    tags: ["steps", "heart_rate"],
    source: "Annals of Internal Medicine",
    relatedMetrics: ["steps", "heart_rate"],
  },
  {
    id: "tip_048",
    title: "Bơi lội — bài tập toàn thân ít chấn thương",
    content:
      "Bơi 30 phút đốt 200-350 calo tùy kiểu bơi (bơi bướm nhiều nhất, bơi ếch ít nhất). Bơi giảm 28% nguy cơ tử vong sớm, tốt cho người đau khớp, thừa cân, hoặc chấn thương. Nhiệt độ nước lý tưởng: 26-28°C. Bơi 2-3 lần/tuần, mỗi lần 30-45 phút.",
    category: "exercise",
    tags: ["heart_rate", "steps"],
    source: "Swim England",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_049",
    title: "Yoga cải thiện linh hoạt và cân bằng",
    content:
      "Yoga 2-3 lần/tuần giảm cortisol 25%, tăng HRV 22%, giảm đau lưng mãn tính 56%. Bắt đầu với Hatha yoga (nhẹ nhàng) 30-60 phút. Các tư thế cơ bản: Mountain Pose, Downward Dog, Warrior I/II, Tree Pose. Tập trên thảm yoga, không ép cơ thể quá giới hạn.",
    category: "exercise",
    tags: ["stress_level", "hrv", "heart_rate"],
    source: "Journal of Clinical Psychology",
    relatedMetrics: ["stress_level", "heart_rate"],
  },
  {
    id: "tip_050",
    title: "Chạy bộ đúng kỹ thuật tránh chấn thương",
    content:
      "Cadence (nhịp bước) lý tưởng: 170-180 bước/phút. Tiếp đất giữa bàn chân, không gót chân. Thân hơi nghiêng trước 5-10°. Tăng quãng đường tối đa 10%/tuần. Giày chạy thay sau 500-800km. Người mới bắt đầu: xen kẽ chạy 1 phút/đi bộ 2 phút, tổng 20-30 phút, 3 lần/tuần.",
    category: "exercise",
    tags: ["steps", "heart_rate"],
    source: "Runner's World / Sports Medicine",
    relatedMetrics: ["steps", "heart_rate"],
  },
  {
    id: "tip_051",
    title: "Tập thể dục ngoài trời tốt hơn trong nhà",
    content:
      "Tập ngoài trời (green exercise) giảm cortisol thêm 15%, tăng serotonin, và cải thiện tâm trạng nhiều hơn tập trong nhà. Chỉ 5 phút tập trong công viên đã cải thiện đáng kể tâm trạng và tự tin. Kết hợp: đi bộ nhanh trong công viên, đạp xe, tập yoga ngoài trời.",
    category: "exercise",
    tags: ["steps", "stress_level", "heart_rate"],
    source: "Environmental Science & Technology",
    relatedMetrics: ["steps", "stress_level"],
  },
  {
    id: "tip_052",
    title: "Bù nước đúng cách khi tập thể dục",
    content:
      "Trước tập 2h: uống 500ml nước. Trong khi tập: 150-250ml mỗi 15-20 phút. Sau tập: uống 1.5 lít cho mỗi kg cân nặng mất đi. Tập trên 60 phút hoặc cường độ cao: bổ sung nước điện giải (natri 500-700mg/lít). Cân trước và sau tập để biết lượng nước mất.",
    category: "exercise",
    tags: ["heart_rate", "steps"],
    source: "American College of Sports Medicine",
    relatedMetrics: ["heart_rate", "steps"],
  },
  {
    id: "tip_053",
    title: "Nghỉ ngơi phục hồi giữa các buổi tập",
    content:
      "Cơ bắp cần 48-72 giờ phục hồi sau tập nặng. Dấu hiệu overtrain: nhịp tim nghỉ tăng >5 nhịp, HRV giảm, mệt mỏi kéo dài, mất ngủ, giảm hiệu suất. Ngày nghỉ active recovery: đi bộ nhẹ, yoga, bơi nhẹ. Ngủ đủ 7-9 giờ — hormone tăng trưởng tiết 70% trong giấc ngủ sâu.",
    category: "exercise",
    tags: ["heart_rate", "hrv", "sleep_duration"],
    source: "National Strength and Conditioning Association",
    relatedMetrics: ["heart_rate", "sleep_duration"],
  },
  {
    id: "tip_054",
    title: "Đạp xe — vận động thân thiện với khớp",
    content:
      "Đạp xe 30 phút đốt 200-300 calo, giảm 52% nguy cơ bệnh tim. Ít tác động lên khớp gối hơn chạy bộ 50%. Tốc độ vừa: 15-20 km/h. Điều chỉnh yên: khi ngồi, chân duỗi gần hết ở vị trí thấp nhất (góc gối 25-30°). Đội mũ bảo hiểm, mặc quần áo phản quang khi đạp ngoài đường.",
    category: "exercise",
    tags: ["steps", "heart_rate"],
    source: "British Medical Journal",
    relatedMetrics: ["steps", "heart_rate"],
  },

  // ===== STRESS =====
  {
    id: "tip_055",
    title: "Hít thở sâu 4-7-8 giảm stress ngay lập tức",
    content:
      "Kỹ thuật 4-7-8: hít vào bằng mũi 4 giây, giữ hơi 7 giây, thở ra bằng miệng 8 giây. Lặp lại 4 chu kỳ. Kích hoạt hệ thần kinh phó giao cảm, giảm nhịp tim 10-15 nhịp/phút trong 2-3 phút. Thực hành 2 lần/ngày (sáng và tối). Sau 4-6 tuần, phản ứng stress giảm rõ rệt.",
    category: "stress",
    tags: ["stress_level", "heart_rate", "hrv"],
    source: "Dr. Andrew Weil / Harvard Health",
    relatedMetrics: ["stress_level", "heart_rate"],
  },
  {
    id: "tip_056",
    title: "Nghỉ giải lao Pomodoro giữa giờ làm việc",
    content:
      "Kỹ thuật Pomodoro: làm việc tập trung 25 phút, nghỉ 5 phút. Sau 4 pomodoro, nghỉ dài 15-30 phút. Trong giờ nghỉ: đứng dậy đi lại, nhìn xa 20 giây (quy tắc 20-20-20 cho mắt), uống nước, kéo giãn cổ vai. Phương pháp này tăng năng suất 25% và giảm kiệt sức.",
    category: "stress",
    tags: ["stress_level", "steps"],
    source: "Francesco Cirillo / Productivity Research",
    relatedMetrics: ["stress_level", "steps"],
  },
  {
    id: "tip_057",
    title: "Thiền chánh niệm 10-15 phút mỗi ngày",
    content:
      "Thiền chánh niệm (mindfulness meditation) giảm cortisol 25%, tăng HRV 15-20%, giảm lo âu 58%. Bắt đầu: ngồi thoải mái, nhắm mắt, tập trung vào hơi thở. Khi tâm trí lang thang, nhẹ nhàng quay lại hơi thở. Dùng app hướng dẫn (Headspace, Calm) nếu mới bắt đầu. Tập đều đặn quan trọng hơn tập lâu.",
    category: "stress",
    tags: ["stress_level", "hrv"],
    source: "JAMA Internal Medicine",
    relatedMetrics: ["stress_level", "heart_rate"],
  },
  {
    id: "tip_058",
    title: "Viết nhật ký biết ơn giảm lo âu",
    content:
      "Viết 3 điều biết ơn mỗi tối trước ngủ trong 21 ngày liên tục giảm 23% triệu chứng trầm cảm và cải thiện giấc ngủ. Cụ thể hóa: thay vì 'biết ơn gia đình', viết 'biết ơn mẹ nấu bữa tối ngon hôm nay'. Nghiên cứu cho thấy hiệu quả kéo dài 6 tháng sau khi dừng viết.",
    category: "stress",
    tags: ["stress_level", "sleep_duration"],
    source: "Journal of Positive Psychology",
    relatedMetrics: ["stress_level", "sleep_duration"],
  },
  {
    id: "tip_059",
    title: "Kết nối xã hội giảm stress hiệu quả",
    content:
      "Cô đơn tăng nguy cơ tử vong sớm 26% — tương đương hút 15 điếu thuốc/ngày. Dành ít nhất 30 phút/ngày trò chuyện trực tiếp với người thân/bạn bè. Tham gia 1-2 hoạt động nhóm/tuần (thể thao, tình nguyện, câu lạc bộ). Cuộc gọi video hiệu quả hơn nhắn tin trong giảm cô đơn.",
    category: "stress",
    tags: ["stress_level", "heart_rate"],
    source: "American Psychological Association",
    relatedMetrics: ["stress_level", "heart_rate"],
  },
  {
    id: "tip_060",
    title: "Giảm thời gian dùng mạng xã hội",
    content:
      "Sử dụng mạng xã hội trên 3 giờ/ngày tăng 60% nguy cơ lo âu và trầm cảm ở người trẻ. Giới hạn 30-60 phút/ngày. Tắt thông báo không cần thiết. Không dùng điện thoại 1 giờ đầu sau thức dậy và 1 giờ trước ngủ. Thay bằng: đọc sách, đi dạo, nói chuyện trực tiếp.",
    category: "stress",
    tags: ["stress_level", "sleep_duration"],
    source: "Journal of Social and Clinical Psychology",
    relatedMetrics: ["stress_level", "sleep_duration"],
  },
  {
    id: "tip_061",
    title: "Tắm nước lạnh tăng cường tinh thần",
    content:
      "Tắm nước lạnh (15-20°C) trong 2-3 phút kích hoạt hệ thần kinh giao cảm, tăng norepinephrine 200-300%, cải thiện tỉnh táo và tâm trạng. Bắt đầu từ từ: 30 giây nước lạnh cuối buổi tắm, tăng dần. Chống chỉ định: bệnh tim mạch, huyết áp cao không kiểm soát, Raynaud.",
    category: "stress",
    tags: ["stress_level", "heart_rate"],
    source: "PLoS ONE Research",
    relatedMetrics: ["stress_level", "heart_rate"],
  },
  {
    id: "tip_062",
    title: "Âm nhạc trị liệu giảm cortisol",
    content:
      "Nghe nhạc nhịp chậm (60-80 BPM) trong 30 phút giảm cortisol 25%, hạ nhịp tim và huyết áp. Nhạc cổ điển, nhạc thiên nhiên, và nhạc ambient hiệu quả nhất. Tạo playlist 'thư giãn' riêng. Chơi nhạc cụ còn hiệu quả hơn nghe — giảm lo âu 37% và tăng kết nối não bộ.",
    category: "stress",
    tags: ["stress_level", "heart_rate", "hrv"],
    source: "Frontiers in Psychology",
    relatedMetrics: ["stress_level", "heart_rate"],
  },
  {
    id: "tip_063",
    title: "Tiếp xúc thiên nhiên giảm stress",
    content:
      "Dành 120 phút/tuần trong thiên nhiên (công viên, rừng, biển) giảm cortisol 21% và cải thiện sức khỏe tâm thần đáng kể. 'Tắm rừng' (shinrin-yoku) 2 giờ giảm huyết áp, nhịp tim và tăng tế bào NK (miễn dịch) 50%. Không cần tập thể dục — chỉ cần đi dạo chậm và quan sát.",
    category: "stress",
    tags: ["stress_level", "heart_rate", "steps"],
    source: "Scientific Reports / Nature",
    relatedMetrics: ["stress_level", "heart_rate"],
  },
  {
    id: "tip_064",
    title: "Kỹ thuật thư giãn cơ tiến triển (PMR)",
    content:
      "PMR: căng từng nhóm cơ 5-10 giây rồi thả lỏng 20-30 giây, từ chân lên đầu. Tổng 15-20 phút. Giảm lo âu 40%, cải thiện giấc ngủ, giảm đau đầu căng thẳng. Thực hành: nằm ngửa, nhắm mắt, bắt đầu từ ngón chân → bắp chân → đùi → bụng → ngực → tay → vai → mặt.",
    category: "stress",
    tags: ["stress_level", "heart_rate", "sleep_duration"],
    source: "Edmund Jacobson / Clinical Psychology",
    relatedMetrics: ["stress_level", "heart_rate", "sleep_duration"],
  },
  {
    id: "tip_065",
    title: "Quản lý thời gian giảm áp lực công việc",
    content:
      "Ma trận Eisenhower: chia công việc thành 4 ô — Quan trọng+Khẩn cấp (làm ngay), Quan trọng+Không khẩn cấp (lên lịch), Không quan trọng+Khẩn cấp (ủy thác), Không quan trọng+Không khẩn cấp (loại bỏ). Viết to-do list tối hôm trước, giới hạn 3-5 việc quan trọng/ngày. Nói 'không' với việc không ưu tiên.",
    category: "stress",
    tags: ["stress_level"],
    source: "Harvard Business Review",
    relatedMetrics: ["stress_level"],
  },
  {
    id: "tip_066",
    title: "Cười nhiều hơn — liều thuốc tự nhiên",
    content:
      "Cười 10-15 phút/ngày đốt 10-40 calo, giảm cortisol 39%, tăng endorphin 27%, và tăng kháng thể IgA (miễn dịch) 14%. Xem phim hài, đọc truyện cười, chơi với thú cưng, hoặc tham gia lớp yoga cười (Laughter Yoga). Ngay cả cười gượng cũng kích hoạt phản ứng tích cực trong não.",
    category: "stress",
    tags: ["stress_level", "heart_rate"],
    source: "Mayo Clinic",
    relatedMetrics: ["stress_level", "heart_rate"],
  },

  // ===== GENERAL =====
  {
    id: "tip_067",
    title: "Khám sức khỏe tổng quát định kỳ",
    content:
      "18-39 tuổi: khám mỗi 2-3 năm. 40-64 tuổi: khám hàng năm. Trên 65 tuổi: khám 6 tháng/lần. Xét nghiệm cơ bản: công thức máu, đường huyết (bình thường <100 mg/dL lúc đói), cholesterol (tổng <200 mg/dL), chức năng gan thận, tổng phân tích nước tiểu. Thêm: tầm soát ung thư theo tuổi và giới.",
    category: "general",
    tags: ["heart_rate", "spo2"],
    source: "U.S. Preventive Services Task Force",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_068",
    title: "Duy trì BMI trong khoảng 18.5-24.9",
    content:
      "BMI = cân nặng (kg) / chiều cao² (m). Ví dụ: 65kg, 1.70m → BMI = 22.5 (bình thường). Thiếu cân: <18.5. Thừa cân: 25-29.9. Béo phì: ≥30. Người châu Á nên giữ BMI <23 vì nguy cơ bệnh chuyển hóa cao hơn. Kết hợp đo vòng eo: nam <90cm, nữ <80cm (tiêu chuẩn châu Á).",
    category: "general",
    tags: ["steps", "heart_rate"],
    source: "WHO / IDF",
    relatedMetrics: ["steps", "heart_rate"],
  },
  {
    id: "tip_069",
    title: "Rửa tay đúng cách phòng 80% bệnh truyền nhiễm",
    content:
      "Rửa tay bằng xà phòng 20 giây giảm 80% bệnh truyền nhiễm. 6 bước rửa tay WHO: lòng bàn tay, mu bàn tay, kẽ ngón, mặt sau ngón, ngón cái, đầu ngón tay. Rửa tay khi: trước ăn, sau vệ sinh, sau ho/hắt hơi, sau chạm bề mặt công cộng. Nước rửa tay khô (>60% cồn) khi không có xà phòng.",
    category: "general",
    tags: ["heart_rate"],
    source: "WHO / CDC",
    relatedMetrics: [],
  },
  {
    id: "tip_070",
    title: "Tiêm phòng đầy đủ theo lịch",
    content:
      "Người trưởng thành cần: cúm (hàng năm), uốn ván-bạch hầu-ho gà (Tdap, mỗi 10 năm), viêm gan B (3 mũi nếu chưa tiêm), HPV (đến 26 tuổi), zona (trên 50 tuổi), phế cầu (trên 65 tuổi). COVID-19 theo khuyến nghị hiện hành. Kiểm tra sổ tiêm chủng và bổ sung mũi thiếu.",
    category: "general",
    tags: ["heart_rate"],
    source: "CDC Immunization Schedule",
    relatedMetrics: [],
  },
  {
    id: "tip_071",
    title: "Bảo vệ da khỏi tia UV",
    content:
      "Kem chống nắng SPF 30+ chặn 97% tia UVB. Thoa 2mg/cm² (khoảng 1/4 thìa cà phê cho mặt) 15-30 phút trước ra nắng, thoa lại mỗi 2 giờ. Tránh nắng 10h-16h. Mặc áo dài tay, đội mũ rộng vành, đeo kính UV400. Kiểm tra nốt ruồi theo quy tắc ABCDE: Asymmetry, Border, Color, Diameter >6mm, Evolving.",
    category: "general",
    tags: ["heart_rate"],
    source: "American Academy of Dermatology",
    relatedMetrics: [],
  },
  {
    id: "tip_072",
    title: "Chăm sóc sức khỏe răng miệng",
    content:
      "Đánh răng 2 lần/ngày (sáng và tối) ít nhất 2 phút, dùng bàn chải mềm, thay mỗi 3 tháng. Dùng chỉ nha khoa 1 lần/ngày. Khám nha khoa 6 tháng/lần. Bệnh nướu răng tăng 20% nguy cơ bệnh tim mạch do vi khuẩn vào máu. Hạn chế đồ ngọt, nước có ga, và thực phẩm có tính axit.",
    category: "general",
    tags: ["heart_rate"],
    source: "American Dental Association",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_073",
    title: "Bảo vệ thính giác",
    content:
      "Tiếp xúc tiếng ồn trên 85 dB (tương đương máy cắt cỏ) trong 8 giờ gây tổn thương thính giác vĩnh viễn. Tai nghe: giữ âm lượng dưới 60%, không nghe quá 60 phút liên tục (quy tắc 60/60). Đeo nút tai ở nơi ồn (concert, công trường). 1.1 tỷ người trẻ có nguy cơ mất thính lực do tiếng ồn.",
    category: "general",
    tags: ["stress_level"],
    source: "WHO",
    relatedMetrics: ["stress_level"],
  },
  {
    id: "tip_074",
    title: "Bảo vệ mắt khi dùng máy tính",
    content:
      "Quy tắc 20-20-20: mỗi 20 phút, nhìn vật cách 20 feet (6m) trong 20 giây. Khoảng cách màn hình: 50-70cm, mắt ngang hoặc hơi nhìn xuống 15-20°. Độ sáng màn hình bằng ánh sáng xung quanh. Chớp mắt thường xuyên (bình thường 15-20 lần/phút, khi nhìn màn hình giảm còn 5-7 lần). Dùng nước mắt nhân tạo nếu khô mắt.",
    category: "general",
    tags: ["stress_level"],
    source: "American Academy of Ophthalmology",
    relatedMetrics: ["stress_level"],
  },
  {
    id: "tip_075",
    title: "Tư thế ngồi đúng khi làm việc",
    content:
      "Ghế: chân đặt phẳng trên sàn, đùi song song mặt đất, góc gối 90°. Lưng thẳng, tựa vào lưng ghế, vai thả lỏng. Khuỷu tay 90°, cổ tay thẳng khi gõ phím. Màn hình ngang tầm mắt, cách 50-70cm. Đứng dậy mỗi 30 phút. Tư thế sai gây đau lưng (80% người trưởng thành), đau cổ, và đau đầu.",
    category: "general",
    tags: ["stress_level", "steps"],
    source: "Occupational Safety and Health Administration",
    relatedMetrics: ["stress_level"],
  },
  {
    id: "tip_076",
    title: "Ngủ đủ giấc theo từng độ tuổi",
    content:
      "Trẻ sơ sinh (0-3 tháng): 14-17 giờ. Trẻ nhỏ (1-2 tuổi): 11-14 giờ. Trẻ em (3-5 tuổi): 10-13 giờ. Thiếu niên (6-13 tuổi): 9-11 giờ. Thanh thiếu niên (14-17 tuổi): 8-10 giờ. Người trưởng thành (18-64 tuổi): 7-9 giờ. Người cao tuổi (65+): 7-8 giờ. Chất lượng quan trọng không kém số lượng.",
    category: "general",
    tags: ["sleep_duration"],
    source: "National Sleep Foundation",
    relatedMetrics: ["sleep_duration"],
  },
  {
    id: "tip_077",
    title: "Sơ cứu cơ bản ai cũng nên biết",
    content:
      "CPR: 30 ấn ngực (sâu 5-6cm, tốc độ 100-120 lần/phút) + 2 lần thổi ngạt. Chảy máu: ấn chặt vết thương bằng vải sạch. Bỏng: ngâm nước mát 10-20 phút (không dùng đá). Nghẹn: Heimlich — đứng sau, ôm bụng, ấn mạnh lên trên. Gọi 115 ngay khi cần. Học khóa sơ cứu cơ bản 4-8 giờ.",
    category: "general",
    tags: ["heart_rate"],
    source: "American Red Cross",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_078",
    title: "Giữ vệ sinh an toàn thực phẩm",
    content:
      "4 nguyên tắc: Sạch (rửa tay, rửa rau quả), Tách (thớt riêng cho thịt sống/chín), Nấu chín (thịt gia cầm 74°C, thịt bò 63°C, trứng chín hoàn toàn), Bảo quản (tủ lạnh dưới 4°C trong 2 giờ sau nấu). Thực phẩm để ngoài quá 2 giờ (1 giờ nếu trên 32°C) nên bỏ đi.",
    category: "general",
    tags: ["heart_rate"],
    source: "WHO Food Safety",
    relatedMetrics: [],
  },
  {
    id: "tip_079",
    title: "Kiểm tra sức khỏe tâm thần định kỳ",
    content:
      "1/4 người sẽ gặp vấn đề sức khỏe tâm thần trong đời. Dấu hiệu cần chú ý: buồn bã kéo dài >2 tuần, mất hứng thú, thay đổi giấc ngủ/ăn uống, khó tập trung, suy nghĩ tiêu cực. Sàng lọc PHQ-9 (trầm cảm) và GAD-7 (lo âu) mỗi năm. Tìm kiếm hỗ trợ chuyên môn khi cần — đó là dấu hiệu của sức mạnh.",
    category: "general",
    tags: ["stress_level", "sleep_duration"],
    source: "WHO Mental Health",
    relatedMetrics: ["stress_level", "sleep_duration"],
  },
  {
    id: "tip_080",
    title: "Hạn chế rượu bia đúng mức",
    content:
      "Giới hạn an toàn: nam ≤2 đơn vị cồn/ngày, nữ ≤1 đơn vị/ngày. 1 đơn vị = 330ml bia 5% = 150ml rượu vang 12% = 45ml rượu mạnh 40%. Không uống ≥5 đơn vị/lần (binge drinking). Rượu tăng nguy cơ 7 loại ung thư, bệnh gan, và tổn thương não. Không có mức uống rượu nào là 'an toàn' cho sức khỏe.",
    category: "general",
    tags: ["heart_rate", "sleep_duration"],
    source: "WHO / Lancet",
    relatedMetrics: ["heart_rate", "sleep_duration"],
  },
  {
    id: "tip_081",
    title: "Theo dõi chỉ số đường huyết",
    content:
      "Đường huyết lúc đói bình thường: 70-100 mg/dL. Tiền tiểu đường: 100-125 mg/dL. Tiểu đường: ≥126 mg/dL. HbA1c bình thường: <5.7%, tiền tiểu đường: 5.7-6.4%, tiểu đường: ≥6.5%. Kiểm tra hàng năm từ 35 tuổi, sớm hơn nếu thừa cân hoặc có tiền sử gia đình. Triệu chứng: khát nhiều, tiểu nhiều, mệt mỏi, vết thương lâu lành.",
    category: "general",
    tags: ["heart_rate"],
    source: "American Diabetes Association",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_082",
    title: "Giữ ấm cơ thể đúng cách mùa lạnh",
    content:
      "Mặc nhiều lớp mỏng hiệu quả hơn 1 lớp dày: lớp trong thấm mồ hôi, lớp giữa giữ nhiệt, lớp ngoài chắn gió. Giữ ấm đầu, cổ, tay, chân — 40-45% nhiệt cơ thể mất qua đầu và cổ. Nhiệt độ phòng 20-22°C. Hạ thân nhiệt (<35°C) nguy hiểm: run, lú lẫn, buồn ngủ — gọi cấp cứu ngay.",
    category: "general",
    tags: ["heart_rate"],
    source: "CDC Cold Weather Safety",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_083",
    title: "Phòng tránh té ngã cho người cao tuổi",
    content:
      "Té ngã là nguyên nhân chấn thương hàng đầu ở người trên 65 tuổi. Phòng tránh: tập thăng bằng (đứng 1 chân 30 giây, Tai Chi), lắp tay vịn cầu thang và phòng tắm, đủ ánh sáng, dọn vật cản trên sàn, đi giày chống trượt, kiểm tra thị lực hàng năm, review thuốc gây chóng mặt.",
    category: "general",
    tags: ["steps", "heart_rate"],
    source: "CDC STEADI Program",
    relatedMetrics: ["steps"],
  },
  {
    id: "tip_084",
    title: "Tầm soát ung thư theo khuyến nghị",
    content:
      "Ung thư vú: mammogram mỗi 1-2 năm từ 40-50 tuổi. Ung thư cổ tử cung: Pap smear mỗi 3 năm từ 21 tuổi, HPV test mỗi 5 năm từ 30 tuổi. Ung thư đại trực tràng: nội soi mỗi 10 năm từ 45 tuổi. Ung thư phổi: CT liều thấp hàng năm cho người hút thuốc 50-80 tuổi, ≥20 pack-years.",
    category: "general",
    tags: ["heart_rate"],
    source: "American Cancer Society",
    relatedMetrics: [],
  },

  // ===== Thêm tips SLEEP =====
  {
    id: "tip_085",
    title: "Sử dụng tinh dầu lavender hỗ trợ ngủ",
    content:
      "Tinh dầu lavender giảm nhịp tim 2-3 nhịp/phút, hạ huyết áp nhẹ, và tăng sóng não delta (ngủ sâu) 20%. Nhỏ 2-3 giọt lên gối hoặc dùng máy khuếch tán 30 phút trước ngủ. Nghiên cứu cho thấy cải thiện chất lượng giấc ngủ 45% sau 4 tuần sử dụng đều đặn.",
    category: "sleep",
    tags: ["sleep_duration", "heart_rate"],
    source: "Journal of Alternative and Complementary Medicine",
    relatedMetrics: ["sleep_duration", "heart_rate"],
  },
  {
    id: "tip_086",
    title: "Magnesium giúp ngủ ngon hơn",
    content:
      "Magnesium kích hoạt hệ thần kinh phó giao cảm, giúp thư giãn cơ và não. Bổ sung 200-400mg magnesium glycinate hoặc citrate trước ngủ 1 giờ. Nguồn thực phẩm: hạt bí (150mg/30g), socola đen (65mg/30g), chuối (32mg/quả). Thiếu magnesium gây mất ngủ, chuột rút đêm, và chân không yên.",
    category: "sleep",
    tags: ["sleep_duration", "heart_rate"],
    source: "Journal of Research in Medical Sciences",
    relatedMetrics: ["sleep_duration", "heart_rate"],
  },

  // ===== Thêm tips HEART =====
  {
    id: "tip_087",
    title: "Đo huyết áp tại nhà đúng cách",
    content:
      "Ngồi yên 5 phút, lưng tựa ghế, chân không bắt chéo, tay đặt trên bàn ngang tim. Dùng máy đo bắp tay (chính xác hơn cổ tay). Đo 2 lần cách nhau 1 phút, lấy trung bình. Đo cùng giờ mỗi ngày, ghi lại kết quả. Chênh lệch >20 mmHg giữa 2 tay cần đi khám.",
    category: "heart",
    tags: ["heart_rate"],
    source: "European Society of Hypertension",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_088",
    title: "Nhận biết cơn đau tim",
    content:
      "Dấu hiệu: đau/nặng ngực kéo dài >5 phút, lan ra tay trái/hàm/lưng, khó thở, đổ mồ hôi lạnh, buồn nôn, chóng mặt. Phụ nữ có thể chỉ mệt bất thường, đau bụng trên, khó thở. Gọi 115 ngay — không tự lái xe. Nhai 1 viên aspirin 325mg (nếu không dị ứng) trong khi chờ cấp cứu.",
    category: "heart",
    tags: ["heart_rate", "spo2"],
    source: "American Heart Association",
    relatedMetrics: ["heart_rate"],
  },

  // ===== Thêm tips NUTRITION =====
  {
    id: "tip_089",
    title: "Ăn chậm nhai kỹ giúp kiểm soát cân nặng",
    content:
      "Nhai mỗi miếng 20-30 lần, dành 20-30 phút cho mỗi bữa ăn. Ăn chậm giảm 15% lượng calo tiêu thụ vì não cần 20 phút để nhận tín hiệu no. Đặt đũa/thìa xuống giữa các miếng. Tắt TV/điện thoại khi ăn — ăn phân tâm tăng 25-50% lượng thức ăn tiêu thụ.",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "American Journal of Clinical Nutrition",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_090",
    title: "Trà xanh — thức uống bảo vệ sức khỏe",
    content:
      "Trà xanh chứa catechin (EGCG) — chất chống oxy hóa mạnh. 3-5 tách/ngày (720-1200ml) giảm 26% nguy cơ bệnh tim, 28% nguy cơ tiểu đường type 2. Pha ở 70-80°C (không sôi) trong 2-3 phút. Uống giữa bữa ăn (không lúc đói). Hạn chế sau 16h vì chứa 25-50mg caffeine/tách.",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "European Journal of Clinical Nutrition",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_091",
    title: "Vitamin C tăng cường miễn dịch",
    content:
      "Nhu cầu: 75mg/ngày (nữ), 90mg/ngày (nam), người hút thuốc thêm 35mg. Nguồn: ổi (228mg/quả), ớt chuông đỏ (128mg/100g), cam (70mg/quả), kiwi (71mg/quả), bông cải xanh (89mg/100g). Vitamin C giảm 8% thời gian cảm lạnh ở người trưởng thành. Không cần bổ sung >2000mg/ngày — gây tiêu chảy.",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "National Institutes of Health",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_092",
    title: "Intermittent Fasting — nhịn ăn gián đoạn",
    content:
      "Phương pháp 16:8: ăn trong 8 giờ (VD: 12h-20h), nhịn 16 giờ. Giảm cân 3-8% trong 3-24 tuần, giảm insulin 20-31%, tăng hormone tăng trưởng 5 lần. Không phù hợp: phụ nữ mang thai, tiểu đường type 1, rối loạn ăn uống, trẻ em. Bắt đầu từ 12:12 rồi tăng dần. Uống nước, trà, cà phê đen trong giờ nhịn.",
    category: "nutrition",
    tags: ["heart_rate", "steps"],
    source: "New England Journal of Medicine",
    relatedMetrics: ["heart_rate"],
  },

  // ===== Thêm tips EXERCISE =====
  {
    id: "tip_093",
    title: "Plank — bài tập core hiệu quả nhất",
    content:
      "Plank tăng cường cơ bụng, lưng, vai mà không gây áp lực lên cột sống. Tư thế: cẳng tay và ngón chân chống, thân thẳng, bụng siết, không võng lưng. Bắt đầu: 3 set × 20 giây, tăng 5-10 giây/tuần. Mục tiêu: giữ 60-120 giây. Biến thể: side plank, plank with leg lift, plank to push-up.",
    category: "exercise",
    tags: ["steps", "heart_rate"],
    source: "American Council on Exercise",
    relatedMetrics: ["steps"],
  },
  {
    id: "tip_094",
    title: "Squat — vua của bài tập chân",
    content:
      "Squat tập 200+ cơ: đùi trước, đùi sau, mông, core. Kỹ thuật: chân rộng bằng vai, ngón chân hơi xoay ngoài 15-30°, hạ người như ngồi ghế, đầu gối không vượt quá ngón chân, đùi song song mặt đất. Bắt đầu bodyweight 3 set × 15 reps. Thêm tạ khi thành thạo. Tránh nếu đau gối cấp tính.",
    category: "exercise",
    tags: ["steps", "heart_rate"],
    source: "National Strength and Conditioning Association",
    relatedMetrics: ["steps", "heart_rate"],
  },
  {
    id: "tip_095",
    title: "Nhảy dây — cardio hiệu quả cao",
    content:
      "Nhảy dây 10 phút ≈ chạy bộ 30 phút về lượng calo đốt (100-150 calo/10 phút). Cải thiện phối hợp, mật độ xương, và sức bền tim mạch. Bắt đầu: 30 giây nhảy + 30 giây nghỉ × 10 set. Dây dài: đứng lên giữa dây, tay cầm ngang nách. Nhảy trên bề mặt mềm, đi giày có đệm.",
    category: "exercise",
    tags: ["steps", "heart_rate"],
    source: "British Journal of Sports Medicine",
    relatedMetrics: ["steps", "heart_rate"],
  },
  {
    id: "tip_096",
    title: "Tập thể dục khi mang thai an toàn",
    content:
      "Thai kỳ bình thường: 150 phút/tuần vận động cường độ vừa (đi bộ, bơi, yoga prenatal). Nhịp tim không quá 140 nhịp/phút. Tránh: nằm ngửa sau tam cá nguyệt 1, thể thao va chạm, tập ở nhiệt độ cao. Lợi ích: giảm 40% nguy cơ tiểu đường thai kỳ, giảm đau lưng, cải thiện tâm trạng, sinh dễ hơn.",
    category: "exercise",
    tags: ["heart_rate", "steps"],
    source: "American College of Obstetricians and Gynecologists",
    relatedMetrics: ["heart_rate", "steps"],
  },

  // ===== Thêm tips STRESS =====
  {
    id: "tip_097",
    title: "Box breathing — kỹ thuật thở của Navy SEALs",
    content:
      "Hít vào 4 giây → giữ 4 giây → thở ra 4 giây → giữ 4 giây. Lặp lại 4-8 chu kỳ. Được Navy SEALs sử dụng để giữ bình tĩnh trong tình huống căng thẳng cao. Giảm cortisol, ổn định nhịp tim, tăng tập trung trong 2-3 phút. Thực hành trước cuộc họp quan trọng, kỳ thi, hoặc khi lo lắng.",
    category: "stress",
    tags: ["stress_level", "heart_rate", "hrv"],
    source: "Mark Divine / Navy SEAL Training",
    relatedMetrics: ["stress_level", "heart_rate"],
  },
  {
    id: "tip_098",
    title: "Nuôi thú cưng giảm stress và cô đơn",
    content:
      "Vuốt ve chó/mèo 15 phút giảm cortisol 23% và tăng oxytocin (hormone gắn kết). Chủ nuôi chó đi bộ thêm 2.760 bước/ngày. Nuôi thú cưng giảm 36% nguy cơ bệnh tim mạch, giảm huyết áp 2-4 mmHg, và giảm cô đơn đáng kể. Nếu không nuôi được, tình nguyện tại trại cứu hộ động vật.",
    category: "stress",
    tags: ["stress_level", "heart_rate", "steps"],
    source: "American Heart Association",
    relatedMetrics: ["stress_level", "heart_rate", "steps"],
  },
  {
    id: "tip_099",
    title: "Journaling — viết để giải tỏa cảm xúc",
    content:
      "Viết tự do 15-20 phút/ngày về suy nghĩ và cảm xúc giảm 28% triệu chứng lo âu, cải thiện miễn dịch, và giảm số lần đi khám bệnh 50%. Không cần viết đẹp hay logic — chỉ cần viết liên tục. Expressive writing (viết về trải nghiệm khó khăn) đặc biệt hiệu quả. Đốt hoặc xé bỏ sau khi viết nếu muốn.",
    category: "stress",
    tags: ["stress_level"],
    source: "James Pennebaker / University of Texas",
    relatedMetrics: ["stress_level"],
  },
  {
    id: "tip_100",
    title: "Digital detox — ngắt kết nối để nạp năng lượng",
    content:
      "Dành 1 ngày/tuần hoặc 2-4 giờ/ngày không dùng thiết bị điện tử. Tắt thông báo không cần thiết (giữ lại cuộc gọi, tin nhắn quan trọng). Người kiểm tra điện thoại trung bình 96 lần/ngày — mỗi lần mất 23 phút để lấy lại tập trung. Thay bằng: đọc sách, nấu ăn, đi dạo, trò chuyện trực tiếp.",
    category: "stress",
    tags: ["stress_level", "sleep_duration"],
    source: "American Psychological Association",
    relatedMetrics: ["stress_level", "sleep_duration"],
  },

  // ===== Thêm tips GENERAL =====
  {
    id: "tip_101",
    title: "Uống thuốc đúng cách",
    content:
      "Đọc kỹ hướng dẫn: trước/sau ăn, liều lượng, tương tác thuốc. Không tự ý dừng kháng sinh khi thấy đỡ — uống đủ liệu trình (thường 5-14 ngày). Không dùng thuốc hết hạn. Bảo quản đúng nhiệt độ (thường 15-25°C, một số cần tủ lạnh). Thông báo bác sĩ tất cả thuốc đang dùng kể cả thực phẩm chức năng.",
    category: "general",
    tags: ["heart_rate"],
    source: "WHO Medication Safety",
    relatedMetrics: [],
  },
  {
    id: "tip_102",
    title: "Phòng chống muỗi và bệnh truyền qua muỗi",
    content:
      "Sốt xuất huyết, Zika, sốt rét lây qua muỗi. Phòng tránh: dùng kem chống muỗi DEET 20-30%, mặc áo dài tay sáng màu, ngủ màn, loại bỏ nước đọng (lọ hoa, chậu cây, lốp xe cũ). Muỗi Aedes (sốt xuất huyết) đốt ban ngày, muỗi Anopheles (sốt rét) đốt ban đêm.",
    category: "general",
    tags: ["heart_rate"],
    source: "WHO Vector Control",
    relatedMetrics: [],
  },
  {
    id: "tip_103",
    title: "An toàn giao thông bảo vệ tính mạng",
    content:
      "Tai nạn giao thông là nguyên nhân tử vong hàng đầu ở người 5-29 tuổi. Luôn thắt dây an toàn (giảm 45% nguy cơ tử vong). Đội mũ bảo hiểm đạt chuẩn (giảm 42% nguy cơ tử vong khi đi xe máy). Không dùng điện thoại khi lái xe (tăng 4 lần nguy cơ tai nạn). Không uống rượu bia khi lái xe.",
    category: "general",
    tags: ["heart_rate"],
    source: "WHO Road Safety",
    relatedMetrics: [],
  },
  {
    id: "tip_104",
    title: "Chất lượng không khí ảnh hưởng sức khỏe",
    content:
      "Ô nhiễm không khí gây 7 triệu ca tử vong/năm toàn cầu. AQI (chỉ số chất lượng không khí): 0-50 tốt, 51-100 trung bình, 101-150 không tốt cho nhóm nhạy cảm, >150 không tốt cho tất cả. Khi AQI >100: hạn chế ra ngoài, đóng cửa sổ, dùng máy lọc không khí HEPA, đeo khẩu trang N95 khi ra ngoài.",
    category: "general",
    tags: ["spo2", "heart_rate"],
    source: "WHO Air Quality Guidelines",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_105",
    title: "Ergonomics — thiết lập bàn làm việc đúng cách",
    content:
      "Bàn đứng/ngồi xen kẽ: đứng 15-30 phút mỗi giờ. Chiều cao bàn: khuỷu tay 90° khi gõ phím. Chuột gần bàn phím, không vươn tay. Màn hình: cạnh trên ngang tầm mắt, nghiêng 10-20°. Dùng giá đỡ laptop nếu dùng laptop. Đầu tư ghế ergonomic có hỗ trợ thắt lưng — giảm 50% đau lưng.",
    category: "general",
    tags: ["stress_level", "steps"],
    source: "Occupational Safety and Health Administration",
    relatedMetrics: ["stress_level"],
  },

  // ===== Thêm tips đa dạng =====
  {
    id: "tip_106",
    title: "Kẽm tăng cường miễn dịch và phục hồi",
    content:
      "Nhu cầu: 8mg/ngày (nữ), 11mg/ngày (nam). Kẽm giảm 33% thời gian cảm lạnh nếu bổ sung trong 24 giờ đầu. Nguồn: hàu (74mg/100g — nguồn giàu nhất), thịt bò (4.8mg/100g), hạt bí (7.8mg/100g), đậu lăng (1.3mg/100g). Không bổ sung >40mg/ngày — gây buồn nôn và ức chế hấp thu đồng.",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "National Institutes of Health",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_107",
    title: "Tập Tai Chi cho người cao tuổi",
    content:
      "Tai Chi giảm 43% nguy cơ té ngã ở người trên 65 tuổi, cải thiện thăng bằng 25%, giảm đau khớp, hạ huyết áp 9/5 mmHg. Động tác chậm, nhẹ nhàng, phù hợp mọi thể trạng. Tập 2-3 lần/tuần, mỗi lần 30-60 phút. Bắt đầu với lớp học có hướng dẫn viên. Hiệu quả tương đương tập thể dục cường độ vừa.",
    category: "exercise",
    tags: ["steps", "heart_rate", "hrv"],
    source: "Journal of the American Geriatrics Society",
    relatedMetrics: ["steps", "heart_rate"],
  },
  {
    id: "tip_108",
    title: "Giấc ngủ và hệ miễn dịch",
    content:
      "Ngủ dưới 6 giờ/đêm tăng 4.2 lần nguy cơ cảm lạnh so với ngủ 7+ giờ. Trong giấc ngủ sâu, cơ thể sản xuất cytokine (protein chống viêm) và tế bào T (miễn dịch). Thiếu ngủ 1 đêm giảm 70% hoạt động tế bào NK (diệt tế bào ung thư). Ưu tiên giấc ngủ như ưu tiên tập thể dục và dinh dưỡng.",
    category: "sleep",
    tags: ["sleep_duration", "heart_rate"],
    source: "Sleep Journal / Matthew Walker",
    relatedMetrics: ["sleep_duration", "heart_rate"],
  },
  {
    id: "tip_109",
    title: "Tác hại của ngồi lâu — 'sitting is the new smoking'",
    content:
      "Ngồi trên 6 giờ/ngày tăng 18% nguy cơ tử vong do bệnh tim, 7.5% do ung thư. Mỗi giờ ngồi liên tục giảm 22 phút tuổi thọ. Giải pháp: bàn đứng, họp đi bộ, đi cầu thang thay thang máy, đỗ xe xa hơn, đứng khi nghe điện thoại. Mục tiêu: không ngồi liên tục quá 30 phút.",
    category: "exercise",
    tags: ["steps", "heart_rate"],
    source: "Lancet Physical Activity Series",
    relatedMetrics: ["steps", "heart_rate"],
  },
  {
    id: "tip_110",
    title: "Collagen cho da và khớp",
    content:
      "Từ 25 tuổi, cơ thể giảm sản xuất collagen 1-1.5%/năm. Bổ sung 2.5-15g collagen peptide/ngày cải thiện độ đàn hồi da 15% sau 8 tuần, giảm đau khớp 24% sau 24 tuần. Nguồn: nước hầm xương (12 giờ), da cá, chân gà. Kết hợp vitamin C để tổng hợp collagen hiệu quả.",
    category: "nutrition",
    tags: ["steps"],
    source: "Nutrients Journal",
    relatedMetrics: ["steps"],
  },
  {
    id: "tip_111",
    title: "Tập thể dục cải thiện trí nhớ và não bộ",
    content:
      "Tập aerobic 30 phút tăng BDNF (yếu tố dinh dưỡng thần kinh) 32%, kích thích tạo neuron mới ở hippocampus (vùng trí nhớ). Người tập thể dục đều đặn có hippocampus lớn hơn 2% và trí nhớ tốt hơn 20%. Giảm 30% nguy cơ sa sút trí tuệ. Hiệu quả nhất: kết hợp cardio + tập sức mạnh + bài tập phối hợp.",
    category: "exercise",
    tags: ["steps", "heart_rate", "hrv"],
    source: "British Journal of Sports Medicine",
    relatedMetrics: ["steps", "heart_rate"],
  },
  {
    id: "tip_112",
    title: "Quản lý cơn giận đúng cách",
    content:
      "Khi tức giận: dừng lại, hít thở sâu 10 lần, đếm từ 1-10 trước khi phản ứng. Kỹ thuật STOP: Stop (dừng), Take a breath (hít thở), Observe (quan sát cảm xúc), Proceed (hành động có ý thức). Tức giận mãn tính tăng 19% nguy cơ bệnh tim. Tập thể dục, viết nhật ký, hoặc nói chuyện với người tin tưởng để giải tỏa.",
    category: "stress",
    tags: ["stress_level", "heart_rate"],
    source: "American Psychological Association",
    relatedMetrics: ["stress_level", "heart_rate"],
  },
  {
    id: "tip_113",
    title: "Chế độ ăn Địa Trung Hải — lành mạnh nhất thế giới",
    content:
      "Giảm 30% nguy cơ bệnh tim, 25% nguy cơ tiểu đường type 2. Nguyên tắc: nhiều rau quả (7-10 phần/ngày), dầu ô liu (2-4 thìa canh/ngày), cá 2-3 lần/tuần, ngũ cốc nguyên hạt, đậu, hạt. Hạn chế: thịt đỏ (1-2 lần/tháng), đường, thực phẩm chế biến. Rượu vang đỏ vừa phải (tùy chọn, 1 ly/ngày).",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "New England Journal of Medicine",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_114",
    title: "Stretching buổi sáng khởi động ngày mới",
    content:
      "5-10 phút stretching sau khi thức dậy tăng lưu thông máu, giảm cứng cơ, và cải thiện tâm trạng. Bài tập: Cat-Cow (4-5 lần), Child's Pose (30 giây), Standing Forward Fold (30 giây), Neck Rolls (mỗi bên 5 vòng), Shoulder Rolls (10 lần). Không kéo giãn quá mức khi cơ thể còn lạnh.",
    category: "exercise",
    tags: ["steps", "heart_rate"],
    source: "American Council on Exercise",
    relatedMetrics: ["steps"],
  },
  {
    id: "tip_115",
    title: "Giấc ngủ và kiểm soát cân nặng",
    content:
      "Ngủ dưới 7 giờ tăng 41% nguy cơ béo phì. Thiếu ngủ tăng ghrelin (hormone đói) 28% và giảm leptin (hormone no) 18%, khiến bạn ăn thêm 300-400 calo/ngày. Ngủ đủ giấc giúp kiểm soát cân nặng hiệu quả hơn chỉ ăn kiêng. Ưu tiên ngủ 7-9 giờ khi đang giảm cân.",
    category: "sleep",
    tags: ["sleep_duration", "steps"],
    source: "Annals of Internal Medicine",
    relatedMetrics: ["sleep_duration", "steps"],
  },
  {
    id: "tip_116",
    title: "Tầm quan trọng của vitamin B12",
    content:
      "Nhu cầu: 2.4 mcg/ngày. Thiếu B12 gây thiếu máu, mệt mỏi, tê tay chân, suy giảm trí nhớ. Nhóm nguy cơ cao: người ăn chay/vegan, người trên 50 tuổi (giảm hấp thu), người dùng metformin. Nguồn: gan bò (70 mcg/100g), cá hồi (4.7 mcg/100g), trứng (1.1 mcg/quả), sữa (1.2 mcg/ly). Người ăn chay cần bổ sung.",
    category: "nutrition",
    tags: ["heart_rate", "spo2"],
    source: "National Institutes of Health",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_117",
    title: "Tập thể dục khi bị cảm — nên hay không?",
    content:
      "Quy tắc 'trên cổ': triệu chứng trên cổ (sổ mũi, nghẹt mũi, đau họng nhẹ) → có thể tập nhẹ 50% cường độ. Triệu chứng dưới cổ (ho, đau ngực, sốt, đau cơ, mệt mỏi) → nghỉ hoàn toàn. Sốt >38°C: tuyệt đối không tập — tăng nguy cơ viêm cơ tim. Quay lại tập từ từ sau khi hết triệu chứng 2-3 ngày.",
    category: "exercise",
    tags: ["heart_rate", "steps"],
    source: "American College of Sports Medicine",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_118",
    title: "Burnout — nhận biết và phòng tránh kiệt sức",
    content:
      "3 dấu hiệu burnout: kiệt sức về thể chất/cảm xúc, hoài nghi/xa cách công việc, giảm hiệu suất. Phòng tránh: đặt ranh giới công việc-cuộc sống (không check email sau 20h), nghỉ phép đều đặn, nói 'không' khi quá tải, duy trì sở thích ngoài công việc, ngủ đủ giấc, tập thể dục. Tìm hỗ trợ chuyên môn nếu kéo dài >2 tuần.",
    category: "stress",
    tags: ["stress_level", "sleep_duration", "heart_rate"],
    source: "WHO / ICD-11",
    relatedMetrics: ["stress_level", "sleep_duration"],
  },
  {
    id: "tip_119",
    title: "Chống lão hóa bằng lối sống lành mạnh",
    content:
      "5 trụ cột chống lão hóa: 1) Tập thể dục 150+ phút/tuần (giảm tuổi sinh học 9 năm), 2) Ngủ 7-8 giờ, 3) Chế độ ăn giàu chất chống oxy hóa (rau quả đa màu sắc), 4) Quản lý stress (thiền, yoga), 5) Kết nối xã hội. Telomere (đầu nhiễm sắc thể) dài hơn ở người có lối sống lành mạnh — chỉ báo tuổi sinh học.",
    category: "general",
    tags: ["steps", "heart_rate", "sleep_duration", "stress_level"],
    source: "Lancet Healthy Longevity",
    relatedMetrics: ["steps", "heart_rate", "sleep_duration", "stress_level"],
  },
  {
    id: "tip_120",
    title: "Đo và theo dõi vòng eo — chỉ số quan trọng",
    content:
      "Vòng eo phản ánh mỡ nội tạng chính xác hơn BMI. Nguy cơ cao: nam >90cm, nữ >80cm (tiêu chuẩn châu Á). Tỷ lệ eo/hông: nam <0.9, nữ <0.85. Đo: đứng thẳng, thở ra nhẹ, đo ngang rốn. Mỡ nội tạng tăng nguy cơ tiểu đường 5 lần, bệnh tim 2 lần. Giảm vòng eo bằng: cardio + giảm đường + ngủ đủ.",
    category: "general",
    tags: ["steps", "heart_rate"],
    source: "International Diabetes Federation",
    relatedMetrics: ["steps", "heart_rate"],
  },

  // ===== Thêm tips bổ sung =====
  {
    id: "tip_121",
    title: "Curcumin (nghệ) — chất chống viêm tự nhiên",
    content:
      "Curcumin trong nghệ có tác dụng chống viêm tương đương một số thuốc kháng viêm. Liều hiệu quả: 500-2000mg curcumin/ngày. Hấp thu kém — tăng 2000% khi dùng cùng piperine (hạt tiêu đen). 1 thìa cà phê bột nghệ ≈ 200mg curcumin. Thêm nghệ vào cà ri, sữa nghệ (golden milk), hoặc smoothie.",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "Journal of Medicinal Food",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_122",
    title: "Walking meeting — họp đi bộ tăng sáng tạo",
    content:
      "Nghiên cứu Stanford: đi bộ tăng tư duy sáng tạo 60%. Walking meeting phù hợp cho: brainstorm, 1-on-1, cuộc họp 2-3 người. Đi bộ 15-30 phút trong khuôn viên công ty hoặc công viên gần. Kết hợp: tăng bước chân, giảm stress, cải thiện quan hệ đồng nghiệp. Ghi chú bằng voice memo.",
    category: "exercise",
    tags: ["steps", "stress_level"],
    source: "Stanford University Research",
    relatedMetrics: ["steps", "stress_level"],
  },
  {
    id: "tip_123",
    title: "Melatonin — hormone giấc ngủ",
    content:
      "Melatonin tự nhiên tiết ra khi trời tối, đạt đỉnh 2-4h sáng. Bổ sung melatonin (0.5-3mg, 30-60 phút trước ngủ) giúp jet lag, làm ca đêm, hoặc khó ngủ. Không dùng dài hạn >3 tháng mà không có chỉ định bác sĩ. Tăng melatonin tự nhiên: tắt đèn sáng buổi tối, tiếp xúc ánh sáng buổi sáng, tránh màn hình xanh.",
    category: "sleep",
    tags: ["sleep_duration"],
    source: "National Sleep Foundation",
    relatedMetrics: ["sleep_duration"],
  },
  {
    id: "tip_124",
    title: "Huyết áp thấp — khi nào cần lo?",
    content:
      "Huyết áp thấp: <90/60 mmHg. Triệu chứng: chóng mặt khi đứng dậy, mờ mắt, mệt mỏi, ngất. Nguyên nhân: mất nước, thiếu máu, bệnh tim, thuốc. Xử lý: uống đủ nước, ăn mặn hơn (nếu không tăng huyết áp), đứng dậy từ từ, mang vớ nén. Huyết áp thấp không triệu chứng thường không nguy hiểm.",
    category: "heart",
    tags: ["heart_rate"],
    source: "Mayo Clinic",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_125",
    title: "Tập thể dục cho người tiểu đường",
    content:
      "Tập thể dục giảm HbA1c 0.5-0.7% (tương đương 1 loại thuốc). Kết hợp: aerobic 150 phút/tuần + tập sức mạnh 2-3 lần/tuần. Kiểm tra đường huyết trước tập: <100 mg/dL → ăn nhẹ 15-30g carb. >250 mg/dL → không tập. Mang theo đường/nước trái cây phòng hạ đường huyết. Tập sau bữa ăn 1-2 giờ hiệu quả nhất.",
    category: "exercise",
    tags: ["heart_rate", "steps"],
    source: "American Diabetes Association",
    relatedMetrics: ["heart_rate", "steps"],
  },
  {
    id: "tip_126",
    title: "Gratitude walk — đi bộ biết ơn",
    content:
      "Kết hợp đi bộ 20 phút + suy nghĩ về 3-5 điều biết ơn. Nghiên cứu cho thấy giảm cortisol 23%, tăng serotonin, cải thiện tâm trạng kéo dài 6 giờ. Thực hành: đi bộ chậm trong công viên, chú ý 5 giác quan (nhìn, nghe, ngửi, chạm, nếm), nghĩ về người/việc bạn biết ơn. Hiệu quả gấp đôi so với chỉ đi bộ hoặc chỉ biết ơn.",
    category: "stress",
    tags: ["stress_level", "steps", "heart_rate"],
    source: "Positive Psychology Research",
    relatedMetrics: ["stress_level", "steps"],
  },
  {
    id: "tip_127",
    title: "Electrolyte — cân bằng điện giải",
    content:
      "Điện giải chính: natri (136-145 mEq/L), kali (3.5-5.0 mEq/L), magnesium, canxi. Mất cân bằng gây: chuột rút, mệt mỏi, nhịp tim bất thường, chóng mặt. Bổ sung khi: tập >60 phút, đổ mồ hôi nhiều, tiêu chảy, nôn. Nước dừa là nguồn điện giải tự nhiên (600mg kali/quả). Tránh nước tăng lực có nhiều đường và caffeine.",
    category: "nutrition",
    tags: ["heart_rate", "steps"],
    source: "American College of Sports Medicine",
    relatedMetrics: ["heart_rate", "steps"],
  },
  {
    id: "tip_128",
    title: "Giấc ngủ và sức khỏe tim mạch",
    content:
      "Ngủ dưới 6 giờ hoặc trên 9 giờ đều tăng nguy cơ bệnh tim 20-30%. Ngủ không đủ tăng huyết áp, viêm mạch máu, và kháng insulin. Ngưng thở khi ngủ (OSA) ảnh hưởng 10-30% người trưởng thành, tăng 2-3 lần nguy cơ đột quỵ. Dấu hiệu OSA: ngáy to, ngưng thở khi ngủ, buồn ngủ ban ngày, đau đầu sáng.",
    category: "sleep",
    tags: ["sleep_duration", "heart_rate", "spo2"],
    source: "European Heart Journal",
    relatedMetrics: ["sleep_duration", "heart_rate"],
  },
  {
    id: "tip_129",
    title: "Tập cơ sàn chậu (Kegel) cho cả nam và nữ",
    content:
      "Cơ sàn chậu yếu gây: tiểu không tự chủ (30% phụ nữ sau sinh), giảm chức năng tình dục. Bài tập Kegel: siết cơ sàn chậu (như nhịn tiểu) 5 giây, thả 5 giây, lặp 10 lần × 3 set/ngày. Tăng dần lên 10 giây. Hiệu quả sau 4-6 tuần. Tập mọi lúc mọi nơi — không ai biết bạn đang tập.",
    category: "exercise",
    tags: ["steps"],
    source: "Mayo Clinic",
    relatedMetrics: ["steps"],
  },
  {
    id: "tip_130",
    title: "Chế độ ăn DASH hạ huyết áp",
    content:
      "DASH (Dietary Approaches to Stop Hypertension) hạ huyết áp 8-14 mmHg. Nguyên tắc: 4-5 phần rau/ngày, 4-5 phần quả/ngày, 2-3 phần sữa ít béo, ngũ cốc nguyên hạt 6-8 phần, thịt nạc ≤6 phần, hạt/đậu 4-5 phần/tuần. Giới hạn: natri <2300mg, đường, chất béo bão hòa. Kết hợp giảm cân nếu thừa cân.",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "National Heart, Lung, and Blood Institute",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_131",
    title: "Foam rolling — tự massage giảm đau cơ",
    content:
      "Foam rolling 10-15 phút sau tập giảm đau cơ (DOMS) 50%, tăng phạm vi vận động 10-15%. Kỹ thuật: lăn chậm trên nhóm cơ, dừng 20-30 giây ở điểm đau. Áp lực vừa phải — đau nhẹ chấp nhận được, đau nhiều thì giảm áp lực. Tránh lăn trực tiếp lên khớp, xương, và vùng bị thương.",
    category: "exercise",
    tags: ["steps", "heart_rate"],
    source: "Journal of Athletic Training",
    relatedMetrics: ["steps"],
  },
  {
    id: "tip_132",
    title: "Giảm stress bằng nghệ thuật trị liệu",
    content:
      "Vẽ, tô màu, nặn đất sét, hoặc làm thủ công 45 phút giảm cortisol 75% — bất kể có kỹ năng nghệ thuật hay không. Sách tô màu cho người lớn (mandala) giảm lo âu tương đương thiền. Viết thư pháp, chụp ảnh, làm vườn cũng có tác dụng tương tự. Quan trọng là quá trình, không phải kết quả.",
    category: "stress",
    tags: ["stress_level"],
    source: "Art Therapy: Journal of the American Art Therapy Association",
    relatedMetrics: ["stress_level"],
  },
  {
    id: "tip_133",
    title: "Phòng ngừa loãng xương từ sớm",
    content:
      "Mật độ xương đạt đỉnh ở tuổi 30, sau đó giảm 1-2%/năm (phụ nữ sau mãn kinh giảm 3-5%/năm). Phòng ngừa: canxi 1000-1200mg/ngày, vitamin D 600-800 IU/ngày, tập chịu trọng lượng (đi bộ, chạy, nhảy, tập tạ), hạn chế rượu và thuốc lá. Đo mật độ xương DEXA từ 65 tuổi (nữ) hoặc 70 tuổi (nam).",
    category: "general",
    tags: ["steps"],
    source: "National Osteoporosis Foundation",
    relatedMetrics: ["steps"],
  },
  {
    id: "tip_134",
    title: "Ăn cá 2-3 lần/tuần bảo vệ não và tim",
    content:
      "Cá béo (cá hồi, cá thu, cá mòi, cá trích) giàu omega-3 DHA — chiếm 40% chất béo trong não. Ăn cá 2-3 lần/tuần giảm 36% nguy cơ Alzheimer, 17% nguy cơ đột quỵ. Mỗi phần 100-150g. Nướng hoặc hấp tốt hơn chiên. Hạn chế cá có thủy ngân cao: cá kiếm, cá mập, cá ngừ đại dương (đặc biệt phụ nữ mang thai).",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "American Heart Association",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_135",
    title: "Tập thể dục buổi sáng vs buổi tối",
    content:
      "Buổi sáng (6-10h): tăng trao đổi chất cả ngày, cải thiện tập trung, dễ duy trì thói quen. Buổi chiều/tối (16-20h): sức mạnh cơ đạt đỉnh, phản xạ nhanh hơn, ít chấn thương hơn. Tránh tập cường độ cao trong 2 giờ trước ngủ (tăng cortisol, khó ngủ). Thời điểm tốt nhất = thời điểm bạn tập đều đặn nhất.",
    category: "exercise",
    tags: ["steps", "heart_rate", "sleep_duration"],
    source: "Journal of Physiology",
    relatedMetrics: ["steps", "heart_rate", "sleep_duration"],
  },
  {
    id: "tip_136",
    title: "Hạn chế muối trong chế độ ăn",
    content:
      "Người Việt tiêu thụ trung bình 9-10g muối/ngày — gấp đôi khuyến nghị WHO (5g/ngày). Giảm muối: nấu ăn ít muối hơn 1/3, thay bằng gia vị (tỏi, gừng, sả, tiêu), hạn chế nước mắm/nước tương (1 thìa canh nước mắm ≈ 1.5g muối), tránh đồ muối chua, mì gói (1 gói ≈ 4-5g muối).",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "WHO / Bộ Y tế Việt Nam",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_137",
    title: "Cải thiện giấc ngủ bằng white noise",
    content:
      "White noise (tiếng ồn trắng) che lấp tiếng ồn đột ngột, giúp ngủ nhanh hơn 38% và giảm thức giấc giữa đêm. Các loại: tiếng mưa, tiếng quạt, tiếng sóng biển, tiếng rừng. Âm lượng 50-60 dB (bằng cuộc trò chuyện nhẹ). Dùng app hoặc máy phát white noise. Pink noise (bass nhiều hơn) có thể tăng giấc ngủ sâu 25%.",
    category: "sleep",
    tags: ["sleep_duration"],
    source: "Sleep Medicine Reviews",
    relatedMetrics: ["sleep_duration"],
  },
  {
    id: "tip_138",
    title: "Tác dụng của tỏi với sức khỏe tim mạch",
    content:
      "Tỏi chứa allicin — chất chống oxy hóa và kháng viêm mạnh. 1-2 tép tỏi sống/ngày hoặc 600-1200mg chiết xuất tỏi giảm cholesterol tổng 10-15%, hạ huyết áp 7-8/5 mmHg. Nghiền hoặc băm tỏi, để 10 phút trước khi nấu để allicin hình thành. Tỏi đen (lên men) dễ ăn hơn và giữ được hoạt chất.",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "Journal of Nutrition",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_139",
    title: "Tập thể dục với bạn bè tăng động lực",
    content:
      "Tập cùng bạn tăng 200% khả năng duy trì thói quen tập thể dục. Accountability partner giúp bạn tập đều đặn hơn 95%. Tham gia nhóm chạy, lớp yoga, đội bóng, hoặc thách thức fitness với bạn bè. Chia sẻ mục tiêu và tiến độ. Tập nhóm cũng giảm stress và tăng kết nối xã hội.",
    category: "exercise",
    tags: ["steps", "heart_rate", "stress_level"],
    source: "Journal of Social Sciences",
    relatedMetrics: ["steps", "stress_level"],
  },
  {
    id: "tip_140",
    title: "Hít thở bụng (diaphragmatic breathing)",
    content:
      "Hít thở bụng kích hoạt dây thần kinh phế vị, giảm nhịp tim 5-10 nhịp/phút, tăng HRV 15%. Kỹ thuật: nằm ngửa, tay đặt trên bụng, hít vào bằng mũi 4 giây (bụng phồng lên), thở ra bằng miệng 6 giây (bụng xẹp xuống). 5-10 phút/ngày. Hiệu quả cho: lo âu, panic attack, đau mãn tính, huyết áp cao.",
    category: "stress",
    tags: ["stress_level", "heart_rate", "hrv"],
    source: "Frontiers in Human Neuroscience",
    relatedMetrics: ["stress_level", "heart_rate"],
  },
  {
    id: "tip_141",
    title: "Bảo vệ sức khỏe khi đi máy bay",
    content:
      "Cabin máy bay có độ ẩm 10-20% (bình thường 40-60%) và áp suất tương đương độ cao 1.800-2.400m. Uống 250ml nước mỗi giờ bay. Đứng dậy đi lại mỗi 2 giờ để phòng huyết khối tĩnh mạch sâu (DVT). Mang vớ nén nếu bay >4 giờ. Dùng nước muối sinh lý xịt mũi. Đeo khẩu trang giảm 50% nguy cơ nhiễm trùng hô hấp.",
    category: "general",
    tags: ["heart_rate", "spo2", "steps"],
    source: "WHO Travel Health",
    relatedMetrics: ["heart_rate", "spo2"],
  },
  {
    id: "tip_142",
    title: "Ngũ cốc nguyên hạt giảm nguy cơ bệnh mãn tính",
    content:
      "3 phần ngũ cốc nguyên hạt/ngày giảm 22% nguy cơ bệnh tim, 26% nguy cơ tiểu đường type 2, 21% nguy cơ ung thư đại trực tràng. 1 phần = 1 lát bánh mì nguyên cám, 1/2 chén cơm gạo lứt, 1/2 chén yến mạch. Chọn sản phẩm có 'whole grain' là thành phần đầu tiên. Gạo lứt, quinoa, lúa mạch, kiều mạch đều là ngũ cốc nguyên hạt.",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "BMJ Research",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_143",
    title: "Tập deadlift đúng kỹ thuật",
    content:
      "Deadlift tập toàn thân: lưng dưới, mông, đùi sau, core, cẳng tay. Kỹ thuật: chân rộng bằng hông, thanh tạ sát ống chân, lưng thẳng (không cong), hít vào siết bụng, đẩy hông về trước để nâng. Bắt đầu với thanh tạ không (20kg) hoặc tạ nhẹ. Tăng 2.5-5kg/tuần. Sai kỹ thuật gây chấn thương lưng nghiêm trọng.",
    category: "exercise",
    tags: ["steps", "heart_rate"],
    source: "National Strength and Conditioning Association",
    relatedMetrics: ["steps"],
  },
  {
    id: "tip_144",
    title: "Giấc ngủ và hormone tăng trưởng",
    content:
      "70-80% hormone tăng trưởng (GH) tiết trong giấc ngủ sâu (giai đoạn N3), đạt đỉnh trong 1-2 giờ đầu sau khi ngủ. GH cần thiết cho: phục hồi cơ, đốt mỡ, tái tạo tế bào, tăng cường miễn dịch. Tối ưu GH: ngủ trước 23h, phòng tối hoàn toàn, không ăn 2-3 giờ trước ngủ, tập thể dục cường độ cao ban ngày.",
    category: "sleep",
    tags: ["sleep_duration", "heart_rate"],
    source: "Endocrine Reviews",
    relatedMetrics: ["sleep_duration"],
  },
  {
    id: "tip_145",
    title: "Phòng chống say nắng và sốc nhiệt",
    content:
      "Say nắng: nhiệt độ cơ thể >40°C, da nóng đỏ khô, lú lẫn, co giật — cấp cứu ngay. Phòng tránh: uống 200-300ml nước mỗi 20 phút khi ngoài trời nóng, mặc áo sáng màu thoáng mát, tránh hoạt động ngoài trời 11h-15h, nghỉ mát thường xuyên. Sơ cứu: đưa vào bóng mát, làm mát bằng nước/quạt, gọi 115.",
    category: "general",
    tags: ["heart_rate", "spo2"],
    source: "CDC Heat Safety",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_146",
    title: "Tác dụng của giấm táo với sức khỏe",
    content:
      "1-2 thìa canh giấm táo (15-30ml) pha trong 200ml nước trước bữa ăn giảm đường huyết sau ăn 20-34%, hỗ trợ giảm cân 1-2kg sau 12 tuần. Không uống nguyên chất (gây tổn thương men răng và thực quản). Không dùng nếu đang uống thuốc tiểu đường hoặc thuốc lợi tiểu. Chọn giấm táo có 'mother' (cặn lên men).",
    category: "nutrition",
    tags: ["heart_rate"],
    source: "European Journal of Clinical Nutrition",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_147",
    title: "Tập push-up đánh giá sức khỏe tim mạch",
    content:
      "Nghiên cứu Harvard: nam giới làm được >40 push-ups có nguy cơ bệnh tim thấp hơn 96% so với người làm <10. Push-up đúng: tay rộng bằng vai, thân thẳng, hạ ngực cách sàn 5cm, đẩy lên hết tay. Bắt đầu: push-up trên tường → trên ghế → trên sàn (đầu gối) → full push-up. Mục tiêu: 3 set × 10-15 reps.",
    category: "exercise",
    tags: ["heart_rate", "steps"],
    source: "JAMA Network Open",
    relatedMetrics: ["heart_rate"],
  },
  {
    id: "tip_148",
    title: "Caffeine nap — giấc ngủ trưa siêu hiệu quả",
    content:
      "Uống 1 ly cà phê (100-200mg caffeine) rồi ngủ ngay 15-20 phút. Caffeine mất 20 phút để có tác dụng — khi thức dậy, cả giấc ngủ ngắn và caffeine cùng phát huy. Nghiên cứu: cải thiện tỉnh táo và hiệu suất hơn chỉ ngủ trưa hoặc chỉ uống cà phê. Chỉ áp dụng trước 14h để không ảnh hưởng giấc ngủ đêm.",
    category: "sleep",
    tags: ["sleep_duration", "heart_rate"],
    source: "Clinical Neurophysiology",
    relatedMetrics: ["sleep_duration"],
  },
  {
    id: "tip_149",
    title: "Sức khỏe đường ruột ảnh hưởng tâm trạng",
    content:
      "95% serotonin (hormone hạnh phúc) sản xuất trong ruột. Trục ruột-não (gut-brain axis) kết nối trực tiếp qua dây thần kinh phế vị. Hệ vi sinh đường ruột mất cân bằng liên quan đến trầm cảm, lo âu. Cải thiện: ăn đa dạng 30+ loại thực vật/tuần, probiotics, prebiotics, giảm đường và thực phẩm chế biến, quản lý stress.",
    category: "nutrition",
    tags: ["stress_level", "heart_rate"],
    source: "Nature Reviews Neuroscience",
    relatedMetrics: ["stress_level", "heart_rate"],
  },
  {
    id: "tip_150",
    title: "Compassion meditation — thiền từ bi",
    content:
      "Thiền từ bi (loving-kindness meditation) tăng cảm xúc tích cực 50%, giảm viêm nhiễm, tăng kết nối xã hội. Thực hành: ngồi yên, lặp lại 'Mong tôi được bình an, mong tôi được khỏe mạnh, mong tôi được hạnh phúc'. Sau đó mở rộng đến người thân, người quen, và tất cả mọi người. 10-15 phút/ngày. Hiệu quả sau 7 ngày liên tục.",
    category: "stress",
    tags: ["stress_level", "hrv"],
    source: "Journal of Personality and Social Psychology",
    relatedMetrics: ["stress_level", "heart_rate"],
  },
];
