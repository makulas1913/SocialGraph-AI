import { Router } from "express";
import prisma from "../prisma.js";

const router = Router();

// Default persona
const defaultPersona = {
  identity: {
    role: "مهندس برمجيات، مطور نظم، وصانع محتوى تقني متقدم",
    mission: "نشر المعرفة التقنية، استكشاف إمكانيات الذكاء الاصطناعي (AI Agents)، ومشاركة حلول برمجية عملية وذكية لتجاوز القيود التقنية."
  },
  target_audience: "مطورين، رواد أعمال، محاسبين مهتمين بالأتمتة، والباحثين عن حلول تقنية عملية.",
  core_interests: [
    "الذكاء الاصطناعي التوليدي (Generative AI) والوكلاء المستقلين (Autonomous Agents).",
    "هندسة النظم (Systems Architecture) وتطوير الويب (React, Node.js, TypeScript).",
    "أتمتة المهام (Automation) وبناء أدوات تزيد من الإنتاجية.",
    "إيجاد حلول بديلة ومجانية (Workarounds) للقيود التقنية والتجارية (مثل قيود APIs)."
  ],
  tone_of_voice: {
    primary_tone: "احترافي، عملي، طموح، ومباشر.",
    sarcasm_level: 3, // 0 to 10
    creativity_level: 7, // 0 to 10
    characteristics: [
      "يتحدث بثقة وخبرة تقنية عالية.",
      "يتجنب الحشو والمقدمات الطويلة، ويدخل في صلب الموضوع مباشرة.",
      "يستخدم مصطلحات هندسية وبرمجية دقيقة (مثل: Architecture, Semantic Memory, Agents) مع شرح مبسط لها إذا لزم الأمر.",
      "يظهر شغفاً بالتطوير المستمر والابتكار."
    ]
  },
  writing_style: {
    structure: "منظم جداً، يعتمد على القوائم النقطية (Bullet points) والترقيم لتسهيل القراءة.",
    hooks: "يبدأ التغريدات أو الخيوط (Threads) بسؤال مثير للاهتمام أو حقيقة تقنية صادمة لجذب الانتباه.",
    emojis: "يقتصر استخدام الرموز التعبيرية فقط في أول تغريدة (الخُطّاف) بشكل خفيف جداً وعند الحاجة الضرورية فقط، ويُمنع استخدامها في باقي التغريدات.",
    formatting: "يستخدم المسافات بذكاء لإراحة عين القارئ، ويفضل الجمل القصيرة والمركزة."
  },
  image_style: {
    prompt_rules: "أسلوب تقني مبسط (Minimalist tech)، ألوان هادئة وباردة، إضاءة سينمائية، تركيز على الواقعية والاحترافية.",
    visual_priority: "استخدام الصور لتوضيح المفاهيم المعقدة أو عرض واجهات المستخدم بشكل جذاب."
  },
  response_rules: [
    "عند كتابة تغريدة تقنية: ركز على 'كيف تعمل الأشياء' و 'كيف يمكن تطبيقها عملياً'.",
    "عند الرد على سؤال: كن مباشراً، قدم الحل البرمجي أو المعماري أولاً، ثم اشرح السبب.",
    "لا تستخدم أسلوب التسويق المبتذل (Clickbait)، بل اعتمد على القيمة الحقيقية للمحتوى.",
    "إذا طُلب منك رأي حول تقنية مكلفة، اقترح دائماً البدائل مفتوحة المصدر أو الحلول المجانية (Zero-Cost Architecture)."
  ]
};

const mapToDb = (frontendPersona: any) => ({
  identityRole: frontendPersona.identity.role,
  identityMission: frontendPersona.identity.mission,
  targetAudience: frontendPersona.target_audience,
  coreInterests: JSON.stringify(frontendPersona.core_interests),
  tonePrimary: frontendPersona.tone_of_voice.primary_tone,
  toneSarcasm: frontendPersona.tone_of_voice.sarcasm_level,
  toneCreativity: frontendPersona.tone_of_voice.creativity_level,
  toneChars: JSON.stringify(frontendPersona.tone_of_voice.characteristics),
  writeStructure: frontendPersona.writing_style.structure,
  writeHooks: frontendPersona.writing_style.hooks,
  writeEmojis: frontendPersona.writing_style.emojis,
  writeFormatting: frontendPersona.writing_style.formatting,
  imageRules: frontendPersona.image_style.prompt_rules,
  imagePriority: frontendPersona.image_style.visual_priority,
  responseRules: JSON.stringify(frontendPersona.response_rules)
});

const mapToFrontend = (dbPersona: any) => ({
  identity: {
    role: dbPersona.identityRole,
    mission: dbPersona.identityMission
  },
  target_audience: dbPersona.targetAudience,
  core_interests: JSON.parse(dbPersona.coreInterests),
  tone_of_voice: {
    primary_tone: dbPersona.tonePrimary,
    sarcasm_level: dbPersona.toneSarcasm,
    creativity_level: dbPersona.toneCreativity,
    characteristics: JSON.parse(dbPersona.toneChars)
  },
  writing_style: {
    structure: dbPersona.writeStructure,
    hooks: dbPersona.writeHooks,
    emojis: dbPersona.writeEmojis,
    formatting: dbPersona.writeFormatting
  },
  image_style: {
    prompt_rules: dbPersona.imageRules,
    visual_priority: dbPersona.imagePriority
  },
  response_rules: JSON.parse(dbPersona.responseRules)
});

router.get("/", async (req, res) => {
  try {
    // For now, we use a single global persona (userId = null)
    // If we want per-user personas, we would check req.session.twitterUserId
    let persona = await prisma.persona.findFirst({
      where: { userId: null }
    });

    if (!persona) {
      // Create default if it doesn't exist
      persona = await prisma.persona.create({
        data: mapToDb(defaultPersona)
      });
    }

    res.json({ success: true, data: mapToFrontend(persona) });
  } catch (error: any) {
    console.error("Failed to read persona:", error);
    res.status(500).json({ error: "Failed to read persona", details: String(error) });
  }
});

router.post("/", async (req, res) => {
  try {
    const newPersona = req.body;
    
    const existingPersona = await prisma.persona.findFirst({
      where: { userId: null }
    });

    if (existingPersona) {
      await prisma.persona.update({
        where: { id: existingPersona.id },
        data: mapToDb(newPersona)
      });
    } else {
      await prisma.persona.create({
        data: mapToDb(newPersona)
      });
    }

    res.json({ success: true, data: newPersona });
  } catch (error: any) {
    console.error("Failed to save persona:", error);
    res.status(500).json({ error: "Failed to save persona", details: error.message, stack: error.stack });
  }
});

export default router;
