import React from 'react';
import { 
  Activity, 
  Users, 
  MessageCircle, 
  Zap, 
  LayoutDashboard, 
  Calendar, 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  TrendingUp, 
  MessageSquare 
} from 'lucide-react';
import { motion, Variants } from 'motion/react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export const Dashboard: React.FC = () => {
  const stats = [
    { title: 'التغريدات المنشورة', value: '12', icon: MessageCircle, trend: 'up', change: '+2' },
    { title: 'الردود الذكية', value: '45', icon: Zap, trend: 'up', change: '+15' },
    { title: 'المتابعين الجدد', value: '120', icon: Users, trend: 'up', change: '+12%' },
    { title: 'التفاعل العام', value: '8.4%', icon: Activity, trend: 'down', change: '-0.5%' },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 }
    }
  };

  return (
    <motion.div 
      className="pb-12"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <LayoutDashboard className="text-primary w-6 h-6" />
            </div>
            لوحة التحكم
          </h1>
          <p className="text-muted-foreground text-sm max-w-2xl">نظرة عامة على أداء حساباتك وتفاعل الجمهور مع المحتوى الخاص بك.</p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="rounded-xl gap-2 h-10 border-border/50 hover:bg-muted text-foreground">
            <Calendar className="w-4 h-4" />
            آخر 30 يوم
          </Button>
          <Button className="rounded-xl gap-2 h-10 shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 text-white">
            <Plus className="w-4 h-4" />
            منشور جديد
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-10">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            variants={itemVariants}
          >
            <Card className="glass border-border/50 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-12 -mt-12 transition-transform group-hover:scale-110" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="p-2 bg-muted/50 rounded-lg group-hover:bg-primary/10 transition-colors">
                  <stat.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent className="relative">
                <div className="text-3xl font-bold tracking-tighter">{stat.value}</div>
                <div className="flex items-center gap-2 mt-2">
                  <div className={cn(
                    "flex items-center text-xs font-bold px-1.5 py-0.5 rounded-md",
                    stat.trend === 'up' ? "text-primary bg-primary/10" : "text-rose-600 bg-rose-500/10"
                  )}>
                    {stat.trend === 'up' ? <ArrowUpRight className="h-3 w-3 ml-1" /> : <ArrowDownRight className="h-3 w-3 ml-1" />}
                    {stat.change}
                  </div>
                  <p className="text-xs text-muted-foreground">مقارنة بالشهر الماضي</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-7">
        <Card className="glass lg:col-span-4 border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/50 border-b border-border/50">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-bold">تحليل التفاعل</CardTitle>
                <CardDescription>معدل التفاعل اليومي خلال الفترة المختارة</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-xs font-medium">التفاعل</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[350px] w-full bg-muted/30 rounded-xl flex items-center justify-center border border-dashed border-border/50">
              <div className="text-center space-y-2">
                <TrendingUp className="w-10 h-10 text-muted-foreground/30 mx-auto" />
                <p className="text-sm text-muted-foreground">سيتم عرض الرسم البياني هنا</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass lg:col-span-3 border-border/50 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/50 border-b border-border/50">
            <CardTitle className="text-lg font-bold">أفضل المنشورات</CardTitle>
            <CardDescription>المحتوى الأكثر تفاعلاً هذا الأسبوع</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-4 p-3 rounded-xl hover:bg-muted transition-colors border border-transparent hover:border-border/50 group">
                <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-lg font-bold text-muted-foreground shrink-0 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                  #{i}
                </div>
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-medium leading-tight line-clamp-2">
                    {i === 1 ? "كيف تستخدم الذكاء الاصطناعي في تحسين إنتاجيتك اليومية؟ دليل شامل للمبتدئين..." : 
                     i === 2 ? "لماذا يعتبر المحتوى المرئي هو الملك في عام 2024؟ حقائق وأرقام مذهلة." :
                     "أهم 5 أدوات يحتاجها كل صانع محتوى في رحلته نحو الاحتراف."}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {i * 120} تفاعل
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" />
                      {i * 15} تعليق
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="ghost" className="w-full text-primary hover:bg-primary/10 rounded-xl">
              عرض جميع المنشورات
              <ArrowUpRight className="w-4 h-4 mr-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
};

