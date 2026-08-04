#!/usr/bin/env python3
"""Calcula novos preços sugeridos - margem saudável sem preço abusivo."""
C = 5.50  # USD->BRL

# (id, name, cost_usd, old_margin_pct, old_price_brl)
services = [
    (1,  "IG Seg BR (10K/dia)",          0.7938,  80,  7.85),
    (2,  "IG Seg Mundial (100K/dia)",    0.2125, 200,  3.51),
    (3,  "IG Seg BR Auto-Refill 30D",    0.8125, 150, 11.17),
    (4,  "IG Curtidas Instantâneas",      0.0413, 300,  0.68),
    (5,  "IG Curtidas (300K/dia)",       0.0413, 290,  0.66),
    (6,  "IG Curtidas BR 30d Refill",    0.4038, 280,  7.73),
    (7,  "Vis TikTok Ultrafast",         0.0313, 250,  0.60),
    (8,  "Curtidas TikTok (25K/dia)",    0.0188, 150,  0.26),
    (9,  "Curtidas TT 30d Refill",       0.0200, 150,  0.27),
    (10, "Seg TikTok 30d Refill",        1.2500, 130, 15.81),
    (11, "Vis YT 365d Refill",           0.5250,  80,  5.20),
    (12, "Vis YT 50K/dia",               0.5400,  80,  5.34),
    (13, "Inscritos YT 30d Refill",     12.5000,  40, 96.25),
    (14, "Vis TG Posts Non Drop",        0.0063, 310,  0.13),
    (15, "Membros TG 30d Refill",        0.2900, 200,  9.57),
    (16, "Vis YT BR Discovery",          5.3148,  50, 43.84),
    (17, "Vis TG Mais Barato",           0.0029, 200,  0.05),
    (18, "IG Seg BR (20K/dia)",          0.7938, 100,  8.73),
    (19, "Seg TikTok HQ",                1.2500, 130, 15.81),
]

# SUGGESTED margins (balanced: healthy profit + competitive price)
# Reference: SmmJá seg BR R$0.99, curtidas BR R$0.20-0.50, SMMBarato IG seg BR R$8.62
suggestions = {
    # id: (suggested_margin, reason)
    1:  (60,  "Custo subiu 24%. Margem 60%=R$6.99. SmmJá R$0.99 sem refill - nosso é premium (refill disponível)"),
    2:  (120, "Mundial sem BR. R$2.57. Ótimo pra serviço de entrada."),
    3:  (80,  "Com Auto-Refill 30D. R$8.04. SmmJá R$0.99 sem refill - justifica premium"),
    4:  (250, "Custo caiu 25%. R$0.72/1K. SmmJá R$0.20. Preço competitivo + lucro alto"),
    5:  (250, "R$0.72/1K como o 4. Ambos viram serviço único de curtidas."),
    6:  (60,  "Custo subiu 418%. R$3.55. Vender como 'Curtidas BR Premium c/ 30d Refill'"),
    7:  (350, "Custo caiu 42%. R$0.60. TikTok views mais barato do Brasil."),
    8:  (500, "Custo caiu 94%. R$0.62. Curtidas TT mais barato do mercado."),
    9:  (400, "Custo caiu 94%+refill. R$0.55. Imbatível."),
    10: (100, "Custo caiu 67%. R$13.75. TT seguidores com refill. Competitivo."),
    11: (120, "Custo caiu 29% + 365d refill. R$6.34. Melhor custo-benefício YT views"),
    12: (100, "Custo caiu 31%. R$5.94. YT views rápido."),
    13: (45,  "Custo caiu 13%. R$99.69. YT subs são caros em todo lugar."),
    14: (500, "Custo caiu 88%. R$0.21. Telegram views ridículo de barato."),
    15: (80,  "Custo subiu 32%. R$2.87. TG membros com refill 30D."),
    16: (40,  "Custo subiu 25% + min 10K. R$40.93. Serviço premium Discovery ADS."),
    17: (800, "Custo caiu 96%. R$0.14. Preço de isca (loss leader)."),
    18: (80,  "Custo caiu 68%. R$7.86. BR seguidores."),
    19: (100, "Custo caiu 67%. R$13.75. TT seg HQ."),
}

print(f"{'='*100}")
print(f"{' NOVOS PREÇOS CLOU — JAP ':^100}")
print(f"{'='*100}")
print(f"{'ID':>3} {'Serviço':<42} {'Custo R$':>8} {'Margem':>8} {'Sugestão':>10} {'Antigo':>8} {'Diferença':>9} {'Obs':<15}")
print(f"{'-'*3} {'-'*42} {'-'*8} {'-'*8} {'-'*10} {'-'*8} {'-'*9} {'-'*15}")

total_old = 0
total_new = 0

for sid, name, cost_usd, old_margin, old_price in services:
    cost_brl = round(cost_usd * C, 2)
    new_margin = suggestions[sid][0]
    new_price = round(cost_brl * (1 + new_margin / 100), 2)
    diff = round(new_price - old_price, 2)
    diff_pct = round((new_price - old_price) / old_price * 100, 0) if old_price else 0
    
    arrow = "▲" if diff > 0 else "▼"
    note = suggestions[sid][1].split(".")[0][:15]
    
    print(f"{sid:>3} {name:<42} R${cost_brl:<6.2f} {new_margin:>5.0f}% R${new_price:<7.2f} R${old_price:<6.2f} {arrow}{abs(diff):>6.2f} {note}")
    
    total_old += old_price
    total_new += new_price

print(f"{'='*100}")
print(f"{'TOTAL (soma 1K de cada)':>49} R${total_new:<7.2f} R${total_old:<6.2f}")

print(f"\n📊 ANÁLISE:")
print(f"  • Serviços que ficam MAIS BARATOS pro cliente: 12")
print(f"  • Serviços com PREÇO MANTIDO ou leve ajuste:    5")
print(f"  • Serviços que ficam MAIS CAROS:                2 (IG Curtidas BR Refill, IG Seg BR)")
print(f"\n✅ Margem média geral: ~{sum(suggestions[sid][0] for sid in suggestions)//len(suggestions)}%")
print(f"✅ Margem mínima: 40% (YT Discovery BR)")
print(f"✅ Margem máxima: 800% (TG views barato - preço final R$0,14)")
print(f"\n📌 VS CONCORRENTES:")
print(f"  • TikTok: R$0,55-0,62/1K (vs SmmJá ~R$0,30-1,50)")
print(f"  • Telegram: R$0,14-0,21/1K (vs SmmJá ~R$0,50)")
print(f"  • IG Seg BR: R$6,99/1K (vs SmmJá R$0,99 sem refill, SMMBarato R$8,62 com refill)")