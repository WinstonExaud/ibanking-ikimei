import { useState } from 'react';
import CreateClientModal from '../../components/ui/CreateClientModal';
import CreateAccountModal from '../../components/ui/CreateAccountModal';
import { UserPlus, Building2, Shield, Bell, ChevronRight } from 'lucide-react';

const Section = ({ title, children }) => (
  <div className="card mb-5">
    <h3 className="text-base font-semibold text-gray-900 font-poppins mb-4">{title}</h3>
    {children}
  </div>
);

const SettingRow = ({ icon: Icon, iconBg, label, description, action, onClick }) => (
  <div
    className="flex items-center gap-4 py-4 border-b border-surface-border/60 last:border-0 cursor-pointer hover:bg-surface-bg -mx-5 px-5 rounded-xl transition-colors"
    onClick={onClick}
  >
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
      <Icon size={18} className="text-gray-600" />
    </div>
    <div className="flex-1">
      <p className="text-sm font-semibold text-gray-800 font-poppins">{label}</p>
      {description && <p className="text-xs text-gray-400 font-inter mt-0.5">{description}</p>}
    </div>
    {action || <ChevronRight size={16} className="text-gray-300" />}
  </div>
);

export default function SettingsPage() {
  const [clientOpen, setClientOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <div className="p-5 lg:p-6 animate-fade-in max-w-2xl">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 font-poppins">Settings</h2>
        <p className="text-sm text-gray-400 font-inter mt-0.5">Manage your banking system</p>
      </div>

      <Section title="Quick Actions">
        <SettingRow
          icon={UserPlus}
          iconBg="bg-blue-100"
          label="Add New Client"
          description="Create a new client account with login credentials"
          onClick={() => setClientOpen(true)}
        />
        <SettingRow
          icon={Building2}
          iconBg="bg-orange-100"
          label="Create Business Account"
          description="Add a new business account (e.g. James Cement)"
          onClick={() => setAccountOpen(true)}
        />
      </Section>

      <Section title="System">
        <SettingRow
          icon={Shield}
          iconBg="bg-green-100"
          label="Security & Permissions"
          description="Firebase security rules are enforced"
          action={<span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-semibold font-inter">Active</span>}
        />
        <SettingRow
          icon={Bell}
          iconBg="bg-purple-100"
          label="Notifications"
          description="Real-time transaction alerts enabled"
          action={
            <div className="w-10 h-6 bg-primary-500 rounded-full flex items-center justify-end px-1 cursor-pointer">
              <div className="w-4 h-4 bg-white rounded-full shadow" />
            </div>
          }
        />
      </Section>

      {/* Firebase Config reminder */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
        <p className="text-sm font-semibold text-amber-800 font-poppins mb-2">⚠️ Firebase Configuration Required</p>
        <p className="text-xs text-amber-700 font-inter leading-relaxed">
          Before deploying, update <code className="bg-amber-100 px-1 rounded">src/services/firebase.js</code> with your Firebase project credentials.
          Enable Email/Password authentication and Firestore in your Firebase console.
        </p>
        <div className="mt-3 bg-amber-100 rounded-xl p-3 font-mono text-xs text-amber-800 space-y-0.5">
          <p>apiKey: "YOUR_API_KEY"</p>
          <p>authDomain: "YOUR_PROJECT.firebaseapp.com"</p>
          <p>projectId: "YOUR_PROJECT_ID"</p>
        </div>
      </div>

      <CreateClientModal open={clientOpen} onClose={() => setClientOpen(false)} />
      <CreateAccountModal open={accountOpen} onClose={() => setAccountOpen(false)} />
    </div>
  );
}
