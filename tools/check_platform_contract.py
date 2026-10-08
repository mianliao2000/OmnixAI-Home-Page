"""Pinned public integration contract. Update all repositories for a new version."""
import hashlib
import json
from pathlib import Path
root = Path(__file__).resolve().parents[1]
data = json.loads((root / 'contracts/platform-v1.json').read_text(encoding='utf-8'))
assert data['version'] == 1
assert hashlib.sha256(json.dumps(data, sort_keys=True, separators=(',', ':')).encode()).hexdigest() == '0a70fad0d3b200958ec8eb07f511173b005b6f2297d0c826996ab2d2529cbb65', 'Platform contract changed without a versioned migration'
for filename, fragments in json.loads((root / 'contracts/platform-bindings.json').read_text(encoding='utf-8')).items():
    source = (root / filename).read_text(encoding='utf-8')
    for fragment in fragments:
        assert fragment in source, f'{filename}: missing contract binding {fragment}'
print('Platform integration v1 passed')
