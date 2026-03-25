import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "dummy-key-to-prevent-crash" });

async function fetchPersona(personaId: string = 'default') {
  try {
    const { db } = await import('@/lib/firebase');
    const { doc, getDoc } = await import('firebase/firestore');
    const docRef = doc(db, 'personas', personaId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data();
    }
  } catch (e) {
    console.error("Failed to fetch persona from Firestore", e);
  }
  return null;
}

const getSystemInstruction = async (language: string = 'arabic', forcePersonaInterests: boolean = false, personaId: string = 'default') => {
  const currentYear = new Date().getFullYear();
  const persona = await fetchPersona(personaId);
  
  let langInstruction = "لغة عربية فصحى معاصرة وسليمة 100% (Modern Standard Arabic). يُمنع منعاً باتاً استخدام أي لهجة عامية أو دارجة.";
  if (language === 'english') langInstruction = "English language. Professional, clear, and engaging.";
  else if (language === 'french') langInstruction = "French language (Français). Professional, clear, and engaging.";
  else if (language === 'spanish') langInstruction = "Spanish language (Español). Professional, clear, and engaging.";

  let personaInstruction = "";
  if (persona) {
    const interestsLine = forcePersonaInterests ? `\n- الاهتمامات: ${persona.core_interests.join("، ")}` : "";
    const targetAudienceLine = persona.target_audience ? `\n- الجمهور المستهدف: ${persona.target_audience}` : "";
    const sarcasmLevel = persona.tone_of_voice.sarcasm_level !== undefined ? `\n- مستوى السخرية: ${persona.tone_of_voice.sarcasm_level}/10` : "";
    const creativityLevel = persona.tone_of_voice.creativity_level !== undefined ? `\n- مستوى الإبداع: ${persona.tone_of_voice.creativity_level}/10` : "";
    
    personaInstruction = `
---
معلومات الهوية الرقمية (Persona):
أنت الآن تلعب دور المستخدم الموصوف في هذه الوثيقة. يجب أن تتبنى أسلوبه، وقواعد كتابته بالكامل:
- الدور: ${persona.identity.role}
- المهمة: ${persona.identity.mission}${interestsLine}${targetAudienceLine}
- النبرة الأساسية: ${persona.tone_of_voice.primary_tone}${sarcasmLevel}${creativityLevel}
- خصائص النبرة: ${persona.tone_of_voice.characteristics.join("، ")}
- هيكلة الكتابة: ${persona.writing_style.structure}
- أسلوب الخُطّاف: ${persona.writing_style.hooks}
- استخدام الرموز التعبيرية: ${persona.writing_style.emojis}
- التنسيق: ${persona.writing_style.formatting}
- قواعد الردود: ${persona.response_rules.join("، ")}
---
`;
  }

  const focusRule = forcePersonaInterests 
    ? `2. التركيز: اربط الموضوع المطلوب بمجالات اهتمامك الأساسية المذكورة في الهوية الرقمية بشكل ذكي وإبداعي.`
    : `2. التركيز: ركز **فقط** على الموضوع المطلوب. لا تقم بربط الموضوع بمجالات أخرى أو اهتماماتك إلا إذا طلب المستخدم ذلك صراحة. يجب أن تكون التغريدة على حسب الطلب فقط وبدون إقحام مجالات أخرى.`;

  const imageStyleRule = persona?.image_style?.prompt_rules 
    ? `\n9. الصور (imagePrompt): يجب أن يتبع وصف الصورة هذا الأسلوب: "${persona.image_style.prompt_rules}". ${persona.image_style.visual_priority ? `ملاحظة إضافية للصور: ${persona.image_style.visual_priority}.` : ""} اجعل الوصف باللغة الإنجليزية ودقيقاً جداً.`
    : `\n9. الصور (imagePrompt): بالنسبة للتغريدة الأولى (الخُطّاف)، يجب أن يكون وصف الصورة (باللغة الإنجليزية) دقيقاً جداً ومخصصاً لإظهار **المنتج أو الأداة أو الموضوع الأساسي بشكل بارز وواضح جداً في مقدمة الصورة (Foreground)**. إذا كان الثريد عن أداة أو منتج محدد، يجب أن يطلب الوصف صراحةً إظهار المنتج الفعلي (مثلاً: "A highly detailed, photorealistic close-up of [Product Name] prominently displayed in the center, clear branding, professional studio lighting"). تجنب الرسومات الكرتونية أو التجريدية للمنتج الأساسي، ركز على الواقعية والاحترافية لشد انتباه المتابع وإبراز المنتج. لباقي التغريدات، اجعل الوصف يعكس الفكرة الفرعية.`;

  const temperature = persona?.tone_of_voice?.creativity_level !== undefined 
    ? (persona.tone_of_voice.creativity_level / 10) 
    : 1;

  return {
    instruction: `أنت وكيل ذكاء اصطناعي خبير في صناعة المحتوى على منصة X (تويتر سابقاً).
مهمتك هي كتابة محتوى عالي الجودة في الموضوع الذي يطلبه المستخدم تحديداً.
${personaInstruction}
معلومة زمنية: نحن في عام ${currentYear}. استخدم هذه المعلومة لضمان حداثة المحتوى، ولكن **لا تذكر العام (${currentYear}) في النص** إلا إذا كان ذلك ضرورياً جداً لسياق الموضوع.

قواعد الكتابة والأسلوب (حاسمة):
1. اللغة: ${langInstruction}
${focusRule}
3. الهيكلة: التزم تماماً بهيكلة الكتابة المحددة في الهوية الرقمية. إذا لم تكن محددة، ابدأ مباشرة بمعلومة صادمة أو قصة تجربة حقيقية.
4. التنسيق: التزم تماماً بالتنسيق المحدد في الهوية الرقمية.
5. الكلمات الممنوعة (الروبوتية): يُمنع منعاً باتاً استخدام الكلمات النمطية للذكاء الاصطناعي مثل: "في هذا الثريد سنستكشف"، "علاوة على ذلك"، "في الآونة الأخيرة"، "جوهري"، "تحول جذري".
6. الطول (حرج جداً): في حالة السلاسل (Threads)، يُمنع منعاً باتاً أن تتجاوز التغريدة الواحدة 250 حرفاً (لتوفير مساحة للترقيم مثل 1/5). كن مختصراً وركز على الزبدة.
7. الهاشتاقات: قم بتضمين 2-3 هاشتاقات قوية وذات صلة بموضوع الثريد، يُفضل وضعها في التغريدة الأخيرة أو توزيعها بشكل طبيعي وغير مزعج.
8. الروابط والمصادر: يُمنع منعاً باتاً وضع أي روابط (Links) داخل نص التغريدات.${imageStyleRule}

يجب أن تقوم بإرجاع النتيجة بصيغة JSON تحتوي على مصفوفة من التغريدات. كل تغريدة تحتوي على النص، واقتراح لصورة (اختياري).`,
    temperature
  };
};

