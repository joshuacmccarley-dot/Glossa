"""
Krypt-Trader Swarm Architecture
================================

A "swarm" in this context means: multiple independent signal workers running
concurrently, each specialised for a different market domain, all feeding a
shared signal aggregation layer that places Kelly-sized orders on a SINGLE
Kalshi account.

This is emphatically NOT multi-account (which violates Kalshi ToS). It is
maximising signal intelligence and capital utilisation within one account.

Architecture overview
---------------------

                     SIGNAL WORKERS (parallel coroutines)
    ┌──────────────────────────────────────────────────────────────┐
    │  WhaleWorker  │ MomentumWorker │ ConvergenceWorker          │
    │  Crypto15mWorker │ ArbWorker   │ ExternalDataWorker (TODO)  │
    └──────────────────────────┬───────────────────────────────────┘
                               │  SwarmSignal objects
                               ▼
                  AGGREGATION ENGINE
           (dedup · ensemble confidence · Kelly sizing)
                               │
                               ▼
             EXECUTION ENGINE (single Kalshi account)
             Kelly-optimised limit orders → Kalshi API

$10 000/month profitability model
-----------------------------------

Backtested net edges (from config.py presets, in-sample):
  - Sports Momentum contrarian:  +18.2¢ / contract  (t=2.2, n=37)
  - Crypto Whale follow:          +9.3¢ / contract  (t=3.5, n=36)
  - Edge Stack (blended):        +15.6¢ / contract  (t=3.2, n=81)

Working backwards from $10 000/month:
  Target monthly P&L:  $10 000
  Blended net edge:    $0.156 / contract
  Required contracts:  10 000 / 0.156 ≈ 64 000 contracts / month

  At average entry price 0.65 and position size $200:
    contracts per trade = $200 / $0.65 ≈ 307 contracts
    trades needed       = 64 000 / 307 ≈ 208 trades / month ≈ 7 / day
    at 80 % win rate    = 9 total trades / day (7 winning, 2 losing)

  Required bankroll:
    25 open positions × $200 each = $5 000 min exposure
    With 5 % cash reserve: $5 000 / 0.95 ≈ $5 300 min bankroll
    Recommended for 30-day drawdown buffer: $20 000–$50 000

Capital deployment roadmap
---------------------------
Phase 1 — Validate (weeks 1–4)
  Demo environment, "Profit Max 80" preset, paper-trade full cycle.
  Target: ≥ 75 % win rate on ≥ 30 resolved trades before going live.

Phase 2 — Seed ($1 000 bankroll, month 1)
  Max position $20, `hard_max_position_usd = 20`.
  Expected P&L: $150–$300 / month.
  Goal: confirm forward edge, calibrate Kelly fractions.

Phase 3 — Scale ($10 000 bankroll, months 2–3)
  Max position $100, `hard_max_position_usd = 100`.
  Expected P&L: $1 500–$3 000 / month.

Phase 4 — Full deployment ($50 000 bankroll, month 4+)
  Max position $200–$300, up to 25 concurrent.
  Expected P&L: $8 000–$15 000 / month (with ±50 % variance).
  Drawdown buffer: never risk more than 20 % of bankroll in a single day.

Signal worker design
---------------------
Each worker is an async coroutine that runs on a configurable interval and
emits SwarmSignal objects into the aggregator's asyncio.Queue.

Workers currently implemented in this codebase:
  scanner.scan_whales()       → WhaleWorker (120s interval)
  scanner.scan_momentum()     → MomentumWorker (90s interval)
  scanner.scan_convergence()  → (implicit via trade_convergence flag)
  crypto15m_trader.run_tick() → Crypto15mWorker (4s interval)

Workers to add for maximum P&L:
  ArbWorker       — cross-platform price discrepancy vs Polymarket BTC/ETH
  NewsScoutWorker — NLP signal from Kalshi-relevant news headlines
  SportsFeedWorker — live sports APIs feeding pre-close sports market edges

Ensemble confidence scoring
----------------------------
When multiple workers signal the same ticker+direction within the same window,
the aggregator computes an ensemble confidence:

    ensemble = max(c1, c2, ...) + bonus_per_extra_source * (n - 1)
    bonus_per_extra_source = 5.0  (empirical; tune based on your data)

A signal backed by ≥ 2 independent sources gets a +5 confidence boost,
making it more likely to clear the `min_confidence_*` gates and receive
a larger Kelly allocation.

Cross-source deduplication
---------------------------
If a trade is already open on a ticker+direction, that market is skipped.
The dedup window uses `max_signal_age_sec` (default 120 s) so stale
duplicate signals from slow-running workers do not trigger additional orders.

Kelly sizing in the swarm context
-----------------------------------
With Kelly sizing mode enabled:
  full_Kelly  = (win_prob × net_odds − loss_prob) / net_odds
  bet_size    = balance × kelly_fraction × full_Kelly

The kelly_fraction (default 0.5 = half-Kelly) controls risk. Use:
  0.25  — ultra-conservative (quarter-Kelly), minimises ruin probability
  0.50  — standard (half-Kelly), widely recommended for live trading
  0.75  — aggressive, acceptable only when forward edge is well-confirmed

The min_kelly_fraction gate (default 0.0) skips trades when the computed
Kelly fraction is below a threshold — automatically eliminating low-edge
opportunities that pass the confidence filter but offer poor risk-reward.

Risk management rules for a $10k/month swarm
----------------------------------------------
1. Daily stop-loss:      −5 % of bankroll (e.g. −$2 500 on $50 k)
2. Weekly stop-loss:     −10 % of bankroll; pause and review
3. Max concurrent:       25 positions across all workers
4. Max single position:  2 % of bankroll (Kelly-capped)
5. Max category exposure: 40 % of open exposure in any single category
6. Drawdown-based scaling: if drawdown > 15 %, halve all position sizes
   until bankroll recovers to within 5 % of peak

Implementation status
----------------------
The SwarmSignal dataclass and SwarmAggregator skeleton below can be
plugged into service.py to replace the sequential scan_for_trades() call
with a parallel multi-worker loop.
"""

