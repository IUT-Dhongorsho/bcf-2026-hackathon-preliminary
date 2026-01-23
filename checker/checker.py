import requests
import json
import sys
from decimal import Decimal
import argparse

BASE_URL = "http://localhost:8000"

def normalize(value):
    if isinstance(value, float):
        return round(value, 2)
    if isinstance(value, str):
        try:
            return round(float(value), 2)
        except:
            return value
    return value

def check_health():
    r = requests.get(f"{BASE_URL}/health", timeout=5)
    if r.status_code != 200:
        raise RuntimeError("Health check failed")
    data = r.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"

def run_tests():
    with open("test_cases.json") as f:
        tests = json.load(f)

    passed = 0

    for t in tests:
        r = requests.post(
            f"{BASE_URL}/query",
            json={
                "question": t["question"],
                "llm": "gpt-4o-mini"
            },
            timeout=30
        )

        if r.status_code != 200:
            continue

        res = r.json()

        if res["result_type"] != t["result_type"]:
            continue

        exp_rows = t["expected"]["rows"]
        got_rows = res["rows"]

        exp_norm = [[normalize(x) for x in row] for row in exp_rows]
        got_norm = [[normalize(x) for x in row] for row in got_rows]

        if exp_norm == got_norm:
            passed += 1

    print(f"Passed {passed}/{len(tests)} tests")

def main():
    parser = argparse.ArgumentParser(description="Run checker against a server")
    parser.add_argument(
        "--base-url", "-b",
        default=BASE_URL,
        help="Base URL of the server (e.g. http://localhost:8000)"
    )
    args = parser.parse_args()

    global BASE_URL
    BASE_URL = args.base_url.rstrip('/')  # normalize trailing slash

    try:
        check_health()
        run_tests()
    except Exception as e:
        print("Checker failed:", e)
        sys.exit(1)

if __name__ == "__main__":
    main()