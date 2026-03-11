import React from 'react';
import { Activity, Users, MessageCircle, Zap } from 'lucide-react';
import { motion, Variants } from 'framer-motion';

export const Dashboard: React.FC = () => {
  const stats = [
    { label: 'التغريدات المنشورة', value: '12', icon: <MessageCircle size={24} className="text-emerald-500" /> },
    { label: 'الردود الذكية', value: '45', icon: <Zap size={24} className="text-emerald-500" /> },
    { label: 'المتابعين الجدد', value: '+120', icon: <Users size={24} className="text-emerald-500" /> },
    { label: 'التفاعل العام', value: '8.4%', icon: <Activity size={24} className="text-emerald-500" /> },
  ];

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
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
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white">نظرة عامة</h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm md:text-base">إحصائيات ونشاط حسابك على منصة X</p>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900/50 flex items-center gap-4 hover:shadow-md transition-shadow"
          >
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        variants={itemVariants}
        className="bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-emerald-100 dark:border-emerald-900/50"
      >
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">النشاط الأخير</h2>
        <div className="text-center py-12 text-slate-400 dark:text-slate-500">
          <Activity size={48} className="mx-auto mb-4 opacity-20" />
          <p>لا يوجد نشاط حديث حتى الآن. ابدأ بإنشاء محتوى جديد!</p>
        </div>
      </motion.div>
    </motion.div>
  );
};
