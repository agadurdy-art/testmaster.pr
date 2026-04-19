"""
Visual Asset Schema & Validation
=================================
HARD GUARANTEE: NO AI-GENERATED VISUALS ALLOWED
All visuals must come from user_upload or pdf_crop sources.
"""

from typing import Optional, Literal, List
from pydantic import BaseModel, Field, validator
from datetime import datetime
from enum import Enum
import os


# ============ ENUMS ============

class VisualSource(str, Enum):
    """Allowed visual sources - AI generation is FORBIDDEN"""
    USER_UPLOAD = "user_upload"
    PDF_CROP = "pdf_crop"


class VisualKind(str, Enum):
    """Types of visuals in IELTS tests"""
    LINE_GRAPH = "line_graph"
    BAR_CHART = "bar_chart"
    PIE_CHART = "pie_chart"
    TABLE = "table"
    MAP = "map"
    DIAGRAM = "diagram"
    PROCESS = "process"
    FLOOR_PLAN = "floor_plan"
    OTHER = "other"


class VisualSkill(str, Enum):
    """Skills that may require visuals"""
    WRITING = "writing"
    LISTENING = "listening"
    READING = "reading"


class TestStatus(str, Enum):
    """
    Test Publication Workflow Status
    ================================
    DRAFT → FAILED_VALIDATION → PENDING_QA → APPROVED → PUBLISHED
    
    Rules:
    - Only APPROVED/PUBLISHED tests appear in user-facing lists
    - Only APPROVED/PUBLISHED tests feed into practice pools
    - Any content change after APPROVED reverts to PENDING_QA
    """
    DRAFT = "DRAFT"                       # Ingested but not reviewed
    FAILED_VALIDATION = "FAILED_VALIDATION"  # Blocked - has errors
    PENDING_QA = "PENDING_QA"             # Passed validation, awaiting human review
    APPROVED = "APPROVED"                 # Human approved, ready for publish
    PUBLISHED = "PUBLISHED"               # Public to users


# ============ VISUAL ASSET MODEL ============

class VisualAsset(BaseModel):
    """
    Visual Asset - REQUIRED for all test visuals
    
    HARD RULES:
    - source MUST be 'user_upload' or 'pdf_crop'
    - AI-generated visuals are FORBIDDEN
    - All Writing Task 1 must have a visual
    - All Listening maps/diagrams must have a visual
    """
    asset_id: str = Field(..., min_length=1)
    test_id: str = Field(..., min_length=1)
    skill: VisualSkill
    kind: VisualKind
    source: VisualSource = Field(..., description="MUST be user_upload or pdf_crop - AI forbidden")
    image_src: str = Field(..., min_length=1)
    
    # Traceability for pdf_crop
    page_num: Optional[int] = None
    bbox: Optional[dict] = None  # {x, y, width, height}
    
    # Metadata
    uploaded_at: datetime = Field(default_factory=datetime.utcnow)
    uploaded_by: Optional[str] = None
    
    # Validation
    verified: bool = False
    verified_by: Optional[str] = None
    verified_at: Optional[datetime] = None
    
    @validator('source')
    def block_ai_generated(cls, v):
        """HARD BLOCK: AI visuals are forbidden"""
        if v not in [VisualSource.USER_UPLOAD, VisualSource.PDF_CROP]:
            raise ValueError(f"BLOCKED: source '{v}' is not allowed. Only 'user_upload' or 'pdf_crop' are permitted.")
        return v
    
    @validator('image_src')
    def validate_image_path(cls, v):
        """Ensure image path is not AI-generated marker"""
        forbidden_markers = ['ai_generated', 'generated=true', 'openai', 'dalle', 'midjourney', 'stable-diffusion']
        lower_v = v.lower()
        for marker in forbidden_markers:
            if marker in lower_v:
                raise ValueError(f"BLOCKED: Image path contains forbidden AI marker '{marker}'")
        return v


class VisualAssetRegistry(BaseModel):
    """Registry of all visual assets for a test"""
    test_id: str
    assets: List[VisualAsset] = []
    required_slots: List[dict] = []  # {skill, kind, slot_name, filled}
    all_filled: bool = False
    
    def get_missing_slots(self) -> List[dict]:
        """Get list of required but missing visual slots"""
        return [s for s in self.required_slots if not s.get('filled', False)]


# ============ VISUAL VALIDATION ============

class VisualValidationError(Exception):
    """Raised when visual validation fails"""
    pass


