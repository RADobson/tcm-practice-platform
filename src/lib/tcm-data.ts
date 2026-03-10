// ============================================================
// TCM Reference Data — Pulse Qualities, Herbs, Patterns, Points
// ============================================================

export const PULSE_QUALITIES = [
  { name: 'Floating (Fu)', pinyin: 'Fú Mài', description: 'Felt with light pressure, disappears with heavy pressure. Indicates exterior condition.' },
  { name: 'Sinking (Chen)', pinyin: 'Chén Mài', description: 'Felt only with heavy pressure. Indicates interior condition.' },
  { name: 'Slow (Chi)', pinyin: 'Chí Mài', description: 'Less than 60 bpm. Indicates cold pattern.' },
  { name: 'Rapid (Shuo)', pinyin: 'Shuò Mài', description: 'More than 90 bpm. Indicates heat pattern.' },
  { name: 'Empty/Vacuous (Xu)', pinyin: 'Xū Mài', description: 'Large but soft, feels empty. Indicates qi and blood deficiency.' },
  { name: 'Full (Shi)', pinyin: 'Shí Mài', description: 'Felt at all levels, strong. Indicates excess condition.' },
  { name: 'Wiry (Xian)', pinyin: 'Xián Mài', description: 'Taut like a guitar string. Indicates Liver qi stagnation, pain.' },
  { name: 'Slippery (Hua)', pinyin: 'Huá Mài', description: 'Smooth, round, flowing like pearls. Indicates phlegm, dampness, food stagnation, pregnancy.' },
  { name: 'Choppy (Se)', pinyin: 'Sè Mài', description: 'Rough, uneven. Indicates blood stasis, essence/blood deficiency.' },
  { name: 'Tight (Jin)', pinyin: 'Jǐn Mài', description: 'Tense, like a twisted rope. Indicates cold, pain.' },
  { name: 'Thin (Xi)', pinyin: 'Xì Mài', description: 'Thread-like but distinct. Indicates blood/yin deficiency.' },
  { name: 'Surging (Hong)', pinyin: 'Hóng Mài', description: 'Large, forceful, like a wave. Indicates excess heat.' },
  { name: 'Minute (Wei)', pinyin: 'Wēi Mài', description: 'Extremely fine, barely perceptible. Indicates severe deficiency.' },
  { name: 'Soggy (Ru)', pinyin: 'Rú Mài', description: 'Soft, fine, floating. Indicates dampness with deficiency.' },
  { name: 'Moderate (Huan)', pinyin: 'Huǎn Mài', description: 'Relaxed, about 60 bpm. Normal or indicates Spleen deficiency/dampness.' },
  { name: 'Leather (Ge)', pinyin: 'Gé Mài', description: 'Hard on outside, hollow within. Indicates essence/blood loss.' },
  { name: 'Hidden (Fu/Deeply Hidden)', pinyin: 'Fú Mài', description: 'Requires very heavy pressure to find. Indicates extreme interior cold or syncope.' },
  { name: 'Confined (Lao)', pinyin: 'Láo Mài', description: 'Deep, wiry, long, strong. Indicates deep-seated cold or hernia.' },
  { name: 'Scattered (San)', pinyin: 'Sàn Mài', description: 'Diffuse, irregular, no root. Indicates qi exhaustion.' },
  { name: 'Knotted (Jie)', pinyin: 'Jié Mài', description: 'Slow with irregular pauses. Indicates cold stasis, qi stagnation.' },
  { name: 'Hurried (Cu)', pinyin: 'Cù Mài', description: 'Rapid with irregular pauses. Indicates heat with stasis or phlegm.' },
  { name: 'Intermittent (Dai)', pinyin: 'Dài Mài', description: 'Regular pauses at fixed intervals. Indicates organ decline or exhaustion.' },
  { name: 'Long (Chang)', pinyin: 'Cháng Mài', description: 'Extends beyond normal positions. Indicates excess or strong constitution.' },
  { name: 'Short (Duan)', pinyin: 'Duǎn Mài', description: 'Does not fill all positions. Indicates qi deficiency or stagnation.' },
  { name: 'Spinning Bean (Dong)', pinyin: 'Dòng Mài', description: 'Short, slippery, rapid, forceful. Indicates fright, pain.' },
  { name: 'Drumskin (Ge)', pinyin: 'Gé Mài', description: 'Floating, large, hollow. Indicates blood/essence loss.' },
  { name: 'Hasty (Ji)', pinyin: 'Jí Mài', description: 'Extremely rapid, 120+ bpm. Indicates extreme heat or yang exhaustion.' },
  { name: 'Weak (Ruo)', pinyin: 'Ruò Mài', description: 'Deep, thin, soft. Indicates qi and blood deficiency.' },
];

