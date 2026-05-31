from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.models.schemas import MedicationRequest, MedicationResponse
from app.services.gemini_service import generate_response, get_medication_prompt, SAFETY_DISCLAIMER
from app.database import get_db, ConsultationHistory

router = APIRouter()


@router.post("/info", response_model=MedicationResponse, summary="Informasi lengkap tentang obat")
async def get_medication_info(request: MedicationRequest, db: Session = Depends(get_db)):
    """
    Mendapatkan informasi obat berdasarkan query_type:
    - general      → deskripsi & kegunaan umum
    - dosage       → dosis & aturan pakai
    - side_effects → efek samping & peringatan
    - interaction  → interaksi antar obat
    """
    # Pilih system prompt sesuai query_type
    system_prompt = get_medication_prompt(request.query_type)

    # Susun user prompt berdasarkan query_type
    if request.query_type == "interaction" and request.other_medications:
        user_prompt = (
            f"Berikan informasi interaksi antara {request.medication_name} "
            f"dengan obat lain berikut: {request.other_medications}"
        )
    elif request.query_type == "dosage":
        user_prompt = f"Berikan informasi lengkap tentang DOSIS obat: {request.medication_name}"
    elif request.query_type == "side_effects":
        user_prompt = f"Berikan informasi lengkap tentang EFEK SAMPING obat: {request.medication_name}"
    else:
        user_prompt = f"Berikan informasi umum tentang obat: {request.medication_name}"

    try:
        ai_response = await generate_response(user_prompt, system_prompt)

        db.add(ConsultationHistory(
            session_id=f"med_{request.medication_name}_{request.query_type}",
            consultation_type="medication",
            user_input=user_prompt,
            ai_response=ai_response,
            severity_level="low"
        ))
        db.commit()

        return MedicationResponse(
            medication_name=request.medication_name,
            query_type=request.query_type,
            information=ai_response,
            disclaimer=SAFETY_DISCLAIMER
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gagal memproses permintaan: {str(e)}")


@router.get("/search/{name}", summary="Cari informasi obat berdasarkan nama")
async def search_medication(name: str, db: Session = Depends(get_db)):
    """Cari informasi umum obat berdasarkan nama."""
    system_prompt = get_medication_prompt("general")
    user_prompt = f"Berikan informasi umum tentang obat: {name}"

    try:
        ai_response = await generate_response(user_prompt, system_prompt)
        return {
            "medication_name": name,
            "information": ai_response,
            "disclaimer": SAFETY_DISCLAIMER
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))