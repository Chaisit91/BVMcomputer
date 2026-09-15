"""Dependency-free local HTTP API for the PC compatibility engine."""

from __future__ import annotations

import argparse
import gzip
import hmac
import json
import os
import re
import threading
import time
import webbrowser
from functools import lru_cache
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import parse_qs, urlparse

from compatibility_engine import (
    PART_FILES,
    SelectionError,
    build_recommendations,
    case_checks,
    complete_build_exists,
    compatible_board_sockets,
    cooler_socket_key,
    effective_cooler_sockets,
    load_catalog,
    motherboard_fits_cpu,
    number,
    overall_status,
    psu_checks,
    public_part,
    ram_fits_board,
    recommended_psu_watts,
    select,
    socket_key,
    storage_checks,
)
from build_visualizer import (
    BuildImageError,
    generate_build_turntable,
    selected_image_parts,
)
from upgrade_recommender import recommend_upgrades
from supabase_catalog import load_supabase_catalog
from backend_catalog import load_backend_catalog


def load_runtime_catalog() -> tuple[dict[str, list[dict[str, str]]], str]:
    """Prefer Supabase when configured and retain an offline CSV fallback."""

    backend_url = os.getenv("AI_BACKEND_URL", "").strip()
    if backend_url:
        # Connected mode must never silently serve a different CSV database.
        return load_backend_catalog(backend_url, os.getenv("AI_CATALOG_TOKEN", "")), "backend-postgres"
    project_url = os.getenv("SUPABASE_URL", "").strip()
    publishable_key = os.getenv("SUPABASE_PUBLISHABLE_KEY", "").strip()
    required = os.getenv("BUILDCORES_SUPABASE_REQUIRED") == "1"
    if project_url and publishable_key:
        try:
            catalog = load_supabase_catalog(project_url, publishable_key)
            print("Product catalog: loaded clean data from Supabase")
            return catalog, "supabase"
        except Exception as error:
            if required:
                raise RuntimeError(f"Supabase catalog unavailable: {error}") from error
            print(f"Product catalog: Supabase unavailable ({error}); using local CSV")
    elif required:
        raise RuntimeError(
            "SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are required when "
            "BUILDCORES_SUPABASE_REQUIRED=1"
        )

    # The curated CSV writer orders rows by completeness, coverage and recency.
    # Preserve that order so forward-checking tries the safest paths first.
    return load_catalog(), "csv"


CATALOG, CATALOG_SOURCE = load_runtime_catalog()
BY_ID = {
    part_type: {row.get("opendb_id", ""): row for row in rows}
    for part_type, rows in CATALOG.items()
}


def attach_database_image_urls() -> None:
    """Attach optional PostgreSQL image URLs to the in-memory CSV catalog."""
    if CATALOG_SOURCE != "csv":
        return
    if not os.getenv("PGPASSWORD") and os.getenv("BUILDCORES_LOAD_DB_IMAGES") != "1":
        print("Product images: PostgreSQL loading is disabled")
        return
    try:
        import psycopg2
        from psycopg2 import sql
    except ImportError:
        print("Product images: psycopg2 is unavailable; image generation is disabled")
        return

    schema = os.getenv("PGSCHEMA", "buildcores_clean")
    if not re.fullmatch(r"[A-Za-z_][A-Za-z0-9_]*", schema):
        print("Product images: invalid PGSCHEMA; image generation is disabled")
        return
    table_by_type = {"case": "pc_case", "cooler": "cpu_cooler"}
    connection = None
    try:
        connection = psycopg2.connect(
            host=os.getenv("PGHOST", "localhost"),
            port=int(os.getenv("PGPORT", "5432")),
            dbname=os.getenv("PGDATABASE", "buildcores_db"),
            user=os.getenv("PGUSER", "postgres"),
            password=os.getenv("PGPASSWORD") or None,
            connect_timeout=3,
        )
        with connection, connection.cursor() as cursor:
            for part_type in PART_FILES:
                table = table_by_type.get(part_type, part_type)
                cursor.execute(sql.SQL(
                    "SELECT opendb_id::text, image_url FROM {}.{} WHERE image_url IS NOT NULL"
                ).format(sql.Identifier(schema), sql.Identifier(table)))
                for opendb_id, image_url in cursor.fetchall():
                    if opendb_id in BY_ID[part_type]:
                        BY_ID[part_type][opendb_id]["image_url"] = image_url
        image_count = sum(bool(row.get("image_url")) for rows in CATALOG.values() for row in rows)
        print(f"Product images: loaded {image_count:,} URLs from PostgreSQL")
    except Exception as error:
        print(f"Product images: PostgreSQL unavailable ({error})")
    finally:
        if connection is not None:
            connection.close()


