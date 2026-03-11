import type { MeridianData, MeridianPoint } from './types';

// ============================================================
// COMPREHENSIVE TCM MERIDIAN & ACUPUNCTURE POINT DATABASE
// All 12 Primary Meridians + Du Mai + Ren Mai
// Anatomically mapped to 3D body coordinates
// ============================================================

// Coordinate system:
// X: left-right (+ = patient's left, - = right). Shoulders ~±0.22
// Y: up-down (0 = feet, 1.72 = top of head)
// Z: front-back (+ = anterior, - = posterior). Torso depth ~±0.12

export const MERIDIANS: MeridianData[] = [
  // ================================================================
  // 1. LUNG MERIDIAN (手太阴肺经)
  // ================================================================
  {
    id: 'lung',
    name_english: 'Lung',
    name_pinyin: 'Shǒu Tài Yīn Fèi Jīng',
    name_chinese: '手太阴肺经',
    abbreviation: 'LU',
    organ: 'Lung',
    element: 'Metal',
    yin_yang: 'yin',
    paired_meridian: 'large-intestine',
    flow_direction: 'descending',
    colour: '#C0C0C0',
    pathway: [
      [-0.10, 1.35, 0.10], // chest lateral
      [-0.14, 1.32, 0.09], // LU-1 area
      [-0.18, 1.28, 0.06], // anterior shoulder
      [-0.22, 1.22, 0.04], // axilla front
      [-0.24, 1.15, 0.03], // upper arm medial
      [-0.27, 1.08, 0.02], // mid upper arm
      [-0.29, 1.00, 0.02], // elbow crease
      [-0.30, 0.95, 0.02], // below elbow
      [-0.32, 0.88, 0.03], // mid forearm
      [-0.33, 0.82, 0.04], // above wrist
      [-0.34, 0.78, 0.04], // wrist crease
      [-0.35, 0.75, 0.05], // thenar eminence
      [-0.36, 0.73, 0.06], // thumb tip area
    ],
    points: [
      { id: 'LU-1', number: 1, name_pinyin: 'Zhōng Fǔ', name_chinese: '中府', name_english: 'Central Treasury', position: [-0.14, 1.32, 0.09], category: 'Front-Mu', functions: ['Front-Mu point of the Lung', 'Descends Lung Qi', 'Disperses fullness in the chest', 'Stops cough and wheezing'], indications: ['Cough', 'Asthma', 'Chest pain', 'Shoulder pain', 'Fullness in chest'], common_techniques: ['tonify', 'even'] },
      { id: 'LU-2', number: 2, name_pinyin: 'Yún Mén', name_chinese: '云门', name_english: 'Cloud Gate', position: [-0.16, 1.34, 0.08], functions: ['Disperses Lung Qi', 'Clears Heat from the Lung', 'Regulates water passages'], indications: ['Cough', 'Asthma', 'Chest pain', 'Shoulder pain'], common_techniques: ['even', 'reduce'] },
      { id: 'LU-5', number: 5, name_pinyin: 'Chǐ Zé', name_chinese: '尺泽', name_english: 'Cubit Marsh', position: [-0.29, 1.00, 0.03], category: 'He-Sea', functions: ['He-Sea point (Water)', 'Clears Lung Heat', 'Descends rebellious Qi', 'Relaxes sinews', 'Benefits the Bladder'], indications: ['Cough', 'Hemoptysis', 'Afternoon fever', 'Elbow pain', 'Infantile convulsions'], common_techniques: ['reduce', 'bloodletting'] },
      { id: 'LU-6', number: 6, name_pinyin: 'Kǒng Zuì', name_chinese: '孔最', name_english: 'Maximum Opening', position: [-0.30, 0.95, 0.03], category: 'Xi-Cleft', functions: ['Xi-Cleft point of the Lung', 'Clears Lung Heat', 'Stops bleeding', 'Descends Lung Qi'], indications: ['Cough', 'Asthma', 'Hemoptysis', 'Sore throat', 'Elbow pain'], common_techniques: ['reduce', 'even'] },
      { id: 'LU-7', number: 7, name_pinyin: 'Liè Quē', name_chinese: '列缺', name_english: 'Broken Sequence', position: [-0.33, 0.82, 0.04], category: 'Luo-Connecting', functions: ['Luo-Connecting point', 'Confluent point of Ren Mai', 'Command point of head and neck', 'Disperses Wind', 'Benefits head and neck', 'Opens water passages'], indications: ['Headache', 'Neck stiffness', 'Cough', 'Sore throat', 'Facial paralysis', 'Toothache'], common_techniques: ['even', 'tonify', 'moxa'] },
      { id: 'LU-9', number: 9, name_pinyin: 'Tài Yuān', name_chinese: '太渊', name_english: 'Great Abyss', position: [-0.34, 0.78, 0.04], category: 'Yuan-Source', functions: ['Yuan-Source point', 'Shu-Stream point (Earth)', 'Hui-Meeting point of vessels', 'Tonifies Lung Qi and Yin', 'Resolves Phlegm', 'Promotes blood circulation'], indications: ['Cough', 'Asthma', 'Hemoptysis', 'Sore throat', 'Pulseless syndrome', 'Wrist pain'], common_techniques: ['tonify', 'moxa'] },
      { id: 'LU-10', number: 10, name_pinyin: 'Yú Jì', name_chinese: '鱼际', name_english: 'Fish Border', position: [-0.35, 0.75, 0.05], category: 'Ying-Spring', functions: ['Ying-Spring point (Fire)', 'Clears Lung Heat', 'Benefits the throat', 'Descends rebellious Qi'], indications: ['Cough', 'Hemoptysis', 'Sore throat', 'Loss of voice', 'Fever'], common_techniques: ['reduce', 'bloodletting'] },
      { id: 'LU-11', number: 11, name_pinyin: 'Shào Shāng', name_chinese: '少商', name_english: 'Lesser Shang', position: [-0.36, 0.73, 0.06], category: 'Jing-Well', functions: ['Jing-Well point (Wood)', 'Clears Lung Heat', 'Benefits the throat', 'Expels Wind', 'Restores consciousness'], indications: ['Sore throat', 'Cough', 'Nosebleed', 'Fever', 'Loss of consciousness', 'Mumps'], common_techniques: ['bloodletting', 'reduce'] },
    ],
  },

  // ================================================================
  // 2. LARGE INTESTINE MERIDIAN (手阳明大肠经)
  // ================================================================
  {
    id: 'large-intestine',
    name_english: 'Large Intestine',
    name_pinyin: 'Shǒu Yáng Míng Dà Cháng Jīng',
    name_chinese: '手阳明大肠经',
    abbreviation: 'LI',
    organ: 'Large Intestine',
    element: 'Metal',
    yin_yang: 'yang',
    paired_meridian: 'lung',
    flow_direction: 'ascending',
    colour: '#E8E8E8',
    pathway: [
      [-0.36, 0.73, 0.04], // index finger
      [-0.35, 0.76, 0.03], // hand dorsum
      [-0.34, 0.78, 0.02], // wrist dorsum
      [-0.32, 0.85, 0.00], // mid forearm posterior
      [-0.30, 0.92, -0.01], // forearm
      [-0.28, 1.00, -0.01], // lateral elbow
      [-0.26, 1.08, 0.00], // upper arm lateral
      [-0.23, 1.18, 0.01], // deltoid
      [-0.18, 1.28, 0.02], // shoulder top
      [-0.12, 1.38, 0.02], // supraclavicular
      [-0.06, 1.50, 0.06], // neck lateral
      [-0.02, 1.58, 0.08], // jaw
      [0.02, 1.60, 0.10], // nose (crosses midline)
    ],
    points: [
      { id: 'LI-1', number: 1, name_pinyin: 'Shāng Yáng', name_chinese: '商阳', name_english: 'Shang Yang', position: [-0.36, 0.73, 0.04], category: 'Jing-Well', functions: ['Jing-Well point (Metal)', 'Clears Heat', 'Benefits the throat', 'Restores consciousness'], indications: ['Sore throat', 'Toothache', 'Deafness', 'Fever', 'Numbness of fingers'], common_techniques: ['bloodletting', 'reduce'] },
      { id: 'LI-4', number: 4, name_pinyin: 'Hé Gǔ', name_chinese: '合谷', name_english: 'Joining Valley', position: [-0.35, 0.76, 0.03], category: 'Yuan-Source', functions: ['Yuan-Source point', 'Command point of face and mouth', 'Expels Wind', 'Clears Heat', 'Regulates Wei Qi', 'Stops pain', 'Promotes labour'], indications: ['Headache', 'Toothache', 'Facial pain', 'Sore throat', 'Common cold', 'Fever', 'Delayed labour'], common_techniques: ['even', 'reduce', 'tonify', 'moxa'] },
      { id: 'LI-5', number: 5, name_pinyin: 'Yáng Xī', name_chinese: '阳溪', name_english: 'Yang Stream', position: [-0.34, 0.78, 0.02], category: 'Jing-River', functions: ['Jing-River point (Fire)', 'Clears Heat', 'Benefits the wrist'], indications: ['Headache', 'Eye pain', 'Toothache', 'Sore throat', 'Wrist pain'], common_techniques: ['reduce', 'even'] },
      { id: 'LI-10', number: 10, name_pinyin: 'Shǒu Sān Lǐ', name_chinese: '手三里', name_english: 'Arm Three Miles', position: [-0.30, 0.92, -0.01], functions: ['Regulates Qi and Blood', 'Harmonises the Stomach and Intestines', 'Benefits the arm'], indications: ['Arm pain', 'Elbow pain', 'Abdominal pain', 'Diarrhea', 'Toothache'], common_techniques: ['even', 'moxa'] },
      { id: 'LI-11', number: 11, name_pinyin: 'Qū Chí', name_chinese: '曲池', name_english: 'Pool at the Bend', position: [-0.28, 1.00, -0.01], category: 'He-Sea', functions: ['He-Sea point (Earth)', 'Clears Heat', 'Cools Blood', 'Resolves Dampness', 'Expels Wind', 'Regulates Qi and Blood', 'Benefits sinews and joints'], indications: ['Fever', 'Sore throat', 'Skin diseases', 'Hypertension', 'Elbow pain', 'Hemiplegia', 'Urticaria'], common_techniques: ['reduce', 'even', 'bloodletting'] },
      { id: 'LI-14', number: 14, name_pinyin: 'Bì Nào', name_chinese: '臂臑', name_english: 'Upper Arm', position: [-0.24, 1.12, 0.01], functions: ['Benefits the eyes', 'Dissipates nodules', 'Benefits the shoulder and arm'], indications: ['Shoulder pain', 'Arm pain', 'Eye diseases', 'Scrofula'], common_techniques: ['even', 'moxa'] },
      { id: 'LI-15', number: 15, name_pinyin: 'Jiān Yú', name_chinese: '肩髃', name_english: 'Shoulder Bone', position: [-0.20, 1.30, 0.02], functions: ['Benefits the shoulder joint', 'Expels Wind-Damp', 'Moves Qi and Blood'], indications: ['Shoulder pain', 'Arm pain', 'Hemiplegia', 'Urticaria'], common_techniques: ['even', 'moxa', 'electroacupuncture'] },
      { id: 'LI-18', number: 18, name_pinyin: 'Fú Tū', name_chinese: '扶突', name_english: 'Support the Prominence', position: [-0.06, 1.50, 0.06], functions: ['Benefits the throat', 'Regulates Qi', 'Resolves Phlegm'], indications: ['Cough', 'Asthma', 'Sore throat', 'Goiter', 'Sudden loss of voice'], common_techniques: ['even'] },
      { id: 'LI-20', number: 20, name_pinyin: 'Yíng Xiāng', name_chinese: '迎香', name_english: 'Welcome Fragrance', position: [0.02, 1.60, 0.12], functions: ['Opens the nasal passages', 'Expels Wind', 'Clears Heat'], indications: ['Nasal obstruction', 'Nosebleed', 'Rhinitis', 'Facial paralysis', 'Loss of smell'], common_techniques: ['even', 'reduce'] },
      { id: 'LI-6', number: 6, name_pinyin: 'Piān Lì', name_chinese: '偏历', name_english: 'Veering Passageway', position: [-0.32, 0.85, 0.00], category: 'Luo-Connecting', functions: ['Luo-Connecting point', 'Expels Wind', 'Opens water passages', 'Benefits the ear'], indications: ['Tinnitus', 'Deafness', 'Nosebleed', 'Edema', 'Sore throat'], common_techniques: ['even'] },
    ],
  },

  // ================================================================
  // 3. STOMACH MERIDIAN (足阳明胃经)
  // ================================================================
  {
    id: 'stomach',
    name_english: 'Stomach',
    name_pinyin: 'Zú Yáng Míng Wèi Jīng',
    name_chinese: '足阳明胃经',
    abbreviation: 'ST',
    organ: 'Stomach',
    element: 'Earth',
    yin_yang: 'yang',
    paired_meridian: 'spleen',
    flow_direction: 'descending',
    colour: '#DAA520',
    pathway: [
      [-0.04, 1.62, 0.10], // below eye
      [-0.04, 1.58, 0.12], // cheek
      [-0.05, 1.55, 0.10], // jaw angle
      [-0.04, 1.50, 0.08], // mandible
      [-0.06, 1.42, 0.08], // throat
      [-0.08, 1.35, 0.08], // supraclavicular
      [-0.10, 1.28, 0.08], // chest
      [-0.10, 1.18, 0.08], // nipple line
      [-0.08, 1.08, 0.10], // upper abdomen
      [-0.06, 0.98, 0.10], // umbilicus level
      [-0.06, 0.90, 0.10], // lower abdomen
      [-0.08, 0.82, 0.08], // inguinal
      [-0.10, 0.72, 0.06], // anterior thigh
      [-0.10, 0.58, 0.06], // mid thigh
      [-0.10, 0.48, 0.08], // above knee
      [-0.09, 0.40, 0.08], // below knee
      [-0.08, 0.30, 0.08], // mid leg anterior
      [-0.08, 0.20, 0.08], // lower leg
      [-0.07, 0.10, 0.08], // ankle
      [-0.06, 0.05, 0.10], // foot dorsum
      [-0.05, 0.02, 0.12], // 2nd toe
    ],
    points: [
      { id: 'ST-2', number: 2, name_pinyin: 'Sì Bái', name_chinese: '四白', name_english: 'Four Whites', position: [-0.04, 1.62, 0.11], functions: ['Benefits the eyes', 'Expels Wind', 'Clears Heat'], indications: ['Eye diseases', 'Facial pain', 'Headache', 'Dizziness', 'Facial paralysis'], common_techniques: ['even'] },
      { id: 'ST-6', number: 6, name_pinyin: 'Jiá Chē', name_chinese: '颊车', name_english: 'Jaw Bone', position: [-0.06, 1.55, 0.08], functions: ['Benefits the jaw', 'Eliminates Wind', 'Relieves pain'], indications: ['Toothache', 'TMJ disorders', 'Facial paralysis', 'Lockjaw', 'Mumps'], common_techniques: ['even', 'reduce', 'electroacupuncture'] },
      { id: 'ST-7', number: 7, name_pinyin: 'Xià Guān', name_chinese: '下关', name_english: 'Below the Joint', position: [-0.07, 1.58, 0.07], functions: ['Benefits the ear and jaw', 'Eliminates Wind', 'Opens the ear'], indications: ['Deafness', 'Tinnitus', 'TMJ disorders', 'Toothache', 'Facial paralysis'], common_techniques: ['even'] },
      { id: 'ST-8', number: 8, name_pinyin: 'Tóu Wéi', name_chinese: '头维', name_english: 'Head Corner', position: [-0.06, 1.68, 0.06], functions: ['Eliminates Wind', 'Benefits the eyes', 'Relieves pain'], indications: ['Headache', 'Dizziness', 'Eye pain', 'Excessive tearing', 'Blurred vision'], common_techniques: ['even'] },
      { id: 'ST-21', number: 21, name_pinyin: 'Liáng Mén', name_chinese: '梁门', name_english: 'Beam Gate', position: [-0.06, 1.12, 0.10], functions: ['Harmonises the Stomach', 'Regulates Qi', 'Resolves Food Stagnation'], indications: ['Gastric pain', 'Vomiting', 'Poor appetite', 'Abdominal distension'], common_techniques: ['even', 'moxa'] },
      { id: 'ST-25', number: 25, name_pinyin: 'Tiān Shū', name_chinese: '天枢', name_english: 'Celestial Pivot', position: [-0.06, 0.98, 0.10], category: 'Front-Mu', functions: ['Front-Mu point of Large Intestine', 'Regulates Intestines', 'Regulates Qi', 'Resolves Dampness', 'Clears Heat'], indications: ['Abdominal pain', 'Diarrhea', 'Constipation', 'Dysentery', 'Borborygmus', 'Irregular menstruation'], common_techniques: ['even', 'moxa', 'tonify'] },
      { id: 'ST-34', number: 34, name_pinyin: 'Liáng Qiū', name_chinese: '梁丘', name_english: 'Beam Hill', position: [-0.10, 0.50, 0.07], category: 'Xi-Cleft', functions: ['Xi-Cleft point', 'Harmonises the Stomach', 'Regulates Qi', 'Activates the channel'], indications: ['Gastric pain', 'Knee pain', 'Mastitis', 'Diarrhea'], common_techniques: ['reduce', 'even'] },
      { id: 'ST-36', number: 36, name_pinyin: 'Zú Sān Lǐ', name_chinese: '足三里', name_english: 'Leg Three Miles', position: [-0.09, 0.40, 0.08], category: 'He-Sea', functions: ['He-Sea point (Earth)', 'Command point of the abdomen', 'Tonifies Qi and Blood', 'Harmonises the Stomach', 'Strengthens the Spleen', 'Raises Yang', 'Calms the Spirit', 'Benefits the whole body'], indications: ['Gastric pain', 'Vomiting', 'Diarrhea', 'Abdominal distension', 'Fatigue', 'Dizziness', 'Knee pain', 'Immunity boost'], common_techniques: ['tonify', 'moxa', 'even', 'electroacupuncture'] },
      { id: 'ST-40', number: 40, name_pinyin: 'Fēng Lóng', name_chinese: '丰隆', name_english: 'Abundant Bulge', position: [-0.08, 0.30, 0.08], category: 'Luo-Connecting', functions: ['Luo-Connecting point', 'Resolves Phlegm and Dampness', 'Calms the Spirit', 'Opens the chest'], indications: ['Cough with phlegm', 'Asthma', 'Dizziness', 'Headache', 'Mental disorders', 'Leg pain'], common_techniques: ['reduce', 'even', 'moxa'] },
      { id: 'ST-41', number: 41, name_pinyin: 'Jiě Xī', name_chinese: '解溪', name_english: 'Stream Divide', position: [-0.07, 0.12, 0.08], category: 'Jing-River', functions: ['Jing-River point (Fire)', 'Clears Stomach Heat', 'Calms the Spirit', 'Benefits the ankle'], indications: ['Headache', 'Dizziness', 'Abdominal distension', 'Constipation', 'Ankle pain'], common_techniques: ['even', 'reduce'] },
      { id: 'ST-44', number: 44, name_pinyin: 'Nèi Tíng', name_chinese: '内庭', name_english: 'Inner Court', position: [-0.05, 0.03, 0.12], category: 'Ying-Spring', functions: ['Ying-Spring point (Water)', 'Clears Heat from Stomach channel', 'Harmonises the Intestines', 'Clears Damp-Heat'], indications: ['Toothache', 'Sore throat', 'Gastric pain', 'Diarrhea', 'Nosebleed', 'Foot pain'], common_techniques: ['reduce', 'even'] },
      { id: 'ST-45', number: 45, name_pinyin: 'Lì Duì', name_chinese: '厉兑', name_english: 'Severe Mouth', position: [-0.05, 0.02, 0.13], category: 'Jing-Well', functions: ['Jing-Well point (Metal)', 'Clears Heat', 'Calms the Spirit', 'Restores consciousness'], indications: ['Facial swelling', 'Toothache', 'Nosebleed', 'Mental disorders', 'Dream-disturbed sleep'], common_techniques: ['bloodletting'] },
    ],
  },

  // ================================================================
  // 4. SPLEEN MERIDIAN (足太阴脾经)
  // ================================================================
  {
    id: 'spleen',
    name_english: 'Spleen',
    name_pinyin: 'Zú Tài Yīn Pí Jīng',
    name_chinese: '足太阴脾经',
    abbreviation: 'SP',
    organ: 'Spleen',
    element: 'Earth',
    yin_yang: 'yin',
    paired_meridian: 'stomach',
    flow_direction: 'ascending',
    colour: '#CD853F',
    pathway: [
      [-0.04, 0.02, 0.08], // big toe medial
      [-0.04, 0.05, 0.06], // foot medial
      [-0.05, 0.10, 0.04], // medial malleolus
      [-0.06, 0.18, 0.02], // lower leg medial
      [-0.07, 0.28, 0.02], // mid leg medial
      [-0.08, 0.38, 0.02], // below knee medial
      [-0.09, 0.48, 0.02], // above knee medial
      [-0.10, 0.58, 0.02], // mid thigh medial
      [-0.08, 0.72, 0.04], // inguinal
      [-0.06, 0.90, 0.08], // lower abdomen
      [-0.08, 1.00, 0.08], // abdomen
      [-0.10, 1.10, 0.08], // upper abdomen
      [-0.14, 1.20, 0.06], // lateral chest
      [-0.16, 1.28, 0.04], // axillary line
    ],
    points: [
      { id: 'SP-1', number: 1, name_pinyin: 'Yǐn Bái', name_chinese: '隐白', name_english: 'Hidden White', position: [-0.04, 0.02, 0.08], category: 'Jing-Well', functions: ['Jing-Well point (Wood)', 'Stops bleeding', 'Strengthens the Spleen', 'Regulates menstruation', 'Calms the Spirit'], indications: ['Uterine bleeding', 'Bloody stool', 'Mental disorders', 'Dream-disturbed sleep', 'Abdominal distension'], common_techniques: ['moxa', 'tonify'] },
      { id: 'SP-3', number: 3, name_pinyin: 'Tài Bái', name_chinese: '太白', name_english: 'Supreme White', position: [-0.04, 0.05, 0.06], category: 'Yuan-Source', functions: ['Yuan-Source point', 'Shu-Stream point (Earth)', 'Strengthens the Spleen', 'Resolves Dampness', 'Harmonises the Stomach'], indications: ['Gastric pain', 'Abdominal distension', 'Diarrhea', 'Vomiting', 'Borborygmus', 'Heavy limbs'], common_techniques: ['tonify', 'moxa'] },
      { id: 'SP-4', number: 4, name_pinyin: 'Gōng Sūn', name_chinese: '公孙', name_english: 'Grandfather Grandson', position: [-0.05, 0.06, 0.04], category: 'Luo-Connecting', functions: ['Luo-Connecting point', 'Confluent point of Chong Mai', 'Strengthens the Spleen', 'Harmonises the Stomach', 'Regulates Chong Mai'], indications: ['Gastric pain', 'Vomiting', 'Diarrhea', 'Irregular menstruation', 'Heart pain'], common_techniques: ['tonify', 'moxa', 'even'] },
      { id: 'SP-6', number: 6, name_pinyin: 'Sān Yīn Jiāo', name_chinese: '三阴交', name_english: 'Three Yin Intersection', position: [-0.06, 0.18, 0.02], functions: ['Meeting point of three Yin meridians (Spleen, Liver, Kidney)', 'Strengthens the Spleen', 'Nourishes Yin and Blood', 'Benefits the Kidney', 'Regulates menstruation', 'Promotes labour', 'Calms the Spirit'], indications: ['Abdominal distension', 'Diarrhea', 'Irregular menstruation', 'Insomnia', 'Infertility', 'Impotence', 'Urinary disorders', 'Leg pain'], common_techniques: ['tonify', 'moxa', 'even'] },
      { id: 'SP-8', number: 8, name_pinyin: 'Dì Jī', name_chinese: '地机', name_english: 'Earth Mechanism', position: [-0.07, 0.28, 0.02], category: 'Xi-Cleft', functions: ['Xi-Cleft point', 'Regulates menstruation', 'Removes Blood stasis', 'Strengthens the Spleen'], indications: ['Irregular menstruation', 'Dysmenorrhea', 'Uterine bleeding', 'Abdominal pain', 'Edema'], common_techniques: ['even', 'reduce'] },
      { id: 'SP-9', number: 9, name_pinyin: 'Yīn Líng Quán', name_chinese: '阴陵泉', name_english: 'Yin Mound Spring', position: [-0.08, 0.38, 0.02], category: 'He-Sea', functions: ['He-Sea point (Water)', 'Resolves Dampness', 'Benefits the Spleen', 'Opens water passages', 'Benefits the Lower Jiao'], indications: ['Abdominal distension', 'Diarrhea', 'Edema', 'Jaundice', 'Urinary retention', 'Knee pain'], common_techniques: ['even', 'reduce', 'moxa'] },
      { id: 'SP-10', number: 10, name_pinyin: 'Xuè Hǎi', name_chinese: '血海', name_english: 'Sea of Blood', position: [-0.09, 0.48, 0.03], functions: ['Invigorates Blood', 'Nourishes Blood', 'Cools Blood', 'Benefits menstruation', 'Benefits the skin'], indications: ['Irregular menstruation', 'Dysmenorrhea', 'Uterine bleeding', 'Urticaria', 'Eczema', 'Knee pain'], common_techniques: ['even', 'tonify', 'moxa'] },
      { id: 'SP-15', number: 15, name_pinyin: 'Dà Héng', name_chinese: '大横', name_english: 'Great Horizontal', position: [-0.10, 0.98, 0.08], functions: ['Strengthens the Spleen', 'Resolves Dampness', 'Regulates Qi', 'Benefits the Intestines'], indications: ['Abdominal pain', 'Diarrhea', 'Constipation', 'Intestinal parasites'], common_techniques: ['even', 'moxa'] },
      { id: 'SP-21', number: 21, name_pinyin: 'Dà Bāo', name_chinese: '大包', name_english: 'Great Wrapping', position: [-0.16, 1.22, 0.04], functions: ['Great Luo of the Spleen', 'Regulates Qi and Blood of the whole body', 'Benefits the sinews and joints'], indications: ['Pain all over the body', 'Weakness of limbs', 'Chest and hypochondriac pain'], common_techniques: ['even'] },
    ],
  },

  // ================================================================
  // 5. HEART MERIDIAN (手少阴心经)
  // ================================================================
  {
    id: 'heart',
    name_english: 'Heart',
    name_pinyin: 'Shǒu Shào Yīn Xīn Jīng',
    name_chinese: '手少阴心经',
    abbreviation: 'HT',
    organ: 'Heart',
    element: 'Fire',
    yin_yang: 'yin',
    paired_meridian: 'small-intestine',
    flow_direction: 'descending',
    colour: '#FF4444',
    pathway: [
      [-0.12, 1.30, 0.02], // axilla
      [-0.18, 1.24, 0.00], // upper arm medial
      [-0.22, 1.16, -0.01], // mid arm
      [-0.26, 1.06, -0.01], // above elbow medial
      [-0.28, 1.00, 0.00], // elbow medial
      [-0.30, 0.92, 0.01], // forearm ulnar
      [-0.32, 0.84, 0.02], // mid forearm
      [-0.33, 0.78, 0.02], // wrist ulnar
      [-0.34, 0.74, 0.04], // palm ulnar
      [-0.35, 0.72, 0.05], // little finger
    ],
    points: [
      { id: 'HT-1', number: 1, name_pinyin: 'Jí Quán', name_chinese: '极泉', name_english: 'Summit Spring', position: [-0.14, 1.28, 0.01], functions: ['Benefits the arm', 'Opens the chest', 'Calms the Heart'], indications: ['Heart pain', 'Arm pain', 'Axillary pain', 'Sadness', 'Dry throat'], common_techniques: ['even'] },
      { id: 'HT-3', number: 3, name_pinyin: 'Shào Hǎi', name_chinese: '少海', name_english: 'Lesser Sea', position: [-0.28, 1.00, 0.00], category: 'He-Sea', functions: ['He-Sea point (Water)', 'Calms the Spirit', 'Clears Heart Fire', 'Benefits the elbow and arm'], indications: ['Heart pain', 'Elbow pain', 'Tremor', 'Numbness', 'Mental disorders', 'Scrofula'], common_techniques: ['even', 'tonify'] },
      { id: 'HT-5', number: 5, name_pinyin: 'Tōng Lǐ', name_chinese: '通里', name_english: 'Connecting Li', position: [-0.32, 0.84, 0.02], category: 'Luo-Connecting', functions: ['Luo-Connecting point', 'Calms the Spirit', 'Benefits the tongue', 'Regulates Heart Qi'], indications: ['Palpitations', 'Sudden loss of voice', 'Stiff tongue', 'Wrist pain', 'Dizziness'], common_techniques: ['tonify', 'even'] },
      { id: 'HT-6', number: 6, name_pinyin: 'Yīn Xī', name_chinese: '阴郄', name_english: 'Yin Cleft', position: [-0.32, 0.82, 0.02], category: 'Xi-Cleft', functions: ['Xi-Cleft point', 'Calms the Spirit', 'Stops night sweating', 'Nourishes Heart Yin'], indications: ['Night sweating', 'Palpitations', 'Chest pain', 'Nosebleed', 'Anxiety'], common_techniques: ['tonify', 'even'] },
      { id: 'HT-7', number: 7, name_pinyin: 'Shén Mén', name_chinese: '神门', name_english: 'Spirit Gate', position: [-0.33, 0.78, 0.02], category: 'Yuan-Source', functions: ['Yuan-Source point', 'Shu-Stream point (Earth)', 'Calms the Spirit', 'Nourishes Heart Blood and Yin', 'Opens orifices', 'Clears Heart channel'], indications: ['Insomnia', 'Palpitations', 'Anxiety', 'Poor memory', 'Mania', 'Epilepsy', 'Heart pain', 'Wrist pain'], common_techniques: ['tonify', 'even', 'moxa'] },
      { id: 'HT-8', number: 8, name_pinyin: 'Shào Fǔ', name_chinese: '少府', name_english: 'Lesser Mansion', position: [-0.34, 0.74, 0.04], category: 'Ying-Spring', functions: ['Ying-Spring point (Fire)', 'Clears Heart Fire', 'Calms the Spirit'], indications: ['Palpitations', 'Chest pain', 'Pruritus', 'Dysuria', 'Enuresis', 'Palm heat'], common_techniques: ['reduce', 'even'] },
      { id: 'HT-9', number: 9, name_pinyin: 'Shào Chōng', name_chinese: '少冲', name_english: 'Lesser Surge', position: [-0.35, 0.72, 0.05], category: 'Jing-Well', functions: ['Jing-Well point (Wood)', 'Clears Heat', 'Restores consciousness', 'Calms the Spirit'], indications: ['Palpitations', 'Heart pain', 'Chest pain', 'Loss of consciousness', 'Mania', 'Febrile diseases'], common_techniques: ['bloodletting', 'reduce'] },
    ],
  },

  // ================================================================
  // 6. SMALL INTESTINE MERIDIAN (手太阳小肠经)
  // ================================================================
  {
    id: 'small-intestine',
    name_english: 'Small Intestine',
    name_pinyin: 'Shǒu Tài Yáng Xiǎo Cháng Jīng',
    name_chinese: '手太阳小肠经',
    abbreviation: 'SI',
    organ: 'Small Intestine',
    element: 'Fire',
    yin_yang: 'yang',
    paired_meridian: 'heart',
    flow_direction: 'ascending',
    colour: '#FF6B35',
    pathway: [
      [-0.36, 0.72, 0.02], // little finger ulnar
      [-0.34, 0.76, 0.00], // hand ulnar border
      [-0.33, 0.78, -0.02], // wrist ulnar
      [-0.31, 0.85, -0.03], // forearm posterior
      [-0.28, 0.95, -0.04], // elbow posterior
      [-0.25, 1.08, -0.04], // upper arm posterior
      [-0.20, 1.22, -0.06], // posterior shoulder
      [-0.14, 1.32, -0.08], // scapula
      [-0.06, 1.40, -0.06], // upper back
      [-0.04, 1.48, 0.04], // neck lateral
      [-0.05, 1.56, 0.06], // cheek
      [-0.06, 1.60, 0.04], // ear area
    ],
    points: [
      { id: 'SI-1', number: 1, name_pinyin: 'Shào Zé', name_chinese: '少泽', name_english: 'Lesser Marsh', position: [-0.36, 0.72, 0.02], category: 'Jing-Well', functions: ['Jing-Well point (Metal)', 'Clears Heat', 'Promotes lactation', 'Benefits the eyes'], indications: ['Headache', 'Sore throat', 'Insufficient lactation', 'Loss of consciousness', 'Febrile diseases'], common_techniques: ['bloodletting'] },
      { id: 'SI-3', number: 3, name_pinyin: 'Hòu Xī', name_chinese: '后溪', name_english: 'Back Stream', position: [-0.34, 0.76, 0.00], category: 'Shu-Stream', functions: ['Shu-Stream point (Wood)', 'Confluent point of Du Mai', 'Benefits the occiput and spine', 'Clears the mind', 'Expels Wind', 'Treats malaria'], indications: ['Stiff neck', 'Occipital headache', 'Back pain', 'Malaria', 'Night sweating', 'Epilepsy', 'Tinnitus'], common_techniques: ['even', 'tonify', 'moxa'] },
      { id: 'SI-5', number: 5, name_pinyin: 'Yáng Gǔ', name_chinese: '阳谷', name_english: 'Yang Valley', position: [-0.33, 0.78, -0.02], category: 'Jing-River', functions: ['Jing-River point (Fire)', 'Clears Heat', 'Reduces swelling', 'Calms the Spirit'], indications: ['Wrist pain', 'Tinnitus', 'Toothache', 'Febrile diseases', 'Mental disorders'], common_techniques: ['reduce', 'even'] },
      { id: 'SI-6', number: 6, name_pinyin: 'Yǎng Lǎo', name_chinese: '养老', name_english: 'Nurturing the Aged', position: [-0.32, 0.80, -0.03], category: 'Xi-Cleft', functions: ['Xi-Cleft point', 'Benefits the eyes', 'Activates the channel', 'Relaxes sinews'], indications: ['Blurred vision', 'Shoulder pain', 'Elbow pain', 'Back pain', 'Acute lumbar sprain'], common_techniques: ['even', 'moxa'] },
      { id: 'SI-9', number: 9, name_pinyin: 'Jiān Zhēn', name_chinese: '肩贞', name_english: 'True Shoulder', position: [-0.20, 1.22, -0.06], functions: ['Benefits the shoulder', 'Activates the channel', 'Clears Heat'], indications: ['Shoulder pain', 'Arm pain', 'Scapular pain', 'Tinnitus'], common_techniques: ['even', 'moxa', 'electroacupuncture'] },
      { id: 'SI-11', number: 11, name_pinyin: 'Tiān Zōng', name_chinese: '天宗', name_english: 'Celestial Gathering', position: [-0.14, 1.28, -0.10], functions: ['Benefits the scapula', 'Activates the channel', 'Benefits the breast'], indications: ['Scapular pain', 'Shoulder pain', 'Lateral elbow pain', 'Insufficient lactation', 'Breast pain'], common_techniques: ['even', 'moxa', 'cupping'] },
      { id: 'SI-18', number: 18, name_pinyin: 'Quán Liáo', name_chinese: '颧髎', name_english: 'Cheek Bone Hole', position: [-0.06, 1.60, 0.08], functions: ['Eliminates Wind', 'Clears Heat', 'Reduces swelling'], indications: ['Facial paralysis', 'Toothache', 'Trigeminal neuralgia', 'Facial swelling'], common_techniques: ['even'] },
      { id: 'SI-19', number: 19, name_pinyin: 'Tīng Gōng', name_chinese: '听宫', name_english: 'Auditory Palace', position: [-0.07, 1.60, 0.05], functions: ['Benefits the ears', 'Opens the ear', 'Calms the Spirit'], indications: ['Deafness', 'Tinnitus', 'Ear pain', 'TMJ disorders', 'Toothache'], common_techniques: ['even'] },
    ],
  },

  // ================================================================
  // 7. BLADDER MERIDIAN (足太阳膀胱经)
  // ================================================================
  {
    id: 'bladder',
    name_english: 'Bladder',
    name_pinyin: 'Zú Tài Yáng Páng Guāng Jīng',
    name_chinese: '足太阳膀胱经',
    abbreviation: 'BL',
    organ: 'Bladder',
    element: 'Water',
    yin_yang: 'yang',
    paired_meridian: 'kidney',
    flow_direction: 'descending',
    colour: '#4169E1',
    pathway: [
      [-0.02, 1.66, 0.10], // inner eye corner
      [-0.02, 1.70, 0.08], // forehead
      [0.00, 1.72, 0.02], // vertex
      [-0.02, 1.70, -0.06], // occiput
      [-0.02, 1.60, -0.08], // back of head
      [-0.03, 1.48, -0.08], // neck posterior
      [-0.03, 1.38, -0.10], // upper back inner line
      [-0.03, 1.28, -0.10], // mid back
      [-0.03, 1.18, -0.10], // lower thoracic
      [-0.03, 1.08, -0.10], // lumbar upper
      [-0.03, 0.98, -0.10], // lumbar lower
      [-0.03, 0.88, -0.10], // sacrum
      [-0.06, 0.78, -0.08], // buttock
      [-0.08, 0.65, -0.06], // posterior thigh
      [-0.08, 0.50, -0.06], // mid thigh posterior
      [-0.06, 0.38, -0.06], // popliteal fossa
      [-0.06, 0.28, -0.06], // calf posterior
      [-0.06, 0.18, -0.06], // lower calf
      [-0.06, 0.10, -0.04], // Achilles area
      [-0.06, 0.06, -0.02], // lateral malleolus posterior
      [-0.05, 0.02, 0.06], // lateral foot
      [-0.04, 0.01, 0.10], // little toe
    ],
    points: [
      { id: 'BL-1', number: 1, name_pinyin: 'Jīng Míng', name_chinese: '睛明', name_english: 'Bright Eyes', position: [-0.02, 1.66, 0.10], functions: ['Benefits the eyes', 'Clears Heat', 'Expels Wind'], indications: ['Eye diseases', 'Blurred vision', 'Excessive tearing', 'Night blindness', 'Colour blindness'], common_techniques: ['even'] },
      { id: 'BL-2', number: 2, name_pinyin: 'Zǎn Zhú', name_chinese: '攒竹', name_english: 'Bamboo Gathering', position: [-0.02, 1.68, 0.10], functions: ['Benefits the eyes', 'Clears Wind-Heat', 'Relieves headache'], indications: ['Headache', 'Blurred vision', 'Excessive tearing', 'Facial paralysis', 'Supraorbital pain'], common_techniques: ['even', 'reduce'] },
      { id: 'BL-13', number: 13, name_pinyin: 'Fèi Shù', name_chinese: '肺俞', name_english: 'Lung Shu', position: [-0.03, 1.34, -0.10], category: 'Back-Shu', functions: ['Back-Shu point of the Lung', 'Tonifies Lung Qi', 'Nourishes Lung Yin', 'Clears Lung Heat', 'Releases the exterior'], indications: ['Cough', 'Asthma', 'Chest fullness', 'Night sweating', 'Afternoon fever', 'Skin diseases'], common_techniques: ['tonify', 'moxa', 'cupping'] },
      { id: 'BL-15', number: 15, name_pinyin: 'Xīn Shù', name_chinese: '心俞', name_english: 'Heart Shu', position: [-0.03, 1.30, -0.10], category: 'Back-Shu', functions: ['Back-Shu point of the Heart', 'Nourishes Heart Blood', 'Calms the Spirit', 'Clears Heart Heat'], indications: ['Heart pain', 'Palpitations', 'Insomnia', 'Anxiety', 'Poor memory', 'Night sweating', 'Epilepsy'], common_techniques: ['tonify', 'moxa', 'even'] },
      { id: 'BL-18', number: 18, name_pinyin: 'Gān Shù', name_chinese: '肝俞', name_english: 'Liver Shu', position: [-0.03, 1.22, -0.10], category: 'Back-Shu', functions: ['Back-Shu point of the Liver', 'Spreads Liver Qi', 'Nourishes Liver Blood', 'Benefits the eyes', 'Resolves Damp-Heat'], indications: ['Hypochondriac pain', 'Jaundice', 'Eye diseases', 'Dizziness', 'Epilepsy', 'Mental disorders'], common_techniques: ['even', 'reduce', 'moxa'] },
      { id: 'BL-20', number: 20, name_pinyin: 'Pí Shù', name_chinese: '脾俞', name_english: 'Spleen Shu', position: [-0.03, 1.18, -0.10], category: 'Back-Shu', functions: ['Back-Shu point of the Spleen', 'Tonifies the Spleen', 'Resolves Dampness', 'Nourishes Blood', 'Raises Qi'], indications: ['Abdominal distension', 'Diarrhea', 'Edema', 'Poor appetite', 'Fatigue', 'Uterine bleeding', 'Prolapse'], common_techniques: ['tonify', 'moxa'] },
      { id: 'BL-23', number: 23, name_pinyin: 'Shèn Shù', name_chinese: '肾俞', name_english: 'Kidney Shu', position: [-0.03, 1.08, -0.10], category: 'Back-Shu', functions: ['Back-Shu point of the Kidney', 'Tonifies the Kidney', 'Strengthens Lumbar', 'Benefits Essence and Marrow', 'Nourishes Yin', 'Warms Yang'], indications: ['Low back pain', 'Tinnitus', 'Deafness', 'Impotence', 'Enuresis', 'Irregular menstruation', 'Fatigue', 'Edema'], common_techniques: ['tonify', 'moxa'] },
      { id: 'BL-25', number: 25, name_pinyin: 'Dà Cháng Shù', name_chinese: '大肠俞', name_english: 'Large Intestine Shu', position: [-0.03, 1.00, -0.10], category: 'Back-Shu', functions: ['Back-Shu point of the Large Intestine', 'Regulates the Intestines', 'Strengthens the low back'], indications: ['Low back pain', 'Diarrhea', 'Constipation', 'Abdominal distension', 'Sciatica'], common_techniques: ['even', 'moxa'] },
      { id: 'BL-40', number: 40, name_pinyin: 'Wěi Zhōng', name_chinese: '委中', name_english: 'Middle of the Crook', position: [-0.06, 0.38, -0.06], category: 'He-Sea', functions: ['He-Sea point (Earth)', 'Command point of the back', 'Clears Heat', 'Resolves Blood stasis', 'Benefits the lumbar and knees', 'Clears Summer-Heat'], indications: ['Low back pain', 'Sciatica', 'Knee pain', 'Leg pain', 'Hemiplegia', 'Skin diseases', 'Abdominal pain'], common_techniques: ['reduce', 'bloodletting', 'even'] },
      { id: 'BL-57', number: 57, name_pinyin: 'Chéng Shān', name_chinese: '承山', name_english: 'Mountain Support', position: [-0.06, 0.24, -0.06], functions: ['Relaxes sinews', 'Activates the channel', 'Treats hemorrhoids', 'Clears Heat'], indications: ['Calf muscle cramps', 'Low back pain', 'Hemorrhoids', 'Constipation', 'Leg pain'], common_techniques: ['even', 'moxa'] },
      { id: 'BL-60', number: 60, name_pinyin: 'Kūn Lún', name_chinese: '昆仑', name_english: 'Kunlun Mountains', position: [-0.06, 0.06, -0.03], category: 'Jing-River', functions: ['Jing-River point (Fire)', 'Expels Wind', 'Clears Heat', 'Relaxes sinews', 'Activates the channel', 'Benefits the back and head'], indications: ['Headache', 'Neck stiffness', 'Dizziness', 'Sciatica', 'Ankle pain', 'Difficult labour', 'Epilepsy'], common_techniques: ['even', 'reduce'] },
      { id: 'BL-67', number: 67, name_pinyin: 'Zhì Yīn', name_chinese: '至阴', name_english: 'Reaching Yin', position: [-0.04, 0.01, 0.10], category: 'Jing-Well', functions: ['Jing-Well point (Metal)', 'Corrects malposition of fetus', 'Clears Heat', 'Benefits the eyes and head'], indications: ['Malposition of fetus', 'Difficult labour', 'Headache', 'Eye pain', 'Nasal obstruction'], common_techniques: ['moxa', 'bloodletting'] },
    ],
  },

  // ================================================================
  // 8. KIDNEY MERIDIAN (足少阴肾经)
  // ================================================================
  {
    id: 'kidney',
    name_english: 'Kidney',
    name_pinyin: 'Zú Shào Yīn Shèn Jīng',
    name_chinese: '足少阴肾经',
    abbreviation: 'KI',
    organ: 'Kidney',
    element: 'Water',
    yin_yang: 'yin',
    paired_meridian: 'bladder',
    flow_direction: 'ascending',
    colour: '#1E90FF',
    pathway: [
      [-0.04, 0.01, 0.06], // sole of foot
      [-0.04, 0.04, 0.04], // arch
      [-0.05, 0.08, 0.01], // below medial malleolus
      [-0.06, 0.14, 0.00], // lower leg medial posterior
      [-0.07, 0.24, -0.01], // mid calf medial
      [-0.08, 0.34, -0.01], // below knee medial posterior
      [-0.09, 0.48, 0.00], // medial thigh
      [-0.08, 0.62, 0.02], // upper thigh medial
      [-0.04, 0.82, 0.06], // perineum/pubis area
      [-0.02, 0.92, 0.08], // lower abdomen midline
      [-0.02, 1.02, 0.08], // abdomen
      [-0.02, 1.12, 0.08], // upper abdomen
      [-0.04, 1.28, 0.08], // chest
      [-0.04, 1.38, 0.08], // upper chest
    ],
    points: [
      { id: 'KI-1', number: 1, name_pinyin: 'Yǒng Quán', name_chinese: '涌泉', name_english: 'Gushing Spring', position: [-0.04, 0.01, 0.06], category: 'Jing-Well', functions: ['Jing-Well point (Wood)', 'Descends excess from the head', 'Calms the Spirit', 'Restores consciousness', 'Clears Heat', 'Tonifies Yin'], indications: ['Headache', 'Dizziness', 'Insomnia', 'Loss of consciousness', 'Infantile convulsions', 'Hypertension', 'Sore throat', 'Heel pain'], common_techniques: ['tonify', 'moxa'] },
      { id: 'KI-3', number: 3, name_pinyin: 'Tài Xī', name_chinese: '太溪', name_english: 'Great Stream', position: [-0.05, 0.08, 0.01], category: 'Yuan-Source', functions: ['Yuan-Source point', 'Shu-Stream point (Earth)', 'Tonifies the Kidney', 'Nourishes Kidney Yin', 'Strengthens the lumbar and knees', 'Benefits Essence'], indications: ['Sore throat', 'Toothache', 'Deafness', 'Tinnitus', 'Dizziness', 'Insomnia', 'Impotence', 'Low back pain', 'Asthma'], common_techniques: ['tonify', 'moxa'] },
      { id: 'KI-6', number: 6, name_pinyin: 'Zhào Hǎi', name_chinese: '照海', name_english: 'Shining Sea', position: [-0.05, 0.06, 0.00], category: 'Confluent', functions: ['Confluent point of Yin Qiao Mai', 'Nourishes Yin', 'Benefits the throat', 'Calms the Spirit', 'Cools Blood'], indications: ['Insomnia', 'Sore throat', 'Dry throat at night', 'Irregular menstruation', 'Epilepsy', 'Ankle pain'], common_techniques: ['tonify', 'even'] },
      { id: 'KI-7', number: 7, name_pinyin: 'Fù Liū', name_chinese: '复溜', name_english: 'Recover Flow', position: [-0.06, 0.12, 0.00], category: 'Jing-River', functions: ['Jing-River point (Metal)', 'Tonifies the Kidney', 'Resolves Dampness', 'Regulates sweating', 'Strengthens the lumbar'], indications: ['Edema', 'Night sweating', 'Spontaneous sweating', 'Diarrhea', 'Abdominal distension', 'Low back pain'], common_techniques: ['tonify', 'moxa'] },
      { id: 'KI-10', number: 10, name_pinyin: 'Yīn Gǔ', name_chinese: '阴谷', name_english: 'Yin Valley', position: [-0.08, 0.38, -0.01], category: 'He-Sea', functions: ['He-Sea point (Water)', 'Tonifies Kidney Yin', 'Benefits the lower abdomen', 'Clears Damp-Heat'], indications: ['Knee pain', 'Impotence', 'Urinary disorders', 'Uterine bleeding', 'Hernia'], common_techniques: ['tonify', 'even'] },
      { id: 'KI-16', number: 16, name_pinyin: 'Huāng Shù', name_chinese: '肓俞', name_english: 'Vitals Shu', position: [-0.02, 0.98, 0.08], functions: ['Regulates Qi', 'Benefits the intestines', 'Warms the interior'], indications: ['Abdominal pain', 'Constipation', 'Diarrhea', 'Vomiting'], common_techniques: ['even', 'moxa'] },
      { id: 'KI-21', number: 21, name_pinyin: 'Yōu Mén', name_chinese: '幽门', name_english: 'Dark Gate', position: [-0.02, 1.08, 0.08], functions: ['Harmonises the Stomach', 'Descends rebellious Qi'], indications: ['Nausea', 'Vomiting', 'Abdominal distension', 'Diarrhea'], common_techniques: ['even'] },
      { id: 'KI-25', number: 25, name_pinyin: 'Shén Cáng', name_chinese: '神藏', name_english: 'Spirit Storehouse', position: [-0.03, 1.32, 0.08], functions: ['Benefits the chest', 'Descends rebellious Qi', 'Calms the Spirit'], indications: ['Cough', 'Asthma', 'Chest pain', 'Vomiting', 'Poor appetite'], common_techniques: ['even'] },
      { id: 'KI-27', number: 27, name_pinyin: 'Shù Fǔ', name_chinese: '俞府', name_english: 'Shu Mansion', position: [-0.04, 1.38, 0.08], functions: ['Benefits the chest', 'Descends rebellious Qi', 'Stops cough'], indications: ['Cough', 'Asthma', 'Chest pain', 'Vomiting'], common_techniques: ['even', 'moxa'] },
      { id: 'KI-4', number: 4, name_pinyin: 'Dà Zhōng', name_chinese: '大钟', name_english: 'Great Bell', position: [-0.05, 0.07, -0.01], category: 'Luo-Connecting', functions: ['Luo-Connecting point', 'Strengthens the back and spine', 'Tonifies the Kidney', 'Calms the Spirit'], indications: ['Heel pain', 'Low back pain', 'Asthma', 'Urinary retention', 'Anxiety'], common_techniques: ['tonify', 'moxa'] },
    ],
  },

  // ================================================================
  // 9. PERICARDIUM MERIDIAN (手厥阴心包经)
  // ================================================================
  {
    id: 'pericardium',
    name_english: 'Pericardium',
    name_pinyin: 'Shǒu Jué Yīn Xīn Bāo Jīng',
    name_chinese: '手厥阴心包经',
    abbreviation: 'PC',
    organ: 'Pericardium',
    element: 'Fire',
    yin_yang: 'yin',
    paired_meridian: 'san-jiao',
    flow_direction: 'descending',
    colour: '#FF3366',
    pathway: [
      [-0.10, 1.30, 0.06], // chest lateral
      [-0.15, 1.26, 0.04], // axilla anterior
      [-0.20, 1.18, 0.02], // upper arm medial
      [-0.24, 1.10, 0.02], // mid arm
      [-0.28, 1.00, 0.02], // elbow crease center
      [-0.30, 0.92, 0.03], // forearm center
      [-0.32, 0.84, 0.04], // mid forearm
      [-0.33, 0.78, 0.04], // wrist center
      [-0.34, 0.74, 0.05], // palm
      [-0.35, 0.72, 0.06], // middle finger
    ],
    points: [
      { id: 'PC-1', number: 1, name_pinyin: 'Tiān Chí', name_chinese: '天池', name_english: 'Celestial Pool', position: [-0.12, 1.30, 0.06], functions: ['Benefits the chest', 'Clears Heat', 'Descends rebellious Qi'], indications: ['Chest fullness', 'Axillary swelling', 'Cough', 'Breast pain'], common_techniques: ['even'] },
      { id: 'PC-3', number: 3, name_pinyin: 'Qū Zé', name_chinese: '曲泽', name_english: 'Marsh at the Bend', position: [-0.28, 1.00, 0.02], category: 'He-Sea', functions: ['He-Sea point (Water)', 'Clears Heat from the Pericardium', 'Harmonises the Stomach', 'Cools Blood'], indications: ['Heart pain', 'Palpitations', 'Gastric pain', 'Vomiting', 'Elbow pain', 'Febrile diseases'], common_techniques: ['reduce', 'bloodletting'] },
      { id: 'PC-4', number: 4, name_pinyin: 'Xì Mén', name_chinese: '郄门', name_english: 'Cleft Gate', position: [-0.30, 0.92, 0.03], category: 'Xi-Cleft', functions: ['Xi-Cleft point', 'Calms the Spirit', 'Clears Blood Heat', 'Stops bleeding'], indications: ['Heart pain', 'Palpitations', 'Hemoptysis', 'Chest pain', 'Anxiety', 'Epilepsy'], common_techniques: ['reduce', 'even'] },
      { id: 'PC-5', number: 5, name_pinyin: 'Jiān Shǐ', name_chinese: '间使', name_english: 'Intermediary', position: [-0.31, 0.88, 0.04], category: 'Jing-River', functions: ['Jing-River point (Metal)', 'Calms the Spirit', 'Resolves Phlegm', 'Opens the chest'], indications: ['Heart pain', 'Palpitations', 'Mental disorders', 'Malaria', 'Vomiting', 'Epilepsy'], common_techniques: ['even', 'reduce'] },
      { id: 'PC-6', number: 6, name_pinyin: 'Nèi Guān', name_chinese: '内关', name_english: 'Inner Pass', position: [-0.32, 0.84, 0.04], category: 'Luo-Connecting', functions: ['Luo-Connecting point', 'Confluent point of Yin Wei Mai', 'Opens the chest', 'Calms the Spirit', 'Harmonises the Stomach', 'Regulates Heart Qi', 'Relieves nausea'], indications: ['Heart pain', 'Palpitations', 'Chest tightness', 'Insomnia', 'Nausea', 'Vomiting', 'Anxiety', 'Motion sickness', 'Hiccup'], common_techniques: ['even', 'tonify', 'moxa'] },
      { id: 'PC-7', number: 7, name_pinyin: 'Dà Líng', name_chinese: '大陵', name_english: 'Great Mound', position: [-0.33, 0.78, 0.04], category: 'Yuan-Source', functions: ['Yuan-Source point', 'Shu-Stream point (Earth)', 'Calms the Spirit', 'Clears Heart and Pericardium Heat', 'Harmonises the Stomach'], indications: ['Heart pain', 'Palpitations', 'Insomnia', 'Mental disorders', 'Gastric pain', 'Chest pain', 'Wrist pain'], common_techniques: ['tonify', 'even'] },
      { id: 'PC-8', number: 8, name_pinyin: 'Láo Gōng', name_chinese: '劳宫', name_english: 'Palace of Toil', position: [-0.34, 0.74, 0.05], category: 'Ying-Spring', functions: ['Ying-Spring point (Fire)', 'Clears Heart Fire', 'Calms the Spirit', 'Restores consciousness'], indications: ['Heart pain', 'Mental disorders', 'Mouth sores', 'Bad breath', 'Palm heat', 'Loss of consciousness'], common_techniques: ['reduce', 'bloodletting'] },
      { id: 'PC-9', number: 9, name_pinyin: 'Zhōng Chōng', name_chinese: '中冲', name_english: 'Central Hub', position: [-0.35, 0.72, 0.06], category: 'Jing-Well', functions: ['Jing-Well point (Wood)', 'Clears Heat', 'Restores consciousness', 'Opens orifices'], indications: ['Loss of consciousness', 'Stroke', 'Heart pain', 'Febrile diseases', 'Tongue stiffness', 'Infantile convulsions'], common_techniques: ['bloodletting'] },
    ],
  },

  // ================================================================
  // 10. SAN JIAO / TRIPLE BURNER MERIDIAN (手少阳三焦经)
  // ================================================================
  {
    id: 'san-jiao',
    name_english: 'San Jiao',
    name_pinyin: 'Shǒu Shào Yáng Sān Jiāo Jīng',
    name_chinese: '手少阳三焦经',
    abbreviation: 'SJ',
    organ: 'San Jiao',
    element: 'Fire',
    yin_yang: 'yang',
    paired_meridian: 'pericardium',
    flow_direction: 'ascending',
    colour: '#FF8C00',
    pathway: [
      [-0.35, 0.73, 0.03], // ring finger
      [-0.34, 0.76, 0.01], // hand dorsum
      [-0.33, 0.78, 0.00], // wrist dorsum
      [-0.31, 0.86, -0.02], // forearm posterior
      [-0.28, 0.95, -0.03], // forearm upper
      [-0.26, 1.02, -0.03], // elbow posterior
      [-0.23, 1.12, -0.02], // upper arm posterior
      [-0.18, 1.28, -0.02], // shoulder posterior
      [-0.10, 1.38, -0.04], // supraclavicular posterior
      [-0.06, 1.48, -0.02], // neck posterior lateral
      [-0.06, 1.58, 0.02], // behind ear
      [-0.04, 1.64, 0.06], // temple
      [-0.03, 1.66, 0.08], // outer eyebrow
    ],
    points: [
      { id: 'SJ-1', number: 1, name_pinyin: 'Guān Chōng', name_chinese: '关冲', name_english: 'Passage Hub', position: [-0.35, 0.73, 0.03], category: 'Jing-Well', functions: ['Jing-Well point (Metal)', 'Clears Heat', 'Benefits the ears', 'Expels Wind'], indications: ['Headache', 'Sore throat', 'Febrile diseases', 'Tinnitus', 'Stiff tongue'], common_techniques: ['bloodletting'] },
      { id: 'SJ-3', number: 3, name_pinyin: 'Zhōng Zhǔ', name_chinese: '中渚', name_english: 'Central Islet', position: [-0.34, 0.76, 0.01], category: 'Shu-Stream', functions: ['Shu-Stream point (Wood)', 'Clears Heat', 'Benefits the ears', 'Activates the channel'], indications: ['Headache', 'Tinnitus', 'Deafness', 'Sore throat', 'Elbow pain', 'Finger pain'], common_techniques: ['even', 'reduce'] },
      { id: 'SJ-4', number: 4, name_pinyin: 'Yáng Chí', name_chinese: '阳池', name_english: 'Yang Pool', position: [-0.33, 0.78, 0.00], category: 'Yuan-Source', functions: ['Yuan-Source point', 'Relaxes sinews', 'Benefits the wrist', 'Clears Heat'], indications: ['Wrist pain', 'Shoulder pain', 'Malaria', 'Deafness', 'Diabetes'], common_techniques: ['even', 'moxa'] },
      { id: 'SJ-5', number: 5, name_pinyin: 'Wài Guān', name_chinese: '外关', name_english: 'Outer Pass', position: [-0.32, 0.82, -0.01], category: 'Luo-Connecting', functions: ['Luo-Connecting point', 'Confluent point of Yang Wei Mai', 'Expels Wind-Heat', 'Releases the exterior', 'Benefits the ears', 'Activates the channel'], indications: ['Common cold', 'Fever', 'Headache', 'Tinnitus', 'Deafness', 'Hypochondriac pain', 'Arm pain'], common_techniques: ['even', 'reduce'] },
      { id: 'SJ-6', number: 6, name_pinyin: 'Zhī Gōu', name_chinese: '支沟', name_english: 'Branch Ditch', position: [-0.31, 0.86, -0.02], category: 'Jing-River', functions: ['Jing-River point (Fire)', 'Regulates Qi', 'Clears Heat', 'Benefits the lateral costal region', 'Opens the bowels'], indications: ['Constipation', 'Hypochondriac pain', 'Vomiting', 'Shoulder and arm pain', 'Febrile diseases'], common_techniques: ['even', 'reduce'] },
      { id: 'SJ-14', number: 14, name_pinyin: 'Jiān Liáo', name_chinese: '肩髎', name_english: 'Shoulder Bone-Hole', position: [-0.20, 1.30, -0.04], functions: ['Benefits the shoulder', 'Activates the channel', 'Expels Wind-Damp'], indications: ['Shoulder pain', 'Arm pain', 'Frozen shoulder'], common_techniques: ['even', 'moxa', 'electroacupuncture'] },
      { id: 'SJ-17', number: 17, name_pinyin: 'Yì Fēng', name_chinese: '翳风', name_english: 'Wind Screen', position: [-0.07, 1.58, 0.01], functions: ['Benefits the ears', 'Expels Wind', 'Clears Heat'], indications: ['Tinnitus', 'Deafness', 'Facial paralysis', 'TMJ disorders', 'Toothache', 'Mumps'], common_techniques: ['even', 'moxa'] },
      { id: 'SJ-21', number: 21, name_pinyin: 'Ěr Mén', name_chinese: '耳门', name_english: 'Ear Gate', position: [-0.06, 1.62, 0.04], functions: ['Benefits the ears', 'Clears Heat'], indications: ['Deafness', 'Tinnitus', 'Ear pain', 'Otorrhea', 'TMJ disorders'], common_techniques: ['even'] },
      { id: 'SJ-23', number: 23, name_pinyin: 'Sī Zhú Kōng', name_chinese: '丝竹空', name_english: 'Silk Bamboo Hole', position: [-0.04, 1.66, 0.08], functions: ['Benefits the eyes', 'Expels Wind', 'Clears Heat'], indications: ['Headache', 'Eye pain', 'Blurred vision', 'Facial paralysis', 'Toothache'], common_techniques: ['even'] },
    ],
  },

  // ================================================================
  // 11. GALLBLADDER MERIDIAN (足少阳胆经)
  // ================================================================
  {
    id: 'gallbladder',
    name_english: 'Gallbladder',
    name_pinyin: 'Zú Shào Yáng Dǎn Jīng',
    name_chinese: '足少阳胆经',
    abbreviation: 'GB',
    organ: 'Gallbladder',
    element: 'Wood',
    yin_yang: 'yang',
    paired_meridian: 'liver',
    flow_direction: 'descending',
    colour: '#32CD32',
    pathway: [
      [-0.06, 1.64, 0.06], // outer canthus
      [-0.08, 1.66, 0.04], // temple
      [-0.10, 1.68, 0.00], // above ear
      [-0.08, 1.70, -0.04], // parietal
      [-0.04, 1.68, -0.06], // occiput lateral
      [-0.06, 1.56, -0.06], // behind mastoid
      [-0.10, 1.44, -0.04], // lateral neck
      [-0.16, 1.36, -0.02], // shoulder top
      [-0.18, 1.28, 0.00], // axilla lateral
      [-0.16, 1.18, 0.02], // lateral ribs
      [-0.14, 1.06, 0.04], // waist lateral
      [-0.12, 0.92, 0.04], // hip lateral
      [-0.14, 0.78, 0.02], // lateral thigh upper
      [-0.14, 0.62, 0.02], // mid thigh lateral
      [-0.12, 0.48, 0.04], // above knee lateral
      [-0.10, 0.38, 0.04], // below knee lateral
      [-0.08, 0.24, 0.04], // mid leg lateral
      [-0.06, 0.10, 0.04], // above ankle lateral
      [-0.06, 0.06, 0.04], // ankle lateral
      [-0.05, 0.03, 0.08], // foot dorsum lateral
      [-0.04, 0.01, 0.10], // 4th toe
    ],
    points: [
      { id: 'GB-1', number: 1, name_pinyin: 'Tóng Zǐ Liáo', name_chinese: '瞳子髎', name_english: 'Pupil Bone-Hole', position: [-0.06, 1.64, 0.07], functions: ['Benefits the eyes', 'Expels Wind', 'Clears Heat'], indications: ['Eye diseases', 'Headache', 'Facial paralysis', 'Excessive tearing'], common_techniques: ['even'] },
      { id: 'GB-2', number: 2, name_pinyin: 'Tīng Huì', name_chinese: '听会', name_english: 'Hearing Convergence', position: [-0.07, 1.62, 0.05], functions: ['Benefits the ears', 'Expels Wind', 'Clears Heat'], indications: ['Deafness', 'Tinnitus', 'TMJ disorders', 'Toothache'], common_techniques: ['even'] },
      { id: 'GB-8', number: 8, name_pinyin: 'Shuài Gǔ', name_chinese: '率谷', name_english: 'Leading Valley', position: [-0.10, 1.68, 0.00], functions: ['Benefits the head', 'Expels Wind', 'Stops vomiting'], indications: ['Migraine', 'Dizziness', 'Vomiting', 'Infantile convulsions'], common_techniques: ['even'] },
      { id: 'GB-14', number: 14, name_pinyin: 'Yáng Bái', name_chinese: '阳白', name_english: 'Yang White', position: [-0.04, 1.68, 0.08], functions: ['Benefits the eyes and forehead', 'Expels Wind', 'Clears Heat'], indications: ['Frontal headache', 'Eye pain', 'Blurred vision', 'Facial paralysis', 'Tic'], common_techniques: ['even', 'electroacupuncture'] },
      { id: 'GB-20', number: 20, name_pinyin: 'Fēng Chí', name_chinese: '风池', name_english: 'Wind Pool', position: [-0.05, 1.60, -0.08], functions: ['Expels Wind (internal and external)', 'Benefits the head and eyes', 'Clears Heat', 'Calms the Liver', 'Activates the channel'], indications: ['Headache', 'Dizziness', 'Common cold', 'Neck stiffness', 'Eye diseases', 'Hypertension', 'Insomnia', 'Epilepsy'], common_techniques: ['even', 'reduce'] },
      { id: 'GB-21', number: 21, name_pinyin: 'Jiān Jǐng', name_chinese: '肩井', name_english: 'Shoulder Well', position: [-0.14, 1.38, -0.02], functions: ['Benefits the shoulders', 'Activates the channel', 'Promotes labour', 'Benefits lactation', 'Descends Qi'], indications: ['Neck and shoulder pain', 'Headache', 'Difficult labour', 'Insufficient lactation', 'Mastitis'], common_techniques: ['even', 'reduce', 'moxa'] },
      { id: 'GB-25', number: 25, name_pinyin: 'Jīng Mén', name_chinese: '京门', name_english: 'Capital Gate', position: [-0.16, 1.10, 0.02], category: 'Front-Mu', functions: ['Front-Mu point of the Kidney', 'Tonifies the Kidney', 'Strengthens the lumbar', 'Regulates water passages'], indications: ['Low back pain', 'Abdominal distension', 'Diarrhea', 'Borborygmus'], common_techniques: ['even', 'moxa'] },
      { id: 'GB-30', number: 30, name_pinyin: 'Huán Tiào', name_chinese: '环跳', name_english: 'Jumping Circle', position: [-0.14, 0.82, -0.02], functions: ['Benefits the hip joint', 'Activates the channel', 'Expels Wind-Damp', 'Benefits the lumbar and legs'], indications: ['Hip pain', 'Sciatica', 'Low back pain', 'Leg pain', 'Hemiplegia', 'Skin diseases'], common_techniques: ['even', 'electroacupuncture', 'moxa'] },
      { id: 'GB-34', number: 34, name_pinyin: 'Yáng Líng Quán', name_chinese: '阳陵泉', name_english: 'Yang Mound Spring', position: [-0.10, 0.38, 0.04], category: 'He-Sea', functions: ['He-Sea point (Earth)', 'Hui-Meeting point of sinews', 'Benefits sinews and joints', 'Spreads Liver Qi', 'Clears Damp-Heat from Liver and Gallbladder', 'Harmonises Shao Yang'], indications: ['Hypochondriac pain', 'Bitter taste', 'Vomiting', 'Jaundice', 'Knee pain', 'Leg pain', 'Hemiplegia', 'Muscle cramps'], common_techniques: ['even', 'reduce'] },
      { id: 'GB-39', number: 39, name_pinyin: 'Xuán Zhōng', name_chinese: '悬钟', name_english: 'Suspended Bell', position: [-0.07, 0.14, 0.04], category: 'Hui-Meeting', functions: ['Hui-Meeting point of Marrow', 'Benefits the bones and marrow', 'Expels Wind', 'Benefits the neck', 'Clears Gallbladder Heat'], indications: ['Neck stiffness', 'Chest fullness', 'Leg pain', 'Ankle pain', 'Hemiplegia', 'Stroke'], common_techniques: ['even', 'moxa'] },
      { id: 'GB-40', number: 40, name_pinyin: 'Qiū Xū', name_chinese: '丘墟', name_english: 'Hill Ruins', position: [-0.06, 0.06, 0.04], category: 'Yuan-Source', functions: ['Yuan-Source point', 'Spreads Liver Qi', 'Benefits the ankle and foot', 'Clears Gallbladder Heat'], indications: ['Ankle pain', 'Hypochondriac pain', 'Eye diseases', 'Chest fullness', 'Lateral leg pain'], common_techniques: ['even', 'moxa'] },
      { id: 'GB-41', number: 41, name_pinyin: 'Zú Lín Qì', name_chinese: '足临泣', name_english: 'Foot Overlooking Tears', position: [-0.05, 0.04, 0.06], category: 'Shu-Stream', functions: ['Shu-Stream point (Wood)', 'Confluent point of Dai Mai', 'Spreads Liver Qi', 'Resolves Damp-Heat', 'Benefits the head and eyes'], indications: ['Headache', 'Dizziness', 'Eye pain', 'Hypochondriac pain', 'Breast distension', 'Irregular menstruation', 'Foot pain'], common_techniques: ['even', 'reduce'] },
    ],
  },

  // ================================================================
  // 12. LIVER MERIDIAN (足厥阴肝经)
  // ================================================================
  {
    id: 'liver',
    name_english: 'Liver',
    name_pinyin: 'Zú Jué Yīn Gān Jīng',
    name_chinese: '足厥阴肝经',
    abbreviation: 'LR',
    organ: 'Liver',
    element: 'Wood',
    yin_yang: 'yin',
    paired_meridian: 'gallbladder',
    flow_direction: 'ascending',
    colour: '#228B22',
    pathway: [
      [-0.03, 0.02, 0.10], // big toe lateral
      [-0.03, 0.05, 0.08], // foot dorsum
      [-0.04, 0.08, 0.04], // medial malleolus anterior
      [-0.05, 0.16, 0.02], // lower leg medial anterior
      [-0.06, 0.26, 0.02], // mid leg medial
      [-0.08, 0.38, 0.02], // knee medial
      [-0.10, 0.50, 0.02], // mid thigh medial
      [-0.10, 0.64, 0.04], // upper thigh medial
      [-0.08, 0.78, 0.06], // groin
      [-0.06, 0.92, 0.08], // lower abdomen lateral
      [-0.10, 1.08, 0.06], // hypochondrium
      [-0.12, 1.16, 0.06], // lateral ribs
    ],
    points: [
      { id: 'LR-1', number: 1, name_pinyin: 'Dà Dūn', name_chinese: '大敦', name_english: 'Great Mound', position: [-0.03, 0.02, 0.10], category: 'Jing-Well', functions: ['Jing-Well point (Wood)', 'Regulates Liver Qi', 'Regulates menstruation', 'Resolves Damp-Heat in Lower Jiao'], indications: ['Hernia', 'Uterine bleeding', 'Enuresis', 'Prolapse', 'Epilepsy'], common_techniques: ['moxa', 'tonify'] },
      { id: 'LR-2', number: 2, name_pinyin: 'Xíng Jiān', name_chinese: '行间', name_english: 'Moving Between', position: [-0.03, 0.03, 0.10], category: 'Ying-Spring', functions: ['Ying-Spring point (Fire)', 'Clears Liver Fire', 'Spreads Liver Qi', 'Cools Blood', 'Benefits the eyes'], indications: ['Headache', 'Dizziness', 'Eye diseases', 'Insomnia', 'Irritability', 'Epilepsy', 'Irregular menstruation', 'Hypertension'], common_techniques: ['reduce'] },
      { id: 'LR-3', number: 3, name_pinyin: 'Tài Chōng', name_chinese: '太冲', name_english: 'Great Surge', position: [-0.03, 0.05, 0.08], category: 'Yuan-Source', functions: ['Yuan-Source point', 'Shu-Stream point (Earth)', 'Spreads Liver Qi', 'Subdues Liver Yang', 'Nourishes Liver Blood and Yin', 'Calms the Spirit', 'Extinguishes Wind'], indications: ['Headache', 'Dizziness', 'Eye diseases', 'Insomnia', 'Irritability', 'Hypertension', 'Irregular menstruation', 'Hypochondriac pain', 'Sighing', 'Depression'], common_techniques: ['even', 'reduce', 'tonify'] },
      { id: 'LR-4', number: 4, name_pinyin: 'Zhōng Fēng', name_chinese: '中封', name_english: 'Central Seal', position: [-0.04, 0.08, 0.04], category: 'Jing-River', functions: ['Jing-River point (Metal)', 'Spreads Liver Qi', 'Benefits the genitals'], indications: ['Hernia', 'Urinary retention', 'Abdominal pain', 'Jaundice', 'Ankle pain'], common_techniques: ['even'] },
      { id: 'LR-5', number: 5, name_pinyin: 'Lí Gōu', name_chinese: '蠡沟', name_english: 'Woodworm Canal', position: [-0.05, 0.16, 0.02], category: 'Luo-Connecting', functions: ['Luo-Connecting point', 'Regulates Liver Qi', 'Benefits the genitals', 'Resolves Damp-Heat'], indications: ['Irregular menstruation', 'Vaginal discharge', 'Testicular pain', 'Leg pain', 'Itching'], common_techniques: ['even'] },
      { id: 'LR-8', number: 8, name_pinyin: 'Qū Quán', name_chinese: '曲泉', name_english: 'Spring at the Bend', position: [-0.08, 0.38, 0.02], category: 'He-Sea', functions: ['He-Sea point (Water)', 'Nourishes Liver Blood and Yin', 'Benefits the knee', 'Clears Damp-Heat from Lower Jiao', 'Benefits the genitals'], indications: ['Knee pain', 'Prolapse', 'Vaginal discharge', 'Impotence', 'Urinary retention', 'Diarrhea'], common_techniques: ['tonify', 'even'] },
      { id: 'LR-13', number: 13, name_pinyin: 'Zhāng Mén', name_chinese: '章门', name_english: 'System Gate', position: [-0.14, 1.10, 0.04], category: 'Front-Mu', functions: ['Front-Mu point of the Spleen', 'Hui-Meeting point of Zang organs', 'Harmonises Liver and Spleen', 'Regulates Qi', 'Resolves Dampness'], indications: ['Abdominal distension', 'Diarrhea', 'Borborygmus', 'Hypochondriac pain', 'Splenomegaly'], common_techniques: ['even', 'moxa'] },
      { id: 'LR-14', number: 14, name_pinyin: 'Qī Mén', name_chinese: '期门', name_english: 'Cycle Gate', position: [-0.10, 1.16, 0.06], category: 'Front-Mu', functions: ['Front-Mu point of the Liver', 'Spreads Liver Qi', 'Benefits the Stomach', 'Cools Blood', 'Harmonises Liver and Stomach'], indications: ['Hypochondriac pain', 'Chest fullness', 'Hiccup', 'Acid reflux', 'Vomiting', 'Mastitis', 'Depression'], common_techniques: ['even', 'reduce'] },
    ],
  },

  // ================================================================
  // 13. DU MAI / GOVERNING VESSEL (督脉)
  // ================================================================
  {
    id: 'du-mai',
    name_english: 'Governing Vessel',
    name_pinyin: 'Dū Mài',
    name_chinese: '督脉',
    abbreviation: 'DU',
    organ: 'Du Mai',
    element: 'Yang',
    yin_yang: 'yang',
    paired_meridian: 'ren-mai',
    flow_direction: 'ascending',
    colour: '#FFD700',
    pathway: [
      [0.00, 0.78, -0.10], // coccyx
      [0.00, 0.85, -0.12], // sacrum
      [0.00, 0.92, -0.12], // lumbar
      [0.00, 1.00, -0.12], // lower thoracic
      [0.00, 1.10, -0.12], // mid thoracic
      [0.00, 1.20, -0.12], // upper thoracic
      [0.00, 1.30, -0.12], // T1-T3
      [0.00, 1.38, -0.10], // C7
      [0.00, 1.48, -0.08], // neck posterior
      [0.00, 1.58, -0.08], // occiput
      [0.00, 1.65, -0.04], // vertex posterior
      [0.00, 1.72, 0.00], // vertex
      [0.00, 1.68, 0.06], // forehead
      [0.00, 1.62, 0.10], // nose bridge
      [0.00, 1.56, 0.12], // philtrum
    ],
    points: [
      { id: 'DU-1', number: 1, name_pinyin: 'Cháng Qiáng', name_chinese: '长强', name_english: 'Long Strong', position: [0.00, 0.78, -0.10], category: 'Luo-Connecting', functions: ['Luo-Connecting point of Du Mai', 'Resolves Damp-Heat', 'Calms the Spirit', 'Benefits the two lower orifices'], indications: ['Hemorrhoids', 'Prolapse of rectum', 'Diarrhea', 'Constipation', 'Low back pain', 'Mental disorders', 'Epilepsy'], common_techniques: ['even', 'moxa'] },
      { id: 'DU-3', number: 3, name_pinyin: 'Yāo Yáng Guān', name_chinese: '腰阳关', name_english: 'Lumbar Yang Pass', position: [0.00, 0.95, -0.12], functions: ['Strengthens the lumbar', 'Benefits the legs', 'Tonifies Yang'], indications: ['Low back pain', 'Knee pain', 'Impotence', 'Irregular menstruation', 'Leg weakness'], common_techniques: ['moxa', 'tonify'] },
      { id: 'DU-4', number: 4, name_pinyin: 'Mìng Mén', name_chinese: '命门', name_english: 'Gate of Life', position: [0.00, 1.02, -0.12], functions: ['Tonifies Kidney Yang', 'Warms the Gate of Vitality', 'Benefits Essence', 'Strengthens the back', 'Benefits Original Qi'], indications: ['Low back pain', 'Impotence', 'Seminal emission', 'Diarrhea', 'Irregular menstruation', 'Leucorrhea', 'Fatigue', 'Tinnitus'], common_techniques: ['moxa', 'tonify'] },
      { id: 'DU-9', number: 9, name_pinyin: 'Zhì Yáng', name_chinese: '至阳', name_english: 'Reaching Yang', position: [0.00, 1.18, -0.12], functions: ['Regulates Qi', 'Benefits the chest and diaphragm', 'Resolves Dampness', 'Clears Heat'], indications: ['Chest tightness', 'Jaundice', 'Back stiffness', 'Cough', 'Asthma'], common_techniques: ['even', 'moxa'] },
      { id: 'DU-14', number: 14, name_pinyin: 'Dà Zhuī', name_chinese: '大椎', name_english: 'Great Hammer', position: [0.00, 1.38, -0.10], functions: ['Meeting point of all Yang channels', 'Clears Heat', 'Releases the exterior', 'Expels Wind', 'Calms the Spirit', 'Tonifies Yang'], indications: ['Fever', 'Common cold', 'Malaria', 'Neck stiffness', 'Cough', 'Asthma', 'Epilepsy', 'Afternoon fever'], common_techniques: ['even', 'reduce', 'moxa', 'cupping', 'bloodletting'] },
      { id: 'DU-16', number: 16, name_pinyin: 'Fēng Fǔ', name_chinese: '风府', name_english: 'Wind Mansion', position: [0.00, 1.60, -0.08], functions: ['Expels Wind', 'Benefits the head and neck', 'Calms the Spirit', 'Opens the sensory orifices'], indications: ['Headache', 'Neck stiffness', 'Dizziness', 'Sore throat', 'Mental disorders', 'Stroke', 'Epilepsy'], common_techniques: ['even'] },
      { id: 'DU-20', number: 20, name_pinyin: 'Bǎi Huì', name_chinese: '百会', name_english: 'Hundred Convergences', position: [0.00, 1.72, 0.00], functions: ['Meeting point of all Yang channels', 'Raises Yang', 'Benefits the head and brain', 'Calms the Spirit', 'Restores consciousness', 'Extinguishes Wind'], indications: ['Headache', 'Dizziness', 'Insomnia', 'Memory loss', 'Prolapse', 'Stroke', 'Mental disorders', 'Tinnitus', 'Nasal obstruction'], common_techniques: ['moxa', 'tonify', 'even'] },
      { id: 'DU-23', number: 23, name_pinyin: 'Shàng Xīng', name_chinese: '上星', name_english: 'Upper Star', position: [0.00, 1.70, 0.04], functions: ['Benefits the nose', 'Clears Heat', 'Calms the Spirit', 'Benefits the eyes'], indications: ['Headache', 'Rhinitis', 'Nosebleed', 'Eye pain', 'Mental disorders'], common_techniques: ['even'] },
      { id: 'DU-24', number: 24, name_pinyin: 'Shén Tíng', name_chinese: '神庭', name_english: 'Spirit Court', position: [0.00, 1.69, 0.06], functions: ['Benefits the brain', 'Calms the Spirit', 'Extinguishes Wind'], indications: ['Headache', 'Dizziness', 'Insomnia', 'Anxiety', 'Epilepsy', 'Rhinitis'], common_techniques: ['even', 'moxa'] },
      { id: 'DU-26', number: 26, name_pinyin: 'Shuǐ Gōu', name_chinese: '水沟', name_english: 'Water Trough', position: [0.00, 1.57, 0.12], functions: ['Restores consciousness', 'Calms the Spirit', 'Clears the brain', 'Benefits the spine'], indications: ['Loss of consciousness', 'Epilepsy', 'Mental disorders', 'Acute lumbar sprain', 'Facial paralysis', 'Deviation of mouth'], common_techniques: ['reduce', 'even'] },
    ],
  },

  // ================================================================
  // 14. REN MAI / CONCEPTION VESSEL (任脉)
  // ================================================================
  {
    id: 'ren-mai',
    name_english: 'Conception Vessel',
    name_pinyin: 'Rèn Mài',
    name_chinese: '任脉',
    abbreviation: 'REN',
    organ: 'Ren Mai',
    element: 'Yin',
    yin_yang: 'yin',
    paired_meridian: 'du-mai',
    flow_direction: 'ascending',
    colour: '#87CEEB',
    pathway: [
      [0.00, 0.80, 0.06], // perineum
      [0.00, 0.86, 0.10], // pubis
      [0.00, 0.92, 0.10], // lower abdomen
      [0.00, 0.98, 0.10], // umbilicus
      [0.00, 1.04, 0.10], // above umbilicus
      [0.00, 1.12, 0.10], // upper abdomen
      [0.00, 1.20, 0.10], // epigastrium
      [0.00, 1.28, 0.10], // chest lower
      [0.00, 1.34, 0.10], // mid chest
      [0.00, 1.40, 0.08], // upper chest
      [0.00, 1.46, 0.08], // suprasternal
      [0.00, 1.52, 0.10], // throat
      [0.00, 1.56, 0.12], // chin
    ],
    points: [
      { id: 'REN-1', number: 1, name_pinyin: 'Huì Yīn', name_chinese: '会阴', name_english: 'Meeting of Yin', position: [0.00, 0.80, 0.06], functions: ['Meeting point of Ren, Du, and Chong Mai', 'Benefits the two lower orifices', 'Nourishes Yin', 'Restores consciousness'], indications: ['Urinary retention', 'Hemorrhoids', 'Prolapse', 'Loss of consciousness', 'Irregular menstruation'], common_techniques: ['even'] },
      { id: 'REN-3', number: 3, name_pinyin: 'Zhōng Jí', name_chinese: '中极', name_english: 'Central Pole', position: [0.00, 0.88, 0.10], category: 'Front-Mu', functions: ['Front-Mu point of the Bladder', 'Benefits the Bladder', 'Resolves Dampness', 'Benefits the uterus'], indications: ['Urinary retention', 'Enuresis', 'Irregular menstruation', 'Infertility', 'Vaginal discharge', 'Impotence'], common_techniques: ['even', 'moxa'] },
      { id: 'REN-4', number: 4, name_pinyin: 'Guān Yuán', name_chinese: '关元', name_english: 'Origin Pass', position: [0.00, 0.90, 0.10], category: 'Front-Mu', functions: ['Front-Mu point of the Small Intestine', 'Tonifies Yuan Qi', 'Tonifies the Kidney', 'Nourishes Yin', 'Benefits the uterus', 'Warms and Fortifies', 'Anchors Qi'], indications: ['Impotence', 'Enuresis', 'Irregular menstruation', 'Infertility', 'Diarrhea', 'Prolapse', 'Exhaustion', 'Post-partum weakness'], common_techniques: ['moxa', 'tonify'] },
      { id: 'REN-6', number: 6, name_pinyin: 'Qì Hǎi', name_chinese: '气海', name_english: 'Sea of Qi', position: [0.00, 0.94, 0.10], functions: ['Tonifies Qi and Yang', 'Warms the Lower Jiao', 'Regulates Qi', 'Benefits Original Qi'], indications: ['Abdominal pain', 'Diarrhea', 'Constipation', 'Enuresis', 'Irregular menstruation', 'Fatigue', 'Hernia', 'Exhaustion'], common_techniques: ['moxa', 'tonify'] },
      { id: 'REN-8', number: 8, name_pinyin: 'Shén Què', name_chinese: '神阙', name_english: 'Spirit Gate', position: [0.00, 0.98, 0.10], functions: ['Warms Yang', 'Rescues collapse', 'Benefits the Spleen and Stomach', 'Restores consciousness'], indications: ['Diarrhea', 'Abdominal pain', 'Prolapse', 'Stroke', 'Exhaustion collapse'], common_techniques: ['moxa'] },
      { id: 'REN-10', number: 10, name_pinyin: 'Xià Wǎn', name_chinese: '下脘', name_english: 'Lower Stomach Duct', position: [0.00, 1.04, 0.10], functions: ['Harmonises the Stomach', 'Descends rebellious Qi', 'Resolves Food Stagnation'], indications: ['Gastric pain', 'Abdominal distension', 'Vomiting', 'Poor digestion'], common_techniques: ['even', 'moxa'] },
      { id: 'REN-12', number: 12, name_pinyin: 'Zhōng Wǎn', name_chinese: '中脘', name_english: 'Central Stomach Duct', position: [0.00, 1.10, 0.10], category: 'Front-Mu', functions: ['Front-Mu point of the Stomach', 'Hui-Meeting point of Fu organs', 'Tonifies the Stomach and Spleen', 'Resolves Dampness', 'Descends rebellious Qi', 'Regulates Stomach Qi'], indications: ['Gastric pain', 'Nausea', 'Vomiting', 'Acid reflux', 'Abdominal distension', 'Diarrhea', 'Jaundice', 'Poor appetite'], common_techniques: ['tonify', 'moxa', 'even'] },
      { id: 'REN-14', number: 14, name_pinyin: 'Jù Què', name_chinese: '巨阙', name_english: 'Great Tower Gate', position: [0.00, 1.18, 0.10], category: 'Front-Mu', functions: ['Front-Mu point of the Heart', 'Calms the Spirit', 'Benefits the Heart', 'Descends rebellious Qi'], indications: ['Heart pain', 'Palpitations', 'Nausea', 'Acid reflux', 'Mental disorders', 'Epilepsy'], common_techniques: ['even'] },
      { id: 'REN-17', number: 17, name_pinyin: 'Shān Zhōng', name_chinese: '膻中', name_english: 'Chest Center', position: [0.00, 1.30, 0.10], category: 'Hui-Meeting', functions: ['Front-Mu point of the Pericardium', 'Hui-Meeting point of Qi', 'Regulates Qi', 'Benefits the chest and diaphragm', 'Benefits the breasts', 'Descends Lung and Stomach Qi'], indications: ['Chest pain', 'Cough', 'Asthma', 'Insufficient lactation', 'Hiccup', 'Dyspnea', 'Chest tightness'], common_techniques: ['even', 'moxa'] },
      { id: 'REN-22', number: 22, name_pinyin: 'Tiān Tū', name_chinese: '天突', name_english: 'Celestial Projection', position: [0.00, 1.44, 0.08], functions: ['Benefits the throat', 'Descends rebellious Qi', 'Resolves Phlegm', 'Stops cough and wheezing'], indications: ['Cough', 'Asthma', 'Sore throat', 'Plum-pit Qi', 'Hiccup', 'Goiter'], common_techniques: ['even'] },
      { id: 'REN-24', number: 24, name_pinyin: 'Chéng Jiāng', name_chinese: '承浆', name_english: 'Sauce Receptacle', position: [0.00, 1.55, 0.12], functions: ['Expels Wind', 'Benefits the face and mouth', 'Calms the Spirit'], indications: ['Facial paralysis', 'Toothache', 'Gum pain', 'Mental disorders', 'Excessive salivation'], common_techniques: ['even'] },
    ],
  },
];

// ============================================================
// HELPER FUNCTIONS
// ============================================================

export function getMeridianById(id: string): MeridianData | undefined {
  return MERIDIANS.find(m => m.id === id);
}

export function getPointById(pointId: string): { meridian: MeridianData; point: MeridianPoint } | undefined {
  for (const meridian of MERIDIANS) {
    const point = meridian.points.find(p => p.id === pointId);
    if (point) return { meridian, point };
  }
  return undefined;
}

export function getAllPoints(): MeridianPoint[] {
  return MERIDIANS.flatMap(m => m.points);
}

export function getPointsByMeridian(meridianId: string): MeridianPoint[] {
  return getMeridianById(meridianId)?.points || [];
}