from __future__ import annotations

import asyncio
import logging
import time
from dataclasses import dataclass, field
from typing import Optional

logger = logging.getLogger(__name__)


@dataclass
class SwarmSignal:
    """Normalised signal produced by any swarm worker."""
    ticker: str
    event_ticker: str
    direction: str          # "yes" | "no"
    source: str             # "whale" | "momentum" | "convergence" | "arb" | ...
    confidence: float       # 0–100 scale
    price: float            # implied price of our side (0–1)
    category: str
    title: str
    signal_id: int
    emitted_at: float = field(default_factory=time.time)
    raw: dict = field(default_factory=dict)


_EXTRA_SOURCE_BONUS = 5.0  # confidence boost per additional corroborating source


def ensemble_confidence(signals: list[SwarmSignal]) -> float:
    """
    Compute ensemble confidence for a group of signals targeting the same
    ticker + direction.  Max individual confidence is the base; each extra
    independent source adds a fixed bonus (tunable).
    """
    if not signals:
        return 0.0
    sources = {s.source for s in signals}
    base = max(s.confidence for s in signals)
    bonus = _EXTRA_SOURCE_BONUS * (len(sources) - 1)
    return min(97.0, base + bonus)


class SwarmAggregator:
    """
    Collects SwarmSignals from all workers and de-duplicates them by
    (ticker, direction) within a rolling time window before forwarding
    to the execution engine.
    """

    def __init__(self, window_sec: float = 120.0):
        self._window = window_sec
        self._queue: asyncio.Queue[SwarmSignal] = asyncio.Queue()
        self._seen: dict[tuple[str, str], list[SwarmSignal]] = {}

    def submit(self, signal: SwarmSignal) -> None:
        """Non-blocking — workers call this to emit a signal."""
        self._queue.put_nowait(signal)

    def _evict_stale(self) -> None:
        cutoff = time.time() - self._window
        stale = [k for k, v in self._seen.items() if all(s.emitted_at < cutoff for s in v)]
        for k in stale:
            del self._seen[k]

    async def drain(self) -> list[SwarmSignal]:
        """
        Drain all pending signals from the queue, merge duplicates into
        ensemble signals, and return one canonical SwarmSignal per unique
        (ticker, direction) pair ordered by ensemble confidence descending.
        """
        self._evict_stale()

        # Collect everything currently in the queue without blocking.
        fresh: list[SwarmSignal] = []
        while True:
            try:
                fresh.append(self._queue.get_nowait())
            except asyncio.QueueEmpty:
                break

        # Group by (ticker, direction).
        for s in fresh:
            key = (s.ticker, s.direction)
            self._seen.setdefault(key, [])
            # Keep only signals from distinct sources for the same key.
            existing_sources = {x.source for x in self._seen[key]}
            if s.source not in existing_sources:
                self._seen[key].append(s)

        # Build canonical signals with ensemble confidence.
        canonical: list[SwarmSignal] = []
        for (ticker, direction), group in self._seen.items():
            if not group:
                continue
            conf = ensemble_confidence(group)
            best = max(group, key=lambda x: x.confidence)
            merged = SwarmSignal(
                ticker=ticker,
                event_ticker=best.event_ticker,
                direction=direction,
                source="+".join(sorted({s.source for s in group})),
                confidence=conf,
                price=best.price,
                category=best.category,
                title=best.title,
                signal_id=best.signal_id,
                emitted_at=best.emitted_at,
                raw=best.raw,
            )
            canonical.append(merged)

        canonical.sort(key=lambda s: s.confidence, reverse=True)
        return canonical


