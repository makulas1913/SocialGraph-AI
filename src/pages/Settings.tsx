import React from 'react';
import { Settings as SettingsIcon, Shield, Key, User, Twitter } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '../hooks/useAuth';

export const Settings: React.FC = () => {
  const { twitterUser, login, logout } = useAuth();

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-3">
          <SettingsIcon className="text-primary w-6 h-6" />
          الإعدادات
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">إدارة حسابك وتفضيلات الذكاء الاصطناعي</p>
      </div>

      <Card className="glass border-border/50">
        <CardHeader className="bg-muted/50 border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <User className="text-primary w-5 h-5" />
            الحساب المرتبط
          </CardTitle>
          <CardDescription>إدارة حساب X (تويتر) المرتبط بالتطبيق</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/50">
            <div>
              <p className="font-medium">حساب X (تويتر)</p>
              {twitterUser ? (
                <div className="mt-1">
                  <p className="text-sm text-primary flex items-center gap-1">
                    <Shield className="w-4 h-4" />
                    متصل بنجاح (@{twitterUser})
                  </p>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mt-1">غير متصل</p>
              )}
            </div>
            {twitterUser ? (
              <Button variant="destructive" size="sm" onClick={logout}>
                إلغاء الربط
              </Button>
            ) : (
              <Button size="sm" onClick={login} className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground">
                <Twitter className="w-4 h-4" />
                ربط الحساب
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="glass border-border/50">
        <CardHeader className="bg-muted/50 border-b border-border/50">
          <CardTitle className="flex items-center gap-2">
            <Key className="text-primary w-5 h-5" />
            تفضيلات الذكاء الاصطناعي
          </CardTitle>
          <CardDescription>تخصيص الإعدادات الافتراضية لتوليد المحتوى</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6 pt-6">
          <div className="space-y-2">
            <Label>أسلوب الرد الافتراضي</Label>
            <Select defaultValue="professional" dir="rtl">
              <SelectTrigger>
                <SelectValue placeholder="اختر الأسلوب" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">احترافي</SelectItem>
                <SelectItem value="friendly">ودي</SelectItem>
                <SelectItem value="sarcastic">ساخر</SelectItem>
                <SelectItem value="concise">موجز</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>لغة التوليد الافتراضية</Label>
            <Select defaultValue="ar" dir="rtl">
              <SelectTrigger>
                <SelectValue placeholder="اختر اللغة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ar">العربية</SelectItem>
                <SelectItem value="en">الإنجليزية</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