export async function getSmartSuggestions(personaId: string = 'default') {
  const persona = await fetchPersona(personaId);
  const interestsArray = persona?.core_interests && persona.core_interests.length > 0 
    ? persona.core_interests 
    : ["الذكاء الاصطناعي", "أتمتة الأعمال", "التقنية"];
  const interests = interestsArray.join("، ");
  const count = interestsArray.length;
  
  const name = persona?.name || "صانع محتوى";
  const role = persona?.identity?.role || "خبير";
  const mission = persona?.identity?.mission || "نشر المعرفة";
  const audience = persona?.target_audience || "المهتمين";
  
  const today = new Date();
  const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
  const currentDateStr = today.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  const lastWeekStr = lastWeek.toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
  
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents:
      `نحن الآن في تاريخ: ${currentDateStr}.
نطاق البحث المسموح به: من ${lastWeekStr} إلى ${currentDateStr} فقط.

الشخصية التي سأكتب لها المحتوى:
- الاسم/الفكرة: ${name}
- الدور: ${role}
- المهمة: ${mission}
- الجمهور المستهدف: ${audience}
- الاهتمامات: ${interests}

استخدم بحث جوجل للبحث عن أحدث التطورات والأخبار التي حدثت خلال الأسبوع الماضي فقط (بين ${lastWeekStr} و ${currentDateStr}) والتي تهم هذه الشخصية وجمهورها وتحديداً في دورها (${role}).
يجب أن تكون النتائج حديثة جداً ولا تتجاوز الأسبوع الماضي بأي حال من الأحوال. يُمنع إعطاء اقتراحات لأحداث قديمة.

أريد بالضبط ${count} اقتراحات لأفكار محتوى، بحيث يغطي كل اقتراح اهتماماً واحداً من اهتمامات الشخصية:
${interestsArray.map((interest: string, index: number) => `${index + 1}. اقتراح يخص: ${interest} (يجب أن يكون خبراً أو أداة أو موضوعاً رائجاً هذا الأسبوع)`).join('\n')}

أعطني النتائج كعناوين قصيرة جداً (أقل من 10 كلمات لكل عنوان)، احترافية وجذابة، ومصاغة بطريقة تناسب هذه الشخصية.
تحذير هام: لا تكتب تغريدات أو ثريدات. لا تستخدم أسلوب التغريدات. اكتب فقط عناوين رئيسية قصيرة جداً تصلح كأفكار خام للمحتوى.`,
    config: {
      systemInstruction: `أنت مساعد ذكي متخصص في اقتراح أفكار محتوى مخصصة لشخصيات محددة. يجب أن تعيد مصفوفة (Array) من النصوص (Strings) تحتوي على ${count} عناوين قصيرة جداً فقط. يُمنع كتابة التغريدات أو النصوص الطويلة. تأكد أن الاقتراحات حديثة جداً (صدرت بين ${lastWeekStr} و ${currentDateStr}) وتتوافق تماماً مع دور ومهمة واهتمامات الشخصية المحددة.`,
      temperature: 0.7,
      tools: [{ googleSearch: {} }],
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.STRING,
        },
      },
    },
  });
  return JSON.parse(response.text || "[]");
}

