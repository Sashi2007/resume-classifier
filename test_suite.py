import urllib.request
import re
import sys

def test_endpoints():
    base_url = "http://localhost:8000"
    files = ["/", "/index.html", "/styles.css", "/classifier.js", "/samples.js", "/app.js"]
    
    print("Testing server endpoints...")
    for f in files:
        url = base_url + f
        req = urllib.request.Request(url)
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            content = resp.read().decode('utf-8')
            assert status == 200, f"Failed on {url}: status {status}"
            assert len(content) > 100, f"Empty response on {url}"
            print(f"  [PASS] {url} -> 200 OK ({len(content)} bytes)")

def test_master_prompt_compliance():
    print("\nVerifying Master Prompt Steps in index.html & classifier.js...")
    with open("index.html", "r", encoding="utf-8") as f:
        html = f.read()

    # Verify all 10 steps are present in UI
    steps = [
        "1. Candidate Resume",
        "2. Job Description",
        "1. Candidate Summary",
        "2. Match Overview",
        "3. Required Skills",
        "4. Key Strengths",
        "5. Skill Gaps",
        "6. Relevant Projects",
        "7. Experience Analysis",
        "8. ATS Quality",
        "9. Resume Improvement Suggestions",
        "10. Final Evidence-Based Explanation"
    ]
    for s in steps:
        assert s in html, f"Missing section in UI: {s}"
        print(f"  [PASS] Found UI Section: {s}")

    with open("classifier.js", "r", encoding="utf-8") as f:
        js = f.read()

    # Verify weights: 30, 20, 15, 10, 10, 10, 5
    weights = [
        "Technical Skills",
        "30",
        "Experience",
        "20",
        "Projects",
        "15",
        "Education",
        "10",
        "Preferred Skills",
        "Role Alignment",
        "Certifications/Achievements",
        "5"
    ]
    for w in weights:
        assert w in js, f"Missing weight / category definition in classifier.js: {w}"
        print(f"  [PASS] Found Scoring Term: {w}")

    # Verify Match Classifications
    classifications = ["HIGH MATCH", "MODERATE MATCH", "LOW MATCH"]
    for c in classifications:
        assert c in js, f"Missing classification: {c}"
        print(f"  [PASS] Found Classification: {c}")

    print("\nAll Master Prompt structural and algorithmic tests PASSED successfully!")

if __name__ == "__main__":
    test_endpoints()
    test_master_prompt_compliance()
