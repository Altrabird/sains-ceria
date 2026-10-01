"""Stage the site for the VPS, or build one game's Android APK.

  python tools/build.py web             -> dist/web/   (hub + shared + every game; upload this folder to the VPS)
  python tools/build.py apk T2-amali    -> games/T2-amali/build/T2-amali.apk  (Capacitor, debug-signed)

Dev-only files (tools/, blender/, viewer/, tests, .py) never ship."""
import json, os, shutil, subprocess, sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
SKIP = shutil.ignore_patterns("tools", "blender", "viewer", "build", "*.test.mjs", "*.py", "*.blend*", "__pycache__")
JAVA_HOME = r"C:\Program Files\Android\Android Studio\jbr"
SDK = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Android", "Sdk")


def games():
    """games.json is the hub's list; it must match the folders exactly."""
    listed = json.load(open(os.path.join(ROOT, "games.json"), encoding="utf-8"))
    ids = [g["id"] for g in listed]
    dirs = sorted(d for d in os.listdir(os.path.join(ROOT, "games")) if os.path.isfile(os.path.join(ROOT, "games", d, "index.html")))
    if sorted(ids) != dirs:
        sys.exit(f"games.json {sorted(ids)} != games/ folders {dirs}")
    return {g["id"]: g for g in listed}


def stage(out, ids):
    shutil.rmtree(out, ignore_errors=True)
    shutil.copytree(os.path.join(ROOT, "shared"), os.path.join(out, "shared"), ignore=SKIP)
    for gid in ids:
        shutil.copytree(os.path.join(ROOT, "games", gid), os.path.join(out, "games", gid), ignore=SKIP)


def web():
    all_games = games()
    out = os.path.join(ROOT, "dist", "web")
    stage(out, all_games)
    for f in ("index.html", "games.json"):
        shutil.copy(os.path.join(ROOT, f), out)
    mb = sum(os.path.getsize(os.path.join(d, f)) for d, _, fs in os.walk(out) for f in fs) / 1e6
    print(f"dist/web: {len(all_games)} games, {mb:.1f} MB")


def apk(gid):
    g = games()[gid]
    out = os.path.join(ROOT, "dist", "apk")
    stage(out, [gid])
    # app opens straight into the game (a file path: Capacitor answers bare folder URLs with the root index -> loop); the game's "← Semua permainan" link lands back here -> back into the game
    open(os.path.join(out, "index.html"), "w", encoding="utf-8").write(
        f'<!doctype html><meta charset="utf-8"><script>location.replace("/games/{gid}/index.html")</script>')
    env = {**os.environ, "JAVA_HOME": JAVA_HOME, "ANDROID_HOME": SDK}
    subprocess.run("npx cap sync android", shell=True, cwd=ROOT, env=env, check=True)
    app_id = "my.sains." + gid.lower().replace("-", "_")  # own id per game -> all games install side by side
    name = f"Sains T{g['year']} " + (f"U{g['unit']} " if g.get("unit") else "") + g["title"]
    gradlew = os.path.join(ROOT, "android", "gradlew.bat" if os.name == "nt" else "gradlew")
    subprocess.run([gradlew, "assembleDebug", f"-PappId={app_id}", f"-PappName={name}"], cwd=os.path.join(ROOT, "android"), env=env, check=True)
    dst = os.path.join(ROOT, "games", gid, "build", gid + ".apk")
    os.makedirs(os.path.dirname(dst), exist_ok=True)
    shutil.copy(os.path.join(ROOT, "android", "app", "build", "outputs", "apk", "debug", "app-debug.apk"), dst)
    print(f"{dst}  ({os.path.getsize(dst) / 1e6:.1f} MB, {app_id}, '{name}')")


if __name__ == "__main__":
    if sys.argv[1:2] == ["web"]:
        web()
    elif sys.argv[1:2] == ["apk"] and len(sys.argv) == 3:
        apk(sys.argv[2])
    else:
        sys.exit(__doc__)