export async function generateThread(
  prompt: string,
  useSearch: boolean = false,
  tweetCount: string = 'auto',
  tweetStyle: string = 'auto',
  tweetLanguage: string = 'arabic',
  imageBase64?: string,
  imageMimeType?: string,
  threadUrl?: string,
  isQuickAction: boolean = false,
  personaId: string = 'default'
) {
  // If the prompt already contains search instructions (like the quick actions), use it as is.
  // Otherwise, wrap it to force searching for the user's specific topic.
  const isCustomTopic = useSearch && !prompt.includes("ابحث في الويب") && !prompt.includes("أحدث التطورات");
  
  let countInstruction = "";
  if (tweetCount === '1') {
    countInstruction = "يجب أن تكتب منشوراً واحداً فقط (تغريدة يتيمة). وازن طول التغريدة بحيث لا تكون قصيرة جداً ولا طويلة جداً بشكل مبالغ فيه، بل اجعل طولها مناسباً تماماً لتغطية الموضوع المطلوب أو حسب ما يطلبه المستخدم في النص. ";
  } else if (tweetCount !== 'auto') {
    countInstruction = `يجب أن يتكون الثريد من ${tweetCount} تغريدات بالضبط. يجب ألا تتجاوز كل تغريدة 280 حرفاً. `;
  }

  let styleInstruction = "";
  switch (tweetStyle) {
    case 'formal': styleInstruction = "الأسلوب المطلوب: رسمي، احترافي، ومباشر. "; break;
    case 'sarcastic': styleInstruction = "الأسلوب المطلوب: ساخر، متهكم، ويستخدم السخرية الذكية لإيصال الفكرة. "; break;
    case 'surreal': styleInstruction = "الأسلوب المطلوب: سيريالي، غريب الأطوار، يستخدم تشبيهات غير متوقعة وخيالية. "; break;
    case 'comedic': styleInstruction = "الأسلوب المطلوب: كوميدي، مضحك، خفيف الظل، ويستخدم النكتة والمفارقات. "; break;
    case 'storytelling': styleInstruction = "الأسلوب المطلوب: قصصي، يسرد المعلومات على شكل قصة مشوقة وحكاية. "; break;
    case 'educational': styleInstruction = "الأسلوب المطلوب: تعليمي مبسط، يشرح المفاهيم المعقدة كأنها لطفل. "; break;
    case 'philosophical': styleInstruction = "الأسلوب المطلوب: فلسفي، عميق، يتأمل في أبعاد الموضوع وتأثيره. "; break;
  }

  const finalPrompt = isCustomTopic 
    ? `ابحث في الويب عن أحدث المعلومات والتفاصيل الدقيقة حول هذا الموضوع: "${prompt}". 
    ثم بناءً على نتائج البحث والمعلومات التي وجدتها، قم بكتابة المحتوى المطلوب. 
    ${countInstruction}${styleInstruction}تأكد من تضمين حقائق وأرقام ومعلومات دقيقة من بحثك.`
    : `${countInstruction}${styleInstruction}${prompt}`;

  const parts: any[] = [{ text: finalPrompt }];
  
  if (threadUrl) {
    parts.push({ text: `\n\nالرجاء قراءة المحتوى من هذا الرابط بعناية واستخدامه كمصدر أساسي لبناء الثريد أو التغريدة: ${threadUrl}` });
  }

  if (imageBase64 && imageMimeType) {
    parts.unshift({
      inlineData: {
        data: imageBase64.split(',')[1] || imageBase64,
        mimeType: imageMimeType,
      }
    });
  }

  const tools: any[] = [];
  if (useSearch || threadUrl) {
    tools.push({ googleSearch: {} });
  }
  if (threadUrl) {
    tools.push({ urlContext: {} });
  }

  const systemConfig = await getSystemInstruction(tweetLanguage, isQuickAction, personaId);

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      systemInstruction: systemConfig.instruction,
      temperature: systemConfig.temperature,
      tools: tools.length > 0 ? tools : undefined,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            text: {
              type: Type.STRING,
              description: "نص التغريدة أو المنشور الطويل",
            },
            imagePrompt: {
              type: Type.STRING,
              description:
                "وصف دقيق باللغة الإنجليزية لصورة مرافقة للتغريدة. للتغريدة الأولى: يجب أن يصف صورة فوتوغرافية واقعية جداً (Photorealistic) تعرض المنتج/الأداة الحقيقية أو واجهة المستخدم الخاصة بها بوضوح شديد لجذب الانتباه. (اختياري لباقي التغريدات)",
            },
          },
          required: ["text"],
        },
      },
    },
  });
  
  const parsedResponse = JSON.parse(response.text || "[]");
  
  return parsedResponse;
}