attach_database_image_urls()


@lru_cache(maxsize=8)
def cached_build_image(*values: str) -> dict:
    selection = dict(zip(PART_FILES, values))
    return generate_build_turntable(selected_image_parts(BY_ID, selection))
BOARDS_BY_SOCKET: dict[str, list[dict[str, str]]] = {}
for _board in CATALOG["motherboard"]:
    BOARDS_BY_SOCKET.setdefault(socket_key(_board.get("socket")), []).append(_board)
COOLERS_BY_SOCKET: dict[str, list[dict[str, str]]] = {}
for _cooler in CATALOG["cooler"]:
    for _socket in effective_cooler_sockets(_cooler):
        COOLERS_BY_SOCKET.setdefault(_socket, []).append(_cooler)
UI_PATH = Path(__file__).resolve().with_name("compatibility_ui.html")


def selected_context(params: dict[str, str], skip: str) -> dict[str, dict[str, str]]:
    context = {}
    for part_type in PART_FILES:
        query = params.get(part_type)
        if part_type != skip and query:
            context[part_type] = BY_ID[part_type].get(query) or select(CATALOG[part_type], query, part_type)
    return context


def filter_compatible_search(
    part_type: str,
    rows: list[dict[str, str]],
    params: dict[str, str],
) -> list[dict[str, str]]:
    context = selected_context(params, part_type)
    cpu = context.get("cpu")
    board = context.get("motherboard")
    gpu = context.get("gpu")
    cooler = context.get("cooler")
    psu = context.get("psu")
    case = context.get("case")

    cpu_boards = CATALOG["motherboard"]
    if cpu:
        cpu_boards = [
            item
            for socket in compatible_board_sockets(cpu.get("socket"))
            for item in BOARDS_BY_SOCKET.get(socket, [])
            if motherboard_fits_cpu(item, cpu)
        ]
    if gpu:
        cpu_boards = [item for item in cpu_boards if (number(item.get("pcie_x16_slots")) or 0) > 0]

    if part_type == "motherboard" and cpu:
        allowed = {item["opendb_id"] for item in cpu_boards}
        rows = [item for item in rows if item.get("opendb_id") in allowed]
    elif part_type == "cooler" and cpu:
        socket = cooler_socket_key(cpu.get("socket"))
        allowed = {item.get("opendb_id") for item in COOLERS_BY_SOCKET.get(socket, [])}
        rows = [item for item in rows if item.get("opendb_id") in allowed]
    elif part_type == "ram" and (board or cpu):
        boards = [board] if board else cpu_boards
        rows = [item for item in rows if any(ram_fits_board(item, candidate) for candidate in boards)]
    elif part_type == "gpu" and board:
        rows = rows if (number(board.get("pcie_x16_slots")) or 0) > 0 else []
    elif part_type == "psu" and cpu:
        minimum = recommended_psu_watts(cpu, gpu)
        rows = [item for item in rows if overall_status(psu_checks(item, minimum, board, gpu)) != "incompatible"]
    elif part_type == "case" and (board or cpu):
        boards = [board] if board else cpu_boards
        rows = [
            item for item in rows
            if any(overall_status(case_checks(item, candidate, gpu, cooler, psu)) != "incompatible" for candidate in boards)
        ]
    elif part_type == "storage" and board:
        rows = [item for item in rows if overall_status(storage_checks(item, board, case, psu)) != "incompatible"]

    # Forward-check every offered product. A locally compatible part is hidden
    # when no combination of the remaining categories can complete the build.
    if cpu or part_type == "cpu":
        return [
            item for item in rows
            if complete_build_exists(CATALOG, {**context, part_type: item})
        ]
    return rows


