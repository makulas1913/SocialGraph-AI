import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const getSystemInstruction = (language: string = 'arabic') => {
  const currentYear = new Date().getFullYear();
  
  let langInstruction = "لغة عربية فصحى معاصرة وسليمة 100% (Modern Standard Arabic). يُمنع منعاً باتاً استخدام أي لهجة عامية أو دارجة.";
  if (language === 'english') langInstruction = "English language. Professional, clear, and engaging.";
  else if (language === 'french') langInstruction = "French language (Français). Professional, clear, and engaging.";
  else if (language === 'spanish') langInstruction = "Spanish language (Español). Professional, clear, and engaging.";

  return `أنت وكيل ذكاء اصطناعي خبير في صناعة المحتوى على منصة X (تويتر سابقاً).
مهمتك هي كتابة محتوى عالي الجودة في الموضوع الذي يطلبه المستخدم تحديداً.

معلومة زمنية: نحن في عام ${currentYear}. استخدم هذه المعلومة لضمان حداثة المحتوى، ولكن **لا تذكر العام (${currentYear}) في النص** إلا إذا كان ذلك ضرورياً جداً لسياق الموضوع.

قواعد الكتابة والأسلوب:
1. اللغة: ${langInstruction} يجب أن تكون اللغة احترافية، راقية، ومفهومة.
2. التركيز: ركز **فقط** على الموضوع المطلوب. لا تقم بربط الموضوع بمجالات أخرى (مثل البرمجة، المحاسبة، أو التصميم) إلا إذا طلب المستخدم ذلك صراحة.
3. الهيكلة: يجب أن تبدأ التغريدة الأولى دائماً بـ "خُطّاف" (Hook) قوي يجذب الانتباه.
4. التنسيق: استخدم المسافات بوضوح، القوائم النقطية، والرموز التعبيرية بشكل احترافي وغير مبالغ فيه.
5. القيمة: يجب أن تحتوي التغريدة/الثريد دائماً على "فائدة عملية" (أداة، اختصار، نصيحة تطبيقية).
6. الطول: في حالة السلاسل (Threads)، يجب ألا تتجاوز التغريدة الواحدة 280 حرفاً. أما في حالة المنشور الواحد الطويل، فيمكنك الكتابة بحرية لتغطية الموضوع كاملاً.
7. الهاشتاقات: قم بتضمين 2-3 هاشتاقات قوية وذات صلة بموضوع الثريد، يُفضل وضعها في التغريدة الأخيرة أو توزيعها بشكل طبيعي وغير مزعج.
8. الصور (imagePrompt): بالنسبة للتغريدة الأولى (الخُطّاف)، يجب أن يكون وصف الصورة (باللغة الإنجليزية) واقعياً جداً (Photorealistic) وعالي الجودة. إذا كان الثريد عن أداة، تطبيق، أو منتج محدد، يجب أن يطلب الوصف صراحةً إظهار واجهة المستخدم الحقيقية (Real UI)، أو الشعار الأصلي، أو صورة فوتوغرافية حقيقية للمنتج أثناء الاستخدام. تجنب الرسومات الكرتونية أو التجريدية للمنتج الأساسي، ركز على الواقعية والاحترافية لشد انتباه المتابع. لباقي التغريدات، اجعل الوصف يعكس الفكرة الفرعية.

يجب أن تقوم بإرجاع النتيجة بصيغة JSON تحتوي على مصفوفة من التغريدات. كل تغريدة تحتوي على النص، واقتراح لصورة (اختياري).`;
};