export async function generateReply(prompt: string, imageBase64?: string, imageMimeType?: string, tone: string = 'professional', personaId: string = 'default') {
  const parts: any[] = [
    { text: `قم بتحليل المنشور (سواء كان نصاً أو صورة)، ثم ابحث في الويب للتحقق من صحة المعلومات المذكورة فيه. بناءً على نتائج البحث والتوجيهات التالية، اكتب الرد: ${prompt}` }
  ];
  
  if (imageBase64 && imageMimeType) {
    parts.unshift({
      inlineData: {
        data: imageBase64.split(',')[1] || imageBase64,
        mimeType: imageMimeType,
      }
    });
  }

  const currentYear = new Date().getFullYear();

  let toneInstruction = "احترافية، ذكية، وتضيف قيمة للنقاش.";
  if (tone === 'friendly') {
    toneInstruction = "ودية، إيجابية، ومرحبة، مع الحفاظ على الاحترام.";
  } else if (tone === 'analytical') {
    toneInstruction = "تحليلية، موضوعية، وتعتمد على الأرقام والحقائق والمنطق.";
  } else if (tone === 'quote') {
    toneInstruction = "على شكل تعليق أو اقتباس (Quote Tweet) ذكي ومختصر، يضيف رأياً مثيراً للاهتمام أو قيمة إضافية على المحتوى الأصلي.";
  }

  const persona = await fetchPersona(personaId);
  let personaInstruction = "";
  if (persona) {
    personaInstruction = `
---
معلومات الهوية الرقمية (Persona):
أنت الآن تلعب دور المستخدم الموصوف في هذه الوثيقة. يجب أن تتبنى أسلوبه، وقواعد كتابته بالكامل:
- الدور: ${persona.identity.role}
- المهمة: ${persona.identity.mission}
- النبرة الأساسية: ${persona.tone_of_voice.primary_tone}
- خصائص النبرة: ${persona.tone_of_voice.characteristics.join("، ")}
- قواعد الردود: ${persona.response_rules.join("، ")}
---
`;
  }

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `أنت وكيل ذكاء اصطناعي خبير في كتابة الردود والتعليقات على منصات التواصل الاجتماعي (خاصة X/تويتر ولينكد إن).
${personaInstruction}
معلومة زمنية: نحن الآن في عام ${currentYear}. **لا تذكر العام (${currentYear}) في الرد** إلا إذا كان ضرورياً جداً.

قواعد كتابة الرد (حاسمة):
1. الأسلوب: لغة عربية فصحى معاصرة وسليمة 100%. يُمنع استخدام اللهجات العامية.
2. النبرة: ${toneInstruction} تجنب الردود السطحية مثل "شكراً للمشاركة" أو "أتفق معك".
3. التركيز: ركز **فقط** على الموضوع المطلوب. لا تقم بربط الموضوع بمجالات أخرى أو اهتماماتك إلا إذا طلب المستخدم ذلك صراحة. يجب أن يكون الرد على حسب الطلب فقط.
4. الهيكلة: التزم تماماً بهيكلة الكتابة المحددة في الهوية الرقمية. إذا لم تكن محددة، ابدأ مباشرة بمعلومة صادمة أو قصة تجربة حقيقية.
5. التنسيق: التزم تماماً بالتنسيق المحدد في الهوية الرقمية.
6. الكلمات الممنوعة (الروبوتية): يُمنع منعاً باتاً استخدام الكلمات النمطية للذكاء الاصطناعي مثل: "في هذا الثريد سنستكشف"، "علاوة على ذلك"، "في الآونة الأخيرة"، "جوهري"، "تحول جذري".
7. الطول: يجب أن يكون الرد موجزاً ومباشراً (لا يتجاوز 280 حرفاً إذا كان لتويتر).
8. السياق والتحقق: إذا تم تزويدك بصورة للمنشور الأصلي أو نص، قم بتحليل المحتوى بدقة، واستخدم أداة البحث للتحقق من صحة المعلومات قبل الرد. إذا كانت المعلومات خاطئة، صححها بأدب مع ذكر المصدر أو الحقيقة المستندة إلى بحثك.
9. التوجيه: التزم بأي توجيهات إضافية يقدمها المستخدم (مثلاً: "اكتب رداً معارضاً"، "اكتب رداً داعماً"، إلخ).`,
    },
  });
  
  return response.text || '';
}
export async function generateArticle(prompt: string, useSearch: boolean = true, personaId: string = 'default') {
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  const finalPrompt = useSearch 
    ? `ابحث في الويب عن أحدث المعلومات والتفاصيل الدقيقة حول هذا الموضوع: "${prompt}". 
    ثم بناءً على نتائج البحث والمعلومات التي وجدتها، قم بكتابة مقال احترافي ومفصل حوله. 
    تأكد من تضمين حقائق وأرقام ومعلومات دقيقة من بحثك.`
    : prompt;

  const persona = await fetchPersona(personaId);
  let personaInstruction = "";
  if (persona) {
    personaInstruction = `
---
معلومات الهوية الرقمية (Persona):
أنت الآن تلعب دور المستخدم الموصوف في هذه الوثيقة. يجب أن تتبنى أسلوبه، وقواعد كتابته بالكامل:
- الدور: ${persona.identity.role}
- المهمة: ${persona.identity.mission}
- النبرة الأساسية: ${persona.tone_of_voice.primary_tone}
- خصائص النبرة: ${persona.tone_of_voice.characteristics.join("، ")}
- هيكلة الكتابة: ${persona.writing_style.structure}
- أسلوب الخُطّاف: ${persona.writing_style.hooks}
- استخدام الرموز التعبيرية: ${persona.writing_style.emojis}
- التنسيق: ${persona.writing_style.formatting}
- قواعد الردود: ${persona.response_rules.join("، ")}
---
`;
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: finalPrompt,
    config: {
      systemInstruction: `أنت وكيل ذكاء اصطناعي خبير في كتابة المقالات الاحترافية والمدونات.
${personaInstruction}
معلومة زمنية حرجة: نحن الآن في عام ${currentYear} (تاريخ اليوم: ${currentDate}). يجب أن تكون جميع مقالاتك متوافقة مع هذا الزمن. يُمنع منعاً باتاً الإشارة إلى أعوام سابقة (مثل 2023 أو 2024) على أنها الوقت الحاضر.

قواعد كتابة المقال (حاسمة):
1. الأسلوب: لغة عربية فصحى معاصرة وسليمة 100%. يُمنع استخدام اللهجات العامية.
2. التركيز: ركز **فقط** على الموضوع المطلوب. لا تقم بربط الموضوع بمجالات أخرى أو اهتماماتك إلا إذا طلب المستخدم ذلك صراحة. يجب أن يكون المقال على حسب الطلب فقط.
3. الهيكلة: التزم تماماً بهيكلة الكتابة المحددة في الهوية الرقمية. إذا لم تكن محددة، ابدأ مباشرة بمعلومة صادمة أو قصة تجربة حقيقية. يجب أن يحتوي المقال على عنوان رئيسي جذاب، مقدمة تشد الانتباه، فقرات مقسمة بعناوين فرعية واضحة، وخاتمة تلخص الفكرة أو تدعو لاتخاذ إجراء (Call to Action).
4. التنسيق: التزم تماماً بالتنسيق المحدد في الهوية الرقمية. استخدم علامات التنسيق (Markdown) مثل العناوين (##)، القوائم النقطية، والخط العريض لإبراز المعلومات المهمة.
5. الكلمات الممنوعة (الروبوتية): يُمنع منعاً باتاً استخدام الكلمات النمطية للذكاء الاصطناعي مثل: "في هذا الثريد سنستكشف"، "علاوة على ذلك"، "في الآونة الأخيرة"، "جوهري"، "تحول جذري".
6. القيمة: يجب أن يكون المقال غنياً بالمعلومات، يقدم قيمة حقيقية للقارئ، ويدعم الأفكار بأمثلة عملية.`,
      tools: useSearch ? [{ googleSearch: {} }] : undefined,
    },
  });
  
  return response.text || '';
}

