import React, { useState, useEffect } from 'react';
import { Save, User, Brain, MessageSquare, PenTool, ShieldAlert, Loader2, CheckCircle2, Users, Image as ImageIcon, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';

export default function PersonaLab() {
  const [persona, setPersona] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchPersona();
  }, []);

  const fetchPersona = async () => {
    try {
      const res = await fetch('/api/persona');
      const data = await res.json();
      if (data.success) {
        setPersona(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch persona", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch('/api/persona', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(persona)
      });
      const data = await res.json();
      if (data.success) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error("Failed to save persona", error);
    } finally {
      setIsSaving(false);
    }
  };

  const updateRootField = (field: string, value: any) => {
    setPersona((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const updateField = (section: string, field: string, value: string | string[] | number) => {
    setPersona((prev: any) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const updateArrayField = (section: string, index: number, value: string) => {
    setPersona((prev: any) => {
      const newArray = [...prev[section]];
      newArray[index] = value;
      return { ...prev, [section]: newArray };
    });
  };

  const addArrayItem = (section: string) => {
    setPersona((prev: any) => ({
      ...prev,
      [section]: [...prev[section], ""]
    }));
  };

  const removeArrayItem = (section: string, index: number) => {
    setPersona((prev: any) => {
      const newArray = [...prev[section]];
      newArray.splice(index, 1);
      return { ...prev, [section]: newArray };
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  if (!persona) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-12 font-cairo"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
            <Brain className="h-6 w-6 md:h-8 md:w-8 text-emerald-600" />
            مختبر الشخصية (Persona Lab)
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base">
            قم بتعريف هويتك الرقمية، أسلوب كتابتك، واهتماماتك ليتمكن الوكيل الذكي من التحدث بلسانك.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="flex items-center justify-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-colors disabled:opacity-50 w-full md:w-auto shadow-sm"
        >
          {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
          حفظ التغييرات
        </button>
      </div>

      {saveSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 rounded-xl flex items-center gap-3 border border-emerald-200 dark:border-emerald-800/50"
        >
          <CheckCircle2 className="h-5 w-5" />
          تم حفظ هويتك الرقمية بنجاح! سيستخدم الوكيل هذه الإعدادات في ردوده القادمة.
        </motion.div>
      )}

      <div className="space-y-8">
        {/* Identity Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-emerald-100 dark:border-emerald-900/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="h-5 w-5 text-emerald-500" />
            الهوية الأساسية (Identity)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">الدور (Role)</label>
              <input
                type="text"
                value={persona.identity.role}
                onChange={(e) => updateField('identity', 'role', e.target.value)}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">المهمة (Mission)</label>
              <textarea
                value={persona.identity.mission}
                onChange={(e) => updateField('identity', 'mission', e.target.value)}
                rows={3}
                className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:text-white"
              />
            </div>
          </div>
        </section>

        {/* Target Audience */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-blue-100 dark:border-blue-900/50">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-500" />
            الجمهور المستهدف (Target Audience)
          </h2>
          <div>
            <textarea
              value={persona.target_audience || ""}
              onChange={(e) => updateRootField('target_audience', e.target.value)}
              rows={2}
              placeholder="مثال: مطورين، رواد أعمال، محاسبين مهتمين بالأتمتة..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
            />
          </div>
        </section>

        {/* Core Interests */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            الاهتمامات الأساسية (Core Interests)
          </h2>
          <div className="space-y-3">
            {persona.core_interests.map((interest: string, index: number) => (
              <div key={index} className="flex gap-2">
                <input
                  type="text"
                  value={interest}
                  onChange={(e) => updateArrayField('core_interests', index, e.target.value)}
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <button 
                  onClick={() => removeArrayItem('core_interests', index)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  حذف
                </button>
              </div>
            ))}
            <button 
              onClick={() => addArrayItem('core_interests')}
              className="text-purple-600 text-sm font-medium hover:underline"
            >
              + إضافة اهتمام جديد
            </button>
          </div>
        </section>

        {/* Tone of Voice */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-emerald-500" />
            نبرة الصوت (Tone of Voice)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">النبرة الأساسية</label>
              <input
                type="text"
                value={persona.tone_of_voice.primary_tone}
                onChange={(e) => updateField('tone_of_voice', 'primary_tone', e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                  <span>مستوى السخرية (Sarcasm Level)</span>
                  <span className="text-emerald-600 font-bold">{persona.tone_of_voice.sarcasm_level || 0}/10</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={persona.tone_of_voice.sarcasm_level || 0}
                  onChange={(e) => updateField('tone_of_voice', 'sarcasm_level', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>جدي جداً</span>
                  <span>ساخر جداً</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center justify-between">
                  <span>مستوى الإبداع (Creativity Level)</span>
                  <span className="text-emerald-600 font-bold">{persona.tone_of_voice.creativity_level || 5}/10</span>
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={persona.tone_of_voice.creativity_level || 5}
                  onChange={(e) => updateField('tone_of_voice', 'creativity_level', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>مباشر وواقعي</span>
                  <span>خيالي ومبتكر</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">الخصائص (Characteristics)</label>
              <div className="space-y-3">
                {persona.tone_of_voice.characteristics.map((char: string, index: number) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={char}
                      onChange={(e) => {
                        const newChars = [...persona.tone_of_voice.characteristics];
                        newChars[index] = e.target.value;
                        updateField('tone_of_voice', 'characteristics', newChars);
                      }}
                      className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    />
                    <button 
                      onClick={() => {
                        const newChars = [...persona.tone_of_voice.characteristics];
                        newChars.splice(index, 1);
                        updateField('tone_of_voice', 'characteristics', newChars);
                      }}
                      className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    >
                      حذف
                    </button>
                  </div>
                ))}
                <button 
                  onClick={() => {
                    const newChars = [...persona.tone_of_voice.characteristics, ""];
                    updateField('tone_of_voice', 'characteristics', newChars);
                  }}
                  className="text-emerald-600 text-sm font-medium hover:underline"
                >
                  + إضافة خاصية جديدة
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Writing Style */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <PenTool className="h-5 w-5 text-orange-500" />
            أسلوب الكتابة (Writing Style)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الهيكلة (Structure)</label>
              <textarea
                value={persona.writing_style.structure}
                onChange={(e) => updateField('writing_style', 'structure', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الخُطّاف (Hooks)</label>
              <textarea
                value={persona.writing_style.hooks}
                onChange={(e) => updateField('writing_style', 'hooks', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">الرموز التعبيرية (Emojis)</label>
              <textarea
                value={persona.writing_style.emojis}
                onChange={(e) => updateField('writing_style', 'emojis', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">التنسيق (Formatting)</label>
              <textarea
                value={persona.writing_style.formatting}
                onChange={(e) => updateField('writing_style', 'formatting', e.target.value)}
                rows={3}
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Image Style */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-indigo-500" />
            ستايل الصور (Image Style)
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">قواعد التوليد (Prompt Rules)</label>
              <textarea
                value={persona.image_style?.prompt_rules || ""}
                onChange={(e) => updateField('image_style', 'prompt_rules', e.target.value)}
                rows={2}
                placeholder="مثال: أسلوب تقني مبسط، ألوان هادئة، إضاءة سينمائية..."
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">أولوية الصورة (Visual Priority)</label>
              <textarea
                value={persona.image_style?.visual_priority || ""}
                onChange={(e) => updateField('image_style', 'visual_priority', e.target.value)}
                rows={2}
                placeholder="متى تكون الصورة أهم من النص؟"
                className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
          </div>
        </section>

        {/* Response Rules */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-red-500" />
            قواعد الردود (Response Rules)
          </h2>
          <div className="space-y-3">
            {persona.response_rules.map((rule: string, index: number) => (
              <div key={index} className="flex gap-2">
                <textarea
                  value={rule}
                  onChange={(e) => updateArrayField('response_rules', index, e.target.value)}
                  rows={2}
                  className="flex-1 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
                <button 
                  onClick={() => removeArrayItem('response_rules', index)}
                  className="p-3 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                >
                  حذف
                </button>
              </div>
            ))}
            <button 
              onClick={() => addArrayItem('response_rules')}
              className="text-red-600 text-sm font-medium hover:underline"
            >
              + إضافة قاعدة جديدة
            </button>
          </div>
        </section>
      </div>
    </motion.div>
  );
}
