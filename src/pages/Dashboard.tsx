import React from 'react';
import { Activity, Users, MessageCircle, Zap } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const stats = [
    { label: 'التغريدات المنشورة', value: '12', icon: <MessageCircle size={24} className="text-blue-500" /> },
    { label: 'الردود الذكية', value: '45', icon: <Zap size={24} className="text-yellow-500" /> },
    { label: 'المتابعين الجدد', value: '+120', icon: <Users size={24} className="text-green-500" /> },
    { label: 'التفاعل العام', value: '8.4%', icon: <Activity size={24} className="text-purple-500" /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">نظرة عامة</h1>
        <p className="text-slate-500 mt-2">إحصائيات ونشاط حسابك على منصة X</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
            <div className="p-4 bg-slate-50 rounded-xl">
              {stat.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-4">النشاط الأخير</h2>
        <div className="text-center py-12 text-slate-400">
          <Activity size={48} className="mx-auto mb-4 opacity-20" />
          <p>لا يوجد نشاط حديث حتى الآن. ابدأ بإنشاء محتوى جديد!</p>
        </div>
      </div>
    </div>
  );
};
