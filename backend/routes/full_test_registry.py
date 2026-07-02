"""
Full Test registry + serving endpoints: test-set catalog, per-test and
per-section retrieval, and answer stripping for student view.

Extracted from routes/full_test.py (Faz 1 refactor, 2026-07-02).
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, List, Any, Optional

router = APIRouter(prefix="/api/full-test", tags=["Full Test Mode"])

# Import test structure utilities
try:
    from content.full_tests.test_structure import (
        TestType, SectionType, TEST_TIMINGS,
        calculate_listening_band, calculate_reading_band,
        calculate_overall_band, validate_full_test
    )
except ImportError:
    print("Warning: Could not import test_structure")

# Import test sets
try:
    from content.full_tests.academic.set_a import ACADEMIC_SET_A, get_academic_set_a
    from content.full_tests.academic.set_a_reading import ACADEMIC_SET_A_READING
except ImportError:
    ACADEMIC_SET_A = None
    ACADEMIC_SET_A_READING = None
    print("Warning: Could not import Academic Set A")

# Import General Training test sets
try:
    from content.full_tests.general.set_a import GENERAL_SET_A, get_general_set_a
except ImportError:
    GENERAL_SET_A = None
    print("Warning: Could not import General Training Set A")

# Import Set B content
try:
    from content.full_tests.academic.set_b import ACADEMIC_SET_B
    from content.full_tests.academic.set_b_reading import ACADEMIC_SET_B_READING
except ImportError:
    ACADEMIC_SET_B = None
    ACADEMIC_SET_B_READING = None
    print("Warning: Could not import Academic Set B")

try:
    from content.full_tests.general.set_b import GENERAL_SET_B
except ImportError:
    GENERAL_SET_B = None
    print("Warning: Could not import General Training Set B")

# Import Set C content
try:
    from content.full_tests.academic.set_c import ACADEMIC_SET_C
    from content.full_tests.academic.set_c_reading import ACADEMIC_SET_C_READING
except ImportError:
    ACADEMIC_SET_C = None
    ACADEMIC_SET_C_READING = None
    print("Warning: Could not import Academic Set C")

try:
    from content.full_tests.general.set_c import GENERAL_SET_C
except ImportError:
    GENERAL_SET_C = None
    print("Warning: Could not import General Training Set C")

# Import Set D content
try:
    from content.full_tests.academic.set_d import ACADEMIC_SET_D
    from content.full_tests.academic.set_d_reading import ACADEMIC_SET_D_READING
except ImportError:
    ACADEMIC_SET_D = None
    ACADEMIC_SET_D_READING = None
    print("Warning: Could not import Academic Set D")

try:
    from content.full_tests.general.set_d import GENERAL_SET_D
except ImportError:
    GENERAL_SET_D = None
    print("Warning: Could not import General Training Set D")

# Import Set E content
try:
    from content.full_tests.academic.set_e import ACADEMIC_SET_E
except ImportError:
    ACADEMIC_SET_E = None
    print("Warning: Could not import Academic Set E")

# Import Set F content
try:
    from content.full_tests.academic.set_f import ACADEMIC_SET_F
except ImportError:
    ACADEMIC_SET_F = None
    print("Warning: Could not import Academic Set F")

# Import Set G content
try:
    from content.full_tests.academic.set_g import ACADEMIC_SET_G
except ImportError:
    ACADEMIC_SET_G = None
    print("Warning: Could not import Academic Set G")

# Import Set H content
try:
    from content.full_tests.academic.set_h import ACADEMIC_SET_H
except ImportError:
    ACADEMIC_SET_H = None
    print("Warning: Could not import Academic Set H")

# Import Cambridge IELTS content
try:
    from content.cambridge_tests.ielts17.test1 import IELTS17_TEST1
except ImportError:
    IELTS17_TEST1 = None
    print("Warning: Could not import Cambridge IELTS 17 Test 1")



# ============ TEST REGISTRY ============

def get_all_test_sets() -> Dict[str, Any]:
    """Get all available test sets."""
    sets = {
        "academic": [],
        "general": []
    }
    
    # Academic sets
    for test_data in [ACADEMIC_SET_A, ACADEMIC_SET_B, ACADEMIC_SET_C, ACADEMIC_SET_D, ACADEMIC_SET_E, ACADEMIC_SET_F, ACADEMIC_SET_G, ACADEMIC_SET_H]:
        if test_data:
            sets["academic"].append({
                "test_id": test_data["test_id"],
                "title": test_data["title"],
                "description": test_data["description"],
                "estimated_time": test_data["estimated_time"],
                "sections_available": list(test_data["sections"].keys())
            })
    
    # General Training sets
    for test_data in [GENERAL_SET_A, GENERAL_SET_B, GENERAL_SET_C, GENERAL_SET_D]:
        if test_data:
            sets["general"].append({
                "test_id": test_data["test_id"],
                "title": test_data["title"],
                "description": test_data["description"],
                "estimated_time": test_data["estimated_time"],
                "sections_available": list(test_data["sections"].keys())
            })
    
    return sets


def get_test_by_id(test_id: str) -> Optional[Dict[str, Any]]:
    """Get a specific test by ID."""
    if test_id == "academic_set_a_01":
        test = ACADEMIC_SET_A.copy()
        test["sections"]["reading"] = ACADEMIC_SET_A_READING
        return test
    elif test_id == "academic_set_b_01":
        if ACADEMIC_SET_B and ACADEMIC_SET_B_READING:
            test = ACADEMIC_SET_B.copy()
            test["sections"]["reading"] = ACADEMIC_SET_B_READING
            return test
    elif test_id == "academic_set_c_01":
        if ACADEMIC_SET_C and ACADEMIC_SET_C_READING:
            test = ACADEMIC_SET_C.copy()
            test["sections"]["reading"] = ACADEMIC_SET_C_READING
            return test
    elif test_id == "academic_set_d_01":
        if ACADEMIC_SET_D and ACADEMIC_SET_D_READING:
            test = ACADEMIC_SET_D.copy()
            test["sections"]["reading"] = ACADEMIC_SET_D_READING
            return test
    elif test_id == "academic_set_e_01":
        if ACADEMIC_SET_E:
            return ACADEMIC_SET_E
    elif test_id == "academic_set_f_01":
        if ACADEMIC_SET_F:
            return ACADEMIC_SET_F
    elif test_id == "academic_set_g_01":
        if ACADEMIC_SET_G:
            return ACADEMIC_SET_G
    elif test_id == "academic_set_h_01":
        if ACADEMIC_SET_H:
            return ACADEMIC_SET_H
    elif test_id == "general_set_a_01":
        return GENERAL_SET_A
    elif test_id == "general_set_b_01":
        return GENERAL_SET_B
    elif test_id == "general_set_c_01":
        return GENERAL_SET_C
    elif test_id == "general_set_d_01":
        return GENERAL_SET_D
    # Cambridge IELTS Tests
    elif test_id == "ielts17_test1":
        return IELTS17_TEST1
    return None


# ============ API ENDPOINTS ============

@router.get("/sets")
async def list_test_sets(
    test_type: Optional[str] = Query(None, description="Filter by test type: academic or general")
):
    """
    List all available IELTS-style full test sets.
    
    Returns test sets with metadata, without actual content.
    """
    all_sets = get_all_test_sets()
    
    if test_type:
        if test_type not in ["academic", "general"]:
            raise HTTPException(status_code=400, detail="Invalid test_type. Use 'academic' or 'general'")
        return {
            "success": True,
            "test_type": test_type,
            "sets": all_sets.get(test_type, []),
            "total": len(all_sets.get(test_type, []))
        }
    
    return {
        "success": True,
        "academic_sets": all_sets["academic"],
        "general_sets": all_sets["general"],
        "total_academic": len(all_sets["academic"]),
        "total_general": len(all_sets["general"])
    }


@router.get("/set/{test_id}")
async def get_test_set(
    test_id: str,
    include_answers: bool = Query(False, description="Include answers (for review mode only)")
):
    """
    Get a specific full test set with all content.
    
    Note: Answers are only included if explicitly requested (e.g., for review).
    In normal test mode, answers should NOT be requested.
    """
    test = get_test_by_id(test_id)
    
    if not test:
        raise HTTPException(status_code=404, detail=f"Test set '{test_id}' not found")
    
    # Remove answers if not requested
    if not include_answers:
        test = strip_answers(test)
    
    return {
        "success": True,
        "test": test
    }


@router.get("/set/{test_id}/section/{section}")
async def get_test_section(
    test_id: str,
    section: str,
    include_answers: bool = Query(False)
):
    """
    Get a specific section of a test (listening, reading, writing, or speaking).
    
    Useful for section-by-section test taking mode.
    """
    test = get_test_by_id(test_id)
    
    if not test:
        raise HTTPException(status_code=404, detail=f"Test set '{test_id}' not found")
    
    if section not in test.get("sections", {}):
        raise HTTPException(status_code=404, detail=f"Section '{section}' not found in test")
    
    section_data = test["sections"][section]
    
    if not include_answers:
        section_data = strip_section_answers(section, section_data)
    
    return {
        "success": True,
        "test_id": test_id,
        "test_type": test["test_type"],
        "section": section,
        "timing": TEST_TIMINGS.get(section, {}),
        "data": section_data
    }


# ============ HELPER FUNCTIONS ============

def strip_answers(test: Dict) -> Dict:
    """Remove answers from test for student view."""
    import copy
    test = copy.deepcopy(test)
    
    for section_name, section in test.get("sections", {}).items():
        test["sections"][section_name] = strip_section_answers(section_name, section)
    
    return test


def strip_section_answers(section_name: str, section: Dict) -> Dict:
    """Remove answers from a specific section."""
    import copy
    section = copy.deepcopy(section)
    
    if section_name == "listening":
        for part in section.get("parts", []):
            for q in part.get("questions", []):
                q.pop("answer", None)
                q.pop("explanation", None)
    
    elif section_name == "reading":
        for passage in section.get("passages", []):
            for q in passage.get("questions", []):
                q.pop("answer", None)
                q.pop("explanation", None)
    
    return section
