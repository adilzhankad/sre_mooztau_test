#!/usr/bin/env python3
"""
Load testing script for MoozTau microservices.
Simulates concurrent user requests to measure system behavior under stress.

Usage:
    python load_test.py [--host HOST] [--users N] [--duration SEC] [--rps N]

Example:
    python load_test.py --host 213.155.22.46 --users 20 --duration 60 --rps 10
"""

import asyncio
import argparse
import time
import sys
from dataclasses import dataclass, field
from datetime import datetime

try:
    import aiohttp
except ImportError:
    print("Missing dependency: pip install aiohttp")
    sys.exit(1)


@dataclass
class ServiceStats:
    name: str
    total: int = 0
    success: int = 0
    errors: int = 0
    latencies: list = field(default_factory=list)

    @property
    def error_rate(self) -> float:
        return (self.errors / self.total * 100) if self.total else 0.0

    @property
    def avg_latency(self) -> float:
        return (sum(self.latencies) / len(self.latencies) * 1000) if self.latencies else 0.0

    @property
    def p95_latency(self) -> float:
        if not self.latencies:
            return 0.0
        sorted_lat = sorted(self.latencies)
        idx = int(len(sorted_lat) * 0.95)
        return sorted_lat[idx] * 1000


SERVICES = {
    "auth":    {"port": 8002, "endpoints": ["/health", "/api/users/", "/api/organizations/"]},
    "orders":  {"port": 8001, "endpoints": ["/health", "/api/products/", "/api/orders/"]},
    "finance": {"port": 8003, "endpoints": ["/health", "/api/accounts", "/api/categories"]},
    "product": {"port": 8004, "endpoints": ["/health"]},
    "user":    {"port": 8005, "endpoints": ["/health"]},
    "chat":    {"port": 8006, "endpoints": ["/health"]},
}


async def fetch(session: aiohttp.ClientSession, url: str, stats: ServiceStats) -> None:
    start = time.monotonic()
    try:
        async with session.get(url, timeout=aiohttp.ClientTimeout(total=5)) as resp:
            elapsed = time.monotonic() - start
            stats.total += 1
            stats.latencies.append(elapsed)
            if resp.status < 500:
                stats.success += 1
            else:
                stats.errors += 1
    except Exception:
        elapsed = time.monotonic() - start
        stats.total += 1
        stats.errors += 1
        stats.latencies.append(elapsed)


async def run_worker(host: str, rps: float, duration: int, all_stats: dict[str, ServiceStats], stop_event: asyncio.Event) -> None:
    interval = 1.0 / rps
    connector = aiohttp.TCPConnector(limit=100)
    async with aiohttp.ClientSession(connector=connector) as session:
        end_time = time.monotonic() + duration
        while not stop_event.is_set() and time.monotonic() < end_time:
            tasks = []
            for name, cfg in SERVICES.items():
                for endpoint in cfg["endpoints"]:
                    url = f"http://{host}:{cfg['port']}{endpoint}"
                    tasks.append(fetch(session, url, all_stats[name]))
            await asyncio.gather(*tasks)
            await asyncio.sleep(interval)


def print_report(all_stats: dict[str, ServiceStats], duration: int, users: int) -> None:
    print("\n" + "=" * 65)
    print(f"  LOAD TEST REPORT — {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"  Duration: {duration}s | Concurrent users: {users}")
    print("=" * 65)
    print(f"{'Service':<12} {'Requests':>9} {'Errors':>7} {'Error%':>7} {'Avg ms':>8} {'P95 ms':>8}")
    print("-" * 65)

    total_req = total_err = 0
    for name, stats in all_stats.items():
        total_req += stats.total
        total_err += stats.errors
        status = "OK " if stats.error_rate < 5 else "WARN" if stats.error_rate < 20 else "CRIT"
        print(
            f"{name:<12} {stats.total:>9} {stats.errors:>7} "
            f"{stats.error_rate:>6.1f}% {stats.avg_latency:>7.0f} {stats.p95_latency:>7.0f}  [{status}]"
        )

    print("-" * 65)
    overall_err = (total_err / total_req * 100) if total_req else 0
    print(f"{'TOTAL':<12} {total_req:>9} {total_err:>7} {overall_err:>6.1f}%")
    print("=" * 65)

    if overall_err > 5:
        print("\n[!] Error rate above 5% — system under stress, check Grafana")
    else:
        print("\n[+] System stable under load")


async def main(host: str, users: int, duration: int, rps: int) -> None:
    all_stats = {name: ServiceStats(name=name) for name in SERVICES}
    stop_event = asyncio.Event()

    print(f"Starting load test: {users} users, {rps} RPS each, {duration}s duration")
    print(f"Target: {host} | Services: {', '.join(SERVICES.keys())}\n")

    workers = [
        asyncio.create_task(run_worker(host, rps, duration, all_stats, stop_event))
        for _ in range(users)
    ]

    try:
        await asyncio.sleep(duration)
    except asyncio.CancelledError:
        pass
    finally:
        stop_event.set()
        await asyncio.gather(*workers, return_exceptions=True)

    print_report(all_stats, duration, users)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="MoozTau load tester")
    parser.add_argument("--host", default="213.155.22.46", help="Server IP or hostname")
    parser.add_argument("--users", type=int, default=10, help="Concurrent users (default: 10)")
    parser.add_argument("--duration", type=int, default=30, help="Test duration in seconds (default: 30)")
    parser.add_argument("--rps", type=int, default=5, help="Requests per second per user (default: 5)")
    args = parser.parse_args()

    try:
        asyncio.run(main(args.host, args.users, args.duration, args.rps))
    except KeyboardInterrupt:
        print("\nTest interrupted by user")