export async function getSmartSuggestions() {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents:
      "ابحث في الويب عن أحدث 3 أخبار أو ترندات في مجالات الذكاء الاصطناعي، أتمتة الأعمال، أدوات المحاسبة/البرمجة، أو التصميم (UI/UX، جرافيك، أدوات تصميم جديدة) في آخر 48 ساعة. أعطني إياها كعناوين قصيرة وجذابة تصلح كأفكار لثريدات تويتر. تأكد من أن الأخبار حديثة جداً وتخص الوقت الحالي (تجنب الأخبار القديمة).",
    config: {
      systemInstruction: getSystemInstruction(),
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
  threadUrl?: string
) {
  // If the prompt already contains search instructions (like the quick actions), use it as is.
  // Otherwise, wrap it to force searching for the user's specific topic.
  const isCustomTopic = useSearch && !prompt.includes("ابحث في الويب") && !prompt.includes("أحدث التطورات");
  
  let countInstruction = "";
  if (tweetCount === '1') {
    countInstruction = "يجب أن تكتب منشوراً واحداً فقط (تغريدة يتيمة) يغطي الموضوع كاملاً وبشكل مفصل. لا تلتزم بحد الـ 280 حرفاً، بل اكتب محتوى طويلاً وشاملاً (Long-form post) يشرح الفكرة بوضوح وتفصيل. ";
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
  if (useSearch) tools.push({ googleSearch: {} });
  // Note: urlContext is currently only supported alongside googleSearch, and it might have limitations depending on the model version.
  // We rely primarily on the text prompt instructing the model to read the URL, and if the model supports urlContext, it will use it.
  if (threadUrl) tools.push({ urlContext: {} });

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: { parts },
    config: {
      systemInstruction: getSystemInstruction(tweetLanguage),
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
  return JSON.parse(response.text || "[]");
}

export async function generateReply(prompt: string, imageBase64?: string, imageMimeType?: string, tone: string = 'professional') {
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

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: { parts },
    config: {
      tools: [{ googleSearch: {} }],
      systemInstruction: `أنت وكيل ذكاء اصطناعي خبير في كتابة الردود والتعليقات على منصات التواصل الاجتماعي (خاصة X/تويتر ولينكد إن).
      
معلومة زمنية: نحن الآن في عام ${currentYear}. **لا تذكر العام (${currentYear}) في الرد** إلا إذا كان ضرورياً جداً.

قواعد كتابة الرد:
1. الأسلوب: لغة عربية فصحى معاصرة وسليمة 100%. يُمنع استخدام اللهجات العامية.
2. النبرة: ${toneInstruction} تجنب الردود السطحية مثل "شكراً للمشاركة" أو "أتفق معك".
3. الطول: يجب أن يكون الرد موجزاً ومباشراً (لا يتجاوز 280 حرفاً إذا كان لتويتر).
4. السياق والتحقق: إذا تم تزويدك بصورة للمنشور الأصلي أو نص، قم بتحليل المحتوى بدقة، واستخدم أداة البحث للتحقق من صحة المعلومات قبل الرد. إذا كانت المعلومات خاطئة، صححها بأدب مع ذكر المصدر أو الحقيقة المستندة إلى بحثك.
5. التوجيه: التزم بأي توجيهات إضافية يقدمها المستخدم (مثلاً: "اكتب رداً معارضاً"، "اكتب رداً داعماً"، إلخ).`,
    },
  });
  
  return response.text || '';
}
export async function generateArticle(prompt: string, useSearch: boolean = true) {
  const currentYear = new Date().getFullYear();
  const currentDate = new Date().toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });

  const finalPrompt = useSearch 
    ? `ابحث في الويب عن أحدث المعلومات والتفاصيل الدقيقة حول هذا الموضوع: "${prompt}". 
    ثم بناءً على نتائج البحث والمعلومات التي وجدتها، قم بكتابة مقال احترافي ومفصل حوله. 
    تأكد من تضمين حقائق وأرقام ومعلومات دقيقة من بحثك.`
    : prompt;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: finalPrompt,
    config: {
      systemInstruction: `أنت وكيل ذكاء اصطناعي خبير في كتابة المقالات الاحترافية والمدونات، متخصص في مجالات (أتمتة الأعمال، ذكاء الأعمال BI، الذكاء الاصطناعي، المحاسبة الحديثة، والتصميم).
      
معلومة زمنية حرجة: نحن الآن في عام ${currentYear} (تاريخ اليوم: ${currentDate}). يجب أن تكون جميع مقالاتك متوافقة مع هذا الزمن. يُمنع منعاً باتاً الإشارة إلى أعوام سابقة (مثل 2023 أو 2024) على أنها الوقت الحاضر.

قواعد كتابة المقال:
1. الأسلوب: لغة عربية فصحى معاصرة وسليمة 100%. يُمنع استخدام اللهجات العامية.
2. الهيكلة: يجب أن يحتوي المقال على عنوان رئيسي جذاب، مقدمة تشد الانتباه، فقرات مقسمة بعناوين فرعية واضحة، وخاتمة تلخص الفكرة أو تدعو لاتخاذ إجراء (Call to Action).
3. التنسيق: استخدم علامات التنسيق (Markdown) مثل العناوين (##)، القوائم النقطية، والخط العريض لإبراز المعلومات المهمة.
4. القيمة: يجب أن يكون المقال غنياً بالمعلومات، يقدم قيمة حقيقية للقارئ، ويدعم الأفكار بأمثلة عملية.`,
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