@lru_cache(maxsize=512)
def compatible_ids(
    part_type: str,
    cpu: str,
    motherboard: str,
    ram: str,
    gpu: str,
    psu: str,
    case: str,
    cooler: str,
    storage: str,
) -> tuple[str, ...]:
    values = (cpu, motherboard, ram, gpu, psu, case, cooler, storage)
    params = dict(zip(PART_FILES, values))
    params[part_type] = ""
    rows = filter_compatible_search(part_type, CATALOG[part_type], params)
    return tuple(row.get("opendb_id", "") for row in rows)


@lru_cache(maxsize=256)
def cached_recommendation(
    cpu: str,
    motherboard: str,
    ram: str,
    gpu: str,
    psu: str,
    case: str,
    cooler: str,
    storage: str,
    limit: int,
) -> dict:
    values = (cpu, motherboard, ram, gpu, psu, case, cooler, storage)
    return build_recommendations(CATALOG, dict(zip(PART_FILES, values)), limit)


@lru_cache(maxsize=512)
def cached_upgrade_recommendation(
    values: tuple[str, ...],
    goal: str,
    target: str,
    limit: int,
) -> dict:
    return recommend_upgrades(
        CATALOG,
        dict(zip(PART_FILES, values)),
        goal=goal,
        target=target,
        limit=limit,
    )


CATALOG_LOCK = threading.RLock()
CATALOG_CHECKED_AT = time.monotonic()


def refresh_catalog_if_needed():
    """Caller holds CATALOG_LOCK throughout the request, including cached reads."""
    global CATALOG_CHECKED_AT
    if CATALOG_SOURCE != "backend-postgres" or time.monotonic() - CATALOG_CHECKED_AT < 10:
        return
    updated = load_backend_catalog(os.environ["AI_BACKEND_URL"], os.environ["AI_CATALOG_TOKEN"])
    if updated != CATALOG:
        CATALOG.clear()
        CATALOG.update(updated)
        BY_ID.clear()
        BY_ID.update({kind: {row['opendb_id']: row for row in rows} for kind, rows in updated.items()})
        BOARDS_BY_SOCKET.clear()
        COOLERS_BY_SOCKET.clear()
        for board in CATALOG['motherboard']:
            BOARDS_BY_SOCKET.setdefault(socket_key(board.get('socket')), []).append(board)
        for cooler in CATALOG['cooler']:
            for socket in effective_cooler_sockets(cooler):
                COOLERS_BY_SOCKET.setdefault(socket, []).append(cooler)
        for function in (compatible_ids, cached_recommendation, cached_upgrade_recommendation, cached_build_image):
            function.cache_clear()
    CATALOG_CHECKED_AT = time.monotonic()


def catalog_request(function):
    def wrapped(self):
        if not self.require_api_auth():
            return
        with CATALOG_LOCK:
            try:
                refresh_catalog_if_needed()
            except Exception:
                self.send_json(503, {'error': 'Backend catalog unavailable; please retry'})
                return
            return function(self)
    return wrapped