export const PULSE_POSITIONS = [
  { key: 'left_cun', label: 'Left Cun (寸)', organ: 'Heart / Small Intestine' },
  { key: 'left_guan', label: 'Left Guan (关)', organ: 'Liver / Gallbladder' },
  { key: 'left_chi', label: 'Left Chi (尺)', organ: 'Kidney Yin / Bladder' },
  { key: 'right_cun', label: 'Right Cun (寸)', organ: 'Lung / Large Intestine' },
  { key: 'right_guan', label: 'Right Guan (关)', organ: 'Spleen / Stomach' },
  { key: 'right_chi', label: 'Right Chi (尺)', organ: 'Kidney Yang / Ming Men' },
];

export const EIGHT_PRINCIPLES = {
  yin_yang: ['Yin', 'Yang'],
  interior_exterior: ['Interior (Li)', 'Exterior (Biao)'],
  cold_heat: ['Cold (Han)', 'Heat (Re)'],
  deficiency_excess: ['Deficiency (Xu)', 'Excess (Shi)'],
};

export const ZANG_FU_PATTERNS = [
  'Heart Qi Deficiency', 'Heart Yang Deficiency', 'Heart Blood Deficiency', 'Heart Yin Deficiency',
  'Heart Fire Blazing', 'Heart Blood Stasis', 'Phlegm Misting the Heart', 'Phlegm-Fire Harassing the Heart',
  'Lung Qi Deficiency', 'Lung Yin Deficiency', 'Wind-Cold Invading the Lung', 'Wind-Heat Invading the Lung',
  'Lung Dryness', 'Phlegm-Damp Obstructing the Lung', 'Phlegm-Heat in the Lung',
  'Spleen Qi Deficiency', 'Spleen Yang Deficiency', 'Spleen Qi Sinking', 'Spleen Not Controlling Blood',
  'Cold-Damp Invading the Spleen', 'Damp-Heat in the Spleen',
  'Liver Qi Stagnation', 'Liver Blood Deficiency', 'Liver Yin Deficiency', 'Liver Fire Blazing',
  'Liver Yang Rising', 'Liver Wind', 'Cold Stagnation in the Liver Channel', 'Damp-Heat in Liver/Gallbladder',
  'Kidney Yang Deficiency', 'Kidney Yin Deficiency', 'Kidney Qi Not Firm', 'Kidney Essence Deficiency',
  'Kidney Failing to Receive Qi',
  'Stomach Yin Deficiency', 'Stomach Fire', 'Food Stagnation in the Stomach',
  'Small Intestine Qi Pain', 'Large Intestine Damp-Heat', 'Large Intestine Dry',
  'Gallbladder Damp-Heat', 'Bladder Damp-Heat',
  'Liver-Spleen Disharmony', 'Liver-Stomach Disharmony', 'Heart-Kidney Not Communicating',
  'Lung-Kidney Yin Deficiency', 'Spleen-Kidney Yang Deficiency', 'Liver-Kidney Yin Deficiency',
  'Heart-Spleen Blood Deficiency', 'Lung-Spleen Qi Deficiency',
];

export const QI_BLOOD_FLUID_PATTERNS = [
  'Qi Deficiency', 'Qi Stagnation', 'Qi Sinking', 'Qi Rebellious',
  'Blood Deficiency', 'Blood Stasis', 'Blood Heat', 'Blood Cold',
  'Yin Deficiency', 'Yang Deficiency', 'Yin Deficiency with Empty Heat',
  'Phlegm-Damp', 'Phlegm-Heat', 'Damp-Heat', 'Wind-Damp', 'Wind-Cold-Damp',
  'Fluid Deficiency', 'Edema/Water Retention',
];

export const TONGUE_BODY_COLORS = [
  'Pale', 'Pale-red (Normal)', 'Red', 'Deep Red/Crimson', 'Purple', 'Blue-Purple', 'Pale Purple',
];

