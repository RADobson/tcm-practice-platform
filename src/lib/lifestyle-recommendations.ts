import type { LifestyleRecommendations, DietaryTherapy, FoodRecommendation } from './types';

export interface PatternRecommendations {
  pattern: string;
  pattern_chinese: string;
  description: string;
  lifestyle: LifestyleRecommendations;
  dietary: DietaryTherapy;
}

// ─── 1. Liver Qi Stagnation ───
const liverQiStagnation: PatternRecommendations = {
  pattern: 'Liver Qi Stagnation',
  pattern_chinese: '肝气郁结',
  description:
    'Constrained Liver Qi causing emotional tension, irritability, distending pain in the hypochondrium, sighing, and menstrual irregularity.',
  lifestyle: {
    diet: [
      'Eat at regular times in a relaxed setting; avoid eating while stressed or rushed',
      'Favour pungent and aromatic foods that move Qi — spring onions, basil, turmeric, citrus peel',
      'Include moderate amounts of sour flavour to soften the Liver — small amounts of vinegar, lemon, plum',
      'Reduce greasy, heavy, and rich foods that further obstruct Qi flow',
      'Avoid excessive alcohol, coffee, and spicy-hot foods that generate Liver Heat',
    ],
    exercise: [
      'Practice Liver-soothing Qigong such as "Drawing the Bow" (Ba Duan Jin movement 2)',
      'Engage in rhythmic, flowing exercise — walking, swimming, dancing — to promote smooth Qi flow',
      'Practice Tai Chi, especially Cloud Hands and Waving Hands Like Clouds, to open the flanks',
      'Stretch the Gallbladder and Liver meridians daily — lateral side-bends and hip openers',
      'Avoid overly competitive or anger-inducing exercise environments',
    ],
    sleep: [
      'Sleep by 11 PM to honour the Gallbladder and Liver time (11 PM–3 AM)',
      'Practice progressive relaxation or body scanning before bed to release muscular tension',
      'Avoid screens and stimulating content for at least 30 minutes before sleep',
      'Sleep on the right side to ease Liver Qi flow through the right hypochondrium',
    ],
    emotional: [
      'Cultivate free emotional expression — journalling, creative arts, music, or talking with trusted friends',
      'Practice the Healing Sound for the Liver: "Shūūū" with the exhale to release stagnant Qi',
      'Spend time in nature, especially among trees and green landscapes, to nourish the Wood element',
      'Recognize and release suppressed anger or frustration rather than internalizing it',
    ],
    seasonal: [
      'Spring is the season of the Liver — emphasize upward and outward movement, begin new projects',
      'In spring, eat more young green vegetables, sprouts, and tender greens to support Liver renewal',
      'Avoid excessive wind exposure in spring, which can aggravate Liver imbalances',
    ],
    general: [
      'Maintain a regular daily routine to create a sense of order that soothes the Liver',
      'Practise deep diaphragmatic breathing throughout the day to move Qi in the middle Jiao',
      'Limit overthinking and overplanning — allow spontaneity and flow',
      'Take regular breaks during sedentary work to stand, stretch, and move',
      'Consider acupressure on LR-3 (Tai Chong) and LI-4 (He Gu) — the Four Gates — for Qi movement',
    ],
  },
  dietary: {
    beneficial_foods: [
      { food: 'Green leafy vegetables (spinach, kale, watercress)', nature: 'cool', flavour: 'sweet', organ_affinity: ['Liver', 'Stomach'], therapeutic_action: 'Nourishes Liver Blood and clears mild Heat from constraint' },
      { food: 'Celery', nature: 'cool', flavour: 'sweet', organ_affinity: ['Liver', 'Stomach'], therapeutic_action: 'Clears Liver Heat and calms Liver Yang' },
      { food: 'Chrysanthemum flowers', nature: 'cool', flavour: 'sweet', organ_affinity: ['Liver', 'Lung'], therapeutic_action: 'Clears the Liver, brightens the eyes, disperses Wind-Heat' },
      { food: 'Turmeric (Jiang Huang)', nature: 'warm', flavour: 'pungent', organ_affinity: ['Liver', 'Spleen'], therapeutic_action: 'Invigorates Blood and moves Qi to relieve stagnation' },
      { food: 'Tangerine peel (Chen Pi)', nature: 'warm', flavour: 'pungent', organ_affinity: ['Spleen', 'Lung'], therapeutic_action: 'Regulates Qi, dries Dampness, and resolves stagnation in the middle Jiao' },
      { food: 'Jasmine flowers', nature: 'warm', flavour: 'pungent', organ_affinity: ['Liver', 'Spleen'], therapeutic_action: 'Soothes Liver Qi and harmonizes the Stomach' },
      { food: 'Beetroot', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Liver', 'Heart'], therapeutic_action: 'Nourishes Blood and supports Liver detoxification' },
      { food: 'Brown rice', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Tonifies Spleen Qi to support smooth Liver Qi flow' },
    ],
    foods_to_avoid: [
      { food: 'Excessive alcohol', nature: 'hot', flavour: 'pungent', organ_affinity: ['Liver'], therapeutic_action: 'Generates Damp-Heat in the Liver and Gallbladder' },
      { food: 'Deep-fried and greasy foods', nature: 'hot', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Creates Dampness and obstructs Qi flow further' },
      { food: 'Excess coffee and strong stimulants', nature: 'warm', flavour: 'bitter', organ_affinity: ['Heart', 'Liver'], therapeutic_action: 'Over-stimulates Liver Yang and depletes Yin' },
      { food: 'Heavily processed and chemical-laden foods', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Liver', 'Spleen'], therapeutic_action: 'Burdens Liver metabolism and impairs Qi transformation' },
    ],
    tea_recommendations: [
      'Rose bud tea (Mei Gui Hua) — soothes Liver Qi, moves Blood, lifts mood',
      'Jasmine green tea — moves Liver Qi, calms the Shen, aids digestion',
      'Chrysanthemum and goji berry tea — clears Liver Heat, nourishes Liver Yin and Blood',
    ],
    cooking_methods: [
      'Light stir-frying and sautéing with aromatic herbs to gently move Qi',
      'Steaming vegetables to preserve their cooling, Liver-soothing properties',
      'Avoid heavy braising or deep-frying which produces internal Dampness',
    ],
    meal_timing: [
      'Eat the largest meal at midday when digestive fire is strongest',
      'Avoid eating late at night to prevent Liver Qi stagnation during the Liver/Gallbladder hours',
      'Eat small, frequent meals rather than large heavy meals to keep Qi flowing smoothly',
    ],
  },
};

// ─── 2. Spleen Qi Deficiency ───
const spleenQiDeficiency: PatternRecommendations = {
  pattern: 'Spleen Qi Deficiency',
  pattern_chinese: '脾气虚',
  description:
    'Weakened Spleen transportation and transformation causing fatigue, poor appetite, loose stools, abdominal distension, and a tendency to bruise easily.',
  lifestyle: {
    diet: [
      'Eat warm, cooked foods — the Spleen prefers warmth for efficient transformation',
      'Chew food thoroughly and eat slowly to aid the Spleen in its digestive work',
      'Avoid raw, cold foods and iced beverages that weaken the Spleen Yang',
      'Favour the sweet flavour in its natural form — sweet potato, rice, dates, carrots — to nourish the Spleen',
      'Minimize dairy, sugar, and wheat which generate Dampness in a weak Spleen',
      'Include naturally yellow and orange foods that resonate with the Earth element',
    ],
    exercise: [
      'Practice gentle, centering exercises such as Tai Chi and Ba Duan Jin Qigong',
      'Walking after meals for 10-15 minutes supports Spleen Qi in transformation',
      'Avoid excessive or exhausting exercise that further depletes Qi',
      'Practice "Lifting the Heavens" (Ba Duan Jin movement 1) to raise the clear Yang of the Spleen',
      'Yoga poses that strengthen the core and aid digestion — gentle twists, Cat-Cow',
    ],
    sleep: [
      'Avoid napping for longer than 20 minutes — excessive lying down weakens Spleen Qi',
      'Maintain a regular sleep schedule to support the Earth element need for stability',
      'Ensure the sleeping environment is dry and well-ventilated; Dampness weakens the Spleen',
    ],
    emotional: [
      'Address overthinking and excessive worry, which are the emotions that damage the Spleen',
      'Practice grounding meditation techniques to settle the Yi (intellect/intention)',
      'Cultivate a sense of nourishment and support in your relationships — the Earth element thrives on connection',
      'Limit excessive study or mental work without physical movement breaks',
    ],
    seasonal: [
      'Late summer (the fifth season in TCM) is the Spleen season — pay special attention to diet during humid weather',
      'In damp weather, increase aromatic and Dampness-resolving spices — cardamom, ginger, cinnamon',
      'Avoid overexposure to damp environments — wet basements, humid climates without ventilation',
    ],
    general: [
      'Eat meals at consistent times daily to establish a strong digestive rhythm',
      'Avoid overthinking and rumination — set time limits for decision-making',
      'Keep the abdomen warm — avoid exposing the midriff to cold',
      'Practice self-massage on the abdomen (clockwise) after meals to support Spleen Qi',
      'Acupressure on ST-36 (Zu San Li) and SP-6 (San Yin Jiao) to tonify Spleen Qi',
    ],
  },
  dietary: {
    beneficial_foods: [
      { food: 'Sweet potato', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Tonifies Spleen Qi and benefits the Stomach' },
      { food: 'Rice (white or brown)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Supplements Qi, harmonizes the middle Jiao' },
      { food: 'Chinese yam (Shan Yao)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen', 'Lung', 'Kidney'], therapeutic_action: 'Tonifies Qi of the Spleen, Lung, and Kidney; stabilizes essence' },
      { food: 'Jujube dates (Da Zao)', nature: 'warm', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach', 'Heart'], therapeutic_action: 'Tonifies Spleen Qi, nourishes Blood, calms the Shen' },
      { food: 'Chicken', nature: 'warm', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Warms the middle Jiao and tonifies Qi and Blood' },
      { food: 'Oats (cooked)', nature: 'warm', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Strengthens Spleen Qi and removes Dampness' },
      { food: 'Pumpkin', nature: 'warm', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Tonifies the Spleen and regulates Qi' },
      { food: 'Fresh ginger (Sheng Jiang)', nature: 'warm', flavour: 'pungent', organ_affinity: ['Spleen', 'Stomach', 'Lung'], therapeutic_action: 'Warms the middle Jiao and promotes digestion' },
    ],
    foods_to_avoid: [
      { food: 'Raw salads and cold foods', nature: 'cold', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Injures Spleen Yang and impairs transformation' },
      { food: 'Iced and frozen drinks', nature: 'cold', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Congeals the middle Jiao and blocks Qi transformation' },
      { food: 'Excessive dairy products', nature: 'cool', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Generates Dampness and Phlegm, burdening the Spleen' },
      { food: 'Refined sugar and sweets', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen'], therapeutic_action: 'Excessive sweet flavour creates Dampness and weakens the Spleen' },
      { food: 'Wheat and gluten-heavy foods (in excess)', nature: 'cool', flavour: 'sweet', organ_affinity: ['Spleen'], therapeutic_action: 'Difficult to transform when Spleen is deficient; generates Dampness' },
    ],
    tea_recommendations: [
      'Ginger and jujube tea — warms the middle Jiao and tonifies Spleen Qi',
      'Astragalus (Huang Qi) tea — tonifies Qi and raises the clear Yang of the Spleen',
      'Roasted barley tea (Chao Mai Ya) — gently aids Spleen digestion without cooling',
    ],
    cooking_methods: [
      'Soups, stews, and congee — pre-broken-down foods are easier for the Spleen to transform',
      'Slow-cooking and braising to make foods soft and warming',
      'Avoid raw food preparation; lightly cook all vegetables',
    ],
    meal_timing: [
      'Eat breakfast between 7-9 AM during Stomach time to support digestion',
      'Have the largest meal at lunch when Yang Qi peaks for optimal transformation',
      'Eat a light, early dinner — no later than 7 PM — to avoid burdening a tired Spleen',
    ],
  },
};

// ─── 3. Kidney Yin Deficiency ───
const kidneyYinDeficiency: PatternRecommendations = {
  pattern: 'Kidney Yin Deficiency',
  pattern_chinese: '肾阴虚',
  description:
    'Depleted Kidney Yin causing dryness, heat signs such as night sweats, tinnitus, dizziness, lower back soreness, and five-palm heat.',
  lifestyle: {
    diet: [
      'Favour moistening, nourishing foods — black sesame, walnuts, goji berries, kidney beans',
      'Eat more dark-coloured foods that nourish the Kidney — black beans, seaweed, blackberries',
      'Include cooling and mildly sweet foods to nourish Yin — pear, watermelon, cucumber',
      'Avoid excessively hot, spicy, and drying foods that consume Yin',
      'Drink adequate water throughout the day — warm or room temperature',
    ],
    exercise: [
      'Practice slow, meditative forms of exercise — Yin yoga, gentle Tai Chi, slow swimming',
      'Kidney-nourishing Qigong: "Touching the Toes" (Ba Duan Jin movement 6) to strengthen the lower back',
      'Avoid excessive sweating and overheating during exercise, which depletes Yin fluids',
      'Practice standing meditation (Zhan Zhuang) to accumulate and store Qi in the lower Dantian',
    ],
    sleep: [
      'Prioritize deep, restorative sleep — Yin is replenished during rest',
      'Address night sweats with breathable bedding and a cool sleeping environment',
      'Practice calming meditation before bed to settle deficiency heat',
      'Aim for 7-9 hours of sleep; sleep deprivation severely drains Kidney Yin',
    ],
    emotional: [
      'Manage fear and anxiety, which are the emotions associated with the Kidney',
      'Practice deep stillness and silence daily — even 10 minutes of quiet sitting restores Yin',
      'Cultivate a sense of inner security and trust to support the Water element',
    ],
    seasonal: [
      'Winter is the Kidney season — slow down, conserve energy, go to bed earlier and rise later',
      'In winter, eat more warm soups, bone broth, and slow-cooked foods to nourish Kidney essence',
      'Avoid excessive cold exposure to the lower back and feet in winter',
    ],
    general: [
      'Avoid burning the candle at both ends — overwork and late nights deplete Kidney Yin',
      'Reduce excessive sexual activity, which draws on Kidney essence',
      'Keep the lower back and feet warm to protect the Kidney',
      'Practice the Healing Sound for the Kidney: "Chuīīī" to cool deficiency heat',
      'Acupressure on KD-3 (Tai Xi) and KD-6 (Zhao Hai) to nourish Kidney Yin',
    ],
  },
  dietary: {
    beneficial_foods: [
      { food: 'Black sesame seeds (Hei Zhi Ma)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Kidney', 'Liver'], therapeutic_action: 'Nourishes Kidney and Liver Yin, moistens the intestines' },
      { food: 'Goji berries (Gou Qi Zi)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Kidney', 'Liver', 'Lung'], therapeutic_action: 'Nourishes Kidney and Liver Yin, benefits the eyes' },
      { food: 'Mulberries (Sang Shen)', nature: 'cool', flavour: 'sweet', organ_affinity: ['Kidney', 'Liver', 'Heart'], therapeutic_action: 'Nourishes Yin and Blood, moistens the intestines' },
      { food: 'Black beans', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Kidney', 'Spleen'], therapeutic_action: 'Tonifies Kidney, nourishes Yin, promotes urination' },
      { food: 'Pear', nature: 'cool', flavour: 'sweet', organ_affinity: ['Lung', 'Stomach'], therapeutic_action: 'Generates fluids, moistens dryness, clears Heat' },
      { food: 'Seaweed and kelp', nature: 'cold', flavour: 'salty', organ_affinity: ['Kidney', 'Liver', 'Stomach'], therapeutic_action: 'Softens hardness, clears Heat, nourishes Kidney Yin' },
      { food: 'Duck', nature: 'cool', flavour: 'sweet', organ_affinity: ['Kidney', 'Lung'], therapeutic_action: 'Nourishes Yin, clears deficiency Heat, supplements weakness' },
      { food: 'Tofu', nature: 'cool', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach', 'Large Intestine'], therapeutic_action: 'Generates fluids, moistens dryness, clears Heat' },
    ],
    foods_to_avoid: [
      { food: 'Hot chilli peppers and strong spices', nature: 'hot', flavour: 'pungent', organ_affinity: ['Stomach', 'Large Intestine'], therapeutic_action: 'Excessive pungent heat consumes Yin fluids' },
      { food: 'Lamb and venison', nature: 'hot', flavour: 'sweet', organ_affinity: ['Kidney', 'Spleen'], therapeutic_action: 'Too warming; aggravates deficiency Heat when Yin is depleted' },
      { food: 'Excessive coffee and caffeine', nature: 'warm', flavour: 'bitter', organ_affinity: ['Heart', 'Kidney'], therapeutic_action: 'Stimulates Yang and depletes Yin and Jing' },
      { food: 'Dry roasted and baked foods', nature: 'warm', flavour: 'sweet', organ_affinity: ['Stomach'], therapeutic_action: 'Drying preparation method further depletes fluids' },
    ],
    tea_recommendations: [
      'Goji berry and chrysanthemum tea — nourishes Kidney and Liver Yin, clears the eyes',
      'Tremella (Yin Er) and pear tea — deeply moistening, nourishes Lung and Kidney Yin',
    ],
    cooking_methods: [
      'Steaming and gentle poaching to preserve moisture in foods',
      'Congee and soups made with Yin-nourishing ingredients — slow-cooked for deep nourishment',
    ],
    meal_timing: [
      'Avoid skipping meals — regular nourishment sustains Yin',
      'Eat a nourishing dinner by early evening; late-night eating disrupts Kidney rest during its peak hours (5-7 PM)',
    ],
  },
};

// ─── 4. Kidney Yang Deficiency ───
const kidneyYangDeficiency: PatternRecommendations = {
  pattern: 'Kidney Yang Deficiency',
  pattern_chinese: '肾阳虚',
  description:
    'Depleted Kidney Yang (Ming Men fire) causing cold limbs, weak lower back and knees, frequent pale urination, edema, low libido, and fatigue.',
  lifestyle: {
    diet: [
      'Eat warming, cooked foods — avoid all raw, cold, and frozen foods and beverages',
      'Include Kidney Yang-warming foods — walnuts, lamb, shrimp, cinnamon, fennel, star anise',
      'Cook with warming spices — dried ginger, cinnamon, black pepper, fenugreek',
      'Eat warm breakfasts such as congee, oatmeal, or soup to stoke the digestive fire',
      'Include bone broth regularly to nourish Kidney essence and warm the Yang',
    ],
    exercise: [
      'Practice warming exercises — brisk walking, moderate hiking, Qigong with dynamic movement',
      'Practice "Shaking the Head and Wagging the Tail" (Ba Duan Jin movement 5) for Kidney vitality',
      'Rub the lower back vigorously with the palms after exercise to warm Ming Men',
      'Avoid exercising in cold, damp environments without adequate protection',
    ],
    sleep: [
      'Keep the bedroom warm and the feet covered — cold feet indicate and worsen Kidney Yang deficiency',
      'Go to bed early and rise with the sun to synchronize with natural Yang cycles',
      'Use a warm foot soak with ginger or mugwort before bed to draw Yang downward',
      'Avoid sleeping in drafts or excessively cold rooms',
    ],
    emotional: [
      'Cultivate willpower and determination — the virtues of a strong Kidney',
      'Address deep-seated fears that may be draining Kidney Qi',
      'Engage in purposeful activities that build a sense of inner strength and resilience',
    ],
    seasonal: [
      'Winter demands extra care — dress warmly, eat hot foods, and conserve energy',
      'Protect the lower back, knees, and feet from cold and wind exposure',
      'In winter, retire early and sleep longer to conserve Yang Qi',
    ],
    general: [
      'Keep the lower back and abdomen warm at all times — use warming pads or moxibustion',
      'Avoid standing or sitting on cold surfaces',
      'Practice daily moxibustion on REN-4 (Guan Yuan) and DU-4 (Ming Men) if trained',
      'Moderate sexual activity to conserve Kidney essence',
      'Acupressure on KD-7 (Fu Liu) and REN-4 (Guan Yuan) to warm and tonify Kidney Yang',
    ],
  },
  dietary: {
    beneficial_foods: [
      { food: 'Lamb', nature: 'hot', flavour: 'sweet', organ_affinity: ['Kidney', 'Spleen'], therapeutic_action: 'Strongly warms Kidney Yang and benefits Qi' },
      { food: 'Walnuts (Hu Tao Ren)', nature: 'warm', flavour: 'sweet', organ_affinity: ['Kidney', 'Lung', 'Large Intestine'], therapeutic_action: 'Tonifies Kidney Yang, strengthens the lower back, moistens the intestines' },
      { food: 'Prawns and shrimp', nature: 'warm', flavour: 'sweet', organ_affinity: ['Kidney', 'Liver'], therapeutic_action: 'Warms Kidney Yang, tonifies essence, promotes lactation' },
      { food: 'Cinnamon bark (Rou Gui)', nature: 'hot', flavour: 'pungent', organ_affinity: ['Kidney', 'Spleen', 'Heart'], therapeutic_action: 'Warms Ming Men fire, disperses cold, promotes circulation' },
      { food: 'Fennel seeds', nature: 'warm', flavour: 'pungent', organ_affinity: ['Kidney', 'Liver', 'Spleen'], therapeutic_action: 'Warms the Kidney, disperses cold, regulates Qi' },
      { food: 'Leeks (Jiu Cai)', nature: 'warm', flavour: 'pungent', organ_affinity: ['Kidney', 'Liver', 'Stomach'], therapeutic_action: 'Warms the Kidney Yang and strengthens Yang Qi' },
      { food: 'Chestnuts', nature: 'warm', flavour: 'sweet', organ_affinity: ['Kidney', 'Spleen', 'Stomach'], therapeutic_action: 'Tonifies Kidney Qi, strengthens lower back and knees' },
      { food: 'Black pepper', nature: 'hot', flavour: 'pungent', organ_affinity: ['Stomach', 'Large Intestine'], therapeutic_action: 'Warms the middle Jiao and disperses cold' },
    ],
    foods_to_avoid: [
      { food: 'Raw vegetables and salads', nature: 'cold', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Cold nature extinguishes the Ming Men fire' },
      { food: 'Watermelon and tropical fruits', nature: 'cold', flavour: 'sweet', organ_affinity: ['Stomach', 'Bladder'], therapeutic_action: 'Strongly cooling, further dampens Kidney Yang' },
      { food: 'Ice cream and frozen desserts', nature: 'cold', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Directly injures Spleen and Kidney Yang' },
      { food: 'Excessive soy products', nature: 'cool', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Cooling nature can impair Yang in large quantities' },
    ],
    tea_recommendations: [
      'Cinnamon and ginger tea — warms the Kidney Yang and disperses cold',
      'Du Zhong (Eucommia bark) tea — tonifies Kidney Yang and strengthens the lower back',
      'Roasted walnut and jujube warm tea — nourishes Kidney essence and warms Yang',
    ],
    cooking_methods: [
      'Slow-cooking, braising, and roasting to infuse warming energy into foods',
      'Add warming spices (cinnamon, star anise, dried ginger) to soups and stews',
    ],
    meal_timing: [
      'Always eat a warm breakfast to ignite the digestive fire for the day',
      'Avoid cold foods and drinks especially in the morning and evening when Yang is lower',
      'Eat dinner early to allow digestion before sleep',
    ],
  },
};

// ─── 5. Heart Blood Deficiency ───
const heartBloodDeficiency: PatternRecommendations = {
  pattern: 'Heart Blood Deficiency',
  pattern_chinese: '心血虚',
  description:
    'Insufficient Blood to nourish the Heart causing palpitations, insomnia, dream-disturbed sleep, poor memory, anxiety, dizziness, and a pale complexion.',
  lifestyle: {
    diet: [
      'Eat Blood-nourishing foods — red dates, longan, beetroot, dark leafy greens, liver',
      'Include iron-rich foods combined with vitamin C for absorption — spinach with lemon',
      'Favour red and dark-coloured foods that nourish the Heart and Blood — cherries, red grapes, goji berries',
      'Eat regular, balanced meals — skipping meals depletes Blood over time',
      'Avoid excessive raw foods that impair Spleen transformation of Blood',
    ],
    exercise: [
      'Gentle exercise that does not overly tax the Heart — slow walking, swimming, Tai Chi',
      'Practice Heart-calming Qigong such as Inner Smile meditation',
      'Avoid intense cardiovascular exercise that can drain Heart Blood further',
      'Practise restorative yoga with supported postures to calm the Shen',
    ],
    sleep: [
      'Create a calming pre-sleep routine — warm foot soak, gentle reading, herbal tea',
      'Address dream-disturbed sleep with Heart Blood-nourishing herbs in evening tea',
      'Keep the bedroom dark and quiet to support the Shen settling into the Heart during sleep',
      'Avoid overstimulation in the evening — television, social media, heated discussions',
    ],
    emotional: [
      'Cultivate joy without overexcitement — the Heart is damaged by excessive joy (mania)',
      'Practice Heart-centred meditation — lovingkindness (metta) or gratitude meditation',
      'Address anxiety gently through breath-focused practices rather than forced positive thinking',
      'Engage in activities that bring calm happiness — music, gentle socializing, creative expression',
    ],
    seasonal: [
      'Summer is the Heart season — protect yourself from excessive heat and overexertion',
      'In summer, include cooling and Blood-nourishing foods — watermelon, mung beans, cucumber',
      'Avoid intense midday sun exposure which can scatter the Shen',
    ],
    general: [
      'Prioritize rest and avoid chronic overwork that depletes Heart Blood',
      'Reduce screen time in the evening — the bright light scatters the Shen',
      'Keep a regular sleep-wake schedule to stabilize the Heart rhythm',
      'Acupressure on HT-7 (Shen Men) to calm the Shen and nourish Heart Blood',
      'Consider blood-building soups with dang gui, longan, and red dates regularly',
    ],
  },
  dietary: {
    beneficial_foods: [
      { food: 'Longan fruit (Long Yan Rou)', nature: 'warm', flavour: 'sweet', organ_affinity: ['Heart', 'Spleen'], therapeutic_action: 'Tonifies Heart Blood, calms the Shen, treats insomnia' },
      { food: 'Red dates (Da Zao)', nature: 'warm', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach', 'Heart'], therapeutic_action: 'Nourishes Blood, tonifies Qi, calms the spirit' },
      { food: 'Beetroot', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Heart', 'Liver'], therapeutic_action: 'Nourishes Blood, strengthens the Heart, supports circulation' },
      { food: 'Spinach', nature: 'cool', flavour: 'sweet', organ_affinity: ['Liver', 'Stomach', 'Large Intestine'], therapeutic_action: 'Nourishes Blood, moistens dryness, stops bleeding' },
      { food: 'Dark grapes and cherries', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Liver', 'Kidney'], therapeutic_action: 'Nourishes Blood and Yin, strengthens sinews' },
      { food: 'Lotus seed (Lian Zi)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Heart', 'Spleen', 'Kidney'], therapeutic_action: 'Calms the Shen, tonifies the Spleen, stabilizes the Kidney' },
      { food: 'Eggs', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Heart', 'Kidney'], therapeutic_action: 'Nourishes Blood and Yin, calms the Shen' },
      { food: 'Organ meats (liver, heart)', nature: 'warm', flavour: 'sweet', organ_affinity: ['Liver', 'Heart'], therapeutic_action: 'Strongly tonifies Blood and nourishes the organ it comes from' },
    ],
    foods_to_avoid: [
      { food: 'Coffee and strong caffeinated drinks', nature: 'warm', flavour: 'bitter', organ_affinity: ['Heart'], therapeutic_action: 'Over-stimulates the Heart and scatters the Shen' },
      { food: 'Excessive spicy and pungent foods', nature: 'hot', flavour: 'pungent', organ_affinity: ['Lung', 'Stomach'], therapeutic_action: 'Pungent flavour disperses and can scatter Heart Blood' },
      { food: 'Alcohol', nature: 'hot', flavour: 'pungent', organ_affinity: ['Liver', 'Heart'], therapeutic_action: 'Disrupts the Shen and generates Heat that consumes Blood' },
      { food: 'Refined sugars', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen'], therapeutic_action: 'Weakens the Spleen source of Blood production' },
    ],
    tea_recommendations: [
      'Longan and red date tea — directly nourishes Heart Blood and calms the Shen',
      'Suan Zao Ren (sour jujube seed) tea — nourishes Heart Yin and Blood, treats insomnia',
      'Lavender and chamomile tea — calms the Shen and supports sleep',
    ],
    cooking_methods: [
      'Slow-cooking soups and broths with Blood-nourishing herbs and red dates',
      'Gentle steaming to preserve nutrients in dark leafy greens',
    ],
    meal_timing: [
      'Eat regular meals — never skip meals as this depletes the Blood-building process',
      'Have a Blood-nourishing snack before bed if needed — longan, dates, warm milk with honey',
    ],
  },
};

// ─── 6. Lung Qi Deficiency ───
const lungQiDeficiency: PatternRecommendations = {
  pattern: 'Lung Qi Deficiency',
  pattern_chinese: '肺气虚',
  description:
    'Weakened Lung Qi causing shortness of breath, weak voice, spontaneous sweating, weak cough, susceptibility to colds, and a bright pale complexion.',
  lifestyle: {
    diet: [
      'Eat foods that tonify Lung Qi — astragalus, white mushrooms, almonds, honey, pear',
      'Include white-coloured foods that resonate with the Metal element — white radish, white fungus, lily bulb, lotus root',
      'Avoid cold and raw foods that impair the Lung descending function',
      'Use pungent foods moderately to open and disperse Lung Qi — ginger, garlic, onion',
      'Cook with medicinal porridges using astragalus and white fungus',
    ],
    exercise: [
      'Practice deep breathing exercises and pranayama to strengthen Lung Qi',
      'Qigong breathing practices — especially "Pulling Apart" (Ba Duan Jin movement 3) to expand the chest',
      'Moderate aerobic exercise to gently expand lung capacity — walking, cycling',
      'Avoid exercising in polluted, dusty, or extremely cold air',
    ],
    sleep: [
      'Sleep with the head slightly elevated if prone to nighttime cough or breathlessness',
      'Ensure the bedroom has clean, fresh air — use air purifiers if needed',
      'The Lung time is 3-5 AM — waking consistently at this time indicates Lung imbalance',
    ],
    emotional: [
      'Address grief and sadness, which are the emotions that weaken the Lung',
      'Practice the Healing Sound for the Lung: "Sssssss" to release grief and strengthen Lung Qi',
      'Cultivate a sense of self-worth and letting go — the virtue of the Metal element',
      'Spend time in fresh, clean air environments — forests, mountains, seaside',
    ],
    seasonal: [
      'Autumn is the Lung season — protect against dryness and Wind invasion',
      'In autumn, eat moistening foods — pear, honey, white fungus — to prevent Lung dryness',
      'Wear a scarf to protect the back of the neck (DU-14, GB-20) from Wind invasion',
    ],
    general: [
      'Strengthen Wei Qi (defensive Qi) with regular acupressure on LU-7 (Lie Que) and LI-4 (He Gu)',
      'Avoid smoking and exposure to secondhand smoke',
      'Practice cold-water face washing in the morning to stimulate Wei Qi',
      'Keep the chest and upper back warm and protected from drafts',
      'Use a humidifier in dry environments to protect the Lung from dryness',
    ],
  },
  dietary: {
    beneficial_foods: [
      { food: 'White fungus (Yin Er / Tremella)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Lung', 'Stomach', 'Kidney'], therapeutic_action: 'Moistens the Lung, nourishes Yin, generates fluids' },
      { food: 'Pear', nature: 'cool', flavour: 'sweet', organ_affinity: ['Lung', 'Stomach'], therapeutic_action: 'Moistens the Lung, clears Heat, generates fluids' },
      { food: 'Honey', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Lung', 'Spleen', 'Large Intestine'], therapeutic_action: 'Tonifies the middle, moistens the Lung, stops cough' },
      { food: 'Almonds (Xing Ren — sweet variety)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Lung', 'Large Intestine'], therapeutic_action: 'Moistens the Lung, stops cough, moistens the intestines' },
      { food: 'Lily bulb (Bai He)', nature: 'cool', flavour: 'sweet', organ_affinity: ['Lung', 'Heart'], therapeutic_action: 'Moistens the Lung, clears Heat, calms the Shen' },
      { food: 'Lotus root', nature: 'cool', flavour: 'sweet', organ_affinity: ['Lung', 'Spleen', 'Stomach'], therapeutic_action: 'Clears Heat from the Lung, generates fluids, cools the Blood' },
      { food: 'Daikon radish', nature: 'cool', flavour: 'pungent', organ_affinity: ['Lung', 'Stomach'], therapeutic_action: 'Descends Lung Qi, transforms Phlegm, aids digestion' },
      { food: 'Astragalus root (Huang Qi)', nature: 'warm', flavour: 'sweet', organ_affinity: ['Lung', 'Spleen'], therapeutic_action: 'Tonifies Lung and Spleen Qi, strengthens Wei Qi' },
    ],
    foods_to_avoid: [
      { food: 'Dairy products (in excess)', nature: 'cool', flavour: 'sweet', organ_affinity: ['Lung', 'Spleen'], therapeutic_action: 'Generates Phlegm which obstructs the Lung' },
      { food: 'Bananas', nature: 'cold', flavour: 'sweet', organ_affinity: ['Lung', 'Large Intestine'], therapeutic_action: 'Cold and Phlegm-producing; weakens a deficient Lung' },
      { food: 'Excessively cold or frozen foods', nature: 'cold', flavour: 'sweet', organ_affinity: ['Lung', 'Spleen'], therapeutic_action: 'Contracts the Lung and impairs its descending function' },
      { food: 'Overly greasy and fried foods', nature: 'hot', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Generates Phlegm-Dampness that obstructs the Lung' },
    ],
    tea_recommendations: [
      'Huang Qi (Astragalus) and ginger tea — tonifies Lung Qi and strengthens Wei Qi',
      'Pear and lily bulb tea — moistens the Lung and soothes cough',
      'Luo Han Guo (monk fruit) tea — clears Lung Heat, moistens the throat, stops cough',
    ],
    cooking_methods: [
      'Steaming to preserve moisture — especially for pears, fish, and vegetables',
      'Making congee with Lung-tonifying ingredients like lily bulb and white fungus',
      'Simmering soups with astragalus to extract Qi-tonifying properties',
    ],
    meal_timing: [
      'Eat breakfast during Lung time (5-7 AM transition) or Stomach time (7-9 AM)',
      'Avoid eating late at night which impairs the Lung descending function',
    ],
  },
};

// ─── 7. Liver Yang Rising ───
const liverYangRising: PatternRecommendations = {
  pattern: 'Liver Yang Rising',
  pattern_chinese: '肝阳上亢',
  description:
    'Hyperactive Liver Yang rising upward causing headaches (especially temporal), dizziness, irritability, red face and eyes, tinnitus, and hypertension.',
  lifestyle: {
    diet: [
      'Eat cooling, Liver-calming foods — celery, chrysanthemum, mung beans, cucumber',
      'Avoid hot, spicy, and Yang-rising foods — chilli, garlic, ginger, alcohol, lamb',
      'Include foods that anchor Yang downward — oyster shell, abalone, mussels, seaweed',
      'Emphasize the sour flavour which astringes and constrains rising Yang — lemon, vinegar, plum',
      'Eat light meals; overeating generates Heat and exacerbates rising Yang',
    ],
    exercise: [
      'Practice slow, grounding exercises — walking meditation, gentle Tai Chi, Yin yoga',
      'Avoid vigorous, competitive exercise that raises Yang further — HIIT, competitive sports',
      'Practice grounding Qigong that directs Qi downward — standing meditation focusing on the feet',
      'Swim in cool water to draw Yang downward and cool the system',
    ],
    sleep: [
      'Sleep by 11 PM — staying up late generates Liver Heat and exacerbates Yang rising',
      'Sleep in a cool, dark environment to prevent overnight Heat accumulation',
      'Practise legs-up-the-wall pose (Viparita Karani) before bed to redirect Qi downward',
      'Avoid heated arguments or stimulating content before sleep',
    ],
    emotional: [
      'Manage anger and frustration through cooling practices — cold water on the wrists, slow breathing',
      'Practice the Healing Sound for the Liver: "Shūūū" to descend rising Yang',
      'Engage in calming activities — painting, calligraphy, gardening — to settle the Liver',
    ],
    seasonal: [
      'Spring can worsen Liver Yang rising — be extra cautious with diet and emotional management',
      'In hot weather, emphasize cooling foods and avoid overheating',
    ],
    general: [
      'Monitor blood pressure regularly if hypertension is present',
      'Reduce stress through structured relaxation — schedule daily quiet time',
      'Massage the temples and GB-20 (Feng Chi) to descend Liver Yang',
      'Soak feet in warm water before bed to draw Yang downward from the head',
      'Acupressure on LR-3 (Tai Chong) and GB-20 (Feng Chi) to subdue Liver Yang',
    ],
  },
  dietary: {
    beneficial_foods: [
      { food: 'Celery', nature: 'cool', flavour: 'sweet', organ_affinity: ['Liver', 'Stomach'], therapeutic_action: 'Clears Liver Heat, calms Liver Yang, lowers blood pressure' },
      { food: 'Chrysanthemum', nature: 'cool', flavour: 'sweet', organ_affinity: ['Liver', 'Lung'], therapeutic_action: 'Clears Liver Heat and calms rising Yang' },
      { food: 'Mung beans', nature: 'cool', flavour: 'sweet', organ_affinity: ['Heart', 'Stomach'], therapeutic_action: 'Clears Heat, detoxifies, cools the Blood' },
      { food: 'Cucumber', nature: 'cool', flavour: 'sweet', organ_affinity: ['Stomach', 'Small Intestine', 'Bladder'], therapeutic_action: 'Clears Heat, generates fluids, quenches thirst' },
      { food: 'Seaweed', nature: 'cold', flavour: 'salty', organ_affinity: ['Kidney', 'Liver'], therapeutic_action: 'Softens hardness, anchors Yang, nourishes Kidney Yin' },
      { food: 'Oysters and mussels', nature: 'cool', flavour: 'salty', organ_affinity: ['Liver', 'Kidney'], therapeutic_action: 'Heavy and salty nature anchors rising Yang and calms the Shen' },
      { food: 'Banana', nature: 'cold', flavour: 'sweet', organ_affinity: ['Lung', 'Large Intestine'], therapeutic_action: 'Clears Heat, moistens the intestines, settles rising energy' },
      { food: 'Green tea', nature: 'cool', flavour: 'bitter', organ_affinity: ['Heart', 'Liver', 'Stomach'], therapeutic_action: 'Clears Heat from the Liver and Heart, clears the head' },
    ],
    foods_to_avoid: [
      { food: 'Alcohol', nature: 'hot', flavour: 'pungent', organ_affinity: ['Liver'], therapeutic_action: 'Strongly raises Liver Yang and generates Liver Fire' },
      { food: 'Hot chilli peppers and wasabi', nature: 'hot', flavour: 'pungent', organ_affinity: ['Stomach', 'Large Intestine'], therapeutic_action: 'Extreme pungent heat rises upward and worsens the pattern' },
      { food: 'Coffee', nature: 'warm', flavour: 'bitter', organ_affinity: ['Heart', 'Liver'], therapeutic_action: 'Stimulates Yang uprising and contributes to headaches' },
      { food: 'Lamb, venison, and game meats', nature: 'hot', flavour: 'sweet', organ_affinity: ['Kidney', 'Spleen'], therapeutic_action: 'Excessively warming, fans the Liver Yang upward' },
      { food: 'Fried and barbecued foods', nature: 'hot', flavour: 'sweet', organ_affinity: ['Stomach'], therapeutic_action: 'Generates internal Heat that rises to the head' },
    ],
    tea_recommendations: [
      'Chrysanthemum tea — the premier tea for calming Liver Yang and clearing the head',
      'Chrysanthemum and cassia seed (Jue Ming Zi) tea — clears Liver Heat and benefits the eyes',
      'Peppermint and chrysanthemum tea — disperses Liver Heat and soothes headaches',
    ],
    cooking_methods: [
      'Steaming and boiling — cooler cooking methods that do not add Heat',
      'Raw preparation for cooling vegetables and fruits when digestion permits',
      'Avoid grilling, roasting, and deep-frying which add Heat to foods',
    ],
    meal_timing: [
      'Eat light meals at regular times — large meals generate excess Heat',
      'Avoid late-night eating which burdens the Liver during its restoration hours',
    ],
  },
};

// ─── 8. Damp-Heat ───
const dampHeat: PatternRecommendations = {
  pattern: 'Damp-Heat',
  pattern_chinese: '湿热',
  description:
    'Accumulation of Dampness combined with Heat causing heaviness, sticky stools, dark scanty urine, skin eruptions, yellow vaginal discharge, and a yellow greasy tongue coating.',
  lifestyle: {
    diet: [
      'Eat cooling, Dampness-draining foods — mung beans, barley, winter melon, adzuki beans',
      'Avoid greasy, fried, sweet, and heavy foods that generate Dampness and Heat',
      'Minimize alcohol, dairy, sugar, and tropical fruits',
      'Emphasize bitter and bland flavours that clear Heat and drain Dampness',
      'Eat lighter meals and avoid overeating',
      'Include aromatic herbs and spices that transform Dampness — cardamom, lotus leaf',
    ],
    exercise: [
      'Engage in moderate exercise that promotes sweating — brisk walking, cycling, dancing',
      'Sweating helps expel Damp-Heat through the surface',
      'Avoid exercising in hot, humid conditions which add external Damp-Heat',
      'Practice dynamic Qigong with twisting movements to wring out Dampness from the middle Jiao',
    ],
    sleep: [
      'Sleep in a dry, well-ventilated room — avoid damp environments',
      'Use lightweight, breathable bedding to prevent Heat accumulation',
      'Avoid sleeping on the floor or in basements where Dampness collects',
    ],
    emotional: [
      'Address feelings of sluggishness and mental fog by maintaining social engagement',
      'Avoid excessive rumination and worry which compound Dampness',
      'Keep the mind active and clear with stimulating but not stressful activities',
    ],
    seasonal: [
      'Late summer and humid seasons require extra dietary vigilance against Damp-Heat',
      'In humid weather, use dehumidifiers and wear breathable natural fabrics',
      'Avoid prolonged exposure to rain and damp weather',
    ],
    general: [
      'Maintain a clean, dry living environment',
      'Wear breathable, natural-fibre clothing — cotton, linen',
      'Avoid sitting for prolonged periods which allows Dampness to accumulate in the lower Jiao',
      'Drink warm water throughout the day rather than cold beverages',
      'Acupressure on SP-9 (Yin Ling Quan) and ST-36 (Zu San Li) to resolve Dampness',
    ],
  },
  dietary: {
    beneficial_foods: [
      { food: 'Mung beans', nature: 'cool', flavour: 'sweet', organ_affinity: ['Heart', 'Stomach'], therapeutic_action: 'Clears Heat, detoxifies, drains Dampness' },
      { food: 'Job\'s tears (Yi Yi Ren / barley)', nature: 'cool', flavour: 'sweet', organ_affinity: ['Spleen', 'Lung', 'Kidney'], therapeutic_action: 'Drains Dampness, clears Heat, strengthens the Spleen' },
      { food: 'Adzuki beans (Chi Xiao Dou)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Heart', 'Small Intestine'], therapeutic_action: 'Drains Dampness, reduces swelling, clears Heat' },
      { food: 'Winter melon (Dong Gua)', nature: 'cool', flavour: 'sweet', organ_affinity: ['Lung', 'Large Intestine', 'Bladder'], therapeutic_action: 'Clears Heat, drains Dampness, promotes urination' },
      { food: 'Bitter melon (Ku Gua)', nature: 'cold', flavour: 'bitter', organ_affinity: ['Heart', 'Liver', 'Spleen'], therapeutic_action: 'Clears Heat, detoxifies, drains Damp-Heat' },
      { food: 'Lotus leaf', nature: 'neutral', flavour: 'bitter', organ_affinity: ['Liver', 'Spleen', 'Stomach'], therapeutic_action: 'Clears Summer-Heat, raises clear Yang, resolves Dampness' },
      { food: 'Corn silk', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Bladder', 'Liver', 'Gallbladder'], therapeutic_action: 'Promotes urination and drains Damp-Heat from the lower Jiao' },
      { food: 'Watermelon', nature: 'cold', flavour: 'sweet', organ_affinity: ['Heart', 'Stomach', 'Bladder'], therapeutic_action: 'Clears Summer-Heat, generates fluids, promotes urination' },
    ],
    foods_to_avoid: [
      { food: 'Deep-fried foods', nature: 'hot', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Generates both Dampness and Heat simultaneously' },
      { food: 'Alcohol and beer', nature: 'hot', flavour: 'pungent', organ_affinity: ['Liver', 'Spleen'], therapeutic_action: 'Creates Damp-Heat in the Liver and Gallbladder' },
      { food: 'Dairy products', nature: 'cool', flavour: 'sweet', organ_affinity: ['Spleen'], therapeutic_action: 'Generates Dampness even though cooling; traps existing Heat' },
      { food: 'Refined sugar and sweets', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen'], therapeutic_action: 'Excessive sweetness generates Dampness and feeds Heat' },
      { food: 'Fatty and greasy meats', nature: 'warm', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Creates Phlegm-Dampness and generates Heat' },
    ],
    tea_recommendations: [
      'Job\'s tears (Yi Yi Ren) and mung bean tea — clears Damp-Heat from the middle and lower Jiao',
      'Lotus leaf tea — clears Summer-Heat and resolves Dampness',
      'Corn silk tea — drains Damp-Heat through urination',
    ],
    cooking_methods: [
      'Light steaming, boiling, and blanching — minimal oil',
      'Avoid deep-frying, heavy sautéing, and rich sauces',
      'Use aromatic spices (cardamom, coriander) that transform Dampness without excess Heat',
    ],
    meal_timing: [
      'Eat smaller, lighter meals — overeating overwhelms the Spleen and breeds Dampness',
      'Avoid heavy meals in the evening when the body cannot efficiently transform Dampness',
    ],
  },
};

// ─── 9. Phlegm-Dampness ───
const phlegmDampness: PatternRecommendations = {
  pattern: 'Phlegm-Dampness',
  pattern_chinese: '痰湿',
  description:
    'Accumulation of Phlegm and Dampness causing a feeling of heaviness, chest oppression, nausea, productive cough, obesity, muzzy-headedness, and a thick greasy tongue coating.',
  lifestyle: {
    diet: [
      'Eat warming, aromatic foods that transform Phlegm — ginger, garlic, mustard greens, radish',
      'Avoid Phlegm-generating foods — dairy, wheat, sugar, bananas, peanuts',
      'Emphasize bitter and pungent flavours that cut through Phlegm and dry Dampness',
      'Eat cooked, warm foods — raw and cold foods impair Spleen transformation and breed Phlegm',
      'Reduce portion sizes — overeating is a primary cause of Phlegm accumulation',
    ],
    exercise: [
      'Regular vigorous exercise to transform Phlegm — brisk walking, hiking, cycling',
      'Practice dynamic Qigong with chest-opening and twisting movements',
      'Ba Duan Jin movement 3 ("Drawing the Bow") to open the chest and disperse Phlegm',
      'Avoid sedentary behaviour which allows Phlegm to accumulate',
      'Exercise daily — consistency is key for transforming Phlegm-Dampness',
    ],
    sleep: [
      'Sleep in a dry, elevated, well-ventilated environment',
      'Elevate the head slightly if chest congestion or snoring is present',
      'Avoid sleeping excessively — too much sleep generates Dampness',
    ],
    emotional: [
      'Address feelings of mental fogginess and confusion through mental stimulation',
      'Avoid excessive pensiveness and overthinking which weaken the Spleen',
      'Engage in clear, focused activities that sharpen mental clarity',
      'Practice decluttering physical spaces — external order supports internal clarity',
    ],
    seasonal: [
      'Damp seasons (late summer, rainy periods) require strict dietary control',
      'In humid weather, increase aromatic Phlegm-transforming spices in cooking',
      'Avoid living in damp, poorly ventilated environments',
    ],
    general: [
      'Lose excess weight gradually — obesity is both a cause and result of Phlegm-Dampness',
      'Stay physically active throughout the day — avoid prolonged sitting',
      'Reduce or eliminate dairy, refined carbohydrates, and sugary foods',
      'Practice dry skin brushing before bathing to move lymph and resolve Dampness',
      'Acupressure on ST-40 (Feng Long) — the primary point for transforming Phlegm',
    ],
  },
  dietary: {
    beneficial_foods: [
      { food: 'Daikon radish', nature: 'cool', flavour: 'pungent', organ_affinity: ['Lung', 'Stomach'], therapeutic_action: 'Descends Qi, transforms Phlegm, aids digestion' },
      { food: 'Mustard greens', nature: 'warm', flavour: 'pungent', organ_affinity: ['Lung'], therapeutic_action: 'Warms the Lung, transforms Phlegm, moves Qi' },
      { food: 'Job\'s tears (Yi Yi Ren)', nature: 'cool', flavour: 'sweet', organ_affinity: ['Spleen', 'Lung', 'Kidney'], therapeutic_action: 'Strengthens the Spleen, resolves Dampness, eliminates Phlegm' },
      { food: 'Ginger (fresh and dried)', nature: 'warm', flavour: 'pungent', organ_affinity: ['Lung', 'Spleen', 'Stomach'], therapeutic_action: 'Warms the middle Jiao, transforms Phlegm, stops vomiting' },
      { food: 'Seaweed (Hai Zao / Kun Bu)', nature: 'cold', flavour: 'salty', organ_affinity: ['Liver', 'Kidney', 'Stomach'], therapeutic_action: 'Softens hardness, transforms Phlegm, reduces nodules' },
      { food: 'Tangerine peel (Chen Pi)', nature: 'warm', flavour: 'pungent', organ_affinity: ['Spleen', 'Lung'], therapeutic_action: 'Regulates Qi, dries Dampness, transforms Phlegm' },
      { food: 'Mushrooms (shiitake, oyster)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Tonifies Qi, strengthens Spleen transformation to reduce Phlegm' },
      { food: 'Onions and garlic', nature: 'warm', flavour: 'pungent', organ_affinity: ['Lung', 'Stomach'], therapeutic_action: 'Transforms Phlegm, disperses cold, moves Qi' },
    ],
    foods_to_avoid: [
      { food: 'Dairy products (milk, cheese, yogurt)', nature: 'cool', flavour: 'sweet', organ_affinity: ['Spleen', 'Lung'], therapeutic_action: 'Primary Phlegm-generating food group in TCM' },
      { food: 'Bananas', nature: 'cold', flavour: 'sweet', organ_affinity: ['Lung', 'Large Intestine'], therapeutic_action: 'Cold and sweet nature strongly generates Phlegm' },
      { food: 'Peanuts and peanut butter', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen', 'Lung'], therapeutic_action: 'Heavy, oily nature generates Dampness and Phlegm' },
      { food: 'White sugar and sweet pastries', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen'], therapeutic_action: 'Excessive sweetness overwhelms the Spleen and breeds Phlegm' },
      { food: 'Cold and iced beverages', nature: 'cold', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Congeals fluids and impairs transformation, leading to Phlegm' },
    ],
    tea_recommendations: [
      'Chen Pi (tangerine peel) and ginger tea — regulates Qi, transforms Phlegm, warms the middle',
      'Pu-erh tea — transforms Phlegm-Dampness, aids digestion, supports weight management',
      'Fresh ginger and honey tea — warms the Lung and transforms cold Phlegm',
    ],
    cooking_methods: [
      'Roasting and baking with aromatic spices to dry Dampness',
      'Light stir-frying with ginger, garlic, and onion to transform Phlegm',
      'Avoid heavy, oil-laden cooking methods',
    ],
    meal_timing: [
      'Eat smaller meals to prevent overwhelming the Spleen',
      'Avoid late-night snacking which generates overnight Phlegm-Dampness',
      'Make lunch the main meal when Yang and digestive fire are strongest',
    ],
  },
};

// ─── 10. Blood Stasis ───
const bloodStasis: PatternRecommendations = {
  pattern: 'Blood Stasis',
  pattern_chinese: '血瘀',
  description:
    'Stagnation of Blood causing fixed stabbing pain, dark complexion, purplish lips and nails, masses or tumours, varicose veins, and a purple tongue with dark spots.',
  lifestyle: {
    diet: [
      'Eat Blood-moving foods — turmeric, saffron, hawthorn berries, vinegar, chives',
      'Include foods that invigorate circulation — onion, garlic, ginger, eggplant',
      'Avoid cold and frozen foods that congeal the Blood further',
      'Reduce heavy, greasy foods that impede Blood circulation',
      'Include moderate amounts of wine or rice wine in cooking (not drinking) to move Blood',
    ],
    exercise: [
      'Regular moderate exercise is essential to move Blood — daily walking, swimming, dancing',
      'Practice Tai Chi and Qigong with emphasis on flowing, continuous movements',
      'Gentle self-massage and gua sha on areas of pain or stasis',
      'Avoid prolonged sitting or standing which promotes Blood stagnation',
      'Stretch daily — especially areas prone to stiffness and pain',
    ],
    sleep: [
      'Avoid sleeping in one position all night — gentle movement before bed improves circulation',
      'Keep the extremities warm during sleep to prevent Blood congealing from cold',
      'A warm bath or foot soak before bed promotes Blood circulation',
    ],
    emotional: [
      'Address long-held resentments and emotional stagnation that contribute to Blood Stasis',
      'Practice forgiveness and letting go of old emotional pain',
      'Engage in creative expression to move stuck emotional energy',
      'Seek counselling for unresolved trauma which often manifests as Blood Stasis',
    ],
    seasonal: [
      'Cold weather worsens Blood Stasis — dress warmly, especially the extremities',
      'In winter, increase Blood-moving spices and warming soups',
    ],
    general: [
      'Avoid smoking which severely impairs Blood circulation',
      'Stay well-hydrated to keep the Blood fluid and flowing',
      'Practice regular self-massage or seek professional Tuina to break up stasis',
      'Acupressure on SP-10 (Xue Hai), BL-17 (Ge Shu), and LR-3 (Tai Chong) to invigorate Blood',
      'Consider regular acupuncture to maintain Blood flow',
    ],
  },
  dietary: {
    beneficial_foods: [
      { food: 'Turmeric (Jiang Huang)', nature: 'warm', flavour: 'pungent', organ_affinity: ['Liver', 'Spleen'], therapeutic_action: 'Invigorates Blood, breaks up stasis, relieves pain' },
      { food: 'Hawthorn berries (Shan Zha)', nature: 'warm', flavour: 'sour', organ_affinity: ['Spleen', 'Stomach', 'Liver'], therapeutic_action: 'Invigorates Blood, dissolves food stagnation, reduces masses' },
      { food: 'Eggplant', nature: 'cool', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach', 'Large Intestine'], therapeutic_action: 'Invigorates Blood, clears Heat, reduces swelling' },
      { food: 'Chives (Jiu Cai)', nature: 'warm', flavour: 'pungent', organ_affinity: ['Liver', 'Kidney', 'Stomach'], therapeutic_action: 'Warms and moves Blood, disperses stasis' },
      { food: 'Saffron (Zang Hong Hua)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Heart', 'Liver'], therapeutic_action: 'Invigorates Blood, dispels stasis, calms the Shen' },
      { food: 'Vinegar', nature: 'warm', flavour: 'sour', organ_affinity: ['Liver', 'Stomach'], therapeutic_action: 'Invigorates Blood, resolves stasis, aids digestion' },
      { food: 'Brown sugar (Hong Tang)', nature: 'warm', flavour: 'sweet', organ_affinity: ['Liver', 'Spleen', 'Stomach'], therapeutic_action: 'Warms the middle, invigorates Blood, dispels cold' },
      { food: 'Peach', nature: 'warm', flavour: 'sweet', organ_affinity: ['Lung', 'Large Intestine'], therapeutic_action: 'Invigorates Blood, moistens the intestines' },
    ],
    foods_to_avoid: [
      { food: 'Frozen and iced foods', nature: 'cold', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Cold congeals Blood and worsens stasis' },
      { food: 'Excessive fatty meats', nature: 'warm', flavour: 'sweet', organ_affinity: ['Spleen'], therapeutic_action: 'Generates Phlegm which obstructs Blood flow' },
      { food: 'Excessive salt', nature: 'cold', flavour: 'salty', organ_affinity: ['Kidney'], therapeutic_action: 'Constricts Blood vessels and impedes circulation' },
      { food: 'Highly processed foods', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen'], therapeutic_action: 'Contributes to Phlegm and Dampness that impede Blood flow' },
    ],
    tea_recommendations: [
      'Hawthorn berry tea — invigorates Blood, aids digestion, reduces cholesterol',
      'Saffron and rose bud tea — moves Blood, dispels stasis, lifts the mood',
      'Turmeric and black pepper tea — powerful Blood-moving combination',
    ],
    cooking_methods: [
      'Moderate stir-frying with Blood-moving spices — turmeric, ginger, garlic',
      'Warm soups and stews that improve circulation and keep Blood fluid',
    ],
    meal_timing: [
      'Eat regular meals to maintain consistent Blood flow and Qi movement',
      'Avoid long gaps between meals which can lead to Blood congealing from Qi deficiency',
    ],
  },
};

// ─── 11. Wind-Cold ───
const windCold: PatternRecommendations = {
  pattern: 'Wind-Cold',
  pattern_chinese: '风寒',
  description:
    'External Wind-Cold invasion causing chills, mild fever, aversion to cold, occipital headache and stiff neck, nasal congestion with clear discharge, body aches, and absence of sweating.',
  lifestyle: {
    diet: [
      'Eat warming, pungent foods to release the exterior — ginger, scallion, garlic, cinnamon',
      'Drink hot ginger and scallion soup immediately upon feeling the onset of Wind-Cold',
      'Avoid cold, raw, and cooling foods that trap the pathogen inside',
      'Eat easily digestible warm foods — congee, light soups, steamed rice',
      'Avoid heavy, greasy foods that impair the body\'s ability to expel the pathogen',
    ],
    exercise: [
      'Rest is essential during acute Wind-Cold invasion — avoid exercise until recovery',
      'Gentle stretching of the neck and shoulders to relieve Wind-Cold stiffness',
      'Once recovering, resume with gentle walking and Qigong only',
    ],
    sleep: [
      'Sleep as much as needed — the body heals and expels pathogens during sleep',
      'Stay warm in bed with extra blankets to promote mild sweating',
      'Protect the back of the neck from cold drafts during sleep',
      'Drink warm ginger tea before bed to promote surface warming',
    ],
    emotional: [
      'Allow yourself to rest without guilt — pushing through illness deepens the pathogen',
      'Maintain a calm, resting state to conserve Wei Qi for pathogen expulsion',
      'Avoid stress and emotional upset which divert Qi from the immune response',
    ],
    seasonal: [
      'Wind-Cold is most common in autumn and winter — dress warmly, wear scarves',
      'When transitioning between seasons, be especially vigilant about Wind exposure',
      'After sweating (exercise, bathing), dress warmly to prevent Wind-Cold entry',
    ],
    general: [
      'Cover the back of the neck and upper back — the area most vulnerable to Wind-Cold (DU-14, GB-20)',
      'Take a hot bath with ginger or Epsom salts to warm the channels and release the exterior',
      'Avoid air conditioning and cold drafts during recovery',
      'Acupressure on LI-4 (He Gu), LU-7 (Lie Que), and GB-20 (Feng Chi) to expel Wind-Cold',
      'Apply moxibustion on DU-14 (Da Zhui) if trained, to warm and release the exterior',
    ],
  },
  dietary: {
    beneficial_foods: [
      { food: 'Fresh ginger (Sheng Jiang)', nature: 'warm', flavour: 'pungent', organ_affinity: ['Lung', 'Spleen', 'Stomach'], therapeutic_action: 'Releases the exterior, disperses Wind-Cold, warms the Lung' },
      { food: 'Scallion / spring onion (Cong Bai)', nature: 'warm', flavour: 'pungent', organ_affinity: ['Lung', 'Stomach'], therapeutic_action: 'Induces sweating, releases the exterior, unblocks Yang Qi' },
      { food: 'Cinnamon twig (Gui Zhi flavouring)', nature: 'warm', flavour: 'pungent', organ_affinity: ['Heart', 'Lung', 'Bladder'], therapeutic_action: 'Warms the channels, releases the exterior, promotes sweating' },
      { food: 'Garlic', nature: 'warm', flavour: 'pungent', organ_affinity: ['Spleen', 'Stomach', 'Lung'], therapeutic_action: 'Warms the middle Jiao, detoxifies, disperses cold' },
      { food: 'Perilla leaf (Zi Su Ye)', nature: 'warm', flavour: 'pungent', organ_affinity: ['Lung', 'Spleen'], therapeutic_action: 'Releases the exterior, disperses cold, promotes Qi movement' },
      { food: 'Black pepper', nature: 'hot', flavour: 'pungent', organ_affinity: ['Stomach', 'Large Intestine'], therapeutic_action: 'Warms the middle Jiao, disperses cold, expels Wind' },
    ],
    foods_to_avoid: [
      { food: 'Cold salads and raw vegetables', nature: 'cold', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Cold foods trap the pathogen and prevent it from being expelled' },
      { food: 'Iced drinks and ice cream', nature: 'cold', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Directly introduces cold and blocks the release of the exterior' },
      { food: 'Cooling fruits — watermelon, pear, banana', nature: 'cold', flavour: 'sweet', organ_affinity: ['Lung', 'Stomach'], therapeutic_action: 'Cooling nature opposes the warming release needed for Wind-Cold' },
      { food: 'Shellfish and crab', nature: 'cold', flavour: 'salty', organ_affinity: ['Liver', 'Kidney'], therapeutic_action: 'Cold and heavy; obstructs the release of the exterior' },
    ],
    tea_recommendations: [
      'Ginger and brown sugar tea — classic Wind-Cold release formula for home use',
      'Perilla (Zi Su Ye) and ginger tea — releases the exterior and warms the Lung',
      'Cinnamon and jujube tea — warms the channels and promotes mild sweating',
    ],
    cooking_methods: [
      'Hot soups and congee with ginger, scallion, and warming herbs',
      'Boiling and simmering to extract warming properties from ingredients',
    ],
    meal_timing: [
      'Eat small, frequent warm meals to maintain strength without burdening digestion',
      'Drink hot fluids throughout the day, especially ginger water',
    ],
  },
};

// ─── 12. Wind-Heat ───
const windHeat: PatternRecommendations = {
  pattern: 'Wind-Heat',
  pattern_chinese: '风热',
  description:
    'External Wind-Heat invasion causing fever, slight chills, sore swollen throat, headache, thirst, cough with yellow phlegm, and a red tongue tip.',
  lifestyle: {
    diet: [
      'Eat cooling, pungent foods that release Wind-Heat — mint, chrysanthemum, mulberry leaf',
      'Include cooling fruits — pear, watermelon, cucumber — to clear Heat and generate fluids',
      'Avoid hot, spicy, fried, and warming foods that add to the Heat',
      'Drink plenty of warm (not hot) fluids to support fever resolution',
      'Eat light, easily digestible foods — congee, steamed vegetables, clear soups',
    ],
    exercise: [
      'Rest during the acute phase — exercise generates Heat and worsens the condition',
      'Avoid sweating excessively which depletes fluids during a Heat condition',
      'Resume gentle exercise only after the fever has resolved completely',
    ],
    sleep: [
      'Rest in a cool, well-ventilated room',
      'Use light coverings — avoid heavy blankets that trap Heat',
      'Stay hydrated before sleep to prevent fluid depletion from fever',
      'Sponge the forehead with cool water if feverish',
    ],
    emotional: [
      'Remain calm and avoid emotional agitation that generates internal Heat',
      'Allow the body to rest and recover without frustration at being unwell',
      'Practice gentle breathing to cool the system',
    ],
    seasonal: [
      'Wind-Heat is most common in spring and early summer',
      'During Wind-Heat seasons, keep peppermint tea and chrysanthemum on hand',
    ],
    general: [
      'Gargle with salt water for sore throat',
      'Stay well-hydrated — room-temperature or slightly warm water throughout the day',
      'Avoid Wind exposure which can drive the pathogen deeper',
      'Acupressure on LI-4 (He Gu), LI-11 (Qu Chi), and LU-11 (Shao Shang) to clear Wind-Heat',
      'Apply cool compresses to the forehead and temples for headache relief',
    ],
  },
  dietary: {
    beneficial_foods: [
      { food: 'Peppermint (Bo He)', nature: 'cool', flavour: 'pungent', organ_affinity: ['Lung', 'Liver'], therapeutic_action: 'Disperses Wind-Heat, clears the head, benefits the throat' },
      { food: 'Chrysanthemum', nature: 'cool', flavour: 'sweet', organ_affinity: ['Lung', 'Liver'], therapeutic_action: 'Disperses Wind-Heat, clears the eyes, detoxifies' },
      { food: 'Mulberry leaf (Sang Ye)', nature: 'cool', flavour: 'sweet', organ_affinity: ['Lung', 'Liver'], therapeutic_action: 'Disperses Wind-Heat, clears the Lung, moistens dryness' },
      { food: 'Pear', nature: 'cool', flavour: 'sweet', organ_affinity: ['Lung', 'Stomach'], therapeutic_action: 'Clears Heat, generates fluids, moistens the Lung' },
      { food: 'Watermelon', nature: 'cold', flavour: 'sweet', organ_affinity: ['Heart', 'Stomach', 'Bladder'], therapeutic_action: 'Clears Summer-Heat, generates fluids, promotes urination' },
      { food: 'Mung bean sprouts', nature: 'cool', flavour: 'sweet', organ_affinity: ['Stomach'], therapeutic_action: 'Clears Heat and detoxifies' },
      { food: 'Tofu', nature: 'cool', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Clears Heat, generates fluids, detoxifies' },
      { food: 'Cucumber', nature: 'cool', flavour: 'sweet', organ_affinity: ['Stomach', 'Small Intestine'], therapeutic_action: 'Clears Heat, generates fluids, quenches thirst' },
    ],
    foods_to_avoid: [
      { food: 'Chilli, cayenne, and hot spices', nature: 'hot', flavour: 'pungent', organ_affinity: ['Stomach', 'Large Intestine'], therapeutic_action: 'Adds Heat on top of existing Wind-Heat pathogen' },
      { food: 'Lamb, venison, and warming meats', nature: 'hot', flavour: 'sweet', organ_affinity: ['Kidney', 'Spleen'], therapeutic_action: 'Warming nature fans the Heat and prolongs illness' },
      { food: 'Fried and roasted foods', nature: 'hot', flavour: 'sweet', organ_affinity: ['Stomach'], therapeutic_action: 'Heating cooking methods compound the exterior Heat' },
      { food: 'Ginger (in large amounts)', nature: 'warm', flavour: 'pungent', organ_affinity: ['Lung', 'Spleen'], therapeutic_action: 'Warming nature inappropriate for Heat-predominant conditions' },
    ],
    tea_recommendations: [
      'Chrysanthemum and honeysuckle (Jin Yin Hua) tea — classic Wind-Heat clearing combination',
      'Peppermint tea — disperses Wind-Heat, clears the head, soothes the throat',
      'Mulberry leaf and chrysanthemum tea — gently releases Wind-Heat from the Lung level',
    ],
    cooking_methods: [
      'Light steaming and boiling — cooling methods that do not add Heat',
      'Raw or lightly blanched preparations for cooling vegetables and fruits',
    ],
    meal_timing: [
      'Eat small, light meals frequently rather than large heavy meals',
      'Drink cooling teas between meals to clear Heat and generate fluids',
    ],
  },
};

// ─── 13. Qi and Blood Deficiency ───
const qiBloodDeficiency: PatternRecommendations = {
  pattern: 'Qi and Blood Deficiency',
  pattern_chinese: '气血两虚',
  description:
    'Dual deficiency of Qi and Blood causing fatigue, shortness of breath, palpitations, dizziness, pale complexion, poor appetite, insomnia, numbness, and scanty menses.',
  lifestyle: {
    diet: [
      'Eat regular, warm, cooked meals rich in both Qi and Blood-tonifying foods',
      'Include iron-rich foods with vitamin C to support Blood production — liver, spinach, dark leafy greens',
      'Favour soups and stews made with astragalus, dang gui, jujube dates, and chicken',
      'Eat the sweet flavour in its natural form — rice, sweet potato, squash, dates — to support the Spleen',
      'Avoid raw, cold, and difficult-to-digest foods that burden the already weak Spleen',
      'Include small amounts of animal protein regularly — chicken, eggs, bone broth',
    ],
    exercise: [
      'Begin with very gentle exercise — slow walks of 10-15 minutes, gradually increasing',
      'Practice gentle Tai Chi and Qigong focused on gathering and storing Qi',
      'Avoid vigorous exercise until Qi and Blood are substantially replenished',
      'Restorative yoga with supported postures to conserve energy while gently moving Qi',
    ],
    sleep: [
      'Prioritize 8-9 hours of sleep — rest is essential for Qi and Blood regeneration',
      'A short nap (15-20 minutes) after lunch can support recovery',
      'Create a deeply restful sleep environment — dark, quiet, comfortable temperature',
      'Address insomnia with Blood-nourishing herbs before bed rather than stimulants during the day',
    ],
    emotional: [
      'Be gentle with yourself — deficiency states require patience and gradual building',
      'Avoid emotional extremes which consume Qi and Blood — practice equanimity',
      'Cultivate gratitude and contentment which nourish the Earth element (Spleen)',
      'Seek emotional support rather than trying to manage everything alone',
    ],
    seasonal: [
      'Winter rest and nourishment are especially important — conserve energy and eat richly',
      'In any season, avoid overexertion and ensure adequate nutrition',
    ],
    general: [
      'Prioritize rest and avoid overcommitting — learn to say no',
      'Eat nutrient-dense foods at every meal — avoid empty calories',
      'Consider Si Jun Zi Tang (Four Gentlemen) or Ba Zhen Tang (Eight Treasure) tea formulas under practitioner guidance',
      'Warm the abdomen with a hot water bottle or warm pad to support Spleen Qi',
      'Acupressure on ST-36 (Zu San Li), SP-6 (San Yin Jiao), and REN-6 (Qi Hai) to build Qi and Blood',
    ],
  },
  dietary: {
    beneficial_foods: [
      { food: 'Chicken (especially slow-cooked)', nature: 'warm', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Tonifies Qi and Blood, warms the middle Jiao' },
      { food: 'Beef', nature: 'warm', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Tonifies Qi and Blood, strengthens sinews and bones' },
      { food: 'Red dates (Da Zao)', nature: 'warm', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach', 'Heart'], therapeutic_action: 'Tonifies Spleen Qi and nourishes Blood simultaneously' },
      { food: 'Chinese yam (Shan Yao)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen', 'Lung', 'Kidney'], therapeutic_action: 'Tonifies Qi of the Spleen, Lung, and Kidney' },
      { food: 'Dang Gui (Angelica root — in cooking)', nature: 'warm', flavour: 'sweet', organ_affinity: ['Liver', 'Heart', 'Spleen'], therapeutic_action: 'Tonifies and invigorates Blood, regulates menstruation' },
      { food: 'Goji berries (Gou Qi Zi)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Liver', 'Kidney'], therapeutic_action: 'Nourishes Liver Blood, tonifies Kidney essence, brightens the eyes' },
      { food: 'Black sesame seeds', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Liver', 'Kidney'], therapeutic_action: 'Nourishes Blood and Yin, benefits the Liver and Kidney' },
      { food: 'Bone broth (long-simmered)', nature: 'warm', flavour: 'sweet', organ_affinity: ['Kidney', 'Spleen'], therapeutic_action: 'Deeply nourishes essence, Blood, and Qi' },
      { food: 'Eggs', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Heart', 'Kidney'], therapeutic_action: 'Nourishes Blood and Yin, settles the Shen' },
    ],
    foods_to_avoid: [
      { food: 'Raw and cold foods', nature: 'cold', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Weakens the already deficient Spleen, impairing Qi and Blood production' },
      { food: 'Excessive tea and coffee', nature: 'cool', flavour: 'bitter', organ_affinity: ['Heart', 'Stomach'], therapeutic_action: 'Bitter and astringent; impairs nutrient absorption and Blood building' },
      { food: 'Refined processed foods', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen'], therapeutic_action: 'Nutritionally empty; burdens the Spleen without providing building blocks for Qi and Blood' },
      { food: 'Excessive spicy foods', nature: 'hot', flavour: 'pungent', organ_affinity: ['Lung', 'Stomach'], therapeutic_action: 'Pungent dispersing nature scatters the Qi and Blood you are trying to build' },
    ],
    tea_recommendations: [
      'Astragalus (Huang Qi) and red date tea — tonifies Qi and Blood simultaneously',
      'Dang Gui and goji berry tea — nourishes Blood and supports Liver and Kidney',
      'Longan and red date tea — builds Heart Blood and calms the Shen',
    ],
    cooking_methods: [
      'Long slow-cooking — soups, stews, and congee to maximize nutrient extraction',
      'Double-boiling (dun) soups with tonic herbs for deep nourishment',
      'Avoid raw food preparation — cook everything to ease the burden on the Spleen',
    ],
    meal_timing: [
      'Eat three regular meals plus 1-2 nourishing snacks to maintain steady Qi and Blood levels',
      'Never skip meals — consistent nourishment is essential for rebuilding',
      'Eat the largest meal at midday when digestive fire is strongest',
    ],
  },
};

// ─── 14. Liver-Spleen Disharmony ───
const liverSpleenDisharmony: PatternRecommendations = {
  pattern: 'Liver-Spleen Disharmony',
  pattern_chinese: '肝脾不和',
  description:
    'The Liver overacting on the Spleen causing alternating constipation and loose stools (IBS-like), abdominal pain relieved by bowel movement, bloating, irritability worsened by stress, and poor appetite.',
  lifestyle: {
    diet: [
      'Eat in a calm, relaxed environment — stress during meals directly impairs this pattern',
      'Combine Qi-moving aromatic foods with Spleen-tonifying foods — ginger with rice, citrus peel with congee',
      'Eat warm, easily digestible meals — avoid raw, cold, and difficult-to-digest foods',
      'Favour foods that harmonize the Liver and Spleen — Chinese yam, lotus seed, barley, carrot',
      'Avoid foods that are both Qi-stagnating and Spleen-burdening — greasy fried food, excessive dairy',
      'Include small amounts of naturally sour and aromatic foods to soothe the Liver',
    ],
    exercise: [
      'Practice Tai Chi and Qigong that combine flowing movement with grounding — Cloud Hands, standing meditation',
      'Gentle abdominal twisting exercises to move Liver Qi and support Spleen transformation',
      'Walking after meals to promote both Qi flow and digestion',
      'Avoid high-intensity exercise during periods of digestive upset',
    ],
    sleep: [
      'Maintain a consistent sleep schedule — the Earth element (Spleen) needs regularity',
      'Practice relaxation techniques before bed to prevent Liver Qi stagnation from disrupting sleep',
      'Address worry and overthinking before bed with journalling or gentle meditation',
    ],
    emotional: [
      'Recognize the connection between emotional stress and digestive symptoms',
      'Practice stress management techniques — the Liver directly affects the Spleen under stress',
      'Address both anger/frustration (Liver) and worry/overthinking (Spleen) patterns',
      'Consider mindfulness-based stress reduction (MBSR) which addresses the Wood-Earth dynamic',
    ],
    seasonal: [
      'Spring (Liver season) and late summer (Spleen season) are vulnerable transition points',
      'During seasonal transitions, pay extra attention to eating regularly and managing stress',
    ],
    general: [
      'Do not eat when upset, angry, or stressed — wait until emotions settle',
      'Practice abdominal self-massage in a clockwise direction after meals',
      'Take three deep breaths before each meal to shift from sympathetic to parasympathetic mode',
      'Consider keeping a food and mood diary to identify trigger patterns',
      'Acupressure on LR-13 (Zhang Men — the Mu point of the Spleen on the Liver meridian) to harmonize Liver and Spleen',
    ],
  },
  dietary: {
    beneficial_foods: [
      { food: 'Chinese yam (Shan Yao)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen', 'Lung', 'Kidney'], therapeutic_action: 'Tonifies Spleen Qi while being gentle enough not to cause stagnation' },
      { food: 'White rice congee', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Gently tonifies Spleen Qi, easy to digest, settles the Stomach' },
      { food: 'Carrot', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen', 'Liver', 'Lung'], therapeutic_action: 'Strengthens the Spleen and benefits the Liver and eyes' },
      { food: 'Fennel', nature: 'warm', flavour: 'pungent', organ_affinity: ['Liver', 'Kidney', 'Spleen', 'Stomach'], therapeutic_action: 'Moves Liver Qi, warms the Spleen, relieves abdominal pain' },
      { food: 'Lotus seed (Lian Zi)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen', 'Kidney', 'Heart'], therapeutic_action: 'Tonifies the Spleen, calms the Shen, stabilizes the middle' },
      { food: 'Tangerine peel (Chen Pi)', nature: 'warm', flavour: 'pungent', organ_affinity: ['Spleen', 'Lung'], therapeutic_action: 'Moves Qi and harmonizes the middle Jiao, prevents stagnation from tonification' },
      { food: 'Hawthorn berries', nature: 'warm', flavour: 'sour', organ_affinity: ['Spleen', 'Stomach', 'Liver'], therapeutic_action: 'Aids food stagnation and moves Liver Qi' },
      { food: 'Peppermint (small amounts)', nature: 'cool', flavour: 'pungent', organ_affinity: ['Lung', 'Liver'], therapeutic_action: 'Gently moves Liver Qi and soothes the Stomach' },
    ],
    foods_to_avoid: [
      { food: 'Greasy fried foods', nature: 'hot', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Creates Dampness that burdens the Spleen and obstructs Liver Qi flow' },
      { food: 'Cold and raw foods', nature: 'cold', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Injures Spleen Yang, worsening the Spleen side of the disharmony' },
      { food: 'Excessive alcohol', nature: 'hot', flavour: 'pungent', organ_affinity: ['Liver'], therapeutic_action: 'Generates Liver Heat while creating Dampness that weakens the Spleen' },
      { food: 'Excessive sour foods', nature: 'cool', flavour: 'sour', organ_affinity: ['Liver'], therapeutic_action: 'While small amounts soothe the Liver, excess astringes and worsens stagnation' },
      { food: 'Gas-producing foods in excess (beans, cabbage, onions)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Spleen', 'Stomach'], therapeutic_action: 'Creates abdominal distension and Qi stagnation in the middle Jiao' },
    ],
    tea_recommendations: [
      'Chen Pi (tangerine peel) and rose bud tea — harmonizes the Liver and Spleen, moves Qi',
      'Jasmine tea — soothes Liver Qi while supporting Spleen digestion',
      'Peppermint and ginger tea — moves Liver Qi while warming the Spleen',
    ],
    cooking_methods: [
      'Gentle cooking with aromatic herbs — neither too heavy nor too raw',
      'Congee with harmonizing ingredients (lotus seed, Chinese yam, jujube, tangerine peel)',
      'Light soups that nourish without burdening the Spleen',
    ],
    meal_timing: [
      'Eat at consistent, regular times every day — regularity is therapeutic for this pattern',
      'Allow at least 30 minutes of calm before eating — never eat on the run',
      'Avoid eating large meals; prefer smaller, more frequent meals to reduce Spleen burden',
    ],
  },
};

// ─── 15. Heart-Kidney Disharmony ───
const heartKidneyDisharmony: PatternRecommendations = {
  pattern: 'Heart-Kidney Disharmony',
  pattern_chinese: '心肾不交',
  description:
    'Loss of communication between Heart Fire and Kidney Water causing insomnia, palpitations, restlessness, night sweats, tinnitus, poor memory, lower back soreness, and a feeling of heat above with cold below.',
  lifestyle: {
    diet: [
      'Nourish both Heart Blood and Kidney Yin — longan, goji berries, lotus seed, black sesame',
      'Eat foods that anchor the Heart fire downward — lotus seed heart (Lian Zi Xin), lily bulb',
      'Include salty foods moderately to direct Qi downward to the Kidney — seaweed, miso',
      'Avoid stimulating foods that scatter the Shen — excess caffeine, spicy food, alcohol',
      'Balance warm and cool foods — nourish without excess Heat or Cold',
    ],
    exercise: [
      'Practice Tai Chi with emphasis on sinking Qi to the Dantian — grounding the Heart fire',
      'Meditative Qigong that connects the Heart and Kidney — Inner Smile, Microcosmic Orbit',
      'Gentle yoga with inversions (legs up the wall, supported shoulder stand) to redirect fire downward',
      'Swimming in warm water to connect the Fire and Water elements',
    ],
    sleep: [
      'Addressing insomnia is the primary concern — this pattern profoundly disrupts sleep',
      'Practice a calming nighttime routine: warm foot soak, meditation, Heart-calming tea',
      'Soak feet in warm water with salt before bed — draws Heart fire downward to warm the Kidney',
      'Sleep in complete darkness to support melatonin production and Shen settling',
    ],
    emotional: [
      'Practise Heart-Kidney connecting meditation — visualize warm water rising and cool water descending',
      'Address anxiety and restlessness with grounding techniques — feeling the feet on the ground',
      'Cultivate inner stillness through silent sitting — this reconnects Fire and Water',
    ],
    seasonal: [
      'Summer (Heart season) and winter (Kidney season) are critical — balance warming and cooling',
      'In summer, do not overcool; in winter, do not overheat — seek the middle path',
      'Transitions between summer and winter can worsen this pattern — adjust gradually',
    ],
    general: [
      'The warm foot soak before bed is perhaps the single most important daily practice for this pattern',
      'Practice the Microcosmic Orbit meditation to reconnect the Ren and Du channels',
      'Avoid excessive screen time before bed — blue light scatters the Shen and prevents descent',
      'Acupressure on HT-7 (Shen Men) and KD-1 (Yong Quan) to reconnect Heart and Kidney',
      'Consider the classical formula Tian Wang Bu Xin Dan under practitioner guidance',
    ],
  },
  dietary: {
    beneficial_foods: [
      { food: 'Lotus seed (Lian Zi)', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Heart', 'Spleen', 'Kidney'], therapeutic_action: 'Calms the Shen, tonifies the Kidney, bridges Heart and Kidney' },
      { food: 'Lotus seed heart (Lian Zi Xin)', nature: 'cold', flavour: 'bitter', organ_affinity: ['Heart'], therapeutic_action: 'Drains Heart Fire downward, treats insomnia and irritability' },
      { food: 'Lily bulb (Bai He)', nature: 'cool', flavour: 'sweet', organ_affinity: ['Heart', 'Lung'], therapeutic_action: 'Nourishes Heart Yin, calms the Shen, moistens the Lung' },
      { food: 'Goji berries', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Liver', 'Kidney'], therapeutic_action: 'Nourishes Kidney Yin to support the Water element rising' },
      { food: 'Black sesame', nature: 'neutral', flavour: 'sweet', organ_affinity: ['Kidney', 'Liver'], therapeutic_action: 'Nourishes Kidney Yin and essence' },
      { food: 'Longan (Long Yan Rou)', nature: 'warm', flavour: 'sweet', organ_affinity: ['Heart', 'Spleen'], therapeutic_action: 'Nourishes Heart Blood, calms the Shen, treats insomnia' },
      { food: 'Wheat berries (Xiao Mai)', nature: 'cool', flavour: 'sweet', organ_affinity: ['Heart', 'Spleen', 'Kidney'], therapeutic_action: 'Nourishes Heart Yin, calms the Shen — used in Gan Mai Da Zao Tang' },
      { food: 'Mulberries', nature: 'cool', flavour: 'sweet', organ_affinity: ['Heart', 'Liver', 'Kidney'], therapeutic_action: 'Nourishes Yin and Blood, connects Heart and Kidney' },
    ],
    foods_to_avoid: [
      { food: 'Coffee and strong tea', nature: 'warm', flavour: 'bitter', organ_affinity: ['Heart'], therapeutic_action: 'Stimulates Heart Fire upward and further disconnects it from the Kidney' },
      { food: 'Hot spicy foods', nature: 'hot', flavour: 'pungent', organ_affinity: ['Stomach'], therapeutic_action: 'Raises Yang and Fire, worsening the upper Heat symptoms' },
      { food: 'Chocolate', nature: 'warm', flavour: 'sweet', organ_affinity: ['Heart'], therapeutic_action: 'Stimulates the Heart and disrupts Shen settling at night' },
      { food: 'Alcohol', nature: 'hot', flavour: 'pungent', organ_affinity: ['Heart', 'Liver'], therapeutic_action: 'Disturbs the Shen and generates Heat that separates from the Kidney' },
    ],
    tea_recommendations: [
      'Lotus seed heart (Lian Zi Xin) tea — directly drains Heart Fire and treats insomnia',
      'Lily bulb and longan tea — nourishes both Heart and Kidney, calms the Shen',
      'Suan Zao Ren (sour jujube seed) and wheat berry tea — classically used for Heart-Kidney insomnia',
    ],
    cooking_methods: [
      'Gentle steaming and double-boiling to preserve Yin-nourishing properties',
      'Congee with lotus seed, lily bulb, and longan — the ideal Heart-Kidney reconnecting meal',
      'Avoid grilling and charring which add Fire energy to foods',
    ],
    meal_timing: [
      'Eat dinner early (by 6 PM) to allow full digestion before the Heart-settling sleep process',
      'Have a small Shen-calming snack before bed if needed — warm milk with honey, longan tea',
    ],
  },
};

// ─── MASTER ARRAY ───

export const PATTERN_RECOMMENDATIONS: PatternRecommendations[] = [
  liverQiStagnation,
  spleenQiDeficiency,
  kidneyYinDeficiency,
  kidneyYangDeficiency,
  heartBloodDeficiency,
  lungQiDeficiency,
  liverYangRising,
  dampHeat,
  phlegmDampness,
  bloodStasis,
  windCold,
  windHeat,
  qiBloodDeficiency,
  liverSpleenDisharmony,
  heartKidneyDisharmony,
];

// ─── LOOKUP FUNCTIONS ───

/**
 * Look up lifestyle and dietary recommendations for a single TCM pattern.
 * Matching is case-insensitive and also checks the Chinese name.
 */
export function getRecommendationsForPattern(
  pattern: string,
): PatternRecommendations | undefined {
  const normalised = pattern.trim().toLowerCase();
  return PATTERN_RECOMMENDATIONS.find(
    (rec) =>
      rec.pattern.toLowerCase() === normalised ||
      rec.pattern_chinese === pattern.trim(),
  );
}

/**
 * Merge lifestyle and dietary recommendations from multiple TCM patterns,
 * deduplicating entries.  Returns a combined set of recommendations
 * suitable for patients presenting with complex, multi-pattern diagnoses.
 */
export function getRecommendationsForPatterns(
  patterns: string[],
): { lifestyle: LifestyleRecommendations; dietary: DietaryTherapy } {
  const matched = patterns
    .map((p) => getRecommendationsForPattern(p))
    .filter((r): r is PatternRecommendations => r !== undefined);

  if (matched.length === 0) {
    return {
      lifestyle: {
        diet: [],
        exercise: [],
        sleep: [],
        emotional: [],
        seasonal: [],
        general: [],
      },
      dietary: {
        beneficial_foods: [],
        foods_to_avoid: [],
        tea_recommendations: [],
        cooking_methods: [],
        meal_timing: [],
      },
    };
  }

  if (matched.length === 1) {
    return {
      lifestyle: matched[0].lifestyle,
      dietary: matched[0].dietary,
    };
  }

  // Deduplicate string arrays by exact match
  const dedupeStrings = (arrays: string[][]): string[] => {
    const seen = new Set<string>();
    const result: string[] = [];
    for (const arr of arrays) {
      for (const item of arr) {
        if (!seen.has(item)) {
          seen.add(item);
          result.push(item);
        }
      }
    }
    return result;
  };

  // Deduplicate FoodRecommendation arrays by food name (case-insensitive)
  const dedupeFoods = (arrays: FoodRecommendation[][]): FoodRecommendation[] => {
    const seen = new Set<string>();
    const result: FoodRecommendation[] = [];
    for (const arr of arrays) {
      for (const item of arr) {
        const key = item.food.toLowerCase();
        if (!seen.has(key)) {
          seen.add(key);
          result.push(item);
        }
      }
    }
    return result;
  };

  const lifestyle: LifestyleRecommendations = {
    diet: dedupeStrings(matched.map((m) => m.lifestyle.diet)),
    exercise: dedupeStrings(matched.map((m) => m.lifestyle.exercise)),
    sleep: dedupeStrings(matched.map((m) => m.lifestyle.sleep)),
    emotional: dedupeStrings(matched.map((m) => m.lifestyle.emotional)),
    seasonal: dedupeStrings(matched.map((m) => m.lifestyle.seasonal)),
    general: dedupeStrings(matched.map((m) => m.lifestyle.general)),
  };

  const dietary: DietaryTherapy = {
    beneficial_foods: dedupeFoods(matched.map((m) => m.dietary.beneficial_foods)),
    foods_to_avoid: dedupeFoods(matched.map((m) => m.dietary.foods_to_avoid)),
    tea_recommendations: dedupeStrings(matched.map((m) => m.dietary.tea_recommendations)),
    cooking_methods: dedupeStrings(matched.map((m) => m.dietary.cooking_methods)),
    meal_timing: dedupeStrings(matched.map((m) => m.dietary.meal_timing)),
  };

  return { lifestyle, dietary };
}
