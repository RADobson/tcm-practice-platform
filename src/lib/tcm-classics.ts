/**
 * TCM Classical Text Reference Database
 *
 * Real quotes and passages from canonical Traditional Chinese Medicine texts
 * for AI-enriched post-consultation summaries.
 *
 * All passages are well-known, widely-cited excerpts. Chinese text and English
 * translations follow standard scholarly renderings found across authoritative
 * TCM translation literature.
 */

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface ClassicalText {
  id: string;
  name_english: string;
  name_pinyin: string;
  name_chinese: string;
  author: string;
  dynasty: string;
  description: string;
}

export interface ClassicalPassage {
  id: string;
  text_id: string;
  chapter: string;
  passage_chinese: string;
  passage_english: string;
  topics: string[];
  relevance_patterns: string[];
}

// ---------------------------------------------------------------------------
// Classical Texts
// ---------------------------------------------------------------------------

export const CLASSICAL_TEXTS: ClassicalText[] = [
  {
    id: 'su_wen',
    name_english: "Yellow Emperor's Classic of Internal Medicine — Plain Questions",
    name_pinyin: 'Huang Di Nei Jing Su Wen',
    name_chinese: '黄帝内经素问',
    author: 'Traditionally attributed to Huang Di (compiled by multiple authors)',
    dynasty: 'Warring States to Han Dynasty (c. 475 BCE – 220 CE)',
    description:
      'The foundational text of Chinese medicine. The Su Wen presents core theory through dialogues between the Yellow Emperor and his physician Qi Bo, covering yin-yang, the five phases, zang-fu organ theory, pathology, diagnosis, and treatment principles.',
  },
  {
    id: 'ling_shu',
    name_english: 'Spiritual Pivot',
    name_pinyin: 'Huang Di Nei Jing Ling Shu',
    name_chinese: '黄帝内经灵枢',
    author: 'Traditionally attributed to Huang Di (compiled by multiple authors)',
    dynasty: 'Warring States to Han Dynasty (c. 475 BCE – 220 CE)',
    description:
      'The companion volume to the Su Wen, the Ling Shu focuses on acupuncture and moxibustion, meridian theory, needling technique, and the clinical application of channel theory.',
  },
  {
    id: 'shang_han_lun',
    name_english: 'Treatise on Cold Damage',
    name_pinyin: 'Shang Han Lun',
    name_chinese: '伤寒论',
    author: 'Zhang Zhong-Jing (张仲景)',
    dynasty: 'Eastern Han Dynasty (c. 200 CE)',
    description:
      'The first clinical manual of Chinese medicine. Zhang Zhong-Jing systematized the diagnosis and treatment of externally contracted febrile diseases through the Six Conformations framework, establishing many classical herbal formulas still in daily use.',
  },
  {
    id: 'nan_jing',
    name_english: 'Classic of Difficulties',
    name_pinyin: 'Nan Jing',
    name_chinese: '难经',
    author: 'Traditionally attributed to Bian Que (扁鹊)',
    dynasty: 'Eastern Han Dynasty (c. 1st–2nd century CE)',
    description:
      'A concise text structured as eighty-one "difficult issues" that clarifies and extends the Nei Jing. It is especially valued for its contributions to pulse diagnosis, the concept of the Ming Men (life gate), and the system of the five shu-transport points.',
  },
  {
    id: 'ben_cao_gang_mu',
    name_english: 'Compendium of Materia Medica',
    name_pinyin: 'Ben Cao Gang Mu',
    name_chinese: '本草纲目',
    author: 'Li Shi-Zhen (李时珍)',
    dynasty: 'Ming Dynasty (published 1593)',
    description:
      'The most comprehensive pre-modern pharmacological work in China. Li Shi-Zhen catalogued 1,892 medicinal substances with detailed descriptions of their properties, preparations, and clinical applications, correcting many errors from earlier herbals.',
  },
  {
    id: 'pi_wei_lun',
    name_english: 'Treatise on the Spleen and Stomach',
    name_pinyin: 'Pi Wei Lun',
    name_chinese: '脾胃论',
    author: 'Li Dong-Yuan (李东垣, also known as Li Gao 李杲)',
    dynasty: 'Jin-Yuan Dynasty (published 1249)',
    description:
      'The defining text of the "Earth-Supplementing" school. Li Dong-Yuan argued that internal damage to the spleen and stomach is the root cause of most internal diseases, establishing treatment principles centred on tonifying the middle qi.',
  },
  {
    id: 'jin_gui_yao_lue',
    name_english: 'Essential Prescriptions of the Golden Cabinet',
    name_pinyin: 'Jin Gui Yao Lue',
    name_chinese: '金匮要略',
    author: 'Zhang Zhong-Jing (张仲景)',
    dynasty: 'Eastern Han Dynasty (c. 200 CE)',
    description:
      'The companion work to the Shang Han Lun, focusing on internal medicine, or "miscellaneous diseases" (za bing). It addresses a wide range of conditions including pain, consumptive disease, chest bi syndrome, gynecological disorders, and dietary prohibitions.',
  },
];

// ---------------------------------------------------------------------------
// Classical Passages
// ---------------------------------------------------------------------------

