"""
Fetch GitHub repository metrics for cursimple plugins and write them to JSON.

The source plugins.json is expected to be a JSON array of "owner/repo" strings.
"""

from __future__ import annotations

import argparse
import json
import os
import sys
import tempfile
from datetime import datetime, timezone
from pathlib import Path
from typing import Any
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen


DEFAULT_SOURCE_URL = (
    "https://raw.githubusercontent.com/"
    "cursimple/cursimple-plugins/refs/heads/main/plugins.json"
)
DEFAULT_OUTPUT = "plugins-stars.json"
GRAPHQL_URL = "https://api.github.com/graphql"


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat()


def request_json(url: str, *, token: str | None = None, payload: dict[str, Any] | None = None) -> Any:
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    headers = {
        "Accept": "application/json",
        "User-Agent": "github-star-fetch",
    }

    if token:
        headers["Authorization"] = f"Bearer {token}"
        headers["Content-Type"] = "application/json"

    request = Request(url, data=data, headers=headers, method="POST" if payload else "GET")

    try:
        with urlopen(request, timeout=60) as response:
            return json.loads(response.read().decode("utf-8"))
    except HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"HTTP {exc.code} from {url}: {body}") from exc
    except URLError as exc:
        raise RuntimeError(f"Failed to request {url}: {exc.reason}") from exc


def load_repo_names(source_url: str) -> list[str]:
    data = request_json(source_url)

    if not isinstance(data, list):
        raise ValueError("plugins.json must be a JSON array")

    repo_names: list[str] = []
    for index, item in enumerate(data, start=1):
        if not isinstance(item, str):
            raise ValueError(f"plugins.json item #{index} must be a string")

        repo_name = item.strip()
        parts = repo_name.split("/")
        if len(parts) != 2 or not all(parts):
            raise ValueError(f"plugins.json item #{index} must use owner/repo format: {item!r}")

        repo_names.append(repo_name)

    return repo_names


def build_query(repo_names: list[str]) -> str:
    fields: list[str] = []

    for index, repo_name in enumerate(repo_names, start=1):
        owner, name = repo_name.split("/", 1)
        fields.append(
            f"""
    repo{index:03d}: repository(owner: {json.dumps(owner)}, name: {json.dumps(name)}) {{
      nameWithOwner
      stargazerCount
      forkCount
      createdAt
      updatedAt
      description
      issues(states: OPEN) {{ totalCount }}
      watchers {{ totalCount }}
      primaryLanguage {{ name }}
      licenseInfo {{ name spdxId }}
    }}"""
        )

    return (
        "query GetPluginRepositoryStars {"
        + "".join(fields)
        + """
    rateLimit {
      limit
      remaining
      used
      resetAt
      cost
    }
  }"""
    )


def repository_from_graphql(value: dict[str, Any], source_order: int) -> dict[str, Any]:
    primary_language = value.get("primaryLanguage")
    license_info = value.get("licenseInfo")

    return {
        "name": value["nameWithOwner"],
        "stars": value["stargazerCount"],
        "forks": value.get("forkCount", 0),
        "open_issues": value.get("issues", {}).get("totalCount", 0),
        "watchers": value.get("watchers", {}).get("totalCount", 0),
        "language": primary_language["name"] if primary_language else "Unknown",
        "license": license_info["spdxId"] if license_info else "Unknown",
        "created_at": value.get("createdAt", ""),
        "updated_at": value.get("updatedAt", ""),
        "description": value.get("description") or "",
        "source_order": source_order,
    }


def fetch_repo_batch(repo_names: list[str], token: str) -> tuple[list[dict[str, Any]], dict[str, Any]]:
    response = request_json(GRAPHQL_URL, token=token, payload={"query": build_query(repo_names)})

    if not isinstance(response, dict):
        raise RuntimeError("GitHub GraphQL response must be a JSON object")

    if response.get("errors"):
        raise RuntimeError(f"GitHub GraphQL returned errors: {json.dumps(response['errors'])}")

    data = response.get("data")
    if not isinstance(data, dict):
        raise RuntimeError("GitHub GraphQL response is missing data")

    repositories: list[dict[str, Any]] = []
    for index in range(1, len(repo_names) + 1):
        key = f"repo{index:03d}"
        value = data.get(key)
        if value is None:
            raise RuntimeError(f"GitHub GraphQL returned no data for {repo_names[index - 1]}")
        repositories.append(repository_from_graphql(value, source_order=index))

    rate_limit = data.get("rateLimit")
    if not isinstance(rate_limit, dict):
        raise RuntimeError("GitHub GraphQL response is missing rateLimit")

    return repositories, rate_limit


def fetch_all_repos(repo_names: list[str], token: str, batch_size: int) -> tuple[list[dict[str, Any]], list[dict[str, Any]]]:
    repositories: list[dict[str, Any]] = []
    rate_limits: list[dict[str, Any]] = []

    for start in range(0, len(repo_names), batch_size):
        batch = repo_names[start : start + batch_size]
        batch_number = start // batch_size + 1
        print(f"Fetching batch {batch_number}: {len(batch)} repositories")

        batch_repositories, rate_limit = fetch_repo_batch(batch, token)
        repositories.extend(batch_repositories)
        rate_limits.append(rate_limit)

        print(
            "Fetched batch "
            f"{batch_number}: cost={rate_limit.get('cost')}, "
            f"remaining={rate_limit.get('remaining')}"
        )

    return repositories, rate_limits


def write_json_file(path: Path, data: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)

    with tempfile.NamedTemporaryFile(
        "w",
        encoding="utf-8",
        delete=False,
        dir=str(path.parent),
        prefix=f".{path.name}.",
        suffix=".tmp",
    ) as temp_file:
        json.dump(data, temp_file, ensure_ascii=False, indent=2)
        temp_file.write("\n")
        temp_name = temp_file.name

    Path(temp_name).replace(path)


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fetch repository metrics for cursimple plugins and write JSON data."
    )
    parser.add_argument("--source-url", default=DEFAULT_SOURCE_URL)
    parser.add_argument("--output", default=DEFAULT_OUTPUT)
    parser.add_argument("--batch-size", type=int, default=100)
    parser.add_argument("--token-env", default="GITHUB_TOKEN")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    token = os.environ.get(args.token_env)
    if not token:
        print(f"Environment variable {args.token_env} is required", file=sys.stderr)
        return 1

    if args.batch_size < 1 or args.batch_size > 100:
        print("--batch-size must be between 1 and 100", file=sys.stderr)
        return 1

    repo_names = load_repo_names(args.source_url)
    print(f"Loaded {len(repo_names)} repositories from {args.source_url}")

    repositories, rate_limits = fetch_all_repos(repo_names, token, args.batch_size)
    repositories_by_stars = sorted(repositories, key=lambda item: item["stars"], reverse=True)
    total_stars = sum(item["stars"] for item in repositories)

    output = {
        "generated_at": utc_now_iso(),
        "source": {
            "url": args.source_url,
            "count": len(repo_names),
        },
        "repository_count": len(repositories),
        "total_stars": total_stars,
        "average_stars": round(total_stars / len(repositories)) if repositories else 0,
        "rate_limits": rate_limits,
        "repositories": repositories_by_stars,
    }

    write_json_file(Path(args.output), output)
    print(f"Wrote {len(repositories)} repositories to {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
