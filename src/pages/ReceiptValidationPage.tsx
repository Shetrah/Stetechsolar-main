import { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { doc, getDoc } from 'firebase/firestore';
import { useSearchParams } from 'react-router-dom';
import { firebaseDb } from '../data/firebase';
import { formatKES } from '../data/productStore';
import type { ReceiptVerification } from '../data/productStore';

export default function ReceiptValidationPage() {
  const [params] = useSearchParams();
  const [receipt, setReceipt] = useState<ReceiptVerification | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const code = params.get('code');

  useEffect(() => {
    let active = true;
    if (!code || !/^[0-9a-f-]{36}$/i.test(code)) {
      setError('This verification link is invalid.');
      setLoading(false);
      return;
    }
    getDoc(doc(firebaseDb, 'receiptVerifications', code))
      .then((snapshot) => {
        if (!active) return;
        if (!snapshot.exists()) setError('No receipt matches this verification code.');
        else setReceipt(snapshot.data() as ReceiptVerification);
      })
      .catch(() => {
        if (active) setError('Receipt verification is temporarily unavailable.');
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => { active = false; };
  }, [code]);

  return (
    <main className="min-h-screen bg-[#eceeeb] px-4 py-12 text-slate-900">
      <section className="mx-auto max-w-xl rounded-xl border border-slate-200 bg-white p-7 shadow-sm sm:p-10">
        <div className="flex items-center gap-4 border-b border-slate-200 pb-6">
          <img src="/stetech solar.png" alt="STETECH Solar Technology" className="h-16 w-16 rounded-lg object-contain" />
          <div>
            <h1 className="text-lg font-black">STETECH SOLAR TECHNOLOGY</h1>
            <p className="text-sm text-slate-500">Receipt verification</p>
            <a className="text-sm text-slate-600 underline" href="https://stetechsolartechnology.co.ke">stetechsolartechnology.co.ke</a>
          </div>
        </div>
        {loading ? (
          <p className="py-10 text-center text-slate-500">Checking receipt…</p>
        ) : receipt ? (
          <div className="pt-7">
            <div className="flex items-center gap-3 rounded-lg bg-slate-100 p-4">
              <CheckCircle2 className="h-7 w-7 shrink-0 text-emerald-700" />
              <div>
                <h2 className="font-black">Authentic STETECH receipt</h2>
                <p className="text-sm text-slate-600">This reference is present in our records.</p>
              </div>
            </div>
            <dl className="mt-6 divide-y divide-slate-100">
              <div className="flex justify-between gap-4 py-3"><dt className="text-slate-500">Reference</dt><dd className="text-right font-bold">{receipt.receiptNumber}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-slate-500">Issued</dt><dd className="text-right font-medium">{new Date(receipt.issuedAt).toLocaleString()}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-slate-500">Receipt type</dt><dd className="text-right font-medium">{receipt.type === 'payment' ? 'Payment' : 'Sale'}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-slate-500">Order total</dt><dd className="text-right font-medium">{formatKES(receipt.total)}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-slate-500">Paid to date</dt><dd className="text-right font-medium">{formatKES(receipt.amountPaid)}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-slate-500">Balance due</dt><dd className="text-right font-medium">{formatKES(receipt.balanceDue)}</dd></div>
              <div className="flex justify-between gap-4 py-3"><dt className="text-slate-500">Payment status</dt><dd className="text-right font-black uppercase">{receipt.paymentStatus}</dd></div>
            </dl>
            <p className="mt-5 break-all text-xs text-slate-400">Order ID: {receipt.transactionId}</p>
          </div>
        ) : (
          <div role="alert" className="mt-7 flex items-center gap-3 rounded-lg bg-slate-100 p-4 text-slate-700">
            <AlertTriangle className="h-6 w-6 shrink-0" />
            <p>{error}</p>
          </div>
        )}
      </section>
    </main>
  );
}