export const CLASSICAL_PASSAGES: ClassicalPassage[] = [
  // =========================================================================
  // HUANG DI NEI JING SU WEN  (黄帝内经素问)
  // =========================================================================
  {
    id: 'sw_001',
    text_id: 'su_wen',
    chapter: 'Chapter 1 — Shang Gu Tian Zhen Lun (上古天真论)',
    passage_chinese:
      '上古之人，其知道者，法于阴阳，和于术数，食饮有节，起居有常，不妄作劳，故能形与神俱，而尽终其天年，度百岁乃去。',
    passage_english:
      'The people of high antiquity who understood the Dao modelled themselves on yin and yang, harmonized with the arts of calculation, were moderate in food and drink, regular in their daily activities, and did not exhaust themselves recklessly. Therefore they were able to keep body and spirit together, live out their natural span, and pass away after a hundred years.',
    topics: ['yang', 'yin', 'prevention', 'diet', 'seasons'],
    relevance_patterns: ['kidney_yin_deficiency', 'kidney_yang_deficiency', 'spleen_qi_deficiency'],
  },
  {
    id: 'sw_002',
    text_id: 'su_wen',
    chapter: 'Chapter 2 — Si Qi Tiao Shen Da Lun (四气调神大论)',
    passage_chinese:
      '春三月，此谓发陈。天地俱生，万物以荣，夜卧早起，广步于庭，被发缓形，以使志生。',
    passage_english:
      'The three months of spring are called the period of opening and flourishing. Heaven and earth together produce life and the myriad things flourish. Go to bed late and rise early, walk broadly in the courtyard, loosen the hair and relax the body, so that the will to live may be generated.',
    topics: ['seasons', 'prevention', 'liver', 'qi', 'emotions'],
    relevance_patterns: ['liver_qi_stagnation', 'liver_yang_rising'],
  },
  {
    id: 'sw_003',
    text_id: 'su_wen',
    chapter: 'Chapter 2 — Si Qi Tiao Shen Da Lun (四气调神大论)',
    passage_chinese:
      '是故圣人不治已病治未病，不治已乱治未乱，此之谓也。夫病已成而后药之，乱已成而后治之，譬犹渴而穿井，斗而铸锥，不亦晚乎。',
    passage_english:
      'Therefore the sage does not treat what is already diseased but treats what is not yet diseased; does not treat what is already disordered but treats what is not yet disordered. To administer medicine after a disease has already arisen, to bring order after disorder has already begun — this is like digging a well after one is already thirsty, or forging weapons after the battle has begun. Is it not already too late?',
    topics: ['prevention', 'treatment_principles', 'diagnosis'],
    relevance_patterns: [
      'spleen_qi_deficiency',
      'kidney_yin_deficiency',
      'kidney_yang_deficiency',
      'liver_qi_stagnation',
    ],
  },
  {
    id: 'sw_004',
    text_id: 'su_wen',
    chapter: 'Chapter 3 — Sheng Qi Tong Tian Lun (生气通天论)',
    passage_chinese: '阳气者，若天与日，失其所则折寿而不彰。',
    passage_english:
      'Yang qi is like heaven and the sun; if it loses its proper place, one will have a shortened life without brilliance.',
    topics: ['yang', 'qi', 'pathology', 'prevention'],
    relevance_patterns: ['kidney_yang_deficiency', 'spleen_yang_deficiency'],
  },
  {
    id: 'sw_005',
    text_id: 'su_wen',
    chapter: 'Chapter 5 — Yin Yang Ying Xiang Da Lun (阴阳应象大论)',
    passage_chinese: '阴阳者，天地之道也，万物之纲纪，变化之父母，生杀之本始，神明之府也。',
    passage_english:
      'Yin and yang are the Dao of heaven and earth, the guiding principle of the myriad things, the father and mother of all change, the root and beginning of life and death, and the palace of spirit and illumination.',
    topics: ['yin', 'yang', 'five_elements', 'pathology'],
    relevance_patterns: [
      'kidney_yin_deficiency',
      'kidney_yang_deficiency',
      'liver_yang_rising',
      'heart_yin_deficiency',
    ],
  },
  {
    id: 'sw_006',
    text_id: 'su_wen',
    chapter: 'Chapter 5 — Yin Yang Ying Xiang Da Lun (阴阳应象大论)',
    passage_chinese: '阴在内，阳之守也；阳在外，阴之使也。',
    passage_english:
      'Yin is on the interior and is the guardian of yang; yang is on the exterior and is the servant of yin.',
    topics: ['yin', 'yang', 'pathology', 'zang_fu'],
    relevance_patterns: [
      'kidney_yin_deficiency',
      'kidney_yang_deficiency',
      'heart_yin_deficiency',
    ],
  },
  {
    id: 'sw_007',
    text_id: 'su_wen',
    chapter: 'Chapter 8 — Ling Lan Mi Dian Lun (灵兰秘典论)',
    passage_chinese:
      '心者，君主之官也，神明出焉。肺者，相傅之官，治节出焉。肝者，将军之官，谋虑出焉。',
    passage_english:
      'The heart is the sovereign ruler from which spirit and illumination emanate. The lungs are the minister and chancellor from which regulation of the life-giving rhythm emanates. The liver is the general from which strategies and plans emanate.',
    topics: ['zang_fu', 'heart', 'lung', 'liver', 'qi', 'diagnosis'],
    relevance_patterns: [
      'heart_blood_deficiency',
      'heart_yin_deficiency',
      'lung_qi_deficiency',
      'liver_qi_stagnation',
    ],
  },
  {
    id: 'sw_008',
    text_id: 'su_wen',
    chapter: 'Chapter 39 — Ju Tong Lun (举痛论)',
    passage_chinese: '百病生于气也。怒则气上，喜则气缓，悲则气消，恐则气下，寒则气收，炅则气泄。',
    passage_english:
      'The hundred diseases arise from qi. Anger causes qi to rise, joy causes qi to slacken, grief causes qi to dissolve, fear causes qi to descend, cold causes qi to contract, and heat causes qi to leak out.',
    topics: ['qi', 'emotions', 'pathology', 'diagnosis', 'liver', 'heart', 'lung', 'kidney'],
    relevance_patterns: [
      'liver_qi_stagnation',
      'liver_yang_rising',
      'heart_qi_deficiency',
      'lung_qi_deficiency',
      'kidney_qi_deficiency',
    ],
  },
  {
    id: 'sw_009',
    text_id: 'su_wen',
    chapter: 'Chapter 5 — Yin Yang Ying Xiang Da Lun (阴阳应象大论)',
    passage_chinese: '壮火之气衰，少火之气壮。壮火食气，气食少火。壮火散气，少火生气。',
    passage_english:
      'Vigorous fire causes qi to decline; mild fire causes qi to flourish. Vigorous fire consumes qi; qi is nourished by mild fire. Vigorous fire disperses qi; mild fire generates qi.',
    topics: ['qi', 'yang', 'heat', 'pathology', 'treatment_principles'],
    relevance_patterns: ['yin_deficiency_fire', 'damp_heat', 'kidney_yin_deficiency'],
  },
  {
    id: 'sw_010',
    text_id: 'su_wen',
    chapter: 'Chapter 74 — Zhi Zhen Yao Da Lun (至真要大论)',
    passage_chinese:
      '诸风掉眩，皆属于肝。诸寒收引，皆属于肾。诸气膹郁，皆属于肺。诸湿肿满，皆属于脾。诸痛痒疮，皆属于心。',
    passage_english:
      'All wind with trembling and dizziness pertains to the liver. All cold with contraction and pulling pertains to the kidney. All qi with dyspnoea and oppression pertains to the lung. All dampness with swelling and fullness pertains to the spleen. All pain, itching, and sores pertain to the heart.',
    topics: [
      'wind',
      'cold',
      'dampness',
      'diagnosis',
      'pathology',
      'liver',
      'kidney',
      'lung',
      'spleen',
      'heart',
      'zang_fu',
    ],
    relevance_patterns: [
      'liver_wind',
      'liver_yang_rising',
      'kidney_yang_deficiency',
      'lung_qi_deficiency',
      'spleen_qi_deficiency',
      'damp_heat',
      'phlegm_dampness',
    ],
  },
  {
    id: 'sw_011',
    text_id: 'su_wen',
    chapter: 'Chapter 17 — Mai Yao Jing Wei Lun (脉要精微论)',
    passage_chinese: '得神者昌，失神者亡。',
    passage_english: 'Those who retain their spirit flourish; those who lose their spirit perish.',
    topics: ['diagnosis', 'qi', 'heart', 'prevention'],
    relevance_patterns: ['heart_blood_deficiency', 'heart_qi_deficiency', 'kidney_essence_deficiency'],
  },
  {
    id: 'sw_012',
    text_id: 'su_wen',
    chapter: 'Chapter 77 — Shu Wu Guo Lun (疏五过论)',
    passage_chinese: '治病必求于本。',
    passage_english: 'In treating disease, one must seek the root.',
    topics: ['treatment_principles', 'diagnosis'],
    relevance_patterns: [
      'liver_qi_stagnation',
      'spleen_qi_deficiency',
      'kidney_yin_deficiency',
      'kidney_yang_deficiency',
      'blood_stasis',
      'phlegm_dampness',
    ],
  },

  // =========================================================================
  // HUANG DI NEI JING LING SHU  (黄帝内经灵枢)
  // =========================================================================
  {
    id: 'ls_001',
    text_id: 'ling_shu',
    chapter: 'Chapter 8 — Ben Shen (本神)',
    passage_chinese:
      '凡刺之法，先必本于神。血脉营气精神，此五脏之所藏也。',
    passage_english:
      'In all methods of needling, one must first be rooted in the spirit. Blood, the vessels, nutritive qi, and the essence-spirit are what the five zang organs store.',
    topics: ['acupuncture', 'qi', 'blood', 'zang_fu', 'heart', 'diagnosis'],
    relevance_patterns: [
      'heart_blood_deficiency',
      'heart_qi_deficiency',
      'liver_blood_deficiency',
    ],
  },
  {
    id: 'ls_002',
    text_id: 'ling_shu',
    chapter: 'Chapter 8 — Ben Shen (本神)',
    passage_chinese:
      '肝藏血，血舍魂，肝气虚则恐，实则怒。脾藏营，营舍意，脾气虚则四肢不用，五脏不安，实则腹胀经溲不利。',
    passage_english:
      'The liver stores blood; blood houses the ethereal soul (hun). When liver qi is deficient there is fear; when it is excess there is anger. The spleen stores nutritive qi; the nutritive qi houses the intellect (yi). When spleen qi is deficient the four limbs cannot be used and the five zang organs are unsettled; when it is excess there is abdominal distension and difficult urination and defecation.',
    topics: ['zang_fu', 'liver', 'spleen', 'blood', 'qi', 'emotions', 'deficiency', 'excess'],
    relevance_patterns: [
      'liver_blood_deficiency',
      'liver_qi_stagnation',
      'spleen_qi_deficiency',
    ],
  },
  {
    id: 'ls_003',
    text_id: 'ling_shu',
    chapter: 'Chapter 10 — Jing Mai (经脉)',
    passage_chinese:
      '经脉者，所以能决死生，处百病，调虚实，不可不通。',
    passage_english:
      'The meridians are what determine life and death, treat the hundred diseases, and regulate deficiency and excess. They must not be obstructed.',
    topics: ['meridians', 'acupuncture', 'qi', 'diagnosis', 'treatment_principles', 'deficiency', 'excess'],
    relevance_patterns: [
      'qi_stagnation',
      'blood_stasis',
      'liver_qi_stagnation',
    ],
  },
  {
    id: 'ls_004',
    text_id: 'ling_shu',
    chapter: 'Chapter 18 — Ying Wei Sheng Hui (营卫生会)',
    passage_chinese:
      '营在脉中，卫在脉外，营周不休，五十而复大会，阴阳相贯，如环无端。',
    passage_english:
      'Nutritive qi circulates within the vessels; defensive qi circulates outside the vessels. The nutritive qi circulates without cease; after fifty circuits it returns to the great meeting point. Yin and yang link with each other like a ring without end.',
    topics: ['qi', 'blood', 'meridians', 'yin', 'yang', 'zang_fu'],
    relevance_patterns: [
      'qi_deficiency',
      'blood_deficiency',
      'wind_cold',
      'wind_heat',
    ],
  },
  {
    id: 'ls_005',
    text_id: 'ling_shu',
    chapter: 'Chapter 47 — Ben Zang (本脏)',
    passage_chinese:
      '五脏者，所以藏精神血气魂魄者也。六腑者，所以化水谷而行津液者也。',
    passage_english:
      'The five zang organs store essence, spirit, blood, qi, the ethereal soul, and the corporeal soul. The six fu organs transform food and drink and move the body fluids.',
    topics: ['zang_fu', 'qi', 'blood', 'diagnosis'],
    relevance_patterns: [
      'spleen_qi_deficiency',
      'kidney_essence_deficiency',
      'heart_blood_deficiency',
    ],
  },
  {
    id: 'ls_006',
    text_id: 'ling_shu',
    chapter: 'Chapter 71 — Xie Ke (邪客)',
    passage_chinese:
      '心者，五脏六腑之大主也，精神之所舍也。其脏坚固，邪弗能容也。容之则心伤，心伤则神去，神去则死矣。',
    passage_english:
      'The heart is the great sovereign of the five zang and six fu organs, the dwelling place of essence-spirit. The organ is firm and solid; pathogenic factors cannot lodge there. If they do lodge there, the heart is injured. If the heart is injured, the spirit departs. If the spirit departs, death follows.',
    topics: ['heart', 'zang_fu', 'qi', 'pathology', 'diagnosis'],
    relevance_patterns: [
      'heart_blood_deficiency',
      'heart_qi_deficiency',
      'heart_yin_deficiency',
    ],
  },
  {
    id: 'ls_007',
    text_id: 'ling_shu',
    chapter: 'Chapter 9 — Zhong Shi (终始)',
    passage_chinese: '凡刺之道，气调而止。',
    passage_english:
      'In all methods of needling, cease once the qi has been harmonized.',
    topics: ['acupuncture', 'qi', 'treatment_principles'],
    relevance_patterns: ['qi_stagnation', 'liver_qi_stagnation', 'blood_stasis'],
  },
  {
    id: 'ls_008',
    text_id: 'ling_shu',
    chapter: 'Chapter 1 — Jiu Zhen Shi Er Yuan (九针十二原)',
    passage_chinese:
      '粗守形，上守神。神乎神，客在门。',
    passage_english:
      'The unskilled physician watches only the form; the superior physician watches the spirit. Spirit, oh spirit — the guest is at the gate.',
    topics: ['acupuncture', 'diagnosis', 'qi', 'heart'],
    relevance_patterns: ['heart_blood_deficiency', 'heart_qi_deficiency'],
  },
  {
    id: 'ls_009',
    text_id: 'ling_shu',
    chapter: 'Chapter 33 — Hai Lun (海论)',
    passage_chinese:
      '胃者，水谷之海。冲脉者，为十二经之海。膻中者，为气之海。脑为髓之海。',
    passage_english:
      'The stomach is the sea of water and grain. The Chong Mai is the sea of the twelve meridians. The Dan Zhong (chest centre) is the sea of qi. The brain is the sea of marrow.',
    topics: ['zang_fu', 'spleen', 'meridians', 'qi', 'kidney', 'diagnosis'],
    relevance_patterns: [
      'spleen_qi_deficiency',
      'kidney_essence_deficiency',
      'lung_qi_deficiency',
    ],
  },
  {
    id: 'ls_010',
    text_id: 'ling_shu',
    chapter: 'Chapter 54 — Tian Nian (天年)',
    passage_chinese:
      '人之始生，以母为基，以父为楯。失神者死，得神者生也。',
    passage_english:
      'At the beginning of human life, the mother is the foundation and the father is the shield. Those who lose their spirit die; those who retain their spirit live.',
    topics: ['kidney', 'qi', 'prevention', 'diagnosis'],
    relevance_patterns: ['kidney_essence_deficiency', 'kidney_yin_deficiency', 'kidney_yang_deficiency'],
  },

  // =========================================================================
  // SHANG HAN LUN  (伤寒论)
  // =========================================================================
  {
    id: 'shl_001',
    text_id: 'shang_han_lun',
    chapter: 'Tai Yang Bing (太阳病篇) — Line 1',
    passage_chinese:
      '太阳之为病，脉浮，头项强痛而恶寒。',
    passage_english:
      'In Tai Yang disease, the pulse is floating, there is headache and stiffness of the neck, and aversion to cold.',
    topics: ['diagnosis', 'cold', 'wind', 'pathology', 'meridians'],
    relevance_patterns: ['wind_cold', 'wind_heat'],
  },
  {
    id: 'shl_002',
    text_id: 'shang_han_lun',
    chapter: 'Tai Yang Bing (太阳病篇) — Line 12',
    passage_chinese:
      '太阳中风，阳浮而阴弱，阳浮者热自发，阴弱者汗自出，啬啬恶寒，淅淅恶风，翕翕发热，鼻鸣干呕者，桂枝汤主之。',
    passage_english:
      'In Tai Yang wind-strike, yang is floating and yin is weak. The floating yang causes spontaneous heat; the weak yin causes spontaneous sweating. There is slight aversion to cold, mild aversion to wind, mild fever, nasal congestion, and dry retching. Gui Zhi Tang (Cinnamon Twig Decoction) governs this.',
    topics: ['wind', 'cold', 'diagnosis', 'herbal_medicine', 'treatment_principles', 'pathology'],
    relevance_patterns: ['wind_cold'],
  },
  {
    id: 'shl_003',
    text_id: 'shang_han_lun',
    chapter: 'Tai Yang Bing (太阳病篇) — Line 35',
    passage_chinese:
      '太阳病，头痛发热，身疼腰痛，骨节疼痛，恶风无汗而喘者，麻黄汤主之。',
    passage_english:
      'In Tai Yang disease, with headache, fever, generalized body pain, lower back pain, joint pain, aversion to wind, absence of sweating, and dyspnoea — Ma Huang Tang (Ephedra Decoction) governs this.',
    topics: ['wind', 'cold', 'herbal_medicine', 'diagnosis', 'treatment_principles'],
    relevance_patterns: ['wind_cold'],
  },
  {
    id: 'shl_004',
    text_id: 'shang_han_lun',
    chapter: 'Yang Ming Bing (阳明病篇) — Line 180',
    passage_chinese:
      '阳明之为病，胃家实是也。',
    passage_english:
      'The defining characteristic of Yang Ming disease is fullness and excess in the stomach domain.',
    topics: ['diagnosis', 'heat', 'excess', 'pathology', 'spleen', 'zang_fu'],
    relevance_patterns: ['damp_heat', 'stomach_heat'],
  },
  {
    id: 'shl_005',
    text_id: 'shang_han_lun',
    chapter: 'Shao Yang Bing (少阳病篇) — Line 263',
    passage_chinese:
      '少阳之为病，口苦、咽干、目眩也。',
    passage_english:
      'In Shao Yang disease, there is a bitter taste in the mouth, a dry throat, and dizziness.',
    topics: ['diagnosis', 'pathology', 'liver', 'heat'],
    relevance_patterns: ['liver_qi_stagnation', 'liver_yang_rising', 'damp_heat'],
  },
  {
    id: 'shl_006',
    text_id: 'shang_han_lun',
    chapter: 'Shao Yang Bing (少阳病篇) — Line 96',
    passage_chinese:
      '伤寒五六日，中风，往来寒热，胸胁苦满，嘿嘿不欲饮食，心烦喜呕……小柴胡汤主之。',
    passage_english:
      'On the fifth or sixth day of cold damage with wind-strike, there is alternating chills and fever, fullness and discomfort in the chest and lateral costal region, no desire to eat or drink, vexation, and frequent nausea ... Xiao Chai Hu Tang (Minor Bupleurum Decoction) governs this.',
    topics: ['herbal_medicine', 'diagnosis', 'treatment_principles', 'liver', 'heat', 'cold'],
    relevance_patterns: ['liver_qi_stagnation', 'damp_heat', 'wind_cold', 'wind_heat'],
  },
  {
    id: 'shl_007',
    text_id: 'shang_han_lun',
    chapter: 'Tai Yin Bing (太阴病篇) — Line 273',
    passage_chinese:
      '太阴之为病，腹满而吐，食不下，自利益甚，时腹自痛。若下之，必胸下结硬。',
    passage_english:
      'In Tai Yin disease, there is abdominal fullness with vomiting, inability to eat, severe spontaneous diarrhoea, and periodic abdominal pain. If precipitation (purging) is used, there will inevitably be a hard bind below the chest.',
    topics: ['diagnosis', 'spleen', 'deficiency', 'cold', 'pathology', 'treatment_principles'],
    relevance_patterns: ['spleen_qi_deficiency', 'spleen_yang_deficiency', 'phlegm_dampness'],
  },
  {
    id: 'shl_008',
    text_id: 'shang_han_lun',
    chapter: 'Shao Yin Bing (少阴病篇) — Line 281',
    passage_chinese:
      '少阴之为病，脉微细，但欲寐也。',
    passage_english:
      'In Shao Yin disease, the pulse is faint and thin, and the patient desires only to sleep.',
    topics: ['diagnosis', 'kidney', 'heart', 'deficiency', 'cold', 'pathology'],
    relevance_patterns: [
      'kidney_yang_deficiency',
      'heart_yang_deficiency',
      'kidney_yin_deficiency',
    ],
  },
  {
    id: 'shl_009',
    text_id: 'shang_han_lun',
    chapter: 'Jue Yin Bing (厥阴病篇) — Line 326',
    passage_chinese:
      '厥阴之为病，消渴，气上撞心，心中疼热，饥而不欲食，食则吐蛔，下之利不止。',
    passage_english:
      'In Jue Yin disease, there is wasting thirst, qi surging up to strike the heart, heat and pain in the chest, hunger with no desire to eat, vomiting of roundworms upon eating, and if purged, incessant diarrhoea.',
    topics: ['diagnosis', 'liver', 'pathology', 'heat', 'cold', 'deficiency'],
    relevance_patterns: ['liver_qi_stagnation', 'spleen_yang_deficiency'],
  },
  {
    id: 'shl_010',
    text_id: 'shang_han_lun',
    chapter: 'Tai Yang Bing (太阳病篇) — Line 71',
    passage_chinese:
      '太阳病，发汗后，大汗出，胃中干，烦躁不得眠，欲得饮水者，少少与饮之，令胃气和则愈。',
    passage_english:
      'In Tai Yang disease, after promoting sweating there is profuse perspiration, dryness in the stomach, vexation and restlessness with inability to sleep, and a desire to drink water. Give small sips of water; once the stomach qi is harmonized, recovery follows.',
    topics: ['treatment_principles', 'diagnosis', 'pathology', 'qi', 'deficiency'],
    relevance_patterns: ['yin_deficiency_fire', 'stomach_yin_deficiency'],
  },
  {
    id: 'shl_011',
    text_id: 'shang_han_lun',
    chapter: 'Bian Mai Fa (辨脉法)',
    passage_chinese:
      '问曰：脉有阴阳，何谓也？答曰：凡脉大浮数动滑，皆阳也；脉沉涩弱弦微，皆阴也。',
    passage_english:
      'Question: The pulse has yin and yang aspects — what does this mean? Answer: In general, a pulse that is large, floating, rapid, stirring, or slippery is yang. A pulse that is deep, rough, weak, wiry, or faint is yin.',
    topics: ['diagnosis', 'yin', 'yang', 'qi', 'blood'],
    relevance_patterns: [
      'qi_deficiency',
      'blood_deficiency',
      'liver_qi_stagnation',
      'kidney_yang_deficiency',
    ],
  },

  // =========================================================================
  // NAN JING  (难经)
  // =========================================================================
  {
    id: 'nj_001',
    text_id: 'nan_jing',
    chapter: 'Difficulty 1 (一难)',
    passage_chinese:
      '十二经皆有动脉，独取寸口，以决五脏六腑死生吉凶之法，何谓也？然。寸口者，脉之大会，手太阴之脉动也。',
    passage_english:
      'All twelve meridians have pulsating vessels. Why is the cun kou (radial pulse) alone selected to determine the life, death, fortune, and misfortune of the five zang and six fu organs? It is because the cun kou is the great meeting point of the vessels, the pulsation of the hand Tai Yin (lung) meridian.',
    topics: ['diagnosis', 'meridians', 'lung', 'zang_fu', 'qi'],
    relevance_patterns: ['lung_qi_deficiency', 'qi_deficiency'],
  },
  {
    id: 'nj_002',
    text_id: 'nan_jing',
    chapter: 'Difficulty 8 (八难)',
    passage_chinese:
      '诸十二经脉者，皆系于生气之原。所谓生气之原者，谓十二经之根本也，谓肾间动气也。此五脏六腑之本，十二经脉之根，呼吸之门，三焦之原，一名守邪之神。',
    passage_english:
      'All twelve meridians are connected to the source of the vital qi. The so-called source of vital qi is the root of the twelve meridians — it is the moving qi between the kidneys. This is the root of the five zang and six fu organs, the foundation of the twelve meridians, the gate of breathing, and the origin of the San Jiao. It is also called the spirit that guards against pathogenic factors.',
    topics: ['kidney', 'qi', 'meridians', 'zang_fu', 'diagnosis'],
    relevance_patterns: [
      'kidney_yang_deficiency',
      'kidney_yin_deficiency',
      'kidney_essence_deficiency',
    ],
  },
  {
    id: 'nj_003',
    text_id: 'nan_jing',
    chapter: 'Difficulty 36 (三十六难)',
    passage_chinese:
      '命门者，诸精神之所舍，原气之所系也。男子以藏精，女子以系胞。',
    passage_english:
      'The Ming Men (Life Gate) is the dwelling place of all essence and spirit and the attachment of source qi. In men it stores essence; in women it is connected to the uterus.',
    topics: ['kidney', 'qi', 'zang_fu', 'pathology'],
    relevance_patterns: [
      'kidney_yang_deficiency',
      'kidney_yin_deficiency',
      'kidney_essence_deficiency',
    ],
  },
  {
    id: 'nj_004',
    text_id: 'nan_jing',
    chapter: 'Difficulty 22 (二十二难)',
    passage_chinese: '气主嘘之，血主濡之。',
    passage_english: 'Qi warms; blood moistens.',
    topics: ['qi', 'blood', 'diagnosis', 'pathology'],
    relevance_patterns: [
      'qi_deficiency',
      'blood_deficiency',
      'liver_blood_deficiency',
      'heart_blood_deficiency',
    ],
  },
  {
    id: 'nj_005',
    text_id: 'nan_jing',
    chapter: 'Difficulty 66 (六十六难)',
    passage_chinese:
      '十二经皆以俞为原。五脏六腑之有病者，皆取其原也。',
    passage_english:
      'All twelve meridians use the shu-stream point as the source point. For diseases of the five zang and six fu organs, one takes the source point.',
    topics: ['acupuncture', 'meridians', 'treatment_principles', 'zang_fu'],
    relevance_patterns: [
      'qi_deficiency',
      'qi_stagnation',
      'liver_qi_stagnation',
      'spleen_qi_deficiency',
    ],
  },
  {
    id: 'nj_006',
    text_id: 'nan_jing',
    chapter: 'Difficulty 69 (六十九难)',
    passage_chinese: '虚者补其母，实者泻其子。',
    passage_english:
      'For deficiency, tonify the mother; for excess, sedate the child.',
    topics: ['treatment_principles', 'five_elements', 'acupuncture', 'deficiency', 'excess'],
    relevance_patterns: [
      'qi_deficiency',
      'liver_qi_stagnation',
      'kidney_yin_deficiency',
      'spleen_qi_deficiency',
      'lung_qi_deficiency',
    ],
  },
  {
    id: 'nj_007',
    text_id: 'nan_jing',
    chapter: 'Difficulty 75 (七十五难)',
    passage_chinese:
      '东方实，西方虚，泻南方，补北方。',
    passage_english:
      'When the east (liver/wood) is in excess and the west (lung/metal) is deficient, sedate the south (heart/fire) and tonify the north (kidney/water).',
    topics: ['five_elements', 'treatment_principles', 'liver', 'lung', 'heart', 'kidney', 'acupuncture'],
    relevance_patterns: [
      'liver_qi_stagnation',
      'liver_yang_rising',
      'lung_qi_deficiency',
      'kidney_yin_deficiency',
    ],
  },
  {
    id: 'nj_008',
    text_id: 'nan_jing',
    chapter: 'Difficulty 61 (六十一难)',
    passage_chinese:
      '望而知之谓之神，闻而知之谓之圣，问而知之谓之工，切脉而知之谓之巧。',
    passage_english:
      'To know by looking is called divine. To know by listening and smelling is called sagely. To know by asking is called skillful. To know by palpating the pulse is called ingenious.',
    topics: ['diagnosis'],
    relevance_patterns: [],
  },
  {
    id: 'nj_009',
    text_id: 'nan_jing',
    chapter: 'Difficulty 14 (十四难)',
    passage_chinese:
      '损其肺者，益其气。损其心者，调其营卫。损其脾者，调其饮食，适其寒温。损其肝者，缓其中。损其肾者，益其精。',
    passage_english:
      'For damage to the lung, augment the qi. For damage to the heart, regulate the nutritive and defensive qi. For damage to the spleen, regulate food and drink and adjust cold and warmth. For damage to the liver, relax the centre. For damage to the kidney, replenish the essence.',
    topics: ['treatment_principles', 'lung', 'heart', 'spleen', 'liver', 'kidney', 'zang_fu', 'deficiency'],
    relevance_patterns: [
      'lung_qi_deficiency',
      'heart_blood_deficiency',
      'spleen_qi_deficiency',
      'liver_qi_stagnation',
      'kidney_essence_deficiency',
    ],
  },
  {
    id: 'nj_010',
    text_id: 'nan_jing',
    chapter: 'Difficulty 4 (四难)',
    passage_chinese:
      '呼出心与肺，吸入肾与肝，呼吸之间，脾也，其脉在中。',
    passage_english:
      'Exhalation corresponds to the heart and lung; inhalation corresponds to the kidney and liver. Between exhalation and inhalation lies the spleen — its pulse is in the centre.',
    topics: ['diagnosis', 'zang_fu', 'heart', 'lung', 'kidney', 'liver', 'spleen', 'qi'],
    relevance_patterns: [
      'lung_qi_deficiency',
      'kidney_qi_deficiency',
      'spleen_qi_deficiency',
    ],
  },

  // =========================================================================
  // BEN CAO GANG MU  (本草纲目)
  // =========================================================================
  {
    id: 'bcgm_001',
    text_id: 'ben_cao_gang_mu',
    chapter: 'Preface (序例)',
    passage_chinese:
      '药有酸咸甘苦辛五味，又有寒热温凉四气。',
    passage_english:
      'Medicinals have five flavours: sour, salty, sweet, bitter, and acrid; and four natures: cold, hot, warm, and cool.',
    topics: ['herbal_medicine', 'five_elements', 'treatment_principles'],
    relevance_patterns: [],
  },
  {
    id: 'bcgm_002',
    text_id: 'ben_cao_gang_mu',
    chapter: 'Volume 15 — Ren Shen (人参, Ginseng)',
    passage_chinese:
      '人参味甘微苦，性温。大补元气，复脉固脱，补脾益肺，生津止渴，安神益智。',
    passage_english:
      'Ren Shen (ginseng) is sweet and slightly bitter in flavour, warm in nature. It greatly tonifies the source qi, restores the pulse and stems collapse, supplements the spleen and benefits the lung, generates fluids and stops thirst, and calms the spirit and benefits the intellect.',
    topics: ['herbal_medicine', 'qi', 'spleen', 'lung', 'heart', 'deficiency'],
    relevance_patterns: [
      'qi_deficiency',
      'spleen_qi_deficiency',
      'lung_qi_deficiency',
      'heart_qi_deficiency',
    ],
  },
  {
    id: 'bcgm_003',
    text_id: 'ben_cao_gang_mu',
    chapter: 'Volume 12 — Huang Qi (黄芪, Astragalus)',
    passage_chinese:
      '黄芪味甘，性微温。补气固表，利尿托毒，排脓，敛疮生肌。',
    passage_english:
      'Huang Qi (astragalus) is sweet in flavour and slightly warm in nature. It supplements qi and secures the exterior, promotes urination, draws out toxin, expels pus, and closes sores to generate flesh.',
    topics: ['herbal_medicine', 'qi', 'lung', 'spleen', 'deficiency'],
    relevance_patterns: [
      'qi_deficiency',
      'spleen_qi_deficiency',
      'lung_qi_deficiency',
      'wind_cold',
    ],
  },
  {
    id: 'bcgm_004',
    text_id: 'ben_cao_gang_mu',
    chapter: 'Volume 14 — Dang Gui (当归, Angelica sinensis)',
    passage_chinese:
      '当归味甘辛，性温。补血活血，调经止痛，润肠通便。',
    passage_english:
      'Dang Gui (Chinese angelica root) is sweet and acrid in flavour, warm in nature. It tonifies and invigorates blood, regulates menstruation and stops pain, and moistens the intestines to promote bowel movement.',
    topics: ['herbal_medicine', 'blood', 'liver', 'heart', 'deficiency'],
    relevance_patterns: [
      'blood_deficiency',
      'liver_blood_deficiency',
      'heart_blood_deficiency',
      'blood_stasis',
    ],
  },
  {
    id: 'bcgm_005',
    text_id: 'ben_cao_gang_mu',
    chapter: 'Volume 14 — Gan Cao (甘草, Licorice)',
    passage_chinese:
      '甘草味甘，性平。补脾益气，清热解毒，祛痰止咳，缓急止痛，调和诸药。',
    passage_english:
      'Gan Cao (licorice root) is sweet in flavour and neutral in nature. It supplements the spleen and augments qi, clears heat and resolves toxin, dispels phlegm and stops cough, relaxes urgency and stops pain, and harmonizes all medicinals.',
    topics: ['herbal_medicine', 'spleen', 'qi', 'lung', 'phlegm', 'heat'],
    relevance_patterns: [
      'spleen_qi_deficiency',
      'lung_qi_deficiency',
      'phlegm_dampness',
    ],
  },
  {
    id: 'bcgm_006',
    text_id: 'ben_cao_gang_mu',
    chapter: 'Volume 15 — Fu Ling (茯苓, Poria)',
    passage_chinese:
      '茯苓味甘淡，性平。利水渗湿，健脾宁心。',
    passage_english:
      'Fu Ling (poria) is sweet and bland in flavour, neutral in nature. It promotes urination and drains dampness, strengthens the spleen, and calms the heart.',
    topics: ['herbal_medicine', 'dampness', 'spleen', 'heart', 'deficiency'],
    relevance_patterns: [
      'phlegm_dampness',
      'spleen_qi_deficiency',
      'damp_heat',
    ],
  },
  {
    id: 'bcgm_007',
    text_id: 'ben_cao_gang_mu',
    chapter: 'Volume 12 — Chai Hu (柴胡, Bupleurum)',
    passage_chinese:
      '柴胡味苦辛，性微寒。疏肝解郁，升举阳气，和解退热。',
    passage_english:
      'Chai Hu (bupleurum) is bitter and acrid in flavour, slightly cold in nature. It courses the liver and resolves constraint, upbears yang qi, and harmonizes and reduces fever.',
    topics: ['herbal_medicine', 'liver', 'qi', 'qi_stagnation', 'heat'],
    relevance_patterns: [
      'liver_qi_stagnation',
      'liver_yang_rising',
      'damp_heat',
    ],
  },
  {
    id: 'bcgm_008',
    text_id: 'ben_cao_gang_mu',
    chapter: 'Volume 18 — Di Huang (地黄, Rehmannia)',
    passage_chinese:
      '地黄鲜者寒，干者微温。鲜地黄清热生津凉血止血。熟地黄补血滋阴，益精填髓。',
    passage_english:
      'Fresh Di Huang (rehmannia) is cold; dried is slightly warm. Fresh Sheng Di Huang clears heat, generates fluids, cools the blood, and stops bleeding. Prepared Shu Di Huang tonifies blood, enriches yin, augments essence, and fills the marrow.',
    topics: ['herbal_medicine', 'blood', 'yin', 'kidney', 'liver', 'heat', 'deficiency'],
    relevance_patterns: [
      'kidney_yin_deficiency',
      'liver_blood_deficiency',
      'blood_deficiency',
      'yin_deficiency_fire',
    ],
  },
  {
    id: 'bcgm_009',
    text_id: 'ben_cao_gang_mu',
    chapter: 'Volume 13 — Bai Zhu (白术, Atractylodes macrocephala)',
    passage_chinese:
      '白术味苦甘，性温。健脾益气，燥湿利水，止汗，安胎。',
    passage_english:
      'Bai Zhu (white atractylodes) is bitter and sweet in flavour, warm in nature. It strengthens the spleen and augments qi, dries dampness and promotes water metabolism, stops sweating, and quiets the fetus.',
    topics: ['herbal_medicine', 'spleen', 'qi', 'dampness', 'deficiency'],
    relevance_patterns: [
      'spleen_qi_deficiency',
      'phlegm_dampness',
      'damp_heat',
    ],
  },
  {
    id: 'bcgm_010',
    text_id: 'ben_cao_gang_mu',
    chapter: 'General Principles (总论)',
    passage_chinese:
      '凡药有君臣佐使，以相宣摄合和。',
    passage_english:
      'In every prescription, the medicinals function as sovereign, minister, assistant, and envoy, working in concert to support one another harmoniously.',
    topics: ['herbal_medicine', 'treatment_principles'],
    relevance_patterns: [],
  },

  // =========================================================================
  // PI WEI LUN  (脾胃论)
  // =========================================================================
  {
    id: 'pwl_001',
    text_id: 'pi_wei_lun',
    chapter: 'Pi Wei Xu Shi Chuan Bian Lun (脾胃虚实传变论)',
    passage_chinese:
      '内伤脾胃，百病由生。',
    passage_english:
      'When the spleen and stomach are internally damaged, the hundred diseases arise from this.',
    topics: ['spleen', 'zang_fu', 'pathology', 'deficiency', 'treatment_principles'],
    relevance_patterns: [
      'spleen_qi_deficiency',
      'spleen_yang_deficiency',
      'phlegm_dampness',
      'damp_heat',
    ],
  },
  {
    id: 'pwl_002',
    text_id: 'pi_wei_lun',
    chapter: 'Pi Wei Xu Shi Chuan Bian Lun (脾胃虚实传变论)',
    passage_chinese:
      '元气之充足，皆由脾胃之气无所伤，而后能滋养元气。若胃气之本弱，饮食自倍，则脾胃之气既伤，而元气亦不能充，而诸病之所由生也。',
    passage_english:
      'The fullness of source qi depends entirely upon the qi of the spleen and stomach being uninjured, so that it can nourish the source qi. If the stomach qi is constitutionally weak and food intake is excessive, then the qi of the spleen and stomach is injured and the source qi likewise cannot be replenished — and this is where all diseases arise.',
    topics: ['spleen', 'qi', 'deficiency', 'pathology', 'diet', 'treatment_principles'],
    relevance_patterns: [
      'spleen_qi_deficiency',
      'qi_deficiency',
      'phlegm_dampness',
    ],
  },
  {
    id: 'pwl_003',
    text_id: 'pi_wei_lun',
    chapter: 'Yin Shi Lao Juan Suo Shang Shi Zhi Lun (饮食劳倦所伤始为热中论)',
    passage_chinese:
      '脾胃之气既伤，而元气亦不能充，诸病之所由生也。',
    passage_english:
      'When the qi of the spleen and stomach is injured, the source qi cannot be replenished — and from this the various diseases arise.',
    topics: ['spleen', 'qi', 'deficiency', 'pathology'],
    relevance_patterns: [
      'spleen_qi_deficiency',
      'qi_deficiency',
    ],
  },
  {
    id: 'pwl_004',
    text_id: 'pi_wei_lun',
    chapter: 'Bu Zhong Yi Qi Tang (补中益气汤)',
    passage_chinese:
      '补中益气汤：黄芪、人参、白术、甘草（炙）、当归、陈皮、升麻、柴胡。治脾胃气虚，身热有汗，渴喜热饮，少气懒言，体倦肢软，面色萎黄，大便稀溏，脉洪而虚。',
    passage_english:
      'Bu Zhong Yi Qi Tang (Tonify the Middle and Augment the Qi Decoction): Huang Qi, Ren Shen, Bai Zhu, Zhi Gan Cao (honey-fried licorice), Dang Gui, Chen Pi, Sheng Ma, Chai Hu. It treats spleen and stomach qi deficiency with signs of fever with sweating, thirst preferring hot drinks, shortness of breath, disinclination to speak, fatigue with soft limbs, sallow complexion, loose stools, and a pulse that is flooding but forceless.',
    topics: ['herbal_medicine', 'spleen', 'qi', 'deficiency', 'treatment_principles'],
    relevance_patterns: [
      'spleen_qi_deficiency',
      'qi_deficiency',
      'qi_sinking',
    ],
  },
  {
    id: 'pwl_005',
    text_id: 'pi_wei_lun',
    chapter: 'Pi Wei Sheng Shuai Lun (脾胃盛衰论)',
    passage_chinese:
      '百病皆由脾胃衰而生也。',
    passage_english:
      'The hundred diseases all arise from the decline of the spleen and stomach.',
    topics: ['spleen', 'pathology', 'deficiency', 'treatment_principles'],
    relevance_patterns: [
      'spleen_qi_deficiency',
      'spleen_yang_deficiency',
    ],
  },
  {
    id: 'pwl_006',
    text_id: 'pi_wei_lun',
    chapter: 'Pi Wei Xu Shi Chuan Bian Lun (脾胃虚实传变论)',
    passage_chinese:
      '脾胃俱旺，则能食而肥；脾胃俱虚，则不能食而瘦。',
    passage_english:
      'When both the spleen and stomach are vigorous, one can eat well and has a robust body. When both the spleen and stomach are deficient, one cannot eat and becomes thin.',
    topics: ['spleen', 'qi', 'deficiency', 'diet', 'diagnosis'],
    relevance_patterns: [
      'spleen_qi_deficiency',
      'spleen_yang_deficiency',
    ],
  },
  {
    id: 'pwl_007',
    text_id: 'pi_wei_lun',
    chapter: 'Lun Pi Wei Sheng Shuai (论脾胃盛衰)',
    passage_chinese:
      '火与元气不两立，一胜则一负。脾胃气虚则下流于肾，阴火得以乘其土位。',
    passage_english:
      'Pathological fire and source qi cannot coexist — when one prevails, the other declines. When spleen and stomach qi is deficient, it flows downward to the kidney, and yin fire takes advantage of this to usurp the position of earth.',
    topics: ['spleen', 'kidney', 'qi', 'heat', 'deficiency', 'five_elements', 'pathology'],
    relevance_patterns: [
      'spleen_qi_deficiency',
      'yin_deficiency_fire',
      'kidney_yin_deficiency',
    ],
  },
  {
    id: 'pwl_008',
    text_id: 'pi_wei_lun',
    chapter: 'Tiao Li Pi Wei Zhi Li Yin Yong Sheng (调理脾胃治理引用升)',
    passage_chinese:
      '脾胃为气血生化之源。',
    passage_english:
      'The spleen and stomach are the source of the generation and transformation of qi and blood.',
    topics: ['spleen', 'qi', 'blood', 'zang_fu', 'treatment_principles'],
    relevance_patterns: [
      'spleen_qi_deficiency',
      'blood_deficiency',
      'qi_deficiency',
    ],
  },
  {
    id: 'pwl_009',
    text_id: 'pi_wei_lun',
    chapter: 'Yin Shi Lao Juan Suo Shang Shi Zhi Lun (饮食劳倦所伤始为热中论)',
    passage_chinese:
      '喜怒忧恐，损耗元气。资助心火，火与元气不两立。',
    passage_english:
      'Joy, anger, anxiety, and fear damage and consume source qi. They fuel the heart fire, and fire and source qi cannot coexist.',
    topics: ['emotions', 'qi', 'heart', 'spleen', 'pathology'],
    relevance_patterns: [
      'spleen_qi_deficiency',
      'heart_fire',
      'liver_qi_stagnation',
      'yin_deficiency_fire',
    ],
  },
  {
    id: 'pwl_010',
    text_id: 'pi_wei_lun',
    chapter: 'Preface (序)',
    passage_chinese:
      '人以胃气为本。',
    passage_english:
      'The human being takes stomach qi as the root.',
    topics: ['spleen', 'qi', 'treatment_principles', 'diagnosis'],
    relevance_patterns: [
      'spleen_qi_deficiency',
      'stomach_yin_deficiency',
    ],
  },

  // =========================================================================
  // JIN GUI YAO LUE  (金匮要略)
  // =========================================================================
  {
    id: 'jg_001',
    text_id: 'jin_gui_yao_lue',
    chapter: 'Zang Fu Jing Luo Xian Hou Bing Mai Zheng (脏腑经络先后病脉证第一)',
    passage_chinese:
      '问曰：上工治未病，何也？师曰：夫治未病者，见肝之病，知肝传脾，当先实脾，四季脾旺不受邪，即勿补之。',
    passage_english:
      'Question: What does it mean that the superior physician treats what is not yet ill? The Master said: To treat what is not yet ill means that when one sees disease in the liver, one knows it will transmit to the spleen. One should first strengthen the spleen. If the spleen is already vigorous through the four seasons and will not accept pathogenic influence, then do not supplement it.',
    topics: ['liver', 'spleen', 'treatment_principles', 'prevention', 'five_elements', 'pathology'],
    relevance_patterns: [
      'liver_qi_stagnation',
      'spleen_qi_deficiency',
      'liver_overacting_on_spleen',
    ],
  },
  {
    id: 'jg_002',
    text_id: 'jin_gui_yao_lue',
    chapter: 'Zang Fu Jing Luo Xian Hou Bing Mai Zheng (脏腑经络先后病脉证第一)',
    passage_chinese:
      '夫人禀五常，因风气而生长，风气虽能生万物，亦能害万物，如水能浮舟，亦能覆舟。',
    passage_english:
      'Human beings receive the five constants and grow because of wind and qi. Although wind qi can give life to the myriad things, it can also harm them — just as water can float a boat but can also capsize it.',
    topics: ['wind', 'pathology', 'prevention', 'qi'],
    relevance_patterns: ['wind_cold', 'wind_heat', 'liver_wind'],
  },
  {
    id: 'jg_003',
    text_id: 'jin_gui_yao_lue',
    chapter: 'Zang Fu Jing Luo Xian Hou Bing Mai Zheng (脏腑经络先后病脉证第一)',
    passage_chinese:
      '千般疢难，不越三条：一者，经络受邪入脏腑，为内所因也；二者，四肢九窍，血脉相传，壅塞不通，为外皮肤所中也；三者，房室金刃虫兽所伤。以此详之，病由都尽。',
    passage_english:
      'The myriad afflictions do not go beyond three categories: first, pathogenic factors enter the zang-fu organs through the meridians — these are causes from the interior; second, the four limbs and nine orifices are affected through the blood vessels, causing obstruction and blockage — these are causes from the exterior affecting the skin; third, injury from sexual excess, metal blades, or animal attack. Examining these, the sources of disease are exhausted.',
    topics: ['pathology', 'diagnosis', 'meridians', 'zang_fu', 'blood'],
    relevance_patterns: [
      'qi_stagnation',
      'blood_stasis',
      'wind_cold',
      'wind_heat',
      'kidney_essence_deficiency',
    ],
  },
  {
    id: 'jg_004',
    text_id: 'jin_gui_yao_lue',
    chapter: 'Xue Bi Xu Lao Bing Mai Zheng Bing Zhi (血痹虚劳病脉证并治第六)',
    passage_chinese:
      '虚劳诸不足，风气百疾，薯蓣丸主之。',
    passage_english:
      'For consumptive deficiency with various insufficiencies and the hundred ailments of wind qi, Shu Yu Wan (Dioscorea Pill) governs this.',
    topics: ['deficiency', 'herbal_medicine', 'treatment_principles', 'qi', 'blood'],
    relevance_patterns: [
      'qi_deficiency',
      'blood_deficiency',
      'kidney_essence_deficiency',
    ],
  },
  {
    id: 'jg_005',
    text_id: 'jin_gui_yao_lue',
    chapter: 'Xiong Bi Xin Tong Duan Qi Bing Mai Zheng Zhi (胸痹心痛短气病脉证治第九)',
    passage_chinese:
      '胸痹之病，喘息咳唾，胸背痛，短气，寸口脉沉而迟，关上小紧数，栝蒌薤白白酒汤主之。',
    passage_english:
      'In chest bi-obstruction disease, there is dyspnoea, coughing and spitting, pain in the chest and back, and shortness of breath. The cun pulse is deep and slow; the guan pulse is slightly tight and rapid. Gua Lou Xie Bai Bai Jiu Tang (Trichosanthes, Chinese Chive, and Wine Decoction) governs this.',
    topics: ['heart', 'lung', 'qi', 'diagnosis', 'herbal_medicine', 'pathology', 'phlegm'],
    relevance_patterns: [
      'heart_yang_deficiency',
      'phlegm_dampness',
      'blood_stasis',
      'qi_stagnation',
    ],
  },
  {
    id: 'jg_006',
    text_id: 'jin_gui_yao_lue',
    chapter: 'Tan Yin Ke Sou Bing Mai Zheng Bing Zhi (痰饮咳嗽病脉证并治第十二)',
    passage_chinese:
      '病痰饮者，当以温药和之。',
    passage_english:
      'For diseases of phlegm and thin mucus, one should harmonize with warm medicinals.',
    topics: ['phlegm', 'dampness', 'herbal_medicine', 'treatment_principles', 'cold'],
    relevance_patterns: [
      'phlegm_dampness',
      'spleen_yang_deficiency',
      'kidney_yang_deficiency',
    ],
  },
  {
    id: 'jg_007',
    text_id: 'jin_gui_yao_lue',
    chapter: 'Shui Qi Bing Mai Zheng Bing Zhi (水气病脉证并治第十四)',
    passage_chinese:
      '师曰：诸有水者，腰以下肿，当利小便；腰以上肿，当发汗乃愈。',
    passage_english:
      'The Master said: In all conditions with water accumulation, if the swelling is below the waist, one should promote urination. If the swelling is above the waist, one should promote sweating — then recovery follows.',
    topics: ['dampness', 'treatment_principles', 'diagnosis', 'pathology'],
    relevance_patterns: [
      'phlegm_dampness',
      'spleen_yang_deficiency',
      'kidney_yang_deficiency',
      'damp_heat',
    ],
  },
  {
    id: 'jg_008',
    text_id: 'jin_gui_yao_lue',
    chapter: 'Fu Ren Za Bing Mai Zheng Bing Zhi (妇人杂病脉证并治第二十二)',
    passage_chinese:
      '妇人之病，因虚、积冷、结气，为诸经水断绝。至有历年，血寒积结胞门，寒伤经络。',
    passage_english:
      'Diseases of women arise from deficiency, accumulated cold, and bound qi, causing menstruation to cease. Over the years, cold blood accumulates and binds at the uterine gate, and cold injures the meridians.',
    topics: ['blood', 'cold', 'deficiency', 'qi_stagnation', 'blood_stasis', 'meridians'],
    relevance_patterns: [
      'blood_stasis',
      'blood_deficiency',
      'kidney_yang_deficiency',
      'liver_qi_stagnation',
    ],
  },
  {
    id: 'jg_009',
    text_id: 'jin_gui_yao_lue',
    chapter: 'Zang Fu Jing Luo Xian Hou Bing Mai Zheng (脏腑经络先后病脉证第一)',
    passage_chinese:
      '若人能养慎，不令邪风干忤经络。适中经络，未流传脏腑，即医治之。四肢才觉重滞，即导引吐纳，针灸膏摩，勿令九窍闭塞。',
    passage_english:
      'If a person can nourish and be cautious, not allowing pathogenic wind to assail the meridians — and if wind does strike the meridians but has not yet transmitted to the zang-fu organs — one should treat immediately. As soon as the four limbs feel heavy and sluggish, one should use daoyin breathing exercises, acupuncture and moxibustion, ointment massage, and not allow the nine orifices to become blocked.',
    topics: ['prevention', 'meridians', 'acupuncture', 'wind', 'treatment_principles'],
    relevance_patterns: [
      'wind_cold',
      'wind_heat',
      'qi_stagnation',
      'blood_stasis',
    ],
  },
  {
    id: 'jg_010',
    text_id: 'jin_gui_yao_lue',
    chapter: 'Fu Ren Chan Hou Bing Mai Zheng Zhi (妇人产后病脉证治第二十一)',
    passage_chinese:
      '产后病痉，项背强几几，用大承气汤。',
    passage_english:
      'For postpartum convulsive disease with rigidity of the neck and back, use Da Cheng Qi Tang (Major Order the Qi Decoction).',
    topics: ['herbal_medicine', 'wind', 'blood', 'treatment_principles', 'pathology'],
    relevance_patterns: ['blood_deficiency', 'liver_wind', 'blood_stasis'],
  },
  {
    id: 'jg_011',
    text_id: 'jin_gui_yao_lue',
    chapter: 'Xue Bi Xu Lao Bing Mai Zheng Bing Zhi (血痹虚劳病脉证并治第六)',
    passage_chinese:
      '男子面色薄者，主渴及亡血，卒喘悸，脉浮者，里虚也。',
    passage_english:
      'When a man has a pale, lusterless complexion, this indicates thirst and blood loss. With sudden dyspnoea and palpitations and a floating pulse, there is interior deficiency.',
    topics: ['blood', 'deficiency', 'diagnosis', 'heart', 'qi'],
    relevance_patterns: [
      'blood_deficiency',
      'heart_blood_deficiency',
      'qi_deficiency',
    ],
  },
];

