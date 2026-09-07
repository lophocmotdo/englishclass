import React, { useState, useEffect, useCallback } from 'react';
import { Video, ExternalLink, Save, Trash2, Check, Globe, Lock, Unlock } from 'lucide-react';
import { Session } from './types';
import { generateSchedule } from './data';
import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db } from './lib/firebase';

const dict = {
  en: {
    title: "Teaching & Lesson Schedule",
    monthText: "Month",
    scheduleDesc: "Schedule: Mon & Wed (20:00 - 21:00) • 8 sessions/month",
    internalWarning: "Note: This page is for internal use only, please do not share externally.",
    designedBy: "Designed by Mr Kiệt (Zalo: 0979033830)",
    yearLabel: "Year:",
    monthLabel: "Month:",
    defaultMeet: "Default Meet Link:",
    applyAll: "Apply to all",
    noData: "No data for this month.",
    sessionLabel: "Session",
    done: "Completed",
    joinMeet: "Join Meet",
    meetLink: "Google Meet Link",
    topic: "Lesson Topic",
    topicPlaceholder: "Ex: Grammar Unit 1...",
    docLink1: "Link 1 (English)",
    docLink2: "Link 2 (Vietnamese)",
    docPlaceholder: "Google Drive, PDF Link...",
    save: "Save",
    clear: "Clear",
    openLink: "Open link",
    mon: "Monday",
    wed: "Wednesday",
    copyright: "Copyright @2026 - TIẾNG ANH THẦY KIỆT",
    enterPassword: "Enter password to edit:",
    wrongPassword: "Wrong password! Changes not saved.",
    authRequired: "Password Required",
    unlock: "Unlock Editing",
    locked: "Locked",
    unlocked: "Editing Enabled",
    cancel: "Cancel",
    confirm: "Confirm"
  },
  vi: {
    title: "Quản Lý Lịch Dạy & Bài Giảng",
    monthText: "Tháng",
    scheduleDesc: "Lịch học: Thứ 2 & Thứ 4 (20:00 - 21:00) • 8 buổi/tháng",
    internalWarning: "Chú ý: Trang này dành cho nội bộ, vui lòng không share ra bên ngoài.",
    designedBy: "Designed by Mr Kiệt (Zalo: 0979033830)",
    yearLabel: "Năm:",
    monthLabel: "Tháng:",
    defaultMeet: "Link Meet mặc định:",
    applyAll: "Áp dụng cho tất cả",
    noData: "Không có dữ liệu cho tháng này.",
    sessionLabel: "Buổi",
    done: "Đã học",
    joinMeet: "Vào Meet",
    meetLink: "Link Google Meet",
    topic: "Chủ đề bài học (Topic)",
    topicPlaceholder: "VD: Grammar Unit 1...",
    docLink1: "Link 1 (English)",
    docLink2: "Link 2 (Vietnamese)",
    docPlaceholder: "Link Google Drive, PDF...",
    save: "Lưu",
    clear: "Xóa",
    openLink: "Mở link",
    mon: "Thứ Hai",
    wed: "Thứ Tư",
    copyright: "Bản quyền @2026 - TIẾNG ANH THẦY KIỆT",
    enterPassword: "Nhập mật khẩu để thay đổi:",
    wrongPassword: "Sai mật khẩu! Không thể lưu thay đổi.",
    authRequired: "Yêu Cầu Mật Khẩu",
    unlock: "Mở Khóa Chỉnh Sửa",
    locked: "Đã Khóa",
    unlocked: "Đã Mở Khóa",
    cancel: "Hủy",
    confirm: "Xác Nhận"
  }
};