# ---------------------------------------------------------------------------
# Profitability estimator (useful for tuning bankroll and position size)
# ---------------------------------------------------------------------------

def monthly_pnl_estimate(
    bankroll_usd: float,
    max_position_usd: float,
    trades_per_day: int,
    win_rate: float,
    net_edge_per_contract: float,
    avg_entry_price: float,
    trading_days: int = 22,
) -> dict:
    """
    Conservative estimate of monthly P&L given strategy parameters.

    Inputs
    ------
    bankroll_usd          : total capital available
    max_position_usd      : hard_max_position_usd setting
    trades_per_day        : expected number of fills per day
    win_rate              : fraction of trades won (0–1)
    net_edge_per_contract : blended net P&L per $1-payout contract after fees
    avg_entry_price       : average cost per contract in dollars (0–1)
    trading_days          : business days in month

    Returns
    -------
    dict with gross/net/monthly/daily P&L projections and ROI figures.
    """
    contracts_per_trade = max_position_usd / avg_entry_price
    monthly_trades = trades_per_day * trading_days
    monthly_contracts = monthly_trades * contracts_per_trade

    wins = monthly_trades * win_rate
    losses = monthly_trades * (1.0 - win_rate)

    gross_win = wins * contracts_per_trade * (1.0 - avg_entry_price)
    gross_loss = losses * contracts_per_trade * avg_entry_price
    gross_pnl = gross_win - gross_loss

    fee_per_contract = 0.07 * avg_entry_price * (1.0 - avg_entry_price)
    total_fees = monthly_contracts * fee_per_contract
    net_pnl = gross_pnl - total_fees

    roi = net_pnl / bankroll_usd if bankroll_usd else 0.0

    return {
        "bankroll_usd": bankroll_usd,
        "max_position_usd": max_position_usd,
        "trades_per_day": trades_per_day,
        "monthly_trades": monthly_trades,
        "contracts_per_trade": round(contracts_per_trade, 1),
        "monthly_contracts": round(monthly_contracts),
        "gross_pnl_usd": round(gross_pnl, 2),
        "total_fees_usd": round(total_fees, 2),
        "net_pnl_usd": round(net_pnl, 2),
        "net_pnl_per_contract_usd": round(net_edge_per_contract, 4),
        "monthly_roi_pct": round(roi * 100, 2),
        "daily_pnl_usd": round(net_pnl / trading_days, 2),
    }


# Pre-computed scenarios matching the roadmap phases above.
PROFITABILITY_SCENARIOS = [
    monthly_pnl_estimate(
        bankroll_usd=1_000, max_position_usd=20, trades_per_day=9,
        win_rate=0.78, net_edge_per_contract=0.156, avg_entry_price=0.65,
    ),
    monthly_pnl_estimate(
        bankroll_usd=10_000, max_position_usd=100, trades_per_day=9,
        win_rate=0.78, net_edge_per_contract=0.156, avg_entry_price=0.65,
    ),
    monthly_pnl_estimate(
        bankroll_usd=50_000, max_position_usd=200, trades_per_day=12,
        win_rate=0.78, net_edge_per_contract=0.156, avg_entry_price=0.65,
    ),
]