// ---------------------------------------------------------------------------
// Helper Functions
// ---------------------------------------------------------------------------

/**
 * Retrieve all classical passages relevant to a given TCM pattern.
 *
 * @param pattern - A TCM pattern identifier, e.g. "liver_qi_stagnation"
 * @returns An array of matching ClassicalPassage objects
 */
export function getPassagesByPattern(pattern: string): ClassicalPassage[] {
  const normalised = pattern.toLowerCase().trim();
  return CLASSICAL_PASSAGES.filter((p) =>
    p.relevance_patterns.some((rp) => rp.toLowerCase() === normalised),
  );
}

/**
 * Retrieve all classical passages tagged with a given topic.
 *
 * @param topic - A topic tag, e.g. "liver", "qi_stagnation", "herbal_medicine"
 * @returns An array of matching ClassicalPassage objects
 */
export function getPassagesByTopic(topic: string): ClassicalPassage[] {
  const normalised = topic.toLowerCase().trim();
  return CLASSICAL_PASSAGES.filter((p) =>
    p.topics.some((t) => t.toLowerCase() === normalised),
  );
}

/**
 * Retrieve all classical passages from a specific text.
 *
 * @param textId - The text identifier, e.g. "su_wen", "shang_han_lun"
 * @returns An array of matching ClassicalPassage objects
 */
export function getPassagesByText(textId: string): ClassicalPassage[] {
  const normalised = textId.toLowerCase().trim();
  return CLASSICAL_PASSAGES.filter((p) => p.text_id.toLowerCase() === normalised);
}
