import React, { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { motion } from 'framer-motion';
import { Wallet, Droplet, ShieldCheck, ArrowRightLeft, Clock, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function WalletPage() {
  const { user } = useAuthStore();
  const [showTransfer, setShowTransfer] = useState(false);

  const wallet = {
    bloodCredits: 3,
    donationCredits: 1250,
    emergencyCredits: 1,
    familyProtected: true,
    walletId: 'RK-WLT-9921-8842'
  };

  const transactions = [
    { id: 1, type: 'CREDIT_DONATION', amount: 1, desc: 'Donation at AIIMS', date: 'Oct 12, 2023', sign: '+' },
    { id: 2, type: 'BONUS', amount: 150, desc: 'Festival Bonus Points', date: 'Oct 12, 2023', sign: '+' },
    { id: 3, type: 'DEBIT_EMERGENCY', amount: 1, desc: 'Family Emergency Usage', date: 'Aug 04, 2023', sign: '-' },
  ];

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-5xl mx-auto space-y-6">
        
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black glow-text text-primary uppercase tracking-wider">DIGITAL BLOOD WALLET</h1>
            <p className="font-mono text-muted-foreground">ID: {wallet.walletId}</p>
          </div>
          <Button onClick={() => setShowTransfer(!showTransfer)} className="bg-primary hover:bg-primary/80 text-primary-foreground font-mono flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4" /> TRANSFER CREDITS
          </Button>
        </div>

        {showTransfer && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="glass-panel p-6 rounded-xl border border-primary/50 relative overflow-hidden mb-6">
            <div className="absolute inset-0 bg-primary/5"></div>
            <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-4 relative z-10 flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4" /> TRANSFER TO FAMILY/FRIEND
            </h3>
            <form className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={(e) => { e.preventDefault(); setShowTransfer(false); }}>
              <div className="md:col-span-2">
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Recipient ABHA / Wallet ID</label>
                <input type="text" placeholder="RK-WLT-XXXX-XXXX" className="w-full bg-background/80 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none font-mono" />
              </div>
              <div>
                <label className="block text-xs font-mono text-muted-foreground mb-1 uppercase">Credits</label>
                <input type="number" min="1" max={wallet.bloodCredits} defaultValue="1" className="w-full bg-background/80 border border-border rounded-lg px-4 py-2 text-sm focus:border-primary outline-none" />
              </div>
              <div className="flex items-end">
                <Button type="submit" className="w-full bg-primary hover:bg-primary/80 text-primary-foreground font-mono">INITIATE</Button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="md:col-span-1 space-y-6">
            {/* ID Card */}
            <div className="glass-panel p-6 rounded-2xl border border-primary/30 relative overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
              
              <div className="w-full flex justify-between items-start mb-6">
                <div className="font-bold">{user?.name || 'User'}</div>
                <Wallet className="w-5 h-5 text-primary" />
              </div>

              {/* Pseudo QR Code */}
              <div className="w-40 h-40 bg-white p-2 rounded-xl flex items-center justify-center relative mb-4">
                <div className="w-full h-full border-4 border-black border-dashed opacity-80 grid grid-cols-4 grid-rows-4 gap-1 p-1">
                   {/* Generating a fake QR pattern */}
                   {[...Array(16)].map((_, i) => <div key={i} className={`bg-black ${Math.random() > 0.5 ? 'opacity-100' : 'opacity-0'}`}></div>)}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center"><Droplet className="w-5 h-5 text-primary" fill="currentColor" /></div>
                </div>
              </div>

              <div className="font-mono text-sm tracking-widest text-primary font-bold">{wallet.walletId}</div>
              <div className="text-[10px] text-muted-foreground font-mono mt-1">SCAN AT BLOOD BANK</div>
            </div>

            {/* Protection Status */}
            <div className={`glass-panel p-6 rounded-xl border flex items-center justify-between ${wallet.familyProtected ? 'bg-success/5 border-success/30' : 'bg-white/5 border-white/10'}`}>
              <div>
                <div className="text-xs font-mono text-muted-foreground uppercase mb-1">Coverage Status</div>
                <div className={`font-bold ${wallet.familyProtected ? 'text-success glow-text-success' : 'text-muted-foreground'}`}>
                  {wallet.familyProtected ? 'FAMILY PROTECTED' : 'UNPROTECTED'}
                </div>
              </div>
              <ShieldCheck className={`w-8 h-8 ${wallet.familyProtected ? 'text-success' : 'text-muted-foreground'}`} />
            </div>

            {/* Info Card */}
            <div className="glass-panel p-4 rounded-xl border border-white/10 bg-white/5">
              <h4 className="text-xs font-mono font-bold text-muted-foreground flex items-center gap-1 mb-2"><Info className="w-3 h-3" /> HOW IT WORKS</h4>
              <p className="text-[10px] font-mono text-muted-foreground leading-relaxed">
                1 Donation = 1 Blood Credit.<br/>
                Having ≥1 credit ensures your family receives priority blood matching during emergencies.<br/>
                Credits never expire and can be transferred.
              </p>
            </div>

          </div>

          <div className="md:col-span-2 space-y-6">
            {/* Balances */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-6 rounded-xl border border-primary/40 relative overflow-hidden bg-primary/5">
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-primary/20 to-transparent"></div>
                <Droplet className="w-6 h-6 text-primary mb-2 opacity-80" />
                <div className="text-4xl font-black font-mono text-primary glow-text">{wallet.bloodCredits}</div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">Blood Credits</div>
              </div>
              <div className="glass-panel p-6 rounded-xl border border-success/40 relative overflow-hidden bg-success/5">
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-success/20 to-transparent"></div>
                <ShieldCheck className="w-6 h-6 text-success mb-2 opacity-80" />
                <div className="text-4xl font-black font-mono text-success glow-text-success">{wallet.donationCredits}</div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">Reward Points</div>
              </div>
              <div className="glass-panel p-6 rounded-xl border border-destructive/40 relative overflow-hidden bg-destructive/5">
                <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-destructive/20 to-transparent"></div>
                <Clock className="w-6 h-6 text-destructive mb-2 opacity-80" />
                <div className="text-4xl font-black font-mono text-destructive">{wallet.emergencyCredits}</div>
                <div className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest mt-1">Emergency Tokens</div>
              </div>
            </div>

            {/* Ledger */}
            <div className="glass-panel p-6 rounded-xl border border-primary/20">
              <h3 className="font-mono text-sm tracking-widest text-primary font-bold mb-6">TRANSACTION LEDGER</h3>
              
              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div key={tx.id} className="p-4 rounded-lg bg-white/5 border border-white/10 flex items-center justify-between hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-lg ${tx.sign === '+' ? 'bg-success/20 text-success border border-success/30' : 'bg-destructive/20 text-destructive border border-destructive/30'}`}>
                        {tx.sign}
                      </div>
                      <div>
                        <div className="font-bold text-sm">{tx.desc}</div>
                        <div className="text-xs text-muted-foreground font-mono flex items-center gap-2 mt-1">
                          <span>{tx.date}</span> • <span className="text-[10px] bg-background px-1.5 py-0.5 rounded border border-border">{tx.type}</span>
                        </div>
                      </div>
                    </div>
                    <div className={`text-xl font-black font-mono ${tx.sign === '+' ? 'text-success' : 'text-foreground'}`}>
                      {tx.sign}{tx.amount}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </motion.div>
    </AppLayout>
  );
}