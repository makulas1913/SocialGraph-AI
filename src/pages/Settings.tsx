import React from 'react';
import { Settings as SettingsIcon, Shield, Key, User } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-3">
          <SettingsIcon className="text-blue-500 w-6 h-6 md:w-8 md:h-8" />
          الإعدادات
        </h1>
        <p className="text-slate-500 mt-2 text-sm md:text-base">إدارة حسابك وتفضيلات الذكاء الاصطناعي</p>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <User className="text-slate-400" size={20} />
          الحساب المرتبط
        </h2>
        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div>
            <p className="font-medium text-slate-900">حساب X (تويتر)</p>
            <p className="text-sm text-green-600 mt-1 flex items-center gap-1">
              <Shield size={14} />
              متصل بنجاح
            </p>
          </div>
          <button className="px-4 py-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg text-sm font-medium transition-colors">
            إلغاء الربط
          </button>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
          <Key className="text-slate-400" size={20} />
          تفضيلات الذكاء الاصطناعي
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">أسلوب الرد الافتراضي</label>
            <select className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
              <option>احترافي</option>
              <option>ودي</option>
              <option>ساخر</option>
              <option>موجز</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">لغة التوليد الافتراضية</label>
            <select className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none">
              <option>العربية</option>
              <option>الإنجليزية</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
