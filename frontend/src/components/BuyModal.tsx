"use client";

import { useState, FormEvent, useEffect } from "react";
import { api } from "@/lib/api";

interface ServiceData {
  id: number;
  name: string;
  price: number;
  min_amount: number;
  max_amount: number;
  avg_time: string;
}

interface BuyModalProps {
  service: ServiceData | null;
  isOpen: boolean;
  onClose: () => void;
  token: string;
  onSuccess?: () => void;
}

export default function BuyModal({ service, isOpen, onClose, token, onSuccess }: BuyModalProps) {
  const [link, setLink] = useState("");
  const [quantity, setQuantity] = useState<number>(100);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<{ code: string; discount_percent: number; discount_amount: number; final_amount: number } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // Atualizar quantity quando o serviço mudar (sempre antes de early return!)
  useEffect(() => {
    if (service) setQuantity(service.min_amount);
  }, [service?.id]);

  // Limpar cupom quando a quantidade mudar
  useEffect(() => {
    if (coupon) setCoupon(null);
  }, [quantity]);

  if (!isOpen || !service) return null;

  const rawTotal = (service.price * quantity) / 1000;
  const total = coupon ? coupon.final_amount : rawTotal;
  const effectiveDiscount = coupon ? (rawTotal * coupon.discount_percent / 100) : 0;
  const displayPrice = service.price < 1
    ? `R$ ${(service.price * 1000).toFixed(2).replace(".", ",")}`
    : `R$ ${service.price.toFixed(2).replace(".", ",")}`;

  async function applyCoupon() {
    setCouponError(""); setCouponLoading(true);
    try {
      const data = await api.post<{ code: string; discount_percent: number; discount_amount: number; final_amount: number; valid: boolean }>(
        "/coupons/validate", { code: couponCode, amount: rawTotal }, token
      );
      setCoupon(data);
      setCouponCode("");
    } catch (err: any) {
      setCouponError(err.message);
      setCoupon(null);
    } finally { setCouponLoading(false); }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(false); setLoading(true);

    if (!link.includes("/") && !link.includes(".")) {
      setError("Insira o link completo do seu perfil (ex: https://instagram.com/seuperfil)");
      setLoading(false);
      return;
    }
    if (!service) return;
    if (quantity < service.min_amount || quantity > service.max_amount) {
      setError(`A quantidade deve estar entre ${service.min_amount} e ${service.max_amount}`);
      setLoading(false);
      return;
    }

    try {
      await api.post("/orders", { service_id: service.id, link, quantity, coupon: coupon?.code }, token);
      setSuccess(true);
      setLink(""); setQuantity(service.min_amount); setCoupon(null); setCouponCode("");
      if (onSuccess) onSuccess();
      setTimeout(() => { onClose(); setSuccess(false); }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass-card p-6 animate-fade-in-up border border-slate-700/50 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {success ? (
          <div className="text-center py-8">
            <div className="text-5xl mb-4">✅</div>
            <h3 className="text-lg font-semibold text-white mb-1">Pedido Realizado!</h3>
            <p className="text-sm text-slate-500">Seu pedido foi criado e está sendo processado.</p>
          </div>
        ) : (
          <>
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-white">{service.name}</h3>
              <div className="flex items-center gap-3 mt-2 text-sm text-slate-500">
                <span className="text-emerald-400 font-semibold">{displayPrice}<span className="text-slate-500 font-normal">/mil</span></span>
                <span>⏱ {service.avg_time}</span>
                <span>{service.min_amount}-{service.max_amount}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-1">Link do Perfil</label>
                <input type="text" value={link} onChange={e => setLink(e.target.value)} placeholder="https://instagram.com/seuperfil" required className="input-clou" />
                <p className="text-[10px] text-slate-600 mt-1">Cole o link completo do seu perfil, post ou vídeo</p>
              </div>

              <div>
                <label className="text-sm text-slate-400 block mb-1">Quantidade <span className="text-slate-600">({service.min_amount} - {service.max_amount})</span></label>
                <div className="flex gap-2">
                  <input type="number" value={quantity} onChange={e => setQuantity(parseInt(e.target.value) || service.min_amount)} min={service.min_amount} max={service.max_amount} className="input-clou flex-1" />
                  <div className="flex gap-1">
                    {[service.min_amount, Math.floor(service.max_amount / 2), service.max_amount].filter((v, i, a) => a.indexOf(v) === i).map((v) => (
                      <button key={v} type="button" onClick={() => setQuantity(v)} className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${quantity === v ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-slate-800/50 text-slate-500 border-slate-700/50 hover:border-slate-600"}`}>
                        {v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Cupom */}
              <div className="glass-card p-3 !mt-4">
                <p className="text-xs text-slate-500 font-medium mb-2">Cupom de Desconto</p>
                <div className="flex gap-2">
                  <input type="text" value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())} placeholder="BEMVINDO10" className="input-clou flex-1 uppercase text-xs" />
                  <button type="button" onClick={applyCoupon} disabled={couponLoading || !couponCode} className="btn-accent text-xs !py-2 !px-3">
                    {couponLoading ? "..." : "Aplicar"}
                  </button>
                </div>
                {coupon && (
                  <div className="mt-2 text-xs text-emerald-400 font-medium flex items-center gap-1">
                    ✅ Cupom {coupon.code} (-{coupon.discount_percent}%)
                  </div>
                )}
                {couponError && <p className="mt-2 text-xs text-red-400">{couponError}</p>}
              </div>

              {/* Total */}
              <div className="glass-card p-4 !mt-4">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-slate-500">Valor do Serviço</span>
                  <span className="text-sm text-white">{displayPrice}/mil</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">Quantidade</span>
                  <span className="text-sm text-white">{quantity}</span>
                </div>
                {coupon && (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-amber-400 font-medium">Desconto ({coupon.discount_percent}%)</span>
                    <span className="text-sm text-amber-400">-R$ {effectiveDiscount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-700/50">
                  <span className="text-sm font-semibold text-white">Total</span>
                  <span className={`text-lg font-bold ${coupon ? "text-amber-400" : "text-emerald-400"}`}>
                    R$ {(rawTotal - effectiveDiscount).toFixed(2)}
                    {coupon && <span className="text-xs text-slate-600 line-through ml-2">R$ {rawTotal.toFixed(2)}</span>}
                  </span>
                </div>
              </div>

              {error && <p className="text-red-400 text-sm">{error}</p>}

              <button type="submit" disabled={loading} className="btn-accent w-full !py-3 text-sm">
                {loading ? "Processando..." : `Comprar por R$ ${(rawTotal - effectiveDiscount).toFixed(2)}`}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