class CompatibilityHandler(BaseHTTPRequestHandler):
    server_version = "BuildCoresCompatibility/1.0"
    api_token: str | None = None

    def require_api_auth(self) -> bool:
        """Require a bearer token only when the server is exposed remotely."""
        if self.api_token is None:
            return True
        supplied = self.headers.get("Authorization", "")
        if hmac.compare_digest(supplied, f"Bearer {self.api_token}"):
            return True
        self.send_json(401, {"error": "missing or invalid API token"})
        return False

    def write_body(self, body: bytes) -> None:
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionAbortedError, ConnectionResetError):
            # Browsers routinely cancel an older search request when the page is
            # refreshed or the connection closes. It is not a server failure.
            self.close_connection = True

    def send_json(self, status: int, payload: object, cache_seconds: int = 0) -> None:
        body = json.dumps(payload, ensure_ascii=False, separators=(",", ":")).encode("utf-8")
        compressed = "gzip" in self.headers.get("Accept-Encoding", "").lower() and len(body) > 1024
        if compressed:
            body = gzip.compress(body, compresslevel=5)
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Cache-Control", f"private, max-age={cache_seconds}" if cache_seconds else "no-store")
        if compressed:
            self.send_header("Content-Encoding", "gzip")
        self.end_headers()
        self.write_body(body)

    def send_html(self, path: Path) -> None:
        if not path.exists():
            self.send_json(500, {"error": f"ไม่พบหน้าเว็บ: {path}"})
            return
        body = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", "text/html; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.end_headers()
        self.write_body(body)

    def do_OPTIONS(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler API
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        self.end_headers()

    @catalog_request
    def do_POST(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler API
        try:
            if not self.require_api_auth():
                return
            path = urlparse(self.path).path
            if path not in {"/assemble", "/upgrade-recommend"}:
                self.send_json(404, {"error": "ใช้ POST /assemble หรือ /upgrade-recommend"})
                return
            if path == "/upgrade-recommend":
                length = int(self.headers.get("Content-Length", "0"))
                if length <= 0 or length > 65_536:
                    raise ValueError("request body ต้องเป็น JSON และมีขนาดไม่เกิน 64 KB")
                payload = json.loads(self.rfile.read(length))
                if not isinstance(payload, dict) or not isinstance(payload.get("current_build"), dict):
                    raise ValueError("ต้องส่ง current_build เป็น JSON object")
                values = tuple(
                    str(payload["current_build"].get(part_type, "")).strip()
                    for part_type in PART_FILES
                )
                goal = str(payload.get("goal", "gaming")).strip().lower()
                target = str(payload.get("target", "auto")).strip().lower()
                limit = min(max(int(payload.get("limit", 5)), 1), 20)
                self.send_json(
                    200,
                    cached_upgrade_recommendation(values, goal, target, limit),
                )
                return
            origin = self.headers.get("Origin")
            host = self.headers.get("Host", "")
            if origin and urlparse(origin).netloc.casefold() != host.casefold():
                self.send_json(403, {"error": "ไม่อนุญาตให้เว็บภายนอกเรียกสร้างภาพ"})
                return
            length = int(self.headers.get("Content-Length", "0"))
            if length <= 0 or length > 65_536:
                raise ValueError("request body ต้องเป็น JSON และมีขนาดไม่เกิน 64 KB")
            payload = json.loads(self.rfile.read(length))
            if not isinstance(payload, dict) or not isinstance(payload.get("selection"), dict):
                raise ValueError("ต้องส่ง selection เป็น JSON object")
            selection = {
                part_type: str(payload["selection"].get(part_type, "")).strip()
                for part_type in PART_FILES
            }
            missing = [part_type for part_type, value in selection.items() if not value]
            if missing:
                raise BuildImageError(f"กรุณาเลือกอุปกรณ์ให้ครบ: {', '.join(missing)}")
            values = tuple(selection[part_type] for part_type in PART_FILES)
            recommendation = cached_recommendation(*values, 10)
            if recommendation["validation"]["status"] == "incompatible":
                raise BuildImageError("ชุดอุปกรณ์นี้ไม่ผ่านการตรวจสอบ compatibility")
            self.send_json(200, cached_build_image(*values))
        except (BuildImageError, SelectionError) as error:
            self.send_json(422, {"error": str(error)})
        except (json.JSONDecodeError, TypeError, ValueError) as error:
            self.send_json(400, {"error": str(error)})

    @catalog_request
    def do_GET(self) -> None:  # noqa: N802 - BaseHTTPRequestHandler API
        parsed = urlparse(self.path)
        params = {key: values[-1] for key, values in parse_qs(parsed.query).items()}
        try:
            if parsed.path in {"/health", "/search", "/recommend"} and not self.require_api_auth():
                return
            if parsed.path in {"/", "/index.html"}:
                self.send_html(UI_PATH)
                return
            if parsed.path == "/favicon.ico":
                self.send_response(204)
                self.end_headers()
                return
            if parsed.path == "/health":
                self.send_json(200, {
                    "status": "ok",
                    "catalog_source": CATALOG_SOURCE,
                    "catalog_counts": {key: len(value) for key, value in CATALOG.items()},
                    "cache": {
                        "search": compatible_ids.cache_info()._asdict(),
                        "recommend": cached_recommendation.cache_info()._asdict(),
                        "upgrade": cached_upgrade_recommendation.cache_info()._asdict(),
                    },
                })
                return
            if parsed.path == "/search":
                self.handle_search(params)
                return
            if parsed.path == "/recommend":
                self.handle_recommend(params)
                return
            self.send_json(404, {"error": "ใช้ /health, /search, /recommend, POST /upgrade-recommend หรือ POST /assemble"})
        except SelectionError as error:
            self.send_json(422, {"error": str(error)})
        except (TypeError, ValueError) as error:
            self.send_json(400, {"error": str(error)})

    def handle_search(self, params: dict[str, str]) -> None:
        part_type = params.get("type", "").strip().lower()
        if part_type not in PART_FILES:
            raise ValueError(f"type ต้องเป็นหนึ่งใน: {', '.join(PART_FILES)}")
        query = params.get("q", "").strip().casefold()
        limit = min(max(int(params.get("limit", "20")), 1), 5000)
        offset = max(int(params.get("offset", "0")), 0)
        context_values = tuple(params.get(item, "") if item != part_type else "" for item in PART_FILES)
        allowed = set(compatible_ids(part_type, *context_values))
        rows = [row for row in CATALOG[part_type] if row.get("opendb_id") in allowed]
        if query:
            rows = [
                row for row in rows
                if query in row.get("name", "").casefold()
                or query == row.get("opendb_id", "").casefold()
            ]
        if params.get("compact") in {"1", "true", "yes"}:
            items = [[row.get("opendb_id", ""), row.get("name", "")] for row in rows[offset:offset + limit]]
        else:
            items = [public_part(row) for row in rows[offset:offset + limit]]
        self.send_json(200, {
            "type": part_type,
            "count": len(rows),
            "offset": offset,
            "has_more": offset + len(items) < len(rows),
            "items": items,
        }, cache_seconds=0 if CATALOG_SOURCE == "backend-postgres" else 300)

    def handle_recommend(self, params: dict[str, str]) -> None:
        if not params.get("cpu"):
            raise ValueError("ต้องระบุ query parameter: cpu")
        limit = min(max(int(params.pop("limit", "10")), 1), 100)
        values = tuple(params.get(part, "") for part in PART_FILES)
        self.send_json(200, cached_recommendation(*values, limit))

    def log_message(self, format: str, *args: object) -> None:
        print(f"{self.client_address[0]} - {format % args}")


def main() -> None:
    parser = argparse.ArgumentParser(description="BuildCores compatibility HTTP API")
    parser.add_argument("--host", default="127.0.0.1")
    parser.add_argument("--port", type=int, default=8000)
    parser.add_argument("--open-browser", action="store_true")
    args = parser.parse_args()
    remote = args.host not in {"127.0.0.1", "localhost", "::1"}
    api_token = os.getenv("BUILDCORES_API_TOKEN", "")
    if remote and len(api_token) < 32:
        parser.error(
            "BUILDCORES_API_TOKEN must contain at least 32 characters when --host is remote"
        )
    CompatibilityHandler.api_token = api_token or None
    server = ThreadingHTTPServer((args.host, args.port), CompatibilityHandler)
    browser_host = "127.0.0.1" if args.host in {"0.0.0.0", "::"} else args.host
    browser_url = f"http://{browser_host}:{server.server_port}/"
    print(f"Compatibility API: {browser_url}")
    print("Endpoints: /health, /search, /recommend, POST /upgrade-recommend, POST /assemble")
    if args.open_browser:
        threading.Timer(0.5, webbrowser.open, args=(browser_url,)).start()
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