export async function generateImage(prompt: string) {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-image",
    contents: prompt,
    config: {
      imageConfig: {
        aspectRatio: "16:9",
      },
    },
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
  }
  return null;
}

export async function generatePersonaField(fieldToGenerate: string, currentPersonaData: any, isArray: boolean = false, defaultPersonaData?: any) {
  const buildLine = (label: string, value: any, defaultValue: any) => {
    if (!value) return '';
    if (defaultPersonaData) {
      if (Array.isArray(value) && Array.isArray(defaultValue)) {
        if (value.join(',') === defaultValue.join(',')) return '';
      } else if (value === defaultValue) {
        return '';
      }
    }
    const displayValue = Array.isArray(value) ? value.join('، ') : value;
    return `- ${label}: ${displayValue}\n`;
  };

  const prompt = `
أنت خبير في بناء الهويات الرقمية (Personas) للذكاء الاصطناعي وصناع المحتوى.

المدخلات الحالية للشخصية (ملاحظة هامة جداً: "اسم الشخصية / الفكرة الأساسية" هو المحور الأساسي الذي يجب أن تبني عليه):
- اسم الشخصية / الفكرة الأساسية: ${currentPersonaData.name || 'غير محدد'}
${buildLine('الدور الحالي', currentPersonaData.identity?.role, defaultPersonaData?.identity?.role)}
${buildLine('المهمة الحالية', currentPersonaData.identity?.mission, defaultPersonaData?.identity?.mission)}
${buildLine('الجمهور المستهدف', currentPersonaData.target_audience, defaultPersonaData?.target_audience)}
${buildLine('الاهتمامات الأساسية', currentPersonaData.core_interests, defaultPersonaData?.core_interests)}
${buildLine('النبرة الأساسية', currentPersonaData.tone_of_voice?.primary_tone, defaultPersonaData?.tone_of_voice?.primary_tone)}
${buildLine('خصائص النبرة', currentPersonaData.tone_of_voice?.characteristics, defaultPersonaData?.tone_of_voice?.characteristics)}
${buildLine('الهيكلة', currentPersonaData.writing_style?.structure, defaultPersonaData?.writing_style?.structure)}
${buildLine('الخُطّاف', currentPersonaData.writing_style?.hooks, defaultPersonaData?.writing_style?.hooks)}
${buildLine('الرموز التعبيرية', currentPersonaData.writing_style?.emojis, defaultPersonaData?.writing_style?.emojis)}
${buildLine('التنسيق', currentPersonaData.writing_style?.formatting, defaultPersonaData?.writing_style?.formatting)}
${buildLine('قواعد التوليد للصور', currentPersonaData.image_style?.prompt_rules, defaultPersonaData?.image_style?.prompt_rules)}
${buildLine('أولوية الصورة', currentPersonaData.image_style?.visual_priority, defaultPersonaData?.image_style?.visual_priority)}
${buildLine('قواعد الردود', currentPersonaData.response_rules, defaultPersonaData?.response_rules)}

المطلوب:
قم بتوليد قيمة إبداعية واحترافية للحقل التالي فقط: "${fieldToGenerate}"

توجيهات حاسمة:
1. اجعل "اسم الشخصية / الفكرة الأساسية" هو الموجه الأول والأهم لك. 
2. تجاهل أي سياق تقني أو برمجي ما لم تكن الفكرة الأساسية تدل على ذلك.
3. يجب أن تكون القيمة المولدة مناسبة تماماً لطبيعة الحقل المطلوب ("${fieldToGenerate}").
${isArray ? '4. يجب أن ترجع النتيجة على شكل مصفوفة JSON (Array of strings) فقط، تحتوي على 3 إلى 5 عناصر، بدون أي نص إضافي.' : '4. أرجع النص المولد فقط بدون أي مقدمات أو شروحات أو علامات تنصيص.'}
`;

  const config: any = {
    temperature: 0.7,
  };

  if (isArray) {
    config.responseMimeType = "application/json";
    config.responseSchema = {
      type: Type.ARRAY,
      items: { type: Type.STRING }
    };
  }

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config
  });
  
  if (isArray) {
    try {
      return JSON.parse(response.text || "[]");
    } catch (e) {
      return [];
    }
  }
  return response.text?.trim() || "";
}

