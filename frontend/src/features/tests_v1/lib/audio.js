export const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || '';
export const resolveAudioUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_URL}${url}`;
};

// Pre-recorded British audio for speaking questions (single combined file with timestamps)
export const speakingAudioUrlTest1 = '/static/audio/madyib68_ElevenLabs_2025-11-30T13_18_42_Daniel_pre_sp100_s50_fb048665.mp3';
export const speakingAudioUrlTest2 = '/static/audio/psaeevf4_ElevenLabs_2025-12-02T14_47_58_Daniel_pre_sp100_s50_467ee4ef.mp3';

// Additional per-question ElevenLabs audio files for Speaking Practice Test 1 and 2
export const speakingAudioTest1PerQuestion = {
  // Test 1 Part 1 – International food (Q1–4)
  1: '/static/audio/jai2ksg9_ElevenLabs_2025-12-02T15_28_04_Daniel_pre_sp100_s50_1a63f8a8.mp3',
  2: '/static/audio/b1n0vr85_ElevenLabs_2025-12-02T15_28_32_Daniel_pre_sp100_s50_1600608e.mp3',
  3: '/static/audio/3cg9faj4_test_1_Q3_af29c0fc.mp3',
  4: '/static/audio/idnsfuch_test_1_Q4_da96e007.mp3',
  5: '/static/audio/e5tz00s4_Test_1_Q5_92cb254d.mp3',
  // Test 1 Part 3 – school rules / law discussion (Q6–10)
  6: '/static/audio/kv15nw42_Test_1_Q6_4f0064ec.mp3',
  7: '/static/audio/g22m93zq_Test_1_Q7_84df7ea7.mp3',
  8: '/static/audio/jx5j5icm_test_1_q8_76286772.mp3',
  9: '/static/audio/zzmd5x0b_test_1_Q9_35d05cf8.mp3',
  10: '/static/audio/4n4t1ua0_test_1_Q10_cbbc326d.mp3',
  // Test 1 Part 3 – legal profession (Q11)
  11: '/static/audio/vcetv83l_ElevenLabs_2025-12-02T15_31_49_Daniel_pre_sp100_s50_a4daa0f7.mp3',
};

export const speakingAudioTest2PerQuestion = {
  1: '/static/audio/ahzvigmt_ElevenLabs_2025-12-02T15_07_35_Daniel_pre_sp100_s50_8e6807a6.mp3',
  2: '/static/audio/l0bu9hot_ElevenLabs_2025-12-02T15_08_00_Daniel_pre_sp100_s50_6321bd6f.mp3',
  3: '/static/audio/w6rxtg7d_ElevenLabs_2025-12-02T15_08_18_Daniel_pre_sp100_s50_e01ca98a.mp3',
  4: '/static/audio/3l2c03zk_ElevenLabs_2025-12-02T15_08_35_Daniel_pre_sp100_s50_f728e383.mp3',
  // Q5 uses the combined Test 2 audio with timings (Part 2 cue card)
  6: '/static/audio/do18iez3_ElevenLabs_2025-12-02T15_09_12_Daniel_pre_sp100_s50_cd46ee05.mp3',
  7: '/static/audio/8md1sht7_ElevenLabs_2025-12-02T15_09_28_Daniel_pre_sp100_s50_12ae62cc.mp3',
  8: '/static/audio/y2fq4ufb_ElevenLabs_2025-12-02T15_09_44_Daniel_pre_sp100_s50_fd00b33b.mp3',
  9: '/static/audio/u3sbwqu2_ElevenLabs_2025-12-02T15_10_09_Daniel_pre_sp100_s50_9c5c2618.mp3',
  10: '/static/audio/ssdocb39_ElevenLabs_2025-12-02T15_10_27_Daniel_pre_sp100_s50_59cf0933.mp3',
  11: '/static/audio/k7h279r5_ElevenLabs_2025-12-02T15_10_41_Daniel_pre_sp100_s50_ebaa3e30.mp3',
};

// Timings for pre-recorded British audio for Speaking Practice Test 1 (Q1–Q11)
export const speakingQuestionTimingsTest1 = {
  1: { start: 11, end: 16 },  // Q1: Can you find food from many different countries... (+ Why/Why not?)
  2: { start: 17, end: 22 },  // Q2: How often do you eat typical food from other countries? (+ Why/Why not?)
  3: { start: 23, end: 27 },  // Q3: Have you ever tried making food from another country? [Why/Why not?]
  4: { start: 29, end: 33 },  // Q4: What food from your country would you recommend...
  5: { start: 36, end: 54 },  // Q5: Part 2 cue card (describe a law...)
  6: { start: 71, end: 75 },  // Q6: What kinds of rules are common in a school?
  7: { start: 76, end: 78 },  // Q7: How important is it to have rules in a school?
  8: { start: 79, end: 83 },  // Q8: What do you recommend should happen if children break school rules?
  9: { start: 90, end: 92 },  // Q9: Can you suggest why many students decide to study law at university?
  10: { start: 93, end: 96 }, // Q10: What are the key personal qualities needed to be a successful lawyer?
  11: { start: 97, end: 99 }  // Q11: Do you agree that working in the legal profession is very stressful?
};

// Timings for pre-recorded British audio for Speaking Practice Test 2 (approximate per ElevenLabs file, Q1–Q11)
export const speakingQuestionTimingsTest2 = {
  1: { start: 14, end: 17 },   // Q1: Have you travelled a lot by plane? To where? Why not?
  2: { start: 18, end: 21 },   // Q2: Why do you think some people enjoy travelling by plane?
  3: { start: 22, end: 25 },   // Q3: Would you like to live near an airport? Why? Why not?
  4: { start: 26, end: 32 },   // Q4: In the future, do you think that you will travel by plane more often? Why/Why not?
  5: { start: 33, end: 54 },   // Q5: Full Part 2 cue card (describe a person...)
  6: { start: 113, end: 119 }, // Q6: What types of school prizes do children in your country receive? (+ advantages)
  7: { start: 113, end: 119 }, // Q7: What do you think are the advantages of rewarding schoolchildren for good work? (same clip)
  8: { start: 125, end: 131 }, // Q8: Do you agree that it's more important for children to receive rewards from their parents than from teachers?
  9: { start: 134, end: 146 }, // Q9: Do you think that some sportspeople (e.g., top footballers) are paid too much money? (+ same prize money)
  10: { start: 134, end: 146 },// Q10: Should everyone on a team get the same prize money when they win? (same clip)
  11: { start: 147, end: 152 } // Q11: Do you agree with the view that, in sport, taking part is more important than winning?
};
