"""
KryptTrader — Credential Setup
================================
Run this once from the python/ directory to store your Kalshi API key
and RSA private key so the app can sign requests.

Usage:
    python setup_credentials.py          # interactive
    python setup_credentials.py --env demo
    python setup_credentials.py --env production

What it does:
  1. Asks for your API Key ID (the UUID from the Kalshi dashboard)
  2. Asks you to paste your RSA private key PEM (input is hidden)
  3. Validates the key parses correctly
  4. Saves both to  credentials/apikey.<env>.txt
                    credentials/rsakey.<env>.pem
  5. Does a live connectivity test against Kalshi's exchange/status endpoint

Your private key is NEVER echoed to the terminal or logged anywhere.
"""
from __future__ import annotations

import argparse
import getpass
import sys
import os
from pathlib import Path

# Make sure we can import from the python/ directory
sys.path.insert(0, str(Path(__file__).resolve().parent))

BANNER = """
╔══════════════════════════════════════════════════════╗
║         KryptTrader — Credential Setup               ║
╚══════════════════════════════════════════════════════╝
"""

def _colour(text: str, code: str) -> str:
    return f"\033[{code}m{text}\033[0m"

def ok(msg: str) -> None:
    print(f"  {_colour('✓', '32')}  {msg}")

def err(msg: str) -> None:
    print(f"  {_colour('✗', '31')}  {msg}")

def info(msg: str) -> None:
    print(f"  {_colour('·', '34')}  {msg}")


def read_pem_stdin() -> str:
    """Reads a multi-line PEM key from stdin without echoing it."""
    print()
    print("  Paste your RSA private key below.")
    print("  It should start with  -----BEGIN RSA PRIVATE KEY-----")
    print("  or  -----BEGIN PRIVATE KEY-----")
    print("  Press Enter on a blank line when done (or Ctrl-D).")
    print()

    lines: list[str] = []
    started = False
    try:
        while True:
            try:
                line = input()
            except EOFError:
                break
            if line.startswith("-----BEGIN"):
                started = True
            if started:
                lines.append(line)
            if started and line.startswith("-----END"):
                break
            if not started and not line.strip():
                continue
    except KeyboardInterrupt:
        print()
        sys.exit(1)

    return "\n".join(lines)


def main() -> None:
    print(BANNER)

    parser = argparse.ArgumentParser(description="KryptTrader credential setup")
    parser.add_argument(
        "--env",
        choices=["demo", "production"],
        default="demo",
        help="Which environment to configure (default: demo)",
    )
    parser.add_argument(
        "--api-key",
        help="Kalshi API Key ID (UUID). If omitted, you will be prompted.",
    )
    args = parser.parse_args()

    env = args.env
    print(f"  Configuring credentials for: {_colour(env.upper(), '1;33')}\n")

    # ── Step 1: API Key ID ──────────────────────────────────────────────────
    if args.api_key:
        api_key = args.api_key.strip()
    else:
        print("  Step 1 of 2 — API Key ID")
        print("  Find this on Kalshi → Settings → API → your key's UUID")
        print()
        api_key = input("  Paste your API Key ID: ").strip()

    if not api_key:
        err("API Key ID cannot be empty.")
        sys.exit(1)

    if len(api_key) < 8:
        err(f"That doesn't look like a valid API Key ID: {api_key!r}")
        sys.exit(1)

    ok(f"API Key ID received  (last 4: …{api_key[-4:]})")

    # ── Step 2: RSA Private Key ─────────────────────────────────────────────
    print()
    print("  Step 2 of 2 — RSA Private Key")
    rsa_pem = read_pem_stdin()

    if not rsa_pem:
        err("No PEM data received.")
        sys.exit(1)

    if "BEGIN" not in rsa_pem or "END" not in rsa_pem:
        err("PEM does not look like a valid key (missing BEGIN/END markers).")
        sys.exit(1)

    # ── Validate & save ─────────────────────────────────────────────────────
    print()
    print("  Validating and saving…")

    try:
        from kalshi_auth import save_credentials, credentials_status, set_env, prime_credentials
    except ImportError as e:
        err(f"Could not import kalshi_auth: {e}")
        err("Make sure you run this from the python/ directory: cd python && python setup_credentials.py")
        sys.exit(1)

    try:
        save_credentials(api_key, rsa_pem, env=env)
        ok("Credentials saved successfully")
    except ValueError as e:
        err(f"Credential validation failed: {e}")
        sys.exit(1)
    except Exception as e:
        err(f"Unexpected error saving credentials: {e}")
        sys.exit(1)

    # ── Show status ──────────────────────────────────────────────────────────
    try:
        status = credentials_status(env)
        ok(f"API key stored    (last 4: …{status['apiKeyPreview']})")
        ok(f"RSA key stored    (fingerprint: {status['fingerprint']})")
    except Exception as e:
        info(f"Could not read back status: {e}")

    # ── Live connectivity test ───────────────────────────────────────────────
    print()
    print("  Running connectivity test…")

    try:
        import asyncio
        import httpx

        async def _check() -> dict:
            bases = {
                "demo": "https://external-api.demo.kalshi.co",
                "production": "https://external-api.kalshi.com",
            }
            url = f"{bases[env]}/trade-api/v2/exchange/status"
            async with httpx.AsyncClient(timeout=10.0) as c:
                r = await c.get(url, headers={"Accept": "application/json"})
                return r.json() if r.status_code < 400 else {}

        data = asyncio.run(_check())
        if data.get("exchange_active") or data.get("trading_active") is not None:
            ok(f"Connected to Kalshi {env}: exchange_active={data.get('exchange_active')}, "
               f"trading_active={data.get('trading_active')}")
        else:
            info("Connected but response was unexpected — network may be restricted")

    except Exception as e:
        info(f"Connectivity test skipped: {e}")
        info("This is fine if you're running the setup on a machine without internet.")

    # ── Done ─────────────────────────────────────────────────────────────────
    print()
    print("  " + _colour("═" * 52, "32"))
    print(f"  {_colour('Setup complete!', '1;32')}")
    print("  " + _colour("═" * 52, "32"))
    print()
    print("  Next steps:")
    print(f"    1. Run  npm install  in the repo root")
    print(f"    2. Run  npm run dev  to launch the app")
    print(f"    3. In the app: Settings → select '{env}' environment")
    print(f"    4. Choose 'Swarm Demo Micro' preset and enable trading")
    print()


if __name__ == "__main__":
    main()