export const TONGUE_BODY_SHAPES = [
  'Normal', 'Thin', 'Swollen', 'Stiff', 'Flaccid', 'Long', 'Short',
  'Cracked', 'Teeth-marked', 'Thorny/Prickly', 'Deviated', 'Trembling', 'Curled',
];

export const TONGUE_COATING_COLORS = [
  'White', 'Yellow', 'Gray', 'Black', 'No coating (peeled)', 'Half peeled',
];

export const TONGUE_COATING_THICKNESS = [
  'Thin', 'Thick', 'None (mirror tongue)',
];

export const TONGUE_MOISTURE = [
  'Normal', 'Dry', 'Wet/Moist', 'Slippery', 'Sticky/Greasy',
];

export const COMMON_HERBS = [
  { pin_yin: 'Huang Qi', english: 'Astragalus Root', latin: 'Astragalus membranaceus', category: 'Qi Tonifying' },
  { pin_yin: 'Ren Shen', english: 'Ginseng Root', latin: 'Panax ginseng', category: 'Qi Tonifying' },
  { pin_yin: 'Dang Shen', english: 'Codonopsis Root', latin: 'Codonopsis pilosula', category: 'Qi Tonifying' },
  { pin_yin: 'Bai Zhu', english: 'White Atractylodes', latin: 'Atractylodes macrocephala', category: 'Qi Tonifying' },
  { pin_yin: 'Fu Ling', english: 'Poria', latin: 'Poria cocos', category: 'Drain Dampness' },
  { pin_yin: 'Gan Cao', english: 'Licorice Root', latin: 'Glycyrrhiza uralensis', category: 'Qi Tonifying' },
  { pin_yin: 'Zhi Gan Cao', english: 'Honey-fried Licorice', latin: 'Glycyrrhiza uralensis (prepared)', category: 'Qi Tonifying' },
  { pin_yin: 'Dang Gui', english: 'Chinese Angelica Root', latin: 'Angelica sinensis', category: 'Blood Tonifying' },
  { pin_yin: 'Shu Di Huang', english: 'Prepared Rehmannia', latin: 'Rehmannia glutinosa (prepared)', category: 'Blood Tonifying' },
  { pin_yin: 'Sheng Di Huang', english: 'Raw Rehmannia', latin: 'Rehmannia glutinosa', category: 'Clear Heat Cool Blood' },
  { pin_yin: 'Bai Shao', english: 'White Peony Root', latin: 'Paeonia lactiflora', category: 'Blood Tonifying' },
  { pin_yin: 'Chuan Xiong', english: 'Szechuan Lovage Root', latin: 'Ligusticum chuanxiong', category: 'Blood Invigorating' },
  { pin_yin: 'He Shou Wu', english: 'Polygonum Root', latin: 'Polygonum multiflorum', category: 'Blood Tonifying' },
  { pin_yin: 'Gou Qi Zi', english: 'Goji Berry', latin: 'Lycium barbarum', category: 'Blood Tonifying' },
  { pin_yin: 'Chai Hu', english: 'Bupleurum Root', latin: 'Bupleurum chinense', category: 'Release Exterior' },
  { pin_yin: 'Huang Qin', english: 'Baical Skullcap Root', latin: 'Scutellaria baicalensis', category: 'Clear Heat Dry Dampness' },
  { pin_yin: 'Huang Lian', english: 'Coptis Rhizome', latin: 'Coptis chinensis', category: 'Clear Heat Dry Dampness' },
  { pin_yin: 'Huang Bai', english: 'Phellodendron Bark', latin: 'Phellodendron amurense', category: 'Clear Heat Dry Dampness' },
  { pin_yin: 'Zhi Zi', english: 'Gardenia Fruit', latin: 'Gardenia jasminoides', category: 'Clear Heat Drain Fire' },
  { pin_yin: 'Jin Yin Hua', english: 'Honeysuckle Flower', latin: 'Lonicera japonica', category: 'Clear Heat Resolve Toxin' },
  { pin_yin: 'Lian Qiao', english: 'Forsythia Fruit', latin: 'Forsythia suspensa', category: 'Clear Heat Resolve Toxin' },
  { pin_yin: 'Bo He', english: 'Peppermint', latin: 'Mentha haplocalyx', category: 'Release Exterior Wind-Heat' },
  { pin_yin: 'Gui Zhi', english: 'Cinnamon Twig', latin: 'Cinnamomum cassia', category: 'Release Exterior Wind-Cold' },
  { pin_yin: 'Ma Huang', english: 'Ephedra', latin: 'Ephedra sinica', category: 'Release Exterior Wind-Cold' },
  { pin_yin: 'Ge Gen', english: 'Kudzu Root', latin: 'Pueraria lobata', category: 'Release Exterior Wind-Heat' },
  { pin_yin: 'Chen Pi', english: 'Tangerine Peel', latin: 'Citrus reticulata', category: 'Regulate Qi' },
  { pin_yin: 'Xiang Fu', english: 'Cyperus Rhizome', latin: 'Cyperus rotundus', category: 'Regulate Qi' },
  { pin_yin: 'Mu Xiang', english: 'Costus Root', latin: 'Aucklandia lappa', category: 'Regulate Qi' },
  { pin_yin: 'Ban Xia', english: 'Pinellia Rhizome', latin: 'Pinellia ternata', category: 'Transform Phlegm' },
  { pin_yin: 'Zhi Mu', english: 'Anemarrhena Rhizome', latin: 'Anemarrhena asphodeloides', category: 'Clear Heat Drain Fire' },
  { pin_yin: 'Tao Ren', english: 'Peach Kernel', latin: 'Prunus persica', category: 'Blood Invigorating' },
  { pin_yin: 'Hong Hua', english: 'Safflower', latin: 'Carthamus tinctorius', category: 'Blood Invigorating' },
  { pin_yin: 'Dan Shen', english: 'Salvia Root', latin: 'Salvia miltiorrhiza', category: 'Blood Invigorating' },
  { pin_yin: 'Yi Yi Ren', english: 'Job\'s Tears', latin: 'Coix lacryma-jobi', category: 'Drain Dampness' },
  { pin_yin: 'Ze Xie', english: 'Water Plantain', latin: 'Alisma orientale', category: 'Drain Dampness' },
  { pin_yin: 'Zhu Ling', english: 'Polyporus', latin: 'Polyporus umbellatus', category: 'Drain Dampness' },
  { pin_yin: 'Shan Yao', english: 'Chinese Yam', latin: 'Dioscorea opposita', category: 'Qi Tonifying' },
  { pin_yin: 'Shan Zhu Yu', english: 'Cornus Fruit', latin: 'Cornus officinalis', category: 'Stabilize and Bind' },
  { pin_yin: 'Du Zhong', english: 'Eucommia Bark', latin: 'Eucommia ulmoides', category: 'Yang Tonifying' },
  { pin_yin: 'Xu Duan', english: 'Teasel Root', latin: 'Dipsacus asperoides', category: 'Yang Tonifying' },
  { pin_yin: 'Nu Zhen Zi', english: 'Privet Fruit', latin: 'Ligustrum lucidum', category: 'Yin Tonifying' },
  { pin_yin: 'Mai Men Dong', english: 'Ophiopogon Root', latin: 'Ophiopogon japonicus', category: 'Yin Tonifying' },
  { pin_yin: 'Tian Men Dong', english: 'Asparagus Root', latin: 'Asparagus cochinchinensis', category: 'Yin Tonifying' },
  { pin_yin: 'Wu Wei Zi', english: 'Schisandra Fruit', latin: 'Schisandra chinensis', category: 'Stabilize and Bind' },
  { pin_yin: 'Suan Zao Ren', english: 'Sour Jujube Seed', latin: 'Ziziphus jujuba var. spinosa', category: 'Calm Spirit' },
  { pin_yin: 'Yuan Zhi', english: 'Polygala Root', latin: 'Polygala tenuifolia', category: 'Calm Spirit' },
  { pin_yin: 'Da Zao', english: 'Jujube Fruit', latin: 'Ziziphus jujuba', category: 'Qi Tonifying' },
  { pin_yin: 'Sheng Jiang', english: 'Fresh Ginger', latin: 'Zingiber officinale', category: 'Release Exterior Wind-Cold' },
  { pin_yin: 'Gan Jiang', english: 'Dried Ginger', latin: 'Zingiber officinale (dried)', category: 'Warm Interior' },
  { pin_yin: 'Rou Gui', english: 'Cinnamon Bark', latin: 'Cinnamomum cassia (bark)', category: 'Warm Interior' },
  { pin_yin: 'Fu Zi', english: 'Prepared Aconite', latin: 'Aconitum carmichaelii (prepared)', category: 'Warm Interior' },
];

