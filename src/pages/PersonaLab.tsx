import React, { useState, useEffect } from 'react';
import { 
  Save, 
  User, 
  Brain, 
  MessageSquare, 
  PenTool, 
  ShieldAlert, 
  Loader2, 
  CheckCircle2, 
  Users, 
  Image as ImageIcon, 
  X, 
  RefreshCw, 
  Sparkles, 
  Target, 
  Lightbulb, 
  Flame,
  Plus,
  Trash2,
  Star
} from 'lucide-react';
import { motion } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { cn } from '@/lib/utils';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, collection, getDocs, addDoc, deleteDoc, writeBatch } from 'firebase/firestore';
import { generatePersonaField, generateFullPersona } from '@/services/gemini';

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

export default function PersonaLab() {
  const [personas, setPersonas] = useState<any[]>([]);
  const [selectedPersonaId, setSelectedPersonaId] = useState<string>('default');
  const [persona, setPersona] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isGenerating, setIsGenerating] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchPersonas();
  }, []);

  const handleGenerateField = async (fieldLabel: string, fieldPath: string[], isArray: boolean = false) => {
    const key = fieldPath.join('.');
    setIsGenerating(prev => ({ ...prev, [key]: true }));
    try {
      const result = await generatePersonaField(fieldLabel, persona, isArray, defaultPersona);
      if (result) {
        if (fieldPath.length === 1) {
          updateRootField(fieldPath[0], result);
        } else if (fieldPath.length === 2) {
          updateField(fieldPath[0], fieldPath[1], result);
        }
      }
    } catch (error) {
      console.error(`Failed to generate ${fieldLabel}`, error);
    } finally {
      setIsGenerating(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleGenerateFullPersona = async () => {
    if (!persona.name) return;
    setIsGenerating(prev => ({ ...prev, 'full': true }));
    try {
      const result = await generateFullPersona(persona.name);
      if (result && Object.keys(result).length > 0) {
        setPersona((prev: any) => ({
          ...prev,
          ...result
        }));
      }
    } catch (error) {
      console.error("Failed to generate full persona", error);
    } finally {
      setIsGenerating(prev => ({ ...prev, 'full': false }));
    }
  };

  const fetchPersonas = async () => {
    setIsLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'personas'));
      const fetchedPersonas: any[] = [];
      querySnapshot.forEach((doc) => {
        fetchedPersonas.push({ id: doc.id, ...doc.data() });
      });

      if (fetchedPersonas.length > 0) {
        setPersonas(fetchedPersonas);
        const defaultOrFirst = fetchedPersonas.find(p => p.isDefault) || fetchedPersonas.find(p => p.id === 'default') || fetchedPersonas[0];
        setSelectedPersonaId(defaultOrFirst.id);
        setPersona(defaultOrFirst);
      } else {
        // Create default if none exists
        const defaultData = { ...defaultPersona, name: 'الشخصية الافتراضية', isDefault: true };
        await setDoc(doc(db, 'personas', 'default'), defaultData);
        setPersonas([{ id: 'default', ...defaultData }]);
        setSelectedPersonaId('default');
        setPersona(defaultData);
      }
    } catch (error) {
      console.error("Failed to fetch personas from Firestore", error);
      // Fallback
      const fallback = { id: 'default', name: 'الشخصية الافتراضية', ...defaultPersona };
      setPersonas([fallback]);
      setSelectedPersonaId('default');
      setPersona(fallback);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePersonaChange = (id: string) => {
    setSelectedPersonaId(id);
    const selected = personas.find(p => p.id === id);
    if (selected) {
      setPersona(selected);
    }
  };

  const handleCreateNew = async () => {
    const newPersona = { ...defaultPersona, name: 'شخصية جديدة', isDefault: false };
    try {
      const docRef = await addDoc(collection(db, 'personas'), newPersona);
      const newPersonaWithId = { id: docRef.id, ...newPersona };
      setPersonas([...personas, newPersonaWithId]);
      setSelectedPersonaId(docRef.id);
      setPersona(newPersonaWithId);
    } catch (error) {
      console.error("Failed to create new persona", error);
    }
  };

  const handleSetDefault = async () => {
    if (!selectedPersonaId) return;
    try {
      const batch = writeBatch(db);
      personas.forEach(p => {
        if (p.isDefault) {
          batch.update(doc(db, 'personas', p.id), { isDefault: false });
        }
      });
      batch.update(doc(db, 'personas', selectedPersonaId), { isDefault: true });
      await batch.commit();
      
      const updatedPersonas = personas.map(p => ({ ...p, isDefault: p.id === selectedPersonaId }));
      setPersonas(updatedPersonas);
      setPersona(updatedPersonas.find(p => p.id === selectedPersonaId) || persona);
      alert('تم تعيين الشخصية كافتراضية بنجاح!');
    } catch (error) {
      console.error("Failed to set default persona", error);
      alert('فشل تعيين الشخصية كافتراضية.');
    }
  };

  const handleDelete = async () => {
    if (selectedPersonaId === 'default') return; // Prevent deleting default

    try {
      await deleteDoc(doc(db, 'personas', selectedPersonaId));
      const updatedPersonas = personas.filter(p => p.id !== selectedPersonaId);
      setPersonas(updatedPersonas);
      const fallback = updatedPersonas.find(p => p.id === 'default') || updatedPersonas[0];
      setSelectedPersonaId(fallback.id);
      setPersona(fallback);
    } catch (error) {
      console.error("Failed to delete persona", error);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const { id, ...personaData } = persona;
      const docRef = doc(db, 'personas', selectedPersonaId);
      await setDoc(docRef, personaData);
      
      setPersonas(personas.map(p => p.id === selectedPersonaId ? { ...persona, id: selectedPersonaId } : p));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      console.error("Failed to save persona to Firestore", error);
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
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!persona) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-4xl mx-auto pb-12"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Brain className="h-6 w-6 text-primary" />
            </div>
            مختبر الشخصيات
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">
            قم بتعريف هوياتك الرقمية، أسلوب كتابتك، واهتماماتك ليتمكن الوكيل الذكي من التحدث بلسانك.
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            onClick={handleSave}
            disabled={isSaving}
            size="lg"
            className="gap-2 w-full md:w-auto shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ التغييرات
          </Button>
        </div>
      </div>

      <Card className="glass border-border/50 shadow-sm overflow-hidden mb-8">
        <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
          <div className="flex-1 w-full">
            <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2 block">اختر الشخصية</Label>
            <Select value={selectedPersonaId} onValueChange={handlePersonaChange} dir="rtl">
              <SelectTrigger className="bg-muted/30 border-border/50">
                <SelectValue placeholder="اختر الشخصية" />
              </SelectTrigger>
              <SelectContent>
                {personas.map(p => (
                  <SelectItem key={p.id} value={p.id}>{p.name || 'بدون اسم'}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto mt-4 sm:mt-6">
            <Button onClick={handleCreateNew} variant="outline" className="gap-2 border-border/50 hover:bg-muted text-foreground">
              <Plus className="w-4 h-4" />
              شخصية جديدة
            </Button>
            <Button 
              onClick={handleSetDefault} 
              variant="outline" 
              className={cn("gap-2 border-border/50 hover:bg-muted text-foreground", persona.isDefault && "border-yellow-500/50 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-600")}
              disabled={persona.isDefault}
            >
              <Star className={cn("w-4 h-4", persona.isDefault ? "fill-yellow-500 text-yellow-500" : "")} />
              {persona.isDefault ? 'شخصية افتراضية' : 'تعيين كافتراضية'}
            </Button>
            {selectedPersonaId !== 'default' && (
              <AlertDialog>
                <AlertDialogTrigger render={<Button variant="destructive" size="icon" className="shrink-0" />}>
                  <Trash2 className="w-4 h-4" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>هل أنت متأكد من حذف هذه الشخصية؟</AlertDialogTitle>
                    <AlertDialogDescription>
                      هذا الإجراء لا يمكن التراجع عنه. سيتم حذف هذه الشخصية نهائياً من قاعدة البيانات.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>إلغاء</AlertDialogCancel>
                    <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">حذف</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {saveSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 p-4 bg-primary/10 text-primary rounded-xl flex items-center gap-3 border border-primary/20 text-sm font-medium"
        >
          <CheckCircle2 className="h-5 w-5" />
          تم حفظ هويتك الرقمية بنجاح! سيستخدم الوكيل هذه الإعدادات في ردوده القادمة.
        </motion.div>
      )}

      <div className="space-y-8">
        <Card className="glass border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/50 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <User className="h-5 w-5 text-primary" />
              المعلومات الأساسية
            </CardTitle>
            <CardDescription>حدد اسم الشخصية والدور والمهمة الأساسية لوكيلك الذكي.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">اسم الشخصية / الفكرة الأساسية</Label>
                <Button 
                  variant="default" 
                  size="sm" 
                  className="h-7 text-xs gap-1"
                  onClick={handleGenerateFullPersona}
                  disabled={isGenerating['full'] || !persona.name}
                >
                  {isGenerating['full'] ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                  توليد الشخصية بالكامل
                </Button>
              </div>
              <Input
                value={persona.name || ''}
                onChange={(e) => updateRootField('name', e.target.value)}
                placeholder="مثال: شخصية غامضة ومثيرة للجدل، خبير تسويق ساخر..."
                className="bg-muted/30 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">الدور (Role)</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2"
                  onClick={() => handleGenerateField('الدور (Role)', ['identity', 'role'])}
                  disabled={isGenerating['identity.role'] || !persona.name}
                >
                  {isGenerating['identity.role'] ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : <Sparkles className="w-3 h-3 ml-1" />}
                  توليد بالذكاء الاصطناعي
                </Button>
              </div>
              <Input
                value={persona.identity?.role || ''}
                onChange={(e) => updateField('identity', 'role', e.target.value)}
                placeholder="مثال: خبير تقني، كاتب محتوى، رائد أعمال..."
                className="bg-muted/30 border-border/50"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">المهمة (Mission)</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2"
                  onClick={() => handleGenerateField('المهمة (Mission)', ['identity', 'mission'])}
                  disabled={isGenerating['identity.mission'] || !persona.name}
                >
                  {isGenerating['identity.mission'] ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : <Sparkles className="w-3 h-3 ml-1" />}
                  توليد بالذكاء الاصطناعي
                </Button>
              </div>
              <Textarea
                value={persona.identity?.mission || ''}
                onChange={(e) => updateField('identity', 'mission', e.target.value)}
                rows={3}
                placeholder="ما هو الهدف الأساسي من وجودك على المنصة؟"
                className="bg-muted/30 border-border/50 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/50 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Users className="h-5 w-5 text-blue-500" />
                  الجمهور المستهدف
                </CardTitle>
                <CardDescription>من هم الأشخاص الذين تحاول الوصول إليهم؟</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10 px-3"
                onClick={() => handleGenerateField('الجمهور المستهدف', ['target_audience'])}
                disabled={isGenerating['target_audience'] || !persona.name}
              >
                {isGenerating['target_audience'] ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Sparkles className="w-4 h-4 ml-2" />}
                توليد بالذكاء الاصطناعي
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Textarea
              value={persona.target_audience || ""}
              onChange={(e) => updateRootField('target_audience', e.target.value)}
              rows={2}
              placeholder="مثال: مطورين، رواد أعمال، محاسبين مهتمين بالأتمتة..."
              className="bg-muted/30 border-border/50 resize-none"
            />
          </CardContent>
        </Card>

        <Card className="glass border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/50 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Brain className="h-5 w-5 text-purple-500" />
                  الاهتمامات الأساسية
                </CardTitle>
                <CardDescription>المواضيع التي تبرع فيها وتريد الحديث عنها باستمرار.</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10 px-3"
                onClick={() => handleGenerateField('الاهتمامات الأساسية', ['core_interests'], true)}
                disabled={isGenerating['core_interests'] || !persona.name}
              >
                {isGenerating['core_interests'] ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Sparkles className="w-4 h-4 ml-2" />}
                توليد بالذكاء الاصطناعي
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {persona.core_interests.map((interest: string, index: number) => (
                <div key={index} className="flex gap-2 group">
                  <Input
                    value={interest}
                    onChange={(e) => updateArrayField('core_interests', index, e.target.value)}
                    className="bg-muted/30 border-border/50"
                  />
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => removeArrayItem('core_interests', index)}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <Button 
              variant="outline" 
              onClick={() => addArrayItem('core_interests')}
              className="w-full border-dashed border-2 border-border/50 hover:bg-muted text-foreground"
            >
              + إضافة اهتمام جديد
            </Button>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/50 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <MessageSquare className="h-5 w-5 text-primary" />
              نبرة الصوت
            </CardTitle>
            <CardDescription>كيف يبدو صوتك للآخرين؟ هل أنت ساخر، جدي، أم ملهم؟</CardDescription>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">النبرة الأساسية</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2"
                  onClick={() => handleGenerateField('النبرة الأساسية', ['tone_of_voice', 'primary_tone'])}
                  disabled={isGenerating['tone_of_voice.primary_tone'] || !persona.name}
                >
                  {isGenerating['tone_of_voice.primary_tone'] ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : <Sparkles className="w-3 h-3 ml-1" />}
                  توليد بالذكاء الاصطناعي
                </Button>
              </div>
              <Input
                value={persona.tone_of_voice.primary_tone}
                onChange={(e) => updateField('tone_of_voice', 'primary_tone', e.target.value)}
                placeholder="مثال: تقني، ملهم، ساخر بذكاء..."
                className="bg-muted/30 border-border/50"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">مستوى السخرية</Label>
                  <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-0.5 rounded-full">{persona.tone_of_voice.sarcasm_level || 0}/10</span>
                </div>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[persona.tone_of_voice.sarcasm_level || 0]}
                  onValueChange={(val) => {
                    const v = Array.isArray(val) ? val[0] : val;
                    updateField('tone_of_voice', 'sarcasm_level', v);
                  }}
                />
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60">
                  <span>جدي جداً</span>
                  <span>ساخر جداً</span>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">مستوى الإبداع</Label>
                  <span className="text-primary font-bold text-sm bg-primary/10 px-2 py-0.5 rounded-full">{persona.tone_of_voice.creativity_level || 5}/10</span>
                </div>
                <Slider
                  min={0}
                  max={10}
                  step={1}
                  value={[persona.tone_of_voice.creativity_level || 5]}
                  onValueChange={(val) => {
                    const v = Array.isArray(val) ? val[0] : val;
                    updateField('tone_of_voice', 'creativity_level', v);
                  }}
                />
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-tighter text-muted-foreground/60">
                  <span>مباشر وواقعي</span>
                  <span>خيالي ومبتكر</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">الخصائص (Characteristics)</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2"
                  onClick={() => handleGenerateField('الخصائص (Characteristics)', ['tone_of_voice', 'characteristics'], true)}
                  disabled={isGenerating['tone_of_voice.characteristics'] || !persona.name}
                >
                  {isGenerating['tone_of_voice.characteristics'] ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : <Sparkles className="w-3 h-3 ml-1" />}
                  توليد بالذكاء الاصطناعي
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {persona.tone_of_voice.characteristics.map((char: string, index: number) => (
                  <div key={index} className="flex gap-2 group">
                    <Input
                      value={char}
                      onChange={(e) => {
                        const newChars = [...persona.tone_of_voice.characteristics];
                        newChars[index] = e.target.value;
                        updateField('tone_of_voice', 'characteristics', newChars);
                      }}
                      className="bg-muted/30 border-border/50"
                    />
                    <Button 
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        const newChars = [...persona.tone_of_voice.characteristics];
                        newChars.splice(index, 1);
                        updateField('tone_of_voice', 'characteristics', newChars);
                      }}
                      className="text-muted-foreground hover:text-destructive shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button 
                variant="outline"
                onClick={() => {
                  const newChars = [...persona.tone_of_voice.characteristics, ""];
                  updateField('tone_of_voice', 'characteristics', newChars);
                }}
                className="w-full border-dashed border-2 border-border/50 hover:bg-muted text-foreground"
              >
                + إضافة خاصية جديدة
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/50 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <PenTool className="h-5 w-5 text-orange-500" />
              أسلوب الكتابة
            </CardTitle>
            <CardDescription>كيف تقوم بهيكلة تغريداتك؟ ما هي أنواع الخطافات التي تفضلها؟</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">الهيكلة (Structure)</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2"
                  onClick={() => handleGenerateField('الهيكلة (Structure)', ['writing_style', 'structure'])}
                  disabled={isGenerating['writing_style.structure'] || !persona.name}
                >
                  {isGenerating['writing_style.structure'] ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : <Sparkles className="w-3 h-3 ml-1" />}
                  توليد
                </Button>
              </div>
              <Textarea
                value={persona.writing_style.structure}
                onChange={(e) => updateField('writing_style', 'structure', e.target.value)}
                rows={3}
                className="bg-muted/30 border-border/50 resize-none"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">الخُطّاف (Hooks)</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2"
                  onClick={() => handleGenerateField('الخُطّاف (Hooks)', ['writing_style', 'hooks'])}
                  disabled={isGenerating['writing_style.hooks'] || !persona.name}
                >
                  {isGenerating['writing_style.hooks'] ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : <Sparkles className="w-3 h-3 ml-1" />}
                  توليد
                </Button>
              </div>
              <Textarea
                value={persona.writing_style.hooks}
                onChange={(e) => updateField('writing_style', 'hooks', e.target.value)}
                rows={3}
                className="bg-muted/30 border-border/50 resize-none"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">الرموز التعبيرية (Emojis)</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2"
                  onClick={() => handleGenerateField('الرموز التعبيرية (Emojis)', ['writing_style', 'emojis'])}
                  disabled={isGenerating['writing_style.emojis'] || !persona.name}
                >
                  {isGenerating['writing_style.emojis'] ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : <Sparkles className="w-3 h-3 ml-1" />}
                  توليد
                </Button>
              </div>
              <Textarea
                value={persona.writing_style.emojis}
                onChange={(e) => updateField('writing_style', 'emojis', e.target.value)}
                rows={3}
                className="bg-muted/30 border-border/50 resize-none"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">التنسيق (Formatting)</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2"
                  onClick={() => handleGenerateField('التنسيق (Formatting)', ['writing_style', 'formatting'])}
                  disabled={isGenerating['writing_style.formatting'] || !persona.name}
                >
                  {isGenerating['writing_style.formatting'] ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : <Sparkles className="w-3 h-3 ml-1" />}
                  توليد
                </Button>
              </div>
              <Textarea
                value={persona.writing_style.formatting}
                onChange={(e) => updateField('writing_style', 'formatting', e.target.value)}
                rows={3}
                className="bg-muted/30 border-border/50 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/50 border-b border-border/50">
            <CardTitle className="flex items-center gap-2 text-lg">
              <ImageIcon className="h-5 w-5 text-indigo-500" />
              ستايل الصور
            </CardTitle>
            <CardDescription>توجيهات للذكاء الاصطناعي عند توليد الصور المرافقة للمحتوى.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">قواعد التوليد (Prompt Rules)</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2"
                  onClick={() => handleGenerateField('قواعد التوليد للصور (Prompt Rules)', ['image_style', 'prompt_rules'])}
                  disabled={isGenerating['image_style.prompt_rules'] || !persona.name}
                >
                  {isGenerating['image_style.prompt_rules'] ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : <Sparkles className="w-3 h-3 ml-1" />}
                  توليد
                </Button>
              </div>
              <Textarea
                value={persona.image_style?.prompt_rules || ""}
                onChange={(e) => updateField('image_style', 'prompt_rules', e.target.value)}
                rows={2}
                placeholder="مثال: أسلوب تقني مبسط، ألوان هادئة، إضاءة سينمائية..."
                className="bg-muted/30 border-border/50 resize-none"
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">أولوية الصورة (Visual Priority)</Label>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10 px-2"
                  onClick={() => handleGenerateField('أولوية الصورة (Visual Priority)', ['image_style', 'visual_priority'])}
                  disabled={isGenerating['image_style.visual_priority'] || !persona.name}
                >
                  {isGenerating['image_style.visual_priority'] ? <Loader2 className="w-3 h-3 animate-spin ml-1" /> : <Sparkles className="w-3 h-3 ml-1" />}
                  توليد
                </Button>
              </div>
              <Textarea
                value={persona.image_style?.visual_priority || ""}
                onChange={(e) => updateField('image_style', 'visual_priority', e.target.value)}
                rows={2}
                placeholder="متى تكون الصورة أهم من النص؟"
                className="bg-muted/30 border-border/50 resize-none"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="glass border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/50 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ShieldAlert className="h-5 w-5 text-red-500" />
                  قواعد الردود
                </CardTitle>
                <CardDescription>قواعد صارمة يجب على الوكيل اتباعها عند الرد على الآخرين.</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 text-xs text-primary hover:text-primary hover:bg-primary/10 px-3"
                onClick={() => handleGenerateField('قواعد الردود (Response Rules)', ['response_rules'], true)}
                disabled={isGenerating['response_rules'] || !persona.name}
              >
                {isGenerating['response_rules'] ? <Loader2 className="w-4 h-4 animate-spin ml-2" /> : <Sparkles className="w-4 h-4 ml-2" />}
                توليد بالذكاء الاصطناعي
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            {persona.response_rules.map((rule: string, index: number) => (
              <div key={index} className="flex gap-3 group">
                <Textarea
                  value={rule}
                  onChange={(e) => updateArrayField('response_rules', index, e.target.value)}
                  rows={2}
                  className="bg-muted/30 border-border/50 resize-none"
                />
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => removeArrayItem('response_rules', index)}
                  className="text-muted-foreground hover:text-destructive shrink-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button 
              variant="outline"
              onClick={() => addArrayItem('response_rules')}
              className="w-full border-dashed border-2 border-border/50 hover:bg-muted text-foreground"
            >
              + إضافة قاعدة جديدة
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