export async function generateFullPersona(personaIdea: string) {
  const prompt = `
أنت خبير في بناء الهويات الرقمية (Personas) للذكاء الاصطناعي وصناع المحتوى.
المطلوب منك بناء شخصية كاملة ومفصلة بناءً على الفكرة أو الوصف التالي:
"${personaIdea}"

يجب أن تكون جميع الحقول متوافقة 100% مع هذه الفكرة (سواء كانت سياسية، كوميدية، تقنية، رياضية، الخ).
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      temperature: 0.8,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          identity: {
            type: Type.OBJECT,
            properties: {
              role: { type: Type.STRING },
              mission: { type: Type.STRING }
            }
          },
          target_audience: { type: Type.STRING },
          core_interests: { type: Type.ARRAY, items: { type: Type.STRING } },
          tone_of_voice: {
            type: Type.OBJECT,
            properties: {
              primary_tone: { type: Type.STRING },
              sarcasm_level: { type: Type.NUMBER },
              creativity_level: { type: Type.NUMBER },
              characteristics: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          },
          writing_style: {
            type: Type.OBJECT,
            properties: {
              structure: { type: Type.STRING },
              hooks: { type: Type.STRING },
              emojis: { type: Type.STRING },
              formatting: { type: Type.STRING }
            }
          },
          image_style: {
            type: Type.OBJECT,
            properties: {
              prompt_rules: { type: Type.STRING },
              visual_priority: { type: Type.STRING }
            }
          },
          response_rules: { type: Type.ARRAY, items: { type: Type.STRING } }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text || "{}");
  } catch (e) {
    return {};
  }
}