class VisualValidator:
    """
    HARD VALIDATION GATE FOR VISUALS
    =================================
    Blocks any test that:
    1. Has AI-generated visuals
    2. Has missing required visuals
    3. Has invalid visual sources
    """
    
    # Forbidden indicators in visual metadata
    FORBIDDEN_AI_INDICATORS = [
        'ai_generated',
        'generated=true',
        'source=ai',
        'openai',
        'dalle',
        'midjourney',
        'stable-diffusion',
        'imagen',
        'gemini-image',
        'gpt-image',
        'nano-banana'
    ]
    
    @staticmethod
    def validate_visual(visual: dict) -> tuple[bool, List[str]]:
        """
        Validate a single visual.
        Returns (is_valid, errors)
        """
        errors = []
        
        # Check source
        source = visual.get('source', visual.get('type', ''))
        source_lower = str(source).lower()
        
        # HARD BLOCK: Check for AI indicators
        for indicator in VisualValidator.FORBIDDEN_AI_INDICATORS:
            if indicator in source_lower:
                errors.append(f"BLOCKED: Visual has forbidden AI source indicator '{indicator}'")
        
        # Check image_src for AI markers
        image_src = visual.get('image_src', visual.get('image_url', ''))
        image_src_lower = str(image_src).lower()
        
        for indicator in VisualValidator.FORBIDDEN_AI_INDICATORS:
            if indicator in image_src_lower:
                errors.append(f"BLOCKED: Visual image_src contains forbidden AI marker '{indicator}'")
        
        # Check 'generated' flag
        if visual.get('generated') == True or visual.get('ai_generated') == True:
            errors.append("BLOCKED: Visual has generated=true flag (AI visuals forbidden)")
        
        # Check for valid source type
        valid_sources = ['user_upload', 'pdf_crop', 'line_graph', 'bar_chart', 'pie_chart', 'table', 'map', 'diagram', 'process']
        if source and source_lower not in [s.lower() for s in valid_sources]:
            if 'ai' in source_lower or 'generated' in source_lower:
                errors.append(f"BLOCKED: Invalid visual source '{source}'")
        
        return len(errors) == 0, errors
    
    @staticmethod
    def validate_test_visuals(test_data: dict) -> tuple[bool, List[str]]:
        """
        Validate all visuals in a test.
        Returns (is_valid, errors)
        
        HARD RULES:
        1. Writing Task 1 MUST have a visual
        2. All visuals MUST have valid source (user_upload or pdf_crop)
        3. NO AI-generated visuals allowed
        """
        errors = []
        
        # Check Writing Task 1 visual
        writing = test_data.get('sections', {}).get('writing', {})
        if not writing:
            writing = test_data.get('writing', {})
        
        tasks = writing.get('tasks', [])
        task1 = tasks[0] if tasks else writing.get('task1', {})
        
        if task1:
            visual = task1.get('visual', {})
            if not visual:
                errors.append("FAILED_VALIDATION: Writing Task 1 missing required visual")
            else:
                is_valid, visual_errors = VisualValidator.validate_visual(visual)
                errors.extend(visual_errors)
                
                # Check image_src exists
                image_src = visual.get('image_src', visual.get('image_url', ''))
                if not image_src:
                    errors.append("FAILED_VALIDATION: Writing Task 1 visual missing image_src")
        
        # Check Listening for maps/diagrams
        listening = test_data.get('sections', {}).get('listening', {})
        if not listening:
            listening = test_data.get('listening', {})
        
        parts = listening.get('parts', listening.get('sections', []))
        for part in parts:
            questions = part.get('questions', [])
            for q in questions:
                # Check for map_labeling type
                if q.get('type') == 'map_labeling':
                    visual = q.get('visual', q.get('media', {}))
                    if visual:
                        is_valid, visual_errors = VisualValidator.validate_visual(visual)
                        errors.extend(visual_errors)
        
        return len(errors) == 0, errors
    
    @staticmethod
    def check_image_file_exists(image_src: str, base_path: str = "/app/backend/static") -> bool:
        """Check if image file actually exists on disk"""
        if image_src.startswith('/api/'):
            # Convert API path to file path
            # /api/cambridge/images/ielts17/test4/test4_writing_task1.png
            # → /app/backend/static/images/cambridge/ielts17/test4/test4_writing_task1.png
            file_path = image_src.replace('/api/cambridge/images/', f'{base_path}/images/cambridge/')
        elif image_src.startswith('http'):
            # External URL - can't verify, assume valid
            return True
        else:
            file_path = os.path.join(base_path, image_src.lstrip('/'))
        
        return os.path.exists(file_path)


# ============ REQUIRED VISUAL SLOTS ============

def get_required_visual_slots(test_data: dict) -> List[dict]:
    """
    Determine what visual slots are required for a test.
    Returns list of {skill, kind, slot_name, filled, image_src}
    """
    slots = []
    
    # Writing Task 1 - ALWAYS required
    writing = test_data.get('sections', {}).get('writing', {})
    if not writing:
        writing = test_data.get('writing', {})
    
    tasks = writing.get('tasks', [])
    task1 = tasks[0] if tasks else writing.get('task1', {})
    
    if task1:
        visual = task1.get('visual', {})
        task_type = task1.get('task_type', visual.get('type', 'unknown'))
        image_src = visual.get('image_src', visual.get('image_url', ''))
        
        slots.append({
            'skill': 'writing',
            'kind': task_type,
            'slot_name': 'writing_task1_visual',
            'filled': bool(image_src),
            'image_src': image_src
        })
    
    # Listening - check for map_labeling
    listening = test_data.get('sections', {}).get('listening', {})
    if not listening:
        listening = test_data.get('listening', {})
    
    parts = listening.get('parts', listening.get('sections', []))
    for idx, part in enumerate(parts):
        questions = part.get('questions', [])
        for q in questions:
            if q.get('type') == 'map_labeling':
                visual = q.get('visual', q.get('media', {}))
                image_src = visual.get('image_src', visual.get('image_url', '')) if visual else ''
                
                slots.append({
                    'skill': 'listening',
                    'kind': 'map',
                    'slot_name': f'listening_part{idx+1}_map',
                    'filled': bool(image_src),
                    'image_src': image_src
                })
    
    return slots


# ============ EXPORTS ============

__all__ = [
    "VisualSource",
    "VisualKind",
    "VisualSkill",
    "TestStatus",
    "VisualAsset",
    "VisualAssetRegistry",
    "VisualValidator",
    "VisualValidationError",
    "get_required_visual_slots"
]
