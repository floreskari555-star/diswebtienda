"""
Keep-Alive para Render.com (plan gratuito)
Pingea /health cada 4-11 minutos (intervalo aleatorio) para evitar que el servicio se duerma.
Uso: python scripts/keepalive.py
"""
import time
import random
import urllib.request
import urllib.error
from datetime import datetime

BACKEND_URL = "https://diswebtienda.onrender.com"
HEALTH_ENDPOINT = f"{BACKEND_URL}/health"
MIN_INTERVAL = 240   # 4 minutos
MAX_INTERVAL = 660   # 11 minutos


def ping():
    try:
        req = urllib.request.Request(HEALTH_ENDPOINT, method="GET")
        with urllib.request.urlopen(req, timeout=30) as resp:
            status = resp.status
            body = resp.read().decode()
            now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            print(f"[{now}] OK {status} - {body[:120]}")
            return True
    except urllib.error.URLError as e:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{now}] ERROR: {e}")
        return False
    except Exception as e:
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{now}] ERROR inesperado: {e}")
        return False


def main():
    print(f"Keep-Alive iniciado. Pingeando {HEALTH_ENDPOINT}")
    print(f"Intervalo: {MIN_INTERVAL//60}-{MAX_INTERVAL//60} minutos (aleatorio)")
    print("-" * 60)

    # Primer ping inmediato
    ping()

    while True:
        interval = random.randint(MIN_INTERVAL, MAX_INTERVAL)
        now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        print(f"[{now}] Proximo ping en {interval//60}m {interval%60}s")
        time.sleep(interval)
        ping()


if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\nKeep-Alive detenido por el usuario.")
