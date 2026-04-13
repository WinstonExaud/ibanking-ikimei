import { formatCurrency } from '../../utils/helpers';

export default function BankCard({ account, userName = 'Card Holder' }) {
  const color = account?.color || '#2563EB';
  const balance = account?.balance || 0;
  const name = account?.name || 'iKIMEI Account';

  return (
    <div
      className="bank-card relative rounded-3xl p-6 text-white w-full max-w-[340px] min-h-[200px] flex flex-col justify-between overflow-hidden select-none shadow-xl"
      style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}cc 60%, ${color}88 100%)` }}
    >
      {/* Background circles */}
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-10 -left-6 w-52 h-52 rounded-full bg-white/10" />
      <div className="absolute top-1/2 right-8 w-20 h-20 rounded-full bg-white/10" />

      {/* Top row */}
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <p className="text-white/70 text-xs font-inter uppercase tracking-widest">iKIMEI</p>
          <p className="text-white font-bold text-base font-poppins mt-0.5">{name}</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs font-poppins">iK</span>
          </div>
        </div>
      </div>

      {/* Card number */}
      <div className="relative z-10 mt-4">
        <p className="text-white/60 text-[10px] font-inter tracking-widest uppercase mb-1">Account Number</p>
        <p className="font-mono text-white text-base tracking-[3px] font-medium">
          {account?.accountId
            ? account.accountId.replace(/(.{4})/g, '$1 ').trim()
            : '•••• •••• ••••'}
        </p>
      </div>

      {/* Bottom row */}
      <div className="relative z-10 flex items-end justify-between mt-4">
        <div>
          <p className="text-white/60 text-[10px] uppercase tracking-widest font-inter">Balance</p>
          <p className="text-white font-bold text-xl font-poppins">
            {formatCurrency(balance)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-white/60 text-[10px] uppercase tracking-widest font-inter">Holder</p>
          <p className="text-white font-semibold text-sm font-poppins">{userName}</p>
        </div>
      </div>
    </div>
  );
}