const SessionField = ({
  label,
  value,
  placeholder,
  isLink,
  onSave,
  t,
  requireAuth
}: {
  label: string;
  value: string;
  placeholder: string;
  isLink?: boolean;
  onSave: (val: string) => void;
  t: typeof dict.en;
  requireAuth: (action: () => void) => void;
}) => {
  const [localVal, setLocalVal] = useState(value);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  const handleSave = () => {
    requireAuth(() => {
      onSave(localVal);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    });
  };

  const handleClear = () => {
    requireAuth(() => {
      setLocalVal('');
      onSave('');
    });
  };

  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">{label}:</label>
      <div className="flex gap-1.5">
        <input 
          type={isLink ? "url" : "text"} 
          value={localVal} 
          placeholder={placeholder} 
          onChange={(e) => {
            setLocalVal(e.target.value);
            setSaved(false);
          }}
          className="flex-1 text-xs px-2.5 py-1.5 border border-slate-200 rounded-md focus:border-blue-500 outline-none min-w-0"
        />
        {isLink && value && (
          <a 
            href={value} 
            target="_blank" 
            rel="noopener noreferrer" 
            title={t.openLink} 
            className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded text-xs flex items-center justify-center transition shrink-0"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
        <button 
          onClick={handleSave}
          title={t.save}
          className={`px-2 py-1.5 rounded text-xs flex items-center justify-center transition shrink-0 ${
            saved ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 hover:bg-blue-200 text-blue-700'
          }`}
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
        </button>
        <button 
          onClick={handleClear}
          title={t.clear}
          className="px-2 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs flex items-center justify-center transition shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export default function App() {
  const [lang, setLang] = useState<'en' | 'vi'>('en');
  const t = dict[lang];

  const [selectedYear, setSelectedYear] = useState<string>('2026');
  const [selectedMonth, setSelectedMonth] = useState<string>('09');
  const [sessions, setSessions] = useState<Session[]>([]);
  const [defaultMeetLink, setDefaultMeetLink] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  const requireAuth = (action: () => void) => {
    if (isAuthenticated) {
      action();
    } else {
      setPendingAction(() => action);
      setShowAuthModal(true);
      setPasswordInput('');
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === '0979033830') {
      setIsAuthenticated(true);
      setShowAuthModal(false);
      if (pendingAction) {
        pendingAction();
        setPendingAction(null);
      }
    } else {
      alert(t.wrongPassword);
      setPasswordInput('');
    }
  };

  const handleCancelAuth = () => {
    setShowAuthModal(false);
    setPendingAction(null);
    setPasswordInput('');
  };

  // Load data when month changes
  useEffect(() => {
    setLoading(true);
    const docRef = doc(db, 'schedules', `${selectedYear}-${selectedMonth}`);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        let loadedSessions = docSnap.data().sessions || [];
        
        // Auto-fix for Sept 2026 if it started on 02/09 instead of 07/09
        if (selectedYear === '2026' && selectedMonth === '09' && loadedSessions.length > 0 && loadedSessions[0].date === '02/09') {
          loadedSessions = generateSchedule(2026, 9);
          setDoc(docRef, { sessions: loadedSessions }, { merge: true });
        }
        
        setSessions(loadedSessions);
        setLoading(false);
      } else {
        // Document doesn't exist, generate default and save it
        const defaultData = generateSchedule(parseInt(selectedYear, 10), parseInt(selectedMonth, 10));
        setDoc(docRef, { sessions: defaultData }).then(() => {
          // The onSnapshot will fire again after setDoc
        });
      }
    });

    return () => unsubscribe();
  }, [selectedYear, selectedMonth]);

  // Save data whenever sessions change
  const saveSessions = useCallback((newSessions: Session[]) => {
    const docRef = doc(db, 'schedules', `${selectedYear}-${selectedMonth}`);
    setDoc(docRef, { sessions: newSessions }, { merge: true });
  }, [selectedYear, selectedMonth]);

  const updateField = (index: number, field: keyof Session, value: string | boolean) => {
    const newSessions = [...sessions];
    newSessions[index] = { ...newSessions[index], [field]: value };
    saveSessions(newSessions);
  };

  const toggleDone = (index: number) => {
    requireAuth(() => {
      const newSessions = [...sessions];
      newSessions[index] = { ...newSessions[index], done: !newSessions[index].done };
      saveSessions(newSessions);
    });
  };

  const applyDefaultMeet = () => {
    requireAuth(() => {
      const link = defaultMeetLink.trim();
      if (!link) return;
      const newSessions = sessions.map(session => ({ ...session, meetLink: link }));
      saveSessions(newSessions);
    });
  };

  const displayDay = (dayStr: string) => {
    if (dayStr === "Thứ Hai" || dayStr === "Monday") return t.mon;
    if (dayStr === "Thứ Tư" || dayStr === "Wednesday") return t.wed;
    return dayStr;
  };

  return (
    <div className="bg-slate-100 text-slate-800 min-h-screen py-8 px-4 sm:px-6">
      {showAuthModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-slate-900 mb-2 flex items-center gap-2">
              <Lock className="w-5 h-5 text-red-500" />
              {t.authRequired}
            </h3>
            <p className="text-sm text-slate-600 mb-4">{t.enterPassword}</p>
            <form onSubmit={handleAuthSubmit}>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
                className="w-full border border-slate-300 rounded-lg px-4 py-2 mb-4 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Password..."
              />
              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={handleCancelAuth}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 font-medium text-sm rounded-lg transition"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm rounded-lg transition"
                >
                  {t.confirm}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <div>
            {isAuthenticated ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-200">
                <Unlock className="w-3.5 h-3.5" />
                {t.unlocked}
              </span>
            ) : (
              <button
                onClick={() => requireAuth(() => {})}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-bold rounded-lg border border-red-200 transition"
              >
                <Lock className="w-3.5 h-3.5" />
                {t.locked} - {t.unlock}
              </button>
            )}
          </div>
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm items-center gap-1">
            <Globe className="w-4 h-4 text-slate-400 ml-2 mr-1" />
            <button
              onClick={() => setLang('en')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${lang === 'en' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('vi')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition ${lang === 'vi' ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              VI
            </button>
          </div>
        </div>

        <header className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                {t.title} <span className="text-blue-600 font-semibold">- {t.monthText} {selectedMonth}/{selectedYear}</span>
              </h1>
              <p className="text-sm text-slate-500 mt-1">{t.scheduleDesc}</p>
              <p className="text-sm font-semibold text-red-600 mt-1">{t.internalWarning}</p>
              <p className="text-sm font-medium text-blue-600 mt-1">{t.designedBy}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-slate-600">{t.yearLabel}</span>
              <select 
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>

              <span className="text-sm font-semibold text-slate-600 ml-2">{t.monthLabel}</span>
              <select 
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-1.5 text-sm font-medium bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
                  const mStr = m.toString().padStart(2, '0');
                  return (
                    <option key={mStr} value={mStr}>{t.monthText} {mStr}</option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3 items-center">
            <label className="text-sm font-medium text-slate-700 whitespace-nowrap flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-600" /> {t.defaultMeet}
            </label>
            <input 
              type="url" 
              value={defaultMeetLink}
              onChange={(e) => setDefaultMeetLink(e.target.value)}
              placeholder="https://meet.google.com/xxx-xxxx-xxx" 
              className="flex-1 w-full border border-slate-300 rounded-lg px-3 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <button 
              onClick={applyDefaultMeet}
              className="w-full sm:w-auto px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition cursor-pointer"
            >
              {t.applyAll}
            </button>
          </div>
        </header>

        <main className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
              Đang tải dữ liệu... / Loading...
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-8 text-slate-500 bg-white rounded-xl border border-slate-200 shadow-sm">
              {t.noData}
            </div>
          ) : (
            sessions.map((session, index) => (
              <div 
                key={session.id} 
                className={`p-5 rounded-xl border transition shadow-sm ${
                  session.done ? "bg-slate-50 border-emerald-200" : "bg-white border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-1 text-xs font-bold rounded-md ${
                      session.done ? "bg-emerald-100 text-emerald-700" : "bg-blue-100 text-blue-700"
                    }`}>
                      {t.sessionLabel} {session.id}
                    </span>
                    <span className="font-semibold text-slate-800">{displayDay(session.day)}, {session.date}</span>
                    <span className="text-sm text-slate-500 font-medium">({session.time})</span>
                  </div>
                  
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <label className="flex items-center gap-1.5 text-xs font-medium cursor-pointer select-none">
                      <input 
                        type="checkbox" 
                        checked={session.done} 
                        onChange={() => toggleDone(index)} 
                        className="rounded text-blue-600 focus:ring-blue-500 h-4 w-4 cursor-pointer" 
                      />
                      {t.done}
                    </label>
                    {session.meetLink && (
                      <a 
                        href={session.meetLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-3 py-1 rounded inline-flex items-center gap-1.5 transition"
                      >
                        <Video className="w-3.5 h-3.5" /> {t.joinMeet}
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
                  <SessionField
                    label={t.meetLink}
                    value={session.meetLink || ""}
                    placeholder="https://meet.google.com/..."
                    isLink={true}
                    onSave={(val) => updateField(index, 'meetLink', val)}
                    t={t}
                    requireAuth={requireAuth}
                  />
                  <SessionField
                    label={t.topic}
                    value={session.topic || ""}
                    placeholder={t.topicPlaceholder}
                    isLink={false}
                    onSave={(val) => updateField(index, 'topic', val)}
                    t={t}
                    requireAuth={requireAuth}
                  />
                  <div className="flex flex-col gap-3">
                    <SessionField
                      label={t.docLink1}
                      value={session.docLink || ""}
                      placeholder={t.docPlaceholder}
                      isLink={true}
                      onSave={(val) => updateField(index, 'docLink', val)}
                      t={t}
                      requireAuth={requireAuth}
                    />
                    <SessionField
                      label={t.docLink2}
                      value={session.docLink2 || ""}
                      placeholder={t.docPlaceholder}
                      isLink={true}
                      onSave={(val) => updateField(index, 'docLink2', val)}
                      t={t}
                      requireAuth={requireAuth}
                    />
                  </div>
                </div>
              </div>
            ))
          )}
        </main>

        <footer className="mt-8 pb-4 text-center">
          <p className="text-sm font-bold text-blue-600">{t.copyright}</p>
        </footer>
      </div>
    </div>
  );
}