export const HERB_ROLES = [
  { key: 'jun', label: 'Jun (君) — Emperor/Chief', description: 'Main herb addressing the primary pattern' },
  { key: 'chen', label: 'Chen (臣) — Minister', description: 'Enhances the action of the chief herb' },
  { key: 'zuo', label: 'Zuo (佐) — Assistant', description: 'Treats secondary patterns or reduces side effects' },
  { key: 'shi', label: 'Shi (使) — Envoy/Guide', description: 'Directs the formula to the target area or harmonizes' },
];

export const COMMON_ACUPUNCTURE_POINTS = [
  'LU-1 (Zhong Fu)', 'LU-5 (Chi Ze)', 'LU-7 (Lie Que)', 'LU-9 (Tai Yuan)', 'LU-11 (Shao Shang)',
  'LI-4 (He Gu)', 'LI-11 (Qu Chi)', 'LI-20 (Ying Xiang)',
  'ST-8 (Tou Wei)', 'ST-21 (Liang Men)', 'ST-25 (Tian Shu)', 'ST-36 (Zu San Li)', 'ST-40 (Feng Long)', 'ST-44 (Nei Ting)',
  'SP-3 (Tai Bai)', 'SP-6 (San Yin Jiao)', 'SP-9 (Yin Ling Quan)', 'SP-10 (Xue Hai)',
  'HT-3 (Shao Hai)', 'HT-7 (Shen Men)',
  'SI-3 (Hou Xi)', 'SI-19 (Ting Gong)',
  'BL-2 (Zan Zhu)', 'BL-13 (Fei Shu)', 'BL-15 (Xin Shu)', 'BL-17 (Ge Shu)', 'BL-18 (Gan Shu)',
  'BL-20 (Pi Shu)', 'BL-23 (Shen Shu)', 'BL-25 (Da Chang Shu)', 'BL-40 (Wei Zhong)', 'BL-60 (Kun Lun)',
  'KI-1 (Yong Quan)', 'KI-3 (Tai Xi)', 'KI-6 (Zhao Hai)', 'KI-7 (Fu Liu)',
  'PC-6 (Nei Guan)', 'PC-8 (Lao Gong)',
  'SJ-5 (Wai Guan)', 'SJ-17 (Yi Feng)',
  'GB-20 (Feng Chi)', 'GB-21 (Jian Jing)', 'GB-30 (Huan Tiao)', 'GB-34 (Yang Ling Quan)', 'GB-41 (Zu Lin Qi)',
  'LR-2 (Xing Jian)', 'LR-3 (Tai Chong)', 'LR-8 (Qu Quan)', 'LR-14 (Qi Men)',
  'DU-4 (Ming Men)', 'DU-14 (Da Zhui)', 'DU-20 (Bai Hui)', 'DU-26 (Ren Zhong)',
  'REN-3 (Zhong Ji)', 'REN-4 (Guan Yuan)', 'REN-6 (Qi Hai)', 'REN-12 (Zhong Wan)', 'REN-17 (Shan Zhong)',
  'EX-HN-1 (Si Shen Cong)', 'EX-HN-3 (Yin Tang)', 'EX-HN-5 (Tai Yang)',
  'EX-B-2 (Hua Tuo Jia Ji)', 'EX-LE-7 (Ba Feng)', 'EX-UE-9 (Ba Xie)',
];

export const APPOINTMENT_TYPES = [
  'Initial Consultation',
  'Follow-up',
  'Acupuncture',
  'Herbal Consultation',
  'Cupping/Gua Sha',
  'Tuina Massage',
  'Comprehensive TCM',
  'Wellness Check',
];

export const HOMEWORK_CATEGORIES = [
  { key: 'acupressure', label: 'Acupressure' },
  { key: 'qi_gong', label: 'Qi Gong' },
  { key: 'dietary', label: 'Dietary Therapy' },
  { key: 'lifestyle', label: 'Lifestyle' },
  { key: 'exercise', label: 'Exercise' },
  { key: 'meditation', label: 'Meditation' },
  { key: 'herbal', label: 'Herbal Preparation' },
];
